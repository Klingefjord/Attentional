from flask import Flask, request, jsonify
from parser import parser
from classifier import classify
from flask_sqlalchemy import SQLAlchemy

from flask_script import Manager
from flask_migrate import Migrate, MigrateCommand

from models import db, ClassificationResult, Label

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

@app.route('/labels/update', methods=['POST'])
def set_labels():
    """Set the entire set of labels for a user"""
    body = request.json
    labels = body['labels']
    db.session.query(Label).delete() # since we don't have users yet, wipe all labels
    for label in labels: db.session.add(Label(name=label))
    db.session.commit()
    return jsonify({})

@app.route('/parse/schedule', methods=['POST'])
def parse():
    """Schedule a specified host for parsing"""
    body = request.json
    host = body['host']
    sequences = parser.parse(host)
    labels = [str(l.name) for l in db.session.query(Label).all()]
    results = classify(sequences, labels, host)
    db.session.add_all(results)
    db.session.commit()
    return jsonify({})

if __name__ == '__main__':
    app.run(debug=True, threaded=True)
