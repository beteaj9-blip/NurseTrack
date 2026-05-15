const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const severityFilter = document.querySelector("#severity-filter");
const statusFilter = document.querySelector("#alert-status-filter");
const alertSearch = document.querySelector("#alert-search");
const alertCards = Array.from(document.querySelectorAll("#alert-list .alert-card"));
const emptyState = document.querySelector("#alert-empty");
const message = document.querySelector("#alert-message");
const activeCount = document.querySelector("#active-alert-count");
const acknowledgeAll = document.querySelector("#acknowledge-all");

function updateActiveCount() {
  const count = alertCards.filter((card) => card.dataset.status === "active").length;
  activeCount.textContent = count;
  document.querySelector(".sync-pill").textContent = `${count} active`;
}

function filterAlerts() {
  const severity = severityFilter.value;
  const status = statusFilter.value;
  const query = alertSearch.value.trim().toLowerCase();
  let visibleCount = 0;

  alertCards.forEach((card) => {
    const matchesSeverity = severity === "all" || card.dataset.severity === severity;
    const matchesStatus = status === "all" || card.dataset.status === status;
    const matchesQuery = !query || card.textContent.toLowerCase().includes(query);
    const isVisible = matchesSeverity && matchesStatus && matchesQuery;

    card.hidden = !isVisible;

    if (isVisible) {
      visibleCount += 1;
    }
  });

  emptyState.hidden = visibleCount > 0;
  message.classList.remove("is-success", "is-error");
  message.textContent = `Showing ${visibleCount} alert${visibleCount === 1 ? "" : "s"}.`;
}

function acknowledgeAlert(card) {
  card.dataset.status = "acknowledged";
  card.classList.add("is-acknowledged");
  const badge = card.querySelector(".status-badge");
  const button = card.querySelector(".acknowledge-button");

  badge.textContent = "Acknowledged";
  badge.classList.remove("status-rejected", "status-pending");
  badge.classList.add("status-verified");
  button.textContent = "Acknowledged";
}

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

[severityFilter, statusFilter, alertSearch].forEach((control) => {
  control.addEventListener("input", filterAlerts);
});

document.querySelectorAll(".acknowledge-button").forEach((button) => {
  button.addEventListener("click", () => {
    acknowledgeAlert(button.closest(".alert-card"));
    updateActiveCount();
    filterAlerts();
    message.textContent = "Alert acknowledged.";
    message.classList.add("is-success");
  });
});

acknowledgeAll.addEventListener("click", () => {
  alertCards.forEach(acknowledgeAlert);
  updateActiveCount();
  filterAlerts();
  message.textContent = "All alerts acknowledged.";
  message.classList.add("is-success");
});

document.querySelector("#refresh-alerts").addEventListener("click", () => {
  filterAlerts();
  message.textContent = "Alerts updated.";
  message.classList.add("is-success");
});

updateActiveCount();
