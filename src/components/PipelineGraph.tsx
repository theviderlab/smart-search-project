import { Fragment } from 'react'
import StageNode from './StageNode'
import { STAGES_BY_ID } from '@/pipeline/stages'
import {
  PRE,
  LANE_CONTENT,
  LANE_TAXONOMY,
  POST,
  displayTitle,
} from '@/pipeline/layout'
import type { StagesMap } from '@/pipeline/timeline'
import type { StageStatus } from '@/lib/types'

const LANE_CONTENT_TAIL = LANE_CONTENT[LANE_CONTENT.length - 1]

interface Props {
  stages: StagesMap
  selectedStageId: string | null
  onSelectStage: (id: string | null) => void
}

const isTerminal = (s: StageStatus | undefined) =>
  s === 'done' || s === 'warning' || s === 'error'

/** Color a connector by the flow state across it (static — no animation). */
function arrowColor(stages: StagesMap, fromId: string, toId: string): string {
  const from = stages[fromId]?.status
  const to = stages[toId]?.status
  if (isTerminal(from) && isTerminal(to)) return 'text-emerald-600'
  if (from === 'running' || isTerminal(from)) return 'text-blue-400'
  return 'text-slate-700'
}

export default function PipelineGraph({
  stages,
  selectedStageId,
  onSelectStage,
}: Props) {
  const card = (id: string) => (
    <StageNode
      key={id}
      def={STAGES_BY_ID[id]}
      state={stages[id]}
      selected={selectedStageId === id}
      onClick={() => onSelectStage(selectedStageId === id ? null : id)}
      title={displayTitle(id)}
      showOutput
    />
  )

  const arrow = (fromId: string, toId: string, key: string) => (
    <div
      key={key}
      className={`my-1 text-xl leading-none ${arrowColor(stages, fromId, toId)}`}
      aria-hidden
    >
      ↓
    </div>
  )

  const lane = (ids: string[]) => (
    <div className="flex flex-col items-center">
      {ids.map((id, i) => (
        <Fragment key={id}>
          {card(id)}
          {i < ids.length - 1 && arrow(id, ids[i + 1], `${id}-arr`)}
        </Fragment>
      ))}
    </div>
  )

  return (
    <div
      className="h-full w-full overflow-auto bg-slate-950 p-6"
      onClick={() => onSelectStage(null)}
    >
      <div className="mx-auto flex w-fit flex-col items-center">
        {/* Sequential head: query understanding (LLM) */}
        {PRE.map((id, i) => (
          <Fragment key={id}>
            {card(id)}
            {arrow(id, i < PRE.length - 1 ? PRE[i + 1] : LANE_CONTENT[0], `pre-${id}`)}
          </Fragment>
        ))}

        {/* Semantic search. When the taxonomy lane is enabled it runs in
            parallel beside content; otherwise content renders as a single column. */}
        {LANE_TAXONOMY.length > 0 ? (
          <div className="flex items-start gap-12">
            {lane(LANE_CONTENT)}
            {lane(LANE_TAXONOMY)}
          </div>
        ) : (
          lane(LANE_CONTENT)
        )}

        {/* Merge + filter + rank */}
        {arrow(LANE_CONTENT_TAIL, POST[0], 'merge-arr')}
        {POST.map((id, i) => (
          <Fragment key={id}>
            {card(id)}
            {i < POST.length - 1 && arrow(id, POST[i + 1], `post-${id}`)}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
