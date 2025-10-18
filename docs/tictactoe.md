Tic-Tac-Toe with Minimax & Alpha-Beta

## Quickstart / Usage

- run `./start.sh`

OR

- Install: `npm install`
- Dev: `npm run dev`
- localhost:3000
- Visit: `/game`
- Switch modes/algorithms in the right panel. Enable autoplay for AI vs AI. In Human vs AI, Algorithm for X is disabled by design.

## Overview

This app separates pure game logic in `lib/tictactoe/*` from UI and orchestration in `app/game/*`. Two optimal search algorithms (Minimax and Alpha‑Beta) run in the Web. A controller coordinates modes, AI turns, and an autoplay timer for AI vs AI.

## File map

- Core logic
  - `lib/tictactoe/types.ts`: `Player`, `Board`, `AlgorithmType`, metrics, progress, result
  - `lib/tictactoe/rules.ts`: win lines, winner detection, legal moves, draw, evaluation
  - `lib/tictactoe/engine.ts`: `nextPlayer`, `applyMove`, `getWinningCells`
  - `lib/tictactoe/minimax.ts`: Minimax with metrics and optional depth limiting
  - `lib/tictactoe/alphabeta.ts`: Alpha‑Beta pruning with progress and metrics
- Worker + controller
  - `app/game/workers/messages.ts`: typed worker protocol (SEARCH/PROGRESS/RESULT/ERROR)
  - `app/game/workers/ai.worker.ts`: executes Minimax/Alpha‑Beta and posts updates
  - `app/game/hooks/useGameController.ts`: state, AI triggering, autoplay pacing
- UI components
  - `app/game/components/GameBoard.tsx`, `Controls.tsx`, `AutoPlayControls.tsx`, `StatsPanel.tsx`, `TurnBanner.tsx`

## Algorithms

Minimax explores all game states, maximizing for AI and minimizing for the opponent. It reports metrics and supports a progress callback.

Alpha‑Beta returns the same optimal move as Minimax but prunes branches that cannot affect the outcome; pruning is tracked in `nodesPruned`.

## Worker integration

The UI posts `SEARCH` to `ai.worker.ts`, which runs the selected algorithm and relays `PROGRESS`/`RESULT`.

## Controller logic

`useGameController` manages board state, mode, current player, AI results/progress, and thinking. It triggers AI immediately for AI turns, except in AI vs AI with autoplay enabled where a timer paces moves.

## UI components and theming

- `GameBoard.tsx`: tokenized colors and win highlighting; hover uses `bg-accent`.

- `Controls.tsx`: disables Algorithm for X in Human vs AI; shared `Button`; tokenized selects.

- `AutoPlayControls.tsx`: shared `Button`; speed dropdown reflects `autoPlay.speedMs`.

## Expected outcomes

- With full-depth search, both algorithms play optimally; AI vs AI results in a draw.
- Alpha‑Beta returns the same moves as Minimax while pruning more nodes.
- In AI vs AI, move cadence is governed by `autoPlay.speedMs` (forced to 800 ms).



