// settings.js - Settings modal functionality

class SettingsManager {
  constructor(app) {
    this.app = app;
  }

  initialize() {
    const modal = document.getElementById("settingsModal");
    const settingsBtn = document.getElementById("settingsBtn");
    const closeModal = document.getElementById("closeModal");
    const saveSettings = document.getElementById("saveSettings");
    const defaultColorInput = document.getElementById("defaultTaskColor");

    // Load current settings
    defaultColorInput.value = this.app.settings.defaultTaskColor;

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
      this.app.settings.defaultTaskColor = defaultColorInput.value;
      this.app.saveToStorage("settings", this.app.settings);
      modal.classList.remove("active");
      this.app.taskListManager.render();
      this.app.calendarManager.initializeDraggable();
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

    this.app.taskLists.forEach((list, index) => {
      const item = document.createElement("div");
      item.className = "task-list-color-item";

      const colorInput = document.createElement("input");
      colorInput.type = "color";
      colorInput.value = list.color || this.app.settings.defaultTaskColor;
      colorInput.addEventListener("change", (e) => {
        this.app.taskLists[index].color = e.target.value;
        this.app.saveToStorage("taskLists", this.app.taskLists);
      });

      const label = document.createElement("label");
      label.textContent = list.name;

      item.appendChild(colorInput);
      item.appendChild(label);
      container.appendChild(item);
    });
  }
}
