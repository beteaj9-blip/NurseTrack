const registerForm = document.querySelector("#register-form");
const message = document.querySelector("#form-message");

function setMessage(text, state) {
  message.textContent = text;
  message.classList.remove("is-error", "is-success");

  if (state) {
    message.classList.add(state);
  }
}

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(registerForm);
  const requiredFields = ["fullName", "schoolId", "email", "accountType", "section", "password", "confirmPassword"];
  const missingField = requiredFields.some((field) => !String(formData.get(field) || "").trim());

  if (missingField) {
    setMessage("Please complete all required fields.", "is-error");
    return;
  }

  const email = String(formData.get("email") || "").trim();
  const schoolId = String(formData.get("schoolId") || "").trim();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");
  const termsAccepted = formData.get("terms") === "on";

  if (!/^\d{2}-\d{4}-\d{3}$/.test(schoolId)) {
    setMessage("School ID number must follow the xx-xxxx-xxx format.", "is-error");
    return;
  }

  if (!email.includes("@") || !email.includes(".")) {
    setMessage("Enter a valid school email address.", "is-error");
    return;
  }

  if (password.length < 8) {
    setMessage("Password must be at least 8 characters.", "is-error");
    return;
  }

  if (password !== confirmPassword) {
    setMessage("Passwords do not match.", "is-error");
    return;
  }

  if (!termsAccepted) {
    setMessage("Please confirm that the account details are correct.", "is-error");
    return;
  }

  setMessage("Account created successfully.", "is-success");
});
