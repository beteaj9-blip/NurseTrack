"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAllAppeals, useInstructorAppeals } from "@/core/api/hooks/useStudentAppeals";
import { useAuthStore } from "@/core/store/authStore";
import { InlineSelect } from "@/components/ui/InlineSelect";
import { LoadingState } from "@/components/ui/LoadingState";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";

const levelOptions = [{ value: "all", label: "All levels" }, 1, 2, 3, 4].map((level) => typeof level === "number" ? { value: String(level), label: `Level ${level}` } : level);

function levelsFromText(value?: string) {
  const text = String(value ?? "");
  const levels = new Set<number>();
  const numeric = text.match(/(?:^|\b)(?:n|bsn|level)\s*([1-4])\b/i) ?? text.match(/\b([1-4])(?:st|nd|rd|th)\s*level\b/i);
  if (numeric) levels.add(Number(numeric[1]));
  if (/level\s*i\b/i.test(text)) levels.add(1);
  if (/level\s*ii\b/i.test(text)) levels.add(2);
  if (/level\s*iii\b/i.test(text)) levels.add(3);
  if (/level\s*iv\b/i.test(text)) levels.add(4);
  return Array.from(levels).sort((a, b) => a - b);
}

function levelsFromAppeal(appeal: any) {
  const levels = new Set<number>();
  (appeal.studentAssignedLevels ?? appeal.student?.assignedLevels ?? []).forEach((level: number) => Number.isFinite(level) && levels.add(level));
  levelsFromText(appeal.sectionInfo).forEach((level) => levels.add(level));
  return Array.from(levels).sort((a, b) => a - b);
}

function appealStageKey(appeal: any) {
  if (appeal.status === "ACCEPTED" || appeal.status === "RETURNED") return appeal.status;
  if (appeal.instructorDecision === "ACCEPTED") return "CI_ACCEPTED";
  if (appeal.instructorDecision === "RETURNED") return "CI_RETURNED";
  return "PENDING";
}

function statusLabel(status?: string) {
  if (status === "ACCEPTED") return "ACCEPTED";
  if (status === "RETURNED") return "REJECTED";
  if (status === "CI_ACCEPTED") return "CI ACCEPTED";
  if (status === "CI_RETURNED") return "CI REJECTED";
  return "CI PENDING";
}

function statusClass(status?: string) {
  if (status === "ACCEPTED" || status === "CI_ACCEPTED") return "bg-[#e9f8ef] !text-[#03703c]";
  if (status === "RETURNED" || status === "CI_RETURNED") return "bg-[#fef2f2] !text-[#991b1b]";
  return "bg-[#fff8e1] !text-[#6c4c00]";
}

export function CiRecommendationsContent({ basePath }: { basePath: string }) {
  const user = useAuthStore((state) => state.user);
  const isAllScope = basePath === "/admin" || basePath === "/chair" || basePath === "/coordinator" || basePath === "/assistant";
  const isReviewerQueue = isAllScope;
  const canFilterByLevel = basePath === "/admin" || basePath === "/coordinator";
  const scopedViewerId = (basePath === "/chair" || basePath === "/assistant") && user?.id != null ? String(user.id) : undefined;
  const { data: instructorAppeals = [], isLoading: isInstructorLoading } = useInstructorAppeals();
  const { data: allAppeals = [], isLoading: isAllLoading } = useAllAppeals(isAllScope, scopedViewerId);
  const appeals = isAllScope ? allAppeals : instructorAppeals;
  const isLoading = isAllScope ? isAllLoading : isInstructorLoading;
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 10;
  const sections = Array.from(new Set((appeals as any[]).map((appeal: any) => appeal.sectionInfo).filter(Boolean))).sort() as string[];
  const sectionOptions = [{ value: "all", label: "All sections" }, ...sections.map((section) => ({ value: section, label: section }))];
  const statusOptions = isReviewerQueue
    ? [{ value: "all", label: "All statuses" }, { value: "PENDING", label: "CI pending" }, { value: "CI_ACCEPTED", label: "CI accepted" }, { value: "ACCEPTED", label: "Accepted" }, { value: "RETURNED", label: "Rejected" }]
    : [{ value: "all", label: "All statuses" }, { value: "PENDING", label: "Pending CI" }, { value: "CI_ACCEPTED", label: "CI accepted" }, { value: "CI_RETURNED", label: "CI rejected" }, { value: "ACCEPTED", label: "Accepted" }, { value: "RETURNED", label: "Rejected" }];
  const filtered = (appeals as any[]).filter((appeal: any) => {
    const q = search.toLowerCase();
    const stage = appealStageKey(appeal);
    const reachesReviewerQueue = !isReviewerQueue || appeal.status !== "PENDING" || appeal.instructorDecision !== "RETURNED";
    return (!search || String(appeal.studentName ?? "").toLowerCase().includes(q) || String(appeal.schoolId ?? "").toLowerCase().includes(q) || String(appeal.sectionInfo ?? "").toLowerCase().includes(q) || String(appeal.subject ?? "").toLowerCase().includes(q))
      && reachesReviewerQueue
      && (sectionFilter === "all" || appeal.sectionInfo === sectionFilter)
      && (!canFilterByLevel || levelFilter === "all" || levelsFromAppeal(appeal).includes(Number(levelFilter)))
      && (statusFilter === "all" || stage === statusFilter);
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
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
        <div className={canFilterByLevel ? "grid gap-[1rem] mb-[1rem] grid-cols-[minmax(0,1.35fr)_minmax(170px,1fr)_minmax(150px,0.75fr)_minmax(170px,1fr)] max-[1100px]:grid-cols-2 max-[680px]:grid-cols-1" : "grid gap-[1rem] mb-[1rem] grid-cols-3 max-[980px]:grid-cols-1"}>
          <label className={labelCls} htmlFor="cir-search">Search<input className={inputCls} id="cir-search" type="search" placeholder="Search name, student ID, section, or appeal" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} /></label>
          <label className={labelCls} htmlFor="cir-section">Section<InlineSelect value={sectionFilter} options={sectionOptions} placeholder="All sections" onChange={(value) => { setSectionFilter(value); setCurrentPage(1); }} /></label>
          {canFilterByLevel && <label className={labelCls} htmlFor="cir-level">Level<InlineSelect value={levelFilter} options={levelOptions} placeholder="All levels" onChange={(value) => { setLevelFilter(value); setCurrentPage(1); }} /></label>}
          <label className={labelCls} htmlFor="cir-status">Status<InlineSelect value={statusFilter} options={statusOptions} placeholder="All statuses" onChange={(value) => { setStatusFilter(value); setCurrentPage(1); }} /></label>
        </div>
        <div className={`flex flex-col border border-[#e2e8f0] overflow-hidden bg-white rounded-t-lg ${totalPages > 1 ? "" : "rounded-b-lg"}`}>
          {paged.map((appeal: any, i: number) => (
            <Link key={appeal.id} href={`${basePath}/ci-recommendations/detail?id=${appeal.id}`} className="grid w-full grid-cols-[32px_34px_minmax(0,1fr)_auto] items-center gap-[1rem] p-[1rem_1.5rem] border-b border-[#e2e8f0] bg-white hover:bg-[#f8fafc] transition-colors cursor-pointer no-underline text-inherit last:border-b-0 max-[520px]:grid-cols-[32px_34px_minmax(0,1fr)] max-[520px]:gap-3 max-[520px]:p-3" tabIndex={0}>
              <div className="grid place-items-center w-[32px] h-[32px] border border-[#8a252c]/16 rounded-full bg-white !text-[#8a252c] !text-[0.82rem] !font-[900]">{(currentPage - 1) * PER_PAGE + i + 1}.</div>
              <ProfileAvatar name={appeal.studentName} imageUrl={appeal.studentProfileImageUrl} size={34} />
              <span className="min-w-0 flex flex-col gap-[0.125rem]"><strong className="truncate !text-[#0f172a] !text-[1rem] !font-[850] leading-[1.25] max-[520px]:whitespace-normal max-[520px]:break-words">{appeal.studentName}</strong><small className="truncate !text-[#64748b] !text-[0.875rem] !font-[700] max-[520px]:whitespace-normal max-[520px]:break-words">{appeal.sectionInfo || "No section"} - {appeal.schoolId || "No student ID"}</small><small className="truncate !text-[#475569] !text-[0.875rem] !font-[600] mt-[2px] max-[520px]:whitespace-normal max-[520px]:break-words">{appeal.subject || "Student appeal"}</small></span>
              <span className={`inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-[800] whitespace-nowrap ${statusClass(appealStageKey(appeal))} max-[520px]:col-start-3 max-[520px]:mt-1`}>{statusLabel(appealStageKey(appeal))}</span>
            </Link>
          ))}
        </div>
        {totalPages > 1 && <div className="flex justify-between items-center p-[1rem_1.5rem] gap-2 border border-[#e2e8f0] border-t-0 rounded-b-lg bg-[#f8fafc]"><button className={ghostBtn} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button><span className="!text-[0.875rem] !font-[600] !text-[#64748b] whitespace-nowrap"><span className="hidden sm:inline">Page </span>{currentPage} of {totalPages}</span><button className={ghostBtn} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button></div>}
        {filtered.length === 0 && (isLoading ? <LoadingState message="Loading student appeals..." className="mt-[1rem] rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc]" /> : <div className="m-0 mt-[1rem] border border-dashed border-[#cbd5e1] rounded-lg bg-[#f8fafc] p-[1.25rem] !text-[#64748b] !font-[800] text-center">No appeals match the selected filters.</div>)}
      </section>
    </main>
  );
}
