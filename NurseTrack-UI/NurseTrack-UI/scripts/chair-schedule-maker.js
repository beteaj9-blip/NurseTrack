const chairMakerFileButton = document.querySelector("[data-chair-file-select]");
const chairMakerFileInput = document.querySelector("[data-chair-file-input]");
const chairMakerManualButton = document.querySelector("[data-create-manual-schedule]");
const chairMakerImportStatus = document.querySelector("#chair-import-status");
const chairMakerImportMessage = document.querySelector("#chair-import-message");
const chairMakerScheduleStatus = document.querySelector("#chair-schedule-status");
const chairMakerScheduleMessage = document.querySelector("#chair-schedule-message");
const chairMakerImportedFile = document.querySelector("#chair-imported-file");
const chairMakerDraftList = document.querySelector(".schedule-draft-list");
const chairMakerPublishButton = document.querySelector("[data-publish-schedule]");
const chairMakerRosterModal = document.querySelector("#schedule-roster-modal");
const chairMakerRosterTitle = document.querySelector("#schedule-roster-title");
const chairMakerRosterList = document.querySelector("#schedule-roster-list");
const chairMakerRosterCloseButtons = Array.from(document.querySelectorAll("[data-close-roster-modal]"));
const chairMakerRosterSaveButton = document.querySelector("[data-save-roster-modal]");
const chairMakerRosterUndoButton = document.querySelector("[data-undo-roster-remove]");
const chairMakerRosterAddSearch = document.querySelector("#schedule-roster-add-search");
const chairMakerRosterAddResults = document.querySelector("#schedule-roster-add-results");

const chairMakerRosterData = {
  "N1 G1": ["Zander Aligato", "Bianca Mariel Lumbre", "Klarisse Mumar", "Shaina Perez", "Rui Parba", "Relieza Rellon", "Ella Mae Maranga", "Hannah Louise Maturan", "Geralf Mojana", "Treshia Pinca"],
  "N1 G2": ["Maria Cruz", "Treasure Abadinas", "Carlo Fernandez", "Josh Anton Nuevas", "Jasmine Lim", "Kaye Amor", "Bea Arocha", "Grace Alolor", "Mae Arquiza", "Ivanka Arreglo"],
  "N1 G3": ["Lady Dacayana", "Zyrelle Dianon", "Vera Doroon", "Shennen Dungcoy", "Mary Cielo Fernandez", "Jenelou Francis", "Nicole Reroma", "Elisabeth Robledo", "Rojhel Saavedra", "Marian Paradiang"],
  "N1 G4": ["Jane Rea Basalo", "Bea Mae Batarilan", "Yelrich Bejoc", "Crystal Dela Calzada", "Nicole Dela Calzada", "Clark Leonor", "Chloe Relova", "Michelle Teano", "Oishi Valcorza"],
  "N2 G3": ["Rui Vil Parba", "Shaina Perez", "Relieza Rellon", "Ella Mae Maranga", "Hannah Louise Maturan", "Geralf Mojana", "Treshia Pinca", "Klarisse Mumar", "Bianca Mariel Lumbre", "Zander Aligato"],
  "N2 G4": ["Marian Paradiang", "Rui Vil Parba", "Shaina Perez", "Relieza Rellon", "Nicole Reroma", "Elisabeth Robledo", "Rojhel Saavedra", "Lady Dacayana", "Zyrelle Dianon"]
};

const chairMakerStudentDirectorySeed = [
  { name: "Maria Cruz", id: "12-3456-789", section: "BSN 3A", site: "CCMC" },
  { name: "Josh Anton Nuevas", id: "12-3456-812", section: "BSN 3A", site: "CCMC" },
  { name: "Treasure Abadinas", id: "12-3456-845", section: "BSN 3A", site: "VSMMC" },
  { name: "Andrea Gomez", id: "12-3456-902", section: "BSN 3B", site: "CHN Brgy. Dumlog" },
  { name: "Lichael Ursulo", id: "12-3456-976", section: "BSN 3C", site: "CSMC" },
  { name: "Angela Neri", id: "12-3456-988", section: "BSN 3C", site: "CSMC" },
  { name: "Nicole Dela Pena", id: "23-1023-441", section: "BSN 3A", site: "Vicente Mendiola Center for Health Infirmary" },
  { name: "Jay Tiongzon", id: "23-1782-221", section: "BSN 3B", site: "CHN Brgy. Dumlog" },
  { name: "Bea Montes", id: "23-5531-208", section: "BSN 3B", site: "CHN Brgy. Dumlog" },
  { name: "Janine Aquino", id: "22-6102-719", section: "BSN 3C", site: "SAMCH" },
  { name: "Miguel Reyes", id: "23-4190-778", section: "BSN 3C", site: "Vicente Mendiola Center for Health Infirmary" },
  { name: "Patricia Uy", id: "22-7304-122", section: "BSN 3C", site: "CCMC" },
  { name: "Sean Villamor", id: "23-9055-310", section: "BSN 3C", site: "VSMMC" },
  { name: "Leah Tan", id: "23-6718-235", section: "BSN 3C", site: "CCMC" },
  { name: "Mark Hernandez", id: "21-5409-882", section: "BSN 4A", site: "PSH" },
  { name: "Camille Navarro", id: "21-3091-450", section: "BSN 4A", site: "CCHD" },
  { name: "Daniel Ong", id: "21-7782-944", section: "BSN 4A", site: "CCMC" },
  { name: "Sophia Ramos", id: "21-6607-301", section: "BSN 4A", site: "CCMC" }
];

let chairMakerRemovedStudents = [];
let chairMakerOpenRosterGroup = "";
let chairMakerRosterSnapshot = [];

function setChairMakerMessage(element, message, isSuccess = true) {
  if (!element) {
    return;
  }

  element.textContent = message;
  element.classList.toggle("is-success", isSuccess);
  element.classList.toggle("is-error", !isSuccess);
}

function setChairMakerStatus(element, text, statusClass) {
  if (!element) {
    return;
  }

  element.textContent = text;
  element.className = `status-badge ${statusClass}`;
}

function updateRosterCountButtons() {
  document.querySelectorAll("[data-view-draft-roster]").forEach((button) => {
    const group = button.dataset.rosterGroup;
    const count = chairMakerRosterData[group]?.length || 0;
    button.textContent = `View students (${count})`;
  });
}

function syncChairMakerCasePresentation(row) {
  const tbaOption = row?.querySelector("[data-case-presentation-tba]");
  const inputs = Array.from(row?.querySelectorAll("[data-case-presentation-input]") || []);
  const isTba = Boolean(tbaOption?.checked);

  inputs.forEach((input) => {
    input.disabled = isTba;

    if (isTba) {
      input.value = "";
    }
  });
}

function parseChairMakerDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatChairMakerDate(value) {
  const date = parseChairMakerDate(value);

  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function getChairMakerScheduleRange(row) {
  return {
    start: row?.querySelector("[data-schedule-start-date]")?.value || "",
    end: row?.querySelector("[data-schedule-end-date]")?.value || ""
  };
}

function getChairMakerBreakDates(row) {
  return Array.from(new Set(String(row?.dataset.breakDates || "")
    .split(",")
    .map((date) => date.trim())
    .filter((date) => Boolean(parseChairMakerDate(date)))))
    .sort();
}

function setChairMakerBreakDates(row, dates) {
  const cleanDates = Array.from(new Set((dates || []).filter((date) => Boolean(parseChairMakerDate(date))))).sort();
  const serializedDates = cleanDates.join(",");
  const manager = row?.querySelector("[data-break-date-manager]");

  if (row) {
    row.dataset.breakDates = serializedDates;
  }

  if (manager) {
    manager.dataset.breakDates = serializedDates;
  }
}

function isChairMakerDateInRange(date, start, end) {
  return Boolean(date && start && end && start <= end && date >= start && date <= end);
}

function countChairMakerActiveDutyDays(row) {
  const { start, end } = getChairMakerScheduleRange(row);
  const startDate = parseChairMakerDate(start);
  const endDate = parseChairMakerDate(end);

  if (!startDate || !endDate || start > end) {
    return 0;
  }

  const dayMs = 24 * 60 * 60 * 1000;
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / dayMs) + 1;
  const validBreakCount = getChairMakerBreakDates(row).filter((date) => isChairMakerDateInRange(date, start, end)).length;
  return Math.max(0, totalDays - validBreakCount);
}

function renderChairMakerBreakDates(row) {
  const list = row?.querySelector("[data-break-date-list]");

  if (!list) {
    return;
  }

  const dates = getChairMakerBreakDates(row);

  if (!dates.length) {
    list.innerHTML = `<span class="schedule-break-empty">No breaks added</span>`;
    return;
  }

  list.innerHTML = dates.map((date) => `
    <button class="schedule-break-chip" type="button" data-remove-break-date="${date}">
      <span>${formatChairMakerDate(date)}</span>
      <span aria-hidden="true">x</span>
    </button>
  `).join("");
}

function syncChairMakerBreakDates(row, options = {}) {
  const input = row?.querySelector("[data-break-date-input]");
  const addButton = row?.querySelector("[data-add-break-date]");
  const { start, end } = getChairMakerScheduleRange(row);
  const hasValidRange = Boolean(parseChairMakerDate(start) && parseChairMakerDate(end) && start <= end);

  if (input) {
    input.min = start || "";
    input.max = end || "";
    input.disabled = !hasValidRange;
  }

  if (addButton) {
    addButton.disabled = !hasValidRange;
  }

  if (options.prune && hasValidRange) {
    setChairMakerBreakDates(row, getChairMakerBreakDates(row).filter((date) => isChairMakerDateInRange(date, start, end)));
  }

  renderChairMakerBreakDates(row);
}

function addChairMakerBreakDate(row) {
  const input = row?.querySelector("[data-break-date-input]");
  const { start, end } = getChairMakerScheduleRange(row);
  const date = input?.value || "";

  if (!parseChairMakerDate(start) || !parseChairMakerDate(end) || start > end) {
    setChairMakerStatus(chairMakerScheduleStatus, "Needs review", "status-rejected");
    setChairMakerMessage(chairMakerScheduleMessage, "Set a valid start and end date before adding a break date.", false);
    return;
  }

  if (!isChairMakerDateInRange(date, start, end)) {
    setChairMakerStatus(chairMakerScheduleStatus, "Needs review", "status-rejected");
    setChairMakerMessage(chairMakerScheduleMessage, `Break date must be between ${formatChairMakerDate(start)} and ${formatChairMakerDate(end)}.`, false);
    return;
  }

  const dates = getChairMakerBreakDates(row);

  if (dates.includes(date)) {
    setChairMakerStatus(chairMakerScheduleStatus, "Needs review", "status-rejected");
    setChairMakerMessage(chairMakerScheduleMessage, `${formatChairMakerDate(date)} is already marked as a break.`, false);
    return;
  }

  setChairMakerBreakDates(row, [...dates, date]);
  input.value = "";
  row.classList.add("is-edited");
  syncChairMakerBreakDates(row);
  setChairMakerStatus(chairMakerScheduleStatus, "Edited draft", "status-pending");
  setChairMakerMessage(chairMakerScheduleMessage, `${formatChairMakerDate(date)} marked as a break date.`);
}

function removeChairMakerBreakDate(row, date) {
  setChairMakerBreakDates(row, getChairMakerBreakDates(row).filter((item) => item !== date));
  row?.classList.add("is-edited");
  syncChairMakerBreakDates(row);
  setChairMakerStatus(chairMakerScheduleStatus, "Edited draft", "status-pending");
  setChairMakerMessage(chairMakerScheduleMessage, `${formatChairMakerDate(date)} removed from break dates.`);
}

function validateChairMakerDraftRow(row) {
  const group = row?.querySelector(".schedule-draft-main strong")?.textContent.trim() || "Schedule row";
  const { start, end } = getChairMakerScheduleRange(row);

  if (!parseChairMakerDate(start) || !parseChairMakerDate(end)) {
    setChairMakerStatus(chairMakerScheduleStatus, "Needs review", "status-rejected");
    setChairMakerMessage(chairMakerScheduleMessage, `${group} needs a start date and end date.`, false);
    return false;
  }

  if (start > end) {
    setChairMakerStatus(chairMakerScheduleStatus, "Needs review", "status-rejected");
    setChairMakerMessage(chairMakerScheduleMessage, `${group} has an end date before the start date.`, false);
    return false;
  }

  const invalidBreak = getChairMakerBreakDates(row).find((date) => !isChairMakerDateInRange(date, start, end));

  if (invalidBreak) {
    setChairMakerStatus(chairMakerScheduleStatus, "Needs review", "status-rejected");
    setChairMakerMessage(chairMakerScheduleMessage, `${group} has a break date outside the selected start and end dates.`, false);
    return false;
  }

  if (countChairMakerActiveDutyDays(row) === 0) {
    setChairMakerStatus(chairMakerScheduleStatus, "Needs review", "status-rejected");
    setChairMakerMessage(chairMakerScheduleMessage, `${group} needs at least one active duty day after breaks.`, false);
    return false;
  }

  return true;
}

function findChairMakerDraftField(row, labelText) {
  return Array.from(row?.querySelectorAll(".schedule-draft-fields > label") || []).find((label) => {
    const ownText = Array.from(label.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent.trim())
      .join(" ")
      .toLowerCase();

    return ownText === labelText.toLowerCase();
  });
}

function enhanceChairMakerDraftRow(row) {
  const fields = row?.querySelector(".schedule-draft-fields");

  if (!fields) {
    return;
  }

  const startField = findChairMakerDraftField(row, "Start date");
  const endField = findChairMakerDraftField(row, "End date");
  const hospitalField = findChairMakerDraftField(row, "Hospital / Area");
  const startInput = startField?.querySelector('input[type="date"]');
  const endInput = endField?.querySelector('input[type="date"]');

  startInput?.setAttribute("data-schedule-start-date", "");
  endInput?.setAttribute("data-schedule-end-date", "");
  startField?.classList.add("schedule-draft-start-date");
  endField?.classList.add("schedule-draft-end-date");

  if (endField && !fields.querySelector("[data-break-date-manager]")) {
    const breakField = document.createElement("div");
    breakField.className = "schedule-break-field";
    breakField.dataset.breakDateManager = "";
    breakField.innerHTML = `
      <span>Break Dates</span>
      <div class="schedule-break-controls">
        <input type="date" data-break-date-input>
        <button class="ghost-button" type="button" data-add-break-date>Add break</button>
      </div>
      <div class="schedule-break-list" data-break-date-list></div>
    `;
    endField.after(breakField);
  }

  if (hospitalField && !fields.querySelector("[data-duty-type-field]")) {
    const dutyTypeField = document.createElement("label");
    dutyTypeField.className = "form-label schedule-draft-duty-type";
    dutyTypeField.dataset.dutyTypeField = "";
    dutyTypeField.innerHTML = `
      Duty Type
      <select>
        <option>Regular</option>
        <option>Extension</option>
        <option>Completion</option>
      </select>
    `;
    hospitalField.after(dutyTypeField);
  }

  hospitalField?.classList.add("schedule-draft-hospital-area");
  fields.querySelector("[data-duty-type-field]")?.classList.add("schedule-draft-duty-type");
  findChairMakerDraftField(row, "Shift start")?.classList.add("schedule-draft-shift-start");
  findChairMakerDraftField(row, "Shift end")?.classList.add("schedule-draft-shift-end");
  findChairMakerDraftField(row, "Case presentation date")?.classList.add("schedule-draft-case-date");
  findChairMakerDraftField(row, "Case presentation time")?.classList.add("schedule-draft-case-time");
  findChairMakerDraftField(row, "Supervising CI")?.classList.add("schedule-draft-ci-field");
  row.querySelector("[data-case-presentation-tba]")?.closest("label")?.classList.add("schedule-draft-tba");
  syncChairMakerBreakDates(row, { prune: true });
}

function enhanceChairMakerDraftRows() {
  document.querySelectorAll("[data-schedule-draft-row]").forEach(enhanceChairMakerDraftRow);
  updateRosterCountButtons();
}

function bindChairMakerTbaRows() {
  document.querySelectorAll("[data-schedule-draft-row]").forEach(syncChairMakerCasePresentation);
}

function bindChairMakerBreakRows() {
  document.querySelectorAll("[data-schedule-draft-row]").forEach((row) => syncChairMakerBreakDates(row, { prune: true }));
}

function getChairMakerInitials(name) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function escapeChairMakerHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildChairMakerStudentDirectory() {
  const studentMap = new Map();

  chairMakerStudentDirectorySeed.forEach((student) => {
    studentMap.set(student.name.toLowerCase(), student);
  });

  Object.entries(chairMakerRosterData).forEach(([group, students]) => {
    students.forEach((name, index) => {
      const key = name.toLowerCase();

      if (!studentMap.has(key)) {
        studentMap.set(key, {
          name,
          id: `22-${String(1800 + index).padStart(4, "0")}-${String(100 + index).padStart(3, "0")}`,
          section: group,
          site: "Imported rotation"
        });
      }
    });
  });

  return Array.from(studentMap.values()).sort((first, second) => first.name.localeCompare(second.name));
}

function renderChairMakerRosterRows(group) {
  if (!chairMakerRosterList) {
    return;
  }

  const students = chairMakerRosterData[group] || [];

  if (chairMakerRosterUndoButton) {
    chairMakerRosterUndoButton.disabled = !chairMakerRemovedStudents.some((item) => item.group === group);
  }

  chairMakerRosterList.innerHTML = `
    <div class="assigned-roster-row assigned-roster-head schedule-roster-row">
      <span>No.</span>
      <span>Student</span>
      <span>Section</span>
      <span>Action</span>
    </div>
    ${students.map((student, index) => `
      <div class="assigned-roster-row schedule-roster-row" data-roster-student-row>
        <span>${index + 1}.</span>
        <div class="roster-student-cell">
          <span class="avatar small-avatar">${escapeChairMakerHtml(getChairMakerInitials(student))}</span>
          <strong>${escapeChairMakerHtml(student)}</strong>
        </div>
        <span>${escapeChairMakerHtml(group)}</span>
        <button class="ghost-button danger-action schedule-roster-remove" type="button" data-remove-roster-student data-roster-group="${escapeChairMakerHtml(group)}" data-roster-student="${escapeChairMakerHtml(student)}">Remove</button>
      </div>
    `).join("")}
  `;
}

function renderChairMakerAddResults(query = "") {
  if (!chairMakerRosterAddResults || !chairMakerOpenRosterGroup) {
    return;
  }

  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);

  if (!terms.length) {
    chairMakerRosterAddResults.hidden = true;
    chairMakerRosterAddResults.innerHTML = "";
    return;
  }

  const assignedStudents = new Set((chairMakerRosterData[chairMakerOpenRosterGroup] || []).map((name) => name.toLowerCase()));
  const candidates = buildChairMakerStudentDirectory().filter((student) => {
    const searchable = `${student.name} ${student.id} ${student.section} ${student.site}`.toLowerCase();
    return !assignedStudents.has(student.name.toLowerCase()) && terms.every((term) => searchable.includes(term));
  });

  chairMakerRosterAddResults.hidden = false;

  if (!candidates.length) {
    chairMakerRosterAddResults.innerHTML = `
      <div class="schedule-roster-add-empty">
        <strong>No students found</strong>
        <span>Try another name, ID, section, or clinical site.</span>
      </div>
    `;
    return;
  }

  chairMakerRosterAddResults.innerHTML = candidates.map((student) => `
    <button class="schedule-roster-add-option" type="button" data-add-roster-student="${escapeChairMakerHtml(student.name)}">
      <strong>${escapeChairMakerHtml(student.name)}</strong>
      <span>Student | ${escapeChairMakerHtml(student.id)} | ${escapeChairMakerHtml(student.section)} | ${escapeChairMakerHtml(student.site)}</span>
    </button>
  `).join("");
}

function addChairMakerStudentToRoster(student) {
  if (!chairMakerOpenRosterGroup || !student) {
    return;
  }

  const roster = chairMakerRosterData[chairMakerOpenRosterGroup] || [];
  const cleanStudent = student.trim();

  if (roster.some((name) => name.toLowerCase() === cleanStudent.toLowerCase())) {
    setChairMakerStatus(chairMakerScheduleStatus, "Edited draft", "status-pending");
    setChairMakerMessage(chairMakerScheduleMessage, `${cleanStudent} is already in ${chairMakerOpenRosterGroup}.`, false);
    return;
  }

  chairMakerRosterData[chairMakerOpenRosterGroup] = [...roster, cleanStudent];
  renderChairMakerRosterRows(chairMakerOpenRosterGroup);
  renderChairMakerAddResults(chairMakerRosterAddSearch?.value || "");
  updateRosterCountButtons();
  setChairMakerStatus(chairMakerScheduleStatus, "Edited draft", "status-pending");
  setChairMakerMessage(chairMakerScheduleMessage, `${cleanStudent} added to ${chairMakerOpenRosterGroup}. Save changes in the student modal to keep this roster update.`);
}

function closeChairMakerRosterModal() {
  if (!chairMakerRosterModal) {
    return;
  }

  chairMakerRosterModal.hidden = true;
  document.body.classList.remove("modal-open");
  chairMakerOpenRosterGroup = "";
  chairMakerRosterSnapshot = [];

  if (chairMakerRosterAddSearch) {
    chairMakerRosterAddSearch.value = "";
  }

  if (chairMakerRosterAddResults) {
    chairMakerRosterAddResults.hidden = true;
    chairMakerRosterAddResults.innerHTML = "";
  }
}

function cancelChairMakerRosterModal() {
  if (chairMakerOpenRosterGroup) {
    chairMakerRosterData[chairMakerOpenRosterGroup] = [...chairMakerRosterSnapshot];
    chairMakerRemovedStudents = chairMakerRemovedStudents.filter((item) => item.group !== chairMakerOpenRosterGroup);
    updateRosterCountButtons();
  }

  closeChairMakerRosterModal();
}

function saveChairMakerRosterModal() {
  if (!chairMakerOpenRosterGroup) {
    closeChairMakerRosterModal();
    return;
  }

  const count = chairMakerRosterData[chairMakerOpenRosterGroup]?.length || 0;

  updateRosterCountButtons();
  setChairMakerStatus(chairMakerScheduleStatus, "Edited draft", "status-pending");
  setChairMakerMessage(chairMakerScheduleMessage, `${chairMakerOpenRosterGroup} student list saved with ${count} student${count === 1 ? "" : "s"}. Publish or republish when ready.`);
  closeChairMakerRosterModal();
}

function openChairMakerRosterModal(group) {
  if (!chairMakerRosterModal || !chairMakerRosterList) {
    return;
  }

  const students = chairMakerRosterData[group] || [];

  chairMakerOpenRosterGroup = group;
  chairMakerRosterSnapshot = [...students];

  if (chairMakerRosterUndoButton) {
    chairMakerRosterUndoButton.disabled = !chairMakerRemovedStudents.some((item) => item.group === group);
  }

  if (chairMakerRosterTitle) {
    chairMakerRosterTitle.textContent = `${group} Students`;
  }

  if (chairMakerRosterAddSearch) {
    chairMakerRosterAddSearch.value = "";
  }

  renderChairMakerRosterRows(group);
  renderChairMakerAddResults();
  chairMakerRosterModal.hidden = false;
  document.body.classList.add("modal-open");
}

function createManualScheduleRow() {
  const manualCount = document.querySelectorAll("[data-schedule-draft-row]").length + 1;
  const groupName = `Manual Schedule ${manualCount}`;

  if (!chairMakerRosterData[groupName]) {
    chairMakerRosterData[groupName] = [];
  }

  const row = document.createElement("div");
  row.className = "schedule-draft-row is-edited";
  row.dataset.scheduleDraftRow = "";
  row.innerHTML = `
    <div class="schedule-draft-main">
      <div>
        <strong>${groupName}</strong>
        <button class="roster-count-button" type="button" data-view-draft-roster data-roster-group="${groupName}">View students (0)</button>
      </div>
    </div>
    <div class="schedule-draft-actions">
      <button class="ghost-button" type="button" data-save-draft-row>Save edits</button>
      <button class="ghost-button danger-action" type="button" data-remove-draft-row>Remove</button>
    </div>
    <div class="schedule-draft-fields">
      <label class="form-label">Start date
        <input type="date" data-schedule-start-date>
      </label>
      <label class="form-label">End date
        <input type="date" data-schedule-end-date>
      </label>
      <div class="schedule-break-field" data-break-date-manager>
        <span>Break Dates</span>
        <div class="schedule-break-controls">
          <input type="date" data-break-date-input>
          <button class="ghost-button" type="button" data-add-break-date>Add break</button>
        </div>
        <div class="schedule-break-list" data-break-date-list></div>
      </div>
      <label class="form-label">Shift start
        <input type="time">
      </label>
      <label class="form-label">Shift end
        <input type="time">
      </label>
      <label class="form-label">Hospital / Area
        <select>
          <option>SAMCH - Delivery Room</option>
          <option>CCMC - Emergency Room</option>
          <option>CCMC - Operating Room</option>
          <option>CHN Brgy. Dumlog - Community Health Nursing Area</option>
        </select>
      </label>
      <label class="form-label">Case presentation date
        <input type="date" data-case-presentation-input>
      </label>
      <label class="form-label">Case presentation time
        <input type="time" data-case-presentation-input>
      </label>
      <label class="checkbox-line">
        <input type="checkbox" data-case-presentation-tba checked>
              No Case Presentation
      </label>
      <label class="form-label">Supervising CI
        <select>
          <option>Patricia Reyes, RN, MAN</option>
          <option>Miguel Santos, RN, MAN</option>
          <option>Elena Dela Cruz, RN, MN, DSCN</option>
          <option>Louise Wong</option>
          <option>Rivelyn Altamira</option>
        </select>
      </label>
    </div>
  `;

  chairMakerDraftList?.append(row);
  enhanceChairMakerDraftRow(row);
  syncChairMakerCasePresentation(row);
  updateRosterCountButtons();
  setChairMakerStatus(chairMakerScheduleStatus, "Edited draft", "status-pending");
  setChairMakerMessage(chairMakerScheduleMessage, "Manual schedule added. Fill the fields, save, then publish when ready.");
}

chairMakerFileButton?.addEventListener("click", () => {
  chairMakerFileInput?.click();
  setChairMakerStatus(chairMakerImportStatus, "File selected", "status-pending");
  enhanceChairMakerDraftRows();
  setChairMakerMessage(chairMakerImportMessage, "Schedule source file selected. Edit the schedule rows before publishing.");
});

chairMakerFileInput?.addEventListener("change", () => {
  const fileName = chairMakerFileInput.files?.[0]?.name || "selected file";

  if (chairMakerImportedFile) {
    chairMakerImportedFile.textContent = fileName;
  }

  setChairMakerStatus(chairMakerImportStatus, "File selected", "status-pending");
  setChairMakerMessage(chairMakerImportMessage, `${fileName} selected. Edit the schedule rows before publishing.`);
});

chairMakerManualButton?.addEventListener("click", () => {
  window.location.href = "manual-schedule.html";
});

chairMakerDraftList?.addEventListener("click", (event) => {
  const target = event.target;
  const row = target.closest("[data-schedule-draft-row]");

  if (!row) {
    return;
  }

  const addBreakButton = target.closest("[data-add-break-date]");
  const removeBreakButton = target.closest("[data-remove-break-date]");

  if (addBreakButton) {
    addChairMakerBreakDate(row);
    return;
  }

  if (removeBreakButton) {
    removeChairMakerBreakDate(row, removeBreakButton.dataset.removeBreakDate);
    return;
  }

  if (target.matches("[data-save-draft-row]")) {
    if (!validateChairMakerDraftRow(row)) {
      return;
    }

    const group = row.querySelector(".schedule-draft-main strong")?.textContent.trim() || "Schedule row";
    const breakCount = getChairMakerBreakDates(row).length;
    const activeDays = countChairMakerActiveDutyDays(row);

    row.classList.add("is-edited");
    setChairMakerStatus(chairMakerScheduleStatus, "Edited draft", "status-pending");
    setChairMakerMessage(chairMakerScheduleMessage, `${group} saved with ${activeDays} active duty day${activeDays === 1 ? "" : "s"} and ${breakCount} break date${breakCount === 1 ? "" : "s"}.`);
  }

  if (target.matches("[data-view-draft-roster]")) {
    openChairMakerRosterModal(target.dataset.rosterGroup || row.querySelector("strong")?.textContent.trim() || "Schedule");
  }

  if (target.matches("[data-remove-draft-row]")) {
    const group = row.querySelector("strong")?.textContent.trim() || "Schedule";
    row.remove();
    delete chairMakerRosterData[group];
    updateRosterCountButtons();
    setChairMakerStatus(chairMakerScheduleStatus, "Edited draft", "status-pending");
    setChairMakerMessage(chairMakerScheduleMessage, `${group} removed from this draft. Publish or republish when the schedule is correct.`);
  }
});

chairMakerDraftList?.addEventListener("change", (event) => {
  if (event.target.matches("[data-case-presentation-tba]")) {
    syncChairMakerCasePresentation(event.target.closest("[data-schedule-draft-row]"));
  }

  if (event.target.matches("[data-schedule-start-date], [data-schedule-end-date]")) {
    const row = event.target.closest("[data-schedule-draft-row]");
    const previousBreakCount = getChairMakerBreakDates(row).length;
    syncChairMakerBreakDates(row, { prune: true });
    const currentBreakCount = getChairMakerBreakDates(row).length;

    if (previousBreakCount !== currentBreakCount) {
      setChairMakerStatus(chairMakerScheduleStatus, "Edited draft", "status-pending");
      setChairMakerMessage(chairMakerScheduleMessage, "Break dates outside the new range were removed.");
    }
  }
});

chairMakerPublishButton?.addEventListener("click", () => {
  const rows = Array.from(document.querySelectorAll("[data-schedule-draft-row]"));

  if (rows.some((row) => !validateChairMakerDraftRow(row))) {
    return;
  }

  const totalBreaks = rows.reduce((sum, row) => sum + getChairMakerBreakDates(row).length, 0);
  const totalActiveDays = rows.reduce((sum, row) => sum + countChairMakerActiveDutyDays(row), 0);

  setChairMakerStatus(chairMakerScheduleStatus, "Published", "status-verified");
  setChairMakerMessage(chairMakerScheduleMessage, `Schedule published with ${totalActiveDays} active duty day${totalActiveDays === 1 ? "" : "s"} and ${totalBreaks} break date${totalBreaks === 1 ? "" : "s"} applied.`);
});

chairMakerRosterCloseButtons.forEach((button) => {
  button.addEventListener("click", cancelChairMakerRosterModal);
});

chairMakerRosterSaveButton?.addEventListener("click", saveChairMakerRosterModal);

chairMakerRosterUndoButton?.addEventListener("click", () => {
  const group = chairMakerOpenRosterGroup;
  const undoIndex = chairMakerRemovedStudents.map((item) => item.group).lastIndexOf(group);

  if (undoIndex < 0) {
    return;
  }

  const { student, index } = chairMakerRemovedStudents[undoIndex];
  const roster = chairMakerRosterData[group] || [];

  if (!roster.includes(student)) {
    roster.splice(Math.min(index, roster.length), 0, student);
    chairMakerRosterData[group] = roster;
  }

  chairMakerRemovedStudents.splice(undoIndex, 1);
  renderChairMakerRosterRows(group);
  renderChairMakerAddResults(chairMakerRosterAddSearch?.value || "");
  updateRosterCountButtons();
  setChairMakerStatus(chairMakerScheduleStatus, "Edited draft", "status-pending");
  setChairMakerMessage(chairMakerScheduleMessage, `${student} restored to ${group}.`);
});

chairMakerRosterAddSearch?.addEventListener("input", () => {
  renderChairMakerAddResults(chairMakerRosterAddSearch.value);
});

chairMakerRosterAddSearch?.addEventListener("focus", () => {
  renderChairMakerAddResults(chairMakerRosterAddSearch.value);
});

chairMakerRosterModal?.addEventListener("click", (event) => {
  if (event.target === chairMakerRosterModal) {
    cancelChairMakerRosterModal();
  }

  const removeButton = event.target.closest("[data-remove-roster-student]");
  const addButton = event.target.closest("[data-add-roster-student]");

  if (addButton) {
    addChairMakerStudentToRoster(addButton.dataset.addRosterStudent);
    return;
  }

  if (removeButton) {
    const group = removeButton.dataset.rosterGroup;
    const student = removeButton.dataset.rosterStudent;
    const removedIndex = (chairMakerRosterData[group] || []).findIndex((name) => name === student);

    chairMakerRemovedStudents.push({ group, student, index: Math.max(removedIndex, 0) });
    chairMakerRosterData[group] = (chairMakerRosterData[group] || []).filter((name) => name !== student);
    renderChairMakerRosterRows(group);
    renderChairMakerAddResults(chairMakerRosterAddSearch?.value || "");
    updateRosterCountButtons();
    setChairMakerStatus(chairMakerScheduleStatus, "Edited draft", "status-pending");
    setChairMakerMessage(chairMakerScheduleMessage, `${student} removed from ${group}. Save changes in the student modal to keep this roster update.`);
  }
});

enhanceChairMakerDraftRows();
bindChairMakerTbaRows();
bindChairMakerBreakRows();
updateRosterCountButtons();
