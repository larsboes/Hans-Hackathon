import type { CompletedFlight } from './types'

const STORAGE_KEY = 'completed_flights'

export function saveCompletedFlight(flight: Omit<CompletedFlight, 'id' | 'savedAt'>): string {
  if (typeof window === 'undefined') return ''
  try {
    const flights = getCompletedFlights()
    const entry: CompletedFlight = {
      ...flight,
      id: `flight-${Date.now()}`,
      savedAt: new Date().toISOString(),
    }
    flights.unshift(entry)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flights))
    return entry.id
  } catch {
    return ''
  }
}

export function getCompletedFlights(): CompletedFlight[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
