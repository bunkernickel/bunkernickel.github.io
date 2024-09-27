# agent.py

import numpy as np
from embeddings import EmbeddingLoader

class Agent:
    def __init__(self, agent_id, embedding_loader, cultural_headwinds, decay_rate=0.01, reinforcement_rate=0.05):
        self.agent_id = agent_id
        self.embedding_loader = embedding_loader
        self.vocabulary = embedding_loader.word_to_index.keys()
        self.embeddings = {}
        for word in self.vocabulary:
            base_embedding = embedding_loader.get_embedding(word)
            self.embeddings[word] = cultural_headwinds.apply(word, base_embedding)
        self.decay_rate = decay_rate
        self.reinforcement_rate = reinforcement_rate
        self.used_words = set()

    def send_message(self, message_words):
        # Encode a message by summing the embeddings of the words
        message_vector = np.sum([self.embeddings[word] for word in message_words], axis=0)
        return message_vector

    def receive_message(self, message_vector):
        # Decode the message by finding words with embeddings closest to the message_vector
        # For simplicity, we use cosine similarity
        similarities = {}
        for word in self.vocabulary:
            word_embedding = self.embeddings[word]
            sim = cosine_similarity(message_vector, word_embedding)
            similarities[word] = sim
        # Get top N words
        received_words = sorted(similarities, key=similarities.get, reverse=True)[:5]
        # Update embeddings based on received message
        self.update_embeddings(received_words)
        return received_words

    def update_embeddings(self, used_words):
        # Decay all embeddings
        for word in self.vocabulary:
            self.embeddings[word] *= (1 - self.decay_rate)
        # Reinforce used words
        for word in used_words:
            self.embeddings[word] += self.reinforcement_rate
            self.used_words.add(word)

def cosine_similarity(vec1, vec2):
    dot_product = np.dot(vec1, vec2)
    norm_a = np.linalg.norm(vec1)
    norm_b = np.linalg.norm(vec2)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot_product / (norm_a * norm_b)
