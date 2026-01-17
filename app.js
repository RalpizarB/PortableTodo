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
        this.calendarDays = 7; // 1, 3, 5, or 7 days
        this.stickyNotes = [];
        this.nextNoteId = 1;
        
        this.init();
    }

    // Generate UUID for unique instance identification
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // ========================================
    // Initialization
    // ========================================
    
    init() {
        this.loadData();
        this.initEventListeners();
        this.renderTaskLists();
        this.renderTasks();
        this.initFullCalendar();
        this.updateCurrentTaskDisplay();
        this.loadDarkMode();
        this.renderStickyNotes();
        this.initResizablePanels();
    }

    loadData() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.taskLists = JSON.parse(localStorage.getItem('taskLists')) || [
            { id: 'all', name: 'All Tasks', isDefault: true }
        ];
        this.weekPlan = JSON.parse(localStorage.getItem('weekPlan')) || {};
        this.currentTaskId = localStorage.getItem('currentTaskId') || null;
        this.currentSortMode = localStorage.getItem('sortMode') || 'manual';
        this.stickyNotes = JSON.parse(localStorage.getItem('stickyNotes')) || [];
        this.nextNoteId = parseInt(localStorage.getItem('nextNoteId')) || 1;
        
        // Data migration: Add instanceId to existing calendar tasks
        let migrationNeeded = false;
        Object.keys(this.weekPlan).forEach(dayKey => {
            this.weekPlan[dayKey] = this.weekPlan[dayKey].map(task => {
                if (!task.instanceId) {
                    migrationNeeded = true;
                    return {
                        ...task,
                        instanceId: this.generateUUID()
                    };
                }
                return task;
            });
        });
        
        if (migrationNeeded) {
            this.saveData();
        }
    }

    saveData() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        localStorage.setItem('taskLists', JSON.stringify(this.taskLists));
        localStorage.setItem('weekPlan', JSON.stringify(this.weekPlan));
        localStorage.setItem('currentTaskId', this.currentTaskId);
        localStorage.setItem('sortMode', this.currentSortMode);
        localStorage.setItem('stickyNotes', JSON.stringify(this.stickyNotes));
        localStorage.setItem('nextNoteId', this.nextNoteId);
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

        // Calendar day view buttons
        document.querySelectorAll('input[name="calendarDays"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.calendarDays = parseInt(e.target.value);
                this.updateCalendarView();
            });
        });

        // Add sticky note button
        document.getElementById('addStickyNoteBtn').addEventListener('click', () => {
            this.createStickyNote();
        });

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
    // Week Calendar - FullCalendar Integration
    // ========================================
    
    initFullCalendar() {
        const calendarEl = document.getElementById('weekCalendar');
        
        // Determine initial view based on calendarDays setting
        let initialView = 'timeGridWeek';
        if (this.calendarDays === 1) {
            initialView = 'timeGridDay';
        } else if (this.calendarDays === 3) {
            initialView = 'timeGrid';  // Custom 3-day view
        } else if (this.calendarDays === 5) {
            initialView = 'timeGridWeek';  // Will show Mon-Fri by default
        }
        
        this.calendar = new FullCalendar.Calendar(calendarEl, {
            schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
            initialView: initialView,
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: ''
            },
            views: {
                timeGrid: {
                    type: 'timeGrid',
                    duration: { days: this.calendarDays }
                }
            },
            slotMinTime: '00:00:00',
            slotMaxTime: '24:00:00',
            allDaySlot: false,
            editable: true,
            droppable: true,
            eventResizableFromStart: true,
            height: 'auto',
            slotDuration: '01:00:00',
            snapDuration: '00:15:00',
            weekends: true,
            events: this.getCalendarEvents(),
            
            // Handle external task drops
            drop: (info) => {
                if (this.draggedTask) {
                    const dayKey = info.dateStr.split('T')[0];
                    const startTime = parseInt(info.dateStr.split('T')[1].split(':')[0]);
                    
                    if (!this.weekPlan[dayKey]) {
                        this.weekPlan[dayKey] = [];
                    }
                    
                    this.weekPlan[dayKey].push({
                        instanceId: this.generateUUID(),
                        taskId: this.draggedTask.id,
                        startTime: startTime,
                        duration: 60
                    });
                    
                    this.saveData();
                    this.refreshCalendar();
                }
            },
            
            // Handle event drops (moving events)
            eventDrop: (info) => {
                const instanceId = info.event.id;
                const newDate = info.event.start;
                const dayKey = newDate.toISOString().split('T')[0];
                const startTime = newDate.getHours();
                
                // Find and update the task
                let found = false;
                Object.keys(this.weekPlan).forEach(day => {
                    if (!found && this.weekPlan[day]) {
                        const taskIndex = this.weekPlan[day].findIndex(t => t.instanceId === instanceId);
                        if (taskIndex !== -1) {
                            const task = this.weekPlan[day][taskIndex];
                            
                            // Remove from old day
                            this.weekPlan[day].splice(taskIndex, 1);
                            
                            // Add to new day
                            if (!this.weekPlan[dayKey]) {
                                this.weekPlan[dayKey] = [];
                            }
                            task.startTime = startTime;
                            this.weekPlan[dayKey].push(task);
                            found = true;
                        }
                    }
                });
                
                this.saveData();
                this.refreshCalendar();
            },
            
            // Handle event resize
            eventResize: (info) => {
                const instanceId = info.event.id;
                const newDuration = (info.event.end - info.event.start) / 60000; // milliseconds to minutes
                
                // Find and update the task duration
                Object.keys(this.weekPlan).forEach(day => {
                    if (this.weekPlan[day]) {
                        const task = this.weekPlan[day].find(t => t.instanceId === instanceId);
                        if (task) {
                            task.duration = Math.max(15, Math.round(newDuration));
                        }
                    }
                });
                
                this.saveData();
                this.refreshCalendar();
            },
            
            // Handle event click (remove from calendar)
            eventClick: (info) => {
                if (confirm('Remove this task from calendar?')) {
                    const instanceId = info.event.id;
                    
                    Object.keys(this.weekPlan).forEach(day => {
                        if (this.weekPlan[day]) {
                            this.weekPlan[day] = this.weekPlan[day].filter(t => t.instanceId !== instanceId);
                        }
                    });
                    
                    this.saveData();
                    this.refreshCalendar();
                }
            }
        });
        
        this.calendar.render();
    }
    
    updateCalendarView() {
        if (!this.calendar) return;
        
        let viewType = 'timeGridWeek';
        let duration = 7;
        
        if (this.calendarDays === 1) {
            viewType = 'timeGridDay';
        } else {
            viewType = 'timeGrid';
            duration = this.calendarDays;
        }
        
        // Update the view with custom duration
        this.calendar.changeView(viewType, {
            duration: { days: duration }
        });
    }
    
    getCalendarEvents() {
        const events = [];
        
        Object.keys(this.weekPlan).forEach(dayKey => {
            if (this.weekPlan[dayKey]) {
                this.weekPlan[dayKey].forEach(calendarTask => {
                    const task = this.tasks.find(t => t.id === calendarTask.taskId);
                    if (task) {
                        const startTime = calendarTask.startTime !== undefined ? calendarTask.startTime : 9;
                        const duration = calendarTask.duration !== undefined ? calendarTask.duration : 60;
                        
                        const startHour = String(Math.floor(startTime)).padStart(2, '0');
                        const startMin = String(Math.round((startTime - Math.floor(startTime)) * 60)).padStart(2, '0');
                        
                        events.push({
                            id: calendarTask.instanceId,
                            title: task.name,
                            start: `${dayKey}T${startHour}:${startMin}:00`,
                            duration: { minutes: duration },
                            backgroundColor: this.getTaskColor(task.id),
                            borderColor: this.getTaskColor(task.id),
                            textColor: '#fff'
                        });
                    }
                });
            }
        });
        
        return events;
    }
    
    getTaskColor(taskId) {
        // Generate a consistent color based on task ID
        let hash = 0;
        for (let i = 0; i < taskId.length; i++) {
            hash = taskId.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = hash % 360;
        return `hsl(${hue}, 65%, 55%)`;
    }
    
    refreshCalendar() {
        if (this.calendar) {
            this.calendar.removeAllEvents();
            this.calendar.addEventSource(this.getCalendarEvents());
        }
    }
    
    renderWeekCalendar() {
        // Redirect to refreshCalendar for backwards compatibility
        this.refreshCalendar();
    }

    // ========================================
    // Sticky Notes
    // ========================================

    createStickyNote(noteData = null) {
        const note = noteData || {
            id: this.nextNoteId++,
            content: '',
            x: window.innerWidth / 2 - 150,
            y: window.innerHeight / 2 - 100,
            width: 300,
            height: 200,
            minimized: false,
            created: new Date().toISOString()
        };

        if (!noteData) {
            this.stickyNotes.push(note);
            this.saveData();
        }

        this.renderStickyNote(note);
    }

    renderStickyNotes() {
        this.stickyNotes.forEach(note => {
            this.renderStickyNote(note);
        });
    }

    renderStickyNote(note) {
        const container = document.getElementById('stickyNotesContainer');
        
        // Remove existing note element if it exists
        const existing = document.getElementById(`sticky-note-${note.id}`);
        if (existing) {
            existing.remove();
        }

        const noteEl = document.createElement('div');
        noteEl.id = `sticky-note-${note.id}`;
        noteEl.className = `sticky-note ${note.minimized ? 'minimized' : ''}`;
        noteEl.style.left = note.x + 'px';
        noteEl.style.top = note.y + 'px';
        noteEl.style.width = note.width + 'px';
        noteEl.style.height = note.height + 'px';

        noteEl.innerHTML = `
            <div class="sticky-note-header">
                <h6><i class="bi bi-sticky"></i> Note</h6>
                <div class="sticky-note-controls">
                    <button onclick="app.toggleMinimizeNote(${note.id})" title="${note.minimized ? 'Expand' : 'Minimize'}">
                        <i class="bi bi-${note.minimized ? 'arrows-angle-expand' : 'dash'}"></i>
                    </button>
                    <button onclick="app.deleteStickyNote(${note.id})" title="Delete">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
            </div>
            <div class="sticky-note-content">
                <textarea placeholder="Type your note here...">${this.escapeHtml(note.content || '')}</textarea>
            </div>
        `;

        container.appendChild(noteEl);

        // Make draggable
        this.makeDraggable(noteEl, note);

        // Make resizable (if not minimized)
        if (!note.minimized) {
            this.makeResizable(noteEl, note);
        }

        // Auto-save content on input
        const textarea = noteEl.querySelector('textarea');
        textarea.addEventListener('input', (e) => {
            note.content = e.target.value;
            this.saveData();
        });
    }

    makeDraggable(element, note) {
        const header = element.querySelector('.sticky-note-header');
        let isDragging = false;
        let startX, startY, initialX, initialY;

        header.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'I') return;
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = note.x;
            initialY = note.y;
            element.style.zIndex = 1000;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            note.x = initialX + dx;
            note.y = initialY + dy;
            
            element.style.left = note.x + 'px';
            element.style.top = note.y + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.zIndex = 999;
                this.saveData();
            }
        });
    }

    makeResizable(element, note) {
        let isResizing = false;
        let startX, startY, startWidth, startHeight;

        const resizeObserver = new ResizeObserver(() => {
            if (!isResizing) {
                note.width = element.offsetWidth;
                note.height = element.offsetHeight;
                this.saveData();
            }
        });

        resizeObserver.observe(element);

        element.addEventListener('mousedown', (e) => {
            const rect = element.getBoundingClientRect();
            const isInResizeZone = 
                e.clientX > rect.right - 20 &&
                e.clientY > rect.bottom - 20;

            if (isInResizeZone) {
                isResizing = true;
                startX = e.clientX;
                startY = e.clientY;
                startWidth = element.offsetWidth;
                startHeight = element.offsetHeight;
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const width = startWidth + (e.clientX - startX);
            const height = startHeight + (e.clientY - startY);

            element.style.width = Math.max(200, width) + 'px';
            element.style.height = Math.max(150, height) + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                note.width = element.offsetWidth;
                note.height = element.offsetHeight;
                this.saveData();
            }
        });
    }

    toggleMinimizeNote(noteId) {
        const note = this.stickyNotes.find(n => n.id === noteId);
        if (note) {
            note.minimized = !note.minimized;
            this.saveData();
            this.renderStickyNote(note);
        }
    }

    deleteStickyNote(noteId) {
        this.stickyNotes = this.stickyNotes.filter(n => n.id !== noteId);
        const element = document.getElementById(`sticky-note-${noteId}`);
        if (element) {
            element.remove();
        }
        this.saveData();
    }

    // ========================================
    // Resizable Panels
    // ========================================

    initResizablePanels() {
        const handles = document.querySelectorAll('.resize-handle');
        
        handles.forEach(handle => {
            let isResizing = false;
            let startX, startLeftWidth, startRightWidth;
            let leftPanel, rightPanel;

            handle.addEventListener('mousedown', (e) => {
                isResizing = true;
                startX = e.clientX;
                
                const panelId = handle.dataset.resize;
                leftPanel = document.getElementById(panelId);
                rightPanel = handle.nextElementSibling;

                if (leftPanel && rightPanel) {
                    startLeftWidth = leftPanel.offsetWidth;
                    startRightWidth = rightPanel.offsetWidth;
                }

                document.body.style.cursor = 'col-resize';
                e.preventDefault();
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing || !leftPanel || !rightPanel) return;

                const dx = e.clientX - startX;
                const containerWidth = leftPanel.parentElement.offsetWidth;
                
                const newLeftWidth = startLeftWidth + dx;
                const newRightWidth = startRightWidth - dx;

                // Enforce minimum widths
                if (newLeftWidth >= 200 && newRightWidth >= 200) {
                    const leftPercent = (newLeftWidth / containerWidth) * 100;
                    const rightPercent = (newRightWidth / containerWidth) * 100;

                    leftPanel.style.flex = `0 0 ${leftPercent}%`;
                    rightPanel.style.flex = `0 0 ${rightPercent}%`;
                }
            });

            document.addEventListener('mouseup', () => {
                if (isResizing) {
                    isResizing = false;
                    document.body.style.cursor = '';
                    leftPanel = null;
                    rightPanel = null;
                }
            });
        });
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
