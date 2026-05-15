const pendingAccounts = Array.from(document.querySelectorAll("[data-pending-account]"));
const pendingCount = document.querySelector("#admin-pending-count");
const pendingBadge = document.querySelector("#admin-pending-badge");
const approvalMessage = document.querySelector("#admin-approval-message");
const auditList = document.querySelector("#admin-audit-list");

function pendingTotal() {
  return pendingAccounts.filter((account) => !account.hidden).length;
}

function updatePendingSummary() {
  const count = pendingTotal();
  pendingCount.textContent = count;
  pendingBadge.textContent = `${count} pending`;
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

  return "Student";
}

function addAuditEntry(title, copy) {
  const item = document.createElement("div");
  item.className = "activity-item";
  item.innerHTML = `
    <span class="activity-marker"></span>
    <div>
      <strong>${title}</strong>
      <p>${copy}</p>
    </div>
  `;
  auditList.prepend(item);
}

document.querySelector("#admin-approval-list")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-approval-action]");

  if (!button) {
    return;
  }

  const card = button.closest("[data-pending-account]");
  const selectedRole = card.querySelector("select").value;
  const action = button.dataset.approvalAction;
  const name = card.dataset.name;

  card.hidden = true;
  updatePendingSummary();

  if (action === "approve") {
    approvalMessage.textContent = `${name} approved as ${roleLabel(selectedRole)}.`;
    approvalMessage.classList.remove("is-error");
    approvalMessage.classList.add("is-success");
    addAuditEntry("Account approved", `${name} was approved as ${roleLabel(selectedRole)}.`);
    return;
  }

  approvalMessage.textContent = `${name} denied. The request was archived for audit review.`;
  approvalMessage.classList.remove("is-success");
  approvalMessage.classList.add("is-error");
  addAuditEntry("Account denied", `${name} was denied from pending account approval and retained in audit history.`);
});

updatePendingSummary();
