"use client";

import { ProfileContent } from "@/components/features/ProfileContent";
import { useAuthStore } from "@/core/store/authStore";

function getInitials(name?: string) {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  const profileUser = {
    name: user?.fullName ?? "",
    initials: getInitials(user?.fullName),
    context: user?.sectionInfo ?? "Nursing Student",
    role: "Nursing Student",
    email: user?.email ?? "",
    mobile: user?.mobileNumber ?? "",
    schoolId: user?.schoolId ?? "",
    lastLogin: user?.updatedAt
      ? new Date(user.updatedAt).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })
      : "—",
  };

  return <ProfileContent user={profileUser} />;
}
