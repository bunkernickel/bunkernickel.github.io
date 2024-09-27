# File: visualize_weights.py

import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Load saved weights
encoder_weights = np.load('encoder_weights.npy')  # Shape: (hidden_dim, input_dim)
decoder_weights = np.load('decoder_weights.npy')  # Shape: (input_dim, hidden_dim)
bias = np.load('bias.npy')

# Visualize encoder weights
plt.figure(figsize=(12, 6))
sns.heatmap(encoder_weights, cmap='coolwarm', center=0)
plt.title('Encoder Weights Heatmap')
plt.xlabel('Input Features')
plt.ylabel('Hidden Neurons')
plt.show()

# Visualize decoder weights
plt.figure(figsize=(12, 6))
sns.heatmap(decoder_weights.T, cmap='coolwarm', center=0)
plt.title('Decoder Weights Heatmap')
plt.xlabel('Hidden Neurons')
plt.ylabel('Input Features')
plt.show()

# Analyze feature norms
feature_norms = np.linalg.norm(encoder_weights, axis=0)
plt.figure()
plt.plot(range(len(feature_norms)), feature_norms)
plt.xlabel('Feature Index')
plt.ylabel('Encoder Weight Norm')
plt.title('Feature Representation Strength')
plt.show()
