"""
Flask Backend Application for Modern To-Do List
Provides REST API endpoints and serves the responsive web interface.
Supports local JSON persistence (tasks.json).
"""

import os
import json
import uuid
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_from_directory

app = Flask(__name__, static_folder='static', template_folder='templates')

DATA_FILE = os.path.join(os.path.dirname(__file__), 'tasks.json')


def load_tasks():
    """Load tasks from JSON file; initialize with sample tasks if missing."""
    if not os.path.exists(DATA_FILE):
        default_tasks = [
            {
                "id": str(uuid.uuid4()),
                "title": "Welcome to your new To-Do App! 👋",
                "completed": False,
                "priority": "high",
                "category": "General",
                "due_date": datetime.now().strftime("%Y-%m-%d"),
                "created_at": datetime.now().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Star & share this project on GitHub ⭐",
                "completed": False,
                "priority": "medium",
                "category": "Work",
                "due_date": "",
                "created_at": datetime.now().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Completed your first task tutorial",
                "completed": True,
                "priority": "low",
                "category": "Personal",
                "due_date": "",
                "created_at": datetime.now().isoformat()
            }
        ]
        save_tasks(default_tasks)
        return default_tasks

    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return []


def save_tasks(tasks):
    """Save tasks list to JSON file."""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(tasks, f, indent=2, ensure_ascii=False)


# --- Frontend Route ---
@app.route('/')
def index():
    return render_template('index.html')


# --- REST API Endpoints ---

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Return all tasks, optionally filtered by status or search keyword."""
    tasks = load_tasks()
    status_filter = request.args.get('status')  # 'all', 'active', 'completed'
    query = request.args.get('q', '').strip().lower()

    filtered = tasks
    if status_filter == 'active':
        filtered = [t for t in filtered if not t.get('completed', False)]
    elif status_filter == 'completed':
        filtered = [t for t in filtered if t.get('completed', False)]

    if query:
        filtered = [t for t in filtered if query in t.get('title', '').lower()]

    return jsonify({"success": True, "count": len(filtered), "tasks": filtered})


@app.route('/api/tasks', methods=['POST'])
def add_task():
    """Add a new task (equivalent to add(task) in the CLI)."""
    data = request.get_json(silent=True) or {}
    title = data.get('title', '').strip()

    if not title:
        return jsonify({"success": False, "error": "Task title cannot be empty."}), 400

    tasks = load_tasks()
    new_task = {
        "id": str(uuid.uuid4()),
        "title": title,
        "completed": bool(data.get('completed', False)),
        "priority": data.get('priority', 'medium').lower(),
        "category": data.get('category', 'General').strip() or 'General',
        "due_date": data.get('due_date', '').strip(),
        "created_at": datetime.now().isoformat()
    }

    # Add to beginning of list
    tasks.insert(0, new_task)
    save_tasks(tasks)

    return jsonify({"success": True, "task": new_task, "message": f"Task '{title}' added successfully."}), 201


@app.route('/api/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    """Update task details (title, completed status, priority, due_date)."""
    data = request.get_json(silent=True) or {}
    tasks = load_tasks()

    target_task = None
    for task in tasks:
        if task.get('id') == task_id:
            target_task = task
            break

    if not target_task:
        return jsonify({"success": False, "error": "Task not found."}), 404

    if 'title' in data:
        title = data['title'].strip()
        if not title:
            return jsonify({"success": False, "error": "Title cannot be empty."}), 400
        target_task['title'] = title

    if 'completed' in data:
        target_task['completed'] = bool(data['completed'])

    if 'priority' in data:
        target_task['priority'] = data['priority'].lower()

    if 'category' in data:
        target_task['category'] = data['category'].strip() or 'General'

    if 'due_date' in data:
        target_task['due_date'] = data['due_date'].strip()

    target_task['updated_at'] = datetime.now().isoformat()
    save_tasks(tasks)

    return jsonify({"success": True, "task": target_task, "message": "Task updated successfully."})


@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a specific task (equivalent to deleting(task) in the CLI)."""
    tasks = load_tasks()
    initial_length = len(tasks)
    tasks = [t for t in tasks if t.get('id') != task_id]

    if len(tasks) == initial_length:
        return jsonify({"success": False, "error": "Task not found."}), 404

    save_tasks(tasks)
    return jsonify({"success": True, "message": "Task removed successfully."})


@app.route('/api/tasks/completed', methods=['DELETE'])
def clear_completed():
    """Clear all completed tasks."""
    tasks = load_tasks()
    remaining = [t for t in tasks if not t.get('completed', False)]
    deleted_count = len(tasks) - len(remaining)
    save_tasks(remaining)
    return jsonify({"success": True, "deleted_count": deleted_count, "message": f"Cleared {deleted_count} completed task(s)."})


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Calculate and return task completion statistics."""
    tasks = load_tasks()
    total = len(tasks)
    completed = sum(1 for t in tasks if t.get('completed', False))
    active = total - completed
    rate = round((completed / total * 100), 1) if total > 0 else 0

    return jsonify({
        "success": True,
        "stats": {
            "total": total,
            "completed": completed,
            "active": active,
            "completion_rate": rate
        }
    })


if __name__ == '__main__':
    print("\n" + "="*50)
    print("  🚀 TO-DO LIST WEB APPLICATION RUNNING")
    print("  🌐 Open in your browser: http://127.0.0.1:5000")
    print("="*50 + "\n")
    app.run(debug=True, port=5000)

