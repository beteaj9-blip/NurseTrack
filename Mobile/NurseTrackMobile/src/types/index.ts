export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'COORDINATOR' | 'ENROLLMENT' | 'ADMIN' | 'CHAIR' | 'ASSISTANT';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE';

export interface User {
  id: number;
  fullName: string;
  email: string;
  mobileNumber: string;
  schoolId: string;
  sectionInfo: string;
  groupInfo: string;
  assignedLevels: number[];
  role: UserRole;
  status: UserStatus;
  profileImageUrl?: string;
  passwordHash?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}
