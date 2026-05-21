"use client";

import React from "react";
import { ProfileContent } from "@/components/features/ProfileContent";
import { LoadingState } from "@/components/ui/LoadingState";
import { useCurrentUser } from "@/core/api/hooks/useUsers";
import { useAuthStore } from "@/core/store/authStore";
import { User } from "@/core/types/user";

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  CHAIR: "Chair",
  ASSISTANT: "Assistant",
  COORDINATOR: "Coordinator",
  ENROLLMENT: "Enrollment Team",
  INSTRUCTOR: "Clinical Instructor",
  STUDENT: "Nursing Student",
};

function getInitials(name?: string) {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

function getProfileCompletion(user: User) {
  const fields = [user.profileImageUrl, user.fullName, user.schoolId, user.email, user.mobileNumber];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

function getContext(user: User) {
  if (user.sectionInfo?.trim()) return user.sectionInfo;
  if (user.assignedLevels?.length) {
    const levels = [...user.assignedLevels].sort((a, b) => a - b);
    return levels.length === 1 ? `Level ${levels[0]}` : `Levels ${levels.join(", ")}`;
  }
  return roleLabels[user.role] ?? user.role;
}

function formatUpdatedAt(value?: string) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });
}

export function CurrentUserProfileContent() {
  const authUser = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const { data, isLoading } = useCurrentUser();
  const user = (data ?? authUser) as User | null;

  React.useEffect(() => {
    if (data) login(data);
  }, [data, login]);

  if (isLoading || !user) {
    return <main className="p-[clamp(24px,4vw,42px)]"><LoadingState message="Loading profile..." className="rounded-xl border border-[#e2e8f0] bg-white" /></main>;
  }

  const profileUser = {
    id: user.id,
    name: user.fullName,
    initials: getInitials(user.fullName),
    context: getContext(user),
    role: roleLabels[user.role] ?? user.role,
    email: user.email,
    mobile: user.mobileNumber ?? "",
    schoolId: user.schoolId,
    profileImageUrl: user.profileImageUrl ?? "",
    profileCompletionPercentage: getProfileCompletion(user),
    lastLogin: formatUpdatedAt(user.updatedAt),
  };

  return <ProfileContent key={`${user.id}-${user.updatedAt ?? "profile"}`} user={profileUser} />;
}
