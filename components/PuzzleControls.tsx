import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, Square, RotateCcw, Shuffle, Zap, SkipBack, SkipForward } from 'lucide-react';
import { SearchAlgorithm } from '@/lib/puzzle-types';

interface PuzzleControlsProps {
  onShuffle: () => void;
  onReset: () => void;
  onSolve: (algorithm: SearchAlgorithm, heuristic?: string) => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  isPlaying: boolean;
  isSolving: boolean;
  hasSolution: boolean;
  canStep: boolean;
  currentStep: number;
  totalSteps: number;
  selectedAlgorithm: SearchAlgorithm;
  selectedHeuristic: string;
  onAlgorithmChange: (algorithm: SearchAlgorithm) => void;
  onHeuristicChange: (heuristic: string) => void;
}

const PuzzleControls: React.FC<PuzzleControlsProps> = ({
  onShuffle,
  onReset,
  onSolve,
  onPlay,
  onPause,
  onStop,
  onPrevStep,
  onNextStep,
  isPlaying,
  isSolving,
  hasSolution,
  canStep,
  currentStep,
  totalSteps,
  selectedAlgorithm,
  selectedHeuristic,
  onAlgorithmChange,
  onHeuristicChange,
}) => {
  const algorithms = [
    { value: 'astar' as const, label: 'A* Search', icon: Zap },
    { value: 'bfs' as const, label: 'BFS', icon: RotateCcw },
    { value: 'dfs' as const, label: 'DFS', icon: Shuffle },
  ];

  const heuristics = [
    { value: 'manhattan', label: 'Manhattan Distance' },
  ];

  return (
    <div className="space-y-4">
      {/* Basic Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Game Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={onShuffle} disabled={isSolving || isPlaying} variant="outline">
              <Shuffle className="w-4 h-4 mr-2" />
              Shuffle
            </Button>
            <Button onClick={onReset} disabled={isSolving || isPlaying} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Algorithm Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Search Algorithm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Algorithm:</label>
            <div className="grid grid-cols-1 gap-2">
              {algorithms.map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={selectedAlgorithm === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onAlgorithmChange(value)}
                  disabled={isSolving || isPlaying}
                  className="justify-start"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {selectedAlgorithm === 'astar' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Heuristic:</label>
              <select
                value={selectedHeuristic}
                onChange={(e) => onHeuristicChange(e.target.value)}
                disabled={isSolving || isPlaying}
                className="w-full p-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              >
                {heuristics.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            onClick={() => onSolve(selectedAlgorithm, selectedHeuristic)}
            disabled={isSolving || isPlaying}
            className="w-full"
          >
            {isSolving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Solving...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Solve Puzzle
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Playback Controls */}
      {hasSolution && (
        <Card>
          <CardHeader>
            <CardTitle>Solution Playback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              Step {currentStep} of {totalSteps}
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={onPrevStep}
                disabled={!canStep || currentStep === 0}
                variant="outline"
                size="sm"
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              
              {isPlaying ? (
                <Button onClick={onPause} variant="outline" size="sm">
                  <Pause className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  onClick={onPlay} 
                  disabled={!canStep || currentStep >= totalSteps}
                  variant="outline" 
                  size="sm"
                >
                  <Play className="w-4 h-4" />
                </Button>
              )}
              
              <Button onClick={onStop} disabled={!canStep} variant="outline" size="sm">
                <Square className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={onNextStep}
                disabled={!canStep || currentStep >= totalSteps}
                variant="outline"
                size="sm"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PuzzleControls;
