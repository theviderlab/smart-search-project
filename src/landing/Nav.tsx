import { AUTHORS } from './authors'

// Explanation first, demo last — so the nav anchors follow that order.
const LINKS = [
  { href: '#how', label: 'How it works' },
  { href: '#why', label: 'Why semantic' },
  { href: '#features', label: 'Features' },
  { href: '#demo', label: 'Demo' },
]

export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-3">
        <a href="#top" className="text-sm font-semibold tracking-tight text-slate-100">
          Smart <span className="text-blue-400">Search</span>
        </a>

        <div className="hidden items-center gap-5 text-sm text-slate-300 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-white">
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="text-slate-500">by</span>
          {AUTHORS.map((a, i) => (
            <span key={a.url} className="flex items-center gap-2">
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="text-slate-200 underline-offset-2 transition-colors hover:text-blue-300 hover:underline"
              >
                {a.name}
              </a>
              {i < AUTHORS.length - 1 && <span className="text-slate-600">·</span>}
            </span>
          ))}
        </div>
      </div>
    </nav>
  )
}
