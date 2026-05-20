import React from 'react';
import { NavItem } from '@/components/ui/dashboard/Sidebar';

const DashboardIcon = <><rect x="3" y="3" width="7" height="8" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="15" width="7" height="6" rx="1.5" /></>;
const SchedulesIcon = <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4" /><path d="M16 3v4" /><path d="M4 10h16" /><path d="m8 15 2 2 4-5" /></>;
const LiveAttendanceIcon = <><path d="M4 12a8 8 0 0 1 16 0" /><path d="M7.5 12a4.5 4.5 0 0 1 9 0" /><circle cx="12" cy="13" r="2" /><path d="M12 15v5" /></>;
const ManualBackupIcon = <><path d="M12 8v5l3 2" /><path d="M3.5 12a8.5 8.5 0 1 0 2.4-5.9" /><path d="M3.5 5.5v5h5" /></>;
const StudentProgressIcon = <><path d="M4 19V5" /><path d="M4 19h16" /><path d="m7 15 4-4 3 3 5-7" /></>;
const ExtensionDaysIcon = <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4" /><path d="M16 3v4" /><path d="M4 10h16" /><path d="M12 14v5" /><path d="M9.5 16.5h5" /></>;
const ClearanceIcon = <><path d="M12 3 20 7v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Z" /><path d="m8 12 2.5 2.5L16 9" /><path d="M8 18h8" /></>;
const ClinicalCasesIcon = <><path d="M8 3h6l4 4v14H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M14 3v5h5" /><path d="m9.5 14 1.6 1.6 3.4-4" /></>;
const CiRecommendationsIcon = <><path d="M4 5h16v11H8l-4 4V5Z" /><path d="M8 9h8" /><path d="M8 13h5" /><path d="m15 17 2 2 4-5" /></>;
const OvertimeDetailsIcon = <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>;
const ReportsIcon = <><path d="M4 19V5" /><path d="M4 19h16" /><rect x="7" y="11" width="2.5" height="5" /><rect x="11.25" y="8" width="2.5" height="8" /><rect x="15.5" y="6" width="2.5" height="10" /></>;
const ManageUsersIcon = <><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><circle cx="17" cy="10" r="2.5" /><path d="M14.5 19a4.5 4.5 0 0 1 6.5-4" /></>;
const ManageAccessIcon = <><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 9.4-3.9" /><circle cx="17" cy="17" r="3" /><path d="M17 14v-2" /><path d="M17 22v-2" /><path d="M20 17h2" /><path d="M12 17h2" /></>;
const SectionImportIcon = <><path d="M5 4h10l4 4v12H5z" /><path d="M15 4v5h5" /><path d="M8 14h8" /><path d="M8 17h5" /><path d="M10 11h4" /><path d="M12 9v4" /></>;
const HospitalsIcon = <><path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" /><path d="M16 8h2a2 2 0 0 1 2 2v11" /><path d="M8 7h4" /><path d="M8 11h4" /><path d="M8 15h4" /><path d="M3 21h18" /></>;

export const roleNavConfigs: Record<string, Omit<NavItem, 'isActive'>[]> = {
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: DashboardIcon },
    { label: "Manage Users", href: "/admin/manage-users", icon: ManageUsersIcon },
    { label: "Manage Access", href: "/admin/manage-access", icon: ManageAccessIcon },
    { label: "Section Import", href: "/admin/section-import", icon: SectionImportIcon },
    { label: "Hospitals / Duty Areas", href: "/admin/hospitals", icon: HospitalsIcon },
    { label: "Schedules", href: "/admin/schedules", icon: SchedulesIcon },
    { label: "Live Attendance", href: "/admin/live-attendance", icon: LiveAttendanceIcon },
    { label: "Manual Backup", topbarTitle: "Manual Attendance Review", href: "/admin/manual-backup", icon: ManualBackupIcon },
    { label: "Student Progress", href: "/admin/student-progress", icon: StudentProgressIcon },
    { label: "Extension Days", href: "/admin/extension-days", icon: ExtensionDaysIcon },
    { label: "Clearance", href: "/admin/clearance", icon: ClearanceIcon },
    { label: "Clinical Cases", href: "/admin/clinical-cases", icon: ClinicalCasesIcon },
    { label: "CI Recommendations", href: "/admin/ci-recommendations", icon: CiRecommendationsIcon },
    { label: "Overtime Details", href: "/admin/overtime-details", icon: OvertimeDetailsIcon },
    { label: "Reports", href: "/admin/reports", icon: ReportsIcon },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: SectionImportIcon },
  ],
  chair: [
    { label: "Dashboard", href: "/chair/dashboard", icon: DashboardIcon },
    { label: "Schedules", href: "/chair/schedules", icon: SchedulesIcon },
    { label: "Live Attendance", href: "/chair/live-attendance", icon: LiveAttendanceIcon },
    { label: "Manual Backup", topbarTitle: "Manual Attendance Review", href: "/chair/manual-backup", icon: ManualBackupIcon },
    { label: "Student Progress", href: "/chair/student-progress", icon: StudentProgressIcon },
    { label: "Extension Days", href: "/chair/extension-days", icon: ExtensionDaysIcon },
    { label: "Clearance", href: "/chair/clearance", icon: ClearanceIcon },
    { label: "Clinical Cases View", href: "/chair/clinical-cases", icon: ClinicalCasesIcon },
    { label: "CI Recommendations", href: "/chair/ci-recommendations", icon: CiRecommendationsIcon },
    { label: "Overtime Details", href: "/chair/overtime-details", icon: OvertimeDetailsIcon },
    { label: "Generate Report", href: "/chair/reports", icon: ReportsIcon },
  ],
  assistant: [
    { label: "Dashboard", href: "/assistant/dashboard", icon: DashboardIcon },
    { label: "Schedules", href: "/assistant/schedules", icon: SchedulesIcon },
    { label: "Live Attendance", href: "/assistant/live-attendance", icon: LiveAttendanceIcon },
    { label: "Manual Backup", topbarTitle: "Manual Attendance Review", href: "/assistant/manual-backup", icon: ManualBackupIcon },
    { label: "Student Progress", href: "/assistant/student-progress", icon: StudentProgressIcon },
    { label: "Extension Days", href: "/assistant/extension-days", icon: ExtensionDaysIcon },
    { label: "Clearance", href: "/assistant/clearance", icon: ClearanceIcon },
    { label: "Clinical Cases View", href: "/assistant/clinical-cases", icon: ClinicalCasesIcon },
    { label: "CI Recommendations", href: "/assistant/ci-recommendations", icon: CiRecommendationsIcon },
    { label: "Overtime Details", href: "/assistant/overtime-details", icon: OvertimeDetailsIcon },
    { label: "Generate Report", href: "/assistant/reports", icon: ReportsIcon },
  ],
  coordinator: [
    { label: "Dashboard", href: "/coordinator/dashboard", icon: DashboardIcon },
    { label: "Schedules", href: "/coordinator/schedules", icon: SchedulesIcon },
    { label: "Live Attendance", href: "/coordinator/live-attendance", icon: LiveAttendanceIcon },
    { label: "Manual Backup", topbarTitle: "Manual Attendance Review", href: "/coordinator/manual-backup", icon: ManualBackupIcon },
    { label: "Student Progress", href: "/coordinator/student-progress", icon: StudentProgressIcon },
    { label: "Extension Days", href: "/coordinator/extension-days", icon: ExtensionDaysIcon },
    { label: "Clearance", href: "/coordinator/clearance", icon: ClearanceIcon },
    { label: "Clinical Cases View", href: "/coordinator/clinical-cases", icon: ClinicalCasesIcon },
    { label: "CI Recommendations", href: "/coordinator/ci-recommendations", icon: CiRecommendationsIcon },
    { label: "Overtime Details", href: "/coordinator/overtime-details", icon: OvertimeDetailsIcon },
    { label: "Generate Report", href: "/coordinator/reports", icon: ReportsIcon },
  ],
  "clinical-instructor": [
    { label: "Dashboard", href: "/clinical-instructor/dashboard", icon: DashboardIcon },
    { label: "Assigned Schedules", href: "/clinical-instructor/schedules", icon: SchedulesIcon },
    { label: "Manual Backup", topbarTitle: "Manual Attendance", href: "/clinical-instructor/manual-backup", icon: ManualBackupIcon },
    { label: "Clinical Cases Review", href: "/clinical-instructor/clinical-cases", icon: ClinicalCasesIcon },
    { label: "Student Progress", href: "/clinical-instructor/student-progress", icon: StudentProgressIcon },
    { label: "Extension Days", href: "/clinical-instructor/extension-days", icon: ExtensionDaysIcon },
    { label: "Student Appeals", href: "/clinical-instructor/ci-recommendations", icon: CiRecommendationsIcon },
    { label: "Reports", href: "/clinical-instructor/reports", icon: ReportsIcon },
  ],
  "enrollment-team": [
    { label: "Student Progress", href: "/enrollment-team/student-progress", icon: StudentProgressIcon },
  ],
  "nursing-student": [
    { label: "Dashboard", href: "/nursing-student/dashboard", icon: DashboardIcon },
    { label: "Clinical Cases", href: "/nursing-student/clinical-cases", icon: ClinicalCasesIcon },
    { label: "Assigned Schedules", href: "/nursing-student/schedules", icon: SchedulesIcon },
    { label: "Progress", href: "/nursing-student/student-progress", icon: StudentProgressIcon },
    { label: "Student Appeals", href: "/nursing-student/appeals", icon: CiRecommendationsIcon },
    { label: "Reports", href: "/nursing-student/reports", icon: ReportsIcon },
  ],
};

export const roleUserContexts: Record<string, any> = {
  admin: { role: "Admin", userName: "Admin", userContext: "System Admin", avatarInitials: "AD" },
  chair: { role: "Chair", userName: "Chair", userContext: "Chair", avatarInitials: "CH" },
  assistant: { role: "Assistant", userName: "Assistant", userContext: "Chair Assistant", avatarInitials: "CA" },
  coordinator: { role: "Coordinator", userName: "Coordinator", userContext: "Coordinator", avatarInitials: "CO" },
  "clinical-instructor": { role: "Clinical Instructor", userName: "Clinical Instructor", userContext: "Clinical Instructor", avatarInitials: "CI" },
  "enrollment-team": { role: "Enrollment Team", userName: "Enrollment Office", userContext: "CIT-U Nursing", avatarInitials: "ET" },
  "nursing-student": { role: "Nursing Student", userName: "Student", userContext: "Nursing Student", avatarInitials: "NS" },
};
