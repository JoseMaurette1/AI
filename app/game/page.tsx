"use client"
import React from 'react'
import { GameBoard } from './components/GameBoard'
import { Controls } from './components/Controls'
import { StatsPanel } from './components/StatsPanel'
import { TurnBanner } from './components/TurnBanner'
import { AutoPlayControls } from './components/AutoPlayControls'
import { useGameController } from './hooks/useGameController'
import { getWinningLine } from '@/lib/tictactoe/rules'
export default function GamePage() {
  const {
    board,
    current,
    mode,
    setMode,
    algoX,
    setAlgoX,
    algoO,
    setAlgoO,
    humanPlaysAs,
    setHumanPlaysAs,
    aiProgress,
    aiResult,
    isThinking,
    autoPlay,
    setAutoPlay,
    handleCellClick,
    restart,
    winner,
    draw,
  } = useGameController()

  const winningCells = getWinningLine(board)

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Tic-Tac-Toe with Minimax & Alpha-Beta</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="space-y-3">
          <TurnBanner current={current} winner={winner} draw={draw} />
          <GameBoard board={board} onCellClick={handleCellClick} winningCells={winningCells} disabled={isThinking} />
        </div>
        <div className="md:col-span-2 space-y-4">
          <Controls
            mode={mode}
            onModeChange={setMode}
            algoX={algoX}
            onAlgoXChange={setAlgoX}
            algoO={algoO}
            onAlgoOChange={setAlgoO}
            humanPlaysAs={humanPlaysAs}
            onHumanPlaysAsChange={setHumanPlaysAs}
            onRestart={restart}
          />
          <StatsPanel algoX={algoX} algoO={algoO} progress={aiProgress} result={aiResult} />
          <AutoPlayControls
            enabled={autoPlay.enabled}
            paused={autoPlay.paused}
            speedMs={autoPlay.speedMs}
            onToggleEnabled={() => setAutoPlay((s) => ({ ...s, enabled: !s.enabled }))}
            onTogglePaused={() => setAutoPlay((s) => ({ ...s, paused: !s.paused }))}
            onSpeedChange={(ms) => setAutoPlay((s) => ({ ...s, speedMs: ms }))}
          />
        </div>
      </div>
    </div>
  )
}


