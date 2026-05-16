// Matches the actual backend UserRole enum:
// STUDENT, INSTRUCTOR, ADMIN, CHAIR, COORDINATOR, ENROLLMENT, ASSISTANT
export type UserRole =
  | 'STUDENT'
  | 'INSTRUCTOR'
  | 'ADMIN'
  | 'CHAIR'
  | 'COORDINATOR'
  | 'ENROLLMENT'
  | 'ASSISTANT';

export type UserStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'SUSPENDED';

// Matches the actual backend User entity fields
export interface User {
  id: number;
  schoolId: string;
  fullName: string;
  email: string;
  mobileNumber?: string;
  role: UserRole;
  sectionInfo?: string;
  profileImageUrl?: string;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
  profileCompletionPercentage?: number;
}

// Maps a backend UserRole to its frontend URL basepath
export const roleToBasePath: Record<UserRole, string> = {
  ADMIN: '/admin',
  CHAIR: '/chair',
  ASSISTANT: '/assistant',
  INSTRUCTOR: '/clinical-instructor',
  COORDINATOR: '/coordinator',
  ENROLLMENT: '/enrollment-team',
  STUDENT: '/nursing-student',
};
