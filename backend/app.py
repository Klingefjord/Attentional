from flask import Flask, request, jsonify
from transformers import pipeline
import numpy as np
import time

app = Flask(__name__)
classifier = pipeline("zero-shot-classification")

@app.route('/')
def hello():
    return "Hello World!"

@app.route('/classify',  methods=['POST'])
def classify():
    """Take a set of labels and a dict of key to text, 
    and classify each piece of text according to labels
    """
    body = request.json
    labels = body['labels']
    sequences = body['sequences']

    response = {}

    start_time = time.time()
    for key, sequence_chunks in sequences.items():
        preds = np.zeros((len(sequence_chunks), len(labels)))
        for chunk_idx, chunk in enumerate(sequence_chunks):
            y = classifier(chunk, labels)
            preds[chunk_idx] = y['scores']

        scores = preds.mean(0).squeeze().tolist() # average the rows
        if (isinstance(scores, float)): scores = [scores] # numpy squeezes 1d arrays into scalars...
        assert len(scores) == len(labels)
        # print("==============")
        # print(f"key: ", key)
        # print(f"sequence: ”{sequence_chunks[0][0:20]} [...]”")
        # print(f"labels: ", labels)
        # print(f"Scores: ", scores)
        # print("==============")
        response[key] = {}
        for (label, score) in zip(labels, scores): response[key][label] = score
    
    print(f"Classified request with {len(sequences)} sequences. Took {time.time() - start_time} seconds")
    print(response)
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, threaded=True)
