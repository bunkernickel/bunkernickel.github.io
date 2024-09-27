# embeddings.py

import numpy as np

class EmbeddingLoader:
    def __init__(self, embedding_path, embedding_dim):
        self.embedding_path = embedding_path
        self.embedding_dim = embedding_dim
        self.word_to_index = {}
        self.index_to_word = {}
        self.embeddings = []

    def load_embeddings(self):
        print("Loading embeddings...")
        with open(self.embedding_path, 'r', encoding='utf-8') as f:
            for idx, line in enumerate(f):
                values = line.strip().split()
                if len(values) != self.embedding_dim + 1:
                    continue  # Skip invalid lines
                word = values[0]
                vector = np.asarray(values[1:], dtype='float32')
                self.word_to_index[word] = idx
                self.index_to_word[idx] = word
                self.embeddings.append(vector)
        self.embeddings = np.array(self.embeddings)
        print(f"Loaded {len(self.embeddings)} word vectors.")

    def get_embedding(self, word):
        idx = self.word_to_index.get(word)
        if idx is not None:
            return self.embeddings[idx]
        else:
            return np.zeros(self.embedding_dim)

    def get_index(self, word):
        return self.word_to_index.get(word, -1)
