import { STAGES } from './stages'
import type { StageState, StageStatus } from '@/lib/types'

export type StagesMap = Record<string, StageState>

export function initialStages(): StagesMap {
  const map: StagesMap = {}
  for (const s of STAGES) {
    map[s.id] = { id: s.id, status: 'pending' }
  }
  return map
}

interface RunSchedule {
  id: string
  startAt: number
  endAt: number
}

/**
 * Build a schedule that runs stages sequentially, except stages in the same
 * parallelGroup which start together. Speed factor compresses (>1) or stretches
 * (<1) the timeline.
 */
export function buildSchedule(speed = 1): RunSchedule[] {
  const schedule: RunSchedule[] = []
  let cursor = 0
  let i = 0
  while (i < STAGES.length) {
    const cur = STAGES[i]
    if (cur.parallelGroup) {
      const groupStart = cursor
      let groupEnd = cursor
      while (i < STAGES.length && STAGES[i].parallelGroup === cur.parallelGroup) {
        const dur = STAGES[i].estimatedMs / speed
        schedule.push({ id: STAGES[i].id, startAt: groupStart, endAt: groupStart + dur })
        groupEnd = Math.max(groupEnd, groupStart + dur)
        i++
      }
      cursor = groupEnd
    } else {
      const dur = cur.estimatedMs / speed
      schedule.push({ id: cur.id, startAt: cursor, endAt: cursor + dur })
      cursor += dur
      i++
    }
  }
  return schedule
}

export type TimelineHandle = {
  cancel: () => void
  finishNow: (finalStatus: StageStatus, errorMessage?: string) => void
}

export interface TimelineCallbacks {
  onUpdate: (id: string, patch: Partial<StageState>) => void
  onComplete: () => void
}

/**
 * Drives the animation. Stages transition pending → running → done according
 * to the schedule. Returns a handle to cancel or force completion.
 */
export function runTimeline(speed: number, cb: TimelineCallbacks): TimelineHandle {
  const schedule = buildSchedule(speed)
  const timers: number[] = []
  let cancelled = false
  let remainingRunning = new Set(schedule.map((s) => s.id))

  for (const item of schedule) {
    const runT = window.setTimeout(() => {
      if (cancelled) return
      cb.onUpdate(item.id, { status: 'running', startedAt: performance.now() })
    }, item.startAt)
    const doneT = window.setTimeout(() => {
      if (cancelled) return
      cb.onUpdate(item.id, { status: 'done', finishedAt: performance.now() })
      remainingRunning.delete(item.id)
      if (remainingRunning.size === 0) {
        cb.onComplete()
      }
    }, item.endAt)
    timers.push(runT, doneT)
  }

  return {
    cancel: () => {
      cancelled = true
      timers.forEach(clearTimeout)
    },
    finishNow: (finalStatus, errorMessage) => {
      cancelled = true
      timers.forEach(clearTimeout)
      const now = performance.now()
      for (const item of schedule) {
        if (remainingRunning.has(item.id)) {
          cb.onUpdate(item.id, {
            status: finalStatus,
            finishedAt: now,
            ...(errorMessage ? { error: errorMessage } : {}),
          })
        }
      }
      remainingRunning.clear()
      cb.onComplete()
    },
  }
}

export function elapsedSinceStart(startMs: number): number {
  return performance.now() - startMs
}
