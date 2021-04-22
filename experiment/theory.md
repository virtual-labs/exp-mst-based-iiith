In order to elaborate the concept, let us take an example of the library system. The books present in a library will be related to a variety of topics. Books based on similar topics are placed together. Say, some books are on computer programming, some on database systems, some on computer graphics, and so on. Sections are created in the library titled with these topics and the related books are kept in that shelf. Further sub-sections can be created on sub-topics if needed. When a visitor wants to search a book on specific topic he browses that particular section instead of going through all the books in the library.

The data for clustering can get really complex in many of the real world applications. It was relatively simple in the above example. The data to be clustered needs to be represented in a feature space. Then a suitable distance measure is defined to calculate the dissimilarity between to data points. The well-known dissimilarity measures used are Euclidean distance or Minkowski distance.

We will discuss two clustering techniques - K means and MST based partitioning.

** K-means clustering**

This is an iterative clustering algorithm typically run with different start states until a satisfactory partitioning is done. The start state being selection of cluster centers. The number of clusters needs to be defined beforehand. The algorithm runs in the following way -

 - Choose k cluster centers to coincide with k randomly chosen data points or k randomly defined points inside the hypervolume containing the data set.
  
 - Assign each point to the closest cluster. The squared euclidean distance is used here. Recompute the new cluster centers as the centroids of the resultant clusters.
  
 - Repeat this until convergence is achieved, i.e the cluster membership is stable.

Several variants of this algorithm have been reported in the literature. Some attempt to select good initial centers, some permit splitting and merging of the formed clusters for better results.

**MST based clustering**

This is a graph theoretic clustering algorithm based on construction of minimal spanning trees(MST) of the data. The edge lengths are the squared euclidean distances between the two nodes. Edges with length greater than some threshold are then deleted from the MST to form data clusters.

Many variants of the algorithm exist in the literature attempting to improve clustering results. The implementation in our experiment is from [Ref #3]. First, the MST is constructed on the data points. Then the clustering process is iterated over a range of threshold edge lengths. Each time ratio of Intra-cluster distance to Inter-cluster distance is calculated for the data points in the clustering result. The final cluster set selected based on the threshold which has the minimum Intra-cluster to Inter-cluster distance ratio.
