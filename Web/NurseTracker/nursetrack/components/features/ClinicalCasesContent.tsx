"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAllClinicalCases, useInstructorCases } from "@/core/api/hooks/useClinicalCases";
import { useAuthStore } from "@/core/store/authStore";
import { InlineSelect } from "@/components/ui/InlineSelect";
import { LoadingState } from "@/components/ui/LoadingState";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";

export function ClinicalCasesContent({ basePath }: { basePath: string }) {
    const user = useAuthStore((state) => state.user);
    const isChair = basePath === "/chair";
    const { data: instructorCases = [], isLoading: isInstructorLoading } = useInstructorCases();
    const { data: allCases = [], isLoading: isAllLoading } = useAllClinicalCases(isChair, isChair && user?.id != null ? String(user.id) : undefined);
    const cases = isChair ? allCases : instructorCases;
    const isLoading = isChair ? isAllLoading : isInstructorLoading;
    const [search, setSearch] = useState("");
    const [sectionFilter, setSectionFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const PER_PAGE = 10;

    const students = Object.values((cases as any[]).reduce((acc: Record<string, any>, clinicalCase: any) => {
        const key = String(clinicalCase.studentId ?? clinicalCase.studentSchoolId ?? clinicalCase.studentName);
        if (!key) return acc;
        const current = acc[key] ?? {
            studentId: clinicalCase.studentId,
            id: clinicalCase.studentSchoolId,
            name: clinicalCase.studentName || "Nursing Student",
            profileImageUrl: clinicalCase.studentProfileImageUrl,
            section: clinicalCase.studentSection || "Nursing Student",
            pending: 0,
        };
        current.pending += clinicalCase.status === "PENDING" ? 1 : 0;
        acc[key] = current;
        return acc;
    }, {}));

    const sections = Array.from(new Set(students.map((student: any) => student.section).filter(Boolean))).sort() as string[];
    const sectionOptions = [{ value: "all", label: "All sections" }, ...sections.map((section) => ({ value: section, label: section }))];
    const filtered = students.filter(s => {
        const q = search.toLowerCase();
        return (!search || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.section.toLowerCase().includes(q))
            && (sectionFilter === "all" || s.section === sectionFilter);
    });
    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paged = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
    const ghostBtn = "inline-flex items-center justify-center min-h-[38px] px-[1rem] rounded-[8px] bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.84rem] !font-[800] hover:border-[rgba(138,37,44,0.32)] hover:!text-[#8A252C] hover:shadow-[0_10px_24px_rgba(32,33,36,0.08)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
    const inputCls = "w-full min-h-[48px] px-3 py-2 border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] !font-[500] focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all";
    const labelCls = "flex flex-col gap-1.5 m-0 !text-[0.875rem] !font-[800] !text-[#344054]";
    return (
        <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]">
            <section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem]">
                <div className="flex items-start justify-between gap-[22px] mb-[1.1rem] border-b border-[#e5eaf1] pb-[1.1rem] flex-wrap">
                    <h2 className="m-0 !text-[#111827] !text-[1.15rem] !font-[800] tracking-[-0.03em]">Students with Clinical Case Records</h2>
                    <span className="inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-[800] whitespace-nowrap bg-[#fff8e1] !text-[#6c4c00]">{filtered.length} students</span>
                </div>
                <div className="grid gap-[1rem] mb-[1rem] grid-cols-2 max-[680px]:grid-cols-1">
                    <label className={labelCls} htmlFor="cc-search">Search student<input className={inputCls} id="cc-search" type="search" placeholder="Search name, student ID, or section" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} /></label>
                    <label className={labelCls} htmlFor="cc-section">Section<InlineSelect value={sectionFilter} options={sectionOptions} placeholder="All sections" onChange={(value) => { setSectionFilter(value); setCurrentPage(1); }} /></label>
                </div>
                <div className={`flex flex-col border border-[#e2e8f0] overflow-hidden bg-white rounded-t-lg ${totalPages > 1 ? "" : "rounded-b-lg"}`}>
                    {paged.map((s, i) => (
                        <Link key={s.studentId ?? s.id} href={`${basePath}/clinical-cases/selection?studentId=${s.studentId}`} className="relative pl-[72px] flex items-center gap-[1.25rem] w-full p-[1rem_1.5rem] border-b border-[#e2e8f0] bg-white hover:bg-[#f8fafc] transition-colors cursor-pointer no-underline text-inherit last:border-b-0" tabIndex={0}>
                            <div className="absolute left-[24px] top-1/2 -translate-y-1/2 grid place-items-center w-[32px] h-[32px] border border-[#8a252c]/16 rounded-full bg-white !text-[#8a252c] !text-[0.82rem] !font-[900]">{(currentPage - 1) * PER_PAGE + i + 1}.</div>
                            <ProfileAvatar name={s.name} imageUrl={s.profileImageUrl} size={34} />
                            <span className="flex-1 flex flex-col gap-[0.125rem] min-w-0"><strong className="!text-[#111827] !text-[1rem] !font-[850] leading-[1.25]">{s.name}</strong><small className="!text-[#64748b] !text-[0.875rem] !font-[700]">{s.section} - Student ID {s.id}</small></span>
                            <span className="inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-[800] whitespace-nowrap bg-[#fff8e1] !text-[#6c4c00]">{s.pending} pending</span>
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
                {filtered.length === 0 && (isLoading ? <LoadingState message="Loading assigned students..." className="mt-[1rem] rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc]" /> : <div className="m-0 mt-[1rem] border border-dashed border-[#cbd5e1] rounded-lg bg-[#f8fafc] p-[1.25rem] !text-[#64748b] !font-[800] text-center">No students match the selected filters.</div>)}
            </section>
        </main>
    );
}
