import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const csvPath = path.join(process.cwd(), 'public', 'product_sales.csv');
    const mlAnalysisPath = path.join(process.cwd(), 'ml_analysis');
    const mainScriptPath = path.join(mlAnalysisPath, 'main_analysis.py');
    const resultsPath = path.join(process.cwd(), 'ml_results');

    // Run the Python analysis script
    // Use absolute path for CSV and run from project root
    // Try python3 first, fallback to python
    const pythonCmd = process.env.PYTHON_CMD || 'python3';
    const { stdout, stderr } = await execAsync(
      `${pythonCmd} "${mainScriptPath}" "${csvPath}"`,
      {
        cwd: process.cwd(),
        env: { ...process.env, PYTHONPATH: mlAnalysisPath }
      }
    );

    if (stderr && !stderr.includes('Warning')) {
      console.error('Python script stderr:', stderr);
    }

    // Read the generated results
    const finalReportPath = path.join(resultsPath, 'final_report.json');
    const preprocessingReportPath = path.join(resultsPath, 'preprocessing_report.json');
    const clusteringResultsPath = path.join(resultsPath, 'clustering_results.json');
    const regressionResultsPath = path.join(resultsPath, 'regression_results.json');

    const [finalReport, preprocessingReport, clusteringResults, regressionResults] = await Promise.all([
      readFile(finalReportPath, 'utf-8').then(JSON.parse).catch(() => null),
      readFile(preprocessingReportPath, 'utf-8').then(JSON.parse).catch(() => null),
      readFile(clusteringResultsPath, 'utf-8').then(JSON.parse).catch(() => null),
      readFile(regressionResultsPath, 'utf-8').then(JSON.parse).catch(() => null),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        finalReport,
        preprocessingReport,
        clusteringResults,
        regressionResults,
        stdout: stdout || '',
      }
    });
  } catch (error) {
    console.error('Error running ML analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to run ML analysis';
    let errorDetails = '';
    if (error && typeof error === 'object') {
      const errorObj = error as { stderr?: unknown; stdout?: unknown };
      errorDetails = String(errorObj.stderr || errorObj.stdout || '');
    }
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    );
  }
}

