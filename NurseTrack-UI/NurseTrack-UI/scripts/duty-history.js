const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const statusFilter = document.querySelector("#status-filter");
const areaFilter = document.querySelector("#area-filter");
const searchRecords = document.querySelector("#search-records");
const historyRows = Array.from(document.querySelectorAll(".history-row:not(.history-row-head)"));
const emptyState = document.querySelector("#history-empty");

function filterRows() {
  const status = statusFilter.value;
  const area = areaFilter.value;
  const query = searchRecords.value.trim().toLowerCase();
  let visibleCount = 0;

  historyRows.forEach((row) => {
    const matchesStatus = status === "all" || row.dataset.status === status;
    const matchesArea = area === "all" || row.dataset.area === area;
    const matchesQuery = !query || row.textContent.toLowerCase().includes(query);
    const isVisible = matchesStatus && matchesArea && matchesQuery;

    row.hidden = !isVisible;

    if (isVisible) {
      visibleCount += 1;
    }
  });

  emptyState.hidden = visibleCount > 0;
}

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

[statusFilter, areaFilter, searchRecords].forEach((control) => {
  control.addEventListener("input", filterRows);
});
