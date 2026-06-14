import type { SearchResponse } from '@/lib/types'

interface Props {
  response: SearchResponse | null
}

export default function ResultsList({ response }: Props) {
  if (!response) {
    return (
      <div className="flex-1 px-4 py-3 text-xs text-slate-500">
        Results will appear here once the pipeline completes.
      </div>
    )
  }

  if (!response.results?.length) {
    return (
      <div className="flex-1 px-4 py-3 text-xs text-slate-500">
        No results returned.
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-slate-100">
          Results ({response.results.length})
        </h3>
        {response.processed_query && response.processed_query !== response.query && (
          <span className="truncate text-[10px] text-slate-500" title={response.processed_query}>
            rewrote: "{response.processed_query}"
          </span>
        )}
      </div>
      <ul className="space-y-2">
        {response.results.map((r) => (
          <li
            key={r.id}
            className="rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2"
          >
            <div className="flex items-baseline justify-between gap-2">
              <div className="truncate text-sm font-medium text-slate-100">
                {r.title || r.id}
              </div>
              <div className="shrink-0 text-xs text-blue-400">
                {r.score.toFixed(3)}
              </div>
            </div>
            {r.content && (
              <div className="mt-1 line-clamp-2 text-xs text-slate-400">{r.content}</div>
            )}
            {r.taxonomies && r.taxonomies.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {r.taxonomies.flatMap((g) =>
                  g.values.slice(0, 3).map((v) => (
                    <span
                      key={`${g.taxonomy_name}-${v}`}
                      className="rounded-full bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300"
                    >
                      {g.taxonomy_name}: {v}
                    </span>
                  ))
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
