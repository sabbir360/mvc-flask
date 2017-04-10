from helpers.mockdbhelper import MockDBHelper
from flask import Flask, redirect, request, url_for
from htmlmin.main import minify

from application.mod_authentication.models import UserMix
from config import MOCK_TEST, DEBUG, APP_NAME
from helpers.dbhelper import DB as DB_CON
from helpers.loginhelper import LoginHelper

application = Flask(__name__)
# application.config.from_object('config')
application.secret_key = "ahdgate26t237ahd82ejTqhd912y9uo1Yu3017jsyfuwye7rSFUGWUF45243"


if MOCK_TEST:
    DB = MockDBHelper()
else:
    DB = DB_CON
    print("looks hmm")

    @application.before_request
    def _connect_db():
        if not MOCK_TEST:
            DB.connect()


    @application.teardown_request
    def _close_db():
        if not MOCK_TEST and not DB.is_closed():
            DB.close()


@application.after_request
def response_minify(response):
    """
    minify html response to decrease site traffic
    """
    if not DEBUG and response.content_type == u'text/html; charset=utf-8':
        response.set_data(
            minify(response.get_data(as_text=True))
        )

        return response
    return response


@application.errorhandler(401)
def unauthorized_page(e):
    print(str(e) + " : is here -->" + __file__)
    # import pdb; pdb.set_trace()
    # return redirect(url_for("mod_authentication.login"), 401)
    return redirect(url_for('mod_authentication.login', next=request.url))
    # return render_template('404.html'), 404


@application.context_processor
def custom_data_to_template():
    data = {}
    if LoginHelper.is_authenticated():
        data.update({'is_authenticated': True})
    else:
        data.update({'is_authenticated': False})

    data.update({'app_name': APP_NAME})
    return data
