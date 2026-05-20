"use client";

import Link from "next/link";
import React from "react";
import { useAttendance } from "@/core/api/hooks/useAttendance";
import { useStudentCases, useStudentRequirementProgress } from "@/core/api/hooks/useClinicalCases";
import { useStudentExtensionDays } from "@/core/api/hooks/useExtensionDays";
import { useCurrentUser } from "@/core/api/hooks/useUsers";
import { useAuthStore } from "@/core/store/authStore";
import { LoadingState } from "@/components/ui/LoadingState";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";

type RequirementItem = {
  label: string;
  completed: number;
  total: number;
};

type RequirementGroup = {
  code: string;
  label: string;
  items: RequirementItem[];
};

function formatHours(hours: number) {
  const cleanHours = Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
  return Number(hours) === 1 ? `${cleanHours} hr` : `${cleanHours} hrs`;
}

function formatDutyDate(date?: string) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDutyDay(date?: string) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { weekday: "long" });
}

function getRecordDate(record: any) {
  return record?.dutyDate ?? record?.caseDate ?? record?.procedureDate ?? "";
}

function getRequirementBadgeClass(item: RequirementItem) {
  if (item.completed === item.total) return "bg-[#e9f8ef] !text-[#03703c]";
  if (item.completed === 0) return "bg-[#fef2f2] !text-[#991b1b]";
  return "bg-[#fff8e1] !text-[#6c4c00]";
}

function buildDutyEntries(records: any[]) {
  return records.map((record) => {
    const hours = Number(record.totalHours ?? record.hours ?? 0);
    return {
      day: formatDutyDay(record.dutyDate),
      date: formatDutyDate(record.dutyDate),
      area: record.area ?? record.ward ?? "No duty area recorded",
      hours,
      overtime: Math.max(hours - 8, 0),
    };
  });
}

function getPendingItemsHref(basePath: string) {
  if (basePath === "/nursing-student") return `${basePath}/clinical-cases`;
  return `${basePath}/student-progress`;
}

export function StudentProgressContent({ basePath }: { basePath: string }) {
  const storedUser = useAuthStore((state) => state.user);
  const { data: currentUser, isLoading: isCurrentUserLoading } = useCurrentUser();
  const user = currentUser ?? storedUser;
  const { data: cases = [], isLoading: isCasesLoading } = useStudentCases();
  const { data: requirements = [], isLoading: isRequirementsLoading } = useStudentRequirementProgress() as { data: RequirementGroup[]; isLoading: boolean };
  const { data: dutyRecords = [], isLoading: isDutyLoading } = useAttendance();
  const { data: extensionDays = [], isLoading: isExtensionDaysLoading } = useStudentExtensionDays();

  const approvedCaseDates = new Set(cases.filter((clinicalCase: any) => clinicalCase.status === "APPROVED").map(getRecordDate).filter(Boolean));
  const approvedDutyRecords = dutyRecords.filter((record: any) => approvedCaseDates.has(getRecordDate(record)));
  const dutyEntries = buildDutyEntries(approvedDutyRecords);
  const totalHours = dutyEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const totalOvertime = dutyEntries.reduce((sum, entry) => sum + entry.overtime, 0);
  const completedCases = requirements.reduce((sum, group) => sum + group.items.reduce((itemSum, item) => itemSum + item.completed, 0), 0);
  const totalRequiredCases = requirements.reduce((sum, group) => sum + group.items.reduce((itemSum, item) => itemSum + item.total, 0), 0);
  const activeExtensionDays = extensionDays.filter((record: any) => record.status === "ACTIVE").reduce((sum: number, record: any) => sum + Number(record.days ?? 0), 0);
  const pendingItems = cases.filter((clinicalCase: any) => clinicalCase.status === "PENDING").length + dutyRecords.filter((record: any) => record.status === "PENDING").length;
  const isStudentLoading = isCurrentUserLoading && (!user?.fullName || !user?.schoolId);
  const isProgressLoading = isCasesLoading || isRequirementsLoading || isDutyLoading || isExtensionDaysLoading;
  const studentStatus = pendingItems > 0 ? "Needs action" : totalRequiredCases > 0 && completedCases >= totalRequiredCases ? "Completed" : "In progress";
  const studentName = user?.fullName ?? "";
  const studentId = user?.schoolId ?? "";
  const studentSection = user?.sectionInfo ?? "";

  return (
    <main className="min-w-0 overflow-x-hidden p-[clamp(16px,3vw,42px)] min-h-[calc(100vh-64px)]">
      <section className="flex items-center justify-between gap-[28px] p-[clamp(20px,3vw,34px)] border border-[#e2e8f0] rounded-[8px] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] mb-[18px] max-[820px]:flex-col max-[820px]:items-start">
        {isStudentLoading ? <LoadingState message="Loading student profile" className="w-full !p-0" /> : <>
          <div className="flex items-center gap-[16px] min-w-0">
            <ProfileAvatar name={studentName} imageUrl={user?.profileImageUrl ?? ""} size={68} />
            <div>
              <h2 className="m-0 mb-[8px] !text-[#111827] !text-[clamp(1.55rem,3vw,2.15rem)] !font-bold">{studentName || "Profile name unavailable"}</h2>
              <p className="m-0 !text-[#64748b] !font-[600] leading-[1.55]">{studentSection || "No section assigned"}{studentId ? ` - Student ID ${studentId}` : ""}</p>
            </div>
          </div>
          <span className="inline-flex items-center justify-start w-max max-w-full min-h-[28px] px-[10px] py-[6px] rounded-full bg-[#fff8e1] !text-[#6c4c00] !text-[0.76rem] !font-extrabold whitespace-nowrap">
            {studentStatus}
          </span>
        </>}
      </section>

      <section className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-[18px] mb-[18px]" aria-label="Student progress summary">
        <SummaryCard
          icon="calendar"
          status={activeExtensionDays > 0 ? "Open" : "Clear"}
          title="Extension Days"
          description={isExtensionDaysLoading ? "Checking extension days" : `${activeExtensionDays} extension days recorded`}
          isLoading={isExtensionDaysLoading}
        />
        <SummaryCard
          icon="cases"
          status={totalRequiredCases > 0 && completedCases >= totalRequiredCases ? "Completed" : "In progress"}
          title="Clinical Cases"
          description={isRequirementsLoading ? "Checking clinical cases" : `${completedCases} of ${totalRequiredCases} case(s) completed`}
          isLoading={isRequirementsLoading}
        />
        <SummaryCard
          icon="alert"
          status={pendingItems > 0 ? "Open" : "Clear"}
          title="Pending Items"
          description={isCasesLoading || isDutyLoading ? "Checking pending items" : `${pendingItems} record(s) need student or clinical instructor action`}
          isLoading={isCasesLoading || isDutyLoading}
        />
      </section>

      <div className="grid min-w-0 grid-cols-1 min-[1400px]:grid-cols-2 gap-[18px] items-start">
        <article className="min-w-0 border border-[#e2e8f0] rounded-[8px] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] p-[clamp(18px,2.5vw,24px)]">
          <div className="flex justify-between items-start gap-[22px] mb-[20px] max-[720px]:flex-col">
            <h2 className="m-0 !text-[#111827] !text-[1.24rem] !font-bold">Requirement Progress</h2>
            <Link
              className="inline-flex items-center justify-center min-h-[38px] px-[1rem] rounded-[8px] bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.84rem] !font-[800] hover:border-[rgba(138,37,44,0.32)] hover:!text-[#8A252C] hover:shadow-[0_10px_24px_rgba(32,33,36,0.08)] transition-all duration-[160ms] ease cursor-pointer no-underline whitespace-nowrap"
              href={getPendingItemsHref(basePath)}
            >
              Pending items
            </Link>
          </div>

          {isRequirementsLoading ? <LoadingState message="Loading requirement progress" className="rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc]" /> : <div className="grid gap-[18px]">
            {requirements.map((group) => (
              <section key={group.label} aria-label={`${group.label} requirements`}>
                <div className="flex items-baseline justify-between gap-[12px] border-b border-[#e2e8f0] px-[2px] pb-[8px] mb-[10px] max-[640px]:items-start max-[640px]:flex-col">
                  <strong className="!text-[#8A252C] !text-[1.05rem] !font-bold">{group.code}</strong>
                  <span className="!text-[#64748b] !text-[0.78rem] !font-[800]">{group.label}</span>
                </div>
                <div className="grid gap-[10px]">
                  {group.items.map((item) => {
                    const percent = Math.round((item.completed / item.total) * 100);
                    const badge = `${item.completed} / ${item.total}`;

                    return (
                      <div key={item.label} className="grid min-w-0 grid-cols-[minmax(0,1.3fr)_minmax(120px,1fr)_auto] gap-[14px] items-center border border-[#e2e8f0] rounded-[8px] bg-[#f8fafc] p-[14px] max-[720px]:grid-cols-1">
                        <div className="grid gap-[5px]">
                          <strong className="!text-[0.96rem] !text-[#111827]">{item.label}</strong>
                          <span className="!text-[#64748b] !text-[0.82rem] !font-[800] leading-[1.4]">
                            {badge} completed
                          </span>
                        </div>
                        <div className="h-[9px] overflow-hidden rounded-full bg-[#eceff3]">
                          <span
                            className="block h-full rounded-[inherit]"
                            style={{ width: `${percent}%`, background: "linear-gradient(90deg, #8A252C, #ffc107)" }}
                          />
                        </div>
                        <span className={`inline-flex items-center justify-start w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap ${getRequirementBadgeClass(item)}`}>
                          {badge}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>}
        </article>

        <article className="min-w-0 border border-[#e2e8f0] rounded-[8px] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] p-[clamp(18px,2.5vw,24px)] overflow-hidden">
          <div className="flex justify-between items-start gap-[22px] mb-[20px]">
            <h2 className="m-0 !text-[#111827] !text-[1.24rem] !font-bold">Weekly Duty Record</h2>
          </div>

          {isProgressLoading ? <LoadingState message="Loading weekly duty record" className="rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc]" /> : <>
          <div
            className="flex items-center justify-between gap-[14px] border border-[rgba(138,37,44,0.14)] rounded-[8px] mb-[14px] p-[16px] max-[640px]:flex-col max-[640px]:items-start"
            style={{ background: "linear-gradient(135deg, rgba(255,207,1,0.22), rgba(138,37,44,0.04) 62%), #ffffff" }}
          >
            <div>
              <span className="block mb-[5px] !text-[#8A252C] !text-[0.72rem] !font-[900] uppercase">This week</span>
              <strong className="block !text-[#111827] !text-[1.25rem] leading-[1.2]">{formatHours(totalHours)} recorded</strong>
            </div>
            <p className="m-0 max-w-[240px] !text-[#64748b] !text-[0.84rem] !font-[800] leading-[1.45] text-right max-[640px]:text-left">
              {formatHours(totalOvertime)} overtime across {dutyEntries.length} duty day{dutyEntries.length === 1 ? "" : "s"}.
            </p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,120px),1fr))] gap-[12px] mb-[16px]" aria-label="Weekly duty summary">
            {[
              { label: "Duty Days", value: String(dutyEntries.length) },
              { label: "Total Hours", value: formatHours(totalHours) },
              { label: "Overtime", value: formatHours(totalOvertime) },
            ].map((stat) => (
              <div key={stat.label} className="relative overflow-hidden border border-[#e2e8f0] rounded-[8px] bg-[#f8fafc] p-[13px_14px_13px_16px] before:content-[''] before:absolute before:inset-[0_auto_0_0] before:w-[4px] before:bg-[linear-gradient(180deg,#8A252C,#ffc107)]">
                <span className="block mb-[5px] !text-[#64748b] !text-[0.74rem] !font-[800] uppercase">{stat.label}</span>
                <strong className="!text-[#111827] !text-[1.05rem]">{stat.value}</strong>
              </div>
            ))}
          </div>

          <div className="grid gap-[12px] mb-[14px]">
            {dutyEntries.map((entry) => {
              const hasOvertime = entry.overtime > 0;
              const badgeClass = hasOvertime ? "bg-[#fef2f2] !text-[#991b1b]" : "bg-[#e9f8ef] !text-[#03703c]";
              const badgeLabel = hasOvertime ? `Overtime +${formatHours(entry.overtime)}` : "No overtime";
              const [month = "", dayNumber = ""] = entry.date.split(" ");

              return (
                <article key={`${entry.date}-${entry.day}-${entry.area}`} className={`grid grid-cols-[auto_minmax(0,1fr)_auto_auto] gap-[14px] items-center border rounded-[8px] p-[12px_14px] max-[720px]:grid-cols-1 ${hasOvertime ? "border-[rgba(180,35,24,0.2)] bg-[linear-gradient(90deg,#ffffff,#fff8f7)]" : "border-[#e2e8f0] bg-[linear-gradient(90deg,#ffffff,#f8fafc)]"}`}>
                  <div className="grid place-items-center min-w-[52px] min-h-[56px] border border-[rgba(255,207,1,0.45)] rounded-[8px] bg-[rgba(255,207,1,0.12)] !text-[#6c4c00] p-[7px] text-center">
                    <span className="m-0 !text-[0.66rem] !font-[900] uppercase leading-[1]">{month}</span>
                    <strong className="mt-[3px] !text-[1.04rem] leading-[1] !font-bold">{dayNumber}</strong>
                  </div>
                  <div>
                    <strong className="block mb-[4px] !text-[0.94rem] !text-[#111827]">{entry.day}</strong>
                    <p className="m-0 !text-[#64748b] !text-[0.82rem] !font-[700] leading-[1.4]">{entry.area}</p>
                  </div>
                  <span className={`inline-flex items-center justify-start w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap ${badgeClass}`}>
                    {badgeLabel}
                  </span>
                  <div className="grid gap-[2px] text-right max-[720px]:text-left">
                    <span className="!text-[#111827] !text-[0.96rem] !font-[900] whitespace-nowrap">{formatHours(entry.hours)}</span>
                    <small className="!text-[#64748b] !text-[0.67rem] !font-[800] uppercase whitespace-nowrap">Duty Record</small>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-[14px] p-[12px_16px] border border-[#e2e8f0] rounded-[8px] bg-[#f8fafc] !text-[#475569] !text-[0.9rem] !font-[700] leading-[1.5]" role="status" aria-live="polite">
            Showing {studentName || "this student's"} weekly duty attendance and overtime status.
          </div>
          </>}
        </article>
      </div>
    </main>
  );
}

function SummaryCard({ icon, status, title, description, isLoading = false }: { icon: "calendar" | "cases" | "alert"; status: string; title: string; description: string; isLoading?: boolean }) {
  return (
    <article className="relative overflow-hidden border border-[#e2e8f0] rounded-[8px] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] p-[24px] after:content-[''] after:absolute after:inset-[auto_-32px_-54px_auto] after:w-[126px] after:h-[126px] after:rounded-full after:bg-[rgba(138,37,44,0.06)] after:pointer-events-none">
      <div className="flex justify-between items-start gap-[22px]">
        <span className="w-[42px] min-w-[42px] h-[42px] rounded-[8px] bg-[rgba(138,37,44,0.08)] !text-[#8A252C] inline-flex items-center justify-center" aria-label={title}>
          <SummaryIcon icon={icon} />
        </span>
        {isLoading ? <span className="h-7 w-20 animate-pulse rounded-full bg-[#f1f5f9]" aria-hidden="true" /> : <span className="inline-flex items-center justify-start w-max max-w-full min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#fff8e1] !text-[#6c4c00]">
          {status}
        </span>}
      </div>
      <h3 className="mt-[18px] mb-[6px] !text-[1.05rem] !text-[#111827] !font-bold">{title}</h3>
      {isLoading ? <span className="block mb-[16px] h-4 w-2/3 animate-pulse rounded-full bg-[#f1f5f9]" aria-hidden="true" /> : <p className="mb-[16px] !text-[#64748b] !text-[0.9rem] !font-[700]">{description}</p>}
    </article>
  );
}

function SummaryIcon({ icon }: { icon: "calendar" | "cases" | "alert" }) {
  if (icon === "calendar") {
    return (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <path d="M3 10h18" />
        <path d="M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z" />
      </svg>
    );
  }

  if (icon === "cases") {
    return (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 4h8" />
        <path d="M7 8h10" />
        <path d="M7 12h7" />
        <path d="M6 3h12v18H6z" />
      </svg>
    );
  }

  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 8v5" />
      <path d="M12 17h.01" />
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    </svg>
  );
}
