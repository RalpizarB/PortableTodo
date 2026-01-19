// PortableTodo - Local Storage Task Planner
// All data is stored in browser's localStorage

class PortableTodo {
  constructor() {
    this.todos = this.loadFromStorage("todos") || [];
    this.taskLists = this.loadFromStorage("taskLists") || [];
    this.calendarEvents = this.loadFromStorage("calendarEvents") || [];
    this.nightMode = this.loadFromStorage("nightMode") || false;
    this.settings = this.loadFromStorage("settings") || {
      defaultTaskColor: "#3498db",
    };
    this.stickyNotes = this.loadFromStorage("stickyNotes") || [];
    this.stickiesVisible = this.loadFromStorage("stickiesVisible") || false;
    this.calendar = null;
    this.defaultColors = [
      "#3498db",
      "#e74c3c",
      "#2ecc71",
      "#f39c12",
      "#9b59b6",
      "#1abc9c",
      "#34495e",
      "#e67e22",
      "#95a5a6",
      "#16a085",
    ];

    this.init();
  }

  init() {
    this.initializeNightMode();
    this.initializeCalendar();
    this.initializeTodos();
    this.initializeTaskLists();
    this.setupEventListeners();
    this.initializeDraggable();
    this.initializeSettings();
    this.initializeStickyNotes();
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
      document.body.classList.add("night-mode");
    }
  }

  toggleNightMode() {
    this.nightMode = !this.nightMode;
    document.body.classList.toggle("night-mode");
    this.saveToStorage("nightMode", this.nightMode);
  }

  // Calendar Initialization
  initializeCalendar() {
    try {
      if (typeof FullCalendar === "undefined") {
        console.warn(
          "FullCalendar library not loaded. Calendar features will be disabled.",
        );
        return;
      }

      const calendarEl = document.getElementById("calendar");
      this.calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "timeGridWeek",
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right:
            "dayGridMonth,timeGridWeek,timeGridWorkWeek,timeGrid3Day,timeGridDay",
        },
        views: {
          timeGrid3Day: {
            type: "timeGrid",
            duration: { days: 3 },
            buttonText: "3 days",
          },
          timeGridWorkWeek: {
            type: "timeGridWeek",
            hiddenDays: [0, 6], // Hide Sunday and Saturday
            buttonText: "Work Week",
          },
        },
        slotDuration: "00:15:00", // 10-minute time slots
        slotLabelInterval: "01:00:00", // Show labels every 30 minutes for readability
        nowIndicator: true, // Show current time indicator line
        editable: true,
        droppable: true,
        events: this.calendarEvents,
        drop: (info) => {
          // Handle external element drop
          const title = info.draggedEl.getAttribute("data-event-title");
          if (title) {
            this.addCalendarEvent(title, info.dateStr);
          }
        },
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
          const title = prompt("Enter event title:");
          if (title) {
            this.addCalendarEvent(title, info.dateStr);
          }
        },
      });
      this.calendar.render();
    } catch (error) {
      console.error("Error initializing calendar:", error);
    }
  }

  // Initialize Draggable for external elements
  initializeDraggable() {
    try {
      if (typeof FullCalendar === "undefined" || !FullCalendar.Draggable) {
        console.warn("FullCalendar Draggable not available");
        return;
      }

      // Make todo list draggable
      const todoListEl = document.getElementById("todoList");
      new FullCalendar.Draggable(todoListEl, {
        itemSelector: ".todo-item",
        eventData: (eventEl) => {
          const title = eventEl.querySelector("span").textContent;
          return {
            title: title,
            duration: "01:00",
            backgroundColor: this.settings.defaultTaskColor,
            borderColor: this.settings.defaultTaskColor,
          };
        },
      });

      // Make task lists draggable
      const taskListsEl = document.getElementById("taskLists");
      new FullCalendar.Draggable(taskListsEl, {
        itemSelector: ".task-item",
        eventData: (eventEl) => {
          const title = eventEl.querySelector("span").textContent;
          const taskItem = eventEl.closest(".task-list");
          const listIndex = Array.from(taskListsEl.children).indexOf(taskItem);
          const color =
            this.taskLists[listIndex]?.color || this.settings.defaultTaskColor;
          return {
            title: title,
            duration: "01:00",
            backgroundColor: color,
            borderColor: color,
          };
        },
      });
    } catch (error) {
      console.error("Error initializing draggable:", error);
    }
  }

  addCalendarEvent(title, date, allDay = true, color = null) {
    const event = {
      id: Date.now().toString(),
      title: title,
      start: date,
      allDay: allDay,
      backgroundColor: color || this.settings.defaultTaskColor,
      borderColor: color || this.settings.defaultTaskColor,
    };
    this.calendarEvents.push(event);
    this.saveToStorage("calendarEvents", this.calendarEvents);
    if (this.calendar) {
      this.calendar.addEvent(event);
    }
  }

  updateCalendarEvent(event) {
    const index = this.calendarEvents.findIndex((e) => e.id === event.id);
    if (index !== -1) {
      this.calendarEvents[index] = {
        id: event.id,
        title: event.title,
        start: event.start.toISOString(),
        end: event.end ? event.end.toISOString() : null,
        allDay: event.allDay,
      };
      this.saveToStorage("calendarEvents", this.calendarEvents);
    }
  }

  removeCalendarEvent(eventId) {
    this.calendarEvents = this.calendarEvents.filter((e) => e.id !== eventId);
    this.saveToStorage("calendarEvents", this.calendarEvents);
  }

  // Todos Methods
  initializeTodos() {
    this.renderTodos();
  }

  renderTodos() {
    const todoList = document.getElementById("todoList");
    todoList.innerHTML = "";

    this.todos.forEach((todo, index) => {
      const li = document.createElement("li");
      li.className = `todo-item ${todo.completed ? "completed" : ""}`;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = todo.completed;
      checkbox.addEventListener("change", () => this.toggleTodo(index));

      const span = document.createElement("span");
      span.textContent = todo.text;

      span.addEventListener("dblclick", () => {
        const newDate = prompt("Add to calendar? Enter date (YYYY-MM-DD):");
        if (newDate) {
          this.addCalendarEvent(
            todo.text,
            newDate,
            true,
            this.settings.defaultTaskColor,
          );
        }
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️";
      deleteBtn.title = "Delete todo";
      deleteBtn.addEventListener("click", () => this.deleteTodo(index));

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
        createdAt: new Date().toISOString(),
      });
      this.saveToStorage("todos", this.todos);
      this.renderTodos();
    }
  }

  toggleTodo(index) {
    this.todos[index].completed = !this.todos[index].completed;
    this.saveToStorage("todos", this.todos);
    this.renderTodos();
  }

  deleteTodo(index) {
    this.todos.splice(index, 1);
    this.saveToStorage("todos", this.todos);
    this.renderTodos();
  }

  // Task Lists Methods
  initializeTaskLists() {
    this.renderTaskLists();
  }

  renderTaskLists() {
    const taskListsContainer = document.getElementById("taskLists");
    taskListsContainer.innerHTML = "";

    this.taskLists.forEach((list, listIndex) => {
      const listDiv = document.createElement("div");
      listDiv.className = "task-list";

      const header = document.createElement("div");
      header.className = "task-list-header";

      const title = document.createElement("div");
      title.className = "task-list-title";
      title.textContent = list.name;
      title.style.borderLeft = `4px solid ${list.color || this.settings.defaultTaskColor}`;
      title.style.paddingLeft = "0.5rem";
      title.contentEditable = true;
      title.addEventListener("blur", (e) => {
        this.updateTaskListName(listIndex, e.target.textContent);
      });

      const controls = document.createElement("div");
      controls.className = "task-list-controls";

      const colorBtn = document.createElement("button");
      colorBtn.textContent = "🎨";
      colorBtn.title = "Change color";
      colorBtn.addEventListener("click", () =>
        this.changeTaskListColor(listIndex),
      );

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️";
      deleteBtn.title = "Delete list";
      deleteBtn.addEventListener("click", () => this.deleteTaskList(listIndex));

      controls.appendChild(colorBtn);
      controls.appendChild(deleteBtn);
      header.appendChild(title);
      header.appendChild(controls);

      const inputContainer = document.createElement("div");
      inputContainer.className = "task-input-container";

      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Add a task...";
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.addTask(listIndex, input.value);
          input.value = "";
        }
      });

      const addBtn = document.createElement("button");
      addBtn.textContent = "+";
      addBtn.addEventListener("click", () => {
        this.addTask(listIndex, input.value);
        input.value = "";
      });

      inputContainer.appendChild(input);
      inputContainer.appendChild(addBtn);

      const tasksList = document.createElement("ul");
      tasksList.className = "tasks";

      // Ensure tasks array exists (fix for undefined error)
      if (!list.tasks) {
        list.tasks = [];
        this.saveToStorage("taskLists", this.taskLists);
      }

      list.tasks.forEach((task, taskIndex) => {
        const taskLi = document.createElement("li");
        taskLi.className = `task-item ${task.completed ? "completed" : ""}`;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.addEventListener("change", () =>
          this.toggleTask(listIndex, taskIndex),
        );

        const taskSpan = document.createElement("span");
        taskSpan.textContent = task.text;

        taskSpan.addEventListener("dblclick", () => {
          const newDate = prompt("Add to calendar? Enter date (YYYY-MM-DD):");
          if (newDate) {
            const color = list.color || this.settings.defaultTaskColor;
            this.addCalendarEvent(task.text, newDate, true, color);
          }
        });

        const taskDeleteBtn = document.createElement("button");
        taskDeleteBtn.textContent = "🗑️";
        taskDeleteBtn.title = "Delete task";
        taskDeleteBtn.addEventListener("click", () =>
          this.deleteTask(listIndex, taskIndex),
        );

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
    const name = prompt("Enter list name:");
    if (name && name.trim()) {
      const colorIndex = this.taskLists.length % this.defaultColors.length;
      this.taskLists.push({
        name: name.trim(),
        tasks: [],
        color: this.defaultColors[colorIndex],
        createdAt: new Date().toISOString(),
      });
      this.saveToStorage("taskLists", this.taskLists);
      this.renderTaskLists();
    }
  }

  updateTaskListName(listIndex, newName) {
    if (newName && newName.trim()) {
      this.taskLists[listIndex].name = newName.trim();
      this.saveToStorage("taskLists", this.taskLists);
    } else {
      this.renderTaskLists();
    }
  }

  changeTaskListColor(listIndex) {
    const currentColor =
      this.taskLists[listIndex].color || this.settings.defaultTaskColor;
    const newColor = prompt("Enter a hex color (e.g., #3498db):", currentColor);
    if (newColor && /^#[0-9A-F]{6}$/i.test(newColor)) {
      this.taskLists[listIndex].color = newColor;
      this.saveToStorage("taskLists", this.taskLists);
      this.renderTaskLists();
    } else if (newColor) {
      alert("Invalid color format. Please use hex format like #3498db");
    }
  }

  deleteTaskList(listIndex) {
    if (confirm("Delete this entire list?")) {
      this.taskLists.splice(listIndex, 1);
      this.saveToStorage("taskLists", this.taskLists);
      this.renderTaskLists();
    }
  }

  addTask(listIndex, text) {
    if (text && text.trim()) {
      this.taskLists[listIndex].tasks.push({
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      });
      this.saveToStorage("taskLists", this.taskLists);
      this.renderTaskLists();
    }
  }

  toggleTask(listIndex, taskIndex) {
    this.taskLists[listIndex].tasks[taskIndex].completed =
      !this.taskLists[listIndex].tasks[taskIndex].completed;
    this.saveToStorage("taskLists", this.taskLists);
    this.renderTaskLists();
  }

  deleteTask(listIndex, taskIndex) {
    this.taskLists[listIndex].tasks.splice(taskIndex, 1);
    this.saveToStorage("taskLists", this.taskLists);
    this.renderTaskLists();
  }

  // Settings Modal
  initializeSettings() {
    const modal = document.getElementById("settingsModal");
    const settingsBtn = document.getElementById("settingsBtn");
    const closeModal = document.getElementById("closeModal");
    const saveSettings = document.getElementById("saveSettings");
    const defaultColorInput = document.getElementById("defaultTaskColor");

    // Load current settings
    defaultColorInput.value = this.settings.defaultTaskColor;

    // Open modal
    settingsBtn.addEventListener("click", () => {
      modal.classList.add("active");
      this.renderTaskListColorSettings();
    });

    // Close modal
    closeModal.addEventListener("click", () => {
      modal.classList.remove("active");
    });

    // Close on outside click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active");
      }
    });

    // Save settings
    saveSettings.addEventListener("click", () => {
      this.settings.defaultTaskColor = defaultColorInput.value;
      this.saveToStorage("settings", this.settings);
      modal.classList.remove("active");
      this.renderTaskLists();
      this.initializeDraggable();
      alert("Settings saved!");
    });
  }

  renderTaskListColorSettings() {
    const modalBody = document.querySelector(".modal-body");
    let colorSection = document.querySelector(".task-list-colors-section");

    if (!colorSection) {
      colorSection = document.createElement("div");
      colorSection.className = "settings-section task-list-colors-section";
      modalBody.appendChild(colorSection);
    }

    colorSection.innerHTML =
      "<h3>Task List Colors</h3><div class='task-list-color-settings'></div>";
    const container = colorSection.querySelector(".task-list-color-settings");

    this.taskLists.forEach((list, index) => {
      const item = document.createElement("div");
      item.className = "task-list-color-item";

      const colorInput = document.createElement("input");
      colorInput.type = "color";
      colorInput.value = list.color || this.settings.defaultTaskColor;
      colorInput.addEventListener("change", (e) => {
        this.taskLists[index].color = e.target.value;
        this.saveToStorage("taskLists", this.taskLists);
      });

      const label = document.createElement("label");
      label.textContent = list.name;

      item.appendChild(colorInput);
      item.appendChild(label);
      container.appendChild(item);
    });
  }

  // Sticky Notes
  initializeStickyNotes() {
    const container = document.getElementById("stickiesContainer");
    const toggleBtn = document.getElementById("toggleStickiesBtn");
    const addBtn = document.getElementById("addStickyBtn");

    // Set initial visibility
    if (this.stickiesVisible) {
      container.classList.add("active");
      addBtn.classList.add("active");
    }

    // Render existing notes
    this.renderStickyNotes();

    // Toggle stickies visibility
    toggleBtn.addEventListener("click", () => {
      this.stickiesVisible = !this.stickiesVisible;
      this.saveToStorage("stickiesVisible", this.stickiesVisible);
      container.classList.toggle("active");
      addBtn.classList.toggle("active");
    });

    // Add new sticky note
    addBtn.addEventListener("click", () => {
      this.addStickyNote();
    });
  }

  renderStickyNotes() {
    const container = document.getElementById("stickiesContainer");
    container.innerHTML = "";

    this.stickyNotes.forEach((note, index) => {
      this.createStickyNoteElement(note, index);
    });
  }

  createStickyNoteElement(note, index) {
    const container = document.getElementById("stickiesContainer");
    const stickyDiv = document.createElement("div");
    stickyDiv.className = "sticky-note";
    stickyDiv.dataset.color = note.color || "yellow";
    stickyDiv.style.left = note.x + "px";
    stickyDiv.style.top = note.y + "px";
    stickyDiv.style.width = note.width || "250px";
    stickyDiv.style.height = note.height || "200px";

    // Header with controls
    const header = document.createElement("div");
    header.className = "sticky-note-header";

    // Color picker button
    const colorBtn = document.createElement("button");
    colorBtn.textContent = "🎨";
    colorBtn.title = "Change color";
    colorBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.changeStickyColor(index);
    });

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "×";
    deleteBtn.title = "Delete";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.deleteStickyNote(index);
    });

    header.appendChild(colorBtn);
    header.appendChild(deleteBtn);

    // Content textarea
    const textarea = document.createElement("textarea");
    textarea.className = "sticky-note-content";
    textarea.placeholder = "Write your note...";
    textarea.value = note.content || "";
    textarea.addEventListener("input", (e) => {
      this.stickyNotes[index].content = e.target.value;
      this.saveToStorage("stickyNotes", this.stickyNotes);
    });
    textarea.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });

    stickyDiv.appendChild(header);
    stickyDiv.appendChild(textarea);

    // Make draggable
    this.makeStickyDraggable(stickyDiv, index);

    // Track resize
    const resizeObserver = new ResizeObserver(() => {
      this.stickyNotes[index].width = stickyDiv.style.width;
      this.stickyNotes[index].height = stickyDiv.style.height;
      this.saveToStorage("stickyNotes", this.stickyNotes);
    });
    resizeObserver.observe(stickyDiv);

    container.appendChild(stickyDiv);
  }

  makeStickyDraggable(element, index) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    element.addEventListener("mousedown", (e) => {
      if (e.target.tagName === "TEXTAREA" || e.target.tagName === "BUTTON") {
        return;
      }

      isDragging = true;
      element.classList.add("dragging");

      initialX = e.clientX - element.offsetLeft;
      initialY = e.clientY - element.offsetTop;

      const mouseMoveHandler = (e) => {
        if (isDragging) {
          e.preventDefault();
          currentX = e.clientX - initialX;
          currentY = e.clientY - initialY;

          element.style.left = currentX + "px";
          element.style.top = currentY + "px";
        }
      };

      const mouseUpHandler = () => {
        if (isDragging) {
          isDragging = false;
          element.classList.remove("dragging");
          this.stickyNotes[index].x = parseInt(element.style.left);
          this.stickyNotes[index].y = parseInt(element.style.top);
          this.saveToStorage("stickyNotes", this.stickyNotes);
        }
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
      };

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    });
  }

  addStickyNote() {
    const colors = ["yellow", "pink", "blue", "green", "purple"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const note = {
      id: Date.now().toString(),
      content: "",
      x: window.innerWidth / 2 - 125,
      y: window.innerHeight / 2 - 100,
      width: "250px",
      height: "200px",
      color: randomColor,
      createdAt: new Date().toISOString(),
    };

    this.stickyNotes.push(note);
    this.saveToStorage("stickyNotes", this.stickyNotes);
    this.createStickyNoteElement(note, this.stickyNotes.length - 1);
  }

  changeStickyColor(index) {
    const colors = ["yellow", "pink", "blue", "green", "purple"];
    const currentColor = this.stickyNotes[index].color || "yellow";
    const currentIndex = colors.indexOf(currentColor);
    const nextColor = colors[(currentIndex + 1) % colors.length];

    this.stickyNotes[index].color = nextColor;
    this.saveToStorage("stickyNotes", this.stickyNotes);
    this.renderStickyNotes();
  }

  deleteStickyNote(index) {
    if (confirm("Delete this sticky note?")) {
      this.stickyNotes.splice(index, 1);
      this.saveToStorage("stickyNotes", this.stickyNotes);
      this.renderStickyNotes();
    }
  }

  // Event Listeners
  setupEventListeners() {
    // Night Mode Toggle
    document.getElementById("nightModeToggle").addEventListener("click", () => {
      this.toggleNightMode();
    });

    // Add Todo
    const todoInput = document.getElementById("todoInput");
    document.getElementById("addTodoBtn").addEventListener("click", () => {
      this.addTodo(todoInput.value);
      todoInput.value = "";
    });

    todoInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.addTodo(todoInput.value);
        todoInput.value = "";
      }
    });

    // Add Task List
    document.getElementById("addListBtn").addEventListener("click", () => {
      this.addTaskList();
    });
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new PortableTodo();
});
