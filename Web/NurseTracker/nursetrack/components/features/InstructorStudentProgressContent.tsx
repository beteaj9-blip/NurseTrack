"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useInstructorCases } from "@/core/api/hooks/useClinicalCases";
import { useInstructorAttendance } from "@/core/api/hooks/useAttendance";
import { useAuthStore } from "@/core/store/authStore";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";

export function InstructorStudentProgressContent({ basePath }: { basePath: string }) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id != null ? String(user.id) : undefined;
  const { data: cases = [] } = useInstructorCases(userId);
  const { data: attendance = [] } = useInstructorAttendance(userId);
  const [search, setSearch] = useState("");

  const students = Object.values([...(cases as any[]), ...(attendance as any[])].reduce((acc: Record<string, any>, record: any) => {
    const key = String(record.studentId ?? record.studentSchoolId ?? record.studentName);
    if (!key) return acc;
    const current = acc[key] ?? {
      studentId: record.studentId,
      schoolId: record.studentSchoolId,
      name: record.studentName || "Nursing Student",
      profileImageUrl: record.studentProfileImageUrl,
      section: record.studentSection || "Nursing Student",
      cases: 0,
      approvedCases: 0,
      pending: 0,
      extensionDays: 0,
    };
    if (record.caseType || record.procedurePerformed) {
      current.cases += 1;
      if (record.status === "APPROVED") current.approvedCases += 1;
      if (record.status === "PENDING") current.pending += 1;
    } else {
      if (record.status === "PENDING") current.pending += 1;
      if (record.status === "REJECTED") current.extensionDays += 1;
    }
    acc[key] = current;
    return acc;
  }, {}));

  const filtered = students.filter((student: any) => {
    const q = search.toLowerCase();
    return !search || student.name.toLowerCase().includes(q) || student.schoolId?.toLowerCase().includes(q) || student.section.toLowerCase().includes(q);
  });

  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]">
      <section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem]">
        <div className="flex items-start justify-between gap-[22px] mb-[1.1rem] border-b border-[#e5eaf1] pb-[1.1rem] flex-wrap">
          <h2 className="m-0 !text-[#111827] !text-[1.15rem] !font-[800] tracking-[-0.03em]">Assigned Student Progress</h2>
          <span className="inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-[800] bg-[#e9f8ef] !text-[#03703c]">{filtered.length} students</span>
        </div>
        <input className="w-full min-h-[48px] px-3 py-2 mb-4 border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] !font-[500] focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all" type="search" placeholder="Search name, student ID, or section" value={search} onChange={(event) => setSearch(event.target.value)} />
        <div className="flex flex-col border border-[#e2e8f0] overflow-hidden bg-white rounded-lg">
          {filtered.map((student: any, index) => (
            <Link key={student.studentId ?? student.schoolId} href={`${basePath}/student-progress/detail?studentId=${student.studentId}`} className="relative pl-[72px] flex items-center gap-[1.25rem] w-full p-[1rem_1.5rem] border-b border-[#e2e8f0] bg-white hover:bg-[#f8fafc] transition-colors cursor-pointer no-underline text-inherit last:border-b-0">
              <div className="absolute left-[24px] top-1/2 -translate-y-1/2 grid place-items-center w-[32px] h-[32px] border border-[#8a252c]/16 rounded-full bg-white !text-[#8a252c] !text-[0.82rem] !font-[900]">{index + 1}.</div>
              <ProfileAvatar name={student.name} imageUrl={student.profileImageUrl} size={34} />
              <span className="flex-1 flex flex-col gap-[0.125rem] min-w-0"><strong className="!text-[#111827] !text-[1rem] !font-[850] leading-[1.25]">{student.name}</strong><small className="!text-[#64748b] !text-[0.875rem] !font-[700]">{student.section} - {student.schoolId}</small></span>
              <span className="inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-[800] whitespace-nowrap bg-[#fff8e1] !text-[#6c4c00]">{student.pending} pending</span>
              <span className="inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-[800] whitespace-nowrap bg-[#e9f8ef] !text-[#03703c]">{student.approvedCases}/{student.cases} cases</span>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && <div className="m-0 mt-[1rem] border border-dashed border-[#cbd5e1] rounded-lg bg-[#f8fafc] p-[1.25rem] !text-[#64748b] !font-[800] text-center">No assigned student progress found.</div>}
      </section>
    </main>
  );
}
