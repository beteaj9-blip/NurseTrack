import { ProfileContent } from "@/components/features/ProfileContent";

const user = {
  name: "Ana Santos",
  initials: "AS",
  context: "Coordinator",
  role: "Coordinator",
  email: "a.santos@cit.edu",
  mobile: "+63 917 000 0003",
  schoolId: "CO-1001",
  lastLogin: "May 13, 2026 - 8:00 AM",
};

export default function ProfilePage() {
  return <ProfileContent user={user} />;
}
