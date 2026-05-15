const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
const requirementItems = Array.from(document.querySelectorAll("#progress-requirements .requirement-item"));
const progressMessage = document.querySelector("#progress-message");

function filterRequirements(filter) {
  let visibleCount = 0;

  requirementItems.forEach((item) => {
    const isVisible = filter === "all" || item.dataset.status === filter;
    item.hidden = !isVisible;

    if (isVisible) {
      visibleCount += 1;
    }
  });

  const label = filter === "all" ? "all watched" : filter;
  progressMessage.textContent = `Showing ${visibleCount} ${label} requirement${visibleCount === 1 ? "" : "s"}.`;
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
    filterRequirements(button.dataset.filter);
  });
});
