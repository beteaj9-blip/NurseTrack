(function () {
  if (document.querySelector("[data-global-back-button]")) {
    return;
  }

  const topbar = document.querySelector(".topbar");
  const topbarTitle = topbar?.querySelector(".topbar-title");

  if (!topbar) {
    return;
  }

  function currentFileName() {
    return window.location.pathname.split("/").pop().toLowerCase();
  }

  function normalizedFileName(value) {
    const cleanValue = String(value || "").split("?")[0].split("#")[0];
    return cleanValue.split("/").pop().toLowerCase();
  }

  function currentPathKey() {
    const parts = window.location.pathname
      .replace(/\\/g, "/")
      .split("/")
      .filter(Boolean)
      .map((part) => part.toLowerCase());
    const file = parts.pop() || "";
    const folder = parts.pop() || "";

    return folder ? `${folder}/${file}` : file;
  }

  function activeParentLink() {
    const activeLink = document.querySelector(".sidebar-nav .nav-link.is-active");

    if (!activeLink) {
      return null;
    }

    const href = activeLink.getAttribute("href") || "";

    if (!href || normalizedFileName(href) === currentFileName()) {
      return null;
    }

    return activeLink;
  }

  function mappedBackDestination() {
    const query = new URLSearchParams(window.location.search);
    const key = currentPathKey();

    if (query.has("student") && query.has("history")) {
      if (key === "admin-manager/student-appeals.html" || key === "clinical-instructor/student-appeals.html") {
        return `student-appeals.html?student=${encodeURIComponent(query.get("student"))}`;
      }
    }

    if (query.has("student")) {
      if (key === "admin-manager/student-appeals.html" || key === "clinical-instructor/student-appeals.html") {
        return "student-appeals.html";
      }
    }

    if (query.has("record")) {
      if (key === "admin-manager/manual-attendance-review.html") {
        const ci = query.get("ci");
        return ci ? `manual-attendance-review.html?ci=${encodeURIComponent(ci)}` : "manual-attendance-review.html";
      }

      if (key === "clinical-instructor/manual-attendance.html") {
        return "manual-attendance.html";
      }
    }

    if (query.has("ci") && key === "admin-manager/manual-attendance-review.html") {
      return "manual-attendance-review.html";
    }

    if (query.has("appeal") && key === "nursing-student/student-appeals.html") {
      return "student-appeals.html";
    }

    const destinations = {
      "admin-manager/case-validation.html": "clinical-case-selection.html",
      "admin-manager/student-progress-detail.html": "chair-student-progress.html",
      "clinical-instructor/case-validation.html": "clinical-case-selection.html",
      "clinical-instructor/student-progress-detail.html": "instructor-student-view.html",
      "nursing-student/case-detail.html": "case-history.html",
      "nursing-student/duty-detail.html": "duty-history.html",
      "nursing-student/schedule-details.html": "view-schedule.html",
      "nursing-student/student-pending-items.html": "student-progress.html"
    };

    return destinations[currentPathKey()] || "";
  }

  const mappedDestination = mappedBackDestination();
  const parentLink = activeParentLink();

  if (!mappedDestination && !parentLink) {
    return;
  }

  const style = document.createElement("style");
  style.textContent = `
    .global-back-button {
      min-width: 46px;
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: 1px solid rgba(138, 37, 44, 0.22);
      border-radius: 8px;
      background: #ffffff;
      color: #14213d;
      box-shadow: none;
      cursor: pointer;
      font: 800 0.92rem/1 "Kumbh Sans", "Segoe UI", Arial, sans-serif;
      letter-spacing: 0;
      padding: 11px 15px;
      transition: transform 160ms ease, border-color 160ms ease, background 160ms ease, color 160ms ease;
    }

    .global-back-button:hover {
      border-color: #8A252C;
      background: #8A252C;
      color: #ffffff;
      transform: translateY(-1px);
    }

    .global-back-button:focus-visible {
      outline: 3px solid rgba(255, 207, 1, 0.5);
      outline-offset: 3px;
    }

    .global-back-button svg {
      width: 18px;
      height: 18px;
      flex: 0 0 18px;
      stroke: currentColor;
      stroke-width: 2.4;
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    body.modal-open .global-back-button {
      display: none;
    }

    .topbar.has-global-back {
      column-gap: 12px;
    }

    @media (max-width: 560px) {
      .global-back-button {
        width: 44px;
        min-height: 42px;
        padding: 10px;
      }

      .global-back-button span {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
      }
    }
  `;

  document.head.appendChild(style);

  function fallbackUrl() {
    const path = window.location.pathname.replace(/\\/g, "/").toLowerCase();

    if (path.includes("/nursing-student/")) {
      return "student-dashboard.html";
    }

    if (path.includes("/clinical-instructor/")) {
      return "instructor-dashboard.html";
    }

    if (path.includes("/admin-manager/")) {
      return "admin-dashboard.html";
    }

    if (path.includes("/admin/")) {
      return "admin-dashboard.html";
    }

    return "index.html";
  }

  function destinationUrl() {
    if (mappedDestination) {
      return mappedDestination;
    }

    if (parentLink) {
      return parentLink.getAttribute("href");
    }

    return fallbackUrl();
  }

  const button = document.createElement("button");
  button.className = "global-back-button";
  button.type = "button";
  button.dataset.globalBackButton = "true";
  button.setAttribute("aria-label", "Go back to the previous page");
  button.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 12H5"></path>
      <path d="m12 19-7-7 7-7"></path>
    </svg>
    <span>Back</span>
  `;

  button.addEventListener("click", () => {
    const destination = destinationUrl();

    if (mappedDestination && destination) {
      window.location.href = destination;
      return;
    }

    if (destination && normalizedFileName(destination) !== currentFileName()) {
      window.location.href = destination;
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
    }
  });

  topbar.classList.add("has-global-back");

  if (topbarTitle) {
    topbar.insertBefore(button, topbarTitle);
  } else {
    topbar.prepend(button);
  }
})();
