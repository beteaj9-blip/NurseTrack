"use client";
import React, { useState } from "react";
import { useAllAttendance, useInstructorAttendance } from "@/core/api/hooks/useAttendance";
import { useHospitals } from "@/core/api/hooks/useHospitals";
import { useSchedules } from "@/core/api/hooks/useSchedules";
import { useAuthStore } from "@/core/store/authStore";
import { InlineSelect } from "@/components/ui/InlineSelect";
import { LoadingState } from "@/components/ui/LoadingState";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";

const levelOptions = [{ value: "all", label: "All levels" }, 1, 2, 3, 4].map((level) => typeof level === "number" ? { value: String(level), label: `Level ${level}` } : level);

function levelsFromText(value?: string) {
  const text = String(value ?? "");
  const levels = new Set<number>();
  const numeric = text.match(/(?:^|\b)(?:n|bsn|level)\s*([1-4])\b/i) ?? text.match(/\b([1-4])(?:st|nd|rd|th)\s*level\b/i);
  if (numeric) levels.add(Number(numeric[1]));
  if (/level\s*i\b/i.test(text)) levels.add(1);
  if (/level\s*ii\b/i.test(text)) levels.add(2);
  if (/level\s*iii\b/i.test(text)) levels.add(3);
  if (/level\s*iv\b/i.test(text)) levels.add(4);
  return Array.from(levels).sort((a, b) => a - b);
}

export function LiveAttendanceContent({ basePath }: { basePath?: string } = {}) {
  const user = useAuthStore((state) => state.user);
  const effectiveRole = basePath === "/admin" ? "ADMIN" : basePath === "/coordinator" ? "COORDINATOR" : basePath === "/chair" ? "CHAIR" : basePath === "/assistant" ? "ASSISTANT" : user?.role;
  const isAllScope = effectiveRole === "ADMIN" || effectiveRole === "CHAIR" || effectiveRole === "COORDINATOR" || effectiveRole === "ASSISTANT";
  const canFilterByLevel = effectiveRole === "ADMIN" || effectiveRole === "COORDINATOR";
  const scopedViewerId = (effectiveRole === "CHAIR" || effectiveRole === "ASSISTANT") && user?.id != null ? String(user.id) : undefined;
  const { data: instructorAttendance = [], isLoading: isInstructorAttendanceLoading } = useInstructorAttendance(!isAllScope && user?.id != null ? String(user.id) : undefined);
  const { data: allAttendance = [], isLoading: isAllAttendanceLoading } = useAllAttendance(isAllScope, scopedViewerId);
  const attendance = isAllScope ? allAttendance : instructorAttendance;
  const { data: hospitals = [], isLoading: isHospitalsLoading } = useHospitals();
  const { data: schedules = [], isLoading: isSchedulesLoading } = useSchedules(user?.id != null ? String(user.id) : undefined, isAllScope ? effectiveRole : "INSTRUCTOR");
  const [siteFilter, setSiteFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const today = new Date(now.getTime() - offset).toISOString().slice(0, 10);
  const todaySchedules = (schedules as any[]).filter((schedule: any) => schedule.date === today && (isAllScope || String(schedule.instructorId) === String(user?.id)));
  const todayAttendance = (attendance as any[]).filter((record: any) => record.dutyDate === today && (isAllScope || String(record.instructorId) === String(user?.id)));
  const data = todaySchedules.map((schedule: any) => {
    const record = todayAttendance.find((duty: any) => String(duty.studentId) === String(schedule.studentId) && duty.hospital === schedule.hospital && duty.area === schedule.area);
    return {
    id: schedule.id,
    profileImageUrl: schedule.studentProfileImageUrl,
    name: schedule.studentName || "Nursing Student",
    section: schedule.studentSection || "Nursing Student",
    site: schedule.hospital || "Assigned Site",
    area: schedule.area || "Assigned Area",
    ci: record?.instructorName || schedule.instructorName || (!isAllScope ? user?.fullName : undefined) || "Clinical Instructor",
    time: record?.timeInLabel || "Not timed in",
    timeOut: record?.timeOutLabel || "Not timed out",
    liveMin: record?.timeOutLabel ? "Completed" : record?.timeInLabel ? "Active" : "Waiting",
    status: record?.status || "Not connected",
    hours: record?.hours ?? 0,
  };
  });
  const filtered = data.filter((item: any) => {
    const matchSite = siteFilter === "all" || item.site.includes(siteFilter);
    const matchArea = areaFilter === "all" || item.area === areaFilter;
    const matchLevel = !canFilterByLevel || levelFilter === "all" || levelsFromText(item.section).includes(Number(levelFilter));
    const q = search.toLowerCase();
    const matchSearch = !search || item.name.toLowerCase().includes(q) || item.section.toLowerCase().includes(q) || item.site.toLowerCase().includes(q) || item.area.toLowerCase().includes(q);
    return matchSite && matchArea && matchLevel && matchSearch;
  });
  const selectedHospital = (hospitals as any[]).find((hospital: any) => hospital.name === siteFilter);
  const hospitalOptions = [{ value: "all", label: "All Hospitals" }, ...(hospitals as any[]).map((hospital: any) => ({ value: hospital.name, label: hospital.fullName ? `${hospital.name} - ${hospital.fullName}` : hospital.name }))];
  const allDutyAreas = Array.from(new Set((hospitals as any[]).flatMap((hospital: any) => hospital.wards ?? []).filter(Boolean))).sort() as string[];
  const dutyAreaSource = selectedHospital?.wards?.length ? selectedHospital.wards : allDutyAreas;
  const areaOptions = [{ value: "all", label: "All duty areas" }, ...dutyAreaSource.map((area: string) => ({ value: area, label: area }))];
  const inputCls = "w-full min-h-[48px] px-3 py-2 border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all";
  const labelCls = "flex flex-col gap-1.5 m-0 p-[0.1rem] !text-sm !font-bold !text-[#344054]";
  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]">
      <section className="w-full">
        <article className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem]">
          <div className="flex items-center justify-between gap-4 mb-[1.1rem] pb-0 border-b border-[#e5eaf1] flex-wrap">
            <h2 className="m-0 !text-[#111827] !text-[1.15rem] !font-bold tracking-[-0.03em]">Student Attendance Feed</h2>
          </div>
          <div className={canFilterByLevel ? "grid gap-[18px] mb-[24px] grid-cols-[minmax(170px,1fr)_minmax(170px,1fr)_minmax(140px,0.75fr)_minmax(0,1.35fr)] max-[1100px]:grid-cols-2 max-[720px]:grid-cols-1" : "grid gap-[18px] mb-[24px] grid-cols-3 max-[720px]:grid-cols-1"}>
            <label className={labelCls} htmlFor="la-site">Hospital
              <InlineSelect value={siteFilter} options={hospitalOptions} placeholder="All Hospitals" onChange={(value) => { setSiteFilter(value); setAreaFilter("all"); }} disabled={isHospitalsLoading} />
            </label>
            <label className={labelCls} htmlFor="la-area">Duty area
              <InlineSelect value={areaFilter} options={areaOptions} placeholder="All duty areas" onChange={setAreaFilter} />
            </label>
            {canFilterByLevel && <label className={labelCls} htmlFor="la-level">Level<InlineSelect value={levelFilter} options={levelOptions} placeholder="All levels" onChange={setLevelFilter} /></label>}
            <label className={labelCls} htmlFor="la-search">Search
              <input className={inputCls} id="la-search" type="search" placeholder="Search student, section, area, or site" value={search} onChange={e => setSearch(e.target.value)} />
            </label>
          </div>
          {isSchedulesLoading || (isAllScope ? isAllAttendanceLoading : isInstructorAttendanceLoading) ? (
            <LoadingState message="Loading today's live attendance..." className="p-8" />
          ) : todaySchedules.length === 0 ? (
            <div className="p-8 text-center rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc] !text-[#64748b] !text-[0.9rem] !font-bold">No schedule for today.</div>
          ) : (
            <>
              <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-lg border border-[#e2e8f0] bg-white" role="table">
                <div className="grid grid-cols-[44px_minmax(150px,1.2fr)_minmax(160px,1.35fr)_minmax(76px,0.6fr)_minmax(86px,0.7fr)_minmax(92px,0.65fr)] items-center gap-3 bg-[#f8fafc] p-4 !text-[#344054] !text-[0.72rem] !font-[900] uppercase border-b border-[#e2e8f0] max-[760px]:hidden" role="row">
                  {['No.','Student','Duty Location','Time-In','Connection','Status'].map(h => <span key={h} role="columnheader">{h}</span>)}
                </div>
                {filtered.map((item: any, i: number) => (
                  <div className="grid grid-cols-[44px_minmax(150px,1.2fr)_minmax(160px,1.35fr)_minmax(76px,0.6fr)_minmax(86px,0.7fr)_minmax(92px,0.65fr)] items-center gap-3 border-b border-[#e2e8f0] bg-white p-4 hover:bg-[#f8fafc] last:border-b-0 max-[760px]:grid-cols-[32px_minmax(0,1fr)_auto] max-[760px]:gap-3 max-[760px]:p-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8A252C]/20" role="row" key={item.id} tabIndex={0} onClick={() => setSelectedSession(item)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedSession(item); }}>
                    <span role="cell" className="w-[32px] h-[32px] rounded-full border border-[#8a252c]/16 bg-[#f8fafc] grid place-items-center !text-[#8A252C] !text-[0.82rem] !font-[900]">{i+1}.</span>
                    <span role="cell" className="flex min-w-0 items-center gap-[10px]"><ProfileAvatar name={item.name} imageUrl={item.profileImageUrl} size={42} /><div className="min-w-0"><strong className="block truncate !text-[#111827] !text-[0.88rem] !font-[900] max-[760px]:whitespace-normal max-[760px]:break-words">{item.name}</strong><small className="block truncate !text-[#64748b] !text-[0.74rem] !font-[800] max-[760px]:whitespace-normal max-[760px]:break-words">{item.section}</small></div></span>
                    <span role="cell" className="min-w-0 max-[760px]:col-start-2 max-[760px]:col-span-2"><strong className="block truncate !text-[#111827] !text-[0.88rem] max-[760px]:whitespace-normal max-[760px]:break-words">{item.site}</strong><small className="block truncate !text-[#64748b] !text-[0.74rem] !font-[800] max-[760px]:whitespace-normal max-[760px]:break-words">{item.area}</small><small className="block truncate !text-[#64748b] !text-[0.74rem] !font-[800] max-[760px]:whitespace-normal max-[760px]:break-words">CI: {item.ci}</small></span>
                    <span role="cell" className="!text-[#111827] !text-[0.86rem] !font-[800] max-[760px]:col-start-2">{item.time}</span>
                    <span role="cell" className="!text-[#111827] !text-[0.86rem] !font-[800] max-[760px]:text-right">{item.liveMin}</span>
                    <span role="cell" className="max-[760px]:col-start-3 max-[760px]:row-start-1 max-[760px]:justify-self-end"><span className={`inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap ${item.status === "Not connected" ? "bg-[#f1f5f9] !text-[#475569]" : "bg-[#e9f8ef] !text-[#03703c]"}`}>{item.status}</span></span>
                  </div>
                ))}
              </div>
              {selectedSession && (
                <div className="mt-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="m-0 !text-[#475569] !text-[0.72rem] !font-[900] uppercase">Session Details</p>
                      <h3 className="m-0 mt-1 !text-[#111827] !text-[1rem] !font-[900]">{selectedSession.name}</h3>
                      <p className="m-0 mt-1 !text-[#64748b] !text-[0.82rem] !font-[800]">{selectedSession.section}</p>
                    </div>
                    <button type="button" className="rounded-lg border border-[#cbd5e1] bg-white px-3 py-2 !text-[#475569] !text-[0.78rem] !font-[900]" onClick={() => setSelectedSession(null)}>Close</button>
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
                    {[
                      ["Duty Location", `${selectedSession.site} - ${selectedSession.area}`],
                      ["Clinical Instructor", selectedSession.ci],
                      ["Time In", selectedSession.time],
                      ["Time Out", selectedSession.timeOut],
                      ["Connection", selectedSession.liveMin],
                      ["Status", selectedSession.status],
                      ["Counted Hours", (function(h){ const m = Math.round(Number(h||0)*60); return m===0 ? "0m" : (Math.floor(m/60)>0 ? Math.floor(m/60)+"h " : "") + (m%60>0 ? (m%60)+"m" : ""); })(selectedSession.hours)],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-lg border border-[#e2e8f0] bg-white p-3">
                        <p className="m-0 !text-[#64748b] !text-[0.7rem] !font-[900] uppercase">{label}</p>
                        <p className="m-0 mt-1 !text-[#111827] !text-[0.9rem] !font-[900]">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {filtered.length === 0 && <div className="p-8 text-center !text-[#64748b] !text-[0.85rem] !font-bold">No scheduled student(s) match the selected filters.</div>}
            </>
          )}
        </article>
      </section>
    </main>
  );
}
