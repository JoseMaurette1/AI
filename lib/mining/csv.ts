import { Transaction } from './types';

export interface CsvParseResult {
  transactions: Transaction[];
  errors: string[];
}

/**
 * Parse CSV file content into transactions
 * Expected format: transaction_id,items
 * Items are comma-separated within quotes
 */
export const parseTransactionsCsv = (csvContent: string): CsvParseResult => {
  const transactions: Transaction[] = [];
  const errors: string[] = [];
  
  const lines = csvContent.trim().split('\n');
  
  // Skip header row
  if (lines.length === 0) {
    errors.push('CSV file is empty');
    return { transactions, errors };
  }
  
  const header = lines[0].toLowerCase();
  if (!header.includes('transaction') || !header.includes('item')) {
    errors.push('Warning: CSV header may not contain expected columns "transaction_id" and "items". Parsing will continue.');
  }
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    try {
      // Parse CSV line - handle quoted items properly
      // Format: transaction_id,"item1,item2,item3" or transaction_id,item1,item2,item3
      let transactionId = '';
      let itemsStr = '';
      
      // Check if items are quoted
      if (line.includes('"')) {
        // Find the first comma (after transaction_id)
        const firstCommaIndex = line.indexOf(',');
        if (firstCommaIndex === -1) {
          errors.push(`Line ${i + 1}: Invalid format - missing comma`);
          continue;
        }
        
        transactionId = line.substring(0, firstCommaIndex).trim();
        itemsStr = line.substring(firstCommaIndex + 1);
        
        // Remove quotes if present
        if (itemsStr.startsWith('"') && itemsStr.endsWith('"')) {
          itemsStr = itemsStr.slice(1, -1);
        }
      } else {
        // No quotes - split by first comma
        const firstCommaIndex = line.indexOf(',');
        if (firstCommaIndex === -1) {
          errors.push(`Line ${i + 1}: Invalid format - missing comma`);
          continue;
        }
        
        transactionId = line.substring(0, firstCommaIndex).trim();
        itemsStr = line.substring(firstCommaIndex + 1);
      }
      
      // Split items by comma and clean
      const items = itemsStr
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
      
      if (!transactionId) {
        errors.push(`Line ${i + 1}: Missing transaction ID`);
        continue;
      }
      
      transactions.push({
        id: transactionId,
        items,
      });
    } catch (error) {
      errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
    }
  }
  
  return { transactions, errors };
};

/**
 * Load CSV file from file object
 */
export const loadCsvFile = async (file: File): Promise<CsvParseResult> => {
  try {
    const text = await file.text();
    return parseTransactionsCsv(text);
  } catch (error) {
    return {
      transactions: [],
      errors: [`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
};

