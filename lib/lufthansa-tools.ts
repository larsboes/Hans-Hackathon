import { tool } from 'ai'
import { z } from 'zod'
import {
  getFlightStatus,
  getFlightSchedules,
  getAirportInfo,
  getAircraftInfo,
  getNearestAirports,
  getAirlineInfo,
} from './lufthansa-api'

export const lufthansaTools = {
  getFlightStatus: tool({
    description:
      'Get real-time status of a specific flight. Returns departure/arrival times (scheduled and actual), delays, terminal, gate, aircraft type, and flight status (on-time, delayed, cancelled, departed, landed). Date range: 7 days past to 5 days future.',
    inputSchema: z.object({
      flightNumber: z
        .string()
        .describe('IATA flight number including airline code, e.g. "LH400", "LH2037"'),
      date: z
        .string()
        .describe('Departure date in YYYY-MM-DD format'),
    }),
    execute: async ({ flightNumber, date }) => {
      try {
        const flights = await getFlightStatus(flightNumber, date)
        if (flights.length === 0) return { error: 'No flight status found for this flight and date.' }
        return { flights }
      } catch (e) {
        return { error: `Could not fetch flight status: ${(e as Error).message}` }
      }
    },
  }),

  getFlightSchedules: tool({
    description:
      'Find all scheduled flights between two airports on a given date. Returns flight numbers, departure/arrival times, terminals, aircraft type, and number of stops. Use this when the user asks about available flights on a route.',
    inputSchema: z.object({
      origin: z
        .string()
        .describe('Departure airport 3-letter IATA code, e.g. "FRA"'),
      destination: z
        .string()
        .describe('Arrival airport 3-letter IATA code, e.g. "JFK"'),
      date: z
        .string()
        .describe('Date in YYYY-MM-DD format'),
    }),
    execute: async ({ origin, destination, date }) => {
      try {
        const schedules = await getFlightSchedules(origin, destination, date)
        if (schedules.length === 0) return { error: 'No scheduled flights found for this route and date.' }
        return { schedules }
      } catch (e) {
        return { error: `Could not fetch flight schedules: ${(e as Error).message}` }
      }
    },
  }),

  getAirportInfo: tool({
    description:
      'Get detailed information about an airport: full name, GPS coordinates, city, country, timezone, and UTC offset. Use this to answer questions about airports.',
    inputSchema: z.object({
      airportCode: z
        .string()
        .describe('3-letter IATA airport code, e.g. "FRA", "JFK", "MUC"'),
    }),
    execute: async ({ airportCode }) => {
      try {
        const airport = await getAirportInfo(airportCode)
        if (!airport) return { error: `Airport "${airportCode}" not found.` }
        return airport
      } catch (e) {
        return { error: `Could not fetch airport info: ${(e as Error).message}` }
      }
    },
  }),

  getAircraftInfo: tool({
    description:
      'Get the name and details of an aircraft type from its IATA equipment code. Use this to resolve cryptic aircraft codes (like "744" or "34E") into human-readable names (like "Boeing 747-400" or "Airbus A340-600").',
    inputSchema: z.object({
      aircraftCode: z
        .string()
        .describe('3-character IATA aircraft equipment code, e.g. "744", "380", "34E"'),
    }),
    execute: async ({ aircraftCode }) => {
      try {
        const aircraft = await getAircraftInfo(aircraftCode)
        if (!aircraft) return { error: `Aircraft code "${aircraftCode}" not found.` }
        return aircraft
      } catch (e) {
        return { error: `Could not fetch aircraft info: ${(e as Error).message}` }
      }
    },
  }),

  getNearestAirports: tool({
    description:
      'Find the 5 closest airports to a given GPS location. Useful when the user mentions a city or place and you need to find nearby airports.',
    inputSchema: z.object({
      latitude: z.number().describe('Latitude in decimal degrees, e.g. 50.0379'),
      longitude: z.number().describe('Longitude in decimal degrees, e.g. 8.5622'),
    }),
    execute: async ({ latitude, longitude }) => {
      try {
        const airports = await getNearestAirports(latitude, longitude)
        if (airports.length === 0) return { error: 'No airports found near this location.' }
        return { airports }
      } catch (e) {
        return { error: `Could not fetch nearest airports: ${(e as Error).message}` }
      }
    },
  }),

  getAirlineInfo: tool({
    description:
      'Get information about an airline from its 2-character IATA code. Returns the airline name.',
    inputSchema: z.object({
      airlineCode: z
        .string()
        .describe('2-character IATA airline code, e.g. "LH", "UA", "BA"'),
    }),
    execute: async ({ airlineCode }) => {
      try {
        const airline = await getAirlineInfo(airlineCode)
        if (!airline) return { error: `Airline "${airlineCode}" not found.` }
        return airline
      } catch (e) {
        return { error: `Could not fetch airline info: ${(e as Error).message}` }
      }
    },
  }),
}
