/**
 * TaskMaster Frontend Application Logic
 * Supports dual-mode:
 *  1. Flask REST API (when running with python app.py)
 *  2. LocalStorage Fallback (for zero-setup GitHub Pages live demos)
 */

document.addEventListener('DOMContentLoaded', () => {
    // State
    let tasks = [];
    let currentFilter = 'all';
    let searchQuery = '';
    let currentSort = 'newest';
    let isServerMode = false;

    // DOM Elements
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const prioritySelect = document.getElementById('prioritySelect');
    const categorySelect = document.getElementById('categorySelect');
    const dueDateInput = document.getElementById('dueDateInput');
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const filterTabs = document.querySelectorAll('.filter-tab');
    const sortSelect = document.getElementById('sortSelect');
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const connectionStatus = document.getElementById('connectionStatus');
    const connectionText = document.getElementById('connectionText');
    const exportTasksBtn = document.getElementById('exportTasksBtn');

    // Stats Elements
    const statTotal = document.getElementById('statTotal');
    const statActive = document.getElementById('statActive');
    const statCompleted = document.getElementById('statCompleted');
    const progressPercentage = document.getElementById('progressPercentage');
    const progressBarFill = document.getElementById('progressBarFill');

    // --- Theme Management ---
    const savedTheme = localStorage.getItem('taskmaster_theme') || 
        (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    setTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const activeTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
    });

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('taskmaster_theme', theme);
        if (theme === 'light') {
            themeIcon.className = 'fa-solid fa-sun';
            themeIcon.style.color = '#f59e0b';
        } else {
            themeIcon.className = 'fa-solid fa-moon';
            themeIcon.style.color = '';
        }
    }

    // --- API & Storage Layer ---
    async function checkServerConnection() {
        try {
            const res = await fetch('/api/tasks?limit=1', { signal: AbortSignal.timeout(2000) });
            if (res.ok) {
                isServerMode = true;
                connectionStatus.className = 'status-badge connected';
                connectionText.textContent = 'Server Connected (Flask)';
                return true;
            }
        } catch (e) {
            // Server not reachable -> use localStorage mode
        }

        isServerMode = false;
        connectionStatus.className = 'status-badge offline';
        connectionText.textContent = 'Local Storage Mode';
        return false;
    }

    async function loadTasks() {
        if (isServerMode) {
            try {
                const res = await fetch('/api/tasks');
                const data = await res.json();
                if (data.success) {
                    tasks = data.tasks;
                    render();
                    return;
                }
            } catch (err) {
                console.warn('Failed to load from server, falling back to localStorage');
            }
        }

        // Local Storage Fallback
        const local = localStorage.getItem('taskmaster_tasks');
        if (local) {
            try {
                tasks = jsonParseTasks(local);
            } catch (e) {
                tasks = getDefaultSampleTasks();
            }
        } else {
            tasks = getDefaultSampleTasks();
            saveLocalTasks();
        }
        render();
    }

    function getDefaultSampleTasks() {
        return [
            {
                id: 'sample-1',
                title: 'Welcome to your new To-Do App! 👋',
                completed: false,
                priority: 'high',
                category: 'General',
                due_date: new Date().toISOString().split('T')[0],
                created_at: new Date().toISOString()
            },
            {
                id: 'sample-2',
                title: 'Star & showcase this repository on GitHub ⭐',
                completed: false,
                priority: 'medium',
                category: 'Work',
                due_date: '',
                created_at: new Date().toISOString()
            },
            {
                id: 'sample-3',
                title: 'Try checking off this task',
                completed: true,
                priority: 'low',
                category: 'Personal',
                due_date: '',
                created_at: new Date().toISOString()
            }
        ];
    }

    function jsonParseTasks(str) {
        return JSON.parse(str);
    }

    function saveLocalTasks() {
        localStorage.setItem('taskmaster_tasks', JSON.stringify(tasks));
    }

    // --- Task Actions ---
    async function addTask(title, priority, category, dueDate) {
        const newTask = {
            id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            title: title.trim(),
            completed: false,
            priority: priority,
            category: category,
            due_date: dueDate,
            created_at: new Date().toISOString()
        };

        if (isServerMode) {
            try {
                const res = await fetch('/api/tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newTask)
                });
                const data = await res.json();
                if (data.success) {
                    tasks.unshift(data.task);
                    render();
                    showToast('Task added successfully!', 'success');
                    return;
                }
            } catch (err) {
                console.warn('API add failed, storing locally');
            }
        }

        tasks.unshift(newTask);
        saveLocalTasks();
        render();
        showToast('Task added successfully!', 'success');
    }

    async function toggleTask(id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const nextStatus = !task.completed;

        if (isServerMode) {
            try {
                await fetch(`/api/tasks/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ completed: nextStatus })
                });
            } catch (err) {
                console.warn('API update failed, updating locally');
            }
        }

        task.completed = nextStatus;
        if (!isServerMode) saveLocalTasks();
        render();
        showToast(nextStatus ? 'Task completed! 🎉' : 'Task marked active', 'info');
    }

    async function updateTaskTitle(id, newTitle) {
        const task = tasks.find(t => t.id === id);
        if (!task || !newTitle.trim()) return;

        if (isServerMode) {
            try {
                await fetch(`/api/tasks/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: newTitle.trim() })
                });
            } catch (err) {
                console.warn('API update failed');
            }
        }

        task.title = newTitle.trim();
        if (!isServerMode) saveLocalTasks();
        render();
        showToast('Task updated', 'success');
    }

    async function deleteTask(id) {
        if (isServerMode) {
            try {
                await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
            } catch (err) {
                console.warn('API delete failed');
            }
        }

        tasks = tasks.filter(t => t.id !== id);
        if (!isServerMode) saveLocalTasks();
        render();
        showToast('Task removed', 'danger');
    }

    async function clearCompleted() {
        const completedCount = tasks.filter(t => t.completed).length;
        if (completedCount === 0) return;

        if (isServerMode) {
            try {
                await fetch('/api/tasks/completed', { method: 'DELETE' });
            } catch (err) {
                console.warn('API clear failed');
            }
        }

        tasks = tasks.filter(t => !t.completed);
        if (!isServerMode) saveLocalTasks();
        render();
        showToast(`Cleared ${completedCount} completed task(s)`, 'info');
    }

    // --- Sorting and Filtering ---
    function getProcessedTasks() {
        let result = [...tasks];

        // Status Filter
        if (currentFilter === 'active') {
            result = result.filter(t => !t.completed);
        } else if (currentFilter === 'completed') {
            result = result.filter(t => t.completed);
        }

        // Search Filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(t => 
                t.title.toLowerCase().includes(q) ||
                (t.category && t.category.toLowerCase().includes(q))
            );
        }

        // Sort
        result.sort((a, b) => {
            if (currentSort === 'newest') {
                return new Date(b.created_at || 0) - new Date(a.created_at || 0);
            } else if (currentSort === 'oldest') {
                return new Date(a.created_at || 0) - new Date(b.created_at || 0);
            } else if (currentSort === 'priority') {
                const priorityWeight = { high: 3, medium: 2, low: 1 };
                return (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2);
            } else if (currentSort === 'dueDate') {
                if (!a.due_date) return 1;
                if (!b.due_date) return -1;
                return new Date(a.due_date) - new Date(b.due_date);
            }
            return 0;
        });

        return result;
    }

    // --- Date Formatting Helper ---
    function formatDueDate(dateStr) {
        if (!dateStr) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const target = new Date(dateStr);
        target.setHours(0, 0, 0, 0);

        const diffTime = target - today;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { text: `Overdue (${Math.abs(diffDays)}d ago)`, class: 'overdue' };
        } else if (diffDays === 0) {
            return { text: 'Due Today', class: 'today' };
        } else if (diffDays === 1) {
            return { text: 'Due Tomorrow', class: '' };
        } else {
            return { text: target.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), class: '' };
        }
    }

    // --- Rendering ---
    function render() {
        updateStats();

        const filtered = getProcessedTasks();
        taskList.innerHTML = '';

        if (filtered.length === 0) {
            emptyState.style.display = 'block';
            if (searchQuery) {
                document.getElementById('emptyTitle').textContent = 'No matching tasks';
                document.getElementById('emptySubtitle').textContent = `No tasks match your search "${searchQuery}".`;
            } else if (currentFilter === 'active') {
                document.getElementById('emptyTitle').textContent = 'No active tasks';
                document.getElementById('emptySubtitle').textContent = 'All tasks are completed! Great job.';
            } else if (currentFilter === 'completed') {
                document.getElementById('emptyTitle').textContent = 'No completed tasks';
                document.getElementById('emptySubtitle').textContent = 'Check off tasks to see them completed here.';
            } else {
                document.getElementById('emptyTitle').textContent = 'Your To-Do list is empty';
                document.getElementById('emptySubtitle').textContent = 'Add a task above to start organizing your day.';
            }
        } else {
            emptyState.style.display = 'none';
            filtered.forEach(task => {
                taskList.appendChild(createTaskElement(task));
            });
        }
    }

    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.setAttribute('data-id', task.id);

        const dueInfo = formatDueDate(task.due_date);

        li.innerHTML = `
            <div class="task-left">
                <div class="task-checkbox-wrap">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task as complete">
                </div>
                <div class="task-content">
                    <span class="task-title">${escapeHTML(task.title)}</span>
                    <div class="task-meta">
                        <span class="badge badge-priority-${task.priority || 'medium'}">
                            <i class="fa-solid fa-flag"></i> ${capitalize(task.priority || 'medium')}
                        </span>
                        <span class="badge badge-category">
                            ${escapeHTML(task.category || 'General')}
                        </span>
                        ${dueInfo ? `
                            <span class="badge-due ${dueInfo.class}">
                                <i class="fa-regular fa-clock"></i> ${dueInfo.text}
                            </span>
                        ` : ''}
                    </div>
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn edit-btn" title="Edit task title">
                    <i class="fa-regular fa-pen-to-square"></i>
                </button>
                <button class="action-btn delete-btn" title="Delete task">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </div>
        `;

        // Checkbox event
        const checkbox = li.querySelector('.task-checkbox');
        checkbox.addEventListener('change', () => toggleTask(task.id));

        // Delete event
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        // Inline edit
        const editBtn = li.querySelector('.edit-btn');
        const titleEl = li.querySelector('.task-title');
        
        function startEditing() {
            if (li.classList.contains('editing')) return;
            li.classList.add('editing');

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'inline-edit-input';
            input.value = task.title;

            titleEl.replaceWith(input);
            input.focus();
            input.select();

            function finishEdit() {
                const val = input.value.trim();
                if (val && val !== task.title) {
                    updateTaskTitle(task.id, val);
                } else {
                    render();
                }
            }

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') finishEdit();
                if (e.key === 'Escape') render();
            });

            input.addEventListener('blur', finishEdit);
        }

        editBtn.addEventListener('click', startEditing);
        titleEl.addEventListener('dblclick', startEditing);

        return li;
    }

    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const active = total - completed;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

        statTotal.textContent = total;
        statActive.textContent = active;
        statCompleted.textContent = completed;
        progressPercentage.textContent = `${rate}%`;
        progressBarFill.style.width = `${rate}%`;

        clearCompletedBtn.disabled = completed === 0;
        clearCompletedBtn.style.opacity = completed === 0 ? '0.5' : '1';
    }

    // --- Event Listeners ---
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = taskInput.value.trim();
        if (!title) return;

        const priority = prioritySelect.value;
        const category = categorySelect.value;
        const dueDate = dueDateInput.value;

        addTask(title, priority, category, dueDate);

        taskInput.value = '';
        taskInput.focus();
    });

    // Filter Tabs
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.getAttribute('data-filter');
            render();
        });
    });

    // Search Input
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
        render();
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        clearSearchBtn.style.display = 'none';
        searchInput.focus();
        render();
    });

    // Sort Select
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        render();
    });

    // Clear Completed Button
    clearCompletedBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete all completed tasks?')) {
            clearCompleted();
        }
    });

    // Export Tasks as JSON
    exportTasksBtn.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `tasks_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast('Tasks exported to JSON', 'info');
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // Focus search on '/'
        if (e.key === '/' && document.activeElement !== taskInput && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
        }
    });

    // --- Toast Notifications ---
    function showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const iconClass = type === 'success' 
            ? 'fa-circle-check' 
            : type === 'danger' 
            ? 'fa-circle-exclamation' 
            : 'fa-circle-info';

        toast.innerHTML = `
            <i class="fa-solid ${iconClass}"></i>
            <span>${escapeHTML(message)}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px) scale(0.95)';
            setTimeout(() => toast.remove(), 300);
        }, 2800);
    }

    // --- Utilities ---
    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // --- Init ---
    checkServerConnection().then(() => {
        loadTasks();
    });
});

