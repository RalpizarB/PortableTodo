// calendar.js - Calendar functionality

class CalendarManager {
  constructor(app) {
    this.app = app;
    this.calendar = null;
  }

  initialize() {
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
        slotDuration: "00:15:00",
        slotLabelInterval: "01:00:00",
        nowIndicator: true,
        editable: true,
        droppable: true,
        events: this.app.calendarEvents,
        drop: (info) => {
          const title = info.draggedEl.getAttribute("data-event-title");
          if (title) {
            this.addEvent(title, info.dateStr);
          }
        },
        eventClick: (info) => {
          if (confirm(`Delete event '${info.event.title}'?`)) {
            info.event.remove();
            this.removeEvent(info.event.id);
          }
        },
        eventDrop: (info) => {
          this.updateEvent(info.event);
        },
        eventResize: (info) => {
          this.updateEvent(info.event);
        },
        dateClick: (info) => {
          const title = prompt("Enter event title:");
          if (title) {
            this.addEvent(title, info.dateStr);
          }
        },
      });
      this.calendar.render();
    } catch (error) {
      console.error("Error initializing calendar:", error);
    }
  }

  initializeDraggable() {
    try {
      if (typeof FullCalendar === "undefined" || !FullCalendar.Draggable) {
        console.warn("FullCalendar Draggable not available");
        return;
      }

      const todoListEl = document.getElementById("todoList");
      new FullCalendar.Draggable(todoListEl, {
        itemSelector: ".todo-item",
        eventData: (eventEl) => {
          const title = eventEl.querySelector("span").textContent;
          return {
            title: title,
            duration: "01:00",
            backgroundColor: this.app.settings.defaultTaskColor,
            borderColor: this.app.settings.defaultTaskColor,
          };
        },
      });

      const taskListsEl = document.getElementById("taskLists");
      new FullCalendar.Draggable(taskListsEl, {
        itemSelector: ".task-item",
        eventData: (eventEl) => {
          const title = eventEl.querySelector("span").textContent;
          const taskItem = eventEl.closest(".task-list");
          const listIndex = Array.from(taskListsEl.children).indexOf(taskItem);
          const color =
            this.app.taskLists[listIndex]?.color ||
            this.app.settings.defaultTaskColor;
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

  addEvent(title, date, allDay = true, color = null) {
    const event = {
      id: Date.now().toString(),
      title: title,
      start: date,
      allDay: allDay,
      backgroundColor: color || this.app.settings.defaultTaskColor,
      borderColor: color || this.app.settings.defaultTaskColor,
    };
    this.app.calendarEvents.push(event);
    this.app.saveToStorage("calendarEvents", this.app.calendarEvents);
    if (this.calendar) {
      this.calendar.addEvent(event);
    }
  }

  updateEvent(event) {
    const index = this.app.calendarEvents.findIndex((e) => e.id === event.id);
    if (index !== -1) {
      this.app.calendarEvents[index] = {
        id: event.id,
        title: event.title,
        start: event.start.toISOString(),
        end: event.end ? event.end.toISOString() : null,
        allDay: event.allDay,
      };
      this.app.saveToStorage("calendarEvents", this.app.calendarEvents);
    }
  }

  removeEvent(eventId) {
    this.app.calendarEvents = this.app.calendarEvents.filter(
      (e) => e.id !== eventId,
    );
    this.app.saveToStorage("calendarEvents", this.app.calendarEvents);
  }
}
