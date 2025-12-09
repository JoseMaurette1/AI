"""
Data Preprocessing Module
Handles missing values, outliers, and normalization
"""
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple
import json

def load_data(file_path: str) -> pd.DataFrame:
    """Load the product sales CSV file"""
    return pd.read_csv(file_path)

def analyze_missing_values(df: pd.DataFrame) -> Dict[str, Any]:
    """Analyze missing values in the dataset"""
    missing_counts = df.isnull().sum()
    missing_percentages = (missing_counts / len(df)) * 100
    
    analysis = {
        "total_records": len(df),
        "missing_by_column": {},
        "total_missing": int(missing_counts.sum()),
        "records_with_missing": int(df.isnull().any(axis=1).sum())
    }
    
    for col in df.columns:
        if missing_counts[col] > 0:
            analysis["missing_by_column"][col] = {
                "count": int(missing_counts[col]),
                "percentage": float(missing_percentages[col])
            }
    
    return analysis

def handle_missing_values(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, str]]:
    """
    Handle missing values in the dataset
    Strategy:
    - product_name: Fill with "Unknown"
    - Numerical columns: Fill with median (more robust to outliers)
    - category: Fill with mode
    """
    df_cleaned = df.copy()
    strategies = {}
    
    # Handle product_name (categorical)
    if df_cleaned['product_name'].isnull().any():
        df_cleaned['product_name'].fillna('Unknown', inplace=True)
        strategies['product_name'] = 'Filled with "Unknown"'
    
    # Handle category (categorical)
    if df_cleaned['category'].isnull().any():
        mode_category = df_cleaned['category'].mode()[0] if not df_cleaned['category'].mode().empty else 'Unknown'
        df_cleaned['category'].fillna(mode_category, inplace=True)
        strategies['category'] = f'Filled with mode: {mode_category}'
    
    # Handle numerical columns with median
    numerical_cols = ['price', 'cost', 'units_sold', 'promotion_frequency', 'shelf_level', 'profit']
    for col in numerical_cols:
        if df_cleaned[col].isnull().any():
            median_val = df_cleaned[col].median()
            df_cleaned[col].fillna(median_val, inplace=True)
            strategies[col] = f'Filled with median: {median_val:.2f}'
    
    return df_cleaned, strategies

def detect_outliers_iqr(df: pd.DataFrame, column: str) -> Tuple[np.ndarray, float, float]:
    """
    Detect outliers using IQR method
    Returns: outlier indices, lower bound, upper bound
    """
    Q1 = df[column].quantile(0.25)
    Q3 = df[column].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    
    outliers = ((df[column] < lower_bound) | (df[column] > upper_bound)).values
    return outliers, lower_bound, upper_bound

def detect_outliers_zscore(df: pd.DataFrame, column: str, threshold: float = 3.0) -> Tuple[np.ndarray, int]:
    """
    Detect outliers using Z-score method
    Returns: outlier indices, count of outliers
    """
    z_scores = np.abs((df[column] - df[column].mean()) / df[column].std())
    outliers = (z_scores > threshold).values
    return outliers, int(outliers.sum())

def analyze_outliers(df: pd.DataFrame) -> Dict[str, Any]:
    """Analyze outliers across numerical columns"""
    numerical_cols = ['price', 'cost', 'units_sold', 'promotion_frequency', 'shelf_level', 'profit']
    analysis = {}
    
    for col in numerical_cols:
        iqr_outliers, lower_bound, upper_bound = detect_outliers_iqr(df, col)
        zscore_outliers, zscore_count = detect_outliers_zscore(df, col)
        
        analysis[col] = {
            "iqr": {
                "count": int(iqr_outliers.sum()),
                "percentage": float((iqr_outliers.sum() / len(df)) * 100),
                "lower_bound": float(lower_bound),
                "upper_bound": float(upper_bound)
            },
            "zscore": {
                "count": zscore_count,
                "percentage": float((zscore_count / len(df)) * 100)
            }
        }
    
    return analysis

def handle_outliers(df: pd.DataFrame, method: str = 'cap') -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Handle outliers
    Strategy: Cap outliers at IQR bounds (keep data but limit extreme values)
    """
    df_cleaned = df.copy()
    numerical_cols = ['price', 'cost', 'units_sold', 'promotion_frequency', 'shelf_level', 'profit']
    treatment_info = {}
    
    for col in numerical_cols:
        _, lower_bound, upper_bound = detect_outliers_iqr(df, col)
        
        # Cap outliers
        outliers_before = ((df[col] < lower_bound) | (df[col] > upper_bound)).sum()
        
        if outliers_before > 0:
            df_cleaned[col] = df_cleaned[col].clip(lower=lower_bound, upper=upper_bound)
            outliers_after = ((df_cleaned[col] < lower_bound) | (df_cleaned[col] > upper_bound)).sum()
            
            treatment_info[col] = {
                "outliers_before": int(outliers_before),
                "outliers_after": int(outliers_after),
                "lower_bound": float(lower_bound),
                "upper_bound": float(upper_bound),
                "method": "capped"
            }
    
    return df_cleaned, treatment_info

def normalize_minmax(df: pd.DataFrame, columns: list) -> Tuple[pd.DataFrame, Dict[str, Dict[str, float]]]:
    """
    Min-Max normalization (0-1 scaling)
    Returns: normalized dataframe and scaling parameters
    """
    df_normalized = df.copy()
    scaling_params = {}
    
    for col in columns:
        min_val = df[col].min()
        max_val = df[col].max()
        
        if max_val != min_val:
            df_normalized[col] = (df[col] - min_val) / (max_val - min_val)
            scaling_params[col] = {
                "min": float(min_val),
                "max": float(max_val),
                "method": "minmax"
            }
    
    return df_normalized, scaling_params

def standardize_zscore(df: pd.DataFrame, columns: list) -> Tuple[pd.DataFrame, Dict[str, Dict[str, float]]]:
    """
    Z-score standardization (mean=0, std=1)
    Returns: standardized dataframe and scaling parameters
    """
    df_standardized = df.copy()
    scaling_params = {}
    
    for col in columns:
        mean_val = df[col].mean()
        std_val = df[col].std()
        
        if std_val != 0:
            df_standardized[col] = (df[col] - mean_val) / std_val
            scaling_params[col] = {
                "mean": float(mean_val),
                "std": float(std_val),
                "method": "zscore"
            }
    
    return df_standardized, scaling_params

def preprocess_data(file_path: str, normalize_method: str = 'minmax') -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Complete preprocessing pipeline
    Returns: preprocessed dataframe and preprocessing report
    """
    # Load data
    df = load_data(file_path)
    
    # Analyze missing values
    missing_analysis = analyze_missing_values(df)
    
    # Handle missing values
    df_cleaned, missing_strategies = handle_missing_values(df)
    
    # Analyze outliers
    outlier_analysis = analyze_outliers(df_cleaned)
    
    # Handle outliers
    df_final, outlier_treatment = handle_outliers(df_cleaned)
    
    # Normalize/Standardize numerical features
    numerical_features = ['price', 'cost', 'units_sold', 'promotion_frequency', 'shelf_level']
    
    if normalize_method == 'minmax':
        df_normalized, scaling_params = normalize_minmax(df_final, numerical_features)
    else:
        df_normalized, scaling_params = standardize_zscore(df_final, numerical_features)
    
    # Create preprocessing report
    report = {
        "original_records": len(df),
        "final_records": len(df_normalized),
        "missing_values": {
            "analysis": missing_analysis,
            "strategies": missing_strategies
        },
        "outliers": {
            "analysis": outlier_analysis,
            "treatment": outlier_treatment
        },
        "normalization": {
            "method": normalize_method,
            "features_normalized": numerical_features,
            "scaling_parameters": scaling_params
        },
        "summary_stats": {
            "price": {
                "mean": float(df_normalized['price'].mean()),
                "std": float(df_normalized['price'].std()),
                "min": float(df_normalized['price'].min()),
                "max": float(df_normalized['price'].max())
            },
            "units_sold": {
                "mean": float(df_normalized['units_sold'].mean()),
                "std": float(df_normalized['units_sold'].std()),
                "min": float(df_normalized['units_sold'].min()),
                "max": float(df_normalized['units_sold'].max())
            },
            "profit": {
                "mean": float(df_normalized['profit'].mean()),
                "std": float(df_normalized['profit'].std()),
                "min": float(df_normalized['profit'].min()),
                "max": float(df_normalized['profit'].max())
            }
        }
    }
    
    return df_normalized, report

if __name__ == "__main__":
    import sys
    csv_path = sys.argv[1] if len(sys.argv) > 1 else "product_sales.csv"
    df, report = preprocess_data(csv_path)
    print(json.dumps(report, indent=2))
    print(f"\nPreprocessed data shape: {df.shape}")

