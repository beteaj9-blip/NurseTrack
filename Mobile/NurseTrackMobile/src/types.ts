export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' | 'CHAIR' | 'COORDINATOR' | 'ENROLLMENT' | 'ASSISTANT';

export type User = {
  id: number;
  schoolId: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'SUSPENDED';
  sectionInfo?: string;
  groupInfo?: string;
  assignedLevels?: number[];
  profileImageUrl?: string;
};

export type LoginResponse = {
  user: User;
  token: string;
};

export type MobileRoute = {
  key: string;
  label: string;
  description: string;
  endpoint?: string;
  feature?:
    | 'dashboard'
    | 'list'
    | 'manageAccess'
    | 'manageUsers'
    | 'hospitals'
    | 'notifications'
    | 'profile'
    | 'profileEdit'
    | 'clinicalCaseForm'
    | 'appealForm'
    | 'reports'
    | 'scheduleMaker'
    | 'sectionImport';
};
