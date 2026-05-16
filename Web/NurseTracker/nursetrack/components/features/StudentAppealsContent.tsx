"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useHospitals } from "@/core/api/hooks/useHospitals";
import { useSchedules } from "@/core/api/hooks/useSchedules";
import { useAppealTypes, useCreateStudentAppeal, useStudentAppeals, useUpdateStudentAppeal, useUploadAppealFile } from "@/core/api/hooks/useStudentAppeals";
import { useInstructors } from "@/core/api/hooks/useUsers";
import { useAuthStore } from "@/core/store/authStore";
import { useToast } from "@/components/ui/ToastProvider";

function getInitials(name?: string) {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(date?: string) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatSubmitted(date?: string) {
  if (!date) return "Submitted";
  return `Submitted ${new Date(date).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}`;
}

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function statusClass(status: string) {
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

export function StudentAppealsContent() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const editingAppealId = searchParams.get("edit");
  const user = useAuthStore((state) => state.user);
  const userId = user?.id != null ? String(user.id) : undefined;
  const { data: appeals = [] } = useStudentAppeals(userId);
  const createAppeal = useCreateStudentAppeal(userId);
  const updateAppeal = useUpdateStudentAppeal(userId);
  const uploadAppealFile = useUploadAppealFile();
  const isSubmitting = createAppeal.isPending || updateAppeal.isPending;
  const isUploading = uploadAppealFile.isPending;
  const { data: hospitals = [] } = useHospitals();
  const { data: instructors = [] } = useInstructors();
  const { data: schedules = [] } = useSchedules(userId);
  const { data: appealTypes = [] } = useAppealTypes();
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("Complete the appeal details to submit it for CI recommendation.");
  const editingAppeal = appeals.find((appeal: any) => String(appeal.id) === editingAppealId);

  React.useEffect(() => {
    if (!editingAppeal) return;
    setForm({
      appealType: editingAppeal.appealType ?? "",
      relatedDutyDate: editingAppeal.relatedDutyDate ?? "",
      clinicalSite: editingAppeal.clinicalSite ?? "",
      dutyArea: editingAppeal.dutyArea ?? "",
      instructorId: editingAppeal.instructorId != null ? String(editingAppeal.instructorId) : "",
      title: editingAppeal.title ?? "",
      studentReason: editingAppeal.studentReason ?? "",
      evidenceNotes: editingAppeal.evidenceNotes ?? "",
      supportingFiles: editingAppeal.supportingFiles ?? "",
    });
    setMessage("Edit the appeal details and submit changes for CI recommendation.");
  }, [editingAppeal]);

  const selectedHospital = hospitals.find((hospital: any) => hospital.name === form.clinicalSite);
  const dutyAreas = selectedHospital?.wards ?? [];

  const groupedAppeals = useMemo(() => {
    return ["PENDING", "ACCEPTED", "RETURNED"]
      .map((status) => ({
        status,
        records: appeals.filter((appeal: any) => appeal.status === status),
      }))
      .filter((group) => group.records.length > 0);
  }, [appeals]);

  const updateForm = (field: keyof typeof emptyForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const clearForm = () => {
    setForm(emptyForm);
    setMessage("Complete the appeal details to submit it for CI recommendation.");
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setMessage("Uploading supporting file...");
      const uploaded = await uploadAppealFile.mutateAsync(file);
      updateForm("supportingFiles", uploaded.secure_url ?? uploaded.url ?? file.name);
      setMessage("Supporting file uploaded.");
      showToast({ variant: "success", title: "File uploaded", message: "Supporting file was attached to the appeal." });
    } catch {
      setMessage("Supporting file could not be uploaded. Check Cloudinary configuration.");
      showToast({ variant: "error", title: "Upload failed", message: "Check Cloudinary configuration and try again." });
    }
  };

  const submitAppeal = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !form.appealType || !form.relatedDutyDate || !form.clinicalSite || !form.dutyArea || !form.instructorId || !form.title || !form.studentReason) {
      setMessage("Complete the appeal details to submit it for CI recommendation.");
      showToast({ variant: "error", title: "Missing appeal details", message: "Complete the appeal details before submitting." });
      return;
    }

    try {
      const appealPayload = {
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
      };
      if (editingAppealId) {
        await updateAppeal.mutateAsync({ appealId: editingAppealId, appeal: appealPayload });
      } else {
        await createAppeal.mutateAsync(appealPayload);
      }
      clearForm();
      setMessage(editingAppealId ? "Appeal changes submitted for CI recommendation." : "Appeal submitted for CI recommendation.");
      showToast({ variant: "success", title: editingAppealId ? "Appeal updated" : "Appeal submitted", message: editingAppealId ? "Your appeal changes were saved." : "Your appeal was submitted for CI recommendation." });
    } catch {
      setMessage("Appeal could not be submitted.");
      showToast({ variant: "error", title: "Appeal failed", message: "Appeal could not be submitted." });
    }
  };

  return (
    <div className="p-10 pb-12 w-full grid gap-8">

      {/* Create Appeal Form */}
      <section className="bg-white rounded-xl shadow-[0_4px_24px_rgba(32,33,36,0.04)] border border-[#e2e8f0] p-[clamp(20px,4vw,32px)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-[1.25rem] font-[800] text-[#111827] m-0">{editingAppealId ? "Edit Appeal Details" : "Appeal Details"}</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#fff8e1] text-[#6c4c00] text-[0.75rem] font-bold">
            {editingAppealId ? "Editing" : "Draft"}
          </span>
        </div>

        <form className="grid gap-6" onSubmit={submitAppeal}>
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Appeal Type</label>
              <select className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] cursor-pointer shadow-sm text-[0.9rem]" value={form.appealType} onChange={(event) => updateForm("appealType", event.target.value)}>
                <option value="" disabled hidden>Select appeal type</option>
                {appealTypes.map((appealType: any) => (
                  <option key={appealType.id ?? appealType.value} value={appealType.value}>{appealType.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Related Duty Date</label>
              <input
                type="date"
                value={form.relatedDutyDate}
                onChange={(event) => updateForm("relatedDutyDate", event.target.value)}
                list="student-duty-dates"
                className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] shadow-sm text-[0.9rem]"
              />
              <datalist id="student-duty-dates">
                {schedules.map((schedule: any) => (
                  <option key={schedule.id} value={schedule.date}>{schedule.hospital} - {schedule.area}</option>
                ))}
              </datalist>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Clinical Site</label>
              <select className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] cursor-pointer shadow-sm text-[0.9rem]" value={form.clinicalSite} onChange={(event) => setForm((current) => ({ ...current, clinicalSite: event.target.value, dutyArea: "" }))}>
                <option value="" disabled hidden>Select clinical site</option>
                {hospitals.map((hospital: any) => (
                  <option key={hospital.id} value={hospital.name}>{hospital.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Duty Area</label>
              <select className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] cursor-pointer shadow-sm text-[0.9rem]" value={form.dutyArea} onChange={(event) => updateForm("dutyArea", event.target.value)}>
                <option value="" disabled hidden>Select duty area</option>
                {dutyAreas.map((area: string) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3 */}
          <div className="flex flex-col">
            <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Assigned Clinical Instructor</label>
            <select className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] cursor-pointer shadow-sm text-[0.9rem]" value={form.instructorId} onChange={(event) => updateForm("instructorId", event.target.value)}>
              <option value="" disabled hidden>Select assigned CI</option>
              {instructors.map((instructor: any) => (
                <option key={instructor.id} value={instructor.id}>{instructor.fullName}</option>
              ))}
            </select>
          </div>

          {/* Row 4 */}
          <div className="flex flex-col">
            <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Appeal Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(event) => updateForm("title", event.target.value)}
              placeholder="Enter appeal title"
              className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] shadow-sm text-[0.9rem] placeholder:text-[#94a3b8]"
            />
          </div>

          {/* Row 5 */}
          <div className="flex flex-col">
            <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Student Reason</label>
            <textarea
              rows={4}
              value={form.studentReason}
              onChange={(event) => updateForm("studentReason", event.target.value)}
              placeholder="Explain why the appeal should be considered."
              className="w-full p-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] shadow-sm text-[0.9rem] placeholder:text-[#94a3b8] resize-y"
            ></textarea>
          </div>

          {/* Row 6 */}
          <div className="flex flex-col">
            <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Supporting Evidence or Notes</label>
            <textarea
              rows={4}
              value={form.evidenceNotes}
              onChange={(event) => updateForm("evidenceNotes", event.target.value)}
              placeholder="Add note summaries, timestamps, screenshots, or supporting document details."
              className="w-full p-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] shadow-sm text-[0.9rem] placeholder:text-[#94a3b8] resize-y"
            ></textarea>
          </div>

          {/* File Upload */}
          <div className="flex flex-col">
            <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Supporting Files</label>
            <div className="flex items-center gap-4 w-full p-3 border border-[#dbe3ee] rounded-lg bg-white shadow-sm">
                <label className={`h-[36px] px-4 rounded-md border border-[#e2e8f0] bg-white text-[#344054] text-[0.85rem] font-bold shadow-sm hover:bg-[#f8fafc] transition-colors inline-flex items-center ${isUploading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                {isUploading ? "Uploading..." : "Choose file"}
                <input type="file" className="hidden" onChange={handleFileChange} disabled={isUploading || isSubmitting} />
              </label>
              <span className="text-[#64748b] text-[0.85rem] font-semibold truncate">{form.supportingFiles || "No file selected"}</span>
            </div>
            <p className="mt-2 text-[#64748b] text-[0.8rem] font-semibold">Attach screenshots, PDFs, or documents that support the appeal.</p>
          </div>

          {/* Notice Block */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-4 mt-2">
            <p className="text-[#64748b] text-[0.85rem] font-semibold m-0">{message}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-4">
            <button type="button" onClick={clearForm} disabled={isSubmitting || isUploading} className="h-[42px] px-6 rounded-lg border border-[#e2e8f0] bg-white text-[#344054] text-[0.9rem] font-bold shadow-sm hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:text-[#0f172a] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
              Clear
            </button>
            <button type="submit" disabled={isSubmitting || isUploading} className="h-[42px] px-6 rounded-lg bg-[#8A252C] text-white text-[0.9rem] font-bold shadow-sm hover:bg-[#681920] transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
              {isSubmitting ? "Submitting..." : editingAppealId ? "Submit Changes" : "Submit Appeal"}
            </button>
          </div>
        </form>
      </section>

      {/* History Section */}
      <section className="bg-white rounded-xl shadow-[0_4px_24px_rgba(32,33,36,0.04)] border border-[#e2e8f0] p-[clamp(20px,4vw,32px)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-[1.25rem] font-[800] text-[#111827] m-0">{user?.fullName ?? 'My'} Appeal History</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#e9f8ef] text-[#03703c] text-[0.75rem] font-bold whitespace-nowrap">
            {appeals.length} records
          </span>
        </div>

        <div className="grid gap-8">
          {groupedAppeals.length > 0 ? (
            groupedAppeals.map((group) => (
              <div key={group.status}>
                <div className="flex items-center justify-between border-b border-[#e5eaf1] pb-2 mb-4">
                  <span className="text-[#64748b] text-[0.78rem] font-[800] tracking-wider uppercase">{group.status}</span>
                  <span className="text-[#64748b] text-[0.78rem] font-[800] tracking-wider uppercase">{group.records.length} RECORD{group.records.length === 1 ? "" : "S"}</span>
                </div>

                <div className="grid gap-4">
                  {group.records.map((appeal: any) => (
                    <Link key={appeal.id} href={`/nursing-student/appeals/detail?id=${appeal.id}`} className="block relative border border-[#e2e8f0] rounded-xl p-5 hover:border-[#cbd5e1] hover:shadow-md transition-all cursor-pointer no-underline bg-white">
                      <div className="flex items-start gap-4">
                        {user?.profileImageUrl ? (
                          <img src={user.profileImageUrl} alt="Profile" className="w-[42px] h-[42px] shrink-0 rounded-full object-cover border border-[#e2e8f0] mt-1" />
                        ) : (
                          <div className="w-[42px] h-[42px] shrink-0 bg-[#ffc107] text-[#111827] rounded-full flex items-center justify-center font-[800] text-[0.95rem] mt-1">
                            {getInitials(user?.fullName)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-1">
                            <h3 className="text-[1.1rem] font-[800] text-[#111827] m-0 leading-[1.3] truncate">{appeal.title}</h3>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[0.75rem] font-bold shrink-0 ${statusClass(appeal.status)}`}>
                              {statusLabel(appeal.status)}
                            </span>
                          </div>
                          <p className="text-[#344054] text-[0.9rem] font-bold m-0 mb-1.5 truncate">
                            {appeal.appealType} - {formatDate(appeal.relatedDutyDate)} - {appeal.clinicalSite}
                          </p>
                          <p className="text-[#64748b] text-[0.85rem] font-semibold m-0 truncate">
                            {formatSubmitted(appeal.createdAt)} - {appeal.supportingFiles ? "Files attached" : "No files attached"}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="border border-[#e2e8f0] rounded-xl p-5 bg-white text-[#64748b] text-[0.9rem] font-semibold">
              No appeal records yet.
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
