import { useState, useCallback, useEffect } from 'react';
import { BoardState, Move } from '@/lib/puzzle-types';
import { applyMove } from '@/lib/puzzle-utils';

export const useSolutionPlayback = (
  solution: Move[],
  currentBoard: BoardState,
  setCurrentBoard: (board: BoardState) => void
) => {
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed] = useState(500); // ms per step

  // Auto-play solution
  useEffect(() => {
    if (!isPlaying || playbackIndex >= solution.length) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      const move = solution[playbackIndex];
      const newBoard = applyMove(currentBoard, move);
      if (newBoard) {
        setCurrentBoard(newBoard);
        setPlaybackIndex(prev => prev + 1);
      }
    }, playbackSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, playbackIndex, solution, currentBoard, playbackSpeed, setCurrentBoard]);

  // Reset playback when solution changes
  useEffect(() => {
    setPlaybackIndex(0);
    // Auto-start playback when a new solution is available
    setIsPlaying(solution.length > 0);
  }, [solution]);

  // Playback controls
  const handlePlay = useCallback(() => {
    if (solution.length === 0) return;
    setIsPlaying(true);
  }, [solution.length]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleStop = useCallback(() => {
    setIsPlaying(false);
    setPlaybackIndex(0);
  }, []);

  const handlePrevStep = useCallback(() => {
    if (playbackIndex > 0) {
      setPlaybackIndex(prev => Math.max(0, prev - 1));
    }
  }, [playbackIndex]);

  const handleNextStep = useCallback(() => {
    if (playbackIndex < solution.length) {
      const move = solution[playbackIndex];
      const newBoard = applyMove(currentBoard, move);
      if (newBoard) {
        setCurrentBoard(newBoard);
        setPlaybackIndex(prev => prev + 1);
      }
    }
  }, [playbackIndex, solution, currentBoard, setCurrentBoard]);

  return {
    playbackIndex,
    isPlaying,
    handlePlay,
    handlePause,
    handleStop,
    handlePrevStep,
    handleNextStep,
  };
};
