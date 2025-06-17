In order to elaborate the concept, let us take an example of the library system. The books present in a library will be related to a variety of topics. Books based on similar topics are placed together. Say, some books are on computer programming, some on database systems, some on computer graphics, and so on. Sections are created in the library titled with these topics and the related books are kept in that shelf. Further sub-sections can be created on sub-topics if needed. When a visitor wants to search a book on specific topic he browses that particular section instead of going through all the books in the library.

### Introduction to Clustering
To understand clustering, consider a library system example:
- Books are organized by topics (e.g., programming, databases, graphics)
- Related books are placed together in sections
- Sub-sections can be created for subtopics
- This organization helps visitors find books efficiently

### Data Representation and Distance Measures

#### Feature Space Representation
- Data points are represented in a feature space
- Each point has multiple attributes/features
- Complex real-world data requires careful representation

#### Distance Measures
Common measures include:
- Euclidean distance: $d(x,y) = \sqrt{\sum_{i=1}^n (x_i - y_i)^2}$
- Minkowski distance: $d(x,y) = (\sum_{i=1}^n |x_i - y_i|^p)^{1/p}$
- These help quantify dissimilarity between data points

### Clustering Techniques

#### 1. K-means Clustering
An iterative algorithm that:
1. **Initialization**
   - Choose $k$ cluster centers
   - Can be random data points or random positions

2. **Assignment**
   - Assign each point to nearest cluster
   - Use squared Euclidean distance
   - Recompute cluster centers as centroids

3. **Iteration**
   - Repeat until convergence
   - Stop when cluster membership stabilizes

**Variants**:
- Improved initial center selection
- Cluster splitting and merging
- Various optimization techniques

#### 2. MST-Based Clustering
A graph-theoretic approach that:

1. **MST Construction**
   - Build minimal spanning tree of data points
   - Edge lengths = squared Euclidean distances

2. **Cluster Formation**
   - Delete edges exceeding threshold $\theta$
   - Form clusters from remaining connected components

3. **Threshold Selection**
   - Iterate over range of threshold values
   - Calculate Intra-cluster to Inter-cluster distance ratio
   - Select threshold with minimum ratio

**Implementation Details**:
- Based on [An Efficient Minimum Spanning Tree based Clustering Algorithm](references.md#3)
- Optimizes cluster quality
- Balances intra and inter-cluster distances
