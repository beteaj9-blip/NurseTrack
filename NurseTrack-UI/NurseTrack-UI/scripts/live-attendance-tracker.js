const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const siteFilter = document.querySelector("#attendance-site-filter");
const areaFilter = document.querySelector("#attendance-area-filter");
const attendanceSearch = document.querySelector("#attendance-search");
const tableContainer = document.querySelector("#live-attendance-table");
let attendanceRows = Array.from(document.querySelectorAll(".live-attendance-row:not(.live-attendance-head)"));
const emptyState = document.querySelector("#attendance-empty");
const syncPill = document.querySelector("#attendance-sync-pill");
const siteCards = Array.from(document.querySelectorAll("[data-site-jump]"));
const OVERTIME_MINUTES = 8 * 60;
const attendancePath = window.location.pathname.replace(/\\/g, "/");
const attendancePage = attendancePath.split("/").pop();
const isCiManualAttendancePage = attendancePath.includes("/clinical-instructor/") && attendancePage === "manual-attendance.html";
const isAttendanceReviewerPage = (attendancePath.includes("/admin-manager/") || attendancePath.includes("/admin/")) && attendancePage === "manual-attendance-review.html";
const isLiveAttendancePage = attendancePage === "live-attendance-tracker.html";
const MANUAL_ATTENDANCE_KEY = "nursetrack-manual-attendance-submissions";
const ASSISTANT_MANUAL_BACKUP_ACCESS_KEY = "nursetrack-assistant-manual-backup-access";
const signedRole = window.sessionStorage?.getItem("nursetrackRole") || "";
const assistantManualBackupAccessEnabled = window.localStorage?.getItem(ASSISTANT_MANUAL_BACKUP_ACCESS_KEY) === "true";
const isSupportManualBackupRole = signedRole === "assistant" || signedRole === "coordinator";

const manualAttendanceStudents = [
  { id: "maria-cruz", name: "Maria Cruz", initials: "MC", studentId: "12-3456-789", section: "BSN 3A", area: "Emergency Room", site: "CCMC" },
  { id: "treasure-abadinas", name: "Treasure Abadinas", initials: "TA", studentId: "22-1845-103", section: "BSN 3A", area: "Delivery Room", site: "CCMC" },
  { id: "josh-anton-nuevas", name: "Josh Anton Nuevas", initials: "JA", studentId: "21-5589-201", section: "BSN 3A", area: "Emergency Room", site: "CCMC" },
  { id: "nicole-dela-pena", name: "Nicole Dela Pena", initials: "ND", studentId: "23-1023-441", section: "BSN 3A", area: "Medical Ward", site: "Vicente Mendiola Center for Health Infirmary" },
  { id: "zander-aligato", name: "Zander Aligato", initials: "ZA", studentId: "21-7740-118", section: "BSN 3B", area: "Emergency Room", site: "CCMC" },
  { id: "hannah-bautista", name: "Hannah Bautista", initials: "HB", studentId: "22-2451-667", section: "BSN 3B", area: "Pedia Pulmo Ward", site: "CCMC" },
  { id: "andrea-gomez", name: "Andrea Gomez", initials: "AG", studentId: "20-4408-332", section: "BSN 4A", area: "Emergency Room", site: "Vicente Mendiola Center for Health Infirmary" },
  { id: "sean-villamor", name: "Sean Villamor", initials: "SV", studentId: "23-9055-310", section: "BSN 3C", area: "Dialysis Center", site: "Healing Hands Dialysis Center" }
];

const manualAttendanceCis = [
  {
    slug: "patricia-reyes",
    name: "Patricia Reyes, RN, MAN",
    initials: "PR",
    assignment: "CCMC - Emergency Room",
    email: "reyes@cit.edu"
  },
  {
    slug: "miguel-santos",
    name: "Miguel Santos, RN, MAN",
    initials: "MS",
    assignment: "CCMC - Pedia Pulmo Ward",
    email: "miguel.santos@cit.edu"
  },
  {
    slug: "elena-dela-cruz",
    name: "Elena Dela Cruz, RN, MN",
    initials: "ED",
    assignment: "CHN Brgy. Dumlog - Community Health",
    email: "elena.delacruz@cit.edu"
  }
];

let manualAttendanceSelected = [];
let manualAttendanceEditingId = "";

const statusDetails = {
  present: {
    label: "Present",
    badgeClass: "status-verified"
  },
  overtime: {
    label: "Overtime",
    badgeClass: "status-pending"
  }
};

const defaultManualAttendanceSubmissions = [
  {
    id: "manual-attendance-sample",
    status: "pending",
    submittedAt: "May 3, 2026, 8:18 PM",
    submittedBy: "Patricia Reyes, RN, MAN",
    submittedBySlug: "patricia-reyes",
    dutyDate: "2026-05-08",
    shiftStart: "07:00",
    shiftEnd: "15:00",
    site: "CCMC",
    area: "Emergency Room",
    notes: "Manual attendance encoded because the CI phone was unavailable during the duty shift.",
    students: [
      { id: "maria-cruz", name: "Maria Cruz", initials: "MC", studentId: "12-3456-789", section: "BSN 3A", area: "Emergency Room", status: "Present", checkIn: "06:54", checkOut: "15:05" },
      { id: "josh-anton-nuevas", name: "Josh Anton Nuevas", initials: "JA", studentId: "21-5589-201", section: "BSN 3A", area: "Emergency Room", status: "Present", checkIn: "07:02", checkOut: "15:00" }
    ]
  },
  {
    id: "manual-attendance-pending-sample-2",
    status: "pending",
    submittedAt: "May 2, 2026, 6:42 PM",
    submittedBy: "Patricia Reyes, RN, MAN",
    submittedBySlug: "patricia-reyes",
    dutyDate: "2026-05-06",
    shiftStart: "07:00",
    shiftEnd: "15:00",
    site: "CCMC",
    area: "Delivery Room",
    notes: "Manual record encoded after scanner access was unavailable during post-duty logging.",
    students: [
      { id: "treasure-abadinas", name: "Treasure Abadinas", initials: "TA", studentId: "22-1845-103", section: "BSN 3A", area: "Delivery Room", status: "Present", checkIn: "06:58", checkOut: "15:00" },
      { id: "nicole-dela-pena", name: "Nicole Dela Pena", initials: "ND", studentId: "23-1023-441", section: "BSN 3A", area: "Delivery Room", status: "Present", checkIn: "07:04", checkOut: "15:08" }
    ]
  },
  {
    id: "manual-attendance-approved-sample",
    status: "accepted",
    submittedAt: "April 29, 2026, 5:36 PM",
    submittedBy: "Patricia Reyes, RN, MAN",
    submittedBySlug: "patricia-reyes",
    reviewedAt: "April 30, 2026, 9:10 AM",
    reviewedBy: "Reyes, Chair",
    dutyDate: "2026-04-29",
    shiftStart: "07:00",
    shiftEnd: "15:00",
    site: "CCMC",
    area: "Emergency Room",
    notes: "Backup record matched the CI logbook and duty roster.",
    students: [
      { id: "maria-cruz", name: "Maria Cruz", initials: "MC", studentId: "12-3456-789", section: "BSN 3A", area: "Emergency Room", status: "Present", checkIn: "06:57", checkOut: "15:03" }
    ]
  },
  {
    id: "manual-attendance-returned-sample",
    status: "rejected",
    submittedAt: "April 24, 2026, 4:18 PM",
    submittedBy: "Patricia Reyes, RN, MAN",
    submittedBySlug: "patricia-reyes",
    reviewedAt: "April 25, 2026, 10:22 AM",
    reviewedBy: "Admin Santos",
    dutyDate: "2026-04-24",
    shiftStart: "07:00",
    shiftEnd: "15:00",
    site: "CCMC",
    area: "Medical Ward",
    notes: "Returned because one student check-out time did not match the ward log.",
    students: [
      { id: "carlo-fernandez", name: "Carlo Fernandez", initials: "CF", studentId: "23-1188-902", section: "BSN 3A", area: "Medical Ward", status: "Present", checkIn: "07:01", checkOut: "14:12" },
      { id: "nicole-dela-pena", name: "Nicole Dela Pena", initials: "ND", studentId: "23-1023-441", section: "BSN 3A", area: "Medical Ward", status: "Present", checkIn: "07:00", checkOut: "15:00" }
    ]
  }
];

function cloneManualAttendanceSubmission(submission) {
  return {
    ...submission,
    students: (submission.students || []).map((student) => ({ ...student }))
  };
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getManualAttendanceSubmissions() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(MANUAL_ATTENDANCE_KEY) || "null");
    if (Array.isArray(stored)) {
      const storedSubmissions = stored.map(cloneManualAttendanceSubmission);
      const storedIds = new Set(storedSubmissions.map((submission) => submission.id));
      const missingDefaults = defaultManualAttendanceSubmissions
        .filter((submission) => !storedIds.has(submission.id))
        .map(cloneManualAttendanceSubmission);
      return [...storedSubmissions, ...missingDefaults];
    }

    return defaultManualAttendanceSubmissions.map(cloneManualAttendanceSubmission);
  } catch (error) {
    return defaultManualAttendanceSubmissions.map(cloneManualAttendanceSubmission);
  }
}

function getManualAttendanceCiSlug(submission) {
  if (submission.submittedBySlug) {
    return submission.submittedBySlug;
  }

  const submittedBy = String(submission.submittedBy || "").toLowerCase();
  const matched = manualAttendanceCis.find((ci) => submittedBy.includes(ci.name.split(",")[0].toLowerCase()));
  return matched?.slug || "patricia-reyes";
}

function getSelectedManualAttendanceCiSlug() {
  return new URLSearchParams(window.location.search).get("ci") || "";
}

function getSelectedManualAttendanceRecordId() {
  return new URLSearchParams(window.location.search).get("record") || "";
}

function saveManualAttendanceSubmissions(submissions) {
  try {
    window.localStorage.setItem(MANUAL_ATTENDANCE_KEY, JSON.stringify(submissions));
  } catch (error) {
    return false;
  }

  return true;
}

function formatManualDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
    return value || "Not set";
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function formatManualTime(value) {
  const match = String(value || "").match(/^(\d{2}):(\d{2})$/);

  if (!match) {
    return value || "Not set";
  }

  let hour = Number(match[1]);
  const minute = match[2];
  const period = hour >= 12 ? "PM" : "AM";
  hour %= 12;

  return `${hour || 12}:${minute} ${period}`;
}

function formatManualShift(start, end) {
  return `${formatManualTime(start)} - ${formatManualTime(end)}`;
}

function formatManualSubmittedAt() {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date());
}

function manualAttendanceBadgeClass(status) {
  if (status === "accepted") {
    return "status-verified";
  }

  if (status === "rejected" || status === "returned") {
    return "status-rejected";
  }

  return "status-pending";
}

function manualAttendanceStatusLabel(status) {
  if (status === "accepted") {
    return "Approved";
  }

  if (status === "rejected" || status === "returned") {
    return "Returned";
  }

  return "Pending Review";
}

function manualAttendanceRecordNote(submission) {
  if (submission.status === "pending") {
    return "Awaiting Chair or Admin review.";
  }

  return `${manualAttendanceStatusLabel(submission.status)} by ${escapeHtml(submission.reviewedBy || "reviewer")} ${submission.reviewedAt ? `on ${escapeHtml(submission.reviewedAt)}` : ""}.`;
}

function isManualAttendancePending(submission) {
  return submission.status === "pending";
}

function renderManualAttendanceCard(submission, options = {}) {
  const ciSlug = options.ciSlug || getManualAttendanceCiSlug(submission);
  const detailHref = `manual-attendance-review.html?ci=${encodeURIComponent(ciSlug)}&record=${encodeURIComponent(submission.id)}`;

  return `
    <a class="manual-attendance-history-item manual-attendance-review-link is-editable" href="${detailHref}" data-manual-attendance-submission="${submission.id}">
      <span class="avatar small-avatar">${escapeHtml((submission.submittedBy || "CI").split(" ").map((part) => part[0]).join("").slice(0, 2) || "CI")}</span>
      <span>
        <strong>${formatManualDate(submission.dutyDate)} Attendance</strong>
        <small>${escapeHtml(submission.site)} - ${escapeHtml(submission.area)} - ${formatManualShift(submission.shiftStart, submission.shiftEnd)}</small>
        <small>Encoded ${escapeHtml(submission.submittedAt)}</small>
      </span>
      <span class="manual-attendance-history-actions">
        <mark class="status-badge ${manualAttendanceBadgeClass(submission.status)}">${manualAttendanceStatusLabel(submission.status)}</mark>
      </span>
    </a>
  `;
}

function updateManualAttendanceMessage(message, kind = "info") {
  const messageBox = document.querySelector("#manual-attendance-message");

  if (!messageBox) {
    return;
  }

  messageBox.textContent = message;
  messageBox.classList.toggle("is-success", kind === "success");
  messageBox.classList.toggle("is-error", kind === "error");
}

function renderManualAttendanceStudentResults() {
  const results = document.querySelector("#manual-attendance-student-results");
  const search = document.querySelector("#manual-attendance-student-search");

  if (!results || !search) {
    return;
  }

  const selectedIds = new Set(manualAttendanceSelected.map((student) => student.id));
  const query = search.value.trim().toLowerCase();

  if (!query) {
    results.innerHTML = "";
    return;
  }

  const matches = manualAttendanceStudents
    .filter((student) => !selectedIds.has(student.id))
    .filter((student) => {
      const searchable = `${student.name} ${student.studentId} ${student.section} ${student.site}`.toLowerCase();
      return searchable.includes(query);
    })
    .slice(0, 6);

  results.innerHTML = matches.length ? matches.map((student) => `
    <button class="manual-attendance-student-option" type="button" data-manual-add-student="${student.id}">
      <span class="avatar small-avatar">${student.initials}</span>
      <span>
        <strong>${escapeHtml(student.name)}</strong>
        <small>${escapeHtml(student.section)} - ${escapeHtml(student.studentId)}</small>
      </span>
      <mark class="status-badge status-pending">Add</mark>
    </button>
  `).join("") : `<div class="empty-state compact-empty">No students match the search.</div>`;
}

function renderManualAttendanceSelectedStudents() {
  const selectedList = document.querySelector("#manual-attendance-selected-list");
  const selectedCount = document.querySelector("#manual-attendance-selected-count");

  if (!selectedList) {
    return;
  }

  if (selectedCount) {
    selectedCount.textContent = `${manualAttendanceSelected.length} selected`;
  }

  if (!manualAttendanceSelected.length) {
    selectedList.innerHTML = `<div class="empty-state compact-empty">Search and add students to encode attendance.</div>`;
    return;
  }

  selectedList.innerHTML = manualAttendanceSelected.map((student) => `
    <article class="manual-attendance-selected-card" data-manual-selected-student="${student.id}">
      <div class="manual-attendance-selected-head">
        <span class="avatar small-avatar">${student.initials}</span>
        <span>
          <strong>${escapeHtml(student.name)}</strong>
          <small>${escapeHtml(student.section)} - ${escapeHtml(student.studentId)}</small>
        </span>
        <button class="icon-button" type="button" data-manual-remove-student="${student.id}" aria-label="Remove ${escapeHtml(student.name)}">&times;</button>
      </div>

      <div class="manual-attendance-time-grid">
        <label class="form-label">Status
          <select data-manual-attendance-field="status" data-manual-attendance-student="${student.id}">
            ${["Present", "Late", "Excused", "Absent"].map((status) => `<option${student.status === status ? " selected" : ""}>${status}</option>`).join("")}
          </select>
        </label>
        <label class="form-label">Check-in
          <input type="time" value="${student.checkIn || ""}" data-manual-attendance-field="checkIn" data-manual-attendance-student="${student.id}">
        </label>
        <label class="form-label">Check-out
          <input type="time" value="${student.checkOut || ""}" data-manual-attendance-field="checkOut" data-manual-attendance-student="${student.id}">
        </label>
      </div>
    </article>
  `).join("");
}

function addManualAttendanceStudent(studentId) {
  const student = manualAttendanceStudents.find((item) => item.id === studentId);

  if (!student || manualAttendanceSelected.some((item) => item.id === student.id)) {
    return;
  }

  manualAttendanceSelected.push({
    ...student,
    status: "Present",
    checkIn: "07:00",
    checkOut: "15:00"
  });

  renderManualAttendanceStudentResults();
  renderManualAttendanceSelectedStudents();
}

function updateManualAttendanceSelectedStudent(studentId, field, value) {
  const student = manualAttendanceSelected.find((item) => item.id === studentId);

  if (student) {
    student[field] = value;
  }
}

function setManualAttendanceFormValue(selector, value) {
  const field = document.querySelector(selector);

  if (field) {
    field.value = value || "";
  }
}

function resetManualAttendanceEditState() {
  manualAttendanceEditingId = "";
  const submitButton = document.querySelector("#manual-attendance-submit");
  const cancelButton = document.querySelector("#manual-attendance-cancel-edit");

  if (submitButton) {
    submitButton.textContent = "Send Record for Review";
  }

  if (cancelButton) {
    cancelButton.hidden = true;
  }
}

function loadManualAttendanceRecordForEdit(recordId) {
  const record = getManualAttendanceSubmissions().find((submission) => submission.id === recordId);

  if (!record) {
    updateManualAttendanceMessage("This manual attendance record could not be found.", "error");
    return;
  }

  if (record.status !== "pending") {
    window.location.href = "manual-attendance.html";
    return;
  }

  manualAttendanceEditingId = record.id;
  manualAttendanceSelected = record.students.map((student) => ({ ...student }));

  setManualAttendanceFormValue("#manual-attendance-duty-date", record.dutyDate);
  setManualAttendanceFormValue("#manual-attendance-shift-start", record.shiftStart);
  setManualAttendanceFormValue("#manual-attendance-shift-end", record.shiftEnd);
  setManualAttendanceFormValue("#manual-attendance-site", record.site);
  setManualAttendanceFormValue("#manual-attendance-area", record.area);
  setManualAttendanceFormValue("#manual-attendance-notes", record.notes);

  const submitButton = document.querySelector("#manual-attendance-submit");
  const cancelButton = document.querySelector("#manual-attendance-cancel-edit");
  if (submitButton) {
    submitButton.textContent = "Update Pending Record";
  }

  if (cancelButton) {
    cancelButton.hidden = false;
  }

  renderManualAttendanceStudentResults();
  renderManualAttendanceSelectedStudents();
  const messageBox = document.querySelector("#manual-attendance-message");
  if (messageBox) {
    messageBox.textContent = "Update the pending manual record, then send the revised record for review.";
    messageBox.classList.remove("is-success", "is-error");
  }
  document.querySelector("[data-manual-attendance-entry]")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function submitManualAttendance() {
  const dutyDate = document.querySelector("#manual-attendance-duty-date")?.value || "";
  const shiftStart = document.querySelector("#manual-attendance-shift-start")?.value || "";
  const shiftEnd = document.querySelector("#manual-attendance-shift-end")?.value || "";
  const site = document.querySelector("#manual-attendance-site")?.value || "";
  const area = document.querySelector("#manual-attendance-area")?.value || "";
  const notes = document.querySelector("#manual-attendance-notes")?.value.trim() || "";

  if (!dutyDate || !shiftStart || !shiftEnd || !site || !area) {
    updateManualAttendanceMessage("Complete the duty date, shift time, site, and duty area before sending the record.", "error");
    return;
  }

  if (!manualAttendanceSelected.length) {
    updateManualAttendanceMessage("Add at least one student before sending this manual record.", "error");
    return;
  }

  const submissions = getManualAttendanceSubmissions();
  const existingRecord = manualAttendanceEditingId ? submissions.find((item) => item.id === manualAttendanceEditingId) : null;

  if (manualAttendanceEditingId && (!existingRecord || existingRecord.status !== "pending")) {
    updateManualAttendanceMessage("This record is no longer pending, so it cannot be edited from the CI side.", "error");
    return;
  }

  const submission = {
    id: `manual-attendance-${Date.now()}`,
    status: "pending",
    submittedAt: formatManualSubmittedAt(),
    submittedBy: "Patricia Reyes, RN, MAN",
    submittedBySlug: "patricia-reyes",
    dutyDate,
    shiftStart,
    shiftEnd,
    site,
    area,
    notes: notes || "Manual attendance encoded by the assigned clinical instructor.",
    students: manualAttendanceSelected.map((student) => ({ ...student }))
  };

  const nextSubmissions = manualAttendanceEditingId
    ? submissions.map((item) => item.id === manualAttendanceEditingId ? { ...submission, id: item.id } : item)
    : [submission, ...submissions];
  const wasEditing = Boolean(manualAttendanceEditingId);

  if (!saveManualAttendanceSubmissions(nextSubmissions)) {
    updateManualAttendanceMessage("Unable to save manual attendance in this browser.", "error");
    return;
  }

  if (wasEditing) {
    window.location.href = "manual-attendance.html";
    return;
  }

  manualAttendanceSelected = [];
  resetManualAttendanceEditState();
  renderManualAttendanceStudentResults();
  renderManualAttendanceSelectedStudents();
  renderManualAttendanceCiHistory();
  updateManualAttendanceMessage(wasEditing ? "Pending manual attendance record updated for review." : "Manual attendance record sent for Chair and Admin review.", "success");

  const notesField = document.querySelector("#manual-attendance-notes");
  if (notesField) {
    notesField.value = "";
  }
}

function renderManualAttendanceCiHistory() {
  const list = document.querySelector("#manual-attendance-ci-history-list");
  const count = document.querySelector("#manual-attendance-ci-history-count");
  const empty = document.querySelector("#manual-attendance-ci-history-empty");

  if (!list) {
    return;
  }

  const history = getManualAttendanceSubmissions()
    .filter((submission) => getManualAttendanceCiSlug(submission) === "patricia-reyes");

  if (count) {
    count.textContent = `${history.length} record${history.length === 1 ? "" : "s"}`;
  }

  if (empty) {
    empty.hidden = history.length > 0;
  }

  list.innerHTML = history.map((submission) => {
    const isEditable = submission.status === "pending";

    return `
    <button class="manual-attendance-history-item${isEditable ? " is-editable" : " is-locked"}" type="button" ${isEditable ? `data-manual-edit-record="${submission.id}"` : `data-manual-locked-record="${submission.id}" data-manual-locked-status="${submission.status}"`}>
      <span class="avatar small-avatar">PR</span>
      <span>
        <strong>${formatManualDate(submission.dutyDate)} Attendance</strong>
        <small>${escapeHtml(submission.site)} - ${escapeHtml(submission.area)} - ${formatManualShift(submission.shiftStart, submission.shiftEnd)}</small>
        <small>${manualAttendanceRecordNote(submission)}</small>
      </span>
      <span class="manual-attendance-history-actions">
        <mark class="status-badge ${manualAttendanceBadgeClass(submission.status)}">${manualAttendanceStatusLabel(submission.status)}</mark>
      </span>
    </button>
  `;
  }).join("");
}

function renderManualAttendanceCiRecordDetail(recordId) {
  const workspace = document.querySelector("main.workspace");
  const submission = getManualAttendanceSubmissions()
    .find((item) => item.id === recordId && getManualAttendanceCiSlug(item) === "patricia-reyes");

  if (!workspace) {
    return;
  }

  if (!submission) {
    workspace.innerHTML = `
      <section class="workspace-panel manual-attendance-review-panel" data-manual-attendance-entry>
        <div class="panel-heading">
          <div>
            <h2>Record Not Found</h2>
          </div>
        </div>
        <div class="empty-state">This manual attendance record could not be found.</div>
      </section>
    `;
    return;
  }

  workspace.innerHTML = `
    <section class="manual-attendance-review-detail" data-manual-attendance-entry>
      <article class="workspace-panel student-progress-search-panel manual-attendance-ci-profile">
        <div class="panel-heading">
          <div>
            <h2>${formatManualDate(submission.dutyDate)} Attendance</h2>
          </div>
        </div>

        <div class="student-validation-card no-margin">
          <div class="avatar">PR</div>
          <div>
            <strong>${escapeHtml(submission.site)} - ${escapeHtml(submission.area)}</strong>
            <p>Encoded ${escapeHtml(submission.submittedAt)}</p>
          </div>
          <span class="status-badge ${manualAttendanceBadgeClass(submission.status)}">${manualAttendanceStatusLabel(submission.status)}</span>
        </div>
      </article>

      <section class="workspace-panel manual-attendance-review-panel manual-attendance-record-panel">
        <div class="panel-heading">
          <div>
            <h2>Record Details</h2>
          </div>
        </div>

        <div class="manual-attendance-review-summary">
          <div><span>Duty Date</span><strong>${formatManualDate(submission.dutyDate)}</strong></div>
          <div><span>Shift Time</span><strong>${formatManualShift(submission.shiftStart, submission.shiftEnd)}</strong></div>
          <div><span>Encoded By</span><strong>${escapeHtml(submission.submittedBy)}</strong></div>
          <div><span>Review Status</span><strong>${manualAttendanceRecordNote(submission)}</strong></div>
          <div class="manual-attendance-note-tile"><span>Instructor Note</span><strong>${escapeHtml(submission.notes || "No note added.")}</strong></div>
        </div>

        <div class="manual-attendance-student-table" role="table" aria-label="Manual attendance student records">
          <div class="manual-attendance-student-table-row manual-attendance-student-table-head" role="row">
            <span role="columnheader">Student</span>
            <span role="columnheader">Section / ID</span>
            <span role="columnheader">Status</span>
            <span role="columnheader">Check-in</span>
            <span role="columnheader">Check-out</span>
          </div>
          ${submission.students.map((student) => `
            <div class="manual-attendance-student-table-row" role="row">
              <span role="cell">
                <span class="avatar small-avatar">${escapeHtml(student.initials)}</span>
                <strong>${escapeHtml(student.name)}</strong>
              </span>
              <span role="cell">${escapeHtml(student.section)} - ${escapeHtml(student.studentId)}</span>
              <span role="cell">${escapeHtml(student.status)}</span>
              <span role="cell">${formatManualTime(student.checkIn)}</span>
              <span role="cell">${formatManualTime(student.checkOut)}</span>
            </div>
          `).join("")}
        </div>
      </section>
    </section>
  `;
}

function renderManualAttendanceEntry() {
  const workspace = document.querySelector("main.workspace");
  const editRecordId = getSelectedManualAttendanceRecordId();
  const isReviewOnly = new URLSearchParams(window.location.search).get("view") === "1";

  if (!isCiManualAttendancePage || !workspace || document.querySelector("[data-manual-attendance-entry]")) {
    return;
  }

  if (editRecordId && isReviewOnly) {
    renderManualAttendanceCiRecordDetail(editRecordId);
    return;
  }

  workspace.insertAdjacentHTML("beforeend", `
    <section class="manual-attendance-layout" data-manual-attendance-entry>
      <article class="workspace-panel manual-attendance-panel">
        <div class="panel-heading">
          <div>
            <h2>Encode Attendance</h2>
          </div>
        </div>

        <div class="manual-attendance-duty-grid">
          <label class="form-label">Duty date
            <input id="manual-attendance-duty-date" type="date" value="2026-05-08">
          </label>
          <label class="form-label">Duty area
            <select id="manual-attendance-area">
              <option>Emergency Room</option>
              <option>Delivery Room</option>
              <option>Operating Room</option>
              <option>Medical Ward</option>
              <option>Pedia Pulmo Ward</option>
              <option>Community Health Nursing Area</option>
              <option>Dialysis Center</option>
            </select>
          </label>
          <label class="form-label">Shift start
            <input id="manual-attendance-shift-start" type="time" value="07:00">
          </label>
          <label class="form-label">Shift end
            <input id="manual-attendance-shift-end" type="time" value="15:00">
          </label>
          <label class="form-label manual-attendance-site-field">Clinical site
            <select id="manual-attendance-site">
              <option>CCMC</option>
              <option>VSMMC</option>
              <option>CHN Brgy. Dumlog</option>
              <option>CSMC</option>
              <option>Vicente Mendiola Center for Health Infirmary</option>
              <option>Healing Hands Dialysis Center</option>
            </select>
          </label>
        </div>

        <label class="form-label manual-attendance-notes-field">Instructor note
          <textarea id="manual-attendance-notes" rows="4" placeholder="Add why this attendance was encoded manually"></textarea>
        </label>

        <div id="manual-attendance-message" class="form-message" role="status" aria-live="polite">
          Add students, encode their time, then send the record for Chair and Admin review.
        </div>

        <div class="button-row manual-attendance-actions">
          <button class="ghost-button" type="button" id="manual-attendance-cancel-edit" hidden>Cancel Edit</button>
          <button class="primary-button workspace-action" type="button" id="manual-attendance-submit">Send Record for Review</button>
        </div>
      </article>

      <article class="workspace-panel manual-attendance-panel">
        <div class="panel-heading">
          <div>
            <h2>Add Students</h2>
          </div>
          <span class="status-badge status-pending" id="manual-attendance-selected-count">0 selected</span>
        </div>

        <label class="form-label">Search student
          <input id="manual-attendance-student-search" type="search" placeholder="Search name, ID, section, or site">
        </label>

        <div class="manual-attendance-student-results" id="manual-attendance-student-results"></div>
        <div class="manual-attendance-selected-list" id="manual-attendance-selected-list"></div>
      </article>
    </section>

    ${editRecordId ? "" : `
    <section class="workspace-panel manual-attendance-history-panel">
      <div class="panel-heading">
        <div>
          <h2>Manual Attendance Records</h2>
        </div>
        <span class="status-badge status-verified" id="manual-attendance-ci-history-count">0 records</span>
      </div>

      <div class="manual-attendance-history-list" id="manual-attendance-ci-history-list"></div>
      <div class="empty-state" id="manual-attendance-ci-history-empty" hidden>No manual attendance records yet.</div>
    </section>
    `}
  `);

  renderManualAttendanceStudentResults();
  renderManualAttendanceSelectedStudents();

  if (!editRecordId) {
    renderManualAttendanceCiHistory();
  }

  document.querySelector("#manual-attendance-student-search")?.addEventListener("input", renderManualAttendanceStudentResults);
  document.querySelector("#manual-attendance-submit")?.addEventListener("click", submitManualAttendance);
  document.querySelector("#manual-attendance-cancel-edit")?.addEventListener("click", () => {
    window.location.href = "manual-attendance.html";
  });

  document.querySelector("#manual-attendance-student-results")?.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-manual-add-student]");

    if (addButton) {
      addManualAttendanceStudent(addButton.dataset.manualAddStudent);
    }
  });

  document.querySelector("#manual-attendance-selected-list")?.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-manual-remove-student]");

    if (!removeButton) {
      return;
    }

    manualAttendanceSelected = manualAttendanceSelected.filter((student) => student.id !== removeButton.dataset.manualRemoveStudent);
    renderManualAttendanceStudentResults();
    renderManualAttendanceSelectedStudents();
  });

  if (!editRecordId) {
    document.querySelector("#manual-attendance-ci-history-list")?.addEventListener("click", (event) => {
      const editButton = event.target.closest("[data-manual-edit-record]");
      const lockedButton = event.target.closest("[data-manual-locked-record]");

      if (editButton) {
        window.location.href = `manual-attendance.html?record=${encodeURIComponent(editButton.dataset.manualEditRecord)}`;
        return;
      }

      if (lockedButton) {
        window.location.href = `manual-attendance.html?record=${encodeURIComponent(lockedButton.dataset.manualLockedRecord)}&view=1`;
      }
    });
  }

  document.querySelector("#manual-attendance-selected-list")?.addEventListener("input", (event) => {
    const field = event.target.dataset.manualAttendanceField;
    const studentId = event.target.dataset.manualAttendanceStudent;

    if (field && studentId) {
      updateManualAttendanceSelectedStudent(studentId, field, event.target.value);
    }
  });

  if (editRecordId) {
    loadManualAttendanceRecordForEdit(editRecordId);
  }
}

function renderManualAttendanceReviewList(ciSlug = getSelectedManualAttendanceCiSlug()) {
  const list = document.querySelector("#manual-attendance-review-list");
  const historyList = document.querySelector("#manual-attendance-history-list");
  const count = document.querySelector("#manual-attendance-review-count");
  const empty = document.querySelector("#manual-attendance-review-empty");
  const historyEmpty = document.querySelector("#manual-attendance-history-empty");
  const historyCount = document.querySelector("#manual-attendance-history-count");
  const profileSummary = document.querySelector("#manual-attendance-ci-profile-summary");

  if (!list) {
    return;
  }

  const submissions = getManualAttendanceSubmissions().filter((submission) => !ciSlug || getManualAttendanceCiSlug(submission) === ciSlug);
  const pendingSubmissions = submissions.filter(isManualAttendancePending);
  const historySubmissions = submissions.filter((submission) => !isManualAttendancePending(submission));

  if (count) {
    count.textContent = `${pendingSubmissions.length} pending`;
  }

  if (profileSummary) {
    profileSummary.textContent = `${submissions.length} encoded attendance record${submissions.length === 1 ? "" : "s"} - ${pendingSubmissions.length} pending`;
  }

  if (empty) {
    empty.hidden = pendingSubmissions.length > 0;
  }

  list.innerHTML = pendingSubmissions.map((submission) => renderManualAttendanceCard(submission, { ciSlug })).join("");

  if (historyList) {
    historyList.innerHTML = historySubmissions.map((submission) => renderManualAttendanceCard(submission, { ciSlug })).join("");
  }

  if (historyCount) {
    historyCount.textContent = `${historySubmissions.length} record${historySubmissions.length === 1 ? "" : "s"}`;
  }

  if (historyEmpty) {
    historyEmpty.hidden = historySubmissions.length > 0;
  }
}

function updateManualAttendanceDecision(id, decision) {
  const submissions = getManualAttendanceSubmissions();
  const target = submissions.find((submission) => submission.id === id);

  if (!target) {
    return;
  }

  target.status = decision;
  target.reviewedAt = formatManualSubmittedAt();
  target.reviewedBy = signedRole === "admin" ? "Admin Santos" : "Reyes, Chair";
  saveManualAttendanceSubmissions(submissions);

  const selectedRecordId = getSelectedManualAttendanceRecordId();

  if (selectedRecordId) {
    renderManualAttendanceRecordDetail(getSelectedManualAttendanceCiSlug() || getManualAttendanceCiSlug(target), selectedRecordId);
    return;
  }

  renderManualAttendanceReviewList();
}

function renderManualAttendanceCiLookup() {
  const workspace = document.querySelector("main.workspace");

  if (!workspace) {
    return;
  }

  const submissions = getManualAttendanceSubmissions();
  const ciCards = manualAttendanceCis.map((ci) => {
    const ciSubmissions = submissions.filter((submission) => getManualAttendanceCiSlug(submission) === ci.slug);
    const pending = ciSubmissions.filter((submission) => submission.status === "pending").length;
    const latest = ciSubmissions[0]?.submittedAt || "No manual record encoded yet";
    const assignmentGroup = ci.assignment.split(" - ")[0];
    const statusKey = pending > 0 ? "Pending review" : ciSubmissions.length > 0 ? "Reviewed" : "No records";

    return {
      ...ci,
      assignmentGroup,
      count: ciSubmissions.length,
      pending,
      latest,
      badgeClass: pending > 0 ? "status-pending" : ciSubmissions.length > 0 ? "status-verified" : "status-muted",
      badgeText: pending > 0 ? `${pending} pending` : ciSubmissions.length > 0 ? "Reviewed" : "No records yet",
      statusKey
    };
  });
  const assignmentOptions = [...new Set(ciCards.map((ci) => ci.assignmentGroup))];

  workspace.innerHTML = `
    <section class="workspace-panel student-progress-search-panel manual-attendance-ci-panel" data-manual-attendance-review>
      <div class="panel-heading">
        <div>
          <h2>Clinical Instructor List</h2>
        </div>
        <span class="status-badge status-verified" id="manual-attendance-ci-count">${ciCards.length} visible</span>
      </div>

      <div class="history-filters student-progress-filters manual-attendance-ci-filters" aria-label="Manual attendance CI filters">
        <label class="form-label" for="manual-attendance-ci-search">
          Search
          <input id="manual-attendance-ci-search" type="search" placeholder="Search CI name or attendance records">
        </label>

        <label class="form-label" for="manual-attendance-ci-assignment">
          Assignment
          <select id="manual-attendance-ci-assignment">
            <option value="all">All assignments</option>
            ${assignmentOptions.map((assignment) => `<option value="${escapeHtml(assignment)}">${escapeHtml(assignment)}</option>`).join("")}
          </select>
        </label>

        <label class="form-label" for="manual-attendance-ci-status">
          Status
          <select id="manual-attendance-ci-status">
            <option value="all">All statuses</option>
            <option value="Pending review">Pending review</option>
            <option value="Reviewed">Reviewed</option>
            <option value="No records">No records</option>
          </select>
        </label>
      </div>

      <div class="student-progress-pick-list" id="manual-attendance-ci-list">
        ${ciCards.map((ci) => `
          <a class="student-progress-pick-card manual-attendance-ci-card" href="manual-attendance-review.html?ci=${ci.slug}" data-manual-attendance-ci-card data-name="${escapeHtml(ci.name)}" data-assignment="${escapeHtml(ci.assignmentGroup)}" data-status="${escapeHtml(ci.statusKey)}">
            <span class="avatar small-avatar">${escapeHtml(ci.initials)}</span>
            <span>
              <strong>${escapeHtml(ci.name)}</strong>
              <small>${ci.count} encoded attendance record${ci.count === 1 ? "" : "s"} - Latest: ${escapeHtml(ci.latest)}</small>
            </span>
            <mark class="status-badge ${ci.badgeClass}">${escapeHtml(ci.badgeText)}</mark>
          </a>
        `).join("")}
      </div>

      <div id="manual-attendance-ci-empty" class="empty-state" hidden>No clinical instructors match the search.</div>
    </section>
  `;

  const search = document.querySelector("#manual-attendance-ci-search");
  const assignment = document.querySelector("#manual-attendance-ci-assignment");
  const status = document.querySelector("#manual-attendance-ci-status");
  const cards = Array.from(document.querySelectorAll("[data-manual-attendance-ci-card]"));
  const count = document.querySelector("#manual-attendance-ci-count");
  const empty = document.querySelector("#manual-attendance-ci-empty");

  const filterCiCards = () => {
    const query = search?.value.trim().toLowerCase() || "";
    const assignmentValue = assignment?.value || "all";
    const statusValue = status?.value || "all";
    let visible = 0;

    cards.forEach((card) => {
      const haystack = `${card.dataset.name} ${card.textContent}`.toLowerCase();
      const matches = (!query || haystack.includes(query)) &&
        (assignmentValue === "all" || card.dataset.assignment === assignmentValue) &&
        (statusValue === "all" || card.dataset.status === statusValue);
      card.hidden = !matches;

      if (matches) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = `${visible} visible`;
    }

    if (empty) {
      empty.hidden = visible > 0;
    }
  };

  [search, assignment, status].forEach((control) => {
    control?.addEventListener("input", filterCiCards);
    control?.addEventListener("change", filterCiCards);
  });
  filterCiCards();
}

function renderManualAttendanceRecordDetail(ciSlug, recordId) {
  const workspace = document.querySelector("main.workspace");
  const ci = manualAttendanceCis.find((item) => item.slug === ciSlug) || manualAttendanceCis[0];
  const submission = getManualAttendanceSubmissions().find((item) => item.id === recordId && getManualAttendanceCiSlug(item) === ci.slug);
  const canDecide = !isSupportManualBackupRole || assistantManualBackupAccessEnabled;

  if (!workspace) {
    return;
  }

  if (!submission) {
    workspace.innerHTML = `
      <section class="workspace-panel manual-attendance-review-panel" data-manual-attendance-review>
        <div class="panel-heading">
          <div>
            <p class="section-kicker">Manual Backup</p>
            <h2>Record Not Found</h2>
          </div>
        </div>
        <div class="empty-state">This manual attendance record could not be found.</div>
      </section>
    `;
    return;
  }

  const decisionButtons = canDecide ? [
    submission.status !== "rejected" && submission.status !== "returned"
      ? `<button class="ghost-button danger-button" type="button" data-manual-attendance-decision="rejected" data-manual-attendance-id="${submission.id}">Return Record</button>`
      : "",
    submission.status !== "accepted"
      ? `<button class="primary-button workspace-action" type="button" data-manual-attendance-decision="accepted" data-manual-attendance-id="${submission.id}">Approve Record</button>`
      : ""
  ].filter(Boolean).join("") : "";

  workspace.innerHTML = `
    <section class="manual-attendance-review-detail" data-manual-attendance-review data-manual-attendance-record-detail>
      <article class="workspace-panel student-progress-search-panel manual-attendance-ci-profile">
        <div class="panel-heading">
          <div>
            <h2>${formatManualDate(submission.dutyDate)} Attendance</h2>
          </div>
        </div>

        <div class="student-validation-card no-margin">
          <div class="avatar">${escapeHtml(ci.initials)}</div>
          <div>
            <strong>${escapeHtml(submission.site)} - ${escapeHtml(submission.area)}</strong>
            <p>Encoded ${escapeHtml(submission.submittedAt)}</p>
          </div>
          <span class="status-badge ${manualAttendanceBadgeClass(submission.status)}">${manualAttendanceStatusLabel(submission.status)}</span>
        </div>
      </article>

      <section class="workspace-panel manual-attendance-review-panel manual-attendance-record-panel">
        <div class="panel-heading">
          <div>
            <h2>Record Details</h2>
          </div>
        </div>

        <div class="manual-attendance-review-summary">
          <div><span>Duty Date</span><strong>${formatManualDate(submission.dutyDate)}</strong></div>
          <div><span>Shift Time</span><strong>${formatManualShift(submission.shiftStart, submission.shiftEnd)}</strong></div>
          <div><span>Encoded By</span><strong>${escapeHtml(submission.submittedBy)}</strong></div>
          <div><span>Review Status</span><strong>${manualAttendanceRecordNote(submission)}</strong></div>
          <div class="manual-attendance-note-tile"><span>Instructor Note</span><strong>${escapeHtml(submission.notes || "No note added.")}</strong></div>
        </div>

        <div class="manual-attendance-student-table" role="table" aria-label="Manual attendance student records">
          <div class="manual-attendance-student-table-row manual-attendance-student-table-head" role="row">
            <span role="columnheader">Student</span>
            <span role="columnheader">Section / ID</span>
            <span role="columnheader">Status</span>
            <span role="columnheader">Check-in</span>
            <span role="columnheader">Check-out</span>
          </div>
          ${submission.students.map((student) => `
            <div class="manual-attendance-student-table-row" role="row">
              <span role="cell">
                <span class="avatar small-avatar">${escapeHtml(student.initials)}</span>
                <strong>${escapeHtml(student.name)}</strong>
              </span>
              <span role="cell">${escapeHtml(student.section)} - ${escapeHtml(student.studentId)}</span>
              <span role="cell">${escapeHtml(student.status)}</span>
              <span role="cell">${formatManualTime(student.checkIn)}</span>
              <span role="cell">${formatManualTime(student.checkOut)}</span>
            </div>
          `).join("")}
        </div>

        ${decisionButtons ? `
          <div class="button-row manual-attendance-review-actions">
            ${decisionButtons}
          </div>
        ` : `
          <div class="form-message manual-attendance-review-note">
            ${canDecide ? "This record is already in its final displayed state." : "This role can view manual attendance records, but approval controls are disabled."}
          </div>
        `}
      </section>
    </section>
  `;

  document.querySelector("[data-manual-attendance-record-detail]")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-manual-attendance-decision]");

    if (button) {
      updateManualAttendanceDecision(button.dataset.manualAttendanceId, button.dataset.manualAttendanceDecision);
    }
  });
}

function renderManualAttendanceCiDetail(ciSlug) {
  const workspace = document.querySelector("main.workspace");
  const ci = manualAttendanceCis.find((item) => item.slug === ciSlug) || manualAttendanceCis[0];
  const submissions = getManualAttendanceSubmissions().filter((submission) => getManualAttendanceCiSlug(submission) === ci.slug);
  const pendingCount = submissions.filter(isManualAttendancePending).length;
  const historyCount = submissions.filter((submission) => !isManualAttendancePending(submission)).length;

  if (!workspace) {
    return;
  }

  workspace.innerHTML = `
    <section class="manual-attendance-review-detail" data-manual-attendance-review>
      <article class="workspace-panel manual-attendance-review-panel manual-attendance-ci-profile">
        <div class="panel-heading">
          <div>
            <h2>Manual Backup</h2>
          </div>
        </div>

        <div class="student-validation-card no-margin">
          <div class="avatar">${escapeHtml(ci.initials)}</div>
          <div>
            <strong>${escapeHtml(ci.name)}</strong>
            <p id="manual-attendance-ci-profile-summary">${submissions.length} encoded attendance record${submissions.length === 1 ? "" : "s"} - ${pendingCount} pending</p>
          </div>
        </div>
      </article>

      <section class="workspace-panel manual-attendance-review-panel">
        <div class="panel-heading">
          <div>
            <h2>Records Awaiting Review</h2>
          </div>
          <span class="status-badge status-pending" id="manual-attendance-review-count">${pendingCount} pending</span>
        </div>

        <div id="manual-attendance-review-list" class="manual-attendance-review-list manual-attendance-history-list"></div>
        <div id="manual-attendance-review-empty" class="empty-state" hidden>No manual attendance records are waiting for review.</div>
      </section>

      <section class="workspace-panel manual-attendance-review-panel">
        <div class="panel-heading">
          <div>
            <h2>Manual Attendance Records</h2>
          </div>
          <span class="status-badge status-verified" id="manual-attendance-history-count">${historyCount} records</span>
        </div>

        <div id="manual-attendance-history-list" class="manual-attendance-review-list manual-attendance-history-list"></div>
        <div id="manual-attendance-history-empty" class="empty-state" hidden>No manual attendance records yet.</div>
      </section>
    </section>
  `;

  renderManualAttendanceReviewList(ci.slug);
}

function renderManualAttendanceReviewQueue() {
  const workspace = document.querySelector("main.workspace");

  if (!isAttendanceReviewerPage || !workspace || document.querySelector("[data-manual-attendance-review]")) {
    return;
  }

  const selectedCiSlug = getSelectedManualAttendanceCiSlug();
  const selectedRecordId = getSelectedManualAttendanceRecordId();

  if (selectedCiSlug) {
    if (selectedRecordId) {
      renderManualAttendanceRecordDetail(selectedCiSlug, selectedRecordId);
      return;
    }

    renderManualAttendanceCiDetail(selectedCiSlug);
    return;
  }

  renderManualAttendanceCiLookup();
}

function sortAttendanceAlphabetically() {
  attendanceRows.sort((a, b) => {
    const nameA = a.querySelector("strong").textContent.trim();
    const nameB = b.querySelector("strong").textContent.trim();
    const lastNameA = nameA.split(" ").pop().toLowerCase();
    const lastNameB = nameB.split(" ").pop().toLowerCase();

    return lastNameA.localeCompare(lastNameB);
  });

  attendanceRows.forEach((row) => {
    tableContainer.appendChild(row);
  });
}

function filterAttendance() {
  updateConnectedTimes();

  const site = siteFilter?.value || "all";
  const area = areaFilter?.value || "all";
  const query = attendanceSearch?.value.trim().toLowerCase() || "";
  let shown = 0;

  attendanceRows.forEach((row) => {
    const isConnected = row.dataset.connected === "true";
    const matchesSite = site === "all" || row.dataset.site === site;
    const rowArea = row.dataset.area || row.children[1]?.querySelector("small")?.textContent.trim() || "";
    const matchesArea = area === "all" || rowArea === area;
    const matchesSearch = !query || row.textContent.toLowerCase().includes(query);
    const isVisible = isConnected && matchesSite && matchesArea && matchesSearch;

    row.hidden = !isVisible;

    if (isVisible) {
      shown += 1;
    }
  });

  emptyState.hidden = shown > 0;
}

function updateLiveTime() {
  if (syncPill) {
    syncPill.textContent = "Live now";
  }
}

function parseCheckInTime(value) {
  const match = String(value || "").trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date;
}

function formatConnectedTime(totalMinutes) {
  const safeMinutes = Math.max(0, totalMinutes);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  if (hours <= 0) {
    return `${minutes} min`;
  }

  return `${hours} hr${hours === 1 ? "" : "s"} ${minutes} min`;
}

function setRowStatus(row, status) {
  const details = statusDetails[status] || statusDetails.present;
  const badge = row.querySelector(".status-badge");

  row.dataset.status = status;

  if (badge) {
    badge.textContent = details.label;
    badge.className = `status-badge ${details.badgeClass}`;
  }
}

function updateConnectedTimes() {
  attendanceRows.forEach((row) => {
    const connectedCell = row.querySelector("[data-live-minutes]");

    if (!connectedCell) {
      return;
    }

    const checkInText = row.children[2]?.textContent.trim();
    const checkInDate = parseCheckInTime(checkInText);

    if (!checkInDate) {
      row.dataset.connected = "false";
      connectedCell.textContent = "";
      setRowStatus(row, "present");
      return;
    }

    row.dataset.connected = "true";

    const connectedMinutes = Math.max(0, Math.floor((Date.now() - checkInDate.getTime()) / 60000));
    connectedCell.textContent = formatConnectedTime(connectedMinutes);

    if (connectedMinutes >= OVERTIME_MINUTES) {
      setRowStatus(row, "overtime");
      return;
    }

    setRowStatus(row, "present");
  });
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

if (isLiveAttendancePage && tableContainer && siteFilter && attendanceSearch && emptyState) {
  [siteFilter, areaFilter, attendanceSearch].forEach((control) => {
    control?.addEventListener("input", filterAttendance);
    control?.addEventListener("change", filterAttendance);
  });

  if (siteCards.length > 0) {
    siteCards.forEach((card) => {
      card.addEventListener("click", () => {
        siteCards.forEach((item) => {
          item.classList.toggle("is-active", item === card);
        });

        siteFilter.value = card.dataset.siteJump;
        filterAttendance();
      });
    });
  }

  sortAttendanceAlphabetically();
  updateLiveTime();
  filterAttendance();

  window.setInterval(updateLiveTime, 15000);

  window.setInterval(() => {
    updateConnectedTimes();
    filterAttendance();
  }, 30000);
}

renderManualAttendanceEntry();
renderManualAttendanceReviewQueue();
