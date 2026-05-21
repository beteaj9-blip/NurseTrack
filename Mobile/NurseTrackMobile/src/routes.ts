import { MobileRoute, User, UserRole } from './types';

export const roleSlugs: Record<UserRole, string> = {
  ADMIN: 'admin',
  CHAIR: 'chair',
  ASSISTANT: 'assistant',
  COORDINATOR: 'coordinator',
  INSTRUCTOR: 'clinical-instructor',
  STUDENT: 'nursing-student',
  ENROLLMENT: 'enrollment-team',
};

export const slugToRole: Record<string, UserRole> = Object.fromEntries(Object.entries(roleSlugs).map(([role, slug]) => [slug, role])) as Record<string, UserRole>;

export const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Admin',
  CHAIR: 'Chair',
  ASSISTANT: 'Assistant',
  COORDINATOR: 'Coordinator',
  INSTRUCTOR: 'Clinical Instructor',
  STUDENT: 'Nursing Student',
  ENROLLMENT: 'Enrollment Team',
};

const staffRoutes = [
  route('dashboard', 'Dashboard', 'Summary, counts, and quick actions.', '/metrics/overall', 'dashboard'),
  route('schedules', 'Schedules', 'Calendar and list view for duty schedules.'),
  route('schedules/day', 'Day Schedule', 'Roster and assignment view for one duty day.'),
  route('live-attendance', 'Live Attendance', 'Current attendance activity.'),
  route('manual-backup', 'Manual Backup', 'Manual attendance for existing schedules.'),
  route('manual-backup/review', 'Manual Review', 'Review manual attendance backups.'),
  route('manual-backup/review/detail', 'Manual Review Detail', 'Inspect a manual attendance review.'),
  route('student-progress', 'Student Progress', 'Student hour, case, and clearance progress.'),
  route('student-progress/detail', 'Progress Detail', 'Detailed student progress record.'),
  route('extension-days', 'Extension Days', 'Extension day requests and status.'),
  route('extension-days/detail', 'Extension Detail', 'Review one extension day record.'),
  route('clearance', 'Clearance', 'Clearance requirements and decisions.', '/clearances'),
  route('clearance/detail', 'Clearance Detail', 'Detailed clearance requirement review.', '/clearances'),
  route('clinical-cases', 'Clinical Cases View', 'Clinical case submissions and review state.'),
  route('clinical-cases/selection', 'Case Selection', 'Student clinical case selector.', '/cases/categories'),
  route('clinical-cases/validation', 'Case Validation', 'Validate clinical case submissions.'),
  route('ci-recommendations', 'CI Recommendations', 'Appeals and recommendations.'),
  route('ci-recommendations/detail', 'Recommendation Detail', 'Detailed appeal or recommendation review.'),
  route('overtime-details', 'Overtime Details', 'Overtime records and duty information.'),
  route('overtime-details/detail', 'Overtime Detail', 'Inspect one overtime record.'),
  route('reports', 'Reports', 'Generate and review reports.', undefined, 'reports'),
  route('notifications', 'Notifications', 'Recent notifications.', '/notifications/me', 'notifications'),
  route('profile', 'Profile', 'Account and role information.', '/users/me', 'profile'),
  route('profile/edit', 'Edit Profile', 'Update profile details.', '/users/me', 'profileEdit'),
  route('about', 'About', 'System information and support details.', '/system/about'),
];

const leadershipRoutes = staffRoutes;

const instructorRoutes = [
  route('dashboard', 'Dashboard', 'Assigned-section summary and quick actions.', '/metrics/overall', 'dashboard'),
  route('schedules', 'Assigned Schedules', 'Assigned schedule calendar and list.'),
  route('schedules/day', 'Day Schedule', 'Roster and assignment view for one duty day.'),
  route('live-attendance', 'Live Attendance', 'Current attendance activity.'),
  route('manual-backup', 'Manual Backup', 'Manual attendance for assigned schedules.'),
  route('manual-backup/review', 'Manual Review', 'Review manual attendance submissions.'),
  route('manual-backup/review/detail', 'Manual Review Detail', 'Inspect a manual attendance review.'),
  route('clinical-cases', 'Clinical Cases Review', 'Review student clinical case submissions.'),
  route('clinical-cases/selection', 'Case Selection', 'Student clinical case selector.', '/cases/categories'),
  route('clinical-cases/validation', 'Case Validation', 'Validate clinical case submissions.'),
  route('student-progress', 'Student Progress', 'Assigned student progress.'),
  route('student-progress/detail', 'Progress Detail', 'Detailed assigned student progress.'),
  route('extension-days', 'Extension Days', 'Assigned student extension days.'),
  route('extension-days/detail', 'Extension Detail', 'Review one extension day record.'),
  route('ci-recommendations', 'Student Appeals', 'Review and recommend student appeals.'),
  route('ci-recommendations/detail', 'Appeal Detail', 'Detailed student appeal review.'),
  route('reports', 'Reports', 'Assigned-section reporting.', undefined, 'reports'),
  route('notifications', 'Notifications', 'Recent notifications.', '/notifications/me', 'notifications'),
  route('profile', 'Profile', 'Account and role information.', '/users/me', 'profile'),
  route('profile/edit', 'Edit Profile', 'Update profile details.', '/users/me', 'profileEdit'),
  route('about', 'About', 'System information and support details.', '/system/about'),
];

export const roleRoutes: Record<UserRole, MobileRoute[]> = {
  ADMIN: [
    route('dashboard', 'Dashboard', 'System-wide summary and quick actions.', '/metrics/overall', 'dashboard'),
    route('manage-users', 'Manage Users', 'Create, search, update, and review users.', '/users', 'manageUsers'),
    route('manage-access', 'Manage Access', 'Control Assistant and Coordinator feature access.', undefined, 'manageAccess'),
    route('section-import', 'Section Import', 'Import and reconcile section assignments.', '/users', 'sectionImport'),
    route('hospitals', 'Hospitals / Duty Areas', 'Maintain hospitals and duty areas.', '/hospitals', 'hospitals'),
    route('schedules', 'Schedules', 'Calendar and list view for all duty schedules.'),
    route('schedules/day', 'Day Schedule', 'Daily roster management and assignments.'),
    route('schedules/maker', 'Schedule Maker', 'Create and publish schedule groups.', undefined, 'scheduleMaker'),
    route('live-attendance', 'Live Attendance', 'Current attendance activity across levels.'),
    route('manual-backup', 'Manual Backup', 'Create manual attendance for existing schedules.'),
    route('manual-backup/review', 'Manual Review', 'Review submitted manual attendance backups.'),
    route('manual-backup/review/detail', 'Manual Review Detail', 'Inspect a manual attendance review.'),
    route('student-progress', 'Student Progress', 'Student hour, case, and clearance progress.'),
    route('student-progress/detail', 'Progress Detail', 'Detailed student progress record.'),
    route('extension-days', 'Extension Days', 'Extension day requests and status.'),
    route('extension-days/detail', 'Extension Detail', 'Review one extension day record.'),
    route('clearance', 'Clearance', 'Clearance requirements and decisions.', '/clearances'),
    route('clearance/detail', 'Clearance Detail', 'Detailed clearance requirement review.', '/clearances'),
    route('clinical-cases', 'Clinical Cases', 'Clinical case submissions and review state.'),
    route('clinical-cases/selection', 'Case Selection', 'Student clinical case selector.', '/cases/categories'),
    route('clinical-cases/validation', 'Case Validation', 'Validate clinical case submissions.'),
    route('ci-recommendations', 'CI Recommendations', 'Appeals and recommendations.'),
    route('ci-recommendations/detail', 'Recommendation Detail', 'Detailed appeal or recommendation review.'),
    route('overtime-details', 'Overtime Details', 'Overtime records and duty information.'),
    route('overtime-details/detail', 'Overtime Detail', 'Inspect one overtime record.'),
    route('reports', 'Reports', 'Generate and review reports.', undefined, 'reports'),
    route('audit-logs', 'Audit Logs', 'User and system activity audit trail.', '/audit-logs'),
    route('notifications', 'Notifications', 'Recent notifications.', '/notifications/me', 'notifications'),
    route('profile', 'Profile', 'Account and role information.', '/users/me', 'profile'),
    route('profile/edit', 'Edit Profile', 'Update profile details.', '/users/me', 'profileEdit'),
    route('about', 'About', 'System information and support details.', '/system/about'),
  ],
  CHAIR: [route('schedules/maker', 'Schedule Maker', 'Create and publish schedule groups.', undefined, 'scheduleMaker'), ...leadershipRoutes],
  COORDINATOR: [route('schedules/maker', 'Schedule Maker', 'Create and publish schedule groups.', undefined, 'scheduleMaker'), ...leadershipRoutes],
  ASSISTANT: leadershipRoutes,
  INSTRUCTOR: instructorRoutes,
  STUDENT: [
    route('dashboard', 'Dashboard', 'Student duty summary and quick actions.', '/metrics/overall', 'dashboard'),
    route('clinical-cases', 'Clinical Cases', 'Your submitted clinical cases.'),
    route('clinical-cases/add', 'Add Clinical Case', 'Submit a clinical case from your schedule.', undefined, 'clinicalCaseForm'),
    route('clinical-cases/detail', 'Case Detail', 'View a clinical case submission.'),
    route('schedules', 'Assigned Schedules', 'Your assigned schedule calendar and list.'),
    route('schedules/day', 'Day Schedule', 'Your duty details for one day.'),
    route('student-progress', 'Progress', 'Your duty hours, cases, and requirements.'),
    route('appeals', 'Student Appeals', 'Create and track appeals.', undefined, 'appealForm'),
    route('appeals/detail', 'Appeal Detail', 'View or update one appeal.'),
    route('reports', 'Reports', 'Your downloadable reports.', undefined, 'reports'),
    route('notifications', 'Notifications', 'Recent notifications.', '/notifications/me', 'notifications'),
    route('profile', 'Profile', 'Account and student information.', '/users/me', 'profile'),
    route('profile/edit', 'Edit Profile', 'Update profile details.', '/users/me', 'profileEdit'),
    route('about', 'About', 'System information and support details.', '/system/about'),
  ],
  ENROLLMENT: [
    route('student-progress', 'Student Progress', 'Review student progress.'),
    route('student-progress/detail', 'Progress Detail', 'Detailed student progress record.'),
    route('notifications', 'Notifications', 'Recent notifications.', '/notifications/me', 'notifications'),
    route('profile', 'Profile', 'Account and role information.', '/users/me', 'profile'),
    route('profile/edit', 'Edit Profile', 'Update profile details.', '/users/me', 'profileEdit'),
    route('about', 'About', 'System information and support details.', '/system/about'),
  ],
};

export function resolveRouteEndpoint(route: MobileRoute, user: User) {
  if (route.endpoint) return route.endpoint;
  if (route.key.startsWith('schedules')) return user.role === 'STUDENT' ? '/schedules/student' : user.role === 'INSTRUCTOR' ? '/schedules/instructor' : '/schedules/all';
  if (route.key.includes('manual-backup') || route.key.includes('overtime') || route.key.includes('live-attendance') || route.key.includes('student-progress')) return user.role === 'STUDENT' ? '/duties/student' : user.role === 'INSTRUCTOR' ? '/duties/instructor' : '/duties';
  if (route.key.startsWith('extension-days')) return user.role === 'STUDENT' ? '/extension-days/student' : user.role === 'INSTRUCTOR' ? '/extension-days/instructor' : '/extension-days';
  if (route.key.startsWith('clinical-cases')) return user.role === 'STUDENT' ? '/cases/student' : user.role === 'INSTRUCTOR' ? '/cases/instructor' : '/cases';
  if (route.key.startsWith('appeals') || route.key.startsWith('ci-recommendations')) return user.role === 'STUDENT' ? '/appeals/student' : user.role === 'INSTRUCTOR' ? '/appeals/instructor' : '/appeals';
  if (route.key === 'reports') return user.role === 'STUDENT' ? '/reports/student' : '/metrics/overall';
  return undefined;
}

function route(key: string, label: string, description: string, endpoint?: string, feature?: MobileRoute['feature']): MobileRoute {
  return { key, label, description, endpoint, feature };
}
