const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const reportForm = document.querySelector("#student-report-form");
const resetButton = document.querySelector("#reset-student-report");
const reportMessage = document.querySelector("#student-report-message");
const reportType = document.querySelector("#report-type");
const formatFilter = document.querySelector("#format-filter");
const startDate = document.querySelector("#start-date");
const endDate = document.querySelector("#end-date");

function setMessage(text, state) {
  if (!reportMessage) {
    return;
  }

  reportMessage.textContent = text;
  reportMessage.classList.remove("is-error", "is-success");

  if (state) {
    reportMessage.classList.add(state);
  }
}

function selectedSections() {
  return Array.from(reportForm?.querySelectorAll(".report-options input[type='checkbox']:checked") || [])
    .map((input) => input.closest(".check-row")?.textContent.trim())
    .filter(Boolean);
}

function validateDates() {
  if (!startDate?.value || !endDate?.value) {
    setMessage("Select a start date and end date before generating a report.", "is-error");
    return false;
  }

  if (startDate.value > endDate.value) {
    setMessage("Start date must be earlier than or equal to the end date.", "is-error");
    return false;
  }

  return true;
}

function generateReport() {
  if (!validateDates()) {
    return;
  }

  const included = selectedSections();

  if (!included.length) {
    setMessage("Select at least one report section to include.", "is-error");
    return;
  }

  const reportTypeLabel = reportType?.value || "General report";
  const formatLabel = formatFilter?.value || "PDF";
  setMessage(`${reportTypeLabel} generated for Maria Cruz as ${formatLabel}.`, "is-success");
}

function resetReport() {
  reportForm?.reset();
  setMessage("Generate a report for Maria Cruz's own account only.");
}

menuButton?.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop?.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

resetButton?.addEventListener("click", resetReport);

reportForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  generateReport();
});
