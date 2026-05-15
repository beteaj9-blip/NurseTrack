const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const viewButtons = document.querySelectorAll("[data-management-view]");
const calendarHeading = document.querySelector(".calendar-month-heading");
const listFilters = document.querySelector("#list-filters");
const calendarView = document.querySelector("#calendar-view");
const listView = document.querySelector("#list-view");
const scheduleSearch = document.querySelector("#schedule-search");
const scheduleRows = Array.from(document.querySelectorAll(".management-row"));
const calendarDays = Array.from(document.querySelectorAll(".management-day[data-area]"));
const emptyState = document.querySelector("#schedule-empty");

function setView(view) {
  viewButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.managementView === view);
  });

  calendarView.hidden = view !== "calendar";
  if (calendarHeading) {
    calendarHeading.hidden = view !== "calendar";
  }
  if (listFilters) {
    listFilters.hidden = view !== "list";
  }
  listView.hidden = view !== "list";
  filterSchedules();
}

function filterItems(items) {
  const query = scheduleSearch?.value.trim().toLowerCase() || "";
  let visibleCount = 0;

  items.forEach((item) => {
    const matchesQuery = !query || item.textContent.toLowerCase().includes(query);
    const isVisible = matchesQuery;

    item.hidden = !isVisible;

    if (isVisible) {
      visibleCount += 1;
    }
  });

  return visibleCount;
}

function filterSchedules() {
  const visibleCount = listView.hidden ? calendarDays.length : filterItems(scheduleRows);
  emptyState.hidden = visibleCount > 0;
}

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

viewButtons.forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.managementView));
});

[scheduleSearch].filter(Boolean).forEach((control) => {
  control.addEventListener("input", filterSchedules);
});

filterSchedules();
