from flask import Flask, request, jsonify
from transformers import pipeline
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
    for key, sequence in sequences.items():
        print(key, sequence)
        preds = classifier(sequence, labels)
        print(preds)
        scores = preds['scores']
        labels = preds['labels']
        assert len(scores) == len(labels)
        pred_label = labels[scores.index(max(scores))]
        response[key] = pred_label

    print(f"Classified request with {len(sequences)} sequences. Took {time.time() - start_time} seconds")
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
