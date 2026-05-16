"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAllAttendance } from "@/core/api/hooks/useAttendance";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";

function fmt(hours: number) {
  return `${Number(hours || 0).toFixed(Number.isInteger(hours) ? 0 : 2).replace(/\.00$/, "")} hrs`;
}

export function OvertimeDetailsContent({ basePath }: { basePath: string }) {
  const { data: attendance = [], isLoading } = useAllAttendance();
  const [search, setSearch] = useState("");
  const people = Object.values((attendance as any[]).reduce((acc: Record<string, any>, record: any) => {
    const overtime = Math.max(Number(record.hours || 0) - 8, 0);
    if (overtime <= 0) return acc;
    const key = String(record.studentId);
    const current = acc[key] ?? { id: record.studentId, name: record.studentName, profileImageUrl: record.studentProfileImageUrl, identifier: record.studentSchoolId, section: record.studentSection, site: record.hospital || record.area, total: 0 };
    current.total += overtime;
    acc[key] = current;
    return acc;
  }, {}));
  const filtered = people.filter((p: any) => `${p.name} ${p.identifier} ${p.section} ${p.site}`.toLowerCase().includes(search.toLowerCase()));
  return <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)] content-start"><section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem]"><div className="flex items-center justify-between gap-[22px] mb-[1.1rem] border-b border-[#e5eaf1] pb-[1.1rem] flex-wrap"><h2 className="m-0 !text-[#111827] !text-[1.15rem] !font-[800] tracking-[-0.03em]">People with Overtime Records</h2><span className="inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-[800] bg-[#fff8e1] !text-[#6c4c00]">{filtered.length} people</span></div><label className="flex flex-col gap-1.5 m-0 mb-[1rem] !text-[0.875rem] !font-[800] !text-[#344054]" htmlFor="ot-search">Search person<input className="w-full min-h-[48px] px-3 py-2 border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] !font-[500] focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all" id="ot-search" type="search" placeholder="Search name, ID, section, or site" value={search} onChange={(e) => setSearch(e.target.value)} /></label><div className="flex flex-col border border-[#e2e8f0] overflow-hidden bg-white rounded-lg">{filtered.map((p: any, i: number) => <Link key={p.id} href={`${basePath}/overtime-details/detail?id=${p.id}`} className="relative pl-[72px] flex items-center gap-[1.25rem] w-full p-[1rem_1.5rem] border-b border-[#e2e8f0] bg-white hover:bg-[#f8fafc] transition-colors cursor-pointer no-underline text-inherit last:border-b-0"><div className="absolute left-[24px] top-1/2 -translate-y-1/2 grid place-items-center w-[32px] h-[32px] border border-[#8a252c]/16 rounded-full bg-white !text-[#8a252c] !text-[0.82rem] !font-[900]">{i + 1}.</div><ProfileAvatar name={p.name} imageUrl={p.profileImageUrl} size={34} /><span className="flex-1 flex flex-col gap-[0.125rem] min-w-0"><strong className="!text-[#111827] !text-[1rem] !font-[850] leading-[1.25]">{p.name}</strong><small className="!text-[#64748b] !text-[0.875rem] !font-[700]">Student - {p.identifier} - {p.section}</small><small className="!text-[#64748b] !text-[0.875rem] !font-[700]">{p.site}</small></span><span className="inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-[800] bg-[#fff8e1] !text-[#6c4c00]">{fmt(p.total)}</span></Link>)}</div>{filtered.length === 0 && <div className="m-0 mt-[1rem] border border-dashed border-[#cbd5e1] rounded-lg bg-[#f8fafc] p-[1.25rem] !text-[#64748b] !font-[800] text-center">{isLoading ? "Loading overtime records..." : "No overtime records found."}</div>}</section></main>;
}
