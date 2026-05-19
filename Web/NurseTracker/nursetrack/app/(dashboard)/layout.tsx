"use client";

import React, { useState, useEffect } from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { Sidebar } from "@/components/ui/dashboard/Sidebar";
import { Topbar } from "@/components/ui/dashboard/Topbar";
import { usePathname, useRouter } from "next/navigation";
import { roleNavConfigs } from "@/core/config/navConfig";
import { useAuthStore } from "@/core/store/authStore";
import { User, UserRole } from "@/core/types/user";

// Maps URL path segment → display info
const roleDisplayMap: Record<string, { label: string; urlSegment: string }> = {
  admin:                { label: "Admin",              urlSegment: "admin" },
  chair:                { label: "Chair",              urlSegment: "chair" },
  assistant:            { label: "Assistant",          urlSegment: "assistant" },
  coordinator:          { label: "Coordinator",        urlSegment: "coordinator" },
  "clinical-instructor":{ label: "Clinical Instructor",urlSegment: "clinical-instructor" },
  "enrollment-team":    { label: "Enrollment Team",   urlSegment: "enrollment-team" },
  "nursing-student":    { label: "Nursing Student",   urlSegment: "nursing-student" },
};

function getInitials(fullName?: string): string {
  if (!fullName) return "U";
  return fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const role = pathname.split("/")[1];
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [routeAnimating, setRouteAnimating] = useState(true);
  const activeFetches = useIsFetching();
  const activeMutations = useIsMutating();
  const [showNetworkLoading, setShowNetworkLoading] = useState(false);

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const logout = useAuthStore((state) => state.logout);

  // Auth guard — only redirect AFTER Zustand has finished loading from localStorage
  useEffect(() => {
    if (hasHydrated && (!isAuthenticated || !user || !token)) {
      logout();
      router.replace("/");
    }
  }, [hasHydrated, isAuthenticated, user, token, logout, router]);

  useEffect(() => {
    setRouteAnimating(true);
  }, [pathname]);

  useEffect(() => {
    if (activeFetches + activeMutations > 0) {
      const timeout = window.setTimeout(() => setShowNetworkLoading(true), 180);
      return () => window.clearTimeout(timeout);
    }
    setShowNetworkLoading(false);
  }, [activeFetches, activeMutations]);

  // Show nothing until hydration is complete (prevents flash redirect)
  if (!hasHydrated) return null;
  if (!isAuthenticated || !user || !token) return null;

  // Validate role segment
  if (!role || !roleNavConfigs[role]) {
    return <>{children}</>;
  }

  const rawNavItems = roleNavConfigs[role];
  const roleDisplay = roleDisplayMap[role];

  const navItems = rawNavItems.map((nav) => ({
    ...nav,
    isActive:
      pathname === nav.href ||
      (pathname.startsWith(nav.href + "/") &&
        nav.href !== `/${role}/dashboard`),
  }));

  const activeNav = navItems.find((nav) => nav.isActive) || navItems[0];
  const isSubPage =
    pathname !== activeNav.href &&
    pathname.startsWith(activeNav.href + "/");

  const getBackHref = () => {
    if (!isSubPage) return undefined;
    const parts = pathname.split("/");
    parts.pop();
    const parentPath = parts.join("/");
    return parentPath.length < activeNav.href.length
      ? activeNav.href
      : parentPath;
  };

  let displayTitle = activeNav.topbarTitle || activeNav.label;
  let titleKicker = `${roleDisplay?.label || role} Workspace`;
  let backHref = getBackHref();

  // Dynamic overrides for sub-pages
  if (pathname.includes("/student-progress/detail")) displayTitle = "Student Progress Detail";
  if (pathname.includes("/clinical-cases/selection")) displayTitle = "Select Clinical Case";
  if (pathname.includes("/clinical-cases/validation")) displayTitle = "Case Validation";
  if (pathname.includes("/clinical-cases/detail")) displayTitle = "Case Detail";
  if (pathname.includes("/clearance/detail")) displayTitle = "Clearance Review";
  if (pathname.includes("/overtime-details/detail")) displayTitle = "Rendered Overtime";
  if (pathname.includes("/ci-recommendations/detail")) displayTitle = "CI Recommendations";
  if (pathname.includes("/schedules/maker")) displayTitle = "Schedule Maker";
  if (pathname.includes("/schedules/day")) displayTitle = "Day Schedules";
  if (pathname.includes("/notifications")) displayTitle = "Notifications";

  if (pathname.includes("/profile/edit")) {
    displayTitle = "Edit Profile";
    titleKicker = "ACCOUNT";
    if (role === "enrollment-team") backHref = `/${role}/profile`;
  } else if (pathname.includes("/profile")) {
    displayTitle = "Profile";
    titleKicker = "ACCOUNT";
  }

  if (pathname.includes("/clinical-cases")) titleKicker = "Clinical Cases";
  if (pathname.includes("/manual-backup") && role === "clinical-instructor") titleKicker = "Attendance Backup";

  // Real user data from auth store
  const userName = user.fullName;
  const userContext = user.sectionInfo || roleDisplay?.label || role;
  const avatarInitials = getInitials(user.fullName);

  return (
    <div className="min-h-screen bg-[#f4f6f8] lg:grid lg:grid-cols-[286px_minmax(0,1fr)]">
      <Sidebar
        role={roleDisplay?.label || role}
        userName={userName}
        userContext={userContext}
        avatarInitials={avatarInitials}
        avatarImageUrl={user.profileImageUrl}
        navItems={navItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={() => {
          logout();
          router.replace("/");
        }}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#202124]/[0.44] z-[60] lg:hidden"
          onClick={() => setSidebarOpen(false)}
          data-close-sidebar
        />
      )}

      <main className="flex flex-col h-screen min-h-0 min-w-0 overflow-hidden">
        <Topbar
          titleKicker={titleKicker}
          title={displayTitle}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          backHref={backHref}
        />
        {showNetworkLoading && <div className="pointer-events-none fixed right-5 top-[92px] z-[9997] flex items-center gap-3 rounded-full border border-[#e2e8f0] bg-white px-4 py-2 shadow-[0_14px_34px_rgba(15,23,42,0.14)]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#e2e8f0] border-t-[#8A252C]" aria-hidden="true" />
          <span className="!text-[#334155] !text-[0.82rem] !font-[900]">Loading data...</span>
        </div>}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <div
            key={pathname}
            className={routeAnimating ? "animate-[fadeUp_480ms_ease_both]" : undefined}
            onAnimationEnd={() => setRouteAnimating(false)}
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
