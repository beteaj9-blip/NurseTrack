const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const filterButtons = Array.from(document.querySelectorAll("[data-record-filter]"));
const recordList = document.querySelector("#student-record-list");
const recordMessage = document.querySelector("#record-message");
const pendingCaseLink = document.querySelector("#pending-case-link");
const weeklyDutyList = document.querySelector("#weekly-duty-list");
const weeklyDutyDays = document.querySelector("#weekly-duty-days");
const weeklyDutyHours = document.querySelector("#weekly-duty-hours");
const weeklyDutyOvertime = document.querySelector("#weekly-duty-overtime");
const weeklyDutyOverviewTitle = document.querySelector("#weekly-duty-overview-title");
const weeklyDutyOverviewCopy = document.querySelector("#weekly-duty-overview-copy");
const weeklyDutyMessage = document.querySelector("#weekly-duty-message");
const instructorData = window.NurseTrackInstructorData;

let recordItems = [];

const fallbackStudents = {
  "maria-cruz": {
    name: "Maria Cruz",
    initials: "MC",
    id: "12-3456-789",
    section: "BSN 3A",
    site: "CCMC",
    area: "Emergency Room",
    status: "In progress",
    extensionDays: 11,
    pending: 14
  }
};

const students = instructorData?.students || fallbackStudents;

const weeklyDutyByStudent = {
  "maria-cruz": [
    { day: "Monday", date: "Apr 20", area: "Emergency Room", hours: 8, overtime: 0 },
    { day: "Tuesday", date: "Apr 21", area: "Emergency Room", hours: 9.5, overtime: 1.5 },
    { day: "Thursday", date: "Apr 23", area: "Operating Room", hours: 8, overtime: 0 },
    { day: "Friday", date: "Apr 24", area: "Operating Room", hours: 10, overtime: 2 }
  ],
  "treasure-abadinas": [
    { day: "Monday", date: "Apr 20", area: "Delivery Room", hours: 8, overtime: 0 },
    { day: "Wednesday", date: "Apr 22", area: "Delivery Room", hours: 9, overtime: 1 },
    { day: "Thursday", date: "Apr 23", area: "Delivery Room", hours: 8, overtime: 0 },
    { day: "Friday", date: "Apr 24", area: "Delivery Room", hours: 9.5, overtime: 1.5 }
  ],
  "licheal-ursulo": [
    { day: "Monday", date: "Apr 20", area: "Delivery Room", hours: 8, overtime: 0 },
    { day: "Tuesday", date: "Apr 21", area: "Delivery Room", hours: 8, overtime: 0 },
    { day: "Wednesday", date: "Apr 22", area: "Pedia Pulmo Ward", hours: 8, overtime: 0 }
  ],
  "nicole-dela-pena": [
    { day: "Tuesday", date: "Apr 21", area: "Medical Ward", hours: 8, overtime: 0 },
    { day: "Wednesday", date: "Apr 22", area: "Medical Ward", hours: 8.5, overtime: 0.5 },
    { day: "Friday", date: "Apr 24", area: "Medical Ward", hours: 8, overtime: 0 }
  ],
  "carlo-fernandez": [
    { day: "Monday", date: "Apr 20", area: "Operating Room", hours: 8, overtime: 0 },
    { day: "Wednesday", date: "Apr 22", area: "Operating Room", hours: 10, overtime: 2 },
    { day: "Friday", date: "Apr 24", area: "Operating Room", hours: 8, overtime: 0 }
  ]
};

function defaultWeeklyDuty(student) {
  return [
    { day: "Monday", date: "Apr 20", area: student.area || "Assigned area", hours: 8, overtime: 0 },
    { day: "Wednesday", date: "Apr 22", area: student.area || "Assigned area", hours: 8, overtime: 0 },
    { day: "Friday", date: "Apr 24", area: student.area || "Assigned area", hours: 8.5, overtime: 0.5 }
  ];
}

function formatHours(hours) {
  const cleanHours = Number.isInteger(hours) ? hours : Number(hours).toFixed(1);

  return Number(hours) === 1 ? `${cleanHours} hr` : `${cleanHours} hrs`;
}

function statusClass(status) {
  if (status === "Completed" || status === "On track") {
    return "status-verified";
  }

  if (status === "Needs action") {
    return "status-rejected";
  }

  return "status-pending";
}

function recordStatusMeta(status) {
  return instructorData?.statusMeta?.[status] || {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    badgeClass: status === "approved" ? "status-verified" : status === "rejected" ? "status-rejected" : "status-pending",
    actionLabel: status === "pending" ? "Review" : "View"
  };
}

function setText(id, text) {
  const element = document.querySelector(`#${id}`);

  if (element) {
    element.textContent = text;
  }
}

function buildCaseSelectionUrl(studentKey, student) {
  const params = new URLSearchParams({
    student: studentKey,
    name: student.name,
    id: student.id,
    section: student.section,
    area: student.area || ""
  });

  return `clinical-case-selection.html?${params.toString()}`;
}

function applyStudent(student, studentKey) {
  setText("progress-avatar", student.initials);
  setText("progress-name", student.name);
  setText("progress-meta", `${student.section} - Student ID ${student.id}`);

  const statusBadge = document.querySelector("#progress-status");

  if (statusBadge) {
    statusBadge.textContent = student.status;
    statusBadge.className = `status-badge ${statusClass(student.status)}`;
  }

  setText("duty-summary", `${student.extensionDays} extension days recorded`);
  setText("case-summary", "All required DR and OR cases completed");
  setText("pending-summary", `${student.pending} records need instructor or student action`);

  const followUpCount = document.querySelector("#follow-up-count");

  if (followUpCount) {
    followUpCount.textContent = `${student.pending} open`;
  }

  if (pendingCaseLink) {
    pendingCaseLink.href = buildCaseSelectionUrl(studentKey, student);
  }
}

function renderStudentRecords(studentKey) {
  if (!recordList || !instructorData?.cases) {
    recordItems = Array.from(document.querySelectorAll("#student-record-list .submission-item"));
    return;
  }

  const records = instructorData.cases.getByStudent(studentKey);

  recordList.innerHTML = "";

  records.forEach((record) => {
    const meta = recordStatusMeta(record.status);
    const item = document.createElement("article");
    const actionUrl = instructorData.buildCaseUrl(record.id, {
      from: "progress",
      student: studentKey
    });

    item.className = "submission-item";
    item.dataset.status = record.status;
    item.innerHTML = `
      <div class="avatar small-avatar">${record.studentInitials}</div>
      <div class="submission-copy">
        <strong>${record.title}</strong>
        <p>${record.summary}</p>
      </div>
      <span class="status-badge ${meta.badgeClass}">${meta.label}</span>
      <a class="text-link" href="${actionUrl}">${meta.actionLabel}</a>
    `;

    recordList.appendChild(item);
  });

  recordItems = Array.from(recordList.querySelectorAll(".submission-item"));
}

function renderWeeklyDuty(studentKey, student) {
  if (!weeklyDutyList) {
    return;
  }

  const dutyEntries = weeklyDutyByStudent[studentKey] || defaultWeeklyDuty(student);
  const totalHours = dutyEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const totalOvertime = dutyEntries.reduce((sum, entry) => sum + entry.overtime, 0);

  weeklyDutyList.innerHTML = dutyEntries.map((entry) => {
    const hasOvertime = entry.overtime > 0;
    const badgeClass = hasOvertime ? "status-rejected" : "status-verified";
    const badgeLabel = hasOvertime ? `Overtime +${formatHours(entry.overtime)}` : "No overtime";
    const [month = "", dayNumber = ""] = entry.date.split(" ");

    return `
      <article class="weekly-duty-row ${hasOvertime ? "has-overtime" : ""}">
        <div class="weekly-duty-date-chip">
          <span>${month}</span>
          <strong>${dayNumber}</strong>
        </div>

        <div class="weekly-duty-copy">
          <strong>${entry.day}</strong>
          <p>${entry.area}</p>
        </div>

        <span class="status-badge ${badgeClass}">${badgeLabel}</span>

        <div class="weekly-duty-hour-stack">
          <span>${formatHours(entry.hours)}</span>
          <small>Duty hours</small>
        </div>
      </article>
    `;
  }).join("");

  if (weeklyDutyDays) {
    weeklyDutyDays.textContent = dutyEntries.length;
  }

  if (weeklyDutyHours) {
    weeklyDutyHours.textContent = formatHours(totalHours);
  }

  if (weeklyDutyOvertime) {
    weeklyDutyOvertime.textContent = formatHours(totalOvertime);
  }

  if (weeklyDutyOverviewTitle) {
    weeklyDutyOverviewTitle.textContent = `${formatHours(totalHours)} recorded`;
  }

  if (weeklyDutyOverviewCopy) {
    weeklyDutyOverviewCopy.textContent = totalOvertime > 0
      ? `${formatHours(totalOvertime)} overtime across ${dutyEntries.length} duty day${dutyEntries.length === 1 ? "" : "s"}.`
      : `No overtime across ${dutyEntries.length} duty day${dutyEntries.length === 1 ? "" : "s"}.`;
  }

  if (weeklyDutyMessage) {
    weeklyDutyMessage.textContent = `${student.name} completed ${formatHours(totalHours)} across ${dutyEntries.length} duty day${dutyEntries.length === 1 ? "" : "s"} this week, with ${formatHours(totalOvertime)} overtime.`;
  }
}

function filterRecords(filter) {
  let visibleCount = 0;

  recordItems.forEach((item) => {
    const isVisible = item.dataset.status === filter;
    item.hidden = !isVisible;

    if (isVisible) {
      visibleCount += 1;
    }
  });

  if (recordMessage) {
    recordMessage.textContent = `Showing ${visibleCount} ${filter} record${visibleCount === 1 ? "" : "s"}.`;
  }
}

if (menuButton) {
  menuButton.addEventListener("click", () => {
    document.body.classList.add("sidebar-open");
  });
}

if (sidebarBackdrop) {
  sidebarBackdrop.addEventListener("click", () => {
    document.body.classList.remove("sidebar-open");
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    filterRecords(button.dataset.recordFilter);
  });
});

const params = new URLSearchParams(window.location.search);
const studentKey = params.get("student") || "maria-cruz";
const selectedStudent = students[studentKey] || students["maria-cruz"];

applyStudent(selectedStudent, studentKey);
renderStudentRecords(studentKey);
renderWeeklyDuty(studentKey, selectedStudent);

const defaultFilterButton =
  document.querySelector("[data-record-filter].is-active") ||
  document.querySelector("[data-record-filter='approved']") ||
  filterButtons[0];

if (defaultFilterButton) {
  filterButtons.forEach((item) => item.classList.remove("is-active"));
  defaultFilterButton.classList.add("is-active");
  filterRecords(defaultFilterButton.dataset.recordFilter);
}
