"use client";
import React, { useState } from "react";
import { useAllAttendance, useInstructorAttendance } from "@/core/api/hooks/useAttendance";
import { useHospitals } from "@/core/api/hooks/useHospitals";
import { useSchedules } from "@/core/api/hooks/useSchedules";
import { useAuthStore } from "@/core/store/authStore";
import { InlineSelect } from "@/components/ui/InlineSelect";
import { LoadingState } from "@/components/ui/LoadingState";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";

export function LiveAttendanceContent() {
  const user = useAuthStore((state) => state.user);
  const isChair = user?.role === "CHAIR";
  const { data: instructorAttendance = [], isLoading: isInstructorAttendanceLoading } = useInstructorAttendance(!isChair && user?.id != null ? String(user.id) : undefined);
  const { data: allAttendance = [], isLoading: isAllAttendanceLoading } = useAllAttendance(isChair, isChair && user?.id != null ? String(user.id) : undefined);
  const attendance = isChair ? allAttendance : instructorAttendance;
  const { data: hospitals = [], isLoading: isHospitalsLoading } = useHospitals();
  const { data: schedules = [], isLoading: isSchedulesLoading } = useSchedules(user?.id != null ? String(user.id) : undefined, isChair ? "CHAIR" : "INSTRUCTOR");
  const [siteFilter, setSiteFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [search, setSearch] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const todaySchedules = (schedules as any[]).filter((schedule: any) => schedule.date === today && (isChair || String(schedule.instructorId) === String(user?.id)));
  const todayAttendance = (attendance as any[]).filter((record: any) => record.dutyDate === today && (isChair || String(record.instructorId) === String(user?.id)));
  const data = todaySchedules.map((schedule: any) => {
    const record = todayAttendance.find((duty: any) => String(duty.studentId) === String(schedule.studentId) && duty.hospital === schedule.hospital && duty.area === schedule.area);
    return {
    id: schedule.id,
    profileImageUrl: schedule.studentProfileImageUrl,
    name: schedule.studentName || "Nursing Student",
    section: schedule.studentSection || "Nursing Student",
    site: schedule.hospital || "Assigned Site",
    area: schedule.area || "Assigned Area",
    ci: record?.instructorName || schedule.instructorName || (!isChair ? user?.fullName : undefined) || "Clinical Instructor",
    time: record?.timeInLabel || "Not timed in",
    liveMin: record?.timeOutLabel ? "Completed" : record?.timeInLabel ? "Active" : "Waiting",
    status: record?.status || "Not connected",
  };
  });
  const filtered = data.filter((item: any) => {
    const matchSite = siteFilter === "all" || item.site.includes(siteFilter);
    const matchArea = areaFilter === "all" || item.area === areaFilter;
    const q = search.toLowerCase();
    const matchSearch = !search || item.name.toLowerCase().includes(q) || item.section.toLowerCase().includes(q) || item.site.toLowerCase().includes(q) || item.area.toLowerCase().includes(q);
    return matchSite && matchArea && matchSearch;
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
          <div className="grid gap-[18px] mb-[24px] grid-cols-3 max-[720px]:grid-cols-1">
            <label className={labelCls} htmlFor="la-site">Hospital
              <InlineSelect value={siteFilter} options={hospitalOptions} placeholder="All Hospitals" onChange={(value) => { setSiteFilter(value); setAreaFilter("all"); }} disabled={isHospitalsLoading} />
            </label>
            <label className={labelCls} htmlFor="la-area">Duty area
              <InlineSelect value={areaFilter} options={areaOptions} placeholder="All duty areas" onChange={setAreaFilter} />
            </label>
            <label className={labelCls} htmlFor="la-search">Search
              <input className={inputCls} id="la-search" type="search" placeholder="Search student, section, area, or site" value={search} onChange={e => setSearch(e.target.value)} />
            </label>
          </div>
          {isSchedulesLoading || (isChair ? isAllAttendanceLoading : isInstructorAttendanceLoading) ? (
            <LoadingState message="Loading today's live attendance..." className="p-8" />
          ) : todaySchedules.length === 0 ? (
            <div className="p-8 text-center rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc] !text-[#64748b] !text-[0.9rem] !font-bold">No schedule for today.</div>
          ) : (
            <>
              <div className="flex flex-col w-full border border-[#e2e8f0] rounded-lg overflow-x-auto bg-white" role="table">
                <div className="min-w-[900px] grid grid-cols-[44px_1.25fr_1.4fr_0.65fr_0.8fr_0.65fr] items-center p-[18px] gap-[18px] bg-[#f8fafc] !text-[#344054] !text-[0.78rem] !font-[800] uppercase border-b border-[#e2e8f0]" role="row">
                  {['No.','Student','Duty Location','Time-In','Connection','Status'].map(h => <span key={h} role="columnheader">{h}</span>)}
                </div>
                {filtered.map((item: any, i: number) => (
                  <div className="min-w-[900px] grid grid-cols-[44px_1.25fr_1.4fr_0.65fr_0.8fr_0.65fr] items-center p-[18px] gap-[18px] border-b border-[#e2e8f0] bg-white hover:bg-[#f8fafc] last:border-b-0" role="row" key={item.id}>
                    <span role="cell" className="w-[32px] h-[32px] rounded-full border border-[#8a252c]/16 bg-[#f8fafc] grid place-items-center !text-[#8A252C] !text-[0.82rem] !font-[900]">{i+1}.</span>
                    <span role="cell" className="flex items-center gap-[10px]"><ProfileAvatar name={item.name} imageUrl={item.profileImageUrl} size={42} /><div><strong className="block !text-[#111827] !text-[0.88rem]">{item.name}</strong><small className="block !text-[#64748b] !text-[0.74rem] !font-[800]">{item.section}</small></div></span>
                    <span role="cell"><strong className="block !text-[#111827] !text-[0.88rem]">{item.site}</strong><small className="block !text-[#64748b] !text-[0.74rem] !font-[800]">{item.area}</small><small className="block !text-[#64748b] !text-[0.74rem] !font-[800]">CI: {item.ci}</small></span>
                    <span role="cell" className="!text-[#111827] !text-[0.86rem] !font-[800]">{item.time}</span>
                    <span role="cell" className="!text-[#111827] !text-[0.86rem] !font-[800]">{item.liveMin}</span>
                    <span role="cell"><span className={`inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap ${item.status === "Not connected" ? "bg-[#f1f5f9] !text-[#475569]" : "bg-[#e9f8ef] !text-[#03703c]"}`}>{item.status}</span></span>
                  </div>
                ))}
              </div>
              {filtered.length === 0 && <div className="p-8 text-center !text-[#64748b] !text-[0.85rem] !font-bold">No scheduled students match the selected filters.</div>}
            </>
          )}
        </article>
      </section>
    </main>
  );
}
