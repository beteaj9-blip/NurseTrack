"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAllAttendance, useInstructorAttendance } from "@/core/api/hooks/useAttendance";
import { useAllExtensionDays, useInstructorExtensionDays } from "@/core/api/hooks/useExtensionDays";
import { useUsers } from "@/core/api/hooks/useUsers";
import { useAuthStore } from "@/core/store/authStore";
import { InlineSelect } from "@/components/ui/InlineSelect";
import { LoadingState } from "@/components/ui/LoadingState";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";

export function ExtensionDaysContent({ basePath }: { basePath: string }) {
  const user = useAuthStore((state) => state.user);
  const isChair = basePath === "/chair" || basePath === "/coordinator" || basePath === "/assistant";
  const isAdmin = basePath === "/admin";
  const isAllSection = isAdmin || isChair;
  const viewerId = isChair && user?.id != null ? String(user.id) : undefined;
  const { data: studentUsers = [], isLoading: isStudentsLoading } = useUsers("STUDENT", isAllSection ? viewerId : undefined, isAllSection);
  const { data: instructorAttendance = [], isLoading: isInstructorLoading } = useInstructorAttendance(!isChair && user?.id != null ? String(user.id) : undefined);
  const { data: allAttendance = [], isLoading: isAllLoading } = useAllAttendance(isAllSection, viewerId);
  const { data: instructorExtensionDays = [], isLoading: isInstructorExtensionLoading } = useInstructorExtensionDays(!isAllSection && user?.id != null ? String(user.id) : undefined);
  const { data: allExtensionDays = [], isLoading: isAllExtensionLoading } = useAllExtensionDays(undefined, isAllSection, viewerId);
  const attendance = isAllSection ? allAttendance : instructorAttendance;
  const extensionDays = isAllSection ? allExtensionDays : instructorExtensionDays;
  const isLoading = isAllSection ? isAllLoading || isAllExtensionLoading || isStudentsLoading : isInstructorLoading || isInstructorExtensionLoading;
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 10;
  const students = Object.values([...(studentUsers as any[]), ...(attendance as any[]), ...(extensionDays as any[])].reduce((acc: Record<string, any>, record: any) => {
    const isUser = record.role === "STUDENT" || record.fullName;
    const key = isUser
      ? String(record.id ?? record.schoolId ?? record.fullName)
      : String(record.studentId ?? record.studentSchoolId ?? record.studentName);
    if (!key || key === "undefined") return acc;
    const rejectedCount = record.status === "REJECTED" ? 1 : 0;
    const activeExtensionCount = record.days && record.status === "ACTIVE" ? 1 : 0;
    const current = acc[key] ?? { studentId: isUser ? record.id : record.studentId, id: isUser ? record.schoolId : record.studentSchoolId, name: record.fullName || record.studentName || "Nursing Student", profileImageUrl: record.profileImageUrl ?? record.studentProfileImageUrl, section: record.sectionInfo || record.studentSection || "No Section", rejected: 0, activeExtensions: 0 };
    if (isUser) {
      current.studentId = record.id;
      current.id = record.schoolId;
      current.name = record.fullName || current.name;
      current.profileImageUrl = record.profileImageUrl || current.profileImageUrl;
      current.section = record.sectionInfo || current.section;
    }
    current.rejected += rejectedCount;
    current.activeExtensions += activeExtensionCount;
    acc[key] = current;
    return acc;
  }, {})).map((student: any) => ({
    ...student,
    status: student.rejected > 0 || student.activeExtensions > 0 ? "Needs action" : "On track",
    statusClass: student.rejected > 0 || student.activeExtensions > 0 ? "status-rejected" : "status-verified",
  }));
  const sections = Array.from(new Set(students.map((student: any) => student.section).filter(Boolean))).sort() as string[];
  const sectionOptions = [{ value: "all", label: "All sections" }, ...sections.map((section) => ({ value: section, label: section }))];
  const standingOptions = ["all", "In progress", "On track", "Needs action", "Completed"].map((standing) => ({ value: standing, label: standing === "all" ? "All standings" : standing }));
  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    return (!search || s.name.toLowerCase().includes(q) || String(s.id ?? "").toLowerCase().includes(q) || s.section.toLowerCase().includes(q) || s.status.toLowerCase().includes(q))
      && (sectionFilter === "all" || s.section === sectionFilter)
      && (statusFilter === "all" || s.status === statusFilter);
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const ghostBtn = "inline-flex items-center justify-center min-h-[38px] px-[1rem] rounded-[8px] bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.84rem] !font-[800] hover:border-[rgba(138,37,44,0.32)] hover:!text-[#8A252C] hover:shadow-[0_10px_24px_rgba(32,33,36,0.08)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const inputCls = "w-full min-h-[48px] px-3 py-2 border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all";
  const labelCls = "flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]";
  React.useEffect(() => {
    setCurrentPage(page => Math.min(page, totalPages));
  }, [totalPages]);
  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]">
      <section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem]">
        <div className="flex items-center justify-between gap-4 mb-[1.1rem] border-b border-[#e5eaf1] pb-[1.1rem] flex-wrap">
          <h2 className="m-0 !text-[#111827] !text-[1.15rem] !font-bold tracking-[-0.03em]">Student List</h2>
          <span className="inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#e9f8ef] !text-[#03703c]">{filtered.length} visible</span>
        </div>
        <div className="grid gap-[1rem] mb-[1rem] grid-cols-3 max-[980px]:grid-cols-1">
          <label className={labelCls} htmlFor="ext-search">Search<input className={inputCls} id="ext-search" type="search" placeholder="Search name, student ID, section, or standing" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} /></label>
          <label className={labelCls} htmlFor="ext-section">Section<InlineSelect value={sectionFilter} options={sectionOptions} placeholder="All sections" onChange={(value) => { setSectionFilter(value); setCurrentPage(1); }} /></label>
          <label className={labelCls} htmlFor="ext-standing">Standing<InlineSelect value={statusFilter} options={standingOptions} placeholder="All standings" onChange={(value) => { setStatusFilter(value); setCurrentPage(1); }} /></label>
        </div>
        {filtered.length > 0 && <div className={`flex flex-col border border-[#e2e8f0] overflow-hidden bg-white rounded-t-lg ${totalPages > 1 ? '' : 'rounded-b-lg'}`}>
          {paged.map((s, i) => {
            const c = s.statusClass === "status-pending" ? "bg-[#fff8e1] !text-[#6c4c00]" : s.statusClass === "status-verified" ? "bg-[#e9f8ef] !text-[#03703c]" : s.statusClass === "status-rejected" ? "bg-[#fef2f2] !text-[#991b1b]" : "bg-[#f1f5f9] !text-[#475569]";
            return (
              <Link key={s.studentId ?? s.id} href={`${basePath}/extension-days/detail?studentId=${s.studentId}`} className="grid grid-cols-[42px_38px_minmax(0,1fr)_auto] items-center gap-[1.1rem] w-full p-[1rem_1.5rem] border-b border-[#e2e8f0] bg-white hover:bg-[#f8fafc] hover:translate-x-[2px] transition-all cursor-pointer no-underline text-inherit last:border-b-0 max-[680px]:grid-cols-[32px_38px_minmax(0,1fr)_auto] max-[680px]:gap-2.5 max-[680px]:p-3" role="link" tabIndex={0}>
                <div className="grid place-items-center w-[30px] h-[30px] border border-[#8a252c]/16 rounded-full bg-white !text-[#8a252c] !text-[0.78rem] !font-[900]">{(currentPage - 1) * PER_PAGE + i + 1}.</div>
                <ProfileAvatar name={s.name} imageUrl={s.profileImageUrl} size={34} />
                <span className="flex-1 flex flex-col gap-[0.125rem] min-w-0"><strong className="!text-[#111827] !text-[1rem] !font-[850] leading-[1.25] truncate">{s.name}</strong><small className="!text-[#64748b] !text-[0.875rem] !font-[700] truncate">{s.section} - {s.id}</small></span>
                <mark className={`inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap max-[430px]:col-start-3 max-[430px]:mt-1 ${c}`}>{s.status}</mark>
              </Link>
            );
          })}
        </div>}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-[1rem_1.5rem] gap-2 border border-[#e2e8f0] border-t-0 rounded-b-lg bg-[#f8fafc]">
            <button className={ghostBtn} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
            <span className="!text-[0.875rem] !font-[600] !text-[#64748b] whitespace-nowrap"><span className="hidden sm:inline">Page </span>{currentPage} of {totalPages}</span>
            <button className={ghostBtn} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
          </div>
        )}
        {filtered.length === 0 && (isLoading ? <LoadingState message="Loading assigned student(s)..." className="mt-[1rem] rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc]" /> : <p className="m-0 mt-[1rem] border border-dashed border-[#cbd5e1] rounded-lg bg-[#f8fafc] p-[1.25rem] !text-[#64748b] !font-[800] text-center">No student(s) found.</p>)}
      </section>
    </main>
  );
}
