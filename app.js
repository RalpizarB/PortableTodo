// PortableTodo - Local Storage Task Planner
// Refactored modular architecture

class PortableTodo {
  constructor() {
    // Load data from storage
    this.todos = this.loadFromStorage("todos") || [];
    this.taskLists = this.loadFromStorage("taskLists") || [];
    this.calendarEvents = this.loadFromStorage("calendarEvents") || [];
    this.nightMode = this.loadFromStorage("nightMode") || false;
    this.settings = this.loadFromStorage("settings") || {
      defaultTaskColor: "#3498db",
    };
    this.stickyNotes = this.loadFromStorage("stickyNotes") || [];
    this.stickiesVisible = this.loadFromStorage("stickiesVisible") || false;

    // Default color palette
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

    // Initialize managers
    this.calendarManager = new CalendarManager(this);
    this.todoManager = new TodoManager(this);
    this.taskListManager = new TaskListManager(this);
    this.settingsManager = new SettingsManager(this);
    this.stickyNotesManager = new StickyNotesManager(this);

    this.init();
  }

  init() {
    this.initializeNightMode();
    this.calendarManager.initialize();
    this.todoManager.initialize();
    this.taskListManager.initialize();
    this.settingsManager.initialize();
    this.stickyNotesManager.initialize();
    this.setupEventListeners();
    this.calendarManager.initializeDraggable();
  }

  // Storage methods (delegates to StorageManager)
  loadFromStorage(key) {
    return StorageManager.loadFromStorage(key);
  }

  saveToStorage(key, data) {
    StorageManager.saveToStorage(key, data);
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

  // Event Listeners
  setupEventListeners() {
    // Night Mode Toggle
    document.getElementById("nightModeToggle").addEventListener("click", () => {
      this.toggleNightMode();
    });

    // Setup module-specific event listeners
    this.todoManager.setupEventListeners();
    this.taskListManager.setupEventListeners();
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new PortableTodo();
});
