"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAllAttendance } from "@/core/api/hooks/useAttendance";
import { useAuthStore } from "@/core/store/authStore";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";

function formatDate(value?: string) {
  if (!value) return "No manual record encoded yet";
  return new Date(value).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export function ManualBackupContent({ basePath }: { basePath: string }) {
  const user = useAuthStore((state) => state.user);
  const isChair = basePath === "/chair";
  const { data: attendance = [], isLoading } = useAllAttendance(true, isChair && user?.id != null ? String(user.id) : undefined);
  const [search, setSearch] = useState("");
  const instructors = Object.values((attendance as any[]).filter((record) => record.instructorFeedback).reduce((acc: Record<string, any>, record: any) => {
    const key = String(record.instructorId || record.instructorName);
    const current = acc[key] ?? { id: record.instructorId, name: record.instructorName || "Clinical Instructor", profileImageUrl: record.instructorProfileImageUrl, count: 0, pending: 0, latest: record.timeIn };
    current.count += 1;
    current.pending += record.status === "PENDING" ? 1 : 0;
    if (record.timeIn && (!current.latest || new Date(record.timeIn) > new Date(current.latest))) current.latest = record.timeIn;
    acc[key] = current;
    return acc;
  }, {}));
  const filtered = instructors.filter((ci: any) => `${ci.name} ${ci.count} ${ci.pending}`.toLowerCase().includes(search.toLowerCase()));
  return <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]"><section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem]"><div className="flex items-center justify-between gap-4 mb-[1.1rem] pb-0 border-b border-[#e5eaf1] flex-wrap"><h2 className="m-0 !text-[#111827] !text-[1.15rem] !font-bold tracking-[-0.03em]">Clinical Instructor Manual Attendance</h2><span className="inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold bg-[#e9f8ef] !text-[#03703c]">{filtered.length} visible</span></div><label className="flex flex-col gap-1.5 m-0 mb-[1rem] !text-sm !font-bold !text-[#344054]" htmlFor="mb-search">Search<input className="w-full min-h-[48px] px-3 py-2 border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all" id="mb-search" type="search" placeholder="Search CI name or attendance records" value={search} onChange={(e) => setSearch(e.target.value)} /></label><div className="flex flex-col border border-[#e2e8f0] rounded-lg overflow-hidden bg-white">{filtered.map((ci: any, i: number) => <Link key={ci.id || ci.name} className="relative flex items-center w-full text-left p-[1rem_1.5rem] pl-[72px] border-b border-[#e2e8f0] bg-transparent hover:bg-[#f8fafc] transition-colors cursor-pointer no-underline text-inherit last:border-b-0" href={`${basePath}/manual-backup/review?instructorId=${ci.id}`}><div className="absolute left-[24px] top-1/2 -translate-y-1/2 grid place-items-center w-[32px] h-[32px] border border-[#8a252c]/16 rounded-full bg-white !text-[#8a252c] !text-[0.82rem] !font-[900]">{i + 1}.</div><ProfileAvatar name={ci.name} imageUrl={ci.profileImageUrl} size={42} /><span className="flex flex-col gap-[0.125rem] flex-1 ml-[1.25rem]"><strong className="!text-[#0f172a] !text-[0.88rem] !font-bold">{ci.name}</strong><small className="!text-[#64748b] !text-[0.875rem]">{ci.count} encoded attendance records - Latest: {formatDate(ci.latest)}</small></span><span className="inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#fff8e1] !text-[#6c4c00]">{ci.pending} pending</span></Link>)}</div>{filtered.length === 0 && <div className="m-0 mt-[1rem] border border-dashed border-[#cbd5e1] rounded-lg bg-[#f8fafc] p-[1.25rem] !text-[#64748b] !font-[700] text-center">{isLoading ? "Loading manual attendance records..." : "No manual attendance records found."}</div>}</section></main>;
}
