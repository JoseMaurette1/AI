import { useEffect, useRef, useState, useCallback } from 'react'
import type { AlgorithmType, Board, GameMode, Player, SearchProgress, SearchResult } from '@/lib/tictactoe/types'
import { getWinner, isDraw } from '@/lib/tictactoe/rules'
import { nextPlayer } from '@/lib/tictactoe/engine'
import type { WorkerOutMessage } from '../workers/messages'

type ProgressBySide = Record<Player, SearchProgress | null>
type ResultBySide = Record<Player, SearchResult | null>

export const useGameController = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [current, setCurrent] = useState<Player>('X')
  const [mode, setMode] = useState<GameMode>('HUMAN_HUMAN')
  const [algoX, setAlgoX] = useState<AlgorithmType>('ALPHABETA')
  const [algoO, setAlgoO] = useState<AlgorithmType>('MINIMAX')
  const [humanPlaysAs, setHumanPlaysAs] = useState<Player>('X')
  const [aiProgress, setAiProgress] = useState<ProgressBySide>({ X: null, O: null })
  const [aiResult, setAiResult] = useState<ResultBySide>({ X: null, O: null })
  const [isThinking, setIsThinking] = useState(false)
  const [autoPlay, setAutoPlay] = useState<{ enabled: boolean; paused: boolean; speedMs: number }>({ enabled: false, paused: false, speedMs: 400 })

  const workerRef = useRef<Worker | null>(null)
  useEffect(() => {
    const w = new Worker(new URL('../workers/ai.worker.ts', import.meta.url))
    workerRef.current = w
    const handler = (e: MessageEvent<WorkerOutMessage>) => {
      const msg = e.data
      if (msg.type === 'PROGRESS') {
        setAiProgress((prev) => ({ ...prev, [current]: msg.data }))
      } else if (msg.type === 'RESULT') {
        setAiResult((prev) => ({ ...prev, [current]: msg.data }))
        setIsThinking(false)
        const move = msg.data.move
        setBoard((prev) => {
          if (prev[move]) return prev
          const next = prev.slice()
          next[move] = current
          return next
        })
        setCurrent((p) => nextPlayer(p))
      }
    }
    w.addEventListener('message', handler)
    return () => {
      w.removeEventListener('message', handler)
      w.terminate()
    }
  }, [current])

  const currentIsAI = useCallback((): boolean => {
    if (mode === 'HUMAN_HUMAN') return false
    if (mode === 'HUMAN_AI') return current !== humanPlaysAs
    if (mode === 'AI_AI') return true
    return false
  }, [mode, current, humanPlaysAs])

  // Trigger AI when needed (non AI-vs-AI or when autoplay is off)
  useEffect(() => {
    if (getWinner(board) || isDraw(board)) return
    if (!currentIsAI()) return
    // In AI vs AI with autoplay enabled and not paused, let the autoplay effect control pacing
    if (mode === 'AI_AI' && autoPlay.enabled && !autoPlay.paused) return
    if (!workerRef.current) return
    setIsThinking(true)
    const algo: AlgorithmType = current === 'X' ? algoX : algoO
    workerRef.current.postMessage({ type: 'SEARCH', board, current, ai: current, algorithm: algo })
  }, [board, current, mode, algoX, algoO, humanPlaysAs, autoPlay, currentIsAI])

  // Autoplay pacing: delay search kick-off to visualize moves
  useEffect(() => {
    if (mode !== 'AI_AI') return
    if (!autoPlay.enabled || autoPlay.paused) return
    if (getWinner(board) || isDraw(board)) return
    if (!currentIsAI()) return
    if (isThinking) return
    const t = setTimeout(() => {
      if (!workerRef.current) return
      const algo: AlgorithmType = current === 'X' ? algoX : algoO
      setIsThinking(true)
      workerRef.current.postMessage({ type: 'SEARCH', board, current, ai: current, algorithm: algo })
    }, autoPlay.speedMs)
    return () => clearTimeout(t)
  }, [mode, autoPlay, board, current, isThinking, algoX, algoO, currentIsAI])

  // Default to a slower speed in AI vs AI mode
  useEffect(() => {
    if (mode !== 'AI_AI') return
    if (autoPlay.speedMs !== 800) {
      setAutoPlay((s) => ({ ...s, speedMs: 800 }))
    }
  }, [mode, autoPlay.speedMs, setAutoPlay])

  const handleCellClick = (i: number) => {
    if (isThinking) return
    if (board[i]) return
    if (getWinner(board) || isDraw(board)) return
    if (currentIsAI()) return
    setBoard((prev) => {
      const next = prev.slice()
      next[i] = current
      return next
    })
    setCurrent((p) => nextPlayer(p))
  }

  const restart = () => {
    setBoard(Array(9).fill(null))
    setCurrent('X')
    setAiProgress({ X: null, O: null })
    setAiResult({ X: null, O: null })
    setIsThinking(false)
  }

  return {
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
    winner: getWinner(board),
    draw: isDraw(board),
  }
}


