"use client";
import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAllAttendance, useInstructorAttendance } from "@/core/api/hooks/useAttendance";
import { useAuthStore } from "@/core/store/authStore";

function statusLabel(status?: string) {
  if (status === "VERIFIED") return "Approved";
  if (status === "REJECTED") return "Returned";
  return "Pending Review";
}

export function ManualBackupReviewContent({ basePath }: { basePath: string }) {
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const instructorId = searchParams.get("instructorId");
  const scopedInstructorId = basePath === "/clinical-instructor" ? (user?.id != null ? String(user.id) : undefined) : undefined;
  const { data: allAttendance = [], isLoading: isAllLoading } = useAllAttendance();
  const { data: instructorAttendance = [], isLoading: isInstructorLoading } = useInstructorAttendance(scopedInstructorId);
  const attendance = scopedInstructorId ? instructorAttendance : allAttendance;
  const isLoading = scopedInstructorId ? isInstructorLoading : isAllLoading;
  const records = (attendance as any[]).filter((record) => record.instructorFeedback && (!instructorId || String(record.instructorId) === String(instructorId)));
  return <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]"><section className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-6"><h2 className="m-0 mb-5 !text-[#111827] !text-[1.24rem] !font-bold">Manual Attendance Review</h2><div className="grid gap-3">{records.map((record) => <Link key={record.id} href={`${basePath}/manual-backup/review/detail?id=${record.id}`} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 rounded-lg border border-[#e2e8f0] bg-white p-4 no-underline text-inherit hover:bg-[#f8fafc]"><strong>{record.studentName}</strong><span>{record.dutyDate} - {record.area}</span><span>{statusLabel(record.status)}</span></Link>)}</div>{records.length === 0 && <p className="!text-[#64748b] !font-bold">{isLoading ? "Loading manual attendance records..." : "No manual attendance records found."}</p>}</section></main>;
}
