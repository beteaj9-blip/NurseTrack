"use client";

import React from "react";
import Link from "next/link";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAuditLogs } from "@/core/api/hooks/useAuditLogs";
import { useAuthStore } from "@/core/store/authStore";

type AuditLog = {
  id: number;
  actor: string;
  actorRole: string;
  action: string;
  recordName: string;
  context?: string;
  category?: string;
  occurredAt: string;
};

const formatRole = (role: string) => role.toLowerCase().replace(/(^|_)(\w)/g, (_, space, letter) => `${space ? " " : ""}${letter.toUpperCase()}`);
const formatTime = (value: string) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
const resourceLabels: Record<string, string> = { users: "User", schedules: "Schedule", duties: "Duty Record", cases: "Clinical Case", appeals: "Appeal", "extension-days": "Extension Day", clearances: "Clearance", notifications: "Notification", hospitals: "Hospital", "admin-access-permissions": "Access Permission", checklist: "Checklist Item", uploads: "Upload" };
const humanize = (value: string) => value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_=&]/g, " ").replace(/\s+/g, " ").trim().toLowerCase().replace(/(^|\s)(\w)/g, (_, space, letter) => `${space}${letter.toUpperCase()}`);
const affectedRecord = (log: AuditLog) => {
  if (!log.recordName?.startsWith("/api/")) return { name: log.recordName, context: log.context || log.category || "" };
  const parts = log.recordName.split("/").filter(Boolean);
  const resource = parts[1] || log.category || "record";
  const label = resourceLabels[resource] || humanize(resource);
  const id = parts.find(part => /^\d+$/.test(part));
  const actionPart = [...parts].reverse().find(part => part !== "api" && part !== resource && !/^\d+$/.test(part));
  return { name: id ? `${label} #${id}` : label, context: log.context ? humanize(log.context) : actionPart ? humanize(actionPart) : label };
};
const isActionLog = (log: AuditLog) => {
  const action = log.action.toLowerCase();
  const record = `${log.recordName} ${log.context ?? ""}`.toLowerCase();
  return action !== "logged in" && action !== "registered account" && !record.includes("/login") && !record.includes(" - login");
};

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const { data = [], isLoading } = useAuditLogs();
  const logs = (data as AuditLog[]).filter(isActionLog).slice(0, 3);
  const firstName = user?.fullName?.split(" ")[0] ?? "Admin";

  return (
    <main className="p-[clamp(24px,4vw,42px)] content-start">
      <section className="flex items-center justify-between gap-7 p-[clamp(24px,4vw,34px)] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] animate-[fadeUp_520ms_ease_both] max-[760px]:flex-col max-[760px]:items-stretch max-[760px]:gap-5">
        <div className="min-w-0"><h2 className="mb-2 !text-[clamp(1.55rem,3vw,2.15rem)] font-bold text-[#111827] break-words max-[760px]:!text-[1.65rem]">Good Evening, {firstName}.</h2><p className="max-w-[650px] mb-0 text-[#64748b] font-semibold leading-relaxed max-[760px]:max-w-none">Welcome back! Here is an overview of system setup and recent audit activity.</p></div>
        <Link href="/admin/section-import" className="inline-flex items-center justify-center min-w-[180px] h-[46px] px-6 rounded-lg bg-[#8A252C] !text-white font-bold text-[0.95rem] whitespace-nowrap shadow-[0_12px_24px_rgba(138,37,44,0.22)] hover:bg-[#6d1d23] transition-colors no-underline cursor-pointer max-[760px]:w-full max-[760px]:min-w-0">Upload Section File</Link>
      </section>

      <section className="mt-[18px] p-6 rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] animate-[fadeUp_620ms_160ms_ease_both]">
        <div className="flex justify-between items-start gap-[22px] mb-5"><h2 className="text-[1.24rem] font-bold text-[#111827] m-0">Recent System Activity</h2><span className="inline-flex items-center shrink-0 mt-0.5 px-[10px] py-[6px] rounded-full bg-[#e9f8ef] text-[#078033] text-[0.76rem] font-extrabold whitespace-nowrap">Live logs</span></div>
        <div className="grid gap-3">
          {logs.map(log => { const affected = affectedRecord(log); return <div className="grid w-full min-w-0 grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_max-content] items-center gap-4 px-[1.15rem] py-4 border border-[#e2e8f0] rounded-[0.9rem] bg-white max-[1280px]:grid-cols-1 max-[1280px]:gap-[0.45rem]" key={log.id}><div className="min-w-0"><strong className="block text-[#111827] text-[0.95rem] font-bold leading-snug break-words">{log.actor}</strong><span className="text-[#4c5d7d] text-[0.88rem] font-bold leading-snug break-words">{formatRole(log.actorRole)}</span></div><span className="min-w-0 text-[#4c5d7d] text-[0.88rem] font-bold break-words">{log.action}</span><span className="min-w-0 text-[#4c5d7d] text-[0.88rem] font-bold break-words">{affected.name}{affected.context ? ` - ${affected.context}` : ""}</span><small className="min-w-0 text-[#64748b] text-[0.8rem] font-bold whitespace-nowrap max-[1280px]:whitespace-normal">{formatTime(log.occurredAt)}</small></div>; })}
        </div>
        {logs.length === 0 && (isLoading ? <LoadingState message="Loading recent audit activity..." className="rounded-lg border border-dashed border-[#dbe3ee]" /> : <div className="p-5 border border-dashed border-[#dbe3ee] rounded-lg !text-[#4c5d7d] !font-bold">No audit activity yet. New admin actions will appear here.</div>)}
        <div className="flex justify-end mt-4"><Link href="/admin/audit-logs" className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-lg border border-[#e2e8f0] bg-white text-[#334155] text-sm font-bold hover:bg-[#f8fafc] transition-colors no-underline cursor-pointer">Open Audit Logs</Link></div>
      </section>
    </main>
  );
}
