import type { FlightData } from './types'

export const DEMO_FLIGHT: FlightData = {
  id: 'demo-flight-1',
  flightNumber: 'LH 400',
  airline: 'Lufthansa',
  departure: {
    code: 'FRA',
    city: 'Frankfurt',
    lat: 50.0379,
    lng: 8.5622,
  },
  arrival: {
    code: 'JFK',
    city: 'New York',
    lat: 40.6413,
    lng: -73.7781,
  },
  departureTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  arrivalTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
  status: 'in-flight',
}

// Convert lat/lng to 3D sphere coordinates
export function latLngToVector3(lat: number, lng: number, radius: number = 1) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)
  return [x, y, z] as const
}

// Calculate great circle interpolation between two points
export function interpolateGreatCircle(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  t: number
): [number, number] {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const toDeg = (rad: number) => (rad * 180) / Math.PI

  const phi1 = toRad(lat1)
  const lambda1 = toRad(lng1)
  const phi2 = toRad(lat2)
  const lambda2 = toRad(lng2)

  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin((phi2 - phi1) / 2), 2) +
          Math.cos(phi1) * Math.cos(phi2) * Math.pow(Math.sin((lambda2 - lambda1) / 2), 2)
      )
    )

  if (d === 0) return [lat1, lng1]

  const A = Math.sin((1 - t) * d) / Math.sin(d)
  const B = Math.sin(t * d) / Math.sin(d)

  const x = A * Math.cos(phi1) * Math.cos(lambda1) + B * Math.cos(phi2) * Math.cos(lambda2)
  const y = A * Math.cos(phi1) * Math.sin(lambda1) + B * Math.cos(phi2) * Math.sin(lambda2)
  const z = A * Math.sin(phi1) + B * Math.sin(phi2)

  const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)))
  const lng = toDeg(Math.atan2(y, x))

  return [lat, lng]
}

// Calculate flight progress (0-1) based on timestamps
export function getFlightProgress(flight: FlightData): number {
  const now = Date.now()
  const departure = new Date(flight.departureTime).getTime()
  const arrival = new Date(flight.arrivalTime).getTime()
  const total = arrival - departure
  const elapsed = now - departure

  return Math.max(0, Math.min(1, elapsed / total))
}

// Get current flight position
export function getCurrentPosition(flight: FlightData): [number, number] {
  const progress = getFlightProgress(flight)
  return interpolateGreatCircle(
    flight.departure.lat,
    flight.departure.lng,
    flight.arrival.lat,
    flight.arrival.lng,
    progress
  )
}
