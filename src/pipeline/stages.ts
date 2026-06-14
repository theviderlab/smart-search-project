import type { StageDef } from '@/lib/types'
import { TIMINGS } from '@/lib/timings'

// Stage definitions mirror the real /search pipeline.
// See docs/frontend2/PLAN.md "Las 15 etapas" table for the backend trace.
export const STAGES: StageDef[] = [
  {
    id: 'resolve-account',
    label: 'Resolve Account',
    description: 'Map the account name to its internal id.',
    estimatedMs: TIMINGS['resolve-account'],
    next: ['enhance-query'],
  },
  {
    id: 'enhance-query',
    label: 'Enhance Query',
    description:
      'An LLM rewrites your query into a cleaner search phrase (e.g. "aventura en la montaña" → "mountain adventure").',
    estimatedMs: TIMINGS['enhance-query'],
    next: ['extract-filters'],
  },
  {
    id: 'extract-filters',
    label: 'Extract Param Filters',
    description:
      'An LLM pulls NUMERIC/DATE limits from the query — price, trip length, departure dates. Empty if the query has none (places are handled later, in Extract Taxonomy Filters).',
    estimatedMs: TIMINGS['extract-filters'],
    next: ['resolve-namespace', 'resolve-tax-namespace'],
  },
  {
    id: 'resolve-namespace',
    label: 'Resolve Namespace',
    description: 'Pick the Pinecone content namespace for this account.',
    estimatedMs: TIMINGS['resolve-namespace'],
    next: ['pinecone-content'],
  },
  {
    id: 'resolve-tax-namespace',
    label: 'Resolve Taxonomy NS',
    description: 'Pick the Pinecone taxonomy namespace for this category.',
    estimatedMs: TIMINGS['resolve-tax-namespace'],
    next: ['pinecone-taxonomy'],
  },
  {
    id: 'pinecone-content',
    label: 'Vector Search · Content',
    description:
      'Embeds the query and finds packages whose DESCRIPTION is semantically closest (Pinecone).',
    estimatedMs: TIMINGS['pinecone-content'],
    parallelGroup: 'vector-search',
    next: ['process-direct'],
  },
  {
    id: 'pinecone-taxonomy',
    label: 'Vector Search · Taxonomy',
    description:
      'Embeds the query and finds matching TAXONOMY values — places/categories like countries, cities, regions (Pinecone).',
    estimatedMs: TIMINGS['pinecone-taxonomy'],
    parallelGroup: 'vector-search',
    next: ['expand-tax-hits'],
  },
  {
    id: 'process-direct',
    label: 'Group Content Hits',
    description: 'Group the content matches by package.',
    estimatedMs: TIMINGS['process-direct'],
    next: ['merge-results'],
  },
  {
    id: 'expand-tax-hits',
    label: 'Expand Taxonomy Hits',
    description: 'Map each taxonomy match back to the packages tagged with it.',
    estimatedMs: TIMINGS['expand-tax-hits'],
    next: ['merge-results'],
  },
  {
    id: 'merge-results',
    label: 'Merge Results',
    description:
      'Combines the content matches and the taxonomy matches into one candidate list (highest score wins).',
    estimatedMs: TIMINGS['merge-results'],
    next: ['extract-tax-filters'],
  },
  {
    id: 'extract-tax-filters',
    label: 'Extract Taxonomy Filters',
    description:
      'An LLM detects PLACES/CATEGORIES to include or exclude (e.g. "no a Brasil" → exclude country: brazil). This is where location filters live — not Extract Param Filters.',
    estimatedMs: TIMINGS['extract-tax-filters'],
    next: ['filter-by-tax'],
  },
  {
    id: 'filter-by-tax',
    label: 'Filter by Taxonomy',
    description:
      'Drops candidate packages that don\'t satisfy the include/exclude place filters from the step above.',
    estimatedMs: TIMINGS['filter-by-tax'],
    next: ['apply-param-filters'],
  },
  {
    id: 'apply-param-filters',
    label: 'Apply Param Filters',
    description:
      'Drops packages outside the numeric/date limits (price, length, dates) extracted in Extract Param Filters.',
    estimatedMs: TIMINGS['apply-param-filters'],
    next: ['fetch-details'],
  },
  {
    id: 'fetch-details',
    label: 'Fetch Details',
    description: "Load each package's data and taxonomy tags from the DB.",
    estimatedMs: TIMINGS['fetch-details'],
    next: ['rank-format'],
  },
  {
    id: 'rank-format',
    label: 'Rank & Format',
    description:
      'Sorts the survivors by relevance score and builds the final result list (with taxonomy tags).',
    estimatedMs: TIMINGS['rank-format'],
    next: [],
  },
]

export const STAGES_BY_ID: Record<string, StageDef> = Object.fromEntries(
  STAGES.map((s) => [s.id, s])
)
