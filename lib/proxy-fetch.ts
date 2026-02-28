const PROXY_URL =
  process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy

let dispatcher: unknown = undefined

if (PROXY_URL) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ProxyAgent } = require('undici') as typeof import('undici')
  dispatcher = new ProxyAgent(PROXY_URL)
  console.log(`[proxy] Using proxy: ${PROXY_URL}`)
}

export const proxyFetch: typeof globalThis.fetch = (input, init) => {
  if (!dispatcher) return fetch(input, init)

  return fetch(input, {
    ...init,
    // @ts-expect-error -- Node.js undici dispatcher option
    dispatcher,
  })
}
