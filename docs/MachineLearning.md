# Machine Learning Analysis - Product Sales Data

This project implements K-means clustering and regression analysis for supermarket product sales data, analyzing 200 products to discover patterns and predict performance.

## Overview

The analysis pipeline consists of three main stages:
1. **Data Preprocessing** - Clean and prepare the dataset
2. **K-means Clustering** - Group products into meaningful clusters
3. **Regression Analysis** - Predict product profit using multiple models

## Project Structure

### Core Modules

#### `preprocessing.py`
Handles all data cleaning and preparation:
- **Missing Values**: Detects and imputes missing data (median for numerical, mode for categorical)
- **Outlier Detection**: Uses IQR and Z-score methods to identify outliers
- **Outlier Treatment**: Caps outliers at IQR bounds to preserve data while limiting extremes
- **Normalization**: Applies Min-Max scaling (0-1) for K-means clustering

**Key Functions:**
- `preprocess_data()` - Complete preprocessing pipeline
- `analyze_missing_values()` - Missing value analysis
- `detect_outliers_iqr()` / `detect_outliers_zscore()` - Outlier detection
- `normalize_minmax()` - Feature normalization

#### `kmeans.py`
Implements K-means clustering algorithm **from scratch** (no sklearn):
- **K-means++ Initialization**: Smart centroid initialization for better convergence
- **Cluster Assignment**: Assigns each point to nearest centroid using Euclidean distance
- **Centroid Updates**: Recalculates centroids based on cluster assignments
- **Elbow Method**: Determines optimal number of clusters (k=2 to 8)
- **Cluster Analysis**: Generates statistics and meaningful names for each cluster

**Key Functions:**
- `kmeans()` - Main clustering algorithm
- `elbow_method()` - Finds optimal k value
- `analyze_clusters()` - Cluster statistics and interpretation
- `name_clusters()` - Auto-generates descriptive cluster names

#### `regression.py`
Predicts product profit using regression models:
- **Linear Regression**: Simple linear relationship between features and profit
- **Polynomial Regression**: Captures non-linear patterns (degree=2)
- **Model Comparison**: Evaluates using MSE, MAE, RMSE, and R²
- **Train/Test Split**: 70-30 split for proper evaluation

**Key Functions:**
- `compare_models()` - Trains and compares both regression models
- `train_linear_regression()` - Linear model training
- `train_polynomial_regression()` - Polynomial model training
- `evaluate_model()` - Performance metrics calculation

#### `main_analysis.py`
Orchestrates the complete analysis pipeline:
- Runs preprocessing, clustering, and regression sequentially
- Generates visualizations (elbow curve, cluster plot, regression comparison)
- Saves results as JSON files and PNG images
- Creates comprehensive final report

**Output Files:**
- `ml_results/` - JSON files with analysis results
- `public/ml_results/` - Visualization images (PNG)

## How It Works

### 1. Data Preprocessing
```
Raw CSV → Missing Value Handling → Outlier Treatment → Normalization → Clean Data
```

The preprocessing module:
- Identifies 4 missing product names (filled with "Unknown")
- Detects outliers using IQR method (10-15% of data)
- Caps outliers to preserve data while reducing impact
- Normalizes numerical features to 0-1 range for K-means

### 2. K-means Clustering
```
Normalized Features → Elbow Method → Optimal K Selection → Clustering → Analysis
```

The clustering process:
- Tests k values from 2 to 8
- Calculates WCSS (Within-Cluster Sum of Squares) for each k
- Selects optimal k=4 based on elbow curve
- Groups products into clusters (e.g., "Budget Best-Sellers", "Premium Low-Volume")
- Analyzes cluster characteristics (price, units sold, profit, promotions)

### 3. Regression Analysis
```
Features (price, cost, units_sold, etc.) → Model Training → Prediction → Evaluation
```

The regression process:
- Splits data into training (70%) and testing (30%) sets
- Trains Linear and Polynomial Regression models
- Compares performance using multiple metrics
- Identifies best model (typically Polynomial Regression)
- Visualizes actual vs predicted values

## Usage

### Setup
```bash
pip install -r requirements.txt
```

### Run Complete Analysis
```bash
python main_analysis.py product_sales.csv
```

### Run Individual Components
```bash
# Preprocessing only
python preprocessing.py product_sales.csv

# Clustering only (requires preprocessed data)
python kmeans.py

# Regression only (requires preprocessed data)
python regression.py
```

### Via Web Interface
Navigate to `/ml` in the Next.js app and click "Start Analysis" to run the complete pipeline through the web interface.

## Results

The analysis generates:
- **Preprocessing Report**: Missing values, outliers, normalization details
- **Clustering Results**: Optimal k, cluster statistics, named clusters
- **Regression Results**: Model comparison, performance metrics, predictions
- **Visualizations**: Elbow curve, 2D cluster plot, actual vs predicted scatter plot

## Key Insights

- **4 Product Clusters**: Budget Best-Sellers, Premium Low-Volume, Mid-Range Steady, High-Value Performers
- **Best Regression Model**: Polynomial Regression (degree=2) with R² = 0.93
- **Data Quality**: 4 missing values, ~10% outliers detected and treated
- **Normalization**: Min-Max scaling ensures K-means works effectively with different feature scales

## Dependencies

- `pandas` - Data manipulation
- `numpy` - Numerical operations
- `scikit-learn` - Regression models (LinearRegression, PolynomialFeatures)
- `matplotlib` - Plotting
- `seaborn` - Enhanced visualizations
