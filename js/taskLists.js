// taskLists.js - Task list management functionality

class TaskListManager {
  constructor(app) {
    this.app = app;
  }

  initialize() {
    this.render();
  }

  render() {
    const taskListsContainer = document.getElementById("taskLists");
    taskListsContainer.innerHTML = "";

    this.app.taskLists.forEach((list, listIndex) => {
      const listDiv = document.createElement("div");
      listDiv.className = "task-list";

      const header = document.createElement("div");
      header.className = "task-list-header";

      const title = document.createElement("div");
      title.className = "task-list-title";
      title.textContent = list.name;
      title.style.borderLeft = `4px solid ${list.color || this.app.settings.defaultTaskColor}`;
      title.style.paddingLeft = "0.5rem";
      title.contentEditable = true;
      title.addEventListener("blur", (e) => {
        this.updateName(listIndex, e.target.textContent);
      });

      const controls = document.createElement("div");
      controls.className = "task-list-controls";

      const colorBtn = document.createElement("button");
      colorBtn.textContent = "🎨";
      colorBtn.title = "Change color";
      colorBtn.addEventListener("click", () => this.changeColor(listIndex));

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️";
      deleteBtn.title = "Delete list";
      deleteBtn.addEventListener("click", () => this.deleteList(listIndex));

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

      if (!list.tasks) {
        list.tasks = [];
        this.app.saveToStorage("taskLists", this.app.taskLists);
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
            const color = list.color || this.app.settings.defaultTaskColor;
            this.app.calendarManager.addEvent(task.text, newDate, true, color);
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

  add() {
    const name = prompt("Enter list name:");
    if (name && name.trim()) {
      const colorIndex =
        this.app.taskLists.length % this.app.defaultColors.length;
      this.app.taskLists.push({
        name: name.trim(),
        tasks: [],
        color: this.app.defaultColors[colorIndex],
        createdAt: new Date().toISOString(),
      });
      this.app.saveToStorage("taskLists", this.app.taskLists);
      this.render();
    }
  }

  updateName(listIndex, newName) {
    if (newName && newName.trim()) {
      this.app.taskLists[listIndex].name = newName.trim();
      this.app.saveToStorage("taskLists", this.app.taskLists);
    } else {
      this.render();
    }
  }

  changeColor(listIndex) {
    const currentColor =
      this.app.taskLists[listIndex].color || this.app.settings.defaultTaskColor;
    const newColor = prompt("Enter a hex color (e.g., #3498db):", currentColor);
    if (newColor && /^#[0-9A-F]{6}$/i.test(newColor)) {
      this.app.taskLists[listIndex].color = newColor;
      this.app.saveToStorage("taskLists", this.app.taskLists);
      this.render();
    } else if (newColor) {
      alert("Invalid color format. Please use hex format like #3498db");
    }
  }

  deleteList(listIndex) {
    if (confirm("Delete this entire list?")) {
      this.app.taskLists.splice(listIndex, 1);
      this.app.saveToStorage("taskLists", this.app.taskLists);
      this.render();
    }
  }

  addTask(listIndex, text) {
    if (text && text.trim()) {
      this.app.taskLists[listIndex].tasks.push({
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      });
      this.app.saveToStorage("taskLists", this.app.taskLists);
      this.render();
    }
  }

  toggleTask(listIndex, taskIndex) {
    this.app.taskLists[listIndex].tasks[taskIndex].completed =
      !this.app.taskLists[listIndex].tasks[taskIndex].completed;
    this.app.saveToStorage("taskLists", this.app.taskLists);
    this.render();
  }

  deleteTask(listIndex, taskIndex) {
    this.app.taskLists[listIndex].tasks.splice(taskIndex, 1);
    this.app.saveToStorage("taskLists", this.app.taskLists);
    this.render();
  }

  setupEventListeners() {
    document.getElementById("addListBtn").addEventListener("click", () => {
      this.add();
    });
  }
}
