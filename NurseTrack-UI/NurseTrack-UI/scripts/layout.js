const roleTabs = document.querySelectorAll(".role-tab");
const navGroups = document.querySelectorAll("[data-nav]");
const workspaceKicker = document.querySelector("#workspace-kicker");
const heroTitle = document.querySelector("#hero-title");
const heroCopy = document.querySelector("#hero-copy");
const heroAction = document.querySelector("#hero-action");
const sidebarName = document.querySelector("#sidebar-name");
const sidebarRole = document.querySelector("#sidebar-role");
const activityTitle = document.querySelector("#activity-title");
const activityList = document.querySelector("#activity-list");
const topbarNotifications = document.querySelector("#topbar-notifications");
const topbarProfile = document.querySelector("#topbar-profile");
const menuButton = document.querySelector("[data-menu-button]");
const sidebarBackdrop = document.querySelector("[data-close-sidebar]");

const roleContent = {
  student: {
    kicker: "Student Workspace",
    name: "Maria Cruz",
    role: "Nursing Student",
    hero: "Good evening, Maria.",
    copy: "Your duty hours, case entries, and schedule updates are ready for review.",
    action: "Record duty hours",
    notifications: "nursing-student/notifications.html",
    profile: "nursing-student/view-profile.html",
    activity: "Recent updates",
    items: [
      ["Duty hour entry verified", "Medical ward shift marked as verified."],
      ["Case checklist submitted", "Maternal care checklist sent for instructor review."],
      ["Schedule updated", "Next duty area changed to Emergency Room."]
    ]
  },
  instructor: {
    kicker: "Instructor Workspace",
    name: "Prof. Reyes",
    role: "Clinical Instructor",
    hero: "Good evening, Reyes.",
    copy: "Clinical case submissions, student appeals, schedule updates, and progress summaries are ready for review.",
    action: "Review cases",
    notifications: "clinical-instructor/instructor-notifications.html",
    profile: "clinical-instructor/view-profile.html",
    activity: "Instructor queue",
    items: [
      ["5 duty entries need validation", "Review student time records before they appear in progress summaries."],
      ["3 case logs need comments", "Checklist submissions are waiting for approval or revision."],
      ["Student appeal received", "A late arrival appeal is ready for CI recommendation."]
    ]
  }
};

function setRole(role) {
  const content = roleContent[role];

  roleTabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.role === role);
  });

  navGroups.forEach((group) => {
    group.hidden = group.dataset.nav !== role;
  });

  workspaceKicker.textContent = content.kicker;
  sidebarName.textContent = content.name;
  sidebarRole.textContent = content.role;
  heroTitle.textContent = content.hero;
  heroCopy.textContent = content.copy;
  heroAction.textContent = content.action;
  topbarNotifications.href = content.notifications;
  topbarProfile.href = content.profile;
  activityTitle.textContent = content.activity;

  activityList.innerHTML = content.items.map(([title, copy]) => `
    <div class="activity-item">
      <span class="activity-marker"></span>
      <div>
        <strong>${title}</strong>
        <p>${copy}</p>
      </div>
    </div>
  `).join("");
}

roleTabs.forEach((tab) => {
  tab.addEventListener("click", () => setRole(tab.dataset.role));
});

menuButton.addEventListener("click", () => {
  document.body.classList.add("sidebar-open");
});

sidebarBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
});
