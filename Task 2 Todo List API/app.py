from flask import Flask, request
from datetime import datetime, timezone

app = Flask(__name__)

todos = []
next_id = 1


@app.route("/")
def home():
    return {"message": "Todo API is running"}


@app.route("/todos", methods=["GET"])
def get_todos():
    return todos


@app.route("/todos", methods=["POST"])
def create_todo():
    global next_id

    data = request.get_json()

    if not data:
        return {"error": "Request body is required"}, 400

    title = data.get("title")

    if not title or not title.strip():
        return {"error": "Title is required"}, 400

    description = data.get("description", "")

    if not isinstance(description, str):
        return {"error": "Description must be a string"}, 400

    todo = {
        "id": str(next_id),
        "title": title.strip(),
        "description": description,
        "completed": False,
        "createdAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    }

    todos.append(todo)
    next_id += 1

    return todo, 201


@app.route("/todos/<todo_id>", methods=["GET"])
def get_todo(todo_id):
    for todo in todos:
        if todo["id"] == todo_id:
            return todo

    return {"error": "Todo not found"}, 404


@app.route("/todos/<todo_id>", methods=["PUT"])
def update_todo(todo_id):
    data = request.get_json()

    if not data:
        return {"error": "Request body is required"}, 400

    for todo in todos:
        if todo["id"] == todo_id:

            if "title" in data:
                title = data["title"]

                if not isinstance(title, str) or not title.strip():
                    return {"error": "Title must be a non-empty string"}, 400

                todo["title"] = title.strip()

            if "description" in data:
                if not isinstance(data["description"], str):
                    return {"error": "Description must be a string"}, 400

                todo["description"] = data["description"]

            if "completed" in data:
                if not isinstance(data["completed"], bool):
                    return {"error": "Completed must be a boolean"}, 400

                todo["completed"] = data["completed"]

            return todo

    return {"error": "Todo not found"}, 404


@app.route("/todos/<todo_id>", methods=["DELETE"])
def delete_todo(todo_id):
    for todo in todos:
        if todo["id"] == todo_id:
            todos.remove(todo)
            return {"message": "Todo deleted successfully"}

    return {"error": "Todo not found"}, 404


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=3000, debug=False)