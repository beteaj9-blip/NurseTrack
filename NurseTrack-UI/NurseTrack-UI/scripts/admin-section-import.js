const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const sectionImportForm = document.querySelector("#section-import-form");
const sectionFile = document.querySelector("#section-file");
const sectionImportMessage = document.querySelector("#section-import-message");
const sectionImportStatus = document.querySelector("#section-import-status");
const sectionImportSync = document.querySelector("#section-import-sync");
const sectionPreviewTable = document.querySelector("#section-preview-table");
const sectionPreviewCount = document.querySelector("#section-preview-count");
const mappedStudentsCount = document.querySelector("#mapped-students-count");
const sectionErrorCount = document.querySelector("#section-error-count");

const sampleAssignments = [
  ["Maria Cruz", "12-3456-789", "3rd Year", "BSN 3A"],
  ["Treasure Abadinas", "22-1845-103", "3rd Year", "BSN 3A"],
  ["Zander Aligato", "23-1822-014", "3rd Year", "BSN 3A"],
  ["Andrea Gomez", "23-1901-225", "3rd Year", "BSN 3B"],
  ["Jay Tiongzon", "23-1782-221", "3rd Year", "BSN 3B"]
];

function setMessage(text, state = "") {
  if (!sectionImportMessage) {
    return;
  }

  sectionImportMessage.textContent = text;
  sectionImportMessage.classList.remove("is-error", "is-success");

  if (state) {
    sectionImportMessage.classList.add(state);
  }
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function renderPreview(fileName) {
  if (!sectionPreviewTable) {
    return;
  }

  const rows = sampleAssignments.map(([name, id, yearLevel, section]) => `
    <div class="user-row">
      <span><strong>${escapeHtml(name)}</strong><small>${escapeHtml(fileName)}</small></span>
      <span>${escapeHtml(id)}</span>
      <span>${escapeHtml(yearLevel)}</span>
      <span>${escapeHtml(section)}</span>
      <span><mark class="status-badge status-verified">Ready</mark></span>
    </div>
  `).join("");

  sectionPreviewTable.innerHTML = `
    <div class="user-row user-row-head">
      <span>Student</span>
      <span>Student ID</span>
      <span>Year level</span>
      <span>Section</span>
      <span>Status</span>
    </div>
    ${rows}
  `;

  if (sectionPreviewCount) {
    sectionPreviewCount.textContent = `${sampleAssignments.length} previewed`;
    sectionPreviewCount.classList.remove("status-pending");
    sectionPreviewCount.classList.add("status-verified");
  }

  if (mappedStudentsCount) {
    mappedStudentsCount.textContent = sampleAssignments.length;
  }

  if (sectionErrorCount) {
    sectionErrorCount.textContent = "0";
  }
}

sectionFile?.addEventListener("change", () => {
  const file = sectionFile.files?.[0];

  if (!file) {
    setMessage("Upload an Excel file with Student ID, Student Name, Year Level, and Section columns.");
    return;
  }

  renderPreview(file.name);
  setMessage(`${file.name} loaded. Review the preview, then import section assignments.`, "is-success");

  if (sectionImportStatus) {
    sectionImportStatus.textContent = "File loaded";
    sectionImportStatus.classList.remove("status-pending");
    sectionImportStatus.classList.add("status-verified");
  }

  if (sectionImportSync) {
    sectionImportSync.textContent = "File loaded";
  }
});

sectionImportForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const file = sectionFile?.files?.[0];

  if (!file) {
    setMessage("Choose an Excel or CSV file before importing section assignments.", "is-error");
    return;
  }

  setMessage(`${file.name} imported. Student sections were assigned for the selected semester.`, "is-success");

  if (sectionImportStatus) {
    sectionImportStatus.textContent = "Imported";
  }

  if (sectionImportSync) {
    sectionImportSync.textContent = "Sections assigned";
  }
});

menuButton?.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop?.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});
