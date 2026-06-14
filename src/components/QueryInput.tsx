interface Example {
  label: string
  query: string
}

interface Props {
  account: string
  query: string
  disabled: boolean
  /**
   * Pre-recorded example queries. When present (replay/demo mode) the free-text
   * query box is replaced by a combobox of these options — typing a query is
   * meaningless offline, since every run maps to canned data.
   */
  examples?: Example[]
  onAccountChange: (v: string) => void
  onQueryChange: (v: string) => void
  onSubmit: () => void
  /** Run a search directly with an example query. */
  onExample?: (query: string) => void
}

export default function QueryInput({
  account,
  query,
  disabled,
  examples = [],
  onAccountChange,
  onQueryChange,
  onSubmit,
  onExample,
}: Props) {
  const replay = examples.length > 0

  return (
    <div className="border-b border-slate-800 bg-slate-900/40">
      <form
        className="flex items-center gap-2 px-6 py-3"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        {/* Account is irrelevant in the offline demo — hide it there. */}
        {!replay && (
          <>
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Account
            </label>
            <input
              type="text"
              value={account}
              onChange={(e) => onAccountChange(e.target.value)}
              disabled={disabled}
              placeholder="my-account"
              className="w-40 rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-100 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
            <label className="ml-4 text-xs uppercase tracking-wide text-slate-400">
              Query
            </label>
          </>
        )}

        {replay ? (
          <>
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Example
            </label>
            <select
              value={query}
              disabled={disabled}
              onChange={(e) => {
                const q = e.target.value
                onQueryChange(q)
                if (q) (onExample ?? (() => {}))(q)
              }}
              className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            >
              <option value="">Choose a pre-recorded search…</option>
              {examples.map((ex) => (
                <option key={ex.query} value={ex.query}>
                  {ex.label}
                </option>
              ))}
            </select>
          </>
        ) : (
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            disabled={disabled}
            placeholder="e.g. luxury hotels in Paris"
            className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100 focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
        )}

        <button
          type="submit"
          disabled={disabled || !query.trim() || (!replay && !account.trim())}
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {replay ? 'Replay' : 'Search'}
        </button>
      </form>
    </div>
  )
}
