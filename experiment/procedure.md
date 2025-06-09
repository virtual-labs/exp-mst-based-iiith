# Generate Data
Go to Control Panel → Data Generation.
- Adjust the "Spread" (variance) using the slider. This controls how scattered the points will be.
- Click "Generate 250 Random Points" to populate the canvas with points.
- Optional: Click "Clear" if you want to remove all points and start over.

#  Set Algorithm Parameters
In Algorithm Parameters:
- K (Number of Clusters): Adjust using the slider (between 2 and 10).
- Distance Metric: Choose between Euclidean, Manhattan, or Chebyshev.
- Initialization Method: Only "Random" (K-means++ and others can be added later).
- Maximum Iterations: Adjust the upper bound for clustering convergence.

# Adjust Visualization Options (Optional)
Toggle features to enhance clarity:
- Show Centroids: To see centroids of the clusters
- Show Cluster Boundaries (Voronoi): To show the boundaries of the cluster
- Show Centroid History: The path through which the centroid shifted from intial step to final step
- Show Grid: To show the gridlines in the graph

# Controls
| Button         | Action                                                              |
| -------------- | ------------------------------------------------------------------- |
| Initialize | Sets up initial centroids and allows simulation control.            |
| Step       | Perform one K-means iteration.                                      |
| Run        | Starts the simulation, iteratively updating clusters and centroids. |
| Pause      | Temporarily halts the ongoing simulation.                           |
| Reset      | Clears clustering progress but keeps data points intact.            |

# In the Info Panel, observe:
- Iteration Count and Convergence Status
- Point Count and Cluster Count
- Metrics:
  - Intra-cluster Variance
  - Silhouette Score
  - Davies-Bouldin Index
  - Cluster Statistics: Size, centroid coordinates, variance per cluster.
 
  # Export the Data
  - Export Image: To export the image of the current simulation state
  - Export Data: To export the csv of the current simulation state
