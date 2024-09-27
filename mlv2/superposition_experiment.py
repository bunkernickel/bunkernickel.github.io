# File: superposition_experiment.py

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import matplotlib.pyplot as plt

# Parameters
num_features = 50  # Number of input features (n)
num_neurons = 20   # Number of hidden neurons (m)
sparsity = 0.1     # Sparsity level (probability that a feature is zero)
importance_decay = 0.9  # Decay factor for feature importance

# Generate feature importances
feature_importances = np.array([importance_decay ** i for i in range(num_features)])

# Generate synthetic data
def generate_data(num_samples, num_features, sparsity):
    X = np.random.uniform(0, 1, size=(num_samples, num_features))
    mask = np.random.binomial(1, 1 - sparsity, size=(num_samples, num_features))
    X = X * mask
    return X.astype(np.float32)

# Custom loss function with feature importance
def weighted_mse_loss(input, target, weight):
    return torch.mean(weight * (input - target) ** 2)

# Dataset
num_samples = 10000
X = generate_data(num_samples, num_features, sparsity)
X_tensor = torch.from_numpy(X)

# Define the model
class SuperpositionModel(nn.Module):
    def __init__(self, input_dim, hidden_dim):
        super(SuperpositionModel, self).__init__()
        self.encoder = nn.Linear(input_dim, hidden_dim, bias=False)
        self.decoder = nn.Linear(hidden_dim, input_dim, bias=True)
        self.relu = nn.ReLU()

    def forward(self, x):
        h = self.encoder(x)
        x_hat = self.relu(self.decoder(h))
        return x_hat

model = SuperpositionModel(num_features, num_neurons)

# Loss function and optimizer
importance_tensor = torch.from_numpy(feature_importances.astype(np.float32))
optimizer = optim.Adam(model.parameters(), lr=0.01)

# Training loop
epochs = 100
batch_size = 256
loss_history = []

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
    loss_history.append(loss.item())
    if (epoch+1) % 10 == 0:
        print(f'Epoch [{epoch+1}/{epochs}], Loss: {loss.item():.6f}')

# Plot loss curve
plt.figure()
plt.plot(range(epochs), loss_history)
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.title('Training Loss Curve')
plt.show()

# Analyze the weights
encoder_weights = model.encoder.weight.data.numpy()  # Shape: (hidden_dim, input_dim)
decoder_weights = model.decoder.weight.data.numpy()  # Shape: (input_dim, hidden_dim)
bias = model.decoder.bias.data.numpy()

# Save weights for visualization
np.save('encoder_weights.npy', encoder_weights)
np.save('decoder_weights.npy', decoder_weights)
np.save('bias.npy', bias)
