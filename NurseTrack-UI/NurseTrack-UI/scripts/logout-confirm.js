(() => {
  const logoutLinks = Array.from(document.querySelectorAll(".logout-link"));

  if (!logoutLinks.length) {
    return;
  }

  let targetHref = "";
  let previousFocus = null;

  const createDialog = () => {
    const existingDialog = document.querySelector("[data-logout-confirm]");

    if (existingDialog) {
      return existingDialog;
    }

    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop logout-confirm-backdrop";
    backdrop.dataset.logoutConfirm = "true";
    backdrop.hidden = true;
    backdrop.innerHTML = `
      <section class="modal-card confirm-modal logout-confirm-card" role="dialog" aria-modal="true" aria-labelledby="logout-confirm-title" aria-describedby="logout-confirm-copy">
        <div class="logout-confirm-icon" aria-hidden="true">
          <span></span>
        </div>
        <p class="section-kicker">Confirm Logout</p>
        <h2 id="logout-confirm-title">Are you sure you want to log out?</h2>
        <p class="modal-copy logout-confirm-copy" id="logout-confirm-copy">You will return to the NurseTrack login screen.</p>
        <div class="modal-actions logout-confirm-actions">
          <button class="ghost-button" type="button" data-logout-cancel>Cancel</button>
          <button class="primary-button" type="button" data-logout-proceed>Log out</button>
        </div>
      </section>
    `;

    document.body.appendChild(backdrop);
    return backdrop;
  };

  const dialog = createDialog();
  const cancelButton = dialog.querySelector("[data-logout-cancel]");
  const proceedButton = dialog.querySelector("[data-logout-proceed]");
  const focusableControls = [cancelButton, proceedButton].filter(Boolean);

  const closeDialog = () => {
    dialog.hidden = true;
    document.body.classList.remove("modal-open");

    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
  };

  const openDialog = (href) => {
    targetHref = href;
    previousFocus = document.activeElement;
    dialog.hidden = false;
    document.body.classList.add("modal-open");
    cancelButton?.focus();
  };

  logoutLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openDialog(link.getAttribute("href") || link.href || "../index.html");
    });
  });

  cancelButton?.addEventListener("click", closeDialog);

  proceedButton?.addEventListener("click", () => {
    window.sessionStorage.removeItem("nursetrackRole");
    window.location.href = targetHref || "../index.html";
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      closeDialog();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (dialog.hidden) {
      return;
    }

    if (event.key === "Escape") {
      closeDialog();
      return;
    }

    if (event.key !== "Tab" || focusableControls.length < 2) {
      return;
    }

    const firstControl = focusableControls[0];
    const lastControl = focusableControls[focusableControls.length - 1];

    if (event.shiftKey && document.activeElement === firstControl) {
      event.preventDefault();
      lastControl.focus();
    } else if (!event.shiftKey && document.activeElement === lastControl) {
      event.preventDefault();
      firstControl.focus();
    }
  });
})();
