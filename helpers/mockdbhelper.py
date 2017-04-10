MOCK_USERS = [
     {"email": 'test@test.com', "password": 'test'}
]
MOCK_TABLES = [{"_id": "1", "number": "1",
                "owner": "test@test.com", "url": "/newrequest"}]


class MockDBHelper:

    def get_user(self, email):
        user = [x for x in MOCK_USERS if x.get("email") == email]
        if user:
            return user[0]
        # if email in MOCK_USERS:
        #     return MOCK_USERS[email]
        return None

    def add_user(self, email, password):
        MOCK_USERS.append(dict(email=email, password=password))

    def add_table(self, number, owner):
        MOCK_TABLES.append({"_id": number, "number": number, "owner": owner})
        return number

    def update_table(self, _id, url):
        for table in MOCK_TABLES:
            if table.get("_id") == _id:
                table["url"] = url
                break

    def get_tables(self, owner_id):
        return MOCK_TABLES

    def delete_table(self, table_id):
        for i, table in enumerate(MOCK_TABLES):
            if table.get("_id") == table_id:
                del MOCK_TABLES[i]
                break
