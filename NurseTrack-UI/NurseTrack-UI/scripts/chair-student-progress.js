const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const studentSearch = document.querySelector("#student-progress-search");
const sectionFilter = document.querySelector("#student-progress-section");
const standingFilter = document.querySelector("#student-progress-status");
const studentListContainer = document.querySelector("#student-progress-pick-list");
const studentEmpty = document.querySelector("#student-progress-empty");
const studentCount = document.querySelector("#student-progress-count");
const printStudentProgress = document.querySelector("#print-student-progress");
let studentCards = Array.from(document.querySelectorAll("[data-student-progress-card]"));
const isEnrollmentView = window.sessionStorage?.getItem("nursetrackRole") === "enrollment";

function decorateEnrollmentCheckedStatuses() {
  if (!isEnrollmentView) return;

  document.body.classList.add("enrollment-progress-view");
  studentCards.forEach((card) => {
    const badge = card.querySelector(".status-badge");
    if (!badge || card.querySelector(".enrollment-status-control")) return;

    const originalStatus = card.dataset.status || badge.textContent.trim() || "Unchecked";
    const isChecked = originalStatus === "Checked";
    const control = document.createElement("span");

    card.dataset.enrollmentOriginalStatus = originalStatus;
    badge.className = `status-badge ${isChecked ? "status-verified" : "status-pending"}`;
    badge.textContent = isChecked ? "Checked" : originalStatus;
    control.className = "enrollment-status-control";
    control.innerHTML = `<input class="status-checkbox" type="checkbox" ${isChecked ? "checked" : ""} aria-label="Mark ${originalStatus} as checked">`;
    badge.insertAdjacentElement("afterend", control);
  });
}

function updateEnrollmentStatusFromCheckbox(checkbox) {
  const card = checkbox.closest("[data-student-progress-card]");
  const control = checkbox.closest(".enrollment-status-control");
  const badge = control?.previousElementSibling?.classList.contains("status-badge")
    ? control.previousElementSibling
    : card?.querySelector(".status-badge");

  if (!card || !badge) return;

  const originalStatus = card.dataset.enrollmentOriginalStatus || "Unchecked";

  if (checkbox.checked) {
    card.dataset.status = "Checked";
    badge.className = "status-badge status-verified";
    badge.textContent = "Checked";
    return;
  }

  card.dataset.status = originalStatus;
  badge.className = "status-badge status-pending";
  badge.textContent = originalStatus;
}

function sortStudentsAlphabetically() {
  studentCards.sort((a, b) => {
    const lastNameA = (a.dataset.name || "").trim().split(" ").pop().toLowerCase();
    const lastNameB = (b.dataset.name || "").trim().split(" ").pop().toLowerCase();
    return lastNameA.localeCompare(lastNameB);
  });

  studentCards.forEach((card) => {
    studentListContainer.appendChild(card);
  });
}

function filterStudentCards() {
  const query = studentSearch.value.trim().toLowerCase();
  const section = sectionFilter.value;
  const standing = standingFilter.value;
  let visibleCount = 0;

  studentCards.forEach((card) => {
    const textContent = card.textContent.toLowerCase();
    const datasetContent = Object.values(card.dataset).join(" ").toLowerCase();
    const matchesQuery = !query || textContent.includes(query) || datasetContent.includes(query);
    const matchesSection = card.dataset.section === section;
    const matchesStanding = card.dataset.status === standing;
    const isVisible = matchesQuery && matchesSection && matchesStanding;

    card.hidden = !isVisible;

    if (isVisible) {
      visibleCount += 1;
    }
  });

  studentCount.textContent = `${visibleCount} visible`;
  studentEmpty.hidden = visibleCount > 0;
}

function openStudentProgressCard(card) {
  const href = card.dataset.studentHref;

  if (href) {
    window.location.href = href;
  }
}

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

studentCards.forEach((card) => {
  card.addEventListener("click", (event) => {
    if (event.target.closest("input, button, select, textarea, label")) {
      return;
    }

    openStudentProgressCard(card);
  });

  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    openStudentProgressCard(card);
  });
});

studentListContainer?.addEventListener("change", (event) => {
  const checkbox = event.target.closest(".status-checkbox");

  if (!checkbox) return;

  updateEnrollmentStatusFromCheckbox(checkbox);
  filterStudentCards();
});

[studentSearch, sectionFilter, standingFilter].filter(Boolean).forEach((control) => {
  control.addEventListener("input", filterStudentCards);
});

printStudentProgress?.addEventListener("click", () => {
  window.print();
});

decorateEnrollmentCheckedStatuses();
sortStudentsAlphabetically();
filterStudentCards();
