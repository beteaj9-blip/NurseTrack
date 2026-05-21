import { MobileRoute, User, UserRole } from '../../types';

export type FeatureScreenProps = {
  route: MobileRoute;
  token: string | null;
  user: User;
};

export type SectionProps = {
  route: MobileRoute;
  token: string | null;
  user: User;
  data: unknown;
  loading: boolean;
  message: string;
  setMessage: (value: string) => void;
  refresh: () => void;
};

export type AnyRecord = Record<string, any>;

export type AuditLog = {
  id: number;
  actor: string;
  actorRole: string;
  action: string;
  recordName: string;
  context?: string;
  category?: string;
  occurredAt: string;
};

export type ApiUser = {
  id: number;
  fullName: string;
  email: string;
  mobileNumber?: string;
  schoolId: string;
  role: UserRole;
  sectionInfo?: string;
  groupInfo?: string;
  assignedLevels?: number[];
  profileImageUrl?: string;
  status: string;
};

export type DisplayUser = {
  api: ApiUser;
  name: string;
  email: string;
  role: string;
  id: string;
  section: string;
  group: string;
  level: string;
  status: string;
  initials: string;
  profileImageUrl: string;
  roleValue: string;
};
