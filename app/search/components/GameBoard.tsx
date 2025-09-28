import React from 'react';
import PuzzleGrid from '@/components/PuzzleGrid';
import { BoardState, Move } from '@/lib/puzzle-types';

interface GameBoardProps {
  board: BoardState;
  onMove: (move: Move) => void;
  disabled: boolean;
  isSolved: boolean;
  imageTiles?: string[];
}

const GameBoard: React.FC<GameBoardProps> = ({
  board,
  onMove,
  disabled,
  isSolved,
  imageTiles
}) => {
  // Convert imageTiles array to tileImages record for PuzzleGrid
  const tileImages = imageTiles && imageTiles.length > 0 ? {
    1: imageTiles[0],
    2: imageTiles[1], 
    3: imageTiles[2],
    4: imageTiles[3],
    5: imageTiles[4],
    6: imageTiles[5],
    7: imageTiles[6],
    8: imageTiles[7],
    // 0 (blank) has no image
  } : undefined;

  return (
    <div className="flex flex-col items-center space-y-6">
      <PuzzleGrid
        board={board}
        onMove={onMove}
        disabled={disabled}
        tileImages={tileImages}
      />
      
      {isSolved && (
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">🎉 Puzzle Solved! 🎉</div>
          <p className="text-gray-600 dark:text-gray-400">Congratulations! You solved the puzzle.</p>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
