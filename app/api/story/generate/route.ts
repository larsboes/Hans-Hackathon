import { google, GEMINI_MODEL } from '@/lib/google-model'
import { generateText } from 'ai'
import type { FlightData, LogbookEntry, StorySection } from '@/lib/types'

export async function POST(req: Request) {
  const { flight, entries, achievements } = (await req.json()) as {
    flight: FlightData
    entries: LogbookEntry[]
    achievements: string[]
  }

  const entrySummary = entries
    .map((e) => `[${e.category}] ${e.content} (mood: ${e.mood}/5)`)
    .join('\n')

  const achievementList = achievements.length > 0
    ? `Achievements unlocked: ${achievements.join(', ')}`
    : ''

  try {
    const result = await generateText({
      model: google(GEMINI_MODEL),
      prompt: `Given this flight data and passenger logbook, create a 3-section travel story.

Flight: ${flight.airline} ${flight.flightNumber} from ${flight.departure.city} (${flight.departure.code}) to ${flight.arrival.city} (${flight.arrival.code})
Departure: ${flight.departureTime}
Arrival: ${flight.arrivalTime}

Logbook entries:
${entrySummary}

${achievementList}

Return a JSON array with exactly 3 sections. Each section has:
- "title": short English title
- "text": 2-3 sentences in English, personal and warm tone, referencing the passenger's actual entries
- "imagePrompt": English description for image generation, describing a vivid scene related to this story section. Be specific about location, lighting, mood.

Section themes:
1. Departure - the start of the journey
2. In-Flight Highlights - best moments during the flight
3. Landing - arrival and looking forward

Return ONLY the JSON array, no markdown fences.`,
      system: 'You are a travel storyteller. You create warm, personal narratives from flight data and logbook entries. Always return valid JSON.',
    })

    const cleaned = result.text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
    const sections: StorySection[] = JSON.parse(cleaned)

    return Response.json({ sections })
  } catch (error) {
    console.error('Error generating story:', error)
    return Response.json({ error: 'Failed to generate story' }, { status: 500 })
  }
}
