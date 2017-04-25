from peewee import Model, MySQLDatabase
from config import DB_CONFIG

DB = MySQLDatabase(DB_CONFIG['db'], user=DB_CONFIG['username'], password=DB_CONFIG['password'])


class BaseModel(Model):
    """
    Base Model using peewee
    """

    class Meta:
        database = DB

    @staticmethod
    def sortable_check(request_field, field, default_val):
        if request_field.args.get("sort_field") == field:
            return request_field.args.get("sort_type")
        return default_val

    @staticmethod
    def query_builder_for_grid(cls, filters, sort_field, sort_value):
        # import pdb; pdb.set_trace()
        if getattr(cls, sort_field) and (sort_value == "asc" or sort_value == "desc"):
            return cls.select().order_by(eval("cls." + sort_field + "." + sort_value + "()"))
        return None
