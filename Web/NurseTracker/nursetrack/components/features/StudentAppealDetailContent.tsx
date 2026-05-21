"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useHospitals } from "@/core/api/hooks/useHospitals";
import { useSchedules } from "@/core/api/hooks/useSchedules";
import { useInstructors } from "@/core/api/hooks/useUsers";
import { useStudentAppeal, useUpdateStudentAppeal, useUploadAppealFile } from "@/core/api/hooks/useStudentAppeals";
import { useAuthStore } from "@/core/store/authStore";
import { InlineSelect } from "@/components/ui/InlineSelect";
import { useToast } from "@/components/ui/ToastProvider";

function formatDate(date?: string) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function getFileName(fileUrl?: string) {
  if (!fileUrl) return "";
  try {
    return decodeURIComponent(new URL(fileUrl).pathname.split("/").pop() || "Supporting file");
  } catch {
    return fileUrl.split("/").pop() || "Supporting file";
  }
}

function formatSubmitted(date?: string) {
  if (!date) return "Submitted";
  return `Submitted ${new Date(date).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}`;
}

function appealStageKey(appeal: any) {
  if (appeal?.status === "ACCEPTED" || appeal?.status === "RETURNED") return appeal.status;
  if (appeal?.instructorDecision === "ACCEPTED") return "CI_ACCEPTED";
  if (appeal?.instructorDecision === "RETURNED") return "CI_RETURNED";
  return "PENDING";
}

function statusLabel(status?: string) {
  if (status === "ACCEPTED") return "Accepted";
  if (status === "RETURNED") return "Rejected";
  if (status === "CI_ACCEPTED") return "CI Accepted";
  if (status === "CI_RETURNED") return "CI Rejected";
  return "CI Pending";
}

function statusClass(status?: string) {
  if (status === "ACCEPTED" || status === "CI_ACCEPTED") return "bg-[#e9f8ef] text-[#03703c]";
  if (status === "RETURNED" || status === "CI_RETURNED") return "bg-[#fef2f2] text-[#991b1b]";
  return "bg-[#fff8e1] text-[#6c4c00]";
}

function appendOption(options: { value: string; label: string }[], value?: string, label?: string) {
  if (!value || options.some((option) => option.value === value)) return options;
  return [...options, { value, label: label || value }];
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
  title: "",
  studentReason: "",
  evidenceNotes: "",
  supportingFiles: "",
};

export function StudentAppealDetailContent() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const appealId = searchParams.get("id") ?? undefined;
  const user = useAuthStore((state) => state.user);
  const userId = user?.id != null ? String(user.id) : undefined;
  const { data: appeal } = useStudentAppeal(appealId);
  const { data: hospitals = [] } = useHospitals();
  const { data: instructors = [] } = useInstructors(userId);
  const { data: schedules = [] } = useSchedules(undefined, user?.role);
  const updateAppeal = useUpdateStudentAppeal(userId);
  const uploadAppealFile = useUploadAppealFile();
  const [isEditing, setIsEditing] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [form, setForm] = React.useState(emptyForm);
  const [selectedScheduleId, setSelectedScheduleId] = React.useState("");
  const canEdit = appeal?.status === "PENDING" && !appeal?.instructorDecision;
  const isSaving = updateAppeal.isPending;
  const isUploading = uploadAppealFile.isPending;

  const selectedHospital = hospitals.find((hospital: any) => hospital.name === form.clinicalSite);
  const allDutyAreas = React.useMemo(() => Array.from(new Set((hospitals as any[]).flatMap((hospital: any) => hospital.wards ?? []).filter(Boolean))).sort(), [hospitals]);
  const dutyAreas = selectedHospital?.wards?.length ? selectedHospital.wards : allDutyAreas;
  const selectedSchedule = React.useMemo(() => (schedules as any[]).find((schedule: any) => String(schedule.id) === selectedScheduleId), [schedules, selectedScheduleId]);
  const eligibleSchedules = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (schedules as any[]).filter((schedule: any) => schedule.date && new Date(`${schedule.date}T00:00:00`).getTime() <= today.getTime());
  }, [schedules]);
  const scheduleOptions = React.useMemo(() => {
    const options = eligibleSchedules.map((schedule: any) => ({ value: String(schedule.id), label: `${formatDate(schedule.date)} - ${schedule.area || schedule.hospital}` }));
    return [notApplicableOption, ...appendOption(options, selectedScheduleId === NOT_APPLICABLE_VALUE ? undefined : selectedScheduleId, form.relatedDutyDate ? `${formatDate(form.relatedDutyDate)} - ${form.dutyArea || form.clinicalSite}` : undefined)];
  }, [eligibleSchedules, form.clinicalSite, form.dutyArea, form.relatedDutyDate, selectedScheduleId]);
  const hospitalOptions = React.useMemo(() => [notApplicableFieldOption, ...appendOption((hospitals as any[]).map((hospital: any) => ({ value: hospital.name, label: hospital.fullName ? `${hospital.name} - ${hospital.fullName}` : hospital.name })), form.clinicalSite === NOT_APPLICABLE_LABEL ? undefined : form.clinicalSite)], [hospitals, form.clinicalSite]);
  const dutyAreaOptions = React.useMemo(() => [notApplicableFieldOption, ...appendOption(dutyAreas.map((area: string) => ({ value: area, label: area })), form.dutyArea === NOT_APPLICABLE_LABEL ? undefined : form.dutyArea)], [dutyAreas, form.dutyArea]);
  const instructorOptions = React.useMemo(() => [notApplicableOption, ...appendOption((instructors as any[]).map((instructor: any) => ({ value: String(instructor.id), label: instructor.fullName })), form.instructorId === NOT_APPLICABLE_VALUE ? undefined : form.instructorId, selectedSchedule?.instructorName ?? appeal?.instructorName)], [instructors, form.instructorId, selectedSchedule?.instructorName, appeal?.instructorName]);

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
    const matchingSchedule = (schedules as any[]).find((schedule: any) =>
      schedule.date === appeal.relatedDutyDate &&
      schedule.hospital === appeal.clinicalSite &&
      schedule.area === appeal.dutyArea
    );
    setSelectedScheduleId(isNotApplicableAppeal(appeal) ? NOT_APPLICABLE_VALUE : matchingSchedule ? String(matchingSchedule.id) : appeal.relatedDutyDate ? `appeal-${appeal.id}` : "");
  }, [appeal, schedules]);

  React.useEffect(() => {
    resetForm();
  }, [resetForm]);

  const updateForm = (field: keyof typeof emptyForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
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

  const cancelEdit = () => {
    resetForm();
    setIsEditing(false);
    setMessage("");
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
      updateForm("supportingFiles", uploaded.secure_url ?? uploaded.url ?? file.name);
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
    updateForm("supportingFiles", "");
    setMessage("Supporting file removed. Save changes to update the appeal.");
    showToast({ variant: "success", title: "File removed", message: "Save changes to remove it from this appeal." });
  };

  const saveAppeal = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canEdit) {
      setMessage("Accepted appeals can no longer be edited.");
      showToast({ variant: "error", title: "Appeal locked", message: "Accepted appeals can no longer be edited." });
      return;
    }
    const isNotApplicable = selectedScheduleId === NOT_APPLICABLE_VALUE;
    if (!appealId || !user || !form.appealType || (!isNotApplicable && !form.relatedDutyDate) || !form.clinicalSite || !form.dutyArea || (!isNotApplicable && !form.instructorId) || !form.title || !form.studentReason) {
      setMessage("Complete the appeal details before saving.");
      showToast({ variant: "error", title: "Missing appeal details", message: "Complete the appeal details before saving." });
      return;
    }

    try {
      await updateAppeal.mutateAsync({
        appealId,
        appeal: {
          student: { id: user.id },
          instructor: isNotApplicable ? null : { id: Number(form.instructorId) },
          appealType: form.appealType,
          relatedDutyDate: isNotApplicable ? null : form.relatedDutyDate,
          clinicalSite: isNotApplicable ? NOT_APPLICABLE_LABEL : form.clinicalSite,
          dutyArea: isNotApplicable ? NOT_APPLICABLE_LABEL : form.dutyArea,
          title: form.title,
          studentReason: form.studentReason,
          evidenceNotes: form.evidenceNotes,
          supportingFiles: form.supportingFiles,
        },
      });
      setIsEditing(false);
      setMessage("Appeal changes saved.");
      showToast({ variant: "success", title: "Appeal updated", message: "Your appeal changes were saved." });
    } catch {
      setMessage("Appeal changes could not be saved.");
      showToast({ variant: "error", title: "Update failed", message: "Appeal changes could not be saved." });
    }
  };

  return (
    <div className="p-10 pb-12 w-full grid gap-6">

      {/* Main Detail Card */}
      <section className="bg-white rounded-xl shadow-[0_4px_24px_rgba(32,33,36,0.04)] border border-[#e2e8f0] p-6 sm:p-8">

        {/* Header Info */}
        <div className="mb-6 border-b border-[#e5eaf1] pb-6">
          <p className="text-[#8A252C] text-[0.82rem] font-[900] tracking-[0.02em] uppercase m-0 mb-1 leading-tight">
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
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[0.75rem] font-bold shrink-0 ${statusClass(appealStageKey(appeal))}`}>
            {statusLabel(appealStageKey(appeal))}
          </span>
        </div>

        <p className="text-[#344054] text-[0.85rem] font-bold m-0 mb-6 flex flex-wrap items-center gap-3">
          {formatSubmitted(appeal?.createdAt)} <span className="font-semibold text-[#64748b]">Assigned CI: {appeal?.instructorName || NOT_APPLICABLE_LABEL}</span>
        </p>

        {/* 4-Column Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl mb-6 divide-y sm:divide-y-0 lg:divide-x divide-[#e2e8f0]">
          <div className="p-4 px-5">
            <span className="block text-[#64748b] text-[0.65rem] font-[800] uppercase tracking-wider mb-1">Appeal Type</span>
            {isEditing ? (
              <input className="w-full h-[38px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white" type="text" value={form.appealType} onChange={(event) => updateForm("appealType", event.target.value)} placeholder="Enter appeal type" />
            ) : (
              <strong className="text-[#111827] text-[0.9rem] font-bold">{appeal?.appealType ?? ""}</strong>
            )}
          </div>
          <div className="p-4 px-5 sm:border-l border-[#e2e8f0] lg:border-none">
            <span className="block text-[#64748b] text-[0.65rem] font-[800] uppercase tracking-wider mb-1">Related Duty Date</span>
            {isEditing ? (
              <InlineSelect value={selectedScheduleId} options={scheduleOptions} placeholder="Select duty date" onChange={handleScheduleChange} />
            ) : (
              <strong className="text-[#111827] text-[0.9rem] font-bold">{displayRelatedDutyDate(appeal?.relatedDutyDate)}</strong>
            )}
          </div>
          <div className="p-4 px-5">
            <span className="block text-[#64748b] text-[0.65rem] font-[800] uppercase tracking-wider mb-1">Clinical Site</span>
            {isEditing ? (
              <InlineSelect value={form.clinicalSite} options={hospitalOptions} placeholder="Select duty date first" onChange={() => undefined} disabled />
            ) : (
              <strong className="text-[#111827] text-[0.9rem] font-bold">{appeal?.clinicalSite ?? NOT_APPLICABLE_LABEL}</strong>
            )}
          </div>
          <div className="p-4 px-5 sm:border-l border-[#e2e8f0] lg:border-none">
            <span className="block text-[#64748b] text-[0.65rem] font-[800] uppercase tracking-wider mb-1">Duty Area</span>
            {isEditing ? (
              <InlineSelect value={form.dutyArea} options={dutyAreaOptions} placeholder="Select duty date first" onChange={() => undefined} disabled />
            ) : (
              <strong className="text-[#111827] text-[0.9rem] font-bold">{appeal?.dutyArea ?? NOT_APPLICABLE_LABEL}</strong>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="mb-6">
            <label className="block text-[#64748b] text-[0.65rem] font-[800] uppercase tracking-wider mb-1">Assigned Clinical Instructor</label>
            <InlineSelect value={form.instructorId} options={instructorOptions} placeholder="Select duty date first" onChange={() => undefined} disabled />
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
            <span className="block text-[#8A252C] text-[0.7rem] font-[900] uppercase tracking-wider mb-1.5">Supporting File</span>
            {isEditing ? (
              <div className="flex items-center gap-4 flex-wrap">
                <label className={`h-[36px] px-4 rounded-md border border-[#e2e8f0] bg-white text-[#344054] text-[0.85rem] font-bold shadow-sm hover:bg-[#f8fafc] transition-colors inline-flex items-center ${isUploading || !!form.supportingFiles ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                  {isUploading ? "Uploading..." : form.supportingFiles ? "File attached" : "Choose file"}
                  <input type="file" className="hidden" onChange={handleFileChange} disabled={isUploading || isSaving || !!form.supportingFiles} />
                </label>
                {form.supportingFiles ? (
                  <div className="inline-flex max-w-full items-center gap-2">
                    <a href={form.supportingFiles} target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center gap-2 rounded-md border border-[#e2e8f0] bg-white px-3 py-2 text-[#344054] text-[0.85rem] font-bold no-underline hover:border-[#cbd5e1] hover:bg-[#f8fafc] transition-colors">
                      <span aria-hidden="true">File</span>
                      <span className="truncate">{getFileName(form.supportingFiles)}</span>
                      <span className="text-[#8A252C]">Open</span>
                    </a>
                    <button type="button" onClick={removeFile} disabled={isUploading || isSaving} className="h-[36px] px-3 rounded-md border border-[#fecaca] bg-[#fef2f2] text-[#991b1b] text-[0.78rem] font-bold hover:bg-[#fee2e2] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">Remove</button>
                  </div>
                ) : (
                  <span className="text-[#64748b] text-[0.85rem] font-semibold truncate">No file selected</span>
                )}
              </div>
            ) : (
              appeal?.supportingFiles ? (
                <a href={appeal.supportingFiles} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 max-w-full rounded-md border border-[#e2e8f0] bg-white px-3 py-2 text-[#344054] text-[0.85rem] font-bold no-underline hover:border-[#cbd5e1] hover:bg-[#f8fafc] transition-colors">
                  <span aria-hidden="true">File</span>
                  <span className="truncate">{getFileName(appeal.supportingFiles)}</span>
                  <span className="text-[#8A252C]">Open</span>
                </a>
              ) : (
                <p className="m-0 text-[#111827] text-[0.9rem] font-semibold leading-[1.5]">No supporting files attached.</p>
              )
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
                <button type="button" onClick={cancelEdit} disabled={isSaving || isUploading} className="h-[42px] px-6 rounded-lg border border-[#e2e8f0] bg-white text-[#344054] text-[0.9rem] font-bold shadow-sm hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:text-[#0f172a] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving || isUploading} className="h-[42px] px-6 rounded-lg bg-[#8A252C] text-white text-[0.9rem] font-bold shadow-sm hover:bg-[#681920] transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : canEdit ? (
              <button type="button" onClick={() => setIsEditing(true)} className="h-[42px] px-6 rounded-lg border border-[#e2e8f0] bg-white text-[#344054] text-[0.9rem] font-bold shadow-sm hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:text-[#0f172a] transition-all inline-flex items-center cursor-pointer">
                Edit Appeal
              </button>
            ) : (
              <span className="inline-flex h-[42px] items-center rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-5 text-[0.85rem] font-[900] text-[#166534]">
                Appeal locked
              </span>
            )}
          </div>
        </form>

      </section>

    </div>
  );
}
