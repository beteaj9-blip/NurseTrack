"use client";
import React, { useState } from "react";
import Link from "next/link";
const students = [
  { id: "12-3456-789", name: "Maria Cruz", initials: "MC", section: "BSN 3A", count: 1 },
  { id: "22-1845-103", name: "Treasure Abadinas", initials: "TA", section: "BSN 3A", count: 2 },
  { id: "23-1023-441", name: "Nicole Dela Pena", initials: "ND", section: "BSN 3A", count: 1 },
  { id: "21-5589-201", name: "Mark Bautista", initials: "MB", section: "BSN 3B", count: 1 },
  { id: "21-7740-118", name: "Zander Aligato", initials: "ZA", section: "BSN 3B", count: 1 },
  { id: "22-6102-719", name: "Janine Aquino", initials: "JA", section: "BSN 3C", count: 1 },
  { id: "23-9901-512", name: "Sarah Geronimo", initials: "SG", section: "BSN 3C", count: 1 },
  { id: "23-4190-778", name: "Miguel Reyes", initials: "MR", section: "BSN 3C", count: 2 },
  { id: "22-7304-122", name: "Patricia Uy", initials: "PU", section: "BSN 3C", count: 1 },
  { id: "21-3091-450", name: "Camille Navarro", initials: "CN", section: "BSN 4A", count: 3 },
  { id: "20-4408-332", name: "Andrea Gomez", initials: "AG", section: "BSN 4A", count: 1 },
];
export function CiRecommendationsContent({ basePath }: { basePath: string }) {
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 10;
  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    return (!search || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.section.toLowerCase().includes(q))
      && (sectionFilter === "all" || s.section === sectionFilter)
      && (statusFilter === "all" || statusFilter === "pending");
  });
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const ghostBtn = "inline-flex items-center justify-center min-h-[38px] px-[1rem] rounded-[8px] bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.84rem] !font-[800] hover:border-[rgba(138,37,44,0.32)] hover:!text-[#8A252C] hover:shadow-[0_10px_24px_rgba(32,33,36,0.08)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const inputCls = "w-full min-h-[48px] px-3 py-2 border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] !font-[500] focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all";
  const labelCls = "flex flex-col gap-1.5 m-0 !text-[0.875rem] !font-[800] !text-[#344054]";
  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)] content-start">
      <section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem]">
        <div className="flex items-start justify-between gap-[22px] mb-[1.1rem] border-b border-[#e5eaf1] pb-[1.1rem] flex-wrap">
          <h2 className="m-0 !text-[#111827] !text-[1.15rem] !font-[800] tracking-[-0.03em]">Student Appeal List</h2>
          <span className="inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-[800] bg-[#e9f8ef] !text-[#03703c]">{filtered.length} visible</span>
        </div>
        <div className="grid gap-[1rem] mb-[1rem] grid-cols-3 max-[980px]:grid-cols-1">
          <label className={labelCls} htmlFor="cir-search">Search<input className={inputCls} id="cir-search" type="search" placeholder="Search name, student ID, or section" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} /></label>
          <label className={labelCls} htmlFor="cir-section">Section<select className={`${inputCls} cursor-pointer`} id="cir-section" value={sectionFilter} onChange={e => { setSectionFilter(e.target.value); setCurrentPage(1); }}><option value="all">All sections</option><option value="BSN 3A">BSN 3A</option><option value="BSN 3B">BSN 3B</option><option value="BSN 3C">BSN 3C</option><option value="BSN 4A">BSN 4A</option></select></label>
          <label className={labelCls} htmlFor="cir-status">Status<select className={`${inputCls} cursor-pointer`} id="cir-status" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}><option value="all">All statuses</option><option value="pending">Pending review</option></select></label>
        </div>
        <div className={`flex flex-col border border-[#e2e8f0] overflow-hidden bg-white rounded-t-lg ${totalPages > 1 ? "" : "rounded-b-lg"}`}>
          {paged.map((s, i) => (
            <Link key={s.id} href={`${basePath}/ci-recommendations/detail?student=${s.name.toLowerCase().replace(/ /g, '-')}`} className="relative pl-[72px] flex items-center gap-[1.25rem] w-full p-[1rem_1.5rem] border-b border-[#e2e8f0] bg-white hover:bg-[#f8fafc] transition-colors cursor-pointer no-underline text-inherit last:border-b-0" tabIndex={0}>
              <div className="absolute left-[24px] top-1/2 -translate-y-1/2 grid place-items-center w-[32px] h-[32px] border border-[#8a252c]/16 rounded-full bg-white !text-[#8a252c] !text-[0.82rem] !font-[900]">{(currentPage - 1) * PER_PAGE + i + 1}.</div>
              <span className="shrink-0 bg-[#ffc107] !text-[#111827] w-[34px] h-[34px] rounded-full flex items-center justify-center !font-[700] !text-[0.85rem]">{s.initials}</span>
              <span className="flex-1 flex flex-col gap-[0.125rem] min-w-0">
                <strong className="!text-[#0f172a] !text-[1rem] !font-[850] leading-[1.25]">{s.name}</strong>
                <small className="!text-[#64748b] !text-[0.875rem] !font-[700]">{s.section} - {s.id}</small>
                <small className="!text-[#475569] !text-[0.875rem] !font-[600] mt-[2px]">{s.count} appeal{s.count === 1 ? '' : 's'} for review</small>
              </span>
              <span className="inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-[800] whitespace-nowrap bg-[#fff8e1] !text-[#6c4c00]">Pending review</span>
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
        {filtered.length === 0 && <div className="m-0 mt-[1rem] border border-dashed border-[#cbd5e1] rounded-lg bg-[#f8fafc] p-[1.25rem] !text-[#64748b] !font-[800] text-center">No students match the selected filters.</div>}
      </section>
    </main>
  );
}
