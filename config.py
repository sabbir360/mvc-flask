DEBUG = True
MOCK_TEST = True

APP_NAME = ".::YourAppNameWillGoesHere::."

DB_CONFIG = dict(username="root", password="root", host="127.0.0.1", port="3306", db="hms")

DEFAULT_CONTROLLER = "mod_dashboard"
DEFAULT_PAGE_AFTER_LOGIN = DEFAULT_CONTROLLER + ".dashboard"
