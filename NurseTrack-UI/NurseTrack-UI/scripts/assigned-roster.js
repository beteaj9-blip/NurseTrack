const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");
const table = document.querySelector("#assigned-roster-table");

const rosters = {
  "ward-b": {
    title: "Emergency Room Rotation roster.",
    heading: "Emergency Room Rotation",
    subtitle: "CCMC - May 8 - 7:00 AM to 3:00 PM",
    hospital: "CCMC",
    area: "Emergency Room",
    shift: "7:00 AM - 3:00 PM",
    group: "BSN 3A - Group 2",
    dutyType: "Regular",
    status: "Upcoming",
    students: [
      ["Maria Cruz", "MC", "BSN 3A", "Approved"],
      ["Josh Anton Nuevas", "JA", "BSN 3A", "Pending"],
      ["Treasure Abadinas", "TA", "BSN 3A", "Approved"],
      ["Lichael Ursulo", "LU", "BSN 3A", "No Validation Yet"],
      ["Jay Tiongzon", "JT", "BSN 3A", "No Validation Yet"],
      ["Angela Neri", "AN", "BSN 3A", "Pending"],
      ["Zander Aligato", "ZA", "BSN 3A", "Approved"],
      ["Andrea Gomez", "AG", "BSN 3A", "No Validation Yet"]
    ]
  },

  "delivery-room": {
    title: "Delivery Room Rotation roster.",
    heading: "Delivery Room Rotation",
    subtitle: "CCMC - May 10 - 6:00 AM to 2:00 PM",
    hospital: "CCMC",
    area: "Delivery Room",
    shift: "6:00 AM - 2:00 PM",
    group: "BSN 3A - Group 1",
    dutyType: "Extension",
    status: "Upcoming",
    students: [
      ["Treasure Abadinas", "TA", "BSN 3A", "Approved"],
      ["Maria Cruz", "MC", "BSN 3A", "Pending"],
      ["Josh Anton Nuevas", "JA", "BSN 3A", "No Validation Yet"],
      ["Lichael Ursulo", "LU", "BSN 3A", "No Validation Yet"],
      ["Jay Tiongzon", "JT", "BSN 3A", "Pending"],
      ["Andrea Gomez", "AG", "BSN 3A", "Approved"]
    ]
  },

  "pediatric-ward": {
    title: "Pedia Pulmo Ward roster.",
    heading: "Pedia Pulmo Ward",
    subtitle: "CCMC - May 6 - 7:00 AM to 3:00 PM",
    hospital: "CCMC",
    area: "Pedia Pulmo Ward",
    shift: "7:00 AM - 3:00 PM",
    group: "BSN 3B - Group 1",
    dutyType: "Completion",
    status: "Upcoming",
    students: [
      ["Jay Tiongzon", "JT", "BSN 3B", "No Validation Yet"],
      ["Zander Aligato", "ZA", "BSN 3B", "Approved"],
      ["Andrea Gomez", "AG", "BSN 3B", "No Validation Yet"],
      ["Angela Neri", "AN", "BSN 3B", "Pending"],
      ["Maria Cruz", "MC", "BSN 3B", "Approved"],
      ["Lichael Ursulo", "LU", "BSN 3B", "No Validation Yet"]
    ]
  },

  "operating-room": {
    title: "Operating Room Duty roster.",
    heading: "Operating Room Duty",
    subtitle: "VSMMC - May 9 - 8:00 AM to 5:00 PM",
    hospital: "VSMMC",
    area: "Operating Room",
    shift: "8:00 AM - 5:00 PM",
    group: "BSN 4A - Group 1",
    dutyType: "Regular",
    status: "Upcoming",
    students: [
      ["Andrea Gomez", "AG", "BSN 4A", "Approved"],
      ["Zander Aligato", "ZA", "BSN 4A", "Pending"],
      ["Treasure Abadinas", "TA", "BSN 4A", "Approved"],
      ["Jay Tiongzon", "JT", "BSN 4A", "No Validation Yet"],
      ["Maria Cruz", "MC", "BSN 4A", "Pending"]
    ]
  }
};

function setText(selector, value) {
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = value;
  }
}

function statusClass(value) {
  if (/regular|verified|active|approved/i.test(value)) {
    return "status-verified";
  }

  if (/extension|late|needs/i.test(value)) {
    return "status-rejected";
  }

  if (/completion|scheduled|no validation yet/i.test(value)) {
    return "status-neutral";
  }

  return "status-pending";
}

function clearRosterRows() {
  if (!table) {
    return;
  }

  const existingRows = table.querySelectorAll(".assigned-roster-row:not(.assigned-roster-head)");

  existingRows.forEach((row) => {
    row.remove();
  });
}

function renderRoster() {
  const key = new URLSearchParams(window.location.search).get("rotation") || "ward-b";
  const roster = rosters[key] || rosters["ward-b"];
  const showValidation = table?.dataset.showValidation === "true";

  roster.students.sort((a, b) => {
    const lastNameA = a[0].split(" ").pop().toLowerCase();
    const lastNameB = b[0].split(" ").pop().toLowerCase();

    return lastNameA.localeCompare(lastNameB);
  });

  setText("#roster-title", roster.title);
  setText("#roster-heading", roster.heading);
  setText("#roster-subtitle", roster.subtitle);
  setText("#roster-hospital", roster.hospital);
  setText("#roster-area", roster.area);
  setText("#roster-shift", roster.shift);
  setText("#roster-group", roster.group);
  setText("#roster-status", roster.status);
  setText("#roster-count", `${roster.students.length} students`);

  clearRosterRows();

  const rows = roster.students.map(([name, initials, section, validation = "No Validation Yet"], index) => {
    const validationCell = showValidation
      ? `<div><span class="status-badge ${statusClass(validation)}">${validation}</span></div>`
      : "";

    return `
    <div class="assigned-roster-row">
      <div><strong>${index + 1}.</strong></div>
      <div class="roster-student-cell">
        <span class="avatar small-avatar">${initials}</span>
        <strong>${name}</strong>
      </div>
      <div>${section}</div>
      <div><span class="status-badge ${statusClass(roster.dutyType)}">${roster.dutyType}</span></div>
      ${validationCell}
    </div>
  `;
  }).join("");

  if (table) {
    table.insertAdjacentHTML("beforeend", rows);
  }
}

menuButton?.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop?.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});

renderRoster();
