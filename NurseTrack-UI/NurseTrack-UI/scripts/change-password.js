const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const form = document.querySelector("#change-password-form");
const currentPassword = document.querySelector("#current-password");
const newPassword = document.querySelector("#new-password");
const confirmPassword = document.querySelector("#confirm-password");
const message = document.querySelector("#change-password-message");
const syncPill = document.querySelector("#password-sync-pill");
const badge = document.querySelector("#password-form-badge");
const strengthLabel = document.querySelector("#password-strength-label");
const strengthBar = document.querySelector("#password-strength-bar");
const clearButton = document.querySelector("#clear-password-form");
const requirementItems = Array.from(document.querySelectorAll(".password-requirement"));

function setMessage(text, state) {
  message.textContent = text;
  message.classList.remove("is-error", "is-success");

  if (state) {
    message.classList.add(state);
  }
}

function checks() {
  const password = newPassword.value;
  return {
    length: password.length >= 8,
    letter: /[a-z]/.test(password) && /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
    match: password.length > 0 && password === confirmPassword.value
  };
}

function updateStrength() {
  const result = checks();
  const passed = Object.values(result).filter(Boolean).length;
  const percent = Math.round((passed / 5) * 100);

  requirementItems.forEach((item) => {
    item.classList.toggle("is-met", result[item.dataset.rule]);
  });

  strengthBar.style.width = `${percent}%`;

  if (!newPassword.value) {
    strengthLabel.textContent = "Not started";
  } else if (percent < 60) {
    strengthLabel.textContent = "Weak";
  } else if (percent < 100) {
    strengthLabel.textContent = "Good";
  } else {
    strengthLabel.textContent = "Strong";
  }

  syncPill.textContent = "Unsaved changes";
}

function togglePassword(button) {
  const input = document.querySelector(`#${button.dataset.togglePassword}`);
  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";
  button.classList.toggle("is-visible", isHidden);
  button.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
  button.setAttribute("title", isHidden ? "Hide password" : "Show password");
}

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

document.querySelectorAll("[data-toggle-password]").forEach((button) => {
  button.addEventListener("click", () => togglePassword(button));
});

[newPassword, confirmPassword].forEach((input) => {
  input.addEventListener("input", updateStrength);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const result = checks();

  if (!currentPassword.value.trim()) {
    setMessage("Enter your current password.", "is-error");
    return;
  }

  if (newPassword.value === currentPassword.value) {
    setMessage("New password must be different from the current password.", "is-error");
    return;
  }

  if (!result.length || !result.letter || !result.number || !result.symbol) {
    setMessage("Create a stronger password before updating.", "is-error");
    return;
  }

  if (!result.match) {
    setMessage("Password confirmation does not match.", "is-error");
    return;
  }

  setMessage("Password updated successfully.", "is-success");
  form.reset();
  updateStrength();
  syncPill.textContent = "Updated successfully";
  badge.textContent = "Updated";
  badge.classList.remove("status-pending");
  badge.classList.add("status-verified");
});

clearButton.addEventListener("click", () => {
  form.reset();
  updateStrength();
  syncPill.textContent = "Secure account";
  badge.textContent = "Required";
  badge.classList.remove("status-verified");
  badge.classList.add("status-pending");
  setMessage("Password fields cleared.", "is-success");
});

updateStrength();
