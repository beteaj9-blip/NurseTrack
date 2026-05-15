"use client";
import React, { useState } from "react";
import { useAuthStore } from "@/core/store/authStore";
import { useAttendance } from "@/core/api/hooks/useAttendance";

const statusStyle: Record<string, string> = {
  COMPLETED:  "bg-[#e9f8ef] !text-[#03703c]",
  VALIDATED:  "bg-[#e9f8ef] !text-[#03703c]",
  PENDING:    "bg-[#fff8e1] !text-[#6c4c00]",
  ABSENT:     "bg-[#fef2f2] !text-[#991b1b]",
  LATE:       "bg-[#fef2f2] !text-[#991b1b]",
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function formatTime(timeStr?: string) {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function StudentProgressContent({ basePath }: { basePath: string }) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id != null ? String(user.id) : undefined;
  const { data: records, isLoading } = useAttendance(userId);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 10;

  const filtered = (records ?? []).filter((r: any) => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      r.area?.toLowerCase().includes(q) ||
      r.hospital?.toLowerCase().includes(q) ||
      r.dutyDate?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const btnCls = "inline-flex items-center justify-center min-h-[32px] px-[1rem] py-[0.5rem] rounded-[8px] bg-transparent !text-[#334155] !text-[0.875rem] font-bold hover:bg-[#e2e8f0] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const inputCls = "w-full min-h-[48px] px-3 py-2 border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all";
  const labelCls = "flex flex-col gap-1.5 m-0 p-[0.1rem] !text-sm !font-bold !text-[#344054]";

  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]">
      <section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem]">
        <div className="flex items-center justify-between gap-4 mb-[1.1rem] pb-3 border-b border-[#e5eaf1] flex-wrap">
          <div>
            <h2 className="m-0 !text-[#111827] !text-[1.15rem] !font-bold tracking-[-0.03em]">My Duty Progress</h2>
            <p className="m-0 mt-1 !text-[0.82rem] !text-[#64748b] font-semibold">{user?.sectionInfo || "—"} · {user?.fullName}</p>
          </div>
          <div className="flex items-center gap-[0.75rem] flex-wrap">
            <button className="inline-flex items-center justify-center w-auto min-h-[38px] px-[1rem] rounded-[8px] bg-transparent !text-[#334155] !text-[0.95rem] !font-extrabold hover:bg-[#f1f5f9] transition-colors cursor-pointer" type="button" onClick={() => window.print()}>Print</button>
            <span className="inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold bg-[#e9f8ef] !text-[#03703c]">{filtered.length} records</span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid gap-[1rem] mb-[1rem] grid-cols-2 max-[720px]:grid-cols-1">
          <label className={labelCls} htmlFor="sp-search">
            Search
            <input className={inputCls} id="sp-search" type="search" placeholder="Search area or hospital…" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
          </label>
          <label className={labelCls} htmlFor="sp-status">
            Status
            <select className={`${inputCls} cursor-pointer`} id="sp-status" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
              <option value="all">All statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="VALIDATED">Validated</option>
              <option value="PENDING">Pending</option>
              <option value="ABSENT">Absent</option>
              <option value="LATE">Late</option>
            </select>
          </label>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[160px] text-[#64748b] font-bold">Loading records…</div>
        ) : paged.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[160px] p-6 border-2 border-dashed border-[#dbe3ee] rounded-xl bg-[#f8fafc] text-[#475569] font-medium text-center">
            {records?.length === 0 ? "No duty records found. Records will appear here once assigned." : "No records match the current filter."}
          </div>
        ) : (
          <div className={`flex flex-col border border-[#e2e8f0] overflow-hidden bg-white rounded-t-lg ${totalPages > 1 ? '' : 'rounded-b-lg'}`}>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_1fr] bg-[#f8fafc] border-b border-[#e2e8f0] px-[1.5rem] py-[0.75rem]">
              {["Hospital / Area", "Duty Date", "Time In", "Time Out", "Status"].map(h => (
                <span key={h} className="!text-[#475467] !text-[0.72rem] !font-[800] uppercase tracking-wider">{h}</span>
              ))}
            </div>
            {paged.map((r: any, i: number) => {
              const badgeCls = statusStyle[r.status] ?? "bg-[#f1f5f9] !text-[#475569]";
              return (
                <div key={r.id ?? i} className="grid md:grid-cols-[2fr_2fr_1fr_1fr_1fr] items-center gap-2 px-[1.5rem] py-[1rem] border-b border-[#e2e8f0] last:border-b-0 hover:bg-[#f8fafc] transition-colors">
                  <div>
                    <strong className="block !text-[#111827] !text-[0.95rem] !font-[850] leading-[1.25]">{r.hospital ?? "—"}</strong>
                    <small className="!text-[#64748b] !text-[0.82rem] !font-[700]">{r.area ?? "—"}</small>
                  </div>
                  <span className="!text-[#475569] !text-[0.9rem] font-semibold">{formatDate(r.dutyDate)}</span>
                  <span className="!text-[#475569] !text-[0.9rem] font-semibold">{formatTime(r.timeIn)}</span>
                  <span className="!text-[#475569] !text-[0.9rem] font-semibold">{formatTime(r.timeOut)}</span>
                  <mark className={`inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap ${badgeCls}`}>
                    {r.status}
                  </mark>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-between items-center p-[1rem_1.5rem] border border-[#e2e8f0] border-t-0 rounded-b-[0.5rem] bg-[#f8fafc]">
            <button className={btnCls} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
            <span className="!text-[0.875rem] !font-[600] !text-[#64748b]">Page {currentPage} of {totalPages}</span>
            <button className={btnCls} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
          </div>
        )}
      </section>
    </main>
  );
}
