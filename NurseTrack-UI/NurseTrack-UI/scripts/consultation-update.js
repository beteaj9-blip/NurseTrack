(() => {
  const run = () => {
    const path = window.location.pathname.replace(/\\/g, "/").toLowerCase();
    const isAdmin = path.includes("/admin/");
    const isChair = path.includes("/admin-manager/");
    const isInstructor = path.includes("/clinical-instructor/");
    const isStudent = path.includes("/nursing-student/");
    const page = path.split("/").pop();
    const legacyAdminPages = new Set(["user-list-manage-users.html", "user-management.html", "role-assignment.html"]);
    const removedAdminFeaturePages = new Set(["role-assignment.html", "enrollment-archive.html"]);
    const ASSISTANT_ACCESS_KEYS = {
      manualBackup: "nursetrack-assistant-manual-backup-access",
      clearance: "nursetrack-assistant-clearance-access",
      clinicalCases: "nursetrack-assistant-clinical-cases-access",
      ciRecommendations: "nursetrack-assistant-ci-recommendations-access"
    };

    let signedRole = window.sessionStorage?.getItem("nursetrackRole") || "";
    if (!signedRole && isAdmin) {
      signedRole = "admin";
      window.sessionStorage?.setItem("nursetrackRole", signedRole);
    }

    const isSignedAdmin = signedRole === "admin";
    const isCoordinatorRole = signedRole === "coordinator";
    const isEnrollmentRole = signedRole === "enrollment";
    const isAssistantRole = signedRole === "assistant";
    const assistantAccessEnabled = (key) => window.localStorage?.getItem(ASSISTANT_ACCESS_KEYS[key]) === "true";
    const assistantCiRecommendationsEnabled = assistantAccessEnabled("ciRecommendations");
    const currentArea = isAdmin ? "admin" : isChair ? "admin-manager" : isInstructor ? "clinical-instructor" : isStudent ? "nursing-student" : "";
    const isAdminExperience = isAdmin || (isSignedAdmin && (isChair || isInstructor));

    const one = (selector) => document.querySelector(selector);
    const all = (selector) => Array.from(document.querySelectorAll(selector));

    const render = (markup) => {
      const template = document.createElement("template");
      template.innerHTML = markup.trim();
      return template.content.firstElementChild;
    };

    const hrefFor = (folder, file) => currentArea === folder ? file : `../${folder}/${file}`;

    const chairNavItems = [
      { label: "Dashboard", href: "admin-dashboard.html", pages: ["admin-dashboard.html"] },
      { label: "Schedules", href: "admin-schedules.html", pages: ["admin-schedules.html", "schedule-maker.html", "manual-schedule.html", "selected-schedule.html", "create-schedule.html", "edit-schedule.html", "assign-duty.html", "schedule-report.html"] },
      { label: "Live Attendance", href: "live-attendance-tracker.html", pages: ["live-attendance-tracker.html"] },
      { label: "Manual Backup", href: "manual-attendance-review.html", pages: ["manual-attendance-review.html"] },
      { label: "Student Progress", href: "chair-student-progress.html", pages: ["chair-student-progress.html", "student-progress-detail.html"] },
      { label: "Extension Days", href: "extension-days.html", pages: ["extension-days.html"] },
      { label: "Clearance", href: "student-clearance.html", pages: ["student-clearance.html", "student-clearance-detail.html"] },
      { label: "Clinical Cases View", href: "clinical-cases-view.html", pages: ["clinical-cases-view.html", "clinical-case-selection.html", "case-validation.html"] },
      { label: "CI Recommendations", href: "student-appeals.html", pages: ["student-appeals.html"] },
      { label: "Overtime Details", href: "overtime-details.html", pages: ["overtime-details.html", "overtime-rendered.html"] },
      { label: "Reports", href: "generate-report.html", pages: ["generate-report.html", "case-report.html", "duty-report.html", "export-page.html"] }
    ];

    const chairSchedulePages = ["admin-schedules.html", "schedule-maker.html", "manual-schedule.html", "selected-schedule.html", "create-schedule.html", "edit-schedule.html", "assign-duty.html", "schedule-report.html"];
    const chairLiveAttendancePages = ["live-attendance-tracker.html"];
    const chairManualAttendancePages = ["manual-attendance-review.html"];
    const chairStudentProgressPages = ["chair-student-progress.html", "student-progress-detail.html"];
    const chairClearancePages = ["student-clearance.html", "student-clearance-detail.html"];
    const chairClinicalCasePages = ["clinical-cases-view.html", "clinical-case-selection.html", "case-validation.html"];
    const chairRecommendationPages = ["student-appeals.html"];
    const chairExtensionPages = ["extension-days.html", "extension-day-detail.html"];
    const chairOvertimePages = ["overtime-details.html", "overtime-rendered.html"];
    const chairReportPages = ["generate-report.html", "case-report.html", "duty-report.html", "export-page.html"];
    const coordinatorDashboardPages = ["coordinator-dashboard.html"];
    const coordinatorAboutPages = ["coordinator-about.html"];
    const coordinatorSchedulePages = ["schedule-management.html", "assigned-roster.html"];
    const coordinatorChairPages = [
      "coordinator-dashboard.html",
      ...coordinatorAboutPages,
      ...chairSchedulePages,
      ...chairLiveAttendancePages,
      ...chairStudentProgressPages,
      ...chairExtensionPages,
      ...chairOvertimePages,
      ...chairReportPages,
      ...chairManualAttendancePages,
      ...chairClearancePages,
      ...chairClinicalCasePages,
      ...chairRecommendationPages
    ];
    const enrollmentPages = ["chair-student-progress.html", "student-progress-detail.html"];
    const enrollmentAboutPages = ["enrollment-about.html"];
    const assistantDashboardPages = ["assistant-dashboard.html"];
    const assistantAboutPages = ["assistant-about.html"];
    const assistantChairPages = [
      "assistant-dashboard.html",
      ...assistantAboutPages,
      ...chairSchedulePages,
      ...chairLiveAttendancePages,
      ...chairStudentProgressPages,
      ...chairOvertimePages,
      ...chairReportPages,
      ...chairManualAttendancePages,
      ...chairClearancePages,
      ...chairClinicalCasePages,
      ...chairRecommendationPages,
      ...chairExtensionPages
    ];
    const instructorSchedulePages = ["schedule-management.html", "assigned-roster.html", "create-schedule.html", "edit-schedule.html", "assign-duty.html"];
    const instructorLiveAttendancePages = ["live-attendance-tracker.html"];
    const instructorManualAttendancePages = ["manual-attendance.html"];
    const instructorClinicalCasePages = ["select-validation-user.html", "clinical-case-selection.html", "case-validation.html", "review-submissions.html", "validation-history.html"];
    const instructorStudentProgressPages = ["instructor-student-view.html", "student-progress-detail.html", "pending-requirements.html"];
    const instructorRecommendationPages = ["student-appeals.html"];
    const instructorExtensionPages = ["extension-days.html", "extension-day-detail.html"];
    const instructorReportPages = ["instructor-reports.html"];

    const adminNavItems = [
      { label: "Dashboard", folder: "admin", href: "admin-dashboard.html", pages: ["admin-dashboard.html", "admin-notifications.html", "view-profile.html", "edit-profile.html"] },
      { label: "Manage Users", folder: "admin", href: "manage-users.html", pages: ["manage-users.html"] },
      { label: "Assistant Access", folder: "admin", href: "assistant-access.html", pages: ["assistant-access.html"] },
      { label: "Section Import", folder: "admin", href: "section-import.html", pages: ["section-import.html"] },
      { label: "Hospitals / Duty Areas", folder: "admin", href: "hospital-duty-area.html", pages: ["hospital-duty-area.html"] },
      { label: "Schedules", folder: "admin-manager", href: "admin-schedules.html", pages: chairSchedulePages, activeAreas: [{ folder: "clinical-instructor", pages: instructorSchedulePages }] },
      { label: "Live Attendance", folder: "admin-manager", href: "live-attendance-tracker.html", pages: chairLiveAttendancePages, activeAreas: [{ folder: "clinical-instructor", pages: instructorLiveAttendancePages }] },
      { label: "Manual Backup", folder: "admin-manager", href: "manual-attendance-review.html", pages: chairManualAttendancePages, activeAreas: [{ folder: "clinical-instructor", pages: instructorManualAttendancePages }] },
      { label: "Student Progress", folder: "admin-manager", href: "chair-student-progress.html", pages: chairStudentProgressPages, activeAreas: [{ folder: "clinical-instructor", pages: instructorStudentProgressPages }] },
      { label: "Extension Days", folder: "admin-manager", href: "extension-days.html", pages: chairExtensionPages, activeAreas: [{ folder: "clinical-instructor", pages: instructorExtensionPages }] },
      { label: "Clearance", folder: "admin-manager", href: "student-clearance.html", pages: chairClearancePages },
      { label: "Clinical Cases", folder: "admin-manager", href: "clinical-cases-view.html", pages: chairClinicalCasePages, activeAreas: [{ folder: "clinical-instructor", pages: instructorClinicalCasePages }] },
      { label: "CI Recommendations", folder: "admin-manager", href: "student-appeals.html", pages: chairRecommendationPages, activeAreas: [{ folder: "clinical-instructor", pages: instructorRecommendationPages }] },
      { label: "Overtime Details", folder: "admin-manager", href: "overtime-details.html", pages: chairOvertimePages },
      { label: "Reports", folder: "admin-manager", href: "generate-report.html", pages: chairReportPages, activeAreas: [{ folder: "clinical-instructor", pages: instructorReportPages }] },
      { label: "Audit Logs", folder: "admin", href: "audit-logs.html", pages: ["audit-logs.html"] }
    ];

    const coordinatorNavItems = [
      { label: "Dashboard", folder: "admin-manager", href: "coordinator-dashboard.html", pages: coordinatorDashboardPages },
      { label: "Schedules", folder: "admin-manager", href: "admin-schedules.html", pages: chairSchedulePages },
      { label: "Live Attendance", folder: "admin-manager", href: "live-attendance-tracker.html", pages: chairLiveAttendancePages },
      { label: "Student Progress", folder: "admin-manager", href: "chair-student-progress.html", pages: chairStudentProgressPages },
      { label: "Extension Days", folder: "admin-manager", href: "extension-days.html", pages: chairExtensionPages },
      { label: "Manual Backup", folder: "admin-manager", href: "manual-attendance-review.html", pages: chairManualAttendancePages },
      { label: "Clearance", folder: "admin-manager", href: "student-clearance.html", pages: chairClearancePages },
      { label: "Clinical Cases View", folder: "admin-manager", href: "clinical-cases-view.html", pages: chairClinicalCasePages },
      { label: "CI Recommendations", folder: "admin-manager", href: "student-appeals.html", pages: chairRecommendationPages },
      { label: "Overtime Details", folder: "admin-manager", href: "overtime-details.html", pages: chairOvertimePages },
      { label: "Reports", folder: "admin-manager", href: "generate-report.html", pages: chairReportPages }
    ];

    const enrollmentNavItems = [
      { label: "Student Progress", folder: "admin-manager", href: "chair-student-progress.html", pages: enrollmentPages }
    ];

    const assistantNavItems = [
      { label: "Dashboard", folder: "admin-manager", href: "assistant-dashboard.html", pages: assistantDashboardPages },
      { label: "Schedules", folder: "admin-manager", href: "admin-schedules.html", pages: chairSchedulePages },
      { label: "Live Attendance", folder: "admin-manager", href: "live-attendance-tracker.html", pages: chairLiveAttendancePages },
      { label: "Student Progress", folder: "admin-manager", href: "chair-student-progress.html", pages: chairStudentProgressPages },
      { label: "Extension Days", folder: "admin-manager", href: "extension-days.html", pages: chairExtensionPages },
      { label: "Manual Backup", folder: "admin-manager", href: "manual-attendance-review.html", pages: chairManualAttendancePages },
      { label: "Clearance", folder: "admin-manager", href: "student-clearance.html", pages: chairClearancePages },
      { label: "Clinical Cases View", folder: "admin-manager", href: "clinical-cases-view.html", pages: chairClinicalCasePages },
      { label: "CI Recommendations", folder: "admin-manager", href: "student-appeals.html", pages: chairRecommendationPages },
      { label: "Overtime Details", folder: "admin-manager", href: "overtime-details.html", pages: chairOvertimePages },
      { label: "Reports", folder: "admin-manager", href: "generate-report.html", pages: chairReportPages }
    ];

    const adminAllowedChairPages = new Set([
      ...chairSchedulePages,
      ...chairLiveAttendancePages,
      ...chairManualAttendancePages,
      ...chairStudentProgressPages,
      ...chairExtensionPages,
      ...chairClearancePages,
      ...chairClinicalCasePages,
      ...chairRecommendationPages,
      ...chairOvertimePages,
      ...chairReportPages
    ]);
    const adminAllowedInstructorPages = new Set([
      ...instructorSchedulePages,
      ...instructorLiveAttendancePages,
      ...instructorManualAttendancePages,
      ...instructorClinicalCasePages,
      ...instructorStudentProgressPages,
      ...instructorRecommendationPages,
      ...instructorExtensionPages,
      ...instructorReportPages
    ]);
    const coordinatorAllowedChairPages = new Set(coordinatorChairPages);
    const coordinatorAllowedInstructorPages = new Set([]);
    const enrollmentAllowedChairPages = new Set([...enrollmentPages, ...enrollmentAboutPages, ...chairExtensionPages]);
    const assistantAllowedChairPages = new Set(assistantChairPages);

    const isAllowedOperationalRoute = () => {
      if (isSignedAdmin) {
        return (isChair && adminAllowedChairPages.has(page)) || (isInstructor && adminAllowedInstructorPages.has(page));
      }

      if (isCoordinatorRole) {
        return (isChair && coordinatorAllowedChairPages.has(page)) || (isInstructor && coordinatorAllowedInstructorPages.has(page));
      }

      if (isEnrollmentRole) {
        return isChair && enrollmentAllowedChairPages.has(page);
      }

      if (isAssistantRole) {
        return isChair && assistantAllowedChairPages.has(page);
      }

      return false;
    };

    const instructorNavItems = [
      { label: "Dashboard", href: "instructor-dashboard.html", pages: ["instructor-dashboard.html"] },
      { label: "Assigned Schedules", href: "schedule-management.html", pages: ["schedule-management.html", "assigned-roster.html", "create-schedule.html", "edit-schedule.html", "assign-duty.html"] },
      { label: "Live Attendance", href: "live-attendance-tracker.html", pages: ["live-attendance-tracker.html"] },
      { label: "Manual Backup", href: "manual-attendance.html", pages: ["manual-attendance.html"] },
      { label: "Clinical Cases Review", href: "select-validation-user.html", pages: ["select-validation-user.html", "clinical-case-selection.html", "case-validation.html", "validation-history.html"] },
      { label: "Student Progress", href: "instructor-student-view.html", pages: ["instructor-student-view.html", "student-progress-detail.html", "pending-requirements.html"] },
      { label: "Extension Days", href: "extension-days.html", pages: instructorExtensionPages },
      { label: "Student Appeals", href: "student-appeals.html", pages: ["student-appeals.html"] },
      { label: "Reports", href: "instructor-reports.html", pages: ["instructor-reports.html"] }
    ];

    const studentNavItems = [
      { label: "Dashboard", href: "student-dashboard.html", pages: ["student-dashboard.html"] },
      { label: "Clinical Cases", href: "case-history.html", pages: ["case-history.html", "case-detail.html", "add-clinical-case.html", "edit-case.html", "checklist-form.html"] },
      { label: "Assigned Schedules", href: "view-schedule.html", pages: ["view-schedule.html", "assigned-roster.html", "schedule-details.html"] },
      { label: "Progress", href: "student-progress.html", pages: ["student-progress.html", "student-pending-items.html"] },
      { label: "Student Appeals", href: "student-appeals.html", pages: ["student-appeals.html"] },
      { label: "Reports", href: "student-reports.html", pages: ["student-reports.html"] }
    ];

    const renderSidebarNav = (items) => {
      const nav = one(".sidebar-nav");

      if (!nav) {
        return;
      }

      nav.innerHTML = items.map((item) => {
        const isActive = (
          ((!item.folder || item.folder === currentArea) && item.pages.includes(page)) ||
          item.activeAreas?.some((area) => area.folder === currentArea && area.pages.includes(page))
        );
        const ariaCurrent = isActive ? ' aria-current="page"' : "";
        const href = item.folder ? hrefFor(item.folder, item.href) : item.href;
        return `<a class="nav-link${isActive ? " is-active" : ""}" href="${href}"${ariaCurrent}><span class="nav-dot"></span>${item.label}</a>`;
      }).join("");

      window.NurseTrackSidebarIcons?.refresh?.();
    };

    const applyAdminIdentity = () => {
      setText(".role-chip", "Admin");
      setText(".topbar-title p", "Admin Workspace");
      setText(".sidebar-account strong", "Admin Santos");
      setText(".sidebar-account span", "System Admin");

      const avatar = one(".sidebar-account .avatar");
      if (avatar) {
        avatar.textContent = "AS";
      }

      const notificationLink = one(".notification-button");
      if (notificationLink) {
        notificationLink.setAttribute("href", hrefFor("admin", "admin-notifications.html"));
      }

      const brandLink = one(".sidebar-brand");
      if (brandLink?.tagName.toLowerCase() === "a") {
        brandLink.setAttribute("href", hrefFor("admin", "about.html"));
      }

      all(".topbar-profile-button").forEach((button) => button.remove());
      renderSidebarNav(adminNavItems);

      if (!isAdmin) {
        const pageTitle = one(".topbar-title h1")?.textContent.trim();
        document.title = `NurseTrack | ${pageTitle || "Admin Workspace"}`;
      }
    };

    const applyScopedIdentity = ({ roleChip, topbar, accountName, accountRole, avatarText, navItems }) => {
      setText(".role-chip", roleChip);
      setText(".topbar-title p", topbar);
      setText(".sidebar-account strong", accountName);
      setText(".sidebar-account span", accountRole);

      const avatar = one(".sidebar-account .avatar");
      if (avatar) {
        avatar.textContent = avatarText;
      }

      all(".notification-button").forEach((button) => button.remove());
      all(".topbar-profile-button").forEach((button) => button.remove());
      renderSidebarNav(navItems);

      const pageTitle = one(".topbar-title h1")?.textContent.trim();
      document.title = `NurseTrack | ${pageTitle || roleChip}`;
    };

    const applyCoordinatorIdentity = () => applyScopedIdentity({
      roleChip: "Coordinator",
      topbar: "Coordinator Workspace",
      accountName: "Coordinator Lim",
      accountRole: "Coordinator",
      avatarText: "CL",
      navItems: coordinatorNavItems
    });

    const applyEnrollmentIdentity = () => applyScopedIdentity({
      roleChip: "Enrollment Team",
      topbar: "Enrollment Workspace",
      accountName: "Enrollment Team",
      accountRole: "Student Progress",
      avatarText: "ET",
      navItems: enrollmentNavItems
    });

    const applyAssistantIdentity = () => applyScopedIdentity({
      roleChip: "Assistant",
      topbar: "Assistant Workspace",
      accountName: "Assistant Garcia",
      accountRole: "Assistant",
      avatarText: "AG",
      navItems: assistantNavItems
    });

    const replaceMainWithNotice = ({ kicker, title, copy, actionHref, actionLabel }) => {
      const main = one("main.workspace");

      if (!main) {
        return;
      }

      main.className = "workspace dashboard-workspace route-guard-workspace";
      main.innerHTML = `
        <section class="workspace-hero dashboard-hero">
          <div>
            <p class="section-kicker">${kicker}</p>
            <h2>${title}</h2>
            <p>${copy}</p>
          </div>
          <a class="primary-button workspace-action button-link" href="${actionHref}">${actionLabel}</a>
        </section>
      `;
    };

    const enforceRoleOwnership = () => {
      const routeRole = [...coordinatorDashboardPages, ...coordinatorAboutPages].includes(page) ? "coordinator" :
        [...assistantDashboardPages, ...assistantAboutPages].includes(page) ? "assistant" :
          enrollmentAboutPages.includes(page) ? "enrollment" :
          isAdmin ? "admin" : isChair && legacyAdminPages.has(page) ? "admin" : isChair ? "chair" : isInstructor ? "instructor" : isStudent ? "student" : "";

      if (!signedRole || !routeRole || signedRole === routeRole || isAllowedOperationalRoute()) {
        return false;
      }

      const roleLabels = {
        admin: "Admin",
        chair: "Chair",
        instructor: "Clinical Instructor",
        student: "Nursing Student",
        coordinator: "Coordinator",
        enrollment: "Enrollment Team",
        assistant: "Assistant"
      };
      const homeLinks = {
        admin: ["../admin/admin-dashboard.html", "Open Admin Dashboard"],
        chair: ["../admin-manager/admin-dashboard.html", "Open Chair Dashboard"],
        instructor: ["../clinical-instructor/instructor-dashboard.html", "Open CI Dashboard"],
        student: ["../nursing-student/student-dashboard.html", "Open Student Dashboard"],
        coordinator: ["../admin-manager/coordinator-dashboard.html", "Open Coordinator Dashboard"],
        enrollment: ["../admin-manager/chair-student-progress.html", "Open Student Progress"],
        assistant: ["../admin-manager/assistant-dashboard.html", "Open Assistant Dashboard"]
      };
      const [actionHref, actionLabel] = homeLinks[signedRole] || ["../index.html", "Return to login"];

      if (isSignedAdmin) {
        applyAdminIdentity();
      } else if (isCoordinatorRole) {
        applyCoordinatorIdentity();
      } else if (isEnrollmentRole) {
        applyEnrollmentIdentity();
      } else if (isAssistantRole) {
        applyAssistantIdentity();
      }

      setText(".topbar-title h1", "Access limited");
      document.title = "NurseTrack | Access Limited";
      replaceMainWithNotice({
        kicker: "Role Guard",
        title: `${roleLabels[routeRole]} access is required for this page.`,
        copy: `You are signed in as ${roleLabels[signedRole] || signedRole}. This page is owned by the ${roleLabels[routeRole]} role.`,
        actionHref,
        actionLabel
      });

      return true;
    };

    const enhanceRoleSidebars = () => {
      if (isAdminExperience) {
        applyAdminIdentity();
        return;
      }

      if (isCoordinatorRole) {
        applyCoordinatorIdentity();
        return;
      }

      if (isEnrollmentRole) {
        applyEnrollmentIdentity();
        return;
      }

      if (isAssistantRole) {
        applyAssistantIdentity();
        return;
      }

      if (isChair) {
        renderSidebarNav(chairNavItems);
        return;
      }

      if (isInstructor) {
        renderSidebarNav(instructorNavItems);
      }

      if (isStudent) {
        setText(".role-chip", "Nursing Student");
        setText(".sidebar-account strong", "Maria Cruz");
        setText(".sidebar-account span", "BSN 3A");
        const avatar = one(".sidebar-account .avatar");
        if (avatar) {
          avatar.textContent = "MC";
        }
        renderSidebarNav(studentNavItems);
      }
    };

    const enhanceLegacyAdminRouteNotice = () => {
      if (!isChair || !legacyAdminPages.has(page)) {
        return false;
      }

      setText(".topbar-title p", "Chair Workspace");
      setText(".topbar-title h1", "Admin-only module moved");
      replaceMainWithNotice({
        kicker: "Admin-owned Route",
        title: "This account-management page was removed from the workflow.",
        copy: "Admin now only handles semester section imports, hospital and duty area setup, and audit visibility.",
        actionHref: "../admin/section-import.html",
        actionLabel: "Open Section Import"
      });

      return true;
    };

    const enhanceRemovedAdminFeatureNotice = () => {
      if (!isAdmin || !removedAdminFeaturePages.has(page)) {
        return false;
      }

      const isRoleAssignment = page === "role-assignment.html";

      setText(".topbar-title p", "Admin Workspace");
      setText(".topbar-title h1", isRoleAssignment ? "Manage Users" : "Section Import");
      replaceMainWithNotice({
        kicker: "Admin Setup",
        title: "This Admin feature has been removed.",
        copy: isRoleAssignment
          ? "Use Manage Users to review accounts, edit user details, and update account status. Separate role assignment is no longer part of the Admin side."
          : "Use Section Import to upload the new semester Excel file and automatically assign student sections. Enrollment archive is no longer part of the Admin side.",
        actionHref: isRoleAssignment ? "manage-users.html" : "section-import.html",
        actionLabel: isRoleAssignment ? "Open Manage Users" : "Open Section Import"
      });

      return true;
    };

    const enhanceEnrollmentProgressView = () => {
      if (!isEnrollmentRole || !isChair || !enrollmentAllowedChairPages.has(page)) {
        return;
      }

      setText(".topbar-title h1", "Student Progress");

      if (page === "student-progress-detail.html" && !one("[data-enrollment-clearance-note]")) {
        const progressStatus = one("#progress-status");
        const isCleared = progressStatus && ["On track", "Completed"].includes(progressStatus.textContent.trim());
        progressStatus?.insertAdjacentHTML(
          "afterend",
          `<span class="status-badge ${isCleared ? "status-verified" : "status-rejected"}" data-enrollment-clearance-note>${isCleared ? "Cleared" : "Not cleared"}</span>`
        );
      }
    };

    const enhanceAdminApprovedAppeals = () => {
      if (!isAdminExperience || page !== "student-appeals.html") {
        return;
      }

      const approvedAppeals = [
        {
          id: "appeal-janine-emergency",
          student: "Janine Aquino",
          initials: "JA",
          section: "BSN 3C",
          studentId: "22-6102-719",
          site: "VSMMC",
          dutyDate: "April 25, 2026",
          approvedAt: "April 26, 2026, 8:30 AM",
          type: "Attendance",
          title: "Family emergency arrival adjustment",
          reason: "Student requested attendance consideration after notifying the CI before shift start.",
          ciNote: "CI call log and endorsed arrival record were reviewed before approval.",
          result: "Arrival adjustment approved and reflected in attendance monitoring."
        },
        {
          id: "appeal-zander-weather",
          student: "Zander Aligato",
          initials: "ZA",
          section: "BSN 3B",
          studentId: "21-7740-118",
          site: "CCMC",
          dutyDate: "April 27, 2026",
          approvedAt: "April 28, 2026, 10:15 AM",
          type: "Attendance",
          title: "Late clock-in during heavy rain advisory",
          reason: "Student arrived late after road closures delayed public transport from Talamban.",
          ciNote: "Barangay traffic advisory and CI arrival note supported the appeal.",
          result: "Late clock-in was accepted with approved appeal documentation."
        },
        {
          id: "appeal-maria-bus-late",
          student: "Maria Cruz",
          initials: "MC",
          section: "BSN 3A",
          studentId: "12-3456-789",
          site: "CCMC",
          dutyDate: "April 29, 2026",
          approvedAt: "April 29, 2026, 2:45 PM",
          type: "Attendance",
          title: "Late arrival due to bus delay",
          reason: "CIT-U shuttle was delayed after traffic rerouting near the hospital entrance.",
          ciNote: "Transport advisory and arrival photo timestamp were attached.",
          result: "Attendance consideration approved for the affected duty day."
        },
        {
          id: "appeal-nicole-case",
          student: "Nicole Dela Pena",
          initials: "ND",
          section: "BSN 3A",
          studentId: "23-1023-441",
          site: "CCMC",
          dutyDate: "April 26, 2026",
          approvedAt: "April 27, 2026, 9:05 AM",
          type: "Clinical case",
          title: "Returned case clarification",
          reason: "Student contested the returned medication administration case and added missing checklist context.",
          ciNote: "Revised procedure note and medication safety checklist were reviewed.",
          result: "Clinical case appeal approved for final validation review."
        }
      ];

      if (!one("[data-admin-approved-appeals-style]")) {
        const style = document.createElement("style");
        style.dataset.adminApprovedAppealsStyle = "true";
        style.textContent = `
          .admin-approved-appeals-workspace {
            gap: 1rem;
          }

          .admin-approved-appeals-panel {
            display: grid;
            grid-template-columns: minmax(300px, 0.9fr) minmax(0, 1.3fr);
            gap: 1rem;
          }

          .admin-approved-appeals-list,
          .admin-approved-appeal-detail {
            min-width: 0;
          }

          .approved-appeal-list {
            display: grid;
            gap: 0.75rem;
          }

          .approved-appeal-item {
            width: 100%;
            display: grid;
            grid-template-columns: 44px minmax(0, 1fr) auto;
            align-items: center;
            gap: 0.85rem;
            padding: 0.9rem;
            border: 1px solid #dbe3ee;
            border-radius: 8px;
            background: #ffffff;
            color: #111827;
            text-align: left;
            cursor: pointer;
          }

          .approved-appeal-item:hover,
          .approved-appeal-item:focus-visible,
          .approved-appeal-item.is-active {
            border-color: rgba(138, 37, 44, 0.42);
            background: #fff7d6;
          }

          .approved-appeal-item strong,
          .admin-approved-appeal-detail strong {
            color: #111827;
          }

          .approved-appeal-item small {
            display: block;
            margin-top: 0.2rem;
            color: #667085;
            font-weight: 800;
            overflow-wrap: anywhere;
          }

          .approved-appeal-detail-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 1rem;
            margin-bottom: 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e5eaf1;
          }

          .approved-appeal-detail-title {
            display: flex;
            align-items: center;
            gap: 0.85rem;
            min-width: 0;
          }

          .approved-appeal-detail-title h3 {
            margin: 0.15rem 0 0;
            color: #111827;
            font-size: 1.28rem;
            line-height: 1.2;
          }

          .approved-appeal-facts,
          .approved-appeal-notes {
            display: grid;
            gap: 0.75rem;
          }

          .approved-appeal-facts {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            margin-bottom: 1rem;
          }

          .approved-appeal-fact,
          .approved-appeal-note {
            min-width: 0;
            padding: 0.9rem;
            border: 1px solid #e5eaf1;
            border-radius: 8px;
            background: #f8fafc;
          }

          .approved-appeal-fact span,
          .approved-appeal-note span {
            display: block;
            margin-bottom: 0.35rem;
            color: #667085;
            font-size: 0.76rem;
            font-weight: 900;
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }

          .approved-appeal-note p {
            margin: 0;
            color: #334155;
            font-weight: 750;
            line-height: 1.55;
          }

          @media (max-width: 900px) {
            .admin-approved-appeals-panel,
            .approved-appeal-facts {
              grid-template-columns: 1fr;
            }
          }
        `;
        document.head.appendChild(style);
      }

      setText(".topbar-title p", "Admin Workspace");
      setText(".topbar-title h1", "Approved Appeals");
      setText("#appeal-sync-pill", `${approvedAppeals.length} approved`);
      document.title = "NurseTrack | Approved Appeals";

      const main = one("main.workspace");
      if (!main) {
        return;
      }

      main.className = "workspace admin-approved-appeals-workspace";
      main.innerHTML = `
        <section class="admin-approved-appeals-panel">
          <article class="workspace-panel admin-approved-appeals-list">
            <div class="panel-heading">
              <div>
                <p class="section-kicker">Approved Appeals</p>
                <h2>Approved Appeal List</h2>
              </div>
              <span class="status-badge status-verified">${approvedAppeals.length} approved</span>
            </div>

            <div class="approved-appeal-list" id="admin-approved-appeal-list">
              ${approvedAppeals.map((appeal, index) => `
                <button class="approved-appeal-item${index === 0 ? " is-active" : ""}" type="button" data-approved-appeal="${appeal.id}">
                  <span class="avatar small-avatar">${appeal.initials}</span>
                  <span>
                    <strong>${appeal.student}</strong>
                    <small>${appeal.type} - ${appeal.section} - ${appeal.dutyDate}</small>
                  </span>
                  <mark class="status-badge status-verified">Approved</mark>
                </button>
              `).join("")}
            </div>
          </article>

          <article class="workspace-panel admin-approved-appeal-detail" id="admin-approved-appeal-detail"></article>
        </section>
      `;

      const detail = one("#admin-approved-appeal-detail");
      const renderDetail = (appeal) => {
        if (!detail) {
          return;
        }

        detail.innerHTML = `
          <div class="approved-appeal-detail-header">
            <div class="approved-appeal-detail-title">
              <span class="avatar">${appeal.initials}</span>
              <div>
                <h3>${appeal.title}</h3>
              </div>
            </div>
            <span class="status-badge status-verified">Approved</span>
          </div>

          <div class="approved-appeal-facts">
            <div class="approved-appeal-fact">
              <span>Student</span>
              <strong>${appeal.student}</strong>
              <p>${appeal.studentId} - ${appeal.section}</p>
            </div>
            <div class="approved-appeal-fact">
              <span>Duty</span>
              <strong>${appeal.dutyDate}</strong>
              <p>${appeal.site}</p>
            </div>
            <div class="approved-appeal-fact">
              <span>Approved</span>
              <strong>${appeal.approvedAt}</strong>
              <p>Final admin view</p>
            </div>
          </div>

          <div class="approved-appeal-notes">
            <div class="approved-appeal-note">
              <span>Student Reason</span>
              <p>${appeal.reason}</p>
            </div>
            <div class="approved-appeal-note">
              <span>CI Recommendation Detail</span>
              <p>${appeal.ciNote}</p>
            </div>
            <div class="approved-appeal-note">
              <span>Approved Result</span>
              <p>${appeal.result}</p>
            </div>
          </div>
        `;
      };

      renderDetail(approvedAppeals[0]);

      one("#admin-approved-appeal-list")?.addEventListener("click", (event) => {
        const button = event.target.closest("[data-approved-appeal]");
        if (!button) {
          return;
        }

        all("[data-approved-appeal]").forEach((item) => {
          item.classList.toggle("is-active", item === button);
        });

        const appeal = approvedAppeals.find((item) => item.id === button.dataset.approvedAppeal);
        if (appeal) {
          renderDetail(appeal);
        }
      });
    };

    const enhanceCiRecommendationsFlow = () => {
      if (page !== "student-appeals.html" || !(isChair || isInstructor || isAdminExperience)) {
        return;
      }

      const students = [
        {
          slug: "maria-cruz",
          name: "Maria Cruz",
          initials: "MC",
          id: "12-3456-789",
          section: "BSN 3A",
          area: "Emergency Room",
          status: "Pending review",
          badge: "status-pending",
          appeals: [
            {
              type: "Attendance",
              title: "Late arrival due to bus delay",
              dutyDate: "April 29, 2026",
              site: "CCMC",
              submitted: "Today, 7:48 AM",
              reason: "CIT-U shuttle was delayed after traffic rerouting near the hospital entrance.",
              files: ["transport-advisory.pdf", "arrival-photo.jpg"],
              recommendation: "CI recommends accepting the appeal because transport evidence and arrival timestamp were attached."
            }
          ],
          history: [
            {
              type: "Attendance",
              title: "Excused tardiness request",
              dutyDate: "April 12, 2026",
              site: "CCMC",
              submitted: "April 12, 2026, 8:04 AM",
              status: "accepted",
              reason: "Student submitted a transport delay notice before the duty shift ended.",
              files: ["delay-notice.pdf"],
              recommendation: "Acceptance recommended after verifying the timestamped notice."
            }
          ]
        },
        {
          slug: "treasure-abadinas",
          name: "Treasure Abadinas",
          initials: "TA",
          id: "22-1845-103",
          section: "BSN 3A",
          area: "Delivery Room",
          status: "Pending review",
          badge: "status-pending",
          appeals: [
            {
              type: "Schedule",
              title: "Schedule conflict with reassigned duty area",
              dutyDate: "April 28, 2026",
              site: "CCMC",
              submitted: "Today, 9:12 AM",
              reason: "Student was moved from Emergency Room to Delivery Room after the printed roster was shared.",
              recommendation: "CI recommends accepting the appeal based on the updated duty roster screenshot."
            },
            {
              type: "Attendance",
              title: "Manual scan review after area transfer",
              dutyDate: "April 30, 2026",
              site: "CCMC",
              submitted: "Today, 10:35 AM",
              reason: "Student requested review after the scanner was unavailable during transfer from ER to DR.",
              recommendation: "CI recommends accepting the appeal after confirming the area transfer with the duty roster."
            }
          ],
          history: [
            {
              type: "Schedule",
              title: "Shift swap documentation",
              dutyDate: "April 18, 2026",
              site: "CCMC",
              submitted: "April 18, 2026, 6:30 PM",
              status: "accepted",
              reason: "Student requested validation of an approved shift swap after the roster was updated.",
              recommendation: "Acceptance recommended because the swap was endorsed before the shift."
            },
            {
              type: "Attendance",
              title: "Missed first scan correction",
              dutyDate: "April 10, 2026",
              site: "CCMC",
              submitted: "April 10, 2026, 7:15 AM",
              status: "rejected",
              reason: "Student asked to correct a missed first scan without supporting duty area confirmation.",
              recommendation: "Rejection recommended because the arrival could not be verified."
            }
          ]
        },
        {
          slug: "zander-aligato",
          name: "Zander Aligato",
          initials: "ZA",
          id: "21-7740-118",
          section: "BSN 3B",
          area: "Emergency Room",
          status: "Recommended",
          badge: "status-pending",
          appeals: [
            {
              type: "Attendance",
              title: "Late clock-in during heavy rain advisory",
              dutyDate: "April 27, 2026",
              site: "CCMC",
              submitted: "Yesterday, 5:20 PM",
              reason: "Student arrived late after road closures delayed public transport from Talamban.",
              recommendation: "CI recommends accepting the appeal with the barangay advisory and CI arrival note."
            }
          ],
          history: [
            {
              type: "Attendance",
              title: "Prior road closure adjustment",
              dutyDate: "April 15, 2026",
              site: "CCMC",
              submitted: "April 15, 2026, 7:44 AM",
              status: "accepted",
              reason: "Student submitted a city traffic advisory for delayed public transport.",
              recommendation: "Acceptance recommended after matching the advisory with the duty time."
            }
          ]
        },
        {
          slug: "nicole-dela-pena",
          name: "Nicole Dela Pena",
          initials: "ND",
          id: "23-1023-441",
          section: "BSN 3A",
          area: "Medical Ward",
          status: "Pending review",
          badge: "status-pending",
          appeals: [
            {
              type: "Clinical case",
              title: "Returned case clarification",
              dutyDate: "April 26, 2026",
              site: "CCMC",
              submitted: "April 26, 2026, 6:18 PM",
              reason: "Student contested the returned medication administration case and added missing checklist context.",
              recommendation: "CI recommends accepting the clarification after reviewing the revised procedure note."
            }
          ],
          history: [
            {
              type: "Clinical case",
              title: "Medication checklist clarification",
              dutyDate: "April 17, 2026",
              site: "CCMC",
              submitted: "April 17, 2026, 5:52 PM",
              status: "accepted",
              reason: "Student clarified missing checklist context after CI returned the clinical case.",
              recommendation: "Acceptance recommended after the revised checklist was attached."
            }
          ]
        },
        {
          slug: "janine-aquino",
          name: "Janine Aquino",
          initials: "JA",
          id: "22-6102-719",
          section: "BSN 3C",
          area: "Delivery Room",
          status: "Accepted",
          badge: "status-verified",
          appeals: [
            {
              type: "Attendance",
              title: "Family emergency arrival adjustment",
              dutyDate: "April 25, 2026",
              site: "VSMMC",
              submitted: "April 25, 2026, 4:42 PM",
              reason: "Student requested attendance consideration after notifying the CI before shift start.",
              recommendation: "CI recommends acceptance because the call log and endorsed arrival record were verified."
            }
          ],
          history: [
            {
              type: "Attendance",
              title: "Clinic arrival correction",
              dutyDate: "April 14, 2026",
              site: "VSMMC",
              submitted: "April 14, 2026, 8:20 AM",
              status: "accepted",
              reason: "Student requested correction after the CI confirmed a scanner sync delay.",
              recommendation: "Acceptance recommended because the ward log matched the arrival time."
            }
          ]
        }
      ];

      const selectedSlug = new URLSearchParams(window.location.search).get("student") || "";
      const selectedHistoryParam = new URLSearchParams(window.location.search).get("history");
      const selectedHistoryIndex = selectedHistoryParam === null ? NaN : Number(selectedHistoryParam);
      const selectedStudent = students.find((student) => student.slug === selectedSlug);
      const title = isInstructor && !isAdminExperience ? "Student Appeals" : "CI Recommendations";
      const storageKey = "nursetrack-ci-recommendation-decisions";

      const decisionMap = (() => {
        try {
          return JSON.parse(window.localStorage.getItem(storageKey) || "{}");
        } catch (error) {
          return {};
        }
      })();

      const storedDecisionFor = (id, fallback = "") => (
        Object.prototype.hasOwnProperty.call(decisionMap, id)
          ? (decisionMap[id] === "pending" ? "" : decisionMap[id])
          : fallback
      );

      const decisionFor = (student, index) => storedDecisionFor(
        `${student.slug}-${index}`,
        student.status === "Accepted" ? "accepted" : student.status === "Rejected" ? "rejected" : ""
      );

      const decisionLabel = (decision, pendingLabel = "Pending") => (
        decision === "accepted" ? "Accepted" : decision === "rejected" ? "Rejected" : pendingLabel
      );
      const decisionBadge = (decision) => decision === "accepted" ? "status-verified" : decision === "rejected" ? "status-rejected" : "status-pending";
      const possessiveName = (name) => `${name}${/s$/i.test(name) ? "'" : "'s"}`;
      const appealArea = (student, appeal) => appeal.area || student.area || "Assigned duty area";
      const appealAssignedCi = (appeal) => appeal.assignedCi || "Patricia Reyes, RN, MAN";
      const appealEvidence = (appeal) => appeal.evidence || appeal.supportingNote || {
        Attendance: "Transport advisory, timestamped arrival note, or CI attendance record attached.",
        Schedule: "Updated duty roster screenshot or endorsed schedule change attached.",
        "Clinical case": "Revised procedure note, checklist context, or case documentation attached."
      }[appeal.type] || "Supporting note is recorded with the submitted appeal.";
      const renderAppealMeta = (appeal) => `
        <div class="ci-recommendation-meta">
          <small>Submitted ${appeal.submitted}</small>
          <small>Assigned CI: ${appealAssignedCi(appeal)}</small>
        </div>
      `;
      const renderAppealFacts = (student, appeal) => `
        <div class="ci-recommendation-facts">
          <div class="ci-recommendation-box">
            <span>Appeal Type</span>
            <strong>${appeal.type}</strong>
          </div>
          <div class="ci-recommendation-box">
            <span>Related Duty Date</span>
            <strong>${appeal.dutyDate}</strong>
          </div>
          <div class="ci-recommendation-box">
            <span>Clinical Site</span>
            <strong>${appeal.site}</strong>
          </div>
          <div class="ci-recommendation-box">
            <span>Duty Area</span>
            <strong>${appealArea(student, appeal)}</strong>
          </div>
        </div>
      `;
      const renderAppealNotes = (appeal) => {
        const showRecommendationNote = !(isInstructor && !isAdminExperience);

        return `
          <div class="ci-recommendation-notes">
          <div class="ci-recommendation-box">
            <span>Student Reason</span>
            <p>${appeal.reason}</p>
          </div>
          <div class="ci-recommendation-box">
            <span>Supporting Evidence or Notes</span>
            <p>${appealEvidence(appeal)}</p>
          </div>
          <div class="ci-recommendation-box">
            <span>Supporting Files</span>
            <p>${appeal.files?.length ? appeal.files.join(", ") : "No files attached."}</p>
          </div>
          ${showRecommendationNote ? `
            <div class="ci-recommendation-box">
              <span>CI Recommendation</span>
              <p>${appeal.recommendation}</p>
            </div>
          ` : ""}
        </div>
        `;
      };

      if (!one("[data-ci-recommendations-style]")) {
        const style = document.createElement("style");
        style.dataset.ciRecommendationsStyle = "true";
        style.textContent = `
          .student-progress-pick-list {
            display: flex;
            flex-direction: column;
            gap: 0;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            overflow: hidden;
            background: #ffffff;
          }

          .student-progress-pick-card {
            display: flex;
            align-items: center;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #e2e8f0;
            border-radius: 0;
            box-shadow: none;
            text-decoration: none;
            color: inherit;
            transition: background-color 0.2s;
          }

          .student-progress-pick-card:hover,
          .student-progress-pick-card:focus-visible {
            background-color: #f8fafc;
          }

          .student-progress-pick-card:last-child {
            border-bottom: none;
          }

          .student-progress-pick-card > span:nth-child(2) {
            flex: 1;
            margin-left: 1.25rem;
            display: flex;
            flex-direction: column;
            gap: 0.125rem;
            min-width: 0;
          }

          .student-progress-pick-card small {
            color: #64748b;
            font-size: 0.875rem;
            font-weight: 800;
          }

          .ci-recommendation-detail-stack {
            display: grid;
            gap: 1rem;
          }

          .student-progress-search-panel .panel-heading .section-kicker {
            margin-bottom: 0.65rem;
          }

          .ci-recommendation-carousel {
            display: grid;
            grid-template-columns: 48px minmax(0, 1fr) 48px;
            align-items: center;
            gap: 0.75rem;
          }

          .ci-recommendation-carousel.is-single {
            grid-template-columns: minmax(0, 1fr);
          }

          .ci-recommendation-carousel-track {
            display: flex;
            gap: 1rem;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scrollbar-width: thin;
          }

          .ci-recommendation-carousel-track .ci-recommendation-card {
            flex: 0 0 100%;
            scroll-snap-align: start;
          }

          .ci-recommendation-arrow {
            width: 44px;
            min-width: 44px;
            height: 44px;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            background: #ffffff;
            color: #111827;
            font-size: 1.35rem;
            font-weight: 900;
            line-height: 1;
            cursor: pointer;
          }

          .ci-recommendation-arrow:hover,
          .ci-recommendation-arrow:focus-visible {
            border-color: rgba(138, 37, 44, 0.42);
            background: #fff7d6;
          }

          .ci-recommendation-card {
            padding: 1.35rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            background: #ffffff;
            font-family: inherit;
          }

          .ci-recommendation-card-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 1rem;
            padding-bottom: 0.9rem;
            border-bottom: 1px solid #e2e8f0;
          }

          .ci-recommendation-card-head > div {
            display: grid;
            gap: 0.65rem;
          }

          .ci-recommendation-card-head h3 {
            margin: 0;
            line-height: 1.16;
          }

          .ci-recommendation-card-head .status-badge {
            margin-top: 0;
          }

          .ci-recommendation-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 0.45rem 0.85rem;
            margin-top: 0;
          }

          .ci-recommendation-meta small {
            color: #64748b;
            font-size: 0.88rem;
            font-weight: 800;
            line-height: 1.45;
          }

          .ci-recommendation-facts,
          .ci-recommendation-notes {
            display: grid;
            margin-top: 0.9rem;
          }

          .ci-recommendation-facts {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 0;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            background: #f8fafc;
          }

          .ci-recommendation-notes {
            gap: 0.85rem;
          }

          .ci-recommendation-box {
            padding: 1rem 1.05rem;
            border: 0;
            border-radius: 0.5rem;
            background: #f8fafc;
            font-family: inherit;
          }

          .ci-recommendation-facts .ci-recommendation-box {
            border-right: 1px solid #e2e8f0;
            border-radius: 0;
          }

          .ci-recommendation-facts .ci-recommendation-box:last-child {
            border-right: 0;
          }

          .ci-recommendation-notes .ci-recommendation-box {
            border-left: 5px solid #ffcf01;
          }

          .ci-recommendation-box span {
            display: block;
            margin-bottom: 0.35rem;
            color: #64748b;
            font-size: 0.76rem;
            font-weight: 900;
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }

          .ci-recommendation-box p,
          .ci-recommendation-box strong {
            font-family: inherit;
            font-size: 0.95rem;
            line-height: 1.5;
          }

          .ci-recommendation-box p {
            margin: 0;
            color: #334155;
            font-weight: 800;
          }

          .ci-recommendation-box strong {
            color: #111827;
            font-weight: 850;
          }

          .ci-recommendation-actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 0.75rem;
            margin-top: 1rem;
          }

          .ci-recommendation-actions .ghost-button,
          .ci-recommendation-actions .primary-button {
            min-height: 54px;
            padding: 0.95rem 1.35rem;
            border-radius: 0.5rem;
            line-height: 1.15;
            white-space: nowrap;
          }

          .ci-recommendation-actions .primary-button {
            min-width: 250px;
          }

          .ci-recommendation-actions .ghost-button {
            min-width: 205px;
          }

          .ci-recommendation-history-list-panel {
            margin-top: 1rem;
          }

          .ci-recommendation-history-group {
            display: grid;
            gap: 0.75rem;
          }

          .ci-recommendation-history-group + .ci-recommendation-history-group {
            margin-top: 1rem;
          }

          .ci-recommendation-history-subhead {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            color: #475569;
            font-size: 0.78rem;
            font-weight: 900;
            text-transform: uppercase;
          }

          .ci-recommendation-history-list {
            display: flex;
            flex-direction: column;
            gap: 0;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            overflow: hidden;
            background: #ffffff;
          }

          .ci-recommendation-history-item {
            display: grid;
            grid-template-columns: 44px minmax(0, 1fr) auto;
            align-items: center;
            gap: 1.25rem;
            padding: 1.35rem 1.6rem;
            border-bottom: 1px solid #e2e8f0;
            color: inherit;
            text-decoration: none;
            background: #ffffff;
          }

          .ci-recommendation-history-item:last-child {
            border-bottom: none;
          }

          .ci-recommendation-history-item:hover,
          .ci-recommendation-history-item:focus-visible,
          .ci-recommendation-history-item.is-active {
            background: #fffdf2;
          }

          .ci-recommendation-history-item .avatar {
            box-shadow: 0 8px 18px rgba(255, 207, 1, 0.28);
          }

          .ci-recommendation-history-item > span:nth-child(2) {
            display: grid;
            gap: 0.32rem;
            min-width: 0;
          }

          .ci-recommendation-history-item strong {
            color: #111827;
            font-size: 1rem;
            line-height: 1.3;
          }

          .ci-recommendation-history-item small {
            display: block;
            color: #64748b;
            font-size: 0.875rem;
            font-weight: 800;
            line-height: 1.45;
          }

          .ci-recommendation-history-item small:first-of-type {
            color: #415a7a;
          }

          .ci-recommendation-history-item .status-badge {
            justify-self: end;
            min-width: 112px;
            justify-content: center;
          }

          .ci-recommendation-history-detail {
            display: grid;
            gap: 0.75rem;
            margin-top: 1rem;
          }

          @media (max-width: 760px) {
            .student-progress-pick-card {
              align-items: flex-start;
              gap: 0.75rem;
              padding: 1rem;
            }

            .student-progress-pick-card > span:nth-child(2) {
              margin-left: 0;
            }

            .ci-recommendation-facts {
              grid-template-columns: 1fr;
            }

            .ci-recommendation-actions {
              flex-direction: column;
              align-items: stretch;
            }

          .ci-recommendation-actions .ghost-button,
          .ci-recommendation-actions .primary-button {
            width: 100%;
            min-width: 0;
          }

          .ci-recommendation-history-item {
            grid-template-columns: 44px minmax(0, 1fr);
            padding: 1rem;
          }

          .ci-recommendation-history-item .status-badge {
            justify-self: end;
            min-width: 112px;
            justify-content: center;
          }

          .ci-recommendation-history-item .status-badge {
            grid-column: 2;
            justify-self: start;
            min-width: 0;
          }

            .ci-recommendation-carousel {
              grid-template-columns: 1fr;
            }

            .ci-recommendation-arrow {
              display: none;
            }
          }
        `;
        document.head.appendChild(style);
      }

      setText(".topbar-title h1", title);
      if (isAdminExperience) {
        setText(".topbar-title p", "Admin Workspace");
      }
      setText("#appeal-sync-pill", `${students.length} students`);
      document.title = `NurseTrack | ${title}`;

      const main = one("main.workspace");
      if (!main) {
        return;
      }

      main.className = "workspace instructor-student-workspace";

      if (!selectedStudent) {
        main.innerHTML = `
          <section class="workspace-panel student-progress-search-panel">
            <div class="panel-heading">
              <div>
                <h2>Student Appeal List</h2>
              </div>
              <span class="status-badge status-verified" id="ci-recommendation-count">${students.length} visible</span>
            </div>

            <div class="history-filters student-progress-filters" aria-label="CI recommendation filters">
              <label class="form-label" for="ci-recommendation-search">
                Search
                <input id="ci-recommendation-search" type="search" placeholder="Search name, student ID, section, or status">
              </label>

              <label class="form-label" for="ci-recommendation-section">
                Section
                <select id="ci-recommendation-section">
                  <option value="BSN 3A">BSN 3A</option>
                  <option value="BSN 3B">BSN 3B</option>
                  <option value="BSN 3C">BSN 3C</option>
                </select>
              </label>

              <label class="form-label" for="ci-recommendation-status">
                Status
                <select id="ci-recommendation-status">
                  <option value="all">All statuses</option>
                  <option value="Pending review">Pending review</option>
                  <option value="Recommended">Recommended</option>
                  <option value="Accepted">Accepted</option>
                </select>
              </label>
            </div>

            <div class="student-progress-pick-list" id="ci-recommendation-student-list">
              ${students.map((student) => `
                <a class="student-progress-pick-card" href="student-appeals.html?student=${student.slug}" data-ci-recommendation-card data-name="${student.name}" data-id="${student.id}" data-section="${student.section}" data-area="${student.area}" data-status="${student.status}">
                  <span class="avatar small-avatar">${student.initials}</span>
                  <span>
                    <strong>${student.name}</strong>
                    <small>${student.section} - ${student.id}</small>
                    <small>${student.appeals.length} appeal${student.appeals.length === 1 ? "" : "s"} for review</small>
                  </span>
                  <mark class="status-badge ${student.badge}">${student.status}</mark>
                </a>
              `).join("")}
            </div>

            <div id="ci-recommendation-empty" class="empty-state" hidden>No matching students found.</div>
          </section>
        `;

        const cards = all("[data-ci-recommendation-card]");
        const search = one("#ci-recommendation-search");
        const section = one("#ci-recommendation-section");
        const status = one("#ci-recommendation-status");
        const count = one("#ci-recommendation-count");
        const empty = one("#ci-recommendation-empty");

        const filterCards = () => {
          const query = search?.value.trim().toLowerCase() || "";
          const sectionValue = section?.value || "BSN 3A";
          const statusValue = status?.value || "all";
          let visible = 0;

          cards.forEach((card) => {
            const haystack = `${card.dataset.name} ${card.dataset.id} ${card.dataset.section} ${card.dataset.area}`.toLowerCase();
            const matches = (!query || haystack.includes(query)) &&
              card.dataset.section === sectionValue &&
              (statusValue === "all" || card.dataset.status === statusValue);
            card.hidden = !matches;
            if (matches) {
              visible += 1;
            }
          });

          setText("#ci-recommendation-count", `${visible} visible`);
          if (empty) {
            empty.hidden = visible > 0;
          }
        };

        [search, section, status].forEach((control) => {
          control?.addEventListener("input", filterCards);
          control?.addEventListener("change", filterCards);
        });
        filterCards();
        return;
      }

      const selectedCurrentAppeals = selectedStudent.appeals
        .map((appeal, index) => ({ appeal, index, decision: decisionFor(selectedStudent, index) }))
        .filter((item) => !["accepted", "rejected"].includes(item.decision));
      const selectedHistoryItems = [
        ...(selectedStudent.history || []).map((appeal, index) => ({
          appeal,
          index,
          id: `${selectedStudent.slug}-history-${index}`,
          decision: storedDecisionFor(`${selectedStudent.slug}-history-${index}`, appeal.status === "rejected" ? "rejected" : "accepted"),
          source: "history"
        })),
        ...selectedStudent.appeals
          .map((appeal, index) => ({ appeal, index, id: `${selectedStudent.slug}-${index}`, decision: decisionFor(selectedStudent, index), source: "current" }))
      ];
      const indexedHistoryItems = selectedHistoryItems.map((item, historyIndex) => ({ ...item, historyIndex }));
      const pendingHistoryItems = indexedHistoryItems.filter((item) => !["accepted", "rejected"].includes(item.decision));
      const decidedHistoryItems = indexedHistoryItems.filter((item) => ["accepted", "rejected"].includes(item.decision));
      const selectedHistoryItem = Number.isInteger(selectedHistoryIndex) ? selectedHistoryItems[selectedHistoryIndex] : null;
      const isSupportReviewRole = isAssistantRole || isCoordinatorRole;
      const canDecideRecommendations = !isSupportReviewRole || assistantCiRecommendationsEnabled;
      const canEditHistoryDecision = (isInstructor || isAdminExperience || isChair) && canDecideRecommendations;

      if (selectedHistoryItem) {
        main.innerHTML = `
          <section class="workspace-panel student-progress-search-panel">
            <div class="panel-heading">
              <div>
                <p class="section-kicker">${selectedStudent.section} - ${selectedStudent.id}</p>
                <h2>${possessiveName(selectedStudent.name)} Appeal History</h2>
              </div>
            </div>

            <article class="ci-recommendation-card">
              <div class="ci-recommendation-card-head">
                <div>
                  <h3>${selectedHistoryItem.appeal.title}</h3>
                  ${renderAppealMeta(selectedHistoryItem.appeal)}
                </div>
                <mark class="status-badge ${decisionBadge(selectedHistoryItem.decision)}">${decisionLabel(selectedHistoryItem.decision, "Pending")}</mark>
              </div>

              ${renderAppealFacts(selectedStudent, selectedHistoryItem.appeal)}
              ${renderAppealNotes(selectedHistoryItem.appeal)}

              ${canEditHistoryDecision ? `
                <div class="ci-recommendation-actions">
                  ${selectedHistoryItem.decision !== "accepted" ? `<button class="primary-button workspace-action" type="button" data-ci-history-decision="accepted" data-ci-history-id="${selectedHistoryItem.id}">Mark as Accepted</button>` : ""}
                  ${selectedHistoryItem.decision !== "rejected" ? `<button class="ghost-button danger-button" type="button" data-ci-history-decision="rejected" data-ci-history-id="${selectedHistoryItem.id}">Mark as Rejected</button>` : ""}
                </div>
              ` : ""}
            </article>
          </section>
        `;

        all("[data-ci-history-decision]").forEach((button) => {
          button.addEventListener("click", () => {
            const id = button.dataset.ciHistoryId;
            const decision = button.dataset.ciHistoryDecision;
            const displayDecision = decision === "pending" ? "" : decision;
            decisionMap[id] = decision;

            try {
              window.localStorage.setItem(storageKey, JSON.stringify(decisionMap));
            } catch (error) {
              return;
            }

            all(".student-progress-search-panel .status-badge, .ci-recommendation-card .status-badge").forEach((item) => {
              item.className = `status-badge ${decisionBadge(displayDecision)}`;
              item.textContent = decisionLabel(displayDecision, "Pending");
            });

            window.location.reload();
          });
        });
        return;
      }

      main.innerHTML = `
        <section class="workspace-panel student-progress-search-panel">
          <div class="panel-heading">
            <div>
              <p class="section-kicker">${selectedStudent.section} - ${selectedStudent.id}</p>
              <h2>${possessiveName(selectedStudent.name)} Appeals</h2>
            </div>
          </div>

          ${selectedCurrentAppeals.length ? `
            <div class="ci-recommendation-carousel${selectedCurrentAppeals.length > 1 ? "" : " is-single"}">
              ${selectedCurrentAppeals.length > 1 ? `<button class="ci-recommendation-arrow" type="button" data-ci-slide="prev" aria-label="Previous appeal">‹</button>` : ""}
              <div class="ci-recommendation-carousel-track" data-ci-recommendation-track>
                ${selectedCurrentAppeals.map(({ appeal, index, decision }) => {
              const badgeText = decisionLabel(decision);
              const badgeClass = decisionBadge(decision);

              return `
                <article class="ci-recommendation-card" data-ci-appeal-card="${selectedStudent.slug}-${index}">
                  <div class="ci-recommendation-card-head">
                    <div>
                      <h3>${appeal.title}</h3>
                      ${renderAppealMeta(appeal)}
                    </div>
                    <mark class="status-badge ${badgeClass}" data-ci-decision-badge>${badgeText}</mark>
                  </div>

                  ${renderAppealFacts(selectedStudent, appeal)}
                  ${renderAppealNotes(appeal)}

                  ${canDecideRecommendations ? `
                    <div class="ci-recommendation-actions">
                      <button class="ghost-button danger-button" type="button" data-ci-decision="rejected" data-ci-decision-id="${selectedStudent.slug}-${index}">Mark as Rejected</button>
                      <button class="primary-button workspace-action" type="button" data-ci-decision="accepted" data-ci-decision-id="${selectedStudent.slug}-${index}">Mark as Accepted</button>
                    </div>
                  ` : `<div class="form-message">This role can view CI recommendations but cannot accept or reject them.</div>`}
                </article>
              `;
                }).join("")}
              </div>
              ${selectedCurrentAppeals.length > 1 ? `<button class="ci-recommendation-arrow" type="button" data-ci-slide="next" aria-label="Next appeal">›</button>` : ""}
            </div>
          ` : `<div class="empty-state">No unchecked CI recommendations for this student.</div>`}
        </section>

        <section class="workspace-panel ci-recommendation-history-list-panel">
          <div class="panel-heading">
            <div>
              <h2>${possessiveName(selectedStudent.name)} Appeal History</h2>
            </div>
            <span class="status-badge status-verified">${selectedHistoryItems.length} records</span>
          </div>

          ${selectedHistoryItems.length ? `
            ${pendingHistoryItems.length ? `
              <div class="ci-recommendation-history-group">
                <div class="ci-recommendation-history-subhead">
                  <span>Pending</span>
                </div>
                <div class="ci-recommendation-history-list">
                  ${pendingHistoryItems.map((item) => `
                    <a class="ci-recommendation-history-item" href="student-appeals.html?student=${selectedStudent.slug}&history=${item.historyIndex}">
                      <span class="avatar small-avatar">${selectedStudent.initials}</span>
                      <span>
                        <strong>${item.appeal.title}</strong>
                        <small>${item.appeal.type} - ${item.appeal.dutyDate} - ${item.appeal.site}</small>
                        <small>Submitted ${item.appeal.submitted}</small>
                      </span>
                      <mark class="status-badge ${decisionBadge(item.decision)}" data-ci-history-badge-id="${item.id}">${decisionLabel(item.decision, "Pending")}</mark>
                    </a>
                  `).join("")}
                </div>
              </div>
            ` : ""}

            ${decidedHistoryItems.length ? `
              <div class="ci-recommendation-history-group">
                <div class="ci-recommendation-history-subhead">
                  <span>Accepted / Returned</span>
                </div>
                <div class="ci-recommendation-history-list">
                  ${decidedHistoryItems.map((item) => `
                    <a class="ci-recommendation-history-item" href="student-appeals.html?student=${selectedStudent.slug}&history=${item.historyIndex}">
                      <span class="avatar small-avatar">${selectedStudent.initials}</span>
                      <span>
                        <strong>${item.appeal.title}</strong>
                        <small>${item.appeal.type} - ${item.appeal.dutyDate} - ${item.appeal.site}</small>
                        <small>Submitted ${item.appeal.submitted}</small>
                      </span>
                      <mark class="status-badge ${decisionBadge(item.decision)}" data-ci-history-badge-id="${item.id}">${decisionLabel(item.decision, "Pending")}</mark>
                    </a>
                  `).join("")}
                </div>
              </div>
            ` : ""}
          ` : `<div class="empty-state">No appeal records for this student yet.</div>`}
        </section>
      `;

      all("[data-ci-decision]").forEach((button) => {
        button.addEventListener("click", () => {
          const id = button.dataset.ciDecisionId;
          const decision = button.dataset.ciDecision;
          const card = button.closest("[data-ci-appeal-card]");
          const badge = card?.querySelector("[data-ci-decision-badge]");

          decisionMap[id] = decision;
          try {
            window.localStorage.setItem(storageKey, JSON.stringify(decisionMap));
          } catch (error) {
            return;
          }

          if (badge) {
            badge.className = `status-badge ${decision === "accepted" ? "status-verified" : "status-rejected"}`;
            badge.textContent = decision === "accepted" ? "Accepted" : "Rejected";
          }

          all(`[data-ci-history-badge-id="${id}"]`).forEach((historyBadge) => {
            historyBadge.className = `status-badge ${decisionBadge(decision)}`;
            historyBadge.textContent = decisionLabel(decision, "Pending");
          });
        });
      });

      all("[data-ci-slide]").forEach((button) => {
        button.addEventListener("click", () => {
          const track = one("[data-ci-recommendation-track]");
          if (!track) {
            return;
          }

          const direction = button.dataset.ciSlide === "next" ? 1 : -1;
          track.scrollBy({
            left: direction * track.clientWidth,
            behavior: "smooth"
          });
        });
      });

    };

    const insertAfterHero = (key, markup) => {
      const main = one("main.workspace");
      const hero = one(".workspace-hero");

      if (!main || !hero || one(`[data-consultation="${key}"]`)) {
        return null;
      }

      const node = render(markup);
      node.dataset.consultation = key;
      hero.insertAdjacentElement("afterend", node);
      return node;
    };

    const appendMain = (key, markup) => {
      const main = one("main.workspace");

      if (!main || one(`[data-consultation="${key}"]`)) {
        return null;
      }

      const node = render(markup);
      node.dataset.consultation = key;
      main.appendChild(node);
      return node;
    };

    const setText = (selector, text) => {
      const element = one(selector);

      if (element) {
        element.textContent = text;
      }
    };

    const replaceSelectOptions = (selector, options) => {
      const select = one(selector);

      if (!select) {
        return;
      }

      select.innerHTML = options.map((option) => {
        const label = typeof option === "string" ? option : option.label;
        let value = typeof option === "string" ? option : option.value;

        if (label.toLowerCase().startsWith("select ")) {
          value = "";
        } else if (label.toLowerCase().startsWith("all ")) {
          value = "all";
        }

        return `<option value="${value}">${label}</option>`;
      }).join("");
    };

    const setSelectValue = (selector, value) => {
      const select = one(selector);

      if (select && Array.from(select.options).some((option) => option.textContent === value)) {
        select.value = value;
      }
    };

    const hospitalWardMap = {
      VSMMC: ["SP St 201", "SP ST 301", "VND 401", "VNDE 401", "VNDE 501", "IDTM 101", "CFI 101", "OR Main", "Main Station 205"],
      LCH: ["3rd Floor", "4th Floor"],
      PSH: ["3B Station", "4th Floor", "5th Floor", "Operating Room", "Intensive Care Unit"],
      CCMC: ["Pedia Pulmo Ward", "NICU", "Emergency Room", "Operating Room"],
      CBS: ["Male Ward", "Female Ward"],
      SAMCH: ["Operating Room", "Delivery Room"],
      MMC: ["Delivery Room"],
      VMH: ["Delivery Room"],
      ECS: ["Outpatient Department"],
      CCHD: ["Community Health / Duty Area"],
      CSMC: [],
      "Mactan Medical Hospital": [],
      "Vicente Mendiola Center for Health Infirmary": ["Emergency Room", "Medical Ward", "Delivery Room"],
      "Healing Hands Dialysis Center": ["Dialysis Center"],
      "Mabolo Birthing Center": ["Birthing Center"],
      "Inayawan Birthing Center": ["Birthing Center"],
      "Quiot Birthing Center": ["Birthing Center"],
      "Tejero Birthing Center": ["Birthing Center"],
      "CHN Brgy. Dumlog": ["Community Health Nursing Area"],
      "Preventive Promotive Brgy. Lagtang": ["Community Health / Preventive Promotive Area"],
      "Psycare Basak San Nicolas": ["Psychiatric Duty Area"]
    };

    const hospitalNames = Object.keys(hospitalWardMap);

    const normalizeHospitalWardSelects = () => {
      const attendanceSiteFilter = one("#attendance-site-filter");
      if (attendanceSiteFilter) {
        const previousSite = hospitalNames.includes(attendanceSiteFilter.value) ? attendanceSiteFilter.value : hospitalNames[0];
        attendanceSiteFilter.innerHTML = hospitalNames.map((hospital) => `<option value="${hospital}">${hospital}</option>`).join("");
        attendanceSiteFilter.value = previousSite;
      }

      const pairs = [
        ["#clinical-site", "#duty-area"],
        ["#selected-schedule-hospital", "#selected-schedule-area"],
        ["#manual-hospital", "#manual-area"]
      ];

      pairs.forEach(([hospitalSelector, areaSelector]) => {
        const hospitalSelect = one(hospitalSelector);
        const areaSelect = one(areaSelector);

        if (!hospitalSelect) {
          return;
        }

        const previousHospital = hospitalNames.includes(hospitalSelect.value) ? hospitalSelect.value : hospitalNames[0];
        const hasPlaceholder = Array.from(hospitalSelect.options).some((option) => option.value === "");

        hospitalSelect.innerHTML = [
          ...(hasPlaceholder ? ['<option value="">Select clinical site</option>'] : []),
          ...hospitalNames.map((hospital) => `<option value="${hospital}">${hospital}</option>`)
        ].join("");
        hospitalSelect.value = previousHospital;

        if (!areaSelect) {
          return;
        }

        const syncAreas = () => {
          const wards = hospitalWardMap[hospitalSelect.value] || [];
          const previousArea = areaSelect.value;
          const hasAreaPlaceholder = Array.from(areaSelect.options).some((option) => option.value === "");
          areaSelect.innerHTML = [
            ...(hasAreaPlaceholder ? ['<option value="">Select duty area</option>'] : []),
            ...wards.map((ward) => `<option value="${ward}">${ward}</option>`)
          ].join("");

          if (wards.includes(previousArea)) {
            areaSelect.value = previousArea;
          } else if (wards.length > 0) {
            areaSelect.value = wards[0];
          } else {
            areaSelect.value = "";
          }

          areaSelect.disabled = wards.length === 0;
        };

        hospitalSelect.addEventListener("change", syncAreas);
        syncAreas();
      });
    };

    const normalizeSidebarBrandLink = () => {
      const brand = one(".sidebar-brand");

      if (!brand) {
        return;
      }

      const roleChip = one(".role-chip")?.textContent.trim().toLowerCase() || "";
      const brandRole = signedRole || (roleChip.includes("coordinator") ? "coordinator" :
        roleChip.includes("enrollment") ? "enrollment" :
          roleChip === "assistant" ? "assistant" : "");
      const href = isAdminExperience ? hrefFor("admin", "about.html") :
        brandRole === "coordinator" ? hrefFor("admin-manager", "coordinator-about.html") :
          brandRole === "enrollment" ? hrefFor("admin-manager", "enrollment-about.html") :
            brandRole === "assistant" ? hrefFor("admin-manager", "assistant-about.html") :
              "about.html";

      if (brand.tagName.toLowerCase() === "a") {
        brand.setAttribute("href", href);
        brand.setAttribute("aria-label", "About NurseTrack");
        return;
      }

      const link = render(`<a class="${brand.className}" href="${href}" aria-label="About NurseTrack"></a>`);
      link.innerHTML = brand.innerHTML;
      brand.replaceWith(link);
    };

    const simplifyTopbarActions = () => {
      const isNotificationPage = ["notifications.html", "instructor-notifications.html", "admin-notifications.html"].includes(page);

      if (isNotificationPage) {
        all(".topbar-actions .ghost-button").forEach((button) => button.remove());
      }
    };

    const removePanelByHeading = (patterns) => {
      all(".workspace-panel").forEach((panel) => {
        const heading = panel.querySelector(".panel-heading h2");
        const kicker = panel.querySelector(".panel-heading .section-kicker");
        const label = `${kicker?.textContent || ""} ${heading?.textContent || ""}`.trim();

        if (patterns.some((pattern) => pattern.test(label))) {
          panel.remove();
        }
      });
    };

    const simplifyRepeatedExtras = () => {
      removePanelByHeading([
        /validation actions/i,
        /follow-up queue/i,
        /chair controls/i
      ]);

      if (!isAdmin && !isChair) {
        return;
      }

      removePanelByHeading([
        /report actions/i,
        /open report views/i,
        /report links/i,
        /recent exports/i,
        /chair actions/i,
        /^links\s+continue$/i
      ]);

      if (page === "role-assignment.html") {
        all(".dashboard-stats .stat-card").forEach((card) => {
          const label = card.querySelector("span")?.textContent.trim();

          if (label === "Changes") {
            card.remove();
          }
        });
      }

      if (isChair && ["schedule-report.html", "duty-report.html", "case-report.html", "generate-report.html"].includes(page)) {
        all("select option").forEach((option) => {
          if (/^all\s+/i.test(option.textContent.trim())) {
            option.remove();
          }
        });

        all("select").forEach((select) => {
          select.dispatchEvent(new Event("input", { bubbles: true }));
        });
      }
    };

    const simplifyHelpPages = () => {
      if (!page.endsWith("help.html")) {
        return;
      }

      one(".help-search-panel")?.remove();
      one(".help-hero .workspace-action")?.remove();
      setText(".help-hero h2", "Find answers for the main workflow.");
      setText(".help-hero p:not(.section-kicker)", "Choose a topic to open the page related to your role.");
      all(".help-main-stack > .workspace-panel").slice(1).forEach((panel) => panel.remove());
      one(".help-layout .duty-side-panel")?.remove();

      const helpLayout = one(".help-layout");
      if (helpLayout) {
        helpLayout.className = "simple-help-layout";
      }
    };

    const simplifyNotificationCategories = () => {
      if (!["notifications.html", "instructor-notifications.html"].includes(page)) {
        return;
      }

      removePanelByHeading([/quick filters\s+notification type/i]);

      const typeFilter = one("#type-filter");
      const statusFilter = one("#status-filter");
      const firstCard = one("#notification-list .notification-card");

      all("#type-filter option[value='all'], #status-filter option[value='all']").forEach((option) => option.remove());

      if (typeFilter && firstCard?.dataset.type) {
        typeFilter.value = firstCard.dataset.type;
      }

      if (statusFilter && firstCard?.dataset.status) {
        statusFilter.value = firstCard.dataset.status;
      }

      [typeFilter, statusFilter].filter(Boolean).forEach((select) => {
        select.dispatchEvent(new Event("input", { bubbles: true }));
      });
    };

    const simplifyAssignedSchedulePage = () => {
      const isScheduleManagementPage = page === "schedule-management.html" || (isStudent && page === "view-schedule.html");

      if (!isScheduleManagementPage) {
        return;
      }

      one(".schedule-management-workspace > .dashboard-stats")?.remove();
      one(".schedule-management-layout .duty-side-panel")?.remove();
      one(".workspace-hero > .status-badge")?.remove();

      const layout = one(".schedule-management-layout");
      if (layout) {
        layout.className = "simple-report-layout";
      }
    };

    const simplifyChairGuide4 = () => {
      if (!isChair) {
        return;
      }

      if (page === "admin-dashboard.html") {
        removePanelByHeading([/reports\s+monitoring summary/i, /workflow\s+chair controls/i]);
      }

      if (page === "chair-student-progress.html") {
        one(".chair-student-progress-workspace > .dashboard-stats")?.remove();
        const hero = one(".student-progress-lookup-hero");
        if (hero) {
          hero.classList.add("guide4-direct-hero");
        }
      }
    };

    const redirectDeprecatedChairValidation = () => false;

    const enhanceStudentInstructorTopbar = () => {
      const actions = one(".topbar-actions");
      const notificationButton = one(".topbar-actions .notification-button");
      const isNotificationPage = ["notifications.html", "instructor-notifications.html", "admin-notifications.html"].includes(page);

      if (notificationButton) {
        notificationButton.classList.toggle("is-active", isNotificationPage);
        if (isNotificationPage) {
          notificationButton.setAttribute("aria-current", "page");
        } else {
          notificationButton.removeAttribute("aria-current");
        }
      }

      if (!isStudent && !isInstructor) {
        return;
      }

      all('.sidebar-nav .nav-link[href="view-profile.html"]').forEach((link) => link.remove());

      if (!actions) {
        return;
      }

      const profileHref = "view-profile.html";
      let profileButton = one(".topbar-profile-button");

      if (!profileButton) {
        profileButton = render(`
          <a class="icon-button topbar-profile-button button-link" href="${profileHref}" aria-label="Profile" title="Profile">
            <svg class="profile-user-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="4"></circle>
              <path d="M4 21a8 8 0 0 1 16 0"></path>
            </svg>
          </a>
        `);

        if (notificationButton) {
          notificationButton.insertAdjacentElement("afterend", profileButton);
        } else {
          const logout = one(".topbar-actions .logout-link");
          actions.insertBefore(profileButton, logout || null);
        }
      }

      const isProfilePage = ["view-profile.html", "edit-profile.html", "change-password.html"].includes(page);

      if (notificationButton && profileButton.previousElementSibling !== notificationButton) {
        notificationButton.insertAdjacentElement("afterend", profileButton);
      }

      profileButton.classList.toggle("is-active", isProfilePage);
      if (isProfilePage) {
        profileButton.setAttribute("aria-current", "page");
      } else {
        profileButton.removeAttribute("aria-current");
      }
    };

    const enhanceChairTerminology = () => {
      if (!isChair || isAdminExperience) {
        return;
      }

      setText(".role-chip", "Chair");
      setText(".topbar-title p", "Chair Workspace");
      setText(".sidebar-account strong", "Reyes");
      setText(".sidebar-account span", "Chair");
      document.title = document.title.replace("Admin", "Chair");

      all(".workspace-hero p, .workspace-hero h2, .sync-pill").forEach((item) => {
        item.textContent = item.textContent.replace("Admin", "Chair");
      });
    };

    const enhanceChairSchedules = () => {
      if (!isChair || page !== "admin-schedules.html") {
        return;
      }

      one('[data-consultation="chair-schedule-workflow"]')?.remove();
      one('[data-consultation="chair-import"]')?.remove();
      one('[data-consultation="chair-schedule-maker-panel"]')?.remove();
      one(".workspace-hero")?.remove();
      one(".schedule-management-workspace > .dashboard-stats")?.remove();
    };

    const enhanceUserImportPages = () => {
      if (!isChair || !["user-management.html", "user-list-manage-users.html"].includes(page)) {
        return;
      }

      insertAfterHero("student-list-import", `
        <section class="workspace-panel chair-import-panel">
          <div class="panel-heading">
            <div>
              <p class="section-kicker">Excel Import</p>
              <h2>Student list maintenance</h2>
            </div>
            <span class="status-badge status-pending">Editable after upload</span>
          </div>
          <div class="chair-control-grid">
            <div class="chair-control-card"><span>XL</span><strong>Upload student list</strong><p>Import school ID, full name, section, contact, status, and enrollment notes.</p></div>
            <div class="chair-control-card"><span>GR</span><strong>Upload groupings</strong><p>Map students to groups, RLE/rotation, semester, and duty grouping code.</p></div>
            <div class="chair-control-card"><span>ED</span><strong>Correct records</strong><p>Edit names, group labels, membership, and late enrollment changes.</p></div>
            <div class="chair-control-card"><span>TR</span><strong>Track changes</strong><p>Keep uploaded data reviewable before it affects schedules.</p></div>
          </div>
        </section>
      `);
    };

    const enhanceStudentSchedule = () => {
      if (!isStudent || page !== "view-schedule.html") {
        return;
      }

      document.title = "NurseTrack | Assigned Schedules";
      setText(".topbar-title p", "Assigned Schedules");
      setText(".topbar-title h1", "Assigned Schedules");

      one('[data-consultation="student-schedule-lock"]')?.remove();
    };

    const enhanceDutyEntry = () => {
      if (!isStudent || page !== "record-duty-hours.html") {
        return;
      }

      all("h2").forEach((heading) => {
        if (heading.textContent.includes("Today")) {
          heading.textContent = "Today's assigned shift";
        }
      });

      setText(".workspace-hero h2", "Time in and time out from your assigned schedule.");
      setText(
        ".workspace-hero p:not(.section-kicker)",
        "Attendance is tied to the Chair-published schedule, assigned location, and CI verification. Submit records only for your assigned duty."
      );

      replaceSelectOptions("#clinical-site", ["Select clinical site", "CCMC", "VSMMC", "CHN Brgy. Dumlog"]);
      replaceSelectOptions("#duty-area", ["Select duty area", "Emergency Room", "Delivery Room", "Operating Room", "Pedia Pulmo Ward"]);
      setSelectValue("#clinical-site", "CCMC");
      setSelectValue("#duty-area", "Emergency Room");

      const instructor = one("#clinical-instructor");
      if (instructor) {
        instructor.value = "Prof. Reyes";
        instructor.readOnly = true;
      }

      const message = one("#form-message");
      if (message && !one('[data-consultation="schedule-tied-attendance"]')) {
        message.insertAdjacentElement("beforebegin", render(`
          <div class="attendance-rules-panel integration-placeholder" data-consultation="schedule-tied-attendance">
            <strong>Schedule-tied attendance check</strong>
            <p>Allowed shift: 7:00 AM - 3:00 PM. Location: CCMC, Emergency Room. CI session: Prof. Reyes. Bluetooth/proximity and location rules are prepared for mobile integration and CI verification.</p>
          </div>
        `));
      }
    };

    const enhanceCaseEntry = () => {
      if (!isStudent || !["add-clinical-case.html", "edit-case.html"].includes(page)) {
        return;
      }

      if (one("[data-student-case-submitted-format]")) {
        return;
      }

      setText(".workspace-hero h2", page === "add-clinical-case.html" ? "Submit a DR or OR clinical case." : "Update a DR or OR clinical case.");
      setText(
        ".workspace-hero p:not(.section-kicker)",
        "Clinical cases are monitored by category and must be reviewed by the assigned CI before they count toward progress."
      );

      const category = one("#case-category");
      if (category) {
        category.innerHTML = `
          <option value="">Select main category</option>
          <option value="DR">DR</option>
          <option value="OR">OR</option>
        `;

        if (!one("#case-subcategory")) {
          category.closest(".form-grid")?.insertAdjacentElement("afterend", render(`
            <div class="form-grid" data-consultation="case-subcategory-fields">
              <label class="form-label" for="case-subcategory">
                Subcategory
                <select id="case-subcategory" name="caseSubcategory" required>
                  <option value="">Select subcategory</option>
                </select>
              </label>
              <label class="form-label" for="case-major-role">
                Major OR role
                <select id="case-major-role" name="caseMajorRole" disabled>
                  <option value="">Select Major OR role</option>
                  <option value="Scrub cases">Scrub cases</option>
                  <option value="Circulating cases">Circulating cases</option>
                </select>
              </label>
            </div>
          `));
        }
      }

      const subcategory = one("#case-subcategory");
      const majorRole = one("#case-major-role");

      const syncSubcategory = () => {
        if (!category || !subcategory) {
          return;
        }

        const previousSubcategory = subcategory.value;
        const options = category.value === "OR"
          ? ["Select subcategory", "Minor cases", "Major cases"]
          : category.value === "DR"
            ? ["Select subcategory", "Handled cases", "Assisted cases", "Newborn care", "Labor watch monitoring"]
            : ["Select subcategory"];

        subcategory.innerHTML = options.map((option) => {
          const value = option.toLowerCase().startsWith("select ") ? "" : option;
          return `<option value="${value}">${option}</option>`;
        }).join("");

        if (options.includes(previousSubcategory)) {
          subcategory.value = previousSubcategory;
        }

        const isMajorOrCase = category.value === "OR" && subcategory.value === "Major cases";

        if (majorRole) {
          majorRole.disabled = !isMajorOrCase;
          majorRole.required = isMajorOrCase;

          if (!isMajorOrCase) {
            majorRole.value = "";
          }

          majorRole.closest(".form-label")?.classList.toggle("is-disabled", !isMajorOrCase);
        }
      };

      category?.addEventListener("input", syncSubcategory);
      subcategory?.addEventListener("input", syncSubcategory);
      syncSubcategory();

      insertAfterHero("case-taxonomy", `
        <section class="workspace-panel case-taxonomy-panel">
          <div class="panel-heading">
            <div>
              <p class="section-kicker">Clinical Case Structure</p>
              <h2>DR and OR monitoring categories</h2>
            </div>
            <span class="status-badge status-pending">CI validation required</span>
          </div>
          <div class="case-counter-grid">
            <div class="case-counter-card"><span>DR</span><strong>Handled cases</strong><p><span class="case-counter-metric">Required 3</span><span class="case-counter-metric">Completed 1</span><span class="case-counter-metric">Pending 1</span><span class="case-counter-metric">Lacking 1</span></p></div>
            <div class="case-counter-card"><span>DR</span><strong>Assisted cases</strong><p><span class="case-counter-metric">Required 3</span><span class="case-counter-metric">Completed 2</span><span class="case-counter-metric">Pending 0</span><span class="case-counter-metric">Lacking 1</span></p></div>
            <div class="case-counter-card"><span>DR</span><strong>Newborn care</strong><p><span class="case-counter-metric">Required 3</span><span class="case-counter-metric">Completed 2</span><span class="case-counter-metric">Pending 1</span><span class="case-counter-metric">Lacking 0</span></p></div>
            <div class="case-counter-card"><span>OR</span><strong>Major scrub/circulating</strong><p><span class="case-counter-metric">Required 4</span><span class="case-counter-metric">Completed 1</span><span class="case-counter-metric">Pending 1</span><span class="case-counter-metric">Not applicable 1</span></p></div>
          </div>
          <p class="readonly-note">Invalid or unmatched cases should be marked Not Applicable by the reviewer instead of deleted, so the record remains traceable.</p>
        </section>
      `);
    };

    const enhanceCaseHistory = () => {
      if (!isStudent || !["case-history.html", "case-detail.html", "checklist-form.html"].includes(page)) {
        return;
      }

      replaceSelectOptions("#category-filter", ["All categories", "DR", "OR"]);

      insertAfterHero("case-progress-counters", `
        <section class="workspace-panel case-taxonomy-panel">
          <div class="panel-heading">
            <div>
              <p class="section-kicker">Clinical Case Progress</p>
              <h2>Category completion counters</h2>
            </div>
            <span class="status-badge status-pending">Monitoring only</span>
          </div>
          <div class="case-counter-grid">
            <div class="case-counter-card"><span>DR</span><strong>Handled cases</strong><p><span class="case-counter-metric">Required 3</span><span class="case-counter-metric">Verified 1</span><span class="case-counter-metric">Pending 1</span><span class="case-counter-metric">Lacking 1</span></p></div>
            <div class="case-counter-card"><span>DR</span><strong>Labor watch monitoring</strong><p><span class="case-counter-metric">Required 3</span><span class="case-counter-metric">Verified 2</span><span class="case-counter-metric">Pending 0</span><span class="case-counter-metric">Lacking 1</span></p></div>
            <div class="case-counter-card"><span>OR</span><strong>Minor cases</strong><p><span class="case-counter-metric">Required 2</span><span class="case-counter-metric">Verified 1</span><span class="case-counter-metric">Pending 1</span><span class="case-counter-metric">Lacking 0</span></p></div>
            <div class="case-counter-card"><span>OR</span><strong>Major cases</strong><p><span class="case-counter-metric">Scrub 1</span><span class="case-counter-metric">Circulating 1</span><span class="case-counter-metric">Not applicable 1</span></p></div>
          </div>
        </section>
      `);
    };

    const enhanceInstructorValidation = () => {
      if (!isInstructor || !["case-validation.html", "duty-validation.html", "approval-rejection.html"].includes(page)) {
        return;
      }

      if (page === "case-validation.html" && !new URLSearchParams(window.location.search).has("case")) {
        setText("#selected-case-code", "J. A. K.");
        setText("#selected-case-category", "Major Case - Assist");
        setText("#selected-case-procedure", "Primary Lower Segment Transverse Cesarean Section");
        setText("#selected-case-shift-time", "6:00 AM - 2:00 PM");
        setText("#selected-case-supervising-ci", "Patricia Reyes, RN, MAN");
      }
    };

    const enhanceAttendanceMonitoring = () => {
      return;
    };

    const enhanceInstructorScheduling = () => {
      if (!isInstructor || !["schedule-management.html", "create-schedule.html", "edit-schedule.html", "assign-duty.html"].includes(page)) {
        return;
      }

      if (page === "schedule-management.html") {
        setText(".topbar-title p", "Assigned Schedules");
        setText(".topbar-title h1", "Assigned Schedules");
        setText(".workspace-hero .section-kicker", "Assigned schedules");
        setText(".workspace-hero h2", "View assigned clinical duty schedules.");
        setText(
          ".workspace-hero p:not(.section-kicker)",
          "Monitor Chair-published rotations for your assigned groups, hospitals, duty areas, and shift windows."
        );
      } else {
        setText(".topbar-title p", "Schedule Monitoring");
        setText(".topbar-title h1", "Chair-Controlled Action");

        const main = one("main.workspace");

        if (main) {
          main.className = "workspace dashboard-workspace";
          main.innerHTML = `
            <section class="workspace-hero dashboard-hero">
              <div>
                <p class="section-kicker">Read-only Access</p>
                <h2>This scheduling action is handled by the Chair.</h2>
                <p>Clinical instructors can monitor assigned schedules, rosters, and attendance sessions. Schedule creation, reassignment, and group editing are restricted to the Chair role.</p>
              </div>
              <a class="primary-button workspace-action button-link" href="schedule-management.html">View assigned schedules</a>
            </section>
          `;
        }
      }

      if (page !== "schedule-management.html") {
        insertAfterHero("ci-readonly-scheduling", `
          <section class="workspace-panel schedule-lock-panel">
            <div class="panel-heading">
              <div>
                <p class="section-kicker">Assigned Schedule Access</p>
                <h2>Read-only schedule monitoring</h2>
              </div>
              <span class="status-badge status-pending">Chair-controlled</span>
            </div>
            <p class="readonly-note">Clinical Instructors can view assigned groups and schedules, but schedule creation, reassignment, Excel uploads, and group membership edits are handled by the Chair.</p>
          </section>
        `);
      }

      all('a[href="create-schedule.html"], a[href="edit-schedule.html"], a[href="assign-duty.html"]').forEach((link) => {
        const card = link.closest(".requirement-item, .action-item");

        if (card) {
          card.remove();
          return;
        }

        link.textContent = "View assigned schedules";
        link.setAttribute("href", "schedule-management.html");
        link.classList.add("ci-schedule-return-action");

        if (page !== "schedule-management.html") {
          link.classList.add("consultation-disabled");
          link.setAttribute("aria-disabled", "true");
          link.title = "Chair-controlled action";
        }
      });

      all("form input, form select, form textarea, form button").forEach((control) => {
        if (page !== "schedule-management.html") {
          control.disabled = true;
        }
      });
    };

    const enhanceChairValidation = () => {};

    const enhanceReports = () => {
      if (!page.includes("report") && page !== "generate-report.html") {
        return;
      }

      replaceSelectOptions("#report-type", [
        "Compliance Summary",
        "Duty Report",
        "Case Report",
        "Schedule Report",
        "Lacking Duty Hours",
        "Lacking Clinical Cases",
        "Late Attendance Records",
        "Not Applicable Records",
        "Group Progress",
        "CI Assigned Student Status"
      ]);

      insertAfterHero("practical-reporting", `
        <section class="workspace-panel report-scope-panel">
          <div class="panel-heading">
            <div>
              <p class="section-kicker">Practical Reporting</p>
              <h2>Monitoring filters and export-ready summaries</h2>
            </div>
            <span class="status-badge status-verified">PDF / CSV</span>
          </div>
          <div class="report-scope-grid">
            <div class="report-scope-card"><span>DH</span><strong>Lacking duty hours</strong><p>Students, groups, CI, hospital, area, term, status.</p></div>
            <div class="report-scope-card"><span>CC</span><strong>Clinical case progress</strong><p>Completed, lacking, pending, verified, and not applicable cases.</p></div>
            <div class="report-scope-card"><span>AT</span><strong>Attendance records</strong><p>On time, late, absent, incomplete, verified, and overridden entries.</p></div>
            <div class="report-scope-card"><span>GP</span><strong>Group and term progress</strong><p>Semester/term progress by group, CI, hospital, and rotation.</p></div>
          </div>
        </section>
      `);
    };

    const enhanceProgressReadiness = () => {
      if (isInstructor) {
        return;
      }

      if (!["student-progress.html", "instructor-student-view.html", "student-progress-detail.html", "completion-status.html", "pending-requirements.html", "chair-student-progress.html"].includes(page)) {
        return;
      }

      appendMain("future-clearance-readiness", `
        <section class="workspace-panel clearance-ready-panel">
          <div class="future-ready">
            <div class="card-icon">CR</div>
            <div>
              <p class="section-kicker">Future-ready Indicator</p>
              <h2>Clearance readiness snapshot</h2>
              <p class="panel-note">This remains a progress/status indicator only: completed requirements, pending duty hours, pending clinical cases, and items needing validation.</p>
            </div>
            <span class="status-badge status-pending">Not final clearance</span>
          </div>
        </section>
      `);
    };

    const removeStudentDutyHours = () => {
      if (!isStudent) {
        return;
      }

      const studentDutyPages = new Set([
        "record-duty-hours.html",
        "duty-history.html",
        "duty-detail.html",
        "duty-progress.html",
        "duty-verification.html"
      ]);
      const dutyHrefPattern = /(record-duty-hours|duty-history|duty-detail|duty-progress|duty-verification)\.html/i;

      all("a[href]").forEach((link) => {
        const href = link.getAttribute("href") || "";

        if (!dutyHrefPattern.test(href)) {
          return;
        }

        const container = link.closest(".not-found-link-card, .requirement-item.action-item, .help-topic-card");
        (container || link).remove();
      });

      all(".stat-card, .progress-breakdown-item, .progress-summary-card, .report-scope-card, .workflow-card, .schedule-lock-card, .about-module-card, .help-topic-card, .help-faq-item, .requirement-item, .activity-item").forEach((card) => {
        if (/duty hour/i.test(card.textContent)) {
          card.remove();
        }
      });

      all("select").forEach((select) => {
        Array.from(select.options).forEach((option) => {
          if (/duty hours|duty report|lacking duty/i.test(option.textContent)) {
            option.remove();
          }
        });
      });

      all("p, span, strong").forEach((item) => {
        if (item.closest(".nav-icon, .icon-button, svg")) {
          return;
        }

        const updatedText = item.textContent
          .replace("Your duty hours, case records, and assigned schedule are ready for review.", "Your clinical case records and assigned schedule are ready for review.")
          .replace("See duty hours, case logs, schedule compliance, and validation status in one place.", "See case logs, schedule compliance, and validation status in one place.")
          .replace("Completed records include verified duty hours and approved clinical case logs.", "Completed records include approved clinical case logs and schedule compliance updates.")
          .replace("completed requirements, pending duty hours, pending clinical cases, and items needing validation.", "completed requirements, pending clinical cases, and items needing validation.")
          .replace("Manage duty hours, case logs, schedules, validation updates, progress, and reports in one secure workspace.", "Manage case logs, schedules, validation updates, progress, and reports in one secure workspace.")
          .replace("Records duty hours, submits cases, checks schedules, and monitors progress.", "Submits cases, checks schedules, and monitors progress.")
          .replace("Track completed hours, pending requirements, and completion status.", "Track clinical case progress, pending requirements, and completion status.")
          .replace("Review duty hours, case logs, schedules, completion status, and export-ready summaries.", "Review case logs, schedules, completion status, and export-ready summaries.");

        if (updatedText !== item.textContent) {
          item.textContent = updatedText;
        }
      });

      all("input[placeholder], textarea[placeholder]").forEach((field) => {
        field.placeholder = field.placeholder
          .replace("Search duty hours, case logs, schedules, reports", "Search case logs, schedules, reports")
          .replace("duty hours, ", "");
      });

      if (studentDutyPages.has(page)) {
        setText(".topbar-title p", "Student Workspace");
        setText(".topbar-title h1", "Module Unavailable");
        document.title = "NurseTrack | Student Workspace";

        const main = one("main.workspace");

        if (main) {
          main.className = "workspace dashboard-workspace";
          main.innerHTML = `
            <section class="workspace-hero dashboard-hero">
              <div>
                <p class="section-kicker">Student Access</p>
                <h2>This function is not available in the Nursing Student role.</h2>
                <p>Students can view schedules, submit clinical cases, check progress, and review validation updates. Monitoring and verification for this area are handled by the Clinical Instructor and Chair workflows.</p>
              </div>
              <a class="primary-button workspace-action button-link" href="view-schedule.html">View schedule</a>
            </section>

            <section class="dashboard-stats" aria-label="Student available modules">
              <article class="workspace-card stat-card">
                <div class="workspace-card-header">
                  <span class="card-icon">Clinical cases</span>
                  <span class="status-badge status-pending">Pending</span>
                </div>
                <h3>Clinical cases</h3>
                <p>Submit DR/OR case records for CI validation.</p>
              </article>

              <article class="workspace-card stat-card">
                <div class="workspace-card-header">
                  <span class="card-icon">Schedule</span>
                  <span class="status-badge status-verified">Assigned</span>
                </div>
                <h3>Schedule</h3>
                <p>View Chair-published hospital, area, shift, and assigned CI.</p>
              </article>

              <article class="workspace-card stat-card">
                <div class="workspace-card-header">
                  <span class="card-icon">Progress</span>
                  <span class="status-badge status-pending">In progress</span>
                </div>
                <h3>Progress</h3>
                <p>Track clinical case completion and validation status.</p>
              </article>
            </section>
          `;
        }
      }
    };

    normalizeSidebarBrandLink();
    simplifyTopbarActions();
    enhanceStudentInstructorTopbar();
    enhanceRoleSidebars();
    simplifyRepeatedExtras();
    simplifyHelpPages();
    simplifyNotificationCategories();
    simplifyAssignedSchedulePage();
    simplifyChairGuide4();
    normalizeHospitalWardSelects();

    if (enforceRoleOwnership()) {
      return;
    }

    if (redirectDeprecatedChairValidation()) {
      return;
    }

    if (enhanceLegacyAdminRouteNotice()) {
      return;
    }

    if (enhanceRemovedAdminFeatureNotice()) {
      return;
    }

    enhanceEnrollmentProgressView();
    enhanceCiRecommendationsFlow();
    enhanceChairTerminology();
    enhanceChairSchedules();
    enhanceUserImportPages();
    enhanceStudentSchedule();
    enhanceDutyEntry();
    enhanceCaseEntry();
    enhanceCaseHistory();
    enhanceInstructorValidation();
    enhanceAttendanceMonitoring();
    enhanceInstructorScheduling();
    removeStudentDutyHours();

    if (isAdminExperience) {
      applyAdminIdentity();
    } else if (isCoordinatorRole) {
      applyCoordinatorIdentity();
    } else if (isEnrollmentRole) {
      applyEnrollmentIdentity();
    } else if (isAssistantRole) {
      applyAssistantIdentity();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
