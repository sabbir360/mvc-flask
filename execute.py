from helpers.dbhelper import DB
from application.mod_authentication.models import User
from helpers.loginhelper import PasswordHelper


DB.connect()

# user
DB.create_tables([User], safe=True)
User.create(full_name="Sabbir Ahmed", email="sabbir@w3.com", password=PasswordHelper().get_hash('test'), role="Super Admin")
for i in range(5000):
    full_name = "Sabbir " + str(500 + i) + " Ahmed"
    email = str(500 + i) + "sabbir@w3.com"
    print(email)
    # break
    User.create(full_name=full_name, email=email, password=PasswordHelper().get_hash('test'))

DB.close()
