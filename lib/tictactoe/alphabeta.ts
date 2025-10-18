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

const alphabeta = (
  board: Board,
  current: Player,
  ai: Player,
  depth: number,
  alphaIn: number,
  betaIn: number,
  ctx: Ctx
): number => {
  ctx.metrics.nodesVisited++
  if (ctx.metrics.nodesVisited % ctx.reportEvery === 0) {
    ctx.onProgress?.({
      nodesVisited: ctx.metrics.nodesVisited,
      nodesPruned: ctx.metrics.nodesPruned,
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
  let alpha = alphaIn
  let beta = betaIn

  if (current === ai) {
    let value = -Infinity
    for (let i = 0; i < moves.length; i++) {
      const move = moves[i]!
      const next = board.slice()
      next[move] = current
      value = Math.max(value, alphabeta(next, nextPlayer(current), ai, depth + 1, alpha, beta, ctx))
      alpha = Math.max(alpha, value)
      if (alpha >= beta) {
        ctx.metrics.nodesPruned += moves.length - (i + 1)
        break
      }
    }
    return value
  } else {
    let value = Infinity
    for (let i = 0; i < moves.length; i++) {
      const move = moves[i]!
      const next = board.slice()
      next[move] = current
      value = Math.min(value, alphabeta(next, nextPlayer(current), ai, depth + 1, alpha, beta, ctx))
      beta = Math.min(beta, value)
      if (alpha >= beta) {
        ctx.metrics.nodesPruned += moves.length - (i + 1)
        break
      }
    }
    return value
  }
}

export const alphaBetaBestMove = (
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
  const alpha = -Infinity
  const beta = Infinity
  for (const move of moves) {
    const next = board.slice()
    next[move] = current
    const score = alphabeta(next, nextPlayer(current), ai, 1, alpha, beta, ctx)
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }
  metrics.finishedAt = now()
  return { move: bestMove, score: bestScore, metrics }
}


