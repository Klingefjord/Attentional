from flask import Flask, request, jsonify
from transformers import pipeline
import numpy as np
import time

app = Flask(__name__)
classifier = pipeline("zero-shot-classification", model="valhalla/distilbart-mnli-12-1")

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
    start_time = time.time()
    outputs = classifier([s[1] for s in sequences.items()], labels, multi_class=True)
    response = {}
    for i, (key, _) in enumerate(sequences.items()):
        output = outputs[i] if isinstance(outputs, list) else outputs
        for label, score in zip(output['labels'], output['scores']):
            response[key] = { label: score }
    
    print(f"Classified request with {len(sequences)} sequences. Took {time.time() - start_time} seconds")
    print(response)
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, threaded=True)
