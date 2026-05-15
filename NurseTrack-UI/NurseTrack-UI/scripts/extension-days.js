(() => {
  const students = [
    {
      slug: "treasure-abadinas",
      name: "Treasure Abadinas",
      initials: "TA",
      section: "BSN 3A",
      id: "22-1845-103",
      standing: "On track",
      site: "SAMCH",
      area: "Delivery Room"
    },
    {
      slug: "maria-cruz",
      name: "Maria Cruz",
      initials: "MC",
      section: "BSN 3A",
      id: "12-3456-789",
      standing: "In progress",
      site: "CCMC",
      area: "Emergency Room"
    },
    {
      slug: "carlo-fernandez",
      name: "Carlo Fernandez",
      initials: "CF",
      section: "BSN 3A",
      id: "23-1188-902",
      standing: "In progress",
      site: "VSMMC",
      area: "OR Main"
    },
    {
      slug: "nicole-dela-pena",
      name: "Nicole Dela Pena",
      initials: "ND",
      section: "BSN 3A",
      id: "23-1023-441",
      standing: "On track",
      site: "Vicente Mendiola Center for Health Infirmary",
      area: "Medical Ward"
    },
    {
      slug: "licheal-ursulo",
      name: "Lichael Ursulo",
      initials: "LU",
      section: "BSN 3A",
      id: "23-1788-402",
      standing: "Completed",
      site: "SAMCH",
      area: "Delivery Room"
    },
    {
      slug: "zander-aligato",
      name: "Zander Aligato",
      initials: "ZA",
      section: "BSN 3B",
      id: "21-7740-118",
      standing: "On track",
      site: "CCMC",
      area: "Emergency Room"
    }
  ];

  let records = [
    {
      initials: "TA",
      student: "Treasure Abadinas",
      section: "BSN 3A",
      id: "22-1845-103",
      extensionDays: 1,
      basis: "Excused absence",
      reason: "Medical certificate submitted within the required documentation period.",
      status: "Added"
    },
    {
      initials: "MC",
      student: "Maria Cruz",
      section: "BSN 3A",
      id: "12-3456-789",
      extensionDays: 4,
      basis: "Unexcused absence",
      reason: "Unexcused missed clinical duty. Extension assigned using the 1:4 make-up ratio.",
      status: "Added"
    },
    {
      initials: "ZA",
      student: "Zander Aligato",
      section: "BSN 3B",
      id: "21-7740-118",
      extensionDays: 2,
      basis: "Tardiness",
      reason: "Late for duty by more than 30 minutes. Extension assigned based on tardiness policy.",
      status: "Added"
    }
  ];

  const menuButton = document.querySelector("[data-menu-button]");
  const sidebarBackdrop = document.querySelector("[data-close-sidebar]");

  menuButton?.addEventListener("click", () => {
    document.body.classList.add("sidebar-open");
  });

  sidebarBackdrop?.addEventListener("click", () => {
    document.body.classList.remove("sidebar-open");
  });

  function getCurrentRole() {
    return (document.querySelector(".role-chip")?.textContent || "").trim().toLowerCase();
  }

  function isClinicalInstructorRole() {
    const role = getCurrentRole();
    return role === "clinical instructor" || role === "instructor";
  }

  function getExtensionTargetPage() {
    return isClinicalInstructorRole() ? "extension-day-detail.html" : "extension-day-view.html";
  }

  function badgeClass(status) {
    if (status === "Completed" || status === "On track" || status === "Added") {
      return "status-verified";
    }

    if (status === "Pending" || status === "In progress" || status === "Scheduled") {
      return "status-pending";
    }

    return "status-rejected";
  }

  function showMessage(element, text, success = true) {
    if (!element) return;

    element.hidden = false;
    element.textContent = text;
    element.className = `form-message full-width ${success ? "is-success" : "is-error"}`;
  }

  function renderSearchPage() {
    const list = document.querySelector("#extension-student-list");
    const search = document.querySelector("#extension-search");
    const section = document.querySelector("#extension-section");
    const standing = document.querySelector("#extension-standing");
    const count = document.querySelector("#extension-visible-count");
    const empty = document.querySelector("#extension-empty-state");

    if (!list) return;

    function renderStudents() {
      const query = (search?.value || "").trim().toLowerCase();
      const sectionValue = section?.value || "all";
      const standingValue = standing?.value || "all";
      const targetPage = getExtensionTargetPage();

      const visible = students.filter((student) => {
        const haystack = `${student.name} ${student.id} ${student.section} ${student.standing} ${student.site} ${student.area}`.toLowerCase();

        return (
          (!query || haystack.includes(query)) &&
          (sectionValue === "all" || student.section === sectionValue) &&
          (standingValue === "all" || student.standing === standingValue)
        );
      });

      list.innerHTML = visible.map((student) => `
        <a
          class="student-progress-pick-card"
          href="${targetPage}?student=${student.slug}"
          data-extension-student
          data-name="${student.name}"
        >
          <span class="avatar small-avatar">${student.initials}</span>
          <span>
            <strong>${student.name}</strong>
            <small>${student.section} - ${student.id}</small>
          </span>
          <mark class="status-badge ${badgeClass(student.standing)}">${student.standing}</mark>
        </a>
      `).join("");

      if (count) count.textContent = `${visible.length} visible`;
      if (empty) empty.hidden = visible.length > 0;
    }

    [search, section, standing].forEach((control) => {
      control?.addEventListener("input", renderStudents);
      control?.addEventListener("change", renderStudents);
    });

    renderStudents();
  }

  function renderDetailOrViewPage() {
    const selectedSummary = document.querySelector("#extension-selected-summary");
    const selectedInitials = document.querySelector("#extension-selected-initials");
    const selectedName = document.querySelector("#extension-selected-name");
    const selectedMeta = document.querySelector("#extension-selected-meta");
    const selectedStanding = document.querySelector("#extension-selected-standing");
    const detailContent = document.querySelector("#extension-detail-content");
    const historyPanel = document.querySelector("#extension-history-panel");
    const historyList = document.querySelector("#extension-history-list");
    const historyCount = document.querySelector("#extension-history-count");
    const historyEmpty = document.querySelector("#extension-history-empty");
    const form = document.querySelector("#extension-form");
    const message = document.querySelector("#extension-message");
    const clearButton = document.querySelector("#extension-clear");
    const submitButton = form?.querySelector("button[type='submit']");
    const cancelModal = document.querySelector("#extension-cancel-modal");
    const cancelModalCopy = document.querySelector("#extension-cancel-copy");
    const confirmCancelButton = document.querySelector("#confirm-extension-cancel");
    const closeCancelButtons = Array.from(document.querySelectorAll("[data-extension-cancel-close]"));
    let editingRecordIndex = -1;
    let pendingCancelRecordIndex = -1;

    if (!selectedSummary) return;

    const params = new URLSearchParams(window.location.search);
    const selectedSlug = params.get("student");
    const selectedStudent = students.find((student) => student.slug === selectedSlug);

    function renderSelectedStudent() {
      if (!selectedStudent) {
        if (selectedInitials) selectedInitials.textContent = "--";
        if (selectedName) selectedName.textContent = "Student not found";
        if (selectedMeta) selectedMeta.textContent = "Go back to search and choose a valid student.";
        if (selectedStanding) {
          selectedStanding.textContent = "Not found";
          selectedStanding.className = "status-badge status-rejected";
        }
        return;
      }

      if (selectedInitials) selectedInitials.textContent = selectedStudent.initials;
      if (selectedName) selectedName.textContent = selectedStudent.name;
      if (selectedMeta) selectedMeta.textContent = `${selectedStudent.section} - ${selectedStudent.id}`;

      if (selectedStanding) {
        selectedStanding.textContent = selectedStudent.standing;
        selectedStanding.className = `status-badge ${badgeClass(selectedStudent.standing)}`;
      }

      if (detailContent) detailContent.hidden = false;
      if (historyPanel) historyPanel.hidden = false;
    }

    function renderHistory() {
      if (!historyList || !selectedStudent) return;

      const studentRecords = records
        .map((record, index) => ({ ...record, recordIndex: index }))
        .filter((record) => record.id === selectedStudent.id);

      if (historyCount) {
        historyCount.textContent = `${studentRecords.length} ${studentRecords.length === 1 ? "record" : "records"}`;
      }

      if (historyEmpty) {
        historyEmpty.hidden = studentRecords.length > 0;
      }

      historyList.hidden = studentRecords.length === 0;

      const canEditHistory = isClinicalInstructorRole();

      historyList.innerHTML = studentRecords.map((record) => `
        <div class="extension-history-row">
          <span class="avatar small-avatar">${record.initials}</span>

          <span>
            <strong>${record.student}</strong>
            <small>${record.section} - ${record.id}</small>
          </span>

          <span>
            <strong>${record.extensionDays || 1} extension ${Number(record.extensionDays) === 1 ? "day" : "days"}</strong>
            <small>${record.basis || "Instructor assessment"}</small>
          </span>

          <span>
            <strong>${record.reason || "No remarks added"}</strong>
            <small>Instructor-assigned extension</small>
          </span>

          <div class="extension-history-status">
            <mark class="status-badge ${badgeClass(record.status)}">${record.status}</mark>
            ${canEditHistory ? `
              <span class="extension-history-actions">
                <button class="ghost-button" type="button" data-extension-edit="${record.recordIndex}">Edit</button>
                ${record.status !== "Canceled" ? `<button class="ghost-button danger-button" type="button" data-extension-cancel="${record.recordIndex}">Cancel</button>` : ""}
              </span>
            ` : ""}
          </div>
        </div>
      `).join("");
    }

    function openCancelModal(recordIndex) {
      const record = records[recordIndex];

      if (!record || !cancelModal) return;

      pendingCancelRecordIndex = recordIndex;
      if (cancelModalCopy) {
        cancelModalCopy.textContent = `Cancel ${record.student}'s extension day record? This keeps the record in the history but marks it as canceled.`;
      }

      cancelModal.hidden = false;
      document.body.classList.add("modal-open");
    }

    function closeCancelModal() {
      if (cancelModal) {
        cancelModal.hidden = true;
      }

      pendingCancelRecordIndex = -1;
      document.body.classList.remove("modal-open");
    }

    function confirmCancelRecord() {
      const record = records[pendingCancelRecordIndex];

      if (!record) {
        closeCancelModal();
        return;
      }

      record.status = "Canceled";
      if (editingRecordIndex === pendingCancelRecordIndex) {
        editingRecordIndex = -1;
        form?.reset();
        if (submitButton) submitButton.textContent = "Add Extension Days";
      }

      renderHistory();
      showMessage(message, `${record.student}'s extension day record was canceled.`, false);
      closeCancelModal();
    }

    clearButton?.addEventListener("click", () => {
      form?.reset();
      editingRecordIndex = -1;
      if (submitButton) submitButton.textContent = "Add Extension Days";
      showMessage(message, "Extension form cleared. Enter the new extension details when ready.", true);
    });

    historyList?.addEventListener("click", (event) => {
      const editButton = event.target.closest("[data-extension-edit]");
      const cancelButton = event.target.closest("[data-extension-cancel]");

      if (editButton) {
        const recordIndex = Number(editButton.dataset.extensionEdit);
        const record = records[recordIndex];

        if (!record || !form) return;

        editingRecordIndex = recordIndex;
        form.elements["extension-days-count"].value = record.extensionDays || 1;
        form.elements.basis.value = record.basis || "Instructor assessment";
        form.elements.reason.value = record.reason || "";
        if (submitButton) submitButton.textContent = "Update Extension Days";
        showMessage(message, `Editing ${record.student}'s extension day record.`, true);
        form.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      if (cancelButton) {
        const recordIndex = Number(cancelButton.dataset.extensionCancel);
        openCancelModal(recordIndex);
      }
    });

    confirmCancelButton?.addEventListener("click", confirmCancelRecord);

    closeCancelButtons.forEach((button) => {
      button.addEventListener("click", closeCancelModal);
    });

    cancelModal?.addEventListener("click", (event) => {
      if (event.target === cancelModal) {
        closeCancelModal();
      }
    });

    form?.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!selectedStudent) {
        showMessage(message, "Go back to search and choose a valid student first.", false);
        return;
      }

      if (!isClinicalInstructorRole()) {
        showMessage(message, "Only the Clinical Instructor can add extension days.", false);
        return;
      }

      const data = new FormData(form);
      const daysToAdd = Number(data.get("extension-days-count"));

      const recordData = {
        initials: selectedStudent.initials,
        student: selectedStudent.name,
        section: selectedStudent.section,
        id: selectedStudent.id,
        extensionDays: daysToAdd,
        basis: data.get("basis"),
        reason: data.get("reason"),
        status: "Added"
      };

      if (editingRecordIndex >= 0 && records[editingRecordIndex]) {
        records[editingRecordIndex] = recordData;
      } else {
        records.unshift(recordData);
      }

      renderHistory();
      showMessage(message, editingRecordIndex >= 0
        ? `${selectedStudent.name}'s extension day record was updated.`
        : `${selectedStudent.name} received +${daysToAdd} extension ${daysToAdd === 1 ? "day" : "days"}.`, true);
      editingRecordIndex = -1;
      if (submitButton) submitButton.textContent = "Add Extension Days";
      form.reset();
    });

    renderSelectedStudent();
    renderHistory();
  }

  renderSearchPage();
  renderDetailOrViewPage();
})();
