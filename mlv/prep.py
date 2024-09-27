import numpy as np
from sklearn.decomposition import PCA
import json

# Load pre-trained GloVe embeddings (50-dimensional vectors)
embeddings_dict = {}
with open('mlv/glove.6B.50d.txt', 'r', encoding='utf-8') as f:
    for line in f:
        values = line.strip().split()
        word = values[0]
        vector = np.array(values[1:], dtype='float32')
        embeddings_dict[word] = vector

# List of words to visualize
words = [
    'king', 'queen', 'man', 'woman', 'child', 'apple', 'orange', 'banana', 'fruit',
    'dog', 'cat', 'animal', 'paris', 'france', 'london', 'england', 'city', 'country',
    'car', 'vehicle', 'bike', 'airplane', 'train', 'computer', 'laptop', 'phone', 'technology',
    'music', 'art', 'science', 'university', 'school', 'education', 'book', 'novel', 'story',
    'ocean', 'river', 'mountain', 'forest', 'tree', 'flower', 'sun', 'moon', 'star', 'planet'
]

# Filter out words not in the embeddings
filtered_words = [word for word in words if word in embeddings_dict]
if len(filtered_words) < len(words):
    missing_words = set(words) - set(filtered_words)
    print(f"The following words were not found in the embeddings: {missing_words}")

# Get embeddings for the filtered words
vectors = [embeddings_dict[word] for word in filtered_words]

# Perform PCA to reduce dimensions to 3D
pca = PCA(n_components=3)
reduced_vectors = pca.fit_transform(vectors)

# Save the words and their corresponding 3D vectors to a JSON file
data = {
    'words': filtered_words,
    'vectors': reduced_vectors.tolist()
}

with open('mlv/embedding_data.json', 'w') as outfile:
    json.dump(data, outfile)

print("Embedding data has been saved to 'embedding_data.json'.")
