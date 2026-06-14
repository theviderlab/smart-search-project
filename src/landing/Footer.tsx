import { AUTHORS } from './authors'

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-10 text-sm text-slate-400 sm:flex-row sm:items-center">
        <div>
          <div className="font-semibold text-slate-200">Smart Search</div>
          <div className="mt-1 max-w-xl">
            Semantic product search for e-commerce, powered by AI — the full pipeline and
            admin dashboard are production-ready (active development).
          </div>
        </div>
        <div className="shrink-0 text-left sm:text-right">
          <div className="text-xs uppercase tracking-wide text-slate-500">Built by</div>
          <div className="mt-1 flex flex-col gap-1 sm:items-end">
            {AUTHORS.map((a) => (
              <a
                key={a.url}
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="text-slate-200 underline-offset-2 transition-colors hover:text-blue-300 hover:underline"
              >
                {a.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
