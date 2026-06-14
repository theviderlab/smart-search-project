// One connected vertical diagram, faithful to the real pipeline (same stages the
// interactive demo shows):
//   1) INDEX (built offline): Pipeline A (content) and Pipeline B (taxonomy) columns.
//   2) SEARCH (every query): Enhance Query -> Extract Param Filters -> two vector
//      searches (reading the two indexes) -> Merge -> Extract Taxonomy Filters ->
//      Filter by Taxonomy -> Apply Param Filters -> Rank & Format.
const ARROW = '#64748b' // slate-500
const BOX = '#0f172a' // slate-900

type Item = { title: string; sub?: string }

const A: Item[] = [
  { title: 'Finder', sub: 'URL discovery' },
  { title: 'Parser', sub: 'HTML → JSON' },
  { title: 'Summarizer', sub: 'LLM summary' },
  { title: 'Indexer', sub: 'content vectors' },
]
const B: Item[] = [
  { title: 'Taxonomy value' },
  { title: 'Human approval' },
  { title: 'LLM document' },
  { title: 'Taxonomy indexer', sub: 'taxonomy vectors' },
]

// build columns
const CW = 168
const CBH = 42
const ROWS = [52, 114, 176, 238] // tops; bottoms at +CBH

function Node({
  cx,
  y,
  w,
  title,
  sub,
  stroke = '#475569',
  accent = '#e2e8f0',
  h = 44,
}: {
  cx: number
  y: number
  w: number
  title: string
  sub?: string
  stroke?: string
  accent?: string
  h?: number
}) {
  const x = cx - w / 2
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="8" fill={BOX} stroke={stroke} />
      {sub ? (
        <>
          <text x={cx} y={y + 18} textAnchor="middle" fill={accent} fontSize="12.5" fontWeight="600">
            {title}
          </text>
          <text x={cx} y={y + 33} textAnchor="middle" fill="#94a3b8" fontSize="9">
            {sub}
          </text>
        </>
      ) : (
        <text x={cx} y={y + h / 2 + 4} textAnchor="middle" fill={accent} fontSize="12.5" fontWeight="600">
          {title}
        </text>
      )}
    </g>
  )
}

function VArrow({ x, y1, y2, dashed }: { x: number; y1: number; y2: number; dashed?: boolean }) {
  return (
    <line
      x1={x}
      y1={y1}
      x2={x}
      y2={y2}
      stroke={ARROW}
      strokeWidth="1.5"
      strokeDasharray={dashed ? '4 4' : undefined}
      markerEnd="url(#sfd-arrow)"
    />
  )
}

const AX = 140 // content column center
const BX = 400 // taxonomy column center
const MX = 270 // query-flow center

export default function SearchFlowDiagram() {
  return (
    <svg
      viewBox="0 0 540 822"
      role="img"
      aria-label="The index is built offline by Pipeline A (content) and Pipeline B (taxonomy); at query time the Searcher enhances the query, extracts filters, runs two vector searches, merges, filters by taxonomy and params, then ranks."
      className="mx-auto w-full max-w-xl"
    >
      <defs>
        <marker id="sfd-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M0,0 L6,3 L0,6 Z" fill={ARROW} />
        </marker>
      </defs>

      {/* ===================== 1 · INDEX (built offline) ===================== */}
      <text x="20" y="16" fill="#64748b" fontSize="10" fontWeight="700" letterSpacing="0.5">
        1 · INDEX — built offline
      </text>
      <text x={AX} y="38" textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="600">
        Pipeline A — Pages
      </text>
      <text x={BX} y="38" textAnchor="middle" fill="#d8b4fe" fontSize="11" fontWeight="600">
        Pipeline B — Taxonomies
      </text>

      {A.map((it, i) => (
        <g key={`a${i}`}>
          {i > 0 && <VArrow x={AX} y1={ROWS[i] - 20} y2={ROWS[i] - 2} />}
          <Node cx={AX} y={ROWS[i]} w={CW} h={CBH} stroke="#3b82f6" title={it.title} sub={it.sub} />
        </g>
      ))}
      {B.map((it, i) => (
        <g key={`b${i}`}>
          {i > 0 && <VArrow x={BX} y1={ROWS[i] - 20} y2={ROWS[i] - 2} />}
          <Node cx={BX} y={ROWS[i]} w={CW} h={CBH} stroke="#a855f7" title={it.title} sub={it.sub} />
        </g>
      ))}

      {/* ===================== 2 · SEARCH (every query) ===================== */}
      <line x1="20" y1="300" x2="520" y2="300" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 4" />
      <text x={MX} y="296" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="700" letterSpacing="0.5">
        2 · SEARCH — every query
      </text>

      {/* Enhance -> Extract Param Filters */}
      <Node cx={MX} y={316} w={200} title="Enhance Query" sub="LLM rewrites the query" />
      <VArrow x={MX} y1={360} y2={374} />
      <Node cx={MX} y={374} w={200} title="Extract Param Filters" sub="LLM → price · length · dates" />

      {/* the built indexes feed the two vector searches (from above) */}
      <VArrow x={AX} y1={ROWS[3] + CBH} y2={444} dashed />
      <VArrow x={BX} y1={ROWS[3] + CBH} y2={444} dashed />
      {/* the enhanced query feeds both searches (from the center) */}
      <path d={`M${MX},416 C248,448 248,467 224,467`} fill="none" stroke={ARROW} strokeWidth="1.5" markerEnd="url(#sfd-arrow)" />
      <path d={`M${MX},416 C292,448 292,467 316,467`} fill="none" stroke={ARROW} strokeWidth="1.5" markerEnd="url(#sfd-arrow)" />

      <Node cx={AX} y={446} w={CW} h={48} stroke="#3b82f6" title="Vector Search" sub="content · reads A index" />
      <Node cx={BX} y={446} w={CW} h={48} stroke="#a855f7" title="Vector Search" sub="taxonomy · reads B index" />

      {/* both searches converge into Merge */}
      <path d={`M${AX},494 C${AX},512 220,516 244,519`} fill="none" stroke={ARROW} strokeWidth="1.5" markerEnd="url(#sfd-arrow)" />
      <path d={`M${BX},494 C${BX},512 320,516 296,519`} fill="none" stroke={ARROW} strokeWidth="1.5" markerEnd="url(#sfd-arrow)" />

      <Node cx={MX} y={521} w={220} title="Merge Results" sub="union by product · highest score wins" />
      <VArrow x={MX} y1={565} y2={579} />
      <Node cx={MX} y={581} w={220} title="Extract Taxonomy Filters" sub="LLM → places to include / exclude" />
      <VArrow x={MX} y1={625} y2={639} />
      <Node cx={MX} y={641} w={220} title="Filter by Taxonomy" sub="drop off-place packages" />
      <VArrow x={MX} y1={685} y2={699} />
      <Node cx={MX} y={701} w={220} title="Apply Param Filters" sub="drop out-of-range · SQL" />
      <VArrow x={MX} y1={745} y2={759} />
      <Node cx={MX} y={761} w={200} h={48} stroke="#10b981" accent="#6ee7b7" title="Rank & Format" sub="score + taxonomy tags (city · country · region)" />
    </svg>
  )
}
