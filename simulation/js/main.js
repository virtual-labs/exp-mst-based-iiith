// K-means Clustering Simulation
// REMOVE DATASET OPTIONS KEEP ONLY RANDOM POINTS AS OPTION. NO OF POINTS SLIDER IS NOT WORKING. ALWAYS STUCK AT 100. VARIANCE AND SPREAD IS NOT WORKING, SOLVE THAT. REMOVE THE NO OF CLUSTERS IN DATA GENERATION TAB, KEEP IT ONLY IN ALGORITHM PARAMETERS. IN INITIALISATION method INCLUDE ONLY K MEANS
// Main classes for the simulation
class DataGenerator {
  constructor() {
    this.defaultBounds = {
      minX: -10,  
      maxX: 10,
      minY: -10,
      maxY: 10
    };
  }

  // Generate random points within bounds
  generateRandomPoints(count, variance = 1.0, bounds = this.defaultBounds) {
    // Debug the parameters
    console.log(`generateRandomPoints called with count=${count}, variance=${variance}`);
    
    const points = [];
    const { minX, maxX, minY, maxY } = bounds;
    
    // Adjust bounds based on variance
    const width = Math.abs(maxX - minX) * variance;
    const height = Math.abs(maxY - minY) * variance;
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    const adjustedMinX = centerX - width/2;
    const adjustedMaxX = centerX + width/2;
    const adjustedMinY = centerY - height/2;
    const adjustedMaxY = centerY + height/2;
    
    // Important: Make sure we're using the actual count parameter
    for (let i = 0; i < count; i++) {
      points.push({
        x: adjustedMinX + Math.random() * (adjustedMaxX - adjustedMinX),
        y: adjustedMinY + Math.random() * (adjustedMaxY - adjustedMinY)
      });
    }
    
    console.log(`Generated ${points.length} points`);
    return points;
  }

  // Generate points in Gaussian clusters
  generateGaussianClusters(count, clusterCount, variance = 1.0) {
    const points = [];
    const pointsPerCluster = Math.floor(count / clusterCount);
    const centers = [];
    
    // Generate random centers that are reasonably spaced
    for (let i = 0; i < clusterCount; i++) {
      let attempt = 0;
      let valid = false;
      let center;
      
      // Try to find a center that's not too close to existing centers
      while (!valid && attempt < 100) {
        center = {
          x: this.defaultBounds.minX + Math.random() * (this.defaultBounds.maxX - this.defaultBounds.minX),
          y: this.defaultBounds.minY + Math.random() * (this.defaultBounds.maxY - this.defaultBounds.minY)
        };
        
        valid = true;
        for (let j = 0; j < centers.length; j++) {
          const distance = Math.sqrt(
            Math.pow(center.x - centers[j].x, 2) + 
            Math.pow(center.y - centers[j].y, 2)
          );
          
          if (distance < 5) { // Minimum distance between centers
            valid = false;
            break;
          }
        }
        
        attempt++;
      }
      
      centers.push(center);
    }
    
    // Generate points around each center using Box-Muller transform for Gaussian distribution
    centers.forEach((center, groupIndex) => {
      const groupPoints = groupIndex < centers.length - 1 
        ? pointsPerCluster 
        : count - pointsPerCluster * (clusterCount - 1); // Last group gets remaining points
      
      for (let i = 0; i < groupPoints; i++) {
        // Box-Muller transform
        let u = 0, v = 0;
        while (u === 0) u = Math.random(); // Convert [0,1) to (0,1)
        while (v === 0) v = Math.random();
        
        const standardNormal1 = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        const standardNormal2 = Math.sqrt(-2.0 * Math.log(u)) * Math.sin(2.0 * Math.PI * v);
        
        points.push({
          x: center.x + standardNormal1 * variance,
          y: center.y + standardNormal2 * variance
        });
      }
    });
    
    return points;
  }

  // Generate points in circular clusters
  generateCircularClusters(count, clusterCount, variance = 1.0) {
    const points = [];
    const pointsPerCluster = Math.floor(count / clusterCount);
    const centers = [];
    
    // Generate random centers
    for (let i = 0; i < clusterCount; i++) {
      let attempt = 0;
      let valid = false;
      let center;
      
      while (!valid && attempt < 100) {
        center = {
          x: this.defaultBounds.minX + Math.random() * (this.defaultBounds.maxX - this.defaultBounds.minX),
          y: this.defaultBounds.minY + Math.random() * (this.defaultBounds.maxY - this.defaultBounds.minY)
        };
        
        valid = true;
        for (let j = 0; j < centers.length; j++) {
          const distance = Math.sqrt(
            Math.pow(center.x - centers[j].x, 2) + 
            Math.pow(center.y - centers[j].y, 2)
          );
          
          if (distance < 5) {
            valid = false;
            break;
          }
        }
        
        attempt++;
      }
      
      centers.push(center);
    }
    
    // Generate points in circular patterns around centers
    centers.forEach((center, clusterIndex) => {
      const clusterPoints = clusterIndex < centers.length - 1 
        ? pointsPerCluster 
        : count - pointsPerCluster * (centers.length - 1);
      
      const radius = 2 + Math.random() * 2;  // Random radius between 2-4
      
      for (let i = 0; i < clusterPoints; i++) {
        // Generate point at random angle and distance from center
        const angle = Math.random() * Math.PI * 2;
        const distance = radius * Math.sqrt(Math.random()) * variance;
        
        points.push({
          x: center.x + distance * Math.cos(angle),
          y: center.y + distance * Math.sin(angle)
        });
      }
    });
    
    return points;
  }
}

class KMeansAlgorithm {
  constructor(points, k, distanceMetric = 'euclidean') {
    this.points = points || [];
    this.k = Math.min(k, points.length);
    this.distanceMetric = distanceMetric;
    this.centroids = [];
    this.assignments = [];
    this.iteration = 0;
    this.converged = false;
    this.history = [];
    this.movementHistory = [];
  }

  // Initialize the algorithm with centroids
  initialize(method = 'random') {
    // Reset state
    this.iteration = 0;
    this.converged = false;
    this.history = [];
    this.movementHistory = [];
    
    if (this.points.length === 0) {
      throw new Error("No points provided for clustering");
    }
    
    if (this.k <= 0) {
      throw new Error("K must be a positive integer");
    }
    
    if (this.k > this.points.length) {
      this.k = this.points.length;
      console.warn(`K reduced to ${this.k} to match the number of points`);
    }
    
    // Initialize centroids based on selected method
    switch (method) {
      case 'random':
        this.initializeRandomCentroids();
        break;
      case 'kmeans++':
        this.initializeKMeansPlusPlusCentroids();
        break;
      case 'forgy':
        this.initializeForgy();
        break;
      default:
        this.initializeRandomCentroids();
    }
    
    // Initialize assignments
    this.assignments = new Array(this.points.length).fill(0);
    
    // Save initial state to history
    this.history.push(this.cloneCentroids());
    
    return this;
  }

  // Initialize centroids randomly within data bounds
  initializeRandomCentroids() {
    // Calculate bounds of the data
    const bounds = this.calculateDataBounds();
    
    // Generate k random centroids within the data bounds
    this.centroids = [];
    for (let i = 0; i < this.k; i++) {
      this.centroids.push({
        x: bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
        y: bounds.minY + Math.random() * (bounds.maxY - bounds.minY)
      });
    }
  }

  // Initialize using Forgy method (random sample)
  initializeForgy() {
    // Select k random points as initial centroids
    const indices = new Set();
    while (indices.size < this.k) {
      indices.add(Math.floor(Math.random() * this.points.length));
    }
    
    this.centroids = Array.from(indices).map(index => ({
      x: this.points[index].x,
      y: this.points[index].y
    }));
  }

  // Initialize using k-means++ algorithm
  initializeKMeansPlusPlusCentroids() {
    if (this.points.length === 0) return;
    
    // Select first centroid randomly
    const firstIndex = Math.floor(Math.random() * this.points.length);
    this.centroids = [{
      x: this.points[firstIndex].x,
      y: this.points[firstIndex].y
    }];
    
    // Select remaining centroids
    while (this.centroids.length < this.k) {
      // Calculate squared distances from each point to nearest centroid
      const distances = this.points.map(point => {
        let minDistance = Infinity;
        for (const centroid of this.centroids) {
          const distance = this.calculateDistance(point, centroid);
          minDistance = Math.min(minDistance, distance);
        }
        return minDistance * minDistance; // Square for probability weighting
      });
      
      // Calculate sum of squared distances
      const distanceSum = distances.reduce((sum, distance) => sum + distance, 0);
      
      if (distanceSum === 0) {
        // If all distances are zero, choose randomly
        const remainingIndices = new Set();
        while (remainingIndices.size < this.k - this.centroids.length) {
          remainingIndices.add(Math.floor(Math.random() * this.points.length));
        }
        
        this.centroids = [
          ...this.centroids,
          ...Array.from(remainingIndices).map(index => ({
            x: this.points[index].x,
            y: this.points[index].y
          }))
        ];
        break;
      }
      
      // Choose next centroid with probability proportional to squared distance
      let random = Math.random() * distanceSum;
      let cumulativeProb = 0;
      let nextCentroidIndex = -1;
      
      for (let i = 0; i < distances.length; i++) {
        cumulativeProb += distances[i];
        if (cumulativeProb >= random) {
          nextCentroidIndex = i;
          break;
        }
      }
      
      if (nextCentroidIndex === -1) {
        nextCentroidIndex = distances.length - 1;
      }
      
      this.centroids.push({
        x: this.points[nextCentroidIndex].x,
        y: this.points[nextCentroidIndex].y
      });
    }
  }

  // Calculate bounds of the data points
  calculateDataBounds() {
    if (this.points.length === 0) {
      return { minX: -10, maxX: 10, minY: -10, maxY: 10 };
    }
    
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    
    for (const point of this.points) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }
    
    return { minX, maxX, minY, maxY };
  }

  // Calculate distance between two points using the selected metric
  calculateDistance(point1, point2) {
    switch (this.distanceMetric) {
      case 'euclidean':
        return Math.sqrt(
          Math.pow(point2.x - point1.x, 2) + 
          Math.pow(point2.y - point1.y, 2)
        );
      case 'manhattan':
        return Math.abs(point2.x - point1.x) + Math.abs(point2.y - point1.y);
      case 'chebyshev':
        return Math.max(Math.abs(point2.x - point1.x), Math.abs(point2.y - point1.y));
      default:
        // Default to euclidean
        return Math.sqrt(
          Math.pow(point2.x - point1.x, 2) + 
          Math.pow(point2.y - point1.y, 2)
        );
    }
  }

  // Assign each point to the nearest centroid
  assignPointsToClusters() {
    let changed = false;
    
    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i];
      let minDistance = Infinity;
      let closestCentroidIndex = 0;
      
      for (let j = 0; j < this.centroids.length; j++) {
        const distance = this.calculateDistance(point, this.centroids[j]);
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroidIndex = j;
        }
      }
      
      if (this.assignments[i] !== closestCentroidIndex) {
        changed = true;
        this.assignments[i] = closestCentroidIndex;
      }
    }
    
    return changed;
  }

  // Recalculate centroid positions based on assigned points
  recalculateCentroids() {
    const oldCentroids = this.cloneCentroids();
    
    // Reset centroids
    const newCentroids = Array(this.k).fill().map(() => ({
      x: 0,
      y: 0,
      count: 0
    }));
    
    // Sum up all points assigned to each centroid
    for (let i = 0; i < this.points.length; i++) {
      const clusterId = this.assignments[i];
      const point = this.points[i];
      
      newCentroids[clusterId].x += point.x;
      newCentroids[clusterId].y += point.y;
      newCentroids[clusterId].count += 1;
    }
    
    // Calculate average position for each centroid
    const totalMovement = [];
    for (let i = 0; i < this.k; i++) {
      if (newCentroids[i].count > 0) {
        const newX = newCentroids[i].x / newCentroids[i].count;
        const newY = newCentroids[i].y / newCentroids[i].count;
        
        // Calculate movement distance for this centroid
        const movement = this.calculateDistance(
          { x: newX, y: newY },
          this.centroids[i]
        );
        totalMovement.push(movement);
        
        // Update centroid position
        this.centroids[i] = {
          x: newX,
          y: newY
        };
      }
      // If a centroid has no points, keep it where it is
    }
    
    // Save current centroids to history
    this.history.push(this.cloneCentroids());
    this.movementHistory.push(totalMovement.reduce((sum, val) => sum + val, 0) / this.k);
    
    return this.checkConvergence(oldCentroids, this.centroids);
  }

  // Check if algorithm has converged
  checkConvergence(oldCentroids, newCentroids, threshold = 0.0001) {
    let totalMovement = 0;
    
    for (let i = 0; i < oldCentroids.length; i++) {
      const movement = this.calculateDistance(oldCentroids[i], newCentroids[i]);
      totalMovement += movement;
    }
    
    return totalMovement < threshold;
  }

  // Perform one iteration of the k-means algorithm
  step() {
    if (this.converged) return false;
    
    const assignmentsChanged = this.assignPointsToClusters();
    const centroidsConverged = this.recalculateCentroids();
    
    // Algorithm converges when assignments don't change or centroids don't move
    if (!assignmentsChanged || centroidsConverged) {
      this.converged = true;
    }
    
    this.iteration++;
    return !this.converged;
  }

  // Run the complete k-means algorithm
  run(maxIterations = 100) {
    while (!this.converged && this.iteration < maxIterations) {
      this.step();
    }
    
    return {
      centroids: this.centroids,
      assignments: this.assignments,
      iterations: this.iteration,
      converged: this.converged
    };
  }

  // Create a deep copy of centroids
  cloneCentroids() {
    return JSON.parse(JSON.stringify(this.centroids));
  }
}

class MetricsCalculator {
  constructor(points, centroids, assignments, distanceMetric = 'euclidean') {
    this.points = points || [];
    this.centroids = centroids || [];
    this.assignments = assignments || [];
    this.distanceMetric = distanceMetric;
    this.k = centroids ? centroids.length : 0;
  }

  // Update the data used for metric calculations
  updateData(points, centroids, assignments, distanceMetric) {
    this.points = points || this.points;
    this.centroids = centroids || this.centroids;
    this.assignments = assignments || this.assignments;
    this.distanceMetric = distanceMetric || this.distanceMetric;
    this.k = this.centroids ? this.centroids.length : 0;
  }

  // Calculate distance between two points using the selected metric
  calculateDistance(point1, point2) {
    switch (this.distanceMetric) {
      case 'euclidean':
        return Math.sqrt(
          Math.pow(point2.x - point1.x, 2) + 
          Math.pow(point2.y - point1.y, 2)
        );
      case 'manhattan':
        return Math.abs(point2.x - point1.x) + Math.abs(point2.y - point1.y);
      case 'chebyshev':
        return Math.max(Math.abs(point2.x - point1.x), Math.abs(point2.y - point1.y));
      default:
        // Default to euclidean
        return Math.sqrt(
          Math.pow(point2.x - point1.x, 2) + 
          Math.pow(point2.y - point1.y, 2)
        );
    }
  }

  // Calculate intra-cluster variance (sum of squared distances)
  calculateIntraClusterVariance() {
    if (!this.points.length || !this.centroids.length) {
      return { total: 0, perCluster: [] };
    }
    
    const variances = Array(this.k).fill(0);
    const counts = Array(this.k).fill(0);
    
    // Calculate sum of squared distances for each cluster
    for (let i = 0; i < this.points.length; i++) {
      const clusterId = this.assignments[i];
      const point = this.points[i];
      const centroid = this.centroids[clusterId];
      
      const distance = this.calculateDistance(point, centroid);
      variances[clusterId] += distance * distance;
      counts[clusterId]++;
    }
    
    // Calculate average variance per cluster
    const perCluster = variances.map((variance, i) => 
      counts[i] > 0 ? variance / counts[i] : 0
    );
    
    // Calculate total variance
    const total = variances.reduce((sum, variance) => sum + variance, 0) / this.points.length;
    
    return { total, perCluster };
  }

  // Calculate silhouette score for clustering quality
  calculateSilhouetteScore() {
    if (this.k <= 1 || this.points.length <= 1) {
      return { average: 0, scores: [] };
    }
    
    const scores = [];
    
    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i];
      const clusterA = this.assignments[i];
      
      // Calculate average distance to points in same cluster (a)
      let sumA = 0;
      let countA = 0;
      
      for (let j = 0; j < this.points.length; j++) {
        if (i !== j && this.assignments[j] === clusterA) {
          sumA += this.calculateDistance(point, this.points[j]);
          countA++;
        }
      }
      
      const a = countA > 0 ? sumA / countA : 0;
      
      // Find the nearest cluster B
      let minB = Infinity;
      
      for (let c = 0; c < this.k; c++) {
        if (c === clusterA) continue;
        
        // Calculate average distance to points in cluster c
        let sumB = 0;
        let countB = 0;
        
        for (let j = 0; j < this.points.length; j++) {
          if (this.assignments[j] === c) {
            sumB += this.calculateDistance(point, this.points[j]);
            countB++;
          }
        }
        
        const avgB = countB > 0 ? sumB / countB : Infinity;
        minB = Math.min(minB, avgB);
      }
      
      // Calculate silhouette score for this point
      let silhouette;
      
      if (countA === 0) {
        silhouette = 0; // Alone in cluster
      } else if (minB === Infinity) {
        silhouette = 0; // No other clusters
      } else {
        silhouette = (minB - a) / Math.max(a, minB);
      }
      
      scores.push(silhouette);
    }
    
    // Calculate average silhouette score
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    return { average, scores };
  }

  // Calculate Davies-Bouldin Index
  calculateDaviesBouldinIndex() {
    if (this.k <= 1) return 0;
    
    // Calculate cluster centers
    const clusterCenters = this.centroids;
    
    // Calculate average distance of points to their cluster centers
    const clusterSizes = this.calculateClusterSizes();
    const clusterDispersions = Array(this.k).fill(0);
    
    for (let i = 0; i < this.points.length; i++) {
      const clusterId = this.assignments[i];
      const distance = this.calculateDistance(this.points[i], clusterCenters[clusterId]);
      clusterDispersions[clusterId] += distance;
    }
    
    for (let i = 0; i < this.k; i++) {
      if (clusterSizes[i] > 0) {
        clusterDispersions[i] /= clusterSizes[i];
      }
    }
    
    // Calculate Davies-Bouldin Index
    let dbSum = 0;
    
    for (let i = 0; i < this.k; i++) {
      if (clusterSizes[i] === 0) continue;
      
      let maxRatio = 0;
      
      for (let j = 0; j < this.k; j++) {
        if (i === j || clusterSizes[j] === 0) continue;
        
        const centerDistance = this.calculateDistance(clusterCenters[i], clusterCenters[j]);
        const ratio = (clusterDispersions[i] + clusterDispersions[j]) / (centerDistance || 0.001);
        
        maxRatio = Math.max(maxRatio, ratio);
      }
      
      dbSum += maxRatio;
    }
    
    const validClusters = clusterSizes.filter(size => size > 0).length;
    return validClusters > 1 ? dbSum / validClusters : 0;
  }

  // Calculate cluster sizes
  calculateClusterSizes() {
    const sizes = Array(this.k).fill(0);
    
    for (let i = 0; i < this.assignments.length; i++) {
      const clusterId = this.assignments[i];
      sizes[clusterId]++;
    }
    
    return sizes;
  }

  // Generate comprehensive statistics for the clustering
  generateStatistics() {
    const clusterSizes = this.calculateClusterSizes();
    const variance = this.calculateIntraClusterVariance();
    const silhouette = this.calculateSilhouetteScore();
    const daviesBouldin = this.calculateDaviesBouldinIndex();
    
    return {
      clusterSizes,
      variance,
      silhouette: silhouette.average,
      silhouetteScores: silhouette.scores,
      daviesBouldin
    };
  }
}

class VisualizationCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas element with ID "${canvasId}" not found`);
    }
    
    this.ctx = this.canvas.getContext('2d');
    
    // Viewport properties
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.viewportBounds = {
      minX: -10,
      maxX: 10,
      minY: -10,
      maxY: 10
    };
    
    // Display options
    this.showVoronoi = true;
    this.showHistoryTrail = true;
    this.showPoints = true;
    this.showCentroids = true;
    this.showGrid = true;
    this.pointSize = 5;
    this.centroidSize = 8;
    
    // Colors
    this.clusterColors = [
      '#e41a1c', '#377eb8', '#4daf4a', '#984ea3', 
      '#ff7f00', '#ffff33', '#a65628', '#f781bf', 
      '#999999', '#66c2a5'
    ];
    this.gridColor = 'rgba(200, 200, 200, 0.5)';
    this.axisColor = 'rgba(150, 150, 150, 0.8)';
    this.backgroundColor = '#ffffff';
    
    // Interaction state
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.selectedPoint = null;
    this.points = [];
    this.centroids = [];
    this.assignments = [];
    
    // Initialize canvas
    this.resizeCanvas();
    this.setupEventListeners();
  }

  // Resize canvas to match container size
  resizeCanvas() {
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();
    
    // Set canvas dimensions to match container
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    
    // Re-render after resize
    this.render();
  }

  // Set up event listeners for canvas interaction
  setupEventListeners() {
    // Mouse wheel for zooming
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      
      // Get mouse position in canvas coordinates
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Convert to world coordinates
      const worldX = this.canvasToWorldX(mouseX);
      const worldY = this.canvasToWorldY(mouseY);
      
      // Determine zoom direction
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      
      // Apply zoom centered on mouse position
      this.handleZoom(zoomFactor, worldX, worldY);
    });
    
    // Mouse down for panning
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.canvas.style.cursor = 'grabbing';
    });
    
    // Mouse move for panning and tooltips
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        
        this.handlePan(dx, dy);
        
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      } else {
        // Check for hovering over points
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Find closest point for potential tooltip
        this.selectedPoint = this.findPointAt(mouseX, mouseY);
        
        // Update cursor style
        this.canvas.style.cursor = this.selectedPoint ? 'pointer' : 'grab';
      }
      
      this.render();
    });
    
    // Mouse up to end panning
    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
        this.render();
      }
    });
    
    // Mouse leave to end panning
    this.canvas.addEventListener('mouseleave', () => {
      this.isDragging = false;
      this.selectedPoint = null;
      this.render();
    });
    
    // Window resize event
    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });
    
    // Zoom buttons
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const resetViewBtn = document.getElementById('reset-view');
    
    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => {
        const centerX = (this.viewportBounds.minX + this.viewportBounds.maxX) / 2;
        const centerY = (this.viewportBounds.minY + this.viewportBounds.maxY) / 2;
        this.handleZoom(1.2, centerX, centerY);
      });
    }
    
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => {
        const centerX = (this.viewportBounds.minX + this.viewportBounds.maxX) / 2;
        const centerY = (this.viewportBounds.minY + this.viewportBounds.maxY) / 2;
        this.handleZoom(0.8, centerX, centerY);
      });
    }
    
    if (resetViewBtn) {
      resetViewBtn.addEventListener('click', () => {
        this.resetView();
      });
    }
  }

  // Find a point at the given canvas coordinates
  findPointAt(canvasX, canvasY) {
    if (!this.points || this.points.length === 0) {
      return null;
    }
    
    const worldX = this.canvasToWorldX(canvasX);
    const worldY = this.canvasToWorldY(canvasY);
    const threshold = this.pointSize * 1.5 / this.scale; // Adjust for current zoom level
    
    let closestPoint = null;
    let closestDistance = Infinity;
    
    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i];
      const distance = Math.sqrt(
        Math.pow(point.x - worldX, 2) + 
        Math.pow(point.y - worldY, 2)
      );
      
      if (distance < threshold && distance < closestDistance) {
        closestDistance = distance;
        closestPoint = {
          ...point,
          index: i,
          clusterId: this.assignments ? this.assignments[i] : -1
        };
      }
    }
    
    return closestPoint;
  }

  // Handle zoom operation
  handleZoom(factor, centerX, centerY) {
    // Calculate new viewport bounds
    const width = this.viewportBounds.maxX - this.viewportBounds.minX;
    const height = this.viewportBounds.maxY - this.viewportBounds.minY;
    
    // Calculate relative position of zoom center in viewport (0-1)
    const relX = (centerX - this.viewportBounds.minX) / width;
    const relY = (centerY - this.viewportBounds.minY) / height;
    
    // Calculate new width and height
    const newWidth = width / factor;
    const newHeight = height / factor;
    
    // Calculate new bounds, keeping the zoom center at the same relative position
    this.viewportBounds = {
      minX: centerX - relX * newWidth,
      maxX: centerX + (1 - relX) * newWidth,
      minY: centerY - relY * newHeight,
      maxY: centerY + (1 - relY) * newHeight
    };
    
    // Update scale for point rendering
    this.scale *= factor;
    
    // Re-render with new bounds
    this.render();
  }

  // Handle pan operation
  handlePan(dx, dy) {
    // Convert canvas movement to world space
    const width = this.viewportBounds.maxX - this.viewportBounds.minX;
    const height = this.viewportBounds.maxY - this.viewportBounds.minY;
    
    const worldDx = -(dx / this.canvas.width) * width;
    const worldDy = (dy / this.canvas.height) * height; // Y is inverted
    
    // Update viewport bounds
    this.viewportBounds = {
      minX: this.viewportBounds.minX + worldDx,
      maxX: this.viewportBounds.maxX + worldDx,
      minY: this.viewportBounds.minY + worldDy,
      maxY: this.viewportBounds.maxY + worldDy
    };
  }

  // Reset viewport to default bounds
  resetView() {
    // If we have points, adjust view to fit them
    if (this.points && this.points.length > 0) {
      this.fitPointsInView();
    } else {
      this.viewportBounds = {
        minX: -10,
        maxX: 10,
        minY: -10,
        maxY: 10
      };
    }
    
    this.scale = 1;
    this.render();
  }

  // Adjust viewport to fit all points
  fitPointsInView() {
    if (!this.points || this.points.length === 0) {
      return;
    }
    
    // Calculate bounds of all points
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    
    for (const point of this.points) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }
    
    // Add padding
    const paddingX = Math.max(1, (maxX - minX) * 0.1);
    const paddingY = Math.max(1, (maxY - minY) * 0.1);
    
    this.viewportBounds = {
      minX: minX - paddingX,
      maxX: maxX + paddingX,
      minY: minY - paddingY,
      maxY: maxY + paddingY
    };
    
    // Ensure aspect ratio matches canvas
    const viewportWidth = this.viewportBounds.maxX - this.viewportBounds.minX;
    const viewportHeight = this.viewportBounds.maxY - this.viewportBounds.minY;
    const canvasRatio = this.canvas.width / this.canvas.height;
    const viewportRatio = viewportWidth / viewportHeight;
    
    if (viewportRatio < canvasRatio) {
      // Viewport is too tall, expand width
      const newWidth = viewportHeight * canvasRatio;
      const widthDiff = newWidth - viewportWidth;
      this.viewportBounds.minX -= widthDiff / 2;
      this.viewportBounds.maxX += widthDiff / 2;
    } else {
      // Viewport is too wide, expand height
      const newHeight = viewportWidth / canvasRatio;
      const heightDiff = newHeight - viewportHeight;
      this.viewportBounds.minY -= heightDiff / 2;
      this.viewportBounds.maxY += heightDiff / 2;
    }
  }

  // Update the canvas with new data
  updateData(points, centroids, assignments, history) {
    this.points = points || [];
    this.centroids = centroids || [];
    this.assignments = assignments || [];
    this.history = history || [];
    
    // If first time setting points, fit them in view
    if (points && points.length > 0 && 
        (this.viewportBounds.minX === -10 && this.viewportBounds.maxX === 10)) {
      this.fitPointsInView();
    }
    
    this.render();
  }

  // Update display options
  updateOptions(options) {
    if (options.showVoronoi !== undefined) this.showVoronoi = options.showVoronoi;
    if (options.showHistoryTrail !== undefined) this.showHistoryTrail = options.showHistoryTrail;
    if (options.showGrid !== undefined) this.showGrid = options.showGrid;
    if (options.showPoints !== undefined) this.showPoints = options.showPoints;
    if (options.showCentroids !== undefined) this.showCentroids = options.showCentroids;
    
    this.render();
  }

  // Render the current state to the canvas
  render() {
    // Clear canvas
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid
    if (this.showGrid) {
      this.drawGrid();
    }
    
    // Draw voronoi boundaries
    if (this.showVoronoi && this.centroids && this.centroids.length > 0) {
      this.drawBoundaries();
    }
    
    // Draw history trail
    if (this.showHistoryTrail && this.history && this.history.length > 0) {
      this.drawHistoryTrail();
    }
    
    // Draw points
    if (this.showPoints && this.points && this.points.length > 0) {
      this.drawPoints();
    }
    
    // Draw centroids
    if (this.showCentroids && this.centroids && this.centroids.length > 0) {
      this.drawCentroids();
    }
    
    // Draw selected point tooltip
    if (this.selectedPoint) {
      this.drawPointTooltip(this.selectedPoint);
    }
  }

  // Draw coordinate grid
  drawGrid() {
    const { minX, maxX, minY, maxY } = this.viewportBounds;
    
    // Determine appropriate grid spacing based on zoom level
    const viewportWidth = maxX - minX;
    let gridSpacing = 1;
    
    if (viewportWidth > 100) gridSpacing = 10;
    else if (viewportWidth > 50) gridSpacing = 5;
    else if (viewportWidth > 20) gridSpacing = 2;
    else if (viewportWidth <= 5) gridSpacing = 0.5;
    
    // Draw grid lines
    this.ctx.strokeStyle = this.gridColor;
    this.ctx.lineWidth = 0.5;
    
    // Vertical grid lines
    for (let x = Math.ceil(minX / gridSpacing) * gridSpacing; x <= maxX; x += gridSpacing) {
      const canvasX = this.worldToCanvasX(x);
      this.ctx.beginPath();
      this.ctx.moveTo(canvasX, 0);
      this.ctx.lineTo(canvasX, this.canvas.height);
      this.ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let y = Math.ceil(minY / gridSpacing) * gridSpacing; y <= maxY; y += gridSpacing) {
      const canvasY = this.worldToCanvasY(y);
      this.ctx.beginPath();
      this.ctx.moveTo(0, canvasY);
      this.ctx.lineTo(this.canvas.width, canvasY);
      this.ctx.stroke();
    }
    
    // Draw axes
    this.ctx.strokeStyle = this.axisColor;
    this.ctx.lineWidth = 1.5;
    
    // X-axis (y = 0)
    if (minY <= 0 && maxY >= 0) {
      const yAxisPos = this.worldToCanvasY(0);
      this.ctx.beginPath();
      this.ctx.moveTo(0, yAxisPos);
      this.ctx.lineTo(this.canvas.width, yAxisPos);
      this.ctx.stroke();
    }
    
    // Y-axis (x = 0)
    if (minX <= 0 && maxX >= 0) {
      const xAxisPos = this.worldToCanvasX(0);
      this.ctx.beginPath();
      this.ctx.moveTo(xAxisPos, 0);
      this.ctx.lineTo(xAxisPos, this.canvas.height);
      this.ctx.stroke();
    }
    
    // Draw axis labels
    this.drawAxisLabels(gridSpacing);
  }

  // Draw axis labels
  drawAxisLabels(spacing) {
    const { minX, maxX, minY, maxY } = this.viewportBounds;
    
    this.ctx.font = '12px sans-serif';
    this.ctx.fillStyle = '#666';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // X-axis labels
    for (let x = Math.ceil(minX / spacing) * spacing; x <= maxX; x += spacing) {
      if (Math.abs(x) < 0.001) continue; // Skip zero
      
      const canvasX = this.worldToCanvasX(x);
      const canvasY = this.worldToCanvasY(0) + 15; // Below x-axis
      
      // Only draw if on canvas
      if (canvasX >= 0 && canvasX <= this.canvas.width && 
          canvasY >= 0 && canvasY <= this.canvas.height) {
        this.ctx.fillText(x.toFixed(1), canvasX, canvasY);
      }
    }
    
    // Y-axis labels
    this.ctx.textAlign = 'right';
    for (let y = Math.ceil(minY / spacing) * spacing; y <= maxY; y += spacing) {
      if (Math.abs(y) < 0.001) continue; // Skip zero
      
      const canvasX = this.worldToCanvasX(0) - 10; // Left of y-axis
      const canvasY = this.worldToCanvasY(y);
      
      // Only draw if on canvas
      if (canvasX >= 0 && canvasX <= this.canvas.width && 
          canvasY >= 0 && canvasY <= this.canvas.height) {
        this.ctx.fillText(y.toFixed(1), canvasX, canvasY);
      }
    }
    
    // Origin label
    if (minX <= 0 && maxX >= 0 && minY <= 0 && maxY >= 0) {
      const originX = this.worldToCanvasX(0);
      const originY = this.worldToCanvasY(0);
      
      this.ctx.fillStyle = '#333';
      this.ctx.fillText('0', originX - 10, originY + 15);
    }
  }

  // Draw data points
  drawPoints() {
    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i];
      const x = this.worldToCanvasX(point.x);
      const y = this.worldToCanvasY(point.y);
      
      // Skip points outside canvas
      if (x < -this.pointSize || x > this.canvas.width + this.pointSize || 
          y < -this.pointSize || y > this.canvas.height + this.pointSize) {
        continue;
      }
      
      const clusterId = this.assignments && this.assignments.length > i ? this.assignments[i] : -1;
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, this.pointSize, 0, Math.PI * 2);
      
      if (clusterId >= 0) {
        this.ctx.fillStyle = this.clusterColors[clusterId % this.clusterColors.length];
      } else {
        this.ctx.fillStyle = '#aaaaaa';
      }
      
      this.ctx.fill();
      this.ctx.strokeStyle = '#333333';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
  }

  // Draw centroids
  drawCentroids() {
    for (let i = 0; i < this.centroids.length; i++) {
      const centroid = this.centroids[i];
      const x = this.worldToCanvasX(centroid.x);
      const y = this.worldToCanvasY(centroid.y);
      
      // Skip centroids outside canvas
      if (x < -this.centroidSize || x > this.canvas.width + this.centroidSize || 
          y < -this.centroidSize || y > this.canvas.height + this.centroidSize) {
        continue;
      }
      
      const color = this.clusterColors[i % this.clusterColors.length];
      
      // Draw centroid as a star
      this.ctx.beginPath();
      for (let j = 0; j < 5; j++) {
        const angle = (Math.PI * 2 * j) / 5 - Math.PI / 2;
        const radius = j % 2 === 0 ? this.centroidSize : this.centroidSize / 2;
        const pointX = x + radius * Math.cos(angle);
        const pointY = y + radius * Math.sin(angle);
        
        if (j === 0) {
          this.ctx.moveTo(pointX, pointY);
        } else {
          this.ctx.lineTo(pointX, pointY);
        }
      }
      
      this.ctx.closePath();
      this.ctx.fillStyle = color;
      this.ctx.fill();
      this.ctx.strokeStyle = '#333333';
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
      
      // Draw centroid label
      this.ctx.font = 'bold 12px sans-serif';
      this.ctx.fillStyle = '#333333';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(`C${i+1}`, x, y - this.centroidSize - 5);
    }
  }

  // Draw Voronoi boundaries between clusters
  drawBoundaries() {
    if (!this.centroids || this.centroids.length < 2) return;
    
    // Get canvas bounds in world coordinates
    const { minX, maxX, minY, maxY } = this.viewportBounds;
    
    // Create grid of points to check
    const gridSize = 50; // Number of points in each dimension
    const stepX = (maxX - minX) / gridSize;
    const stepY = (maxY - minY) / gridSize;
    
    // For each grid point, determine the closest centroid
    for (let i = 0; i <= gridSize; i++) {
      for (let j = 0; j <= gridSize; j++) {
        const x = minX + i * stepX;
        const y = minY + j * stepY;
        
        const assignments = [];
        let minDistance = Infinity;
        let closestCentroid = -1;
        
        // Find closest centroid
        for (let k = 0; k < this.centroids.length; k++) {
          const centroid = this.centroids[k];
          const distance = this.calculateDistance(
            { x, y },
            centroid
          );
          
          assignments.push({
            centroidIndex: k,
            distance: distance
          });
          
          if (distance < minDistance) {
            minDistance = distance;
            closestCentroid = k;
          }
        }
        
        // Sort assignments by distance
        assignments.sort((a, b) => a.distance - b.distance);
        
        // If we're close to a boundary, draw a point
        if (assignments.length > 1) {
          const diff = assignments[1].distance - assignments[0].distance;
          if (diff < stepX / 2) {
            const canvasX = this.worldToCanvasX(x);
            const canvasY = this.worldToCanvasY(y);
            
            // Get color based on closest centroid
            const color = this.clusterColors[closestCentroid % this.clusterColors.length];
            
            // Draw with opacity based on how close to boundary
            const opacity = Math.max(0, Math.min(1, 1 - diff / (stepX / 2)));
            
            this.ctx.fillStyle = this.hexToRgba(color, 0.2 * opacity);
            this.ctx.beginPath();
            this.ctx.arc(canvasX, canvasY, 2, 0, Math.PI * 2);
            this.ctx.fill();
          }
        }
      }
    }
  }

  // Draw centroid history trail
  drawHistoryTrail() {
    if (!this.history || this.history.length < 2) return;
    
    // Draw trail for each centroid
    for (let i = 0; i < this.history[0].length; i++) {
      const color = this.clusterColors[i % this.clusterColors.length];
      
      this.ctx.strokeStyle = this.hexToRgba(color, 0.6);
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 3]);
      this.ctx.beginPath();
      
      let startX = this.worldToCanvasX(this.history[0][i].x);
      let startY = this.worldToCanvasY(this.history[0][i].y);
      
      this.ctx.moveTo(startX, startY);
      
      for (let j = 1; j < this.history.length; j++) {
        if (i < this.history[j].length) {
          const x = this.worldToCanvasX(this.history[j][i].x);
          const y = this.worldToCanvasY(this.history[j][i].y);
          this.ctx.lineTo(x, y);
        }
      }
      
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }
  }

  // Draw tooltip for selected point
  drawPointTooltip(point) {
    const x = this.worldToCanvasX(point.x);
    const y = this.worldToCanvasY(point.y);
    
    // Draw highlight around point
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.pointSize + 3, 0, Math.PI * 2);
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // Tooltip content
    const tooltipLines = [
      `Point ${point.index + 1}`,
      `X: ${point.x.toFixed(3)}`,
      `Y: ${point.y.toFixed(3)}`
    ];
    
    if (point.clusterId >= 0) {
      tooltipLines.push(`Cluster: ${point.clusterId + 1}`);
    }
    
    // Calculate tooltip dimensions
    this.ctx.font = '12px sans-serif';
    const lineHeight = 18;
    const padding = 8;
    const maxLineWidth = tooltipLines.reduce((max, line) => 
      Math.max(max, this.ctx.measureText(line).width), 0);
    
    const tooltipWidth = maxLineWidth + padding * 2;
    const tooltipHeight = tooltipLines.length * lineHeight + padding * 2;
    
    // Position tooltip to ensure it stays on canvas
    let tooltipX = x + this.pointSize + 10;
    let tooltipY = y - tooltipHeight / 2;
    
    if (tooltipX + tooltipWidth > this.canvas.width) {
      tooltipX = x - tooltipWidth - this.pointSize - 10;
    }
    
    if (tooltipY < 0) {
      tooltipY = 0;
    } else if (tooltipY + tooltipHeight > this.canvas.height) {
      tooltipY = this.canvas.height - tooltipHeight;
    }
    
    // Draw tooltip background
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.strokeStyle = '#333333';
    this.ctx.lineWidth = 1;
    this.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 5);
    this.ctx.fill();
    this.ctx.stroke();
    
    // Draw tooltip text
    this.ctx.fillStyle = '#333333';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    
    for (let i = 0; i < tooltipLines.length; i++) {
      this.ctx.fillText(
        tooltipLines[i],
        tooltipX + padding,
        tooltipY + padding + i * lineHeight
      );
    }
  }

  // Draw a rounded rectangle
  roundRect(x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.arcTo(x + width, y, x + width, y + height, radius);
    this.ctx.arcTo(x + width, y + height, x, y + height, radius);
    this.ctx.arcTo(x, y + height, x, y, radius);
    this.ctx.arcTo(x, y, x + width, y, radius);
    this.ctx.closePath();
  }

  // Calculate distance between two points using Euclidean distance
  calculateDistance(point1, point2) {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + 
      Math.pow(point2.y - point1.y, 2)
    );
  }

  // Convert hex color to rgba
  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Convert world X coordinate to canvas X coordinate
  worldToCanvasX(worldX) {
    const { minX, maxX } = this.viewportBounds;
    const worldWidth = maxX - minX;
    return ((worldX - minX) / worldWidth) * this.canvas.width;
  }

  // Convert world Y coordinate to canvas Y coordinate
  worldToCanvasY(worldY) {
    const { minY, maxY } = this.viewportBounds;
    const worldHeight = maxY - minY;
    // Flip Y axis so positive is up
    return this.canvas.height - ((worldY - minY) / worldHeight) * this.canvas.height;
  }

  // Convert canvas X coordinate to world X coordinate
  canvasToWorldX(canvasX) {
    const { minX, maxX } = this.viewportBounds;
    const worldWidth = maxX - minX;
    return minX + (canvasX / this.canvas.width) * worldWidth;
  }

  // Convert canvas Y coordinate to world Y coordinate
  canvasToWorldY(canvasY) {
    const { minY, maxY } = this.viewportBounds;
    const worldHeight = maxY - minY;
    // Flip Y axis so positive is up
    return maxY - (canvasY / this.canvas.height) * worldHeight;
  }

  // Export canvas as image
  exportAsImage(filename = 'kmeans-visualization.png') {
    // Create temporary link element
    const link = document.createElement('a');
    link.download = filename;
    
    // Convert canvas to data URL
    link.href = this.canvas.toDataURL('image/png');
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Main application controller
class SimulationController {
  constructor() {
    // Initialize core components
    this.dataGenerator = new DataGenerator();
    this.visualizationCanvas = new VisualizationCanvas('visualization-canvas');
    this.algorithm = null;
    this.metricsCalculator = null;
    
    // State variables
    this.points = [];
    this.centroids = [];
    this.assignments = [];
    this.history = [];
    this.movementHistory = [];
    this.iteration = 0;
    this.converged = false;
    this.isRunning = false;
    
    // Parameters
    this.k = 3;
    this.distanceMetric = 'euclidean';
    this.initMethod = 'random';
    this.maxIterations = 100;
    this.simulationSpeed = 500; // ms
    this.simulationInterval = null;
    
    // Visualization options
    this.showVoronoi = true;
    this.showHistoryTrail = true;
    this.showCentroids = true;
    this.showPoints = true;
    this.showGrid = true;
    
    // Initialize UI elements
    this.initializeUI();
    this.bindEvents();
  }

  
  initializeUI() {
   
    
    this.kValueSlider = document.getElementById('k-value');
    this.kValueDisplay = document.getElementById('k-value-display');
    
    this.varianceSlider = document.getElementById('variance');
    this.varianceValueDisplay = document.getElementById('variance-value-display');
    
    this.distanceMetricSelect = document.getElementById('distance-metric');
    this.initMethodSelect = document.getElementById('init-method');
    
    this.maxIterationsSlider = document.getElementById('max-iterations');
    this.maxIterationsDisplay = document.getElementById('max-iterations-display');
    
    this.simulationSpeedSlider = document.getElementById('simulation-speed');
    this.simulationSpeedDisplay = document.getElementById('simulation-speed-display');
    
    this.showCentroidsCheckbox = document.getElementById('show-centroids');
    this.showVoronoiCheckbox = document.getElementById('show-voronoi');
    this.showHistoryCheckbox = document.getElementById('show-history');
    this.showGridCheckbox = document.getElementById('show-grid');
    
    this.generateButton = document.getElementById('generate-data');
    this.clearButton = document.getElementById('clear-data');
    this.initializeButton = document.getElementById('initialize-btn');
    this.stepButton = document.getElementById('step-btn');
    this.runButton = document.getElementById('run-btn');
    this.pauseButton = document.getElementById('pause-btn');
    this.resetButton = document.getElementById('reset-btn');
    this.exportImageButton = document.getElementById('export-image');
    this.exportDataButton = document.getElementById('export-data');
    
    // Initialize input fields with values
    
    if (this.kValueSlider && this.kValueDisplay) {
      this.kValueDisplay.textContent = this.kValueSlider.value;
    }
    
    if (this.varianceSlider && this.varianceValueDisplay) {
      this.varianceValueDisplay.textContent = this.varianceSlider.value;
    }
    
    if (this.maxIterationsSlider && this.maxIterationsDisplay) {
      this.maxIterationsDisplay.textContent = this.maxIterationsSlider.value;
    }
    
    if (this.simulationSpeedSlider && this.simulationSpeedDisplay) {
      this.simulationSpeedDisplay.textContent = `${this.simulationSpeedSlider.value} ms`;
    }
    
    // Initialize status display
    this.iterationCount = document.getElementById('iteration-count');
    this.convergenceStatus = document.getElementById('convergence-status');
    this.pointCount = document.getElementById('point-count');
    this.clusterCountDisplay = document.getElementById('cluster-count');
    this.convergenceProgress = document.getElementById('convergence-progress');
    
    // Initialize metrics display
    this.varianceValue = document.getElementById('variance-value');
    this.silhouetteValue = document.getElementById('silhouette-value');
    this.daviesBouldinValue = document.getElementById('davies-bouldin-value');
    
    // Initialize cluster statistics
    this.clusterStatistics = document.getElementById('cluster-statistics');
    
    // Make panel sections collapsible
    const panelSections = document.querySelectorAll('.panel-section');
    panelSections.forEach(section => {
      const title = section.querySelector('.section-title');
      if (title) {
        title.addEventListener('click', () => {
          section.classList.toggle('collapsed');
        });
      }
    });
  }

  // Bind event listeners
  bindEvents() {
    // Remove point count input event listeners
    
    if (this.kValueSlider) {
      this.kValueSlider.addEventListener('input', () => {
        this.kValueDisplay.textContent = this.kValueSlider.value;
      });
    }
    
    if (this.varianceSlider) {
      this.varianceSlider.addEventListener('input', () => {
        this.varianceValueDisplay.textContent = this.varianceSlider.value;
      });
    }
    
    if (this.maxIterationsSlider) {
      this.maxIterationsSlider.addEventListener('input', () => {
        this.maxIterationsDisplay.textContent = this.maxIterationsSlider.value;
      });
    }
    
    if (this.simulationSpeedSlider) {
      this.simulationSpeedSlider.addEventListener('input', () => {
        this.simulationSpeedDisplay.textContent = `${this.simulationSpeedSlider.value} ms`;
      });
    }
    
    // Visualization options
    if (this.showCentroidsCheckbox) {
      this.showCentroidsCheckbox.addEventListener('change', () => {
        this.showCentroids = this.showCentroidsCheckbox.checked;
        this.updateVisualization();
      });
    }
    
    if (this.showVoronoiCheckbox) {
      this.showVoronoiCheckbox.addEventListener('change', () => {
        this.showVoronoi = this.showVoronoiCheckbox.checked;
        this.updateVisualization();
      });
    }
    
    if (this.showHistoryCheckbox) {
      this.showHistoryCheckbox.addEventListener('change', () => {
        this.showHistoryTrail = this.showHistoryCheckbox.checked;
        this.updateVisualization();
      });
    }
    
    if (this.showGridCheckbox) {
      this.showGridCheckbox.addEventListener('change', () => {
        this.showGrid = this.showGridCheckbox.checked;
        this.updateVisualization();
      });
    }
    
    // Button events
    if (this.generateButton) {
      this.generateButton.addEventListener('click', () => {
        console.log("Generate button clicked - will generate 250 points");
        this.generateData();
      });
    }
    
    if (this.clearButton) {
      this.clearButton.addEventListener('click', () => this.clearData());
    }
    
    if (this.initializeButton) {
      this.initializeButton.addEventListener('click', () => this.initializeAlgorithm());
    }
    
    if (this.stepButton) {
      this.stepButton.addEventListener('click', () => this.stepAlgorithm());
    }
    
    if (this.runButton) {
      this.runButton.addEventListener('click', () => this.runSimulation());
    }
    
    if (this.pauseButton) {
      this.pauseButton.addEventListener('click', () => this.pauseSimulation());
    }
    
    if (this.resetButton) {
      this.resetButton.addEventListener('click', () => this.resetSimulation());
    }
    
    if (this.exportImageButton) {
      this.exportImageButton.addEventListener('click', () => this.exportImage());
    }
    
    if (this.exportDataButton) {
      this.exportDataButton.addEventListener('click', () => this.exportData());
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Space bar to step simulation
      if (e.code === 'Space' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        if (this.algorithm && !this.isRunning && !this.converged) {
          this.stepAlgorithm();
        }
      }
      
      // R to run simulation
      if (e.code === 'KeyR' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        if (this.algorithm && !this.isRunning && !this.converged) {
          this.runSimulation();
        }
      }
      
      // P to pause simulation
      if (e.code === 'KeyP' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        if (this.isRunning) {
          this.pauseSimulation();
        }
      }
    });
  }

  // Generate data based on selected parameters
  generateData() {
    const pointCount = 250;
    
    let variance = 1.0; // Default value
    if (this.varianceSlider) {
      variance = parseFloat(this.varianceSlider.value);
      if (isNaN(variance)) {
        variance = 1.0; // Fallback to default
      }
    }
    
    console.log("Generating data with:", {
      pointCount,
      variance
    });
    
    // Generate random points with the specified variance
    this.points = this.dataGenerator.generateRandomPoints(pointCount, variance);
    
    // Verify points were generated correctly
    console.log(`Generated ${this.points.length} points out of ${pointCount} requested`);
    
    // Reset algorithm state
    this.resetAlgorithmState();
    
    // Update visualization
    this.visualizationCanvas.updateData(this.points, [], []);
    
    // Update UI
    this.updateStatusDisplay();
    this.updateButtonStates();
    
    // Show notification
    this.showNotification(`Generated ${this.points.length} random points`, 'success');
  }

  // Clear all data
  clearData() {
    this.points = [];
    this.resetAlgorithmState();
    this.visualizationCanvas.updateData([], [], []);
    this.updateStatusDisplay();
    this.updateButtonStates();
    this.clearClusterStatistics();
    
    this.showNotification('Data cleared', 'info');
  }

  // Initialize the k-means algorithm
  initializeAlgorithm() {
    if (this.points.length === 0) {
      this.showNotification('No data points available. Generate data first.', 'warning');
      return;
    }
    
    // Get parameters from UI
    this.k = parseInt(this.kValueSlider ? this.kValueSlider.value : 3);
    this.distanceMetric = this.distanceMetricSelect ? this.distanceMetricSelect.value : 'euclidean';
    this.initMethod = 'random'; // Only using random initialization
    this.maxIterations = parseInt(this.maxIterationsSlider ? this.maxIterationsSlider.value : 100);
    
    // Create algorithm instance
    this.algorithm = new KMeansAlgorithm(this.points, this.k, this.distanceMetric);
    
    try {
      // Initialize the algorithm
      this.algorithm.initialize(this.initMethod);
      
      // Update state variables
      this.centroids = this.algorithm.centroids;
      this.assignments = this.algorithm.assignments;
      this.history = this.algorithm.history;
      this.movementHistory = this.algorithm.movementHistory;
      this.iteration = this.algorithm.iteration;
      this.converged = this.algorithm.converged;
      
      // Create metrics calculator
      this.metricsCalculator = new MetricsCalculator(
        this.points,
        this.centroids,
        this.assignments,
        this.distanceMetric
      );
      
      // Calculate initial metrics
      this.calculateMetrics();
      
      // Update visualization
      this.visualizationCanvas.updateData(
        this.points, 
        this.centroids, 
        this.assignments,
        this.history
      );
      
      // Update UI
      this.updateStatusDisplay();
      this.updateButtonStates();
      
      this.showNotification(`Initialized k-means with k=${this.k} using random method`, 'success');
    } catch (error) {
      this.showNotification(`Error initializing algorithm: ${error.message}`, 'error');
    }
  }

  // Perform one step of the algorithm
  stepAlgorithm() {
    if (!this.algorithm) {
      this.showNotification('Algorithm not initialized. Initialize first.', 'warning');
      return;
    }
    
    if (this.converged) {
      this.showNotification('Algorithm has already converged.', 'info');
      return;
    }
    
    // Perform one step
    const continueRunning = this.algorithm.step();
    
    // Update state variables
    this.centroids = this.algorithm.centroids;
    this.assignments = this.algorithm.assignments;
    this.history = this.algorithm.history;
    this.movementHistory = this.algorithm.movementHistory;
    this.iteration = this.algorithm.iteration;
    this.converged = this.algorithm.converged;
    
    // Calculate metrics
    this.calculateMetrics();
    
    // Update visualization
    this.visualizationCanvas.updateData(
      this.points, 
      this.centroids, 
      this.assignments,
      this.history
    );
    
    // Update UI
    this.updateStatusDisplay();
    
    if (!continueRunning || this.iteration >= this.maxIterations) {
      this.converged = true;
      this.updateButtonStates();
      
      if (this.iteration >= this.maxIterations) {
        this.showNotification(`Reached maximum iterations (${this.maxIterations})`, 'warning');
      } else {
        this.showNotification('Algorithm converged', 'success');
      }
    }
  }

  // Run the simulation automatically
  runSimulation() {
    if (!this.algorithm) {
      this.showNotification('Algorithm not initialized. Initialize first.', 'warning');
      return;
    }
    
    if (this.converged) {
      this.showNotification('Algorithm has already converged.', 'info');
      return;
    }
    
    // Get simulation speed from UI
    this.simulationSpeed = parseInt(this.simulationSpeedSlider ? this.simulationSpeedSlider.value : 500);
    
    // Start automatic simulation
    this.isRunning = true;
    this.simulationInterval = setInterval(() => {
      // Perform one step
      const continueRunning = this.algorithm.step();
      
      // Update state variables
      this.centroids = this.algorithm.centroids;
      this.assignments = this.algorithm.assignments;
      this.history = this.algorithm.history;
      this.movementHistory = this.algorithm.movementHistory;
      this.iteration = this.algorithm.iteration;
      this.converged = this.algorithm.converged;
      
      // Calculate metrics
      this.calculateMetrics();
      
      // Update visualization
      this.visualizationCanvas.updateData(
        this.points, 
        this.centroids, 
        this.assignments,
        this.history
      );
      
      // Update UI
      this.updateStatusDisplay();
      
      if (!continueRunning || this.iteration >= this.maxIterations) {
        this.pauseSimulation();
        this.converged = true;
        
        if (this.iteration >= this.maxIterations) {
          this.showNotification(`Reached maximum iterations (${this.maxIterations})`, 'warning');
        } else {
          this.showNotification('Algorithm converged', 'success');
        }
      }
    }, this.simulationSpeed);
    
    // Update button states
    this.updateButtonStates();
    
    this.showNotification('Running simulation...', 'info');
  }

  // Pause the simulation
  pauseSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    
    this.isRunning = false;
    this.updateButtonStates();
    
    if (!this.converged) {
      this.showNotification('Simulation paused', 'info');
    }
  }

  // Reset the simulation
  resetSimulation() {
    this.pauseSimulation();
    this.resetAlgorithmState();
    
    if (this.points.length > 0) {
      this.visualizationCanvas.updateData(this.points, [], []);
    }
    
    this.updateStatusDisplay();
    this.updateButtonStates();
    this.clearClusterStatistics();
    
    this.showNotification('Simulation reset', 'info');
  }

  // Reset algorithm state variables
  resetAlgorithmState() {
    this.pauseSimulation();
    this.algorithm = null;
    this.metricsCalculator = null;
    this.centroids = [];
    this.assignments = [];
    this.history = [];
    this.movementHistory = [];
    this.iteration = 0;
    this.converged = false;
  }

  // Calculate metrics using the metrics calculator
  calculateMetrics() {
    if (!this.metricsCalculator) return;
    
    // Update data in metrics calculator
    this.metricsCalculator.updateData(
      this.points,
      this.centroids,
      this.assignments,
      this.distanceMetric
    );
    
    // Calculate statistics
    const statistics = this.metricsCalculator.generateStatistics();
    
    // Update metrics display
    this.updateMetricsDisplay(statistics);
    
    // Update cluster statistics
    this.updateClusterStatistics(statistics);
    
    return statistics;
  }

  // Update the visualization
  updateVisualization() {
    this.visualizationCanvas.updateOptions({
      showVoronoi: this.showVoronoi,
      showHistoryTrail: this.showHistoryTrail,
      showCentroids: this.showCentroids,
      showPoints: this.showPoints,
      showGrid: this.showGrid
    });
  }

  // Update status display
  updateStatusDisplay() {
    if (this.iterationCount) {
      this.iterationCount.textContent = this.iteration;
    }
    
    if (this.convergenceStatus) {
      if (this.converged) {
        this.convergenceStatus.textContent = 'Converged';
        this.convergenceStatus.className = 'status-value status-converged';
      } else if (this.isRunning) {
        this.convergenceStatus.textContent = 'Running';
        this.convergenceStatus.className = 'status-value status-running';
      } else if (this.iteration > 0) {
        this.convergenceStatus.textContent = 'In progress';
        this.convergenceStatus.className = 'status-value status-in-progress';
      } else if (this.centroids && this.centroids.length > 0) {
        this.convergenceStatus.textContent = 'Initialized';
        this.convergenceStatus.className = 'status-value status-initialized';
      } else {
        this.convergenceStatus.textContent = 'Not started';
        this.convergenceStatus.className = 'status-value status-waiting';
      }
    }
    
    if (this.pointCount) {
      this.pointCount.textContent = this.points.length;
    }
    
    if (this.clusterCountDisplay) {
      this.clusterCountDisplay.textContent = this.centroids.length || this.k;
    }
    
    if (this.convergenceProgress) {
      let progressPercent = 0;
      
      if (this.converged) {
        progressPercent = 100;
      } else if (this.iteration > 0) {
        // Estimate progress based on iteration and movement history
        if (this.movementHistory && this.movementHistory.length > 0) {
          const initialMovement = this.movementHistory[0];
          const currentMovement = this.movementHistory[this.movementHistory.length - 1];
          const movementRatio = initialMovement > 0 
            ? 1 - (currentMovement / initialMovement)
            : 0;
          
          progressPercent = Math.min(95, movementRatio * 100);
        } else {
          // Fallback to iteration-based progress
          progressPercent = Math.min(95, (this.iteration / this.maxIterations) * 100);
        }
      }
      
      this.convergenceProgress.style.width = `${progressPercent}%`;
    }
  }

  // Update metrics display
  updateMetricsDisplay(statistics) {
    if (!statistics) return;
    
    if (this.varianceValue && statistics.variance) {
      this.varianceValue.textContent = statistics.variance.total.toFixed(4);
    }
    
    if (this.silhouetteValue && statistics.silhouette !== undefined) {
      const silhouette = statistics.silhouette;
      this.silhouetteValue.textContent = silhouette.toFixed(4);
      
      // Add color coding based on silhouette value
      if (silhouette > 0.7) {
        this.silhouetteValue.className = 'metric-value metric-excellent';
      } else if (silhouette > 0.5) {
        this.silhouetteValue.className = 'metric-value metric-good';
      } else if (silhouette > 0.3) {
        this.silhouetteValue.className = 'metric-value metric-fair';
      } else if (silhouette > 0) {
        this.silhouetteValue.className = 'metric-value metric-poor';
      } else {
        this.silhouetteValue.className = 'metric-value metric-bad';
      }
    }
    
    if (this.daviesBouldinValue && statistics.daviesBouldin !== undefined) {
      const db = statistics.daviesBouldin;
      this.daviesBouldinValue.textContent = db.toFixed(4);
      
      // Add color coding based on Davies-Bouldin index (lower is better)
      if (db < 0.5) {
        this.daviesBouldinValue.className = 'metric-value metric-excellent';
      } else if (db < 0.8) {
        this.daviesBouldinValue.className = 'metric-value metric-good';
      } else if (db < 1.0) {
        this.daviesBouldinValue.className = 'metric-value metric-fair';
      } else if (db < 1.5) {
        this.daviesBouldinValue.className = 'metric-value metric-poor';
      } else {
        this.daviesBouldinValue.className = 'metric-value metric-bad';
      }
    }
  }

  // Update cluster statistics
  updateClusterStatistics(statistics) {
    if (!this.clusterStatistics || !statistics.clusterSizes || !this.centroids) return;
    
    // Clear previous content
    this.clusterStatistics.innerHTML = '';
    
    // If no clusters, show empty state
    if (this.centroids.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.innerHTML = '<p>Run the simulation to see cluster statistics</p>';
      this.clusterStatistics.appendChild(emptyState);
      return;
    }
    
    // Get maximum cluster size for scaling bars
    const maxSize = Math.max(...statistics.clusterSizes);
    
    // Create a stat item for each cluster
    for (let i = 0; i < this.centroids.length; i++) {
      const size = statistics.clusterSizes[i];
      const variance = statistics.variance.perCluster[i];
      const color = this.visualizationCanvas.clusterColors[i % this.visualizationCanvas.clusterColors.length];
      
      const clusterItem = document.createElement('div');
      clusterItem.className = 'cluster-stat-item';
      
      // Create header with color and title
      const header = document.createElement('div');
      header.className = 'cluster-header';
      
      const colorIndicator = document.createElement('div');
      colorIndicator.className = 'cluster-color';
      colorIndicator.style.backgroundColor = color;
      
      const title = document.createElement('h4');
      title.className = 'cluster-title';
      title.textContent = `Cluster ${i + 1}`;
      
      header.appendChild(colorIndicator);
      header.appendChild(title);
      clusterItem.appendChild(header);
      
      // Add size stat
      const sizeStat = document.createElement('div');
      sizeStat.className = 'cluster-stat';
      sizeStat.innerHTML = `<span>Size:</span> <span>${size} points</span>`;
      clusterItem.appendChild(sizeStat);
      
      // Add centroid position
      const centroidStat = document.createElement('div');
      centroidStat.className = 'cluster-stat';
      centroidStat.innerHTML = `<span>Centroid:</span> <span>(${this.centroids[i].x.toFixed(2)}, ${this.centroids[i].y.toFixed(2)})</span>`;
      clusterItem.appendChild(centroidStat);
      
      // Add variance
      const varianceStat = document.createElement('div');
      varianceStat.className = 'cluster-stat';
      varianceStat.innerHTML = `<span>Variance:</span> <span>${variance.toFixed(4)}</span>`;
      clusterItem.appendChild(varianceStat);
      
      // Add size bar
      const bar = document.createElement('div');
      bar.className = 'cluster-bar';
      
      const fill = document.createElement('div');
      fill.className = 'cluster-bar-fill';
      fill.style.width = `${(size / maxSize) * 100}%`;
      fill.style.backgroundColor = color;
      
      bar.appendChild(fill);
      clusterItem.appendChild(bar);
      
      this.clusterStatistics.appendChild(clusterItem);
    }
  }

  // Clear cluster statistics
  clearClusterStatistics() {
    if (!this.clusterStatistics) return;
    
    this.clusterStatistics.innerHTML = '';
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = '<p>Run the simulation to see cluster statistics</p>';
    this.clusterStatistics.appendChild(emptyState);
    
    // Reset metrics display
    if (this.varianceValue) this.varianceValue.textContent = '-';
    if (this.silhouetteValue) {
      this.silhouetteValue.textContent = '-';
      this.silhouetteValue.className = 'metric-value';
    }
    if (this.daviesBouldinValue) {
      this.daviesBouldinValue.textContent = '-';
      this.daviesBouldinValue.className = 'metric-value';
    }
  }

  // Update button states based on current application state
  updateButtonStates() {
    const hasPoints = this.points && this.points.length > 0;
    const isInitialized = this.centroids && this.centroids.length > 0;
    
    if (this.initializeButton) {
      this.initializeButton.disabled = !hasPoints;
    }
    
    if (this.stepButton) {
      this.stepButton.disabled = !isInitialized || this.converged || this.isRunning;
    }
    
    if (this.runButton) {
      this.runButton.disabled = !isInitialized || this.converged || this.isRunning;
    }
    
    if (this.pauseButton) {
      this.pauseButton.disabled = !this.isRunning;
    }
    
    if (this.resetButton) {
      this.resetButton.disabled = !isInitialized;
    }
    
    if (this.exportImageButton) {
      this.exportImageButton.disabled = !hasPoints;
    }
    
    if (this.exportDataButton) {
      this.exportDataButton.disabled = !hasPoints;
    }
  }

  // Export canvas as image
  exportImage() {
    if (!this.points || this.points.length === 0) {
      this.showNotification('No data to export', 'warning');
      return;
    }
    
    try {
      this.visualizationCanvas.exportAsImage('kmeans-visualization.png');
      this.showNotification('Image exported successfully', 'success');
    } catch (error) {
      this.showNotification(`Error exporting image: ${error.message}`, 'error');
    }
  }

  // Export data as CSV
  exportData() {
    if (!this.points || this.points.length === 0) {
      this.showNotification('No data to export', 'warning');
      return;
    }
    
    try {
      // Create CSV content
      let csv = 'x,y,cluster\n';
      
      for (let i = 0; i < this.points.length; i++) {
        const point = this.points[i];
        const cluster = this.assignments && this.assignments.length > i ? this.assignments[i] : '';
        csv += `${point.x},${point.y},${cluster}\n`;
      }
      
      // Create a download link
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'kmeans-data.csv';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.showNotification('Data exported as CSV', 'success');
    } catch (error) {
      this.showNotification(`Error exporting data: ${error.message}`, 'error');
    }
  }

  // Show a notification message
  showNotification(message, type = 'info', duration = 3000) {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    notification.innerHTML = `
      <div class="notification-message">${message}</div>
      <button class="notification-close">&times;</button>
    `;
    
    // Add to container
    container.appendChild(notification);
    
    // Add animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Set up close button
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
          if (notification.parentNode === container) {
            container.removeChild(notification);
          }
        }, 300);
      });
    }
    
    // Auto-remove after duration
    setTimeout(() => {
      if (notification.parentNode === container) {
        notification.classList.remove('show');
        setTimeout(() => {
          if (notification.parentNode === container) {
            container.removeChild(notification);
          }
        }, 300);
      }
    }, duration);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    const controller = new SimulationController();
    console.log('K-means Clustering Simulation initialized successfully');
  } catch (error) {
    console.error('Error initializing application:', error);
  }
});