const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const form = document.querySelector("#edit-case-form");
const message = document.querySelector("#form-message");

function setMessage(text, state) {
  message.textContent = text;
  message.classList.remove("is-error", "is-success");

  if (state) {
    message.classList.add(state);
  }
}

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const requiredFields = ["caseDate", "caseCategory", "caseSubcategory", "clinicalSite", "dutyArea", "caseCode", "clinicalInstructor", "procedureTitle", "revisionNote"];
  const missingField = requiredFields.some((field) => !String(formData.get(field) || "").trim());
  const isMajorCase = formData.get("caseSubcategory") === "Major cases";
  const missingMajorRole = isMajorCase && !String(formData.get("caseMajorRole") || "").trim();

  if (missingField || missingMajorRole) {
    setMessage("Please complete the DR/OR category, subcategory, and revision note.", "is-error");
    return;
  }

  setMessage("Case changes saved and ready for resubmission.", "is-success");
});
