import { NextResponse } from 'next/server'
import { getFlightStatus, getAirportInfo } from '@/lib/lufthansa-api'

export async function GET() {
  const flightNumber = 'LH400'
  const today = new Date().toISOString().slice(0, 10)

  try {
    const flights = await getFlightStatus(flightNumber, today)
    if (!flights.length) {
      return NextResponse.json({ error: 'No flight found' }, { status: 404 })
    }

    const f = flights[0]
    const depCode = f.departure.airportCode as string
    const arrCode = f.arrival.airportCode as string

    // Fetch airport coordinates in parallel
    const [depAirport, arrAirport] = await Promise.all([
      getAirportInfo(depCode),
      getAirportInfo(arrCode),
    ])

    // Pick the best available times, prefer UTC
    const departureTime =
      f.departure.actualTimeUTC ??
      f.departure.scheduledTimeUTC ??
      f.departure.scheduledTimeLocal
    const arrivalTime =
      f.arrival.actualTimeUTC ??
      f.arrival.scheduledTimeUTC ??
      f.arrival.scheduledTimeLocal

    // Map LH status to our app status
    const rawStatus = (f.status as string)?.toLowerCase() ?? ''
    let status: 'scheduled' | 'boarding' | 'in-flight' | 'landed' = 'scheduled'
    if (rawStatus.includes('landed') || rawStatus.includes('arrived')) status = 'landed'
    else if (rawStatus.includes('airborne') || rawStatus.includes('en route') || rawStatus.includes('departed')) status = 'in-flight'
    else if (rawStatus.includes('boarding')) status = 'boarding'

    return NextResponse.json({
      id: `lh400-${today}`,
      flightNumber: 'LH 400',
      airline: 'Lufthansa',
      departure: {
        code: depCode,
        city: depAirport?.name ?? 'Frankfurt',
        lat: Number(depAirport?.latitude) || 50.0379,
        lng: Number(depAirport?.longitude) || 8.5622,
      },
      arrival: {
        code: arrCode,
        city: arrAirport?.name ?? 'New York',
        lat: Number(arrAirport?.latitude) || 40.6413,
        lng: Number(arrAirport?.longitude) || -73.7781,
      },
      departureTime,
      arrivalTime,
      status,
    })
  } catch (e) {
    console.error('Flight status API error:', e)
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 502 }
    )
  }
}
