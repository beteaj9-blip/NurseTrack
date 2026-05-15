const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const filterButtons = Array.from(document.querySelectorAll("[data-pending-filter]"));
const pendingCards = Array.from(document.querySelectorAll("#pending-list .pending-card"));
const emptyState = document.querySelector("#pending-empty");
const pendingMessage = document.querySelector("#pending-message");
const saveNote = document.querySelector("#save-note");
const followUpNote = document.querySelector("#follow-up-note");
const noteMessage = document.querySelector("#note-message");

function filterPendingCards(filter) {
  let visibleCount = 0;

  pendingCards.forEach((card) => {
    const isVisible = filter === "all" || card.dataset.status === filter;
    card.hidden = !isVisible;

    if (isVisible) {
      visibleCount += 1;
    }
  });

  emptyState.hidden = visibleCount > 0;
  pendingMessage.classList.remove("is-success", "is-error");
  pendingMessage.textContent = `Showing ${visibleCount} open requirement${visibleCount === 1 ? "" : "s"}.`;
}

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    filterPendingCards(button.dataset.pendingFilter);
  });
});

if (saveNote) {
  saveNote.addEventListener("click", () => {
    if (noteMessage) {
      noteMessage.classList.remove("is-success", "is-error");
    }

    if (followUpNote && !followUpNote.value.trim()) {
      if (noteMessage) {
        noteMessage.textContent = "Write a reminder before saving.";
        noteMessage.classList.add("is-error");
      }
      followUpNote.focus();
      return;
    }

    if (noteMessage) {
      noteMessage.textContent = "Reminder saved successfully.";
      noteMessage.classList.add("is-success");
      return;
    }

    pendingMessage.textContent = "Note saved.";
    pendingMessage.classList.add("is-success");
  });
}
