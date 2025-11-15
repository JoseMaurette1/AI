export interface Item {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  items: string[]; // Array of item names/IDs
}

export interface FrequentItemset {
  items: string[];
  support: number;
  count: number;
}

export interface AssociationRule {
  antecedent: string[];
  consequent: string[];
  support: number;
  confidence: number;
  lift: number;
}

export interface MiningMetrics {
  executionTime: number;
  ruleCount: number;
  frequentItemsetCount: number;
  memoryUsage?: number;
}

export interface MiningResult {
  algorithm: 'apriori' | 'eclat';
  metrics: MiningMetrics;
  frequentItemsets: FrequentItemset[];
  rules: AssociationRule[];
}

export interface PreprocessReport {
  before: {
    transactionCount: number;
    totalItems: number;
    uniqueItems: number;
    emptyTransactions: number;
    singletonTransactions: number;
  };
  after: {
    transactionCount: number;
    totalItems: number;
    uniqueItems: number;
    emptyTransactions: number;
    singletonTransactions: number;
  };
  removed: {
    emptyTransactions: number;
    singletonTransactions: number;
    duplicateItems: number;
    invalidItems: number;
  };
  cleaned: boolean;
}

