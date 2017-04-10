from flask import Blueprint, render_template
from helpers.generic import set_template
from helpers.loginhelper import login_check


# Define the blueprint: 'auth', set its url prefix: app.url/auth
bp_app = Blueprint('mod_dashboard', __name__)
template_prefix = "dashboard"


@bp_app.route("/")
@login_check
def dashboard():
    # return render_template("authentication/dashboard.html")
    return render_template(set_template(template_prefix, "dashboard"), title_="Dashboard")


@bp_app.route("/account")
@login_check
def account():
    tables = None  # DB.get_tables(current_user.get_id())
    # return render_template("authentication/account.html", tables=tables)
    return render_template(set_template(template_prefix, "account"), tables=tables)

