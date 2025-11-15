"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Play } from 'lucide-react';

interface MiningControlsProps {
  minSupport: number;
  minConfidence: number;
  onSupportChange: (value: number) => void;
  onConfidenceChange: (value: number) => void;
  onRunMining: () => void;
  isRunning?: boolean;
  disabled?: boolean;
}

export const MiningControls = ({
  minSupport,
  minConfidence,
  onSupportChange,
  onConfidenceChange,
  onRunMining,
  isRunning = false,
  disabled = false,
}: MiningControlsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="size-5" />
          Mining Parameters
        </CardTitle>
        <CardDescription>
          Configure support and confidence thresholds for association rule mining
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Min Support Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Minimum Support</label>
            <span className="text-sm text-muted-foreground">{minSupport.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={minSupport}
            onChange={(e) => onSupportChange(parseFloat(e.target.value))}
            disabled={disabled || isRunning}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.10</span>
            <span>1.00</span>
          </div>
        </div>

        {/* Min Confidence Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Minimum Confidence</label>
            <span className="text-sm text-muted-foreground">{minConfidence.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={minConfidence}
            onChange={(e) => onConfidenceChange(parseFloat(e.target.value))}
            disabled={disabled || isRunning}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.10</span>
            <span>1.00</span>
          </div>
        </div>

        {/* Run Button */}
        <Button
          onClick={onRunMining}
          disabled={disabled || isRunning}
          className="w-full"
          size="lg"
        >
          {isRunning ? (
            <>
              <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Mining...
            </>
          ) : (
            <>
              <Play className="size-4 mr-2" />
              Run Mining (Apriori & Eclat)
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

