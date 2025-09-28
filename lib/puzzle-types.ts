export type TileValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type BoardState = Readonly<[
  TileValue, TileValue, TileValue,
  TileValue, TileValue, TileValue,
  TileValue, TileValue, TileValue
]>;

export type Move = 'up' | 'down' | 'left' | 'right';

export type SearchNode = {
  board: BoardState;
  parentKey: string | null;
  move: Move | null;
  gCost: number;
  hCost: number;
};

export type Heuristic = (board: BoardState) => number;

export type SearchAlgorithm = 'astar' | 'bfs' | 'dfs';

export type SearchResult = {
  success: boolean;
  moves: Move[];
  nodesExpanded: number;
  pathLength: number;
  timeElapsed: number;
  maxDepth?: number;
};

export type PuzzleState = {
  currentBoard: BoardState;
  goalBoard: BoardState;
  history: BoardState[];
  solution: Move[];
  playbackIndex: number;
  isPlaying: boolean;
  isSolved: boolean;
};

// Goal state: [1,2,3,4,5,6,7,8,0]
export const GOAL_BOARD: BoardState = [1, 2, 3, 4, 5, 6, 7, 8, 0] as const;
