from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy_serializer import SerializerMixin
import datetime

db = SQLAlchemy()

class BaseModel(db.Model, SerializerMixin):
    """Base data model for all objects"""
    __abstract__ = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def __repr__(self):
        """Define a base way to print models"""
        return '%s(%s)' % (self.__class__.__name__, {
            column: value
            for column, value in self.to_dict().items()
        })

    def json(self):
        """Define a base way to jsonify models, dealing with datetime objects"""
        return {
            column: value if not isinstance(value, datetime.date) else value.strftime('%Y-%m-%d')
            for column, value in self.to_dict().items()
        }

class ClassificationResult(BaseModel):
    """The result after a classification"""
    __tablename__ = 'classification_result'
    serialize_only=('label', 'score', 'sequence_hash', 'host', 'seen')
    label = db.Column(db.String(), primary_key=True) #ForeignKey('label.name', ondelete='CASCADE'), primary_key=True)
    score = db.Column(db.Float())
    sequence_hash = db.Column(db.String(), primary_key=True)
    host = db.Column(db.String(), primary_key=True)#, ForeignKey('host.name', ondelete='CASCADE'))
    seen = db.Column(db.Boolean(), default=False)

# class Label(BaseModel):
#     """Label unique to a user"""
#     __tablename__ = 'label'
#     name = db.Column(db.String(), primary_key = True)
#     # user_id = db.column(db.Integer()) # todo
#     child = relationship('ClassificationResult', backref='label_backref', passive_deletes=True)

# class Host(BaseModel):
#     """Host unique to a user"""
#     __tablename__ = 'host'
#     name = db.Column(db.String(), primary_key = True)
#     # user_id = db.column(db.Integer()) # todo
#     child = relationship('ClassificationResult', backref='host_backref', passive_deletes=True)