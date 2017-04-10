# Import flask dependencies
from flask import Blueprint, render_template, redirect, url_for, request, Response, flash

from application import DB
# Import module forms
from application.mod_authentication.forms import RegistrationForm, LoginForm

# Import module models (i.e. User)
from helpers.loginhelper import LoginHelper, login_check
from helpers.generic import set_template, set_message
from config import DEFAULT_PAGE_AFTER_LOGIN

# Define the blueprint: 'auth', set its url prefix: app.url/auth
bp_app = Blueprint('mod_authentication', __name__)
template_prefix = "authentication"


@bp_app.route("/")
def home():
    if LoginHelper.is_authenticated():
        return redirect(url_for(DEFAULT_PAGE_AFTER_LOGIN))
    registration_form = RegistrationForm()
    set_message("hello", "warning")
    return render_template(set_template(template_prefix, "home"), rf=registration_form)


'''@bp_app.route("/account")
@login_required
def account():
    return "You're logged in. <a href=\""+url_for("logout")+"\">Logout</a>"'''


@bp_app.route("/login", methods=["GET", "POST"])
def login():
    login_form = LoginForm(request.form)

    if request.method == "POST" and login_form.validate():
        login_helper = LoginHelper(login_form.email.data, login_form.password.data)
        if login_helper.is_authenticated():
            if request.args.get('next'):
                return redirect(request.args.get('next'))
            return redirect(url_for(DEFAULT_PAGE_AFTER_LOGIN))

    # return render_template("authentication/login.html", frm=login_form)
    return render_template(set_template(template_prefix, "login"), frm=login_form)


@bp_app.route("/register", methods=["POST"])
def register():
    form = RegistrationForm(request.form)
    if form.validate():
        if DB.get_user(form.email.data):
            form.email.errors.append("Email address already registered")
            # return render_template('authentication/home.html', rf=form)

    return render_template(set_template(template_prefix, "home"), rf=form)


@bp_app.route("/logout")
def logout():
    # logout_user()
    LoginHelper.logout()
    return redirect(url_for("mod_authentication.home"))


@bp_app.route("/account/createtable", methods=["POST"])
@login_check
def account_createtable():
    tablename = request.form.get("tablenumber")
    tableid = DB.add_table(tablename, current_user.get_id())
    new_url = "/newrequest/" + tableid
    DB.update_table(tableid, new_url)
    return redirect(url_for('account'))


@bp_app.route("/account/deletetable", methods=["GET", "POST"])
@login_check
def account_deletetable():
    tableid = request.args.get("tableid")
    DB.delete_table(tableid)
    return redirect(url_for('account'))


@bp_app.route("/newrequest/<tid>")
@login_check
def newrequest(tid):
    return Response("This is end of :: "+tid)
