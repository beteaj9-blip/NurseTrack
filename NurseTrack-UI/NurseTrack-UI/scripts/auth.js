const loginForm = document.querySelector("#login-form");
const message = document.querySelector("#form-message");
const nextPageLinks = document.querySelectorAll("[data-next-page]");
const mockAccounts = [
  {
    role: "student",
    label: "Nursing Student",
    email: "maria.cruz@cit.edu",
    schoolId: "12-3456-789",
    password: "NurseTrack123",
    destination: "nursing-student/student-dashboard.html?login=student"
  },
  {
    role: "instructor",
    label: "Clinical Instructor",
    email: "reyes@cit.edu",
    schoolId: "CI-1002",
    password: "NurseTrack123",
    destination: "clinical-instructor/instructor-dashboard.html?login=instructor"
  },
  {
    role: "chair",
    label: "Chair",
    email: "chair.reyes@cit.edu",
    schoolId: "CH-1001",
    password: "NurseTrack123",
    destination: "admin-manager/admin-dashboard.html?login=chair"
  },
  {
    role: "admin",
    label: "Admin",
    email: "admin.santos@cit.edu",
    schoolId: "AD-1001",
    password: "NurseTrack123",
    destination: "admin/admin-dashboard.html?login=admin"
  },
  {
    role: "coordinator",
    label: "Coordinator",
    email: "coordinator.lim@cit.edu",
    schoolId: "CO-1001",
    password: "NurseTrack123",
    destination: "admin-manager/coordinator-dashboard.html?login=coordinator"
  },
  {
    role: "enrollment",
    label: "Enrollment Team",
    email: "enrollment.team@cit.edu",
    schoolId: "EN-1001",
    password: "NurseTrack123",
    destination: "admin-manager/chair-student-progress.html?login=enrollment"
  },
  {
    role: "assistant",
    label: "Assistant",
    email: "assistant.garcia@cit.edu",
    schoolId: "AS-1001",
    password: "NurseTrack123",
    destination: "admin-manager/assistant-dashboard.html?login=assistant"
  }
];

function setMessage(text, state) {
  message.textContent = text;
  message.classList.remove("is-error", "is-success");

  if (state) {
    message.classList.add(state);
  }
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const userId = String(formData.get("userId") || "").trim();
  const password = String(formData.get("password") || "");

  if (!userId || !password) {
    setMessage("Enter both school email or ID number and password to continue.", "is-error");
    return;
  }

  if (password.length < 8) {
    setMessage("Password must be at least 8 characters.", "is-error");
    return;
  }

  const normalizedUserId = userId.toLowerCase();
  const account = mockAccounts.find((item) => (
    normalizedUserId === item.email ||
    userId.toUpperCase() === item.schoolId.toUpperCase()
  ) && password === item.password);

  if (!account) {
    setMessage("Account not found. Use one of the mock NurseTrack accounts.", "is-error");
    return;
  }

  window.sessionStorage.setItem("nursetrackRole", account.role);
  setMessage(`Signed in successfully. Opening the ${account.label} workspace.`, "is-success");

  window.setTimeout(() => {
    window.location.href = account.destination;
  }, 500);
});

nextPageLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const nextPage = link.dataset.nextPage;
    setMessage(`${nextPage} is not active on this screen yet.`, "");
  });
});
