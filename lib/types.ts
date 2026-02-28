export interface AirportInfo {
  code: string
  city: string
  lat: number
  lng: number
}

export interface FlightData {
  id: string
  flightNumber: string
  airline: string
  departure: AirportInfo
  arrival: AirportInfo
  departureTime: string
  arrivalTime: string
  status: 'scheduled' | 'boarding' | 'in-flight' | 'landed'
}

export interface LogbookEntry {
  id: string
  flightId: string
  category: 'delay' | 'crew' | 'seat' | 'food' | 'experience' | 'other'
  content: string
  mood: number
  timestamp: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  imagePrompt: string
  category: string
  icon: string
  imageUrl?: string
  unlockedAt?: string
  collected: boolean
  secret?: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface StorySection {
  title: string
  text: string
  imagePrompt: string
  imageUrl?: string
}

export interface CompletedFlight {
  id?: string
  flightNumber: string
  airline: string
  departure: AirportInfo
  arrival: AirportInfo
  departureTime: string
  arrivalTime: string
  storySections: Omit<StorySection, 'imageUrl'>[]
  achievementIds: string[]
  logbookEntries: LogbookEntry[]
  averageMood: number
  savedAt?: string
}

export type TravelerType = 'enthusiast' | 'normalo' | 'nervous'
