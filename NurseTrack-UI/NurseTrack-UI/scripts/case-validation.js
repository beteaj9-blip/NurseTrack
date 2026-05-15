const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const approveCase = document.querySelector("#approve-case");
const rejectCase = document.querySelector("#reject-case");
const message = document.querySelector("#form-message");
const validationComment = document.querySelector("#validation-comment");
const cardStatus = document.querySelector("#card-status");
const validationForm = document.querySelector("#validation-comment-form");
const reviewedPanel = document.querySelector("#reviewed-case-panel");
const editReview = document.querySelector("#edit-review");
const reviewedStatusBadge = document.querySelector("#reviewed-status-badge");
const reviewedStatusTitle = document.querySelector("#reviewed-status-title");
const reviewedStatusCopy = document.querySelector("#reviewed-status-copy");
const reviewedComment = document.querySelector("#reviewed-comment");
const reviewedByLabel = document.querySelector("#reviewed-by-label");
const reviewedByName = document.querySelector("#reviewed-by-name");
const panelKicker = document.querySelector("#validation-panel-kicker");
const panelTitle = document.querySelector("#validation-panel-title");
const backToCases = document.querySelector("#back-to-cases");
const instructorData = window.NurseTrackInstructorData;
const isChairCaseValidation = window.location.pathname.replace(/\\/g, "/").includes("/admin-manager/");
const signedRole = window.sessionStorage?.getItem("nursetrackRole") || "";
const isAdminCaseValidation = isChairCaseValidation && signedRole === "admin";
const ASSISTANT_CLINICAL_CASES_ACCESS_KEY = "nursetrack-assistant-clinical-cases-access";
const assistantClinicalCasesAccessEnabled = window.localStorage?.getItem(ASSISTANT_CLINICAL_CASES_ACCESS_KEY) === "true";
const isSupportCaseRole = signedRole === "assistant" || signedRole === "coordinator";
const isReadOnlyCaseValidation = isChairCaseValidation && isSupportCaseRole && !assistantClinicalCasesAccessEnabled;
const reviewerRoleLabel = isAdminCaseValidation ? "Admin" : isChairCaseValidation ? "Chair" : "Instructor";
const reviewerRoleLower = reviewerRoleLabel.toLowerCase();

const params = new URLSearchParams(window.location.search);
const caseId = params.get("case") || "treasure-dr-newborn-0424";
const selectedStudentKey = params.get("student");
const fromPage = params.get("from");

let selectedCase =
  instructorData?.cases?.getById(caseId) ||
  instructorData?.cases?.getById("treasure-dr-newborn-0424") ||
  null;
let isEditingReviewed = params.get("edit") === "1";

function setMessage(text, state) {
  if (!message) {
    return;
  }

  message.textContent = text;
  message.classList.remove("is-error", "is-success");

  if (state) {
    message.classList.add(state);
  }
}

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

function friendlyReviewDate(status) {
  const label = status === "approved" ? "Approved" : "Rejected";
  const date = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  const time = new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });

  return `${label} ${date}, ${time}`;
}

function reviewerNameForDecision(status) {
  if (isAdminCaseValidation) {
    return "Admin Santos";
  }

  if (isChairCaseValidation) {
    return "Reyes, Chair";
  }

  return selectedCase.supervisingCi || instructorData?.defaultCiFullName || "Patricia Reyes, RN, MAN";
}

function updateStatusUI(status) {
  const meta = statusMeta(status);

  if (cardStatus) {
    cardStatus.textContent = meta.label;
    cardStatus.className = `status-badge ${meta.badgeClass}`;
  }
}

function updateBackLink() {
  if (!backToCases || !selectedCase) {
    return;
  }

  const studentKey = selectedStudentKey || selectedCase.studentKey;

  if (fromPage === "progress" && studentKey) {
    backToCases.textContent = "Back to progress";
    backToCases.href = `student-progress-detail.html?student=${encodeURIComponent(studentKey)}`;
    return;
  }

  backToCases.textContent = "Back to cases";
  backToCases.href = `clinical-case-selection.html?student=${encodeURIComponent(studentKey || "")}`;
}

function applyCaseInformation() {
  if (!selectedCase) {
    return;
  }

  setText("#selected-student-avatar", selectedCase.studentInitials);
  setText("#selected-student-name", selectedCase.studentName);
  setText("#selected-student-meta", `${selectedCase.studentSection} - Student ID ${selectedCase.studentId}`);
  setText("#selected-case-date", selectedCase.date);
  setText("#selected-case-shift-time", selectedCase.shiftTime || "6:00 AM - 2:00 PM");
  setText("#selected-case-code", selectedCase.patientInitials || selectedCase.code);
  setText("#selected-case-category", selectedCase.category);
  setText("#selected-case-procedure", selectedCase.procedurePerformed || selectedCase.procedure);
  setText("#selected-case-site", selectedCase.site);
  setText("#selected-case-supervising-ci", selectedCase.supervisingCi || instructorData?.defaultCiFullName || "Patricia Reyes, RN, MAN");
  setText("#selected-case-area", selectedCase.area);
  setText("#selected-case-submitted-date", selectedCase.submittedDate);
  setText("#selected-case-submitted-time", selectedCase.submittedTime);
  setText("#selected-case-reflection", selectedCase.reflection);
  updateStatusUI(selectedCase.status);
  updateBackLink();
}

function showReviewedSummary() {
  const meta = statusMeta(selectedCase.status);
  const statusLabel = meta.label.toLowerCase();
  const isPending = selectedCase.status === "pending";
  const comment = selectedCase.reviewComment?.trim();

  if (validationForm) {
    validationForm.hidden = true;
  }

  if (reviewedPanel) {
    reviewedPanel.hidden = false;
  }

  if (reviewedStatusBadge) {
    reviewedStatusBadge.textContent = meta.label;
    reviewedStatusBadge.className = `status-badge ${meta.badgeClass}`;
  }

  if (reviewedStatusTitle) {
    reviewedStatusTitle.textContent = isPending ? "Pending review" : selectedCase.reviewedAt || `${meta.label} case`;
  }

  if (reviewedStatusCopy) {
    reviewedStatusCopy.textContent = isPending
      ? "This clinical case is available for review by the assigned Clinical Instructor."
      : `This clinical case has already been ${statusLabel}.`;
  }

  if (reviewedByLabel) {
    reviewedByLabel.textContent = selectedCase.status === "approved" ? "Approved by" : "Reviewed by";
  }

  if (reviewedByName) {
    reviewedByName.textContent = selectedCase.reviewedBy ||
      selectedCase.approvedBy ||
      selectedCase.supervisingCi ||
      instructorData?.defaultCiFullName ||
      "Patricia Reyes, RN, MAN";
  }

  if (reviewedComment) {
    reviewedComment.textContent = comment || "No comment added.";
  }
}

function showDecisionForm() {
  const isReviewed = selectedCase?.status === "approved" || selectedCase?.status === "rejected";

  if (validationForm) {
    validationForm.hidden = false;
  }

  if (reviewedPanel) {
    reviewedPanel.hidden = true;
  }

  if (panelKicker) {
    panelKicker.textContent = "Validation decision";
  }

  if (panelTitle) {
    panelTitle.textContent = isReviewed ? `Edit ${reviewerRoleLabel} Action` : `${reviewerRoleLabel} Action`;
  }

  if (validationComment) {
    validationComment.disabled = false;
    validationComment.value = selectedCase?.reviewComment || "";
  }

  if (approveCase) {
    approveCase.disabled = false;
    approveCase.textContent = isReviewed ? "Mark approved" : "Approve case";
  }

  if (rejectCase) {
    rejectCase.disabled = false;
    rejectCase.textContent = isReviewed ? "Mark rejected" : "Reject case";
  }

  setMessage(
    isReviewed
      ? "Update the decision, then save the corrected status."
      : "Review the case details, then make an approval decision.",
    null
  );
}

function renderCase() {
  if (!selectedCase) {
    setMessage("Case record could not be found.", "is-error");
    return;
  }

  applyCaseInformation();

  const isReviewed = selectedCase.status === "approved" || selectedCase.status === "rejected";

  if (isReadOnlyCaseValidation) {
    showReviewedSummary();
    if (editReview) {
      editReview.hidden = true;
    }
    setMessage("This role can view clinical case details but cannot edit validation decisions.", null);
    return;
  }

  if (isReviewed && !isEditingReviewed) {
    showReviewedSummary();
    return;
  }

  showDecisionForm();
}

function saveDecision(status) {
  if (isReadOnlyCaseValidation) {
    setMessage("This role can view clinical case details but cannot edit validation decisions.", "is-error");
    return;
  }

  if (!selectedCase) {
    return;
  }

  const comment = validationComment?.value.trim() || "";

  if (status === "rejected" && !comment) {
    setMessage("A comment is required to reject a case.", "is-error");
    validationComment?.focus();
    return;
  }

  selectedCase = instructorData?.cases?.update(selectedCase.id, {
    status,
    summary: status === "approved" ? friendlyReviewDate("approved") : "Returned for missing case details",
    reviewedAt: friendlyReviewDate(status),
    reviewedBy: reviewerNameForDecision(status),
    approvedBy: status === "approved" ? reviewerNameForDecision(status) : "",
    reviewComment: comment
  }) || {
    ...selectedCase,
    status,
    reviewedAt: friendlyReviewDate(status),
    reviewedBy: reviewerNameForDecision(status),
    approvedBy: status === "approved" ? reviewerNameForDecision(status) : "",
    reviewComment: comment
  };

  isEditingReviewed = false;
  renderCase();
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

approveCase?.addEventListener("click", () => {
  saveDecision("approved");
});

rejectCase?.addEventListener("click", () => {
  saveDecision("rejected");
});

editReview?.addEventListener("click", () => {
  isEditingReviewed = true;
  renderCase();
  validationComment?.focus();
});

renderCase();
