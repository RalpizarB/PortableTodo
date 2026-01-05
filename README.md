# PortableTodo 📝

A powerful, privacy-focused task management application that runs entirely in your browser. No servers, no accounts, no tracking - just your tasks, stored locally on your device.

## ✨ Features

### 📋 Task Management
- **Create, Edit, Delete**: Full CRUD operations for tasks
- **Rich Details**: Add descriptions to provide context
- **Quick Actions**: Mark tasks complete with a single click
- **Task Completion**: Visual feedback with strikethrough styling

### 🎯 Subtasks Support
- **Unlimited Subtasks**: Break down complex tasks into manageable steps
- **Progress Tracking**: Visual progress bar shows completion percentage
- **Individual Control**: Check off subtasks independently
- **Visual Hierarchy**: Clear parent-child relationship display

### 🎯 Current Task Focus
- **Focus Mode**: Set one task as your current focus
- **Dedicated Panel**: Always-visible sidebar shows active task
- **Quick Progress**: Check off subtasks without searching
- **Clear Button**: Easily clear current task when done

### 📁 Task Lists
- **Custom Lists**: Create unlimited custom task lists
- **Easy Organization**: Group tasks by project, priority, or category
- **Quick Switching**: Jump between lists with one click
- **Task Count Badges**: See how many tasks in each list
- **Safe Deletion**: Delete lists without losing tasks

### 🔄 Custom Sorting
- **Manual Order**: Drag and drop tasks to arrange them
- **Alphabetical**: Sort A-Z or Z-A by task name
- **By Date**: Order by creation date (oldest or newest first)
- **Persistent**: Your sorting choice is remembered

### 📅 Week Calendar Planner
- **Drag & Drop Planning**: Drag tasks onto calendar days
- **Duration Setting**: Set how long each task will take
- **Weekly View**: Plan your entire week at a glance
- **Flexible Scheduling**: Move tasks between days easily
- **Current Week**: Always shows the current week with dates

### 🌓 Dark Mode
- **Eye-Friendly**: Comfortable dark theme for low-light environments
- **Smooth Transitions**: Elegant theme switching animation
- **Persistent Choice**: Your preference is saved
- **Full Coverage**: Every element styled for both themes

### 💾 Local Storage
- **100% Private**: All data stays on your device
- **No Server Needed**: Works completely offline
- **Instant Access**: No loading times or network delays
- **Persistent**: Data survives browser restarts
- **Portable**: Export/import support (copy localStorage)

## 🚀 Getting Started

### Quick Start
1. Open `index.html` in any modern web browser
2. Start adding tasks!

### GitHub Pages Deployment
This application is perfect for GitHub Pages:

1. **Fork or Clone** this repository
2. **Enable GitHub Pages** in repository settings:
   - Go to Settings → Pages
   - Source: Deploy from branch
   - Branch: `main` (or your branch) / `root`
   - Click Save
3. **Access your app** at: `https://[username].github.io/PortableTodo/`

### Local Development
```bash
# Clone the repository
git clone https://github.com/RalpizarB/PortableTodo.git
cd PortableTodo

# Serve locally (Python 3)
python3 -m http.server 8000

# Or use any static file server
# Then open http://localhost:8000
```

## 📖 Usage Guide

### Managing Tasks
- **Add Task**: Click "Add Task" button, fill in name and optional description
- **Edit Task**: Click the pencil icon on any task
- **Delete Task**: Click the trash icon on any task
- **Complete Task**: Check the checkbox next to the task name

### Working with Subtasks
- **Add Subtask**: Click "Subtask" button on a task
- **Complete Subtask**: Check the subtask checkbox
- **Track Progress**: Watch the progress bar fill as you complete subtasks
- **Remove Subtask**: Click the X button next to a subtask

### Using Current Task
- **Set Current**: Click "Current" button on any task
- **View Progress**: Check the "Current Task" panel in the sidebar
- **Work Efficiently**: Complete subtasks directly from the panel
- **Clear When Done**: Click "Clear Current Task" button

### Organizing with Lists
- **Create List**: Click + button in Task Lists sidebar
- **Switch Lists**: Click on any list name
- **View All**: Click "All Tasks" to see everything
- **Delete List**: Click trash icon (tasks won't be deleted)

### Sorting Tasks
- **Change Sort**: Use the dropdown in the task area
- **Manual Order**: Drag tasks to reorder (requires "Manual Order" mode)
- **Automatic Sorting**: Choose alphabetical or date-based sorting

### Planning Your Week
- **Schedule Task**: Drag a task to a day in the Week Planner
- **Set Duration**: Enter minutes when prompted
- **Reschedule**: Drag tasks between days
- **Remove**: Click X on a scheduled task

### Switching Themes
- **Toggle Dark Mode**: Click the moon/sun icon in the navigation bar
- **Automatic Save**: Your choice is remembered for next time

## 🛠️ Technology Stack

- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with CSS variables for theming
- **JavaScript (ES6+)**: Vanilla JS with classes and modern features
- **Bootstrap 5**: UI framework (CSS only, no JS dependency)
- **Bootstrap Icons**: Icon set
- **LocalStorage API**: Client-side data persistence

## 🔒 Privacy & Security

- **No Tracking**: Zero analytics or tracking scripts
- **No Accounts**: No sign-up or personal information required
- **No Cloud**: Data never leaves your device
- **No Network**: Works 100% offline after initial load
- **Open Source**: Full transparency - review the code yourself

## 🌐 Browser Compatibility

Works on all modern browsers:
- ✅ Chrome/Edge (90+)
- ✅ Firefox (88+)
- ✅ Safari (14+)
- ✅ Opera (76+)

Requires:
- JavaScript enabled
- LocalStorage support
- Drag and Drop API support

## 📱 Mobile Support

The application is responsive and works on mobile devices, though some features (like drag and drop) work best on desktop.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Bootstrap team for the excellent CSS framework
- Bootstrap Icons for the icon set
- All contributors and users of PortableTodo

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions

---

**Made with ❤️ for productivity enthusiasts who value privacy and simplicity.**
