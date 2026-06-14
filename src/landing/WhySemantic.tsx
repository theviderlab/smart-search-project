const ROWS: [string, string, string][] = [
  ['running shoes for a rainy day', 'No results (no exact match)', 'Returns waterproof and trail running shoes'],
  ['something to gift a photographer', 'No results', 'Camera bags, tripods, memory cards'],
  ['lightweight laptop to take to work', 'Matches "laptop" + "work" literally', 'Ultrabooks with good weight and battery life'],
  ['office chair for tall people', 'Only if the product page says "tall"', 'Chairs with adjustable height and lumbar support'],
]

export default function WhySemantic() {
  return (
    <section id="why" className="scroll-mt-16 border-t border-slate-900 bg-slate-950/60">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-2xl font-bold tracking-tight text-slate-50">
          Why semantic search beats keyword search
        </h2>

        <div className="mt-8 overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/70 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Scenario</th>
                <th className="px-4 py-3 font-medium text-red-300/80">Keyword search</th>
                <th className="px-4 py-3 font-medium text-emerald-300/90">Smart Search</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {ROWS.map(([q, kw, sem]) => (
                <tr key={q} className="bg-slate-950/40">
                  <td className="px-4 py-3 text-slate-200">“{q}”</td>
                  <td className="px-4 py-3 text-red-200/80">{kw}</td>
                  <td className="px-4 py-3 text-emerald-200/90">{sem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 max-w-3xl text-slate-300">
          Classic search engines compare words. Smart Search compares{' '}
          <span className="text-slate-100">meanings</span> — it understands synonyms,
          context, implicit attributes, and the intent behind the query.
        </p>
      </div>
    </section>
  )
}
