export type Player = 'X' | 'O'

export type CellIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export type Board = (Player | null)[]

export type GameMode = 'HUMAN_HUMAN' | 'HUMAN_AI' | 'AI_AI'

export type AlgorithmType = 'MINIMAX' | 'ALPHABETA'

export interface Metrics {
  nodesVisited: number
  nodesPruned: number
  startedAt: number
  finishedAt?: number
  depthReached: number
}

export interface SearchProgress {
  nodesVisited: number
  nodesPruned: number
  depthReached: number
  elapsedMs: number
}

export interface SearchResult {
  move: CellIndex
  score: number
  metrics: Metrics
}

export interface SearchOptions {
  algorithm: AlgorithmType
  aiPlayer: Player
  depthLimit?: number
  moveOrdering?: boolean
}


