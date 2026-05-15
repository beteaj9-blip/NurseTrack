const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const form = document.querySelector("#edit-profile-form");
const resetButton = document.querySelector("#reset-profile-form");
const message = document.querySelector("#edit-profile-message");
const syncPill = document.querySelector("#edit-profile-sync");
const schoolId = document.querySelector("#school-id");
const schoolIdLabel = schoolId.closest(".form-label");
const schoolIdError = schoolIdLabel.querySelector(".field-error");
const previewName = document.querySelector("#preview-name");
const previewSection = document.querySelector("#preview-section");
const previewEmail = document.querySelector("#preview-email");
const completionPercent = document.querySelector("#completion-percent");
const completionBadge = document.querySelector("#completion-badge");
const completionBar = document.querySelector("#completion-bar");
const photoInput = document.querySelector("#profile-photo-input");
const removePhotoButton = document.querySelector("#remove-profile-photo");
const profileAvatars = Array.from(document.querySelectorAll("[data-profile-avatar]"));

function renderInitials() {
  profileAvatars.forEach((avatar) => {
    avatar.textContent = "MC";
  });
}

function renderPhoto(src) {
  profileAvatars.forEach((avatar) => {
    avatar.innerHTML = "";
    const image = document.createElement("img");
    image.src = src;
    image.alt = "Profile preview";
    avatar.append(image);
  });
}

function updatePreview() {
  previewName.textContent = document.querySelector("#full-name").value || "Maria Cruz";
  previewSection.textContent = document.querySelector("#section").value || "BSN 3A";
  previewEmail.textContent = document.querySelector("#school-email").value || "maria.cruz@cit.edu";

  const requiredFields = Array.from(form.querySelectorAll("[required]"));
  const filledFields = requiredFields.filter((field) => field.value.trim()).length;
  const completion = Math.round((filledFields / requiredFields.length) * 100);

  completionPercent.textContent = `${completion}%`;
  completionBadge.textContent = `${completion}% complete`;
  completionBar.style.width = `${completion}%`;
  syncPill.textContent = "Unsaved changes";
}

function validateSchoolId() {
  const isValid = /^\d{2}-\d{4}-\d{3}$/.test(schoolId.value.trim());
  schoolIdLabel.classList.toggle("has-error", !isValid);
  schoolId.setAttribute("aria-invalid", String(!isValid));
  schoolIdError.hidden = isValid;
  return isValid;
}

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

form.addEventListener("input", () => {
  updatePreview();

  if (schoolId.value.trim()) {
    validateSchoolId();
  }
});

photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];

  if (!file) {
    return;
  }

  renderPhoto(URL.createObjectURL(file));
  message.textContent = "Profile picture preview updated.";
  message.classList.remove("is-error");
  message.classList.add("is-success");
  syncPill.textContent = "Unsaved photo";
});

if (removePhotoButton) {
  removePhotoButton.addEventListener("click", () => {
    photoInput.value = "";
    renderInitials();
    message.textContent = "Profile picture removed from preview.";
    message.classList.remove("is-error");
    message.classList.add("is-success");
    syncPill.textContent = "Unsaved photo";
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.checkValidity() || !validateSchoolId()) {
    message.textContent = "Complete all required fields and use the correct ID format.";
    message.classList.remove("is-success");
    message.classList.add("is-error");
    return;
  }

  message.textContent = "Profile updated successfully.";
  message.classList.remove("is-error");
  message.classList.add("is-success");
  syncPill.textContent = "Updated successfully";
});

resetButton.addEventListener("click", () => {
  form.reset();
  photoInput.value = "";
  renderInitials();
  updatePreview();
  schoolIdLabel.classList.remove("has-error");
  schoolIdError.hidden = true;
  message.textContent = "Changes reset to saved profile details.";
  message.classList.remove("is-error");
  message.classList.add("is-success");
});
