# File: feature_geometry.py

from sklearn.decomposition import PCA
import matplotlib.pyplot as plt

# Assuming encoder_weights is of shape (hidden_dim, input_dim)
# Transpose to get feature vectors: (input_dim, hidden_dim)
feature_vectors = encoder_weights.T

# Reduce dimensions to 2D for visualization
pca = PCA(n_components=2)
feature_vectors_2d = pca.fit_transform(feature_vectors)

# Plot the features
plt.figure(figsize=(8, 6))
plt.scatter(feature_vectors_2d[:, 0], feature_vectors_2d[:, 1], c=range(num_features), cmap='viridis')
plt.colorbar(label='Feature Index')
plt.xlabel('Principal Component 1')
plt.ylabel('Principal Component 2')
plt.title('Feature Vectors in 2D Space')
plt.show()
