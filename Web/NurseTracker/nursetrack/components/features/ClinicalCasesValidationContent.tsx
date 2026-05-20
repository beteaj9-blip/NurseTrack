"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAllClinicalCases, useClinicalCase, useInstructorCases, useReviewCase } from "@/core/api/hooks/useClinicalCases";
import { useAuthStore } from "@/core/store/authStore";
import { useToast } from "@/components/ui/ToastProvider";
import { LoadingState } from "@/components/ui/LoadingState";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { useCanEditFeature } from "@/core/auth/permissions";

function formatDate(date?: string) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function ClinicalCasesValidationContent({ basePath }: { basePath: string; searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId") ?? undefined;
  const user = useAuthStore((state) => state.user);
  const { canEdit } = useCanEditFeature("clinicalCases");
  const isChair = basePath === "/chair" || basePath === "/coordinator";
  const { data: detailCase, isLoading: isDetailLoading } = useClinicalCase(caseId);
  const { data: instructorCases = [], isLoading: isInstructorListLoading } = useInstructorCases();
  const { data: allCases = [], isLoading: isAllListLoading } = useAllClinicalCases(isChair, isChair && user?.id != null ? String(user.id) : undefined);
  const listCases = isChair ? allCases : instructorCases;
  const isListLoading = isChair ? isAllListLoading : isInstructorListLoading;
  const listCase = (listCases as any[]).find((clinicalCase: any) => String(clinicalCase.id) === String(caseId));
  const clinicalCase = detailCase ?? listCase;
  const reviewCase = useReviewCase();
  const [comment, setComment] = useState("");
  const isSaving = reviewCase.isPending;

  const submitDecision = async (status: "APPROVED" | "RETURNED") => {
    if (!canEdit) {
      showToast({ variant: "error", title: "Action unavailable", message: "Case decisions are not enabled for your role." });
      return;
    }
    const targetCaseId = clinicalCase?.id ?? caseId;
    if (!targetCaseId) return;
    if (status === "RETURNED" && !comment.trim()) {
      showToast({ variant: "error", title: "Comment required", message: "Add feedback before rejecting the case." });
      return;
    }
    try {
      await reviewCase.mutateAsync({ caseId: String(targetCaseId), status, remarks: comment.trim() });
      showToast({ variant: "success", title: status === "APPROVED" ? "Case approved" : "Case rejected", message: "The student clinical case was updated." });
      router.push(`${basePath}/clinical-cases/selection?studentId=${clinicalCase?.studentId ?? ""}`);
    } catch {
      showToast({ variant: "error", title: "Update failed", message: "The case decision could not be saved." });
    }
  };

  const ghostBtn = "inline-flex items-center justify-center min-h-[38px] px-[12px] py-[8px] rounded-[8px] bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.84rem] !font-[800] hover:border-[rgba(138,37,44,0.32)] hover:!text-[#8A252C] hover:shadow-[0_10px_24px_rgba(32,33,36,0.08)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const primaryBtn = "inline-flex items-center justify-center min-h-[38px] px-[12px] py-[8px] rounded-[8px] bg-[#8A252C] border border-[#8A252C] !text-white !text-[0.84rem] !font-[800] hover:bg-[#6b1d22] hover:border-[#6b1d22] hover:shadow-[0_10px_24px_rgba(138,37,44,0.22)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  if (isDetailLoading || isListLoading) {
    return <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]"><LoadingState message="Loading case details..." className="rounded-xl border border-[#e2e8f0] bg-white" /></main>;
  }

  if (!clinicalCase) {
    return <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]"><div className="bg-white border border-[#e2e8f0] rounded-xl p-6 text-[#64748b] font-bold">Clinical case not found.</div></main>;
  }

  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)] content-start">
      <section className="grid grid-cols-[1fr_480px] gap-[1.5rem] items-start max-[1024px]:grid-cols-1">
        <article className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem] w-full mt-0">
          <div className="flex items-start justify-between gap-[22px] mb-[1.1rem] border-b border-[#e5eaf1] pb-[1.1rem] flex-wrap"><h2 className="m-0 !text-[#111827] !text-[1.15rem] leading-[1.2] !font-[800] tracking-[-0.03em]">Case Information</h2></div>
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[16px] border border-[#e2e8f0] rounded-[8px] bg-[#f8fafc] mb-[14px] p-[14px]">
            <ProfileAvatar name={clinicalCase.studentName} imageUrl={clinicalCase.studentProfileImageUrl} size={48} />
            <div><strong className="block !text-[#111827] !text-[1rem] !font-[800] leading-[1.3] mb-[4px]">{clinicalCase.studentName}</strong><p className="m-0 !text-[#64748b] !text-[0.86rem] !font-[700]">{clinicalCase.studentSection} - Student ID {clinicalCase.studentSchoolId}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-[1rem] mt-[1rem] max-[640px]:grid-cols-1">
            <Detail label="Case date" value={formatDate(clinicalCase.caseDate)} />
            <Detail label="Time of shift" value={clinicalCase.shiftTime} />
            <Detail label="Patient initials" value={clinicalCase.patientInitials} />
            <Detail label="Category" value={clinicalCase.category} />
            <Detail label="Procedure performed" value={clinicalCase.procedurePerformed} />
            <Detail label="Name of hospital" value={clinicalCase.hospital} />
            <Detail label="Supervising clinical instructor" value={clinicalCase.instructorName} />
            <Detail label="Duty area" value={clinicalCase.dutyArea} />
            <Detail label="Submitted date" value={formatDate(clinicalCase.createdAt?.slice(0, 10))} />
            <Detail label="Status" value={clinicalCase.status} />
          </div>
          <div className="mt-[1rem] p-[1.25rem] border border-[#e2e8f0] rounded-[0.5rem] bg-white"><p className="!text-[0.75rem] !font-[800] uppercase !text-[#8A252C] mb-[0.5rem]">Student reflection</p><p className="m-0 !text-[#64748b] !text-[0.9rem] !font-[700] leading-[1.55]">{clinicalCase.studentReflection || "No reflection submitted."}</p></div>
        </article>
        <aside>
          <article className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem] w-full mt-0">
            <div className="flex items-start justify-between gap-[22px] mb-[1.1rem] border-b border-[#e5eaf1] pb-[1.1rem] flex-wrap"><h2 className="m-0 !text-[#111827] !text-[1.15rem] leading-[1.2] !font-[800] tracking-[-0.03em]">Instructor Action</h2></div>
            <div className="flex flex-col gap-[12px]">
              <label className="flex flex-col gap-1.5 m-0 !text-[0.875rem] !font-[800] !text-[#344054]" htmlFor="validation-comment">Comment (Required for rejection)<textarea className="w-full p-[0.75rem] border border-[#e2e8f0] rounded-[0.5rem] mt-[0.5rem] font-inherit resize-y bg-white !text-[#111827] !font-[500] focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all" id="validation-comment" rows={5} placeholder="Add a comment or feedback for the student" value={comment} onChange={(event) => setComment(event.target.value)} /></label>
              <div className="flex items-center gap-[0.75rem] p-[1rem] rounded-[8px] !text-[#1e293b] !font-[500] bg-[#f8fafc] border border-[#e2e8f0]" role="status" aria-live="polite">Review the case details, then make an approval decision.</div>
              <div className="grid grid-cols-[1fr_1fr] gap-[1rem] mt-[0.5rem]">
                <button className={`${ghostBtn} !text-[#dc2626] !border-[#fca5a5] hover:!border-[#f87171]`} type="button" disabled={!canEdit || isSaving} onClick={() => submitDecision("RETURNED")}>{isSaving ? "Saving..." : "Reject case"}</button>
                <button className={`${primaryBtn} !bg-[#16a34a] !border-[#15803d] hover:!bg-[#15803d]`} type="button" disabled={!canEdit || isSaving} onClick={() => submitDecision("APPROVED")}>{isSaving ? "Saving..." : "Approve case"}</button>
              </div>
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return <div className="p-[1rem] bg-[#f8fafc] border border-[#e2e8f0] rounded-[0.5rem] flex flex-col gap-[0.25rem]"><span className="!text-[0.75rem] !font-[700] uppercase !text-[#64748b]">{label}</span><strong className="!text-[#1e293b] !text-[0.9375rem] !font-[800] leading-[1.35]">{value || "Not provided"}</strong></div>;
}
