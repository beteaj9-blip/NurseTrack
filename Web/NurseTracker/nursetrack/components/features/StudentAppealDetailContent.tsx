"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useHospitals } from "@/core/api/hooks/useHospitals";
import { useInstructors } from "@/core/api/hooks/useUsers";
import { useAppealTypes, useStudentAppeal, useUpdateStudentAppeal, useUploadAppealFile } from "@/core/api/hooks/useStudentAppeals";
import { useAuthStore } from "@/core/store/authStore";

function formatDate(date?: string) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatSubmitted(date?: string) {
  if (!date) return "Submitted";
  return `Submitted ${new Date(date).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}`;
}

function statusLabel(status?: string) {
  if (!status) return "Pending";
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function statusClass(status?: string) {
  if (status === "ACCEPTED") return "bg-[#e9f8ef] text-[#03703c]";
  if (status === "RETURNED") return "bg-[#fef2f2] text-[#991b1b]";
  return "bg-[#fff8e1] text-[#6c4c00]";
}

const emptyForm = {
  appealType: "",
  relatedDutyDate: "",
  clinicalSite: "",
  dutyArea: "",
  instructorId: "",
  title: "",
  studentReason: "",
  evidenceNotes: "",
  supportingFiles: "",
};

export function StudentAppealDetailContent() {
  const searchParams = useSearchParams();
  const appealId = searchParams.get("id") ?? undefined;
  const user = useAuthStore((state) => state.user);
  const { data: appeal } = useStudentAppeal(appealId);
  const { data: appealTypes = [] } = useAppealTypes();
  const { data: hospitals = [] } = useHospitals();
  const { data: instructors = [] } = useInstructors();
  const updateAppeal = useUpdateStudentAppeal(user?.id != null ? String(user.id) : undefined);
  const uploadAppealFile = useUploadAppealFile();
  const [isEditing, setIsEditing] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [form, setForm] = React.useState(emptyForm);

  const selectedHospital = hospitals.find((hospital: any) => hospital.name === form.clinicalSite);
  const dutyAreas = selectedHospital?.wards ?? [];

  const resetForm = React.useCallback(() => {
    if (!appeal) return;
    setForm({
      appealType: appeal.appealType ?? "",
      relatedDutyDate: appeal.relatedDutyDate ?? "",
      clinicalSite: appeal.clinicalSite ?? "",
      dutyArea: appeal.dutyArea ?? "",
      instructorId: appeal.instructorId != null ? String(appeal.instructorId) : "",
      title: appeal.title ?? "",
      studentReason: appeal.studentReason ?? "",
      evidenceNotes: appeal.evidenceNotes ?? "",
      supportingFiles: appeal.supportingFiles ?? "",
    });
  }, [appeal]);

  React.useEffect(() => {
    resetForm();
  }, [resetForm]);

  const updateForm = (field: keyof typeof emptyForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const cancelEdit = () => {
    resetForm();
    setIsEditing(false);
    setMessage("");
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setMessage("Uploading supporting file...");
      const uploaded = await uploadAppealFile.mutateAsync(file);
      updateForm("supportingFiles", uploaded.secure_url ?? uploaded.url ?? file.name);
      setMessage("Supporting file uploaded.");
    } catch {
      setMessage("Supporting file could not be uploaded. Check Cloudinary configuration.");
    }
  };

  const saveAppeal = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!appealId || !user || !form.appealType || !form.relatedDutyDate || !form.clinicalSite || !form.dutyArea || !form.instructorId || !form.title || !form.studentReason) {
      setMessage("Complete the appeal details before saving.");
      return;
    }

    try {
      await updateAppeal.mutateAsync({
        appealId,
        appeal: {
          student: { id: user.id },
          instructor: { id: Number(form.instructorId) },
          appealType: form.appealType,
          relatedDutyDate: form.relatedDutyDate,
          clinicalSite: form.clinicalSite,
          dutyArea: form.dutyArea,
          title: form.title,
          studentReason: form.studentReason,
          evidenceNotes: form.evidenceNotes,
          supportingFiles: form.supportingFiles,
        },
      });
      setIsEditing(false);
      setMessage("Appeal changes saved.");
    } catch {
      setMessage("Appeal changes could not be saved.");
    }
  };

  return (
    <div className="p-10 pb-12 w-full grid gap-6">

      {/* Main Detail Card */}
      <section className="bg-white rounded-xl shadow-[0_4px_24px_rgba(32,33,36,0.04)] border border-[#e2e8f0] p-6 sm:p-8">

        {/* Header Info */}
        <div className="mb-6 border-b border-[#e5eaf1] pb-6">
          <p className="text-[#8A252C] text-[0.7rem] font-[900] tracking-wider uppercase m-0 mb-1">
            {user?.sectionInfo ?? appeal?.sectionInfo ?? "Nursing Student"} - {user?.schoolId ?? appeal?.schoolId ?? ""}
          </p>
          <h2 className="text-[1.3rem] font-[800] text-[#111827] m-0">
            {user?.fullName ?? appeal?.studentName ?? "Student"}&apos;s Appeal History
          </h2>
        </div>

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
          {isEditing ? (
            <input className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] text-[1rem] font-[800] bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01]" value={form.title} onChange={(event) => updateForm("title", event.target.value)} placeholder="Enter appeal title" />
          ) : (
            <h3 className="text-[1.15rem] font-[800] text-[#111827] m-0 leading-[1.3]">
              {appeal?.title ?? "Appeal details"}
            </h3>
          )}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[0.75rem] font-bold shrink-0 ${statusClass(appeal?.status)}`}>
            {statusLabel(appeal?.status)}
          </span>
        </div>

        <p className="text-[#344054] text-[0.85rem] font-bold m-0 mb-6 flex flex-wrap items-center gap-3">
          {formatSubmitted(appeal?.createdAt)} <span className="font-semibold text-[#64748b]">Assigned CI: {appeal?.instructorName || "Clinical Instructor"}</span>
        </p>

        {/* 4-Column Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl mb-6 divide-y sm:divide-y-0 lg:divide-x divide-[#e2e8f0]">
          <div className="p-4 px-5">
            <span className="block text-[#64748b] text-[0.65rem] font-[800] uppercase tracking-wider mb-1">Appeal Type</span>
            {isEditing ? (
              <select className="w-full h-[38px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white cursor-pointer" value={form.appealType} onChange={(event) => updateForm("appealType", event.target.value)}>
                <option value="" disabled hidden>Select appeal type</option>
                {appealTypes.map((appealType: any) => (
                  <option key={appealType.id ?? appealType.value} value={appealType.value}>{appealType.label}</option>
                ))}
              </select>
            ) : (
              <strong className="text-[#111827] text-[0.9rem] font-bold">{appeal?.appealType ?? ""}</strong>
            )}
          </div>
          <div className="p-4 px-5 sm:border-l border-[#e2e8f0] lg:border-none">
            <span className="block text-[#64748b] text-[0.65rem] font-[800] uppercase tracking-wider mb-1">Related Duty Date</span>
            {isEditing ? (
              <input className="w-full h-[38px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white" type="date" value={form.relatedDutyDate} onChange={(event) => updateForm("relatedDutyDate", event.target.value)} />
            ) : (
              <strong className="text-[#111827] text-[0.9rem] font-bold">{formatDate(appeal?.relatedDutyDate)}</strong>
            )}
          </div>
          <div className="p-4 px-5">
            <span className="block text-[#64748b] text-[0.65rem] font-[800] uppercase tracking-wider mb-1">Clinical Site</span>
            {isEditing ? (
              <select className="w-full h-[38px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white cursor-pointer" value={form.clinicalSite} onChange={(event) => setForm((current) => ({ ...current, clinicalSite: event.target.value, dutyArea: "" }))}>
                <option value="" disabled hidden>Select clinical site</option>
                {hospitals.map((hospital: any) => (
                  <option key={hospital.id} value={hospital.name}>{hospital.name}</option>
                ))}
              </select>
            ) : (
              <strong className="text-[#111827] text-[0.9rem] font-bold">{appeal?.clinicalSite ?? ""}</strong>
            )}
          </div>
          <div className="p-4 px-5 sm:border-l border-[#e2e8f0] lg:border-none">
            <span className="block text-[#64748b] text-[0.65rem] font-[800] uppercase tracking-wider mb-1">Duty Area</span>
            {isEditing ? (
              <select className="w-full h-[38px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white cursor-pointer" value={form.dutyArea} onChange={(event) => updateForm("dutyArea", event.target.value)}>
                <option value="" disabled hidden>Select duty area</option>
                {dutyAreas.map((area: string) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            ) : (
              <strong className="text-[#111827] text-[0.9rem] font-bold">{appeal?.dutyArea ?? ""}</strong>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="mb-6">
            <label className="block text-[#64748b] text-[0.65rem] font-[800] uppercase tracking-wider mb-1">Assigned Clinical Instructor</label>
            <select className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white cursor-pointer" value={form.instructorId} onChange={(event) => updateForm("instructorId", event.target.value)}>
              <option value="" disabled hidden>Select assigned CI</option>
              {instructors.map((instructor: any) => (
                <option key={instructor.id} value={instructor.id}>{instructor.fullName}</option>
              ))}
            </select>
          </div>
        )}

        {/* Details Blocks */}
        <form className="grid gap-3 mb-8" onSubmit={saveAppeal}>

          <div className="border border-[#e2e8f0] border-l-[4px] border-l-[#ffc107] rounded-lg bg-[#f8fafc] p-4 pl-5">
            <span className="block text-[#8A252C] text-[0.7rem] font-[900] uppercase tracking-wider mb-1.5">Student Reason</span>
            {isEditing ? (
              <textarea className="w-full p-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white resize-y" rows={4} value={form.studentReason} onChange={(event) => updateForm("studentReason", event.target.value)} />
            ) : (
              <p className="m-0 text-[#111827] text-[0.9rem] font-semibold leading-[1.5]">
                {appeal?.studentReason ?? ""}
              </p>
            )}
          </div>

          <div className="border border-[#e2e8f0] border-l-[4px] border-l-[#ffc107] rounded-lg bg-[#f8fafc] p-4 pl-5">
            <span className="block text-[#8A252C] text-[0.7rem] font-[900] uppercase tracking-wider mb-1.5">Supporting Evidence or Notes</span>
            {isEditing ? (
              <textarea className="w-full p-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white resize-y" rows={4} value={form.evidenceNotes} onChange={(event) => updateForm("evidenceNotes", event.target.value)} />
            ) : (
              <p className="m-0 text-[#111827] text-[0.9rem] font-semibold leading-[1.5]">
                {appeal?.evidenceNotes ?? ""}
              </p>
            )}
          </div>

          <div className="border border-[#e2e8f0] border-l-[4px] border-l-[#ffc107] rounded-lg bg-[#f8fafc] p-4 pl-5">
            <span className="block text-[#8A252C] text-[0.7rem] font-[900] uppercase tracking-wider mb-1.5">Supporting Files</span>
            {isEditing ? (
              <div className="flex items-center gap-4 flex-wrap">
                <label className="h-[36px] px-4 rounded-md border border-[#e2e8f0] bg-white text-[#344054] text-[0.85rem] font-bold shadow-sm hover:bg-[#f8fafc] transition-colors inline-flex items-center cursor-pointer">
                  Choose file
                  <input type="file" className="hidden" onChange={handleFileChange} />
                </label>
                <span className="text-[#64748b] text-[0.85rem] font-semibold truncate">{form.supportingFiles || "No file selected"}</span>
              </div>
            ) : (
              <p className="m-0 text-[#111827] text-[0.9rem] font-semibold leading-[1.5]">
                {appeal?.supportingFiles || "No supporting files attached."}
              </p>
            )}
          </div>

          {message && (
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-4 text-[#64748b] text-[0.85rem] font-semibold">
              {message}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-[#e5eaf1] pt-6">
            {isEditing ? (
              <>
                <button type="button" onClick={cancelEdit} className="h-[42px] px-6 rounded-lg border border-[#e2e8f0] bg-white text-[#344054] text-[0.9rem] font-bold shadow-sm hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:text-[#0f172a] transition-all">
                  Cancel
                </button>
                <button type="submit" className="h-[42px] px-6 rounded-lg bg-[#8A252C] text-white text-[0.9rem] font-bold shadow-sm hover:bg-[#681920] transition-colors">
                  Save Changes
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setIsEditing(true)} className="h-[42px] px-6 rounded-lg border border-[#e2e8f0] bg-white text-[#344054] text-[0.9rem] font-bold shadow-sm hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:text-[#0f172a] transition-all inline-flex items-center">
                Edit Appeal
              </button>
            )}
          </div>
        </form>

      </section>

    </div>
  );
}
