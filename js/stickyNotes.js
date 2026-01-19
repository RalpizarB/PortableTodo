// stickyNotes.js - Sticky notes functionality

class StickyNotesManager {
  constructor(app) {
    this.app = app;
  }

  initialize() {
    const container = document.getElementById("stickiesContainer");
    const toggleBtn = document.getElementById("toggleStickiesBtn");
    const addBtn = document.getElementById("addStickyBtn");

    // Set initial visibility
    if (this.app.stickiesVisible) {
      container.classList.add("active");
      addBtn.classList.add("active");
    }

    // Render existing notes
    this.render();

    // Toggle stickies visibility
    toggleBtn.addEventListener("click", () => {
      this.app.stickiesVisible = !this.app.stickiesVisible;
      this.app.saveToStorage("stickiesVisible", this.app.stickiesVisible);
      container.classList.toggle("active");
      addBtn.classList.toggle("active");
    });

    // Add new sticky note
    addBtn.addEventListener("click", () => {
      this.add();
    });
  }

  render() {
    const container = document.getElementById("stickiesContainer");
    container.innerHTML = "";

    this.app.stickyNotes.forEach((note, index) => {
      this.createNoteElement(note, index);
    });
  }

  createNoteElement(note, index) {
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
      this.changeColor(index);
    });

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "×";
    deleteBtn.title = "Delete";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.delete(index);
    });

    header.appendChild(colorBtn);
    header.appendChild(deleteBtn);

    // Content textarea
    const textarea = document.createElement("textarea");
    textarea.className = "sticky-note-content";
    textarea.placeholder = "Write your note...";
    textarea.value = note.content || "";
    textarea.addEventListener("input", (e) => {
      this.app.stickyNotes[index].content = e.target.value;
      this.app.saveToStorage("stickyNotes", this.app.stickyNotes);
    });
    textarea.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });

    stickyDiv.appendChild(header);
    stickyDiv.appendChild(textarea);

    // Make draggable
    this.makeDraggable(stickyDiv, index);

    // Track resize
    const resizeObserver = new ResizeObserver(() => {
      this.app.stickyNotes[index].width = stickyDiv.style.width;
      this.app.stickyNotes[index].height = stickyDiv.style.height;
      this.app.saveToStorage("stickyNotes", this.app.stickyNotes);
    });
    resizeObserver.observe(stickyDiv);

    container.appendChild(stickyDiv);
  }

  makeDraggable(element, index) {
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
          this.app.stickyNotes[index].x = parseInt(element.style.left);
          this.app.stickyNotes[index].y = parseInt(element.style.top);
          this.app.saveToStorage("stickyNotes", this.app.stickyNotes);
        }
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
      };

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    });
  }

  add() {
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

    this.app.stickyNotes.push(note);
    this.app.saveToStorage("stickyNotes", this.app.stickyNotes);
    this.createNoteElement(note, this.app.stickyNotes.length - 1);
  }

  changeColor(index) {
    const colors = ["yellow", "pink", "blue", "green", "purple"];
    const currentColor = this.app.stickyNotes[index].color || "yellow";
    const currentIndex = colors.indexOf(currentColor);
    const nextColor = colors[(currentIndex + 1) % colors.length];

    this.app.stickyNotes[index].color = nextColor;
    this.app.saveToStorage("stickyNotes", this.app.stickyNotes);
    this.render();
  }

  delete(index) {
    if (confirm("Delete this sticky note?")) {
      this.app.stickyNotes.splice(index, 1);
      this.app.saveToStorage("stickyNotes", this.app.stickyNotes);
      this.render();
    }
  }
}
