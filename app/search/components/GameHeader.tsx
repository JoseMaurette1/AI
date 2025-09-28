import React from 'react';

const GameHeader: React.FC = () => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">8-Puzzle Search Algorithms</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        Upload an image and solve the puzzle using A*, BFS, or DFS search algorithms
      </p>
    </div>
  );
};

export default GameHeader;
