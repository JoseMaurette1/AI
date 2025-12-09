"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Database, 
  Sparkles, 
  BarChart3, 
  TrendingUp, 
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import Image from 'next/image';

interface MissingValueInfo {
  count: number;
  percentage: number;
}

interface OutlierInfo {
  iqr: {
    count: number;
    percentage: number;
    lower_bound: number;
    upper_bound: number;
  };
  zscore: {
    count: number;
    percentage: number;
  };
}

interface OutlierTreatment {
  outliers_before: number;
  outliers_after: number;
  lower_bound: number;
  upper_bound: number;
  method: string;
}

interface PreprocessingReport {
  original_records: number;
  final_records: number;
  missing_values: {
    analysis: {
      total_records: number;
      missing_by_column: Record<string, MissingValueInfo>;
      total_missing: number;
      records_with_missing: number;
    };
    strategies: Record<string, string>;
  };
  outliers: {
    analysis: Record<string, OutlierInfo>;
    treatment: Record<string, OutlierTreatment>;
  };
  normalization: {
    method: string;
    features_normalized: string[];
  };
  summary_stats: {
    price: { mean: number; std: number; min: number; max: number };
    units_sold: { mean: number; std: number; min: number; max: number };
    profit: { mean: number; std: number; min: number; max: number };
  };
}

interface ClusteringResults {
  elbow_method: Record<string, number>;
  optimal_k: number;
  kmeans_info: {
    iterations: number;
    converged: boolean;
    wcss: number;
  };
  cluster_statistics: Record<string, {
    count: number;
    avg_price: number;
    avg_units_sold: number;
    avg_profit: number;
    avg_promotion_frequency: number;
  }>;
  cluster_names: Record<string, string>;
}

interface RegressionResults {
  data_split: {
    train_size: number;
    test_size: number;
  };
  linear_regression: {
    test_metrics: {
      mse: number;
      mae: number;
      rmse: number;
      r2_score: number;
    };
  };
  polynomial_regression: {
    test_metrics: {
      mse: number;
      mae: number;
      rmse: number;
      r2_score: number;
    };
  };
  comparison: {
    best_model: string;
    best_reason: string;
  };
}

export default function MLPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preprocessingReport, setPreprocessingReport] = useState<PreprocessingReport | null>(null);
  const [clusteringResults, setClusteringResults] = useState<ClusteringResults | null>(null);
  const [regressionResults, setRegressionResults] = useState<RegressionResults | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisComplete(false);

    try {
      const response = await fetch('/ml/api/analyze');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      if (result.data.preprocessingReport) {
        setPreprocessingReport(result.data.preprocessingReport);
      }
      if (result.data.clusteringResults) {
        setClusteringResults(result.data.clusteringResults);
      }
      if (result.data.regressionResults) {
        setRegressionResults(result.data.regressionResults);
      }

      setAnalysisComplete(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to run analysis';
      setError(errorMessage);
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Machine Learning Analysis</h1>
          <p className="text-muted-foreground">
            K-means Clustering and Regression Analysis for Product Sales Data
          </p>
        </div>

        {/* Run Analysis Button */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5" />
              Run Complete Analysis
            </CardTitle>
            <CardDescription>
              Execute preprocessing, clustering, and regression analysis.
              <br />
              <span className="text-xs text-muted-foreground mt-1 block">
                Note: Ensure Python dependencies are installed (pip install -r ml_analysis/requirements.txt)
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Running Analysis...
                </>
              ) : (
                <>
                  <BarChart3 className="mr-2 size-4" />
                  Start Analysis
                </>
              )}
            </Button>
            {error && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2">
                <XCircle className="size-5 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            {analysisComplete && !error && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-md flex items-center gap-2">
                <CheckCircle2 className="size-5 text-green-500" />
                <p className="text-sm text-green-500">Analysis completed successfully!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Overview Section */}
        {preprocessingReport && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="size-5" />
                Data Overview
              </CardTitle>
              <CardDescription>
                Dataset statistics and preprocessing summary
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Original Records</p>
                  <p className="text-2xl font-bold">{preprocessingReport.original_records}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Final Records</p>
                  <p className="text-2xl font-bold">{preprocessingReport.final_records}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Missing Values</p>
                  <p className="text-2xl font-bold">
                    {preprocessingReport.missing_values.analysis.total_missing}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Normalization</p>
                  <p className="text-lg font-semibold capitalize">
                    {preprocessingReport.normalization.method}
                  </p>
                </div>
              </div>

              {/* Missing Values Details */}
              {preprocessingReport.missing_values.analysis.missing_by_column && 
               Object.keys(preprocessingReport.missing_values.analysis.missing_by_column).length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Missing Values Analysis</h3>
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    {Object.entries(preprocessingReport.missing_values.analysis.missing_by_column).map(([col, info]) => (
                      <div key={col} className="flex justify-between items-center text-sm">
                        <span className="font-medium">{col}:</span>
                        <span className="text-muted-foreground">
                          {info.count} missing ({info.percentage.toFixed(1)}%) - {preprocessingReport.missing_values.strategies[col] || 'No strategy'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Outliers Details */}
              {preprocessingReport.outliers.analysis && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Outlier Detection</h3>
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    {Object.entries(preprocessingReport.outliers.analysis).slice(0, 3).map(([col, info]) => (
                      <div key={col} className="text-sm">
                        <span className="font-medium">{col}:</span>
                        <span className="text-muted-foreground ml-2">
                          IQR: {info.iqr.count} outliers ({info.iqr.percentage.toFixed(1)}%) | 
                          Z-score: {info.zscore.count} outliers ({info.zscore.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-semibold">Summary Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium mb-2">Price</p>
                    <p className="text-xs text-muted-foreground">
                      Mean: ${preprocessingReport.summary_stats.price.mean.toFixed(2)} | 
                      Range: ${preprocessingReport.summary_stats.price.min.toFixed(2)} - ${preprocessingReport.summary_stats.price.max.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium mb-2">Units Sold</p>
                    <p className="text-xs text-muted-foreground">
                      Mean: {preprocessingReport.summary_stats.units_sold.mean.toFixed(0)} | 
                      Range: {preprocessingReport.summary_stats.units_sold.min.toFixed(0)} - {preprocessingReport.summary_stats.units_sold.max.toFixed(0)}
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium mb-2">Profit</p>
                    <p className="text-xs text-muted-foreground">
                      Mean: ${preprocessingReport.summary_stats.profit.mean.toFixed(2)} | 
                      Range: ${preprocessingReport.summary_stats.profit.min.toFixed(2)} - ${preprocessingReport.summary_stats.profit.max.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Clustering Results Section */}
        {clusteringResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-5" />
                Clustering Results
              </CardTitle>
              <CardDescription>
                K-means clustering analysis and cluster characteristics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Elbow Curve */}
              <div>
                <h3 className="font-semibold mb-3">Elbow Method</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm mb-2">Optimal K: <span className="font-bold">{clusteringResults.optimal_k}</span></p>
                  <p className="text-sm mb-3">WCSS Values:</p>
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                    {Object.entries(clusteringResults.elbow_method).map(([k, wcss]) => (
                      <div key={k} className="text-center p-2 bg-background rounded">
                        <p className="text-xs font-medium">k={k}</p>
                        <p className="text-xs text-muted-foreground">{wcss.toFixed(0)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <Image
                    src="/ml_results/elbow_curve.png"
                    alt="Elbow Curve"
                    width={800}
                    height={400}
                    className="border rounded-lg"
                  />
                </div>
              </div>

              {/* Cluster Visualization */}
              <div>
                <h3 className="font-semibold mb-3">Cluster Visualization</h3>
                <Image
                  src="/ml_results/clusters_2d.png"
                  alt="Cluster Visualization"
                  width={800}
                  height={600}
                  className="border rounded-lg"
                />
              </div>

              {/* Cluster Statistics */}
              <div>
                <h3 className="font-semibold mb-3">Cluster Statistics</h3>
                <div className="space-y-4">
                  {Object.entries(clusteringResults.cluster_statistics).map(([clusterId, stats]) => {
                    const clusterName = clusteringResults.cluster_names[clusterId] || clusterId;
                    return (
                      <div key={clusterId} className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">{clusterName}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Products</p>
                            <p className="font-medium">{stats.count}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Avg Price</p>
                            <p className="font-medium">${stats.avg_price.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Avg Units Sold</p>
                            <p className="font-medium">{stats.avg_units_sold.toFixed(0)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Avg Profit</p>
                            <p className="font-medium">${stats.avg_profit.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Avg Promotions</p>
                            <p className="font-medium">{stats.avg_promotion_frequency.toFixed(1)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Regression Results Section */}
        {regressionResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5" />
                Regression Results
              </CardTitle>
              <CardDescription>
                Model comparison and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Model Comparison Table */}
              <div>
                <h3 className="font-semibold mb-3">Model Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border p-2 text-left">Model</th>
                        <th className="border p-2">MSE</th>
                        <th className="border p-2">MAE</th>
                        <th className="border p-2">RMSE</th>
                        <th className="border p-2">R² Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-2 font-medium">Linear Regression</td>
                        <td className="border p-2">{regressionResults.linear_regression.test_metrics.mse.toFixed(2)}</td>
                        <td className="border p-2">{regressionResults.linear_regression.test_metrics.mae.toFixed(2)}</td>
                        <td className="border p-2">{regressionResults.linear_regression.test_metrics.rmse.toFixed(2)}</td>
                        <td className="border p-2">{regressionResults.linear_regression.test_metrics.r2_score.toFixed(4)}</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-medium">Polynomial Regression</td>
                        <td className="border p-2">{regressionResults.polynomial_regression.test_metrics.mse.toFixed(2)}</td>
                        <td className="border p-2">{regressionResults.polynomial_regression.test_metrics.mae.toFixed(2)}</td>
                        <td className="border p-2">{regressionResults.polynomial_regression.test_metrics.rmse.toFixed(2)}</td>
                        <td className="border p-2">{regressionResults.polynomial_regression.test_metrics.r2_score.toFixed(4)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm">
                    <span className="font-semibold">Best Model:</span> {regressionResults.comparison.best_model}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {regressionResults.comparison.best_reason}
                  </p>
                </div>
              </div>

              {/* Regression Visualization */}
              <div>
                <h3 className="font-semibold mb-3">Actual vs Predicted</h3>
                <Image
                  src="/ml_results/regression_comparison.png"
                  alt="Regression Comparison"
                  width={800}
                  height={600}
                  className="border rounded-lg"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

