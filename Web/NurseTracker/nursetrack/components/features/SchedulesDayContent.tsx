"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useSchedules } from "@/core/api/hooks/useSchedules";
import { useAuthStore } from "@/core/store/authStore";

function getInitials(name?: string) {
  if (!name) return "?";
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

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

export function SchedulesDayContent({ basePath }: { basePath: string }) {
  const searchParams = useSearchParams();
  const selectedScheduleId = searchParams.get("schedule");
  const user = useAuthStore((state) => state.user);
  const { data: schedules = [], isLoading } = useSchedules(user?.id != null ? String(user.id) : undefined, user?.role);
  const selectedSchedule = schedules.find((schedule: any) => String(schedule.id) === selectedScheduleId) ?? schedules[0];
  const assignedStudents = selectedSchedule
    ? schedules.filter((schedule: any) =>
        schedule.date === selectedSchedule.date &&
        schedule.hospital === selectedSchedule.hospital &&
        schedule.area === selectedSchedule.area
      )
    : [];
  const instructorName = selectedSchedule?.instructorName || "Clinical Instructor";
  const isStudentView = basePath === "/nursing-student";

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
                <span className="inline-flex items-center justify-center px-4 py-1.5 bg-[#dcfce7] rounded-full !text-[#166534] !font-extrabold !text-[0.8rem]">
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
              <div className="w-[46px] h-[46px] shrink-0 rounded-full flex items-center justify-center !text-[0.95rem] !font-extrabold bg-[#ffcf01] !text-[#332800]">
                {getInitials(instructorName)}
              </div>
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
                    <th className="p-[1.25rem_1rem]">Duty</th>
                    <th className="p-[1.25rem_1rem]">Validation</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedStudents.map((schedule: any, idx: number) => {
                    const studentName = schedule.studentName || user?.fullName || "Assigned Student";
                    return (
                    <tr key={idx} className="border-b border-[#e2e8f0] last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="p-[1.1rem_1rem] !text-[#111827] !font-bold">{idx + 1}.</td>
                      <td className="p-[1.1rem_1rem] flex items-center gap-[0.85rem] !font-[800] !text-[#111827]">
                        <div className="w-[38px] h-[38px] shrink-0 rounded-full flex items-center justify-center !text-[0.75rem] !font-black bg-[#ffcf01] !text-[#332800]">{getInitials(studentName)}</div>
                        {studentName}
                      </td>
                      <td className="p-[1.1rem_1rem] !text-[#64748b] !font-bold">{schedule.studentSection || user?.sectionInfo || "Nursing Student"}</td>
                      <td className="p-[1.1rem_1rem]">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full !text-[0.75rem] !font-bold bg-[#f1f5f9] !text-[#475569]">
                          Completion
                        </span>
                      </td>
                      <td className="p-[1.1rem_1rem]">
                        {isStudentView ? (
                          <span className="!text-[#64748b] !text-[0.8rem] !font-bold">Student view</span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full !text-[0.75rem] !font-bold bg-[#fef3c7] !text-[#92400e]">
                            Pending
                          </span>
                        )}
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
