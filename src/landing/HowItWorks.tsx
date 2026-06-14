import SearchFlowDiagram from './SearchFlowDiagram'

const CONCEPTS: { term: string; lead: string; bullets: string[] }[] = [
  {
    term: 'Embeddings (vectors)',
    lead: 'An embedding turns text into a list of numbers that captures its meaning as a point in space.',
    bullets: [
      'Both product descriptions and your search query become embeddings.',
      'Similar meaning → vectors land close together.',
      'So search matches by intent, not by exact words.',
    ],
  },
  {
    term: 'The two indexes',
    lead: 'Two separate vector indexes, both in a vector database (Pinecone):',
    bullets: [
      'Content index — what each product is actually about (from its description).',
      'Taxonomy index — the categories it belongs to.',
      'Searched separately, then merged into one candidate list.',
    ],
  },
  {
    term: 'Taxonomies',
    lead: 'A structured tree of categories — here, places: country → region → city.',
    bullets: [
      'Every product is tagged with its taxonomy values.',
      'Tags power the taxonomy search and the place filters (e.g. "trips avoiding Brazil").',
      'They also enrich each result shown to the user.',
    ],
  },
  {
    term: 'LLM + SQL',
    lead: 'Filters come from two cooperating parts:',
    bullets: [
      'LLM — reads your query and pulls the filters out of it.',
      'SQL (any engine) — applies hard numeric/date conditions (price, dates) on the catalog.',
      'The LLM brings meaning; SQL brings exact precision.',
    ],
  },
]

const SEARCH_STEPS: { n: string; title: string; body: string }[] = [
  {
    n: '1',
    title: 'Semantic match — vectors',
    body: 'Your query is turned into an embedding: a vector of numbers that captures its meaning. Pinecone returns the closest product vectors by similarity — so "a warm beach escape" matches coastal trips even with no words in common. Content vectors (Pipeline A) and taxonomy vectors (Pipeline B) are searched, then merged into one list — a union by product (not a join or a sum): a product found by both searches keeps its highest score.',
  },
  {
    n: '2',
    title: 'Structured filters — two kinds',
    body: 'An LLM turns the query into filters. Place filters (countries, cities, regions to include or exclude) are matched against the taxonomy tags; numeric/date filters (price, trip length, dates) run against the relational catalog — a SQL database, any engine. Anything off-place or out of range is dropped.',
  },
  {
    n: '3',
    title: 'Rank & Format',
    body: 'The survivors are sorted by relevance score and returned — each enriched with its taxonomy tags (cities, countries, regions).',
  },
]

export default function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-16 border-t border-slate-900 bg-slate-950">
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-12">
        <h2 className="text-2xl font-bold tracking-tight text-slate-50">How it works</h2>

        <h3 className="mt-8 text-xs font-semibold uppercase tracking-wide text-slate-500">
          The building blocks
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CONCEPTS.map((c) => (
            <div key={c.term} className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
              <h4 className="text-sm font-semibold text-blue-200">{c.term}</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{c.lead}</p>
              <ul className="mt-2 space-y-1.5">
                {c.bullets.map((b) => (
                  <li key={b} className="flex gap-2 text-sm leading-relaxed text-slate-400">
                    <span className="mt-2 h-1 w-1 flex-none rounded-full bg-blue-400/70" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <h3 className="mt-10 text-xs font-semibold uppercase tracking-wide text-slate-500">
          The pipeline, end to end
        </h3>
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/30 p-5">
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
