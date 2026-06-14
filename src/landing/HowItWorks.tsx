import SearchFlowDiagram from './SearchFlowDiagram'

const SEARCH_STEPS: { n: string; title: string; body: string }[] = [
  {
    n: '1',
    title: 'Semantic match — vectors',
    body: 'Your query is turned into an embedding: a vector of numbers that captures its meaning. Pinecone returns the closest product vectors by similarity — so "a warm beach escape" matches coastal trips even with no words in common. Content vectors (Pipeline A) and taxonomy vectors (Pipeline B) are searched and then merged.',
  },
  {
    n: '2',
    title: 'Structured filters — LLM → SQL',
    body: 'In parallel, an LLM pulls structured filters out of the same query — price, dates, places. These run against the relational catalog (a SQL database — any engine) and the taxonomy tags, dropping anything out of range or off-topic.',
  },
  {
    n: '3',
    title: 'Rank',
    body: 'The survivors are sorted by relevance score and returned — each enriched with its taxonomy tags (cities, countries, regions).',
  },
]

export default function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-16 border-t border-slate-900 bg-slate-950">
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-12">
        <h2 className="text-2xl font-bold tracking-tight text-slate-50">How it works</h2>
        <p className="mt-2 max-w-2xl text-slate-400">
          Two pipelines build the search index — and at query time both converge in the
          Searcher. Each build stage runs independently via the REST API or the admin
          dashboard.
        </p>

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/30 p-5">
          <SearchFlowDiagram />
        </div>

        <h3 className="mt-10 text-xs font-semibold uppercase tracking-wide text-slate-500">
          What happens at query time
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {SEARCH_STEPS.map((s) => (
            <div
              key={s.n}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-5"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/20 text-sm font-semibold text-blue-300">
                {s.n}
              </div>
              <h4 className="mt-3 text-sm font-semibold text-slate-100">{s.title}</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
