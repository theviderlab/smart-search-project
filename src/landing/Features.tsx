const FEATURES: { title: string; body: string }[] = [
  {
    title: 'Semantic Search',
    body: 'Vector similarity search (Pinecone + OpenAI embeddings) with automatic LLM-based query enhancement before searching.',
  },
  {
    title: 'Structured Content Extraction',
    body: 'Configurable HTML parser with blueprints that extracts typed fields (text, price, date, image, etc.) from any page structure.',
  },
  {
    title: 'LLM Summarization',
    body: 'Per-account configurable prompts that generate rich documents and filterable parameters from each product.',
  },
  {
    title: 'Taxonomy Classification',
    body: 'Hierarchical product classification with a human approval workflow and a dedicated vector namespace.',
  },
  {
    title: 'Multi-Account / Multi-Source',
    body: 'Each account has its own Pinecone namespace; categories and prompts are configured independently.',
  },
  {
    title: 'Multi-Model LLM',
    body: 'OpenRouter allows switching LLM providers without code changes; LangChain handles orchestration.',
  },
  {
    title: 'Error Monitoring',
    body: 'Sentry integration for error tracking and production alerts.',
  },
]

export default function Features() {
  return (
    <section id="features" className="scroll-mt-16 border-t border-slate-900 bg-slate-950">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-2xl font-bold tracking-tight text-slate-50">Features</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-5"
            >
              <h3 className="text-sm font-semibold text-slate-100">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
