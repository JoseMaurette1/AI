import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';
import { access } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';

const execAsync = promisify(exec);

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const csvPath = path.join(process.cwd(), 'public', 'product_sales.csv');
    const mlAnalysisPath = path.join(process.cwd(), 'ml_analysis');
    const mainScriptPath = path.join(mlAnalysisPath, 'main_analysis.py');
    const resultsPath = path.join(process.cwd(), 'ml_results');

    // Check if results already exist (for Vercel/production)
    const finalReportPath = path.join(resultsPath, 'final_report.json');
    const preprocessingReportPath = path.join(resultsPath, 'preprocessing_report.json');
    const clusteringResultsPath = path.join(resultsPath, 'clustering_results.json');
    const regressionResultsPath = path.join(resultsPath, 'regression_results.json');

    const resultsExist = await fileExists(preprocessingReportPath) && 
                         await fileExists(clusteringResultsPath) && 
                         await fileExists(regressionResultsPath);

    // Try to run Python analysis if results don't exist (local development)
    if (!resultsExist) {
      try {
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
      } catch (pythonError) {
        // Python not available (e.g., on Vercel) - fall through to read existing results
        console.warn('Python analysis not available, using pre-generated results:', pythonError);
      }
    }

    // Read the results (either newly generated or pre-existing)
    const [finalReport, preprocessingReport, clusteringResults, regressionResults] = await Promise.all([
      readFile(finalReportPath, 'utf-8').then(JSON.parse).catch(() => null),
      readFile(preprocessingReportPath, 'utf-8').then(JSON.parse).catch(() => null),
      readFile(clusteringResultsPath, 'utf-8').then(JSON.parse).catch(() => null),
      readFile(regressionResultsPath, 'utf-8').then(JSON.parse).catch(() => null),
    ]);

    if (!preprocessingReport || !clusteringResults || !regressionResults) {
      throw new Error('ML analysis results not found. Please run the analysis locally first or ensure results are committed to the repository.');
    }

    return NextResponse.json({
      success: true,
      data: {
        finalReport,
        preprocessingReport,
        clusteringResults,
        regressionResults,
      }
    });
  } catch (error) {
    console.error('Error running ML analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to run ML analysis';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

