import { ProfileContent } from "@/components/features/ProfileContent";

const user = {
  name: "System Admin",
  initials: "SA",
  context: "Administrator",
  role: "Admin",
  email: "admin@cit.edu",
  mobile: "+63 917 000 0004",
  schoolId: "AD-1001",
  lastLogin: "May 13, 2026 - 7:45 AM",
};

export default function ProfilePage() {
  return <ProfileContent user={user} />;
}
