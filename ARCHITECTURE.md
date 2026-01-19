# PortableTodo Architecture

## Overview

PortableTodo uses a modular architecture with separate JavaScript files and global classes to separate concerns and maintain clean, maintainable code. This approach works with `file://` protocol without requiring a server.

## File Structure

```
PortableTodo/
├── index.html              # Main HTML structure
├── app.js                  # Main application entry point
├── styles.css              # All styling (light/dark themes)
├── js/                     # Modular JavaScript files
│   ├── storage.js          # LocalStorage utilities
│   ├── calendar.js         # Calendar functionality
│   ├── todos.js            # Quick todos management
│   ├── taskLists.js        # Task lists management
│   ├── settings.js         # Settings modal
│   └── stickyNotes.js      # Sticky notes functionality
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Pages deployment
├── README.md               # User documentation
├── AI_README.md            # AI developer guidelines
├── ARCHITECTURE.md         # This file
└── LICENSE
```

## Module Responsibilities

### app.js (Main Entry Point)
**Loaded last** - Depends on all other modules being loaded first
- Initializes all managers
- Manages application state (todos, taskLists, calendarEvents, settings, stickyNotes)
- Coordinates between modules
- Handles night mode toggle
- Sets up global event listeners

### js/storage.js (StorageManager)
**Responsibility:** LocalStorage operations
- `loadFromStorage(key)` - Retrieve data from localStorage
- `saveToStorage(key, data)` - Save data to localStorage
- `removeFromStorage(key)` - Remove data from localStorage
- `clearStorage()` - Clear all localStorage

### js/calendar.js (CalendarManager)
**Responsibility:** FullCalendar integration and event management
- `initialize()` - Setup FullCalendar with views and configuration
- `initializeDraggable()` - Enable drag-and-drop from todos/tasks
- `addEvent(title, date, allDay, color)` - Add calendar event
- `updateEvent(event)` - Update existing event
- `removeEvent(eventId)` - Delete event

**Configuration:**
- Default view: Week (timeGridWeek)
- Views: Month, Week, Work Week, 3-Day, Day
- 15-minute time slots
- Current time indicator
- Drag-and-drop enabled

### js/todos.js (TodoManager)
**Responsibility:** Quick todos functionality
- `initialize()` - Initial render
- `render()` - Render all todos to DOM
- `add(text)` - Create new todo
- `toggle(index)` - Mark todo complete/incomplete
- `delete(index)` - Remove todo
- `setupEventListeners()` - Wire up input and buttons

**Features:**
- Checkbox completion
- Double-click to add to calendar
- Delete button

### js/taskLists.js (TaskListManager)
**Responsibility:** Task list and task management
- `initialize()` - Initial render
- `render()` - Render all task lists to DOM
- `add()` - Create new task list
- `updateName(listIndex, newName)` - Rename list
- `changeColor(listIndex)` - Update list color
- `deleteList(listIndex)` - Remove entire list
- `addTask(listIndex, text)` - Add task to list
- `toggleTask(listIndex, taskIndex)` - Mark task complete/incomplete
- `deleteTask(listIndex, taskIndex)` - Remove task
- `setupEventListeners()` - Wire up add list button

**Features:**
- Color-coded lists with auto-assigned colors
- Editable list names
- Task completion tracking
- Double-click task to add to calendar with list color

### js/settings.js (SettingsManager)
**Responsibility:** Settings modal and configuration
- `initialize()` - Setup modal and event listeners
- `renderTaskListColorSettings()` - Dynamic color pickers for each list

**Settings:**
- Default task color (applies to quick todos and calendar events)
- Individual task list colors

### js/stickyNotes.js (StickyNotesManager)
**Responsibility:** Sticky notes functionality
- `initialize()` - Setup toggle and render notes
- `render()` - Render all sticky notes
- `createNoteElement(note, index)` - Create single sticky note DOM element
- `makeDraggable(element, index)` - Enable drag functionality
- `add()` - Create new sticky note
- `changeColor(index)` - Cycle through colors
- `delete(index)` - Remove sticky note

**Features:**
- Draggable anywhere on screen
- Resizable (browser native)
- Color variants: yellow, pink, blue, green, purple
- Toggle visibility
- Auto-save position, size, content, and color

## Data Flow

### Initialization
1. Browser loads all module scripts in order (storage, calendar, todos, taskLists, settings, stickyNotes)
2. Browser loads `app.js` which has access to all global classes
3. `app.js` loads data from localStorage via `StorageManager`
4. Creates manager instances (Calendar, Todo, TaskList, Settings, StickyNotes)
5. Each manager initializes and renders its UI
6. Event listeners are attached

### User Actions
1. User interacts with UI (e.g., adds todo)
2. Manager handles action (e.g., `TodoManager.add()`)
3. Manager updates app state (e.g., `this.app.todos.push()`)
4. Manager saves to storage (e.g., `this.app.saveToStorage()`)
5. Manager re-renders UI (e.g., `this.render()`)

### Cross-Module Communication
Modules communicate through the main app instance:
```javascript
// Example: Adding todo to calendar
this.app.calendarManager.addEvent(
  todoText, 
  date, 
  true, 
  this.app.settings.defaultTaskColor
);
```

## State Management

### Application State (stored in app.js)
- `todos[]` - Quick todo items
- `taskLists[]` - Task lists with nested tasks
- `calendarEvents[]` - Calendar events
- `settings{}` - User preferences
- `stickyNotes[]` - Sticky note data
- `stickiesVisible` - Sticky notes toggle state
- `nightMode` - Theme preference

### Data Persistence
All state is persisted to localStorage using keys:
- `"todos"`
- `"taskLists"`
- `"calendarEvents"`
- `"settings"`
- `"stickyNotes"`
- `"stickiesVisible"`
- `"nightMode"`

## Design Patterns

### Dependency Injection
Managers receive the main app instance in their constructor:
```javascript
constructor(app) {
  this.app = app;
}
```

### Module Pattern
Each manager is a class that encapsulates its functionality and exposes a clean API.

### Observer Pattern
Event listeners notify managers of user actions, which then update state and re-render.

## Benefits of This Architecture

1. **Separation of Concerns** - Each module has a single responsibility
2. **Maintainability** - Easy to locate and modify specific features
3. **Testability** - Modules can be tested independently
4. **Scalability** - New features can be added as new modules
5. **Readability** - Code is organized logically by feature
6. **Reusability** - Managers can be reused or extended

## Development Guidelines

### Adding a New Feature
1. Create new module file in `js/` directory
2. Define a class with constructor receiving `app` instance (no export needed)
3. Implement `initialize()` method
4. Add `<script src="js/yourModule.js"></script>` to `index.html` (before app.js)
5. Instantiate in `app.js` constructor
6. Call `initialize()` in `app.init()`

### Modifying Existing Feature
1. Locate the responsible manager in `js/` directory
2. Modify the specific method
3. Ensure state updates are saved via `this.app.saveToStorage()`
4. Update UI with `this.render()` or similar

### Cross-Feature Integration
Access other managers through `this.app`:
```javascript
this.app.calendarManager.addEvent(...)
this.app.todoManager.render()
this.app.settings.defaultTaskColor
```

## Technology Stack

- **Frontend:** Vanilla JavaScript (ES6 classes, global namespace)
- **Calendar:** FullCalendar v6.1.20
- **Storage:** Browser localStorage API
- **Styling:** CSS with CSS variables for theming
- **Deployment:** GitHub Actions → GitHub Pages
- **Module System:** Script loading order (no bundler required)

## Browser Compatibility

Requires modern browser with support for:
- ES6 classes
- localStorage
- ResizeObserver (for sticky notes)
- FullCalendar dependencies

## Script Loading Order

Scripts must be loaded in this order in `index.html`:
1. `js/storage.js` - No dependencies
2. `js/calendar.js` - No dependencies
3. `js/todos.js` - No dependencies
4. `js/taskLists.js` - No dependencies
5. `js/settings.js` - No dependencies
6. `js/stickyNotes.js` - No dependencies
7. `app.js` - Depends on all above classes being defined