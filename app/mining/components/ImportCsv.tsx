"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FileUpload, { DropZone, FileError } from '@/components/ui/file-upload';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Transaction } from '@/lib/mining/types';
import { loadCsvFile } from '@/lib/mining/csv';

interface ImportCsvProps {
  onImport: (transactions: Transaction[]) => void;
  disabled?: boolean;
}

export const ImportCsv = ({ onImport, disabled = false }: ImportCsvProps) => {
  const [status, setStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
    count?: number;
  }>({ type: 'idle', message: '' });

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    setStatus({ type: 'idle', message: 'Loading...' });

    try {
      const result = await loadCsvFile(file);

      if (result.errors.length > 0) {
        setStatus({
          type: 'error',
          message: `Import failed: ${result.errors.join('; ')}`,
        });
        return;
      }

      if (result.transactions.length === 0) {
        setStatus({
          type: 'error',
          message: 'No transactions found in CSV file',
        });
        return;
      }

      onImport(result.transactions);
      setStatus({
        type: 'success',
        message: `Successfully imported ${result.transactions.length} transaction${result.transactions.length !== 1 ? 's' : ''}`,
        count: result.transactions.length,
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: `Failed to import: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="size-5" />
          Import CSV
        </CardTitle>
        <CardDescription>
          Import transactions from a CSV file (format: transaction_id,items)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FileUpload
          maxCount={1}
          maxSize={5}
          accept=".csv,text/csv"
          onFileSelect={handleFileSelect}
          disabled={disabled}
        >
          <DropZone
            prompt="Click or drop CSV file here"
            accept=".csv"
            onFileSelect={handleFileSelect}
          />
          <FileError />
        </FileUpload>

        {/* Status Message */}
        {status.type !== 'idle' && (
          <div
            className={`
              flex items-center gap-2 p-3 rounded-md text-sm
              ${
                status.type === 'success'
                  ? 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20'
                  : status.type === 'error'
                  ? 'bg-destructive/10 text-destructive border border-destructive/20'
                  : ''
              }
            `}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="size-4" />
            ) : status.type === 'error' ? (
              <AlertCircle className="size-4" />
            ) : (
              <FileText className="size-4" />
            )}
            <span>{status.message}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

