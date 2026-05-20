"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/core/api/axios";
import { useClinicalCase, useDeleteClinicalCase, useUpdateClinicalCase } from "@/core/api/hooks/useClinicalCases";
import { useAuthStore } from "@/core/store/authStore";
import { InlineSelect } from "@/components/ui/InlineSelect";
import { LoadingState } from "@/components/ui/LoadingState";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { useToast } from "@/components/ui/ToastProvider";

function formatDate(date?: string) {
  if (!date) return "";
  const datePart = date.includes("T") ? date.split("T")[0] : date;
  return new Date(`${datePart}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatTime(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function statusLabel(status?: string) {
  if (!status) return "Pending";
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function statusClass(status?: string) {
  if (status === "APPROVED") return "bg-[#e9f8ef] !text-[#03703c]";
  if (status === "RETURNED" || status === "REJECTED") return "bg-[#fff1f0] !text-[#b42318]";
  return "bg-[#fff8e1] !text-[#6c4c00]";
}

type CaseCategoryOption = { value: string; label: string };

function getCaseType(category: string, dutyArea: string) {
  const combined = `${category} ${dutyArea}`.toLowerCase();
  if (combined.includes("operating") || combined.includes("major") || combined.includes("minor")) return "OPERATING_ROOM";
  if (combined.includes("delivery") || combined.includes("newborn") || combined.includes("labor")) return "DELIVERY_ROOM";
  return "WARD";
}

function errorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error && "response" in error) {
    const data = (error as { response?: { data?: { message?: string } } }).response?.data;
    if (data?.message) return data.message;
  }
  return fallback;
}

function DetailBox({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="border border-[#e2e8f0] rounded-lg bg-[#f8fafc] p-4">
      <span className="block mb-2 !text-[#64748b] !text-[0.72rem] !font-[900] uppercase">{label}</span>
      <strong className="block !text-[#111827] !text-[0.95rem] !font-[800]">{value || "-"}</strong>
    </div>
  );
}

function EditField({ label, value, onChange, multiline }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  return <label className="grid gap-2 !text-[#64748b] !text-[0.78rem] !font-[900] uppercase">
    {label}
    {multiline ? <textarea className="min-h-[120px] rounded-lg border border-[#dbe3ee] bg-white px-4 py-3 !text-[#111827] !text-[0.92rem] !font-[800] normal-case outline-none focus:border-[#8A252C] focus:ring-2 focus:ring-[#8A252C]/15" value={value} onChange={(event) => onChange(event.target.value)} /> : <input className="min-h-[48px] rounded-lg border border-[#dbe3ee] bg-white px-4 !text-[#111827] !text-[0.92rem] !font-[800] normal-case outline-none focus:border-[#8A252C] focus:ring-2 focus:ring-[#8A252C]/15" value={value} onChange={(event) => onChange(event.target.value)} />}
  </label>;
}

export function StudentClinicalCaseDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = searchParams.get("id") ?? undefined;
  const user = useAuthStore((state) => state.user);
  const { data: clinicalCase, isLoading } = useClinicalCase(caseId);
  const { data: categories = [] } = useQuery<CaseCategoryOption[]>({
    queryKey: ["clinical-case-categories"],
    queryFn: async () => {
      const { data } = await apiClient.get("/cases/categories");
      return data as CaseCategoryOption[];
    },
  });
  const updateCase = useUpdateClinicalCase();
  const deleteCase = useDeleteClinicalCase();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [draft, setDraft] = React.useState({ patientInitials: "", category: "", procedureDetails: "", studentReflection: "" });
  const studentName = clinicalCase?.studentName || user?.fullName || "Nursing Student";
  const studentProfileImageUrl = clinicalCase?.studentProfileImageUrl || user?.profileImageUrl || "";
  const studentSection = clinicalCase?.studentSection || user?.sectionInfo || "Nursing Student";
  const studentSchoolId = clinicalCase?.studentSchoolId || user?.schoolId || "";
  const canEdit = clinicalCase?.status === "PENDING" && clinicalCase?.studentId != null && user?.id != null && Number(clinicalCase.studentId) === Number(user.id);
  const categoryOptions = React.useMemo(() => categories.map((item) => ({ value: item.value, label: item.label })), [categories]);

  React.useEffect(() => {
    if (!clinicalCase) return;
    setDraft({
      patientInitials: clinicalCase.patientInitials ?? "",
      category: clinicalCase.category ?? "",
      procedureDetails: clinicalCase.procedureDetails ?? clinicalCase.procedurePerformed ?? clinicalCase.diagnosis ?? "",
      studentReflection: clinicalCase.studentReflection ?? "",
    });
    setIsEditing(false);
  }, [clinicalCase?.id]);

  const updateDraft = (key: keyof typeof draft, value: string) => setDraft((current) => ({ ...current, [key]: value }));

  const saveChanges = async () => {
    if (!caseId || !clinicalCase || !canEdit) return;
    if (!draft.category || !draft.patientInitials || !draft.procedureDetails) {
      showToast({ variant: "error", title: "Missing case details", message: "Complete the required case information before saving." });
      return;
    }
    const dutyArea = clinicalCase.dutyArea ?? clinicalCase.area ?? "";
    try {
      await updateCase.mutateAsync({
        caseId,
        caseData: {
          student: { id: clinicalCase.studentId ?? user?.id },
          instructor: { id: clinicalCase.instructorId },
          caseType: getCaseType(draft.category, dutyArea),
          patientInitials: draft.patientInitials,
          category: draft.category,
          hospital: clinicalCase.hospital,
          dutyArea,
          shiftTime: clinicalCase.shiftTime,
          caseDate: clinicalCase.caseDate ?? clinicalCase.procedureDate,
          diagnosis: draft.category,
          procedureDetails: draft.procedureDetails,
          studentReflection: draft.studentReflection,
        },
      });
      showToast({ variant: "success", title: "Clinical case updated", message: "Your pending case was saved." });
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      showToast({ variant: "error", title: "Update failed", message: errorMessage(error, "Clinical case could not be updated.") });
    }
  };

  const deleteClinicalCase = async () => {
    if (!caseId || !canEdit) return;
    try {
      await deleteCase.mutateAsync(caseId);
      showToast({ variant: "success", title: "Clinical case deleted", message: "Your pending case was deleted." });
      setShowDeleteModal(false);
      router.push("/nursing-student/clinical-cases");
    } catch (error) {
      showToast({ variant: "error", title: "Delete failed", message: errorMessage(error, "Clinical case could not be deleted.") });
    }
  };

  if (isLoading) {
    return <main className="p-[clamp(24px,4vw,42px)]"><LoadingState message="Loading case details..." className="rounded-xl border border-[#e2e8f0] bg-white" /></main>;
  }

  if (!clinicalCase) {
    return <main className="p-[clamp(24px,4vw,42px)]"><div className="p-6 rounded-xl border border-[#e2e8f0] bg-white font-bold text-[#64748b]">Clinical case not found.</div></main>;
  }

  return (
    <main className="p-[clamp(24px,4vw,42px)] grid grid-cols-1 xl:grid-cols-[1.45fr_1fr] gap-6 items-start">
      <section className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-6">
        <div className="mb-5 flex items-center justify-between gap-3 flex-wrap"><h2 className="m-0 !text-[#111827] !text-[1.25rem] !font-[900]">Case Information</h2>{canEdit && !isEditing && <div className="flex items-center gap-2"><button type="button" disabled={deleteCase.isPending} onClick={() => setShowDeleteModal(true)} className="min-h-[42px] px-5 rounded-lg border border-[#fecaca] bg-white !text-[#b91c1c] !font-[900] cursor-pointer hover:bg-[#fef2f2] disabled:opacity-60">Delete</button><button type="button" onClick={() => setIsEditing(true)} className="min-h-[42px] px-5 rounded-lg border border-[#e2e8f0] bg-white !text-[#8A252C] !font-[900] cursor-pointer hover:bg-[#fff7f7]">Edit</button></div>}</div>
        <div className="flex items-center gap-4 p-4 mb-4 border border-[#e2e8f0] rounded-lg bg-[#f8fafc]">
          <ProfileAvatar name={studentName} imageUrl={studentProfileImageUrl} size={46} />
          <div>
            <strong className="block !text-[#111827] !text-[1rem] !font-[900]">{studentName}</strong>
            <span className="block !text-[#64748b] !text-[0.86rem] !font-[800]">{studentSection} - Student ID {studentSchoolId}</span>
          </div>
        </div>
        {!isEditing ? <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DetailBox label="Case Date" value={formatDate(clinicalCase.caseDate ?? clinicalCase.procedureDate)} />
          <DetailBox label="Time of Shift" value={clinicalCase.shiftTime} />
          <DetailBox label="Patient Name" value={clinicalCase.patientInitials} />
          <DetailBox label="Category" value={clinicalCase.category ?? clinicalCase.caseType} />
          <DetailBox label="Procedure Performed" value={clinicalCase.procedureDetails ?? clinicalCase.procedurePerformed ?? clinicalCase.diagnosis} />
          <DetailBox label="Name of Hospital" value={clinicalCase.hospital} />
          <DetailBox label="Supervising Clinical Instructor" value={clinicalCase.instructorName || "Clinical Instructor"} />
          <DetailBox label="Duty Area" value={clinicalCase.dutyArea ?? clinicalCase.area} />
          <DetailBox label="Submitted Date" value={formatDate(clinicalCase.createdAt?.split("T")[0])} />
          <DetailBox label="Submitted Time" value={formatTime(clinicalCase.createdAt)} />
          <div className="md:col-span-2 border border-[#e2e8f0] rounded-lg bg-[#f8fafc] p-4">
            <span className="block mb-2 !text-[#8A252C] !text-[0.72rem] !font-[900] uppercase">Student Reflection</span>
            <p className="m-0 !text-[#64748b] !text-[0.92rem] !font-[800] leading-relaxed">{clinicalCase.studentReflection || "No reflection provided."}</p>
          </div>
        </div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DetailBox label="Case Date" value={formatDate(clinicalCase.caseDate ?? clinicalCase.procedureDate)} />
          <DetailBox label="Time of Shift" value={clinicalCase.shiftTime} />
          <EditField label="Patient Name" value={draft.patientInitials} onChange={(value) => updateDraft("patientInitials", value)} />
          <label className="grid gap-2 !text-[#64748b] !text-[0.78rem] !font-[900] uppercase">Category<InlineSelect value={draft.category} options={categoryOptions} placeholder="Select category" onChange={(value) => updateDraft("category", value)} /></label>
          <EditField label="Procedure Performed" value={draft.procedureDetails} onChange={(value) => updateDraft("procedureDetails", value)} />
          <DetailBox label="Name of Hospital" value={clinicalCase.hospital} />
          <DetailBox label="Supervising Clinical Instructor" value={clinicalCase.instructorName || "Clinical Instructor"} />
          <DetailBox label="Duty Area" value={clinicalCase.dutyArea ?? clinicalCase.area} />
          <div className="md:col-span-2"><EditField label="Student Reflection" value={draft.studentReflection} onChange={(value) => updateDraft("studentReflection", value)} multiline /></div>
          <div className="md:col-span-2 flex justify-end gap-3 pt-2"><button type="button" disabled={updateCase.isPending} onClick={() => setIsEditing(false)} className="min-h-[44px] px-6 rounded-lg border border-[#e2e8f0] bg-white !text-[#334155] !font-[900] cursor-pointer disabled:opacity-60">Cancel</button><button type="button" disabled={updateCase.isPending} onClick={saveChanges} className="min-h-[44px] px-6 rounded-lg bg-[#8A252C] !text-white !font-[900] cursor-pointer disabled:opacity-60">{updateCase.isPending ? "Saving..." : "Save Changes"}</button></div>
        </div>}
      </section>

      <section className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-6">
        <h2 className="m-0 mb-4 !text-[#111827] !text-[1.25rem] !font-[900]">Clinical Case Status</h2>
        <div className="flex items-center justify-between gap-4 p-4 mb-3 border border-[#e2e8f0] rounded-lg bg-[#f8fafc]">
          <span className={`inline-flex items-center px-3 py-1 rounded-full !text-[0.78rem] !font-[900] ${statusClass(clinicalCase.status)}`}>{statusLabel(clinicalCase.status)}</span>
          <strong className="!text-[#111827] !text-[0.9rem] !font-[900]">{clinicalCase.status === "APPROVED" ? "Validated" : "Awaiting Clinical Instructor validation"}</strong>
        </div>
        <DetailBox label="Recommended Reviewer" value={clinicalCase.instructorName || "Clinical Instructor"} />
        <div className="mt-3 border border-[#e2e8f0] rounded-lg bg-[#f8fafc] p-4">
          <span className="block mb-2 !text-[#8A252C] !text-[0.72rem] !font-[900] uppercase">Clinical Instructor Comments</span>
          <p className="m-0 !text-[#111827] !text-[0.92rem] !font-[800] leading-relaxed">{clinicalCase.instructorFeedback || "This case is queued for CI validation."}</p>
        </div>
      </section>
      {showDeleteModal && <>
        <div className="fixed inset-0 z-[9998] bg-[rgba(0,0,0,0.45)] backdrop-blur-[4px]" onClick={() => !deleteCase.isPending && setShowDeleteModal(false)} />
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-[20px]">
          <section className="w-full max-w-[440px] rounded-[14px] bg-white p-[clamp(28px,4vw,38px)] shadow-[0_32px_80px_rgba(0,0,0,0.22)] animate-[fadeUp_320ms_ease_both]" role="dialog" aria-modal="true" aria-labelledby="delete-case-title">
            <div className="mb-[18px] flex h-[56px] w-[56px] items-center justify-center rounded-full bg-[#fee2e2]">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v5" /><path d="M14 11v5" /></svg>
            </div>
            <p className="!m-0 !mb-[8px] !text-[#b91c1c] !text-[0.8rem] !font-[900] uppercase tracking-wide">Delete Clinical Case</p>
            <h2 id="delete-case-title" className="!m-0 !mb-[10px] !text-[#111827] !text-[1.4rem] !font-[850] !leading-[1.2]">Delete this pending case?</h2>
            <p className="!m-0 !mb-[32px] !text-[#475569] !text-[0.95rem] !font-[500] !leading-[1.5]">This will permanently remove the clinical case from your records. This action cannot be undone.</p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" disabled={deleteCase.isPending} className="inline-flex min-h-[48px] w-full items-center justify-center rounded-lg border border-[#dbe3ee] bg-white px-4 !text-[#344054] !text-[0.95rem] !font-[800] shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition-all duration-200 cursor-pointer hover:border-[#cbd5e1] hover:bg-[#f8fafc] hover:!text-[#0f172a] disabled:opacity-60" onClick={() => setShowDeleteModal(false)}>Keep Case</button>
              <button type="button" disabled={deleteCase.isPending} className="inline-flex min-h-[48px] w-full items-center justify-center rounded-lg border border-[#b91c1c] bg-[#b91c1c] px-4 !text-white !text-[0.95rem] !font-[800] shadow-[0_4px_12px_rgba(185,28,28,0.22)] transition-all duration-200 cursor-pointer hover:border-[#991b1b] hover:bg-[#991b1b] disabled:opacity-60" onClick={deleteClinicalCase}>{deleteCase.isPending ? "Deleting..." : "Delete Case"}</button>
            </div>
          </section>
        </div>
      </>}
    </main>
  );
}
