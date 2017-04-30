from flask import request


class SGridHelper:
    item_per_page = 0
    model = None
    sort_type = ""
    default_sort_field = ""
    response_format = {}

    row_skeleton = []

    total_rows = 0
    page_no = 1

    def __init__(self, model, default_sort_field, item_per_page=10, sort_type="desc"):

        self.item_per_page = item_per_page
        self.model = model
        self.default_sort_field = default_sort_field
        self.sort_type = sort_type
        # self.row_skeleton = row_skeleton

    def sortable_check(self, field):
        if request.args.get("sort_field", self.default_sort_field) == field:
            return request.args.get("sort_type", self.sort_type)
        return self.default_sort_field

    def head_generator(self, field_name, sortable=True,
                       field_type="text", title=None, visible=True, option=None):
        """
        :param field_name: string
        :param sortable: boolean
        :param field_type: string
        :param title: string
        :param visible: boolean
        :param option: {key, value}
        :return: dict {"title": title, "sortable": sortable, "name": field_name,
                "asc": self.sortable_check("full_name")}
        """
        if title is None:
            title = field_name.replace("_", " ").title()

        return {"title": title, "sortable": sortable, "name": field_name,
                "field_type": field_type, "option": option, "visible": visible,
                "asc": self.sortable_check(field_name)}

    # @staticmethod
    def response_format_generator(self, field_list):
        table_header = []
        for field in field_list:
            table_header.append(field)
        table_header.append(self.head_generator("Action", sortable=False))
        resp = {"paginate": {
            "page_size": "0", "page_index": "1", "item_per_page": self.item_per_page
        }, "table_header": table_header, "value": []}
        params = {}
        for param in request.args:
            params[param] = request.args.get(param)

        resp["meta"] = {"url": request.path, "params": params,
                        "sort_field": request.args.get("sort_field", self.default_sort_field)}

        self.response_format = resp
        # return resp

    def query_builder(self, return_count=False):



        if return_count:
            return self.model.select().count()

        sort_field = request.args.get("sort_field", self.default_sort_field)
        sort_value = request.args.get("sort_type", self.sort_type)

        if sort_field and sort_value and getattr(self.model, sort_field) \
                and (sort_value == "asc" or sort_value == "desc"):
            return self.model.select().order_by(
                eval("self.model." + sort_field + "." + sort_value + "()"))
        else:
            return self.model.select()
        return None

    def paginated_query(self):
        """
        
        :param row_skeleton: list[]
        :param filters: orm object
        :param page_no: 
        :param item_per_page: 
        :return: 
        """

        self.response_format_generator(self.row_skeleton)
        self.page_no = request.args.get("page_index", 1)

        if self.page_no == 1:
            total_count = self.query_builder(return_count=True)
            self.total_rows = total_count
            self.response_format["meta"]["params"]["page_size"] = self.total_rows
            self.response_format["meta"]["params"]["page_index"] = self.page_no
            self.response_format["meta"]["params"]["item_per_page"] = self.item_per_page

        else:
            self.total_rows = self.response_format["meta"]["params"]["page_size"]
            self.response_format["meta"]["params"]["page_index"] = self.page_no
            self.item_per_page = self.response_format["meta"]["params"]["item_per_page"]

        self.response_format["meta"]["params"]["sort_field"] = request.args.get("sort_field",
                                                                                self.default_sort_field)
        self.response_format["meta"]["params"]["sort_type"] = request.args.get("sort_type", self.sort_type)

        query = self.query_builder().paginate(int(self.page_no), int(self.item_per_page))

        self.response_format["paginate"]["page_size"] = self.total_rows
        self.response_format["paginate"]["page_index"] = self.page_no

        row_list = []

        for item in query:
            row_keys = []
            for key in self.row_skeleton:
                row_keys.append(
                    {
                        "name": key["name"],
                        "type": key["field_type"],
                        "value": eval("item." + key["name"]),
                        "visible": key["visible"]
                    }
                )
            row_list.append(row_keys)
        self.response_format["value"] = row_list

        return self.response_format

    def grid_initializer(self):
        pass
