const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const searchInput = document.querySelector("#validation-user-search");
const sectionFilter = document.querySelector("#validation-user-section");
const userListContainer = document.querySelector("#validation-user-list");
let userCards = Array.from(document.querySelectorAll("[data-validation-user]"));
const userCount = document.querySelector("#validation-user-count");
const emptyCaseMessage = document.createElement("div");

emptyCaseMessage.className = "form-message validation-empty-message";
emptyCaseMessage.textContent = "No clinical case found.";
emptyCaseMessage.hidden = true;
userListContainer?.after(emptyCaseMessage);

function sortUsersAlphabetically() {
  userCards.sort((a, b) => {
    const lastNameA = a.dataset.name.trim().split(" ").pop().toLowerCase();
    const lastNameB = b.dataset.name.trim().split(" ").pop().toLowerCase();
    return lastNameA.localeCompare(lastNameB);
  });
  
  userCards.forEach(card => userListContainer.appendChild(card));
}

function filterUsers() {
  const query = searchInput.value.trim().toLowerCase();
  const section = sectionFilter.value;
  let visibleCount = 0;

  userCards.forEach((card) => {
    const matchesQuery = !query || card.textContent.toLowerCase().includes(query);
    const matchesSection = card.dataset.section === section;
    const hasCase = Number(card.dataset.case) > 0;

    const isVisible = matchesQuery && matchesSection && hasCase;

    card.hidden = !isVisible;

    if (isVisible) {
      visibleCount++;
    }
  });

  userCount.textContent = `${visibleCount} student${visibleCount === 1 ? "" : "s"}`;

  if (emptyCaseMessage) {
    emptyCaseMessage.hidden = visibleCount > 0;
  }
}

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

[searchInput, sectionFilter].forEach((control) => {
  control.addEventListener("input", filterUsers);
});

sortUsersAlphabetically();
filterUsers();
