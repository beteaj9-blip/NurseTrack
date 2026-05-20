"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useAllAttendance } from "@/core/api/hooks/useAttendance";
import { useSchedules } from "@/core/api/hooks/useSchedules";
import { useAuthStore } from "@/core/store/authStore";
import { LoadingState } from "@/components/ui/LoadingState";

function overtimeHours(record: any) {
  return Math.max(Number(record.hours || 0) - 8, 0);
}

function formatHours(hours: number) {
  const rounded = Math.round(hours * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)} hrs`;
}

function formatPeriod(date?: string) {
  const source = date ? new Date(`${date}T00:00:00`) : new Date();
  return source.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatTableDate(date?: string) {
  if (!date) return "Not set";
  const parsed = new Date(`${date}T00:00:00`);
  const day = parsed.getDate();
  const month = parsed.toLocaleDateString("en-US", { month: "short" });
  const year = String(parsed.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
}

function formatTimeRange(start?: string, end?: string) {
  if (!start && !end) return "Not recorded";
  return `${start || "Not timed in"} - ${end || "Not timed out"}`;
}

function matchingSchedule(record: any, schedules: any[]) {
  return schedules.find((schedule: any) =>
    String(schedule.studentId) === String(record.studentId) &&
    schedule.date === record.dutyDate &&
    (!record.hospital || schedule.hospital === record.hospital) &&
    (!record.area || schedule.area === record.area)
  ) ?? schedules.find((schedule: any) => String(schedule.studentId) === String(record.studentId) && schedule.date === record.dutyDate);
}

export function OvertimeDetailsDetailContent({ basePath }: { basePath?: string; searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const personId = searchParams.get("id");
  const isChair = basePath === "/chair" || basePath === "/coordinator" || basePath === "/assistant";
  const viewerId = isChair && user?.id != null ? String(user.id) : undefined;
  const { data: attendance = [], isLoading: isAttendanceLoading } = useAllAttendance(true, viewerId);
  const { data: schedules = [], isLoading: isSchedulesLoading } = useSchedules(viewerId, user?.role);
  const records = (attendance as any[]).filter((record) => String(record.studentId) === String(personId) && overtimeHours(record) > 0);
  const first = records[0] ?? (attendance as any[]).find((record) => String(record.studentId) === String(personId));
  const total = records.reduce((sum, record) => sum + overtimeHours(record), 0);
  const period = formatPeriod(records[0]?.dutyDate ?? first?.dutyDate);
  const isLoading = isAttendanceLoading || isSchedulesLoading;

  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]">
      <section className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-[1.6rem_1.75rem_1.75rem]">
        {isLoading ? <LoadingState message="Loading overtime records..." /> : first ? <div className="grid gap-5">
          <div className="grid grid-cols-4 gap-3 max-[980px]:grid-cols-2 max-[640px]:grid-cols-1">
            <Summary label="Name" value={first.studentName || "Nursing Student"} />
            <Summary label="Role" value="Student" />
            <Summary label="Period" value={period} />
            <Summary label="Total Overtime" value={formatHours(total)} />
          </div>

          <div className="rounded-xl border border-[#e2e8f0] overflow-hidden">
            <div className="min-h-[52px] flex items-center justify-center px-4 bg-[#fff8d6] !text-[#8A0000] !text-[0.95rem] !font-[900] text-center uppercase">
              CNAHS Student who rendered overtime for the period of {period}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#970000] !text-white !text-[0.86rem] !font-[900] uppercase">
                    <th className="p-5 text-center border-r border-white/40 w-[90px]">No.</th>
                    <th className="p-5 border-r border-white/40">Date</th>
                    <th className="p-5 border-r border-white/40">Schedule</th>
                    <th className="p-5 border-r border-white/40">Actual Time</th>
                    <th className="p-5">OT Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => {
                    const schedule = matchingSchedule(record, schedules as any[]);
                    const scheduleTime = schedule ? formatTimeRange(schedule.startTime, schedule.endTime) : "07:00 AM - 03:00 PM";
                    return (
                      <tr key={record.id} className="border-b border-[#e2e8f0] last:border-0 !text-[#344054] !font-[900]">
                        <td className="p-4 text-center border-r border-[#e2e8f0]">{index + 1}</td>
                        <td className="p-4 border-r border-[#e2e8f0]">{formatTableDate(record.dutyDate)}</td>
                        <td className="p-4 border-r border-[#e2e8f0]">{scheduleTime}</td>
                        <td className="p-4 border-r border-[#e2e8f0]">{formatTimeRange(record.timeInLabel, record.timeOutLabel)}</td>
                        <td className="p-4">{formatHours(overtimeHours(record))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4 !text-[#64748b] !text-[0.86rem] !font-[900]">
            {first.studentName || "Student"} has {formatHours(total)} recorded for {period}.
          </div>
        </div> : <div className="rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-6 text-center !text-[#64748b] !font-bold">No overtime records found.</div>}
      </section>
    </main>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-[#dbe3ee] bg-[#f8fafc] p-4"><small className="block mb-1 !text-[#64748b] !text-[0.76rem] !font-[900] uppercase">{label}</small><strong className="!text-[#1e293b] !text-[0.95rem] !font-[900]">{value}</strong></div>;
}
