const forgotPasswordForm = document.querySelector("#forgot-password-form");
const message = document.querySelector("#form-message");

function setMessage(text, state) {
  message.textContent = text;
  message.classList.remove("is-error", "is-success");

  if (state) {
    message.classList.add(state);
  }
}

forgotPasswordForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(forgotPasswordForm);
  const accountId = String(formData.get("accountId") || "").trim();

  if (!accountId) {
    setMessage("Enter your school email or ID number.", "is-error");
    return;
  }

  if (accountId.includes("@") && (!accountId.includes(".") || accountId.startsWith("@"))) {
    setMessage("Enter a valid school email address.", "is-error");
    return;
  }

  setMessage("Reset instructions have been sent if the account exists.", "is-success");
});
