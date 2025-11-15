"use client";

import { useState, useCallback } from 'react';
import { Transaction, PreprocessReport, MiningResult } from '@/lib/mining/types';
import { generateUniqueId } from '@/lib/utils';
import { preprocessTransactions } from '@/lib/mining/preprocess';
import { mineApriori } from '@/lib/mining/apriori';
import { mineEclat } from '@/lib/mining/eclat';
import { ProductsPicker } from './components/ProductsPicker';
import { TransactionsPanel } from './components/TransactionsPanel';
import { ImportCsv } from './components/ImportCsv';
import { PreprocessReport as PreprocessReportComponent } from './components/PreprocessReport';
import { MiningControls } from './components/MiningControls';
import { ResultsComparison } from './components/ResultsComparison';
import { Recommendations } from './components/Recommendations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Sparkles, BarChart3, Lightbulb, AlertCircle } from 'lucide-react';

export default function MiningPage() {
  // State management
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentTransactionItems, setCurrentTransactionItems] = useState<string[]>([]);
  const [preprocessedTransactions, setPreprocessedTransactions] = useState<Transaction[]>([]);
  const [preprocessReport, setPreprocessReport] = useState<PreprocessReport | null>(null);
  const [minSupport, setMinSupport] = useState(0.2);
  const [minConfidence, setMinConfidence] = useState(0.5);
  const [aprioriResult, setAprioriResult] = useState<MiningResult | null>(null);
  const [eclatResult, setEclatResult] = useState<MiningResult | null>(null);
  const [isMining, setIsMining] = useState(false);
  const [miningError, setMiningError] = useState<string | null>(null);

  // Handle adding product to current transaction
  const handleAddProduct = useCallback((product: string) => {
    setCurrentTransactionItems((prev) => {
      if (prev.includes(product)) return prev; // Avoid duplicates
      return [...prev, product];
    });
  }, []);

  // Handle clearing current transaction
  const handleClearCurrent = useCallback(() => {
    setCurrentTransactionItems([]);
  }, []);

  // Handle adding current transaction to list
  const handleAddTransaction = useCallback(() => {
    if (currentTransactionItems.length === 0) return;

    const newTransaction: Transaction = {
      id: generateUniqueId('t'),
      items: [...currentTransactionItems],
    };

    setTransactions((prev) => [...prev, newTransaction]);
    setCurrentTransactionItems([]);
  }, [currentTransactionItems]);

  // Handle removing a transaction
  const handleRemoveTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Handle clearing all transactions
  const handleClearAll = useCallback(() => {
    setTransactions([]);
    setCurrentTransactionItems([]);
    setPreprocessedTransactions([]);
    setPreprocessReport(null);
    setAprioriResult(null);
    setEclatResult(null);
    setMiningError(null);
  }, []);

  // Handle CSV import
  const handleCsvImport = useCallback((importedTransactions: Transaction[]) => {
    setTransactions((prev) => [...prev, ...importedTransactions]);
  }, []);

  // Handle preprocessing
  const handlePreprocess = useCallback(() => {
    if (transactions.length === 0) return;

    const { cleaned, report } = preprocessTransactions(transactions, false);
    setPreprocessedTransactions(cleaned);
    setPreprocessReport(report);
    setAprioriResult(null);
    setEclatResult(null);
  }, [transactions]);

  // Handle mining
  const handleRunMining = useCallback(async () => {
    const transactionsToMine = preprocessedTransactions.length > 0 
      ? preprocessedTransactions 
      : transactions;

    if (transactionsToMine.length === 0) {
      setMiningError('No transactions available for mining. Please add or import transactions first.');
      return;
    }

    // Validate that we have transactions with items
    const validTransactions = transactionsToMine.filter(t => t.items.length > 0);
    if (validTransactions.length === 0) {
      setMiningError('No valid transactions found. All transactions are empty. Please add transactions with items.');
      return;
    }

    setIsMining(true);
    setMiningError(null);
    setAprioriResult(null);
    setEclatResult(null);

    try {
      // Run both algorithms in parallel
      const [apriori, eclat] = await Promise.all([
        mineApriori(validTransactions, minSupport),
        mineEclat(validTransactions, minSupport),
      ]);

      setAprioriResult(apriori);
      setEclatResult(eclat);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during mining';
      setMiningError(`Mining failed: ${errorMessage}`);
      console.error('Mining error:', error);
    } finally {
      setIsMining(false);
    }
  }, [transactions, preprocessedTransactions, minSupport]);

  const hasTransactions = transactions.length > 0;
  const hasPreprocessed = preprocessedTransactions.length > 0;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Interactive Supermarket Mining</h1>
          <p className="text-muted-foreground">
            Association rule mining with Apriori and Eclat algorithms
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Step 1: Create/Import Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="size-5" />
                Step 1: Create/Import Transactions
              </CardTitle>
              <CardDescription>
                Add transactions manually or import from CSV
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProductsPicker
                onAddToTransaction={handleAddProduct}
                disabled={isMining}
              />
              <TransactionsPanel
                transactions={transactions}
                currentTransactionItems={currentTransactionItems}
                onClearCurrent={handleClearCurrent}
                onAddTransaction={handleAddTransaction}
                onRemoveTransaction={handleRemoveTransaction}
                onClearAll={handleClearAll}
                disabled={isMining}
              />
              <ImportCsv onImport={handleCsvImport} disabled={isMining} />
            </CardContent>
          </Card>

          {/* Step 2: Preprocess */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-5" />
                Step 2: Preprocess Data
              </CardTitle>
              <CardDescription>
                Clean and normalize transaction data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handlePreprocess}
                disabled={!hasTransactions || isMining}
                className="w-full"
              >
                Run Preprocessing
              </Button>
              <PreprocessReportComponent report={preprocessReport} />
            </CardContent>
          </Card>
        </div>

        {/* Step 3: Mine */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5" />
              Step 3: Mine Association Rules
            </CardTitle>
            <CardDescription>
              Run Apriori and Eclat algorithms to find frequent itemsets and rules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {miningError && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
                <AlertCircle className="size-4" />
                <span className="text-sm">{miningError}</span>
              </div>
            )}
            <MiningControls
              minSupport={minSupport}
              minConfidence={minConfidence}
              onSupportChange={setMinSupport}
              onConfidenceChange={setMinConfidence}
              onRunMining={handleRunMining}
              isRunning={isMining}
              disabled={!hasTransactions && !hasPreprocessed}
            />
            <ResultsComparison
              aprioriResult={aprioriResult}
              eclatResult={eclatResult}
              minConfidence={minConfidence}
            />
          </CardContent>
        </Card>

        {/* Step 4: Query Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="size-5" />
              Step 4: Query Recommendations
            </CardTitle>
            <CardDescription>
              Get product recommendations based on association rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Recommendations
              aprioriResult={aprioriResult}
              eclatResult={eclatResult}
              minConfidence={minConfidence}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

