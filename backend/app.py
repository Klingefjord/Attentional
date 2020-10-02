from flask import Flask, request, jsonify
from transformers import pipeline
import time

threshold = 0.6

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
        preds = classifier(sequence, labels)
        scores = preds['scores']
        labels = preds['labels']
        print(f"key: ", key)
        print(f"Sequence: ", sequence[0:100])
        print(f"Labels: ", labels)
        print(f"Scores: ", scores)
        assert len(scores) == len(labels)
        if (max(scores)) < threshold: continue # only return labels that passed the threshold
        pred_label = labels[scores.index(max(scores))]
        response[key] = pred_label

    
    print(f"Classified request with {len(sequences)} sequences. Took {time.time() - start_time} seconds")
    print(response)
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, threaded=True)
