"use client";
import React, { useState } from "react";
import Link from "next/link";
const people = [
  { id: "patricia-reyes", name: "Patricia Reyes", initials: "PR", role: "Clinical Instructor", identifier: "CI-2026-006", section: "BSN 3A", site: "Emergency Room", total: 6.83, weeklyTotal: 2 },
  { id: "miguel-santos", name: "Miguel Santos", initials: "MS", role: "Clinical Instructor", identifier: "CI-2026-011", section: "BSN 3B", site: "Pedia Pulmo Ward", total: 3.92, weeklyTotal: 3 },
  { id: "maria-cruz", name: "Maria Cruz", initials: "MC", role: "Student", identifier: "12-3456-789", section: "BSN 3A", site: "Emergency Room", total: 3.5, weeklyTotal: 1 },
  { id: "treasure-abadinas", name: "Treasure Abadinas", initials: "TA", role: "Student", identifier: "22-1845-103", section: "BSN 3A", site: "Delivery Room", total: 3.25, weeklyTotal: 2 },
  { id: "carlo-fernandez", name: "Carlo Fernandez", initials: "CF", role: "Student", identifier: "23-1188-902", section: "BSN 3A", site: "Operating Room", total: 2, weeklyTotal: 2 },
  { id: "andrea-gomez", name: "Andrea Gomez", initials: "AG", role: "Student", identifier: "20-4408-332", section: "BSN 4A", site: "Pedia Pulmo Ward", total: 1, weeklyTotal: 1 },
  { id: "mark-hernandez", name: "Mark Hernandez", initials: "MH", role: "Student", identifier: "21-5409-882", section: "BSN 4A", site: "Operating Room", total: 0.75, weeklyTotal: 0.75 },
  { id: "nicole-delapena", name: "Nicole Dela Pena", initials: "ND", role: "Student", identifier: "23-1023-441", section: "BSN 3A", site: "Medical Ward", total: 4.5, weeklyTotal: 4 },
  { id: "janine-aquino", name: "Janine Aquino", initials: "JA", role: "Student", identifier: "22-6102-719", section: "BSN 3C", site: "Delivery Room", total: 1.5, weeklyTotal: 1 },
  { id: "rafael-castillo", name: "Rafael Castillo", initials: "RC", role: "Student", identifier: "22-8820-431", section: "BSN 3B", site: "Operating Room", total: 5.5, weeklyTotal: 5 },
  { id: "bea-montes", name: "Bea Montes", initials: "BM", role: "Student", identifier: "23-5531-208", section: "BSN 3B", site: "Community Health", total: 2.25, weeklyTotal: 2 },
  { id: "sean-villamor", name: "Sean Villamor", initials: "SV", role: "Student", identifier: "23-9055-310", section: "BSN 3C", site: "Surgical Ward", total: 3, weeklyTotal: 3 },
];
export function OvertimeDetailsContent({ basePath }: { basePath: string }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1));
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Student");
  const [hoursFilter, setHoursFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 10;
  const monthLabel = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const matchesHours = (v: number, f: string) => {
    if (f === "all") return true;
    if (f === "1") return v >= 0 && v <= 1;
    if (f === "5") return v >= 5;
    return Math.floor(v) === Number(f);
  };
  const filtered = people.filter(p => {
    const q = search.toLowerCase();
    return (!search || p.name.toLowerCase().includes(q) || p.identifier.toLowerCase().includes(q) || p.section.toLowerCase().includes(q) || p.site.toLowerCase().includes(q))
      && (roleFilter === "all" || p.role === roleFilter)
      && matchesHours(p.weeklyTotal, hoursFilter);
  });
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const ghostBtn = "inline-flex items-center justify-center min-h-[38px] px-[1rem] rounded-[8px] bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.84rem] !font-[800] hover:border-[rgba(138,37,44,0.32)] hover:!text-[#8A252C] hover:shadow-[0_10px_24px_rgba(32,33,36,0.08)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const inputCls = "w-full min-h-[48px] px-3 py-2 border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] !font-[500] focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all";
  const labelCls = "flex flex-col gap-1.5 m-0 !text-[0.875rem] !font-[800] !text-[#344054]";
  const fmt = (v: number) => !v ? "0 hrs" : `${Number(v).toFixed(v % 1 === 0 ? 0 : 2).replace(/\.?0+$/, "")} hrs`;
  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)] content-start">
      <section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem]">
        <div className="flex items-center justify-between gap-[22px] mb-[1.1rem] border-b border-[#e5eaf1] pb-[1.1rem] flex-wrap max-[720px]:flex-col max-[720px]:items-start">
          <h2 className="m-0 !text-[#111827] !text-[1.15rem] !font-[800] tracking-[-0.03em]">People with Overtime Records</h2>
          <div className="flex items-center gap-[0.75rem] flex-wrap">
            <div className="inline-flex items-center min-h-[38px] border border-[#e2e8f0] rounded-full bg-white overflow-hidden shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
              <button className="w-[38px] min-h-[38px] border-none bg-transparent !text-[#7f1d1d] !text-[1rem] !font-[900] cursor-pointer hover:bg-[#fff7d6] transition-colors" type="button" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>&lt;</button>
              <span className="min-w-[132px] px-[0.75rem] !text-[#243b64] text-center !text-[0.86rem] !font-[900]">{monthLabel}</span>
              <button className="w-[38px] min-h-[38px] border-none bg-transparent !text-[#7f1d1d] !text-[1rem] !font-[900] cursor-pointer hover:bg-[#fff7d6] transition-colors" type="button" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>&gt;</button>
            </div>
            <span className="inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-[800] bg-[#fff8e1] !text-[#6c4c00]">{filtered.length} people</span>
          </div>
        </div>
        <div className="grid gap-[1rem] mb-[1rem] grid-cols-3 max-[980px]:grid-cols-1">
          <label className={labelCls} htmlFor="ot-search">Search person<input className={inputCls} id="ot-search" type="search" placeholder="Search name, ID, section, or site" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} /></label>
          <label className={labelCls} htmlFor="ot-role">Type<select className={`${inputCls} cursor-pointer`} id="ot-role" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }}><option value="all">All Types</option><option value="Clinical Instructor">Clinical Instructor</option><option value="Student">Student</option></select></label>
          <label className={labelCls} htmlFor="ot-hours">OT Hours<select className={`${inputCls} cursor-pointer`} id="ot-hours" value={hoursFilter} onChange={e => { setHoursFilter(e.target.value); setCurrentPage(1); }}><option value="all">All Hours</option><option value="1">0–1 hr</option><option value="2">2 hrs</option><option value="3">3 hrs</option><option value="4">4 hrs</option><option value="5">5+ hrs</option></select></label>
        </div>
        <div className={`flex flex-col border border-[#e2e8f0] overflow-hidden bg-white rounded-t-lg ${totalPages > 1 ? "" : "rounded-b-lg"}`}>
          {paged.map((p, i) => (
            <Link key={p.id} href={`${basePath}/overtime-details/detail?id=${p.id}&period=${encodeURIComponent(monthLabel)}`} className="relative pl-[72px] flex items-center gap-[1.25rem] w-full p-[1rem_1.5rem] border-b border-[#e2e8f0] bg-white hover:bg-[#f8fafc] transition-colors cursor-pointer no-underline text-inherit last:border-b-0" tabIndex={0}>
              <div className="absolute left-[24px] top-1/2 -translate-y-1/2 grid place-items-center w-[32px] h-[32px] border border-[#8a252c]/16 rounded-full bg-white !text-[#8a252c] !text-[0.82rem] !font-[900]">{(currentPage - 1) * PER_PAGE + i + 1}.</div>
              <span className="shrink-0 bg-[#ffc107] !text-[#111827] w-[34px] h-[34px] rounded-full flex items-center justify-center !font-[700] !text-[0.85rem]">{p.initials}</span>
              <span className="flex-1 flex flex-col gap-[0.125rem] min-w-0">
                <strong className="!text-[#111827] !text-[1rem] !font-[850] leading-[1.25]">{p.name}</strong>
                <small className="!text-[#64748b] !text-[0.875rem] !font-[700]">{p.role} - {p.identifier}{p.section ? ` - ${p.section}` : ''}</small>
                <small className="!text-[#64748b] !text-[0.875rem] !font-[700]">{p.site} - {monthLabel}</small>
              </span>
              <span className="inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-[800] bg-[#fff8e1] !text-[#6c4c00]">{fmt(p.weeklyTotal)}</span>
            </Link>
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-[1rem_1.5rem] border border-[#e2e8f0] border-t-0 rounded-b-lg bg-[#f8fafc]">
            <button className={ghostBtn} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
            <span className="!text-[0.875rem] !font-[600] !text-[#64748b]">Page {currentPage} of {totalPages}</span>
            <button className={ghostBtn} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
          </div>
        )}
        {filtered.length === 0 && <div className="m-0 mt-[1rem] border border-dashed border-[#cbd5e1] rounded-lg bg-[#f8fafc] p-[1.25rem] !text-[#64748b] !font-[800] text-center">No overtime records match the selected filters.</div>}
      </section>
    </main>
  );
}
