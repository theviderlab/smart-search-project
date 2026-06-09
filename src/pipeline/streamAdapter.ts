import type { SearchResponse, StageState } from '@/lib/types'
import type { SseEvent } from '@/lib/sseTypes'
import { initialStages, type StagesMap } from './timeline'
import { compact } from './payload'

/**
 * Apply one SSE event to the stages map and return the next state.
 * Pure function — no side effects, easy to test.
 */
export function applyStreamEvent(stages: StagesMap, event: SseEvent): StagesMap {
  switch (event.event) {
    case 'stage_start':
      return patchStage(stages, event.stage, {
        status: 'running',
        startedAt: performance.now(),
        inputPreview: summarize(event.data),
        inputData: event.data,
      })
    case 'stage_end': {
      const status: StageState['status'] = event.error
        ? 'error'
        : event.warning
          ? 'warning'
          : 'done'
      return patchStage(stages, event.stage, {
        status,
        finishedAt: performance.now(),
        outputPreview: summarize(event.data),
        outputData: event.data,
        error: event.error,
        warning: event.warning,
      })
    }
    default:
      return stages
  }
}

function patchStage(
  stages: StagesMap,
  id: string,
  patch: Partial<StageState>,
): StagesMap {
  if (!stages[id]) return stages
  return { ...stages, [id]: { ...stages[id], ...patch } }
}

/** Best-effort human summary of a stage's data payload (one short line). */
function summarize(data: Record<string, unknown> | undefined): string | undefined {
  if (!data) return undefined
  try {
    // Strip empty/null entries first so noisy filters (e.g. {min:null,max:null})
    // don't dominate the one-line summary.
    const clean = compact(data)
    if (!clean || typeof clean !== 'object') return undefined
    const parts: string[] = []
    for (const [key, value] of Object.entries(clean)) {
      const s = typeof value === 'object' ? JSON.stringify(value) : String(value)
      parts.push(`${key}=${s.length > 40 ? s.slice(0, 39) + '…' : s}`)
      if (parts.length >= 3) break
    }
    return parts.length ? parts.join(' ') : undefined
  } catch {
    return undefined
  }
}

export interface StreamRun {
  /** Final SearchResponse received via the `result` event. */
  response: SearchResponse | null
  /** Whether the stream completed with a `done` event (vs aborted). */
  completed: boolean
}

export const emptyStreamRun = (): StreamRun => ({
  response: null,
  completed: false,
})

export { initialStages }
