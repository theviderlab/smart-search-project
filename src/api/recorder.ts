import type { SseEvent } from '@/lib/sseTypes'

/**
 * Dev-only helper to capture a real SSE run so it can be replayed offline on
 * GitHub Pages (see replayStream.ts). Enabled with VITE_RECORD=true while
 * running against a live backend.
 *
 * Each captured event keeps its browser arrival offset (tOffsetMs) — more
 * reliable for replay cadence than the backend `ts`, which can clock-skew.
 */

export interface RecordedEvent {
  tOffsetMs: number
  event: SseEvent
}

export interface Recording {
  account: string
  query: string
  recordedAt: string
  events: RecordedEvent[]
}

/**
 * Wrap an onEvent callback so every event it receives is also recorded with a
 * timestamp relative to the first call. Returns the wrapped callback plus the
 * collected list (filled in as events arrive).
 */
export function startRecording(onEvent: (event: SseEvent) => void): {
  onEvent: (event: SseEvent) => void
  events: RecordedEvent[]
} {
  const events: RecordedEvent[] = []
  let t0: number | null = null
  const wrapped = (event: SseEvent) => {
    if (t0 === null) t0 = performance.now()
    events.push({ tOffsetMs: Math.round(performance.now() - t0), event })
    onEvent(event)
  }
  return { onEvent: wrapped, events }
}

/** Serialize a recording to JSON and trigger a browser download. */
export function downloadRecording(
  meta: { account: string; query: string },
  events: RecordedEvent[],
): void {
  const recording: Recording = {
    account: meta.account,
    query: meta.query,
    recordedAt: new Date().toISOString(),
    events,
  }
  const blob = new Blob([JSON.stringify(recording, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `demo-${slugify(meta.query)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // strip combining accents (U+0300–U+036F)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'run'
  )
}
