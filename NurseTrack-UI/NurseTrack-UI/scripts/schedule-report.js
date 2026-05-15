const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const sectionFilter = document.querySelector("#section-filter");
const siteFilter = document.querySelector("#site-filter");
const statusFilter = document.querySelector("#status-filter");
const scheduleSearch = document.querySelector("#schedule-search");
const scheduleRows = Array.from(document.querySelectorAll("#schedule-report-table .schedule-report-row:not(.schedule-report-row-head)"));
const emptyState = document.querySelector("#schedule-report-empty");
const message = document.querySelector("#schedule-report-message");
const exportButton = document.querySelector("#export-schedule");

function filterScheduleRows() {
  const section = sectionFilter.value;
  const site = siteFilter.value;
  const status = statusFilter.value;
  const query = scheduleSearch.value.trim().toLowerCase();
  let visibleCount = 0;

  scheduleRows.forEach((row) => {
    const matchesSection = section === "all" || row.dataset.section === section;
    const matchesSite = site === "all" || row.dataset.site === site;
    const matchesStatus = status === "all" || row.dataset.status === status;
    const matchesQuery = !query || row.textContent.toLowerCase().includes(query);
    const isVisible = matchesSection && matchesSite && matchesStatus && matchesQuery;

    row.hidden = !isVisible;

    if (isVisible) {
      visibleCount += 1;
    }
  });

  emptyState.hidden = visibleCount > 0;
  message.classList.remove("is-success", "is-error");
  message.textContent = `Showing ${visibleCount} schedule record${visibleCount === 1 ? "" : "s"}.`;
}

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

[sectionFilter, siteFilter, statusFilter, scheduleSearch].forEach((control) => {
  control.addEventListener("input", filterScheduleRows);
});

exportButton?.addEventListener("click", () => {
  filterScheduleRows();
  message.textContent = "Schedule report export is ready.";
  message.classList.add("is-success");
});
