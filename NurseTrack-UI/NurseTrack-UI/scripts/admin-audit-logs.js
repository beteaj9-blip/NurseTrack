const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const rangeButtons = Array.from(document.querySelectorAll("[data-audit-range]"));
const auditSearch = document.querySelector("#audit-search");
const auditRows = Array.from(document.querySelectorAll("#audit-log-list .user-row:not(.user-row-head)"));
const auditVisibleCount = document.querySelector("#audit-visible-count");
const auditEmpty = document.querySelector("#audit-empty");
const auditSyncPill = document.querySelector("#audit-sync-pill");

let activeRange = "this";

function filterAuditLogs() {
  const query = auditSearch?.value.trim().toLowerCase() || "";
  const hasSearch = query.length > 0;
  let visible = 0;

  auditRows.forEach((row) => {
    const matchesRange = row.dataset.week === activeRange;
    const matchesQuery = row.textContent.toLowerCase().includes(query);
    const shouldShow = hasSearch ? matchesQuery : matchesRange;

    row.hidden = !shouldShow;

    if (shouldShow) {
      visible += 1;
    }
  });

  if (auditVisibleCount) {
    const label = hasSearch ? "search results" : activeRange === "last" ? "last week" : "this week";
    auditVisibleCount.textContent = `${visible} ${label}`;
  }

  if (auditEmpty) {
    auditEmpty.hidden = visible > 0;
  }

  if (auditSyncPill) {
    auditSyncPill.textContent = hasSearch ? `${visible} matching logs` : activeRange === "last" ? "Last week shown" : "This week shown";
  }
}

rangeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeRange = button.dataset.auditRange || "this";

    rangeButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    filterAuditLogs();
  });
});

auditSearch?.addEventListener("input", filterAuditLogs);

menuButton?.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop?.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

filterAuditLogs();
