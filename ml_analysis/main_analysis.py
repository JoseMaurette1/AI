"""
Main ML Analysis Script
Runs complete analysis pipeline and generates results
"""
import pandas as pd
import numpy as np
import json
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import os

from preprocessing import preprocess_data
from kmeans import kmeans, elbow_method, analyze_clusters, name_clusters
from regression import compare_models

# Set style
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (12, 8)

def create_output_directory():
    """Create output directory for results"""
    # Save to public directory so Next.js can serve the images
    output_dir = Path("public/ml_results")
    output_dir.mkdir(parents=True, exist_ok=True)
    return output_dir

def plot_elbow_curve(wcss_values: dict, output_path: str):
    """Plot elbow curve for K-means"""
    k_values = list(wcss_values.keys())
    wcss_list = list(wcss_values.values())
    
    plt.figure(figsize=(10, 6))
    plt.plot(k_values, wcss_list, 'bo-', linewidth=2, markersize=8)
    plt.xlabel('Number of Clusters (k)', fontsize=12)
    plt.ylabel('Within-Cluster Sum of Squares (WCSS)', fontsize=12)
    plt.title('Elbow Method for Optimal K', fontsize=14, fontweight='bold')
    plt.grid(True, alpha=0.3)
    plt.xticks(k_values)
    
    # Add value labels
    for k, wcss in zip(k_values, wcss_list):
        plt.text(k, wcss, f'{wcss:.0f}', ha='center', va='bottom')
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()

def plot_clusters_2d(df: pd.DataFrame, assignments: np.ndarray, centroids: np.ndarray,
                    x_col: str, y_col: str, cluster_names: dict, output_path: str):
    """Plot 2D cluster visualization"""
    k = len(centroids)
    colors = plt.cm.tab10(np.linspace(0, 1, k))
    
    plt.figure(figsize=(12, 8))
    
    # Plot data points
    for i in range(k):
        cluster_mask = assignments == i
        cluster_data = df[cluster_mask]
        plt.scatter(cluster_data[x_col], cluster_data[y_col], 
                   c=[colors[i]], label=cluster_names.get(f'cluster_{i}', f'Cluster {i}'),
                   alpha=0.6, s=100, edgecolors='black', linewidth=0.5)
    
    # Plot centroids
    plt.scatter(centroids[:, 0], centroids[:, 1], 
               c='red', marker='X', s=300, label='Centroids',
               edgecolors='black', linewidth=2, zorder=10)
    
    plt.xlabel(x_col.replace('_', ' ').title(), fontsize=12)
    plt.ylabel(y_col.replace('_', ' ').title(), fontsize=12)
    plt.title('K-means Clustering Results', fontsize=14, fontweight='bold')
    plt.legend(loc='best', fontsize=10)
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()

def plot_regression_comparison(regression_results: dict, output_path: str):
    """Plot actual vs predicted for best regression model"""
    best_model = regression_results["comparison"]["best_model"]
    
    if "Polynomial" in best_model:
        actual = regression_results["predictions"]["polynomial"]["actual"]
        predicted = regression_results["predictions"]["polynomial"]["predicted"]
        model_label = "Polynomial Regression"
    else:
        actual = regression_results["predictions"]["linear"]["actual"]
        predicted = regression_results["predictions"]["linear"]["predicted"]
        model_label = "Linear Regression"
    
    plt.figure(figsize=(10, 8))
    
    # Scatter plot
    plt.scatter(actual, predicted, alpha=0.6, s=80, edgecolors='black', linewidth=0.5)
    
    # Perfect prediction line
    min_val = min(min(actual), min(predicted))
    max_val = max(max(actual), max(predicted))
    plt.plot([min_val, max_val], [min_val, max_val], 
            'r--', linewidth=2, label='Perfect Prediction')
    
    plt.xlabel('Actual Profit ($)', fontsize=12)
    plt.ylabel('Predicted Profit ($)', fontsize=12)
    plt.title(f'Actual vs Predicted: {model_label}', fontsize=14, fontweight='bold')
    plt.legend(fontsize=10)
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()

def run_complete_analysis(csv_path: str = "product_sales.csv", 
                         optimal_k: int = None, 
                         output_dir: str = "ml_results",
                         image_output_dir: str = "public/ml_results"):
    """
    Run complete ML analysis pipeline
    Returns: dictionary with all results
    """
    # Create output directories
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    # Create image output directory (for Next.js public folder)
    image_output_path = Path(image_output_dir)
    image_output_path.mkdir(parents=True, exist_ok=True)
    
    print("Step 1: Data Preprocessing...")
    df_preprocessed, preprocess_report = preprocess_data(csv_path, normalize_method='minmax')
    
    # Save preprocessing report
    with open(output_path / "preprocessing_report.json", "w") as f:
        json.dump(preprocess_report, f, indent=2)
    
    print("Step 2: K-means Clustering Analysis...")
    # Select features for clustering (using original scale for interpretation)
    df_original, _ = preprocess_data(csv_path, normalize_method='minmax')
    feature_cols = ['price', 'units_sold']
    X_cluster = df_original[feature_cols].values
    
    # Run elbow method
    k_range = [2, 3, 4, 5, 6, 7, 8]
    wcss_values = elbow_method(X_cluster, k_range, random_seed=42)
    
    # Plot elbow curve (save to both locations)
    plot_elbow_curve(wcss_values, str(image_output_path / "elbow_curve.png"))
    
    # Determine optimal k (if not provided, use elbow method)
    if optimal_k is None:
        # Simple elbow detection: find k where decrease starts to level off
        k_list = sorted(wcss_values.keys())
        decreases = [wcss_values[k_list[i]] - wcss_values[k_list[i+1]] 
                    for i in range(len(k_list)-1)]
        # Find where decrease becomes small
        optimal_k = 4  # Default, can be improved with better elbow detection
    
    # Run K-means with optimal k
    assignments, centroids, kmeans_info = kmeans(X_cluster, optimal_k, random_seed=42)
    
    # Analyze clusters
    cluster_stats = analyze_clusters(df_original, assignments, centroids, feature_cols)
    cluster_names = name_clusters(cluster_stats)
    
    # Plot clusters (save to image directory)
    plot_clusters_2d(df_original, assignments, centroids, 
                    'price', 'units_sold', cluster_names,
                    str(image_output_path / "clusters_2d.png"))
    
    # Prepare clustering results
    clustering_results = {
        "elbow_method": {str(k): float(wcss) for k, wcss in wcss_values.items()},
        "optimal_k": optimal_k,
        "kmeans_info": kmeans_info,
        "cluster_statistics": cluster_stats,
        "cluster_names": cluster_names
    }
    
    # Save clustering results
    with open(output_path / "clustering_results.json", "w") as f:
        json.dump(clustering_results, f, indent=2)
    
    print("Step 3: Regression Analysis...")
    # Run regression comparison
    regression_results = compare_models(df_preprocessed, test_size=0.3, 
                                       polynomial_degree=2, random_seed=42)
    
    # Plot regression results (save to image directory)
    plot_regression_comparison(regression_results, 
                              str(image_output_path / "regression_comparison.png"))
    
    # Save regression results
    with open(output_path / "regression_results.json", "w") as f:
        json.dump(regression_results, f, indent=2)
    
    print("Step 4: Compiling Final Report...")
    # Compile final report
    final_report = {
        "data_overview": {
            "original_records": preprocess_report["original_records"],
            "final_records": preprocess_report["final_records"],
            "summary_statistics": preprocess_report["summary_stats"]
        },
        "preprocessing": preprocess_report,
        "clustering": clustering_results,
        "regression": regression_results
    }
    
    # Save final report
    with open(output_path / "final_report.json", "w") as f:
        json.dump(final_report, f, indent=2)
    
    print(f"\nAnalysis complete! Results saved to {output_path}/ and images to {image_output_path}/")
    return final_report

if __name__ == "__main__":
    import sys
    import os
    # Get CSV path from command line argument or use default
    csv_path = sys.argv[1] if len(sys.argv) > 1 else "product_sales.csv"
    
    # If path is relative, make it relative to project root (where script is called from)
    if not os.path.isabs(csv_path):
        # Try to find CSV in current directory or parent
        if os.path.exists(csv_path):
            csv_path = os.path.abspath(csv_path)
        elif os.path.exists(os.path.join("..", csv_path)):
            csv_path = os.path.abspath(os.path.join("..", csv_path))
    
    # Run analysis
    report = run_complete_analysis(csv_path, optimal_k=4)
    print("\nAnalysis Summary:")
    print(f"- Preprocessed {report['data_overview']['original_records']} records")
    print(f"- Optimal clusters: {report['clustering']['optimal_k']}")
    print(f"- Best regression model: {report['regression']['comparison']['best_model']}")

