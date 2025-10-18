import React from 'react'
import type { Player } from '@/lib/tictactoe/types'

type Props = {
  current: Player
  winner: { winner: Player; line: number[] } | null
  draw: boolean
}

export const TurnBanner: React.FC<Props> = ({ current, winner, draw }) => {
  if (winner) {
    return <div className="text-green-700 font-semibold">Winner: {winner.winner}</div>
  }
  if (draw) {
    return <div className="text-gray-700 font-semibold">Draw</div>
  }
  return <div className="text-white">Turn: <span className={current === 'X' ? 'text-blue-600 font-semibold' : 'text-rose-600 font-semibold'}>{current}</span></div>
}


