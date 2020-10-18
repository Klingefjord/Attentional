from flask import Flask, request, jsonify
from parser import parser
from classifier import classify
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
    results = classify(sequences, labels, host)
    db.session.query(ClassificationResult).filter(ClassificationResult.host == host).delete()
    db.session.add_all(results)
    db.session.commit()
    return jsonify({})

@app.route('/content', methods=['POST'])
def content():
    """Get the classified text nodes for a specified host"""
    body = request.json
    host = body['host']
    labels = body['labels']
    results = [cr.to_dict() for cr in ClassificationResult.query.all() if cr.label in labels]
    return jsonify({ 'results': results })

if __name__ == '__main__':
    app.run(debug=True, threaded=True)