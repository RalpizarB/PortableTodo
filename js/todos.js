// todos.js - Todo management functionality

class TodoManager {
  constructor(app) {
    this.app = app;
  }

  initialize() {
    this.render();
  }

  render() {
    const todoList = document.getElementById("todoList");
    todoList.innerHTML = "";

    this.app.todos.forEach((todo, index) => {
      const li = document.createElement("li");
      li.className = `todo-item ${todo.completed ? "completed" : ""}`;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = todo.completed;
      checkbox.addEventListener("change", () => this.toggle(index));

      const span = document.createElement("span");
      span.textContent = todo.text;

      span.addEventListener("dblclick", () => {
        const newDate = prompt("Add to calendar? Enter date (YYYY-MM-DD):");
        if (newDate) {
          this.app.calendarManager.addEvent(
            todo.text,
            newDate,
            true,
            this.app.settings.defaultTaskColor,
          );
        }
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️";
      deleteBtn.title = "Delete todo";
      deleteBtn.addEventListener("click", () => this.delete(index));

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(deleteBtn);
      todoList.appendChild(li);
    });
  }

  add(text) {
    if (text.trim()) {
      this.app.todos.push({
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      });
      this.app.saveToStorage("todos", this.app.todos);
      this.render();
    }
  }

  toggle(index) {
    this.app.todos[index].completed = !this.app.todos[index].completed;
    this.app.saveToStorage("todos", this.app.todos);
    this.render();
  }

  delete(index) {
    this.app.todos.splice(index, 1);
    this.app.saveToStorage("todos", this.app.todos);
    this.render();
  }

  setupEventListeners() {
    const todoInput = document.getElementById("todoInput");
    const addTodoBtn = document.getElementById("addTodoBtn");

    addTodoBtn.addEventListener("click", () => {
      this.add(todoInput.value);
      todoInput.value = "";
    });

    todoInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.add(todoInput.value);
        todoInput.value = "";
      }
    });
  }
}
