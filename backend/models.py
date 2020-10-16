from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
import datetime

db = SQLAlchemy()

class BaseModel(db.Model):
    """Base data model for all objects"""
    __abstract__ = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def __repr__(self):
        """Define a base way to print models"""
        return '%s(%s)' % (self.__class__.__name__, {
            column: value
            for column, value in self._to_dict().items()
        })

    def json(self):
        """Define a base way to jsonify models, dealing with datetime objects"""
        return {
            column: value if not isinstance(value, datetime.date) else value.strftime('%Y-%m-%d')
            for column, value in self._to_dict().items()
        }

class ClassificationResult(db.Model):
    """The result after a classification"""
    __tablename__ = 'classification_result'

    id = db.Column(db.Integer(), primary_key = True)
    label = db.Column(db.String(), ForeignKey('label.name', ondelete='CASCADE'))
    score = db.Column(db.Float())
    sequence_hash = db.Column(db.String())
    host = db.Column(db.String())

class Label(db.Model):
    """Label unique to a user"""
    __tablename__ = 'label'
    name = db.Column(db.String(), primary_key = True)
    # user_id = db.column(db.Integer()) # todo
    child = relationship('ClassificationResult', backref='labeliscious', passive_deletes=True)