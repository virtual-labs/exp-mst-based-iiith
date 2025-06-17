### Question 1: K-means Clustering
Use the k-means algorithm and Euclidean distance to cluster the following 8 examples into 3 clusters:
- $A_1 = (2, 10)$
- $A_2 = (2, 5)$
- $A_3 = (8, 4)$
- $A_4 = (5, 8)$
- $A_5 = (7, 5)$
- $A_6 = (6, 4)$
- $A_7 = (1, 2)$
- $A_8 = (4, 9)$

Initial seeds (centers of each cluster) are $A_1$, $A_4$, and $A_7$.

After running the k-means algorithm for 1 iteration, find:
1. The new clusters
2. The centers of the new clusters
3. How many more iterations are needed to converge?

### Question 2: MST-Based Clustering Analysis
Consider the following dataset:
- $P_1 = (1, 1)$
- $P_2 = (2, 2)$
- $P_3 = (4, 4)$
- $P_4 = (5, 5)$
- $P_5 = (8, 8)$
- $P_6 = (9, 9)$

a) Construct the complete graph with Euclidean distances between all points
b) Find the Minimum Spanning Tree (MST) of this graph
c) If we set the threshold distance to 3, how many clusters would be formed?
d) What would be the intra-cluster and inter-cluster distances for this clustering?

### Question 3: Clustering Algorithm Comparison
For the dataset in Question 2:

a) Apply k-means clustering with $k = 2$
b) Apply MST-based clustering with an appropriate threshold
c) Compare the results of both methods:
   - Which method gives more natural clusters?
   - How do the cluster shapes differ?
   - What are the advantages and disadvantages of each method for this dataset?