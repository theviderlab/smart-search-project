import type { SearchResponse, StageState } from '@/lib/types'
import type { StagesMap } from './timeline'

function previewObj(obj: unknown, max = 80): string {
  if (obj == null) return '∅'
  try {
    const s = JSON.stringify(obj)
    return s.length > max ? `${s.slice(0, max - 1)}…` : s
  } catch {
    return String(obj)
  }
}

/**
 * Populate stage nodes with real data extracted from the SearchResponse.
 * Called once the HTTP response arrives.
 */
export function enrichStages(
  stages: StagesMap,
  req: { account: string; query: string },
  res: SearchResponse
): StagesMap {
  const out: StagesMap = { ...stages }

  const patch = (id: string, p: Partial<StageState>) => {
    out[id] = { ...out[id], ...p }
  }

  patch('resolve-account', {
    inputPreview: `account="${req.account}"`,
    outputPreview: 'account_id resolved',
  })

  patch('enhance-query', {
    inputPreview: `"${req.query}"`,
    outputPreview: res.processed_query ? `"${res.processed_query}"` : 'no rewrite',
  })

  patch('extract-filters', {
    inputPreview: `query + account_id`,
    outputPreview: res.processor_filters
      ? `filters: ${previewObj(res.processor_filters)}`
      : 'no filters',
  })

  patch('resolve-namespace', {
    inputPreview: 'account_id',
    outputPreview: 'content namespace',
  })

  patch('resolve-tax-namespace', {
    inputPreview: 'account_id, category',
    outputPreview: 'taxonomy namespace',
  })

  const rawHits = res.results?.length ?? 0
  patch('pinecone-content', {
    inputPreview: 'embedded query, k=30',
    outputPreview: `~${rawHits} content hits`,
  })

  patch('pinecone-taxonomy', {
    inputPreview: 'embedded query, k=10',
    outputPreview: res.taxonomy_filters ? 'taxonomy hits found' : 'no taxonomy hits',
  })

  patch('process-direct', {
    inputPreview: 'content hits',
    outputPreview: `${rawHits} unique page_ids`,
  })

  patch('expand-tax-hits', {
    inputPreview: 'taxonomy hits',
    outputPreview: 'page_ids mapped',
  })

  patch('merge-results', {
    inputPreview: 'direct + tax',
    outputPreview: `${rawHits} merged page_ids`,
  })

  patch('extract-tax-filters', {
    inputPreview: `query, ${rawHits} page_ids`,
    outputPreview: res.taxonomy_filters
      ? `criteria: ${previewObj(res.taxonomy_filters)}`
      : 'no criteria',
  })

  patch('filter-by-tax', {
    inputPreview: 'page_ids + criteria',
    outputPreview: `${rawHits} survive`,
  })

  patch('apply-param-filters', {
    inputPreview: 'page_ids + param filters',
    outputPreview: `${rawHits} survive`,
  })

  patch('fetch-details', {
    inputPreview: `${rawHits} page_ids`,
    outputPreview: `${rawHits} enriched results`,
  })

  patch('rank-format', {
    inputPreview: 'enriched results',
    outputPreview: `${rawHits} ranked results`,
  })

  return out
}
