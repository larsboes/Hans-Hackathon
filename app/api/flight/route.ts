import { NextResponse } from 'next/server'
import { getAirportInfo, getFlightStatus } from '@/lib/lufthansa-api'
import type { FlightData } from '@/lib/types'

function normalizeFlightNumber(input: string) {
  return input.replace(/\s+/g, '').toUpperCase()
}

function parseNumber(value: unknown) {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number.parseFloat(value)
  return Number.NaN
}

function mapFlightStatus(status: unknown): FlightData['status'] {
  const normalized = String(status ?? '').toLowerCase()

  if (normalized.includes('landed') || normalized.includes('arrived')) return 'landed'
  if (normalized.includes('air') || normalized.includes('departed')) return 'in-flight'
  if (normalized.includes('boarding')) return 'boarding'
  return 'scheduled'
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const flightNumberRaw = searchParams.get('flightNumber')?.trim() ?? ''
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]

  if (!flightNumberRaw) {
    return NextResponse.json({ error: 'flightNumber is required' }, { status: 400 })
  }

  const flightNumber = normalizeFlightNumber(flightNumberRaw)

  try {
    const flights = await getFlightStatus(flightNumber, date)
    const selected = flights[0] as Record<string, unknown> | undefined

    if (!selected) {
      return NextResponse.json(
        { error: `No flight found for ${flightNumber} on ${date}` },
        { status: 404 },
      )
    }

    const departure = selected.departure as Record<string, unknown> | undefined
    const arrival = selected.arrival as Record<string, unknown> | undefined
    const departureCode = String(departure?.airportCode ?? '')
    const arrivalCode = String(arrival?.airportCode ?? '')

    if (!departureCode || !arrivalCode) {
      return NextResponse.json(
        { error: 'Flight did not include valid departure/arrival airport codes' },
        { status: 502 },
      )
    }

    const [departureAirport, arrivalAirport] = await Promise.all([
      getAirportInfo(departureCode),
      getAirportInfo(arrivalCode),
    ])

    if (!departureAirport || !arrivalAirport) {
      return NextResponse.json(
        { error: 'Could not resolve airport coordinates for this flight' },
        { status: 502 },
      )
    }

    const departureLat = parseNumber(departureAirport.latitude)
    const departureLng = parseNumber(departureAirport.longitude)
    const arrivalLat = parseNumber(arrivalAirport.latitude)
    const arrivalLng = parseNumber(arrivalAirport.longitude)

    if (
      Number.isNaN(departureLat) ||
      Number.isNaN(departureLng) ||
      Number.isNaN(arrivalLat) ||
      Number.isNaN(arrivalLng)
    ) {
      return NextResponse.json(
        { error: 'Airport coordinates are invalid for this flight' },
        { status: 502 },
      )
    }

    const departureTime =
      String(departure?.actualTimeLocal ?? '') ||
      String(departure?.estimatedTimeLocal ?? '') ||
      String(departure?.scheduledTimeLocal ?? '') ||
      new Date().toISOString()

    const arrivalTime =
      String(arrival?.actualTimeLocal ?? '') ||
      String(arrival?.estimatedTimeLocal ?? '') ||
      String(arrival?.scheduledTimeLocal ?? '') ||
      new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()

    const flight: FlightData = {
      id: `${flightNumber}-${date}`,
      flightNumber,
      airline: 'Lufthansa',
      departure: {
        code: departureCode,
        city: String(departureAirport.cityCode ?? departureCode),
        lat: departureLat,
        lng: departureLng,
      },
      arrival: {
        code: arrivalCode,
        city: String(arrivalAirport.cityCode ?? arrivalCode),
        lat: arrivalLat,
        lng: arrivalLng,
      },
      departureTime,
      arrivalTime,
      status: mapFlightStatus(selected.status),
    }

    return NextResponse.json({ flight })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Flight lookup failed: ${message}` },
      { status: 500 },
    )
  }
}
