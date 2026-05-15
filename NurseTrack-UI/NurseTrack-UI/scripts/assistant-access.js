const ASSISTANT_ACCESS_KEYS = {
  assistant: {
    manualBackup: "nursetrack-assistant-manual-backup-access",
    clearance: "nursetrack-assistant-clearance-access",
    clinicalCases: "nursetrack-assistant-clinical-cases-access",
    ciRecommendations: "nursetrack-assistant-ci-recommendations-access"
  },
  coordinator: {
    manualBackup: "nursetrack-coordinator-manual-backup-access",
    clearance: "nursetrack-coordinator-clearance-access",
    clinicalCases: "nursetrack-coordinator-clinical-cases-access",
    ciRecommendations: "nursetrack-coordinator-ci-recommendations-access"
  }
};

const controls = Array.from(document.querySelectorAll("[data-access-role][data-access-module]"));
const levelRadios = Array.from(document.querySelectorAll("[data-level-role][data-level-person]"));
const message = document.querySelector("#assistant-access-message");

function getAccessKey(role, module) {
  return ASSISTANT_ACCESS_KEYS[role]?.[module] || "";
}

function isModuleEnabled(role, module) {
  const key = getAccessKey(role, module);
  return key ? window.localStorage.getItem(key) === "true" : false;
}

function setModuleEnabled(role, module, enabled) {
  const key = getAccessKey(role, module);

  if (!key) {
    return;
  }

  window.localStorage.setItem(key, enabled ? "true" : "false");
}

function countEnabledByRole(role) {
  return Object.keys(ASSISTANT_ACCESS_KEYS[role] || {}).filter((module) => {
    return isModuleEnabled(role, module);
  }).length;
}

function getPersonLevelKey(role, person) {
  return `nursetrack-${role}-${person}-level-view`;
}

function getSelectedPersonLevel(role, person, fallback) {
  return window.localStorage.getItem(getPersonLevelKey(role, person)) || fallback || "level-1";
}

function setSelectedPersonLevel(role, person, level) {
  window.localStorage.setItem(getPersonLevelKey(role, person), level);
}

function getLevelLabel(level) {
  const labels = {
    "level-1": "Level 1",
    "level-2": "Level 2",
    "level-3": "Level 3",
    "level-4": "Level 4"
  };

  return labels[level] || "Level 1";
}

function getUniqueLevelPeople() {
  const people = new Map();

  levelRadios.forEach((radio) => {
    const role = radio.dataset.levelRole;
    const person = radio.dataset.levelPerson;
    const fallback = radio.dataset.defaultLevel || "level-1";
    const key = `${role}:${person}`;

    if (!people.has(key)) {
      people.set(key, { role, person, fallback });
    }
  });

  return Array.from(people.values());
}

function renderLevelAssignments() {
  getUniqueLevelPeople().forEach(({ role, person, fallback }) => {
    const selectedLevel = getSelectedPersonLevel(role, person, fallback);
    const personRadios = levelRadios.filter((radio) => {
      return radio.dataset.levelRole === role && radio.dataset.levelPerson === person;
    });

    personRadios.forEach((radio) => {
      const option = radio.closest(".level-radio-option");

      radio.checked = radio.value === selectedLevel;

      if (option) {
        option.classList.toggle("is-selected", radio.checked);
      }
    });
  });
}

function getAssignmentSummary() {
  const people = getUniqueLevelPeople();
  const chairCount = people.filter((item) => item.role === "chair").length;
  const assistantCount = people.filter((item) => item.role === "assistant").length;

  return `${chairCount} chair level assignment${chairCount === 1 ? "" : "s"} and ${assistantCount} assistant level assignment${assistantCount === 1 ? "" : "s"} configured.`;
}

function renderAccessState() {
  controls.forEach((control) => {
    const role = control.dataset.accessRole;
    const module = control.dataset.accessModule;

    control.checked = isModuleEnabled(role, module);
  });

  renderLevelAssignments();

  if (message) {
    const assistantCount = countEnabledByRole("assistant");
    const coordinatorCount = countEnabledByRole("coordinator");
    const totalCount = assistantCount + coordinatorCount;

    message.textContent = totalCount
      ? `${getAssignmentSummary()} Assistant: ${assistantCount} edit permission${assistantCount === 1 ? "" : "s"} enabled. Coordinator: ${coordinatorCount} edit permission${coordinatorCount === 1 ? "" : "s"} enabled.`
      : `${getAssignmentSummary()} Assistant and Coordinator edit permissions are off by default. View access remains available for every review page.`;

    message.classList.toggle("is-success", totalCount > 0);
  }
}

controls.forEach((control) => {
  control.addEventListener("change", () => {
    const role = control.dataset.accessRole;
    const module = control.dataset.accessModule;

    setModuleEnabled(role, module, control.checked);
    renderAccessState();
  });
});

levelRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    const role = radio.dataset.levelRole;
    const person = radio.dataset.levelPerson;

    setSelectedPersonLevel(role, person, radio.value);
    renderAccessState();
  });
});

renderAccessState();