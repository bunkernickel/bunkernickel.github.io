# cultural_headwinds.py

import numpy as np

class CulturalHeadwinds:
    def __init__(self, taboo_words, virtue_words, suppression_factor=0.5, amplification_factor=1.5):
        self.taboo_words = set(taboo_words)
        self.virtue_words = set(virtue_words)
        self.suppression_factor = suppression_factor
        self.amplification_factor = amplification_factor

    def apply(self, word, embedding):
        transformed_embedding = embedding.copy()
        if word in self.taboo_words:
            transformed_embedding *= self.suppression_factor
        if word in self.virtue_words:
            transformed_embedding *= self.amplification_factor
        return transformed_embedding
