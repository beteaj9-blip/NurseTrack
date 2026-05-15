const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const typeFilter = document.querySelector("#type-filter");
const statusFilter = document.querySelector("#status-filter");
const notificationSearch = document.querySelector("#notification-search");
const notificationCards = Array.from(document.querySelectorAll("#notification-list .notification-card"));
const emptyState = document.querySelector("#notification-empty");
const message = document.querySelector("#notification-message");
const markAllRead = document.querySelector("#mark-all-read");
const unreadCount = document.querySelector("#unread-count");
const quickTypeButtons = Array.from(document.querySelectorAll("[data-quick-type]"));

function updateUnreadCount() {
  const count = notificationCards.filter((card) => card.dataset.status === "unread").length;
  unreadCount.textContent = count;
  document.querySelector(".sync-pill").textContent = `${count} unread`;
}

function filterNotifications() {
  const type = typeFilter.value;
  const status = statusFilter.value;
  const query = notificationSearch.value.trim().toLowerCase();
  let visibleCount = 0;

  notificationCards.forEach((card) => {
    const matchesType = type === "all" || card.dataset.type === type;
    const matchesStatus = status === "all" || card.dataset.status === status;
    const matchesQuery = !query || card.textContent.toLowerCase().includes(query);
    const isVisible = matchesType && matchesStatus && matchesQuery;

    card.hidden = !isVisible;

    if (isVisible) {
      visibleCount += 1;
    }
  });

  emptyState.hidden = visibleCount > 0;
  message.classList.remove("is-error", "is-success");
  message.textContent = `Showing ${visibleCount} notification${visibleCount === 1 ? "" : "s"}.`;
}

function setCardRead(card) {
  card.dataset.status = "read";
  card.classList.remove("is-unread");
}

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

[typeFilter, statusFilter, notificationSearch].forEach((control) => {
  control.addEventListener("input", filterNotifications);
});

document.querySelectorAll(".mark-read-button").forEach((button) => {
  button.addEventListener("click", () => {
    setCardRead(button.closest(".notification-card"));
    updateUnreadCount();
    filterNotifications();
    message.textContent = "Notification marked as read.";
    message.classList.add("is-success");
  });
});

markAllRead.addEventListener("click", () => {
  notificationCards.forEach(setCardRead);
  updateUnreadCount();
  filterNotifications();
  message.textContent = "All notifications marked as read.";
  message.classList.add("is-success");
});

document.querySelector("#refresh-notifications").addEventListener("click", () => {
  filterNotifications();
  message.textContent = "Notifications updated.";
  message.classList.add("is-success");
});

quickTypeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    quickTypeButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    typeFilter.value = button.dataset.quickType;
    filterNotifications();
  });
});

updateUnreadCount();
