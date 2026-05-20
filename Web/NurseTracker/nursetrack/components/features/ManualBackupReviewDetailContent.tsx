"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/core/api/axios";
import { useAllAttendance } from "@/core/api/hooks/useAttendance";
import { useAuthStore } from "@/core/store/authStore";
import { LoadingState } from "@/components/ui/LoadingState";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { useToast } from "@/components/ui/ToastProvider";
import { useCanEditFeature } from "@/core/auth/permissions";

function formatDate(value?: string) {
  if (!value) return "Not dated";
  const datePart = value.includes("T") ? value.split("T")[0] : value;
  return new Date(`${datePart}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatEncodedDate(value?: string) {
  if (!value) return "Encoded date unavailable";
  return `Encoded ${new Date(value).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}`;
}

function statusLabel(status?: string) {
  if (status === "VERIFIED" || status === "VALIDATED") return "Approved";
  if (status === "REJECTED") return "Returned";
  return "Pending Review";
}

function statusClass(status?: string) {
  if (status === "VERIFIED" || status === "VALIDATED") return "bg-[#e9f8ef] !text-[#03703c]";
  if (status === "REJECTED") return "bg-[#fef2f2] !text-[#991b1b]";
  return "bg-[#fff3c4] !text-[#6c4c00]";
}

function reviewStatusText(status?: string) {
  if (status === "VERIFIED" || status === "VALIDATED") return "Approved by Chair or Admin.";
  if (status === "REJECTED") return "Returned for correction.";
  return "Awaiting Chair or Admin review.";
}

function timeRange(record: any) {
  return [record.timeInLabel, record.timeOutLabel].filter(Boolean).join(" - ") || "Time not provided";
}

function locationLine(record: any) {
  return [record.hospital, record.area].filter(Boolean).join(" - ") || "Clinical site not provided";
}

export function ManualBackupReviewDetailContent({ basePath = "/chair" }: { basePath?: string; searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const user = useAuthStore((state) => state.user);
  const { canEdit } = useCanEditFeature("manualBackup");
  const recordId = searchParams.get("id");
  const { data: attendance = [], isLoading } = useAllAttendance(true, (basePath === "/chair" || basePath === "/coordinator") && user?.id != null ? String(user.id) : undefined);
  const record = (attendance as any[]).find((entry) => String(entry.id) === String(recordId));
  const [isSaving, setIsSaving] = React.useState(false);
  const isApproved = record?.status === "VERIFIED" || record?.status === "VALIDATED";

  const submitDecision = async (status: "VERIFIED" | "REJECTED") => {
    if (!canEdit) {
      showToast({ variant: "error", title: "Action unavailable", message: "Manual backup review is not enabled for your role." });
      return;
    }
    if (!recordId) return;
    try {
      setIsSaving(true);
      await apiClient.put(`/duties/${recordId}/validate`, null, { params: { status } });
      await queryClient.invalidateQueries({ queryKey: ["attendance"] });
      showToast({ variant: "success", title: status === "VERIFIED" ? "Record approved" : "Record returned", message: "Manual attendance review was saved." });
    } catch {
      showToast({ variant: "error", title: "Review failed", message: "Manual attendance review could not be saved." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]"><LoadingState message="Loading manual attendance..." className="rounded-xl border border-[#e2e8f0] bg-white shadow-[0_14px_34px_rgba(15,23,42,0.06)]" /></main>;
  }

  if (!record) {
    return <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]"><section className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-6 !text-[#64748b] !font-bold">Manual attendance record not found.</section></main>;
  }

  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)] grid gap-[28px] content-start">
      <section className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-[1.6rem_1.75rem_1.75rem]">
        <h2 className="m-0 mb-[1.15rem] !text-[#111827] !text-[1.24rem] !font-[850] tracking-[-0.03em]">{formatDate(record.dutyDate)} Attendance</h2>
        <div className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-[20px] border border-[#dbe3ee] rounded-lg bg-[#f8fafc] p-[14px] max-[720px]:grid-cols-[44px_minmax(0,1fr)]">
          <ProfileAvatar name={record.instructorName} imageUrl={record.instructorProfileImageUrl} size={42} />
          <span className="min-w-0"><strong className="block !text-[#111827] !text-[1rem] !font-[850] leading-[1.25]">{locationLine(record)}</strong><small className="block mt-[0.35rem] !text-[#64748b] !text-[0.86rem] !font-[800]">{formatEncodedDate(record.createdAt)}</small></span>
          <span className={`inline-flex items-center justify-center w-max min-h-[28px] px-[12px] py-[6px] rounded-full !text-[0.76rem] !font-[900] whitespace-nowrap ${statusClass(record.status)} max-[720px]:col-start-2`}>{statusLabel(record.status)}</span>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-[1.6rem_1.75rem_1.75rem]">
        <h2 className="m-0 mb-[1.15rem] !text-[#111827] !text-[1.24rem] !font-[850] tracking-[-0.03em]">Record Details</h2>
        <div className="grid grid-cols-2 gap-[1rem] max-[860px]:grid-cols-1">
          <Info label="Duty Date" value={formatDate(record.dutyDate)} />
          <Info label="Shift Time" value={timeRange(record)} />
          <Info label="Encoded By" value={record.instructorName || "Clinical Instructor"} />
          <Info label="Review Status" value={reviewStatusText(record.status)} />
          <div className="col-span-full rounded-lg border border-[#dbe3ee] bg-[#f8fafc] p-[1rem_1.15rem] min-h-[96px]"><small className="block mb-[0.55rem] !text-[#64748b] !text-[0.75rem] !font-[900] uppercase">Instructor Note</small><strong className="block !text-[#111827] !text-[0.92rem] !font-[800] leading-[1.5]">{record.instructorFeedback || "No instructor note provided."}</strong></div>
        </div>

        <div className="mt-[2.5rem] border border-[#dbe3ee] rounded-lg overflow-hidden bg-white">
          <div className="grid grid-cols-[minmax(240px,1.4fr)_minmax(180px,1fr)_minmax(120px,0.65fr)_minmax(120px,0.65fr)_minmax(120px,0.65fr)] gap-[1rem] items-center p-[1rem_1.25rem] bg-[#f8fafc] border-b border-[#e2e8f0] !text-[#111827] !text-[0.84rem] !font-[900] uppercase max-[900px]:hidden"><span>Student</span><span>Section / ID</span><span>Status</span><span>Check-In</span><span>Check-Out</span></div>
          <div className="grid grid-cols-[minmax(240px,1.4fr)_minmax(180px,1fr)_minmax(120px,0.65fr)_minmax(120px,0.65fr)_minmax(120px,0.65fr)] gap-[1rem] items-center p-[1rem_1.25rem] border-b border-[#e2e8f0] last:border-b-0 max-[900px]:grid-cols-1">
            <span className="flex items-center gap-[12px]"><ProfileAvatar name={record.studentName} imageUrl={record.studentProfileImageUrl} size={42} /><strong className="!text-[#111827] !text-[0.95rem] !font-[850]">{record.studentName || "Nursing Student"}</strong></span>
            <span className="!text-[#111827] !text-[0.9rem] !font-[500]">{record.studentSection || "Nursing Student"} - {record.studentSchoolId || "No ID"}</span>
            <span className="!text-[#111827] !text-[0.9rem] !font-[500]">Present</span>
            <span className="!text-[#111827] !text-[0.9rem] !font-[500]">{record.timeInLabel || "Not provided"}</span>
            <span className="!text-[#111827] !text-[0.9rem] !font-[500]">{record.timeOutLabel || "Not provided"}</span>
          </div>
        </div>

        <div className="flex justify-end gap-[0.75rem] mt-[2.2rem] flex-wrap">
          {isApproved ? <button className="inline-flex items-center justify-center min-h-[48px] px-[1.25rem] rounded-[8px] bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.84rem] !font-[900] hover:border-[rgba(138,37,44,0.32)] transition-all cursor-pointer disabled:opacity-60" type="button" disabled={!canEdit || isSaving} onClick={() => submitDecision("REJECTED")}>Return Record</button> : <button className="inline-flex items-center justify-center min-h-[48px] px-[1.75rem] rounded-[8px] bg-[#9f2731] border border-[#9f2731] !text-white !text-[0.95rem] !font-[900] shadow-[0_12px_22px_rgba(138,37,44,0.25)] hover:bg-[#7b1f27] transition-all cursor-pointer disabled:opacity-60" type="button" disabled={!canEdit || isSaving} onClick={() => submitDecision("VERIFIED")}>Approve Record</button>}
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return <div className="rounded-lg border border-[#dbe3ee] bg-[#f8fafc] p-[1rem_1.15rem] min-h-[78px]"><small className="block mb-[0.55rem] !text-[#64748b] !text-[0.75rem] !font-[900] uppercase">{label}</small><strong className="block !text-[#111827] !text-[0.92rem] !font-[850] leading-[1.45]">{value || "Not provided"}</strong></div>;
}
