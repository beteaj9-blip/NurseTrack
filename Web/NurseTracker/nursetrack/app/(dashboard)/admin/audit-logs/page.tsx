"use client";

import React, { useState, useMemo } from "react";

export default function AuditLogsPage() {
  const [activeRange, setActiveRange] = useState("this");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");

  const logs = [
    { actor: "Chair Reyes", role: "Chair", action: "Published schedule", record: "Pedia Pulmo Ward Rotation", context: "BSN 3B - Group 1", time: "May 1, 2026 - 09:20 AM", week: "this", type: "schedule", dateStr: "2026-05-01" },
    { actor: "Patricia Reyes, RN, MAN", role: "Clinical Instructor", action: "Approved clinical case", record: "Maria Cruz", context: "Major Case - Assist", time: "Apr 30, 2026 - 04:35 PM", week: "this", type: "case", dateStr: "2026-04-30" },
    { actor: "Louise Wong", role: "Clinical Instructor", action: "Recommended appeal", record: "Treasure Abadinas", context: "Late attendance appeal", time: "Apr 30, 2026 - 02:10 PM", week: "this", type: "appeal", dateStr: "2026-04-30" },
    { actor: "Chair Reyes", role: "Chair", action: "Approved appeal", record: "Treasure Abadinas", context: "Late attendance appeal", time: "Apr 30, 2026 - 03:22 PM", week: "this", type: "appeal", dateStr: "2026-04-30" },
    { actor: "Chair Reyes", role: "Chair", action: "Edited duty type", record: "N1 G1", context: "Regular to Extension", time: "Apr 29, 2026 - 10:05 AM", week: "this", type: "schedule", dateStr: "2026-04-29" },
    { actor: "Miguel Santos, RN, MAN", role: "Clinical Instructor", action: "Validated attendance", record: "BSN 3B - Group 1", context: "08:00 AM to 04:00 PM", time: "Apr 28, 2026 - 05:10 PM", week: "this", type: "attendance", dateStr: "2026-04-28" },
    { actor: "Louise Wong", role: "Clinical Instructor", action: "Returned clinical case", record: "Zander Aligato", context: "Missing checklist item", time: "Apr 28, 2026 - 01:40 PM", week: "this", type: "case", dateStr: "2026-04-28" },
    { actor: "Chair Reyes", role: "Chair", action: "Assigned supervising CI", record: "N1 G2", context: "Louise Wong", time: "Apr 27, 2026 - 11:18 AM", week: "this", type: "schedule", dateStr: "2026-04-27" },
    { actor: "Patricia Reyes, RN, MAN", role: "Clinical Instructor", action: "Verified clinical case", record: "Treasure Abadinas", context: "Major Case - Circulate", time: "Apr 24, 2026 - 04:35 PM", week: "last", type: "case", dateStr: "2026-04-24" },
    { actor: "Chair Reyes", role: "Chair", action: "Updated supervising CI", record: "Operating Room Duty", context: "Elena Dela Cruz assigned", time: "Apr 23, 2026 - 09:45 AM", week: "last", type: "schedule", dateStr: "2026-04-23" },
    { actor: "Chair Reyes", role: "Chair", action: "Closed appeal review", record: "Nicole Dela Pena", context: "Completion duty appeal", time: "Apr 18, 2026 - 02:30 PM", week: "last", type: "appeal", dateStr: "2026-04-18" },
  ];

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesRange = log.week === activeRange;
      const matchesDate = !date || log.dateStr === date;
      const matchesSearch = !search || Object.values(log).some(val => String(val).toLowerCase().includes(search.toLowerCase()));
      return matchesRange && matchesDate && matchesSearch;
    });
  }, [activeRange, search, date]);

  const clearFilters = () => {
    setActiveRange("this");
    setSearch("");
    setDate("");
  };

  const inputClass = "w-full min-h-[50px] px-3 py-2 border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] !font-[500] focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all";
  const labelClass = "flex flex-col gap-[6px] m-0 !text-[0.875rem] !font-[800] !text-[#344054]";
  const ghostBtn = "inline-flex items-center justify-center min-w-[110px] min-h-[50px] px-[1.25rem] rounded-[8px] bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.84rem] !font-[800] hover:border-[rgba(138,37,44,0.32)] hover:!text-[#8A252C] hover:shadow-[0_10px_24px_rgba(32,33,36,0.08)] transition-all cursor-pointer whitespace-nowrap max-[1180px]:w-full";

  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)] content-start">
      <section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.35rem_1.55rem_1.6rem] max-[820px]:p-[1.2rem]">
        <div className="flex items-center justify-between mb-[1rem] pb-[0.35rem] flex-wrap gap-4">
          <div>
            <h2 className="m-0 !text-[#111827] !text-[1.15rem] leading-[1.15] !font-[800] tracking-[-0.03em]">Audit Trail</h2>
            <p className="m-[0.35rem_0_0] !text-[#4c5d7d] !text-[0.9rem] !font-[700] leading-[1.35]">Filter logs by week, keyword, or selected date.</p>
          </div>
          <span className="inline-flex items-center justify-start w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-[800] whitespace-nowrap bg-[#eff6ff] !text-[#1e3a8a] border border-[#bfdbfe]">
            {filteredLogs.length} {activeRange === "this" ? "this week" : "last week"}
          </span>
        </div>

        <div className="grid grid-cols-[auto_minmax(300px,1.15fr)_minmax(210px,0.7fr)_auto] items-end gap-[1rem] mb-[1.35rem] max-[1180px]:grid-cols-2 max-[820px]:grid-cols-1">
          <div className="inline-flex items-center gap-[0.55rem] w-fit p-[0.25rem] border border-[#dbe3ee] rounded-full bg-white max-[1180px]:w-full max-[1180px]:justify-center" role="group" aria-label="Audit log date range">
            <button 
              className={`min-h-[38px] px-[1rem] border-0 rounded-full font-inherit !text-[0.86rem] !font-[850] cursor-pointer transition-colors max-[1180px]:flex-1 ${activeRange === "this" ? "bg-[#8a252c] !text-white shadow-[0_8px_16px_rgba(138,37,44,0.12)]" : "bg-transparent !text-[#1e2f4f] hover:bg-[#f8fafc] focus-visible:bg-[#f8fafc]"}`} 
              type="button" 
              onClick={() => setActiveRange("this")}
            >This week</button>
            <button 
              className={`min-h-[38px] px-[1rem] border-0 rounded-full font-inherit !text-[0.86rem] !font-[850] cursor-pointer transition-colors max-[1180px]:flex-1 ${activeRange === "last" ? "bg-[#8a252c] !text-white shadow-[0_8px_16px_rgba(138,37,44,0.12)]" : "bg-transparent !text-[#1e2f4f] hover:bg-[#f8fafc] focus-visible:bg-[#f8fafc]"}`} 
              type="button" 
              onClick={() => setActiveRange("last")}
            >Last week</button>
          </div>

          <label className={labelClass} htmlFor="audit-search">
            Search
            <input 
              className={inputClass}
              id="audit-search" 
              type="search" 
              placeholder="Search actor, student, action, or record" 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </label>

          <label className={labelClass} htmlFor="audit-date">
            Date
            <input 
              className={inputClass}
              id="audit-date" 
              type="date" 
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </label>

          <button className={ghostBtn} type="button" onClick={clearFilters}>Clear</button>
        </div>

        <div className="w-full overflow-hidden border border-[#dbe3ee] rounded-[14px] bg-white">
          <div className="grid grid-cols-[minmax(220px,1fr)_minmax(190px,0.9fr)_minmax(290px,1.15fr)_minmax(230px,0.95fr)] items-center gap-x-[1.25rem] w-full p-[1.05rem_1.25rem] bg-[#f8fafc] border-b border-[#dbe3ee] max-[1180px]:grid-cols-[minmax(180px,1fr)_minmax(160px,0.85fr)_minmax(220px,1fr)_minmax(190px,0.9fr)] max-[820px]:hidden">
            <span className="!text-[#0b1b3a] !text-[0.82rem] !font-[900] uppercase tracking-[0.04em] whitespace-nowrap min-w-0">Actor</span>
            <span className="!text-[#0b1b3a] !text-[0.82rem] !font-[900] uppercase tracking-[0.04em] whitespace-nowrap min-w-0">Action</span>
            <span className="!text-[#0b1b3a] !text-[0.82rem] !font-[900] uppercase tracking-[0.04em] whitespace-nowrap min-w-0">Affected Record</span>
            <span className="!text-[#0b1b3a] !text-[0.82rem] !font-[900] uppercase tracking-[0.04em] whitespace-nowrap min-w-0 justify-self-start text-left">Time</span>
          </div>

          {filteredLogs.map((log, idx) => (
            <div className="grid grid-cols-[minmax(220px,1fr)_minmax(190px,0.9fr)_minmax(290px,1.15fr)_minmax(230px,0.95fr)] items-center gap-x-[1.25rem] w-full p-[1.05rem_1.25rem] border-b border-[#e5eaf1] last:border-b-0 max-[1180px]:grid-cols-[minmax(180px,1fr)_minmax(160px,0.85fr)_minmax(220px,1fr)_minmax(190px,0.9fr)] max-[820px]:grid-cols-1 max-[820px]:gap-y-[0.45rem] max-[820px]:p-[1rem]" key={idx}>
              <span className="min-w-0"><strong className="block !text-[#111827] leading-[1.25] !font-[800]">{log.actor}</strong><small className="block mt-[0.25rem] !text-[#4c5d7d] !font-[700] leading-[1.25]">{log.role}</small></span>
              <span className="min-w-0"><strong className="block !text-[#111827] leading-[1.25] !font-[800]">{log.action}</strong></span>
              <span className="min-w-0"><strong className="block !text-[#111827] leading-[1.25] !font-[800]">{log.record}</strong><small className="block mt-[0.25rem] !text-[#4c5d7d] !font-[700] leading-[1.25]">{log.context}</small></span>
              <span className="min-w-0 justify-self-start text-left whitespace-nowrap max-[820px]:whitespace-normal max-[820px]:mt-[0.25rem]"><strong className="block !text-[#111827] leading-[1.25] !font-[800]">{log.time}</strong></span>
            </div>
          ))}
        </div>

        {filteredLogs.length === 0 && (
          <div className="mt-[1rem] p-[1.1rem_1.25rem] border border-dashed border-[rgba(138,37,44,0.24)] rounded-[12px] bg-[#fffaf0] !text-[#8a252c] !font-[800]">
            No audit log entries match this view. Try clearing filters or changing the selected date.
          </div>
        )}
      </section>
    </main>
  );
}
