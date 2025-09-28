import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { BoardState, Move } from '@/lib/puzzle-types';
import { formatTileValue, isValidMove, applyMove } from '@/lib/puzzle-utils';
// Revert to native img for tile rendering

interface PuzzleGridProps {
  board: BoardState;
  onMove?: (move: Move) => void;
  disabled?: boolean;
  tileImages?: Record<number, string>;
  className?: string;
}

const PuzzleGrid: React.FC<PuzzleGridProps> = ({
  board,
  onMove,
  disabled = false,
  tileImages,
  className
}) => {
  const handleTileClick = useCallback((tileIndex: number) => {
    if (disabled || !onMove) return;

    const tileValue = board[tileIndex];
    if (tileValue === 0) return; // Can't click the blank tile

    // Find the blank tile
    const blankIndex = board.indexOf(0);
    const [tileRow, tileCol] = [Math.floor(tileIndex / 3), tileIndex % 3];
    const [blankRow, blankCol] = [Math.floor(blankIndex / 3), blankIndex % 3];

    // Determine the move needed to swap this tile with blank
    let move: Move | null = null;
    
    if (tileRow === blankRow) {
      // Same row
      if (tileCol === blankCol - 1) move = 'right'; // Tile is left of blank
      else if (tileCol === blankCol + 1) move = 'left'; // Tile is right of blank
    } else if (tileCol === blankCol) {
      // Same column
      if (tileRow === blankRow - 1) move = 'down'; // Tile is above blank
      else if (tileRow === blankRow + 1) move = 'up'; // Tile is below blank
    }

    if (move && isValidMove(board, move)) {
      onMove(move);
    }
  }, [board, onMove, disabled]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled || !onMove) return;

    let move: Move | null = null;
    switch (event.key) {
      case 'ArrowUp': move = 'up'; break;
      case 'ArrowDown': move = 'down'; break;
      case 'ArrowLeft': move = 'left'; break;
      case 'ArrowRight': move = 'right'; break;
      default: return;
    }

    event.preventDefault();
    if (isValidMove(board, move)) {
      onMove(move);
    }
  }, [board, onMove, disabled]);

  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-1 w-80 h-80 p-4 bg-card rounded-lg border-2 border-border",
        "focus:outline-none focus:ring-2 focus:ring-ring",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="grid"
      aria-label="8-puzzle game board"
    >
      {board.map((tileValue, index) => {
        const isEmpty = tileValue === 0;
        const displayValue = formatTileValue(tileValue);
        const tileImage = tileImages?.[tileValue];

        return (
          <div
            key={index}
            className={cn(
              "aspect-square flex items-center justify-center text-2xl font-bold rounded-md transition-all duration-200",
              isEmpty
                ? "bg-muted border-2 border-dashed border-muted-foreground/30"
                : "bg-background border-2 border-border shadow-md hover:shadow-lg cursor-pointer transform hover:scale-105 text-foreground",
              !disabled && !isEmpty && "hover:bg-accent active:scale-95",
              disabled && "cursor-not-allowed"
            )}
            onClick={() => handleTileClick(index)}
            role="gridcell"
            aria-label={isEmpty ? "Empty space" : `Tile ${displayValue}`}
            tabIndex={-1}
          >
            {tileImage ? (
              <img
                src={tileImage}
                alt={`Tile ${displayValue}`}
                className="w-full h-full object-cover rounded-sm"
                draggable={false}
              />
            ) : (
              <span className={cn("select-none", isEmpty && "invisible")}>
                {displayValue}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PuzzleGrid;
