import { useCallback, useEffect, useRef, useState } from 'react'
import QueryInput from '@/components/QueryInput'
import PipelineGraph from '@/components/PipelineGraph'
import ResultsList from '@/components/ResultsList'
import StageDetailPanel from '@/components/StageDetailPanel'
import { searchDocuments } from '@/api/search'
import { searchDocumentsStream, StreamUnavailableError } from '@/api/searchStream'
import {
  replaySearchStream,
  loadDemoManifest,
  type DemoExample,
} from '@/api/replayStream'
import { startRecording, downloadRecording } from '@/api/recorder'
import { ACCOUNT } from '@/api/client'
import type { SearchResponse, StageState } from '@/lib/types'
import { initialStages, runTimeline, type StagesMap } from '@/pipeline/timeline'
import { applyStreamEvent } from '@/pipeline/streamAdapter'
import { enrichStages } from '@/pipeline/enrich'
import { FINAL_STAGE } from '@/pipeline/layout'
import { TOTAL_ESTIMATED_MS } from '@/lib/timings'

type RunStatus = 'idle' | 'running' | 'awaiting' | 'done' | 'error'
type Mode = 'live' | 'estimated' | 'demo' | null

const USE_STREAM = (import.meta.env.VITE_USE_STREAM as string | undefined) !== 'false'
// Offline demo mode for GitHub Pages: replay pre-recorded runs instead of
// hitting a live backend. See replayStream.ts.
const USE_REPLAY = (import.meta.env.VITE_USE_REPLAY as string | undefined) === 'true'
// Dev-only: capture the live run and download it as a demo JSON.
const RECORD = (import.meta.env.VITE_RECORD as string | undefined) === 'true'

export default function PipelineDemo() {
  const [account, setAccount] = useState(ACCOUNT)
  const [query, setQuery] = useState('')
  const [stages, setStages] = useState<StagesMap>(initialStages())
  const [status, setStatus] = useState<RunStatus>('idle')
  const [mode, setMode] = useState<Mode>(null)
  const [response, setResponse] = useState<SearchResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null)
  const [examples, setExamples] = useState<DemoExample[]>([])

  // In replay (Pages demo) mode, load the example queries for the chips.
  useEffect(() => {
    if (!USE_REPLAY) return
    let alive = true
    loadDemoManifest()
      .then((m) => alive && setExamples(m.examples))
      .catch(() => alive && setExamples([]))
    return () => {
      alive = false
    }
  }, [])

  // Tracks the in-flight stream so a new search (or unmount) can abort it.
  // Without this, an old reader keeps emitting setStages and overwrites the
  // flow of the newer run.
  const abortRef = useRef<AbortController | null>(null)
  useEffect(() => () => abortRef.current?.abort(), [])

  const updateStage = useCallback((id: string, patch: Partial<StageState>) => {
    setStages((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }, [])

  const runLive = useCallback(
    async (
      req: { account: string; query: string; k: number },
      signal: AbortSignal,
    ) => {
      // Same signature for both, so the only difference is the event source.
      const streamFn = USE_REPLAY ? replaySearchStream : searchDocumentsStream
      const apply = (event: Parameters<Parameters<typeof streamFn>[1]>[0]) => {
        setStages((prev) => applyStreamEvent(prev, event))
      }
      const recorder = RECORD && !USE_REPLAY ? startRecording(apply) : null
      const finalResponse = await streamFn(req, recorder ? recorder.onEvent : apply, {
        signal,
      })
      if (recorder) downloadRecording(req, recorder.events)
      setResponse(finalResponse)
      setMode(USE_REPLAY ? 'demo' : 'live')
      setStatus('done')
    },
    [],
  )

  const runScripted = useCallback(
    async (req: { account: string; query: string; k: number }) => {
      const startedAt = performance.now()
      const handle = runTimeline(1, {
        onUpdate: updateStage,
        onComplete: () => {
          setStatus((s) => (s === 'running' ? 'awaiting' : s))
        },
      })
      try {
        const res = await searchDocuments(req)
        const elapsed = performance.now() - startedAt
        if (elapsed < TOTAL_ESTIMATED_MS * 0.9) {
          handle.finishNow('done')
        } else {
          handle.cancel()
        }
        setTimeout(() => {
          setStages((prev) =>
            enrichStages(prev, { account: req.account, query: req.query }, res),
          )
          setResponse(res)
          setMode('estimated')
          setStatus('done')
        }, 120)
      } catch (err) {
        handle.finishNow(
          'error',
          extractMessage(err) ?? 'Unknown error',
        )
        throw err
      }
    },
    [updateStage],
  )

  const handleSearch = useCallback(async (overrideQuery?: string) => {
    const effectiveQuery = (overrideQuery ?? query).trim()
    if (!effectiveQuery || !account.trim()) return
    if (overrideQuery !== undefined) setQuery(overrideQuery)

    // Cancel any stream still running from a previous search so its events
    // can't bleed into this run.
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStages(initialStages())
    setResponse(null)
    setErrorMessage(null)
    setSelectedStageId(null)
    setStatus('running')
    setMode(null)

    const req = { account, query: effectiveQuery, k: 10 }

    if (USE_REPLAY) {
      // Pages demo: no backend to fall back to — surface any failure directly.
      try {
        await runLive(req, controller.signal)
      } catch (err) {
        if (controller.signal.aborted) return
        setErrorMessage(extractMessage(err) ?? 'Demo replay failed')
        setStatus('error')
      }
      return
    }

    if (USE_STREAM) {
      try {
        await runLive(req, controller.signal)
        return
      } catch (err) {
        // Aborted because a newer search superseded this one (or unmount) —
        // stay silent; the newer run owns the UI now.
        if (controller.signal.aborted) return
        if (err instanceof StreamUnavailableError) {
          // Stream endpoint unavailable (404/feature flag off) — fall back silently.
          setStages(initialStages())
          await runScripted(req).catch((e) => {
            setErrorMessage(extractMessage(e) ?? 'Search failed')
            setStatus('error')
          })
          return
        }
        // Other errors (network mid-stream, parse failure, backend error event):
        // surface them.
        setErrorMessage(extractMessage(err) ?? 'Stream error')
        setStatus('error')
        return
      }
    }

    await runScripted(req).catch((e) => {
      setErrorMessage(extractMessage(e) ?? 'Search failed')
      setStatus('error')
    })
  }, [account, query, runLive, runScripted])

  const isRunning = status === 'running' || status === 'awaiting'

  return (
    <div className="flex h-full w-full flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-6 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight">
            Pipeline <span className="text-blue-400">Visualizer</span>
          </h2>
          <div className="flex items-center gap-3 text-xs">
            {mode === 'live' && (
              <span className="rounded-full bg-emerald-900/50 px-2 py-0.5 text-emerald-300">
                live
              </span>
            )}
            {mode === 'estimated' && (
              <span className="rounded-full bg-amber-900/50 px-2 py-0.5 text-amber-300">
                estimated
              </span>
            )}
            {USE_REPLAY && (
              <span className="rounded-full bg-purple-900/50 px-2 py-0.5 text-purple-300">
                Demo — pre-recorded
              </span>
            )}
            <span className="text-slate-400">
              {status === 'idle' && 'ready'}
              {status === 'running' && 'streaming…'}
              {status === 'awaiting' && 'waiting…'}
              {status === 'done' && 'done'}
              {status === 'error' && <span className="text-red-400">error</span>}
            </span>
          </div>
        </div>
      </header>

      <QueryInput
        account={account}
        query={query}
        disabled={isRunning}
        examples={examples}
        onAccountChange={setAccount}
        onQueryChange={setQuery}
        onSubmit={() => handleSearch()}
        onExample={(q) => handleSearch(q)}
      />

      {errorMessage && (
        <div className="border-b border-red-900 bg-red-950/40 px-6 py-2 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      <main className="grid min-h-0 flex-1 grid-cols-12 grid-rows-1 gap-0 overflow-hidden">
        <div className="col-span-8 h-full min-h-0 overflow-hidden border-r border-slate-800">
          <PipelineGraph
            stages={stages}
            selectedStageId={selectedStageId}
            onSelectStage={setSelectedStageId}
          />
        </div>
        <aside className="col-span-4 flex h-full min-h-0 flex-col overflow-hidden">
          <StageDetailPanel stage={selectedStageId ? stages[selectedStageId] : null} />
          {/* Final results belong to the final stage — show them only when no
              stage is selected (default view) or the final stage is selected,
              so they don't bleed into intermediate-stage inspection. */}
          {(selectedStageId === null || selectedStageId === FINAL_STAGE) && (
            <ResultsList response={response} />
          )}
        </aside>
      </main>
    </div>
  )
}

function extractMessage(err: unknown): string | null {
  if (err instanceof Error) return err.message
  if (typeof err === 'object' && err !== null) {
    const maybe = err as { response?: { data?: { detail?: string } }; message?: string }
    return maybe.response?.data?.detail ?? maybe.message ?? null
  }
  return null
}
