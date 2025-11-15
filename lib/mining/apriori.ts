import { Transaction, FrequentItemset, AssociationRule, MiningResult, MiningMetrics } from './types';
import { measureTime, getMemoryUsage } from './metrics';

/**
 * Apriori algorithm for frequent itemset mining
 * Uses horizontal database format (transactions)
 */
export const mineApriori = async (
  transactions: Transaction[],
  minSupport: number
): Promise<MiningResult> => {
  const memoryBefore = getMemoryUsage();
  
  const { result, time } = await measureTime(() => {
    const totalTransactions = transactions.length;
    const minSupportCount = Math.ceil(minSupport * totalTransactions);
    
    // Step 1: Generate frequent 1-itemsets
    const itemCounts = new Map<string, number>();
    for (const transaction of transactions) {
      for (const item of transaction.items) {
        itemCounts.set(item, (itemCounts.get(item) || 0) + 1);
      }
    }
    
    const frequent1Itemsets: FrequentItemset[] = [];
    for (const [item, count] of itemCounts.entries()) {
      if (count >= minSupportCount) {
        frequent1Itemsets.push({
          items: [item].sort(),
          support: count / totalTransactions,
          count,
        });
      }
    }
    
    // Step 2: Generate frequent k-itemsets (k >= 2)
    let currentFrequent = frequent1Itemsets;
    const allFrequentItemsets: FrequentItemset[] = [...frequent1Itemsets];
    
    for (let k = 2; currentFrequent.length > 0; k++) {
      // Generate candidates
      const candidates = generateCandidates(currentFrequent, k);
      
      // Count support for candidates
      const candidateCounts = new Map<string, number>();
      for (const transaction of transactions) {
        const transactionItems = new Set(transaction.items);
        for (const candidate of candidates) {
          if (candidate.every((item) => transactionItems.has(item))) {
            const key = candidate.sort().join(',');
            candidateCounts.set(key, (candidateCounts.get(key) || 0) + 1);
          }
        }
      }
      
      // Filter by min support
      currentFrequent = [];
      for (const [key, count] of candidateCounts.entries()) {
        if (count >= minSupportCount) {
          const items = key.split(',').sort();
          currentFrequent.push({
            items,
            support: count / totalTransactions,
            count,
          });
        }
      }
      
      allFrequentItemsets.push(...currentFrequent);
    }
    
    return allFrequentItemsets;
  });
  
  const memoryAfter = getMemoryUsage();
  const memoryUsage = memoryBefore && memoryAfter ? memoryAfter - memoryBefore : undefined;
  
  // Generate association rules
  const rules = generateRules(result);
  
  const metrics: MiningMetrics = {
    executionTime: time,
    ruleCount: rules.length,
    frequentItemsetCount: result.length,
    memoryUsage,
  };
  
  return {
    algorithm: 'apriori',
    metrics,
    frequentItemsets: result,
    rules,
  };
};

/**
 * Generate candidate k-itemsets from (k-1)-itemsets
 */
const generateCandidates = (frequentItemsets: FrequentItemset[], k: number): string[][] => {
  if (k === 2) {
    // For k=2, combine all pairs and ensure uniqueness and sorting
    const candidates: string[][] = [];
    for (let i = 0; i < frequentItemsets.length; i++) {
      for (let j = i + 1; j < frequentItemsets.length; j++) {
        // Combine items and ensure uniqueness
        const combined = [...new Set([...frequentItemsets[i].items, ...frequentItemsets[j].items])];
        // Only add if exactly 2 unique items (for k=2)
        if (combined.length === 2) {
          candidates.push(combined.sort());
        }
      }
    }
    return candidates;
  }
  
  // For k > 2, use join step
  const candidates: string[][] = [];
  const itemsets = frequentItemsets.map((f) => f.items.sort());
  
  for (let i = 0; i < itemsets.length; i++) {
    for (let j = i + 1; j < itemsets.length; j++) {
      const itemset1 = itemsets[i];
      const itemset2 = itemsets[j];
      
      // Check if first k-2 items are the same
      let canJoin = true;
      for (let idx = 0; idx < k - 2; idx++) {
        if (itemset1[idx] !== itemset2[idx]) {
          canJoin = false;
          break;
        }
      }
      
      if (canJoin && itemset1[k - 2] < itemset2[k - 2]) {
        const candidate = [...itemset1, itemset2[k - 2]].sort();
        candidates.push(candidate);
      }
    }
  }
  
  return candidates;
};

/**
 * Generate association rules from frequent itemsets
 */
const generateRules = (
  frequentItemsets: FrequentItemset[]
): AssociationRule[] => {
  const rules: AssociationRule[] = [];
  
  // Create a map for quick lookup of itemset support
  const itemsetSupport = new Map<string, number>();
  for (const itemset of frequentItemsets) {
    const key = itemset.items.sort().join(',');
    itemsetSupport.set(key, itemset.support);
  }
  
  // Generate rules from itemsets with size >= 2
  for (const itemset of frequentItemsets) {
    if (itemset.items.length < 2) continue;
    
    const items = itemset.items;
    const itemsetKey = items.sort().join(',');
    const itemsetSupportValue = itemsetSupport.get(itemsetKey) || 0;
    
    // Generate all possible rules: items -> remaining items
    for (let i = 0; i < items.length; i++) {
      const antecedent = [items[i]];
      const consequent = items.filter((_, idx) => idx !== i);
      
      // Calculate confidence
      const antecedentKey = antecedent.sort().join(',');
      const antecedentSupport = itemsetSupport.get(antecedentKey) || 0;
      
      if (antecedentSupport > 0) {
        const confidence = itemsetSupportValue / antecedentSupport;
        
        // Calculate lift
        const consequentKey = consequent.sort().join(',');
        const consequentSupport = itemsetSupport.get(consequentKey) || 0;
        const lift = consequentSupport > 0 ? confidence / consequentSupport : 0;
        
        rules.push({
          antecedent,
          consequent,
          support: itemsetSupportValue,
          confidence,
          lift,
        });
      }
    }
    
    // For larger itemsets, generate rules with multiple items in antecedent
    if (items.length > 2) {
      // Generate rules with 2+ items in antecedent
      for (let len = 2; len < items.length; len++) {
        // Simple approach: generate combinations
        const combinations = generateCombinations(items, len);
        for (const antecedent of combinations) {
          const consequent = items.filter((item) => !antecedent.includes(item));
          if (consequent.length === 0) continue;
          
          const antecedentKey = antecedent.sort().join(',');
          const antecedentSupport = itemsetSupport.get(antecedentKey) || 0;
          
          if (antecedentSupport > 0) {
            const confidence = itemsetSupportValue / antecedentSupport;
            
            const consequentKey = consequent.sort().join(',');
            const consequentSupport = itemsetSupport.get(consequentKey) || 0;
            const lift = consequentSupport > 0 ? confidence / consequentSupport : 0;
            
            rules.push({
              antecedent,
              consequent,
              support: itemsetSupportValue,
              confidence,
              lift,
            });
          }
        }
      }
    }
  }
  
  return rules;
};

/**
 * Generate combinations of items
 */
const generateCombinations = (items: string[], length: number): string[][] => {
  if (length === 0) return [[]];
  if (length > items.length) return [];
  
  const combinations: string[][] = [];
  
  const combine = (start: number, combo: string[]) => {
    if (combo.length === length) {
      combinations.push([...combo]);
      return;
    }
    
    for (let i = start; i < items.length; i++) {
      combo.push(items[i]);
      combine(i + 1, combo);
      combo.pop();
    }
  };
  
  combine(0, []);
  return combinations;
};

