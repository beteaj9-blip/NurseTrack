const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const ACCESS_KEY = "nursetrack-clearance-submissions-enabled";
const RECORDS_KEY = "nursetrack-clearance-records";
const instructorData = window.NurseTrackInstructorData;
const pageParams = new URLSearchParams(window.location.search);

const clearanceSearch = document.querySelector("#clearance-search");
const clearanceSection = document.querySelector("#clearance-section");
const clearanceStatus = document.querySelector("#clearance-status");
const clearanceList = document.querySelector("#clearance-student-list");
const clearanceEmpty = document.querySelector("#clearance-empty");
const visibleCount = document.querySelector("#clearance-visible-count");
const accessBadge = document.querySelector("#clearance-access-badge");
const accessToggle = document.querySelector("#clearance-access-toggle");
const accessStat = document.querySelector("#clearance-access-stat");
const accessCopy = document.querySelector("#clearance-access-copy");
const pendingCount = document.querySelector("#clearance-pending-count");
const approvedCount = document.querySelector("#clearance-approved-count");
const approveButton = document.querySelector("#approve-clearance");
const editApprovalButton = document.querySelector("#edit-clearance-approval");
const clearanceConfirmModal = document.querySelector("#clearance-confirm-modal");
const clearanceConfirmCopy = document.querySelector("#clearance-confirm-copy");
const cancelClearanceConfirm = document.querySelector("#cancel-clearance-confirm");
const confirmClearanceApproval = document.querySelector("#confirm-clearance-approval");
const chairNotes = document.querySelector("#clearance-chair-notes");
const detailMessage = document.querySelector("#clearance-detail-message");
const signedRole = window.sessionStorage?.getItem("nursetrackRole") || "";
const ASSISTANT_CLEARANCE_ACCESS_KEY = "nursetrack-assistant-clearance-access";
const assistantClearanceAccessEnabled = window.localStorage?.getItem(ASSISTANT_CLEARANCE_ACCESS_KEY) === "true";
const isSupportClearanceRole = signedRole === "assistant" || signedRole === "coordinator";
const isClearanceReadOnly = isSupportClearanceRole && !assistantClearanceAccessEnabled;

const detail = {
  avatar: document.querySelector("#clearance-detail-avatar"),
  name: document.querySelector("#clearance-detail-name"),
  meta: document.querySelector("#clearance-detail-meta"),
  area: document.querySelector("#clearance-detail-area"),
  standing: document.querySelector("#clearance-detail-standing"),
  submitted: document.querySelector("#clearance-detail-submitted"),
  approved: document.querySelector("#clearance-detail-approved"),
  status: document.querySelector("#clearance-detail-status"),
  caseCopy: document.querySelector("#clearance-case-copy"),
  caseProgress: document.querySelector("#clearance-case-progress"),
  caseBadge: document.querySelector("#clearance-case-badge"),
  pendingCopy: document.querySelector("#clearance-pending-copy"),
  pendingProgress: document.querySelector("#clearance-pending-progress"),
  pendingBadge: document.querySelector("#clearance-pending-badge"),
  submittedCases: document.querySelector("#clearance-submitted-cases"),
  caseCount: document.querySelector("#case-selection-count"),
  caseMessage: document.querySelector("#case-selection-message"),
  decisionAvatar: document.querySelector("#clearance-decision-avatar"),
  decisionName: document.querySelector("#clearance-decision-name"),
  decisionMeta: document.querySelector("#clearance-decision-meta")
};

const fallbackStudents = {
  "maria-cruz": {
    name: "Maria Cruz",
    initials: "MC",
    id: "12-3456-789",
    section: "BSN 3A",
    area: "Emergency Room",
    status: "In progress",
    pending: 14
  }
};

const defaultRecords = {
  "treasure-abadinas": {
    submitted: true,
    submittedAt: "Apr 30, 2026, 9:40 AM",
    schoolYear: "2025-2026",
    semester: "2nd Semester",
    approved: false,
    approvedAt: "",
    chairName: "",
    notes: "Submitted after CI completion review."
  },
  "licheal-ursulo": {
    submitted: true,
    submittedAt: "Apr 29, 2026, 3:20 PM",
    schoolYear: "2025-2026",
    semester: "2nd Semester",
    approved: true,
    approvedAt: "May 1, 2026, 10:15 AM",
    chairName: "Reyes, Chair",
    notes: "All clearance requirements approved."
  }
};

const students = instructorData?.students || fallbackStudents;
const studentKeys = Object.keys(students).sort((a, b) => {
  const lastNameA = (students[a]?.name || "").trim().split(" ").pop().toLowerCase();
  const lastNameB = (students[b]?.name || "").trim().split(" ").pop().toLowerCase();
  return lastNameA.localeCompare(lastNameB);
});
let selectedStudentKey = pageParams.get("student") || "maria-cruz";
let cards = [];

const clearanceSubmittedCases = {
  "maria-cruz": [
    {
      id: "maria-dr-assist-0424",
      group: "DR",
      category: "Major Case - Assist",
      procedure: "Primary Lower Segment Transverse Cesarean Section",
      status: "pending",
      date: "Apr 24, 2026",
      time: "4:35 PM"
    },
    {
      id: "maria-dr-handled-0422",
      group: "DR",
      category: "Handled Case",
      procedure: "Operative Hysteroscopy, Transcervical Resection of Polyp",
      status: "approved",
      date: "Apr 22, 2026",
      time: "11:45 AM"
    },
    {
      id: "maria-or-circulate-0423",
      group: "OR",
      category: "Major Case - Circulate",
      procedure: "Laparoscopic Cholecystectomy",
      status: "approved",
      date: "Apr 23, 2026",
      time: "2:10 PM"
    }
  ]
};

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function loadRecords() {
  try {
    const savedRecords = JSON.parse(window.localStorage.getItem(RECORDS_KEY) || "{}");
    return { ...defaultRecords, ...savedRecords };
  } catch {
    return { ...defaultRecords };
  }
}

function saveRecords(records) {
  window.localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

function isSubmissionOpen() {
  return window.localStorage.getItem(ACCESS_KEY) === "true";
}

function setSubmissionOpen(open) {
  window.localStorage.setItem(ACCESS_KEY, open ? "true" : "false");
}

function formatDate(value) {
  if (value) {
    return value;
  }

  return new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function getRecordStatus(record) {
  if (record?.approved) {
    return "approved";
  }

  if (record?.submitted) {
    return "submitted";
  }

  return "not-submitted";
}

function statusMeta(status) {
  if (status === "approved") {
    return {
      label: "Approved",
      badgeClass: "status-verified"
    };
  }

  if (status === "submitted") {
    return {
      label: "Submitted",
      badgeClass: "status-pending"
    };
  }

  return {
    label: "Not submitted",
    badgeClass: "status-rejected"
  };
}

function caseStatusMeta(status) {
  if (status === "approved") {
    return {
      label: "Approved",
      badgeClass: "status-verified"
    };
  }

  if (status === "rejected" || status === "returned") {
    return {
      label: "Returned",
      badgeClass: "status-rejected"
    };
  }

  return {
    label: "Pending",
    badgeClass: "status-pending"
  };
}

function setDetailMessage(text, state = "") {
  if (!detailMessage) {
    return;
  }

  detailMessage.textContent = text;
  detailMessage.classList.toggle("is-success", state === "success");
  detailMessage.classList.toggle("is-error", state === "error");
}

function closeClearanceConfirmModal() {
  if (!clearanceConfirmModal) {
    return;
  }

  clearanceConfirmModal.hidden = true;
  document.body.classList.remove("modal-open");
}

function openClearanceConfirmModal(student) {
  if (!clearanceConfirmModal) {
    approveSelectedClearance();
    return;
  }

  if (clearanceConfirmCopy) {
    clearanceConfirmCopy.textContent = `Approve clearance for ${student?.name || "this student"}? This will mark the student as cleared for this semester.`;
  }

  clearanceConfirmModal.hidden = false;
  document.body.classList.add("modal-open");
}

function updateAccessState() {
  const open = isSubmissionOpen();

  if (accessBadge) {
    accessBadge.textContent = open ? "Submissions open" : "Submissions closed";
    accessBadge.className = `status-badge ${open ? "status-verified" : "status-pending"}`;
  }

  if (accessToggle) {
    accessToggle.textContent = isClearanceReadOnly ? "View Only" : open ? "Disable submissions" : "Enable submissions";
    accessToggle.disabled = isClearanceReadOnly;
  }

  if (accessStat) {
    accessStat.textContent = open ? "Open" : "Closed";
    accessStat.className = `status-badge ${open ? "status-verified" : "status-pending"}`;
  }

  if (accessCopy) {
    accessCopy.textContent = open
      ? "Students can submit clearance from their Clinical Cases page."
      : "Students cannot submit clearance yet.";
  }
}

function updateSummaryCounts() {
  const records = loadRecords();
  const submitted = Object.values(records).filter((record) => record.submitted && !record.approved).length;
  const approved = Object.values(records).filter((record) => record.approved).length;

  if (pendingCount) {
    pendingCount.textContent = submitted;
  }

  if (approvedCount) {
    approvedCount.textContent = approved;
  }
}

function renderStudentCards() {
  if (!clearanceList) {
    return;
  }

  const records = loadRecords();

  clearanceList.innerHTML = studentKeys.map((studentKey) => {
    const student = students[studentKey];
    const record = records[studentKey] || {};
    const clearanceStatusValue = getRecordStatus(record);
    const meta = statusMeta(clearanceStatusValue);

    return `
      <a class="student-progress-pick-card clearance-student-card"
        href="student-clearance-detail.html?student=${encodeURIComponent(studentKey)}"
        data-clearance-card
        data-student-key="${escapeHtml(studentKey)}"
        data-name="${escapeHtml(student.name)}"
        data-id="${escapeHtml(student.id)}"
        data-section="${escapeHtml(student.section)}"
        data-area="${escapeHtml(student.area || "")}"
        data-standing="${escapeHtml(student.status || "")}"
        data-clearance-status="${clearanceStatusValue}">
        <span class="avatar small-avatar">${escapeHtml(student.initials)}</span>
        <span>
          <strong>${escapeHtml(student.name)}</strong>
          <small>${escapeHtml(student.section)} - ${escapeHtml(student.id)}</small>
          <small>${record.submittedAt ? `Submitted: ${escapeHtml(record.submittedAt)}` : "Waiting for student submission"}</small>
        </span>
        <mark class="status-badge ${meta.badgeClass}">${meta.label}</mark>
      </a>
    `;
  }).join("");

  cards = Array.from(clearanceList.querySelectorAll("[data-clearance-card]"));

  filterCards();
}

function getSubmittedCases(studentKey) {
  if (clearanceSubmittedCases[studentKey]) {
    return clearanceSubmittedCases[studentKey];
  }

  const cases = instructorData?.cases?.getByStudent?.(studentKey) || [];

  return cases.map((caseRecord) => ({
    id: caseRecord.id,
    group: caseRecord.caseGroup || "Clinical Cases",
    category: caseRecord.category || caseRecord.title || "Clinical Case",
    procedure: caseRecord.procedurePerformed || caseRecord.procedure || "Submitted procedure",
    status: caseRecord.status || "pending",
    date: caseRecord.shortDate || caseRecord.submittedDate || caseRecord.date || "Submitted",
    time: caseRecord.submittedTime || "",
    url: instructorData?.buildCaseUrl?.(caseRecord.id, {
      from: "clearance",
      mode: "view",
      student: studentKey
    })
  }));
}

function renderSubmittedCases(studentKey) {
  if (!detail.submittedCases) {
    return;
  }

  const submittedCases = getSubmittedCases(studentKey);

  if (submittedCases.length === 0) {
    detail.submittedCases.innerHTML = `
      <div class="empty-state">
        No submitted clinical cases are available for this student yet.
      </div>
    `;
    return;
  }

  const groups = ["DR", "OR", "Clinical Cases"]
    .map((group) => ({
      group,
      records: submittedCases.filter((caseRecord) => caseRecord.group === group)
    }))
    .filter((groupData) => groupData.records.length > 0);

  detail.submittedCases.innerHTML = groups.map(({ group, records }) => {
    const groupLabel = group === "DR"
      ? "Delivery Room Cases"
      : group === "OR"
        ? "Operating Room Cases"
        : "Clinical Case Records";

    const rows = records.map((caseRecord) => {
      const meta = caseStatusMeta(caseRecord.status);
      const url = caseRecord.url || `clinical-case-selection.html?student=${encodeURIComponent(studentKey)}`;

      return `
        <div class="history-row case-row">
          <span>${escapeHtml(caseRecord.category)}</span>
          <span><strong>${escapeHtml(caseRecord.procedure)}</strong></span>
          <span><span class="status-badge ${meta.badgeClass}">${meta.label}</span></span>
          <span><strong>${escapeHtml(caseRecord.date)}</strong></span>
          <span><strong>${escapeHtml(caseRecord.time || "Recorded")}</strong></span>
          <span><a class="text-link" href="${url}">Open</a></span>
        </div>
      `;
    }).join("");

    return `
      <section class="case-selection-section" aria-label="${groupLabel}">
        <div class="case-selection-title">
          <h3>${group}</h3>
          <span>${groupLabel}</span>
        </div>

        <div class="history-table">
          <div class="history-row history-row-head case-row">
            <span>Category</span>
            <span>Procedure Performed</span>
            <span>Status</span>
            <span>Date</span>
            <span>Time</span>
            <span>Action</span>
          </div>
          ${rows}
        </div>
      </section>
    `;
  }).join("");
}

function updateProgressDetail(studentKey, student) {
  const submittedCases = getSubmittedCases(studentKey);
  const approvedCases = submittedCases.filter((caseRecord) => caseRecord.status === "approved").length;
  const pendingCases = submittedCases.filter((caseRecord) => caseRecord.status !== "approved").length;

  if (detail.caseCount) {
    detail.caseCount.textContent = `${submittedCases.length} submitted case${submittedCases.length === 1 ? "" : "s"}`;
    detail.caseCount.className = `status-badge ${pendingCases > 0 ? "status-pending" : "status-verified"}`;
  }

  if (detail.caseMessage) {
    detail.caseMessage.textContent = `${submittedCases.length} submitted clinical case${submittedCases.length === 1 ? "" : "s"} shown for Chair clearance review.`;
  }

  if (detail.caseCopy) {
    detail.caseCopy.textContent = `${approvedCases} of ${submittedCases.length} submitted clinical cases approved`;
  }

  if (detail.pendingCopy) {
    detail.pendingCopy.textContent = pendingCases === 0
      ? "No pending submitted clinical cases"
      : `${pendingCases} submitted clinical case${pendingCases === 1 ? "" : "s"} still pending`;
  }

  if (detail.pendingBadge) {
    detail.pendingBadge.textContent = pendingCases === 0 ? "Clear" : "Open";
    detail.pendingBadge.className = `status-badge ${pendingCases === 0 ? "status-verified" : "status-pending"}`;
  }

  renderSubmittedCases(studentKey);
}

function selectStudent(studentKey) {
  const student = students[studentKey] || students["maria-cruz"] || Object.values(students)[0];

  if (!student) {
    return;
  }

  selectedStudentKey = studentKey;

  cards.forEach((card) => {
    card.classList.toggle("is-selected", card.dataset.studentKey === selectedStudentKey);
  });

  const records = loadRecords();
  const record = records[selectedStudentKey] || {};
  const clearanceStatusValue = getRecordStatus(record);
  const meta = statusMeta(clearanceStatusValue);

  if (detail.avatar) {
    detail.avatar.textContent = student.initials;
  }

  if (detail.name) {
    detail.name.textContent = student.name;
  }

  if (detail.meta) {
    detail.meta.textContent = `${student.section} - Student ID ${student.id}`;
  }

  if (detail.decisionAvatar) {
    detail.decisionAvatar.textContent = student.initials;
  }

  if (detail.decisionName) {
    detail.decisionName.textContent = student.name;
  }

  if (detail.decisionMeta) {
    detail.decisionMeta.textContent = record.schoolYear && record.semester
      ? `${record.schoolYear} - ${record.semester}`
      : `${student.section} - ${student.area || "Assigned area"}`;
  }

  if (detail.area) {
    detail.area.textContent = student.area || "Assigned area";
  }

  if (detail.standing) {
    detail.standing.textContent = student.status || "In progress";
  }

  if (detail.submitted) {
    detail.submitted.textContent = record.submittedAt || "Not submitted";
  }

  if (detail.approved) {
    detail.approved.textContent = record.approvedAt || "Not approved";
  }

  if (detail.status) {
    detail.status.textContent = meta.label;
    detail.status.className = `status-badge ${meta.badgeClass}`;
  }

  if (chairNotes) {
    chairNotes.value = record.notes || "";
    chairNotes.disabled = isClearanceReadOnly;
  }

  if (approveButton) {
    approveButton.disabled = isClearanceReadOnly || !record.submitted || record.approved;
    approveButton.textContent = record.approved
      ? "Clearance Approved"
      : isClearanceReadOnly
        ? "View Only"
        : record.submitted
        ? "Approve Clearance"
        : "Waiting for Submission";
  }

  if (editApprovalButton) {
    editApprovalButton.hidden = isClearanceReadOnly || !record.approved;
    editApprovalButton.textContent = "Cancel Approval";
  }

  if (isClearanceReadOnly) {
    setDetailMessage("This role can view clearance status but cannot approve or cancel approval.");
  } else if (record.approved) {
    setDetailMessage(`${student.name} is approved and can print clearance.`, "success");
  } else if (record.submitted) {
    setDetailMessage(`${student.name} submitted for clearance. Review and approve when ready.`);
  } else {
    setDetailMessage(`${student.name} has not submitted for clearance yet.`);
  }

  updateProgressDetail(selectedStudentKey, student);
}

function filterCards() {
  const query = clearanceSearch?.value.trim().toLowerCase() || "";
  const section = clearanceSection?.value || "all";
  const status = clearanceStatus?.value || "all";
  let count = 0;

  cards.forEach((card) => {
    const matchesQuery = !query || card.textContent.toLowerCase().includes(query) || Object.values(card.dataset).join(" ").toLowerCase().includes(query);
    const matchesSection = section === "all" || card.dataset.section === section;
    const matchesStatus = status === "all" || card.dataset.clearanceStatus === status;
    const isVisible = matchesQuery && matchesSection && matchesStatus;

    card.hidden = !isVisible;

    if (isVisible) {
      count += 1;
    }
  });

  if (visibleCount) {
    visibleCount.textContent = `${count} visible`;
  }

  if (clearanceEmpty) {
    clearanceEmpty.hidden = count > 0;
  }
}

menuButton?.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop?.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

accessToggle?.addEventListener("click", () => {
  setSubmissionOpen(!isSubmissionOpen());
  updateAccessState();
});

function approveSelectedClearance() {
  if (isClearanceReadOnly) {
    setDetailMessage("This role can view clearance status but cannot approve clearance.", "error");
    return;
  }

  const records = loadRecords();
  const student = students[selectedStudentKey];
  const record = records[selectedStudentKey] || {};

  if (!record.submitted) {
    setDetailMessage("This student must submit for clearance before approval.", "error");
    return;
  }

  records[selectedStudentKey] = {
    ...record,
    submitted: true,
    approved: true,
    approvedAt: formatDate(),
    chairName: signedRole === "admin" ? "Admin Santos" : "Reyes, Chair",
    notes: chairNotes?.value.trim() || "Approved for final clinical clearance."
  };

  saveRecords(records);
  renderStudentCards();
  updateSummaryCounts();
  selectStudent(selectedStudentKey);
  setDetailMessage(`${student.name} is now approved for clearance printing.`, "success");
  closeClearanceConfirmModal();
}

approveButton?.addEventListener("click", () => {
  if (isClearanceReadOnly) {
    setDetailMessage("This role can view clearance status but cannot approve clearance.", "error");
    return;
  }

  const records = loadRecords();
  const student = students[selectedStudentKey];
  const record = records[selectedStudentKey] || {};

  if (!record.submitted) {
    setDetailMessage("This student must submit for clearance before approval.", "error");
    return;
  }

  openClearanceConfirmModal(student);
});

editApprovalButton?.addEventListener("click", () => {
  if (isClearanceReadOnly) {
    setDetailMessage("This role can view clearance status but cannot cancel clearance approval.", "error");
    return;
  }

  const records = loadRecords();
  const student = students[selectedStudentKey];
  const record = records[selectedStudentKey] || {};

  records[selectedStudentKey] = {
    ...record,
    approved: false,
    approvedAt: "",
    chairName: "",
    notes: chairNotes?.value.trim() || record.notes || "Approval cancelled for correction."
  };

  saveRecords(records);
  renderStudentCards();
  updateSummaryCounts();
  selectStudent(selectedStudentKey);
  setDetailMessage(`${student.name}'s clearance approval was cancelled. You can approve it again when ready.`, "success");
});

cancelClearanceConfirm?.addEventListener("click", closeClearanceConfirmModal);
confirmClearanceApproval?.addEventListener("click", approveSelectedClearance);

clearanceConfirmModal?.addEventListener("click", (event) => {
  if (event.target === clearanceConfirmModal) {
    closeClearanceConfirmModal();
  }
});

[clearanceSearch, clearanceSection, clearanceStatus].filter(Boolean).forEach((control) => {
  control.addEventListener("input", filterCards);
});

updateAccessState();
updateSummaryCounts();
renderStudentCards();

if (!clearanceList) {
  selectStudent(selectedStudentKey);
}
