# File: sparsity_experiment.py

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

# Parameters
num_features = 100
num_neurons = 20
importance_decay = 0.9
sparsity_levels = np.linspace(0.0, 0.9, 10)  # Vary sparsity from 0% to 90%

# Generate feature importances
feature_importances = np.array([importance_decay ** i for i in range(num_features)])
importance_tensor = torch.from_numpy(feature_importances.astype(np.float32))

# Record the number of features learned at each sparsity level
features_learned = []

for sparsity in sparsity_levels:
    # Generate data
    num_samples = 5000
    X = generate_data(num_samples, num_features, sparsity)
    X_tensor = torch.from_numpy(X)

    # Initialize model
    model = SuperpositionModel(num_features, num_neurons)

    # Optimizer
    optimizer = optim.Adam(model.parameters(), lr=0.01)

    # Training loop
    epochs = 50
    batch_size = 256
    for epoch in range(epochs):
        perm = np.random.permutation(num_samples)
        X_shuffled = X_tensor[perm]
        for i in range(0, num_samples, batch_size):
            inputs = X_shuffled[i:i+batch_size]
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = weighted_mse_loss(outputs, inputs, importance_tensor)
            loss.backward()
            optimizer.step()

    # Analyze the weights
    encoder_weights = model.encoder.weight.data.numpy()
    # Calculate the norm of each feature's weight vector
    feature_norms = np.linalg.norm(encoder_weights, axis=0)
    # Define a threshold to determine if a feature is "learned"
    threshold = 0.1
    num_features_learned = np.sum(feature_norms > threshold)
    features_learned.append(num_features_learned)

    print(f'Sparsity: {sparsity:.2f}, Features Learned: {num_features_learned}')

# Plot results
import matplotlib.pyplot as plt

plt.figure()
plt.plot(sparsity_levels, features_learned, marker='o')
plt.xlabel('Feature Sparsity')
plt.ylabel('Number of Features Learned')
plt.title('Effect of Sparsity on Superposition')
plt.show()
