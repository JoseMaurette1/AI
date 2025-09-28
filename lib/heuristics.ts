import { BoardState, Heuristic } from './puzzle-types';
import { getPosition } from './puzzle-utils';


export const hManhattan: Heuristic = (board: BoardState): number => {
  let sum = 0;
  
  for (let i = 0; i < 9; i++) {
    const value = board[i];
    if (value === 0) continue; 
    
    const goalIndex = value - 1;
    
    const [currentRow, currentCol] = getPosition(i);
    const [goalRow, goalCol] = getPosition(goalIndex);
    
    sum += Math.abs(currentRow - goalRow) + Math.abs(currentCol - goalCol);
  }
  
  return sum;
};

export const getHeuristic = (name: string): Heuristic => {
  return hManhattan;
};

export const HEURISTICS = [
  { name: 'manhattan', label: 'Manhattan Distance', description: 'Sum of distances to goal positions' },
] as const;
