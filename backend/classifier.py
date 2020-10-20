from transformers import pipeline
from models import ClassificationResult
import hashlib
import time
import re

class Classifier():
    def __init__(self):
        super().__init__()
        self.bart_classifier = pipeline("zero-shot-classification", model="valhalla/distilbart-mnli-12-1")

    def __sequence_hash(self, sequence): return hashlib.sha1(sequence.encode('utf-8')).hexdigest()

    def classify(self, sequences, labels, host):
        """Calls the classification model with a set of sequences and a set of labels"""

        start_time = time.time()
        print(f"Starting classifier for {len(sequences)} sequences.")
        outputs = self.bart_classifier(sequences, labels, multi_class=True)

        db_results = []
        for output in outputs:
            for label, score in zip(output['labels'], output['scores']):
                if (score >= 0.6):
                    print(f"Sequence: {output['sequence'][:100]} \t score: {score} \t label: {label}")
                db_results.append(ClassificationResult(
                    label=label, 
                    score=score, 
                    host=host,
                    sequence_hash=self.__sequence_hash("".join(output['sequence'].split()))))

        print(f"Finished classifying {len(sequences)} sequences. Took {time.time() - start_time} s")
        return db_results