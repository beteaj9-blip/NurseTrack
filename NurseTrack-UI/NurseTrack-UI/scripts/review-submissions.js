const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const typeFilter = document.querySelector("#type-filter");
const statusFilter = document.querySelector("#status-filter");
const submissionSearch = document.querySelector("#submission-search");
const submissionItems = Array.from(document.querySelectorAll(".submission-item"));
const emptyState = document.querySelector("#submission-empty");

function filterSubmissions() {
  const type = typeFilter.value;
  const status = statusFilter.value;
  const query = submissionSearch.value.trim().toLowerCase();
  let visibleCount = 0;

  submissionItems.forEach((item) => {
    const matchesType = type === "all" || item.dataset.type === type;
    const matchesStatus = status === "all" || item.dataset.status === status;
    const matchesQuery = !query || item.textContent.toLowerCase().includes(query);
    const isVisible = matchesType && matchesStatus && matchesQuery;

    item.hidden = !isVisible;

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

[typeFilter, statusFilter, submissionSearch].forEach((control) => {
  control.addEventListener("input", filterSubmissions);
});
