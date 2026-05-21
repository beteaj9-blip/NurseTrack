"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useClearanceSettings, useClearances, useUpdateClearanceSettings } from "@/core/api/hooks/useClearance";
import { InlineSelect } from "@/components/ui/InlineSelect";
import { LoadingState } from "@/components/ui/LoadingState";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { useToast } from "@/components/ui/ToastProvider";
import { useAuthStore } from "@/core/store/authStore";

function statusLabel(status?: string) {
  if (status === "CLEARED" || status === "APPROVED") return "Approved";
  if (status === "IN_REVIEW") return "Submitted";
  return "Not submitted";
}

function statusClass(status?: string) {
  if (status === "CLEARED" || status === "APPROVED") return "bg-[#e9f8ef] !text-[#03703c]";
  if (status === "IN_REVIEW") return "bg-[#fff8e1] !text-[#6c4c00]";
  return "bg-[#fef2f2] !text-[#991b1b]";
}

const levelOptions = [{ value: "all", label: "All levels" }, 1, 2, 3, 4].map((level) => typeof level === "number" ? { value: String(level), label: `Level ${level}` } : level);

function levelsFromRecord(record: any) {
  const levels = new Set<number>();
  (record.studentAssignedLevels ?? record.student?.assignedLevels ?? []).forEach((level: number) => Number.isFinite(level) && levels.add(level));
  const text = String(record.studentSection ?? "");
  const numeric = text.match(/(?:^|\b)(?:n|bsn|level)\s*([1-4])\b/i) ?? text.match(/\b([1-4])(?:st|nd|rd|th)\s*level\b/i);
  if (numeric) levels.add(Number(numeric[1]));
  if (/level\s*i\b/i.test(text)) levels.add(1);
  if (/level\s*ii\b/i.test(text)) levels.add(2);
  if (/level\s*iii\b/i.test(text)) levels.add(3);
  if (/level\s*iv\b/i.test(text)) levels.add(4);
  return Array.from(levels).sort((a, b) => a - b);
}

export function ClearanceContent({ basePath }: { basePath: string }) {
  const { data: clearances = [], isLoading } = useClearances();
  const { data: settings } = useClearanceSettings();
  const updateSettings = useUpdateClearanceSettings();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 10;
  const user = useAuthStore((state) => state.user);
  const canFilterByLevel = user?.role === "ADMIN" || user?.role === "COORDINATOR";
  const sections = Array.from(new Set((clearances as any[]).map((c) => c.studentSection).filter(Boolean))).sort();
  const sectionOptions = [{ value: "all", label: "All sections" }, ...sections.map((section: any) => ({ value: section, label: section }))];
  const statusOptions = [{ value: "all", label: "All statuses" }, { value: "LOCKED", label: "Not submitted" }, { value: "IN_REVIEW", label: "Submitted" }, { value: "CLEARED", label: "Approved" }];
  const filtered = (clearances as any[]).filter((c) => {
    const q = search.toLowerCase();
    const label = statusLabel(c.status);
    return (!search || `${c.studentName} ${c.studentSchoolId} ${c.studentSection} ${label}`.toLowerCase().includes(q))
      && (sectionFilter === "all" || c.studentSection === sectionFilter)
      && (!canFilterByLevel || levelFilter === "all" || levelsFromRecord(c).includes(Number(levelFilter)))
      && (statusFilter === "all" || c.status === statusFilter);
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const inputCls = "w-full min-h-[48px] px-3 py-2 border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all";
  const labelCls = "flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]";
  const ghostBtn = "inline-flex items-center justify-center min-h-[38px] px-[1rem] rounded-[8px] bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.84rem] !font-[800] hover:border-[rgba(138,37,44,0.32)] hover:!text-[#8A252C] hover:shadow-[0_10px_24px_rgba(32,33,36,0.08)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const clearanceEnabled = settings?.enabled !== false;
  const canToggleSubmissions = user?.role === "ADMIN" || user?.role === "CHAIR";

  React.useEffect(() => {
    setCurrentPage(page => Math.min(page, totalPages));
  }, [totalPages]);

  const handleToggleClearance = async () => {
    try {
      const nextEnabled = !clearanceEnabled;
      await updateSettings.mutateAsync(nextEnabled);
      showToast({ variant: "success", title: nextEnabled ? "Clearance enabled" : "Clearance disabled", message: nextEnabled ? "Students can submit clearance requests." : "Students cannot submit clearance requests." });
    } catch {
      showToast({ variant: "error", title: "Update failed", message: "Clearance availability could not be changed." });
    }
  };

  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]">
      <section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem]">
        <div className="flex items-start justify-between gap-[22px] mb-[1.1rem] border-b border-[#e5eaf1] pb-[1.1rem] flex-wrap">
          <div><h2 className="m-0 !text-[#111827] !text-[1.15rem] !font-bold tracking-[-0.03em]">All-Section Clearance List</h2><p className="m-[0.35rem_0_0] !text-[#64748b] !text-[0.86rem] !font-[700]">{clearanceEnabled ? "Student clearance submission is enabled." : "Student clearance submission is disabled."}</p></div>
          <div className="flex items-center gap-3 flex-wrap">{canToggleSubmissions && <button type="button" disabled={updateSettings.isPending} onClick={handleToggleClearance} className={`inline-flex items-center justify-center min-h-[42px] px-4 rounded-lg !text-[0.86rem] !font-[900] cursor-pointer disabled:opacity-60 ${clearanceEnabled ? "bg-white border border-[#fca5a5] !text-[#b91c1c] hover:bg-[#fef2f2]" : "bg-[#8A252C] border border-[#8A252C] !text-white hover:bg-[#6d1d23]"}`}>{clearanceEnabled ? "Disable Submissions" : "Enable Submissions"}</button>}<span className="inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold bg-[#e9f8ef] !text-[#03703c]">{filtered.length} visible</span></div>
        </div>
        <div className={canFilterByLevel ? "grid gap-[1rem] mb-[1rem] grid-cols-[minmax(0,1.35fr)_minmax(170px,1fr)_minmax(150px,0.75fr)_minmax(170px,1fr)] max-[1100px]:grid-cols-2 max-[680px]:grid-cols-1" : "grid gap-[1rem] mb-[1rem] grid-cols-3 max-[980px]:grid-cols-1"}>
          <label className={labelCls} htmlFor="cl-search">Search<input className={inputCls} id="cl-search" type="search" placeholder="Search name, student ID, section, or status" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} /></label>
          <label className={labelCls} htmlFor="cl-section">Section<InlineSelect value={sectionFilter} options={sectionOptions} placeholder="All sections" onChange={(value) => { setSectionFilter(value); setCurrentPage(1); }} /></label>
          {canFilterByLevel && <label className={labelCls} htmlFor="cl-level">Level<InlineSelect value={levelFilter} options={levelOptions} placeholder="All levels" onChange={(value) => { setLevelFilter(value); setCurrentPage(1); }} /></label>}
          <label className={labelCls} htmlFor="cl-status">Clearance<InlineSelect value={statusFilter} options={statusOptions} placeholder="All statuses" onChange={(value) => { setStatusFilter(value); setCurrentPage(1); }} /></label>
        </div>
        <div className={`flex flex-col border border-[#e2e8f0] overflow-hidden bg-white rounded-t-lg ${totalPages > 1 ? "" : "rounded-b-lg"}`}>
          {paged.map((c: any, i: number) => <Link key={c.id ?? c.studentId ?? i} href={`${basePath}/clearance/detail?studentId=${c.studentId}`} className="grid grid-cols-[42px_38px_minmax(0,1fr)_auto] items-center gap-[1.1rem] w-full p-[1rem_1.5rem] border-b border-[#e2e8f0] bg-white hover:bg-[#f8fafc] transition-colors cursor-pointer no-underline text-inherit last:border-b-0 max-[680px]:grid-cols-[32px_38px_minmax(0,1fr)_auto] max-[680px]:gap-2.5 max-[680px]:p-3"><div className="grid place-items-center w-[30px] h-[30px] border border-[#8a252c]/16 rounded-full bg-white !text-[#8a252c] !text-[0.78rem] !font-[900]">{(currentPage - 1) * PER_PAGE + i + 1}.</div><ProfileAvatar name={c.studentName} imageUrl={c.studentProfileImageUrl} size={34} /><span className="flex-1 flex flex-col gap-[0.125rem] min-w-0"><strong className="!text-[#111827] !text-[1rem] !font-[850] leading-[1.25] truncate">{c.studentName}</strong><small className="!text-[#64748b] !text-[0.875rem] !font-[700] truncate">{c.studentSection} - {c.studentSchoolId}</small></span><mark className={`inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap max-[430px]:col-start-3 max-[430px]:mt-1 ${statusClass(c.status)}`}>{statusLabel(c.status)}</mark></Link>)}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-[1rem_1.5rem] gap-2 border border-[#e2e8f0] border-t-0 rounded-b-lg bg-[#f8fafc]">
            <button className={ghostBtn} onClick={() => setCurrentPage(page => Math.max(1, page - 1))} disabled={currentPage === 1}>Previous</button>
            <span className="!text-[0.875rem] !font-[600] !text-[#64748b] whitespace-nowrap"><span className="hidden sm:inline">Page </span>{currentPage} of {totalPages}</span>
            <button className={ghostBtn} onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages}>Next</button>
          </div>
        )}
        {filtered.length === 0 && (isLoading ? <LoadingState message="Loading clearance records..." className="mt-[1rem] rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc]" /> : <p className="m-0 mt-[1rem] border border-dashed border-[#cbd5e1] rounded-lg bg-[#f8fafc] p-[1.25rem] !text-[#64748b] !font-[700] text-center">No clearance records found.</p>)}
      </section>
    </main>
  );
}
