// Simple responsive behavior for K-means Clustering Simulation
// This script only adds window resize handling without modifying the core simulation

document.addEventListener('DOMContentLoaded', function() {
  // Call resizeCanvas function when window is resized
  window.addEventListener('resize', function() {
    // Check if visualization canvas exists in the global scope
    // This avoids interfering with the main simulation code
    if (window.visualization && 
        window.visualization.visualizationCanvas && 
        typeof window.visualization.visualizationCanvas.resizeCanvas === 'function') {
      // Use the existing resizeCanvas method from the main simulation
      window.visualization.visualizationCanvas.resizeCanvas();
    }
  });

  // Handle orientation change on mobile devices
  window.addEventListener('orientationchange', function() {
    // Slight delay to ensure proper rendering after orientation change
    setTimeout(function() {
      if (window.visualization && 
          window.visualization.visualizationCanvas && 
          typeof window.visualization.visualizationCanvas.resizeCanvas === 'function') {
        window.visualization.visualizationCanvas.resizeCanvas();
      }
    }, 200);
  });
});
