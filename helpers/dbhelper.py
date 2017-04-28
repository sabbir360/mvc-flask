from flask import request
from peewee import Model, MySQLDatabase
from config import DB_CONFIG

DB = MySQLDatabase(DB_CONFIG['db'], user=DB_CONFIG['username'], password=DB_CONFIG['password'])


class BaseModel(Model):
    """
    Base Model using peewee
    """

    class Meta:
        database = DB
