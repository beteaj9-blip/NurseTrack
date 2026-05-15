"use client";
import React, { useState } from "react";
import Link from "next/link";
export function ManualBackupContent({ basePath }: { basePath: string }) {
  const [search, setSearch] = useState("");
  const ciData = [
    { id: "Patricia Reyes", initials: "PR", name: "Patricia Reyes, RN, MAN", records: "4 encoded attendance records - Latest: May 3, 2026, 8:18 PM", statusText: "2 pending", statusClass: "status-pending" },
    { id: "Miguel Santos", initials: "MS", name: "Miguel Santos, RN, MAN", records: "0 encoded attendance records - Latest: No manual record encoded yet", statusText: "No records yet", statusClass: "status-muted" },
    { id: "Elena Dela Cruz", initials: "ED", name: "Elena Dela Cruz, RN, MN", records: "0 encoded attendance records - Latest: No manual record encoded yet", statusText: "No records yet", statusClass: "status-muted" },
  ];
  const filtered = ciData.filter(ci => (ci.name + " " + ci.records + " " + ci.statusText).toLowerCase().includes(search.toLowerCase()));
  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]">
      <section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem]">
        <div className="flex items-center justify-between gap-4 mb-[1.1rem] pb-0 border-b border-[#e5eaf1] flex-wrap">
          <h2 className="m-0 !text-[#111827] !text-[1.15rem] !font-bold tracking-[-0.03em]">Clinical Instructor List</h2>
          <span className="inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#e9f8ef] !text-[#03703c]">{filtered.length} visible</span>
        </div>
        <div className="grid gap-[1rem] mb-[1rem] grid-cols-3 max-[720px]:grid-cols-1">
          <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]" htmlFor="mb-search">Search
            <input className="w-full min-h-[48px] px-3 py-2 border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all" id="mb-search" type="search" placeholder="Search CI name or attendance records" value={search} onChange={e => setSearch(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]" htmlFor="mb-assignment">Assignment
            <select className="w-full min-h-[48px] px-3 py-2 border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all cursor-pointer" id="mb-assignment"><option>All assignments</option></select>
          </label>
          <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]" htmlFor="mb-status">Status
            <select className="w-full min-h-[48px] px-3 py-2 border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all cursor-pointer" id="mb-status"><option>All statuses</option></select>
          </label>
        </div>
        <div className="flex flex-col border border-[#e2e8f0] rounded-lg overflow-hidden bg-white">
          {filtered.map((ci, i) => {
            const statusColor = ci.statusClass === "status-pending" ? "bg-[#fff8e1] !text-[#6c4c00]" : "bg-[#f1f5f9] !text-[#475569]";
            return (
              <Link key={ci.id} className="relative flex items-center w-full text-left p-[1rem_1.5rem] pl-[72px] border-b border-[#e2e8f0] bg-transparent hover:bg-[#f8fafc] transition-colors cursor-pointer no-underline text-inherit last:border-b-0" href={`${basePath}/manual-backup/review`}>
                <div className="absolute left-[24px] top-1/2 -translate-y-1/2 grid place-items-center w-[32px] h-[32px] border border-[#8a252c]/16 rounded-full bg-white !text-[#8a252c] !text-[0.82rem] !font-[900]">{i + 1}.</div>
                <span className="shrink-0 w-[42px] h-[42px] rounded-full flex items-center justify-center !text-[0.82rem] !font-extrabold bg-[#ffc107] !text-[#111827]">{ci.initials}</span>
                <span className="flex flex-col gap-[0.125rem] flex-1 ml-[1.25rem]">
                  <strong className="!text-[#0f172a] !text-[0.88rem] !font-bold">{ci.name}</strong>
                  <small className="!text-[#64748b] !text-[0.875rem]">{ci.records}</small>
                </span>
                <span className={`inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap ${statusColor}`}>{ci.statusText}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
