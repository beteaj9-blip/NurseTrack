const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const filterButtons = Array.from(document.querySelectorAll("[data-status-filter]"));
const completionRows = Array.from(document.querySelectorAll("#completion-table .completion-row:not(.completion-row-head)"));
const completionMessage = document.querySelector("#completion-message");

function filterCompletionRows(filter) {
  let visibleCount = 0;

  completionRows.forEach((row) => {
    const isVisible = filter === "all" || row.dataset.status === filter;
    row.hidden = !isVisible;

    if (isVisible) {
      visibleCount += 1;
    }
  });

  const label = filter === "all" ? "completion" : filter;
  completionMessage.textContent = `Showing ${visibleCount} ${label} requirement${visibleCount === 1 ? "" : "s"}.`;
}

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    filterCompletionRows(button.dataset.statusFilter);
  });
});
