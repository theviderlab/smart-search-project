export default function Hero() {
  return (
    <header id="top" className="mx-auto max-w-5xl px-6 pb-6 pt-16 text-center">
      <img
        src={`${import.meta.env.BASE_URL}SmartSearch.png`}
        alt="Smart Search logo"
        className="mx-auto mb-5 h-20 w-20 invert sm:h-24 sm:w-24"
      />
      <h1 className="text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl">
        Smart <span className="text-blue-400">Search</span>
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
        Semantic product search for e-commerce, powered by AI — it grasps shopper{' '}
        <span className="text-slate-100">intent</span> instead of matching keywords.
      </p>

      <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-slate-800 bg-slate-900/50 p-5 text-left">
        <div className="text-[11px] uppercase tracking-wide text-slate-500">
          Example query — this live demo runs on a travel catalog
        </div>
        <p className="mt-1 text-slate-100">“a warm beach escape under&nbsp;$3,000”</p>

        <p className="mt-3 text-xs text-slate-500">
          The pipeline rewrites it and pulls out structured filters:
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-md bg-emerald-950/50 px-2.5 py-1 text-emerald-200">
            intent: <b>beach / coastal</b>
          </span>
          <span className="rounded-md bg-blue-950/50 px-2.5 py-1 text-blue-200">
            price filter: <b>≤ $3,000</b>
          </span>
        </div>
        <div className="mt-3 text-sm text-slate-300">
          → ranks <b className="text-slate-100">4 matching trips</b>, all within budget.
          A keyword search would return nothing.
        </div>
      </div>

      <a
        href="#demo"
        className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500"
      >
        See a demo workflow in action ↓
      </a>
    </header>
  )
}
