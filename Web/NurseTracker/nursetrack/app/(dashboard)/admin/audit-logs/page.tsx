"use client";

import React, { useMemo, useState } from "react";
import { useAuditLogs } from "@/core/api/hooks/useAuditLogs";

type AuditLog = {
  id: number;
  actor: string;
  actorRole: string;
  action: string;
  recordName: string;
  context?: string;
  category: string;
  occurredAt: string;
};

const formatRole = (role: string) => role.toLowerCase().replace(/(^|_)(\w)/g, (_, space, letter) => `${space ? " " : ""}${letter.toUpperCase()}`);
const formatTime = (value: string) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
const toDateValue = (value: string) => value ? new Date(value).toISOString().slice(0, 10) : "";
const resourceLabels: Record<string, string> = {
  users: "User",
  schedules: "Schedule",
  duties: "Duty Record",
  cases: "Clinical Case",
  appeals: "Appeal",
  "extension-days": "Extension Day",
  clearances: "Clearance",
  notifications: "Notification",
  hospitals: "Hospital",
  "admin-access-permissions": "Access Permission",
  checklist: "Checklist Item",
  uploads: "Upload",
};

const humanize = (value: string) => value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_=&]/g, " ").replace(/\s+/g, " ").trim().toLowerCase().replace(/(^|\s)(\w)/g, (_, space, letter) => `${space}${letter.toUpperCase()}`);
const affectedRecord = (log: AuditLog) => {
  if (!log.recordName?.startsWith("/api/")) return { name: log.recordName, context: log.context || log.category };
  const parts = log.recordName.split("/").filter(Boolean);
  const resource = parts[1] || log.category;
  const label = resourceLabels[resource] || humanize(resource || "Record");
  const id = parts.find(part => /^\d+$/.test(part));
  const actionPart = [...parts].reverse().find(part => part !== "api" && part !== resource && !/^\d+$/.test(part));
  const queryContext = log.context ? humanize(log.context) : "";
  return {
    name: id ? `${label} #${id}` : label,
    context: queryContext || (actionPart ? humanize(actionPart) : label),
  };
};

const isActionLog = (log: AuditLog) => {
  const action = log.action.toLowerCase();
  const record = `${log.recordName} ${log.context ?? ""}`.toLowerCase();
  return action !== "logged in" && action !== "registered account" && !record.includes("/login") && !record.includes(" - login");
};

const inRange = (value: string, range: string) => {
  const date = new Date(value);
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() - (range === "this" ? 7 : 14));
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  if (range === "last") end.setDate(now.getDate() - 7);
  return date >= start && date <= end;
};

export default function AuditLogsPage() {
  const [activeRange, setActiveRange] = useState("this");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const { data = [], isLoading } = useAuditLogs();
  const logs = (data as AuditLog[]).filter(isActionLog);

  const filteredLogs = useMemo(() => logs.filter(log => {
    const affected = affectedRecord(log);
    const matchesRange = date ? true : inRange(log.occurredAt, activeRange);
    const matchesDate = !date || toDateValue(log.occurredAt) === date;
    const matchesSearch = !search || [log.actor, log.actorRole, log.action, affected.name, affected.context, log.category].some(val => val.toLowerCase().includes(search.toLowerCase()));
    return matchesRange && matchesDate && matchesSearch;
  }), [logs, activeRange, search, date]);

  const clearFilters = () => {
    setActiveRange("this");
    setSearch("");
    setDate("");
  };

  const inputClass = "w-full min-h-[50px] px-4 py-2 border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] !text-[0.86rem] !font-[800] focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all";
  const labelClass = "flex flex-col gap-[7px] m-0 !text-[0.84rem] !font-[900] !text-[#344054]";
  const ghostBtn = "inline-flex items-center justify-center min-w-[110px] min-h-[50px] px-[1.25rem] rounded-lg bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.84rem] !font-[900] hover:border-[rgba(138,37,44,0.32)] hover:!text-[#8A252C] hover:shadow-[0_10px_24px_rgba(32,33,36,0.08)] transition-all cursor-pointer whitespace-nowrap max-[1180px]:w-full";

  return (
    <main className="p-[clamp(20px,3vw,36px)] min-h-[calc(100vh-64px)] content-start">
      <section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.45rem_1.55rem_0.35rem] max-[820px]:p-[1.2rem]">
        <div className="flex items-center justify-between mb-[1.3rem] flex-wrap gap-4"><div><h2 className="m-0 !text-[#111827] !text-[1.18rem] leading-[1.15] !font-[900] tracking-[-0.03em]">Audit Trail</h2><p className="m-[0.32rem_0_0] !text-[#4c5d7d] !text-[0.86rem] !font-[800] leading-[1.35]">Filter logs by week, keyword, or selected date.</p></div><span className="inline-flex items-center justify-start w-max min-h-[28px] px-[11px] py-[6px] rounded-full !text-[0.74rem] !font-[900] whitespace-nowrap bg-[#e9f8ef] !text-[#078033]">{filteredLogs.length} {date ? "selected date" : activeRange === "this" ? "this week" : "last week"}</span></div>

        <div className="grid grid-cols-[214px_minmax(360px,1.15fr)_minmax(270px,0.7fr)_110px] items-end gap-[1rem] mb-[1.35rem] max-[1180px]:grid-cols-2 max-[820px]:grid-cols-1">
          <div className="inline-flex items-center gap-[0.35rem] w-fit p-[0.25rem] border border-[#dbe3ee] rounded-full bg-white shadow-[0_8px_20px_rgba(15,23,42,0.04)] max-[1180px]:w-full max-[1180px]:justify-center" role="group" aria-label="Audit log date range"><button className={`min-h-[38px] px-[1rem] border-0 rounded-full font-inherit !text-[0.82rem] !font-[900] cursor-pointer transition-colors max-[1180px]:flex-1 ${activeRange === "this" ? "bg-[#8a252c] !text-white shadow-[0_8px_16px_rgba(138,37,44,0.12)]" : "bg-transparent !text-[#1e2f4f] hover:bg-[#f8fafc]"}`} type="button" onClick={() => setActiveRange("this")}>This week</button><button className={`min-h-[38px] px-[1rem] border-0 rounded-full font-inherit !text-[0.82rem] !font-[900] cursor-pointer transition-colors max-[1180px]:flex-1 ${activeRange === "last" ? "bg-[#8a252c] !text-white shadow-[0_8px_16px_rgba(138,37,44,0.12)]" : "bg-transparent !text-[#1e2f4f] hover:bg-[#f8fafc]"}`} type="button" onClick={() => setActiveRange("last")}>Last week</button></div>
          <label className={labelClass} htmlFor="audit-search">Search<input className={inputClass} id="audit-search" type="search" placeholder="Search actor, student, action, or record" value={search} onChange={e => setSearch(e.target.value)} /></label>
          <label className={labelClass} htmlFor="audit-date">Date<input className={inputClass} id="audit-date" type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
          <button className={ghostBtn} type="button" onClick={clearFilters}>Clear</button>
        </div>

        <div className="w-full overflow-hidden border border-[#dbe3ee] rounded-[14px] bg-white">
          <div className="grid grid-cols-[minmax(230px,1fr)_minmax(210px,0.9fr)_minmax(300px,1.15fr)_minmax(240px,0.95fr)] items-center gap-x-[1.25rem] w-full p-[1.05rem_1.25rem] bg-[#f8fafc] border-b border-[#dbe3ee] max-[1180px]:grid-cols-[minmax(180px,1fr)_minmax(160px,0.85fr)_minmax(220px,1fr)_minmax(190px,0.9fr)] max-[820px]:hidden"><span className="!text-[#0b1b3a] !text-[0.78rem] !font-[900] uppercase tracking-[0.045em] whitespace-nowrap min-w-0">Actor</span><span className="!text-[#0b1b3a] !text-[0.78rem] !font-[900] uppercase tracking-[0.045em] whitespace-nowrap min-w-0">Action</span><span className="!text-[#0b1b3a] !text-[0.78rem] !font-[900] uppercase tracking-[0.045em] whitespace-nowrap min-w-0">Affected Record</span><span className="!text-[#0b1b3a] !text-[0.78rem] !font-[900] uppercase tracking-[0.045em] whitespace-nowrap min-w-0 justify-self-start text-left">Time</span></div>
          {filteredLogs.map(log => { const affected = affectedRecord(log); return <div className="grid grid-cols-[minmax(230px,1fr)_minmax(210px,0.9fr)_minmax(300px,1.15fr)_minmax(240px,0.95fr)] items-center gap-x-[1.25rem] w-full min-h-[72px] p-[0.92rem_1.25rem] border-b border-[#e5eaf1] last:border-b-0 max-[1180px]:grid-cols-[minmax(180px,1fr)_minmax(160px,0.85fr)_minmax(220px,1fr)_minmax(190px,0.9fr)] max-[820px]:grid-cols-1 max-[820px]:gap-y-[0.45rem] max-[820px]:p-[1rem]" key={log.id}><span className="min-w-0"><strong className="block !text-[#020617] !text-[0.86rem] leading-[1.25] !font-[900]">{log.actor}</strong><small className="block mt-[0.2rem] !text-[#1e3a5f] !text-[0.72rem] !font-[800] leading-[1.2]">{formatRole(log.actorRole)}</small></span><span className="min-w-0"><strong className="block !text-[#020617] !text-[0.84rem] leading-[1.25] !font-[900]">{log.action}</strong></span><span className="min-w-0"><strong className="block !text-[#020617] !text-[0.86rem] leading-[1.25] !font-[900]">{affected.name}</strong><small className="block mt-[0.2rem] !text-[#1e3a5f] !text-[0.72rem] !font-[800] leading-[1.2]">{affected.context}</small></span><span className="min-w-0 justify-self-start text-left whitespace-nowrap max-[820px]:whitespace-normal max-[820px]:mt-[0.25rem]"><strong className="block !text-[#020617] !text-[0.84rem] leading-[1.25] !font-[900]">{formatTime(log.occurredAt)}</strong></span></div>; })}
        </div>

        {filteredLogs.length === 0 && <div className="mt-[1rem] p-[1.1rem_1.25rem] border border-dashed border-[rgba(138,37,44,0.24)] rounded-[12px] bg-[#fffaf0] !text-[#8a252c] !font-[800]">{isLoading ? "Loading audit log entries..." : "No audit log entries match this view. New admin actions will appear here after they are saved."}</div>}
      </section>
    </main>
  );
}
