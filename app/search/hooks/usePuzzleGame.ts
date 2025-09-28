import { useState, useCallback, useEffect } from 'react';
import { BoardState, Move, GOAL_BOARD } from '@/lib/puzzle-types';
import { generateRandomSolvableBoard, applyMove, isGoalState } from '@/lib/puzzle-utils';

export const usePuzzleGame = () => {
  const [currentBoard, setCurrentBoard] = useState<BoardState>(GOAL_BOARD);
  const [history, setHistory] = useState<BoardState[]>([]);
  const [isSolved, setIsSolved] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageTiles, setImageTiles] = useState<string[]>([]);

  // Initialize with shuffled board on client-side only (after hydration)
  useEffect(() => {
    // Only shuffle on initial mount to avoid hydration mismatch
    if (currentBoard === GOAL_BOARD && typeof window !== 'undefined') {
      const shuffledBoard = generateRandomSolvableBoard();
      setCurrentBoard(shuffledBoard);
    }
  }, []); // Empty dependency array - only run once on mount

  // Check if puzzle is solved
  useEffect(() => {
    setIsSolved(isGoalState(currentBoard));
  }, [currentBoard]);

  // Manual move handler
  const handleMove = useCallback((move: Move, isPlayingOrSolving: boolean, clearSolution: () => void) => {
    if (isPlayingOrSolving) return;

    const newBoard = applyMove(currentBoard, move);
    if (newBoard) {
      setHistory(prev => [...prev, currentBoard]);
      setCurrentBoard(newBoard);
      clearSolution();
    }
  }, [currentBoard]);

  // Handle image selection
  const handleImageSelect = useCallback((imageUrl: string, tiles: string[]) => {
    setImageUrl(imageUrl);
    setImageTiles(tiles);
    // Start with a shuffled puzzle when new image is selected
    const shuffledBoard = generateRandomSolvableBoard();
    setCurrentBoard(shuffledBoard);
    setHistory([]);
  }, []);

  // Shuffle puzzle
  const handleShuffle = useCallback((clearAll: () => void) => {
    const newBoard = generateRandomSolvableBoard();
    setCurrentBoard(newBoard);
    setHistory([]);
    clearAll();
  }, []);

  // Reset to goal state
  const handleReset = useCallback((clearAll: () => void) => {
    setCurrentBoard(GOAL_BOARD);
    setHistory([]);
    clearAll();
  }, []);

  return {
    currentBoard,
    setCurrentBoard,
    history,
    isSolved,
    imageUrl,
    imageTiles,
    handleMove,
    handleShuffle,
    handleReset,
    handleImageSelect,
  };
};
