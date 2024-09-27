# utils.py
from tqdm import tqdm
import random
from agent import Agent
from cultural_headwinds import CulturalHeadwinds

def initialize_agents(num_agents, embedding_loader, decay_rate, reinforcement_rate):
    agents = []
    vocabulary = list(embedding_loader.word_to_index.keys())
    for agent_id in range(num_agents):
        num_taboo = random.randint(5, 10)
        num_virtue = random.randint(5, 10)
        taboo_words = random.sample(vocabulary, num_taboo)
        virtue_words = random.sample(vocabulary, num_virtue)
        cultural_headwinds = CulturalHeadwinds(
            taboo_words,
            virtue_words,
            suppression_factor=0.3,
            amplification_factor=2.0
        )
        agent = Agent(agent_id, embedding_loader, cultural_headwinds, decay_rate, reinforcement_rate)
        agents.append(agent)
    return agents

# utils.py

def simulate_interactions(agents, num_interactions, vocabulary):
    for _ in tqdm(range(num_interactions), desc="Interactions"):
        # Randomly select two agents to interact
        agent_a, agent_b = random.sample(agents, 2)
        # Randomly select words to communicate
        message_words = random.sample(vocabulary, random.randint(1, 5))
        # Agent A sends a message
        message_vector = agent_a.send_message(message_words)
        # Agent B receives the message
        received_words = agent_b.receive_message(message_vector)
        # Agents update embeddings based on the interaction
        agent_a.update_embeddings(message_words)        # Update with message_words
        agent_b.update_embeddings(received_words)       # Optionally update agent B
