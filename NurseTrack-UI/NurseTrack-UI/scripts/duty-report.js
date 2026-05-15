const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const sectionFilter = document.querySelector("#section-filter");
const siteFilter = document.querySelector("#site-filter");
const statusFilter = document.querySelector("#status-filter");
const dutySearch = document.querySelector("#duty-search");
const dutyRows = Array.from(document.querySelectorAll("#duty-report-table .duty-report-row:not(.duty-report-row-head)"));
const emptyState = document.querySelector("#duty-report-empty");
const message = document.querySelector("#duty-report-message");
const exportButton = document.querySelector("#export-duty");

function filterDutyRows() {
  const section = sectionFilter.value;
  const site = siteFilter.value;
  const status = statusFilter.value;
  const query = dutySearch.value.trim().toLowerCase();
  let visibleCount = 0;

  dutyRows.forEach((row) => {
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
  message.textContent = `Showing ${visibleCount} duty record${visibleCount === 1 ? "" : "s"}.`;
}

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

[sectionFilter, siteFilter, statusFilter, dutySearch].forEach((control) => {
  control.addEventListener("input", filterDutyRows);
});

exportButton.addEventListener("click", () => {
  filterDutyRows();
  message.textContent = "Duty report export is ready.";
  message.classList.add("is-success");
});
