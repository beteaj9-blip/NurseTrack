"use client";

import Link from "next/link";
import React from "react";
import { useAttendance } from "@/core/api/hooks/useAttendance";
import { useStudentCases } from "@/core/api/hooks/useClinicalCases";
import { useAuthStore } from "@/core/store/authStore";

type RequirementItem = {
  label: string;
  completed: number;
  total: number;
};

const requirementTemplate = [
  {
    code: "DR",
    label: "Delivery Room Cases",
    items: ["Handled Cases", "Assisted Cases", "Newborn Care", "Labor Watch"],
  },
  {
    code: "OR",
    label: "Operating Room Cases",
    items: ["Minor Cases", "Major Cases - Scrub", "Major Cases - Circulating"],
  },
];

const staticStudent = {
  name: "Maria Cruz",
  initials: "MC",
  id: "12-3456-789",
  section: "BSN 3A",
  status: "In progress",
  extensionDays: 11,
  pending: 14,
};

const staticRequirements = requirementTemplate.map((group) => ({
  ...group,
  items: group.items.map((label, index) => ({
    label,
    completed: index === 0 ? 3 : index === 1 ? 2 : index === 2 ? 1 : 0,
    total: 3,
  })),
}));

const staticDutyEntries = [
  { day: "Monday", date: "Apr 20", area: "Emergency Room", hours: 8, overtime: 0 },
  { day: "Tuesday", date: "Apr 21", area: "Emergency Room", hours: 9.5, overtime: 1.5 },
  { day: "Thursday", date: "Apr 23", area: "Operating Room", hours: 8, overtime: 0 },
  { day: "Friday", date: "Apr 24", area: "Operating Room", hours: 10, overtime: 2 },
];

function formatHours(hours: number) {
  const cleanHours = Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
  return Number(hours) === 1 ? `${cleanHours} hr` : `${cleanHours} hrs`;
}

function getInitials(name?: string) {
  if (!name) return "?";
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

function formatDutyDate(date?: string) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDutyDay(date?: string) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { weekday: "long" });
}

function getRequirementBadgeClass(item: RequirementItem) {
  if (item.completed === item.total) return "bg-[#e9f8ef] !text-[#03703c]";
  if (item.completed === 0) return "bg-[#fef2f2] !text-[#991b1b]";
  return "bg-[#fff8e1] !text-[#6c4c00]";
}

function normalizeCategory(value?: string) {
  return (value ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

function buildRequirements(cases: any[]) {
  return requirementTemplate.map((group) => ({
    ...group,
    items: group.items.map((label) => {
      const completed = cases.filter((clinicalCase) => {
        const category = normalizeCategory(clinicalCase.category ?? clinicalCase.area);
        return category === normalizeCategory(label) && clinicalCase.status === "APPROVED";
      }).length;

      return {
        label,
        completed: Math.min(completed, 3),
        total: 3,
      };
    }),
  }));
}

function buildDutyEntries(records: any[]) {
  return records.map((record) => {
    const hours = Number(record.totalHours ?? record.hours ?? 0);
    return {
      day: formatDutyDay(record.dutyDate),
      date: formatDutyDate(record.dutyDate),
      area: record.area ?? record.ward ?? "Assigned Area",
      hours,
      overtime: Math.max(hours - 8, 0),
    };
  });
}

function getPendingItemsHref(basePath: string) {
  if (basePath === "/nursing-student") return `${basePath}/clinical-cases`;
  if (basePath === "/enrollment-team") return `${basePath}/student-progress/detail?student=maria-cruz`;
  return `${basePath}/clinical-cases/selection?student=maria-cruz`;
}

export function StudentProgressContent({ basePath }: { basePath: string }) {
  const isStudentSide = basePath === "/nursing-student";
  const user = useAuthStore((state) => state.user);
  const userId = isStudentSide && user?.id != null ? String(user.id) : undefined;
  const { data: cases = [] } = useStudentCases(userId);
  const { data: dutyRecords = [] } = useAttendance(userId);

  const student = isStudentSide
    ? {
        name: user?.fullName ?? "Nursing Student",
        initials: getInitials(user?.fullName),
        id: user?.schoolId ?? "",
        section: user?.sectionInfo ?? "Nursing Student",
        status: "In progress",
        extensionDays: dutyRecords.filter((record: any) => record.status === "REJECTED").length,
        pending: cases.filter((clinicalCase: any) => clinicalCase.status === "PENDING").length + dutyRecords.filter((record: any) => record.status === "PENDING").length,
      }
    : staticStudent;

  const requirements = isStudentSide ? buildRequirements(cases) : staticRequirements;
  const dutyEntries = isStudentSide ? buildDutyEntries(dutyRecords) : staticDutyEntries;
  const totalHours = dutyEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const totalOvertime = dutyEntries.reduce((sum, entry) => sum + entry.overtime, 0);
  const completedCases = requirements.reduce((sum, group) => sum + group.items.reduce((itemSum, item) => itemSum + item.completed, 0), 0);
  const totalRequiredCases = requirements.reduce((sum, group) => sum + group.items.reduce((itemSum, item) => itemSum + item.total, 0), 0);

  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]">
      <section className="flex items-center justify-between gap-[28px] p-[clamp(24px,4vw,34px)] border border-[#e2e8f0] rounded-[8px] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] mb-[18px]">
        <div className="flex items-center gap-[16px] min-w-0">
          <div className="w-[68px] h-[68px] shrink-0 bg-[#ffc107] !text-[#111827] rounded-full flex items-center justify-center !font-[800] text-[1.05rem]">
            {student.initials}
          </div>
          <div>
            <h2 className="m-0 mb-[8px] !text-[#111827] !text-[clamp(1.55rem,3vw,2.15rem)] !font-bold">{student.name}</h2>
            <p className="m-0 !text-[#64748b] !font-[600] leading-[1.55]">{student.section} - Student ID {student.id}</p>
          </div>
        </div>
        <span className="inline-flex items-center justify-start w-max max-w-full min-h-[28px] px-[10px] py-[6px] rounded-full bg-[#fff8e1] !text-[#6c4c00] !text-[0.76rem] !font-extrabold whitespace-nowrap">
          {student.status}
        </span>
      </section>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[18px] mb-[18px]" aria-label="Student progress summary">
        <SummaryCard
          icon="calendar"
          status="Open"
          title="Extension Days"
          description={`${student.extensionDays} extension days recorded`}
        />
        <SummaryCard
          icon="cases"
          status="In progress"
          title="Clinical Cases"
          description={`${completedCases} of ${totalRequiredCases} cases completed`}
        />
        <SummaryCard
          icon="alert"
          status="Open"
          title="Pending Items"
          description={`${student.pending} records need student or instructor action`}
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px] items-start">
        <article className="border border-[#e2e8f0] rounded-[8px] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] p-[24px]">
          <div className="flex justify-between items-start gap-[22px] mb-[20px]">
            <h2 className="m-0 !text-[#111827] !text-[1.24rem] !font-bold">Requirement Progress</h2>
            <Link
              className="inline-flex items-center justify-center min-h-[38px] px-[1rem] rounded-[8px] bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.84rem] !font-[800] hover:border-[rgba(138,37,44,0.32)] hover:!text-[#8A252C] hover:shadow-[0_10px_24px_rgba(32,33,36,0.08)] transition-all duration-[160ms] ease cursor-pointer no-underline whitespace-nowrap"
              href={getPendingItemsHref(basePath)}
            >
              Pending items
            </Link>
          </div>

          <div className="grid gap-[18px]">
            {requirements.map((group) => (
              <section key={group.code} aria-label={`${group.label} requirements`}>
                <div className="flex items-baseline justify-between gap-[12px] border-b border-[#e2e8f0] px-[2px] pb-[8px] mb-[10px]">
                  <strong className="!text-[#8A252C] !text-[1.05rem] !font-bold">{group.code}</strong>
                  <span className="!text-[#64748b] !text-[0.78rem] !font-[800]">{group.label}</span>
                </div>
                <div className="grid gap-[10px]">
                  {group.items.map((item) => {
                    const percent = Math.round((item.completed / item.total) * 100);
                    const badge = `${item.completed} / ${item.total}`;

                    return (
                      <div key={item.label} className="grid grid-cols-[minmax(150px,1.3fr)_minmax(150px,1fr)_auto] gap-[14px] items-center border border-[#e2e8f0] rounded-[8px] bg-[#f8fafc] p-[14px]">
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
          </div>
        </article>

        <article className="border border-[#e2e8f0] rounded-[8px] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] p-[24px] overflow-hidden">
          <div className="flex justify-between items-start gap-[22px] mb-[20px]">
            <h2 className="m-0 !text-[#111827] !text-[1.24rem] !font-bold">Weekly Duty Record</h2>
          </div>

          <div
            className="flex items-center justify-between gap-[14px] border border-[rgba(138,37,44,0.14)] rounded-[8px] mb-[14px] p-[16px]"
            style={{ background: "linear-gradient(135deg, rgba(255,207,1,0.22), rgba(138,37,44,0.04) 62%), #ffffff" }}
          >
            <div>
              <span className="block mb-[5px] !text-[#8A252C] !text-[0.72rem] !font-[900] uppercase">This week</span>
              <strong className="block !text-[#111827] !text-[1.25rem] leading-[1.2]">{formatHours(totalHours)} recorded</strong>
            </div>
            <p className="m-0 max-w-[240px] !text-[#64748b] !text-[0.84rem] !font-[800] leading-[1.45] text-right">
              {formatHours(totalOvertime)} overtime across {dutyEntries.length} duty day{dutyEntries.length === 1 ? "" : "s"}.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-[12px] mb-[16px]" aria-label="Weekly duty summary">
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
                <article key={`${entry.date}-${entry.day}-${entry.area}`} className={`grid grid-cols-[auto_minmax(0,1fr)_auto_auto] gap-[14px] items-center border rounded-[8px] p-[12px_14px] ${hasOvertime ? "border-[rgba(180,35,24,0.2)] bg-[linear-gradient(90deg,#ffffff,#fff8f7)]" : "border-[#e2e8f0] bg-[linear-gradient(90deg,#ffffff,#f8fafc)]"}`}>
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
                  <div className="grid gap-[2px] text-right">
                    <span className="!text-[#111827] !text-[0.96rem] !font-[900] whitespace-nowrap">{formatHours(entry.hours)}</span>
                    <small className="!text-[#64748b] !text-[0.67rem] !font-[800] uppercase whitespace-nowrap">Duty Record</small>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-[14px] p-[12px_16px] border border-[#e2e8f0] rounded-[8px] bg-[#f8fafc] !text-[#475569] !text-[0.9rem] !font-[700] leading-[1.5]" role="status" aria-live="polite">
            Showing {student.name}&apos;s weekly duty attendance and overtime status.
          </div>
        </article>
      </div>
    </main>
  );
}

function SummaryCard({ icon, status, title, description }: { icon: "calendar" | "cases" | "alert"; status: string; title: string; description: string }) {
  return (
    <article className="relative overflow-hidden border border-[#e2e8f0] rounded-[8px] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] p-[24px] after:content-[''] after:absolute after:inset-[auto_-32px_-54px_auto] after:w-[126px] after:h-[126px] after:rounded-full after:bg-[rgba(138,37,44,0.06)] after:pointer-events-none">
      <div className="flex justify-between items-start gap-[22px]">
        <span className="w-[42px] min-w-[42px] h-[42px] rounded-[8px] bg-[rgba(138,37,44,0.08)] !text-[#8A252C] inline-flex items-center justify-center" aria-label={title}>
          <SummaryIcon icon={icon} />
        </span>
        <span className="inline-flex items-center justify-start w-max max-w-full min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#fff8e1] !text-[#6c4c00]">
          {status}
        </span>
      </div>
      <h3 className="mt-[18px] mb-[6px] !text-[1.05rem] !text-[#111827] !font-bold">{title}</h3>
      <p className="mb-[16px] !text-[#64748b] !text-[0.9rem] !font-[700]">{description}</p>
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
