from json import dumps
from flask import Blueprint, render_template, abort, jsonify, request
from helpers.generic import set_template
from helpers.loginhelper import login_check, LoginHelper
from helpers.gridhelper import SGridHelper

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
    User.item_per_page = 15
    user_roles = User.user_role_choices()
    for role in user_roles:
        role_data.append({"Key": user_roles[role], "Value": user_roles[role]})
    # return render_template("authentication/account.html", tables=tables)

    if request.args.get("json"):
        grid_helper = SGridHelper(User, "role")
        grid_helper.row_skeleton = [
            grid_helper.head_generator("id", visible=False),
            grid_helper.head_generator("full_name"),
            grid_helper.head_generator("email"),
            grid_helper.head_generator("role", title="User Role",
                                       field_type="option", option=role_data),
        ]
        # query_obj = grid_helper.paginated_query()
        #
        # jax_data = grid_helper.response_format
        # jax_data['value'] = query_obj

        return jsonify(grid_helper.paginated_query())
    return render_template(set_template(template_prefix, "manage-user"), role_data=dumps(role_data, ensure_ascii=False))
