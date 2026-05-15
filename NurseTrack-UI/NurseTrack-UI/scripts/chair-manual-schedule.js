const manualScheduleForm = document.querySelector("#manual-schedule-form");
const manualScheduleStatus = document.querySelector("#manual-schedule-status");
const manualScheduleMessage = document.querySelector("#manual-schedule-message");
const manualStudentSearch = document.querySelector("#manual-student-search");
const manualSectionFilter = document.querySelector("#manual-section-filter");
const manualStudentList = document.querySelector("#manual-student-list");
const manualStudentItems = Array.from(document.querySelectorAll("#manual-student-list .manual-schedule-student-option"));
const manualNoStudentsMessage = document.querySelector("#manual-no-students-message");
const manualAddStudentsButton = document.querySelector("#manual-add-students");
const manualClearSelectionButton = document.querySelector("#manual-clear-selection");
const manualAssignedStudents = document.querySelector("#manual-assigned-students");
const manualStudentCount = document.querySelector("#manual-student-count");
const manualPickerCount = document.querySelector("#manual-picker-count");
const manualCaseTba = document.querySelector("#manual-case-tba");
const manualCaseInputs = Array.from(document.querySelectorAll("[data-manual-case-input]"));
const manualBreakDateInput = document.querySelector("#manual-break-date");
const manualAddBreakDateButton = document.querySelector("#manual-add-break-date");
const manualBreakList = document.querySelector("#manual-break-list");

const manualFields = {
  title: document.querySelector("#manual-title"),
  section: document.querySelector("#manual-section"),
  group: document.querySelector("#manual-group"),
  dutyType: document.querySelector("#manual-duty-type"),
  startDate: document.querySelector("#manual-start-date"),
  endDate: document.querySelector("#manual-end-date"),
  shiftStart: document.querySelector("#manual-shift-start"),
  shiftEnd: document.querySelector("#manual-shift-end")
};

const manualSummary = {
  date: document.querySelector("#manual-date-summary"),
  group: document.querySelector("#manual-group-summary"),
  students: document.querySelector("#manual-students-summary"),
  shift: document.querySelector("#manual-shift-summary")
};

let manualSelectedStudents = [];
let manualBreakDates = [];

function manualInitials(name) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function setManualMessage(message, isSuccess = true) {
  if (!manualScheduleMessage) {
    return;
  }

  manualScheduleMessage.textContent = message;
  manualScheduleMessage.classList.toggle("is-success", isSuccess);
  manualScheduleMessage.classList.toggle("is-error", !isSuccess);
}

function setManualStatus(text, statusClass) {
  if (!manualScheduleStatus) {
    return;
  }

  manualScheduleStatus.textContent = text;
  manualScheduleStatus.className = `status-badge ${statusClass}`;
}

function formatManualDateRange() {
  const startDate = manualFields.startDate?.value || "";
  const endDate = manualFields.endDate?.value || "";
  const breakSummary = manualBreakDates.length
    ? ` (${manualBreakDates.length} break date${manualBreakDates.length === 1 ? "" : "s"})`
    : "";

  if (!startDate && !endDate) {
    return "Not set";
  }

  if (startDate === endDate || !endDate) {
    return `${startDate}${breakSummary}`;
  }

  if (!startDate) {
    return `${endDate}${breakSummary}`;
  }

  return `${startDate} to ${endDate}${breakSummary}`;
}

function parseManualDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatManualBreakDate(value) {
  const date = parseManualDate(value);

  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function isManualBreakInRange(date) {
  const start = manualFields.startDate?.value || "";
  const end = manualFields.endDate?.value || "";
  return Boolean(date && start && end && start <= end && date >= start && date <= end);
}

function setManualBreakDates(dates) {
  manualBreakDates = Array.from(new Set((dates || [])
    .filter((date) => Boolean(parseManualDate(date)))))
    .sort();
}

function renderManualBreakDates() {
  if (!manualBreakList) {
    return;
  }

  if (!manualBreakDates.length) {
    manualBreakList.innerHTML = `<span class="schedule-break-empty">No breaks added</span>`;
    return;
  }

  manualBreakList.innerHTML = manualBreakDates.map((date) => `
    <button class="schedule-break-chip" type="button" data-remove-manual-break="${date}">
      <span>${formatManualBreakDate(date)}</span>
      <span aria-hidden="true">x</span>
    </button>
  `).join("");
}

function syncManualBreakControls(options = {}) {
  const start = manualFields.startDate?.value || "";
  const end = manualFields.endDate?.value || "";
  const hasValidRange = Boolean(parseManualDate(start) && parseManualDate(end) && start <= end);

  if (manualBreakDateInput) {
    manualBreakDateInput.min = start || "";
    manualBreakDateInput.max = end || "";
    manualBreakDateInput.disabled = !hasValidRange;
  }

  if (manualAddBreakDateButton) {
    manualAddBreakDateButton.disabled = !hasValidRange;
  }

  if (options.prune && hasValidRange) {
    const previousCount = manualBreakDates.length;
    setManualBreakDates(manualBreakDates.filter(isManualBreakInRange));

    if (previousCount !== manualBreakDates.length) {
      setManualMessage("Break dates outside the selected date range were removed.");
    }
  }

  renderManualBreakDates();
  syncManualSummary();
}

function addManualBreakDate() {
  const date = manualBreakDateInput?.value || "";

  if (!isManualBreakInRange(date)) {
    setManualMessage("Break date must be inside the selected start and end dates.", false);
    return;
  }

  if (manualBreakDates.includes(date)) {
    setManualMessage(`${formatManualBreakDate(date)} is already marked as a break.`, false);
    return;
  }

  setManualBreakDates([...manualBreakDates, date]);

  if (manualBreakDateInput) {
    manualBreakDateInput.value = "";
  }

  syncManualBreakControls();
  setManualStatus("Draft edited", "status-pending");
  setManualMessage(`${formatManualBreakDate(date)} added as a break date.`);
}

function getManualAssignedGroup() {
  const section = manualFields.section?.value || "";
  const group = manualFields.group?.value || "";

  if (!section && !group) {
    return "No group";
  }

  if (group === "Make-up Duty") {
    return section ? `${section} - Make-up Duty` : group;
  }

  return [section, group].filter(Boolean).join(" - ");
}

function syncManualPickerSection() {
  if (!manualFields.section || !manualSectionFilter) {
    return;
  }

  const hasMatchingFilter = Array.from(manualSectionFilter.options).some((option) => option.value === manualFields.section.value);

  if (hasMatchingFilter) {
    manualSectionFilter.value = manualFields.section.value;
  }
}

function syncManualSummary() {
  if (manualSummary.date) manualSummary.date.textContent = formatManualDateRange();
  if (manualSummary.group) manualSummary.group.textContent = getManualAssignedGroup();
  if (manualSummary.students) manualSummary.students.textContent = `${manualSelectedStudents.length} assigned`;
  if (manualSummary.shift) {
    const shiftStart = manualFields.shiftStart?.value || "";
    const shiftEnd = manualFields.shiftEnd?.value || "";
    manualSummary.shift.textContent = shiftStart && shiftEnd ? `${shiftStart} to ${shiftEnd}` : "No shift";
  }
}

function syncManualCasePresentation() {
  const isTba = Boolean(manualCaseTba?.checked);

  manualCaseInputs.forEach((input) => {
    input.disabled = isTba;
    if (isTba) {
      input.value = "";
    }
  });
}

function renderManualAssignedStudents() {
  if (!manualAssignedStudents) {
    return;
  }

  manualAssignedStudents.classList.toggle("is-empty", manualSelectedStudents.length === 0);

  if (manualStudentCount) {
    manualStudentCount.textContent = `${manualSelectedStudents.length} student${manualSelectedStudents.length === 1 ? "" : "s"}`;
  }

  if (manualSelectedStudents.length === 0) {
    manualAssignedStudents.innerHTML = `
      <div class="manual-empty-roster-line">No assigned students yet.</div>
    `;
    filterManualStudents();
    syncManualSummary();
    return;
  }

  manualAssignedStudents.innerHTML = `
    <div class="student-roster-table-row student-roster-table-head">
      <span>No.</span>
      <span>Student</span>
      <span>Group</span>
      <span>Action</span>
    </div>
    ${manualSelectedStudents.map((student, index) => `
      <div class="student-roster-table-row" data-manual-assigned-row>
        <span>${index + 1}.</span>
        <div class="roster-student-cell">
          <span class="avatar mini-avatar">${manualInitials(student)}</span>
          <strong>${student}</strong>
        </div>
        <span>${getManualAssignedGroup()}</span>
        <div class="roster-action-buttons">
          <button class="ghost-button danger-action" type="button" data-remove-manual-student="${student}">Remove</button>
        </div>
      </div>
    `).join("")}
  `;

  manualAssignedStudents.querySelectorAll("[data-remove-manual-student]").forEach((button) => {
    button.addEventListener("click", () => {
      const student = button.dataset.removeManualStudent;
      manualSelectedStudents = manualSelectedStudents.filter((name) => name !== student);
      renderManualAssignedStudents();
      setManualStatus("Draft edited", "status-pending");
      setManualMessage(`${student} removed from the manual schedule.`, false);
    });
  });

  filterManualStudents();
  syncManualSummary();
}

function filterManualStudents() {
  const query = manualStudentSearch?.value.trim().toLowerCase() || "";
  const section = manualSectionFilter?.value || "BSN 3A";
  const hasSearch = query.length > 0;
  let visibleCount = 0;

  manualStudentItems.forEach((item) => {
    const student = item.dataset.manualAddStudent || "";
    const isAssigned = manualSelectedStudents.includes(student);
    const matchesSearch = hasSearch && item.dataset.student.toLowerCase().includes(query);
    const matchesSection = item.dataset.section === section;
    const shouldHide = isAssigned || !matchesSearch || !matchesSection;

    item.hidden = shouldHide;

    if (!shouldHide) {
      visibleCount += 1;
    }

  });

  if (manualNoStudentsMessage) {
    manualNoStudentsMessage.hidden = !hasSearch || visibleCount > 0;
  }

  if (manualPickerCount) {
    manualPickerCount.textContent = `${manualSelectedStudents.length} selected`;
  }
}

function clearManualStudentSelection() {
  manualSelectedStudents = [];
  renderManualAssignedStudents();
  setManualStatus("Draft edited", "status-pending");
  setManualMessage("Student selection cleared.", false);
}

manualStudentSearch?.addEventListener("input", filterManualStudents);
manualSectionFilter?.addEventListener("change", filterManualStudents);
manualClearSelectionButton?.addEventListener("click", clearManualStudentSelection);

manualStudentList?.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-manual-add-student]");

  if (!addButton || addButton.hidden) {
    return;
  }

  const student = addButton.dataset.manualAddStudent;

  if (!student || manualSelectedStudents.includes(student)) {
    return;
  }

  manualSelectedStudents = [...manualSelectedStudents, student];

  if (manualStudentSearch) {
    manualStudentSearch.value = "";
  }

  renderManualAssignedStudents();
  setManualStatus("Draft edited", "status-pending");
  setManualMessage("");
});

Object.values(manualFields).forEach((field) => {
  field?.addEventListener("input", () => {
    syncManualPickerSection();
    syncManualBreakControls({ prune: true });
    syncManualSummary();
    renderManualAssignedStudents();
  });
  field?.addEventListener("change", () => {
    syncManualPickerSection();
    syncManualBreakControls({ prune: true });
    syncManualSummary();
    renderManualAssignedStudents();
  });
});

manualCaseTba?.addEventListener("change", syncManualCasePresentation);
manualAddBreakDateButton?.addEventListener("click", addManualBreakDate);

manualBreakList?.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove-manual-break]");

  if (!removeButton) {
    return;
  }

  const date = removeButton.dataset.removeManualBreak;
  setManualBreakDates(manualBreakDates.filter((item) => item !== date));
  syncManualBreakControls();
  setManualStatus("Draft edited", "status-pending");
  setManualMessage(`${formatManualBreakDate(date)} removed from break dates.`, false);
});

manualScheduleForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (manualSelectedStudents.length === 0) {
    setManualMessage("Add at least one student before saving this manual schedule.", false);
    return;
  }

  if (manualBreakDates.some((date) => !isManualBreakInRange(date))) {
    setManualMessage("Remove break dates outside the selected start and end dates before saving.", false);
    return;
  }

  setManualStatus("Saved", "status-verified");
  setManualMessage("Manual schedule saved successfully.");
});

syncManualCasePresentation();
syncManualPickerSection();
syncManualBreakControls();
renderManualAssignedStudents();
syncManualSummary();
