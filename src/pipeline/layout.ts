import { STAGES_BY_ID } from './stages'

// Curated demo layout: only the stages that convey search value are shown;
// internal plumbing (resolve-account, resolve-namespace, resolve-tax-namespace,
// process-direct, expand-tax-hits, fetch-details) is hidden. The backend still
// runs all 15 stages — this only controls what the UI renders and numbers.
export const PRE = ['enhance-query', 'extract-filters']
export const LANE_CONTENT = ['pinecone-content']
// Taxonomy lane (Pipeline B): 'Travel Demo' has taxonomy vectors indexed in
// Pinecone (namespace 'taxonomy_travel') and taxonomy data in the DB, so the
// taxonomy vector search returns real hits, expands to pages, and enriches each
// result (cities/countries/regions chips). Shown in parallel with the content
// lane, then merged and filtered downstream.
export const LANE_TAXONOMY: string[] = ['pinecone-taxonomy']
export const POST = [
  'merge-results',
  'extract-tax-filters',
  'filter-by-tax',
  'apply-param-filters',
  'rank-format',
]

// Visible order → sequential 1..N numbering (shared by the cards and the panel
// so they always agree).
export const VISIBLE_ORDER = [...PRE, ...LANE_CONTENT, ...LANE_TAXONOMY, ...POST]
export const STEP_NUMBER: Record<string, number> = Object.fromEntries(
  VISIBLE_ORDER.map((id, i) => [id, i + 1]),
)

// Only the final stage shows its output inline on the card; the rest stay clean.
export const FINAL_STAGE = POST[POST.length - 1]

/** "N. Clean Title" for a stage, with the visible numbering applied. */
export function displayTitle(id: string): string {
  const def = STAGES_BY_ID[id]
  const title = (def?.label ?? id).replace(/^\d+\.\s*/, '')
  const n = STEP_NUMBER[id]
  return n ? `${n}. ${title}` : title
}
