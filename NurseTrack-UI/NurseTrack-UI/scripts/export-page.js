const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const form = document.querySelector("#export-form");
const reportSource = document.querySelector("#report-source");
const reportPeriod = document.querySelector("#report-period");
const fileName = document.querySelector("#file-name");
const formatCards = Array.from(document.querySelectorAll(".export-format-card"));
const formatInputs = Array.from(document.querySelectorAll("input[name='fileFormat']"));
const message = document.querySelector("#export-message");
const exportStatus = document.querySelector("#export-status");
const packageBadge = document.querySelector("#package-badge");
const packageSource = document.querySelector("#package-source");
const packageName = document.querySelector("#package-name");
const packagePeriod = document.querySelector("#package-period");
const packageRecords = document.querySelector("#package-records");
const pdfButton = document.querySelector("#pdf-button");
const csvButton = document.querySelector("#csv-button");

const recordCounts = {
  "Compliance Summary": "42 students",
  "Duty Report": "318 duty records",
  "Case Report": "186 case logs",
  "Schedule Report": "28 schedules"
};

function selectedFormat() {
  return formatInputs.find((input) => input.checked)?.value || "PDF";
}

function slugFromSource(source) {
  return `nursetrack-${source.toLowerCase().replaceAll(" ", "-")}`;
}

function setMessage(text, state) {
  message.textContent = text;
  message.classList.remove("is-error", "is-success");

  if (state) {
    message.classList.add(state);
  }
}

function updateFormatCards() {
  const format = selectedFormat();

  formatCards.forEach((card) => {
    const input = card.querySelector("input");
    card.classList.toggle("is-selected", input.checked);
  });

  packageBadge.textContent = format;
  packageName.textContent = `${fileName.value || slugFromSource(reportSource.value)}.${format.toLowerCase()}`;
}

function updatePackage() {
  packageSource.textContent = reportSource.value;
  packagePeriod.textContent = reportPeriod.value;
  packageRecords.textContent = recordCounts[reportSource.value];
  updateFormatCards();
}

function prepareExport(formatOverride) {
  if (formatOverride) {
    const matchingInput = formatInputs.find((input) => input.value === formatOverride);
    matchingInput.checked = true;
  }

  if (!fileName.value.trim()) {
    setMessage("File name is required before preparing the export.", "is-error");
    fileName.focus();
    return;
  }

  updatePackage();
  exportStatus.textContent = "Ready";
  exportStatus.classList.remove("status-pending");
  exportStatus.classList.add("status-verified");
  setMessage(`${selectedFormat()} export prepared successfully.`, "is-success");
}

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

reportSource.addEventListener("input", () => {
  fileName.value = slugFromSource(reportSource.value);
  updatePackage();
});

[reportPeriod, fileName].forEach((control) => {
  control.addEventListener("input", updatePackage);
});

formatInputs.forEach((input) => {
  input.addEventListener("change", updateFormatCards);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  prepareExport();
});

pdfButton.addEventListener("click", () => {
  prepareExport("PDF");
});

csvButton.addEventListener("click", () => {
  prepareExport("CSV");
});

document.querySelector("#quick-export").addEventListener("click", () => {
  prepareExport();
});

updatePackage();
