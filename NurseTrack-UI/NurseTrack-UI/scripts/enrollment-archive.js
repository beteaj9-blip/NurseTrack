const schoolYearFilter = document.querySelector("#archive-school-year");
const termFilter = document.querySelector("#archive-term");
const recordStatusFilter = document.querySelector("#archive-record-status");
const archiveRows = Array.from(document.querySelectorAll("[data-archive-record]"));
const archiveVisibleCount = document.querySelector("#archive-visible-count");
const archiveEmpty = document.querySelector("#archive-empty");
const archiveMessage = document.querySelector("#archive-message");

function filterArchiveRows() {
  const schoolYear = schoolYearFilter.value;
  const term = termFilter.value;
  const status = recordStatusFilter.value;
  let visible = 0;

  archiveRows.forEach((row) => {
    const isVisible =
      (schoolYear === "all" || row.dataset.schoolYear === schoolYear) &&
      (term === "all" || row.dataset.term === term) &&
      (status === "all" || row.dataset.recordStatus === status);

    row.hidden = !isVisible;

    if (isVisible) {
      visible += 1;
    }
  });

  archiveVisibleCount.textContent = `${visible} visible`;
  archiveEmpty.hidden = visible > 0;
}

[schoolYearFilter, termFilter, recordStatusFilter].forEach((control) => {
  control.addEventListener("input", filterArchiveRows);
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-restore-record]");

  if (!button) {
    return;
  }

  const row = button.closest("[data-archive-record]");
  row.dataset.recordStatus = "current";
  row.querySelector(".status-badge").textContent = "Restored";
  row.querySelector(".status-badge").className = "status-badge status-verified";
  button.textContent = "Restored";
  button.disabled = true;
  archiveMessage.textContent = `${row.dataset.schoolYear} archive record restored into current review.`;
  archiveMessage.classList.add("is-success");
  filterArchiveRows();
});

filterArchiveRows();
