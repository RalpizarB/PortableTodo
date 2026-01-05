// ========================================
// PortableTodo - Main Application
// ========================================

class PortableTodo {
    constructor() {
        this.currentListId = 'all';
        this.currentSortMode = 'manual';
        this.draggedTask = null;
        this.draggedCalendarTask = null;
        this.currentTaskId = null;
        
        this.init();
    }

    // ========================================
    // Initialization
    // ========================================
    
    init() {
        this.loadData();
        this.initEventListeners();
        this.renderTaskLists();
        this.renderTasks();
        this.renderWeekCalendar();
        this.updateCurrentTaskDisplay();
        this.loadDarkMode();
    }

    loadData() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.taskLists = JSON.parse(localStorage.getItem('taskLists')) || [
            { id: 'all', name: 'All Tasks', isDefault: true }
        ];
        this.weekPlan = JSON.parse(localStorage.getItem('weekPlan')) || {};
        this.currentTaskId = localStorage.getItem('currentTaskId') || null;
        this.currentSortMode = localStorage.getItem('sortMode') || 'manual';
    }

    saveData() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        localStorage.setItem('taskLists', JSON.stringify(this.taskLists));
        localStorage.setItem('weekPlan', JSON.stringify(this.weekPlan));
        localStorage.setItem('currentTaskId', this.currentTaskId);
        localStorage.setItem('sortMode', this.currentSortMode);
    }

    // ========================================
    // Event Listeners
    // ========================================
    
    initEventListeners() {
        // Dark mode toggle
        document.getElementById('darkModeToggle').addEventListener('click', () => {
            this.toggleDarkMode();
        });

        // Add task button
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.openTaskModal();
        });

        // Save task button
        document.getElementById('saveTaskBtn').addEventListener('click', () => {
            this.saveTask();
        });

        // Add list button
        document.getElementById('addListBtn').addEventListener('click', () => {
            this.openListModal();
        });

        // Save list button
        document.getElementById('saveListBtn').addEventListener('click', () => {
            this.saveList();
        });

        // Sort select
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.currentSortMode = e.target.value;
            this.saveData();
            this.renderTasks();
        });

        // Set initial sort value
        document.getElementById('sortSelect').value = this.currentSortMode;

        // Modal close buttons
        document.querySelectorAll('.modal .btn-close, .modal [data-bs-dismiss="modal"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Close modal on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    // ========================================
    // Dark Mode
    // ========================================
    
    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        
        const icon = document.querySelector('#darkModeToggle i');
        icon.className = isDark ? 'bi bi-sun' : 'bi bi-moon-stars';
    }

    loadDarkMode() {
        const isDark = localStorage.getItem('darkMode') === 'true';
        if (isDark) {
            document.body.classList.add('dark-mode');
            document.querySelector('#darkModeToggle i').className = 'bi bi-sun';
        }
    }

    // ========================================
    // Task Lists Management
    // ========================================
    
    renderTaskLists() {
        const container = document.getElementById('taskLists');
        container.innerHTML = '';

        this.taskLists.forEach(list => {
            const listItem = document.createElement('div');
            listItem.className = `list-group-item d-flex justify-content-between align-items-center ${this.currentListId === list.id ? 'active' : ''}`;
            
            const taskCount = list.id === 'all' 
                ? this.tasks.length 
                : this.tasks.filter(t => t.listId === list.id).length;

            listItem.innerHTML = `
                <span>${list.name}</span>
                <div>
                    <span class="badge bg-secondary rounded-pill">${taskCount}</span>
                    ${!list.isDefault ? `<button class="btn btn-sm btn-link text-danger" onclick="app.deleteList('${list.id}')">
                        <i class="bi bi-trash"></i>
                    </button>` : ''}
                </div>
            `;

            listItem.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    this.currentListId = list.id;
                    this.renderTaskLists();
                    this.renderTasks();
                    document.getElementById('currentListName').textContent = list.name;
                }
            });

            container.appendChild(listItem);
        });
    }

    openListModal(list = null) {
        const modal = document.getElementById('listModal');
        const form = document.getElementById('listForm');
        
        if (list) {
            document.getElementById('listName').value = list.name;
            document.getElementById('listId').value = list.id;
        } else {
            form.reset();
            document.getElementById('listId').value = '';
        }
        
        modal.style.display = 'block';
        modal.classList.add('show');
    }

    saveList() {
        const name = document.getElementById('listName').value.trim();
        const id = document.getElementById('listId').value;

        if (!name) return;

        if (id) {
            const list = this.taskLists.find(l => l.id === id);
            if (list) list.name = name;
        } else {
            this.taskLists.push({
                id: 'list_' + Date.now(),
                name: name,
                isDefault: false
            });
        }

        this.saveData();
        this.renderTaskLists();
        
        this.closeModal('listModal');
    }

    deleteList(listId) {
        if (confirm('Are you sure you want to delete this list? Tasks will be moved to "All Tasks".')) {
            this.tasks.forEach(task => {
                if (task.listId === listId) {
                    task.listId = 'all';
                }
            });
            
            this.taskLists = this.taskLists.filter(l => l.id !== listId);
            
            if (this.currentListId === listId) {
                this.currentListId = 'all';
                document.getElementById('currentListName').textContent = 'All Tasks';
            }
            
            this.saveData();
            this.renderTaskLists();
            this.renderTasks();
        }
    }

    // ========================================
    // Tasks Management
    // ========================================
    
    getSortedTasks() {
        let tasks = this.currentListId === 'all' 
            ? [...this.tasks]
            : this.tasks.filter(t => t.listId === this.currentListId);

        switch(this.currentSortMode) {
            case 'name':
                return tasks.sort((a, b) => a.name.localeCompare(b.name));
            case 'nameDesc':
                return tasks.sort((a, b) => b.name.localeCompare(a.name));
            case 'created':
                return tasks.sort((a, b) => a.createdAt - b.createdAt);
            case 'createdDesc':
                return tasks.sort((a, b) => b.createdAt - a.createdAt);
            case 'manual':
            default:
                return tasks.sort((a, b) => (a.order || 0) - (b.order || 0));
        }
    }

    renderTasks() {
        const container = document.getElementById('taskContainer');
        const tasks = this.getSortedTasks();

        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <p>No tasks yet. Click "Add Task" to get started!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';

        tasks.forEach((task, index) => {
            const taskEl = this.createTaskElement(task, index);
            container.appendChild(taskEl);
        });
    }

    createTaskElement(task, index) {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskDiv.draggable = true;
        taskDiv.dataset.taskId = task.id;

        const completedSubtasks = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
        const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
        const progressPercent = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

        taskDiv.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div class="form-check flex-grow-1">
                    <input class="form-check-input" type="checkbox" ${task.completed ? 'checked' : ''} 
                           onchange="app.toggleTaskComplete('${task.id}')">
                    <label class="form-check-label task-title">${this.escapeHtml(task.name)}</label>
                </div>
                <span class="drag-handle ms-2">
                    <i class="bi bi-grip-vertical"></i>
                </span>
            </div>
            ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
            ${totalSubtasks > 0 ? `
                <div class="progress mt-2" style="height: 5px;">
                    <div class="progress-bar" role="progressbar" style="width: ${progressPercent}%" 
                         aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <small class="text-muted">${completedSubtasks}/${totalSubtasks} subtasks completed</small>
            ` : ''}
            <div class="subtask-list" id="subtasks-${task.id}">
                ${this.renderSubtasks(task)}
            </div>
            <div class="task-actions mt-2">
                <button class="btn btn-sm btn-outline-primary" onclick="app.addSubtask('${task.id}')">
                    <i class="bi bi-plus"></i> Subtask
                </button>
                <button class="btn btn-sm btn-outline-info" onclick="app.setCurrentTask('${task.id}')">
                    <i class="bi bi-clock"></i> Current
                </button>
                <button class="btn btn-sm btn-outline-secondary" onclick="app.editTask('${task.id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="app.deleteTask('${task.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;

        // Drag events for tasks
        taskDiv.addEventListener('dragstart', (e) => {
            this.draggedTask = task;
            taskDiv.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        taskDiv.addEventListener('dragend', () => {
            taskDiv.classList.remove('dragging');
            this.draggedTask = null;
        });

        // Allow reordering in manual mode
        if (this.currentSortMode === 'manual') {
            taskDiv.addEventListener('dragover', (e) => {
                e.preventDefault();
                const container = document.getElementById('taskContainer');
                const afterElement = this.getDragAfterElement(container, e.clientY);
                if (afterElement == null) {
                    container.appendChild(taskDiv);
                } else {
                    container.insertBefore(taskDiv, afterElement);
                }
            });

            taskDiv.addEventListener('drop', (e) => {
                e.preventDefault();
                this.reorderTasks();
            });
        }

        return taskDiv;
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    reorderTasks() {
        const container = document.getElementById('taskContainer');
        const taskElements = container.querySelectorAll('.task-item');
        
        taskElements.forEach((el, index) => {
            const taskId = el.dataset.taskId;
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                task.order = index;
            }
        });

        this.saveData();
    }

    renderSubtasks(task) {
        if (!task.subtasks || task.subtasks.length === 0) return '';

        return task.subtasks.map(subtask => `
            <div class="subtask-item ${subtask.completed ? 'completed' : ''}">
                <input type="checkbox" class="form-check-input" ${subtask.completed ? 'checked' : ''}
                       onchange="app.toggleSubtaskComplete('${task.id}', '${subtask.id}')">
                <span>${this.escapeHtml(subtask.name)}</span>
                <button class="btn btn-sm btn-link text-danger" onclick="app.deleteSubtask('${task.id}', '${subtask.id}')">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `).join('');
    }

    openTaskModal(task = null) {
        const modal = document.getElementById('taskModal');
        const form = document.getElementById('taskForm');
        
        if (task) {
            document.getElementById('taskModalLabel').textContent = 'Edit Task';
            document.getElementById('taskName').value = task.name;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskId').value = task.id;
        } else {
            document.getElementById('taskModalLabel').textContent = 'Add Task';
            form.reset();
            document.getElementById('taskId').value = '';
        }
        
        modal.style.display = 'block';
        modal.classList.add('show');
    }

    saveTask() {
        const name = document.getElementById('taskName').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const id = document.getElementById('taskId').value;

        if (!name) return;

        if (id) {
            const task = this.tasks.find(t => t.id === id);
            if (task) {
                task.name = name;
                task.description = description;
            }
        } else {
            const newTask = {
                id: 'task_' + Date.now(),
                name: name,
                description: description,
                completed: false,
                listId: this.currentListId === 'all' ? 'all' : this.currentListId,
                subtasks: [],
                createdAt: Date.now(),
                order: this.tasks.length
            };
            this.tasks.push(newTask);
        }

        this.saveData();
        this.renderTasks();
        this.renderTaskLists();
        
        this.closeModal('taskModal');
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.openTaskModal(task);
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            
            // Remove from week plan
            Object.keys(this.weekPlan).forEach(day => {
                this.weekPlan[day] = this.weekPlan[day].filter(t => t.taskId !== taskId);
            });
            
            if (this.currentTaskId === taskId) {
                this.currentTaskId = null;
            }
            
            this.saveData();
            this.renderTasks();
            this.renderTaskLists();
            this.renderWeekCalendar();
            this.updateCurrentTaskDisplay();
        }
    }

    toggleTaskComplete(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveData();
            this.renderTasks();
            this.updateCurrentTaskDisplay();
        }
    }

    // ========================================
    // Subtasks Management
    // ========================================
    
    addSubtask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const subtaskName = prompt('Enter subtask name:');
        if (!subtaskName || !subtaskName.trim()) return;

        if (!task.subtasks) task.subtasks = [];

        task.subtasks.push({
            id: 'subtask_' + Date.now(),
            name: subtaskName.trim(),
            completed: false
        });

        this.saveData();
        this.renderTasks();
        this.updateCurrentTaskDisplay();
    }

    toggleSubtaskComplete(taskId, subtaskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task || !task.subtasks) return;

        const subtask = task.subtasks.find(s => s.id === subtaskId);
        if (subtask) {
            subtask.completed = !subtask.completed;
            this.saveData();
            this.renderTasks();
            this.updateCurrentTaskDisplay();
        }
    }

    deleteSubtask(taskId, subtaskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task || !task.subtasks) return;

        task.subtasks = task.subtasks.filter(s => s.id !== subtaskId);
        this.saveData();
        this.renderTasks();
        this.updateCurrentTaskDisplay();
    }

    // ========================================
    // Current Task
    // ========================================
    
    setCurrentTask(taskId) {
        this.currentTaskId = taskId;
        this.saveData();
        this.updateCurrentTaskDisplay();
    }

    updateCurrentTaskDisplay() {
        const container = document.getElementById('currentTaskDisplay');
        
        if (!this.currentTaskId) {
            container.innerHTML = '<p class="text-muted">No task selected</p>';
            return;
        }

        const task = this.tasks.find(t => t.id === this.currentTaskId);
        if (!task) {
            this.currentTaskId = null;
            container.innerHTML = '<p class="text-muted">No task selected</p>';
            return;
        }

        const completedSubtasks = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
        const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
        const progressPercent = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

        container.innerHTML = `
            <div class="current-task-title">${this.escapeHtml(task.name)}</div>
            ${task.description ? `<p class="text-muted small">${this.escapeHtml(task.description)}</p>` : ''}
            ${totalSubtasks > 0 ? `
                <div class="current-task-progress">
                    <div class="d-flex justify-content-between mb-1">
                        <small>Progress</small>
                        <small>${completedSubtasks}/${totalSubtasks}</small>
                    </div>
                    <div class="progress">
                        <div class="progress-bar" role="progressbar" style="width: ${progressPercent}%"></div>
                    </div>
                </div>
                <div class="mt-2">
                    ${task.subtasks.map(s => `
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" ${s.completed ? 'checked' : ''}
                                   onchange="app.toggleSubtaskComplete('${task.id}', '${s.id}')">
                            <label class="form-check-label ${s.completed ? 'text-decoration-line-through text-muted' : ''}">
                                ${this.escapeHtml(s.name)}
                            </label>
                        </div>
                    `).join('')}
                </div>
            ` : '<p class="text-muted small">No subtasks</p>'}
            <button class="btn btn-sm btn-outline-secondary mt-2" onclick="app.currentTaskId = null; app.saveData(); app.updateCurrentTaskDisplay();">
                Clear Current Task
            </button>
        `;
    }

    // ========================================
    // Week Calendar
    // ========================================
    
    renderWeekCalendar() {
        const container = document.getElementById('weekCalendar');
        const days = this.getWeekDays();

        container.innerHTML = days.map(day => {
            const dayTasks = this.weekPlan[day.key] || [];
            
            return `
                <div class="calendar-day" data-day="${day.key}">
                    <div class="calendar-day-header">
                        <span>${day.name}</span>
                        <span class="calendar-day-date">${day.date}</span>
                    </div>
                    <div class="calendar-time-slots drop-zone" 
                         ondragover="app.handleCalendarDragOver(event)"
                         ondrop="app.handleCalendarDrop(event, '${day.key}')"
                         ondragleave="app.handleCalendarDragLeave(event)">
                        ${dayTasks.length > 0 ? dayTasks.map(task => this.createCalendarTaskElement(task, day.key)).join('') : '<small>Drop tasks here</small>'}
                    </div>
                </div>
            `;
        }).join('');
    }

    getWeekDays() {
        const days = [];
        const today = new Date();
        const currentDay = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1));

        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            
            days.push({
                key: date.toISOString().split('T')[0],
                name: dayNames[i],
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            });
        }

        return days;
    }

    createCalendarTaskElement(calendarTask, dayKey) {
        const task = this.tasks.find(t => t.id === calendarTask.taskId);
        if (!task) return '';

        const duration = calendarTask.duration || 60;

        return `
            <div class="calendar-task" draggable="true" 
                 data-task-id="${task.id}" 
                 data-day="${dayKey}"
                 ondragstart="app.handleCalendarTaskDragStart(event, '${task.id}', '${dayKey}')"
                 ondragend="app.handleCalendarTaskDragEnd(event)">
                <div>${this.escapeHtml(task.name)}</div>
                <div class="calendar-task-time">
                    Duration: ${duration} min
                    <button class="btn btn-sm btn-link text-danger float-end p-0" 
                            onclick="app.removeFromCalendar('${dayKey}', '${task.id}')">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
            </div>
        `;
    }

    handleCalendarDragOver(event) {
        event.preventDefault();
        event.currentTarget.classList.add('drag-over');
    }

    handleCalendarDragLeave(event) {
        event.currentTarget.classList.remove('drag-over');
    }

    handleCalendarDrop(event, dayKey) {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over');

        if (this.draggedTask) {
            // Adding task from task list
            if (!this.weekPlan[dayKey]) {
                this.weekPlan[dayKey] = [];
            }

            // Check if task is already in this day
            const exists = this.weekPlan[dayKey].find(t => t.taskId === this.draggedTask.id);
            if (!exists) {
                const duration = prompt('Enter duration in minutes:', '60');
                if (duration) {
                    this.weekPlan[dayKey].push({
                        taskId: this.draggedTask.id,
                        duration: parseInt(duration) || 60
                    });
                }
            }

            this.saveData();
            this.renderWeekCalendar();
        } else if (this.draggedCalendarTask) {
            // Moving task between days
            const { taskId, fromDay } = this.draggedCalendarTask;
            
            if (fromDay !== dayKey) {
                // Remove from old day
                if (this.weekPlan[fromDay]) {
                    const taskData = this.weekPlan[fromDay].find(t => t.taskId === taskId);
                    this.weekPlan[fromDay] = this.weekPlan[fromDay].filter(t => t.taskId !== taskId);
                    
                    // Add to new day
                    if (!this.weekPlan[dayKey]) {
                        this.weekPlan[dayKey] = [];
                    }
                    if (taskData) {
                        this.weekPlan[dayKey].push(taskData);
                    }
                }
                
                this.saveData();
                this.renderWeekCalendar();
            }
        }
    }

    handleCalendarTaskDragStart(event, taskId, dayKey) {
        this.draggedCalendarTask = { taskId, fromDay: dayKey };
        event.target.style.opacity = '0.5';
    }

    handleCalendarTaskDragEnd(event) {
        event.target.style.opacity = '1';
        this.draggedCalendarTask = null;
    }

    removeFromCalendar(dayKey, taskId) {
        if (this.weekPlan[dayKey]) {
            this.weekPlan[dayKey] = this.weekPlan[dayKey].filter(t => t.taskId !== taskId);
            this.saveData();
            this.renderWeekCalendar();
        }
    }

    // ========================================
    // Utility Functions
    // ========================================
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'none';
        modal.classList.remove('show');
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// ========================================
// Initialize Application
// ========================================

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new PortableTodo();
});
