const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const overtimeSearch = document.querySelector("#overtime-search");
const overtimeRoleFilter = document.querySelector("#overtime-role-filter");
const overtimeHoursFilter = document.querySelector("#overtime-hours-filter");
const overtimePersonList = document.querySelector("#overtime-person-list");
const overtimeEmpty = document.querySelector("#overtime-empty");
const overtimeResultCount = document.querySelector("#overtime-result-count");
const overtimePeriodLabel = document.querySelector("#overtime-period-label");
const overtimePrevMonth = document.querySelector("#overtime-prev-month");
const overtimeNextMonth = document.querySelector("#overtime-next-month");

let overtimeMonthDate = new Date();
overtimeMonthDate = new Date(overtimeMonthDate.getFullYear(), overtimeMonthDate.getMonth(), 1);

function getCurrentMonthYear(date = overtimeMonthDate) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });
}

const overtimePeople = [
  {
    id: "patricia-reyes",
    name: "Patricia Reyes",
    initials: "PR",
    role: "Clinical Instructor",
    identifier: "CI-2026-006",
    section: "BSN 3A",
    site: "Emergency Room",
    period: getCurrentMonthYear(),
    total: 6.83,
    weeklyTotal: 2
  },
  {
    id: "miguel-santos",
    name: "Miguel Santos",
    initials: "MS",
    role: "Clinical Instructor",
    identifier: "CI-2026-011",
    section: "BSN 3B",
    site: "Pedia Pulmo Ward",
    period: getCurrentMonthYear(),
    total: 3.92,
    weeklyTotal: 3
  },
  {
    id: "maria-cruz",
    name: "Maria Cruz",
    initials: "MC",
    role: "Student",
    identifier: "12-3456-789",
    section: "BSN 3A",
    site: "Emergency Room",
    period: getCurrentMonthYear(),
    total: 3.5,
    weeklyTotal: 1
  },
  {
    id: "treasure-abadinas",
    name: "Treasure Abadinas",
    initials: "TA",
    role: "Student",
    identifier: "22-1845-103",
    section: "BSN 3A",
    site: "Delivery Room",
    period: getCurrentMonthYear(),
    total: 3.25,
    weeklyTotal: 2
  },
  {
    id: "carlo-fernandez",
    name: "Carlo Fernandez",
    initials: "CF",
    role: "Student",
    identifier: "23-1188-902",
    section: "BSN 3A",
    site: "Operating Room",
    period: getCurrentMonthYear(),
    total: 2,
    weeklyTotal: 2
  },
  {
    id: "andrea-gomez",
    name: "Andrea Gomez",
    initials: "AG",
    role: "Student",
    identifier: "20-4408-332",
    section: "BSN 4A",
    site: "Pedia Pulmo Ward",
    period: getCurrentMonthYear(),
    total: 1,
    weeklyTotal: 1
  },
  {
    id: "mark-hernandez",
    name: "Mark Hernandez",
    initials: "MH",
    role: "Student",
    identifier: "21-5409-882",
    section: "BSN 4A",
    site: "Operating Room",
    period: getCurrentMonthYear(),
    total: 0.75,
    weeklyTotal: 0.75
  }
];

function formatOvertimeHours(value) {
  if (!value) {
    return "0 hrs";
  }

  return `${Number(value).toFixed(value % 1 === 0 ? 0 : 2).replace(/\.?0+$/, "")} hrs`;
}

function matchesOvertimeHours(weeklyTotal, hoursFilter) {
  if (hoursFilter === "1") {
    return weeklyTotal >= 0 && weeklyTotal <= 1;
  }

  if (hoursFilter === "5") {
    return weeklyTotal >= 5;
  }

  return Math.floor(weeklyTotal) === Number(hoursFilter);
}

function renderPeople() {
  if (!overtimePersonList) {
    return;
  }

  const query = (overtimeSearch?.value || "").trim().toLowerCase();
  const role = overtimeRoleFilter?.value || "Clinical Instructor";
  const hoursFilter = overtimeHoursFilter?.value || "1";
  const period = getCurrentMonthYear();
  let visibleCount = 0;

  if (overtimePeriodLabel) {
    overtimePeriodLabel.textContent = period;
  }

  overtimePersonList.innerHTML = overtimePeople.map((person) => {
    const searchable = `${person.name} ${person.identifier} ${person.role} ${person.section} ${person.site} ${period}`.toLowerCase();
    const matchesQuery = !query || searchable.includes(query);
    const matchesRole = person.role === role;
    const matchesHours = matchesOvertimeHours(person.weeklyTotal, hoursFilter);
    const isVisible = matchesQuery && matchesRole && matchesHours;

    if (isVisible) {
      visibleCount += 1;
    }

    return `
      <a class="validation-user-card" href="overtime-rendered.html?id=${person.id}&period=${encodeURIComponent(period)}" data-overtime-person data-name="${person.name}" data-role="${person.role}" ${isVisible ? "" : "hidden"}>
        <span class="avatar small-avatar">${person.initials}</span>
        <span>
          <strong>${person.name}</strong>
          <small>${person.role} - ${person.identifier} - ${person.section}</small>
          <small>${person.site} - ${period}</small>
        </span>
        <span class="status-badge status-pending">${formatOvertimeHours(person.weeklyTotal)}</span>
      </a>
    `;
  }).join("");

  if (overtimeResultCount) {
    overtimeResultCount.textContent = `${visibleCount} people`;
  }

  if (overtimeEmpty) {
    overtimeEmpty.hidden = visibleCount > 0;
  }
}

menuButton?.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop?.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

[overtimeSearch, overtimeRoleFilter, overtimeHoursFilter].filter(Boolean).forEach((control) => {
  control.addEventListener("input", renderPeople);
});

overtimePrevMonth?.addEventListener("click", () => {
  overtimeMonthDate = new Date(overtimeMonthDate.getFullYear(), overtimeMonthDate.getMonth() - 1, 1);
  renderPeople();
});

overtimeNextMonth?.addEventListener("click", () => {
  overtimeMonthDate = new Date(overtimeMonthDate.getFullYear(), overtimeMonthDate.getMonth() + 1, 1);
  renderPeople();
});

renderPeople();
