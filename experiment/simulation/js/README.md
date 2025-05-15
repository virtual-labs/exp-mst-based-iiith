# K-means Clustering Simulation

An interactive visualization tool for understanding and experimenting with the K-means clustering algorithm.

## Overview

This web application provides a visual and interactive simulation of the K-means clustering algorithm. Users can generate random data points, adjust algorithm parameters, and observe the clustering process step-by-step or as a continuous animation.

## Features

- **Data Generation**: Generate random points with adjustable variance
- **Algorithm Visualization**: See the K-means algorithm in action with color-coded clusters
- **Interactive Canvas**: Pan, zoom, and interact with the visualization
- **Step-by-Step Execution**: Run the algorithm one iteration at a time or automatically
- **Performance Metrics**: View silhouette scores, Davies-Bouldin index, and intra-cluster variance
- **Visual Elements**:
  - Color-coded clusters
  - Centroids represented as stars
  - Optional Voronoi boundaries
  - Centroid movement history trails
  - Grid with coordinate system

## Interface Components

### Data Generation Panel
- Adjust variance for random point generation
- Generate random points

### Algorithm Parameters Panel
- Set number of clusters (k)
- Choose distance metric (Euclidean, Manhattan, or Chebyshev)
- Set maximum iterations
- Adjust simulation speed

### Visualization Options Panel
- Toggle centroids visibility
- Toggle Voronoi boundaries
- Toggle history trails
- Toggle coordinate grid

### Controls Panel
- Initialize algorithm
- Step through iterations
- Run continuous simulation
- Pause simulation
- Reset simulation
- Export visualization as image
- Export data as CSV

### Metrics Panel
- View current iteration count
- Monitor convergence status
- Check intra-cluster variance
- View silhouette score
- View Davies-Bouldin index

### Cluster Statistics Panel
- See cluster sizes
- Check centroid positions
- View per-cluster variance

## Usage Instructions

1. **Generate Data**: Click the "Generate Data" button to create random data points
2. **Set Parameters**: Adjust the number of clusters (k) and other parameters as desired
3. **Initialize**: Click "Initialize" to set up the algorithm with random centroids
4. **Run Simulation**:
   - Click "Step" to perform one iteration
   - Click "Run" to start automatic execution
   - Click "Pause" to halt the automatic execution
   - Click "Reset" to clear the current algorithm state
5. **Analyze Results**: View the metrics and cluster statistics after the algorithm converges

## K-means Algorithm Overview

The K-means clustering algorithm works as follows:

1. **Initialization**: Randomly place k centroids in the data space
2. **Assignment**: Assign each data point to the nearest centroid
3. **Update**: Recalculate centroids as the mean of all points assigned to them
4. **Repeat**: Continue steps 2-3 until centroids no longer move significantly

## Performance Metrics

- **Intra-cluster Variance**: Measures how spread out points are within clusters (lower is better)
- **Silhouette Score**: Measures how well-separated the clusters are (-1 to 1, higher is better)
- **Davies-Bouldin Index**: Measures the average similarity between each cluster and its most similar cluster (lower is better)

## Keyboard Shortcuts

- **Space**: Perform one iteration
- **R**: Run continuous simulation
- **P**: Pause simulation

## System Requirements

- Modern web browser with JavaScript enabled
- HTML5 Canvas support
- Recommended screen resolution: 1280×720 or higher
