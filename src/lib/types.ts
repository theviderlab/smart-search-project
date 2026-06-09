// Types replicated from src/frontend/src/lib/api-types.ts (deliberate duplication
// — frontend2 is fully independent of frontend1).

export interface SearchRequest {
  account: string
  query: string
  k?: number
  metadata_filters?: Record<string, unknown>
}

export interface TaxonomyGroup {
  taxonomy_name: string
  values: string[]
}

export interface SearchResult {
  id: string
  title: string
  content: string
  score: number
  metadata: {
    url?: string
    page_id?: number
    document_id?: number
    [key: string]: unknown
  }
  taxonomies?: TaxonomyGroup[] | null
}

export interface SearchResponse {
  status: string
  query: string
  results: SearchResult[]
  processed_query?: string | null
  processor_filters?: Record<string, unknown> | null
  taxonomy_filters?: Record<string, { include?: string[]; exclude?: string[] }> | null
  warnings?: string[] | null
  errors?: string[] | null
}

// Stage definitions for the visualizer.

export type StageStatus = 'pending' | 'running' | 'done' | 'warning' | 'error'

export interface StageDef {
  id: string
  label: string
  description: string
  estimatedMs: number
  /** Stages that share a parallelGroup id run concurrently in the animation. */
  parallelGroup?: string
  /** ids of downstream stages (for drawing edges). */
  next: string[]
}

export interface StageState {
  id: string
  status: StageStatus
  /** Human-readable label of the input feeding this stage. */
  inputPreview?: string
  /** Human-readable label of the output produced by this stage. */
  outputPreview?: string
  /** Raw payload of the input/output events, kept for rich rendering in the
   * detail panel (e.g. structured filter objects). */
  inputData?: Record<string, unknown>
  outputData?: Record<string, unknown>
  startedAt?: number
  finishedAt?: number
  error?: string
  warning?: string
}
