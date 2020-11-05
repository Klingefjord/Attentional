from threading import Thread
from flask import Flask, request, jsonify
from classifier import Classifier
from parser import parser
from flask_sqlalchemy import SQLAlchemy

from flask_script import Manager
from flask_migrate import Migrate, MigrateCommand

# import logging

# logging.basicConfig(filename='db.log')
# logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

from models import db, ClassificationResult #, Label, Host

app = Flask(__name__)

POSTGRES = {
    'user': 'postgres',
    'pw': 'password',
    'db': 'attentional_dev',
    'host': 'localhost',
    'port': '5432',
}
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://%(user)s:\
%(pw)s@%(host)s:%(port)s/%(db)s' % POSTGRES

db.init_app(app)
classifier = Classifier()


@app.route('/')
def hello():
    return "Hello World!"

# @app.route('/labels/update', methods=['POST'])
# def set_labels():
#     """Set the entire set of labels for a user"""
#     body = request.json
#     labels = body['labels']
#     db.session.query(Label).delete() # since we don't have users yet, wipe all labels
#     for label in labels: db.session.add(Label(name=label))
#     db.session.commit()
#     return jsonify({})

# @app.route('/hosts/update', methods=['POST'])
# def set_labels():
#     """Set the entire set of hosts for a user"""
#     body = request.json
#     labels = body['hosts']
#     db.session.query(Host).delete() # since we don't have users yet, wipe all labels
#     for host in hosts: db.session.add(Host(name=host))
#     db.session.commit()
#     return jsonify({})

@app.route('/parse', methods=['POST'])
def parse():
    """Schedule a specified host for parsing"""
    body = request.json
    host = body['host']
    labels = body['labels']
    sequences = parser.parse(host)
    #labels = [str(l.name) for l in db.session.query(Label).all()]
    results = classifier.classify(sequences, labels, host)
    # db.session.query(ClassificationResult).filter(ClassificationResult.host == host).delete()
    for result in results:
        db.session.merge(result)

    db.session.commit()
    return jsonify({})

@app.route('/classify', methods=['POST'])
def classify():
    """Classify a set of sequences"""
    body = request.json
    sequences = body['sequences']
    host = body['host']
    labels = body['labels']
    Thread(target = classify_task, args=(sequences, labels, host, app)).start()
    return jsonify({})

def classify_task(sequences, labels, host, app):
    with app.app_context():
        results = classifier.classify(sequences, labels, host)
        for result in results: db.session.merge(result)
        db.session.commit()
        return

@app.route('/content', methods=['POST'])
def content():
    """Get the classified text nodes for a specified host"""
    body = request.json
    host = body['host']
    labels = body['labels']
    results = [cr.to_dict() for cr in ClassificationResult.query.filter(ClassificationResult.host == host).all() if cr.label in labels and not cr.seen]
    return jsonify({ 'results': results })

@app.route('/seen', methods=['POST'])
def mark_as_seen():
    """Mark a classification result as seen for a certain host"""
    body = request.json
    host = body['host']
    labels = body['labels']
    sequence_hashes = body['sequence_hashes']
    for sequence_hash in sequence_hashes:
        for cr in ClassificationResult.query.filter(ClassificationResult.host == host, ClassificationResult.sequence_hash == sequence_hash).all():
            if cr.label in labels:
                cr.seen = True
    db.session.commit()
    return jsonify({})


if __name__ == '__main__':
    app.run(debug=True, threaded=True)