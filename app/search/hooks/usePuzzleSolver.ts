import { useState, useCallback } from 'react';
import { BoardState, SearchAlgorithm, SearchResult, Move, GOAL_BOARD } from '@/lib/puzzle-types';
import { aStarSearch, bfsSearch, dfsSearch } from '@/lib/search-algorithms';
import { getHeuristic } from '@/lib/heuristics';

export const usePuzzleSolver = () => {
  const [solution, setSolution] = useState<Move[]>([]);
  const [isSolving, setIsSolving] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<SearchAlgorithm>('astar');
  const [selectedHeuristic, setSelectedHeuristic] = useState('manhattan');

  // Solve puzzle
  const handleSolve = useCallback(async (
    currentBoard: BoardState,
    algorithm: SearchAlgorithm,
    heuristic?: string,
    onSolutionFound?: () => void
  ) => {
    setIsSolving(true);

    // Run search in a timeout to allow UI to update
    setTimeout(() => {
      let result: SearchResult;

      switch (algorithm) {
        case 'astar':
          const heuristicFn = getHeuristic(heuristic || 'manhattan');
          result = aStarSearch(currentBoard, GOAL_BOARD, heuristicFn);
          break;
        case 'bfs':
          result = bfsSearch(currentBoard, GOAL_BOARD);
          break;
        case 'dfs':
          result = dfsSearch(currentBoard, GOAL_BOARD, 50);
          break;
        default:
          result = {
            success: false,
            moves: [],
            nodesExpanded: 0,
            pathLength: 0,
            timeElapsed: 0
          };
      }

      setSearchResults(result);
      if (result.success) {
        setSolution(result.moves);
        // Automatically start playing the solution
        if (onSolutionFound) {
          onSolutionFound();
        }
      }
      setIsSolving(false);
    }, 100);
  }, []);

  const clearSolution = useCallback(() => {
    setSolution([]);
    setSearchResults(null);
  }, []);

  const clearAll = useCallback(() => {
    setSolution([]);
    setSearchResults(null);
  }, []);

  return {
    solution,
    isSolving,
    searchResults,
    selectedAlgorithm,
    selectedHeuristic,
    setSelectedAlgorithm,
    setSelectedHeuristic,
    handleSolve,
    clearSolution,
    clearAll,
  };
};
