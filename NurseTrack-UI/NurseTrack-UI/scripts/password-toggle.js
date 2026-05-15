document.querySelectorAll("[data-toggle-password]").forEach((button) => {
  const input = document.querySelector(`#${button.dataset.togglePassword}`);

  if (!input) {
    return;
  }

  button.addEventListener("click", () => {
    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    button.classList.toggle("is-visible", isHidden);
    button.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
    button.setAttribute("title", isHidden ? "Hide password" : "Show password");
  });
});
