"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useHospitals } from "@/core/api/hooks/useHospitals";
import { useSchedules } from "@/core/api/hooks/useSchedules";
import { useCreateStudentAppeal, useStudentAppeals, useUpdateStudentAppeal, useUploadAppealFile } from "@/core/api/hooks/useStudentAppeals";
import { useInstructors } from "@/core/api/hooks/useUsers";
import { useAuthStore } from "@/core/store/authStore";
import { InlineSelect } from "@/components/ui/InlineSelect";
import { useToast } from "@/components/ui/ToastProvider";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";

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

function displayFileName(fileUrl?: string, fileName?: string) {
  return fileName || getFileName(fileUrl);
}

function appealStageKey(appeal: any) {
  if (appeal?.status === "ACCEPTED" || appeal?.status === "RETURNED") return appeal.status;
  if (appeal?.instructorDecision === "ACCEPTED") return "CI_ACCEPTED";
  if (appeal?.instructorDecision === "RETURNED") return "CI_RETURNED";
  return "PENDING";
}

function statusLabel(status: string) {
  if (status === "ACCEPTED") return "Accepted";
  if (status === "RETURNED") return "Rejected";
  if (status === "CI_ACCEPTED") return "CI Accepted";
  if (status === "CI_RETURNED") return "CI Rejected";
  return "CI Pending";
}

function statusClass(status: string) {
  if (status === "ACCEPTED" || status === "CI_ACCEPTED") return "bg-[#e9f8ef] text-[#03703c]";
  if (status === "RETURNED" || status === "CI_RETURNED") return "bg-[#fef2f2] text-[#991b1b]";
  return "bg-[#fff8e1] text-[#6c4c00]";
}

function appendOption(options: { value: string; label: string }[], value?: string, label?: string) {
  if (!value || options.some((option) => option.value === value)) return options;
  return [...options, { value, label: label || value }];
}

function errorMessage(error: unknown, fallback: string) {
  const response = (error as { response?: { data?: { message?: string; error?: string } | string } })?.response;
  if (typeof response?.data === "string" && response.data.trim()) return response.data;
  if (typeof response?.data === "object" && response.data?.message) return response.data.message;
  if (typeof response?.data === "object" && response.data?.error) return response.data.error;
  return fallback;
}

const NOT_APPLICABLE_VALUE = "not-applicable";
const NOT_APPLICABLE_LABEL = "Not Applicable";
const notApplicableOption = { value: NOT_APPLICABLE_VALUE, label: NOT_APPLICABLE_LABEL };
const notApplicableFieldOption = { value: NOT_APPLICABLE_LABEL, label: NOT_APPLICABLE_LABEL };

function isNotApplicableAppeal(appeal: any) {
  return !appeal?.relatedDutyDate && (appeal?.clinicalSite === NOT_APPLICABLE_LABEL || appeal?.dutyArea === NOT_APPLICABLE_LABEL || !appeal?.instructorId);
}

function displayRelatedDutyDate(date?: string) {
  return date ? formatDate(date) : NOT_APPLICABLE_LABEL;
}

const emptyForm = {
  appealType: "",
  relatedDutyDate: "",
  clinicalSite: "",
  dutyArea: "",
  instructorId: "",
  subject: "",
  details: "",
  evidenceNotes: "",
  supportingFiles: "",
  supportingFileName: "",
};

export function StudentAppealsContent() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const editingAppealId = searchParams.get("edit");
  const user = useAuthStore((state) => state.user);
  const userId = user?.id != null ? String(user.id) : undefined;
  const { data: appeals = [] } = useStudentAppeals();
  const createAppeal = useCreateStudentAppeal();
  const updateAppeal = useUpdateStudentAppeal();
  const uploadAppealFile = useUploadAppealFile();
  const isSubmitting = createAppeal.isPending || updateAppeal.isPending;
  const isUploading = uploadAppealFile.isPending;
  const { data: hospitals = [] } = useHospitals();
  const { data: instructors = [] } = useInstructors(userId);
  const { data: schedules = [] } = useSchedules(undefined, user?.role);
  const [form, setForm] = useState(emptyForm);
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [message, setMessage] = useState("Complete the appeal details to submit it for CI recommendation.");
  const editingAppeal = appeals.find((appeal: any) => String(appeal.id) === editingAppealId);

  React.useEffect(() => {
    if (!editingAppeal) return;
    const matchingSchedule = (schedules as any[]).find((schedule: any) =>
      schedule.date === editingAppeal.relatedDutyDate &&
      schedule.hospital === editingAppeal.clinicalSite &&
      schedule.area === editingAppeal.dutyArea
    );
    setForm({
      appealType: editingAppeal.appealType ?? "",
      relatedDutyDate: editingAppeal.relatedDutyDate ?? "",
      clinicalSite: editingAppeal.clinicalSite ?? "",
      dutyArea: editingAppeal.dutyArea ?? "",
      instructorId: editingAppeal.instructorId != null ? String(editingAppeal.instructorId) : "",
      subject: editingAppeal.title ?? editingAppeal.subject ?? "",
      details: editingAppeal.studentReason ?? editingAppeal.details ?? "",
      evidenceNotes: editingAppeal.evidenceNotes ?? "",
      supportingFiles: editingAppeal.supportingFiles ?? "",
      supportingFileName: editingAppeal.supportingFileName ?? "",
    });
    setSelectedScheduleId(isNotApplicableAppeal(editingAppeal) ? NOT_APPLICABLE_VALUE : matchingSchedule ? String(matchingSchedule.id) : editingAppeal.relatedDutyDate ? `appeal-${editingAppeal.id}` : "");
    setMessage("Edit the appeal details and submit changes for CI recommendation.");
  }, [editingAppeal, schedules]);

  const selectedHospital = hospitals.find((hospital: any) => hospital.name === form.clinicalSite);
  const allDutyAreas = useMemo(() => Array.from(new Set((hospitals as any[]).flatMap((hospital: any) => hospital.wards ?? []).filter(Boolean))).sort(), [hospitals]);
  const dutyAreas = selectedHospital?.wards?.length ? selectedHospital.wards : allDutyAreas;
  const selectedSchedule = useMemo(() => (schedules as any[]).find((schedule: any) => String(schedule.id) === selectedScheduleId), [schedules, selectedScheduleId]);
  const eligibleSchedules = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (schedules as any[]).filter((schedule: any) => {
      if (!schedule.date) return false;
      return new Date(`${schedule.date}T00:00:00`).getTime() <= today.getTime();
    });
  }, [schedules]);
  const scheduleOptions = useMemo(() => {
    const options = eligibleSchedules.map((schedule: any) => ({ value: String(schedule.id), label: `${formatDate(schedule.date)} - ${schedule.area || schedule.hospital}` }));
    return [notApplicableOption, ...appendOption(options, selectedScheduleId === NOT_APPLICABLE_VALUE ? undefined : selectedScheduleId, form.relatedDutyDate ? `${formatDate(form.relatedDutyDate)} - ${form.dutyArea || form.clinicalSite}` : undefined)];
  }, [eligibleSchedules, form.clinicalSite, form.dutyArea, form.relatedDutyDate, selectedScheduleId]);
  const hospitalOptions = useMemo(() => [notApplicableFieldOption, ...appendOption((hospitals as any[]).map((hospital: any) => ({ value: hospital.name, label: hospital.fullName ? `${hospital.name} - ${hospital.fullName}` : hospital.name })), form.clinicalSite === NOT_APPLICABLE_LABEL ? undefined : form.clinicalSite)], [hospitals, form.clinicalSite]);
  const dutyAreaOptions = useMemo(() => [notApplicableFieldOption, ...appendOption(dutyAreas.map((area: string) => ({ value: area, label: area })), form.dutyArea === NOT_APPLICABLE_LABEL ? undefined : form.dutyArea)], [dutyAreas, form.dutyArea]);
  const instructorOptions = useMemo(() => [notApplicableOption, ...appendOption((instructors as any[]).map((instructor: any) => ({ value: String(instructor.id), label: instructor.fullName })), form.instructorId === NOT_APPLICABLE_VALUE ? undefined : form.instructorId, selectedSchedule?.instructorName ?? editingAppeal?.instructorName)], [instructors, form.instructorId, selectedSchedule?.instructorName, editingAppeal?.instructorName]);

  const groupedAppeals = useMemo(() => {
    return ["PENDING", "CI_ACCEPTED", "CI_RETURNED", "ACCEPTED", "RETURNED"]
      .map((status) => ({
        status,
        records: appeals.filter((appeal: any) => appealStageKey(appeal) === status),
      }))
      .filter((group) => group.records.length > 0);
  }, [appeals]);

  const updateForm = (field: keyof typeof emptyForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const clearForm = () => {
    setForm(emptyForm);
    setSelectedScheduleId("");
    setMessage("Complete the appeal details to submit it for CI recommendation.");
  };

  const handleScheduleChange = (value: string) => {
    if (value === NOT_APPLICABLE_VALUE) {
      setSelectedScheduleId(value);
      setForm((current) => ({
        ...current,
        relatedDutyDate: "",
        clinicalSite: NOT_APPLICABLE_LABEL,
        dutyArea: NOT_APPLICABLE_LABEL,
        instructorId: NOT_APPLICABLE_VALUE,
      }));
      return;
    }
    const schedule = (schedules as any[]).find((item: any) => String(item.id) === value);
    setSelectedScheduleId(value);
    if (!schedule) return;
    setForm((current) => ({
      ...current,
      relatedDutyDate: schedule.date ?? "",
      clinicalSite: schedule.hospital ?? "",
      dutyArea: schedule.area ?? "",
      instructorId: schedule.instructorId != null ? String(schedule.instructorId) : "",
    }));
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (form.supportingFiles) {
      showToast({ variant: "error", title: "Remove current file", message: "Only one supporting file can be attached. Remove the current file first." });
      event.target.value = "";
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setMessage("Uploading supporting file...");
      const uploaded = await uploadAppealFile.mutateAsync(file);
      setForm((current) => ({ ...current, supportingFiles: uploaded.secure_url ?? uploaded.url ?? file.name, supportingFileName: file.name }));
      setMessage("Supporting file uploaded.");
      showToast({ variant: "success", title: "File uploaded", message: "Supporting file was attached to the appeal." });
    } catch {
      setMessage("Supporting file could not be uploaded. Check Cloudinary configuration.");
      showToast({ variant: "error", title: "Upload failed", message: "Check Cloudinary configuration and try again." });
    } finally {
      event.target.value = "";
    }
  };

  const removeFile = () => {
    setForm((current) => ({ ...current, supportingFiles: "", supportingFileName: "" }));
    setMessage("Supporting file removed.");
    showToast({ variant: "success", title: "File removed", message: "The supporting file was removed from this appeal." });
  };

  const submitAppeal = async (event: React.FormEvent) => {
    event.preventDefault();
    const isNotApplicable = selectedScheduleId === NOT_APPLICABLE_VALUE;
    if (!user || !form.appealType || (!isNotApplicable && !form.relatedDutyDate) || !form.clinicalSite || !form.dutyArea || (!isNotApplicable && !form.instructorId) || !form.subject || !form.details) {
      setMessage("Complete the appeal details to submit it for CI recommendation.");
      showToast({ variant: "error", title: "Missing appeal details", message: "Complete the appeal details before submitting." });
      return;
    }

    try {
      const appealPayload = {
        student: { id: user.id },
        instructor: isNotApplicable ? null : { id: Number(form.instructorId) },
        appealType: form.appealType,
        relatedDutyDate: isNotApplicable ? null : form.relatedDutyDate,
        clinicalSite: isNotApplicable ? NOT_APPLICABLE_LABEL : form.clinicalSite,
        dutyArea: isNotApplicable ? NOT_APPLICABLE_LABEL : form.dutyArea,
        subject: form.subject,
        title: form.subject,
        details: form.details,
        studentReason: form.details,
        evidenceNotes: form.evidenceNotes,
        supportingFiles: form.supportingFiles,
        supportingFileName: form.supportingFileName,
      };
      if (editingAppealId) {
        await updateAppeal.mutateAsync({ appealId: editingAppealId, appeal: appealPayload });
      } else {
        await createAppeal.mutateAsync(appealPayload);
      }
      clearForm();
      setMessage(editingAppealId ? "Appeal changes submitted for CI recommendation." : "Appeal submitted for CI recommendation.");
      showToast({ variant: "success", title: editingAppealId ? "Appeal updated" : "Appeal submitted", message: editingAppealId ? "Your appeal changes were saved." : "Your appeal was submitted for CI recommendation." });
    } catch (error) {
      const backendMessage = errorMessage(error, "Appeal could not be submitted.");
      setMessage(backendMessage);
      showToast({ variant: "error", title: "Appeal failed", message: backendMessage });
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
              <input
                type="text"
                value={form.appealType}
                onChange={(event) => updateForm("appealType", event.target.value)}
                placeholder="Enter appeal type"
                className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] shadow-sm text-[0.9rem] placeholder:text-[#94a3b8]"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Related Duty Date</label>
              <InlineSelect value={selectedScheduleId} options={scheduleOptions} placeholder="Select duty date" onChange={handleScheduleChange} />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Clinical Site</label>
              <InlineSelect value={form.clinicalSite} options={hospitalOptions} placeholder="Select duty date first" onChange={() => undefined} disabled />
            </div>
            <div className="flex flex-col">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Duty Area</label>
              <InlineSelect value={form.dutyArea} options={dutyAreaOptions} placeholder="Select duty date first" onChange={() => undefined} disabled />
            </div>
          </div>

          {/* Row 3 */}
          <div className="flex flex-col">
            <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Assigned Clinical Instructor</label>
            <InlineSelect value={form.instructorId} options={instructorOptions} placeholder="Select duty date first" onChange={() => undefined} disabled />
          </div>

          {/* Row 4 */}
          <div className="flex flex-col">
            <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Title</label>
            <input
              type="text"
              value={form.subject}
              onChange={(event) => updateForm("subject", event.target.value)}
              placeholder="Enter appeal title"
              className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] shadow-sm text-[0.9rem] placeholder:text-[#94a3b8]"
            />
          </div>

          {/* Row 5 */}
          <div className="flex flex-col">
            <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Student Reason</label>
            <textarea
              rows={4}
              value={form.details}
              onChange={(event) => updateForm("details", event.target.value)}
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
            <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Supporting File</label>
            <div className="flex items-center gap-4 w-full p-3 border border-[#dbe3ee] rounded-lg bg-white shadow-sm">
                <label className={`h-[36px] px-4 rounded-md border border-[#e2e8f0] bg-white text-[#344054] text-[0.85rem] font-bold shadow-sm hover:bg-[#f8fafc] transition-colors inline-flex items-center ${isUploading || !!form.supportingFiles ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                {isUploading ? "Uploading..." : form.supportingFiles ? "File attached" : "Choose file"}
                <input type="file" className="hidden" onChange={handleFileChange} disabled={isUploading || isSubmitting || !!form.supportingFiles} />
              </label>
              {form.supportingFiles ? (
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <a href={form.supportingFiles} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-[#344054] text-[0.85rem] font-bold underline-offset-2 hover:underline">{displayFileName(form.supportingFiles, form.supportingFileName)}</a>
                  <button type="button" onClick={removeFile} disabled={isUploading || isSubmitting} className="h-[32px] px-3 rounded-md border border-[#fecaca] bg-[#fef2f2] text-[#991b1b] text-[0.78rem] font-bold hover:bg-[#fee2e2] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">Remove</button>
                </div>
              ) : (
                <span className="text-[#64748b] text-[0.85rem] font-semibold truncate">No file selected</span>
              )}
            </div>
            <p className="mt-2 text-[#64748b] text-[0.8rem] font-semibold">Attach one screenshot, PDF, or document that supports the appeal.</p>
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
            {appeals.length} record(s)
          </span>
        </div>

        <div className="grid gap-8">
          {groupedAppeals.length > 0 ? (
            groupedAppeals.map((group) => (
              <div key={group.status}>
                <div className="flex items-center justify-between border-b border-[#e5eaf1] pb-2 mb-4">
                  <span className="text-[#64748b] text-[0.78rem] font-[800] tracking-wider uppercase">{statusLabel(group.status)}</span>
                  <span className="text-[#64748b] text-[0.78rem] font-[800] tracking-wider uppercase">{group.records.length} RECORD{group.records.length === 1 ? "" : "S"}</span>
                </div>

                <div className="grid gap-4">
                  {group.records.map((appeal: any) => (
                    <Link key={appeal.id} href={`/nursing-student/appeals/detail?id=${appeal.id}`} className="block relative border border-[#e2e8f0] rounded-xl p-5 hover:border-[#cbd5e1] hover:shadow-md transition-all cursor-pointer no-underline bg-white">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          <ProfileAvatar name={user?.fullName || "Nursing Student"} imageUrl={user?.profileImageUrl} size={42} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-1">
                            <h3 className="text-[1.1rem] font-[800] text-[#111827] m-0 leading-[1.3] truncate">{appeal.title || appeal.subject}</h3>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[0.75rem] font-bold shrink-0 ${statusClass(appealStageKey(appeal))}`}>
                              {statusLabel(appealStageKey(appeal))}
                            </span>
                          </div>
                          <p className="text-[#344054] text-[0.9rem] font-bold m-0 mb-1.5 truncate">
                            {appeal.appealType} - {displayRelatedDutyDate(appeal.relatedDutyDate)} - {appeal.clinicalSite || NOT_APPLICABLE_LABEL}
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
