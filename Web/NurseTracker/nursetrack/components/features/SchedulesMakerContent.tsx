"use client";

import React, { useMemo, useRef, useState } from "react";
import { useHospitals } from "@/core/api/hooks/useHospitals";
import { useInstructors, useUsers } from "@/core/api/hooks/useUsers";
import { usePreviewScheduleImport, usePublishScheduleImport } from "@/core/api/hooks/useSchedules";
import { useAuthStore } from "@/core/store/authStore";
import { useCanEditFeature } from "@/core/auth/permissions";
import type { User } from "@/core/types/user";
import { InlineSelect } from "@/components/ui/InlineSelect";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { useToast } from "@/components/ui/ToastProvider";

type StudentRecord = {
  name: string;
  matched: boolean;
  schoolId?: string;
  section?: string;
  group?: string;
  levels?: number[];
  profileImageUrl?: string;
};

type DraftGroup = {
  id: string;
  section: string;
  group?: string;
  startDate: string;
  endDate: string;
  breakDates: string[];
  shiftStart: string;
  shiftEnd: string;
  hospitalArea: string;
  dutyType: string;
  casePresentationDate: string;
  casePresentationTime: string;
  noCasePresentation: boolean;
  instructor: string;
  students: string[];
  studentRecords?: StudentRecord[];
  matchedStudents?: number;
  skippedStudents?: number;
  instructorMatched?: boolean;
  locationMatched?: boolean;
};

type ScheduleImportPreview = {
  fileName: string;
  level: number;
  groups: DraftGroup[];
  totalStudents: number;
  matchedStudents: number;
  skippedStudents: number;
};

const dutyTypeOptions = [
  { value: "Regular", label: "Regular" },
  { value: "Completion", label: "Completion" },
  { value: "Extension", label: "Extension" },
];

function parseTimeParts(value: string) {
  const match = value.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  return {
    hour: match ? match[1].padStart(2, "0") : "08",
    minute: match ? match[2] ?? "00" : "00",
    period: match ? match[3].toUpperCase() : "AM",
  };
}

function ScheduleTimePicker({ label, value, onChange, disabled }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const parts = parseTimeParts(value);
  const hours = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  const minutes = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));
  const periods = ["AM", "PM"];

  function setPart(updates: Partial<typeof parts>, close = false) {
    const next = { ...parts, ...updates };
    onChange(`${next.hour}:${next.minute} ${next.period}`);
    if (close) setOpen(false);
  }

  return (
    <label className="relative grid gap-2 !text-[#344054] !text-[0.88rem] !font-[800]">
      {label}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-[48px] items-center justify-between rounded-lg border border-[#dbe3ee] bg-white px-4 text-left !font-[800] !text-[#111827] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span>{value || "--:-- --"}</span>
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
      </button>
      {open && !disabled && (
        <div className="absolute left-0 top-[76px] z-30 grid w-[min(260px,calc(100vw-3rem))] grid-cols-[1fr_1fr_1fr] gap-1 rounded-lg border border-[#cbd5e1] bg-white p-1 shadow-[0_16px_34px_rgba(15,23,42,0.12)]">
          <div className="grid max-h-[238px] gap-1 overflow-y-auto pr-1">
            {hours.map((hour) => <button key={hour} type="button" onClick={() => setPart({ hour })} className={`min-h-[34px] px-3 !font-[800] cursor-pointer ${parts.hour === hour ? "bg-[#0d6efd] !text-white" : "bg-white !text-[#111827] hover:bg-[#f1f5f9]"}`}>{hour}</button>)}
          </div>
          <div className="grid max-h-[238px] gap-1 overflow-y-auto pr-1">
            {minutes.map((minute) => <button key={minute} type="button" onClick={() => setPart({ minute })} className={`min-h-[34px] px-3 !font-[800] cursor-pointer ${parts.minute === minute ? "bg-[#0d6efd] !text-white" : "bg-white !text-[#111827] hover:bg-[#f1f5f9]"}`}>{minute}</button>)}
          </div>
          <div className="grid content-start gap-1">
            {periods.map((period) => <button key={period} type="button" onClick={() => setPart({ period }, true)} className={`min-h-[34px] px-3 !font-[800] cursor-pointer ${parts.period === period ? "bg-[#0d6efd] !text-white" : "bg-white !text-[#111827] hover:bg-[#f1f5f9]"}`}>{period}</button>)}
          </div>
        </div>
      )}
    </label>
  );
}

function getStudentRecords(group: DraftGroup): StudentRecord[] {
  return group.studentRecords?.length ? group.studentRecords : group.students.map((name) => ({ name, matched: true }));
}

function formatStudentLevel(student: User) {
  return formatLevels(student.assignedLevels);
}

function formatLevels(value?: number[]) {
  const levels = value?.filter((level) => Number.isFinite(level)).sort((a, b) => a - b) ?? [];
  if (levels.length === 0) return "No level";
  if (levels.length === 1) return `Level ${levels[0]}`;
  return `Levels ${levels.join(", ")}`;
}

function normalizeSection(value?: string) {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
}

function hasSectionMismatch(student: StudentRecord, group?: DraftGroup) {
  return Boolean(student.section && group?.section && normalizeSection(student.section) !== normalizeSection(group.section));
}

function levelFromSection(value?: string) {
  const match = value?.match(/BSN\s*(\d)|N\s*(\d)|Level\s*(\d)/i);
  return match ? Number(match[1] ?? match[2] ?? match[3]) : undefined;
}

function inferDraftLevel(groups: DraftGroup[]) {
  const levels = new Set<number>();
  groups.forEach((group) => {
    const groupLevel = levelFromSection(group.section);
    if (groupLevel) {
      levels.add(groupLevel);
    } else {
      getStudentRecords(group).forEach((student) => student.levels?.forEach((level) => Number.isFinite(level) && levels.add(level)));
    }
  });
  return levels.size === 1 ? Array.from(levels)[0] : undefined;
}

function publishDisabledReason(groups: DraftGroup[], preview: ScheduleImportPreview | null, isPublishing: boolean) {
  if (isPublishing) return "Schedule is currently being published.";
  if (groups.length === 0) return "Create a manual schedule or upload a schedule file first.";
  const incompleteGroup = groups.find((group) => !group.startDate || !group.endDate || !group.shiftStart || !group.shiftEnd || !group.hospitalArea || !group.instructor || !group.section?.trim() || (!group.noCasePresentation && (!group.casePresentationDate || !group.casePresentationTime)));
  if (incompleteGroup) return "Complete section, date range, shift time, hospital/area, case presentation, and supervising CI before publishing.";
  if (groups.some((group) => getStudentRecords(group).filter((student) => student.matched).length === 0)) return "Add at least one matched database student to every schedule group.";
  if (!preview && !inferDraftLevel(groups)) return "Manual schedules need one clear level. Add students from one level or include the level in the section name.";
  if (preview && !preview.level) return "The uploaded file did not detect a valid level.";
  return "";
}

function buildPublishPayload(groups: DraftGroup[], preview: ScheduleImportPreview | null, fileName: string): ScheduleImportPreview {
  const normalizedGroups = groups.map((group) => {
    const records = getStudentRecords(group);
    const matchedRecords = records.filter((student) => student.matched);
    return {
      ...group,
      breakDates: group.breakDates ?? [],
      dutyType: group.dutyType || "Regular",
      students: matchedRecords.map((student) => student.name),
      studentRecords: records,
      matchedStudents: matchedRecords.length,
      skippedStudents: records.length - matchedRecords.length,
      instructorMatched: group.instructorMatched ?? true,
      locationMatched: group.locationMatched ?? true,
    };
  });
  const totalStudents = normalizedGroups.reduce((sum, group) => sum + getStudentRecords(group).length, 0);
  const matchedStudents = normalizedGroups.reduce((sum, group) => sum + (group.matchedStudents ?? 0), 0);
  return {
    fileName: preview?.fileName || (fileName !== "No file selected" ? fileName : "Manual schedule"),
    level: preview?.level || inferDraftLevel(groups) || 0,
    groups: normalizedGroups,
    totalStudents,
    matchedStudents,
    skippedStudents: totalStudents - matchedStudents,
  };
}

function SectionMismatchIcon({ studentSection, uploadedSection }: { studentSection?: string; uploadedSection?: string }) {
  return (
    <span className="group relative inline-flex items-center align-middle ml-1">
      <svg 
        viewBox="0 0 24 24" 
        className="h-4 w-4 fill-[#f59e0b] stroke-[#92400e] stroke-[1.8]" 
        aria-label="Section mismatch warning"
      >
        <path d="M12 3 2.5 20h19L12 3Z" />
        <path d="M12 9v5" className="stroke-white" />
        <path d="M12 17h.01" className="stroke-white" />
      </svg>
      <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 w-[260px] -translate-y-1/2 rounded-lg border border-[#f1d38a] bg-[#fffaf0] px-3 py-2 !text-[0.75rem] !font-[800] leading-[1.35] !text-[#744b00] shadow-[0_12px_24px_rgba(15,23,42,0.14)] opacity-0 group-hover:opacity-100 transition-opacity">
        Uploaded section is {uploadedSection || "blank"}, but this student is currently in {studentSection || "blank"}. Publishing will update the student to the uploaded section.
      </span>
    </span>
  );
}

export function SchedulesMakerContent({ basePath }: { basePath: string }) {
  const user = useAuthStore((state) => state.user);
  const { canEdit: canUseScheduleMaker } = useCanEditFeature("scheduleMaker");
  const canEdit = basePath === "/admin" || basePath === "/chair" || basePath === "/assistant" || (basePath === "/coordinator" && canUseScheduleMaker);
  const { data: hospitals = [] } = useHospitals();
  const scopedViewerId = (basePath === "/chair" || basePath === "/assistant") && user?.id != null ? String(user.id) : undefined;
  const { data: instructors = [] } = useInstructors();
  const { data: databaseStudents = [] } = useUsers("STUDENT", scopedViewerId);
  const { showToast } = useToast();
  const previewImport = usePreviewScheduleImport();
  const publishImport = usePublishScheduleImport();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("No file selected");
  const [message, setMessage] = useState("Upload an imported file or create a schedule manually before publishing.");
  const [groups, setGroups] = useState<DraftGroup[]>([]);
  const [preview, setPreview] = useState<ScheduleImportPreview | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [breakDrafts, setBreakDrafts] = useState<Record<string, string>>({});
  const [studentSearch, setStudentSearch] = useState("");
  const [modalRecords, setModalRecords] = useState<StudentRecord[]>([]);
  const [modalOriginalRecords, setModalOriginalRecords] = useState<StudentRecord[]>([]);

  const selectedGroup = groups.find((group) => group.id === selectedGroupId);
  const selectedStudentRecords = selectedGroup ? modalRecords : [];
  const matchedModalRecords = selectedStudentRecords.filter((student) => student.matched);
  const unmatchedModalRecords = selectedStudentRecords.filter((student) => !student.matched);
  const modalChanged = modalRecords.length !== modalOriginalRecords.length || modalRecords.some((student, index) => student.name !== modalOriginalRecords[index]?.name || student.matched !== modalOriginalRecords[index]?.matched);

  const hospitalAreaOptions = useMemo(() => (hospitals as any[]).flatMap((hospital: any) => (hospital.wards?.length ? hospital.wards : [""]).map((ward: string) => {
    const value = ward ? `${hospital.name} - ${ward}` : hospital.name;
    return { value, label: value };
  })), [hospitals]);
  const instructorOptions = useMemo(() => (instructors as any[]).map((instructor: any) => ({ value: instructor.fullName, label: instructor.fullName })), [instructors]);
  const totalStudents = groups.reduce((sum, group) => sum + getStudentRecords(group).length, 0);
  const publishBlockMessage = publishDisabledReason(groups, preview, publishImport.isPending);
  const studentSearchResults = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    if (!query) return [];
    const existing = new Set(modalRecords.map((record) => record.name.toLowerCase()));
    return (databaseStudents as User[])
      .filter((student) => !existing.has(student.fullName.toLowerCase()))
      .filter((student) => `${student.fullName} ${student.schoolId} ${student.sectionInfo ?? ""} ${student.groupInfo ?? ""} ${student.email}`.toLowerCase().includes(query))
      .slice(0, 8);
  }, [databaseStudents, modalRecords, studentSearch]);

  if (!canEdit) {
    return <main className="grid w-full content-start gap-6 p-[clamp(24px,4vw,42px)]"><section className="rounded-lg border border-[#e2e8f0] bg-white p-[1.45rem] shadow-[0_16px_44px_rgba(32,33,36,0.07)]"><h2 className="m-0 !text-[1.25rem] !font-bold !text-[#111827]">Schedule Maker</h2><p className="mb-0 mt-3 !text-sm !font-bold !text-[#64748b]">You can view schedules, but schedule publishing is not enabled for your role.</p></section></main>;
  }

  function updateGroup(id: string, updates: Partial<DraftGroup>) {
    setGroups((current) => current.map((group) => group.id === id ? { ...group, ...updates } : group));
  }

  async function handleFile(file: File) {
    try {
      const data = await previewImport.mutateAsync(file);
      setPreview(data);
      setFileName(data.fileName || file.name);
      setGroups(data.groups || []);
      setMessage(`Extracted ${data.groups?.length ?? 0} group(s) for level ${data.level}. ${data.matchedStudents} student(s) matched, ${data.skippedStudents} need review.`);
      showToast({ variant: "success", title: "Schedule extracted", message: `${data.groups?.length ?? 0} group(s) are ready for review.` });
    } catch {
      setMessage("Could not extract the schedule file. Make sure it is saved as CSV/XLSX with the required schedule header.");
      showToast({ variant: "error", title: "Extract failed", message: "The schedule file could not be read." });
    }
  }

  async function publishSchedule() {
    if (publishBlockMessage) return;
    try {
      const result = await publishImport.mutateAsync(buildPublishPayload(groups, preview, fileName));
      setMessage(`${result.schedulesCreated} schedule(s) published for level ${result.level}. ${result.studentsMatched} student(s) matched, ${result.studentsSkipped} skipped, ${result.duplicateSchedules} duplicate(s) ignored.`);
      setPreview(null);
      setGroups([]);
      setFileName("No file selected");
      setBreakDrafts({});
      closeStudentModal();
      if (fileInputRef.current) fileInputRef.current.value = "";
      showToast({ variant: "success", title: "Schedule published", message: `${result.schedulesCreated} schedule(s) are now visible to student(s) and CIs.` });
    } catch {
      showToast({ variant: "error", title: "Publish failed", message: "The reviewed schedule could not be published." });
    }
  }

  function addManualGroup() {
    setGroups((current) => [{
      id: `${Date.now()}`,
      section: "",
      group: "",
      startDate: "",
      endDate: "",
      breakDates: [],
      shiftStart: "",
      shiftEnd: "",
      hospitalArea: "",
      dutyType: "Regular",
      casePresentationDate: "",
      casePresentationTime: "",
      noCasePresentation: false,
      instructor: "",
      students: [],
      studentRecords: [],
    }, ...current]);
    setMessage("Manual schedule draft added for review.");
  }

  function openStudentModal(group: DraftGroup) {
    const records = getStudentRecords(group);
    setModalRecords(records);
    setModalOriginalRecords(records);
    setStudentSearch("");
    setSelectedGroupId(group.id);
  }

  function closeStudentModal() {
    setSelectedGroupId(null);
    setStudentSearch("");
    setModalRecords([]);
    setModalOriginalRecords([]);
  }

  function addStudent(student: User) {
    setModalRecords((current) => [...current, {
      name: student.fullName,
      matched: true,
      schoolId: student.schoolId,
      section: student.sectionInfo,
      group: student.groupInfo,
      levels: student.assignedLevels,
      profileImageUrl: student.profileImageUrl,
    }]);
    setStudentSearch("");
  }

  function removeStudent(name: string) {
    setModalRecords((current) => current.filter((student) => student.name !== name));
  }

  function saveStudentModal() {
    if (!selectedGroup) return;
    const matchedStudents = modalRecords.filter((student) => student.matched).length;
    setGroups((current) => current.map((group) => group.id === selectedGroup.id ? {
      ...group,
      students: modalRecords.map((student) => student.name),
      studentRecords: modalRecords,
      matchedStudents,
      skippedStudents: modalRecords.length - matchedStudents,
    } : group));
    showToast({ variant: "success", title: "Roster saved", message: "Student changes were applied to this schedule draft." });
    closeStudentModal();
  }

  function addBreakDate(group: DraftGroup) {
    const value = breakDrafts[group.id];
    if (!value) return;
    if (!group.startDate || !group.endDate) {
      showToast({ variant: "error", title: "Set date range first", message: "Choose a start and end date before adding break dates." });
      return;
    }
    if (value < group.startDate || value > group.endDate) {
      showToast({ variant: "error", title: "Invalid break date", message: "Break dates must be within the schedule start and end dates." });
      return;
    }
    if (group.breakDates.includes(value)) {
      showToast({ variant: "error", title: "Already added", message: "This break date is already listed." });
      return;
    }
    updateGroup(group.id, { breakDates: [...group.breakDates, value].sort() });
    setBreakDrafts((current) => ({ ...current, [group.id]: "" }));
  }

  return (
    <main className="grid w-full content-start gap-6 p-[clamp(24px,4vw,42px)]">
      <section className="mt-0 rounded-lg border border-[#e2e8f0] bg-white p-[1.45rem] shadow-[0_16px_44px_rgba(32,33,36,0.07)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#e5eaf1] pb-4">
          <h2 className="m-0 !text-[1.25rem] !font-bold leading-[1.15] !text-[#111827]">Upload Schedule Source File</h2>
          <span className="inline-flex items-center whitespace-nowrap rounded-full bg-[#fff6cc] px-[10px] py-[4px] !text-[0.76rem] !font-extrabold !text-[#6c4c00]">Review required</span>
        </div>
        <div className="flex min-h-[210px] flex-col justify-between gap-8 rounded-[0.85rem] border border-dashed border-[#8A252C]/28 bg-[linear-gradient(135deg,#fff7d6_0%,#fffaf0_55%,#ffffff_100%)] p-[1.9rem]">
          <div>
            <strong className="mb-4 block !text-[1.15rem] !font-[800] !text-[#0f172a]">Drop Excel or CSV file here</strong>
            <p className="m-0 max-w-[1180px] !text-base !font-[700] leading-[1.55] !text-[#475569]">Accepted data: section/group, inclusive dates, RLE rotation, hospital or area, shift, case presentation date, student count, clinical instructor, and remarks. Student names are shown during review so unmatched records can be checked before publishing.</p>
          </div>
          <div className="flex max-[900px]:justify-start flex-wrap items-center justify-end gap-3">
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleFile(file); }} />
            <button className="inline-flex min-h-[48px] w-auto min-w-[175px] items-center justify-center rounded-lg border border-[#e2e8f0] bg-white px-4 !text-[0.95rem] !font-extrabold !text-[#344054] transition-all cursor-pointer hover:border-[rgba(138,37,44,0.32)] hover:!text-[#8A252C] disabled:opacity-60" type="button" disabled={previewImport.isPending} onClick={() => fileInputRef.current?.click()}>{previewImport.isPending ? "Reading file..." : "Choose schedule file"}</button>
            <button className="inline-flex min-h-[48px] w-auto min-w-[175px] items-center justify-center rounded-lg border border-[#e2e8f0] bg-white px-4 !text-[0.95rem] !font-extrabold !text-[#344054] transition-all cursor-pointer hover:border-[rgba(138,37,44,0.32)] hover:!text-[#8A252C]" type="button" onClick={addManualGroup}>Create schedule manually</button>
          </div>
        </div>
        <div className="mt-4 flex min-h-[48px] items-center rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 !text-sm !font-bold !text-[#4c5d7d]" role="status" aria-live="polite">{message}</div>
      </section>

      {groups.length > 0 && <section className="mt-0 rounded-lg border border-[#e2e8f0] bg-white p-[1.45rem] shadow-[0_16px_44px_rgba(32,33,36,0.07)]">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="m-0 !text-[1.25rem] !font-bold leading-[1.15] !text-[#111827]">Review Imported Schedule Before Publishing</h2>
          <span className="inline-flex items-center whitespace-nowrap rounded-full bg-[#fff6cc] px-[10px] py-[4px] !text-[0.76rem] !font-extrabold !text-[#6c4c00]">Draft review</span>
        </div>
        <div className="mb-6 grid grid-cols-3 gap-4 max-[980px]:grid-cols-1">
          <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-[18px]"><span className="mb-[5px] block !text-[0.72rem] !font-[900] uppercase !text-[#64748b]">Imported file</span><strong className="!text-[0.98rem] !font-[850] leading-[1.3] !text-[#111827]">{fileName}</strong></div>
          <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-[18px]"><span className="mb-[5px] block !text-[0.72rem] !font-[900] uppercase !text-[#64748b]">Review records</span><strong className="!text-[0.98rem] !font-[850] leading-[1.3] !text-[#111827]">{groups.length} group(s) / {totalStudents} source student(s)</strong></div>
          <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-[18px]"><span className="mb-[5px] block !text-[0.72rem] !font-[900] uppercase !text-[#64748b]">Publish scope</span><strong className="!text-[0.98rem] !font-[850] leading-[1.3] !text-[#111827]">Matched student(s) only</strong></div>
        </div>

        <div className="grid gap-[22px]">
          {groups.map((group) => <article key={group.id} className="grid grid-cols-[minmax(0,1fr)_minmax(240px,auto)] items-start gap-[22px_26px] rounded-xl border border-[#e2e8f0] bg-white p-[24px] max-[980px]:grid-cols-1">
            <div>
              <div className="grid grid-cols-[1fr_140px] gap-3 max-[720px]:grid-cols-1">
                <label className="grid gap-1 !text-[0.75rem] !font-[900] uppercase !text-[#64748b]">Section<input className="w-full rounded-lg border border-[#dbe3ee] bg-white px-3 py-2 !text-[1.02rem] !font-[900] !text-[#111827] outline-none" value={group.section} onChange={(event) => updateGroup(group.id, { section: event.target.value })} /></label>
                <label className="grid gap-1 !text-[0.75rem] !font-[900] uppercase !text-[#64748b]">Group<input className="w-full rounded-lg border border-[#dbe3ee] bg-white px-3 py-2 !text-[1.02rem] !font-[900] !text-[#111827] outline-none" value={group.group ?? ""} onChange={(event) => updateGroup(group.id, { group: event.target.value })} /></label>
              </div>
              <button className="mt-4 inline-flex min-h-[34px] w-fit items-center justify-center rounded-full border border-[#8a252c]/18 bg-[#fff7d6] px-[0.85rem] py-[0.45rem] !text-[0.86rem] !font-extrabold leading-none !text-[#8a252c] transition-all cursor-pointer hover:bg-[#ffefad]" type="button" onClick={() => openStudentModal(group)}>View student(s) ({getStudentRecords(group).length})</button>
            </div>
            <div className="flex flex-wrap justify-end gap-[10px] pt-[1.45rem] max-[980px]:justify-start max-[980px]:pt-0">
              <button className="inline-flex min-h-[44px] w-auto items-center justify-center rounded-lg border border-[#c62828]/20 bg-white px-4 !text-[0.95rem] !font-extrabold !text-[#c62828] cursor-pointer hover:bg-[#fff5f5] max-[720px]:w-full" type="button" onClick={() => setGroups((current) => current.filter((item) => item.id !== group.id))}>Remove</button>
            </div>
            <div className="col-span-full grid grid-cols-2 gap-[18px_22px] pt-[4px] max-[980px]:grid-cols-1">
              <label className="grid gap-2 !text-[0.88rem] !font-[800] !text-[#344054]">Start Date<input className="min-h-[48px] rounded-lg border border-[#dbe3ee] bg-white px-4 !font-[800] !text-[#111827]" type="date" value={group.startDate} onChange={(event) => updateGroup(group.id, { startDate: event.target.value })} /></label>
              <label className="grid gap-2 !text-[0.88rem] !font-[800] !text-[#344054]">End Date<input className="min-h-[48px] rounded-lg border border-[#dbe3ee] bg-white px-4 !font-[800] !text-[#111827]" type="date" value={group.endDate} onChange={(event) => updateGroup(group.id, { endDate: event.target.value })} /></label>
              <label className="col-span-full grid gap-2 rounded-lg border border-[#dbe3ee] bg-[#f8fafc] p-[18px] !text-[0.88rem] !font-[800] !text-[#344054]">Break Dates
                <div className="grid grid-cols-[1fr_auto] items-center gap-[14px] max-[720px]:grid-cols-1">
                  <input className="min-h-[48px] rounded-lg border border-[#dbe3ee] bg-white px-4 !font-[800] !text-[#111827]" type="date" min={group.startDate || undefined} max={group.endDate || undefined} value={breakDrafts[group.id] ?? ""} onChange={(event) => setBreakDrafts((current) => ({ ...current, [group.id]: event.target.value }))} />
                  <button className="min-h-[48px] rounded-lg border border-[#e2e8f0] bg-white px-4 !font-extrabold !text-[#334155] cursor-pointer hover:bg-[#f8fafc]" type="button" onClick={() => addBreakDate(group)}>Add break</button>
                </div>
                <div className="mt-1 !text-xs !font-bold !text-[#64748b]">Break dates are skipped when publishing, so no duty schedule is created for those dates.</div>
                {group.breakDates.length > 0 ? <div className="mt-2 flex flex-wrap gap-2">{group.breakDates.map((date) => <button key={date} type="button" className="rounded-full border border-[#c62828]/20 bg-white px-3 py-1 !font-bold !text-[#8A252C] cursor-pointer" onClick={() => updateGroup(group.id, { breakDates: group.breakDates.filter((item) => item !== date) })}>{date} x</button>)}</div> : <div className="mt-2 !text-sm !font-bold !text-[#64748b]">No breaks added</div>}
              </label>
              <ScheduleTimePicker label="Shift Start" value={group.shiftStart} onChange={(value) => updateGroup(group.id, { shiftStart: value })} />
              <ScheduleTimePicker label="Shift End" value={group.shiftEnd} onChange={(value) => updateGroup(group.id, { shiftEnd: value })} />
              <label className="grid gap-2 !text-[0.88rem] !font-[800] !text-[#344054]">Hospital / Area<InlineSelect value={group.hospitalArea} onChange={(value) => updateGroup(group.id, { hospitalArea: value })} options={hospitalAreaOptions} placeholder="Select hospital / area" /></label>
              <label className="grid gap-2 !text-[0.88rem] !font-[800] !text-[#344054]">Duty Type<InlineSelect value={group.dutyType} onChange={(value) => updateGroup(group.id, { dutyType: value })} options={dutyTypeOptions} placeholder="Select duty type" /></label>
              <label className="grid gap-2 !text-[0.88rem] !font-[800] !text-[#344054]">Case Presentation date<input className="min-h-[48px] rounded-lg border border-[#dbe3ee] bg-white px-4 !font-[800] !text-[#111827] disabled:opacity-60" type="date" disabled={group.noCasePresentation} value={group.casePresentationDate} onChange={(event) => updateGroup(group.id, { casePresentationDate: event.target.value })} /></label>
              <ScheduleTimePicker label="Case Presentation time" value={group.casePresentationTime} disabled={group.noCasePresentation} onChange={(value) => updateGroup(group.id, { casePresentationTime: value })} />
              <label className="mt-7 flex items-center gap-3 !text-[0.9rem] !font-[850] !text-[#344054]"><input className="accent-[#8A252C]" type="checkbox" checked={group.noCasePresentation} onChange={(event) => updateGroup(group.id, { noCasePresentation: event.target.checked, casePresentationDate: event.target.checked ? "" : group.casePresentationDate, casePresentationTime: event.target.checked ? "" : group.casePresentationTime })} />No Case Presentation</label>
              <label className="grid gap-2 !text-[0.88rem] !font-[800] !text-[#344054]">Supervising CI<InlineSelect value={group.instructor} onChange={(value) => updateGroup(group.id, { instructor: value })} options={instructorOptions} placeholder="Select clinical instructor" /></label>
            </div>
          </article>)}
        </div>
        <div className="mt-6 flex justify-end"><span title={publishBlockMessage || "Publish reviewed schedule"}><button className="inline-flex min-h-[52px] items-center justify-center rounded-lg bg-[#8A252C] px-8 !font-[900] !text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled={Boolean(publishBlockMessage)} onClick={publishSchedule}>{publishImport.isPending ? "Publishing..." : "Publish Schedule"}</button></span></div>
      </section>}

      {selectedGroup && <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-[#0f172a]/45 p-3 sm:p-5">
        <section className="flex max-h-[calc(100dvh-1.5rem)] w-[min(980px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-xl bg-white shadow-[0_26px_68px_rgba(15,23,42,0.24)] sm:max-h-[92vh] sm:w-[min(980px,calc(100vw-2rem))]">
          <div className="flex shrink-0 items-start justify-between gap-4 p-4 sm:p-6">
            <div>
              <h2 className="m-0 !text-[1.35rem] !font-[900] !text-[#111827]">{selectedGroup.section}{selectedGroup.group ? ` ${selectedGroup.group}` : ""} Student(s)</h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button className={`min-h-[40px] rounded-lg border px-4 !font-[900] cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 sm:min-h-[44px] sm:px-6 ${modalChanged ? "border-[#8A252C]/35 bg-[#fff7d6] !text-[#8A252C] hover:bg-[#ffefad]" : "border-[#e2e8f0] bg-white !text-[#94a3b8]"}`} type="button" disabled={!modalChanged} onClick={() => { setModalRecords(modalOriginalRecords); setStudentSearch(""); }}>Undo</button>
              <button className="relative grid h-[42px] w-[42px] place-items-center rounded-lg border border-[#dbe3ee] bg-white !text-transparent outline-none cursor-pointer transition-colors hover:border-[#8a252c] before:absolute before:h-[2px] before:w-[15px] before:rotate-45 before:rounded-full before:bg-[#0f172a] before:content-[''] after:absolute after:h-[2px] after:w-[15px] after:-rotate-45 after:rounded-full after:bg-[#0f172a] after:content-[''] sm:h-[48px] sm:w-[48px]" type="button" onClick={closeStudentModal} aria-label="Close student roster">Close</button>
            </div>
          </div>
          <div className="grid shrink-0 gap-[10px] px-4 pb-3 sm:px-6 sm:pb-4">
            <label className="!font-[900] !text-[#14213d]" htmlFor="schedule-student-add-search">Search student to add</label>
            <div className="relative">
              <input id="schedule-student-add-search" className="min-h-[48px] w-full rounded-lg border border-[#8a252c]/45 bg-white px-[18px] pr-12 !font-[800] !text-[#14213d] outline-none focus:border-[#8a252c] focus:shadow-[0_0_0_4px_rgba(138,37,44,0.1)] sm:min-h-[58px]" value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="Search by name, ID, section, or email" autoComplete="off" />
              {studentSearch && <button type="button" className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full !text-[#3f5f9f] !font-[900] cursor-pointer hover:bg-[#f1f5f9]" onClick={() => setStudentSearch("")}>x</button>}
            </div>
            {studentSearch.trim() && <div className="max-h-[150px] overflow-y-auto rounded-lg border border-[#e2e8f0] bg-white sm:max-h-[220px]">
              {studentSearchResults.length > 0 ? studentSearchResults.map((student) => <button key={student.id} type="button" className="block w-full p-5 text-left cursor-pointer hover:bg-[#f8fafc]" onClick={() => addStudent(student)}>
                <strong className="block !font-[900] !text-[#14213d]">{student.fullName}</strong>
                <span className="block !font-[800] !text-[#14213d]">Student | {student.schoolId} | {student.sectionInfo || "No section"}{student.groupInfo ? ` ${student.groupInfo}` : ""} | {formatStudentLevel(student)}</span>
              </button>) : <div className="p-5 !font-[800] !text-[#64748b]">No matching student(s) found.</div>}
            </div>}
            <div className="rounded-lg border border-[#f1d38a] bg-[#fffaf0] px-4 py-3 !text-[0.86rem] !font-[800] !text-[#744b00]">Double-check every matched student before saving. If the file only has a last name or student(s) share the same last name, the importer may leave it under Unmatched; use search to add the exact student.</div>
          </div>
          <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto px-4 pb-4 sm:px-6 sm:pb-6">
            <section className="grid gap-3">
              <div className="flex items-center justify-between gap-3"><h3 className="m-0 !text-[1rem] !font-[900] !text-[#111827]">Matched</h3><span className="rounded-full bg-[#e9f8ef] px-3 py-1 !text-[0.76rem] !font-[900] !text-[#03703c]">{matchedModalRecords.length} student(s)</span></div>
              <div className="overflow-x-auto rounded-lg border border-[#e2e8f0]">
                <table className="w-full min-w-[820px] table-fixed border-collapse">
                  <colgroup><col className="w-[76px]" /><col /><col className="w-[180px]" /><col className="w-[120px]" /><col className="w-[150px]" /><col className="w-[150px]" /></colgroup>
                  <thead className="bg-[#f8fafc]"><tr><th className="px-4 py-4 text-left !text-[0.8rem] !font-[900] uppercase !text-[#111827]">No.</th><th className="px-4 py-4 text-left !text-[0.8rem] !font-[900] uppercase !text-[#111827]">Student</th><th className="px-4 py-4 text-left !text-[0.8rem] !font-[900] uppercase !text-[#111827]">Section</th><th className="px-4 py-4 text-left !text-[0.8rem] !font-[900] uppercase !text-[#111827]">Group</th><th className="px-4 py-4 text-left !text-[0.8rem] !font-[900] uppercase !text-[#111827]">Level</th><th className="px-4 py-4 text-right !text-[0.8rem] !font-[900] uppercase !text-[#111827]">Action</th></tr></thead>
                  <tbody>
                    {matchedModalRecords.length > 0 ? matchedModalRecords.map((student, index) => <tr key={`matched-${student.name}-${index}`} className="border-t border-[#e2e8f0]"><td className="px-4 py-4 !text-[0.95rem] !text-[#14213d]">{index + 1}.</td><td className="px-4 py-4"><div className="flex items-center gap-3"><ProfileAvatar name={student.name} imageUrl={student.profileImageUrl} size={40} /><div><span className="block !text-[0.95rem] !font-[900] !text-[#111827]">{student.name}</span>{student.schoolId && <span className="block !text-[0.78rem] !font-[850] !text-[#64748b]">{student.schoolId}</span>}</div></div></td><td className="px-4 py-4 !text-[0.95rem] !font-[700] !text-[#14213d]"><span className="inline-flex items-center gap-2">{student.section || ""}{hasSectionMismatch(student, selectedGroup) && <SectionMismatchIcon studentSection={student.section} uploadedSection={selectedGroup.section} />}</span></td><td className="px-4 py-4 !text-[0.95rem] !font-[700] !text-[#14213d]">{student.group || ""}</td><td className="px-4 py-4 !text-[0.95rem] !font-[700] !text-[#14213d]">{formatLevels(student.levels)}</td><td className="px-4 py-4 text-right"><button type="button" className="min-h-[38px] rounded-lg border border-[#c62828]/30 bg-white px-6 !text-[0.85rem] !font-[900] !text-[#b42318] cursor-pointer hover:bg-[#fff1f0]" onClick={() => removeStudent(student.name)}>Remove</button></td></tr>) : <tr><td colSpan={6} className="px-4 py-8 text-center !font-[800] !text-[#64748b]">No matched student(s) added.</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
            {unmatchedModalRecords.length > 0 && <section className="grid gap-3">
              <div className="flex items-center justify-between gap-3"><h3 className="m-0 !text-[1rem] !font-[900] !text-[#111827]">Unmatched</h3><span className="rounded-full bg-[#fff4de] px-3 py-1 !text-[0.76rem] !font-[900] !text-[#9a5b00]">{unmatchedModalRecords.length} will not publish</span></div>
              <div className="overflow-x-auto rounded-lg border border-[#e2e8f0]">
                <table className="w-full min-w-[720px] table-fixed border-collapse">
                  <colgroup><col className="w-[76px]" /><col className="w-[260px]" /><col /><col className="w-[150px]" /></colgroup>
                  <thead className="bg-[#fffaf0]"><tr><th className="px-4 py-4 text-left !text-[0.8rem] !font-[900] uppercase !text-[#111827]">No.</th><th className="px-4 py-4 text-left !text-[0.8rem] !font-[900] uppercase !text-[#111827]">Student Name</th><th className="px-4 py-4 text-left !text-[0.8rem] !font-[900] uppercase !text-[#111827]">Status</th><th className="px-4 py-4 text-right !text-[0.8rem] !font-[900] uppercase !text-[#111827]">Action</th></tr></thead>
                  <tbody>
                    {unmatchedModalRecords.map((student, index) => <tr key={`unmatched-${student.name}-${index}`} className="border-t border-[#e2e8f0]"><td className="px-4 py-4 !text-[0.95rem] !text-[#14213d]">{index + 1}.</td><td className="px-4 py-4 !text-[0.95rem] !font-[900] !text-[#111827]">{student.name}</td><td className="px-4 py-4 !text-[0.82rem] !font-[850] !text-[#9a5b00]">No matching user. This student will not receive a published schedule.</td><td className="px-4 py-4 text-right"><button type="button" className="min-h-[38px] rounded-lg border border-[#c62828]/30 bg-white px-6 !text-[0.85rem] !font-[900] !text-[#b42318] cursor-pointer hover:bg-[#fff1f0]" onClick={() => removeStudent(student.name)}>Remove</button></td></tr>)}
                  </tbody>
                </table>
              </div>
            </section>}
          </div>
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#e2e8f0] p-4 max-[720px]:flex-col max-[720px]:items-stretch sm:p-6">
            <button className="inline-flex min-h-[46px] min-w-[130px] items-center justify-center rounded-lg border border-[#e2e8f0] bg-white px-4 !text-[0.95rem] !font-extrabold !text-[#334155] cursor-pointer hover:bg-[#f8fafc]" type="button" onClick={closeStudentModal}>Cancel</button>
            <button className="inline-flex min-h-[46px] min-w-[130px] items-center justify-center rounded-lg bg-[#8A252C] px-4 !text-[0.95rem] !font-extrabold !text-white shadow-[0_6px_14px_rgba(138,37,44,0.18)] cursor-pointer hover:bg-[#6d1d23]" type="button" onClick={saveStudentModal}>Save Changes</button>
          </div>
        </section>
      </div>}
    </main>
  );
}
