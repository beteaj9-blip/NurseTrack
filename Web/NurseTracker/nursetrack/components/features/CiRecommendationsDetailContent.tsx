"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useStudentAppeal, useUpdateAppealStatus } from "@/core/api/hooks/useStudentAppeals";
import { useAuthStore } from "@/core/store/authStore";
import { LoadingState } from "@/components/ui/LoadingState";
import { useToast } from "@/components/ui/ToastProvider";
import { useCanEditFeature } from "@/core/auth/permissions";

function formatDate(date?: string) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatSubmitted(date?: string) {
  if (!date) return "Submitted";
  return `Submitted ${new Date(date).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}`;
}

function getFileName(fileUrl?: string) {
  if (!fileUrl) return "";
  try {
    return decodeURIComponent(new URL(fileUrl).pathname.split("/").pop() || "Supporting file");
  } catch {
    return fileUrl.split("/").pop() || "Supporting file";
  }
}

function statusClass(status?: string) {
  if (status === "ACCEPTED") return "bg-[#e9f8ef] !text-[#03703c]";
  if (status === "RETURNED") return "bg-[#fef2f2] !text-[#991b1b]";
  return "bg-[#fef3c7] !text-[#92400e]";
}

function statusLabel(status?: string) {
  return status === "RETURNED" ? "REJECTED" : status;
}

export function CiRecommendationsDetailContent({ basePath }: { basePath: string; searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const appealId = searchParams.get("id") ?? undefined;
  const user = useAuthStore((state) => state.user);
  const { canEdit } = useCanEditFeature("ciRecommendations");
  const { data: appeal, isLoading } = useStudentAppeal(appealId);
  const updateStatus = useUpdateAppealStatus(user?.id != null ? String(user.id) : undefined);
  const [remarks, setRemarks] = useState("");
  const [isEditingRecommendation, setIsEditingRecommendation] = useState(false);
  const isSaving = updateStatus.isPending;
  const isFinalStatus = appeal?.status === "ACCEPTED" || appeal?.status === "RETURNED";
  const canEditRecommendation = canEdit && (!isFinalStatus || isEditingRecommendation);

  React.useEffect(() => {
    setRemarks(appeal?.instructorRemarks ?? "");
    setIsEditingRecommendation(false);
  }, [appeal?.id, appeal?.instructorRemarks, appeal?.status]);

  const submitStatus = async (status: "ACCEPTED" | "RETURNED") => {
    if (!canEdit) {
      showToast({ variant: "error", title: "Action unavailable", message: "Recommendation decisions are not enabled for your role." });
      return;
    }
    if (!appealId) return;
    try {
      await updateStatus.mutateAsync({ appealId, status, instructorRemarks: remarks.trim() });
      setIsEditingRecommendation(false);
      showToast({ variant: "success", title: status === "ACCEPTED" ? "Appeal accepted" : "Appeal rejected", message: "The appeal recommendation was saved." });
    } catch {
      showToast({ variant: "error", title: "Update failed", message: "Appeal recommendation could not be saved." });
    }
  };

  if (isLoading) return <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]"><LoadingState message="Loading appeal..." className="rounded-xl border border-[#e2e8f0] bg-white" /></main>;
  if (!appeal) return <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]"><div className="bg-white border border-[#e2e8f0] rounded-xl p-6 text-[#64748b] font-bold">Appeal not found.</div></main>;

  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)] content-start flex flex-col gap-[1.5rem]">
      <section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[2rem] w-full mt-0">
        <small className="!text-[#8A252C] !font-[800] !text-[0.8rem] tracking-[0.02em]">{appeal.sectionInfo} - {appeal.schoolId}</small>
        <h2 className="m-[4px_0_1.5rem] !mb-4 !text-[1.4rem] !text-[#1e293b] !font-[800]">{appeal.studentName}&apos;s Appeal</h2>
        <div className="border border-[#e2e8f0] rounded-[10px] p-[1.5rem]">
          <div className="flex justify-between items-start mb-[1.25rem] gap-4">
            <div><h3 className="m-[0_0_6px] !text-[1.15rem] !text-[#0f172a] !font-[800]">{appeal.title}</h3><p className="m-0 !text-[0.85rem] !text-[#475569] !font-[600]">{formatSubmitted(appeal.createdAt)} <span className="mx-[6px] text-[#cbd5e1]">|</span> Assigned CI: {appeal.instructorName}</p></div>
            <span className={`${statusClass(appeal.status)} px-[14px] py-[4px] rounded-full !text-[0.8rem] !font-[800]`}>{statusLabel(appeal.status)}</span>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[1.5rem] bg-[#f8fafc] p-[1.25rem] rounded-[8px] mb-[1rem] border border-[#f1f5f9]">
            <Field label="Appeal Type" value={appeal.appealType} />
            <Field label="Related Duty Date" value={formatDate(appeal.relatedDutyDate)} />
            <Field label="Clinical Site" value={appeal.clinicalSite} />
            <Field label="Duty Area" value={appeal.dutyArea} />
          </div>
          <div className="flex flex-col gap-[0.6rem]">
            <Block label="Student Reason" value={appeal.studentReason} />
            <Block label="Supporting Evidence or Notes" value={appeal.evidenceNotes || "No evidence notes provided."} />
            <div className="bg-[#f8fafc] p-[1.25rem] rounded-[8px] border-l-[4px] border-[#facc15]"><small className="block !text-[0.7rem] !font-[800] !text-[#64748b] uppercase mb-[6px] tracking-[0.05em]">Supporting Files</small>{appeal.supportingFiles ? <a href={appeal.supportingFiles} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 max-w-full rounded-md border border-[#e2e8f0] bg-white px-3 py-2 text-[#344054] text-[0.85rem] font-bold no-underline hover:border-[#cbd5e1] hover:bg-[#f8fafc] transition-colors"><span>File</span><span className="truncate">{getFileName(appeal.supportingFiles)}</span><span className="text-[#8A252C]">Open</span></a> : <strong className="!text-[0.95rem] !text-[#334155] !font-[800]">No supporting files attached.</strong>}</div>
            <div className="bg-[#f8fafc] p-[1.25rem] rounded-[8px] border-l-[4px] border-[#facc15]"><small className="block !text-[0.7rem] !font-[800] !text-[#64748b] uppercase mb-[6px] tracking-[0.05em]">CI Recommendation</small>{canEditRecommendation ? <textarea value={remarks} onChange={(event) => setRemarks(event.target.value)} rows={4} className="w-full p-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white resize-y" placeholder={appeal.instructorRemarks || "Add recommendation remarks for this appeal"} /> : <strong className="!text-[0.95rem] !text-[#334155] !font-[800]">{appeal.instructorRemarks || "No recommendation remarks provided."}</strong>}</div>
          </div>
          {canEdit && isFinalStatus && !isEditingRecommendation && <div className="flex justify-end gap-[1rem] mt-[1.5rem]"><button type="button" onClick={() => setIsEditingRecommendation(true)} className="bg-white border border-[#e2e8f0] p-[0.75rem_1.75rem] rounded-[8px] !font-[800] !text-[#475569] !text-[0.95rem] cursor-pointer hover:border-[#cbd5e1] hover:!text-[#334155] transition-colors">Edit</button></div>}
          {canEditRecommendation && <div className="flex justify-end gap-[1rem] mt-[1.5rem]">
            {isEditingRecommendation && <button type="button" disabled={isSaving} onClick={() => { setRemarks(appeal.instructorRemarks ?? ""); setIsEditingRecommendation(false); }} className="bg-white border border-[#e2e8f0] p-[0.75rem_1.75rem] rounded-[8px] !font-[800] !text-[#475569] !text-[0.95rem] cursor-pointer hover:border-[#cbd5e1] hover:!text-[#334155] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">Cancel</button>}
            <button type="button" disabled={isSaving} onClick={() => submitStatus("RETURNED")} className="bg-white border border-[#e2e8f0] p-[0.75rem_1.75rem] rounded-[8px] !font-[800] !text-[#475569] !text-[0.95rem] cursor-pointer hover:border-[#cbd5e1] hover:!text-[#334155] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">{isSaving ? "Saving..." : "Mark as Rejected"}</button>
            <button type="button" disabled={isSaving} onClick={() => submitStatus("ACCEPTED")} className="bg-[#8A252C] border-none p-[0.75rem_1.75rem] rounded-[8px] !font-[800] !text-white !text-[0.95rem] cursor-pointer shadow-[0_4px_12px_rgba(138,37,44,0.2)] hover:bg-[#6b1d22] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">{isSaving ? "Saving..." : "Mark as Accepted"}</button>
          </div>}
        </div>
      </section>
    </main>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return <div><small className="block !text-[0.7rem] !font-[800] !text-[#64748b] uppercase mb-[4px] tracking-[0.05em]">{label}</small><strong className="!text-[0.95rem] !text-[#1e293b] !font-[800]">{value || "Not provided"}</strong></div>;
}

function Block({ label, value }: { label: string; value?: string }) {
  return <div className="bg-[#f8fafc] p-[1.25rem] rounded-[8px] border-l-[4px] border-[#facc15]"><small className="block !text-[0.7rem] !font-[800] !text-[#64748b] uppercase mb-[6px] tracking-[0.05em]">{label}</small><strong className="!text-[0.95rem] !text-[#334155] !font-[800]">{value || "Not provided"}</strong></div>;
}
