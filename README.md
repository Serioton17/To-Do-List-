# 📝 TaskMaster — Python Full-Stack To-Do Application

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.3+-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

A modern, responsive task management application built with a **Python (Flask)** backend and a **glassmorphism web dashboard**. 

Originally evolved from a classic terminal CLI script into a full-featured web app with persistent JSON storage, live search, categories, priorities, due dates, and dark/light themes.

---

## ✨ Features

- **🎨 Modern Glassmorphic UI**: Beautiful translucent card design with smooth micro-interactions and transitions.
- **🌓 Dark & Light Mode**: Seamless theme toggle with persistent storage of your preference.
- **⚡ Dual Mode Engine**:
  - **Full-Stack Mode**: Connects to the Python Flask REST API with server-side JSON persistence (`tasks.json`).
  - **Standalone Mode / GitHub Pages**: Automatically falls back to browser `localStorage` if run statically or hosted directly on GitHub Pages!
- **📊 Real-time Analytics**:
  - Live task counters (Total, Active, Completed).
  - Dynamic completion progress bar with percentage indicator.
- **🏷️ Smart Task Management**:
  - **Priority Levels**: High (🔴), Medium (🟡), and Low (🟢) with color-coded badges.
  - **Categories**: General, Work, Personal, Study, Health.
  - **Due Dates**: Smart indicators for "Due Today", "Due Tomorrow", or "Overdue".
- **🔍 Fast Search & Filtering**:
  - Live search as you type.
  - Status tabs: **All**, **Active**, and **Completed**.
  - Sorting: By Newest, Oldest, Priority, or Due Date.
- **✏️ Inline Quick Editing**: Double-click or click the edit icon to rename tasks on the fly (`Enter` to save, `Esc` to cancel).
- **💾 Data Export**: One-click download of all your tasks as a formatted `.json` backup file.
- **📟 CLI Version Included**: The original Python command-line interface (`TO-DO List.py`) is preserved alongside the web application.

---

## 📂 Project Structure

```text
TODO/
│
├── app.py                  # Flask backend with RESTful API endpoints & JSON persistence
├── TO-DO List.py           # Original Python CLI version
├── index.html              # Standalone web app (compatible with GitHub Pages)
├── requirements.txt        # Python dependencies
├── README.md               # Project documentation & GitHub showcase
├── LICENSE                 # MIT License
├── .gitignore              # Files to ignore in Git
├── tasks.json              # Persistent task store (auto-generated)
│
├── static/
│   ├── css/
│   │   └── style.css       # Responsive CSS with themes, glassmorphism & animations
│   └── js/
│       └── app.js          # Client logic, dual-mode API/localStorage adapter, UI events
│
└── templates/
    └── index.html          # Flask template for the web dashboard
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.8 or higher installed on your system.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/todo-list-python.git
cd todo-list-python
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the Web Application
```bash
python app.py
```
Open your browser and navigate to:
```
http://127.0.0.1:5000
```

### 4. Or Run the CLI Version
If you prefer running the original terminal-based version:
```bash
python "TO-DO List.py"
```

---

## 🔌 REST API Reference

When running the Flask server, the application provides the following endpoints:

| Method | Endpoint | Description | Payload Example |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | Get all tasks (supports `?status=active\|completed` and `?q=query`) | None |
| `POST` | `/api/tasks` | Create a new task | `{"title": "Read a book", "priority": "high", "category": "Personal"}` |
| `PUT` | `/api/tasks/<id>` | Update a task's status, title, priority, or due date | `{"completed": true}` or `{"title": "Updated title"}` |
| `DELETE` | `/api/tasks/<id>` | Delete a specific task | None |
| `DELETE` | `/api/tasks/completed` | Clear all completed tasks | None |
| `GET` | `/api/stats` | Get overview statistics (total, completed, active, rate) | None |

---

## 🌐 Deploying to GitHub Pages (Live Demo)

Because this project includes a dual-mode adapter in `static/js/app.js` and a root `index.html`, you can host a **100% interactive live demo** directly on GitHub Pages without needing a server!

1. Push your repository to GitHub (see instructions below).
2. Go to your repository **Settings** → **Pages**.
3. Under **Branch**, select `main` (or `master`) and folder `/ (root)`.
4. Click **Save**.
5. Within 1–2 minutes, GitHub will give you a live link (e.g. `https://your-username.github.io/todo-list-python/`) that anyone can try directly from your portfolio!

---

## 📤 How to Upload to Your GitHub Profile

Run these commands in your project folder:

```bash
# Initialize git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "feat: modern full-stack to-do application with Python backend and glassmorphic UI"

# Rename branch to main
git branch -M main

# Link to your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/<YOUR-GITHUB-USERNAME>/<YOUR-REPO-NAME>.git

# Push your code
git push -u origin main
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free to use, modify, and distribute.

