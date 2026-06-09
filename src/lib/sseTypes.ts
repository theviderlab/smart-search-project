import type { SearchResponse } from './types'

export type SseStageStart = {
  event: 'stage_start'
  stage: string
  ts: string
  data?: Record<string, unknown>
}

export type SseStageEnd = {
  event: 'stage_end'
  stage: string
  ts: string
  data?: Record<string, unknown>
  error?: string
  warning?: string
}

export type SseResult = {
  event: 'result'
  ts: string
  data: SearchResponse
}

export type SseDone = {
  event: 'done'
  ts: string
}

export type SseError = {
  event: 'error'
  ts: string
  message: string
}

export type SseEvent = SseStageStart | SseStageEnd | SseResult | SseDone | SseError
