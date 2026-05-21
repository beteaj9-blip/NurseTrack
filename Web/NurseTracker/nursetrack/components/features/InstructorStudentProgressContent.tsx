"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAllClinicalCases, useInstructorCases } from "@/core/api/hooks/useClinicalCases";
import { useAllAttendance, useInstructorAttendance } from "@/core/api/hooks/useAttendance";
import { useUsers } from "@/core/api/hooks/useUsers";
import { useAuthStore } from "@/core/store/authStore";
import { InlineSelect } from "@/components/ui/InlineSelect";
import { LoadingState } from "@/components/ui/LoadingState";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";

type ProgressStudent = {
  studentId?: number | string;
  schoolId?: string;
  name: string;
  profileImageUrl?: string;
  section: string;
  levels: number[];
  cases: number;
  approvedCases: number;
  pending: number;
  standing: string;
};

const levelOptions = [{ value: "all", label: "All levels" }, 1, 2, 3, 4].map((level) => typeof level === "number" ? { value: String(level), label: `Level ${level}` } : level);

function levelsFromRecord(record: any) {
  const levels = new Set<number>();
  (record.assignedLevels ?? record.studentAssignedLevels ?? record.student?.assignedLevels ?? []).forEach((level: number) => Number.isFinite(level) && levels.add(level));
  const text = String(record.sectionInfo ?? record.studentSection ?? "");
  const numeric = text.match(/(?:^|\b)(?:n|bsn|level)\s*([1-4])\b/i) ?? text.match(/\b([1-4])(?:st|nd|rd|th)\s*level\b/i);
  if (numeric) levels.add(Number(numeric[1]));
  if (/level\s*i\b/i.test(text)) levels.add(1);
  if (/level\s*ii\b/i.test(text)) levels.add(2);
  if (/level\s*iii\b/i.test(text)) levels.add(3);
  if (/level\s*iv\b/i.test(text)) levels.add(4);
  return Array.from(levels).sort((a, b) => a - b);
}

const standingOptions = [
  { value: "all", label: "All" },
  { value: "Checked", label: "Checked" },
  { value: "Unchecked", label: "Unchecked" },
  { value: "Cleared", label: "Cleared" },
];

function standingFor(student: Omit<ProgressStudent, "standing">) {
  if (student.pending > 0) return "Unchecked";
  if (student.cases > 0 && student.approvedCases >= student.cases) return "Cleared";
  return "Checked";
}

import { useClearances } from "@/core/api/hooks/useClearance";

export function InstructorStudentProgressContent({ basePath }: { basePath: string }) {
  const user = useAuthStore((state) => state.user);
  const isAllRole = basePath === "/chair" || basePath === "/coordinator" || basePath === "/assistant";
  const isAdmin = basePath === "/admin";
  const isEnrollment = basePath === "/enrollment-team";
  const isAllSection = isAdmin || isAllRole || isEnrollment;
  const canFilterByLevel = basePath === "/admin" || basePath === "/coordinator" || basePath === "/enrollment-team";
  const viewerId = (basePath === "/chair" || basePath === "/assistant") && user?.id != null ? String(user.id) : undefined;
  const { data: studentUsers = [], isLoading: isUsersLoading } = useUsers("STUDENT", isAllSection ? viewerId : undefined);
  const { data: clearances = [], isLoading: isClearanceLoading } = useClearances();
  const { data: instructorCases = [], isLoading: isInstructorCasesLoading } = useInstructorCases();
  const { data: allCases = [], isLoading: isAllCasesLoading } = useAllClinicalCases(isAllSection, viewerId);
  const { data: instructorAttendance = [], isLoading: isInstructorAttendanceLoading } = useInstructorAttendance();
  const { data: allAttendance = [], isLoading: isAllAttendanceLoading } = useAllAttendance(isAllSection, viewerId);
  const cases = isAllSection ? allCases : instructorCases;
  const attendance = isAllSection ? allAttendance : instructorAttendance;
  const isLoading = isAllSection ? isUsersLoading || isAllCasesLoading || isAllAttendanceLoading || isClearanceLoading : isInstructorCasesLoading || isInstructorAttendanceLoading;
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("all");
  const [level, setLevel] = useState("all");
  const [standing, setStanding] = useState("all");
  const [manualChecks, setManualChecks] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem("enrollment-manual-checks");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("enrollment-manual-checks", JSON.stringify(manualChecks));
    } catch {}
  }, [manualChecks]);

  const toggleCheck = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setManualChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const students = useMemo(() => {
    const source = new Map<string, Omit<ProgressStudent, "standing">>();

    if (isAllSection) {
      (studentUsers as any[]).forEach((student) => {
        const key = String(student.id ?? student.schoolId ?? student.fullName);
        source.set(key, {
          studentId: student.id,
          schoolId: student.schoolId,
          name: student.fullName || "Nursing Student",
          profileImageUrl: student.profileImageUrl,
          section: student.sectionInfo || "No Section",
          levels: levelsFromRecord(student),
          cases: 0,
          approvedCases: 0,
          pending: 0,
        });
      });
    }

    [...(cases as any[]), ...(attendance as any[])].forEach((record: any) => {
      const key = String(record.studentId ?? record.studentSchoolId ?? record.studentName);
      if (!key || key === "undefined") return;
      const current = source.get(key) ?? {
        studentId: record.studentId,
        schoolId: record.studentSchoolId,
        name: record.studentName || "Nursing Student",
        profileImageUrl: record.studentProfileImageUrl,
        section: record.studentSection || "No Section",
        levels: levelsFromRecord(record),
        cases: 0,
        approvedCases: 0,
        pending: 0,
      };
      if (record.caseType || record.procedurePerformed) {
        current.cases += 1;
        if (record.status === "APPROVED" || record.status === "VALIDATED") current.approvedCases += 1;
      }
      if (record.status === "PENDING") current.pending += 1;
      levelsFromRecord(record).forEach((level) => current.levels.includes(level) || current.levels.push(level));
      source.set(key, current);
    });

    const clearanceByStudentId = new Map((clearances as any[]).map((c) => [String(c.studentId), c.status]));

    return Array.from(source.values())
      .map((student) => {
        const cStatus = clearanceByStudentId.get(String(student.studentId));
        const isApproved = cStatus === "CLEARED" || cStatus === "APPROVED";
        const isManuallyChecked = manualChecks[String(student.studentId)] || false;
        
        // If approved by chair, standing is always Cleared. Otherwise it's Checked if manually toggled, else Unchecked.
        let studentStanding = "Unchecked";
        if (isApproved) {
          studentStanding = "Cleared";
        } else if (isManuallyChecked) {
          studentStanding = "Checked";
        }
        
        return { ...student, standing: studentStanding };
      })
      .sort((a, b) => a.section.localeCompare(b.section) || a.name.localeCompare(b.name));
  }, [attendance, cases, isAllSection, studentUsers, clearances, manualChecks]);

  const sectionOptions = useMemo(() => [
    { value: "all", label: "All" },
    ...Array.from(new Set(students.map((student) => student.section).filter(Boolean))).map((value) => ({ value, label: value })),
  ], [students]);

  useEffect(() => {
    if (section !== "all" && !sectionOptions.some((option) => option.value === section)) setSection("all");
  }, [section, sectionOptions]);

  const filtered = students.filter((student) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || `${student.name} ${student.schoolId ?? ""} ${student.section} ${student.standing}`.toLowerCase().includes(q);
    const matchesSection = section === "all" || student.section === section;
    const matchesLevel = !canFilterByLevel || level === "all" || student.levels.includes(Number(level));
    const matchesStanding = standing === "all" || student.standing === standing;
    return matchesSearch && matchesSection && matchesLevel && matchesStanding;
  });

  const title = isAllSection ? "All-Section Student List" : "Assigned Student List";

  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]">
      <section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem]">
        <div className="flex items-center justify-between gap-[22px] mb-[1.1rem] flex-wrap">
          <h2 className="m-0 !text-[#111827] !text-[1.15rem] !font-[800] tracking-[-0.03em]">{title}</h2>
          <div className="flex items-center justify-end gap-3 flex-wrap">
            <button className="inline-flex items-center justify-center min-h-[38px] px-4 rounded-lg bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.84rem] !font-[800] hover:bg-[#f8fafc] transition-colors cursor-pointer" type="button" onClick={() => window.print()}>Print</button>
            <span className="inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-[800] bg-[#e9f8ef] !text-[#03703c]">{filtered.length} visible</span>
          </div>
        </div>

        <div className={canFilterByLevel ? "grid grid-cols-[minmax(0,1.5fr)_minmax(170px,1fr)_minmax(150px,0.75fr)_minmax(170px,1fr)] gap-4 mb-5 max-[1100px]:grid-cols-2 max-[680px]:grid-cols-1" : "grid grid-cols-[minmax(0,1.6fr)_minmax(190px,1fr)_minmax(190px,1fr)] gap-4 mb-5 max-[900px]:grid-cols-1"} aria-label="Student progress search filters">
          <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]" htmlFor="student-progress-search">Search<input className="w-full min-h-[48px] px-3 py-2 border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] !font-[700] focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all" id="student-progress-search" type="search" placeholder="Search name, student ID, section, or status" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">Section<InlineSelect value={section} options={sectionOptions} placeholder="All" onChange={setSection} /></label>
          {canFilterByLevel && <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">Level<InlineSelect value={level} options={levelOptions} placeholder="All levels" onChange={setLevel} /></label>}
          <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">Standing<InlineSelect value={standing} options={standingOptions} placeholder="All" onChange={setStanding} /></label>
        </div>

        <div className="flex flex-col border border-[#e2e8f0] overflow-hidden bg-white rounded-lg">
          {isLoading ? <LoadingState message="Loading student progress..." /> : filtered.map((student, index) => (
            <Link key={student.studentId ?? student.schoolId ?? student.name} href={`${basePath}/student-progress/detail?studentId=${student.studentId ?? ""}`} className={`${isEnrollment ? "grid-cols-[42px_44px_minmax(0,1fr)_auto_auto] max-[680px]:grid-cols-[32px_38px_minmax(0,1fr)_auto]" : "grid-cols-[42px_44px_minmax(0,1fr)] max-[680px]:grid-cols-[32px_38px_minmax(0,1fr)]"} grid items-center gap-[1.1rem] w-full p-[1rem_1.5rem] border-b border-[#e2e8f0] bg-white hover:bg-[#f8fafc] transition-colors cursor-pointer no-underline text-inherit last:border-b-0 max-[680px]:gap-2.5 max-[680px]:p-3`}>
              <div className="grid place-items-center w-[30px] h-[30px] border border-[#8a252c]/16 rounded-full bg-white !text-[#8a252c] !text-[0.78rem] !font-[900]">{index + 1}.</div>
              <ProfileAvatar name={student.name} imageUrl={student.profileImageUrl} size={38} />
              <span className="flex-1 flex flex-col gap-[0.125rem] min-w-0"><strong className="!text-[#111827] !text-[1rem] !font-[850] leading-[1.25] truncate">{student.name}</strong><small className="!text-[#64748b] !text-[0.875rem] !font-[700] truncate">{student.section} - {student.schoolId || "No student ID"}</small></span>
              {isEnrollment && <span className={`inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap max-[520px]:col-start-3 max-[520px]:mt-1 ${student.standing === 'Cleared' ? 'bg-[#e9f8ef] !text-[#03703c]' : student.standing === 'Checked' ? 'bg-[#e9f8ef] !text-[#03703c]' : 'bg-[#fff1f0] !text-[#b42318]'}`}>{student.standing}</span>}
              {isEnrollment && (
                student.standing === 'Cleared' ? (
                  <span className="grid h-9 w-9 place-items-center rounded-lg border border-[#86efac] bg-[#ecfdf3] !text-[#15803d] max-[680px]:col-start-4 max-[680px]:row-start-1" aria-label="Cleared"><svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M9.55 17.35 4.9 12.7l1.8-1.8 2.85 2.85 7.75-7.75 1.8 1.8-9.55 9.55Z" /></svg></span>
                ) : (
                  <button type="button" onClick={(e) => toggleCheck(e, String(student.studentId))} className={`grid h-9 w-9 place-items-center rounded-lg border max-[680px]:col-start-4 max-[680px]:row-start-1 cursor-pointer transition-colors ${student.standing === 'Checked' ? 'border-[#03703c] bg-[#03703c] !text-white' : 'border-[#dbe3ee] bg-white !text-transparent hover:border-[#03703c]'}`} aria-label="Toggle Check">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M9.55 17.35 4.9 12.7l1.8-1.8 2.85 2.85 7.75-7.75 1.8 1.8-9.55 9.55Z" /></svg>
                  </button>
                )
              )}
            </Link>
          ))}
        </div>
        {!isLoading && filtered.length === 0 && <div className="m-0 mt-[1rem] border border-dashed border-[#cbd5e1] rounded-lg bg-[#f8fafc] p-[1.25rem] !text-[#64748b] !font-[800] text-center">No assigned student(s) match the selected filters.</div>}
      </section>
    </main>
  );
}
