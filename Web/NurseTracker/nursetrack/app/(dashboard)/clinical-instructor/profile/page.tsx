import { ProfileContent } from "@/components/features/ProfileContent";

const user = {
  name: "Patricia Reyes",
  initials: "PR",
  context: "BSN 3A - CCMC",
  role: "Clinical Instructor",
  email: "p.reyes@cit.edu",
  mobile: "+63 917 000 0002",
  schoolId: "CI-1002",
  lastLogin: "May 13, 2026 - 8:30 AM",
};

export default function ProfilePage() {
  return <ProfileContent user={user} />;
}
