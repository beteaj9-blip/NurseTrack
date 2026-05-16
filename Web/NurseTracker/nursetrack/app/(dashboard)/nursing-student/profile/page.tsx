"use client";

import { ProfileContent } from "@/components/features/ProfileContent";
import { useAuthStore } from "@/core/store/authStore";
import { User } from "@/core/types/user";

function getInitials(name?: string) {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

function getProfileCompletion(user?: User | null) {
  if (!user) return 0;
  if (user.profileCompletionPercentage != null) return user.profileCompletionPercentage;
  const fields = [user.fullName, user.email, user.mobileNumber, user.schoolId, user.sectionInfo, user.profileImageUrl];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  const profileUser = {
    id: user?.id,
    name: user?.fullName ?? "",
    initials: getInitials(user?.fullName),
    context: user?.sectionInfo ?? "Nursing Student",
    role: "Nursing Student",
    email: user?.email ?? "",
    mobile: user?.mobileNumber ?? "",
    schoolId: user?.schoolId ?? "",
    profileImageUrl: user?.profileImageUrl ?? "",
    profileCompletionPercentage: getProfileCompletion(user),
    lastLogin: user?.updatedAt
      ? new Date(user.updatedAt).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })
      : "—",
  };

  return <ProfileContent user={profileUser} />;
}
