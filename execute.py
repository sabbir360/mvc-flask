from helpers.dbhelper import DB
from application.mod_authentication.models import User
from helpers.loginhelper import PasswordHelper


DB.connect()

# user
DB.create_tables([User], safe=True)
User.create(email="sabbir@w3.com", password=PasswordHelper().get_hash('test'))
