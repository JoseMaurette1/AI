"""
K-means Clustering Implementation from Scratch
"""
import numpy as np
import pandas as pd
from typing import Tuple, List, Dict, Any
import json
import random

def euclidean_distance(point1: np.ndarray, point2: np.ndarray) -> float:
    """Calculate Euclidean distance between two points"""
    return np.sqrt(np.sum((point1 - point2) ** 2))

def initialize_centroids_kmeans_plusplus(data: np.ndarray, k: int, random_seed: int = None) -> np.ndarray:
    """
    Initialize centroids using K-means++ algorithm
    This method chooses initial centroids that are far apart
    """
    if random_seed is not None:
        np.random.seed(random_seed)
        random.seed(random_seed)
    
    n_samples, n_features = data.shape
    centroids = np.zeros((k, n_features))
    
    # Choose first centroid randomly
    centroids[0] = data[random.randint(0, n_samples - 1)]
    
    # Choose remaining centroids
    for i in range(1, k):
        distances = np.array([
            min([euclidean_distance(data[j], centroids[c]) for c in range(i)])
            for j in range(n_samples)
        ])
        
        # Probability proportional to distance squared
        probabilities = distances ** 2
        probabilities /= probabilities.sum()
        
        # Choose next centroid based on probabilities
        cumulative_probs = probabilities.cumsum()
        r = random.random()
        idx = np.searchsorted(cumulative_probs, r)
        centroids[i] = data[idx]
    
    return centroids

def initialize_centroids_random(data: np.ndarray, k: int, random_seed: int = None) -> np.ndarray:
    """Initialize centroids randomly"""
    if random_seed is not None:
        np.random.seed(random_seed)
    
    n_samples = data.shape[0]
    indices = np.random.choice(n_samples, k, replace=False)
    return data[indices]

def assign_clusters(data: np.ndarray, centroids: np.ndarray) -> np.ndarray:
    """
    Assign each data point to the nearest centroid
    Returns: array of cluster assignments
    """
    n_samples = data.shape[0]
    n_clusters = centroids.shape[0]
    assignments = np.zeros(n_samples, dtype=int)
    
    for i in range(n_samples):
        distances = [euclidean_distance(data[i], centroids[j]) for j in range(n_clusters)]
        assignments[i] = np.argmin(distances)
    
    return assignments

def update_centroids(data: np.ndarray, assignments: np.ndarray, k: int) -> np.ndarray:
    """
    Update centroids based on current cluster assignments
    Returns: new centroids
    """
    n_features = data.shape[1]
    centroids = np.zeros((k, n_features))
    
    for i in range(k):
        cluster_points = data[assignments == i]
        if len(cluster_points) > 0:
            centroids[i] = cluster_points.mean(axis=0)
        else:
            # If cluster is empty, keep previous centroid (or reinitialize)
            centroids[i] = data.mean(axis=0)
    
    return centroids

def calculate_wcss(data: np.ndarray, assignments: np.ndarray, centroids: np.ndarray) -> float:
    """
    Calculate Within-Cluster Sum of Squares (WCSS)
    Used for elbow method
    """
    wcss = 0.0
    for i in range(len(centroids)):
        cluster_points = data[assignments == i]
        if len(cluster_points) > 0:
            wcss += np.sum([euclidean_distance(point, centroids[i]) ** 2 for point in cluster_points])
    return wcss

def kmeans(data: np.ndarray, k: int, max_iterations: int = 100, 
          tolerance: float = 1e-4, init_method: str = 'kmeans++', 
          random_seed: int = None) -> Tuple[np.ndarray, np.ndarray, Dict[str, Any]]:
    """
    K-means clustering algorithm from scratch
    
    Parameters:
    - data: numpy array of shape (n_samples, n_features)
    - k: number of clusters
    - max_iterations: maximum number of iterations
    - tolerance: convergence threshold
    - init_method: 'kmeans++' or 'random'
    - random_seed: random seed for reproducibility
    
    Returns:
    - assignments: cluster assignments for each data point
    - centroids: final centroids
    - info: dictionary with algorithm information
    """
    # Initialize centroids
    if init_method == 'kmeans++':
        centroids = initialize_centroids_kmeans_plusplus(data, k, random_seed)
    else:
        centroids = initialize_centroids_random(data, k, random_seed)
    
    previous_centroids = centroids.copy()
    iterations = 0
    converged = False
    
    for iteration in range(max_iterations):
        # Assign points to nearest centroid
        assignments = assign_clusters(data, centroids)
        
        # Update centroids
        centroids = update_centroids(data, assignments, k)
        
        # Check for convergence
        centroid_shift = np.sum([euclidean_distance(centroids[i], previous_centroids[i]) 
                                 for i in range(k)])
        
        if centroid_shift < tolerance:
            converged = True
            break
        
        previous_centroids = centroids.copy()
        iterations += 1
    
    # Calculate WCSS
    wcss = calculate_wcss(data, assignments, centroids)
    
    info = {
        "iterations": iterations,
        "converged": converged,
        "wcss": float(wcss),
        "final_centroids": centroids.tolist()
    }
    
    return assignments, centroids, info

def elbow_method(data: np.ndarray, k_range: List[int], 
                init_method: str = 'kmeans++', random_seed: int = None) -> Dict[int, float]:
    """
    Perform elbow method to find optimal k
    Returns: dictionary mapping k to WCSS
    """
    wcss_values = {}
    
    for k in k_range:
        _, _, info = kmeans(data, k, init_method=init_method, random_seed=random_seed)
        wcss_values[k] = info["wcss"]
    
    return wcss_values

def analyze_clusters(df: pd.DataFrame, assignments: np.ndarray, centroids: np.ndarray, 
                    feature_cols: List[str]) -> Dict[str, Any]:
    """
    Analyze cluster characteristics
    Returns: dictionary with cluster statistics
    """
    k = len(centroids)
    cluster_stats = {}
    
    for i in range(k):
        cluster_mask = assignments == i
        cluster_data = df[cluster_mask]
        
        if len(cluster_data) == 0:
            continue
        
        stats = {
            "count": int(cluster_mask.sum()),
            "avg_price": float(cluster_data['price'].mean()),
            "avg_cost": float(cluster_data['cost'].mean()),
            "avg_units_sold": float(cluster_data['units_sold'].mean()),
            "avg_profit": float(cluster_data['profit'].mean()),
            "avg_promotion_frequency": float(cluster_data['promotion_frequency'].mean()),
            "avg_shelf_level": float(cluster_data['shelf_level'].mean()),
            "categories": cluster_data['category'].value_counts().to_dict()
        }
        
        cluster_stats[f"cluster_{i}"] = stats
    
    return cluster_stats

def name_clusters(cluster_stats: Dict[str, Any]) -> Dict[str, str]:
    """
    Generate meaningful names for clusters based on characteristics
    """
    cluster_names = {}
    
    for cluster_id, stats in cluster_stats.items():
        avg_price = stats["avg_price"]
        avg_units = stats["avg_units_sold"]
        avg_profit = stats["avg_profit"]
        
        # Determine cluster characteristics
        if avg_price < 4.0 and avg_units > 600:
            name = "Budget Best-Sellers"
        elif avg_price > 8.0 and avg_units < 200:
            name = "Premium Low-Volume"
        elif avg_price > 6.0 and avg_profit > 800:
            name = "High-Value Performers"
        elif avg_units > 500 and avg_profit < 600:
            name = "Volume Low-Margin"
        elif 4.0 <= avg_price <= 6.0 and 300 <= avg_units <= 500:
            name = "Mid-Range Steady"
        elif avg_price < 3.0:
            name = "Economy Products"
        else:
            name = "Balanced Products"
        
        cluster_names[cluster_id] = name
    
    return cluster_names

if __name__ == "__main__":
    # Test K-means
    from preprocessing import preprocess_data
    
    # Load and preprocess data
    df, _ = preprocess_data("product_sales.csv")
    
    # Select features for clustering
    feature_cols = ['price', 'units_sold']
    X = df[feature_cols].values
    
    # Run elbow method
    k_range = [2, 3, 4, 5, 6, 7, 8]
    wcss_values = elbow_method(X, k_range, random_seed=42)
    
    print("Elbow Method Results:")
    for k, wcss in wcss_values.items():
        print(f"k={k}: WCSS={wcss:.2f}")
    
    # Run K-means with optimal k (let's use k=4)
    optimal_k = 4
    assignments, centroids, info = kmeans(X, optimal_k, random_seed=42)
    
    print(f"\nK-means completed in {info['iterations']} iterations")
    print(f"WCSS: {info['wcss']:.2f}")

