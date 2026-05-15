const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const overtimeDetailHeading = document.querySelector("#overtime-detail-heading");
const overtimeDetailBadge = document.querySelector("#overtime-detail-badge");
const overtimePersonName = document.querySelector("#overtime-person-name");
const overtimePersonRole = document.querySelector("#overtime-person-role");
const overtimePersonPeriod = document.querySelector("#overtime-person-period");
const overtimePersonTotal = document.querySelector("#overtime-person-total");
const overtimeSheetTitle = document.querySelector("#overtime-sheet-title");
const overtimeTable = document.querySelector("#overtime-table");
const overtimeDetailMessage = document.querySelector("#overtime-detail-message");

function setActiveSidebarLink() {
  const currentPage = window.location.pathname.split("/").pop();
  const navLinks = document.querySelectorAll(".sidebar-nav .nav-link");

  navLinks.forEach((link) => {
    const linkPage = link.getAttribute("href");

    link.classList.remove("is-active");
    link.removeAttribute("aria-current");

    if (linkPage === currentPage) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }

    if (
      (currentPage === "overtime-rendered.html" || currentPage === "overtime-details.html") &&
      linkPage === "overtime-details.html"
    ) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });
}

function getCurrentMonthYear() {
  return new Date().toLocaleDateString("en-US", {
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
    records: [
      { date: "1-May-26", schedule: "07:00 AM - 03:00 PM", actual: "06:50 AM - 05:20 PM", overtime: 2.33 },
      { date: "2-May-26", schedule: "07:00 AM - 03:00 PM", actual: "07:00 AM - 04:30 PM", overtime: 1.5 },
      { date: "3-May-26", schedule: "07:00 AM - 03:00 PM", actual: "06:45 AM - 06:00 PM", overtime: 3 }
    ]
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
    records: [
      { date: "4-May-26", schedule: "08:00 AM - 04:00 PM", actual: "07:40 AM - 06:10 PM", overtime: 2.17 },
      { date: "5-May-26", schedule: "08:00 AM - 04:00 PM", actual: "08:00 AM - 05:45 PM", overtime: 1.75 },
      { date: "6-May-26", schedule: "08:00 AM - 04:00 PM", actual: "07:50 AM - 04:00 PM", overtime: 0 }
    ]
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
    records: [
      { date: "7-May-26", schedule: "07:00 AM - 03:00 PM", actual: "06:55 AM - 04:30 PM", overtime: 1.5 },
      { date: "8-May-26", schedule: "07:00 AM - 03:00 PM", actual: "07:00 AM - 05:00 PM", overtime: 2 }
    ]
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
    records: [
      { date: "9-May-26", schedule: "06:00 AM - 02:00 PM", actual: "05:50 AM - 03:00 PM", overtime: 1 },
      { date: "10-May-26", schedule: "06:00 AM - 02:00 PM", actual: "05:45 AM - 04:15 PM", overtime: 2.25 }
    ]
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
    records: [
      { date: "11-May-26", schedule: "08:00 AM - 04:00 PM", actual: "07:40 AM - 04:00 PM", overtime: 0 },
      { date: "12-May-26", schedule: "08:00 AM - 04:00 PM", actual: "07:50 AM - 06:00 PM", overtime: 2 }
    ]
  }
];

function formatOvertimeHours(value) {
  if (!value) {
    return "0 hrs";
  }

  return `${Number(value).toFixed(value % 1 === 0 ? 0 : 2).replace(/\.?0+$/, "")} hrs`;
}

function getTotalOvertime(person) {
  return person.records.reduce((sum, record) => sum + record.overtime, 0);
}

function renderOvertimeTable(person) {
  if (!overtimeTable) {
    return;
  }

  overtimeTable.innerHTML = `
    <div class="overtime-table-row overtime-table-head">
      <span>No.</span>
      <span>Date</span>
      <span>Schedule</span>
      <span>Actual Time</span>
      <span>OT Hours</span>
    </div>
    ${person.records.map((record, index) => `
      <div class="overtime-table-row">
        <span>${index + 1}</span>
        <span>${record.date}</span>
        <span>${record.schedule}</span>
        <span>${record.actual}</span>
        <span><strong>${formatOvertimeHours(record.overtime)}</strong></span>
      </div>
    `).join("")}
  `;
}

function renderSelectedPerson() {
  const params = new URLSearchParams(window.location.search);
  const personId = params.get("id");
  const person = overtimePeople.find((item) => item.id === personId);
  const selectedPeriod = params.get("period") || person?.period || getCurrentMonthYear();

  if (!person) {
    if (overtimeDetailHeading) {
      overtimeDetailHeading.textContent = "No overtime record found";
    }

    if (overtimeDetailBadge) {
      overtimeDetailBadge.textContent = "No record";
      overtimeDetailBadge.className = "status-badge status-pending";
    }

    if (overtimePersonName) {
      overtimePersonName.textContent = "No selection";
    }

    if (overtimePersonRole) {
      overtimePersonRole.textContent = "-";
    }

    if (overtimePersonPeriod) {
      overtimePersonPeriod.textContent = "-";
    }

    if (overtimePersonTotal) {
      overtimePersonTotal.textContent = "0 hrs";
    }

    if (overtimeSheetTitle) {
      overtimeSheetTitle.textContent = "CNAHS OVERTIME DETAILS";
    }

    if (overtimeDetailMessage) {
      overtimeDetailMessage.textContent = "Go back to the overtime lookup and select a valid person.";
    }

    if (overtimeTable) {
      overtimeTable.innerHTML = "";
    }

    return;
  }

  const total = getTotalOvertime(person);

  if (overtimeDetailHeading) {
    overtimeDetailHeading.textContent = person.name;
  }

  if (overtimeDetailBadge) {
    overtimeDetailBadge.textContent = formatOvertimeHours(total);
    overtimeDetailBadge.className = `status-badge ${total > 0 ? "status-pending" : "status-verified"}`;
  }

  if (overtimePersonName) {
    overtimePersonName.textContent = person.name;
  }

  if (overtimePersonRole) {
    overtimePersonRole.textContent = person.role;
  }

  if (overtimePersonPeriod) {
    overtimePersonPeriod.textContent = selectedPeriod;
  }

  if (overtimePersonTotal) {
    overtimePersonTotal.textContent = formatOvertimeHours(total);
  }

  if (overtimeSheetTitle) {
    overtimeSheetTitle.textContent = `${person.role === "Clinical Instructor" ? "CNAHS FACULTY" : "CNAHS STUDENT"} WHO RENDERED OVERTIME FOR THE PERIOD OF ${selectedPeriod.toUpperCase()}`;
  }

  if (overtimeDetailMessage) {
    overtimeDetailMessage.textContent = `${person.name} has ${formatOvertimeHours(total)} recorded for ${selectedPeriod}.`;
  }

  renderOvertimeTable(person);
}

menuButton?.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop?.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

setActiveSidebarLink();
renderSelectedPerson();
