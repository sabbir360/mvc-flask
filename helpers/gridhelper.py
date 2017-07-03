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

    def filter_builder(self):
        # if custom: return custom
        model = self.model.select()
        request_arg = request.args
        query_cond = []
        for search_key in self.response_format["table_header"]:
            search_value = search_key["name"] + "[val]"
            search_op = search_key["name"] + "[op]"
            if search_value in request_arg and request_arg.get(search_key["name"] + "[val]"):
                opr = request_arg.get(search_op)
                val = request_arg.get(search_key["name"] + "[val]")
                if request_arg.get(search_op) == "not-like":
                    query_cond.append("~(self.model." + search_key["name"] + ".contains('" + val + "'))")
                    # pass

                elif request_arg.get(search_op) == "like":
                    query_cond.append("self.model." + search_key["name"] + ".contains('" + val + "')")

                else:
                    try:
                        if int(val) * 1 < 0 or int(val) * 1 > 0:
                            query_cond.append("self.model." + search_key["name"] + opr + val)
                        else:
                            query_cond.append("self.model." + search_key["name"] + opr + "'" + val + "'")
                    except:
                        query_cond.append("self.model." + search_key["name"] + opr + "'" + val + "'")

        build_filter = ", ".join(query_cond)
        if build_filter:
            # import pdb; pdb.set_trace()
            return eval("model.where(" + build_filter + ")")
        return model

    def query_builder(self, return_count=False, custom=None):
        if custom is None:
            model = self.filter_builder()
        if return_count:
            return model.count()

        sort_field = request.args.get("sort_field", self.default_sort_field)
        sort_value = request.args.get("sort_type", self.sort_type)

        if sort_field and sort_value and getattr(self.model, sort_field) \
                and (sort_value == "asc" or sort_value == "desc"):
            return model.order_by(
                eval("self.model." + sort_field + "." + sort_value + "()"))
        else:
            return model
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
            self.total_rows = self.query_builder(return_count=True)  # self.response_format["meta"]["params"]["page_size"]
            self.response_format["meta"]["params"]["page_index"] = self.page_no
            self.item_per_page = self.response_format["meta"]["params"]["item_per_page"]

        self.response_format["meta"]["params"]["sort_field"] = request.args.get("sort_field",
                                                                                self.default_sort_field)
        self.response_format["meta"]["params"]["sort_type"] = request.args.get("sort_type", self.sort_type)

        query = self.query_builder().paginate(int(self.page_no), int(self.item_per_page))

        self.response_format["paginate"]["page_size"] = self.total_rows
        self.response_format["paginate"]["page_index"] = self.page_no

        row_list = []
        # row_keys = []

        for item in query:
            row_keys = []
            row_id = 0
            for key in self.row_skeleton:
                if key['name'] == "id":
                    row_id = item.id  # eval("item." + key["name"])
                row_keys.append(
                    {
                        "name": key["name"],
                        "type": key["field_type"],
                        "value": eval("item." + key["name"]),
                        "visible": key["visible"]
                    }
                )
            row_keys.append({
                "name": "Action",
                "type": "Action",
                "value": row_id,
                "visible": "Action"
            })

            row_list.append(row_keys)

        self.response_format["value"] = row_list

        return self.response_format

    def grid_initializer(self):
        pass
