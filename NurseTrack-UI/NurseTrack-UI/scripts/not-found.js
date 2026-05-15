const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const backButton = document.querySelector("#go-back");
const searchInput = document.querySelector("#page-search");
const linkCards = Array.from(document.querySelectorAll(".not-found-link-card"));
const emptyState = document.querySelector("#not-found-empty");
const countBadge = document.querySelector("#not-found-count");
const message = document.querySelector("#not-found-message");

function filterLinks() {
  const query = searchInput.value.trim().toLowerCase();
  let visibleCount = 0;

  linkCards.forEach((card) => {
    const matches = !query || card.textContent.toLowerCase().includes(query) || card.dataset.page.includes(query);
    card.hidden = !matches;

    if (matches) {
      visibleCount += 1;
    }
  });

  emptyState.hidden = visibleCount > 0;
  countBadge.textContent = `${visibleCount} link${visibleCount === 1 ? "" : "s"}`;
  message.textContent = query
    ? `Showing ${visibleCount} matching page${visibleCount === 1 ? "" : "s"}.`
    : "Select a page below or return to your dashboard.";
}

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

backButton.addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  window.location.href = "student-dashboard.html";
});

searchInput.addEventListener("input", filterLinks);
