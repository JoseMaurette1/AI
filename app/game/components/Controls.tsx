import React from 'react'
import { Button } from '@/components/ui/button'
import type { AlgorithmType, GameMode, Player } from '@/lib/tictactoe/types'

type Props = {
  mode: GameMode
  onModeChange: (m: GameMode) => void
  algoX: AlgorithmType
  onAlgoXChange: (a: AlgorithmType) => void
  algoO: AlgorithmType
  onAlgoOChange: (a: AlgorithmType) => void
  humanPlaysAs: Player
  onHumanPlaysAsChange: (p: Player) => void
  onRestart: () => void
}

export const Controls: React.FC<Props> = ({
  mode,
  onModeChange,
  algoX,
  onAlgoXChange,
  algoO,
  onAlgoOChange,
  humanPlaysAs,
  onHumanPlaysAsChange,
  onRestart,
}) => {
  const isHumanVsAi = mode === 'HUMAN_AI'
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-foreground">Mode</label>
          <select
            className="mt-1 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
            value={mode}
            onChange={(e) => onModeChange(e.target.value as GameMode)}
          >
            <option value="HUMAN_HUMAN">Human vs Human</option>
            <option value="HUMAN_AI">Human vs AI</option>
            <option value="AI_AI">AI vs AI</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Human plays as</label>
          <select
            className="mt-1 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
            value={humanPlaysAs}
            onChange={(e) => onHumanPlaysAsChange(e.target.value as Player)}
          >
            <option value="X">X (first)</option>
            <option value="O">O (second)</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-foreground">Algorithm for X</label>
          <select
            className="mt-1 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isHumanVsAi}
            value={algoX}
            onChange={(e) => onAlgoXChange(e.target.value as AlgorithmType)}
          >
            <option value="ALPHABETA">Alpha-Beta</option>
            <option value="MINIMAX">Minimax</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Algorithm for O</label>
          <select
            className="mt-1 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
            value={algoO}
            onChange={(e) => onAlgoOChange(e.target.value as AlgorithmType)}
          >
            <option value="ALPHABETA">Alpha-Beta</option>
            <option value="MINIMAX">Minimax</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={onRestart} variant="default" size="default">
          Restart
        </Button>
      </div>
    </div>
  )
}


