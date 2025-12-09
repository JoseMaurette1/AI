"""
Regression Analysis Module
Implements Linear and Polynomial Regression for profit prediction
"""
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error
from typing import Dict, Any, Tuple
import json

def prepare_regression_data(df: pd.DataFrame, target: str = 'profit') -> Tuple[np.ndarray, np.ndarray, list]:
    """
    Prepare data for regression
    Returns: X (features), y (target), feature_names
    """
    # Select features (excluding target and non-numerical)
    feature_cols = ['price', 'cost', 'units_sold', 'promotion_frequency', 'shelf_level']
    X = df[feature_cols].values
    y = df[target].values
    return X, y, feature_cols

def train_linear_regression(X_train: np.ndarray, y_train: np.ndarray) -> Tuple[LinearRegression, Dict[str, Any]]:
    """
    Train linear regression model
    Returns: trained model and model info
    """
    model = LinearRegression()
    model.fit(X_train, y_train)
    
    # Calculate training metrics
    y_train_pred = model.predict(X_train)
    train_mse = mean_squared_error(y_train, y_train_pred)
    train_mae = mean_absolute_error(y_train, y_train_pred)
    
    info = {
        "type": "Linear Regression",
        "coefficients": model.coef_.tolist(),
        "intercept": float(model.intercept_),
        "train_mse": float(train_mse),
        "train_mae": float(train_mae),
        "r2_score": float(model.score(X_train, y_train))
    }
    
    return model, info

def train_polynomial_regression(X_train: np.ndarray, y_train: np.ndarray, 
                                degree: int = 2) -> Tuple[LinearRegression, PolynomialFeatures, Dict[str, Any]]:
    """
    Train polynomial regression model
    Returns: trained model, polynomial transformer, and model info
    """
    # Create polynomial features
    poly = PolynomialFeatures(degree=degree, include_bias=False)
    X_train_poly = poly.fit_transform(X_train)
    
    # Train linear regression on polynomial features
    model = LinearRegression()
    model.fit(X_train_poly, y_train)
    
    # Calculate training metrics
    y_train_pred = model.predict(X_train_poly)
    train_mse = mean_squared_error(y_train, y_train_pred)
    train_mae = mean_absolute_error(y_train, y_train_pred)
    
    info = {
        "type": f"Polynomial Regression (degree={degree})",
        "degree": degree,
        "n_features": X_train_poly.shape[1],
        "train_mse": float(train_mse),
        "train_mae": float(train_mae),
        "r2_score": float(model.score(X_train_poly, y_train))
    }
    
    return model, poly, info

def evaluate_model(model: LinearRegression, X_test: np.ndarray, y_test: np.ndarray,
                  poly_transformer: PolynomialFeatures = None) -> Dict[str, float]:
    """
    Evaluate regression model on test data
    Returns: dictionary with evaluation metrics
    """
    if poly_transformer is not None:
        X_test_transformed = poly_transformer.transform(X_test)
    else:
        X_test_transformed = X_test
    
    y_pred = model.predict(X_test_transformed)
    
    mse = mean_squared_error(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    
    # Calculate R² score
    ss_res = np.sum((y_test - y_pred) ** 2)
    ss_tot = np.sum((y_test - np.mean(y_test)) ** 2)
    r2 = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0
    
    return {
        "mse": float(mse),
        "mae": float(mae),
        "rmse": float(rmse),
        "r2_score": float(r2),
        "predictions": y_pred.tolist(),
        "actual": y_test.tolist()
    }

def compare_models(df: pd.DataFrame, test_size: float = 0.3, 
                  polynomial_degree: int = 2, random_seed: int = 42) -> Dict[str, Any]:
    """
    Compare Linear and Polynomial Regression models
    Returns: comprehensive comparison results
    """
    # Prepare data
    X, y, feature_names = prepare_regression_data(df)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_seed
    )
    
    # Train Linear Regression
    linear_model, linear_info = train_linear_regression(X_train, y_train)
    linear_results = evaluate_model(linear_model, X_test, y_test)
    
    # Train Polynomial Regression
    poly_model, poly_transformer, poly_info = train_polynomial_regression(
        X_train, y_train, degree=polynomial_degree
    )
    poly_results = evaluate_model(poly_model, X_test, y_test, poly_transformer)
    
    # Determine best model
    if linear_results["mse"] < poly_results["mse"]:
        best_model = "Linear Regression"
        best_reason = "Lower MSE on test set"
    else:
        best_model = f"Polynomial Regression (degree={polynomial_degree})"
        best_reason = "Lower MSE on test set"
    
    # Check for overfitting
    linear_overfitting = linear_info["train_mse"] < linear_results["mse"] * 1.5
    poly_overfitting = poly_info["train_mse"] < poly_results["mse"] * 1.5
    
    comparison = {
        "data_split": {
            "train_size": len(X_train),
            "test_size": len(X_test),
            "test_percentage": test_size * 100
        },
        "linear_regression": {
            "model_info": linear_info,
            "test_metrics": {
                "mse": linear_results["mse"],
                "mae": linear_results["mae"],
                "rmse": linear_results["rmse"],
                "r2_score": linear_results["r2_score"]
            },
            "overfitting": linear_overfitting
        },
        "polynomial_regression": {
            "model_info": poly_info,
            "test_metrics": {
                "mse": poly_results["mse"],
                "mae": poly_results["mae"],
                "rmse": poly_results["rmse"],
                "r2_score": poly_results["r2_score"]
            },
            "overfitting": poly_overfitting
        },
        "comparison": {
            "best_model": best_model,
            "best_reason": best_reason,
            "mse_difference": abs(linear_results["mse"] - poly_results["mse"]),
            "mae_difference": abs(linear_results["mae"] - poly_results["mae"])
        },
        "predictions": {
            "linear": {
                "actual": linear_results["actual"],
                "predicted": linear_results["predictions"]
            },
            "polynomial": {
                "actual": poly_results["actual"],
                "predicted": poly_results["predictions"]
            }
        }
    }
    
    return comparison

if __name__ == "__main__":
    from preprocessing import preprocess_data
    
    # Load and preprocess data
    df, _ = preprocess_data("product_sales.csv")
    
    # Run regression comparison
    results = compare_models(df, polynomial_degree=2)
    
    print(json.dumps(results, indent=2))

