import { Transaction, FrequentItemset, AssociationRule, MiningResult, MiningMetrics } from './types';
import { measureTime, getMemoryUsage } from './metrics';

/**
 * Eclat algorithm for frequent itemset mining
 * Uses vertical database format (TID-sets)
 */
export const mineEclat = async (
  transactions: Transaction[],
  minSupport: number
): Promise<MiningResult> => {
  const memoryBefore = getMemoryUsage();
  
  const { result, time } = await measureTime(() => {
    const totalTransactions = transactions.length;
    const minSupportCount = Math.ceil(minSupport * totalTransactions);
    
    // Step 1: Build vertical database (TID-sets)
    const tidSets = new Map<string, Set<number>>();
    
    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i];
      for (const item of transaction.items) {
        if (!tidSets.has(item)) {
          tidSets.set(item, new Set());
        }
        tidSets.get(item)!.add(i);
      }
    }
    
    // Step 2: Find frequent 1-itemsets
    const frequent1Itemsets: FrequentItemset[] = [];
    for (const [item, tidSet] of tidSets.entries()) {
      if (tidSet.size >= minSupportCount) {
        frequent1Itemsets.push({
          items: [item].sort(),
          support: tidSet.size / totalTransactions,
          count: tidSet.size,
        });
      }
    }
    
    // Step 3: Mine frequent itemsets using DFS
    const allFrequentItemsets: FrequentItemset[] = [...frequent1Itemsets];
    
    // Sort items by support (descending) for better pruning
    const sortedItems = frequent1Itemsets
      .map((f) => f.items[0])
      .sort((a, b) => {
        const supportA = tidSets.get(a)!.size;
        const supportB = tidSets.get(b)!.size;
        return supportB - supportA;
      });
    
    // DFS to find larger itemsets
    const dfs = (prefix: string[], prefixTidSet: Set<number>, startIdx: number) => {
      for (let i = startIdx; i < sortedItems.length; i++) {
        const item = sortedItems[i];
        if (prefix.includes(item)) continue;
        
        // Intersect TID-sets
        const itemTidSet = tidSets.get(item)!;
        const intersection = new Set<number>();
        for (const tid of prefixTidSet) {
          if (itemTidSet.has(tid)) {
            intersection.add(tid);
          }
        }
        
        // Check support
        if (intersection.size >= minSupportCount) {
          const newPrefix = [...prefix, item].sort();
          allFrequentItemsets.push({
            items: newPrefix,
            support: intersection.size / totalTransactions,
            count: intersection.size,
          });
          
          // Recursive call
          if (i + 1 < sortedItems.length) {
            dfs(newPrefix, intersection, i + 1);
          }
        }
      }
    };
    
    // Start DFS from each frequent 1-itemset
    for (let i = 0; i < sortedItems.length; i++) {
      const item = sortedItems[i];
      const tidSet = tidSets.get(item)!;
      if (i + 1 < sortedItems.length) {
        dfs([item], tidSet, i + 1);
      }
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
    algorithm: 'eclat',
    metrics,
    frequentItemsets: result,
    rules,
  };
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

