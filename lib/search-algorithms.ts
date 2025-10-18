import { BoardState, SearchResult, Move, Heuristic, SearchNode } from './puzzle-types';
import { getBoardKey, isGoalState, isSolvable, getNeighbors } from './puzzle-utils';

class PriorityQueue<T> {
  private items: Array<{ item: T; priority: number }> = [];

  enqueue(item: T, priority: number): void {
    this.items.push({ item, priority });
    this.items.sort((a, b) => a.priority - b.priority);
  }

  dequeue(): T | undefined {
    return this.items.shift()?.item;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }
}

const reconstructPath = (
  parent: Map<string, { parentKey: string | null; move: Move | null }>,
  goalKey: string
): Move[] => {
  const moves: Move[] = [];
  let currentKey: string | null = goalKey;

  while (currentKey && parent.has(currentKey)) {
    const parentInfo: { parentKey: string | null; move: Move | null } = parent.get(currentKey)!;
    if (parentInfo.move) {
      moves.push(parentInfo.move);
    }
    currentKey = parentInfo.parentKey;
  }

  return moves.reverse();
};

// A* Search Algorithm
export const aStarSearch = (
  startBoard: BoardState,
  _goalBoard: BoardState,
  heuristic: Heuristic
): SearchResult => {
  const startTime = Date.now();
  
  if (!isSolvable(startBoard)) {
    return {
      success: false,
      moves: [],
      nodesExpanded: 0,
      pathLength: 0,
      timeElapsed: Date.now() - startTime
    };
  }

  if (isGoalState(startBoard)) {
    return {
      success: true,
      moves: [],
      nodesExpanded: 0,
      pathLength: 0,
      timeElapsed: Date.now() - startTime
    };
  }

  const openQueue = new PriorityQueue<SearchNode>();
  const gScore = new Map<string, number>();
  const parent = new Map<string, { parentKey: string | null; move: Move | null }>();
  const closedSet = new Set<string>();

  const startKey = getBoardKey(startBoard);
  const startHeuristic = heuristic(startBoard);
  const startNode: SearchNode = {
    board: startBoard,
    parentKey: null,
    move: null,
    gCost: 0,
    hCost: startHeuristic
  };

  openQueue.enqueue(startNode, startHeuristic);
  gScore.set(startKey, 0);
  parent.set(startKey, { parentKey: null, move: null });

  let nodesExpanded = 0;

  while (!openQueue.isEmpty()) {
    const currentNode = openQueue.dequeue()!;
    const currentKey = getBoardKey(currentNode.board);

    if (closedSet.has(currentKey)) continue;
    closedSet.add(currentKey);

    nodesExpanded++;

    if (isGoalState(currentNode.board)) {
      const moves = reconstructPath(parent, currentKey);
      return {
        success: true,
        moves,
        nodesExpanded,
        pathLength: moves.length,
        timeElapsed: Date.now() - startTime
      };
    }

    const neighbors = getNeighbors(currentNode.board);
    for (const { board: neighborBoard, move } of neighbors) {
      const neighborKey = getBoardKey(neighborBoard);
      
      if (closedSet.has(neighborKey)) continue;

      const tentativeGScore = currentNode.gCost + 1;
      const currentGScore = gScore.get(neighborKey) ?? Infinity;

      if (tentativeGScore < currentGScore) {
        const neighborHeuristic = heuristic(neighborBoard);
        const fScore = tentativeGScore + neighborHeuristic;

        gScore.set(neighborKey, tentativeGScore);
        parent.set(neighborKey, { parentKey: currentKey, move });

        const neighborNode: SearchNode = {
          board: neighborBoard,
          parentKey: currentKey,
          move,
          gCost: tentativeGScore,
          hCost: neighborHeuristic
        };

        openQueue.enqueue(neighborNode, fScore);
      }
    }
  }

  return {
    success: false,
    moves: [],
    nodesExpanded,
    pathLength: 0,
    timeElapsed: Date.now() - startTime
  };
};

// BFS Search Algorithm
export const bfsSearch = (startBoard: BoardState, _goalBoard: BoardState): SearchResult => {
  const startTime = Date.now();

  if (!isSolvable(startBoard)) {
    return {
      success: false,
      moves: [],
      nodesExpanded: 0,
      pathLength: 0,
      timeElapsed: Date.now() - startTime
    };
  }

  if (isGoalState(startBoard)) {
    return {
      success: true,
      moves: [],
      nodesExpanded: 0,
      pathLength: 0,
      timeElapsed: Date.now() - startTime
    };
  }

  const queue: BoardState[] = [startBoard];
  const visited = new Set<string>();
  const parent = new Map<string, { parentKey: string | null; move: Move | null }>();

  const startKey = getBoardKey(startBoard);
  visited.add(startKey);
  parent.set(startKey, { parentKey: null, move: null });

  let nodesExpanded = 0;

  while (queue.length > 0) {
    const currentBoard = queue.shift()!;
    const currentKey = getBoardKey(currentBoard);
    nodesExpanded++;

    if (isGoalState(currentBoard)) {
      const moves = reconstructPath(parent, currentKey);
      return {
        success: true,
        moves,
        nodesExpanded,
        pathLength: moves.length,
        timeElapsed: Date.now() - startTime
      };
    }

    const neighbors = getNeighbors(currentBoard);
    for (const { board: neighborBoard, move } of neighbors) {
      const neighborKey = getBoardKey(neighborBoard);
      
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        parent.set(neighborKey, { parentKey: currentKey, move });
        queue.push(neighborBoard);
      }
    }
  }

  return {
    success: false,
    moves: [],
    nodesExpanded,
    pathLength: 0,
    timeElapsed: Date.now() - startTime
  };
};


export const dfsSearch = (
  startBoard: BoardState, 
  goalBoard: BoardState, 
  maxDepth: number = 50
): SearchResult => {
  const startTime = Date.now();

  if (!isSolvable(startBoard)) {
    return {
      success: false,
      moves: [],
      nodesExpanded: 0,
      pathLength: 0,
      timeElapsed: Date.now() - startTime,
      maxDepth
    };
  }

  if (isGoalState(startBoard)) {
    return {
      success: true,
      moves: [],
      nodesExpanded: 0,
      pathLength: 0,
      timeElapsed: Date.now() - startTime,
      maxDepth
    };
  }

  const stack: Array<{ board: BoardState; depth: number }> = [{ board: startBoard, depth: 0 }];
  const visited = new Set<string>();
  const parent = new Map<string, { parentKey: string | null; move: Move | null }>();

  const startKey = getBoardKey(startBoard);
  parent.set(startKey, { parentKey: null, move: null });

  let nodesExpanded = 0;

  while (stack.length > 0) {
    const { board: currentBoard, depth } = stack.pop()!;
    const currentKey = getBoardKey(currentBoard);

    if (visited.has(currentKey)) continue;
    visited.add(currentKey);
    nodesExpanded++;

    if (isGoalState(currentBoard)) {
      const moves = reconstructPath(parent, currentKey);
      return {
        success: true,
        moves,
        nodesExpanded,
        pathLength: moves.length,
        timeElapsed: Date.now() - startTime,
        maxDepth
      };
    }

    if (depth >= maxDepth) continue;

    const neighbors = getNeighbors(currentBoard);
    for (const { board: neighborBoard, move } of neighbors) {
      const neighborKey = getBoardKey(neighborBoard);
      
      if (!visited.has(neighborKey)) {
        parent.set(neighborKey, { parentKey: currentKey, move });
        stack.push({ board: neighborBoard, depth: depth + 1 });
      }
    }
  }

  return {
    success: false,
    moves: [],
    nodesExpanded,
    pathLength: 0,
    timeElapsed: Date.now() - startTime,
    maxDepth
  };
};
