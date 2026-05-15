"use client";

import React, { useMemo, useState } from "react";
import { apiClient } from "@/core/api/axios";
import { useAuthStore } from "@/core/store/authStore";

function toInputDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export function StudentReportsContent() {
  const user = useAuthStore((state) => state.user);
  const defaultDates = useMemo(() => {
    const today = new Date();
    return {
      start: toInputDate(new Date(today.getFullYear(), today.getMonth(), 1)),
      end: toInputDate(today),
    };
  }, []);
  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);
  const reportName = user?.fullName ?? "Nursing Student";
  const defaultMessage = `Generate a general report for ${reportName}.`;
  const [message, setMessage] = useState({ text: "", type: "" });

  const resetForm = () => {
    setStartDate(defaultDates.start);
    setEndDate(defaultDates.end);
    setMessage({ text: "", type: "" });
  };

  const generateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data } = await apiClient.get(`/reports/student/${user.id}`, {
        params: { startDate, endDate },
      });
      setMessage({ text: data.message ?? `General report successfully generated for ${reportName}.`, type: "is-success" });

      setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 5000);
    } catch {
      setMessage({ text: "General report could not be generated.", type: "is-error" });
    }
  };

  const inputClass = "w-full min-h-[48px] px-3 py-2 border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] !font-[500] focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all";
  const labelClass = "flex flex-col gap-[6px] m-0 !text-[0.875rem] !font-[800] !text-[#344054]";
  const ghostBtn = "inline-flex items-center justify-center min-h-[42px] px-[24px] py-[8px] rounded-[8px] bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.9rem] !font-[800] hover:border-[rgba(138,37,44,0.32)] hover:!text-[#8A252C] hover:shadow-sm transition-all cursor-pointer";
  const primaryBtn = "inline-flex items-center justify-center min-h-[42px] px-[24px] py-[8px] rounded-[8px] bg-[#8A252C] border border-[#8A252C] !text-white !text-[0.9rem] !font-[800] hover:bg-[#6b1d22] hover:border-[#6b1d22] hover:shadow-md transition-all cursor-pointer";

  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)] content-start w-full">
      <form className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem] w-full mt-0" onSubmit={generateReport} noValidate>
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#e5eaf1] pb-6">
          <h2 className="m-0 !text-[#111827] !text-[1.25rem] leading-[1.2] !font-[800]">General Report Details</h2>
          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#fff8e1] text-[#6c4c00] text-[0.75rem] font-bold shrink-0">
            Student report
          </span>
        </div>

        {/* Read-only Report About */}
        <div className="grid gap-[1rem] mb-6">
          <div className={labelClass}>
            Report About
            <div className="w-full min-h-[48px] px-3 py-3 border border-[#dbe3ee] rounded-lg bg-[#f8fafc] text-[#111827] font-bold text-[0.95rem]">
              {reportName}
            </div>
          </div>
        </div>

        {/* Date Ranges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <label className={labelClass} htmlFor="start-date">
            Start Date
            <input className={inputClass} id="start-date" name="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </label>

          <label className={labelClass} htmlFor="end-date">
            End Date
            <input className={inputClass} id="end-date" name="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
          </label>
        </div>

        {/* Checkbox Group */}
        <fieldset className="border border-[#e2e8f0] rounded-xl p-5 mb-6 bg-[#f8fafc]">
          <legend className="px-2 text-[0.9rem] font-[800] text-[#111827]">Include in report</legend>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mt-2">
            <label className="flex items-start gap-3 cursor-pointer font-semibold text-[0.95rem] text-[#334155] select-none">
              <input className="w-5 h-5 mt-0.5 cursor-pointer accent-[#8A252C]" type="checkbox" defaultChecked />
              Student profile and section details
            </label>

            <label className="flex items-start gap-3 cursor-pointer font-semibold text-[0.95rem] text-[#334155] select-none">
              <input className="w-5 h-5 mt-0.5 cursor-pointer accent-[#8A252C]" type="checkbox" defaultChecked />
              Assigned schedule details
            </label>

            <label className="flex items-start gap-3 cursor-pointer font-semibold text-[0.95rem] text-[#334155] select-none">
              <input className="w-5 h-5 mt-0.5 cursor-pointer accent-[#8A252C]" type="checkbox" defaultChecked />
              Clinical case records and validation status
            </label>

            <label className="flex items-start gap-3 cursor-pointer font-semibold text-[0.95rem] text-[#334155] select-none">
              <input className="w-5 h-5 mt-0.5 cursor-pointer accent-[#8A252C]" type="checkbox" defaultChecked />
              Progress, completion, and pending requirements
            </label>

            <label className="flex items-start gap-3 cursor-pointer font-semibold text-[0.95rem] text-[#334155] select-none">
              <input className="w-5 h-5 mt-0.5 cursor-pointer accent-[#8A252C]" type="checkbox" defaultChecked />
              Student appeal records
            </label>
          </div>
        </fieldset>

        {/* Info Box */}
        <div className={`flex items-center px-4 py-3 rounded-lg text-[0.85rem] font-bold ${message.type === 'is-error' ? 'bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]' : message.type === 'is-success' ? 'bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]' : 'bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0]'}`} role="status" aria-live="polite">
          {message.text || defaultMessage}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-[#e2e8f0]">
          <button className={`${ghostBtn} min-w-[120px]`} type="button" onClick={resetForm}>Reset</button>
          <button className={`${primaryBtn} min-w-[180px]`} type="submit">Generate Report</button>
        </div>
      </form>
    </main>
  );
}
