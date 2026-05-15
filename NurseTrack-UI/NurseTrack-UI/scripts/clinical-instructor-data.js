(function () {
  const STORAGE_KEY = "nursetrack-instructor-case-decisions";
  const DEFAULT_CI_NAME = "Patricia Reyes";
  const DEFAULT_CI_CREDENTIALS = "RN, MAN";
  const DEFAULT_CI_FULL_NAME = `${DEFAULT_CI_NAME}, ${DEFAULT_CI_CREDENTIALS}`;

  const students = {
    "maria-cruz": {
      name: "Maria Cruz",
      initials: "MC",
      id: "12-3456-789",
      section: "BSN 3A",
      site: "CCMC",
      area: "Emergency Room",
      status: "In progress",
      extensionDays: 11,
      pending: 14
    },
    "licheal-ursulo": {
      name: "Lichael Ursulo",
      initials: "LU",
      id: "23-1788-402",
      section: "BSN 3A",
      site: "SAMCH",
      area: "Delivery Room",
      status: "Completed",
      extensionDays: 0,
      pending: 0
    },
    "treasure-abadinas": {
      name: "Treasure Abadinas",
      initials: "TA",
      id: "22-1845-103",
      section: "BSN 3A",
      site: "SAMCH",
      area: "Delivery Room",
      status: "On track",
      extensionDays: 5,
      pending: 6
    },
    "nicole-dela-pena": {
      name: "Nicole Dela Pena",
      initials: "ND",
      id: "23-1023-441",
      section: "BSN 3A",
      site: "Vicente Mendiola Center for Health Infirmary",
      area: "Medical Ward",
      status: "On track",
      extensionDays: 3,
      pending: 5
    },
    "carlo-fernandez": {
      name: "Carlo Fernandez",
      initials: "CF",
      id: "23-1188-902",
      section: "BSN 3A",
      site: "VSMMC",
      area: "OR Main",
      status: "In progress",
      extensionDays: 6,
      pending: 8
    },
    "zander-aligato": {
      name: "Zander Aligato",
      initials: "ZA",
      id: "21-7740-118",
      section: "BSN 3B",
      site: "CCMC",
      area: "Emergency Room",
      status: "On track",
      extensionDays: 0,
      pending: 2
    },
    "jay-tiongzon": {
      name: "Jay Tiongzon",
      initials: "JT",
      id: "23-1782-221",
      section: "BSN 3B",
      site: "CHN Brgy. Dumlog",
      area: "Community Health Nursing Area",
      status: "Needs action",
      extensionDays: 15,
      pending: 18
    },
    "hannah-bautista": {
      name: "Hannah Bautista",
      initials: "HB",
      id: "22-2451-667",
      section: "BSN 3B",
      site: "CCMC",
      area: "Pedia Pulmo Ward",
      status: "On track",
      extensionDays: 4,
      pending: 5
    },
    "rafael-castillo": {
      name: "Rafael Castillo",
      initials: "RC",
      id: "22-8820-431",
      section: "BSN 3B",
      site: "VSMMC",
      area: "OR Main",
      status: "In progress",
      extensionDays: 8,
      pending: 10
    },
    "bea-montes": {
      name: "Bea Montes",
      initials: "BM",
      id: "23-5531-208",
      section: "BSN 3B",
      site: "CHN Brgy. Dumlog",
      area: "Community Health Nursing Area",
      status: "Needs action",
      extensionDays: 13,
      pending: 16
    },
    "janine-aquino": {
      name: "Janine Aquino",
      initials: "JA",
      id: "22-6102-719",
      section: "BSN 3C",
      site: "SAMCH",
      area: "Delivery Room",
      status: "On track",
      extensionDays: 2,
      pending: 4
    },
    "miguel-reyes": {
      name: "Miguel Reyes",
      initials: "MR",
      id: "23-4190-778",
      section: "BSN 3C",
      site: "Vicente Mendiola Center for Health Infirmary",
      area: "Medical Ward",
      status: "In progress",
      extensionDays: 7,
      pending: 9
    },
    "patricia-uy": {
      name: "Patricia Uy",
      initials: "PU",
      id: "22-7304-122",
      section: "BSN 3C",
      site: "CCMC",
      area: "Emergency Room",
      status: "Needs action",
      extensionDays: 10,
      pending: 13
    },
    "sean-villamor": {
      name: "Sean Villamor",
      initials: "SV",
      id: "23-9055-310",
      section: "BSN 3C",
      site: "VSMMC",
      area: "OR Main",
      status: "In progress",
      extensionDays: 5,
      pending: 7
    },
    "leah-tan": {
      name: "Leah Tan",
      initials: "LT",
      id: "23-6718-235",
      section: "BSN 3C",
      site: "CCMC",
      area: "NICU",
      status: "Completed",
      extensionDays: 0,
      pending: 0
    },
    "andrea-gomez": {
      name: "Andrea Gomez",
      initials: "AG",
      id: "20-4408-332",
      section: "BSN 4A",
      site: "CSMC",
      area: "Emergency Room",
      status: "In progress",
      extensionDays: 7,
      pending: 9
    },
    "mark-hernandez": {
      name: "Mark Hernandez",
      initials: "MH",
      id: "21-5409-882",
      section: "BSN 4A",
      site: "PSH",
      area: "Operating Room",
      status: "On track",
      extensionDays: 3,
      pending: 4
    },
    "camille-navarro": {
      name: "Camille Navarro",
      initials: "CN",
      id: "21-3091-450",
      section: "BSN 4A",
      site: "CCHD",
      area: "Community Health / Duty Area",
      status: "Completed",
      extensionDays: 0,
      pending: 0
    },
    "daniel-ong": {
      name: "Daniel Ong",
      initials: "DO",
      id: "21-7782-944",
      section: "BSN 4A",
      site: "CCMC",
      area: "Pedia Pulmo Ward",
      status: "In progress",
      extensionDays: 9,
      pending: 11
    },
    "sophia-ramos": {
      name: "Sophia Ramos",
      initials: "SR",
      id: "21-6607-301",
      section: "BSN 4A",
      site: "CCMC",
      area: "Emergency Room",
      status: "Needs action",
      extensionDays: 12,
      pending: 15
    }
  };

  const statusMeta = {
    pending: {
      label: "Pending",
      badgeClass: "status-pending",
      actionLabel: "Review"
    },
    approved: {
      label: "Approved",
      badgeClass: "status-verified",
      actionLabel: "View"
    },
    rejected: {
      label: "Rejected",
      badgeClass: "status-rejected",
      actionLabel: "View"
    }
  };

  const caseRecords = [
    {
      id: "treasure-dr-newborn-0424",
      studentKey: "treasure-abadinas",
      title: "DR Major Case - Assist",
      code: "CASE-0424-006",
      patientInitials: "J. A. K.",
      date: "April 24, 2026",
      shortDate: "Apr 24, 2026",
      submittedDate: "April 24, 2026",
      submittedTime: "4:35 PM",
      shiftTime: "6:00 AM - 2:00 PM",
      caseGroup: "DR",
      category: "Major Case - Assist",
      procedure: "Primary Lower Segment Transverse Cesarean Section",
      procedurePerformed: "Primary Lower Segment Transverse Cesarean Section",
      site: "SAMCH",
      supervisingCi: "Patricia Reyes",
      area: "Delivery Room",
      status: "pending",
      summary: "Submitted Apr 24, 2026 - waiting for review",
      reflection: "I learned how to assist properly during a DR major case, maintain sterile technique, and document accurately for instructor validation.",
      reviewComment: ""
    },
    {
      id: "treasure-or-circulate-0423",
      studentKey: "treasure-abadinas",
      title: "OR Major Case - Circulate",
      code: "CASE-0423-004",
      patientInitials: "M. R. S.",
      date: "April 23, 2026",
      shortDate: "Apr 23, 2026",
      submittedDate: "April 23, 2026",
      submittedTime: "2:10 PM",
      shiftTime: "6:00 AM - 2:00 PM",
      caseGroup: "OR",
      category: "Major Case - Circulate",
      procedure: "Laparoscopic Cholecystectomy",
      procedurePerformed: "Laparoscopic Cholecystectomy",
      site: "CCMC",
      supervisingCi: "Patricia Reyes",
      area: "Operating Room",
      status: "pending",
      summary: "Submitted Apr 23, 2026 - waiting for review",
      reflection: "I assisted with circulating responsibilities and maintained sterile field awareness throughout the procedure.",
      reviewComment: ""
    },
    {
      id: "maria-dr-handled-0425",
      studentKey: "maria-cruz",
      title: "DR Handled Case",
      code: "CASE-0425-007",
      patientInitials: "A. C. P.",
      date: "April 25, 2026",
      shortDate: "Apr 25, 2026",
      submittedDate: "April 25, 2026",
      submittedTime: "8:20 AM",
      shiftTime: "6:00 AM - 2:00 PM",
      caseGroup: "DR",
      category: "Handled Case",
      procedure: "Operative Hysteroscopy, Transcervical Resection of Polyp",
      procedurePerformed: "Operative Hysteroscopy, Transcervical Resection of Polyp",
      site: "CCMC",
      supervisingCi: "Patricia Reyes",
      area: "Emergency Room",
      status: "pending",
      summary: "Submitted Apr 25, 2026 - waiting for review",
      reflection: "I handled the assigned DR case under supervision and documented the care steps after endorsement.",
      reviewComment: ""
    },
    {
      id: "maria-or-scrub-0425",
      studentKey: "maria-cruz",
      title: "OR Major Case - Scrub",
      code: "CASE-0425-006",
      patientInitials: "L. M. D.",
      date: "April 25, 2026",
      shortDate: "Apr 25, 2026",
      submittedDate: "April 25, 2026",
      submittedTime: "1:40 PM",
      shiftTime: "6:00 AM - 2:00 PM",
      caseGroup: "OR",
      category: "Major Case - Scrub",
      procedure: "Appendectomy",
      procedurePerformed: "Appendectomy",
      site: "CCMC",
      supervisingCi: "Patricia Reyes",
      area: "Operating Room",
      status: "approved",
      summary: "Approved Apr 25, 2026, 3:18 PM",
      reviewedAt: "Approved Apr 25, 2026, 3:18 PM",
      reflection: "I prepared sterile instruments, assisted the scrub nurse, and maintained correct counting practice.",
      reviewComment: "Verified. Procedure notes and checklist were complete."
    },
    {
      id: "maria-or-minor-0424",
      studentKey: "maria-cruz",
      title: "OR Minor Case",
      code: "CASE-0424-005",
      patientInitials: "R. G. T.",
      date: "April 24, 2026",
      shortDate: "Apr 24, 2026",
      submittedDate: "April 24, 2026",
      submittedTime: "10:15 AM",
      shiftTime: "6:00 AM - 2:00 PM",
      caseGroup: "OR",
      category: "Minor Case",
      procedure: "Excision of Mid Sternal Sebaceous Cyst",
      procedurePerformed: "Excision of Mid Sternal Sebaceous Cyst",
      site: "CCMC",
      supervisingCi: "Patricia Reyes",
      area: "Operating Room",
      status: "rejected",
      summary: "Returned for missing case details",
      reviewedAt: "Rejected Apr 24, 2026, 1:52 PM",
      reflection: "I observed the minor procedure and assisted with post-procedure documentation.",
      reviewComment: "Missing complete procedure notes. Please add patient care details before resubmission."
    },
    {
      id: "nicole-medication-0424",
      studentKey: "nicole-dela-pena",
      title: "OR Minor Case",
      code: "CASE-0424-009",
      patientInitials: "C. V. L.",
      date: "April 24, 2026",
      shortDate: "Apr 24, 2026",
      submittedDate: "April 24, 2026",
      submittedTime: "11:05 AM",
      shiftTime: "6:00 AM - 2:00 PM",
      caseGroup: "OR",
      category: "Minor Case",
      procedure: "Suturing of Lacerated Left Side Lip Wound",
      procedurePerformed: "Suturing of Lacerated Left Side Lip Wound",
      site: "Vicente Mendiola Center for Health Infirmary",
      supervisingCi: "Patricia Reyes",
      area: "Medical Ward",
      status: "pending",
      summary: "Submitted Apr 24, 2026 - waiting for review",
      reflection: "I reviewed the medication rights with my CI before administration and documented the patient's response.",
      reviewComment: ""
    },
    {
      id: "carlo-surgical-0424",
      studentKey: "carlo-fernandez",
      title: "OR Major Case - Assist",
      code: "CASE-0424-010",
      patientInitials: "D. N. E.",
      date: "April 24, 2026",
      shortDate: "Apr 24, 2026",
      submittedDate: "April 24, 2026",
      submittedTime: "3:05 PM",
      shiftTime: "6:00 AM - 2:00 PM",
      caseGroup: "OR",
      category: "Major Case - Assist",
      procedure: "Removal of Elastic Stable Intramedullary Nail (ESIN)",
      procedurePerformed: "Removal of Elastic Stable Intramedullary Nail (ESIN)",
      site: "VSMMC",
      supervisingCi: "Patricia Reyes",
      area: "OR Main",
      status: "pending",
      summary: "Submitted Apr 24, 2026 - waiting for review",
      reflection: "I monitored post-operative vital signs and reinforced wound care teaching with supervision.",
      reviewComment: ""
    },
    {
      id: "zander-medication-0423",
      studentKey: "zander-aligato",
      title: "OR Minor Case",
      code: "CASE-0423-008",
      patientInitials: "E. B. R.",
      date: "April 23, 2026",
      shortDate: "Apr 23, 2026",
      submittedDate: "April 23, 2026",
      submittedTime: "9:10 AM",
      shiftTime: "6:00 AM - 2:00 PM",
      caseGroup: "OR",
      category: "Minor Case",
      procedure: "Cystoscopy, Open Cystolithotomy",
      procedurePerformed: "Cystoscopy, Open Cystolithotomy",
      site: "CCMC",
      supervisingCi: "Patricia Reyes",
      area: "Emergency Room",
      status: "rejected",
      summary: "Returned for missing checklist details",
      reviewedAt: "Rejected Apr 23, 2026, 11:34 AM",
      reflection: "I administered oral medication under supervision and checked the MAR after the procedure.",
      reviewComment: "Checklist is incomplete. Add the missing medication safety checks before resubmitting."
    }
  ];

  function loadOverrides() {
    try {
      const rawValue = window.localStorage.getItem(STORAGE_KEY);
      return rawValue ? JSON.parse(rawValue) : {};
    } catch (error) {
      return {};
    }
  }

  function saveOverrides(overrides) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    } catch (error) {
      return false;
    }

    return true;
  }

  function studentKeyFromName(name) {
    return String(name || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function withCiCredentials(name) {
    const cleanName = String(name || DEFAULT_CI_NAME).replace(/^Prof\.\s*/i, "").trim();
    const displayName = cleanName === "Reyes" ? DEFAULT_CI_NAME : cleanName;

    if (/,/.test(displayName)) {
      return displayName;
    }

    return `${displayName}, ${DEFAULT_CI_CREDENTIALS}`;
  }

  function withStudent(caseRecord) {
    const student = students[caseRecord.studentKey] || {};
    const supervisingCi = withCiCredentials(caseRecord.supervisingCi);
    const reviewedBy = withCiCredentials(caseRecord.reviewedBy || caseRecord.approvedBy || supervisingCi);

    return {
      ...caseRecord,
      studentName: student.name || "Selected student",
      studentInitials: student.initials || "ST",
      studentId: student.id || "",
      studentSection: student.section || "",
      studentSite: caseRecord.site || student.site || "",
      studentArea: caseRecord.area || student.area || "",
      supervisingCi,
      reviewedBy,
      approvedBy: caseRecord.status === "approved" ? reviewedBy : caseRecord.approvedBy || ""
    };
  }

  function getAllCases() {
    const overrides = loadOverrides();

    return caseRecords.map((caseRecord) => {
      const override = overrides[caseRecord.id] || {};
      return withStudent({ ...caseRecord, ...override });
    });
  }

  function getCaseById(caseId) {
    return getAllCases().find((caseRecord) => caseRecord.id === caseId) || null;
  }

  function getCasesByStudent(studentKey) {
    return getAllCases().filter((caseRecord) => caseRecord.studentKey === studentKey);
  }

  function getCasesGroupedByStudent(studentKey) {
    const studentCases = getCasesByStudent(studentKey);

    return {
      DR: studentCases.filter((caseRecord) => caseRecord.caseGroup === "DR"),
      OR: studentCases.filter((caseRecord) => caseRecord.caseGroup === "OR")
    };
  }

  function getCasesGroupedByStudentAndStatus(studentKey, status) {
    const studentCases = getCasesByStudent(studentKey).filter((caseRecord) => caseRecord.status === status);

    return {
      DR: studentCases.filter((caseRecord) => caseRecord.caseGroup === "DR"),
      OR: studentCases.filter((caseRecord) => caseRecord.caseGroup === "OR")
    };
  }

  function updateCase(caseId, updates) {
    const overrides = loadOverrides();
    const previous = overrides[caseId] || {};

    overrides[caseId] = {
      ...previous,
      ...updates
    };

    saveOverrides(overrides);

    return getCaseById(caseId);
  }

  function buildCaseUrl(caseId, options) {
    const caseRecord = getCaseById(caseId);
    const params = new URLSearchParams();
    const studentKey = options?.student || caseRecord?.studentKey;
    const from = options?.from || "selection";
    const mode = options?.mode || (caseRecord?.status === "pending" ? "review" : "view");

    params.set("case", caseId);
    params.set("mode", mode);
    params.set("from", from);

    if (studentKey) {
      params.set("student", studentKey);
    }

    return `case-validation.html?${params.toString()}`;
  }

  window.NurseTrackInstructorData = {
    students,
    defaultCiFullName: DEFAULT_CI_FULL_NAME,
    withCiCredentials,
    statusMeta,
    studentKeyFromName,
    buildCaseUrl,
    cases: {
      all: getAllCases,
      getById: getCaseById,
      getByStudent: getCasesByStudent,
      getGroupedByStudent: getCasesGroupedByStudent,
      getGroupedByStudentAndStatus: getCasesGroupedByStudentAndStatus,
      update: updateCase,
      statusMeta
    }
  };
})();