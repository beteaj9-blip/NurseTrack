const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const reportForm = document.querySelector("#report-form");
const reportScope = document.querySelector("#report-scope");
const personField = document.querySelector("#person-field");
const sectionField = document.querySelector("#section-field");
const siteField = document.querySelector("#site-field");
const groupField = document.querySelector("#group-field");
const personSearchInput = document.querySelector("#person-search");
const personDropdown = document.querySelector("#custom-person-dropdown");
const sectionTarget = document.querySelector("#section-target");
const siteTarget = document.querySelector("#site-target");
const groupTarget = document.querySelector("#group-target");
const resetReportButton = document.querySelector("#reset-report");
const reportMessage = document.querySelector("#report-message");

const chairReportPeople = [
  {
    name: "Maria Cruz",
    role: "Student",
    id: "12-3456-789",
    section: "BSN 3A",
    site: "CCMC",
    group: "BSN 3A - Group 2"
  },
  {
    name: "Josh Anton Nuevas",
    role: "Student",
    id: "12-3456-812",
    section: "BSN 3A",
    site: "CCMC",
    group: "BSN 3A - Group 2"
  },
  {
    name: "Treasure Abadinas",
    role: "Student",
    id: "12-3456-845",
    section: "BSN 3A",
    site: "VSMMC",
    group: "BSN 3A - Group 1"
  },
  {
    name: "Andrea Gomez",
    role: "Student",
    id: "12-3456-902",
    section: "BSN 3B",
    site: "CHN Brgy. Dumlog",
    group: "BSN 3B - Group 1"
  },
  {
    name: "Lichael Ursulo",
    role: "Student",
    id: "12-3456-976",
    section: "BSN 3C",
    site: "CSMC",
    group: "BSN 3C - Group 1"
  },
  {
    name: "Angela Neri",
    role: "Student",
    id: "12-3456-988",
    section: "BSN 3C",
    site: "CSMC",
    group: "BSN 3C - Group 1"
  },
  {
    name: "Patricia Reyes, RN, MAN",
    role: "Clinical Instructor",
    id: "CI-1002",
    section: "BSN 3A",
    site: "CCMC",
    group: "BSN 3A - Group 2"
  },
  {
    name: "Miguel Santos, RN, MAN",
    role: "Clinical Instructor",
    id: "CI-1003",
    section: "BSN 3B",
    site: "CCMC",
    group: "BSN 3B - Group 1"
  },
  {
    name: "Elena Dela Cruz, RN, MN, DSCN",
    role: "Clinical Instructor",
    id: "CI-1004",
    section: "BSN 4A",
    site: "VSMMC",
    group: "BSN 4A - Group 1"
  },
  {
    name: "Louise Wong",
    role: "Clinical Instructor",
    id: "CI-1005",
    section: "BSN 3A",
    site: "VSMMC",
    group: "BSN 3A - Group 1"
  },
  {
    name: "Rivelyn Altamira",
    role: "Clinical Instructor",
    id: "CI-1006",
    section: "BSN 3A",
    site: "SAMCH",
    group: "BSN 3A - Group 1"
  }
];

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

function getPersonMeta(person) {
  return `${person.role} | ${person.id} | ${person.section}`;
}

function getSelectedPerson() {
  const value = personSearchInput?.value.trim() || "";

  if (!value) {
    return null;
  }

  return chairReportPeople.find((person) => person.name === value) || null;
}

function getTargetCount(scope, value) {
  if (!value) {
    return 0;
  }

  if (scope === "person") {
    return getSelectedPerson() ? 1 : 0;
  }

  if (scope === "section") {
    return chairReportPeople.filter((person) => person.section === value).length;
  }

  if (scope === "site") {
    return chairReportPeople.filter((person) => person.site === value).length;
  }

  if (scope === "group") {
    return chairReportPeople.filter((person) => person.group === value).length;
  }

  return 0;
}

function getCurrentScopeValue() {
  const scope = reportScope?.value || "person";

  if (scope === "person") {
    return personSearchInput?.value.trim() || "";
  }

  if (scope === "section") {
    return sectionTarget?.value || "";
  }

  if (scope === "site") {
    return siteTarget?.value || "";
  }

  if (scope === "group") {
    return groupTarget?.value || "";
  }

  return "";
}

function getScopeLabel(scope) {
  if (scope === "person") {
    return "Person";
  }

  if (scope === "section") {
    return "Section";
  }

  if (scope === "site") {
    return "Clinical Site";
  }

  if (scope === "group") {
    return "Group";
  }

  return "Report Target";
}

function updateTargetPreview() {
  return;
}

function showScopeField() {
  const scope = reportScope?.value || "person";

  if (personField) {
    personField.hidden = scope !== "person";
  }

  if (sectionField) {
    sectionField.hidden = scope !== "section";
  }

  if (siteField) {
    siteField.hidden = scope !== "site";
  }

  if (groupField) {
    groupField.hidden = scope !== "group";
  }

  if (personDropdown) {
    personDropdown.hidden = true;
  }

  updateTargetPreview();
}

function renderPersonDropdown() {
  if (!personSearchInput || !personDropdown) {
    return;
  }

  const query = personSearchInput.value.trim().toLowerCase();

  const filteredPeople = chairReportPeople.filter((person) => {
    const searchable = `${person.name} ${person.role} ${person.id} ${person.section} ${person.site} ${person.group}`.toLowerCase();
    return searchable.includes(query);
  });

  if (!filteredPeople.length) {
    personDropdown.innerHTML = `<div class="custom-dropdown-empty">No results found</div>`;
    personDropdown.hidden = false;
    return;
  }

  personDropdown.innerHTML = filteredPeople.map((person) => {
    const value = person.name;

    return `
      <button class="custom-dropdown-item" type="button" data-value="${value}">
        <strong>${person.name}</strong>
        <small>${getPersonMeta(person)}</small>
      </button>
    `;
  }).join("");

  personDropdown.querySelectorAll("[data-value]").forEach((button) => {
    button.addEventListener("click", () => {
      personSearchInput.value = button.dataset.value;
      personDropdown.hidden = true;
      updateTargetPreview();
    });
  });

  personDropdown.hidden = false;
}

function resetReportForm() {
  reportForm?.reset();

  if (personDropdown) {
    personDropdown.hidden = true;
  }

  showScopeField();
  setMessage("Select a person, section, clinical site, or group, then generate a general report.");
}

function validateReportTarget() {
  const scope = reportScope?.value || "person";
  const value = getCurrentScopeValue();

  if (!value) {
    if (scope === "person") {
      setMessage("Select one student or one clinical instructor before generating a report.", "is-error");
      personSearchInput?.focus();
      return false;
    }

    if (scope === "section") {
      setMessage("Select a section before generating a report.", "is-error");
      sectionTarget?.focus();
      return false;
    }

    if (scope === "site") {
      setMessage("Select a clinical site before generating a report.", "is-error");
      siteTarget?.focus();
      return false;
    }

    if (scope === "group") {
      setMessage("Select a group before generating a report.", "is-error");
      groupTarget?.focus();
      return false;
    }
  }

  if (scope === "person" && !getSelectedPerson()) {
    setMessage("Please choose a valid person from the dropdown list.", "is-error");
    personSearchInput?.focus();
    return false;
  }

  return true;
}

function generateReport() {
  if (!validateReportTarget()) {
    return;
  }

  const scope = reportScope?.value || "person";
  const value = getCurrentScopeValue();
  const count = getTargetCount(scope, value);

  if (scope === "person") {
    const person = getSelectedPerson();
    setMessage(`General report generated for ${person.name}.`, "is-success");
    return;
  }

  setMessage(`General report generated for ${value} with ${count} matching records.`, "is-success");
}

menuButton?.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop?.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

reportScope?.addEventListener("change", showScopeField);

personSearchInput?.addEventListener("focus", renderPersonDropdown);

personSearchInput?.addEventListener("input", () => {
  renderPersonDropdown();
  updateTargetPreview();
});

personSearchInput?.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && personDropdown) {
    personDropdown.hidden = true;
  }
});

sectionTarget?.addEventListener("change", updateTargetPreview);
siteTarget?.addEventListener("change", updateTargetPreview);
groupTarget?.addEventListener("change", updateTargetPreview);

document.addEventListener("click", (event) => {
  if (!personSearchInput || !personDropdown) {
    return;
  }

  if (!personSearchInput.contains(event.target) && !personDropdown.contains(event.target)) {
    personDropdown.hidden = true;
  }
});

resetReportButton?.addEventListener("click", resetReportForm);

reportForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  generateReport();
});

showScopeField();
updateTargetPreview();