import type { SearchRequest, SearchResponse } from '@/lib/types'
import type { SseEvent } from '@/lib/sseTypes'
import type { RecordedEvent } from '@/api/recorder'

/**
 * Offline replacement for searchDocumentsStream (searchStream.ts). Instead of
 * opening a live SSE connection it replays a pre-recorded run from a static
 * JSON file, calling onEvent with the same cadence. Same signature, so App.tsx
 * can swap one for the other with no other changes — this is what powers the
 * GitHub Pages demo (no backend, no API keys).
 */

export interface DemoExample {
  label: string
  query: string
  file: string
}

export interface DemoManifest {
  default: string
  examples: DemoExample[]
}

interface DemoRun {
  account: string
  query: string
  events: RecordedEvent[]
}

/** Cap per-event waits so long real-world gaps don't make the demo drag. */
const MAX_GAP_MS = 1200

const base = import.meta.env.BASE_URL || '/'

let manifestPromise: Promise<DemoManifest> | null = null

/** Load (and cache) the demo manifest. Used by the UI to render example chips. */
export function loadDemoManifest(): Promise<DemoManifest> {
  if (!manifestPromise) {
    manifestPromise = fetch(`${base}demo/manifest.json`).then((r) => {
      if (!r.ok) throw new Error(`demo manifest ${r.status}`)
      return r.json() as Promise<DemoManifest>
    })
  }
  return manifestPromise
}

function pickFile(manifest: DemoManifest, query: string): string {
  const q = query.trim().toLowerCase()
  const match = manifest.examples.find((e) => {
    const eq = e.query.trim().toLowerCase()
    return eq === q || eq.includes(q) || q.includes(eq)
  })
  return match?.file ?? manifest.default
}

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'))
    const id = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(id)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })

export async function replaySearchStream(
  req: SearchRequest,
  onEvent: (event: SseEvent) => void,
  options?: { signal?: AbortSignal },
): Promise<SearchResponse> {
  const signal = options?.signal
  const manifest = await loadDemoManifest()
  const file = pickFile(manifest, req.query)

  const res = await fetch(`${base}demo/${file}`, { signal })
  if (!res.ok) throw new Error(`demo run ${file} returned ${res.status}`)
  const run = (await res.json()) as DemoRun

  let finalResult: SearchResponse | null = null
  let streamError: string | null = null
  let prevOffset = 0

  for (const { tOffsetMs, event } of run.events) {
    const wait = Math.min(Math.max(tOffsetMs - prevOffset, 0), MAX_GAP_MS)
    prevOffset = tOffsetMs
    if (wait > 0) await sleep(wait, signal)
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

    onEvent(event)
    if (event.event === 'result') finalResult = event.data
    if (event.event === 'error') streamError = event.message
  }

  if (streamError) throw new Error(streamError)
  if (!finalResult) throw new Error('Stream ended without a result event')
  return finalResult
}
