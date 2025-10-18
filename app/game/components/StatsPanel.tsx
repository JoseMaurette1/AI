import React, { useMemo } from 'react'
import type { AlgorithmType, Player, SearchProgress, SearchResult } from '@/lib/tictactoe/types'

type Props = {
  algoX: AlgorithmType
  algoO: AlgorithmType
  progress: Record<Player, SearchProgress | null>
  result: Record<Player, SearchResult | null>
}

const formatMs = (ms?: number) => {
  if (ms == null) return '—'
  return `${Math.round(ms)} ms`
}

export const StatsPanel: React.FC<Props> = ({ algoX, algoO, progress, result }) => {
  const rows = useMemo(() => {
    const mk = (p: Player, algo: AlgorithmType) => {
      const prog = progress[p]
      const res = result[p]
      const nodesVisited = prog?.nodesVisited ?? res?.metrics.nodesVisited ?? 0
      const nodesPruned = prog?.nodesPruned ?? res?.metrics.nodesPruned ?? 0
      const elapsedMs = prog?.elapsedMs ?? (res && res.metrics.finishedAt && res.metrics.startedAt != null ? res.metrics.finishedAt - res.metrics.startedAt : undefined)
      const prunePct = algo === 'ALPHABETA' ? (nodesVisited + nodesPruned > 0 ? Math.round((nodesPruned / (nodesVisited + nodesPruned)) * 100) : 0) : null
      return { side: p, algo, nodesVisited, nodesPruned, elapsedMs, prunePct }
    }
    return [mk('X', algoX), mk('O', algoO)]
  }, [algoX, algoO, progress, result])

  return (
    <div className="rounded-md border border-border bg-card text-foreground p-3 shadow-xs">
      <h3 className="font-semibold mb-2">Performance</h3>
      <div className="grid grid-cols-5 gap-2 text-sm font-medium">
        <div>Side</div>
        <div>Algorithm</div>
        <div>Decision Time</div>
        <div>Nodes</div>
        <div>Pruned%</div>
      </div>
      <div className="mt-1 space-y-1">
        {rows.map((r) => (
          <div key={r.side} className="grid grid-cols-5 gap-2 text-sm">
            <div>{r.side}</div>
            <div>{r.algo}</div>
            <div>{formatMs(r.elapsedMs)}</div>
            <div>{r.nodesVisited}</div>
            <div>{r.prunePct == null ? '—' : `${r.prunePct}%`}</div>
          </div>
        ))}
      </div>
    </div>
  )
}


