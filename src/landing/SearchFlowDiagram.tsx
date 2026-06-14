// One connected vertical diagram: Pipeline A and Pipeline B run top-to-bottom as
// columns, then both converge into the Searcher (Merge -> Filters -> Rank).
const ARROW = '#64748b' // slate-500
const BOX = '#0f172a' // slate-900

type Box = { title: string; sub?: string }

const A: Box[] = [
  { title: 'Finder', sub: 'URL discovery' },
  { title: 'Parser', sub: 'HTML → JSON' },
  { title: 'Summarizer', sub: 'LLM summary' },
  { title: 'Indexer', sub: 'content vectors' },
]
const B: Box[] = [
  { title: 'Taxonomy value' },
  { title: 'Human approval' },
  { title: 'LLM document' },
  { title: 'Taxonomy indexer', sub: 'taxonomy vectors' },
]

const TOP0 = 46
const STEP = 70
const BH = 46
const BW = 180

function Column({
  cx,
  items,
  stroke,
  accent,
  label,
}: {
  cx: number
  items: Box[]
  stroke: string
  accent: string
  label: string
}) {
  const x = cx - BW / 2
  return (
    <g>
      <text x={cx} y={30} textAnchor="middle" fill={accent} fontSize="11" fontWeight="600">
        {label}
      </text>
      {items.map((b, i) => {
        const top = TOP0 + i * STEP
        return (
          <g key={b.title}>
            {i > 0 && (
              <line
                x1={cx}
                y1={top - 24}
                x2={cx}
                y2={top - 2}
                stroke={ARROW}
                strokeWidth="1.5"
                markerEnd="url(#sfd-arrow)"
              />
            )}
            <rect x={x} y={top} width={BW} height={BH} rx="8" fill={BOX} stroke={stroke} />
            {b.sub ? (
              <>
                <text x={cx} y={top + 20} textAnchor="middle" fill="#e2e8f0" fontSize="12.5" fontWeight="600">
                  {b.title}
                </text>
                <text x={cx} y={top + 35} textAnchor="middle" fill="#94a3b8" fontSize="9.5">
                  {b.sub}
                </text>
              </>
            ) : (
              <text x={cx} y={top + 28} textAnchor="middle" fill="#e2e8f0" fontSize="12.5" fontWeight="600">
                {b.title}
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}

export default function SearchFlowDiagram() {
  const colBottom = TOP0 + 3 * STEP + BH // 300

  return (
    <svg
      viewBox="0 0 480 524"
      role="img"
      aria-label="Pipeline A and Pipeline B build the index, then converge into the Searcher: merge, filters, rank"
      className="mx-auto w-full max-w-md"
    >
      <defs>
        <marker
          id="sfd-arrow"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M0,0 L6,3 L0,6 Z" fill={ARROW} />
        </marker>
      </defs>

      <Column cx={130} items={A} stroke="#3b82f6" accent="#93c5fd" label="Pipeline A — Pages" />
      <Column cx={350} items={B} stroke="#a855f7" accent="#d8b4fe" label="Pipeline B — Taxonomies" />

      {/* both columns converge into Merge */}
      <path d={`M130,${colBottom} C130,320 200,324 222,337`} fill="none" stroke={ARROW} strokeWidth="1.5" markerEnd="url(#sfd-arrow)" />
      <path d={`M350,${colBottom} C350,320 280,324 258,337`} fill="none" stroke={ARROW} strokeWidth="1.5" markerEnd="url(#sfd-arrow)" />

      {/* Searcher: Merge -> Filters -> Rank */}
      <text x="240" y="332" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="600">
        SEARCHER (query time)
      </text>
      <rect x="185" y="340" width="110" height="44" rx="8" fill={BOX} stroke="#475569" />
      <text x="240" y="367" textAnchor="middle" fill="#e2e8f0" fontSize="13" fontWeight="600">Merge</text>

      <line x1="240" y1="384" x2="240" y2="402" stroke={ARROW} strokeWidth="1.5" markerEnd="url(#sfd-arrow)" />
      <rect x="160" y="404" width="160" height="46" rx="8" fill={BOX} stroke="#475569" />
      <text x="240" y="425" textAnchor="middle" fill="#e2e8f0" fontSize="13" fontWeight="600">Filters</text>
      <text x="240" y="441" textAnchor="middle" fill="#94a3b8" fontSize="9.5">LLM → SQL + taxonomy</text>

      <line x1="240" y1="450" x2="240" y2="468" stroke={ARROW} strokeWidth="1.5" markerEnd="url(#sfd-arrow)" />
      <rect x="195" y="470" width="90" height="42" rx="8" fill={BOX} stroke="#10b981" />
      <text x="240" y="496" textAnchor="middle" fill="#6ee7b7" fontSize="13" fontWeight="600">Rank</text>
    </svg>
  )
}
