from application import application
from application.mod_authentication.controllers import bp_app as auth_mod
from application.mod_dashboard.controllers import bp_app as dashboard_mod

# application.register_blueprint(mod_authentication, url_prefix="/")
application.register_blueprint(auth_mod)
application.register_blueprint(dashboard_mod, url_prefix="/dashboard")

application.run(port=8000, host="0.0.0.0", debug=True)
