"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { useAllAttendance } from "@/core/api/hooks/useAttendance";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";

export function OvertimeDetailsDetailContent(_: { basePath?: string; searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = useSearchParams();
  const personId = searchParams.get("id");
  const { data: attendance = [], isLoading } = useAllAttendance();
  const records = (attendance as any[]).filter((record) => String(record.studentId) === String(personId) && Math.max(Number(record.hours || 0) - 8, 0) > 0);
  const first = records[0];
  const total = records.reduce((sum, record) => sum + Math.max(Number(record.hours || 0) - 8, 0), 0);
  return <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]"><section className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-6"><h2 className="m-0 mb-5 !text-[#111827] !text-[1.24rem] !font-bold">Overtime Detail</h2>{isLoading ? <p className="!text-[#64748b] !font-bold">Loading overtime records...</p> : first ? <div className="grid gap-4"><div className="flex items-center gap-4 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4"><ProfileAvatar name={first.studentName} imageUrl={first.studentProfileImageUrl} size={52} /><div><strong className="block !text-[#111827] !font-[900]">{first.studentName}</strong><span className="block !text-[#64748b] !font-[700]">{first.studentSection} - {first.studentSchoolId}</span></div><span className="ml-auto inline-flex rounded-full bg-[#fff8e1] px-3 py-1 !text-[#6c4c00] !font-[900]">{total.toFixed(1)} overtime hrs</span></div>{records.map((record) => <div key={record.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-lg border border-[#e2e8f0] bg-white p-4"><strong>{record.dutyDate}</strong><span>{record.hospital}</span><span>{record.area}</span><span>{Math.max(Number(record.hours || 0) - 8, 0).toFixed(1)} hrs</span></div>)}</div> : <p className="!text-[#64748b] !font-bold">No overtime records found.</p>}</section></main>;
}
