# File: computation_superposition.py

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import matplotlib.pyplot as plt

# Parameters
num_features = 500
num_neurons = 200
sparsity = 0.1
importance_decay = 0.9

# Generate feature importances
feature_importances = np.array([importance_decay ** i for i in range(num_features)])
importance_tensor = torch.from_numpy(feature_importances.astype(np.float32))

# Generate synthetic data with negative values
def generate_signed_data(num_samples, num_features, sparsity):
    X = np.random.uniform(-1, 1, size=(num_samples, num_features))
    mask = np.random.binomial(1, 1 - sparsity, size=(num_samples, num_features))
    X = X * mask
    return X.astype(np.float32)

# Custom loss function with feature importance
def weighted_mse_loss(input, target, weight):
    return torch.mean(weight * (input - target) ** 2)

# Dataset
num_samples = 100000
X = generate_signed_data(num_samples, num_features, sparsity)
X_tensor = torch.from_numpy(X)
Y_tensor = torch.abs(X_tensor)  # Target is absolute value

# Define the model with ReLU activation in hidden layer
class ComputationModel(nn.Module):
    def __init__(self, input_dim, hidden_dim):
        super(ComputationModel, self).__init__()
        self.encoder = nn.Linear(input_dim, hidden_dim, bias=True)
        self.hidden_activation = nn.ReLU()
        self.decoder = nn.Linear(hidden_dim, input_dim, bias=True)
        self.output_activation = nn.ReLU()

    def forward(self, x):
        h = self.hidden_activation(self.encoder(x))
        x_hat = self.output_activation(self.decoder(h))
        return x_hat

model = ComputationModel(num_features, num_neurons)

# Loss function and optimizer
optimizer = optim.Adam(model.parameters(), lr=0.01)

# Training loop
epochs = 1000
batch_size = 256
loss_history = []

for epoch in range(epochs):
    perm = np.random.permutation(num_samples)
    X_shuffled = X_tensor[perm]
    Y_shuffled = Y_tensor[perm]
    for i in range(0, num_samples, batch_size):
        inputs = X_shuffled[i:i+batch_size]
        targets = Y_shuffled[i:i+batch_size]
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = weighted_mse_loss(outputs, targets, importance_tensor)
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
plt.title('Training Loss Curve for Computation Model')
plt.show()
