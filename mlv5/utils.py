import random
from agent import Agent
from cultural_headwinds import CulturalHeadwinds
import networkx as nx

def initialize_agents(num_agents, embedding_loader, device, decay_rate, reinforcement_rate):
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
        agent = Agent(
            agent_id,
            embedding_loader,
            cultural_headwinds,
            device,
            decay_rate,
            reinforcement_rate
        )
        agents.append(agent)
    return agents

def initialize_social_network(agents):
    G = nx.DiGraph()
    num_agents = len(agents)
    # Add agents as nodes
    for agent in agents:
        G.add_node(agent.agent_id, agent=agent)
    # Randomly create edges (followers)
    for agent in agents:
        num_following = random.randint(1, num_agents - 1)
        following = random.sample([a.agent_id for a in agents if a.agent_id != agent.agent_id], num_following)
        for followee_id in following:
            G.add_edge(agent.agent_id, followee_id)
    return G