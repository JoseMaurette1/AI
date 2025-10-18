/// <reference lib="webworker" />
import { alphaBetaBestMove } from '@/lib/tictactoe/alphabeta'
import { minimaxBestMove } from '@/lib/tictactoe/minimax'
import type { WorkerInMessage, WorkerOutMessage } from './messages'

declare const self: DedicatedWorkerGlobalScope

self.onmessage = (e: MessageEvent<WorkerInMessage>) => {
  const msg = e.data
  try {
    if (msg.type === 'SEARCH') {
      const { board, current, ai, algorithm, depthLimit } = msg
      if (algorithm === 'ALPHABETA') {
        const result = alphaBetaBestMove(board, current, ai, {
          depthLimit,
          onProgress: (data) => {
            const out: WorkerOutMessage = { type: 'PROGRESS', data }
            self.postMessage(out)
          },
        })
        const out: WorkerOutMessage = { type: 'RESULT', data: result }
        self.postMessage(out)
      } else {
        const result = minimaxBestMove(board, current, ai, {
          depthLimit,
          onProgress: (data) => {
            const out: WorkerOutMessage = { type: 'PROGRESS', data }
            self.postMessage(out)
          },
        })
        const out: WorkerOutMessage = { type: 'RESULT', data: result }
        self.postMessage(out)
      }
    }
  } catch (err) {
    const out: WorkerOutMessage = { type: 'ERROR', message: (err as Error).message }
    self.postMessage(out)
  }
}

export {}


