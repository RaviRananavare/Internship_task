import unittest
import app


class TodoAPITestCase(unittest.TestCase):

    def setUp(self):
        app.app.config["TESTING"] = True
        self.client = app.app.test_client()

        app.todos.clear()
        app.next_id = 1

    def test_get_todos(self):
        response = self.client.get("/todos")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), [])

    def test_create_todo(self):
        response = self.client.post(
            "/todos",
            json={
                "title": "Learn AI",
                "description": "Practice prompts"
            }
        )

        self.assertEqual(response.status_code, 201)

        todo = response.get_json()

        self.assertEqual(todo["id"], "1")
        self.assertEqual(todo["title"], "Learn AI")
        self.assertEqual(todo["description"], "Practice prompts")
        self.assertFalse(todo["completed"])
        self.assertIn("createdAt", todo)

    def test_get_todo_by_id(self):
        self.client.post(
            "/todos",
            json={
                "title": "Learn AI",
                "description": "Practice prompts"
            }
        )

        response = self.client.get("/todos/1")

        self.assertEqual(response.status_code, 200)

        todo = response.get_json()

        self.assertEqual(todo["id"], "1")
        self.assertEqual(todo["title"], "Learn AI")

    def test_get_todo_not_found(self):
        response = self.client.get("/todos/999")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(
            response.get_json(),
            {"error": "Todo not found"}
        )

    def test_update_todo(self):
        self.client.post(
            "/todos",
            json={
                "title": "Learn AI",
                "description": "Practice prompts"
            }
        )

        response = self.client.put(
            "/todos/1",
            json={
                "title": "Learn Machine Learning",
                "description": "Practice ML every day",
                "completed": True
            }
        )

        self.assertEqual(response.status_code, 200)

        todo = response.get_json()

        self.assertEqual(todo["id"], "1")
        self.assertEqual(todo["title"], "Learn Machine Learning")
        self.assertEqual(todo["description"], "Practice ML every day")
        self.assertTrue(todo["completed"])

    def test_delete_todo(self):
        self.client.post(
            "/todos",
            json={
                "title": "Learn AI",
                "description": "Practice prompts"
            }
        )

        response = self.client.delete("/todos/1")

        self.assertEqual(response.status_code, 200)

        self.assertEqual(
            response.get_json(),
            {"message": "Todo deleted successfully"}
        )

        response = self.client.get("/todos/1")

        self.assertEqual(response.status_code, 404)

    def test_create_todo_without_title(self):
        response = self.client.post(
            "/todos",
            json={
                "description": "Practice prompts"
            }
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json(),
            {"error": "Title is required"}
        )

    def test_create_todo_with_empty_title(self):
        response = self.client.post(
            "/todos",
            json={
                "title": "",
                "description": "Practice prompts"
            }
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json(),
            {"error": "Title is required"}
        )

    def test_create_todo_with_invalid_description(self):
        response = self.client.post(
            "/todos",
            json={
                "title": "Learn AI",
                "description": 123
            }
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json(),
            {"error": "Description must be a string"}
        )

    def test_update_todo_with_invalid_title(self):
        self.client.post(
            "/todos",
            json={
                "title": "Learn AI",
                "description": "Practice prompts"
            }
        )

        response = self.client.put(
            "/todos/1",
            json={
                "title": ""
            }
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json(),
            {"error": "Title must be a non-empty string"}
        )

    def test_update_todo_with_invalid_description(self):
        self.client.post(
            "/todos",
            json={
                "title": "Learn AI",
                "description": "Practice prompts"
            }
        )

        response = self.client.put(
            "/todos/1",
            json={
                "description": 123
            }
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json(),
            {"error": "Description must be a string"}
        )

    def test_update_todo_with_invalid_completed(self):
        self.client.post(
            "/todos",
            json={
                "title": "Learn AI",
                "description": "Practice prompts"
            }
        )

        response = self.client.put(
            "/todos/1",
            json={
                "completed": "yes"
            }
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json(),
            {"error": "Completed must be a boolean"}
        )

    def test_update_todo_not_found(self):
        response = self.client.put(
            "/todos/999",
            json={
                "title": "Does not exist"
            }
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(
            response.get_json(),
            {"error": "Todo not found"}
        )

    def test_delete_todo_not_found(self):
        response = self.client.delete("/todos/999")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(
            response.get_json(),
            {"error": "Todo not found"}
        )

    def tearDown(self):
        pass


if __name__ == "__main__":
    unittest.main()