const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const studentSearch = document.querySelector("#student-progress-search");
const sectionFilter = document.querySelector("#student-progress-section");
const standingFilter = document.querySelector("#student-progress-status");
const studentListContainer = document.querySelector("#student-progress-pick-list");
const studentEmpty = document.querySelector("#student-progress-empty");
const studentCount = document.querySelector("#student-progress-count");

let studentCards = Array.from(document.querySelectorAll("[data-student-progress-card]"));

function sortStudentsAlphabetically() {
  if (!studentListContainer) {
    return;
  }

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
  const query = studentSearch ? studentSearch.value.trim().toLowerCase() : "";
  const section = sectionFilter ? sectionFilter.value : "all";
  const standing = standingFilter ? standingFilter.value : "all";

  let visibleCount = 0;

  studentCards.forEach((card) => {
    const textContent = card.textContent.toLowerCase();
    const datasetContent = Object.values(card.dataset).join(" ").toLowerCase();

    const matchesQuery = !query || textContent.includes(query) || datasetContent.includes(query);
    const matchesSection = section === "all" || card.dataset.section === section;
    const matchesStanding = standing === "all" || card.dataset.status === standing;

    const isVisible = matchesQuery && matchesSection && matchesStanding;

    card.hidden = !isVisible;

    if (isVisible) {
      visibleCount += 1;
    }
  });

  if (studentCount) {
    studentCount.textContent = `${visibleCount} visible`;
  }

  if (studentEmpty) {
    studentEmpty.hidden = visibleCount > 0;
  }
}

menuButton?.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop?.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

[studentSearch, sectionFilter, standingFilter].filter(Boolean).forEach((control) => {
  control.addEventListener("input", filterStudentCards);
  control.addEventListener("change", filterStudentCards);
});

sortStudentsAlphabetically();
filterStudentCards();