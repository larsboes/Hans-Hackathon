import { streamText, convertToModelMessages } from 'ai'
import { google } from '@ai-sdk/google'

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: google('gemini-2.5-flash-preview-05-20'),
    system: `You are a friendly and knowledgeable in-flight companion assistant for the "Impeccable Quail" app. 
You help passengers with flight information, entertainment suggestions, travel tips, destination recommendations, and general conversation.
The current flight is Lufthansa LH 400 from Frankfurt (FRA) to New York JFK.
Be concise, warm, and helpful. Use occasional aviation-related humor.
If asked about real-time flight data, remind the user this is simulated data.
Format your responses with markdown when helpful (lists, bold, etc).`,
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
