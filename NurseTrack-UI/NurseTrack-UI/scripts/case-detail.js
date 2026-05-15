const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");

const studentCases = {
  "maria-dr-assist-0424": {
    date: "April 24, 2026",
    shiftTime: "6:00 AM - 2:00 PM",
    patient: "J. A. K.",
    category: "Major Case - Assist",
    procedure: "Primary Lower Segment Transverse Cesarean Section",
    site: "CCMC",
    ci: "Patricia Reyes, RN, MAN",
    area: "Delivery Room",
    submittedDate: "April 24, 2026",
    submittedTime: "4:35 PM",
    status: "Pending",
    instructorComment: "Patricia Reyes noted that the submitted case is queued for CI validation.",
    reflection: "I learned how to assist properly during a DR major case, maintain sterile technique, and document accurately for clinical case documentation."
  },
  "maria-or-circulate-0423": {
    date: "April 23, 2026",
    shiftTime: "6:00 AM - 2:00 PM",
    patient: "R. L. S.",
    category: "Major Case - Circulate",
    procedure: "Laparoscopic Cholecystectomy",
    site: "VSMMC",
    ci: "Patricia Reyes, RN, MAN",
    area: "Operating Room",
    submittedDate: "April 23, 2026",
    submittedTime: "2:10 PM",
    status: "Approved",
    approvedDate: "April 23, 2026, 3:18 PM",
    instructorComment: "Validated by Patricia Reyes. Documentation and reflection matched the assigned OR case requirements.",
    reflection: "I observed sterile field maintenance, circulating nurse responsibilities, and documentation flow during an OR major case."
  },
  "maria-dr-handled-0422": {
    date: "April 22, 2026",
    shiftTime: "7:00 AM - 3:00 PM",
    patient: "M. T. D.",
    category: "Handled Case",
    procedure: "Operative Hysteroscopy, Transcervical Resection of Polyp",
    site: "CCMC",
    ci: "Patricia Reyes, RN, MAN",
    area: "Delivery Room",
    submittedDate: "April 22, 2026",
    submittedTime: "11:45 AM",
    status: "Approved",
    approvedDate: "April 22, 2026, 1:30 PM",
    instructorComment: "Approved after checking the student log and clinical case entry.",
    reflection: "I practiced proper handoff documentation and reflected on patient safety checks before and after the procedure."
  }
};

function setText(selector, value) {
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = value;
  }
}

function applySelectedCase() {
  const caseId = new URLSearchParams(window.location.search).get("case") || "maria-dr-assist-0424";
  const record = studentCases[caseId] || studentCases["maria-dr-assist-0424"];
  const isApproved = record.status === "Approved";
  const badge = document.querySelector("#detail-case-status-badge");
  const approvedBox = document.querySelector("#detail-case-approved-box");

  setText("#detail-case-date", record.date);
  setText("#detail-case-shift-time", record.shiftTime);
  setText("#detail-case-patient", record.patient);
  setText("#detail-case-category", record.category);
  setText("#detail-case-procedure", record.procedure);
  setText("#detail-case-site", record.site);
  setText("#detail-case-ci", record.ci);
  setText("#detail-case-area", record.area);
  setText("#detail-case-submitted-date", record.submittedDate);
  setText("#detail-case-submitted-time", record.submittedTime);
  setText("#detail-case-reflection", record.reflection);
  setText("#detail-case-status-badge", record.status);
  setText("#detail-case-status-title", isApproved ? "Approved by CI" : "Awaiting CI validation");
  setText("#detail-case-reviewer", record.ci);
  setText("#detail-case-comment", record.instructorComment || "No instructor comments added yet.");
  setText("#detail-case-approved-date", record.approvedDate || "");

  if (badge) {
    badge.className = `status-badge ${isApproved ? "status-verified" : "status-pending"}`;
  }

  if (approvedBox) {
    approvedBox.hidden = !isApproved;
  }
}

menuButton?.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop?.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

applySelectedCase();
