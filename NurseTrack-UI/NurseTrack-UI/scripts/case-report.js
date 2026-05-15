const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const sectionFilter = document.querySelector("#section-filter");
const categoryFilter = document.querySelector("#category-filter");
const statusFilter = document.querySelector("#status-filter");
const caseSearch = document.querySelector("#case-search");
const caseRows = Array.from(document.querySelectorAll("#case-report-table .case-report-row:not(.case-report-row-head)"));
const emptyState = document.querySelector("#case-report-empty");
const message = document.querySelector("#case-report-message");
const exportButton = document.querySelector("#export-case");

function filterCaseRows() {
  const section = sectionFilter.value;
  const category = categoryFilter.value;
  const status = statusFilter.value;
  const query = caseSearch.value.trim().toLowerCase();
  let visibleCount = 0;

  caseRows.forEach((row) => {
    const matchesSection = section === "all" || row.dataset.section === section;
    const matchesCategory = category === "all" || row.dataset.category === category;
    const matchesStatus = status === "all" || row.dataset.status === status;
    const matchesQuery = !query || row.textContent.toLowerCase().includes(query);
    const isVisible = matchesSection && matchesCategory && matchesStatus && matchesQuery;

    row.hidden = !isVisible;

    if (isVisible) {
      visibleCount += 1;
    }
  });

  emptyState.hidden = visibleCount > 0;
  message.classList.remove("is-success", "is-error");
  message.textContent = `Showing ${visibleCount} case record${visibleCount === 1 ? "" : "s"}.`;
}

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

[sectionFilter, categoryFilter, statusFilter, caseSearch].forEach((control) => {
  control.addEventListener("input", filterCaseRows);
});

exportButton.addEventListener("click", () => {
  filterCaseRows();
  message.textContent = "Case report export is ready.";
  message.classList.add("is-success");
});
