const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const form = document.querySelector("#create-schedule-form");
const message = document.querySelector("#form-message");
const saveDraft = document.querySelector("#save-schedule-draft");
const previewDay = document.querySelector("#preview-day");
const previewMonth = document.querySelector("#preview-month");
const previewTitle = document.querySelector("#preview-title");
const previewTime = document.querySelector("#preview-time");
const previewSite = document.querySelector("#preview-site");
const conflictBadge = document.querySelector("#conflict-badge");
const conflictBox = document.querySelector("#conflict-box");

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function setMessage(text, state) {
  message.textContent = text;
  message.classList.remove("is-error", "is-success");

  if (state) {
    message.classList.add(state);
  }
}

function formatTime(value) {
  if (!value) {
    return "";
  }

  const [hourText, minute] = value.split(":");
  const hour = Number(hourText);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${suffix}`;
}

function updatePreview() {
  const data = new FormData(form);
  const title = String(data.get("scheduleTitle") || "").trim();
  const date = String(data.get("scheduleDate") || "");
  const start = formatTime(String(data.get("timeStart") || ""));
  const end = formatTime(String(data.get("timeEnd") || ""));
  const site = String(data.get("clinicalSite") || "").trim();
  const group = String(data.get("studentGroup") || "").trim();
  const area = String(data.get("dutyArea") || "").trim();

  previewTitle.textContent = title || "New duty schedule";
  previewTime.textContent = start && end ? `${start} - ${end}` : "Select date and time";
  previewSite.textContent = site || "Select clinical site";

  if (date) {
    const dateValue = new Date(`${date}T00:00:00`);
    previewDay.textContent = String(dateValue.getDate()).padStart(2, "0");
    previewMonth.textContent = monthNames[dateValue.getMonth()];
  } else {
    previewDay.textContent = "--";
    previewMonth.textContent = "---";
  }

  const hasConflict = group === "BSN 3A - Group 2" && area === "Emergency Room";
  conflictBadge.textContent = hasConflict ? "Conflict" : "Clear";
  conflictBadge.classList.toggle("status-rejected", hasConflict);
  conflictBadge.classList.toggle("status-verified", !hasConflict);
  conflictBox.classList.toggle("clear-warning", !hasConflict);
  conflictBox.querySelector("strong").textContent = hasConflict ? "Potential conflict detected" : "No conflict detected";
  conflictBox.querySelector("p").textContent = hasConflict
    ? "BSN 3A - Group 2 already has a Emergency Room assignment on the selected rotation."
    : "The selected group has no overlapping schedule for the current draft.";
}

function hasRequiredFields(formData) {
  const fields = ["scheduleTitle", "scheduleDate", "studentGroup", "timeStart", "timeEnd", "clinicalSite", "dutyArea", "capacity", "clinicalInstructor"];
  return fields.every((field) => String(formData.get(field) || "").trim());
}

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

form.addEventListener("input", updatePreview);
form.addEventListener("change", updatePreview);

saveDraft.addEventListener("click", () => {
  setMessage("Schedule draft saved.", "is-success");
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);

  if (!hasRequiredFields(formData)) {
    setMessage("Please complete all required schedule details.", "is-error");
    return;
  }

  setMessage("Schedule created successfully. Opening duty assignment.", "is-success");
  window.setTimeout(() => {
    window.location.href = "assign-duty.html";
  }, 650);
});

updatePreview();
