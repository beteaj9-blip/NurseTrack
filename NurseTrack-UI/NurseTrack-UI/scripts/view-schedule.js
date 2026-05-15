const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const viewButtons = document.querySelectorAll("[data-schedule-view]");
const calendarView = document.querySelector("#calendar-view");
const listView = document.querySelector("#list-view");

function setView(view) {
  viewButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.scheduleView === view);
  });

  calendarView.hidden = view !== "calendar";
  listView.hidden = view !== "list";
}

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

viewButtons.forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.scheduleView));
});
