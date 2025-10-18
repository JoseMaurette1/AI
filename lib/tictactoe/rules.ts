import type { Board, CellIndex, Player } from './types'

export const WIN_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

export const getWinner = (
  board: Board
): { winner: Player; line: number[] } | null => {
  for (const [a, b, c] of WIN_LINES) {
    const v = board[a]
    if (v && v === board[b] && v === board[c]) {
      return { winner: v, line: [a, b, c] }
    }
  }
  return null
}

export const getWinningLine = (board: Board): number[] | null => {
  const res = getWinner(board)
  return res ? res.line : null
}

export const getAvailableMoves = (board: Board): CellIndex[] => {
  const result: CellIndex[] = []
  for (let i = 0; i < 9; i++) {
    if (!board[i]) result.push(i as CellIndex)
  }
  return result
}

export const isDraw = (board: Board): boolean => {
  return !getWinner(board) && getAvailableMoves(board).length === 0
}

export const evaluateBoard = (board: Board, ai: Player): number => {
  const w = getWinner(board)
  if (!w) return 0
  return w.winner === ai ? 10 : -10
}


