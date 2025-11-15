"use client";

import { MiningResult } from '@/lib/mining/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Clock, List, Zap } from 'lucide-react';
import { formatTime, formatMemory } from '@/lib/mining/metrics';

interface ResultsComparisonProps {
  aprioriResult: MiningResult | null;
  eclatResult: MiningResult | null;
  minConfidence: number;
}

export const ResultsComparison = ({
  aprioriResult,
  eclatResult,
  minConfidence,
}: ResultsComparisonProps) => {
  if (!aprioriResult && !eclatResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-5" />
            Mining Results
          </CardTitle>
          <CardDescription>
            Run mining to see algorithm comparison and results
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Filter rules by min confidence
  const filterRules = (rules: MiningResult['rules']) => {
    return rules.filter((rule) => rule.confidence >= minConfidence);
  };

  const aprioriRules = aprioriResult ? filterRules(aprioriResult.rules) : [];
  const eclatRules = eclatResult ? filterRules(eclatResult.rules) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="size-5" />
          Mining Results Comparison
        </CardTitle>
        <CardDescription>
          Performance metrics and top association rules from both algorithms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 text-sm font-medium">Metric</th>
                {aprioriResult && (
                  <th className="text-center p-2 text-sm font-medium">Apriori</th>
                )}
                {eclatResult && (
                  <th className="text-center p-2 text-sm font-medium">Eclat</th>
                )}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2 text-sm flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" />
                  Execution Time
                </td>
                {aprioriResult && (
                  <td className="p-2 text-sm text-center">
                    {formatTime(aprioriResult.metrics.executionTime)}
                  </td>
                )}
                {eclatResult && (
                  <td className="p-2 text-sm text-center">
                    {formatTime(eclatResult.metrics.executionTime)}
                  </td>
                )}
              </tr>
              <tr className="border-b">
                <td className="p-2 text-sm flex items-center gap-2">
                  <List className="size-4 text-muted-foreground" />
                  Frequent Itemsets
                </td>
                {aprioriResult && (
                  <td className="p-2 text-sm text-center">
                    {aprioriResult.metrics.frequentItemsetCount}
                  </td>
                )}
                {eclatResult && (
                  <td className="p-2 text-sm text-center">
                    {eclatResult.metrics.frequentItemsetCount}
                  </td>
                )}
              </tr>
              <tr className="border-b">
                <td className="p-2 text-sm flex items-center gap-2">
                  <Zap className="size-4 text-muted-foreground" />
                  Rules (≥{minConfidence.toFixed(2)} confidence)
                </td>
                {aprioriResult && (
                  <td className="p-2 text-sm text-center">{aprioriRules.length}</td>
                )}
                {eclatResult && (
                  <td className="p-2 text-sm text-center">{eclatRules.length}</td>
                )}
              </tr>
              {(aprioriResult?.metrics.memoryUsage !== undefined ||
                eclatResult?.metrics.memoryUsage !== undefined) && (
                <tr>
                  <td className="p-2 text-sm">Memory Usage</td>
                  {aprioriResult && (
                    <td className="p-2 text-sm text-center">
                      {aprioriResult.metrics.memoryUsage !== undefined
                        ? formatMemory(aprioriResult.metrics.memoryUsage)
                        : 'N/A'}
                    </td>
                  )}
                  {eclatResult && (
                    <td className="p-2 text-sm text-center">
                      {eclatResult.metrics.memoryUsage !== undefined
                        ? formatMemory(eclatResult.metrics.memoryUsage)
                        : 'N/A'}
                    </td>
                  )}
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Top Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Apriori Rules */}
          {aprioriResult && (
            <div>
              <h4 className="text-sm font-medium mb-2">Top Apriori Rules</h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {aprioriRules.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No rules found</p>
                ) : (
                  aprioriRules
                    .sort((a, b) => b.confidence - a.confidence)
                    .slice(0, 10)
                    .map((rule, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-muted rounded text-sm border"
                      >
                        <div className="font-medium">
                          {rule.antecedent.join(', ')} → {rule.consequent.join(', ')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Support: {(rule.support * 100).toFixed(1)}% • Confidence:{' '}
                          {(rule.confidence * 100).toFixed(1)}% • Lift: {rule.lift.toFixed(2)}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* Eclat Rules */}
          {eclatResult && (
            <div>
              <h4 className="text-sm font-medium mb-2">Top Eclat Rules</h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {eclatRules.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No rules found</p>
                ) : (
                  eclatRules
                    .sort((a, b) => b.confidence - a.confidence)
                    .slice(0, 10)
                    .map((rule, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-muted rounded text-sm border"
                      >
                        <div className="font-medium">
                          {rule.antecedent.join(', ')} → {rule.consequent.join(', ')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Support: {(rule.support * 100).toFixed(1)}% • Confidence:{' '}
                          {(rule.confidence * 100).toFixed(1)}% • Lift: {rule.lift.toFixed(2)}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

