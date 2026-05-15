const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const hospitalForm = document.querySelector("#hospital-form");
const hospitalName = document.querySelector("#hospital-name");
const hospitalCode = document.querySelector("#hospital-code");
const hospitalAddress = document.querySelector("#hospital-address");
const hospitalStatus = document.querySelector("#hospital-status");
const hospitalMessage = document.querySelector("#hospital-message");
const hospitalList = document.querySelector("#hospital-list");
const hospitalCount = document.querySelector("#hospital-count");
const hospitalListBadge = document.querySelector("#hospital-list-badge");
const dutyAreaForm = document.querySelector("#duty-area-form");
const dutyAreaName = document.querySelector("#duty-area-name");
const dutyAreaHospital = document.querySelector("#duty-area-hospital");
const dutyAreaType = document.querySelector("#duty-area-type");
const dutyAreaStatus = document.querySelector("#duty-area-status");
const dutyAreaMessage = document.querySelector("#duty-area-message");
const dutyAreaList = document.querySelector("#duty-area-list");
const dutyAreaCount = document.querySelector("#duty-area-count");
const dutyAreaListBadge = document.querySelector("#duty-area-list-badge");
const locationSyncPill = document.querySelector("#location-sync-pill");

function setMessage(element, text, state = "") {
  if (!element) {
    return;
  }

  element.textContent = text;
  element.classList.remove("is-error", "is-success");

  if (state) {
    element.classList.add(state);
  }
}

function countRows(table) {
  return Array.from(table?.querySelectorAll(".user-row:not(.user-row-head)") || []).length;
}

function updateCounts() {
  const hospitals = countRows(hospitalList);
  const dutyAreas = countRows(dutyAreaList);

  if (hospitalCount) {
    hospitalCount.textContent = hospitals;
  }

  if (dutyAreaCount) {
    dutyAreaCount.textContent = dutyAreas;
  }

  if (hospitalListBadge) {
    hospitalListBadge.textContent = `${hospitals} active`;
  }

  if (dutyAreaListBadge) {
    dutyAreaListBadge.textContent = `${dutyAreas} active`;
  }
}

function statusClass(status) {
  return status === "Active" ? "status-verified" : "status-pending";
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

function addHospitalOption(code) {
  if (!dutyAreaHospital || Array.from(dutyAreaHospital.options).some((option) => option.value === code)) {
    return;
  }

  const option = document.createElement("option");
  option.value = code;
  option.textContent = code;
  dutyAreaHospital.append(option);
}

hospitalForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!hospitalForm.checkValidity()) {
    setMessage(hospitalMessage, "Enter the hospital name and short code before saving.", "is-error");
    return;
  }

  const name = hospitalName.value.trim();
  const code = hospitalCode.value.trim().toUpperCase();
  const address = hospitalAddress.value.trim() || "Address pending";
  const status = hospitalStatus.value;
  const row = document.createElement("div");
  row.className = "user-row";
  row.innerHTML = `
    <span><strong>${escapeHtml(name)}</strong><small>${escapeHtml(address)}</small></span>
    <span>${escapeHtml(code)}</span>
    <span>New duty areas can now be assigned</span>
    <span><mark class="status-badge ${statusClass(status)}">${status}</mark></span>
    <span><button class="ghost-button user-action" type="button">View</button></span>
  `;

  hospitalList?.append(row);
  addHospitalOption(code);
  updateCounts();
  setMessage(hospitalMessage, `${name} added to approved hospital options.`, "is-success");
  if (locationSyncPill) {
    locationSyncPill.textContent = "Hospital added";
  }
  hospitalForm.reset();
});

dutyAreaForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!dutyAreaForm.checkValidity()) {
    setMessage(dutyAreaMessage, "Enter the duty area and select a hospital before saving.", "is-error");
    return;
  }

  const name = dutyAreaName.value.trim();
  const hospital = dutyAreaHospital.value;
  const type = dutyAreaType.value;
  const status = dutyAreaStatus.value;
  const row = document.createElement("div");
  row.className = "user-row";
  row.innerHTML = `
    <span><strong>${escapeHtml(name)}</strong><small>Added by Admin</small></span>
    <span>${escapeHtml(hospital)}</span>
    <span>${escapeHtml(type)}</span>
    <span><mark class="status-badge ${statusClass(status)}">${status}</mark></span>
    <span><button class="ghost-button user-action" type="button">View</button></span>
  `;

  dutyAreaList?.append(row);
  updateCounts();
  setMessage(dutyAreaMessage, `${name} added as a duty area for ${hospital}.`, "is-success");
  if (locationSyncPill) {
    locationSyncPill.textContent = "Duty area added";
  }
  dutyAreaForm.reset();
});

menuButton?.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop?.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

updateCounts();
