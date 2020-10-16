from transformers import pipeline
from models import ClassificationResult
import hashlib
import numpy as np
import time

bart_classifier = pipeline("zero-shot-classification", model="valhalla/distilbart-mnli-12-1")

def classify(sequences, labels, host):
    """Calls the classification model with a set of sequences and a set of labels"""

    start_time = time.time()
    print(f"Starting classifier for {len(sequences)} sequences.")
    outputs = bart_classifier(sequences, labels, multi_class=True)

    db_results = []
    for output in outputs:
        for label, score in zip(output['labels'], output['scores']):
            db_results.append(ClassificationResult(
                label=label, 
                score=score, 
                host=host,
                sequence_hash=sequence_hash(output['sequence'])))

    print(f"Finished classifying {len(sequences)} sequences. Took {time.time() - start_time} s")
    return db_results

# Legacy endpoint
# @app.route('/classify',  methods=['POST'])
# def classify():
#     """Take a set of labels and a dict of key to text, 
#     and classify each piece of text according to labels
#     """
#     body = request.json
#     labels = body['labels']
#     sequences = body['sequences']
#     start_time = time.time()
#     outputs = classifier([s[1] for s in sequences.items()], labels, multi_class=True)
#     response = {}
#     for i, (key, _) in enumerate(sequences.items()):
#         output = outputs[i] if isinstance(outputs, list) else outputs
#         for label, score in zip(output['labels'], output['scores']):
#             response[key] = { label: score }
    
#     print(f"Classified request with {len(sequences)} sequences. Took {time.time() - start_time} seconds")
#     print(response)
#     return jsonify(response)



def sequence_hash(sequence): return hashlib.sha1(sequence.encode('utf-8')).hexdigest()