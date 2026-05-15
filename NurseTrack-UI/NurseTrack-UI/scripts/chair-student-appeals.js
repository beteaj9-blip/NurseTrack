const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const selectAllButton = document.querySelector("#appeal-select-all");
const bulkApproveButton = document.querySelector("#appeal-bulk-recommend");
const selectedCountLabel = document.querySelector("#appeal-selected-count");
const sectionFilter = document.querySelector("#appeal-section-filter");
const searchInput = document.querySelector("#appeal-search");
const appealList = document.querySelector("#appeal-card-list");
const appealEmpty = document.querySelector("#appeal-empty");
const appealMessage = document.querySelector("#appeal-message");
const visibleCount = document.querySelector("#appeal-visible-count");
const syncPill = document.querySelector("#appeal-sync-pill");

const STORAGE_KEY = "nursetrack-ci-student-appeals";

let selectedAppealIds = new Set();
let currentVisibleAppeals = [];

const statusMeta = {
  recommended: {
    label: "Pending",
    badgeClass: "status-pending"
  },
  "chair-approved": {
    label: "Chair approved",
    badgeClass: "status-verified"
  },
  rejected: {
    label: "Rejected",
    badgeClass: "status-rejected"
  }
};

const typeLabels = {
  attendance: "Attendance",
  schedule: "Schedule",
  case: "Clinical case"
};

const appeals = [
  {
    id: "appeal-maria-bus-late",
    student: "Maria Cruz",
    initials: "MC",
    section: "BSN 3A",
    studentId: "12-3456-789",
    site: "CCMC",
    dutyDate: "April 29, 2026",
    submittedAt: "Today, 7:48 AM",
    type: "attendance",
    status: "new",
    title: "Late arrival due to bus delay",
    reason: "CIT-U shuttle was delayed after traffic rerouting near the hospital entrance.",
    evidence: "Attached transport advisory and arrival photo timestamp."
  },
  {
    id: "appeal-treasure-shift",
    student: "Treasure Abadinas",
    initials: "TA",
    section: "BSN 3A",
    studentId: "22-1845-103",
    site: "CCMC",
    dutyDate: "April 28, 2026",
    submittedAt: "Today, 9:12 AM",
    type: "schedule",
    status: "new",
    title: "Schedule conflict with reassigned duty area",
    reason: "Student was moved from Emergency Room to Delivery Room after the printed roster was shared.",
    evidence: "Attached screenshot of the updated duty roster."
  },
  {
    id: "appeal-zander-weather",
    student: "Zander Aligato",
    initials: "ZA",
    section: "BSN 3B",
    studentId: "21-7740-118",
    site: "CCMC",
    dutyDate: "April 27, 2026",
    submittedAt: "Yesterday, 5:20 PM",
    type: "attendance",
    status: "recommended",
    title: "Late clock-in during heavy rain advisory",
    reason: "Student arrived late after road closures delayed public transport from Talamban.",
    evidence: "Barangay traffic advisory and CI arrival note."
  },
  {
    id: "appeal-nicole-case",
    student: "Nicole Dela Pena",
    initials: "ND",
    section: "BSN 3A",
    studentId: "23-1023-441",
    site: "CCMC",
    dutyDate: "April 26, 2026",
    submittedAt: "April 26, 2026, 6:18 PM",
    type: "case",
    status: "new",
    title: "Returned case clarification",
    reason: "Student contested the returned medication administration case and added missing checklist context.",
    evidence: "Student attached revised procedure note and medication safety checklist."
  },
  {
    id: "appeal-janine-emergency",
    student: "Janine Aquino",
    initials: "JA",
    section: "BSN 3C",
    studentId: "22-6102-719",
    site: "VSMMC",
    dutyDate: "April 25, 2026",
    submittedAt: "April 25, 2026, 4:42 PM",
    type: "attendance",
    status: "chair-approved",
    title: "Family emergency arrival adjustment",
    reason: "Student requested attendance consideration after notifying the CI before shift start.",
    evidence: "CI call log and endorsed arrival record."
  },
  {
    id: "appeal-mark-case",
    student: "Mark Bautista",
    initials: "MB",
    section: "BSN 3B",
    studentId: "21-5589-201",
    site: "CSMC",
    dutyDate: "April 24, 2026",
    submittedAt: "April 26, 2026, 10:15 AM",
    type: "case",
    status: "new",
    title: "Missing signature on OR slip",
    reason: "The resident surgeon was pulled into an emergency trauma case before signing my intraoperative checklist.",
    evidence: "Attached witness endorsement from the circulating nurse on duty."
  },
  {
    id: "appeal-sarah-schedule",
    student: "Sarah Geronimo",
    initials: "SG",
    section: "BSN 3C",
    studentId: "23-9901-512",
    site: "VSMMC",
    dutyDate: "April 30, 2026",
    submittedAt: "Today, 5:58 AM",
    type: "schedule",
    status: "new",
    title: "Request for shift swap due to university seminar",
    reason: "I am required to attend the mandatory Philippine Nursing Association regional seminar representing our block.",
    evidence: "Attached official endorsement letter from the Dean's Office."
  }
];

function loadOverrides() {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : {};
  } catch (error) {
    return {};
  }
}

function saveOverrides(overrides) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch (error) {
    return false;
  }

  return true;
}

function updateAppeal(id, updates) {
  const overrides = loadOverrides();
  overrides[id] = {
    ...(overrides[id] || {}),
    ...updates
  };
  saveOverrides(overrides);
}

function getMergedAppeals() {
  const overrides = loadOverrides();
  return appeals.map((appeal) => ({
    ...appeal,
    ...(overrides[appeal.id] || {})
  }));
}

function getAppeals() {
  return getMergedAppeals().filter((appeal) => appeal.status === "recommended");
}

function getStatusMeta(status) {
  return statusMeta[status] || statusMeta.recommended;
}

function updateText(element, text) {
  if (element) {
    element.textContent = text;
  }
}

function updateSummary(records) {
  const recommended = records.filter((appeal) => appeal.status === "recommended");
  updateText(syncPill, `${recommended.length} recommended`);
}

function appealMatchesFilters(appeal) {
  const section = sectionFilter.value;
  const query = searchInput.value.trim().toLowerCase();
  const text = `${appeal.student} ${appeal.section} ${appeal.site} ${appeal.title} ${appeal.reason} ${appeal.evidence}`.toLowerCase();

  return appeal.section === section &&
    (!query || text.includes(query));
}

function syncSelectedAppeals(records) {
  const validIds = new Set(records.map((appeal) => appeal.id));
  selectedAppealIds = new Set(Array.from(selectedAppealIds).filter((id) => validIds.has(id)));
}

function updateBulkControls() {
  const selectedCount = selectedAppealIds.size;
  const allVisibleSelected = currentVisibleAppeals.length > 0 &&
    currentVisibleAppeals.every((appeal) => selectedAppealIds.has(appeal.id));

  updateText(selectedCountLabel, `${selectedCount} selected`);

  if (selectAllButton) {
    selectAllButton.textContent = allVisibleSelected ? "Deselect all appeals" : "Select all appeals";
    selectAllButton.disabled = currentVisibleAppeals.length === 0;
  }

  if (bulkApproveButton) {
    bulkApproveButton.disabled = selectedCount === 0;
  }
}

function renderAppealCard(appeal) {
  const meta = getStatusMeta(appeal.status);
  const isSelected = selectedAppealIds.has(appeal.id);

  return `
    <article class="appeal-card ${isSelected ? "is-selected" : ""}" data-appeal-id="${appeal.id}">
      <div class="appeal-card-head">
        <div class="appeal-student-cell">
          <label class="appeal-select-control" aria-label="Select appeal from ${appeal.student}">
            <input type="checkbox" data-appeal-select="${appeal.id}" aria-label="Select appeal from ${appeal.student}"${isSelected ? " checked" : ""}>
          </label>
          <div class="avatar small-avatar">${appeal.initials}</div>
          <div>
            <strong>${appeal.student}</strong>
            <p>${appeal.section} - Student ID ${appeal.studentId}</p>
          </div>
        </div>
        <div class="appeal-card-badges">
          <span class="status-badge ${meta.badgeClass}">${meta.label}</span>
        </div>
      </div>

      <div class="appeal-card-body">
        <div class="appeal-title-row">
          <div>
            <h3>${appeal.title}</h3>
          </div>
          <div class="appeal-title-meta">
            <span class="appeal-submitted">Submitted ${appeal.submittedAt}</span>
            <span class="appeal-submitted">Assigned CI: ${appeal.assignedCi || "Patricia Reyes, RN, MAN"}</span>
          </div>
        </div>

        <div class="appeal-fact-grid">
          <div>
            <span>Appeal Type</span>
            <strong>${typeLabels[appeal.type]}</strong>
          </div>
          <div>
            <span>Related Duty Date</span>
            <strong>${appeal.dutyDate}</strong>
          </div>
          <div>
            <span>Clinical Site</span>
            <strong>${appeal.site}</strong>
          </div>
          <div>
            <span>Duty Area</span>
            <strong>${appeal.area || "Emergency Room"}</strong>
          </div>
        </div>

        <div class="appeal-detail-grid">
          <div class="appeal-detail-note">
            <p class="section-kicker">Student Reason</p>
            <p>${appeal.reason}</p>
          </div>
          <div class="appeal-detail-note">
            <p class="section-kicker">Supporting Evidence or Notes</p>
            <p>${appeal.evidence}</p>
          </div>
        </div>

        <div class="appeal-actions">
          <button class="primary-button workspace-action" type="button" data-appeal-approve="${appeal.id}">Approve appeal</button>
          <button class="ghost-button danger-button" type="button" data-appeal-reject="${appeal.id}">Reject appeal</button>
        </div>
      </div>
    </article>
  `;
}

function renderAppeals() {
  const allRecords = getMergedAppeals();
  const records = getAppeals();
  const visibleRecords = records.filter(appealMatchesFilters);
  currentVisibleAppeals = visibleRecords;
  syncSelectedAppeals(records);

  updateSummary(allRecords);

  if (appealList) {
    appealList.innerHTML = visibleRecords.map(renderAppealCard).join("");
  }

  if (appealEmpty) {
    appealEmpty.hidden = visibleRecords.length > 0;
  }

  updateText(visibleCount, `${visibleRecords.length} shown`);
  updateText(appealMessage, `Showing ${visibleRecords.length} CI-recommended appeal${visibleRecords.length === 1 ? "" : "s"} for Chair approval.`);
  appealMessage?.classList.remove("is-error", "is-success");
  updateBulkControls();
}

menuButton?.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop?.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

[searchInput, sectionFilter].forEach((control) => {
  control?.addEventListener("input", () => {
    selectedAppealIds.clear();
    renderAppeals();
  });
});

selectAllButton?.addEventListener("click", () => {
  const allVisibleSelected = currentVisibleAppeals.length > 0 &&
    currentVisibleAppeals.every((appeal) => selectedAppealIds.has(appeal.id));

  if (allVisibleSelected) {
    currentVisibleAppeals.forEach((appeal) => selectedAppealIds.delete(appeal.id));
  } else {
    currentVisibleAppeals.forEach((appeal) => selectedAppealIds.add(appeal.id));
  }

  renderAppeals();
});

bulkApproveButton?.addEventListener("click", () => {
  if (selectedAppealIds.size === 0) {
    return;
  }

  const selectedCount = selectedAppealIds.size;
  selectedAppealIds.forEach((id) => {
    updateAppeal(id, { status: "chair-approved" });
  });
  selectedAppealIds.clear();
  renderAppeals();
  appealMessage.textContent = `${selectedCount} appeal${selectedCount === 1 ? "" : "s"} approved by Chair.`;
  appealMessage.classList.add("is-success");
});

appealList?.addEventListener("click", (event) => {
  const selectInput = event.target.closest("[data-appeal-select]");
  const approveButton = event.target.closest("[data-appeal-approve]");
  const rejectButton = event.target.closest("[data-appeal-reject]");

  if (selectInput) {
    if (selectInput.checked) {
      selectedAppealIds.add(selectInput.dataset.appealSelect);
    } else {
      selectedAppealIds.delete(selectInput.dataset.appealSelect);
    }

    renderAppeals();
    return;
  }

  if (approveButton) {
    updateAppeal(approveButton.dataset.appealApprove, { status: "chair-approved" });
    selectedAppealIds.delete(approveButton.dataset.appealApprove);
    renderAppeals();
    appealMessage.textContent = "Appeal approved by Chair.";
    appealMessage.classList.add("is-success");
    return;
  }

  if (rejectButton) {
    updateAppeal(rejectButton.dataset.appealReject, { status: "rejected" });
    selectedAppealIds.delete(rejectButton.dataset.appealReject);
    renderAppeals();
    appealMessage.textContent = "Appeal rejected by Chair and removed from the queue.";
    appealMessage.classList.add("is-error");
  }
});

renderAppeals();
