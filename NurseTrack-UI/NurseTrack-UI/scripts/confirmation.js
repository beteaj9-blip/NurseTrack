const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const resendButton = document.querySelector("#resend-confirmation");
const message = document.querySelector("#confirmation-message");

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

resendButton.addEventListener("click", () => {
  message.textContent = "Confirmation notice sent to notifications.";
  message.classList.add("is-success");
});
