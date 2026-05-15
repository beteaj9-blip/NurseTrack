const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const saveComment = document.querySelector("#save-comment");
const message = document.querySelector("#form-message");
const validationComment = document.querySelector("#validation-comment");

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

saveComment.addEventListener("click", () => {
  if (!validationComment.value.trim()) {
    setMessage("Add a comment before saving.", "is-error");
    validationComment.focus();
    return;
  }

  setMessage("Validation comment saved.", "is-success");
});
