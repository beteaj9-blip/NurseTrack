"use client";

import React, { useMemo, useState } from "react";
import { apiClient } from "@/core/api/axios";
import { useAuthStore } from "@/core/store/authStore";
import { useToast } from "@/components/ui/ToastProvider";

function toInputDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export function StudentReportsContent() {
  const { showToast } = useToast();
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
  const [includeProfile, setIncludeProfile] = useState(true);
  const [includeSchedules, setIncludeSchedules] = useState(true);
  const [includeCases, setIncludeCases] = useState(true);
  const [includeProgress, setIncludeProgress] = useState(true);
  const [includeAppeals, setIncludeAppeals] = useState(true);
  const [report, setReport] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const reportName = user?.fullName ?? "Nursing Student";
  const defaultMessage = `Generate a general report for ${reportName}.`;
  const [message, setMessage] = useState({ text: "", type: "" });

  const resetForm = () => {
    setStartDate(defaultDates.start);
    setEndDate(defaultDates.end);
    setIncludeProfile(true);
    setIncludeSchedules(true);
    setIncludeCases(true);
    setIncludeProgress(true);
    setIncludeAppeals(true);
    setReport(null);
    setMessage({ text: "", type: "" });
  };

  const generateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsGenerating(true);
      const { data } = await apiClient.get(`/reports/student/${user.id}`, {
        params: { startDate, endDate, includeProfile, includeSchedules, includeCases, includeProgress, includeAppeals },
      });
      setReport(data);
      setMessage({ text: data.message ?? `General report successfully generated for ${reportName}.`, type: "is-success" });
      showToast({ variant: "success", title: "Report generated", message: data.message ?? `General report successfully generated for ${reportName}.` });

      setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 5000);
    } catch {
      setMessage({ text: "General report could not be generated.", type: "is-error" });
      showToast({ variant: "error", title: "Report failed", message: "General report could not be generated." });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = async () => {
    if (!user) return;
    try {
      setIsGenerating(true);
      const { data } = await apiClient.get(`/reports/student/${user.id}/export`, {
        params: { startDate, endDate, includeProfile, includeSchedules, includeCases, includeProgress, includeAppeals },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `student-report-${user.id}.txt`;
      link.click();
      window.URL.revokeObjectURL(url);
      showToast({ variant: "success", title: "Report downloaded", message: "The report file was downloaded." });
    } catch {
      showToast({ variant: "error", title: "Download failed", message: "Report file could not be downloaded." });
    } finally {
      setIsGenerating(false);
    }
  };

  const inputClass = "w-full min-h-[48px] px-3 py-2 border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] !font-[500] focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all";
  const labelClass = "flex flex-col gap-[6px] m-0 !text-[0.875rem] !font-[800] !text-[#344054]";
  const ghostBtn = "inline-flex items-center justify-center min-h-[42px] px-[24px] py-[8px] rounded-[8px] bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.9rem] !font-[800] hover:border-[rgba(138,37,44,0.32)] hover:!text-[#8A252C] hover:shadow-sm transition-all cursor-pointer";
  const primaryBtn = "inline-flex items-center justify-center min-h-[42px] px-[24px] py-[8px] rounded-[8px] bg-[#8A252C] border border-[#8A252C] !text-white !text-[0.9rem] !font-[800] hover:bg-[#6b1d22] hover:border-[#6b1d22] hover:shadow-md transition-all cursor-pointer";
  const summaryItems = report ? [
    includeSchedules ? { label: "Assigned schedules", value: report.scheduleCount ?? 0 } : null,
    includeCases ? { label: "Clinical cases", value: report.caseCount ?? 0 } : null,
    includeCases ? { label: "Approved cases", value: report.approvedCaseCount ?? 0 } : null,
    includeProgress ? { label: "Duty records", value: report.dutyRecordCount ?? 0 } : null,
    includeAppeals ? { label: "Appeals", value: report.appealCount ?? 0 } : null,
  ].filter(Boolean) : [];

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
              <input className="w-5 h-5 mt-0.5 cursor-pointer accent-[#8A252C]" type="checkbox" checked={includeProfile} onChange={(e) => setIncludeProfile(e.target.checked)} />
              Student profile and section details
            </label>

            <label className="flex items-start gap-3 cursor-pointer font-semibold text-[0.95rem] text-[#334155] select-none">
              <input className="w-5 h-5 mt-0.5 cursor-pointer accent-[#8A252C]" type="checkbox" checked={includeSchedules} onChange={(e) => setIncludeSchedules(e.target.checked)} />
              Assigned schedule details
            </label>

            <label className="flex items-start gap-3 cursor-pointer font-semibold text-[0.95rem] text-[#334155] select-none">
              <input className="w-5 h-5 mt-0.5 cursor-pointer accent-[#8A252C]" type="checkbox" checked={includeCases} onChange={(e) => setIncludeCases(e.target.checked)} />
              Clinical case records and validation status
            </label>

            <label className="flex items-start gap-3 cursor-pointer font-semibold text-[0.95rem] text-[#334155] select-none">
              <input className="w-5 h-5 mt-0.5 cursor-pointer accent-[#8A252C]" type="checkbox" checked={includeProgress} onChange={(e) => setIncludeProgress(e.target.checked)} />
              Progress, completion, and pending requirements
            </label>

            <label className="flex items-start gap-3 cursor-pointer font-semibold text-[0.95rem] text-[#334155] select-none">
              <input className="w-5 h-5 mt-0.5 cursor-pointer accent-[#8A252C]" type="checkbox" checked={includeAppeals} onChange={(e) => setIncludeAppeals(e.target.checked)} />
              Student appeal records
            </label>
          </div>
        </fieldset>

        {/* Info Box */}
        <div className={`flex items-center px-4 py-3 rounded-lg text-[0.85rem] font-bold ${message.type === 'is-error' ? 'bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]' : message.type === 'is-success' ? 'bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]' : 'bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0]'}`} role="status" aria-live="polite">
          {message.text || defaultMessage}
        </div>

        {summaryItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
            {summaryItems.map((item: any) => (
              <div key={item.label} className="border border-[#e2e8f0] rounded-lg bg-[#f8fafc] p-4">
                <span className="block mb-1 text-[#64748b] text-[0.72rem] font-[900] uppercase">{item.label}</span>
                <strong className="text-[#111827] text-[1.35rem] font-[900]">{item.value}</strong>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-[#e2e8f0]">
          <button className={`${ghostBtn} min-w-[120px] disabled:opacity-60 disabled:cursor-not-allowed`} type="button" onClick={resetForm} disabled={isGenerating}>Reset</button>
          <button className={`${ghostBtn} min-w-[170px] disabled:opacity-60 disabled:cursor-not-allowed`} type="button" onClick={downloadReport} disabled={isGenerating}>{isGenerating ? "Preparing..." : "Download Report"}</button>
          <button className={`${primaryBtn} min-w-[180px] disabled:opacity-70 disabled:cursor-not-allowed`} type="submit" disabled={isGenerating}>{isGenerating ? "Generating..." : "Generate Report"}</button>
        </div>
      </form>
    </main>
  );
}
