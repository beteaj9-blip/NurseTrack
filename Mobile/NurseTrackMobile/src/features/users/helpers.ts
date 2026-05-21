import { ApiUser, AnyRecord, DisplayUser } from '../shared/types';
import { humanize } from '../shared/helpers';
import { UserRole } from '../../types';

export const manageUserRoles = [
  { value: 'student', api: 'STUDENT', label: 'Nursing Student' },
  { value: 'instructor', api: 'INSTRUCTOR', label: 'Clinical Instructor' },
  { value: 'chair', api: 'CHAIR', label: 'Chair' },
  { value: 'admin', api: 'ADMIN', label: 'Admin' },
  { value: 'coordinator', api: 'COORDINATOR', label: 'Coordinator' },
  { value: 'enrollment', api: 'ENROLLMENT', label: 'Enrollment Team' },
  { value: 'assistant', api: 'ASSISTANT', label: 'Assistant' },
] satisfies { value: string; api: UserRole; label: string }[];

export const statusOptions = [
  { value: 'all', api: '', label: 'All status' },
  { value: 'active', api: 'ACTIVE', label: 'Active' },
  { value: 'deactivated', api: 'SUSPENDED', label: 'Deactivated' },
];

export const sectionDefaults = ['BSN 1A', 'BSN 1B', 'BSN 2A', 'BSN 2B', 'BSN 3A', 'BSN 3B', 'BSN 4A', 'BSN 4B'];
export const usersPerPage = 10;

export function toDisplayUser(record: AnyRecord): DisplayUser {
  const api = record as ApiUser;
  return { api, name: api.fullName, email: api.email, role: roleLabel(api.role), id: api.schoolId, section: api.sectionInfo ?? '', group: api.groupInfo ?? '', level: levelLabel(api.assignedLevels), status: statusLabel(api.status), initials: initials(api.fullName), profileImageUrl: api.profileImageUrl ?? '', roleValue: roleValue(api.role) };
}

export function withoutLetters(value: string) {
  return value.replace(/[A-Za-z]/g, '');
}

export function passwordInitials(name: string) {
  return name.split(' ').filter(Boolean).map((part) => part[0]?.toUpperCase()).join('') || 'U';
}

export function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'U';
}

export function resetPasswordValue(user: DisplayUser) {
  return `${passwordInitials(user.name)}#${user.id}`;
}

export function roleApi(value: string): UserRole {
  return manageUserRoles.find((role) => role.value === value)?.api ?? 'STUDENT';
}

export function roleValue(value: string) {
  return manageUserRoles.find((role) => role.api === value)?.value ?? value.toLowerCase();
}

export function roleLabel(value: string) {
  return manageUserRoles.find((role) => role.api === value)?.label ?? humanize(value);
}

export function statusLabel(value: string) {
  return value === 'SUSPENDED' ? 'Deactivated' : humanize(value);
}

export function statusApi(value: string) {
  return statusOptions.find((status) => status.value === value.toLowerCase() || status.label === value)?.api || 'ACTIVE';
}

export function levelLabel(levels?: number[]) {
  const normalized = Array.from(new Set(levels ?? [])).sort((a, b) => a - b);
  if (!normalized.length) return 'Not set';
  return normalized.length === 1 ? `Level ${normalized[0]}` : `Levels ${normalized.join(', ')}`;
}

export function assignedLevelsForRole(role: string, value: string) {
  if (roleApi(role) === 'COORDINATOR') return '1,2,3,4';
  if (roleApi(role) === 'INSTRUCTOR') return value.split(',')[0]?.trim() || '1';
  return value || '1';
}
