import type { Board, CellIndex, Metrics, Player, SearchOptions, SearchProgress, SearchResult } from './types'
import { evaluateBoard, getAvailableMoves, getWinner, isDraw } from './rules'
import { nextPlayer } from './engine'

type Ctx = {
  metrics: Metrics
  onProgress?: (p: SearchProgress) => void
  reportEvery: number
  startTime: number
  depthLimit?: number
  ai: Player
}

const now = (): number => (typeof performance !== 'undefined' ? performance.now() : Date.now())

const minimax = (
  board: Board,
  current: Player,
  ai: Player,
  depth: number,
  ctx: Ctx
): number => {
  ctx.metrics.nodesVisited++
  if (ctx.metrics.nodesVisited % ctx.reportEvery === 0) {
    ctx.onProgress?.({
      nodesVisited: ctx.metrics.nodesVisited,
      nodesPruned: 0,
      depthReached: Math.max(ctx.metrics.depthReached, depth),
      elapsedMs: now() - ctx.startTime,
    })
  }

  const winner = getWinner(board)
  if (winner || isDraw(board) || (ctx.depthLimit !== undefined && depth >= ctx.depthLimit)) {
    return evaluateBoard(board, ai)
  }

  ctx.metrics.depthReached = Math.max(ctx.metrics.depthReached, depth)

  const moves = getAvailableMoves(board)
  const isMax = current === ai
  let best = isMax ? -Infinity : Infinity

  for (const move of moves) {
    const next = board.slice()
    next[move] = current
    const score = minimax(next, nextPlayer(current), ai, depth + 1, ctx)
    best = isMax ? Math.max(best, score) : Math.min(best, score)
  }

  return best
}

export const minimaxBestMove = (
  board: Board,
  current: Player,
  ai: Player,
  opts: Partial<SearchOptions> & { onProgress?: (p: SearchProgress) => void } = {}
): SearchResult => {
  const start = now()
  const metrics: Metrics = {
    nodesVisited: 0,
    nodesPruned: 0,
    startedAt: start,
    depthReached: 0,
  }
  const ctx: Ctx = {
    metrics,
    onProgress: opts.onProgress,
    reportEvery: 100,
    startTime: start,
    depthLimit: opts.depthLimit,
    ai,
  }
  const moves = getAvailableMoves(board)
  let bestMove = moves[0] as CellIndex
  let bestScore = -Infinity
  for (const move of moves) {
    const next = board.slice()
    next[move] = current
    const score = minimax(next, nextPlayer(current), ai, 1, ctx)
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }
  metrics.finishedAt = now()
  return { move: bestMove, score: bestScore, metrics }
}


