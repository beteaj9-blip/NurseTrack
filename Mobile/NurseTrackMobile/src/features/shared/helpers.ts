import { AnyRecord } from './types';

export const resourceLabels: Record<string, string> = { users: 'User', schedules: 'Schedule', duties: 'Duty Record', cases: 'Clinical Case', appeals: 'Appeal', 'extension-days': 'Extension Day', clearances: 'Clearance', notifications: 'Notification', hospitals: 'Hospital', 'admin-access-permissions': 'Access Permission', checklist: 'Checklist Item', uploads: 'Upload' };

export function humanize(value: string) {
  return value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_=&]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase().replace(/(^|\s)(\w)/g, (_, space, letter) => `${space}${letter.toUpperCase()}`);
}

export function normalizeRecords(data: unknown): AnyRecord[] {
  if (Array.isArray(data)) return data.filter((item): item is AnyRecord => Boolean(item && typeof item === 'object'));
  if (data && typeof data === 'object' && Array.isArray((data as AnyRecord).sample)) return (data as AnyRecord).sample;
  if (data && typeof data === 'object') return [data as AnyRecord];
  return [];
}

export function asObject(data: unknown): AnyRecord {
  if (data && typeof data === 'object' && !Array.isArray(data)) return data as AnyRecord;
  return {};
}

export function recordTitle(record: AnyRecord) {
  return record.fullName ?? record.studentName ?? record.title ?? record.name ?? record.hospital ?? record.category ?? record.schoolId ?? `Record #${record.id ?? ''}`;
}

export function recordSubtitle(record: AnyRecord) {
  return record.email ?? record.schoolId ?? record.message ?? record.instructorName ?? record.caseDate ?? record.date ?? record.shiftDate ?? record.createdAt;
}

export function recordDetails(record: AnyRecord) {
  return Object.entries(record)
    .filter(([key, value]) => value !== null && value !== undefined && !['id', 'passwordHash', 'profileImageUrl'].includes(key) && typeof value !== 'object')
    .slice(0, 8);
}

export function labelize(value: string) {
  return value.replace(/([A-Z])/g, ' $1').replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim().replace(/^./, (char) => char.toUpperCase());
}

export function formatValue(value: unknown) {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

export function compactJson(value: unknown) {
  const text = JSON.stringify(value, null, 2);
  return text.length > 1200 ? `${text.slice(0, 1200)}...` : text;
}

export function isUnread(record: AnyRecord) {
  return record.read === false || record.isRead === false;
}

export function dateIsFuture(value?: string) {
  if (!value) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${value.split('T')[0]}T00:00:00`).getTime() > today.getTime();
}

export function shortDate(value?: string) {
  if (!value) return 'No date';
  return new Date(`${value.split('T')[0]}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getCaseType(category: string, dutyArea: string) {
  const combined = `${category} ${dutyArea}`.toLowerCase();
  if (combined.includes('operating') || combined.includes('major') || combined.includes('minor')) return 'OPERATING_ROOM';
  if (combined.includes('delivery') || combined.includes('newborn') || combined.includes('labor')) return 'DELIVERY_ROOM';
  return 'WARD';
}
