"use client";

import React, { useState, use } from "react";
import { Sidebar } from "@/components/ui/dashboard/Sidebar";
import { Topbar } from "@/components/ui/dashboard/Topbar";
import { usePathname, notFound } from "next/navigation";
import { roleNavConfigs, roleUserContexts } from "@/core/config/navConfig";

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ role: string }>;
}) {
  const pathname = usePathname();
  const { role } = use(params);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Validate role
  if (!roleNavConfigs[role]) {
    notFound();
  }

  const rawNavItems = roleNavConfigs[role];
  const userContext = roleUserContexts[role];

  const navItems = rawNavItems.map(nav => ({
    ...nav,
    isActive: pathname === nav.href || (pathname.startsWith(nav.href + '/') && nav.href !== `/${role}/dashboard`)
  }));

  const activeNav = navItems.find(nav => nav.isActive) || navItems[0];
  const isSubPage = pathname !== activeNav.href && pathname.startsWith(activeNav.href + '/');

  const getBackHref = () => {
    if (!isSubPage) return undefined;
    const parts = pathname.split('/');
    parts.pop();
    const parentPath = parts.join('/');
    return parentPath.length < activeNav.href.length ? activeNav.href : parentPath;
  };

  let displayTitle = activeNav.topbarTitle || activeNav.label;
  let titleKicker = `${userContext.role} Workspace`;
  let backHref = getBackHref();

  // Dynamic overrides for sub-pages
  if (pathname.includes("/student-progress/detail")) displayTitle = "Student Progress Detail";
  if (pathname.includes("/clinical-cases/selection")) displayTitle = "Select Clinical Case";
  if (pathname.includes("/clinical-cases/validation")) displayTitle = "Case Validation";
  if (pathname.includes("/clearance/detail")) displayTitle = "Clearance Review";
  if (pathname.includes("/overtime-details/detail")) displayTitle = "Rendered Overtime";
  if (pathname.includes("/ci-recommendations/detail")) displayTitle = "CI Recommendations";
  if (pathname.includes("/schedules/maker")) displayTitle = "Schedule Maker";
  if (pathname.includes("/schedules/day")) displayTitle = "Day Schedules";
  if (pathname.includes("/notifications")) displayTitle = "Notifications";
  
  if (pathname.includes("/profile/edit")) { 
    displayTitle = "Edit Profile"; 
    titleKicker = "ACCOUNT"; 
    if (role === 'enrollment-team') backHref = `/${role}/profile`;
  } else if (pathname.includes("/profile")) { 
    displayTitle = "Profile"; 
    titleKicker = "ACCOUNT"; 
  }

  if (pathname.includes("/clinical-cases")) {
    titleKicker = "Clinical Cases";
  }
  if (pathname.includes("/manual-backup") && role === "clinical-instructor") {
    titleKicker = "Attendance Backup";
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] lg:grid lg:grid-cols-[286px_minmax(0,1fr)]">
      <Sidebar
        role={userContext.role}
        userName={userContext.userName}
        userContext={userContext.userContext}
        avatarInitials={userContext.avatarInitials}
        navItems={navItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {sidebarOpen && (
        <div className="fixed inset-0 bg-[#202124]/[0.44] z-[60] lg:hidden" onClick={() => setSidebarOpen(false)} data-close-sidebar></div>
      )}

      <main className="flex flex-col min-h-screen min-w-0">
        <Topbar
          titleKicker={titleKicker}
          title={displayTitle}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          backHref={backHref}
        />
        <div key={pathname} className="animate-[fadeUp_480ms_ease_both]">{children}</div>
      </main>
    </div>
  );
}
