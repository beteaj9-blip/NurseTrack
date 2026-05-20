"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/core/api/axios";
import { useInstructorAttendance } from "@/core/api/hooks/useAttendance";
import { useHospitals } from "@/core/api/hooks/useHospitals";
import { useSchedules } from "@/core/api/hooks/useSchedules";
import { useAuthStore } from "@/core/store/authStore";
import { InlineSelect } from "@/components/ui/InlineSelect";
import { useToast } from "@/components/ui/ToastProvider";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";

type ValidationStatus = "Pending Review" | "Approved" | "Returned";

interface AttendanceRecord {
  id: number;
  dateLabel: string;
  site: string;
  area: string;
  shift: string;
  note: string;
  status: ValidationStatus;
  instructorName: string;
  instructorProfileImageUrl?: string;
}

interface AddedStudent {
  id: string;
  recordId?: number;
  userId?: number;
  profileImageUrl?: string;
  name: string;
  section: string;
  studentId: string;
  status: string;
  checkIn: string;
  checkOut: string;
}

const STATUS_STYLE: Record<ValidationStatus, string> = {
  "Pending Review": "bg-[#fef3c7] !text-[#92400e]",
  "Approved": "bg-[#dcfce7] !text-[#166534]",
  "Returned": "bg-[#fee2e2] !text-[#991b1b]",
};

const inputCls = "w-full min-h-[44px] px-3 py-2 border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] !text-[0.9rem] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all";
const labelCls = "flex flex-col gap-1.5 m-0 !text-[0.85rem] !font-bold !text-[#334155]";

function formatDateLabel(dateTime?: string) {
  if (!dateTime) return "Manual attendance";
  return new Date(dateTime).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) + " Attendance";
}

function formatTime(dateTime?: string) {
  if (!dateTime) return "";
  return new Date(dateTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function toTimeInput(timeLabel: string) {
  const match = timeLabel.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return timeLabel.slice(0, 5);
  const [, hourText, minute, period] = match;
  let hour = Number(hourText);
  if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (period.toUpperCase() === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${minute}`;
}

function formatScheduleDate(date?: string) {
  if (!date) return "Schedule date";
  const datePart = date.includes("T") ? date.split("T")[0] : date;
  return new Date(`${datePart}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getScheduleGroupKey(schedule: any) {
  return [schedule.date, schedule.hospital, schedule.area, schedule.startTime, schedule.endTime].map((value) => value ?? "").join("|");
}

function appendOption(options: { value: string; label: string }[], value?: string, label?: string) {
  if (!value || options.some((option) => option.value === value)) return options;
  return [...options, { value, label: label || value }];
}

export function CiManualAttendanceContent({ basePath, isEditMode = false }: { basePath: string; isEditMode?: boolean }) {
  const router = useRouter();
  const { showToast } = useToast();
  const user = useAuthStore((state) => state.user);
  const instructorId = user?.id != null ? String(user.id) : undefined;
  const { data: schedules = [] } = useSchedules(instructorId, user?.role);
  const { data: attendanceRecords = [], refetch } = useInstructorAttendance(instructorId);
  const { data: hospitals = [] } = useHospitals();
  const [editing, setEditing] = useState(isEditMode);
  const [searchStudent, setSearchStudent] = useState("");
  const [addedStudents, setAddedStudents] = useState<AddedStudent[]>([]);
  const [dutyDate, setDutyDate] = useState(new Date().toISOString().slice(0, 10));
  const [dutyArea, setDutyArea] = useState("");
  const [shiftStart, setShiftStart] = useState("07:00");
  const [shiftEnd, setShiftEnd] = useState("15:00");
  const [clinicalSite, setClinicalSite] = useState("");
  const [instructorNote, setInstructorNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasLoadedEditRecord, setHasLoadedEditRecord] = useState(false);
  const [selectedScheduleKey, setSelectedScheduleKey] = useState("");

  const selectedHospital = (hospitals as any[]).find((hospital: any) => hospital.name === clinicalSite);
  const allDutyAreas = useMemo(() => Array.from(new Set((hospitals as any[]).flatMap((hospital: any) => hospital.wards ?? []).filter(Boolean))).sort(), [hospitals]);
  const dutyAreas = selectedHospital?.wards?.length ? selectedHospital.wards : allDutyAreas;
  const scheduleGroups = useMemo(() => {
    const groups = new Map<string, any>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    (schedules as any[]).forEach((schedule: any) => {
      if (!schedule.date) return;
      const scheduleDate = new Date(`${schedule.date}T00:00:00`);
      if (scheduleDate.getTime() > today.getTime()) return;
      const key = getScheduleGroupKey(schedule);
      const current = groups.get(key);
      const student = {
        id: String(schedule.studentId ?? schedule.studentSchoolId ?? schedule.studentName),
        userId: schedule.studentId,
        profileImageUrl: schedule.studentProfileImageUrl,
        name: schedule.studentName || "Nursing Student",
        section: schedule.studentSection || "Nursing Student",
        studentId: schedule.studentSchoolId || "",
        status: "Present",
        checkIn: toTimeInput(schedule.rawStartTime ?? schedule.startTime ?? shiftStart),
        checkOut: toTimeInput(schedule.rawEndTime ?? schedule.endTime ?? shiftEnd),
      };
      if (current) {
        if (!current.students.some((item: AddedStudent) => item.id === student.id)) current.students.push(student);
        return;
      }
      groups.set(key, {
        key,
        date: schedule.date,
        hospital: schedule.hospital || "",
        area: schedule.area || "",
        startTime: schedule.startTime || "",
        endTime: schedule.endTime || "",
        rawStartTime: schedule.rawStartTime,
        rawEndTime: schedule.rawEndTime,
        students: [student],
      });
    });
    return Array.from(groups.values()).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [schedules, shiftEnd, shiftStart]);
  const selectedSchedule = scheduleGroups.find((schedule: any) => schedule.key === selectedScheduleKey);
  const scheduleOptions = useMemo(() => scheduleGroups.map((schedule: any) => ({ value: schedule.key, label: `${formatScheduleDate(schedule.date)} - ${schedule.area || schedule.hospital} (${schedule.startTime} - ${schedule.endTime})` })), [scheduleGroups]);
  const hospitalOptions = useMemo(() => appendOption((hospitals as any[]).map((hospital: any) => ({ value: hospital.name, label: hospital.fullName ? `${hospital.name} - ${hospital.fullName}` : hospital.name })), clinicalSite), [hospitals, clinicalSite]);
  const dutyAreaOptions = useMemo(() => appendOption(dutyAreas.map((area: string) => ({ value: area, label: area })), dutyArea), [dutyAreas, dutyArea]);
  const statusOptions = useMemo(() => ["Present", "Absent", "Late", "Excused"].map((status) => ({ value: status, label: status })), []);

  React.useEffect(() => {
    if (!selectedScheduleKey && scheduleGroups.length > 0) setSelectedScheduleKey(scheduleGroups[0].key);
    if (selectedScheduleKey && scheduleGroups.length > 0 && !scheduleGroups.some((schedule: any) => schedule.key === selectedScheduleKey)) setSelectedScheduleKey(scheduleGroups[0].key);
  }, [scheduleGroups, selectedScheduleKey]);

  React.useEffect(() => {
    if (!selectedSchedule || isEditMode) return;
    setDutyDate(selectedSchedule.date);
    setClinicalSite(selectedSchedule.hospital);
    setDutyArea(selectedSchedule.area);
    setShiftStart(toTimeInput(selectedSchedule.rawStartTime ?? selectedSchedule.startTime));
    setShiftEnd(toTimeInput(selectedSchedule.rawEndTime ?? selectedSchedule.endTime));
    setAddedStudents([]);
    setSearchStudent("");
  }, [isEditMode, selectedSchedule?.key, selectedSchedule?.date, selectedSchedule?.hospital, selectedSchedule?.area, selectedSchedule?.rawStartTime, selectedSchedule?.rawEndTime, selectedSchedule?.startTime, selectedSchedule?.endTime]);

  React.useEffect(() => {
    if (!isEditMode || hasLoadedEditRecord) return;
    const manualRecords = (attendanceRecords as any[])
      .filter((record) => record.instructorFeedback)
      .sort((a, b) => Number(b.id ?? 0) - Number(a.id ?? 0));
    const primary = manualRecords[0];
    if (!primary) return;
    const relatedRecords = manualRecords.filter((record) =>
      record.dutyDate === primary.dutyDate &&
      record.hospital === primary.hospital &&
      (record.area ?? record.ward) === (primary.area ?? primary.ward) &&
      record.instructorFeedback === primary.instructorFeedback
    );
    const matchingSchedule = scheduleGroups.find((schedule: any) =>
      schedule.date === primary.dutyDate &&
      schedule.hospital === primary.hospital &&
      schedule.area === (primary.area ?? primary.ward)
    );
    if (matchingSchedule) setSelectedScheduleKey(matchingSchedule.key);
    setDutyDate(primary.dutyDate ?? new Date().toISOString().slice(0, 10));
    setClinicalSite(primary.hospital ?? "");
    setDutyArea(primary.area ?? primary.ward ?? "");
    setInstructorNote(primary.instructorFeedback ?? "");
    setAddedStudents(relatedRecords.map((record) => ({
      id: String(record.studentId ?? record.studentSchoolId ?? record.id),
      recordId: record.id,
      userId: record.studentId,
      profileImageUrl: record.studentProfileImageUrl,
      name: record.studentName || "Nursing Student",
      section: record.studentSection || "Nursing Student",
      studentId: record.studentSchoolId || "",
      status: "Present",
      checkIn: record.timeInLabel ? toTimeInput(record.timeInLabel) : shiftStart,
      checkOut: record.timeOutLabel ? toTimeInput(record.timeOutLabel) : shiftEnd,
    })));
    setHasLoadedEditRecord(true);
  }, [isEditMode, hasLoadedEditRecord, attendanceRecords, scheduleGroups, shiftEnd, shiftStart]);

  const assignedStudents = (selectedSchedule?.students ?? []) as AddedStudent[];

  const studentResults = assignedStudents.filter((student: AddedStudent) => {
    const q = searchStudent.toLowerCase();
    return selectedSchedule && searchStudent && !addedStudents.some((added) => added.id === student.id) && (`${student.name} ${student.studentId} ${student.section}`).toLowerCase().includes(q);
  });

  const handleScheduleChange = (value: string) => {
    const schedule = scheduleGroups.find((item: any) => item.key === value);
    setSelectedScheduleKey(value);
    if (!schedule) return;
    setDutyDate(schedule.date);
    setClinicalSite(schedule.hospital);
    setDutyArea(schedule.area);
    setShiftStart(toTimeInput(schedule.rawStartTime ?? schedule.startTime));
    setShiftEnd(toTimeInput(schedule.rawEndTime ?? schedule.endTime));
    setAddedStudents([]);
    setSearchStudent("");
  };

  const removeStudent = (id: string) => setAddedStudents(s => s.filter(st => st.id !== id));
  const addStudent = (student: AddedStudent) => {
    setAddedStudents((current) => [...current, { ...student, checkIn: shiftStart, checkOut: shiftEnd }]);
    setSearchStudent("");
  };

  const updateStudent = (id: string, updates: Partial<AddedStudent>) => {
    setAddedStudents((current) => current.map((student) => student.id === id ? { ...student, ...updates } : student));
  };

  const submitManualAttendance = async () => {
    if (!selectedScheduleKey) {
      showToast({ variant: "error", title: "No schedule selected", message: "Select a duty date before encoding manual attendance." });
      return;
    }
    if (!user || addedStudents.length === 0) {
      showToast({ variant: "error", title: "No students selected", message: "Add at least one student before sending manual attendance." });
      return;
    }
    if (!clinicalSite || !dutyArea) {
      showToast({ variant: "error", title: "Missing clinical assignment", message: "Choose a clinical site and duty area before saving." });
      return;
    }

    try {
      setIsSaving(true);
      await Promise.all(addedStudents.map((student) => {
        const payload = {
        student: { id: student.userId },
        instructor: { id: user.id },
        hospital: clinicalSite,
        ward: dutyArea,
        timeIn: `${dutyDate}T${student.checkIn}:00`,
        timeOut: `${dutyDate}T${student.checkOut}:00`,
        instructorFeedback: instructorNote,
        };
        return isEditMode && student.recordId
          ? apiClient.put(`/duties/manual/${student.recordId}`, payload)
          : apiClient.post("/duties/manual", payload);
      }));
      await refetch();
      setAddedStudents([]);
      setEditing(false);
      showToast({ variant: "success", title: isEditMode ? "Manual attendance updated" : "Manual attendance saved", message: isEditMode ? "Manual duty records were updated and remain pending review." : "Manual duty records were created for the selected students." });
      if (isEditMode) router.push(`${basePath}/manual-backup`);
    } catch {
      showToast({ variant: "error", title: "Save failed", message: "Manual attendance could not be saved." });
    } finally {
      setIsSaving(false);
    }
  };

  const records = (attendanceRecords as any[]).filter((record: any) => record.instructorFeedback).map((record: any) => ({
    id: record.id,
    dateLabel: formatDateLabel(record.timeIn),
    site: record.hospital || "Assigned Site",
    area: record.area || record.ward || "Assigned Area",
    shift: `${formatTime(record.timeIn)} - ${formatTime(record.timeOut)}`,
    note: record.instructorFeedback,
    status: record.status === "VERIFIED" ? "Approved" as ValidationStatus : record.status === "REJECTED" ? "Returned" as ValidationStatus : "Pending Review" as ValidationStatus,
    instructorName: record.instructorName || user?.fullName || "Clinical Instructor",
    instructorProfileImageUrl: record.instructorProfileImageUrl || user?.profileImageUrl,
  }));

  return (
    <main className="p-[clamp(24px,4vw,42px)] grid gap-6 w-full">

      {/* ── Encode Attendance Form ── */}
      <section className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-[1.6rem_1.75rem]">
        <h2 className="m-0 mb-5 !text-[#111827] !text-[1.15rem] !font-bold tracking-[-0.03em]">Encode Attendance</h2>

        <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
          {/* Duty date */}
          <label className={labelCls} htmlFor="duty-date">
            Duty date
            <InlineSelect value={selectedScheduleKey} options={scheduleOptions} placeholder="Select duty date" onChange={handleScheduleChange} />
          </label>

          {/* Duty area */}
          <label className={labelCls} htmlFor="duty-area">
            Duty area
            <InlineSelect value={dutyArea} options={dutyAreaOptions} placeholder="Select duty date first" onChange={() => undefined} disabled />
          </label>

          {/* Shift start */}
          <label className={labelCls} htmlFor="shift-start">
            Shift start
            <input id="shift-start" type="time" className={`${inputCls} cursor-not-allowed !bg-[#f8fafc] !text-[#64748b]`} value={shiftStart} disabled />
          </label>

          {/* Shift end */}
          <label className={labelCls} htmlFor="shift-end">
            Shift end
            <input id="shift-end" type="time" className={`${inputCls} cursor-not-allowed !bg-[#f8fafc] !text-[#64748b]`} value={shiftEnd} disabled />
          </label>
        </div>

        {/* Clinical site */}
        <label className={labelCls + " mt-4"} htmlFor="clinical-site">
          Clinical site
          <InlineSelect value={clinicalSite} options={hospitalOptions} placeholder="Select duty date first" onChange={() => undefined} disabled />
        </label>

        {/* Instructor note */}
        <label className={labelCls + " mt-4"} htmlFor="instructor-note">
          Instructor note
          <textarea
            id="instructor-note"
            rows={4}
            placeholder="Add why this attendance was encoded manually"
            className={inputCls + " resize-y min-h-[100px]"}
            value={instructorNote}
            onChange={(event) => setInstructorNote(event.target.value)}
          />
        </label>

        {/* Info bar */}
        <div className="mt-4 px-4 py-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] !text-[#64748b] !text-[0.82rem] !font-[600]">
          {editing
            ? "Update the pending manual record, then send the revised record for review."
            : "Add students, encode their time, then send the record for Chair and Admin review."}
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 mt-4">
          {editing && (
            <button
              type="button"
              onClick={() => router.push(`${basePath}/manual-backup`)}
              className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-lg border border-[#e2e8f0] bg-white !text-[#334155] !text-[0.88rem] !font-[800] hover:bg-[#f8fafc] transition-colors"
            >
              Cancel Edit
            </button>
          )}
          <button
            type="button"
            onClick={submitManualAttendance}
            disabled={isSaving}
            className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-lg bg-[#8A252C] !text-white !text-[0.88rem] !font-[800] hover:bg-[#681920] transition-colors shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : editing ? "Update Pending Record" : "Save Manual Attendance"}
          </button>
        </div>
      </section>

      {/* ── Add Students ── */}
      <section className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-[1.6rem_1.75rem]">
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <h2 className="m-0 !text-[#111827] !text-[1.15rem] !font-bold tracking-[-0.03em]">Add Students</h2>
          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#fef3c7] !text-[#92400e] !text-[0.8rem] !font-extrabold">
            {addedStudents.length} selected
          </span>
        </div>

        {/* Search */}
        <label className={labelCls} htmlFor="search-student">
          Search student
          <input
            id="search-student"
            type="search"
            placeholder={selectedSchedule ? "Search students assigned to the selected duty date" : "Select a duty date first"}
            className={`${inputCls} disabled:cursor-not-allowed disabled:!bg-[#f8fafc] disabled:!text-[#64748b]`}
            value={searchStudent}
            disabled={!selectedSchedule}
            onChange={e => setSearchStudent(e.target.value)}
          />
        </label>

        {/* Search Results */}
        {searchStudent.length > 0 && (
          <div className="mt-4 grid gap-2">
            {studentResults.length > 0 ? studentResults.map((student: AddedStudent) => (
              <button key={student.id} type="button" onClick={() => addStudent(student)} className="flex items-center justify-between gap-3 rounded-lg border border-[#e2e8f0] bg-white px-4 py-3 text-left hover:bg-[#f8fafc] transition-colors cursor-pointer">
                <span><strong className="block !text-[#111827] !text-[0.9rem] !font-[800]">{student.name}</strong><small className="block !text-[#64748b] !text-[0.8rem] !font-[600]">{student.section} - {student.studentId}</small></span>
                <span className="!text-[#8A252C] !text-[0.82rem] !font-[900]">Add</span>
              </button>
            )) : <div className="flex items-center justify-center min-h-[48px] rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc] !text-[#64748b] !text-[0.85rem] !font-[600]">No students from this selected schedule match the search.</div>}
          </div>
        )}

        {/* Empty state when no students added and not searching */}
        {addedStudents.length === 0 && searchStudent.length === 0 && (
          <div className="mt-4 flex items-center justify-center min-h-[48px] rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc] !text-[#64748b] !text-[0.85rem] !font-[600]">
            {selectedSchedule ? "Search and add students from the selected schedule." : "Select a duty date before adding students."}
          </div>
        )}

        {/* Added students list */}
        {addedStudents.length > 0 && (
          <div className="mt-4 flex flex-col gap-4">
            {addedStudents.map(st => (
              <div key={st.id} className="rounded-xl border border-[#e2e8f0] p-5 relative bg-white shadow-sm">
                {/* Remove button */}
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    removeStudent(st.id);
                  }}
                  className="absolute top-5 right-5 z-10 w-[30px] h-[30px] flex items-center justify-center rounded-[6px] border border-[#fecaca] bg-white !text-[#ef4444] hover:bg-[#fef2f2] transition-colors !text-[1rem] !font-[900] cursor-pointer"
                  aria-label={`Remove ${st.name}`}
                >
                  ×
                </button>

                {/* Student header */}
                <div className="flex items-center gap-3 mb-4">
                  <ProfileAvatar name={st.name} imageUrl={st.profileImageUrl} size={42} />
                  <div>
                    <strong className="block !text-[#111827] !text-[0.92rem] !font-[800]">{st.name}</strong>
                    <span className="block !text-[#64748b] !text-[0.8rem] !font-[600]">{st.section} – {st.studentId}</span>
                  </div>
                </div>

                {/* Inputs row */}
                <div className="grid grid-cols-3 gap-3 max-[640px]:grid-cols-1">
                  <label className={labelCls} htmlFor={`status-${st.id}`}>
                    Status
                    <InlineSelect value={st.status} options={statusOptions} placeholder="Select status" onChange={(value) => updateStudent(st.id, { status: value })} />
                  </label>
                  <label className={labelCls} htmlFor={`checkin-${st.id}`}>
                    Check-in
                    <input id={`checkin-${st.id}`} type="time" className={inputCls} value={st.checkIn} onChange={(event) => updateStudent(st.id, { checkIn: event.target.value })} />
                  </label>
                  <label className={labelCls} htmlFor={`checkout-${st.id}`}>
                    Check-out
                    <input id={`checkout-${st.id}`} type="time" className={inputCls} value={st.checkOut} onChange={(event) => updateStudent(st.id, { checkOut: event.target.value })} />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Manual Attendance Records ── */}
      {!isEditMode && (
        <section className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-[1.6rem_1.75rem]">
          <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
            <h2 className="m-0 !text-[#111827] !text-[1.15rem] !font-bold tracking-[-0.03em]">Manual Attendance Records</h2>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#fef3c7] !text-[#92400e] !text-[0.8rem] !font-extrabold">
              {records.length} record(s)
            </span>
          </div>

          <div className="flex flex-col border border-[#e2e8f0] rounded-lg overflow-hidden">
            {records.map(rec => (
              <Link 
                href={`${basePath}/manual-backup/review`} 
                key={rec.id} 
                className="flex items-center gap-4 p-[1.25rem] border-b border-[#e2e8f0] last:border-b-0 bg-transparent hover:bg-[#f8fafc] transition-colors cursor-pointer no-underline text-inherit"
              >
                <ProfileAvatar name={rec.instructorName} imageUrl={rec.instructorProfileImageUrl} size={42} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <strong className="block !text-[#111827] !text-[0.9rem] !font-[800]">{rec.dateLabel}</strong>
                  <span className="block !text-[#64748b] !text-[0.82rem] !font-[600]">
                    {rec.site} – {rec.area} · {rec.shift}
                  </span>
                  <span className={`block !text-[0.78rem] !font-[700] mt-0.5 ${rec.status === "Approved" ? "!text-[#166534]" : rec.status === "Returned" ? "!text-[#991b1b]" : "!text-[#64748b]"}`}>
                    {rec.note}
                  </span>
                </div>

                {/* Status badge */}
                <span className={`shrink-0 inline-flex items-center px-3 py-1.5 rounded-full !text-[0.75rem] !font-[800] ${STATUS_STYLE[rec.status]}`}>
                  {rec.status}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

    </main>
  );
}
