import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { proxyFetch } from './proxy-fetch'

export const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  fetch: proxyFetch,
})
