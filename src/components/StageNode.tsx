import { motion } from 'framer-motion'
import type { StageDef, StageState } from '@/lib/types'

interface Props {
  def: StageDef
  state: StageState | undefined
  selected: boolean
  onClick: () => void
  /** Title (already numbered, e.g. "1. Enhance Query"). */
  title: string
  /** Show this stage's output summary inline once the stage finishes. */
  showOutput?: boolean
}

// Cards show what the stage does (label + description) and, once finished, a
// one-line summary of the output they produced (see showOutput).

const statusStyles: Record<StageState['status'], string> = {
  pending: 'border-slate-700 bg-slate-900 text-slate-400',
  running:
    'border-blue-500 bg-blue-950/40 text-blue-100 shadow-[0_0_18px_-2px_rgba(59,130,246,0.55)]',
  done: 'border-emerald-600 bg-emerald-950/30 text-emerald-100',
  warning: 'border-amber-600 bg-amber-950/30 text-amber-100',
  error: 'border-red-600 bg-red-950/40 text-red-100',
}

const statusIcon: Record<StageState['status'], string> = {
  pending: '○',
  running: '⟳',
  done: '✓',
  warning: '⚠',
  error: '!',
}

export default function StageNode({
  def,
  state,
  selected,
  onClick,
  title,
  showOutput = false,
}: Props) {
  const status = state?.status ?? 'pending'
  const error = state?.error
  const outputPreview = state?.outputPreview

  return (
    <motion.button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      initial={false}
      animate={{ scale: status === 'running' ? 1.03 : 1 }}
      transition={{ duration: 0.25 }}
      className={`relative flex min-h-[80px] w-[200px] cursor-pointer flex-col rounded-lg border px-3 py-2 text-left transition-colors ${statusStyles[status]} ${
        selected ? 'ring-2 ring-blue-400' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs font-semibold leading-tight">{title}</div>
        <span
          className={`text-base leading-none ${status === 'running' ? 'inline-block animate-spin-slow' : ''}`}
        >
          {statusIcon[status]}
        </span>
      </div>
      <div className="mt-1 line-clamp-2 text-[10px] leading-snug text-slate-400">
        {def.description}
      </div>
      {showOutput && outputPreview && (status === 'done' || status === 'warning') && (
        <div
          className={`mt-1.5 truncate rounded px-1.5 py-0.5 text-[10px] ${
            status === 'warning'
              ? 'bg-amber-950/60 text-amber-200'
              : 'bg-slate-950/50 text-emerald-200'
          }`}
        >
          → {outputPreview}
        </div>
      )}
      {error && (
        <div className="mt-1.5 truncate rounded bg-red-950/60 px-1.5 py-0.5 text-[10px] text-red-200">
          {error}
        </div>
      )}
    </motion.button>
  )
}
