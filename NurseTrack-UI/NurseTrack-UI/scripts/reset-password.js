const resetPasswordForm = document.querySelector("#reset-password-form");
const message = document.querySelector("#form-message");

function setMessage(text, state) {
  message.textContent = text;
  message.classList.remove("is-error", "is-success");

  if (state) {
    message.classList.add(state);
  }
}

resetPasswordForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(resetPasswordForm);
  const resetCode = String(formData.get("resetCode") || "").trim();
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!/^\d{6}$/.test(resetCode)) {
    setMessage("Reset code must be 6 digits.", "is-error");
    return;
  }

  if (newPassword.length < 8) {
    setMessage("New password must be at least 8 characters.", "is-error");
    return;
  }

  if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
    setMessage("Use a password with both letters and numbers.", "is-error");
    return;
  }

  if (newPassword !== confirmPassword) {
    setMessage("Passwords do not match.", "is-error");
    return;
  }

  setMessage("Password updated successfully.", "is-success");
});
