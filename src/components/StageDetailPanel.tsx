import type { StageState } from '@/lib/types'
import { STAGES_BY_ID } from '@/pipeline/stages'
import { displayTitle } from '@/pipeline/layout'
import { compact } from '@/pipeline/payload'

interface Props {
  stage: StageState | null
}

export default function StageDetailPanel({ stage }: Props) {
  if (!stage) {
    return (
      <div className="border-b border-slate-800 px-4 py-3 text-xs text-slate-500">
        Click a stage in the graph to inspect its input / output.
      </div>
    )
  }
  const def = STAGES_BY_ID[stage.id]

  return (
    <div className="border-b border-slate-800 px-4 py-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-slate-100">{displayTitle(stage.id)}</h3>
        <span className="text-[10px] uppercase tracking-wide text-slate-500">
          {stage.status}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-400">{def?.description}</p>
      <div className="mt-2 space-y-1.5">
        <DataRow label="Input" data={stage.inputData} preview={stage.inputPreview} />
        <DataRow label="Output" data={stage.outputData} preview={stage.outputPreview} />
        {stage.warning && (
          <DetailRow label="Warning" value={stage.warning} tone="warning" />
        )}
        {stage.error && <DetailRow label="Error" value={stage.error} tone="error" />}
      </div>
    </div>
  )
}

/**
 * Renders a stage payload: a readable key→value tree when the data is
 * structured (e.g. filter objects), otherwise the one-line preview string.
 * When the stage produced a payload that pruned down to nothing (e.g. no
 * filters extracted), shows an explicit "(none)" so it's clear it ran empty.
 * Hidden entirely only when there's no payload at all.
 */
function DataRow({
  label,
  data,
  preview,
}: {
  label: string
  data: Record<string, unknown> | undefined
  preview: string | undefined
}) {
  const lines = data ? renderLines(compact(data) as Record<string, unknown> | undefined) : []

  if (lines.length === 0) {
    if (preview) return <DetailRow label={label} value={preview} />
    // A payload arrived but everything was null/empty — say so explicitly
    // rather than hiding the row (ambiguous with "didn't run").
    if (data) {
      return (
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
          <div className="rounded bg-slate-900 px-2 py-1 text-xs italic text-slate-500">
            (empty — this query produced no values for this stage)
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded bg-slate-900 px-2 py-1 font-mono text-xs leading-relaxed text-slate-200">
        {lines.join('\n')}
      </pre>
    </div>
  )
}

function DetailRow({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string | undefined
  tone?: 'default' | 'warning' | 'error'
}) {
  const colors =
    tone === 'error'
      ? 'text-red-200 bg-red-950/40'
      : tone === 'warning'
        ? 'text-amber-200 bg-amber-950/40'
        : 'text-slate-200 bg-slate-900'
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`rounded px-2 py-1 text-xs ${colors}`}>
        {value ?? <span className="text-slate-600">—</span>}
      </div>
    </div>
  )
}

// --- payload formatting helpers ---------------------------------------------

// The backend emits raw field names (direct, merged_page_ids, ...). Map the ones
// that show up in stage payloads to plain English so the panel is readable to
// anyone; unknown keys just get their underscores turned into spaces.
const KEY_LABELS: Record<string, string> = {
  direct: 'content matches',
  taxonomy: 'taxonomy matches',
  tax_hits: 'taxonomy hits',
  hits: 'matches',
  merged_page_ids: 'merged products',
  expanded_page_ids: 'products from taxonomy',
  page_ids: 'candidate products',
  surviving_page_ids: 'surviving products',
  unique_page_ids: 'unique products',
  processed_query: 'rewritten query',
  processor_filters: 'numeric / date filters',
  taxonomy_filters: 'place filters',
  taxonomy_name: 'taxonomy',
  top_matches: 'top matches',
  top_score: 'top score',
  starting_price: 'starting price',
  duration_nights: 'nights',
  duration_days: 'days',
  departure_dates: 'departure dates',
  valid_until: 'valid until',
  enriched_results: 'results',
  ranked: 'ranked products',
  dropped: 'dropped',
}

function labelKey(k: string): string {
  return KEY_LABELS[k] ?? k.replace(/_/g, ' ')
}

function scalarStr(v: unknown): string {
  return typeof v === 'string' ? v : String(v)
}

/** Inline string for a value, or null if it needs a nested block. */
function inlineValue(v: unknown): string | null {
  if (v === null || v === undefined) return null
  if (typeof v !== 'object') return scalarStr(v)
  if (Array.isArray(v)) {
    return v.every((x) => x === null || typeof x !== 'object')
      ? v.map(scalarStr).join(', ')
      : null
  }
  const o = v as Record<string, unknown>
  const keys = Object.keys(o)
  // Range objects (min/max) read better as "min – max".
  if (keys.length > 0 && keys.every((k) => k === 'min' || k === 'max')) {
    return `${o.min === undefined ? '∗' : scalarStr(o.min)} – ${o.max === undefined ? '∗' : scalarStr(o.max)}`
  }
  return null
}

/** Render an object/array into aligned lines, indenting nested blocks. Arrays of
 * objects render as "- a: x · b: y" bullets instead of numeric 0:/1: indices. */
function renderLines(o: unknown, indent = 0): string[] {
  if (!o || typeof o !== 'object') return []
  const pad = '  '.repeat(indent)
  const lines: string[] = []

  if (Array.isArray(o)) {
    for (const item of o) {
      const inline = inlineValue(item)
      if (inline !== null) {
        lines.push(`${pad}- ${inline}`)
      } else if (item && typeof item === 'object') {
        const parts = Object.entries(item as Record<string, unknown>)
          .map(([k, v]) => {
            const iv = inlineValue(v)
            return iv !== null ? `${labelKey(k)}: ${iv}` : null
          })
          .filter((s): s is string => s !== null)
        lines.push(`${pad}- ${parts.join('  ·  ')}`)
      }
    }
    return lines
  }

  for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
    const inline = inlineValue(v)
    if (inline !== null) {
      lines.push(`${pad}${labelKey(k)}: ${inline}`)
    } else if (v && typeof v === 'object') {
      lines.push(`${pad}${labelKey(k)}:`)
      lines.push(...renderLines(v, indent + 1))
    }
  }
  return lines
}
