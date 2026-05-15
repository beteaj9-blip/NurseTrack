const selectedScheduleParams = new URLSearchParams(window.location.search);
const selectedDayHeading = document.querySelector("#selected-day-heading");
const selectedDayCount = document.querySelector("#selected-day-count");
const selectedDayList = document.querySelector("#day-schedule-list");
const selectedDayEmpty = document.querySelector("#day-schedule-empty");
const selectedScheduleHeading = document.querySelector("#selected-schedule-heading");
const selectedScheduleStatus = document.querySelector("#selected-schedule-status");
const selectedScheduleMessage = document.querySelector("#selected-schedule-message");
const selectedScheduleDetailsMessage = document.querySelector("#selected-schedule-details-message");
const selectedScheduleForm = document.querySelector("#selected-schedule-form");
const selectedScheduleEditButton = document.querySelector("#edit-selected-schedule");
const selectedScheduleStatusToggleButton = document.querySelector("#toggle-selected-schedule-status");
const selectedScheduleCancelButton = document.querySelector("#cancel-selected-schedule");
const selectedScheduleSaveButton = document.querySelector("#save-selected-schedule");
const selectedScheduleStudentsList = document.querySelector("#selected-schedule-students-list");
const selectedScheduleStudentCount = document.querySelector("#selected-schedule-student-count");
const selectedScheduleCaseTba = document.querySelector("#selected-schedule-case-tba");
const selectedScheduleCaseInputs = Array.from(document.querySelectorAll("[data-selected-case-input]"));
const selectedScheduleBreakDateInput = document.querySelector("#selected-schedule-break-date");
const addSelectedScheduleBreakButton = document.querySelector("#add-selected-schedule-break");
const selectedScheduleBreakList = document.querySelector("#selected-schedule-break-list");
const studentRosterAddSearch = document.querySelector("#student-roster-add-search");
const studentRosterAddOptions = document.querySelector("#student-roster-add-options");
const selectedScheduleNotes = document.querySelector("#selected-schedule-notes");
const cancelAssignedStudentsButton = document.querySelector("#cancel-assigned-students");
const saveAssignedStudentsButton = document.querySelector("#save-assigned-students");

const selectedScheduleFields = {
  title: document.querySelector("#selected-schedule-title"),
  group: document.querySelector("#selected-schedule-group"),
  startDate: document.querySelector("#selected-schedule-start-date"),
  endDate: document.querySelector("#selected-schedule-end-date"),
  hospital: document.querySelector("#selected-schedule-hospital"),
  area: document.querySelector("#selected-schedule-area"),
  dutyType: document.querySelector("#selected-schedule-duty-type"),
  shiftStart: document.querySelector("#selected-schedule-shift-start"),
  shiftEnd: document.querySelector("#selected-schedule-shift-end"),
  caseDate: document.querySelector("#selected-schedule-case-date"),
  caseTime: document.querySelector("#selected-schedule-case-time"),
  ci: document.querySelector("#selected-schedule-ci")
};

const selectedScheduleSummary = {
  date: document.querySelector("#selected-schedule-date-summary"),
  group: document.querySelector("#selected-schedule-group-summary"),
  students: document.querySelector("#selected-schedule-students-summary"),
  shift: document.querySelector("#selected-schedule-shift-summary")
};

const chairDayScheduleData = {
  "May 6, 2026": [
    {
      id: "may6-pedia",
      title: "Pedia Pulmo Ward Rotation",
      status: "Published",
      group: "BSN 3B - Group 1",
      startDate: "2026-05-06",
      endDate: "2026-05-06",
      hospital: "CCMC",
      area: "Pedia Pulmo Ward",
      dutyType: "Regular",
      shiftStart: "08:00",
      shiftEnd: "16:00",
      caseDate: "2026-05-02",
      caseTime: "08:00",
      caseTba: false,
      breakDates: [],
      ci: "Miguel Santos, RN, MAN",
      students: ["Zander Aligato", "Bianca Mariel Lumbre", "Klarisse Mumar", "Shaina Perez", "Rui Parba", "Relieza Rellon", "Ella Mae Maranga", "Hannah Louise Maturan", "Geralf Mojana", "Treshia Pinca"]
    },
    {
      id: "may6-monitoring",
      title: "Clinical Monitoring Duty",
      status: "Draft",
      group: "BSN 3A - Make-up Duty",
      startDate: "2026-05-06",
      endDate: "2026-05-06",
      hospital: "CCMC",
      area: "Pedia Pulmo Ward",
      dutyType: "Completion",
      shiftStart: "07:00",
      shiftEnd: "15:00",
      caseDate: "",
      caseTime: "",
      caseTba: true,
      breakDates: [],
      ci: "Patricia Reyes, RN, MAN",
      students: ["Maria Cruz", "Treasure Abadinas", "Carlo Fernandez", "Jasmine Lim"]
    }
  ],
  "May 8, 2026": [
    {
      id: "may8-wardb",
      title: "Emergency Room Rotation",
      status: "Published",
      group: "BSN 3A - Group 2",
      startDate: "2026-05-08",
      endDate: "2026-05-10",
      hospital: "CCMC",
      area: "Emergency Room",
      dutyType: "Regular",
      shiftStart: "07:00",
      shiftEnd: "15:00",
      caseDate: "2026-05-02",
      caseTime: "08:00",
      caseTba: false,
      breakDates: ["2026-05-09"],
      ci: "Patricia Reyes, RN, MAN",
      students: ["Maria Cruz", "Treasure Abadinas", "Carlo Fernandez", "Josh Anton Nuevas", "Jasmine Lim", "Kaye Amor", "Bea Arocha", "Grace Alolor", "Mae Arquiza", "Ivanka Arreglo", "Klier Ator", "Mejgan Cabual"]
    },
    {
      id: "may8-delivery",
      title: "Delivery Room Assist",
      status: "Published",
      group: "BSN 3A - Group 1",
      startDate: "2026-05-08",
      endDate: "2026-05-08",
      hospital: "SAMCH",
      area: "Delivery Room",
      dutyType: "Regular",
      shiftStart: "14:00",
      shiftEnd: "22:00",
      caseDate: "",
      caseTime: "",
      caseTba: true,
      breakDates: [],
      ci: "Rivelyn Altamira",
      students: ["Lady Dacayana", "Zyrelle Dianon", "Vera Doroon", "Shennen Dungcoy", "Mary Cielo Fernandez", "Jenelou Francis"]
    }
  ],
  "May 9, 2026": [
    {
      id: "may9-or",
      title: "Operating Room Duty",
      status: "Published",
      group: "BSN 4A - Group 1",
      startDate: "2026-05-09",
      endDate: "2026-05-09",
      hospital: "VSMMC",
      area: "OR Main",
      dutyType: "Regular",
      shiftStart: "08:00",
      shiftEnd: "17:00",
      caseDate: "2026-05-02",
      caseTime: "09:00",
      caseTba: false,
      breakDates: [],
      ci: "Elena Dela Cruz, RN, MN, DSCN",
      students: ["Jane Rea Basalo", "Bea Mae Batarilan", "Yelrich Bejoc", "Crystal Dela Calzada", "Nicole Dela Calzada", "Clark Leonor", "Chloe Relova", "Michelle Teano", "Oishi Valcorza"]
    }
  ]
};

const selectedDate = selectedScheduleParams.get("date") || "May 6, 2026";
const selectedDaySchedules = chairDayScheduleData[selectedDate] || [];

const chairStudentRosterOptions = [
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

Object.values(chairDayScheduleData).forEach((schedules) => {
  schedules.forEach((schedule) => {
    schedule.students.forEach((name, index) => {
      const exists = chairStudentRosterOptions.some((student) => student.name.toLowerCase() === name.toLowerCase());

      if (!exists) {
        const section = schedule.group.split(" - ")[0] || "BSN";

        chairStudentRosterOptions.push({
          name,
          id: `22-${String(1800 + index).padStart(4, "0")}-${String(100 + index).padStart(3, "0")}`,
          section,
          site: schedule.hospital
        });
      }
    });
  });
});

chairStudentRosterOptions.sort((first, second) => first.name.localeCompare(second.name));

let selectedScheduleActive = selectedDaySchedules[0] || null;
let selectedScheduleEditMode = false;
let selectedScheduleSnapshot = null;
let selectedRosterSnapshot = [];
let assignedStudentsDirty = false;
let pendingStudentMove = null;
let pendingStudentRemove = null;
let selectedScheduleStatusDialog = null;

function cloneSelectedSchedule(schedule) {
  return schedule ? JSON.parse(JSON.stringify(schedule)) : null;
}

function cloneStudentList(schedule) {
  return Array.isArray(schedule?.students) ? [...schedule.students] : [];
}

function setMessageBox(element, message, isSuccess = true) {
  if (!element) {
    return;
  }

  element.textContent = message || "";
  element.classList.toggle("is-success", Boolean(message) && isSuccess);
  element.classList.toggle("is-error", Boolean(message) && !isSuccess);
}

function setSelectedScheduleMessage(message, isSuccess = true, target = "roster") {
  const messageBox = target === "details" ? selectedScheduleDetailsMessage : selectedScheduleMessage;
  setMessageBox(messageBox, message, isSuccess);
}

function clearScheduleDetailsMessage() {
  setMessageBox(selectedScheduleDetailsMessage, "");
}

function clearRosterMessage() {
  setMessageBox(selectedScheduleMessage, "");
}

function statusBadgeClass(status) {
  if (status === "Published") return "status-verified";
  if (status === "Cancelled") return "status-rejected";
  return "status-pending";
}

function isSelectedScheduleCancelled(schedule = selectedScheduleActive) {
  return schedule?.status === "Cancelled";
}

function setAssignedStudentsDirty(isDirty) {
  assignedStudentsDirty = isDirty;

  if (saveAssignedStudentsButton) {
    saveAssignedStudentsButton.disabled = !assignedStudentsDirty || isSelectedScheduleCancelled();
  }

  if (cancelAssignedStudentsButton) {
    cancelAssignedStudentsButton.disabled = !assignedStudentsDirty || isSelectedScheduleCancelled();
  }
}

function markAssignedStudentsDirty() {
  if (isSelectedScheduleCancelled()) {
    setSelectedScheduleMessage("Reactivate this schedule before changing assigned students.", false, "roster");
    return;
  }

  setAssignedStudentsDirty(true);
  clearRosterMessage();
}

function restoreSelectedRosterFromSnapshot() {
  if (!selectedScheduleActive) {
    return;
  }

  selectedScheduleActive.students = [...selectedRosterSnapshot];
  updateSelectedStudentCount();
  syncSelectedScheduleSummary();
  renderSelectedStudents(selectedScheduleActive);
  renderSelectedDayList();
  renderStudentRosterAddOptions(studentRosterAddSearch?.value || "");
}

function saveAssignedStudents() {
  if (!assignedStudentsDirty || isSelectedScheduleCancelled()) {
    return;
  }

  selectedRosterSnapshot = cloneStudentList(selectedScheduleActive);
  setAssignedStudentsDirty(false);
  clearRosterMessage();
}

function cancelAssignedStudentsChanges() {
  if (!assignedStudentsDirty) {
    return;
  }

  restoreSelectedRosterFromSnapshot();
  setAssignedStudentsDirty(false);
  clearRosterMessage();
}

function restoreSelectedScheduleFromSnapshot() {
  if (!selectedScheduleActive || !selectedScheduleSnapshot) {
    return;
  }

  Object.keys(selectedScheduleActive).forEach((key) => {
    delete selectedScheduleActive[key];
  });

  Object.assign(selectedScheduleActive, cloneSelectedSchedule(selectedScheduleSnapshot));
}

function createSelectedStudentMoveDialog() {
  const existingDialog = document.querySelector("[data-selected-student-move-dialog]");

  if (existingDialog) {
    return existingDialog;
  }

  const dialog = document.createElement("div");
  dialog.className = "modal-backdrop";
  dialog.hidden = true;
  dialog.dataset.selectedStudentMoveDialog = "true";
  dialog.innerHTML = `
    <section class="modal-card confirm-modal" role="dialog" aria-modal="true" aria-labelledby="student-move-confirm-title" aria-describedby="student-move-confirm-copy">
      <div class="modal-heading">
        <div>
          <h2 id="student-move-confirm-title">Move this student?</h2>
        </div>
      </div>
      <p class="modal-copy" id="student-move-confirm-copy" data-student-move-confirm-copy></p>
      <div class="modal-actions">
        <button class="ghost-button" type="button" data-close-student-move-dialog>Cancel</button>
        <button class="primary-button" type="button" data-confirm-student-move>Confirm Move</button>
      </div>
    </section>
  `;

  document.body.appendChild(dialog);
  return dialog;
}

function createSelectedStudentRemoveDialog() {
  const existingDialog = document.querySelector("[data-selected-student-remove-dialog]");

  if (existingDialog) {
    return existingDialog;
  }

  const dialog = document.createElement("div");
  dialog.className = "modal-backdrop";
  dialog.hidden = true;
  dialog.dataset.selectedStudentRemoveDialog = "true";
  dialog.innerHTML = `
    <section class="modal-card confirm-modal" role="dialog" aria-modal="true" aria-labelledby="student-remove-confirm-title" aria-describedby="student-remove-confirm-copy">
      <div class="modal-heading">
        <div>
          <h2 id="student-remove-confirm-title">Remove this student?</h2>
        </div>
      </div>
      <p class="modal-copy" id="student-remove-confirm-copy" data-student-remove-confirm-copy></p>
      <div class="modal-actions">
        <button class="ghost-button" type="button" data-close-student-remove-dialog>Cancel</button>
        <button class="primary-button danger-confirm-button" type="button" data-confirm-student-remove>Remove Student</button>
      </div>
    </section>
  `;

  document.body.appendChild(dialog);
  return dialog;
}

const selectedStudentMoveDialog = createSelectedStudentMoveDialog();
const selectedStudentMoveCopy = selectedStudentMoveDialog.querySelector("[data-student-move-confirm-copy]");
const selectedStudentRemoveDialog = createSelectedStudentRemoveDialog();
const selectedStudentRemoveCopy = selectedStudentRemoveDialog.querySelector("[data-student-remove-confirm-copy]");

function updateSelectedStudentCount() {
  const count = selectedScheduleActive?.students?.length || 0;

  if (selectedScheduleStudentCount) {
    selectedScheduleStudentCount.textContent = `${count} student${count === 1 ? "" : "s"}`;
  }
}

function updateSelectedScheduleStatusAction() {
  if (!selectedScheduleStatusToggleButton) {
    return;
  }

  const hasSchedule = Boolean(selectedScheduleActive);
  const cancelled = isSelectedScheduleCancelled();

  selectedScheduleStatusToggleButton.disabled = !hasSchedule || selectedScheduleEditMode;
  selectedScheduleStatusToggleButton.textContent = cancelled ? "Reactivate Schedule" : "Cancel Schedule";
  selectedScheduleStatusToggleButton.classList.toggle("is-cancel-action", !cancelled);
  selectedScheduleStatusToggleButton.classList.toggle("is-reactivate-action", cancelled);
}

function updateScheduleDetailsEditState() {
  const hasSchedule = Boolean(selectedScheduleActive);
  const cancelled = isSelectedScheduleCancelled();
  const canEdit = hasSchedule && selectedScheduleEditMode && !cancelled;

  Object.values(selectedScheduleFields).forEach((field) => {
    if (field) {
      field.disabled = !canEdit;
    }
  });

  if (selectedScheduleNotes) {
    selectedScheduleNotes.disabled = !canEdit;
  }

  if (selectedScheduleCaseTba) {
    selectedScheduleCaseTba.disabled = !canEdit;
  }

  syncSelectedCasePresentationInputs();
  syncSelectedBreakControls();

  if (selectedScheduleCancelButton) {
    selectedScheduleCancelButton.disabled = !canEdit;
  }

  if (selectedScheduleSaveButton) {
    selectedScheduleSaveButton.disabled = !canEdit;
  }

  if (selectedScheduleEditButton) {
    selectedScheduleEditButton.disabled = !hasSchedule || canEdit || cancelled;
  }

  if (selectedScheduleForm) {
    selectedScheduleForm.classList.toggle("is-readonly", !canEdit);
    selectedScheduleForm.classList.toggle("is-cancelled", cancelled);
  }

  updateSelectedScheduleStatusAction();
  setAssignedStudentsDirty(assignedStudentsDirty);
}

function enableSelectedScheduleEditMode() {
  if (!selectedScheduleActive) {
    setSelectedScheduleMessage("Select a schedule before editing.", false, "details");
    return;
  }

  if (isSelectedScheduleCancelled()) {
    setSelectedScheduleMessage("Reactivate this schedule before editing its details.", false, "details");
    return;
  }

  clearRosterMessage();
  selectedScheduleSnapshot = cloneSelectedSchedule(selectedScheduleActive);
  selectedScheduleEditMode = true;
  updateScheduleDetailsEditState();
  clearScheduleDetailsMessage();
}

function cancelSelectedScheduleEditMode() {
  restoreSelectedScheduleFromSnapshot();
  selectedScheduleEditMode = false;
  selectedScheduleSnapshot = null;
  populateSelectedSchedule(selectedScheduleActive, false);
  clearScheduleDetailsMessage();
}

function disableSelectedScheduleEditMode() {
  selectedScheduleEditMode = false;
  selectedScheduleSnapshot = null;
  updateScheduleDetailsEditState();
}

function toggleSelectedScheduleStatus() {
  if (!selectedScheduleActive) {
    return;
  }

  selectedScheduleActive.status = isSelectedScheduleCancelled() ? "Published" : "Cancelled";
  selectedScheduleEditMode = false;
  selectedScheduleSnapshot = null;
  setAssignedStudentsDirty(false);
  syncSelectedScheduleSummary();
  renderSelectedDayList();
  updateScheduleDetailsEditState();
}

function createSelectedScheduleStatusDialog() {
  const dialog = document.createElement("div");
  dialog.className = "modal-backdrop";
  dialog.hidden = true;
  dialog.innerHTML = `
    <section class="modal-card confirm-modal" role="dialog" aria-modal="true" aria-labelledby="selected-status-title">
      <div class="modal-heading">
        <div>
          <h2 id="selected-status-title">Update schedule status?</h2>
        </div>
        <button class="icon-button modal-close" type="button" data-close-selected-status aria-label="Close modal"></button>
      </div>
      <p class="modal-copy" data-selected-status-copy>Are you sure you want to update this schedule?</p>
      <div class="modal-actions">
        <button class="ghost-button" type="button" data-close-selected-status>Cancel</button>
        <button class="primary-button workspace-action" type="button" data-confirm-selected-status>Confirm</button>
      </div>
    </section>
  `;

  document.body.appendChild(dialog);
  return dialog;
}

function openSelectedScheduleStatusDialog() {
  if (!selectedScheduleActive) {
    return;
  }

  if (!selectedScheduleStatusDialog) {
    selectedScheduleStatusDialog = createSelectedScheduleStatusDialog();
  }

  const willReactivate = isSelectedScheduleCancelled();
  const title = selectedScheduleStatusDialog.querySelector("#selected-status-title");
  const copy = selectedScheduleStatusDialog.querySelector("[data-selected-status-copy]");
  const confirm = selectedScheduleStatusDialog.querySelector("[data-confirm-selected-status]");

  if (title) {
    title.textContent = willReactivate ? "Reactivate this schedule?" : "Cancel this schedule?";
  }

  if (copy) {
    copy.textContent = willReactivate
      ? `Reactivate ${selectedScheduleActive.title}? This will allow the schedule to be edited and used again.`
      : `Cancel ${selectedScheduleActive.title}? This keeps the record in the list but marks it as cancelled.`;
  }

  if (confirm) {
    confirm.textContent = willReactivate ? "Reactivate Schedule" : "Cancel Schedule";
    confirm.classList.toggle("danger-confirm-button", !willReactivate);
  }

  selectedScheduleStatusDialog.hidden = false;
  document.body.classList.add("modal-open");
}

function closeSelectedScheduleStatusDialog() {
  if (selectedScheduleStatusDialog) {
    selectedScheduleStatusDialog.hidden = true;
  }

  document.body.classList.remove("modal-open");
}

function confirmSelectedScheduleStatusUpdate() {
  toggleSelectedScheduleStatus();
  closeSelectedScheduleStatusDialog();
}

function closeSelectedStudentMoveDialog() {
  selectedStudentMoveDialog.hidden = true;
  document.body.classList.remove("modal-open");

  if (pendingStudentMove?.select) {
    pendingStudentMove.select.value = pendingStudentMove.previousTarget;
  }

  pendingStudentMove = null;
}

function closeSelectedStudentRemoveDialog() {
  selectedStudentRemoveDialog.hidden = true;
  document.body.classList.remove("modal-open");
  pendingStudentRemove = null;
}

function openSelectedStudentMoveDialog(move) {
  if (isSelectedScheduleCancelled()) {
    setSelectedScheduleMessage("Reactivate this schedule before moving students.", false, "roster");
    return;
  }

  pendingStudentMove = move;

  if (selectedStudentMoveCopy) {
    selectedStudentMoveCopy.textContent = `Are you sure you want to move ${move.student} from ${move.fromGroup} to ${move.target}? This will remove the student from the current schedule roster.`;
  }

  selectedStudentMoveDialog.hidden = false;
  document.body.classList.add("modal-open");
}

function openSelectedStudentRemoveDialog(remove) {
  if (isSelectedScheduleCancelled()) {
    setSelectedScheduleMessage("Reactivate this schedule before removing students.", false, "roster");
    return;
  }

  pendingStudentRemove = remove;

  if (selectedStudentRemoveCopy) {
    selectedStudentRemoveCopy.textContent = `Are you sure you want to remove ${remove.student} from ${selectedScheduleActive?.group || "this schedule"}? This student will no longer appear in this schedule roster.`;
  }

  selectedStudentRemoveDialog.hidden = false;
  document.body.classList.add("modal-open");
}

function applySelectedStudentMove() {
  if (!pendingStudentMove) {
    return;
  }

  const { student } = pendingStudentMove;

  if (selectedScheduleActive) {
    selectedScheduleActive.students = selectedScheduleActive.students.filter((name) => name !== student);
  }

  updateSelectedStudentCount();
  syncSelectedScheduleSummary();
  renderSelectedStudents(selectedScheduleActive);
  renderSelectedDayList();
  renderStudentRosterAddOptions(studentRosterAddSearch?.value || "");
  clearScheduleDetailsMessage();
  markAssignedStudentsDirty();

  pendingStudentMove = null;
  selectedStudentMoveDialog.hidden = true;
  document.body.classList.remove("modal-open");
}

function applySelectedStudentRemove() {
  if (!pendingStudentRemove) {
    return;
  }

  const { student } = pendingStudentRemove;

  if (selectedScheduleActive) {
    selectedScheduleActive.students = selectedScheduleActive.students.filter((name) => name !== student);
  }

  updateSelectedStudentCount();
  syncSelectedScheduleSummary();
  renderSelectedStudents(selectedScheduleActive);
  renderSelectedDayList();
  renderStudentRosterAddOptions(studentRosterAddSearch?.value || "");
  clearScheduleDetailsMessage();
  markAssignedStudentsDirty();

  pendingStudentRemove = null;
  selectedStudentRemoveDialog.hidden = true;
  document.body.classList.remove("modal-open");
}

function setSelectedScheduleValue(field, value) {
  if (!field) {
    return;
  }

  if (field.tagName === "SELECT" && value) {
    const hasOption = Array.from(field.options).some((option) => option.value === value || option.textContent === value);

    if (!hasOption) {
      field.add(new Option(value, value));
    }
  }

  field.value = value || "";
}

function parseSelectedScheduleDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatSelectedBreakDate(value) {
  const date = parseSelectedScheduleDate(value);

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

function getSelectedBreakDates(schedule = selectedScheduleActive) {
  return Array.from(new Set(schedule?.breakDates || []))
    .filter((date) => Boolean(parseSelectedScheduleDate(date)))
    .sort();
}

function setSelectedBreakDates(dates) {
  if (!selectedScheduleActive) {
    return;
  }

  selectedScheduleActive.breakDates = Array.from(new Set((dates || [])
    .filter((date) => Boolean(parseSelectedScheduleDate(date)))))
    .sort();
}

function selectedBreakDateInRange(date) {
  const start = selectedScheduleActive?.startDate || "";
  const end = selectedScheduleActive?.endDate || "";
  return Boolean(date && start && end && start <= end && date >= start && date <= end);
}

function formatSelectedScheduleDateRange(schedule) {
  if (!schedule) {
    return "Not selected";
  }

  const breakDates = getSelectedBreakDates(schedule);
  const breakSummary = breakDates.length
    ? ` (${breakDates.length} break date${breakDates.length === 1 ? "" : "s"})`
    : "";

  if (schedule.startDate === schedule.endDate) {
    return `${schedule.startDate}${breakSummary}`;
  }

  return `${schedule.startDate} to ${schedule.endDate}${breakSummary}`;
}

function renderSelectedBreakDates() {
  if (!selectedScheduleBreakList) {
    return;
  }

  const breakDates = getSelectedBreakDates();
  const canEdit = Boolean(selectedScheduleActive && selectedScheduleEditMode && !isSelectedScheduleCancelled());

  if (!breakDates.length) {
    selectedScheduleBreakList.innerHTML = `<span class="schedule-break-empty">No breaks added</span>`;
    return;
  }

  selectedScheduleBreakList.innerHTML = breakDates.map((date) => `
    <button class="schedule-break-chip" type="button" data-remove-selected-break="${date}"${canEdit ? "" : " disabled"}>
      <span>${formatSelectedBreakDate(date)}</span>
      <span aria-hidden="true">x</span>
    </button>
  `).join("");
}

function syncSelectedBreakControls(options = {}) {
  const canEdit = Boolean(selectedScheduleActive && selectedScheduleEditMode && !isSelectedScheduleCancelled());
  const start = selectedScheduleActive?.startDate || "";
  const end = selectedScheduleActive?.endDate || "";
  const hasValidRange = Boolean(parseSelectedScheduleDate(start) && parseSelectedScheduleDate(end) && start <= end);

  if (selectedScheduleBreakDateInput) {
    selectedScheduleBreakDateInput.min = start || "";
    selectedScheduleBreakDateInput.max = end || "";
    selectedScheduleBreakDateInput.disabled = !canEdit || !hasValidRange;
  }

  if (addSelectedScheduleBreakButton) {
    addSelectedScheduleBreakButton.disabled = !canEdit || !hasValidRange;
  }

  if (options.prune && hasValidRange) {
    const previousCount = getSelectedBreakDates().length;
    setSelectedBreakDates(getSelectedBreakDates().filter(selectedBreakDateInRange));
    const currentCount = getSelectedBreakDates().length;

    if (previousCount !== currentCount) {
      setSelectedScheduleMessage("Break dates outside the selected date range were removed.", true, "details");
    }
  }

  renderSelectedBreakDates();
}

function addSelectedBreakDate() {
  if (!selectedScheduleActive || isSelectedScheduleCancelled()) {
    setSelectedScheduleMessage("Reactivate this schedule before adding break dates.", false, "details");
    return;
  }

  const date = selectedScheduleBreakDateInput?.value || "";

  if (!selectedBreakDateInRange(date)) {
    setSelectedScheduleMessage("Break date must be inside the selected start and end dates.", false, "details");
    return;
  }

  const breakDates = getSelectedBreakDates();

  if (breakDates.includes(date)) {
    setSelectedScheduleMessage(`${formatSelectedBreakDate(date)} is already marked as a break.`, false, "details");
    return;
  }

  setSelectedBreakDates([...breakDates, date]);

  if (selectedScheduleBreakDateInput) {
    selectedScheduleBreakDateInput.value = "";
  }

  syncSelectedScheduleSummary();
  syncSelectedBreakControls();
  renderSelectedDayList();
  setSelectedScheduleMessage(`${formatSelectedBreakDate(date)} added as a break date.`, true, "details");
}

function syncSelectedCasePresentationInputs() {
  const isTba = Boolean(selectedScheduleCaseTba?.checked);
  const canEdit = Boolean(selectedScheduleActive && selectedScheduleEditMode && !isSelectedScheduleCancelled());

  selectedScheduleCaseInputs.forEach((input) => {
    input.disabled = !canEdit || isTba;

    if (isTba && canEdit) {
      input.value = "";
    }
  });
}

function renderStudentRosterAddOptions(query = "") {
  if (!studentRosterAddOptions) {
    return;
  }

  studentRosterAddOptions.innerHTML = "";

  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);

  if (!terms.length || isSelectedScheduleCancelled()) {
    studentRosterAddOptions.hidden = true;
    return;
  }

  const assignedStudents = selectedScheduleActive?.students || [];
  const availableStudents = chairStudentRosterOptions.filter((student) => {
    const isAssigned = assignedStudents.some((name) => name.toLowerCase() === student.name.toLowerCase());
    const searchable = `${student.name} ${student.id} ${student.section} ${student.site}`.toLowerCase();

    return !isAssigned && terms.every((term) => searchable.includes(term));
  });

  if (!availableStudents.length) {
    studentRosterAddOptions.innerHTML = `<div class="custom-dropdown-empty">No students found</div>`;
    studentRosterAddOptions.hidden = false;
    return;
  }

  availableStudents.forEach((student) => {
    const item = document.createElement("button");
    item.className = "custom-dropdown-item";
    item.type = "button";
    item.innerHTML = `
      <strong>${student.name}</strong>
      <small>${student.id} | ${student.section}</small>
    `;

    item.addEventListener("click", () => {
      addStudentToSelectedRoster(student.name);
      studentRosterAddOptions.hidden = true;
    });

    studentRosterAddOptions.appendChild(item);
  });

  studentRosterAddOptions.hidden = false;
}

function addStudentToSelectedRoster(student) {
  if (!selectedScheduleActive) {
    setSelectedScheduleMessage("Select a schedule before adding a student.", false, "roster");
    return;
  }

  if (isSelectedScheduleCancelled()) {
    setSelectedScheduleMessage("Reactivate this schedule before adding students.", false, "roster");
    return;
  }

  const normalizedStudent = student.trim().replace(/\s+/g, " ");

  if (!normalizedStudent) {
    setSelectedScheduleMessage("Search or type a student name before adding.", false, "roster");
    return;
  }

  const alreadyAssigned = selectedScheduleActive.students.some((name) => name.toLowerCase() === normalizedStudent.toLowerCase());

  if (alreadyAssigned) {
    setSelectedScheduleMessage(`${normalizedStudent} is already assigned to this schedule.`, false, "roster");
    return;
  }

  selectedScheduleActive.students.push(normalizedStudent);

  const isKnownStudent = chairStudentRosterOptions.some((option) => option.name.toLowerCase() === normalizedStudent.toLowerCase());

  if (!isKnownStudent) {
    chairStudentRosterOptions.push({
      name: normalizedStudent,
      id: "Manual entry",
      section: selectedScheduleActive.group.split(" - ")[0] || "BSN",
      site: selectedScheduleActive.hospital || "Selected site"
    });
    chairStudentRosterOptions.sort((first, second) => first.name.localeCompare(second.name));
  }

  if (studentRosterAddSearch) {
    studentRosterAddSearch.value = "";
  }

  updateSelectedStudentCount();
  syncSelectedScheduleSummary();
  renderSelectedStudents(selectedScheduleActive);
  renderStudentRosterAddOptions();
  if (studentRosterAddOptions) {
    studentRosterAddOptions.hidden = true;
  }
  renderSelectedDayList();
  clearScheduleDetailsMessage();
  markAssignedStudentsDirty();
}

function renderSelectedDayList() {
  if (selectedDayHeading) {
    selectedDayHeading.textContent = selectedDate;
  }

  if (selectedDayCount) {
    selectedDayCount.textContent = `${selectedDaySchedules.length} schedule${selectedDaySchedules.length === 1 ? "" : "s"}`;
  }

  if (selectedDayEmpty) {
    selectedDayEmpty.hidden = selectedDaySchedules.length > 0;
  }

  if (!selectedDayList) {
    return;
  }

  selectedDayList.innerHTML = selectedDaySchedules.map((schedule) => {
    const cancelled = schedule.status === "Cancelled";

    return `
      <button class="day-schedule-card ${schedule.id === selectedScheduleActive?.id ? "is-selected" : ""} ${cancelled ? "is-cancelled" : ""}" type="button" data-day-schedule-id="${schedule.id}">
        <div class="day-schedule-card-meta">
          <strong>${schedule.title}</strong>
          <mark class="status-badge ${statusBadgeClass(schedule.status)}">${schedule.status || "Draft"}</mark>
        </div>
        <span>${schedule.group}</span>
        <small>${schedule.area} - ${schedule.shiftStart} to ${schedule.shiftEnd}</small>
        ${getSelectedBreakDates(schedule).length ? `<small class="schedule-break-summary">Breaks: ${getSelectedBreakDates(schedule).map(formatSelectedBreakDate).join(", ")}</small>` : ""}
      </button>
    `;
  }).join("");

  selectedDayList.querySelectorAll("[data-day-schedule-id]").forEach((button) => {
    button.addEventListener("click", () => {
      if (assignedStudentsDirty) {
        cancelAssignedStudentsChanges();
      }

      const schedule = selectedDaySchedules.find((item) => item.id === button.dataset.dayScheduleId);
      populateSelectedSchedule(schedule);
    });
  });
}

function renderSelectedStudents(schedule) {
  if (!selectedScheduleStudentsList) {
    return;
  }

  const students = schedule?.students || [];
  const cancelled = isSelectedScheduleCancelled(schedule);
  const moveTargetOptions = ["BSN 3A - Group 1", "BSN 3A - Group 2", "BSN 3A - Make-up Duty", "BSN 3B - Group 1", "BSN 4A - Group 1"]
    .filter((group) => group !== schedule?.group);

  updateSelectedStudentCount();

  selectedScheduleStudentsList.innerHTML = `
    <div class="student-roster-table-row student-roster-table-head">
      <span>No.</span>
      <span>Student</span>
      <span>Move to</span>
      <span>Action</span>
    </div>
    ${students.map((student, index) => {
      const initials = student.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

      return `
        <div class="student-roster-table-row" data-student-roster-row>
          <span>${index + 1}.</span>
          <div class="roster-student-cell">
            <span class="avatar mini-avatar">${initials}</span>
            <strong>${student}</strong>
          </div>
          <label class="form-label compact-roster-select">
            <select data-student-move-target aria-label="Move ${student} to"${cancelled ? " disabled" : ""}>
              ${moveTargetOptions.map((group) => `<option>${group}</option>`).join("")}
            </select>
          </label>
          <div class="roster-action-buttons">
            <button class="ghost-button danger-action" type="button" data-remove-selected-student${cancelled ? " disabled" : ""}>Remove</button>
          </div>
        </div>
      `;
    }).join("")}
  `;

  selectedScheduleStudentsList.querySelectorAll("[data-student-move-target]").forEach((select) => {
    select.dataset.previousTarget = select.value;

    select.addEventListener("change", () => {
      const row = select.closest("[data-student-roster-row]");
      const student = row?.querySelector("strong")?.textContent.trim() || "Student";
      const target = select.value || "selected group";
      const fromGroup = selectedScheduleActive?.group || "the current schedule";
      const previousTarget = select.dataset.previousTarget || target;

      openSelectedStudentMoveDialog({ row, select, student, target, fromGroup, previousTarget });
    });
  });

  selectedScheduleStudentsList.querySelectorAll("[data-remove-selected-student]").forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest("[data-student-roster-row]");
      const student = row?.querySelector("strong")?.textContent.trim() || "Student";

      openSelectedStudentRemoveDialog({ row, student });
    });
  });
}

function syncSelectedScheduleSummary() {
  if (!selectedScheduleActive) {
    return;
  }

  if (selectedScheduleEditMode && !isSelectedScheduleCancelled()) {
    selectedScheduleActive.title = selectedScheduleFields.title?.value || selectedScheduleActive.title;
    selectedScheduleActive.group = selectedScheduleFields.group?.value || selectedScheduleActive.group;
    selectedScheduleActive.startDate = selectedScheduleFields.startDate?.value || selectedScheduleActive.startDate;
    selectedScheduleActive.endDate = selectedScheduleFields.endDate?.value || selectedScheduleActive.endDate;
    selectedScheduleActive.hospital = selectedScheduleFields.hospital?.value || selectedScheduleActive.hospital;
    selectedScheduleActive.area = selectedScheduleFields.area?.value || selectedScheduleActive.area;
    selectedScheduleActive.dutyType = selectedScheduleFields.dutyType?.value || selectedScheduleActive.dutyType || "Regular";
    selectedScheduleActive.shiftStart = selectedScheduleFields.shiftStart?.value || selectedScheduleActive.shiftStart;
    selectedScheduleActive.shiftEnd = selectedScheduleFields.shiftEnd?.value || selectedScheduleActive.shiftEnd;
    selectedScheduleActive.caseTba = Boolean(selectedScheduleCaseTba?.checked);
    selectedScheduleActive.caseDate = selectedScheduleActive.caseTba ? "" : (selectedScheduleFields.caseDate?.value || "");
    selectedScheduleActive.caseTime = selectedScheduleActive.caseTba ? "" : (selectedScheduleFields.caseTime?.value || "");
    selectedScheduleActive.ci = selectedScheduleFields.ci?.value || selectedScheduleActive.ci;
    syncSelectedBreakControls({ prune: true });
  }

  if (selectedScheduleHeading) {
    selectedScheduleHeading.textContent = selectedScheduleActive.title;
  }

  if (selectedScheduleStatus) {
    selectedScheduleStatus.textContent = selectedScheduleActive.status || "Draft";
    selectedScheduleStatus.className = `status-badge ${statusBadgeClass(selectedScheduleActive.status)}`;
  }

  if (selectedScheduleSummary.date) {
    selectedScheduleSummary.date.textContent = formatSelectedScheduleDateRange(selectedScheduleActive);
  }

  if (selectedScheduleSummary.group) {
    selectedScheduleSummary.group.textContent = selectedScheduleActive.group;
  }

  if (selectedScheduleSummary.students) {
    selectedScheduleSummary.students.textContent = `${selectedScheduleActive.students.length} assigned`;
  }

  if (selectedScheduleSummary.shift) {
    selectedScheduleSummary.shift.textContent = `${selectedScheduleActive.shiftStart} to ${selectedScheduleActive.shiftEnd}`;
  }

  updateSelectedScheduleStatusAction();
}

function populateSelectedSchedule(schedule, resetEditMode = true) {
  selectedScheduleActive = schedule;
  selectedRosterSnapshot = cloneStudentList(schedule);
  setAssignedStudentsDirty(false);

  if (resetEditMode) {
    selectedScheduleEditMode = false;
    selectedScheduleSnapshot = null;
  }

  renderSelectedDayList();

  if (!schedule) {
    if (selectedScheduleHeading) selectedScheduleHeading.textContent = "Select a schedule";
    if (selectedScheduleStatus) {
      selectedScheduleStatus.textContent = "Draft";
      selectedScheduleStatus.className = "status-badge status-pending";
    }
    if (selectedScheduleStudentsList) selectedScheduleStudentsList.innerHTML = "";
    if (selectedScheduleStudentCount) selectedScheduleStudentCount.textContent = "0 students";
    if (selectedScheduleSummary.date) selectedScheduleSummary.date.textContent = "Not selected";
    if (selectedScheduleSummary.group) selectedScheduleSummary.group.textContent = "No group";
    if (selectedScheduleSummary.students) selectedScheduleSummary.students.textContent = "0 assigned";
    if (selectedScheduleSummary.shift) selectedScheduleSummary.shift.textContent = "No shift";
    if (studentRosterAddOptions) studentRosterAddOptions.hidden = true;
    syncSelectedBreakControls();
    updateScheduleDetailsEditState();
    clearScheduleDetailsMessage();
    clearRosterMessage();
    return;
  }

  setSelectedScheduleValue(selectedScheduleFields.title, schedule.title);
  setSelectedScheduleValue(selectedScheduleFields.group, schedule.group);
  setSelectedScheduleValue(selectedScheduleFields.startDate, schedule.startDate);
  setSelectedScheduleValue(selectedScheduleFields.endDate, schedule.endDate);
  setSelectedScheduleValue(selectedScheduleFields.hospital, schedule.hospital);
  setSelectedScheduleValue(selectedScheduleFields.area, schedule.area);
  setSelectedScheduleValue(selectedScheduleFields.dutyType, schedule.dutyType || "Regular");
  setSelectedScheduleValue(selectedScheduleFields.shiftStart, schedule.shiftStart);
  setSelectedScheduleValue(selectedScheduleFields.shiftEnd, schedule.shiftEnd);
  setSelectedScheduleValue(selectedScheduleFields.caseDate, schedule.caseDate);
  setSelectedScheduleValue(selectedScheduleFields.caseTime, schedule.caseTime);
  setSelectedScheduleValue(selectedScheduleFields.ci, schedule.ci);

  if (selectedScheduleNotes) {
    selectedScheduleNotes.value = "";
  }

  if (selectedScheduleCaseTba) {
    selectedScheduleCaseTba.checked = schedule.caseTba;
  }

  syncSelectedCasePresentationInputs();
  syncSelectedBreakControls({ prune: true });
  syncSelectedScheduleSummary();
  renderSelectedStudents(schedule);
  renderStudentRosterAddOptions(studentRosterAddSearch?.value || "");
  updateScheduleDetailsEditState();

  if (resetEditMode) {
    clearScheduleDetailsMessage();
    clearRosterMessage();
  }
}

Object.values(selectedScheduleFields).forEach((field) => {
  field?.addEventListener("input", () => {
    if (selectedScheduleEditMode && !isSelectedScheduleCancelled()) {
      syncSelectedScheduleSummary();
      renderSelectedDayList();
    }
  });

  field?.addEventListener("change", () => {
    if (selectedScheduleEditMode && !isSelectedScheduleCancelled()) {
      syncSelectedScheduleSummary();
      renderSelectedDayList();
    }
  });
});

addSelectedScheduleBreakButton?.addEventListener("click", addSelectedBreakDate);

selectedScheduleBreakList?.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove-selected-break]");

  if (!removeButton || !selectedScheduleEditMode || isSelectedScheduleCancelled()) {
    return;
  }

  const date = removeButton.dataset.removeSelectedBreak;
  setSelectedBreakDates(getSelectedBreakDates().filter((item) => item !== date));
  syncSelectedScheduleSummary();
  syncSelectedBreakControls();
  renderSelectedDayList();
  setSelectedScheduleMessage(`${formatSelectedBreakDate(date)} removed from break dates.`, true, "details");
});

selectedScheduleCaseTba?.addEventListener("change", () => {
  if (selectedScheduleEditMode && !isSelectedScheduleCancelled()) {
    syncSelectedCasePresentationInputs();
    syncSelectedScheduleSummary();
    renderSelectedDayList();
  }
});

selectedScheduleEditButton?.addEventListener("click", enableSelectedScheduleEditMode);

selectedScheduleCancelButton?.addEventListener("click", () => {
  if (!selectedScheduleEditMode) {
    return;
  }

  cancelSelectedScheduleEditMode();
});

selectedScheduleForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!selectedScheduleEditMode) {
    setSelectedScheduleMessage("Press Edit Schedule before saving schedule details.", false, "details");
    return;
  }

  if (isSelectedScheduleCancelled()) {
    setSelectedScheduleMessage("Reactivate this schedule before saving changes.", false, "details");
    return;
  }

  syncSelectedScheduleSummary();
  renderSelectedDayList();
  disableSelectedScheduleEditMode();
  clearScheduleDetailsMessage();
});

selectedScheduleStatusToggleButton?.addEventListener("click", openSelectedScheduleStatusDialog);

studentRosterAddSearch?.addEventListener("focus", () => {
  renderStudentRosterAddOptions(studentRosterAddSearch.value);

  if (studentRosterAddOptions) {
    studentRosterAddOptions.hidden = !studentRosterAddSearch.value.trim() || isSelectedScheduleCancelled();
  }
});

studentRosterAddSearch?.addEventListener("input", () => {
  renderStudentRosterAddOptions(studentRosterAddSearch.value);

  if (studentRosterAddOptions) {
    studentRosterAddOptions.hidden = !studentRosterAddSearch.value.trim() || isSelectedScheduleCancelled();
  }
});

studentRosterAddSearch?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") {
    return;
  }

  event.preventDefault();
  addStudentToSelectedRoster(studentRosterAddSearch?.value || "");
});

cancelAssignedStudentsButton?.addEventListener("click", cancelAssignedStudentsChanges);
saveAssignedStudentsButton?.addEventListener("click", saveAssignedStudents);

selectedStudentMoveDialog.querySelectorAll("[data-close-student-move-dialog]").forEach((button) => {
  button.addEventListener("click", closeSelectedStudentMoveDialog);
});

selectedStudentMoveDialog.querySelector("[data-confirm-student-move]")?.addEventListener("click", applySelectedStudentMove);

selectedStudentMoveDialog.addEventListener("click", (event) => {
  if (event.target === selectedStudentMoveDialog) {
    closeSelectedStudentMoveDialog();
  }
});

selectedStudentRemoveDialog.querySelectorAll("[data-close-student-remove-dialog]").forEach((button) => {
  button.addEventListener("click", closeSelectedStudentRemoveDialog);
});

selectedStudentRemoveDialog.querySelector("[data-confirm-student-remove]")?.addEventListener("click", applySelectedStudentRemove);

selectedStudentRemoveDialog.addEventListener("click", (event) => {
  if (event.target === selectedStudentRemoveDialog) {
    closeSelectedStudentRemoveDialog();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !selectedStudentMoveDialog.hidden) {
    closeSelectedStudentMoveDialog();
  }

  if (event.key === "Escape" && !selectedStudentRemoveDialog.hidden) {
    closeSelectedStudentRemoveDialog();
  }

  if (event.key === "Escape" && selectedScheduleStatusDialog && !selectedScheduleStatusDialog.hidden) {
    closeSelectedScheduleStatusDialog();
  }
});

document.addEventListener("click", (event) => {
  if (selectedScheduleStatusDialog && event.target.closest("[data-close-selected-status]")) {
    closeSelectedScheduleStatusDialog();
    return;
  }

  if (selectedScheduleStatusDialog && event.target.closest("[data-confirm-selected-status]")) {
    confirmSelectedScheduleStatusUpdate();
    return;
  }

  if (selectedScheduleStatusDialog && event.target === selectedScheduleStatusDialog) {
    closeSelectedScheduleStatusDialog();
    return;
  }

  if (!studentRosterAddSearch || !studentRosterAddOptions) {
    return;
  }

  if (!studentRosterAddSearch.contains(event.target) && !studentRosterAddOptions.contains(event.target)) {
    studentRosterAddOptions.hidden = true;
  }
});

renderSelectedDayList();
populateSelectedSchedule(selectedScheduleActive);