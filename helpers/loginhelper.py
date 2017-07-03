from hashlib import sha512
from functools import wraps
from flask import session, abort

from helpers.generic import set_message, FLASH_MESSAGE_WARNING

# sys.path.append(os.path.dirname(os.path.realpath(__file__)) + "/../application/mod_authentication")

import application


class PasswordHelper:

    salt = "jahdjagudafyre62raygd712rejadsguafd8q".encode('utf-8')

    def get_hash(self, plain):
        return sha512(plain.encode('utf-8') + self.get_salt()).hexdigest()

    def get_salt(self):
        return self.salt
        # return sha512(str(self.salt).encode('utf-8')).hexdigest()

    def validate_password(self, plain, expected):
        return self.get_hash(plain) == expected


class LoginHelper:
    email = None
    full_name = None
    user_id = None
    user_role = None

    def __init__(self, username, password):
        user_model = application.mod_authentication.models.User
        password_helper = PasswordHelper()
        try:
            user = user_model().get(
                user_model.email == username)

            # and user_model.password == password_helper.get_hash(password)
            if user and user.password == password_helper.get_hash(password):
                self.email = user.email
                self.full_name = user.full_name
                self.user_role = user.role
                self.user_id = user.id
                self.set_authentication()
        except user_model.DoesNotExist:
            set_message("Incorrect Username/Password", FLASH_MESSAGE_WARNING)
        except Exception as ex:
            print(str(ex))
            # set_message(ex., FLASH_MESSAGE_WARNING)

    def set_authentication(self):
        session['logged_in'] = dict(email=self.email, user_role=self.user_role,
                                    full_name=self.full_name, user_id=self.user_id)

    @staticmethod
    def is_authenticated():
        if 'logged_in' in session:
            return session['logged_in']
        return False

    @staticmethod
    def logout():
        if LoginHelper.is_authenticated():
            session['logged_in'] = None
        return True

    @staticmethod
    def is_super_admin():
        if session.get("logged_in")["user_role"] == application.mod_authentication.models.User.user_role_choices()['superadmin']:
            return True

    @staticmethod
    def is_admin():
        if session.get("logged_in")["user_role"] == application.mod_authentication.models.User.user_role_choices()['admin']:
            return True

    @staticmethod
    def is_user():
        # print(session.get("logged_in")["user_role"])
        if session.get("logged_in")["user_role"] == application.mod_authentication.models.User.user_role_choices()['user']:
            return True


def login_check(func):
    @wraps(func)
    def decorated_view(*args, **kwargs):
        if not LoginHelper.is_authenticated():
            # flash("Login required.", "Warning")
            # return redirect("http://localhost:8000?next_url=", code=401)
            return abort(401)
        return func(*args, **kwargs)

    return decorated_view
