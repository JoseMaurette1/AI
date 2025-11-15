"use client";

import { Transaction } from '@/lib/mining/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, List, X } from 'lucide-react';

interface TransactionsPanelProps {
  transactions: Transaction[];
  currentTransactionItems: string[];
  onClearCurrent: () => void;
  onAddTransaction: () => void;
  onRemoveTransaction: (id: string) => void;
  onClearAll: () => void;
  disabled?: boolean;
}

export const TransactionsPanel = ({
  transactions,
  currentTransactionItems,
  onClearCurrent,
  onAddTransaction,
  onRemoveTransaction,
  onClearAll,
  disabled = false,
}: TransactionsPanelProps) => {
  const totalTransactions = transactions.length;
  const totalItems = transactions.reduce((sum, t) => sum + t.items.length, 0);
  const avgItemsPerTransaction = totalTransactions > 0 ? (totalItems / totalTransactions).toFixed(2) : '0';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="size-5" />
          Transactions
        </CardTitle>
        <CardDescription>
          {totalTransactions} transaction{totalTransactions !== 1 ? 's' : ''} • {totalItems} total items • Avg: {avgItemsPerTransaction} items/transaction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Transaction */}
        {currentTransactionItems.length > 0 && (
          <div className="p-3 bg-muted rounded-md border border-dashed">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Current Transaction</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onAddTransaction}
                  disabled={disabled}
                >
                  Add Transaction
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClearCurrent}
                  disabled={disabled}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {currentTransactionItems.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-1 text-xs bg-background border rounded-md"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No transactions yet. Add items and create a transaction.
            </p>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-start justify-between p-3 bg-background border rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      T{transaction.id}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({transaction.items.length} item{transaction.items.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {transaction.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 text-xs bg-muted border rounded"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-6 ml-2 shrink-0"
                  onClick={() => onRemoveTransaction(transaction.id)}
                  disabled={disabled}
                >
                  <Trash2 className="size-3 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
      {transactions.length > 0 && (
        <CardFooter>
          <Button
            variant="destructive"
            size="sm"
            onClick={onClearAll}
            disabled={disabled}
            className="w-full"
          >
            <Trash2 className="size-4 mr-2" />
            Clear All Transactions
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

