import { ProfileContent } from "@/components/features/ProfileContent";

const user = {
  name: "Enrollment Office",
  initials: "ET",
  context: "CIT-U Nursing",
  role: "Enrollment Team",
  email: "enrollment@cit.edu",
  mobile: "+63 917 000 0005",
  schoolId: "ET-1001",
  lastLogin: "May 13, 2026 - 8:15 AM",
};

export default function ProfilePage() {
  return <ProfileContent user={user} />;
}
