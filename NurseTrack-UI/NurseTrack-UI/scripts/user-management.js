const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const roleFilter = document.querySelector("#role-filter");
const statusFilter = document.querySelector("#status-filter");
const userSearch = document.querySelector("#user-search");
const emptyState = document.querySelector("#user-empty");
const visibleCount = document.querySelector("#visible-user-count");
const userMessage = document.querySelector("#user-message");
const userForm = document.querySelector("#user-form");
const newUserMessage = document.querySelector("#new-user-message");
const userTable = document.querySelector("#user-table");
const newId = document.querySelector("#new-id");
const newName = document.querySelector("#new-name");
const newEmail = document.querySelector("#new-email");
const newRole = document.querySelector("#new-role");
const newSection = document.querySelector("#new-section");
const newIdLabel = newId?.closest(".form-label");
const newIdError = newIdLabel?.querySelector(".field-error");
const activeUserCount = document.querySelector("#active-user-count");
const pendingUserCount = document.querySelector("#pending-user-count");
const syncPill = document.querySelector("#user-sync-pill");
const openAddUserModal = document.querySelector("#open-add-user-modal");
const addUserModal = document.querySelector("#add-user-modal");
const actionModal = document.querySelector("#user-action-modal");
const actionCopy = document.querySelector("#user-action-copy");
const actionSummary = document.querySelector("#account-action-summary");
const actionButtons = Array.from(document.querySelectorAll("[data-account-action]"));
const confirmActionButton = document.querySelector("#confirm-user-action");
const closeAddUserButtons = document.querySelectorAll("[data-close-modal]");
const closeActionButtons = document.querySelectorAll("[data-close-action-modal]");
const editModal = document.querySelector("#edit-user-modal");
const editForm = document.querySelector("#edit-user-form");
const editName = document.querySelector("#edit-name");
const editEmail = document.querySelector("#edit-email");
const editRole = document.querySelector("#edit-role");
const editStatus = document.querySelector("#edit-status");
const editSection = document.querySelector("#edit-section");
const editUserMessage = document.querySelector("#edit-user-message");
const closeEditButtons = document.querySelectorAll("[data-close-edit-modal]");

let selectedRow = null;
let selectedAccountAction = "";

function rows() {
  return Array.from(document.querySelectorAll(".user-row:not(.user-row-head)"));
}

function statusText(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function roleLabel(role) {
  if (role === "instructor") {
    return "Clinical Instructor";
  }

  if (role === "chair") {
    return "Chair";
  }

  if (role === "admin") {
    return "Admin";
  }

  if (role === "coordinator") {
    return "Coordinator";
  }

  if (role === "enrollment") {
    return "Enrollment Team";
  }

  if (role === "assistant") {
    return "Assistant";
  }

  return "Nursing Student";
}

function roleValue(label) {
  if (label === "Clinical Instructor") {
    return "instructor";
  }

  if (label === "Chair") {
    return "chair";
  }

  if (label === "Admin" || label === "System Admin") {
    return "admin";
  }

  if (label === "Coordinator") {
    return "coordinator";
  }

  if (label === "Enrollment Team") {
    return "enrollment";
  }

  if (label === "Assistant") {
    return "assistant";
  }

  return "student";
}

function rowName(row) {
  return row.querySelector("strong")?.textContent || "Selected user";
}

function rowEmail(row) {
  return row.querySelector("small")?.textContent || "";
}

function rowSchoolId(row) {
  return row.children[2]?.querySelector("strong")?.textContent || "";
}

function rowSection(row) {
  return row.children[2]?.querySelector("small")?.textContent || "";
}

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

function updateCounts() {
  const allRows = rows();
  const active = allRows.filter((row) => row.dataset.status === "active").length;
  const pending = allRows.filter((row) => row.dataset.status === "pending").length;

  if (activeUserCount) {
    activeUserCount.textContent = active;
  }

  if (pendingUserCount) {
    pendingUserCount.textContent = pending;
  }

  if (syncPill) {
    syncPill.textContent = `${active} active`;
  }
}

function filterUsers() {
  if (!roleFilter || !statusFilter || !userSearch || !visibleCount || !emptyState) {
    return;
  }

  const role = roleFilter.value;
  const status = statusFilter.value;
  const query = userSearch.value.trim().toLowerCase();
  let shown = 0;

  rows().forEach((row) => {
    const matchesRole = role === "all" || row.dataset.role === role;
    const matchesStatus = status === "all" || row.dataset.status === status;
    const matchesQuery = !query || row.textContent.toLowerCase().includes(query);
    const isVisible = matchesRole && matchesStatus && matchesQuery;

    row.hidden = !isVisible;
    if (isVisible) {
      shown += 1;
    }
  });

  visibleCount.textContent = `${shown} visible`;
  emptyState.hidden = shown > 0;
}

function badgeClass(status) {
  if (status === "active") {
    return "status-verified";
  }

  if (status === "pending") {
    return "status-pending";
  }

  return "status-rejected";
}

function setRowStatus(row, status) {
  row.dataset.status = status;
  const badge = row.querySelector(".status-badge");
  const button = row.querySelector(".user-action");

  if (badge) {
    badge.textContent = statusText(status);
    badge.className = `status-badge ${badgeClass(status)}`;
  }

  if (button) {
    button.dataset.action = status === "active" ? "suspend" : status === "pending" ? "approve" : "restore";
  }

  updateCounts();
  filterUsers();
}

function setRowRole(row, role) {
  row.dataset.role = role;
  row.children[1].textContent = roleLabel(role);
}

function openModal(modal) {
  if (!modal) {
    return;
  }

  modal.hidden = false;
  document.body.classList.add("modal-open");
}

function closeModal(modal) {
  if (!modal) {
    return;
  }

  modal.hidden = true;
  document.body.classList.remove("modal-open");
}

function setActionButtons(row) {
  const isPending = row.dataset.status === "pending";
  const isInactive = row.dataset.status === "suspended" || row.dataset.status === "denied";

  actionButtons.forEach((button) => {
    const action = button.dataset.accountAction;
    button.classList.toggle("is-selected", action === selectedAccountAction);
    button.hidden =
      (action === "approve" && !isPending) ||
      (action === "reject" && !isPending);

    if (action === "toggle") {
      button.textContent = isInactive ? "Reactivate User" : "Deactivate User";
    }
  });
}

function openActionMenu(button) {
  selectedRow = button.closest(".user-row");
  selectedAccountAction = button.dataset.action === "approve" ? "approve" : button.dataset.action === "restore" ? "toggle" : "edit";

  if (actionSummary) {
    actionSummary.innerHTML = `
      <div class="avatar">${rowName(selectedRow).split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div>
      <div>
        <strong>${rowName(selectedRow)}</strong>
        <p>${rowSchoolId(selectedRow)} - ${rowSection(selectedRow)} - ${rowEmail(selectedRow)}</p>
      </div>
      <span class="status-badge ${badgeClass(selectedRow.dataset.status)}">${statusText(selectedRow.dataset.status)}</span>
    `;
  }

  if (actionCopy) {
    actionCopy.textContent = "Choose whether to edit details, change role/status, reset password, or approve/deny this pending account. Records stay in the directory for audit.";
  }

  setActionButtons(selectedRow);
  openModal(actionModal);
}

function fillEditForm(row) {
  if (!row || !editForm) {
    return;
  }

  editName.value = rowName(row);
  editEmail.value = rowEmail(row);
  editRole.value = row.dataset.role;
  editStatus.value = row.dataset.status;
  editSection.value = rowSection(row);
  setMessage(editUserMessage, "Review changes before saving.");
}

function applySelectedAction() {
  if (!selectedRow || !selectedAccountAction) {
    setMessage(userMessage, "Choose an account action first.", "is-error");
    return;
  }

  const name = rowName(selectedRow);

  if (selectedAccountAction === "edit" || selectedAccountAction === "role" || selectedAccountAction === "status") {
    fillEditForm(selectedRow);
    closeModal(actionModal);
    openModal(editModal);
    return;
  }

  if (selectedAccountAction === "reset") {
    setMessage(userMessage, `Password reset link prepared for ${name}.`, "is-success");
  } else if (selectedAccountAction === "approve") {
    setRowStatus(selectedRow, "active");
    setMessage(userMessage, `${name} approved and activated.`, "is-success");
  } else if (selectedAccountAction === "reject") {
    setRowStatus(selectedRow, "denied");
    setMessage(userMessage, `${name} denied. The account record was kept for audit review.`, "is-success");
  } else if (selectedAccountAction === "toggle") {
    const nextStatus = selectedRow.dataset.status === "suspended" || selectedRow.dataset.status === "denied" ? "active" : "suspended";
    setRowStatus(selectedRow, nextStatus);
    setMessage(userMessage, `${name} is now ${statusText(nextStatus)}.`, "is-success");
  }

  closeModal(actionModal);
  selectedRow = null;
  selectedAccountAction = "";
}

function validateNewId() {
  if (!newId || !newIdLabel || !newIdError) {
    return true;
  }

  const isValid = /^\d{2}-\d{4}-\d{3}$/.test(newId.value.trim()) || /^[A-Z]{2}-\d{4}$/i.test(newId.value.trim());
  newIdLabel.classList.toggle("has-error", !isValid);
  newId.setAttribute("aria-invalid", String(!isValid));
  newIdError.hidden = isValid;
  return isValid;
}

function addPendingUser() {
  const row = document.createElement("div");
  row.className = "user-row";
  row.dataset.role = roleValue(newRole.value);
  row.dataset.status = "pending";
  row.innerHTML = `
    <span>
      <strong>${newName.value.trim()}</strong>
      <small>${newEmail.value.trim()}</small>
    </span>
    <span>${newRole.value}</span>
    <span>
      <strong>${newId.value.trim()}</strong>
      <small>${newSection.value.trim()}</small>
    </span>
    <span><mark class="status-badge status-pending">Pending</mark></span>
    <span><button class="icon-button kebab-button user-action" type="button" data-action="approve" aria-label="Open account action" title="Actions"><svg class="kebab-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="1.8"></circle><circle cx="12" cy="12" r="1.8"></circle><circle cx="12" cy="19" r="1.8"></circle></svg></button></span>
  `;

  userTable.append(row);
}

menuButton?.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop?.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

[roleFilter, statusFilter, userSearch].forEach((control) => {
  control?.addEventListener("input", filterUsers);
});

userTable?.addEventListener("click", (event) => {
  const button = event.target.closest(".user-action");

  if (button) {
    openActionMenu(button);
  }
});

actionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedAccountAction = button.dataset.accountAction;
    setActionButtons(selectedRow);
  });
});

confirmActionButton?.addEventListener("click", applySelectedAction);

openAddUserModal?.addEventListener("click", () => openModal(addUserModal));

closeAddUserButtons.forEach((button) => {
  button.addEventListener("click", () => closeModal(addUserModal));
});

closeActionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    closeModal(actionModal);
    selectedRow = null;
    selectedAccountAction = "";
  });
});

closeEditButtons.forEach((button) => {
  button.addEventListener("click", () => closeModal(editModal));
});

newId?.addEventListener("input", () => {
  if (newId.value.trim()) {
    validateNewId();
  }
});

userForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!userForm.checkValidity() || !validateNewId()) {
    setMessage(newUserMessage, "Complete all fields and use the correct ID format.", "is-error");
    return;
  }

  addPendingUser();
  updateCounts();
  filterUsers();

  setMessage(newUserMessage, "Account created successfully and sent to pending approval.", "is-success");
  closeModal(addUserModal);
  userForm.reset();
  newIdLabel?.classList.remove("has-error");
  if (newIdError) {
    newIdError.hidden = true;
  }
});

editForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!selectedRow || !editForm.checkValidity()) {
    setMessage(editUserMessage, "Complete all edit fields before saving.", "is-error");
    return;
  }

  selectedRow.children[0].querySelector("strong").textContent = editName.value.trim();
  selectedRow.children[0].querySelector("small").textContent = editEmail.value.trim();
  selectedRow.children[2].querySelector("small").textContent = editSection.value.trim();
  setRowRole(selectedRow, editRole.value);
  setRowStatus(selectedRow, editStatus.value);
  setMessage(userMessage, `${editName.value.trim()} account details updated.`, "is-success");
  closeModal(editModal);
  selectedRow = null;
  selectedAccountAction = "";
});

updateCounts();
filterUsers();
