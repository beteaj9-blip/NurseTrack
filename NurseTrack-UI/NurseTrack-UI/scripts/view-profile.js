const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const copyButton = document.querySelector("#copy-profile-id");
const message = document.querySelector("#profile-message");
const syncPill = document.querySelector("#profile-sync-pill");

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

copyButton.addEventListener("click", async () => {
  const idNumber = "12-3456-789";

  try {
    await navigator.clipboard.writeText(idNumber);
    message.textContent = "School ID number copied.";
  } catch {
    message.textContent = `School ID number: ${idNumber}`;
  }

  message.classList.add("is-success");
  syncPill.textContent = "ID copied";
});
