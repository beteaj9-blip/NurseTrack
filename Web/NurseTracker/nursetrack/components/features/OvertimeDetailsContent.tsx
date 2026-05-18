"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAllAttendance } from "@/core/api/hooks/useAttendance";
import { useAuthStore } from "@/core/store/authStore";
import { InlineSelect } from "@/components/ui/InlineSelect";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";

function fmt(hours: number) {
  const rounded = Math.round(Number(hours || 0) * 100) / 100;
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(2).replace(/0$/, "")} hrs`;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function monthKey(date?: string) {
  if (!date) return "";
  return date.slice(0, 7);
}

function selectedMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function hoursMatch(total: number, filter: string) {
  if (filter === "all") return true;
  if (filter === "0-1") return total >= 0 && total <= 1;
  if (filter === "1-3") return total > 1 && total <= 3;
  if (filter === "3-plus") return total > 3;
  return true;
}

export function OvertimeDetailsContent({ basePath }: { basePath: string }) {
  const user = useAuthStore((state) => state.user);
  const isChair = basePath === "/chair";
  const { data: attendance = [], isLoading } = useAllAttendance(true, isChair && user?.id != null ? String(user.id) : undefined);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [hoursFilter, setHoursFilter] = useState("all");
  const [period, setPeriod] = useState(() => new Date());
  const periodKey = selectedMonthKey(period);

  const people = Object.values((attendance as any[]).reduce((acc: Record<string, any>, record: any) => {
    if (monthKey(record.dutyDate) !== periodKey) return acc;
    const overtime = Math.max(Number(record.hours || 0) - 8, 0);
    if (overtime <= 0) return acc;
    const key = `student-${record.studentId}`;
    const current = acc[key] ?? {
      id: record.studentId,
      role: "Student",
      name: record.studentName || "Nursing Student",
      profileImageUrl: record.studentProfileImageUrl,
      identifier: record.studentSchoolId,
      section: record.studentSection,
      site: record.hospital || record.area,
      total: 0,
    };
    current.total += overtime;
    acc[key] = current;
    return acc;
  }, {}));

  const filtered = people.filter((p: any) => {
    const q = search.toLowerCase();
    return (!search || `${p.name} ${p.identifier} ${p.section} ${p.role} ${p.site}`.toLowerCase().includes(q))
      && (typeFilter === "all" || p.role === typeFilter)
      && hoursMatch(Number(p.total || 0), hoursFilter);
  });

  const inputCls = "w-full min-h-[48px] px-3 py-2 border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] !font-[500] focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all";
  const labelCls = "flex flex-col gap-1.5 m-0 !text-[0.875rem] !font-[800] !text-[#344054]";
  const typeOptions = [{ value: "all", label: "All people" }, { value: "Clinical Instructor", label: "Clinical Instructor" }, { value: "Student", label: "Student" }];
  const hourOptions = [{ value: "all", label: "All OT hours" }, { value: "0-1", label: "0-1 hr" }, { value: "1-3", label: "1-3 hrs" }, { value: "3-plus", label: "More than 3 hrs" }];

  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)] content-start">
      <section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem]">
        <div className="flex items-center justify-between gap-[22px] mb-[1.1rem] flex-wrap">
          <h2 className="m-0 !text-[#111827] !text-[1.15rem] !font-[900] tracking-[-0.03em]">People with Overtime Records</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center min-h-[40px] rounded-full border border-[#e2e8f0] bg-white shadow-[0_8px_18px_rgba(15,23,42,0.05)] overflow-hidden">
              <button type="button" onClick={() => setPeriod((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} className="w-[44px] min-h-[40px] border-0 bg-transparent !text-[#8A252C] !font-[900] cursor-pointer hover:bg-[#f8fafc]">&lt;</button>
              <strong className="inline-flex items-center justify-center min-w-[132px] px-3 !text-[#17233c] !text-[0.9rem] !font-[900]">{monthLabel(period)}</strong>
              <button type="button" onClick={() => setPeriod((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} className="w-[44px] min-h-[40px] border-0 bg-transparent !text-[#8A252C] !font-[900] cursor-pointer hover:bg-[#f8fafc]">&gt;</button>
            </div>
            <span className="inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-[900] bg-[#fff8e1] !text-[#6c4c00]">{filtered.length} people</span>
          </div>
        </div>

        <div className="grid gap-[1rem] mb-[1rem] grid-cols-[minmax(0,1.7fr)_minmax(220px,1fr)_minmax(220px,1fr)] max-[980px]:grid-cols-1">
          <label className={labelCls} htmlFor="ot-search">Search person<input className={inputCls} id="ot-search" type="search" placeholder="Search name, ID, section, role, or clinical site" value={search} onChange={(e) => setSearch(e.target.value)} /></label>
          <label className={labelCls}>Type<InlineSelect value={typeFilter} options={typeOptions} placeholder="Select type" onChange={setTypeFilter} /></label>
          <label className={labelCls}>OT Hours<InlineSelect value={hoursFilter} options={hourOptions} placeholder="Select OT hours" onChange={setHoursFilter} /></label>
        </div>

        <div className="border-t border-[#e2e8f0] pt-[1.25rem]">
          {filtered.length > 0 ? <div className="flex flex-col border border-[#e2e8f0] overflow-hidden bg-white rounded-lg">
            {filtered.map((p: any, i: number) => <Link key={p.id} href={`${basePath}/overtime-details/detail?id=${p.id}`} className="relative pl-[72px] flex items-center gap-[1.25rem] w-full p-[1rem_1.5rem] border-b border-[#e2e8f0] bg-white hover:bg-[#f8fafc] transition-colors cursor-pointer no-underline text-inherit last:border-b-0"><div className="absolute left-[24px] top-1/2 -translate-y-1/2 grid place-items-center w-[32px] h-[32px] border border-[#8a252c]/16 rounded-full bg-white !text-[#8a252c] !text-[0.82rem] !font-[900]">{i + 1}.</div><ProfileAvatar name={p.name} imageUrl={p.profileImageUrl} size={34} /><span className="flex-1 flex flex-col gap-[0.125rem] min-w-0"><strong className="!text-[#111827] !text-[1rem] !font-[850] leading-[1.25]">{p.name}</strong><small className="!text-[#64748b] !text-[0.875rem] !font-[700]">{p.role} - {p.identifier} - {p.section}</small><small className="!text-[#64748b] !text-[0.875rem] !font-[700]">{p.site}</small></span><span className="inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-[900] bg-[#fff8e1] !text-[#6c4c00] whitespace-nowrap">{fmt(p.total)}</span></Link>)}
          </div> : <div className="flex items-center justify-center min-h-[60px] rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-6 text-center !text-[#64748b] !font-[900]">{isLoading ? "Loading overtime records..." : "No overtime records match the selected filters."}</div>}
        </div>
      </section>
    </main>
  );
}
