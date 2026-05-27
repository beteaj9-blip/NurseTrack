"use client";
import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAllAttendance, useInstructorAttendance } from "@/core/api/hooks/useAttendance";
import { useAuthStore } from "@/core/store/authStore";
import { LoadingState } from "@/components/ui/LoadingState";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";

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

function formatAttendanceDate(value?: string) {
  if (!value) return "Manual Attendance";
  const datePart = value.includes("T") ? value.split("T")[0] : value;
  return `${new Date(`${datePart}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} Attendance`;
}

function formatEncodedDate(value?: string) {
  if (!value) return "Encoded date unavailable";
  return `Encoded ${new Date(value).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}`;
}

function timeRange(record: any) {
  return [record.timeInLabel, record.timeOutLabel].filter(Boolean).join(" - ") || "Time not provided";
}

function locationLine(record: any) {
  return [record.hospital, record.area].filter(Boolean).join(" - ") || "Clinical site not provided";
}

function ManualRecordRow({ record, basePath }: { record: any; basePath: string }) {
  return (
    <Link href={`${basePath}/manual-backup/review/detail?id=${record.id}`} className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-[20px] p-[1rem_1.5rem] border-b border-[#e2e8f0] bg-white last:border-b-0 no-underline text-inherit hover:bg-[#f8fafc] transition-colors max-[720px]:grid-cols-[44px_minmax(0,1fr)] max-[720px]:gap-[12px]">
      <ProfileAvatar name={record.instructorName} imageUrl={record.instructorProfileImageUrl} size={40} />
      <span className="min-w-0">
        <strong className="block !text-[#111827] !text-[1rem] !font-[850] leading-[1.25]">{formatAttendanceDate(record.dutyDate)}</strong>
        <small className="block mt-[0.35rem] !text-[#53627c] !text-[0.86rem] !font-[800] leading-[1.35]">{locationLine(record)} - {timeRange(record)}</small>
        <small className="block mt-[0.35rem] !text-[#53627c] !text-[0.86rem] !font-[800] leading-[1.35]">{formatEncodedDate(record.createdAt)}</small>
      </span>
      <span className={`inline-flex items-center justify-center w-max min-h-[28px] px-[12px] py-[6px] rounded-full !text-[0.76rem] !font-[900] whitespace-nowrap ${statusClass(record.status)} max-[720px]:col-start-2`}>{statusLabel(record.status)}</span>
    </Link>
  );
}

export function ManualBackupReviewContent({ basePath }: { basePath: string }) {
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const instructorId = searchParams.get("instructorId");
  const scopedInstructorId = basePath === "/clinical-instructor" ? (user?.id != null ? String(user.id) : undefined) : undefined;
  const scopedViewerId = (basePath === "/chair" || basePath === "/assistant") && user?.id != null ? String(user.id) : undefined;
  const { data: allAttendance = [], isLoading: isAllLoading } = useAllAttendance(true, scopedViewerId);
  const { data: instructorAttendance = [], isLoading: isInstructorLoading } = useInstructorAttendance(scopedInstructorId);
  const attendance = scopedInstructorId ? instructorAttendance : allAttendance;
  const isLoading = scopedInstructorId ? isInstructorLoading : isAllLoading;
  const records = (attendance as any[]).filter((record) => record.instructorFeedback && (!instructorId || String(record.instructorId) === String(instructorId)));
  const pendingRecords = records.filter((record) => record.status === "PENDING");
  const completedRecords = records.filter((record) => record.status !== "PENDING");
  const firstRecord = records[0];
  const instructorName = firstRecord?.instructorName || "Clinical Instructor";
  const pendingCount = pendingRecords.length;

  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)] grid gap-[28px] content-start">
      <section className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-[1.6rem_1.75rem_1.75rem]">
        <h2 className="m-0 mb-[1.15rem] !text-[#111827] !text-[1.24rem] !font-[850] tracking-[-0.03em]">Manual Attendance</h2>
        <div className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-[12px] border border-[#dbe3ee] rounded-lg bg-[#f8fafc] p-[14px]">
          <ProfileAvatar name={instructorName} imageUrl={firstRecord?.instructorProfileImageUrl} size={42} />
          <span className="min-w-0"><strong className="block !text-[#111827] !text-[1rem] !font-[850] leading-[1.25]">{instructorName}</strong><small className="block mt-[0.35rem] !text-[#64748b] !text-[0.86rem] !font-[800]">{records.length} encoded attendance records - {pendingCount} pending</small></span>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-[1.6rem_1.75rem_1.75rem]">
        <div className="flex items-center justify-between gap-[1rem] mb-[1.5rem] flex-wrap"><h2 className="m-0 !text-[#111827] !text-[1.24rem] !font-[850] tracking-[-0.03em]">Records Awaiting Review</h2><span className="inline-flex items-center w-max min-h-[28px] px-[12px] py-[6px] rounded-full bg-[#fff3c4] !text-[#6c4c00] !text-[0.76rem] !font-[900]">{pendingCount} pending</span></div>
        <div className="border border-[#dbe3ee] rounded-lg overflow-hidden bg-white">
          {pendingRecords.map((record) => <ManualRecordRow key={record.id} record={record} basePath={basePath} />)}
          {pendingRecords.length === 0 && (isLoading ? <LoadingState message="Loading manual attendance records..." /> : <div className="p-[1.25rem] !text-[#64748b] !font-[800] text-center">No records awaiting review.</div>)}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-[1.6rem_1.75rem_1.75rem]">
        <div className="flex items-center justify-between gap-[1rem] mb-[1.5rem] flex-wrap"><h2 className="m-0 !text-[#111827] !text-[1.24rem] !font-[850] tracking-[-0.03em]">Manual Attendance Records</h2><span className="inline-flex items-center w-max min-h-[28px] px-[12px] py-[6px] rounded-full bg-[#e9f8ef] !text-[#03703c] !text-[0.76rem] !font-[900]">{completedRecords.length} record(s)</span></div>
        <div className="border border-[#dbe3ee] rounded-lg overflow-hidden bg-white">
          {completedRecords.map((record) => <ManualRecordRow key={record.id} record={record} basePath={basePath} />)}
          {completedRecords.length === 0 && (isLoading ? <LoadingState message="Loading manual attendance records..." /> : <div className="p-[1.25rem] !text-[#64748b] !font-[800] text-center">No completed manual attendance records.</div>)}
        </div>
      </section>
    </main>
  );
}
