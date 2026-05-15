const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const studentSearch = document.querySelector("#student-search");
const studentItems = Array.from(document.querySelectorAll(".assign-student"));
const assignmentChecks = Array.from(document.querySelectorAll(".assign-student input[type='checkbox']"));
const capacityBadge = document.querySelector("#capacity-badge");
const slotBadge = document.querySelector("#slot-badge");
const capacityProgress = document.querySelector("#capacity-progress");
const capacityNote = document.querySelector("#capacity-note");
const saveAssignments = document.querySelector("#save-assignments");
const message = document.querySelector("#form-message");
const capacity = 6;

function setMessage(text, state) {
  message.textContent = text;
  message.classList.remove("is-error", "is-success");

  if (state) {
    message.classList.add(state);
  }
}

function updateCapacity() {
  const assigned = assignmentChecks.filter((check) => check.checked).length;
  const remaining = Math.max(capacity - assigned, 0);
  const percent = Math.min((assigned / capacity) * 100, 100);

  capacityBadge.textContent = `${assigned} / ${capacity} assigned`;
  slotBadge.textContent = remaining === 0 ? "Full" : `${remaining} slot${remaining === 1 ? "" : "s"} left`;
  capacityProgress.style.width = `${percent}%`;
  capacityNote.textContent = `${assigned} of ${capacity} students assigned.`;
}

function filterStudents() {
  const query = studentSearch.value.trim().toLowerCase();

  studentItems.forEach((item) => {
    item.hidden = Boolean(query) && !item.dataset.student.toLowerCase().includes(query);
  });
}

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

assignmentChecks.forEach((check) => {
  check.addEventListener("change", updateCapacity);
});

studentSearch.addEventListener("input", filterStudents);

saveAssignments.addEventListener("click", () => {
  const assigned = assignmentChecks.filter((check) => check.checked).length;

  if (assigned > capacity) {
    setMessage("Assigned students exceed the schedule capacity.", "is-error");
    return;
  }

  setMessage("Duty assignments saved successfully.", "is-success");
});

updateCapacity();
