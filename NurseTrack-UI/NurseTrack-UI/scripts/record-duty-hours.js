const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const form = document.querySelector("#duty-hours-form");
const message = document.querySelector("#form-message");
const totalHours = document.querySelector("#total-hours");
const hoursNote = document.querySelector("#hours-note");
const timeIn = document.querySelector("#time-in");
const timeOut = document.querySelector("#time-out");
const saveDraft = document.querySelector("#save-draft");
const assignedSchedule = {
  start: 7 * 60,
  end: 15 * 60,
  earlyGrace: 15,
  exitGrace: 60
};

function setMessage(text, state) {
  message.textContent = text;
  message.classList.remove("is-error", "is-success");

  if (state) {
    message.classList.add(state);
  }
}

function calculateHours() {
  if (!timeIn.value || !timeOut.value) {
    totalHours.textContent = "0.0 hrs";
    hoursNote.textContent = "Time in and time out are required to calculate completed hours.";
    return 0;
  }

  const [inHour, inMinute] = timeIn.value.split(":").map(Number);
  const [outHour, outMinute] = timeOut.value.split(":").map(Number);
  const inTotal = inHour * 60 + inMinute;
  let outTotal = outHour * 60 + outMinute;

  if (outTotal <= inTotal) {
    outTotal += 24 * 60;
  }

  const hours = (outTotal - inTotal) / 60;
  totalHours.textContent = `${hours.toFixed(1)} hrs`;
  hoursNote.textContent = "Calculated from the entered time in and time out.";
  return hours;
}

function minutesFromTime(value) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function isWithinAssignedSchedule(formData) {
  const inTotal = minutesFromTime(String(formData.get("timeIn") || "00:00"));
  const outTotal = minutesFromTime(String(formData.get("timeOut") || "00:00"));
  const startsTooEarly = inTotal < assignedSchedule.start - assignedSchedule.earlyGrace;
  const startsAfterShift = inTotal > assignedSchedule.end;
  const endsBeforeShift = outTotal < assignedSchedule.start;
  const endsTooLate = outTotal > assignedSchedule.end + assignedSchedule.exitGrace;

  return !startsTooEarly && !startsAfterShift && !endsBeforeShift && !endsTooLate;
}

function isLate(formData) {
  return minutesFromTime(String(formData.get("timeIn") || "00:00")) > assignedSchedule.start;
}

function hasRequiredFields(formData) {
  const fields = ["dutyDate", "clinicalSite", "dutyArea", "clinicalInstructor", "timeIn", "timeOut"];
  return fields.every((field) => String(formData.get(field) || "").trim());
}

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

[timeIn, timeOut].forEach((input) => {
  input.addEventListener("input", calculateHours);
});

saveDraft.addEventListener("click", () => {
  setMessage("Draft saved.", "is-success");
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const hours = calculateHours();

  if (!hasRequiredFields(formData)) {
    setMessage("Please complete all required duty details.", "is-error");
    return;
  }

  if (hours <= 0) {
    setMessage("Enter a valid time in and time out.", "is-error");
    return;
  }

  if (!isWithinAssignedSchedule(formData)) {
    setMessage("Time in and time out must follow the assigned 7:00 AM - 3:00 PM schedule window.", "is-error");
    return;
  }

  setMessage(
    isLate(formData)
      ? "Duty hours submitted as late and pending clinical instructor verification."
      : "Duty hours submitted for clinical instructor validation.",
    "is-success"
  );
  window.setTimeout(() => {
    window.location.href = "duty-verification.html";
  }, 650);
});
