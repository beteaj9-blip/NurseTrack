"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { useAllAttendance } from "@/core/api/hooks/useAttendance";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";

export function ManualBackupReviewDetailContent(_: { basePath?: string; searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = useSearchParams();
  const recordId = searchParams.get("id");
  const { data: attendance = [], isLoading } = useAllAttendance();
  const record = (attendance as any[]).find((entry) => String(entry.id) === String(recordId));
  return <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]"><section className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-6"><h2 className="m-0 mb-5 !text-[#111827] !text-[1.24rem] !font-bold">Manual Attendance Detail</h2>{isLoading ? <p className="!text-[#64748b] !font-bold">Loading manual attendance...</p> : record ? <div className="grid gap-4"><div className="flex items-center gap-4 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4"><ProfileAvatar name={record.studentName} imageUrl={record.studentProfileImageUrl} size={52} /><div><strong className="block !text-[#111827] !font-[900]">{record.studentName}</strong><span className="block !text-[#64748b] !font-[700]">{record.studentSection} - {record.studentSchoolId}</span></div></div><div className="grid grid-cols-1 md:grid-cols-3 gap-3"><Info label="Duty Date" value={record.dutyDate} /><Info label="Hospital" value={record.hospital} /><Info label="Duty Area" value={record.area} /><Info label="Time In" value={record.timeInLabel} /><Info label="Time Out" value={record.timeOutLabel} /><Info label="Status" value={record.status} /></div><div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4"><small className="block mb-1 !text-[#64748b] !font-[900] uppercase">Instructor Note</small><strong>{record.instructorFeedback || "No note provided."}</strong></div></div> : <p className="!text-[#64748b] !font-bold">Manual attendance record not found.</p>}</section></main>;
}

function Info({ label, value }: { label: string; value?: string }) {
  return <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4"><small className="block mb-1 !text-[#64748b] !font-[900] uppercase">{label}</small><strong>{value || "Not provided"}</strong></div>;
}
