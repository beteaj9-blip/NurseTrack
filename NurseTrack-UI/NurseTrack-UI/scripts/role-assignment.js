const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const userSearch = document.querySelector("#role-user-search");
const userCards = Array.from(document.querySelectorAll(".role-user-card"));
const emptyState = document.querySelector("#role-user-empty");
const visibleCount = document.querySelector("#visible-role-users");
const selectedAvatar = document.querySelector("#selected-avatar");
const selectedName = document.querySelector("#selected-name");
const selectedMeta = document.querySelector("#selected-meta");
const selectedStatus = document.querySelector("#selected-status");
const roleOptions = Array.from(document.querySelectorAll(".role-assignment-segment .role-option"));
const roleInputs = Array.from(document.querySelectorAll("[name='assignedRole']"));
const assignmentStatus = document.querySelector("#assignment-status");
const message = document.querySelector("#role-assignment-message");
const syncPill = document.querySelector("#role-sync-pill");
const pendingRoleCount = document.querySelector("#pending-role-count");
const permissionTitle = document.querySelector("#permission-title");
const permissionCount = document.querySelector("#permission-count");
const permissionItems = Array.from(document.querySelectorAll(".permission-item"));
const resetButton = document.querySelector("#reset-role-assignment");
const form = document.querySelector("#role-assignment-form");
const accessInputs = Array.from(document.querySelectorAll("#access-options input"));
const roleToast = document.querySelector("#role-toast");
const chairCandidate = document.querySelector("#chair-candidate");
const assignChairButton = document.querySelector("#assign-chair-role");
const removeChairButton = document.querySelector("#remove-chair-role");
const chairAssignmentStatus = document.querySelector("#chair-assignment-status");
const chairAssignmentMessage = document.querySelector("#chair-assignment-message");
const currentChairName = document.querySelector("#current-chair-name");
const currentChairMeta = document.querySelector("#current-chair-meta");

const permissions = {
  student: ["dashboard", "duties", "cases", "schedule", "reports"],
  instructor: ["dashboard", "schedule", "validation", "reports"],
  chair: ["dashboard", "schedule", "validation", "reports"],
  admin: ["dashboard", "users", "roles", "reports"]
};

const roleLabels = {
  student: "Student access",
  instructor: "Instructor access",
  chair: "Chair access",
  admin: "Admin access"
};

let selectedCard = document.querySelector(".role-user-card.is-selected");
let savedRole = selectedCard.dataset.role;
let hasUnsavedRole = false;
let toastTimer;

function setMessage(text, state) {
  message.textContent = text;
  message.classList.remove("is-error", "is-success");

  if (state) {
    message.classList.add(state);
  }
}

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function activeRole() {
  return document.querySelector("[name='assignedRole']:checked").value;
}

function selectedAccess() {
  return accessInputs.filter((input) => input.checked).map((input) => input.value);
}

function setAccessDefaults(role) {
  const enabled = permissions[role];

  accessInputs.forEach((input) => {
    input.checked = enabled.includes(input.value);
  });
}

function updatePermissionPreview(role) {
  const enabled = selectedAccess();

  permissionItems.forEach((item) => {
    item.classList.toggle("is-enabled", enabled.includes(item.dataset.permission));
  });

  permissionTitle.textContent = roleLabels[role];
  permissionCount.textContent = `${enabled.length} enabled`;
}

function showTopToast(text) {
  roleToast.textContent = text;
  roleToast.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    roleToast.hidden = true;
  }, 2800);
}

function setChairAssignmentMessage(text, state) {
  if (!chairAssignmentMessage) {
    return;
  }

  chairAssignmentMessage.textContent = text;
  chairAssignmentMessage.classList.remove("is-error", "is-success");

  if (state) {
    chairAssignmentMessage.classList.add(state);
  }
}

function userCardByName(name) {
  return userCards.find((card) => card.dataset.name === name);
}

function updateCardRole(card, role) {
  if (!card) {
    return;
  }

  card.dataset.role = role;
  card.querySelector("small").textContent = `${roleLabels[role].replace(" access", "")} - ${card.dataset.section}`;

  if (card === selectedCard) {
    savedRole = role;
    setRole(role, false);
  }
}

function refreshChairAssignment(name) {
  const card = userCardByName(name);

  if (!card) {
    return;
  }

  currentChairName.textContent = card.dataset.name;
  currentChairMeta.textContent = `${card.dataset.id} - ${card.dataset.section} - ${card.dataset.email}`;
  chairAssignmentStatus.textContent = "Chair active";
  chairAssignmentStatus.classList.add("status-verified");
  chairAssignmentStatus.classList.remove("status-pending");
}

function setRole(role, markUnsaved) {
  roleInputs.forEach((input) => {
    input.checked = input.value === role;
  });

  roleOptions.forEach((option) => {
    option.classList.toggle("is-active", option.querySelector("input").checked);
  });

  setAccessDefaults(role);
  updatePermissionPreview(role);

  hasUnsavedRole = markUnsaved && role !== savedRole;
  if (pendingRoleCount) {
    pendingRoleCount.textContent = hasUnsavedRole ? "1" : "0";
  }
  assignmentStatus.textContent = hasUnsavedRole ? "Unsaved" : "Saved";
  assignmentStatus.classList.toggle("status-verified", !hasUnsavedRole);
  assignmentStatus.classList.toggle("status-pending", hasUnsavedRole);
  if (syncPill) {
    syncPill.textContent = hasUnsavedRole ? "Unsaved role" : "1 selected";
  }
}

function selectUser(card) {
  selectedCard = card;
  savedRole = card.dataset.role;
  hasUnsavedRole = false;

  userCards.forEach((item) => item.classList.toggle("is-selected", item === card));
  selectedAvatar.textContent = initials(card.dataset.name);
  selectedName.textContent = card.dataset.name;
  selectedMeta.textContent = `${card.dataset.id} - ${card.dataset.section} - ${card.dataset.email}`;
  selectedStatus.textContent = card.dataset.status;
  selectedStatus.className = `status-badge ${card.dataset.status === "Pending" ? "status-pending" : "status-verified"}`;
  setRole(savedRole, false);
  setMessage("Review the selected role before saving.");
}

function filterUsers() {
  const query = userSearch.value.trim().toLowerCase();
  let shown = 0;

  userCards.forEach((card) => {
    const matches = !query || card.textContent.toLowerCase().includes(query) || Object.values(card.dataset).join(" ").toLowerCase().includes(query);
    card.hidden = !matches;

    if (matches) {
      shown += 1;
    }
  });

  if (visibleCount) {
    visibleCount.textContent = `${shown} visible`;
  }
  emptyState.hidden = shown > 0;
}

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

userCards.forEach((card) => {
  card.addEventListener("click", () => selectUser(card));
});

roleInputs.forEach((input) => {
  input.addEventListener("change", () => {
    setRole(input.value, true);
    setMessage(`${roleLabels[input.value]} selected. Save to apply this role.`);
  });
});

accessInputs.forEach((input) => {
  input.addEventListener("change", () => {
    hasUnsavedRole = true;
    if (pendingRoleCount) {
      pendingRoleCount.textContent = "1";
    }
    assignmentStatus.textContent = "Unsaved";
    assignmentStatus.classList.remove("status-verified");
    assignmentStatus.classList.add("status-pending");
    if (syncPill) {
      syncPill.textContent = "Unsaved access";
    }
    updatePermissionPreview(activeRole());
    setMessage("Access selection updated. Save to apply these permissions.");
  });
});

userSearch.addEventListener("input", filterUsers);

resetButton.addEventListener("click", () => {
  setRole(savedRole, false);
  setMessage("Role selection reset to the saved account role.", "is-success");
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const role = activeRole();
  selectedCard.dataset.role = role;
  selectedCard.querySelector("small").textContent = `${roleLabels[role].replace(" access", "")} - ${selectedCard.dataset.section}`;
  savedRole = role;
  hasUnsavedRole = false;
  if (pendingRoleCount) {
    pendingRoleCount.textContent = "0";
  }
  assignmentStatus.textContent = "Saved";
  assignmentStatus.classList.add("status-verified");
  assignmentStatus.classList.remove("status-pending");
  updatePermissionPreview(role);
  setMessage(`${selectedCard.dataset.name} role and access updated successfully.`, "is-success");
  if (syncPill) {
    syncPill.textContent = "Updated successfully";
  }
  showTopToast(`${selectedCard.dataset.name} Role Updated Successfully`);
});

assignChairButton?.addEventListener("click", () => {
  const name = chairCandidate.value;
  const card = userCardByName(name);

  if (!card) {
    setChairAssignmentMessage("Select a valid account before assigning Chair.", "is-error");
    return;
  }

  userCards
    .filter((item) => item.dataset.role === "chair" && item !== card)
    .forEach((item) => updateCardRole(item, "instructor"));

  updateCardRole(card, "chair");
  refreshChairAssignment(name);
  setChairAssignmentMessage(`${name} is now assigned as Chair.`, "is-success");
  showTopToast(`${name} assigned as Chair`);
});

removeChairButton?.addEventListener("click", () => {
  const card = userCardByName(currentChairName.textContent);

  if (!card) {
    setChairAssignmentMessage("No current Chair account found.", "is-error");
    return;
  }

  updateCardRole(card, "instructor");
  chairAssignmentStatus.textContent = "No Chair selected";
  chairAssignmentStatus.classList.remove("status-verified");
  chairAssignmentStatus.classList.add("status-pending");
  setChairAssignmentMessage(`${card.dataset.name} Chair assignment cleared. Assign a new Chair before publishing workflow changes.`, "is-success");
  showTopToast(`${card.dataset.name} Chair assignment cleared`);
});

selectUser(selectedCard);
filterUsers();
