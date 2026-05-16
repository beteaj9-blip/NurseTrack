"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { useStudentClearance } from "@/core/api/hooks/useClearance";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";

function label(status?: string) {
  if (status === "APPROVED") return "Approved";
  if (status === "IN_REVIEW") return "Submitted";
  return "Not submitted";
}

export function ClearanceDetailContent(_: { basePath?: string; searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId") ?? undefined;
  const { data: clearance, isLoading } = useStudentClearance(studentId);
  return <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]"><section className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-6"><h2 className="m-0 mb-5 !text-[#111827] !text-[1.24rem] !font-bold">Clearance Detail</h2>{isLoading ? <p className="!text-[#64748b] !font-bold">Loading clearance...</p> : clearance ? <div className="grid gap-4"><div className="flex items-center gap-4 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4"><ProfileAvatar name={clearance.studentName} imageUrl={clearance.studentProfileImageUrl} size={52} /><div><strong className="block !text-[#111827] !font-[900]">{clearance.studentName}</strong><span className="block !text-[#64748b] !font-[700]">{clearance.studentSection} - {clearance.studentSchoolId}</span></div></div><div className="grid grid-cols-1 md:grid-cols-3 gap-3"><Info label="Status" value={label(clearance.status)} /><Info label="School Year" value={clearance.schoolYear} /><Info label="Semester" value={clearance.semester} /></div></div> : <p className="!text-[#64748b] !font-bold">Clearance record not found.</p>}</section></main>;
}

function Info({ label, value }: { label: string; value?: string }) {
  return <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4"><small className="block mb-1 !text-[#64748b] !font-[900] uppercase">{label}</small><strong className="!text-[#111827] !font-[900]">{value || "Not provided"}</strong></div>;
}
