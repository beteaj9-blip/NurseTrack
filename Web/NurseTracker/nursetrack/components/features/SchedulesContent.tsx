"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSchedules } from "@/core/api/hooks/useSchedules";
import { useAuthStore } from "@/core/store/authStore";
import { UserRole } from "@/core/types/user";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const routeRoleMap: Record<string, UserRole> = {
  "/nursing-student": "STUDENT",
  "/clinical-instructor": "INSTRUCTOR",
  "/admin": "ADMIN",
  "/chair": "CHAIR",
  "/coordinator": "COORDINATOR",
  "/assistant": "ASSISTANT",
};

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const cells: { day: number; month: "prev" | "cur" | "next" }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, month: "prev" });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, month: "cur" });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, month: "next" });

  return cells;
}

function getScheduleGroupKey(schedule: any) {
  return [schedule.date, schedule.hospital, schedule.area, schedule.startTime, schedule.endTime, schedule.instructorId, schedule.studentSection].map((value) => value ?? "").join("|");
}

function groupSchedulesByDuty(records: any[]) {
  const groups = new Map<string, any>();
  records.forEach((schedule: any) => {
    const key = getScheduleGroupKey(schedule);
    const current = groups.get(key);
    if (current) {
      current.students.push(schedule);
      return;
    }
    groups.set(key, { ...schedule, groupKey: key, students: [schedule] });
  });
  return Array.from(groups.values()).map((group: any) => ({
    ...group,
    activeStudents: group.students.filter((student: any) => !student.canceled),
  }));
}

export function SchedulesContent({ basePath }: { basePath: string }) {
  const router = useRouter();
  const [viewMode, setViewMode] = React.useState<"calendar" | "list">("calendar");
  const canEdit = basePath === "/admin" || basePath === "/chair" || basePath === "/coordinator";
  const usesChairScheduleView = basePath === "/admin" || basePath === "/chair";

  const today = new Date();
  const [calYear, setCalYear] = React.useState(today.getFullYear());
  const [calMonth, setCalMonth] = React.useState(today.getMonth());

  const user = useAuthStore((state) => state.user);
  const routeRole = routeRoleMap[basePath] ?? user?.role;
  const { data: schedules, isLoading } = useSchedules(
    user?.id != null ? String(user.id) : undefined,
    routeRole
  );
  const visibleSchedules = React.useMemo(() => {
    const records = schedules ?? [];
    if (routeRole === "INSTRUCTOR") return records.filter((schedule: any) => String(schedule.instructorId) === String(user?.id));
    if (routeRole === "STUDENT") return records.filter((schedule: any) => String(schedule.studentId) === String(user?.id));
    return records;
  }, [routeRole, schedules, user?.id]);

  // Build a map of dates that have one or more duty groups.
  const scheduleMap = React.useMemo(() => {
    const map: Record<string, any[]> = {};
    groupSchedulesByDuty(visibleSchedules).forEach((schedule: any) => {
      if (!schedule.date) return;
      map[schedule.date] = [...(map[schedule.date] ?? []), schedule];
    });
    return map;
  }, [visibleSchedules]);
  const scheduleGroups = React.useMemo(() => groupSchedulesByDuty(visibleSchedules), [visibleSchedules]);

  const cells = buildCalendar(calYear, calMonth);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  }

  return (
    <main className="p-[clamp(24px,4vw,42px)] content-start grid gap-4 w-full">
      <section className="grid gap-6">
        <article className="mt-0 p-[1.45rem] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] flex flex-col min-h-[calc(100vh-clamp(48px,8vw,84px))]">
          <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-[#e5eaf1] flex-wrap">
            <div>
              <h2 className="m-0 !text-[#111827] !text-[1.25rem] leading-[1.15] !font-bold">
                {viewMode === "calendar" ? "Schedule Calendar" : "Schedule List"}
              </h2>
            </div>

            <div className="flex items-center gap-4 flex-wrap ml-auto">
              {!usesChairScheduleView && <div className="flex items-center gap-2">
                <button onClick={() => setViewMode("calendar")} className={`h-[38px] px-6 rounded-lg !font-bold text-[0.9rem] transition-colors border ${viewMode === "calendar" ? "bg-[#8A252C] border-[#8A252C] text-white shadow-sm" : "bg-white border-[#e2e8f0] text-[#344054] hover:bg-[#f8fafc]"}`}>Calendar</button>
                <button onClick={() => setViewMode("list")} className={`h-[38px] px-6 rounded-lg !font-bold text-[0.9rem] transition-colors border ${viewMode === "list" ? "bg-[#8A252C] border-[#8A252C] text-white shadow-sm" : "bg-white border-[#e2e8f0] text-[#344054] hover:bg-[#f8fafc]"}`}>List</button>
              </div>}

              {canEdit && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`${basePath}/schedules/maker`} className="inline-flex items-center justify-center min-w-[160px] h-[38px] px-4 rounded-lg bg-[#8A252C] !text-white !font-extrabold !text-[0.9rem] transition-colors shadow-[0_4px_12px_rgba(138,37,44,0.18)] hover:bg-[#6d1d23] no-underline">Open Schedule Maker</Link>
                  <Link href={`${basePath}/overtime-details`} className="inline-flex items-center justify-center min-w-[160px] h-[38px] px-4 rounded-lg bg-white !text-[#334155] !font-extrabold !text-[0.9rem] transition-colors border border-[#e2e8f0] hover:bg-[#f8fafc] hover:text-[#0f172a] no-underline">View Overtime Details</Link>
                </div>
              )}
            </div>
          </div>

          {viewMode === "calendar" ? (
            <>
              {/* Month navigator */}
              <div className="flex items-center justify-between gap-3 m-[4px_0_14px] p-[14px_16px] border border-[#e4e7ec]/90 rounded-lg bg-gradient-to-r from-[#fff8d6] to-[#fafafb] max-[760px]:flex-col max-[760px]:items-start">
                <strong className="!text-[#111827] !text-[1.08rem] !font-[850] leading-[1.2]">
                  {MONTHS[calMonth]} {calYear}
                </strong>
                <div className="flex items-center gap-2 ml-auto">
                  <button onClick={prevMonth} className="w-[34px] h-[34px] flex items-center justify-center rounded-lg border border-[#e2e8f0] bg-white hover:bg-[#f1f5f9] transition-colors text-[#475467]">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <button onClick={() => { setCalYear(today.getFullYear()); setCalMonth(today.getMonth()); }} className="h-[34px] px-3 rounded-lg border border-[#e2e8f0] bg-white !text-[0.8rem] !font-bold text-[#344054] hover:bg-[#f1f5f9] transition-colors">Today</button>
                  <button onClick={nextMonth} className="w-[34px] h-[34px] flex items-center justify-center rounded-lg border border-[#e2e8f0] bg-white hover:bg-[#f1f5f9] transition-colors text-[#475467]">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
                <span className="!text-[#64748b] !text-[0.82rem] !font-[800] max-[760px]:hidden">
                  {canEdit ? "Choose a day to view schedules, students, and edit options" : "Your assigned clinical rotations"}
                </span>
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-3 p-[14px] border border-[#e4e7ec]/92 rounded-lg bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(249,250,251,0.9)),#f8fafc] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] max-[980px]:grid-cols-2" id="calendar-view">
                {DAYS.map(d => (
                  <span key={d} className="inline-flex items-center justify-center min-h-[34px] rounded-lg bg-[#8a252c]/5 !text-[#4b5565] !text-[0.72rem] !font-[900] uppercase text-center max-[980px]:hidden">{d}</span>
                ))}
                {cells.map((cell, i) => {
                  const isOtherMonth = cell.month !== "cur";
                  const dateStr = `${cell.month === "prev" ? (calMonth === 0 ? calYear - 1 : calYear) : cell.month === "next" ? (calMonth === 11 ? calYear + 1 : calYear) : calYear}-${String(cell.month === "prev" ? (calMonth === 0 ? 12 : calMonth) : cell.month === "next" ? (calMonth === 11 ? 1 : calMonth + 2) : calMonth + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`;
                  const daySchedules = scheduleMap[dateStr] ?? [];
                  const activeDaySchedules = daySchedules.filter((schedule: any) => schedule.activeStudents?.length > 0);
                  const sched = activeDaySchedules[0] ?? daySchedules[0];
                  const isCanceledOnly = daySchedules.length > 0 && activeDaySchedules.length === 0;
                  const isToday = dateStr === todayStr;

                  return (
                    <button
                      key={i} type="button"
                      onClick={sched ? () => router.push(`${basePath}/schedules/day?date=${dateStr}&schedule=${sched.id}`) : undefined}
                      className={`relative flex flex-col min-h-[110px] overflow-hidden border rounded-lg p-3 text-left outline-none max-[980px]:min-h-[90px]
                        ${sched ? isCanceledOnly ? "cursor-pointer border-[#fecaca] bg-[#fef2f2] shadow-[0_12px_30px_rgba(185,28,28,0.08)] transition-all hover:-translate-y-0.5 hover:border-[#fca5a5] hover:shadow-[0_16px_34px_rgba(185,28,28,0.1)] before:absolute before:inset-[0_auto_0_0] before:w-1 before:bg-[#ef4444]" : "cursor-pointer border-[#ffcf01]/82 bg-[linear-gradient(145deg,#fff8d9_0%,#fff3bc_58%,#fffdf4_100%)] shadow-[0_12px_30px_rgba(161,92,7,0.1)] transition-all hover:-translate-y-0.5 hover:border-[#8a252c]/34 hover:shadow-[0_16px_34px_rgba(32,33,36,0.11)] before:absolute before:inset-[0_auto_0_0] before:w-1 before:bg-[#ffcf01]" : "cursor-default border-[#e4e7ec]/95 bg-[#fcfcfd] shadow-[0_1px_2px_rgba(32,33,36,0.03)]"}
                        ${isToday && !sched ? "!border-[#8a252c]/50 !bg-[linear-gradient(135deg,#fff8d6_0%,#fafafb_100%)] !shadow-[0_12px_26px_rgba(138,37,44,0.08)]" : ""}
                        ${isOtherMonth && !sched ? "opacity-[0.45]" : ""}
                      `}
                    >
                      <span className={`inline-flex items-center justify-center w-fit min-w-[28px] min-h-[28px] rounded-lg !text-[0.76rem] !font-[900] uppercase
                        ${isToday ? "!bg-[#8A252C] !text-white" : sched ? "!bg-[#8a252c]/10 !text-[#8a252c]" : "!text-[#475467]"}
                      `}>{cell.day}</span>
                       {sched && <strong className="block mt-[10px] !text-[#111827] !text-[0.88rem] leading-[1.25] !font-[850]">{isCanceledOnly ? "Canceled" : activeDaySchedules.length > 1 ? `${activeDaySchedules.length} duties` : sched.area}</strong>}
                       {sched && <p className="m-[6px_0_0] !text-[0.76rem] leading-[1.4] !text-[#344054] !font-[800]">{isCanceledOnly ? "No active schedule" : activeDaySchedules.length > 1 ? "Multiple duty assignments" : sched.hospital}</p>}
                      {!sched && !isOtherMonth && <p className="m-[10px_0_0] !text-[0.76rem] leading-[1.4] !text-[#94a3b8] !font-[800]">No assigned duty</p>}
                       {isToday && <small className="inline-flex items-center justify-center w-fit mt-auto border border-[#8a252c]/18 rounded-full bg-white/78 !text-[#8a252c] !text-[0.76rem] !font-[900] px-[8px] py-[5px]">Today</small>}
                     </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              {isLoading ? (
                <div className="p-4 text-center text-[#64748b] !font-bold">Loading schedules...</div>
              ) : visibleSchedules.length > 0 ? (
                scheduleGroups.map((item: any) => (
                  <div key={item.groupKey} className="flex items-center justify-between gap-4 p-[1.1rem_1.25rem] border border-[#e2e8f0] rounded-lg bg-white shadow-sm hover:border-[#cbd5e1] transition-colors max-[600px]:flex-col max-[600px]:items-start">
                    <div>
                      <h3 className="m-0 mb-1 !text-[#1e293b] !text-[0.95rem] !font-[800]">{item.area} Rotation</h3>
                      <p className="m-0 !text-[#475569] !text-[0.85rem] !font-[600]">
                        {item.hospital} · {item.date} · {item.startTime} → {item.endTime}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`inline-flex items-center justify-center px-3 py-1 !text-[0.75rem] !font-[800] rounded-full whitespace-nowrap ${item.activeStudents?.length === 0 ? "bg-[#fef2f2] !text-[#991b1b]" : "bg-[#fef3c7] !text-[#92400e]"}`}>{item.activeStudents?.length === 0 ? "Canceled" : item.status ?? "Scheduled"}</span>
                      <button type="button" onClick={() => router.push(`${basePath}/schedules/day?date=${item.date}&schedule=${item.id}`)} className="bg-transparent border-none p-0 !text-[#8A252C] !text-[0.85rem] !font-[800] cursor-pointer hover:underline whitespace-nowrap">View roster</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[160px] p-6 border-2 border-dashed border-[#dbe3ee] rounded-xl bg-[#f8fafc] text-[#475569] font-medium text-center">
                  No schedules assigned yet. Check back once your Clinical Instructor publishes the roster.
                </div>
              )}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
