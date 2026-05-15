const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const form = document.querySelector("#error-form");
const fixSample = document.querySelector("#fix-sample");
const message = document.querySelector("#validation-message");
const errorCountBadge = document.querySelector("#error-count-badge");
const issueTotal = document.querySelector("#issue-total");
const issueList = document.querySelector("#validation-issue-list");
const fields = Array.from(document.querySelectorAll(".form-label.has-error"));

function setResolved() {
  fields.forEach((label) => {
    const control = label.querySelector("input, select");
    label.classList.remove("has-error");
    label.classList.add("is-valid");
    control.setAttribute("aria-invalid", "false");
  });

  document.querySelector("#student-id").value = "12-3456-789";
  document.querySelector("#duty-date").value = "2026-04-26";
  document.querySelector("#clinical-site").value = "CCMC";
  document.querySelector("#time-out").value = "15:00";
  issueList.innerHTML = '<div class="validation-issue-card is-resolved"><span class="alert-icon">OK</span><div><strong>No open issues</strong><p>The sample duty entry is ready to submit.</p></div></div>';
  errorCountBadge.textContent = "Resolved";
  errorCountBadge.classList.remove("status-rejected");
  errorCountBadge.classList.add("status-verified");
  issueTotal.textContent = "0 open";
  issueTotal.classList.remove("status-rejected");
  issueTotal.classList.add("status-verified");
  message.textContent = "All validation issues are resolved.";
  message.classList.remove("is-error");
  message.classList.add("is-success");
}

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (document.querySelector(".form-label.has-error")) {
    message.textContent = "Fix the highlighted fields before submitting.";
    message.classList.add("is-error");
    return;
  }

  message.textContent = "Validation passed. The record is ready to submit.";
  message.classList.remove("is-error");
  message.classList.add("is-success");
});

fixSample.addEventListener("click", setResolved);
