from datetime import datetime

from helpers.loginhelper import PasswordHelper
from peewee import CharField, DateTimeField, SQL

from helpers.dbhelper import BaseModel


class User(BaseModel):
    email = CharField(unique=True)
    password = CharField()
    created = DateTimeField(default=datetime.now)
    updated = DateTimeField(null=True, constraints=[SQL('ON UPDATE CURRENT_TIMESTAMP')])
    full_name = CharField(null=True)
    role = CharField(default="user", choices=[("user", "User"), ("admin", "Admin")])


class UserMix:
    """
    def __init__(self, email=None):
        self.email = email
    """
    email = None

    def __init__(self, email, password):
        user_model = User()
        password_helper = PasswordHelper()
        user = user_model.select().where(user_model.email == email and user_model.password == password_helper.get_hash(password))

        if user:
            self.email = user.email

    def get_id(self):
        return self.email

    def is_active(self):
        if self.email:
            return True

    def is_anonymous(self):
        if not self.email:
            return True

    def is_authenticated(self):

        return self.is_active()
