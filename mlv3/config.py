# config.py

embedding_dim = 50  # Dimensionality of the embeddings (e.g., 50, 100, 200, 300)
embedding_path = 'data/glove.6B.50d.txt'

num_agents = 3
num_interactions = 100
decay_rate = 0.01
reinforcement_rate = 0.05

# Define a vocabulary of words
vocabulary = [
    'love', 'hate', 'peace', 'war', 'happy', 'sad', 'music', 'silence', 'life', 'death',
    'freedom', 'slavery', 'truth', 'lie', 'light', 'dark', 'good', 'evil', 'friend', 'enemy',
    # Add more words as needed
]
