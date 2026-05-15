(() => {
  const icons = {
    about: `
      <circle cx="12" cy="12" r="9"></circle>
      <path d="M12 11v5"></path>
      <path d="M12 8h.01"></path>
    `,
    "clinical cases": `
      <path d="M8 3h6l4 4v14H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"></path>
      <path d="M14 3v5h5"></path>
      <path d="m9.5 14 1.6 1.6 3.4-4"></path>
    `,
    "clinical cases review": `
      <path d="M8 3h6l4 4v14H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"></path>
      <path d="M14 3v5h5"></path>
      <path d="m8.5 14 2 2 5-5"></path>
    `,
    clearance: `
      <path d="M12 3 20 7v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Z"></path>
      <path d="m8 12 2.5 2.5L16 9"></path>
      <path d="M8 18h8"></path>
    `,
    dashboard: `
      <rect x="3" y="3" width="7" height="8" rx="1.5"></rect>
      <rect x="14" y="3" width="7" height="5" rx="1.5"></rect>
      <rect x="14" y="12" width="7" height="9" rx="1.5"></rect>
      <rect x="3" y="15" width="7" height="6" rx="1.5"></rect>
    `,
    "duty hours": `
      <circle cx="12" cy="12" r="9"></circle>
      <path d="M12 7v5l3 2"></path>
    `,
    "extension days": `
      <rect x="4" y="5" width="16" height="16" rx="2"></rect>
      <path d="M8 3v4"></path>
      <path d="M16 3v4"></path>
      <path d="M4 10h16"></path>
      <path d="M12 14v5"></path>
      <path d="M9.5 16.5h5"></path>
    `,
    help: `
      <circle cx="12" cy="12" r="9"></circle>
      <path d="M9.7 9a2.4 2.4 0 0 1 4.6.9c0 1.6-1.5 2.2-2.1 3"></path>
      <path d="M12 17h.01"></path>
    `,
    "live attendance": `
      <path d="M4 12a8 8 0 0 1 16 0"></path>
      <path d="M7.5 12a4.5 4.5 0 0 1 9 0"></path>
      <circle cx="12" cy="13" r="2"></circle>
      <path d="M12 15v5"></path>
    `,
    "manage users": `
      <circle cx="9" cy="8" r="3"></circle>
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0"></path>
      <circle cx="17" cy="10" r="2.5"></circle>
      <path d="M14.5 19a4.5 4.5 0 0 1 6.5-4"></path>
    `,
    profile: `
      <circle cx="12" cy="8" r="4"></circle>
      <path d="M4 21a8 8 0 0 1 16 0"></path>
    `,
    progress: `
      <path d="M4 19V5"></path>
      <path d="M4 19h16"></path>
      <path d="m7 15 4-4 3 3 5-7"></path>
    `,
    reports: `
      <path d="M4 19V5"></path>
      <path d="M4 19h16"></path>
      <rect x="7" y="11" width="2.5" height="5"></rect>
      <rect x="11.25" y="8" width="2.5" height="8"></rect>
      <rect x="15.5" y="6" width="2.5" height="10"></rect>
    `,
    "role assignment": `
      <circle cx="9" cy="8" r="3"></circle>
      <path d="M3.5 19a5.5 5.5 0 0 1 9.4-3.9"></path>
      <circle cx="17" cy="17" r="3"></circle>
      <path d="M17 14v-2"></path>
      <path d="M17 22v-2"></path>
      <path d="M20 17h2"></path>
      <path d="M12 17h2"></path>
    `,
    "section import": `
      <path d="M5 4h10l4 4v12H5z"></path>
      <path d="M15 4v5h5"></path>
      <path d="M8 14h8"></path>
      <path d="M8 17h5"></path>
      <path d="M10 11h4"></path>
      <path d="M12 9v4"></path>
    `,
    "hospitals / duty areas": `
      <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"></path>
      <path d="M16 8h2a2 2 0 0 1 2 2v11"></path>
      <path d="M8 7h4"></path>
      <path d="M8 11h4"></path>
      <path d="M8 15h4"></path>
      <path d="M3 21h18"></path>
    `,
    "audit logs": `
      <path d="M6 3h10l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"></path>
      <path d="M16 3v5h5"></path>
      <path d="M8 12h8"></path>
      <path d="M8 16h6"></path>
      <path d="m8 8 1 1 2-2"></path>
    `,
    schedule: `
      <rect x="4" y="5" width="16" height="16" rx="2"></rect>
      <path d="M8 3v4"></path>
      <path d="M16 3v4"></path>
      <path d="M4 10h16"></path>
      <path d="M8 14h.01"></path>
      <path d="M12 14h.01"></path>
      <path d="M16 14h.01"></path>
    `,
    schedules: `
      <rect x="4" y="5" width="16" height="16" rx="2"></rect>
      <path d="M8 3v4"></path>
      <path d="M16 3v4"></path>
      <path d="M4 10h16"></path>
      <path d="m8 15 2 2 4-5"></path>
    `,
    "assigned schedules": `
      <rect x="4" y="5" width="16" height="16" rx="2"></rect>
      <path d="M8 3v4"></path>
      <path d="M16 3v4"></path>
      <path d="M4 10h16"></path>
      <path d="m8 15 2 2 4-5"></path>
    `,
    scheduling: `
      <rect x="4" y="5" width="16" height="16" rx="2"></rect>
      <path d="M8 3v4"></path>
      <path d="M16 3v4"></path>
      <path d="M4 10h16"></path>
      <path d="m8 15 2 2 4-5"></path>
    `,
    "student progress": `
      <path d="M4 19V5"></path>
      <path d="M4 19h16"></path>
      <path d="m7 15 4-4 3 3 5-7"></path>
    `,
    "student appeals": `
      <path d="M4 5h16v11H8l-4 4V5Z"></path>
      <path d="M8 9h8"></path>
      <path d="M8 13h5"></path>
      <path d="m15 17 2 2 4-5"></path>
    `,
    "approved appeals": `
      <path d="M4 5h16v11H8l-4 4V5Z"></path>
      <path d="M8 9h8"></path>
      <path d="M8 13h5"></path>
      <path d="m15 17 2 2 4-5"></path>
    `,
    "ci recommendations": `
      <path d="M4 5h16v11H8l-4 4V5Z"></path>
      <path d="M8 9h8"></path>
      <path d="M8 13h5"></path>
      <path d="m15 17 2 2 4-5"></path>
    `,
    "enrollment summary / archive": `
      <path d="M5 4h14v16H5z"></path>
      <path d="M8 8h8"></path>
      <path d="M8 12h8"></path>
      <path d="M8 16h5"></path>
    `,
    "exceptions & overrides": `
      <path d="M12 3 20 7v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Z"></path>
      <path d="M12 8v5"></path>
      <path d="M12 16h.01"></path>
    `,
    submissions: `
      <path d="M4 4h16v12H4z"></path>
      <path d="M4 16l4-4h8l4 4"></path>
      <path d="M9 8h6"></path>
    `,
    "user list / manage users": `
      <circle cx="9" cy="8" r="3"></circle>
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0"></path>
      <circle cx="17" cy="10" r="2.5"></circle>
      <path d="M14.5 19a4.5 4.5 0 0 1 6.5-4"></path>
    `,
    validation: `
      <path d="M12 3 20 7v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Z"></path>
      <path d="m8.5 12 2.3 2.3 4.7-5"></path>
    `,
    "validation history": `
      <path d="M12 8v5l3 2"></path>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.4-5.9"></path>
      <path d="M3.5 5.5v5h5"></path>
    `,
    "validation review": `
      <path d="M9 4h6l1 2h3v15H5V6h3l1-2Z"></path>
      <path d="m8.5 13 2 2 5-5"></path>
    `,
  };

  const fallbackIcon = `
    <circle cx="12" cy="12" r="8"></circle>
    <path d="M12 8v8"></path>
    <path d="M8 12h8"></path>
  `;

  const refresh = () => {
    document.querySelectorAll(".sidebar-nav .nav-link").forEach((link) => {
      if (link.querySelector(".nav-icon")) {
        return;
      }

      const label = link.textContent.trim().toLowerCase();
      const dot = link.querySelector(".nav-dot");
      const icon = dot || document.createElement("span");
      icon.className = "nav-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${icons[label] || fallbackIcon}
        </svg>
      `;

      if (!dot) {
        link.prepend(icon);
      }
    });
  };

  window.NurseTrackSidebarIcons = { refresh };
  refresh();
})();
