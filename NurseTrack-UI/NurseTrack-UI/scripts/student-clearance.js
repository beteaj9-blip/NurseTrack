(() => {
  const ACCESS_KEY = "nursetrack-clearance-submissions-enabled";
  const RECORDS_KEY = "nursetrack-clearance-records";
  const STUDENT_KEY = "maria-cruz";
  const STUDENT_NAME = "Maria Cruz";

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

  const submitButton = document.querySelector("#submit-clearance");
  const printButton = document.querySelector("#print-clearance");
  const statusBadge = document.querySelector("#clearance-status-badge");
  const message = document.querySelector("#case-history-message");
  const schoolYearSelect = document.querySelector("#case-school-year");
  const semesterSelect = document.querySelector("#case-semester");

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

  function setMessage(text, state = "") {
    if (!message) {
      return;
    }

    if (message.dataset.casePeriodEmpty === "true") {
      return;
    }

    message.textContent = text;
    message.classList.toggle("is-success", state === "success");
    message.classList.toggle("is-error", state === "error");
  }

  function setStatusBadge(label, className) {
    if (!statusBadge) {
      return;
    }

    statusBadge.textContent = label;
    statusBadge.className = `status-badge ${className}`;
  }

  function fillPrintCertificate(record) {
    const submitted = document.querySelector("#print-clearance-submitted");
    const approved = document.querySelector("#print-clearance-approved");
    const chair = document.querySelector("#print-clearance-chair");
    const student = document.querySelector("#print-clearance-student");

    if (student) {
      student.textContent = STUDENT_NAME;
    }

    if (submitted) {
      submitted.textContent = record?.submittedAt || "Pending";
    }

    if (approved) {
      approved.textContent = record?.approvedAt || "Pending";
    }

    if (chair) {
      chair.textContent = record?.chairName || "Reyes, Chair";
    }
  }

  function renderClearanceState() {
    const records = loadRecords();
    const record = records[STUDENT_KEY] || {};
    const submissionsOpen = isSubmissionOpen();

    fillPrintCertificate(record);

    if (record.approved) {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Clearance Approved";
      }

      if (printButton) {
        printButton.disabled = false;
      }

      setStatusBadge("Clearance approved", "status-verified");
      setMessage("Clearance approved by Chair. You may print your clearance.", "success");
      return;
    }

    if (record.submitted) {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Submitted for Clearance";
      }

      if (printButton) {
        printButton.disabled = true;
      }

      setStatusBadge("Waiting for Chair approval", "status-pending");
      setMessage("Case history submitted for Chair clearance review.", "success");
      return;
    }

    if (submitButton) {
      submitButton.disabled = !submissionsOpen;
      submitButton.textContent = "Submit for Clearance";
      submitButton.title = submissionsOpen
        ? "Submit your case history for Chair clearance review"
        : "Chair has not opened clearance submissions yet";
    }

    if (printButton) {
      printButton.disabled = true;
    }

    if (submissionsOpen) {
      setStatusBadge("Clearance submissions open", "status-verified");
      setMessage("Chair has opened clearance submissions. You may submit your case history for review.");
    } else {
      setStatusBadge("Clearance locked", "status-pending");
      setMessage("Clearance submissions are not open yet. Wait for the Chair to enable the clearance button.");
    }
  }

  submitButton?.addEventListener("click", () => {
    if (!isSubmissionOpen()) {
      setMessage("Clearance submissions are still locked by the Chair.", "error");
      renderClearanceState();
      return;
    }

    const records = loadRecords();

    records[STUDENT_KEY] = {
      ...records[STUDENT_KEY],
      submitted: true,
      submittedAt: formatDate(),
      schoolYear: schoolYearSelect?.value || "2025-2026",
      semester: semesterSelect?.value || "2nd Semester",
      approved: false,
      approvedAt: "",
      chairName: "",
      notes: "Student submitted case history for final clearance."
    };

    saveRecords(records);
    renderClearanceState();
  });

  printButton?.addEventListener("click", () => {
    const records = loadRecords();
    const record = records[STUDENT_KEY] || {};

    if (!record.approved) {
      setMessage("Chair approval is required before printing clearance.", "error");
      renderClearanceState();
      return;
    }

    fillPrintCertificate(record);
    window.print();
  });

  [schoolYearSelect, semesterSelect].filter(Boolean).forEach((control) => {
    control.addEventListener("change", () => {
      window.setTimeout(renderClearanceState, 0);
    });
  });

  window.addEventListener("storage", renderClearanceState);
  window.addEventListener("focus", renderClearanceState);
  window.addEventListener("pageshow", renderClearanceState);
  renderClearanceState();
})();
