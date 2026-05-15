import { ProfileContent } from "@/components/features/ProfileContent";

const user = {
  name: "Chair Assistant",
  initials: "CA",
  context: "Chair Assistant",
  role: "Assistant",
  email: "assistant@cit.edu",
  mobile: "+63 917 000 0010",
  schoolId: "CA-1001",
  lastLogin: "May 13, 2026 – 9:10 AM",
};

export default function ProfilePage() {
  return <ProfileContent user={user} />;
}
