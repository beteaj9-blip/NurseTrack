"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useSchedules } from "@/core/api/hooks/useSchedules";
import { useInstructorCases, useStudentCases } from "@/core/api/hooks/useClinicalCases";
import { useAuthStore } from "@/core/store/authStore";
import { UserRole } from "@/core/types/user";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";

const routeRoleMap: Record<string, UserRole> = {
  "/nursing-student": "STUDENT",
  "/clinical-instructor": "INSTRUCTOR",
  "/admin": "ADMIN",
  "/chair": "CHAIR",
  "/coordinator": "COORDINATOR",
  "/assistant": "ASSISTANT",
};

function formatDisplayDate(date?: string) {
  if (!date) return "Schedule date";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function getScheduleStatus(date?: string) {
  if (!date) return "Scheduled";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scheduleDate = new Date(`${date}T00:00:00`);
  if (scheduleDate.getTime() > today.getTime()) return "Upcoming";
  if (scheduleDate.getTime() === today.getTime()) return "Today";
  return "Completed";
}

function getScheduleStatusClass(status: string) {
  if (status === "Completed") return "bg-[#dcfce7] !text-[#166534]";
  if (status === "Upcoming" || status === "Today") return "bg-[#fff8e1] !text-[#6c4c00]";
  return "bg-[#f1f5f9] !text-[#475569]";
}

function getClinicalValidationClass(label: string) {
  if (label === "Approved") return "bg-[#e9f8ef] !text-[#03703c]";
  if (label === "Pending") return "bg-[#fff8e1] !text-[#6c4c00]";
  return "bg-[#f1f5f9] !text-[#475569]";
}

export function SchedulesDayContent({ basePath }: { basePath: string }) {
  const searchParams = useSearchParams();
  const selectedScheduleId = searchParams.get("schedule");
  const user = useAuthStore((state) => state.user);
  const routeRole = routeRoleMap[basePath] ?? user?.role;
  const userId = user?.id != null ? String(user.id) : undefined;
  const { data: schedules = [], isLoading } = useSchedules(userId, routeRole);
  const { data: instructorCases = [] } = useInstructorCases(routeRole === "INSTRUCTOR" ? userId : undefined);
  const { data: studentCases = [] } = useStudentCases(routeRole === "STUDENT" ? userId : undefined);
  const visibleSchedules = React.useMemo(() => {
    if (routeRole === "INSTRUCTOR") return (schedules as any[]).filter((schedule: any) => String(schedule.instructorId) === String(user?.id));
    if (routeRole === "STUDENT") return (schedules as any[]).filter((schedule: any) => String(schedule.studentId) === String(user?.id));
    return schedules as any[];
  }, [routeRole, schedules, user?.id]);
  const clinicalCases = routeRole === "INSTRUCTOR" ? instructorCases : studentCases;
  const selectedSchedule = visibleSchedules.find((schedule: any) => String(schedule.id) === selectedScheduleId) ?? visibleSchedules[0];
  const assignedStudents = selectedSchedule
    ? visibleSchedules.filter((schedule: any) =>
        schedule.date === selectedSchedule.date &&
        schedule.hospital === selectedSchedule.hospital &&
        schedule.area === selectedSchedule.area
      )
    : [];
  const instructorName = selectedSchedule?.instructorName || "Clinical Instructor";
  const isStudentView = basePath === "/nursing-student";

  function getClinicalValidation(schedule: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduleDate = new Date(`${schedule.date}T00:00:00`);
    if (scheduleDate.getTime() > today.getTime()) return "No validation yet";

    const matchingCases = (clinicalCases as any[]).filter((clinicalCase: any) =>
      String(clinicalCase.studentId) === String(schedule.studentId) &&
      clinicalCase.procedureDate === schedule.date &&
      clinicalCase.hospital === schedule.hospital &&
      (clinicalCase.dutyArea === schedule.area || clinicalCase.area === schedule.area)
    );

    if (matchingCases.some((clinicalCase: any) => clinicalCase.status === "APPROVED")) return "Approved";
    if (matchingCases.length > 0) return "Pending";
    return "No validation yet";
  }

  if (isLoading) {
    return <main className="p-[clamp(24px,4vw,42px)]"><div className="p-6 rounded-xl border border-[#e2e8f0] bg-white font-bold text-[#64748b]">Loading schedule...</div></main>;
  }

  if (!selectedSchedule) {
    return <main className="p-[clamp(24px,4vw,42px)]"><div className="p-6 rounded-xl border border-[#e2e8f0] bg-white font-bold text-[#64748b]">No schedule selected.</div></main>;
  }

  return (
    <main className="p-[clamp(24px,4vw,42px)] content-start grid gap-6 w-full">
      <section className="grid gap-6">
        
        {/* Top Info Card */}
        <article className="relative rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden bg-white">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#fffbf0,#ffffff)] pointer-events-none" />
          <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full bg-[#ffcf01]/10 blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 p-[1rem_1.5rem] pb-0">
              <h2 className="m-0 !text-[#8a252c] !text-[0.95rem] leading-[1.15] !font-black uppercase tracking-widest">
                Clinical Duty
              </h2>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center px-4 py-1.5 bg-white border border-[#e2e8f0] rounded-full !text-[#334155] !font-extrabold !text-[0.8rem]">
                  {formatDisplayDate(selectedSchedule.date)}
                </span>
                <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full !font-extrabold !text-[0.8rem] ${getScheduleStatusClass(getScheduleStatus(selectedSchedule.date))}`}>
                  {getScheduleStatus(selectedSchedule.date)}
                </span>
              </div>
            </div>
            
            {/* Details */}
            <div className="grid grid-cols-4 max-[980px]:grid-cols-2 max-[600px]:grid-cols-1 p-[1.5rem] gap-4">
              <div className="p-5 border border-[#e2e8f0] rounded-xl bg-white shadow-sm flex flex-col justify-center">
                <span className="!text-[#1d4ed8] !text-[0.7rem] !font-black uppercase tracking-widest mb-1.5">Hospital</span>
                <strong className="!text-[#111827] !text-[1.05rem] !font-[800]">{selectedSchedule.hospital}</strong>
              </div>
              <div className="p-5 border border-[#e2e8f0] rounded-xl bg-white shadow-sm flex flex-col justify-center">
                <span className="!text-[#1d4ed8] !text-[0.7rem] !font-black uppercase tracking-widest mb-1.5">Area Of Assignment</span>
                <strong className="!text-[#111827] !text-[1.05rem] !font-[800]">{selectedSchedule.area}</strong>
              </div>
              <div className="p-5 border border-[#e2e8f0] rounded-xl bg-white shadow-sm flex flex-col justify-center">
                <span className="!text-[#1d4ed8] !text-[0.7rem] !font-black uppercase tracking-widest mb-1.5">Shift Time</span>
                <strong className="!text-[#111827] !text-[1.05rem] !font-[800]">{selectedSchedule.startTime} - {selectedSchedule.endTime}</strong>
              </div>
              <div className="p-5 border border-[#e2e8f0] rounded-xl bg-white shadow-sm flex flex-col justify-center">
                <span className="!text-[#1d4ed8] !text-[0.7rem] !font-black uppercase tracking-widest mb-1.5">Assigned Group</span>
                <strong className="!text-[#111827] !text-[1.05rem] !font-[800]">{selectedSchedule.studentSection || user?.sectionInfo || "Assigned Group"}</strong>
              </div>
            </div>
          </div>
        </article>

        {/* Students Table Card */}
        <article className="relative rounded-2xl border border-[#e2e8f0] bg-white shadow-sm p-[1.5rem] overflow-hidden">
          <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full bg-[#ffcf01]/5 blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
              <h3 className="m-0 !text-[#111827] !text-[1.15rem] leading-[1.2] !font-bold tracking-[-0.03em]">Assigned Students</h3>
              <span className="inline-flex items-center px-4 py-1.5 rounded-full !text-[0.8rem] !font-extrabold bg-[#fef3c7] !text-[#92400e]">{assignedStudents.length} student{assignedStudents.length === 1 ? "" : "s"}</span>
            </div>

            <div className="flex items-center gap-4 p-4 mb-5 bg-[#fffaf0] border border-[#fde68a] rounded-xl shadow-[0_2px_4px_rgba(251,191,36,0.05)]">
              <ProfileAvatar name={instructorName} imageUrl={selectedSchedule.instructorProfileImageUrl || (String(selectedSchedule.instructorId) === String(user?.id) ? user?.profileImageUrl : "")} size={46} />
              <div>
                <strong className="block !text-[#111827] !text-[1rem] !font-[800]">{instructorName}</strong>
                <span className="block !text-[#64748b] !text-[0.85rem] !font-semibold">Clinical Instructor handling this schedule</span>
              </div>
            </div>

            <div className="mt-2 rounded-xl overflow-hidden border border-[#e2e8f0] max-[720px]:overflow-x-auto">
              <table className="w-full border-collapse text-left !text-[0.9rem] min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#e2e8f0] !text-[#111827] !text-[0.75rem] !font-black uppercase tracking-wider">
                    <th className="p-[1.25rem_1rem] w-[80px]">No.</th>
                    <th className="p-[1.25rem_1rem]">Student</th>
                    <th className="p-[1.25rem_1rem]">Section</th>
                    <th className="p-[1.25rem_1rem]">Validation</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedStudents.map((schedule: any, idx: number) => {
                    const studentName = schedule.studentName || user?.fullName || "Assigned Student";
                    const validationLabel = getClinicalValidation(schedule);
                    return (
                    <tr key={idx} className="border-b border-[#e2e8f0] last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="p-[1.1rem_1rem] !text-[#111827] !font-bold">{idx + 1}.</td>
                      <td className="p-[1.1rem_1rem] flex items-center gap-[0.85rem] !font-[800] !text-[#111827]">
                        <ProfileAvatar name={studentName} imageUrl={schedule.studentProfileImageUrl || (String(schedule.studentId) === String(user?.id) ? user?.profileImageUrl : "")} size={38} />
                        {studentName}
                      </td>
                      <td className="p-[1.1rem_1rem] !text-[#64748b] !font-bold">{schedule.studentSection || user?.sectionInfo || "Nursing Student"}</td>
                      <td className="p-[1.1rem_1rem]">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full !text-[0.75rem] !font-bold ${getClinicalValidationClass(validationLabel)}`}>
                          {validationLabel}
                        </span>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
