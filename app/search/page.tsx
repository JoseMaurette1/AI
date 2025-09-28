"use client"
import React, { useCallback } from 'react';
import PuzzleControls from '@/components/PuzzleControls';
import PuzzleImageUploader from '@/components/PuzzleImageUploader';
import { Move, SearchAlgorithm } from '@/lib/puzzle-types';
import { usePuzzleGame } from './hooks/usePuzzleGame';
import { usePuzzleSolver } from './hooks/usePuzzleSolver';
import { useSolutionPlayback } from './hooks/useSolutionPlayback';
import GameBoard from './components/GameBoard';
import GameHeader from './components/GameHeader';
import SearchResultsCard from './components/SearchResultsCard';

const SearchPage = () => {
  const puzzleGame = usePuzzleGame();
  const puzzleSolver = usePuzzleSolver();
  const playback = useSolutionPlayback(
    puzzleSolver.solution,
    puzzleGame.currentBoard,
    puzzleGame.setCurrentBoard
  );

  const handleMove = useCallback((move: Move) => {
    puzzleGame.handleMove(
      move,
      playback.isPlaying || puzzleSolver.isSolving,
      puzzleSolver.clearSolution
    );
  }, [puzzleGame, playback.isPlaying, puzzleSolver]);

  const handleShuffle = useCallback(() => {
    puzzleGame.handleShuffle(puzzleSolver.clearAll);
  }, [puzzleGame, puzzleSolver]);

  const handleReset = useCallback(() => {
    puzzleGame.handleReset(puzzleSolver.clearAll);
  }, [puzzleGame, puzzleSolver]);

  const handleSolve = useCallback((algorithm: SearchAlgorithm, heuristic?: string) => {
    puzzleSolver.handleSolve(puzzleGame.currentBoard, algorithm, heuristic);
  }, [puzzleSolver, puzzleGame.currentBoard]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <GameHeader />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-2 flex flex-col items-center space-y-6">
            <GameBoard
              board={puzzleGame.currentBoard}
              onMove={handleMove}
              disabled={playback.isPlaying || puzzleSolver.isSolving}
              isSolved={puzzleGame.isSolved}
              imageTiles={puzzleGame.imageTiles}
            />

            <SearchResultsCard searchResults={puzzleSolver.searchResults} />
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <PuzzleImageUploader
              onImageSelect={puzzleGame.handleImageSelect}
              currentImage={puzzleGame.imageUrl}
            />

            <PuzzleControls
              onShuffle={handleShuffle}
              onReset={handleReset}
              onSolve={handleSolve}
              onPlay={playback.handlePlay}
              onPause={playback.handlePause}
              onStop={playback.handleStop}
              onPrevStep={playback.handlePrevStep}
              onNextStep={playback.handleNextStep}
              isPlaying={playback.isPlaying}
              isSolving={puzzleSolver.isSolving}
              hasSolution={puzzleSolver.solution.length > 0}
              canStep={puzzleSolver.solution.length > 0}
              currentStep={playback.playbackIndex}
              totalSteps={puzzleSolver.solution.length}
              selectedAlgorithm={puzzleSolver.selectedAlgorithm}
              selectedHeuristic={puzzleSolver.selectedHeuristic}
              onAlgorithmChange={puzzleSolver.setSelectedAlgorithm}
              onHeuristicChange={puzzleSolver.setSelectedHeuristic}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;