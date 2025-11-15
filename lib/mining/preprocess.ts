import { Transaction, PreprocessReport } from './types';

/**
 * Clean and preprocess transactions
 * - Remove empty transactions
 * - Remove singleton transactions (optional)
 * - Normalize case (lowercase)
 * - Trim whitespace
 * - Remove duplicate items within transactions
 * - Remove invalid items (empty strings, etc.)
 */
export const preprocessTransactions = (
  transactions: Transaction[],
  removeSingletons: boolean = false
): { cleaned: Transaction[]; report: PreprocessReport } => {
  const before = calculateStats(transactions);
  
  let cleaned = [...transactions];
  const removed = {
    emptyTransactions: 0,
    singletonTransactions: 0,
    duplicateItems: 0,
    invalidItems: 0,
  };
  
  // Clean each transaction
  cleaned = cleaned.map((transaction) => {
    // Normalize items: lowercase, trim, filter empty
    const items = transaction.items
      .map((item) => item.trim().toLowerCase())
      .filter((item) => item.length > 0);
    
    // Count invalid items (before filtering)
    const invalidCount = transaction.items.length - items.length;
    removed.invalidItems += invalidCount;
    
    // Remove duplicates within transaction
    const uniqueItems: string[] = [];
    const seen = new Set<string>();
    for (const item of items) {
      if (!seen.has(item)) {
        seen.add(item);
        uniqueItems.push(item);
      } else {
        removed.duplicateItems++;
      }
    }
    
    return {
      ...transaction,
      items: uniqueItems,
    };
  });
  
  // Remove empty transactions
  const beforeEmpty = cleaned.length;
  cleaned = cleaned.filter((t) => t.items.length > 0);
  removed.emptyTransactions = beforeEmpty - cleaned.length;
  
  // Remove singleton transactions if requested
  if (removeSingletons) {
    const beforeSingleton = cleaned.length;
    cleaned = cleaned.filter((t) => t.items.length > 1);
    removed.singletonTransactions = beforeSingleton - cleaned.length;
  }
  
  const after = calculateStats(cleaned);
  
  const report: PreprocessReport = {
    before,
    after,
    removed,
    cleaned: true,
  };
  
  return { cleaned, report };
};

/**
 * Calculate statistics for a set of transactions
 */
const calculateStats = (transactions: Transaction[]) => {
  const allItems = transactions.flatMap((t) => t.items);
  const uniqueItems = new Set(allItems);
  
  return {
    transactionCount: transactions.length,
    totalItems: allItems.length,
    uniqueItems: uniqueItems.size,
    emptyTransactions: transactions.filter((t) => t.items.length === 0).length,
    singletonTransactions: transactions.filter((t) => t.items.length === 1).length,
  };
};

