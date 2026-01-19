# PortableTodo

A static task organizing application that works only on your local side, no server needed.

## Features

- 📝 **Quick Todos**: Add, complete, and delete quick todo items
- 📋 **Task Lists**: Create multiple organized task lists with individual tasks
- 📅 **Calendar**: FullCalendar integration with drag and drop support for events
- 🌙 **Night Mode**: Toggle between light and dark themes
- 💾 **Local Storage**: All data persists in browser storage
- ⚡ **Fast & Easy**: Clean, intuitive interface focused on speed and ease of use
- 📱 **Responsive**: Works on desktop and mobile devices

## Usage

Simply open `index.html` in your browser or visit the GitHub Pages deployment.

**Note:** The app works directly with the `file://` protocol - no server required for local development!

### Quick Todos
- Type your todo in the input field and click "Add" or press Enter
- Check the checkbox to mark as complete
- Click the trash icon to delete
- Double-click a todo to add it to the calendar

### Task Lists
- Click the ➕ button to create a new task list
- Type a name for your list
- Add tasks to your list using the input field
- Check/uncheck tasks as you complete them
- Click the trash icon on a list to delete it
- Double-click a task to add it to the calendar

### Calendar
- Click any date to add an event
- Drag and drop events to reschedule
- Click an event to delete it
- Resize events to change duration

### Night Mode
- Click the 🌙 button in the header to toggle night mode
- Your preference is saved and persists across sessions

## Technology

- Pure HTML, CSS, and JavaScript (ES6 classes, modular architecture)
- [FullCalendar Scheduler](https://fullcalendar.io/) for calendar functionality
- LocalStorage API for data persistence
- No backend or build process required
- Modular code structure (see `ARCHITECTURE.md`)

## Deployment

This application is designed for GitHub Pages and can be deployed by simply pushing to your repository's `gh-pages` branch or configuring GitHub Pages in your repository settings.
