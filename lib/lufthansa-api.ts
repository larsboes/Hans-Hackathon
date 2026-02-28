import { proxyFetch } from './proxy-fetch'

const LH_API_BASE = 'https://api.lufthansa.com/v1'
const TOKEN_URL = `${LH_API_BASE}/oauth/token`

let cachedToken: { accessToken: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.accessToken
  }

  const clientId = process.env.LUFTHANSA_CLIENT_ID
  const clientSecret = process.env.LUFTHANSA_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Missing LUFTHANSA_CLIENT_ID or LUFTHANSA_CLIENT_SECRET')
  }

  const res = await proxyFetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  })

  if (!res.ok) {
    throw new Error(`OAuth token request failed: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000, // refresh 60s early
  }

  return cachedToken.accessToken
}

async function lhFetch(path: string): Promise<unknown> {
  const token = await getAccessToken()

  const res = await proxyFetch(`${LH_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Lufthansa API ${res.status}: ${body}`)
  }

  return res.json()
}

// Helper: extract DateTime from nested `{ DateTime: "..." }` or flat string
function dt(val: unknown): string | undefined {
  if (!val) return undefined
  if (typeof val === 'string') return val
  return (val as Record<string, unknown>)?.DateTime as string | undefined
}

// Helper: normalize to array
function toArray(val: unknown): Record<string, unknown>[] {
  if (Array.isArray(val)) return val
  return val ? [val as Record<string, unknown>] : []
}

// --- Flight Status ---

export async function getFlightStatus(flightNumber: string, date: string) {
  const data = (await lhFetch(
    `/operations/flightstatus/${encodeURIComponent(flightNumber)}/${encodeURIComponent(date)}`
  )) as Record<string, unknown>

  const resource = data.FlightStatusResource as Record<string, unknown> | undefined
  const flights = resource?.Flights as Record<string, unknown> | undefined
  const flightList = toArray(flights?.Flight)

  return flightList.map((f) => {
    const dep = f.Departure as Record<string, unknown>
    const arr = f.Arrival as Record<string, unknown>
    const marketing = f.MarketingCarrier as Record<string, unknown>
    const operating = f.OperatingCarrier as Record<string, unknown>
    const equipment = f.Equipment as Record<string, unknown>
    const status = f.FlightStatus as Record<string, unknown>
    const depTime = dep?.TimeStatus as Record<string, unknown>
    const arrTime = arr?.TimeStatus as Record<string, unknown>
    const depTerminal = dep?.Terminal as Record<string, unknown>
    const arrTerminal = arr?.Terminal as Record<string, unknown>

    return {
      flightNumber: `${marketing?.AirlineID}${marketing?.FlightNumber}`,
      operatingCarrier: operating
        ? `${operating?.AirlineID}${operating?.FlightNumber}`
        : undefined,
      departure: {
        airportCode: dep?.AirportCode,
        scheduledTimeLocal: dt(dep?.ScheduledTimeLocal),
        scheduledTimeUTC: dt(dep?.ScheduledTimeUTC),
        actualTimeLocal: dt(dep?.ActualTimeLocal),
        actualTimeUTC: dt(dep?.ActualTimeUTC),
        estimatedTimeLocal: dt(dep?.EstimatedTimeLocal),
        timeStatus: depTime?.Definition ?? depTime?.Code,
        terminal: depTerminal?.Name,
        gate: depTerminal?.Gate,
      },
      arrival: {
        airportCode: arr?.AirportCode,
        scheduledTimeLocal: dt(arr?.ScheduledTimeLocal),
        scheduledTimeUTC: dt(arr?.ScheduledTimeUTC),
        actualTimeLocal: dt(arr?.ActualTimeLocal),
        actualTimeUTC: dt(arr?.ActualTimeUTC),
        estimatedTimeLocal: dt(arr?.EstimatedTimeLocal),
        timeStatus: arrTime?.Definition ?? arrTime?.Code,
        terminal: arrTerminal?.Name,
        gate: arrTerminal?.Gate,
      },
      aircraftCode: equipment?.AircraftCode,
      aircraftRegistration: equipment?.AircraftRegistration,
      status: status?.Definition ?? status?.Code,
    }
  })
}

// --- Flight Schedules ---

export async function getFlightSchedules(origin: string, destination: string, date: string) {
  const data = (await lhFetch(
    `/operations/schedules/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}/${encodeURIComponent(date)}`
  )) as Record<string, unknown>

  const resource = data.ScheduleResource as Record<string, unknown> | undefined
  const scheduleList = toArray(resource?.Schedule)

  return scheduleList.map((s) => {
    const flight = s.Flight as Record<string, unknown>
    const totalJourney = s.TotalJourney as Record<string, unknown>
    const dep = flight?.Departure as Record<string, unknown>
    const arr = flight?.Arrival as Record<string, unknown>
    const marketing = flight?.MarketingCarrier as Record<string, unknown>
    const operating = flight?.OperatingCarrier as Record<string, unknown>
    const equipment = flight?.Equipment as Record<string, unknown>
    const details = flight?.Details as Record<string, unknown>
    const stops = details?.Stops as Record<string, unknown>

    return {
      flightNumber: `${marketing?.AirlineID}${marketing?.FlightNumber}`,
      operatingCarrier: operating
        ? `${operating?.AirlineID}${operating?.FlightNumber}`
        : undefined,
      departure: {
        airportCode: dep?.AirportCode,
        scheduledTimeLocal: dt(dep?.ScheduledTimeLocal),
        terminal: (dep?.Terminal as Record<string, unknown>)?.Name,
      },
      arrival: {
        airportCode: arr?.AirportCode,
        scheduledTimeLocal: dt(arr?.ScheduledTimeLocal),
        terminal: (arr?.Terminal as Record<string, unknown>)?.Name,
      },
      duration: totalJourney?.Duration,
      aircraftCode: equipment?.AircraftCode,
      numberOfStops: stops?.StopQuantity ?? 0,
    }
  })
}

// --- Airport Info ---

export async function getAirportInfo(airportCode: string) {
  const data = (await lhFetch(
    `/mds-references/airports/${encodeURIComponent(airportCode)}?lang=EN`
  )) as Record<string, unknown>

  const resource = data.AirportResource as Record<string, unknown> | undefined
  const airports = resource?.Airports as Record<string, unknown> | undefined
  const airport = airports?.Airport as Record<string, unknown> | undefined

  if (!airport) return null

  const position = airport.Position as Record<string, unknown>
  const coordinate = position?.Coordinate as Record<string, unknown>
  const names = airport.Names as Record<string, unknown>
  const nameArr = names?.Name
  const nameList = Array.isArray(nameArr) ? nameArr : nameArr ? [nameArr] : []
  const name = nameList.find((n: Record<string, unknown>) => n['@LanguageCode'] === 'EN' || n['LanguageCode'] === 'EN')
    ?? nameList[0]

  return {
    airportCode: airport.AirportCode,
    name: typeof name === 'string' ? name : (name as Record<string, unknown>)?.$,
    latitude: coordinate?.Latitude,
    longitude: coordinate?.Longitude,
    cityCode: airport.CityCode,
    countryCode: airport.CountryCode,
    locationType: airport.LocationType,
    utcOffset: airport.UtcOffset,
    timeZoneId: airport.TimeZoneId,
  }
}

// --- Nearest Airports ---

export async function getNearestAirports(latitude: number, longitude: number) {
  const data = (await lhFetch(
    `/mds-references/airports/nearest/${latitude},${longitude}?lang=EN`
  )) as Record<string, unknown>

  const resource = data.NearestAirportResource as Record<string, unknown> | undefined
  const airports = resource?.Airports as Record<string, unknown> | undefined
  const airportRaw = airports?.Airport
  const airportList = Array.isArray(airportRaw) ? airportRaw : airportRaw ? [airportRaw] : []

  return airportList.map((a: Record<string, unknown>) => {
    const position = a.Position as Record<string, unknown>
    const coordinate = position?.Coordinate as Record<string, unknown>
    const distance = a.Distance as Record<string, unknown>
    const names = a.Names as Record<string, unknown>
    const nameArr = names?.Name
    const nameList = Array.isArray(nameArr) ? nameArr : nameArr ? [nameArr] : []
    const name = nameList[0]

    return {
      airportCode: a.AirportCode,
      name: typeof name === 'string' ? name : (name as Record<string, unknown>)?.$,
      latitude: coordinate?.Latitude,
      longitude: coordinate?.Longitude,
      distanceKm: distance?.Value,
    }
  })
}

// --- Aircraft Info ---

export async function getAircraftInfo(aircraftCode: string) {
  const data = (await lhFetch(
    `/mds-references/aircraft/${encodeURIComponent(aircraftCode)}`
  )) as Record<string, unknown>

  const resource = data.AircraftResource as Record<string, unknown> | undefined
  const summaries = resource?.AircraftSummaries as Record<string, unknown> | undefined
  const summary = summaries?.AircraftSummary as Record<string, unknown> | undefined

  if (!summary) return null

  const names = summary.Names as Record<string, unknown>
  const nameArr = names?.Name
  const nameList = Array.isArray(nameArr) ? nameArr : nameArr ? [nameArr] : []
  const name = nameList[0]

  return {
    aircraftCode: summary.AircraftCode,
    name: typeof name === 'string' ? name : (name as Record<string, unknown>)?.$,
    airlineEquipCode: summary.AirlineEquipCode,
  }
}

// --- Airline Info ---

export async function getAirlineInfo(airlineCode: string) {
  const data = (await lhFetch(
    `/mds-references/airlines/${encodeURIComponent(airlineCode)}?lang=EN`
  )) as Record<string, unknown>

  const resource = data.AirlineResource as Record<string, unknown> | undefined
  const airlines = resource?.Airlines as Record<string, unknown> | undefined
  const airline = airlines?.Airline as Record<string, unknown> | undefined

  if (!airline) return null

  const names = airline.Names as Record<string, unknown>
  const nameArr = names?.Name
  const nameList = Array.isArray(nameArr) ? nameArr : nameArr ? [nameArr] : []
  const name = nameList.find((n: Record<string, unknown>) => n['@LanguageCode'] === 'EN' || n['LanguageCode'] === 'EN')
    ?? nameList[0]

  return {
    airlineCode: airline.AirlineID ?? airline.AirlineCode,
    name: typeof name === 'string' ? name : (name as Record<string, unknown>)?.$,
  }
}
