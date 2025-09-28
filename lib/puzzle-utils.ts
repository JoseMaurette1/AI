import { BoardState, Move, GOAL_BOARD, TileValue } from './puzzle-types';

/**
 * Get the key representation of a board state for hashing
 */
export const getBoardKey = (board: BoardState): string => board.join(',');

/**
 * Check if a board state is solvable
 * For 3x3 puzzle, count inversions (ignore 0). Solvable if inversion count is even.
 */
export const isSolvable = (board: BoardState): boolean => {
  const arr = board.filter(v => v !== 0);
  let inversions = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] > arr[j]) inversions++;
    }
  }
  return inversions % 2 === 0;
};

/**
 * Check if board is in goal state
 */
export const isGoalState = (board: BoardState): boolean => {
  return getBoardKey(board) === getBoardKey(GOAL_BOARD);
};

/**
 * Get position (row, col) from flat index
 */
export const getPosition = (index: number): [number, number] => {
  return [Math.floor(index / 3), index % 3];
};

/**
 * Get flat index from position (row, col)
 */
export const getIndex = (row: number, col: number): number => {
  return row * 3 + col;
};

/**
 * Get the blank tile position
 */
export const getBlankPosition = (board: BoardState): number => {
  return board.indexOf(0);
};

/**
 * Check if a move is valid from current blank position
 */
export const isValidMove = (board: BoardState, move: Move): boolean => {
  const blankIndex = getBlankPosition(board);
  const [row, col] = getPosition(blankIndex);
  
  switch (move) {
    case 'up': return row > 0;
    case 'down': return row < 2;
    case 'left': return col > 0;
    case 'right': return col < 2;
    default: return false;
  }
};

/**
 * Apply a move to the board and return new board state
 */
export const applyMove = (board: BoardState, move: Move): BoardState | null => {
  if (!isValidMove(board, move)) return null;
  
  const blankIndex = getBlankPosition(board);
  const [row, col] = getPosition(blankIndex);
  let targetIndex: number;
  
  switch (move) {
    case 'up': targetIndex = getIndex(row - 1, col); break;
    case 'down': targetIndex = getIndex(row + 1, col); break;
    case 'left': targetIndex = getIndex(row, col - 1); break;
    case 'right': targetIndex = getIndex(row, col + 1); break;
    default: return null;
  }
  
  const newBoard = [...board] as TileValue[];
  [newBoard[blankIndex], newBoard[targetIndex]] = [newBoard[targetIndex], newBoard[blankIndex]];
  return newBoard as unknown as BoardState;
};

/**
 * Generate all valid neighbors from current board state
 */
export const getNeighbors = (board: BoardState): Array<{ board: BoardState; move: Move }> => {
  const neighbors: Array<{ board: BoardState; move: Move }> = [];
  const moves: Move[] = ['up', 'down', 'left', 'right'];
  
  for (const move of moves) {
    const newBoard = applyMove(board, move);
    if (newBoard) {
      neighbors.push({ board: newBoard, move });
    }
  }
  
  return neighbors;
};

/**
 * Generate a random solvable board state
 */
export const generateRandomSolvableBoard = (): BoardState => {
  let board: BoardState;
  do {
    // Start with goal and apply random moves
    board = [...GOAL_BOARD] as BoardState;
    
    // Apply 1000 random moves to ensure good shuffling
    for (let i = 0; i < 1000; i++) {
      const neighbors = getNeighbors(board);
      if (neighbors.length > 0) {
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        board = randomNeighbor.board;
      }
    }
  } while (!isSolvable(board) || isGoalState(board));
  
  return board;
};

/**
 * Convert board position to display format (1-indexed, blank as empty)
 */
export const formatTileValue = (value: TileValue): string => {
  return value === 0 ? '' : value.toString();
};

/**
 * Get opposite move direction
 */
export const getOppositeMove = (move: Move): Move => {
  switch (move) {
    case 'up': return 'down';
    case 'down': return 'up';
    case 'left': return 'right';
    case 'right': return 'left';
  }
};
