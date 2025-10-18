import type { AlgorithmType, Board, Player, SearchProgress, SearchResult } from '@/lib/tictactoe/types'

export type WorkerInMessage =
  | {
      type: 'SEARCH'
      board: Board
      current: Player
      ai: Player
      algorithm: AlgorithmType
      depthLimit?: number
    }

export type WorkerOutMessage =
  | { type: 'PROGRESS'; data: SearchProgress }
  | { type: 'RESULT'; data: SearchResult }
  | { type: 'ERROR'; message: string }


