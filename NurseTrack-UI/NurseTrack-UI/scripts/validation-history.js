const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const typeFilter = document.querySelector("#type-filter");
const statusFilter = document.querySelector("#status-filter");
const historySearch = document.querySelector("#history-search");
const historyRows = Array.from(document.querySelectorAll(".validation-history-table .history-row:not(.history-row-head)"));
const emptyState = document.querySelector("#history-empty");
const historyMessage = document.querySelector("#history-message");
const exportButton = document.querySelector("#export-history");

function updateHistory() {
  const type = typeFilter.value;
  const status = statusFilter.value;
  const query = historySearch.value.trim().toLowerCase();
  let visibleCount = 0;

  historyRows.forEach((row) => {
    const matchesType = type === "all" || row.dataset.type === type;
    const matchesStatus = status === "all" || row.dataset.status === status;
    const matchesQuery = !query || row.textContent.toLowerCase().includes(query);
    const isVisible = matchesType && matchesStatus && matchesQuery;

    row.hidden = !isVisible;

    if (isVisible) {
      visibleCount += 1;
    }
  });

  emptyState.hidden = visibleCount > 0;
  historyMessage.classList.remove("is-success", "is-error");
  historyMessage.textContent = visibleCount === historyRows.length
    ? "Showing latest validation decisions."
    : `${visibleCount} validation record${visibleCount === 1 ? "" : "s"} shown.`;
}

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

[typeFilter, statusFilter, historySearch].forEach((control) => {
  control.addEventListener("input", updateHistory);
});

exportButton.addEventListener("click", () => {
  historyMessage.textContent = "Validation log export is ready.";
  historyMessage.classList.add("is-success");
});
