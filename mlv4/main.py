# main.py

import numpy as np
import matplotlib.pyplot as plt
from config import (
    embedding_dim, embedding_path, num_agents, num_interactions,
    decay_rate, reinforcement_rate, vocabulary
)
from utils import initialize_agents, simulate_interactions
from embeddings import EmbeddingLoader
from tqdm import tqdm
import torch

def main():
    # Load embeddings with a progress bar
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(device)
    # Initialize agents with the device
    
    print("Loading embeddings...")
    embedding_loader = EmbeddingLoader(embedding_path, embedding_dim, device)
    embedding_loader.load_embeddings()

    # Filter vocabulary to words present in embeddings
    available_vocabulary = [word for word in vocabulary if word in embedding_loader.word_to_index]
    if not available_vocabulary:
        print("No words from the vocabulary are present in the embeddings.")
        return

    # Initialize agents with a progress bar
    print("Initializing agents...")
    agents = initialize_agents(num_agents, embedding_loader, device, decay_rate, reinforcement_rate)

    # Simulate interactions with progress bar
    print("Simulating interactions...")
    simulate_interactions(agents, num_interactions, available_vocabulary)

    # Analyze word strengths with progress bar
    print("Analyzing word strengths...")
    word_strengths = {}
    for agent in tqdm(agents, desc="Processing agents"):
        for word in available_vocabulary:
            idx = agent.word_to_index[word]
            strength = agent.embeddings[idx].norm().item()
            if word not in word_strengths:
                word_strengths[word] = []
            word_strengths[word].append(strength)

    # Compute average strengths
    average_strengths = {word: np.mean(strengths) for word, strengths in word_strengths.items()}

    # Plot word strengths
    words = list(average_strengths.keys())
    strengths = [average_strengths[word] for word in words]

    plt.figure(figsize=(12, 6))
    plt.bar(words, strengths)
    plt.xlabel('Words')
    plt.ylabel('Average Word Strength')
    plt.title('Word Strengths After Interactions')
    plt.xticks(rotation=90)
    plt.tight_layout()
    plt.show()
    
if __name__ == "__main__":
    main()
