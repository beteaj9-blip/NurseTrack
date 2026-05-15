import { ProfileContent } from "@/components/features/ProfileContent";

const user = {
  name: "Carlos Reyes",
  initials: "CR",
  context: "Chair",
  role: "Chair",
  email: "c.reyes@cit.edu",
  mobile: "+63 917 000 0001",
  schoolId: "CH-1001",
  lastLogin: "May 13, 2026 - 9:00 AM",
};

export default function ProfilePage() {
  return <ProfileContent user={user} />;
}
