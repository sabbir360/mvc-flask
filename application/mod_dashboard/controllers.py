from json import dumps
from flask import Blueprint, render_template, abort, jsonify, request
from helpers.generic import set_template
from helpers.loginhelper import login_check, LoginHelper

from application.mod_authentication.models import User

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


@bp_app.route("/manage-user", methods=["POST", "GET"])
@login_check
def manage_user():
    if LoginHelper.is_user():
        return abort(403)
    role_data = []
    user_roles = User.user_role_choices()
    for role in user_roles:
        role_data.append({"Key": user_roles[role], "Value": user_roles[role]})
    # return render_template("authentication/account.html", tables=tables)

    if request.args.get("json"):
        print(User.sortable_check(request, "full_name", "asc"))
        jax_data = {"pageSize": "25", "pageIndex": "0",
                    "meta": {"url": request.path, "params": request.args},
                    "table_header": [
                        {"title": "Name", "sortable": True, "name": "full_name",
                         "asc": User.sortable_check(request, "full_name", "asc")},
                        {"title": "Email", "name": "full_name", "sortable": False},
                        {"title": "User Role", "sortable": True, "name": "role",
                         "asc": User.sortable_check(request, "role", "asc")},
                        {"title": "Action", "name": "full_name", "sortable": False},
                    ], "value": []}

        row_list = []
        for user in User.query_builder_for_grid(User, None, request.args.get("sort_field", "full_name"),
                                                  request.args.get("sort_type", "asc")).limit(10):
            row_list.append([
                {"name": "full_name", "value": user.full_name, "type": "text"},
                {"name": "email", "value": user.email, "type": "text"},
                {"name": "role", "value": user.role, "type": "select", "item":
                    role_data
                 }
            ])
        jax_data['value'] = row_list;

        return jsonify(jax_data)
    return render_template(set_template(template_prefix, "manage-user"), role_data=dumps(role_data, ensure_ascii=False))


ajax_data = {
    "odata.metadata": "",
    "value": [
        {"Name": "Otto Clay", "Age": 25, "Country": 1, "Address": "Ap #897-1459 Quam Avenue",
         "Married": False},
        {"Name": "Connor Johnston", "Age": 45, "Country": 2, "Address": "Ap #370-4647 Dis Av.",
         "Married": True},
        {"Name": "Lacey Hess", "Age": 29, "Country": 3, "Address": "Ap #365-8835 Integer St.",
         "Married": False},
        {"Name": "Timothy Henson", "Age": 56, "Country": 1, "Address": "911-5143 Luctus Ave",
         "Married": True},
        {
            "Name": "Ramona Benton",
            "Age": 32,
            "Country": 3,
            "Address": "Ap #614-689 Vehicula Street",
            "Married": False
        }
    ],
}
