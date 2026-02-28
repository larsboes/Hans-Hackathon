import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { proxyFetch } from './proxy-fetch'

export const google = createGoogleGenerativeAI({
  fetch: proxyFetch,
})
