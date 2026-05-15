const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const refreshButton = document.querySelector("#refresh-about");
const message = document.querySelector("#about-message");
const syncPill = document.querySelector(".sync-pill");

menuButton?.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop?.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

refreshButton?.addEventListener("click", () => {
  if (message) {
    message.textContent = "Status refreshed. NurseTrack is online.";
    message.classList.add("is-success");
  }

  if (syncPill) {
    syncPill.textContent = "Online";
  }
});
