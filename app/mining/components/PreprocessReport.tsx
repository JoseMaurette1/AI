"use client";

import { PreprocessReport as PreprocessReportType } from '@/lib/mining/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, TrendingDown } from 'lucide-react';

interface PreprocessReportProps {
  report: PreprocessReportType | null;
}

export const PreprocessReport = ({ report }: PreprocessReportProps) => {
  if (!report) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5" />
            Preprocessing Report
          </CardTitle>
          <CardDescription>
            Run preprocessing to see cleaning statistics
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const {
    before,
    after,
    removed,
  } = report;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-5" />
          Preprocessing Report
        </CardTitle>
        <CardDescription>
          Data cleaning statistics before and after preprocessing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted rounded-md">
            <div className="text-xs text-muted-foreground mb-1">Transactions</div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">{after.transactionCount}</span>
              {before.transactionCount !== after.transactionCount && (
                <span className="text-xs text-muted-foreground">
                  ({before.transactionCount} → {after.transactionCount})
                </span>
              )}
            </div>
          </div>
          <div className="p-3 bg-muted rounded-md">
            <div className="text-xs text-muted-foreground mb-1">Unique Items</div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">{after.uniqueItems}</span>
              {before.uniqueItems !== after.uniqueItems && (
                <span className="text-xs text-muted-foreground">
                  ({before.uniqueItems} → {after.uniqueItems})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Before/After Comparison */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Before Preprocessing</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-background border rounded">
                <span className="text-muted-foreground">Transactions: </span>
                <span className="font-medium">{before.transactionCount}</span>
              </div>
              <div className="p-2 bg-background border rounded">
                <span className="text-muted-foreground">Total Items: </span>
                <span className="font-medium">{before.totalItems}</span>
              </div>
              <div className="p-2 bg-background border rounded">
                <span className="text-muted-foreground">Unique Items: </span>
                <span className="font-medium">{before.uniqueItems}</span>
              </div>
              <div className="p-2 bg-background border rounded">
                <span className="text-muted-foreground">Empty: </span>
                <span className="font-medium">{before.emptyTransactions}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">After Preprocessing</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-background border rounded">
                <span className="text-muted-foreground">Transactions: </span>
                <span className="font-medium">{after.transactionCount}</span>
              </div>
              <div className="p-2 bg-background border rounded">
                <span className="text-muted-foreground">Total Items: </span>
                <span className="font-medium">{after.totalItems}</span>
              </div>
              <div className="p-2 bg-background border rounded">
                <span className="text-muted-foreground">Unique Items: </span>
                <span className="font-medium">{after.uniqueItems}</span>
              </div>
              <div className="p-2 bg-background border rounded">
                <span className="text-muted-foreground">Empty: </span>
                <span className="font-medium">{after.emptyTransactions}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Removed Items */}
        {(removed.emptyTransactions > 0 ||
          removed.singletonTransactions > 0 ||
          removed.duplicateItems > 0 ||
          removed.invalidItems > 0) && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <TrendingDown className="size-4 text-destructive" />
              Removed During Cleaning
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {removed.emptyTransactions > 0 && (
                <div className="p-2 bg-destructive/10 border border-destructive/20 rounded">
                  <span className="text-muted-foreground">Empty Transactions: </span>
                  <span className="font-medium text-destructive">{removed.emptyTransactions}</span>
                </div>
              )}
              {removed.singletonTransactions > 0 && (
                <div className="p-2 bg-destructive/10 border border-destructive/20 rounded">
                  <span className="text-muted-foreground">Singleton Transactions: </span>
                  <span className="font-medium text-destructive">{removed.singletonTransactions}</span>
                </div>
              )}
              {removed.duplicateItems > 0 && (
                <div className="p-2 bg-destructive/10 border border-destructive/20 rounded">
                  <span className="text-muted-foreground">Duplicate Items: </span>
                  <span className="font-medium text-destructive">{removed.duplicateItems}</span>
                </div>
              )}
              {removed.invalidItems > 0 && (
                <div className="p-2 bg-destructive/10 border border-destructive/20 rounded">
                  <span className="text-muted-foreground">Invalid Items: </span>
                  <span className="font-medium text-destructive">{removed.invalidItems}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

