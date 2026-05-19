"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useClearanceSettings, useClearances, useUpdateClearanceSettings } from "@/core/api/hooks/useClearance";
import { InlineSelect } from "@/components/ui/InlineSelect";
import { LoadingState } from "@/components/ui/LoadingState";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { useToast } from "@/components/ui/ToastProvider";

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

export function ClearanceContent({ basePath }: { basePath: string }) {
  const { data: clearances = [], isLoading } = useClearances();
  const { data: settings } = useClearanceSettings();
  const updateSettings = useUpdateClearanceSettings();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const sections = Array.from(new Set((clearances as any[]).map((c) => c.studentSection).filter(Boolean))).sort();
  const sectionOptions = [{ value: "all", label: "All sections" }, ...sections.map((section: any) => ({ value: section, label: section }))];
  const statusOptions = [{ value: "all", label: "All statuses" }, { value: "LOCKED", label: "Not submitted" }, { value: "IN_REVIEW", label: "Submitted" }, { value: "CLEARED", label: "Approved" }];
  const filtered = (clearances as any[]).filter((c) => {
    const q = search.toLowerCase();
    const label = statusLabel(c.status);
    return (!search || `${c.studentName} ${c.studentSchoolId} ${c.studentSection} ${label}`.toLowerCase().includes(q))
      && (sectionFilter === "all" || c.studentSection === sectionFilter)
      && (statusFilter === "all" || c.status === statusFilter);
  });
  const inputCls = "w-full min-h-[48px] px-3 py-2 border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all";
  const labelCls = "flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]";
  const clearanceEnabled = settings?.enabled !== false;

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
          <div className="flex items-center gap-3 flex-wrap">{basePath === "/admin" && <button type="button" disabled={updateSettings.isPending} onClick={handleToggleClearance} className={`inline-flex items-center justify-center min-h-[42px] px-4 rounded-lg !text-[0.86rem] !font-[900] cursor-pointer disabled:opacity-60 ${clearanceEnabled ? "bg-white border border-[#fca5a5] !text-[#b91c1c] hover:bg-[#fef2f2]" : "bg-[#8A252C] border border-[#8A252C] !text-white hover:bg-[#6d1d23]"}`}>{clearanceEnabled ? "Disable clearance" : "Enable clearance"}</button>}<span className="inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold bg-[#e9f8ef] !text-[#03703c]">{filtered.length} visible</span></div>
        </div>
        <div className="grid gap-[1rem] mb-[1rem] grid-cols-3 max-[980px]:grid-cols-1">
          <label className={labelCls} htmlFor="cl-search">Search<input className={inputCls} id="cl-search" type="search" placeholder="Search name, student ID, section, or status" value={search} onChange={(e) => setSearch(e.target.value)} /></label>
          <label className={labelCls} htmlFor="cl-section">Section<InlineSelect value={sectionFilter} options={sectionOptions} placeholder="All sections" onChange={setSectionFilter} /></label>
          <label className={labelCls} htmlFor="cl-status">Clearance<InlineSelect value={statusFilter} options={statusOptions} placeholder="All statuses" onChange={setStatusFilter} /></label>
        </div>
        <div className="flex flex-col border border-[#e2e8f0] overflow-hidden bg-white rounded-lg">
          {filtered.map((c: any, i: number) => <Link key={c.id} href={`${basePath}/clearance/detail?studentId=${c.studentId}`} className="relative pl-[72px] flex items-center gap-[1.25rem] w-full p-[1rem_1.5rem] border-b border-[#e2e8f0] bg-white hover:bg-[#f8fafc] transition-colors cursor-pointer no-underline text-inherit last:border-b-0"><div className="absolute left-[24px] top-1/2 -translate-y-1/2 grid place-items-center w-[32px] h-[32px] border border-[#8a252c]/16 rounded-full bg-white !text-[#8a252c] !text-[0.82rem] !font-[900]">{i + 1}.</div><ProfileAvatar name={c.studentName} imageUrl={c.studentProfileImageUrl} size={34} /><span className="flex-1 flex flex-col gap-[0.125rem] min-w-0"><strong className="!text-[#111827] !text-[1rem] !font-[850] leading-[1.25]">{c.studentName}</strong><small className="!text-[#64748b] !text-[0.875rem] !font-[700]">{c.studentSection} - {c.studentSchoolId}</small></span><mark className={`inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap ${statusClass(c.status)}`}>{statusLabel(c.status)}</mark></Link>)}
        </div>
        {filtered.length === 0 && (isLoading ? <LoadingState message="Loading clearance records..." className="mt-[1rem] rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc]" /> : <p className="m-0 mt-[1rem] border border-dashed border-[#cbd5e1] rounded-lg bg-[#f8fafc] p-[1.25rem] !text-[#64748b] !font-[700] text-center">No clearance records found.</p>)}
      </section>
    </main>
  );
}
