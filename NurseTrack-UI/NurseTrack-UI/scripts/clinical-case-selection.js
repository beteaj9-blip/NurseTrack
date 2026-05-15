const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const caseSelectionTable = document.querySelector("#case-selection-table");
const caseSelectionMessage = document.querySelector("#case-selection-message");
const caseSelectionCount = document.querySelector("#case-selection-count");
const caseSelectionStudentStatus = document.querySelector("#case-selection-student-status");
const instructorData = window.NurseTrackInstructorData;

function setText(selector, text) {
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = text;
  }
}

function statusMeta(status) {
  return instructorData?.statusMeta?.[status] || {
    label: status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Pending",
    badgeClass: status === "approved" ? "status-verified" : status === "rejected" ? "status-rejected" : "status-pending"
  };
}

function caseActionLabel(status) {
  return status === "pending" ? "Open" : "View";
}

function renderCaseRows(studentKey) {
  if (!instructorData?.cases || !caseSelectionTable) {
    return;
  }

  const records = instructorData.cases.getByStudent(studentKey);
  const header = caseSelectionTable.querySelector(".history-row-head")?.outerHTML || "";

  caseSelectionTable.innerHTML = header;

  records.forEach((record) => {
    const meta = statusMeta(record.status);
    const row = document.createElement("div");
    const href = instructorData.buildCaseUrl(record.id, {
      from: "selection",
      student: studentKey
    });

    row.className = "history-row case-row";
    row.innerHTML = `
      <span>${record.category}</span>
      <span><strong>${record.procedurePerformed || record.procedure}</strong></span>
      <span><span class="status-badge ${meta.badgeClass}">${meta.label}</span></span>
      <span><strong>${record.shortDate}</strong></span>
      <span><strong>${record.submittedTime}</strong></span>
      <span><a class="text-link" href="${href}">${caseActionLabel(record.status)}</a></span>
    `;

    caseSelectionTable.appendChild(row);
  });

  const pendingCount = records.filter((record) => record.status === "pending").length;

  if (caseSelectionCount) {
    caseSelectionCount.textContent = `${pendingCount} pending case${pendingCount === 1 ? "" : "s"}`;
    caseSelectionCount.className = `status-badge ${pendingCount > 0 ? "status-pending" : "status-verified"}`;
  }

  if (caseSelectionStudentStatus) {
    caseSelectionStudentStatus.textContent = pendingCount > 0 ? "Pending" : "Reviewed";
    caseSelectionStudentStatus.className = `status-badge ${pendingCount > 0 ? "status-pending" : "status-verified"}`;
  }

  if (caseSelectionMessage) {
    caseSelectionMessage.textContent = records.length
      ? `Showing ${records.length} clinical case${records.length === 1 ? "" : "s"} for this student.`
      : "No clinical cases found for this student.";
  }
}

function applySelectedStudent() {
  if (!instructorData?.students) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const studentKey =
    params.get("student") ||
    instructorData.studentKeyFromName(params.get("name")) ||
    "treasure-abadinas";

  const student = instructorData.students[studentKey] || instructorData.students["treasure-abadinas"];

  setText("#case-selection-student-heading", "Student Information");
  setText("#case-selection-avatar", student.initials);
  setText("#case-selection-name", student.name);
  setText("#case-selection-meta", `${student.section} - Student ID ${student.id}`);
  renderCaseRows(studentKey);
}

menuButton?.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop?.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

applySelectedStudent();