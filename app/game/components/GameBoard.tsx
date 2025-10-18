import React from 'react'
import type { Board } from '@/lib/tictactoe/types'

type Props = {
  board: Board
  onCellClick: (i: number) => void
  winningCells?: number[] | null
  disabled?: boolean
}

export const GameBoard: React.FC<Props> = ({ board, onCellClick, winningCells, disabled }) => {
  return (
    <div className="grid grid-cols-3 gap-2 w-64 sm:w-72">
      {board.map((cell, i) => {
        const isWin = winningCells?.includes(i) ?? false
        return (
          <button
            key={i}
            onClick={() => onCellClick(i)}
            disabled={disabled || Boolean(cell)}
            className={[
              'aspect-square rounded-md border border-border bg-card text-foreground flex items-center justify-center text-3xl sm:text-4xl font-semibold',
              'transition-colors',
              disabled || cell ? 'cursor-not-allowed' : 'hover:bg-accent hover:text-accent-foreground cursor-pointer',
              isWin ? 'bg-accent ring-2 ring-ring' : 'bg-card',
            ].join(' ')}
          >
            <span className={cell === 'X' ? 'text-primary' : 'text-destructive'}>{cell ?? ''}</span>
          </button>
        )
      })}
    </div>
  )
}


