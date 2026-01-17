// PortableTodo - Local Storage Task Planner
// All data is stored in browser's localStorage

class PortableTodo {
    constructor() {
        this.todos = this.loadFromStorage('todos') || [];
        this.taskLists = this.loadFromStorage('taskLists') || [];
        this.calendarEvents = this.loadFromStorage('calendarEvents') || [];
        this.nightMode = this.loadFromStorage('nightMode') || false;
        this.calendar = null;
        
        this.init();
    }

    init() {
        this.initializeNightMode();
        this.initializeCalendar();
        this.initializeTodos();
        this.initializeTaskLists();
        this.setupEventListeners();
    }

    // Local Storage Methods
    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error loading ${key} from storage:`, error);
            return null;
        }
    }

    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Error saving ${key} to storage:`, error);
        }
    }

    // Night Mode
    initializeNightMode() {
        if (this.nightMode) {
            document.body.classList.add('night-mode');
        }
    }

    toggleNightMode() {
        this.nightMode = !this.nightMode;
        document.body.classList.toggle('night-mode');
        this.saveToStorage('nightMode', this.nightMode);
    }

    // Calendar Initialization
    initializeCalendar() {
        const calendarEl = document.getElementById('calendar');
        this.calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            editable: true,
            droppable: true,
            events: this.calendarEvents,
            eventClick: (info) => {
                if (confirm(`Delete event '${info.event.title}'?`)) {
                    info.event.remove();
                    this.removeCalendarEvent(info.event.id);
                }
            },
            eventDrop: (info) => {
                this.updateCalendarEvent(info.event);
            },
            eventResize: (info) => {
                this.updateCalendarEvent(info.event);
            },
            dateClick: (info) => {
                const title = prompt('Enter event title:');
                if (title) {
                    this.addCalendarEvent(title, info.dateStr);
                }
            }
        });
        this.calendar.render();
    }

    addCalendarEvent(title, date, allDay = true) {
        const event = {
            id: Date.now().toString(),
            title: title,
            start: date,
            allDay: allDay
        };
        this.calendarEvents.push(event);
        this.saveToStorage('calendarEvents', this.calendarEvents);
        this.calendar.addEvent(event);
    }

    updateCalendarEvent(event) {
        const index = this.calendarEvents.findIndex(e => e.id === event.id);
        if (index !== -1) {
            this.calendarEvents[index] = {
                id: event.id,
                title: event.title,
                start: event.start.toISOString(),
                end: event.end ? event.end.toISOString() : null,
                allDay: event.allDay
            };
            this.saveToStorage('calendarEvents', this.calendarEvents);
        }
    }

    removeCalendarEvent(eventId) {
        this.calendarEvents = this.calendarEvents.filter(e => e.id !== eventId);
        this.saveToStorage('calendarEvents', this.calendarEvents);
    }

    // Todos Methods
    initializeTodos() {
        this.renderTodos();
    }

    renderTodos() {
        const todoList = document.getElementById('todoList');
        todoList.innerHTML = '';
        
        this.todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = todo.completed;
            checkbox.addEventListener('change', () => this.toggleTodo(index));
            
            const span = document.createElement('span');
            span.textContent = todo.text;
            span.addEventListener('dblclick', () => {
                const newDate = prompt('Add to calendar? Enter date (YYYY-MM-DD):');
                if (newDate) {
                    this.addCalendarEvent(todo.text, newDate);
                }
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '🗑️';
            deleteBtn.title = 'Delete todo';
            deleteBtn.addEventListener('click', () => this.deleteTodo(index));
            
            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(deleteBtn);
            todoList.appendChild(li);
        });
    }

    addTodo(text) {
        if (text.trim()) {
            this.todos.push({
                text: text.trim(),
                completed: false,
                createdAt: new Date().toISOString()
            });
            this.saveToStorage('todos', this.todos);
            this.renderTodos();
        }
    }

    toggleTodo(index) {
        this.todos[index].completed = !this.todos[index].completed;
        this.saveToStorage('todos', this.todos);
        this.renderTodos();
    }

    deleteTodo(index) {
        this.todos.splice(index, 1);
        this.saveToStorage('todos', this.todos);
        this.renderTodos();
    }

    // Task Lists Methods
    initializeTaskLists() {
        this.renderTaskLists();
    }

    renderTaskLists() {
        const taskListsContainer = document.getElementById('taskLists');
        taskListsContainer.innerHTML = '';
        
        this.taskLists.forEach((list, listIndex) => {
            const listDiv = document.createElement('div');
            listDiv.className = 'task-list';
            
            const header = document.createElement('div');
            header.className = 'task-list-header';
            
            const title = document.createElement('div');
            title.className = 'task-list-title';
            title.textContent = list.name;
            title.contentEditable = true;
            title.addEventListener('blur', (e) => {
                this.updateTaskListName(listIndex, e.target.textContent);
            });
            
            const controls = document.createElement('div');
            controls.className = 'task-list-controls';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '🗑️';
            deleteBtn.title = 'Delete list';
            deleteBtn.addEventListener('click', () => this.deleteTaskList(listIndex));
            
            controls.appendChild(deleteBtn);
            header.appendChild(title);
            header.appendChild(controls);
            
            const inputContainer = document.createElement('div');
            inputContainer.className = 'task-input-container';
            
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Add a task...';
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addTask(listIndex, input.value);
                    input.value = '';
                }
            });
            
            const addBtn = document.createElement('button');
            addBtn.textContent = '+';
            addBtn.addEventListener('click', () => {
                this.addTask(listIndex, input.value);
                input.value = '';
            });
            
            inputContainer.appendChild(input);
            inputContainer.appendChild(addBtn);
            
            const tasksList = document.createElement('ul');
            tasksList.className = 'tasks';
            
            list.tasks.forEach((task, taskIndex) => {
                const taskLi = document.createElement('li');
                taskLi.className = `task-item ${task.completed ? 'completed' : ''}`;
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = task.completed;
                checkbox.addEventListener('change', () => this.toggleTask(listIndex, taskIndex));
                
                const taskSpan = document.createElement('span');
                taskSpan.textContent = task.text;
                taskSpan.addEventListener('dblclick', () => {
                    const newDate = prompt('Add to calendar? Enter date (YYYY-MM-DD):');
                    if (newDate) {
                        this.addCalendarEvent(task.text, newDate);
                    }
                });
                
                const taskDeleteBtn = document.createElement('button');
                taskDeleteBtn.textContent = '🗑️';
                taskDeleteBtn.title = 'Delete task';
                taskDeleteBtn.addEventListener('click', () => this.deleteTask(listIndex, taskIndex));
                
                taskLi.appendChild(checkbox);
                taskLi.appendChild(taskSpan);
                taskLi.appendChild(taskDeleteBtn);
                tasksList.appendChild(taskLi);
            });
            
            listDiv.appendChild(header);
            listDiv.appendChild(inputContainer);
            listDiv.appendChild(tasksList);
            taskListsContainer.appendChild(listDiv);
        });
    }

    addTaskList() {
        const name = prompt('Enter list name:');
        if (name && name.trim()) {
            this.taskLists.push({
                name: name.trim(),
                tasks: [],
                createdAt: new Date().toISOString()
            });
            this.saveToStorage('taskLists', this.taskLists);
            this.renderTaskLists();
        }
    }

    updateTaskListName(listIndex, newName) {
        if (newName && newName.trim()) {
            this.taskLists[listIndex].name = newName.trim();
            this.saveToStorage('taskLists', this.taskLists);
        } else {
            this.renderTaskLists();
        }
    }

    deleteTaskList(listIndex) {
        if (confirm('Delete this entire list?')) {
            this.taskLists.splice(listIndex, 1);
            this.saveToStorage('taskLists', this.taskLists);
            this.renderTaskLists();
        }
    }

    addTask(listIndex, text) {
        if (text && text.trim()) {
            this.taskLists[listIndex].tasks.push({
                text: text.trim(),
                completed: false,
                createdAt: new Date().toISOString()
            });
            this.saveToStorage('taskLists', this.taskLists);
            this.renderTaskLists();
        }
    }

    toggleTask(listIndex, taskIndex) {
        this.taskLists[listIndex].tasks[taskIndex].completed = 
            !this.taskLists[listIndex].tasks[taskIndex].completed;
        this.saveToStorage('taskLists', this.taskLists);
        this.renderTaskLists();
    }

    deleteTask(listIndex, taskIndex) {
        this.taskLists[listIndex].tasks.splice(taskIndex, 1);
        this.saveToStorage('taskLists', this.taskLists);
        this.renderTaskLists();
    }

    // Event Listeners
    setupEventListeners() {
        // Night Mode Toggle
        document.getElementById('nightModeToggle').addEventListener('click', () => {
            this.toggleNightMode();
        });

        // Add Todo
        const todoInput = document.getElementById('todoInput');
        document.getElementById('addTodoBtn').addEventListener('click', () => {
            this.addTodo(todoInput.value);
            todoInput.value = '';
        });

        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo(todoInput.value);
                todoInput.value = '';
            }
        });

        // Add Task List
        document.getElementById('addListBtn').addEventListener('click', () => {
            this.addTaskList();
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PortableTodo();
});
