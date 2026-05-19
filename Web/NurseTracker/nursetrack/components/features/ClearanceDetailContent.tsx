"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useUpdateClearanceStatus, useClearances } from "@/core/api/hooks/useClearance";
import { useAllClinicalCases } from "@/core/api/hooks/useClinicalCases";
import { useAuthStore } from "@/core/store/authStore";
import { LoadingState } from "@/components/ui/LoadingState";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { useToast } from "@/components/ui/ToastProvider";

function statusLabel(status?: string) {
  if (status === "CLEARED" || status === "APPROVED") return "Approved";
  if (status === "IN_REVIEW") return "Submitted";
  return "Not submitted";
}

function statusClass(status?: string) {
  if (status === "CLEARED" || status === "APPROVED") return "bg-[#e9f8ef] !text-[#03703c]";
  if (status === "IN_REVIEW") return "bg-[#fff8e1] !text-[#6c4c00]";
  return "bg-[#fef2f2] !text-[#991b1b]";
}

function caseStatusClass(status?: string) {
  if (status === "APPROVED") return "bg-[#e9f8ef] !text-[#03703c]";
  if (status === "RETURNED") return "bg-[#fef2f2] !text-[#991b1b]";
  return "bg-[#fff8e1] !text-[#6c4c00]";
}

function caseStatusLabel(status?: string) {
  if (status === "APPROVED") return "Approved";
  if (status === "RETURNED") return "Returned";
  return "Pending";
}

function formatDate(date?: string) {
  if (!date) return "Not set";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(dateTime?: string, fallback?: string) {
  if (dateTime) return new Date(dateTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (fallback) return fallback.split("-")[0]?.trim() || fallback;
  return "Not set";
}

function caseCategoryLabel(category?: string) {
  if (category === "Major Cases - Assist") return "Major Case - Assist";
  if (category === "Major Cases - Scrub") return "Major Case - Scrub";
  if (category === "Major Cases - Circulating") return "Major Case - Circulate";
  if (category === "Handled Cases") return "Handled Case";
  return category ?? "Clinical Case";
}

function isDeliveryRoomCase(clinicalCase: any) {
  return clinicalCase.caseType === "DELIVERY_ROOM" || clinicalCase.dutyArea === "Delivery Room" || clinicalCase.area === "Delivery Room";
}

function isOperatingRoomCase(clinicalCase: any) {
  return clinicalCase.caseType === "OPERATING_ROOM" || clinicalCase.dutyArea === "Operating Room" || clinicalCase.area === "Operating Room";
}

export function ClearanceDetailContent({ basePath = "/chair" }: { basePath?: string; searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId") ?? undefined;
  const user = useAuthStore((state) => state.user);
  const { data: clearances = [], isLoading: isClearanceLoading } = useClearances();
  const { data: clinicalCases = [], isLoading: isCasesLoading } = useAllClinicalCases(true, user?.id != null ? String(user.id) : undefined);
  const updateClearance = useUpdateClearanceStatus();
  const clearance = (clearances as any[]).find((record) => String(record.studentId) === String(studentId));
  const studentCases = (clinicalCases as any[]).filter((record) => String(record.studentId) === String(studentId));
  const firstCase = studentCases[0];
  const student = {
    id: clearance?.studentId ?? firstCase?.studentId,
    name: clearance?.studentName || firstCase?.studentName || "Nursing Student",
    schoolId: clearance?.studentSchoolId || firstCase?.studentSchoolId || "",
    section: clearance?.studentSection || firstCase?.studentSection || "Nursing Student",
    profileImageUrl: clearance?.studentProfileImageUrl || firstCase?.studentProfileImageUrl || "",
  };
  const drCases = studentCases.filter(isDeliveryRoomCase);
  const orCases = studentCases.filter(isOperatingRoomCase);
  const status = clearance?.status ?? "LOCKED";
  const isApproved = status === "CLEARED" || status === "APPROVED";
  const isSubmitted = status === "IN_REVIEW" || isApproved;
  const isLoading = isClearanceLoading || isCasesLoading;
  const isSaving = updateClearance.isPending;

  async function setClearanceStatus(nextStatus: "CLEARED" | "IN_REVIEW") {
    if (!clearance?.id) {
      showToast({ variant: "error", title: "No clearance record", message: "The student has no clearance record to update yet." });
      return;
    }
    try {
      await updateClearance.mutateAsync({ clearanceId: String(clearance.id), status: nextStatus });
      showToast({ variant: "success", title: nextStatus === "CLEARED" ? "Clearance approved" : "Approval canceled", message: "The clearance decision was saved." });
    } catch {
      showToast({ variant: "error", title: "Update failed", message: "Clearance decision could not be saved." });
    }
  }

  if (isLoading) {
    return <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]"><LoadingState message="Loading clearance review..." className="rounded-xl border border-[#e2e8f0] bg-white" /></main>;
  }

  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]">
      <section className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-[1.6rem_1.75rem_1.75rem]">
        <div className="flex items-start justify-between gap-[22px] mb-[1.1rem] flex-wrap">
          <h2 className="m-0 !text-[#202124] !text-[1.25rem] !font-[900] tracking-[-0.03em]">Student Information</h2>
          <span className={`inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-[900] ${isApproved ? "bg-[#e9f8ef] !text-[#03703c]" : "bg-[#fef3c7] !text-[#92400e]"}`}>{studentCases.length} submitted case{studentCases.length === 1 ? "" : "s"}</span>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4 mb-5">
          <div className="flex items-center gap-4 min-w-0"><ProfileAvatar name={student.name} imageUrl={student.profileImageUrl} size={46} /><div><strong className="block !text-[#202124] !text-[1rem] !font-[900]">{student.name}</strong><span className="block !text-[#64748b] !text-[0.86rem] !font-[800]">{student.section} - Student ID {student.schoolId || "Not provided"}</span></div></div>
          <span className={`inline-flex items-center min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-[900] whitespace-nowrap ${statusClass(status)}`}>{statusLabel(status)}</span>
        </div>

        {studentCases.length > 0 ? <div className="grid gap-5">
          <CaseSection title="DR" subtitle="Delivery Room Cases" records={drCases} basePath={basePath} />
          <CaseSection title="OR" subtitle="Operating Room Cases" records={orCases} basePath={basePath} />
        </div> : <div className="flex items-center justify-center min-h-[60px] rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc] !text-[#64748b] !font-[900]">No submitted clinical cases are available for this student yet.</div>}

        <div className="mt-4 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4 !text-[#64748b] !text-[0.82rem] !font-[900]">{studentCases.length} submitted clinical case{studentCases.length === 1 ? "" : "s"} shown for Chair clearance review.</div>

        <div className="mt-8 pt-6 border-t border-[#e2e8f0]">
          <div className="flex items-center justify-between gap-4 mb-5 flex-wrap"><h2 className="m-0 !text-[#202124] !text-[1.25rem] !font-[900] tracking-[-0.03em]">Chair Decision</h2><span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#fef3c7] !text-[#92400e] !text-[0.78rem] !font-[900]">Final review</span></div>
          <div className="grid grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)] gap-5 max-[980px]:grid-cols-1">
            <div className="grid gap-4">
              <div className="flex items-center gap-4 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4"><ProfileAvatar name={student.name} imageUrl={student.profileImageUrl} size={46} /><div><strong className="block !text-[#202124] !font-[900]">{student.name}</strong><span className="block !text-[#64748b] !font-[800]">{isApproved ? `${clearance?.schoolYear || ""} - ${clearance?.semester || ""}` : `${student.section} - ${studentCases[0]?.area || studentCases[0]?.dutyArea || "Clinical review"}`}</span></div></div>
              <div className={`rounded-lg border p-4 !text-[0.86rem] !font-[900] ${isApproved ? "border-[#86efac] bg-[#ecfdf3] !text-[#15803d]" : "border-[#e2e8f0] bg-[#f8fafc] !text-[#64748b]"}`}>{isApproved ? `${student.name} is approved and can print clearance.` : isSubmitted ? `${student.name} is ready for chair clearance decision.` : `${student.name} has not submitted for clearance yet.`}</div>
            </div>

            <div className="rounded-lg border border-[#e2e8f0] bg-[linear-gradient(110deg,#fff8d6_0%,#ffffff_48%,#ffffff_100%)] p-4">
              <h3 className="m-0 mb-2 !text-[#202124] !text-[1rem] !font-[900]">Clearance Approval</h3>
              <p className="m-0 mb-4 !text-[#64748b] !text-[0.86rem] !font-[800]">Approve only after the student&apos;s submitted clinical cases are complete and already reviewed.</p>
              <div className="flex items-center gap-3 max-[780px]:flex-col max-[780px]:items-stretch">
                {isApproved ? <button type="button" disabled={isSaving} className="inline-flex items-center justify-center min-h-[46px] px-6 rounded-lg bg-[#8A252C] border border-[#8A252C] !text-white !font-[900] cursor-default disabled:opacity-60">Clearance Approved</button> : <button type="button" disabled={!isSubmitted || isSaving} onClick={() => setClearanceStatus("CLEARED")} className="inline-flex items-center justify-center min-h-[46px] px-6 rounded-lg bg-[#8A252C] border border-[#8A252C] !text-white !font-[900] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">{isSubmitted ? "Approve Clearance" : "Waiting for Submission"}</button>}
                {isApproved && <button type="button" disabled={isSaving} onClick={() => setClearanceStatus("IN_REVIEW")} className="inline-flex items-center justify-center min-h-[46px] px-5 rounded-lg bg-white border border-[#e2e8f0] !text-[#344054] !font-[900] cursor-pointer disabled:opacity-60">Cancel Approval</button>}
                <div className="flex-1 min-h-[46px] inline-flex items-center rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 !text-[#64748b] !text-[0.82rem] !font-[900]">This will mark the student as cleared for this semester.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function CaseSection({ title, subtitle, records, basePath }: { title: string; subtitle: string; records: any[]; basePath: string }) {
  const [page, setPage] = React.useState(1);
  const perPage = 5;
  const totalPages = Math.max(1, Math.ceil(records.length / perPage));
  const paged = records.slice((page - 1) * perPage, page * perPage);
  React.useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);
  const ghostBtn = "inline-flex items-center justify-center min-h-[38px] px-[1rem] rounded-[8px] bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.84rem] !font-[800] hover:border-[rgba(138,37,44,0.32)] hover:!text-[#8A252C] hover:shadow-[0_10px_24px_rgba(32,33,36,0.08)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  if (records.length === 0) return null;
  return <section aria-label={subtitle}><div className="flex items-baseline justify-between gap-4 mb-3"><h3 className="m-0 !text-[#8A252C] !text-[1.05rem] !font-[900]">{title}</h3><span className="!text-[#475569] !text-[0.86rem] !font-[900]">{subtitle}</span></div><div className="rounded-lg border border-[#e2e8f0] overflow-x-auto"><table className="w-full min-w-[980px] border-collapse text-left"><thead><tr className="bg-[#f8fafc] border-b border-[#e2e8f0] !text-[#17233c] !text-[0.76rem] !font-[900] uppercase"><th className="p-4">Category</th><th className="p-4">Procedure Performed</th><th className="p-4">Status</th><th className="p-4">Date</th><th className="p-4">Time</th><th className="p-4">Action</th></tr></thead><tbody>{paged.map((record) => <tr key={record.id} className="border-b border-[#e2e8f0] last:border-0"><td className="p-4 !text-[#111827] !font-[900]">{caseCategoryLabel(record.category)}</td><td className="p-4 !text-[#111827] !font-[900]">{record.procedurePerformed || record.procedureDetails || record.diagnosis || "Clinical case"}</td><td className="p-4"><span className={`inline-flex items-center px-3 py-1.5 rounded-full !text-[0.76rem] !font-[900] ${caseStatusClass(record.status)}`}>{caseStatusLabel(record.status)}</span></td><td className="p-4 !text-[#111827] !font-[900]">{formatDate(record.caseDate ?? record.procedureDate)}</td><td className="p-4 !text-[#111827] !font-[900]">{formatTime(record.createdAt, record.shiftTime)}</td><td className="p-4"><Link href={`${basePath}/clinical-cases/validation?caseId=${record.id}`} className="!text-[#8A252C] !font-[900] no-underline hover:underline cursor-pointer">Open</Link></td></tr>)}</tbody></table></div>{totalPages > 1 && <div className="flex justify-between items-center p-[1rem_1.5rem] border border-[#e2e8f0] border-t-0 rounded-b-lg bg-[#f8fafc]"><button className={ghostBtn} onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>Previous</button><span className="!text-[0.875rem] !font-[600] !text-[#64748b]">Page {page} of {totalPages}</span><button className={ghostBtn} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages}>Next</button></div>}</section>;
}
