# agent.py

import torch
from embeddings import EmbeddingLoader


class Agent:
    def __init__(self, agent_id, embedding_loader, cultural_headwinds, device, decay_rate=0.01, reinforcement_rate=0.05):
        self.agent_id = agent_id
        self.embedding_loader = embedding_loader
        self.vocabulary = list(embedding_loader.word_to_index.keys())
        self.word_to_index = {word: idx for idx, word in enumerate(self.vocabulary)}
        self.index_to_word = {idx: word for idx, word in enumerate(self.vocabulary)}
        self.device = device

        # Stack embeddings into a tensor
        embeddings_list = []
        for word in self.vocabulary:
            base_embedding = embedding_loader.get_embedding(word)
            # base_embedding is already a tensor on the correct device
            # No need to convert it again
            transformed_embedding = cultural_headwinds.apply(word, base_embedding)
            embeddings_list.append(transformed_embedding)
        self.embeddings = torch.stack(embeddings_list)  # Shape: (vocab_size, embedding_dim)

        self.decay_rate = decay_rate
        self.reinforcement_rate = reinforcement_rate
        self.used_words = set()


    def send_message(self, message_words):
        # Get indices of the message words
        indices = [self.word_to_index[word] for word in message_words]
        # Sum the embeddings of the message words
        message_vector = self.embeddings[indices].sum(dim=0)
        return message_vector

    def receive_message(self, message_vector):
        # Normalize embeddings and message vector
        embeddings_norm = self.embeddings / (self.embeddings.norm(dim=1, keepdim=True) + 1e-8)
        message_vector_norm = message_vector / (message_vector.norm() + 1e-8)

        # Compute cosine similarities
        similarities = torch.mv(embeddings_norm, message_vector_norm)

        # Get top N words
        topk = torch.topk(similarities, k=5)
        indices = topk.indices
        received_words = [self.index_to_word[idx.item()] for idx in indices]

        # Update embeddings based on received message
        self.update_embeddings(received_words)
        return received_words

    def update_embeddings(self, used_words):
        # Decay all embeddings
        self.embeddings *= (1 - self.decay_rate)

        # Reinforce used words
        indices = [self.word_to_index[word] for word in used_words if word in self.word_to_index]
        self.embeddings[indices] += self.reinforcement_rate
        self.used_words.update(used_words)

def cosine_similarity(vec1, vec2):
    dot_product = torch.dot(vec1, vec2)
    norm_a = torch.norm(vec1)
    norm_b = torch.norm(vec2)
    if norm_a == 0 or norm_b == 0:
        return torch.tensor(0.0, device=vec1.device)
    return dot_product / (norm_a * norm_b)
