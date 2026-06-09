import type { SearchRequest, SearchResponse } from '@/lib/types'
import type { SseEvent } from '@/lib/sseTypes'

const envBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined
const apiKey = import.meta.env.VITE_API_KEY as string | undefined
const baseURL = envBaseUrl ? envBaseUrl.replace(/\/+$/, '') : '/api'

export class StreamUnavailableError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message)
    this.name = 'StreamUnavailableError'
  }
}

/**
 * Open a streaming /search/stream connection. Calls onEvent for each SSE event
 * received, and resolves with the final SearchResponse when the stream emits a
 * `result` event. Rejects with StreamUnavailableError on HTTP errors so the
 * caller can fall back to the non-streaming /search endpoint cleanly.
 */
export async function searchDocumentsStream(
  req: SearchRequest,
  onEvent: (event: SseEvent) => void,
  options?: { signal?: AbortSignal },
): Promise<SearchResponse> {
  const url = `${baseURL}/search/stream`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  }
  if (apiKey) headers['X-API-Key'] = apiKey

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(req),
    signal: options?.signal,
  })

  if (!response.ok) {
    throw new StreamUnavailableError(
      `Streaming endpoint returned ${response.status}`,
      response.status,
    )
  }
  if (!response.body) {
    throw new StreamUnavailableError('Streaming endpoint returned empty body')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let finalResult: SearchResponse | null = null
  let streamError: string | null = null

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (value) {
        buffer += decoder.decode(value, { stream: true })
        // SSE record separator is a blank line (\n\n).
        let sep: number
        while ((sep = buffer.indexOf('\n\n')) !== -1) {
          const record = buffer.slice(0, sep)
          buffer = buffer.slice(sep + 2)
          const parsed = parseSseRecord(record)
          if (!parsed) continue
          onEvent(parsed)
          if (parsed.event === 'result') finalResult = parsed.data
          if (parsed.event === 'error') streamError = parsed.message
        }
      }
      if (done) break
    }
  } finally {
    reader.releaseLock()
  }

  if (streamError) throw new Error(streamError)
  if (!finalResult) {
    throw new Error('Stream ended without a result event')
  }
  return finalResult
}

/** Parse a single SSE record (no trailing \n\n). Skips comment-only records. */
function parseSseRecord(record: string): SseEvent | null {
  const lines = record.split('\n')
  const dataLines: string[] = []
  for (const line of lines) {
    if (line.startsWith(':')) continue // comment / keepalive
    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart())
    }
  }
  if (dataLines.length === 0) return null
  try {
    return JSON.parse(dataLines.join('\n')) as SseEvent
  } catch {
    return null
  }
}
