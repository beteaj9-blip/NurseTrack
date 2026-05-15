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
  const instructorId = "CI-1002";

  try {
    await navigator.clipboard.writeText(instructorId);
    message.textContent = "Instructor ID copied.";
  } catch {
    message.textContent = `Instructor ID: ${instructorId}`;
  }

  message.classList.add("is-success");
  syncPill.textContent = "ID copied";
});
