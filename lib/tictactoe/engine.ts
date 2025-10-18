import type { Board, CellIndex, Player } from './types'
import { getWinningLine } from './rules'

export const nextPlayer = (p: Player): Player => (p === 'X' ? 'O' : 'X')

export const applyMove = (
  board: Board,
  index: CellIndex,
  player: Player
): Board => {
  if (board[index]) return board
  const next = board.slice()
  next[index] = player
  return next
}

export const getWinningCells = (board: Board): number[] | null => {
  return getWinningLine(board)
}


