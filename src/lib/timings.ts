// Estimated per-stage durations (ms). These are calibrated against typical
// /search runs. The total is intentionally close to a realistic search latency
// (~2.5–3.5 s). Adjust after observing real timings.

export const TIMINGS: Record<string, number> = {
  'resolve-account': 80,
  'enhance-query': 550,
  'extract-filters': 500,
  'resolve-namespace': 60,
  'resolve-tax-namespace': 80,
  'pinecone-content': 350,
  'pinecone-taxonomy': 350,
  'process-direct': 60,
  'expand-tax-hits': 120,
  'merge-results': 60,
  'extract-tax-filters': 500,
  'filter-by-tax': 100,
  'apply-param-filters': 100,
  'fetch-details': 220,
  'rank-format': 80,
}

export const TOTAL_ESTIMATED_MS = Object.values(TIMINGS).reduce((a, b) => a + b, 0)
