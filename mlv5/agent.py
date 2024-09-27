import torch
from collections import Counter

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
            transformed_embedding = cultural_headwinds.apply(word, base_embedding)
            embeddings_list.append(transformed_embedding)
        self.embeddings = torch.stack(embeddings_list)  # Shape: (vocab_size, embedding_dim)

        self.decay_rate = decay_rate
        self.reinforcement_rate = reinforcement_rate
        self.used_words = set()

        self.timeline = []  # List to store received messages

    def send_message(self, message_id_counter):
        # Decide what to post based on the timeline
        word_counter = Counter()
        for msg in self.timeline[-10:]:  # Consider last 10 messages
            word_counter.update(msg['content'])
        
        # If no words in timeline, select random words
        if not word_counter:
            message_words = [self.vocabulary[i] for i in torch.randperm(len(self.vocabulary))[:5]]
        else:
            # Select words to include in the message
            top_words = [word for word, _ in word_counter.most_common(5)]
            message_words = top_words

        # Create the message vector
        indices = [self.word_to_index[word] for word in message_words if word in self.word_to_index]
        message_vector = self.embeddings[indices].sum(dim=0)

        message = {
            'id': message_id_counter,
            'sender': self.agent_id,
            'content': message_words,
            'vector': message_vector
        }
        print(self.agent_id, message)
        return message

    def receive_messages(self, messages):
        # Append messages to the timeline
        self.timeline.extend(messages)
        # Update embeddings based on received messages
        for message in messages:
            self.process_message(message)

    def process_message(self, message):
        # Extract words from the message
        words = message['content']
        self.update_embeddings(words)

    def update_embeddings(self, used_words):
        # Decay all embeddings
        self.embeddings *= (1 - self.decay_rate)
        # Reinforce used words
        indices = [self.word_to_index[word] for word in used_words if word in self.word_to_index]
        if indices:
            self.embeddings[indices] += self.reinforcement_rate
            self.used_words.update(used_words)

    def get_embedding_strength(self, word):
        idx = self.word_to_index.get(word)
        if idx is not None:
            return self.embeddings[idx].norm().item()
        else:
            return 0.0