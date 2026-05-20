"use client";

import Image from "next/image";
import { useAuthStore } from "@/core/store/authStore";
import { useAboutInfo } from "@/core/api/hooks/useSystemInfo";

const roleDescriptions: Record<string, string> = {
  ADMIN: "Admin access includes user management, access controls, schedules, attendance monitoring, clinical case review, reports, and system records.",
  COORDINATOR: "Coordinator access includes multi-level monitoring, schedules, attendance records, clinical case review, student progress, reports, and access-controlled actions.",
  CHAIR: "Chair access is limited to assigned-level schedules, attendance monitoring, clinical case review, student progress, clearance, and scoped reports.",
  ASSISTANT: "Assistant access is limited to assigned-level monitoring, clinical case review, student progress, reports, and actions enabled by Admin Access.",
  INSTRUCTOR: "Clinical Instructor access is limited to assigned schedules, live attendance, clinical case review, assigned-student progress, and scoped reports.",
  STUDENT: "Nursing Student access includes assigned schedules, clinical case submission, appeal requests, progress tracking, reports, and clearance status.",
  ENROLLMENT: "Enrollment Team access is limited to student progress and profile tools needed for enrollment monitoring.",
};

export function AboutContent() {
  const user = useAuthStore((state) => state.user);
  const { data: aboutInfo } = useAboutInfo();
  const description = roleDescriptions[user?.role ?? ""] ?? "NurseTrack provides organized clinical tracking for CIT-U Nursing workflows.";
  const releaseDate = aboutInfo?.releaseDate ? new Date(`${aboutInfo.releaseDate}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Apr 28, 2026";
  const releaseLabel = aboutInfo?.releaseVersion ?? "Version 1.0";
  const versionBadge = releaseLabel.replace(/^Version\s*/i, "V") || "V1.0";

  return (
    <main className="grid w-full min-w-0 content-start gap-[18px] p-[clamp(24px,4vw,42px)]">
      <section className="grid min-h-[222px] grid-cols-[minmax(0,1fr)_auto] items-center gap-[clamp(22px,5vw,72px)] rounded-lg border border-[#dbe3ee] bg-white p-[clamp(24px,4vw,34px)] shadow-[0_18px_44px_rgba(15,23,42,0.08)] max-[820px]:grid-cols-1">
        <div className="max-w-[760px]">
          <h2 className="m-0 max-w-[820px] !text-[#202124] !text-[clamp(1.7rem,3vw,2.18rem)] !font-[900] leading-[1.18] tracking-[-0.045em]">
            Focused tools for verification, monitoring, and review.
          </h2>
          <p className="mt-[0.85rem] mb-0 max-w-[760px] !text-[#667085] !text-[1rem] !font-[800] leading-[1.6]">
            {description}
          </p>
        </div>
        <div className="grid min-h-[152px] min-w-[168px] place-items-center rounded-lg border border-[#ffcf01] bg-[linear-gradient(180deg,#ffffff_0%,#fffdf3_100%)] p-5 text-center max-[820px]:justify-self-start">
          <Image className="h-[76px] w-[76px] object-contain" src="/assets/cit-u-logo.png" alt="CIT-U logo" width={76} height={76} priority />
          <strong className="mt-3 block !text-[#ffbf00] !text-[0.86rem] !font-[950]">{versionBadge}</strong>
        </div>
      </section>

      <section className="rounded-lg border border-[#dbe3ee] bg-white p-[clamp(20px,3vw,26px)] shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
        <h2 className="m-0 mb-4 !text-[#202124] !text-[1.25rem] !font-[900] tracking-[-0.03em]">App Information</h2>
        <dl className="m-0 grid">
          <div className="grid grid-cols-[minmax(120px,0.42fr)_minmax(0,1fr)] gap-4 border-b border-[#e2e8f0] py-3 max-[640px]:grid-cols-1 max-[640px]:gap-1">
            <dt className="!text-[#667085] !text-[0.85rem] !font-[900]">Name</dt>
            <dd className="m-0 text-right !text-[#202124] !text-[0.92rem] !font-[900] max-[640px]:text-left">{aboutInfo?.name ?? "NurseTrack"}</dd>
          </div>
          <div className="grid grid-cols-[minmax(120px,0.42fr)_minmax(0,1fr)] gap-4 border-b border-[#e2e8f0] py-3 max-[640px]:grid-cols-1 max-[640px]:gap-1">
            <dt className="!text-[#667085] !text-[0.85rem] !font-[900]">Organization</dt>
            <dd className="m-0 text-right !text-[#202124] !text-[0.92rem] !font-[900] max-[640px]:text-left">{aboutInfo?.organization ?? "CIT-U Nursing"}</dd>
          </div>
          <div className="grid grid-cols-[minmax(120px,0.42fr)_minmax(0,1fr)] gap-4 border-b border-[#e2e8f0] py-3 max-[640px]:grid-cols-1 max-[640px]:gap-1">
            <dt className="!text-[#667085] !text-[0.85rem] !font-[900]">Release</dt>
            <dd className="m-0 text-right !text-[#202124] !text-[0.92rem] !font-[900] max-[640px]:text-left">{releaseLabel}</dd>
          </div>
          <div className="grid grid-cols-[minmax(120px,0.42fr)_minmax(0,1fr)] gap-4 py-3 max-[640px]:grid-cols-1 max-[640px]:gap-1">
            <dt className="!text-[#667085] !text-[0.85rem] !font-[900]">Updated</dt>
            <dd className="m-0 text-right !text-[#202124] !text-[0.92rem] !font-[900] max-[640px]:text-left">{releaseDate}</dd>
          </div>
        </dl>
        <div className="mt-2 rounded-lg border border-[#86efac] bg-[#ecfdf3] px-4 py-3 !text-[#03703c] !text-[0.86rem] !font-[900]">
          {aboutInfo?.statusMessage ?? "System information is up to date."}
        </div>
      </section>
    </main>
  );
}
