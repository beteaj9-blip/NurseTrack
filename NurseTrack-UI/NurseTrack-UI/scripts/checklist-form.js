const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const form = document.querySelector("#checklist-form");
const message = document.querySelector("#form-message");
const saveChecklist = document.querySelector("#save-checklist");
const completionBadge = document.querySelector("#completion-badge");
const sideCompletionBadge = document.querySelector("#side-completion-badge");
const checklistProgress = document.querySelector("#checklist-progress");
const checklistNote = document.querySelector("#checklist-note");
const requiredControls = Array.from(form.querySelectorAll("[required]"));

function setMessage(text, state) {
  message.textContent = text;
  message.classList.remove("is-error", "is-success");

  if (state) {
    message.classList.add(state);
  }
}

function isComplete(control) {
  if (control.type === "checkbox") {
    return control.checked;
  }

  return Boolean(String(control.value || "").trim());
}

function updateProgress() {
  const completeCount = requiredControls.filter(isComplete).length;
  const total = requiredControls.length;
  const percent = Math.round((completeCount / total) * 100);
  const remaining = total - completeCount;

  completionBadge.textContent = `${percent}% complete`;
  sideCompletionBadge.textContent = `${completeCount} / ${total}`;
  checklistProgress.style.width = `${percent}%`;
  checklistNote.textContent = remaining === 0 ? "Checklist is ready for submission." : `${remaining} required item${remaining === 1 ? "" : "s"} remaining.`;
}

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

requiredControls.forEach((control) => {
  control.addEventListener("input", updateProgress);
  control.addEventListener("change", updateProgress);
});

saveChecklist.addEventListener("click", () => {
  setMessage("Checklist draft saved.", "is-success");
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const incompleteControl = requiredControls.find((control) => !isComplete(control));

  if (incompleteControl) {
    incompleteControl.focus();
    setMessage("Complete all required checklist items before submission.", "is-error");
    updateProgress();
    return;
  }

  setMessage("Checklist submitted for instructor validation.", "is-success");
  updateProgress();
});

updateProgress();
