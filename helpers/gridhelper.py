from flask import request


class SGridHelper:

    item_per_page = 0
    model = None
    sort_type = ""
    default_sort_field = ""

    def __init__(self, model, default_sort_field, item_per_page=10, sort_type="desc"):

        self.item_per_page = item_per_page
        self.model = model
        self.default_sort_field = default_sort_field
        self.sort_type = sort_type

    def sortable_check(self, field):

        if request.args.get("sort_field", self.default_sort_field) == field:
            # import pdb; pdb.set_trace()
            return request.args.get("sort_type", self.sort_type)
        return "asc"

    def head_generator(self, field_name, sortable=True, title=None):
        """

        :param field_name: 
        :param sortable: 
        :param title: 
        :return: dict {"title": title, "sortable": sortable, "name": field_name,
                "asc": BaseModel.sortable_check("full_name")}
        """
        if title is None:
            title = field_name.replace("_", " ").title()

        return {"title": title, "sortable": sortable, "name": field_name,
                "asc": self.sortable_check(field_name)}

    # @staticmethod
    def response_format_generator(self, field_list):
        table_header = []
        for field in field_list:
            table_header.append(field)
        table_header.append(self.head_generator("Action", sortable=False))
        resp = {"page_size": "0", "page_index": "1", "item_per_page": self.item_per_page,
                "table_header": table_header, "value": []}

        if request.args.get("sort_field"):
            resp["meta"] = {"url": request.path, "params": request.args,
             "sort_field": request.args.get("sort_field")}
        else:
            resp["meta"] = {"url": request.path, "params": request.args,
                            "sort_field": self.default_sort_field}
        return resp

    def query_builder(self, filters=None, return_count=False):
        # import pdb; pdb.set_trace()
        if return_count:
            # import pdb; pdb.set_trace()
            return self.model.select().count()

        sort_field = request.args.get("sort_field", None)
        sort_value = request.args.get("sort_type", None)

        if sort_field and sort_value and getattr(self.model, sort_field) \
                and (sort_value == "asc" or sort_value == "desc"):
            return self.model.select().order_by(
                eval("self.model." + sort_field + "." + sort_value + "()"))
        else:
            return self.model.select()
        return None

    def paginated_query(self, filters=None, page_no=1, item_per_page=10):
        """

        :param cls: Model
        :param page_no: Which page data req. default is 1
        :param filters: bunch of filters
        :param req: request (flask)
        :param item_per_page: default 10, total item per page.
        :return: list[total_count, query_object]
        """
        if page_no == 1:
            total_count = self.query_builder(filters=filters, return_count=True)
        else:
            total_count = 0
        query = self.query_builder(filters=filters).paginate(page_no, item_per_page)
        return [total_count, query]

    def grid_initializer(self):
        pass
