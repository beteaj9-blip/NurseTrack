"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useAttendance } from "@/core/api/hooks/useAttendance";
import { useStudentCases, useStudentRequirementProgress } from "@/core/api/hooks/useClinicalCases";
import { useInstructorExtensionDays } from "@/core/api/hooks/useExtensionDays";
import { useAuthStore } from "@/core/store/authStore";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";

type RequirementItem = { label: string; completed: number; total: number };
type RequirementGroup = { code: string; label: string; items: RequirementItem[] };

function formatHours(hours: number) {
  const cleanHours = Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
  return Number(hours) === 1 ? `${cleanHours} hr` : `${cleanHours} hrs`;
}

function formatDate(date?: string) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getRecordDate(record: any) {
  return record?.dutyDate ?? record?.caseDate ?? record?.procedureDate ?? "";
}

function getBadgeClass(item: RequirementItem) {
  if (item.completed === item.total) return "bg-[#e9f8ef] !text-[#03703c]";
  if (item.completed === 0) return "bg-[#fef2f2] !text-[#991b1b]";
  return "bg-[#fff8e1] !text-[#6c4c00]";
}

export function StudentProgressDetailContent({ basePath }: { basePath: string; searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const instructorId = user?.id != null ? String(user.id) : undefined;
  const studentId = searchParams.get("studentId") ?? undefined;
  const { data: cases = [] } = useStudentCases(studentId);
  const { data: requirements = [] } = useStudentRequirementProgress(studentId) as { data: RequirementGroup[] };
  const { data: dutyRecords = [] } = useAttendance(studentId);
  const { data: extensionDays = [] } = useInstructorExtensionDays(instructorId, studentId);
  const firstCase = (cases as any[])[0];
  const firstDuty = (dutyRecords as any[])[0];
  const student = {
    name: firstCase?.studentName || firstDuty?.studentName || "Nursing Student",
    profileImageUrl: firstCase?.studentProfileImageUrl || firstDuty?.studentProfileImageUrl || "",
    id: firstCase?.studentSchoolId || firstDuty?.studentSchoolId || "",
    section: firstCase?.studentSection || firstDuty?.studentSection || "Nursing Student",
  };
  const approvedCaseDates = new Set((cases as any[]).filter((clinicalCase: any) => clinicalCase.status === "APPROVED").map(getRecordDate).filter(Boolean));
  const approvedDutyRecords = (dutyRecords as any[]).filter((record: any) => approvedCaseDates.has(getRecordDate(record)));
  const totalHours = approvedDutyRecords.reduce((sum: number, entry: any) => sum + Number(entry.hours ?? 0), 0);
  const totalOvertime = approvedDutyRecords.reduce((sum: number, entry: any) => sum + Math.max(Number(entry.hours ?? 0) - 8, 0), 0);
  const activeExtensionDays = (extensionDays as any[]).filter((record: any) => record.status === "ACTIVE");
  const activeExtensionDayTotal = activeExtensionDays.reduce((sum: number, record: any) => sum + Number(record.days ?? 0), 0);
  const pending = (cases as any[]).filter((clinicalCase: any) => clinicalCase.status === "PENDING").length + (dutyRecords as any[]).filter((record: any) => record.status === "PENDING").length;

  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]">
      <section className="flex items-center justify-between gap-[28px] p-[clamp(24px,4vw,34px)] border border-[#e2e8f0] rounded-[8px] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] mb-[18px]">
        <div className="flex items-center gap-[16px] min-w-0"><ProfileAvatar name={student.name} imageUrl={student.profileImageUrl} size={68} /><div><h2 className="m-0 mb-[8px] !text-[#111827] !text-[clamp(1.55rem,3vw,2.15rem)] !font-bold">{student.name}</h2><p className="m-0 !text-[#64748b] !font-[600] leading-[1.55]">{student.section} - Student ID {student.id}</p></div></div>
        <span className="inline-flex items-center justify-start w-max max-w-full min-h-[28px] px-[10px] py-[6px] rounded-full bg-[#fff8e1] !text-[#6c4c00] !text-[0.76rem] !font-extrabold whitespace-nowrap">{pending} pending</span>
      </section>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[18px] mb-[18px]">
        <Summary title="Extension Days" description={`${activeExtensionDayTotal} extension days recorded`} />
        <Summary title="Clinical Cases" description={`${(cases as any[]).filter((clinicalCase: any) => clinicalCase.status === "APPROVED").length} of ${(cases as any[]).length} cases completed`} />
        <Summary title="Pending Items" description={`${pending} records need instructor or student action`} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px] items-start">
        <article className="border border-[#e2e8f0] rounded-[8px] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] p-[24px]">
          <h2 className="m-0 mb-[20px] !text-[#111827] !text-[1.24rem] !font-bold">Requirement Progress</h2>
          <div className="grid gap-[18px]">
            {requirements.map((group) => <section key={group.label}><div className="flex items-baseline justify-between gap-[12px] border-b border-[#e2e8f0] px-[2px] pb-[8px] mb-[10px]"><strong className="!text-[#8A252C] !text-[1.05rem] !font-bold">{group.code}</strong><span className="!text-[#64748b] !text-[0.78rem] !font-[800]">{group.label}</span></div><div className="grid gap-[10px]">{group.items.map((item) => { const percent = item.total ? Math.round((item.completed / item.total) * 100) : 0; const badge = `${item.completed} / ${item.total}`; return <div key={item.label} className="grid grid-cols-[minmax(150px,1.3fr)_minmax(150px,1fr)_auto] gap-[14px] items-center border border-[#e2e8f0] rounded-[8px] bg-[#f8fafc] p-[14px]"><div className="grid gap-[5px]"><strong className="!text-[0.96rem] !text-[#111827]">{item.label}</strong><span className="!text-[#64748b] !text-[0.82rem] !font-[800] leading-[1.4]">{badge} completed</span></div><div className="h-[9px] overflow-hidden rounded-full bg-[#eceff3]"><span className="block h-full rounded-[inherit]" style={{ width: `${percent}%`, background: "linear-gradient(90deg, #8A252C, #ffc107)" }} /></div><span className={`inline-flex items-center justify-start w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap ${getBadgeClass(item)}`}>{badge}</span></div>; })}</div></section>)}
          </div>
        </article>
        <article className="border border-[#e2e8f0] rounded-[8px] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] p-[24px] overflow-hidden">
          <h2 className="m-0 mb-[20px] !text-[#111827] !text-[1.24rem] !font-bold">Weekly Duty Hours</h2>
          <div className="flex items-center justify-between gap-[14px] border border-[rgba(138,37,44,0.14)] rounded-[8px] mb-[14px] p-[16px]" style={{ background: "linear-gradient(135deg, rgba(255,207,1,0.22), rgba(138,37,44,0.04) 62%), #ffffff" }}><div><span className="block mb-[5px] !text-[#8A252C] !text-[0.72rem] !font-[900] uppercase">This week</span><strong className="block !text-[#111827] !text-[1.25rem] leading-[1.2]">{formatHours(totalHours)} recorded</strong></div><p className="m-0 max-w-[240px] !text-[#64748b] !text-[0.84rem] !font-[800] leading-[1.45] text-right">{formatHours(totalOvertime)} overtime across {approvedDutyRecords.length} approved duty days.</p></div>
          <div className="grid gap-[12px] mb-[14px]">{approvedDutyRecords.map((entry: any) => <article key={entry.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] gap-[14px] items-center border border-[#e2e8f0] rounded-[8px] p-[12px_14px] bg-white"><div className="grid place-items-center min-w-[52px] min-h-[56px] border border-[rgba(255,207,1,0.45)] rounded-[8px] bg-[rgba(255,207,1,0.12)] !text-[#6c4c00] p-[7px] text-center"><span className="m-0 !text-[0.66rem] !font-[900] uppercase leading-[1]">{formatDate(entry.dutyDate).split(" ")[0]}</span><strong className="mt-[3px] !text-[1.04rem] leading-[1] !font-bold">{formatDate(entry.dutyDate).split(" ")[1]}</strong></div><div><strong className="block mb-[4px] !text-[0.94rem] !text-[#111827]">{entry.timeInLabel || "Duty record"}</strong><p className="m-0 !text-[#64748b] !text-[0.82rem] !font-[700] leading-[1.4]">{entry.area}</p></div><span className="inline-flex items-center justify-start w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#e9f8ef] !text-[#03703c]">Approved case</span><span className="!text-[#111827] !text-[0.96rem] !font-[900] whitespace-nowrap">{formatHours(Number(entry.hours ?? 0))}</span></article>)}</div>
        </article>
      </div>
    </main>
  );
}

function Summary({ title, description }: { title: string; description: string }) {
  return <article className="relative overflow-hidden border border-[#e2e8f0] rounded-[8px] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] p-[24px]"><span className="inline-flex mb-4 px-3 py-1 rounded-full bg-[#fff8e1] !text-[#6c4c00] !text-[0.76rem] !font-extrabold">Open</span><h3 className="mt-0 mb-[6px] !text-[1.05rem] !text-[#111827] !font-bold">{title}</h3><p className="mb-0 !text-[#64748b] !text-[0.9rem] !font-[700]">{description}</p></article>;
}
