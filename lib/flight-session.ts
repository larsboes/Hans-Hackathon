import type { FlightData, LogbookEntry, Achievement } from './types'

const SESSION_KEY = 'current_flight_session'

export interface FlightSession {
  flight: FlightData | null
  demoLanded: boolean
  logbookEntries: LogbookEntry[]
  achievements: Achievement[]
  earnings: number
  flightSaved: boolean
}

export function saveFlightSession(session: FlightSession): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {}
}

export function getFlightSession(): FlightSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearFlightSession(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {}
}
