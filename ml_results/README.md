# ML Analysis Results

This directory contains pre-generated ML analysis results for deployment.

## Files

- `preprocessing_report.json` - Data preprocessing analysis
- `clustering_results.json` - K-means clustering results
- `regression_results.json` - Regression model comparison
- `final_report.json` - Complete analysis report

## Regenerating Results

To regenerate these results locally:

```bash
python3 ml_analysis/main_analysis.py public/product_sales.csv
```

**Important**: These files must be committed to git for Vercel deployment, as Python is not available in the Vercel runtime.

