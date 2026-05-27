"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useCreateSchedule, useDeleteSchedule, useSchedules, useUpdateSchedule } from "@/core/api/hooks/useSchedules";
import { useAllClinicalCases, useInstructorCases, useStudentCases } from "@/core/api/hooks/useClinicalCases";
import { useHospitals } from "@/core/api/hooks/useHospitals";
import { useInstructors, useUsers } from "@/core/api/hooks/useUsers";
import { useAuthStore } from "@/core/store/authStore";
import { User, UserRole } from "@/core/types/user";
import { InlineSelect } from "@/components/ui/InlineSelect";
import { LoadingState } from "@/components/ui/LoadingState";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { useToast } from "@/components/ui/ToastProvider";
import { useCanEditFeature } from "@/core/auth/permissions";

const routeRoleMap: Record<string, UserRole> = {
  "/nursing-student": "STUDENT",
  "/clinical-instructor": "INSTRUCTOR",
  "/admin": "ADMIN",
  "/chair": "CHAIR",
  "/coordinator": "COORDINATOR",
  "/assistant": "ASSISTANT",
};

function formatDisplayDate(date?: string) {
  if (!date) return "Schedule date";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function getScheduleStatus(date?: string) {
  if (!date) return "Scheduled";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scheduleDate = new Date(`${date}T00:00:00`);
  if (scheduleDate.getTime() > today.getTime()) return "Upcoming";
  if (scheduleDate.getTime() === today.getTime()) return "Today";
  return "Completed";
}

function getScheduleStatusClass(status: string) {
  if (status === "Canceled") return "bg-[#fef2f2] !text-[#991b1b]";
  if (status === "Completed" || status === "Published" || status === "Assigned") return "bg-[#dcfce7] !text-[#166534]";
  if (status === "Upcoming" || status === "Today") return "bg-[#fff8e1] !text-[#6c4c00]";
  return "bg-[#f1f5f9] !text-[#475569]";
}

function chairScheduleBadge(schedule: any, index: number) {
  if (schedule.activeStudents?.length === 0) return "Canceled";
  return "Published";
}

function chairScheduleBadgeClass(label: string) {
  if (label === "Canceled") return "bg-[#fef2f2] !text-[#991b1b]";
  if (label === "Published") return "bg-[#dcfce7] !text-[#166534]";
  return "bg-[#fef3c7] !text-[#92400e]";
}

function chairScheduleTitle(schedule: any) {
  return schedule.area ? `${schedule.area} ${schedule.area.toLowerCase().includes("duty") ? "" : "Duty"}`.trim() : "Clinical Duty";
}

function getClinicalValidationClass(label: string) {
  if (label === "Approved") return "bg-[#e9f8ef] !text-[#03703c]";
  if (label === "Pending") return "bg-[#fff8e1] !text-[#6c4c00]";
  return "bg-[#f1f5f9] !text-[#475569]";
}

function getScheduleGroupKey(schedule: any) {
  return [schedule.date, schedule.hospital, schedule.area, schedule.startTime, schedule.endTime, schedule.instructorId, schedule.studentSection].map((value) => value ?? "").join("|");
}

function groupSchedulesByDuty(records: any[]) {
  const groups = new Map<string, any>();
  records.forEach((schedule: any) => {
    const key = getScheduleGroupKey(schedule);
    const current = groups.get(key);
    if (current) {
      current.students.push(schedule);
      return;
    }
    groups.set(key, { ...schedule, groupKey: key, students: [schedule] });
  });
  return Array.from(groups.values()).map((group: any) => ({
    ...group,
    activeStudents: group.students.filter((student: any) => !student.canceled),
  }));
}

function splitUniqueStudentSchedules(records: any[]) {
  const seen = new Set<string>();
  const unique: any[] = [];
  const duplicates: any[] = [];
  records.forEach((record: any) => {
    const key = String(record.studentId ?? record.studentSchoolId ?? record.id);
    if (seen.has(key)) {
      duplicates.push(record);
      return;
    }
    seen.add(key);
    unique.push(record);
  });
  return { unique, duplicates };
}

function toTimeInput(time?: string) {
  if (!time) return "";
  if (/^\d{2}:\d{2}/.test(time)) return time.slice(0, 5);
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return "";
  const [, hourText, minute, period] = match;
  let hour = Number(hourText);
  if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (period.toUpperCase() === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${minute}`;
}

function schedulePayload(schedule: any, overrides: any = {}) {
  const next = { ...schedule, ...overrides };
  const payload: any = {
    student: { 
      id: next.studentId,
      sectionInfo: next.studentSection || next.student?.sectionInfo,
    },
    instructor: { id: next.instructorId },
    hospital: next.hospital,
    ward: next.area,
    shiftDate: next.date,
    startTime: `${toTimeInput(next.rawStartTime ?? next.startTime)}:00`,
    endTime: `${toTimeInput(next.rawEndTime ?? next.endTime)}:00`,
  };
  if (next.canceled !== undefined) payload.canceled = next.canceled;
  return payload;
}

export function SchedulesDayContent({ basePath }: { basePath: string }) {
  const { showToast } = useToast();
  const { canEdit: canEditSchedules } = useCanEditFeature("scheduleMaker");
  const searchParams = useSearchParams();
  const selectedScheduleId = searchParams.get("schedule");
  const selectedDateParam = searchParams.get("date");
  const user = useAuthStore((state) => state.user);
  const routeRole = routeRoleMap[basePath] ?? user?.role;
  const userId = user?.id != null ? String(user.id) : undefined;
  const scopedViewerId = (routeRole === "CHAIR" || routeRole === "ASSISTANT") && userId ? userId : undefined;
  const { data: schedules = [], isLoading, isFetching, refetch } = useSchedules(routeRole === "CHAIR" || routeRole === "COORDINATOR" || routeRole === "ASSISTANT" ? userId : undefined, routeRole);
  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();
  const deleteSchedule = useDeleteSchedule();
  const { data: hospitals = [] } = useHospitals();
  const { data: instructors = [] } = useInstructors();
  const { data: databaseStudents = [] } = useUsers("STUDENT", scopedViewerId, routeRole === "ADMIN" || routeRole === "CHAIR" || routeRole === "COORDINATOR" || routeRole === "ASSISTANT");
  const { data: instructorCases = [] } = useInstructorCases();
  const { data: studentCases = [] } = useStudentCases();
  const { data: allCases = [] } = useAllClinicalCases(routeRole !== "STUDENT" && routeRole !== "INSTRUCTOR", scopedViewerId);
  const visibleSchedules = schedules as any[];
  const clinicalCases = routeRole === "INSTRUCTOR" ? instructorCases : routeRole === "STUDENT" ? studentCases : allCases;
  const routeSelectedSchedule = visibleSchedules.find((schedule: any) => String(schedule.id) === selectedScheduleId);
  const selectedDate = selectedDateParam ?? routeSelectedSchedule?.date ?? visibleSchedules[0]?.date;
  const dayScheduleRows = visibleSchedules.filter((schedule: any) => schedule.date === selectedDate);
  const dayScheduleGroups = groupSchedulesByDuty(dayScheduleRows);
  const activeDayScheduleGroups = dayScheduleGroups.filter((schedule: any) => schedule.activeStudents?.length > 0);
  const initialSelectedGroupKey = routeSelectedSchedule ? getScheduleGroupKey(routeSelectedSchedule) : dayScheduleGroups[0]?.groupKey;
  const [selectedGroupKey, setSelectedGroupKey] = React.useState<string | undefined>(initialSelectedGroupKey);
  React.useEffect(() => {
    setSelectedGroupKey(initialSelectedGroupKey);
  }, [initialSelectedGroupKey]);
  const selectedSchedule = dayScheduleGroups.find((schedule: any) => schedule.groupKey === selectedGroupKey) ?? dayScheduleGroups[0];
  const assignedStudents = selectedSchedule?.students ?? [];
  const allAssignmentSplit = React.useMemo(() => splitUniqueStudentSchedules(assignedStudents), [assignedStudents]);
  const allAssignedStudents = allAssignmentSplit.unique;
  const activeAssignmentSplit = React.useMemo(() => splitUniqueStudentSchedules(assignedStudents.filter((schedule: any) => !schedule.canceled)), [assignedStudents]);
  const activeAssignedStudents = activeAssignmentSplit.unique;
  const duplicateAssignedStudents = activeAssignmentSplit.duplicates;
  const selectedScheduleCanceled = assignedStudents.length > 0 && activeAssignedStudents.length === 0;
  const visibleAssignedStudents = selectedScheduleCanceled ? [] : activeAssignedStudents;
  const instructorName = selectedSchedule?.instructorName || "Clinical Instructor";
  const isStudentView = basePath === "/nursing-student";
  const isChairView = basePath === "/admin" || basePath === "/chair" || basePath === "/coordinator" || basePath === "/assistant";
  const canEditChairSchedule = basePath === "/admin" || basePath === "/chair" || basePath === "/assistant" || (basePath === "/coordinator" && canEditSchedules);
  const [reviewNotes, setReviewNotes] = React.useState("");
  const [studentSearch, setStudentSearch] = React.useState("");
  const [breakDate, setBreakDate] = React.useState("");
  const [breakDates, setBreakDates] = React.useState<string[]>([]);
  const [draftSchedule, setDraftSchedule] = React.useState<any>(null);
  const [assignmentDrafts, setAssignmentDrafts] = React.useState<any[]>([]);
  const [isEditingChairSchedule, setIsEditingChairSchedule] = React.useState(false);
  React.useEffect(() => {
    if (!selectedSchedule) return;
    setDraftSchedule({
      title: `${selectedSchedule.area || "Clinical"} Rotation`,
      group: selectedSchedule.studentSection || "Assigned Group",
      startDate: selectedSchedule.date,
      endDate: selectedSchedule.date,
      hospital: selectedSchedule.hospital || "",
      area: selectedSchedule.area || "",
      dutyType: "Regular",
      shiftStart: toTimeInput(selectedSchedule.rawStartTime ?? selectedSchedule.startTime),
      shiftEnd: toTimeInput(selectedSchedule.rawEndTime ?? selectedSchedule.endTime),
      casePresentationDate: selectedSchedule.date,
      casePresentationTime: toTimeInput(selectedSchedule.rawStartTime ?? selectedSchedule.startTime),
      noCasePresentation: false,
      instructorId: selectedSchedule.instructorId != null ? String(selectedSchedule.instructorId) : "",
    });
    setAssignmentDrafts(activeAssignedStudents.map((schedule: any) => ({ ...schedule, originalGroupKey: selectedSchedule.groupKey, draftGroupKey: selectedSchedule.groupKey, removed: false })));
    setReviewNotes("");
    setBreakDates([]);
    setIsEditingChairSchedule(false);
  }, [selectedSchedule?.groupKey]);
  const selectedHospital = (hospitals as any[]).find((hospital: any) => hospital.name === draftSchedule?.hospital);
  const allDutyAreas = React.useMemo(() => Array.from(new Set((hospitals as any[]).flatMap((hospital: any) => hospital.wards ?? []).filter(Boolean))).sort(), [hospitals]);
  const dutyAreas = selectedHospital?.wards?.length ? selectedHospital.wards : allDutyAreas;
  const hospitalOptions = React.useMemo(() => (hospitals as any[]).map((hospital: any) => ({ value: hospital.name, label: hospital.fullName ? `${hospital.name} - ${hospital.fullName}` : hospital.name })), [hospitals]);
  const dutyAreaOptions = React.useMemo(() => dutyAreas.map((area: string) => ({ value: area, label: area })), [dutyAreas]);
  const instructorOptions = React.useMemo(() => (instructors as any[]).map((instructor: any) => ({ value: String(instructor.id), label: instructor.fullName })), [instructors]);
  const groupOptions = React.useMemo(() => activeDayScheduleGroups.map((schedule: any) => ({ value: schedule.groupKey, label: schedule.studentSection || "Assigned Group" })), [activeDayScheduleGroups]);
  const isSaving = createSchedule.isPending || updateSchedule.isPending || deleteSchedule.isPending;
  const editorDisabled = !isEditingChairSchedule || isSaving || !canEditChairSchedule;
  const displayedAssignedStudents = isEditingChairSchedule
    ? assignmentDrafts.filter((schedule: any) => !schedule.removed && schedule.draftGroupKey === selectedSchedule.groupKey)
    : visibleAssignedStudents;
  const filteredAssignedStudents = displayedAssignedStudents;
  const studentSearchResults = React.useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    if (!query || !isEditingChairSchedule) return [];
    const assignedIds = new Set(assignmentDrafts.filter((schedule: any) => !schedule.removed).map((schedule: any) => String(schedule.studentId ?? schedule.studentSchoolId)));
    return (databaseStudents as User[])
      .filter((student) => !assignedIds.has(String(student.id)) && !assignedIds.has(String(student.schoolId)))
      .filter((student) => `${student.fullName} ${student.schoolId} ${student.sectionInfo ?? ""} ${student.groupInfo ?? ""} ${student.email}`.toLowerCase().includes(query))
      .slice(0, 8);
  }, [assignmentDrafts, databaseStudents, isEditingChairSchedule, studentSearch]);

  function cancelChairEdit() {
    setAssignmentDrafts(activeAssignedStudents.map((schedule: any) => ({ ...schedule, originalGroupKey: selectedSchedule.groupKey, draftGroupKey: selectedSchedule.groupKey, removed: false })));
    setIsEditingChairSchedule(false);
  }

  function startChairEdit() {
    if (!canEditChairSchedule) return;
    setAssignmentDrafts(activeAssignedStudents.map((schedule: any) => ({ ...schedule, originalGroupKey: selectedSchedule.groupKey, draftGroupKey: selectedSchedule.groupKey, removed: false })));
    setIsEditingChairSchedule(true);
  }

  function getClinicalValidation(schedule: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduleDate = new Date(`${schedule.date}T00:00:00`);
    if (scheduleDate.getTime() > today.getTime()) return "No validation yet";

    const matchingCases = (clinicalCases as any[]).filter((clinicalCase: any) =>
      String(clinicalCase.studentId) === String(schedule.studentId) &&
      clinicalCase.procedureDate === schedule.date &&
      clinicalCase.hospital === schedule.hospital &&
      (clinicalCase.dutyArea === schedule.area || clinicalCase.area === schedule.area)
    );

    if (matchingCases.some((clinicalCase: any) => clinicalCase.status === "APPROVED")) return "Approved";
    if (matchingCases.length > 0) return "Pending";
    return "No validation yet";
  }

  if (isLoading) {
    return <main className="p-[clamp(24px,4vw,42px)]"><LoadingState message="Loading schedule..." className="rounded-xl border border-[#e2e8f0] bg-white" /></main>;
  }

  if (!selectedSchedule) {
    return <main className="p-[clamp(24px,4vw,42px)]"><div className="p-6 rounded-xl border border-[#e2e8f0] bg-white font-bold text-[#64748b]">No schedule selected.</div></main>;
  }

  async function saveSelectedSchedule() {
    if (!canEditChairSchedule) {
      showToast({ variant: "error", title: "Action unavailable", message: "Schedule editing is not enabled for your role." });
      return;
    }
    if (!draftSchedule || !selectedSchedule) return;
    try {
      const duplicateDeletes = duplicateAssignedStudents.map((schedule: any) => deleteSchedule.mutateAsync(String(schedule.id)));
      
      const remainingActiveCount = assignmentDrafts.filter((s: any) => !s.removed).length;
      const allRemoved = remainingActiveCount === 0;

      const assignmentSaves = assignmentDrafts.map((schedule: any) => {
        if (schedule.removed) {
          if (schedule.isNew) return Promise.resolve();
          if (allRemoved) {
            return updateSchedule.mutateAsync({
              scheduleId: String(schedule.id),
              schedule: schedulePayload(schedule, { canceled: true }),
            });
          }
          return deleteSchedule.mutateAsync(String(schedule.id));
        }
        if (schedule.isNew) return createSchedule.mutateAsync(schedulePayload(schedule, {
          instructorId: Number(draftSchedule.instructorId || schedule.instructorId),
          hospital: draftSchedule.hospital,
          area: draftSchedule.area,
          date: draftSchedule.startDate,
          rawStartTime: draftSchedule.shiftStart,
          rawEndTime: draftSchedule.shiftEnd,
          studentSection: draftSchedule.group,
        }));
        if (schedule.draftGroupKey !== schedule.originalGroupKey) {
          const target = dayScheduleGroups.find((group: any) => group.groupKey === schedule.draftGroupKey);
          if (!target) return Promise.resolve();
          return updateSchedule.mutateAsync({
            scheduleId: String(schedule.id),
            schedule: schedulePayload(schedule, {
              instructorId: target.instructorId,
              hospital: target.hospital,
              area: target.area,
              date: target.date,
              rawStartTime: target.rawStartTime ?? target.startTime,
              rawEndTime: target.rawEndTime ?? target.endTime,
              studentSection: target.studentSection,
            }),
          });
        }
        return updateSchedule.mutateAsync({
          scheduleId: String(schedule.id),
          schedule: schedulePayload(schedule, {
            instructorId: Number(draftSchedule.instructorId || schedule.instructorId),
            hospital: draftSchedule.hospital,
            area: draftSchedule.area,
            date: draftSchedule.startDate,
            rawStartTime: draftSchedule.shiftStart,
            rawEndTime: draftSchedule.shiftEnd,
            studentSection: draftSchedule.group,
          }),
        });
      });
      await Promise.all([...duplicateDeletes, ...assignmentSaves]);
      showToast({ variant: "success", title: "Schedule saved", message: "The selected duty schedule was updated." });
      setIsEditingChairSchedule(false);
    } catch {
      showToast({ variant: "error", title: "Save failed", message: "Selected schedule could not be saved." });
    }
  }

  function removeStudentSchedule(schedule: any) {
    if (!canEditChairSchedule || !isEditingChairSchedule) return;
    setAssignmentDrafts((current) => schedule.isNew ? current.filter((item: any) => String(item.id) !== String(schedule.id)) : current.map((item: any) => String(item.id) === String(schedule.id) ? { ...item, removed: true } : item));
    showToast({ variant: "success", title: "Student marked for removal", message: "Click Save to apply this schedule change." });
  }

  function addStudentSchedule(student: User) {
    if (!canEditChairSchedule || !isEditingChairSchedule || !selectedSchedule) return;
    const duplicate = assignmentDrafts.some((schedule: any) => !schedule.removed && (String(schedule.studentId) === String(student.id) || String(schedule.studentSchoolId) === String(student.schoolId)));
    if (duplicate) {
      showToast({ variant: "error", title: "Already assigned", message: "This student is already in this schedule group." });
      return;
    }
    setAssignmentDrafts((current) => [...current, {
      ...selectedSchedule,
      id: `new-${student.id}`,
      isNew: true,
      studentId: student.id,
      studentName: student.fullName,
      studentSchoolId: student.schoolId,
      studentSection: selectedSchedule.studentSection,
      studentProfileImageUrl: student.profileImageUrl,
      originalGroupKey: selectedSchedule.groupKey,
      draftGroupKey: selectedSchedule.groupKey,
      removed: false,
    }]);
    setStudentSearch("");
    showToast({ variant: "success", title: "Student added", message: "Click Save to publish this student schedule." });
  }

  function moveStudentSchedule(schedule: any, targetGroupKey: string) {
    if (!canEditChairSchedule || !isEditingChairSchedule) return;
    if (targetGroupKey === schedule.draftGroupKey) return;
    const target = dayScheduleGroups.find((group: any) => group.groupKey === targetGroupKey);
    if (!target) return;
    const duplicateInDraft = assignmentDrafts.some((item: any) => String(item.id) !== String(schedule.id) && !item.removed && item.draftGroupKey === targetGroupKey && String(item.studentId) === String(schedule.studentId));
    const duplicateInTarget = (target.activeStudents ?? []).some((item: any) => String(item.id) !== String(schedule.id) && String(item.studentId) === String(schedule.studentId));
    if (duplicateInDraft || duplicateInTarget) {
      showToast({ variant: "error", title: "Already assigned", message: "This student is already in the selected schedule group." });
      return;
    }
    setAssignmentDrafts((current) => current.map((item: any) => String(item.id) === String(schedule.id) ? { ...item, draftGroupKey: targetGroupKey } : item));
    showToast({ variant: "success", title: "Student marked to move", message: "Click Save to apply this schedule change." });
  }

  async function cancelSelectedSchedule() {
    if (!canEditChairSchedule || !isEditingChairSchedule) return;
    const activeScheduleRows = assignedStudents.filter((schedule: any) => !schedule.canceled && !schedule.isNew);
    if (activeScheduleRows.length === 0) return;

    try {
      await Promise.all(activeScheduleRows.map((schedule: any) => updateSchedule.mutateAsync({
        scheduleId: String(schedule.id),
        schedule: schedulePayload(schedule, { canceled: true }),
      })));
      setAssignmentDrafts((current) => current.map((schedule: any) => ({ ...schedule, removed: false, canceled: true })));
      setIsEditingChairSchedule(false);
      showToast({ variant: "success", title: "Schedule deactivated", message: "The selected duty schedule was deactivated." });
    } catch {
      showToast({ variant: "error", title: "Deactivate failed", message: "Selected schedule could not be deactivated." });
    }
  }

  async function restoreSelectedSchedule() {
    try {
      await Promise.all(assignedStudents.map((schedule: any) => updateSchedule.mutateAsync({
        scheduleId: String(schedule.id),
        schedule: schedulePayload(schedule, { canceled: false }),
      })));
      showToast({ variant: "success", title: "Schedule restored", message: "The selected schedule is active again." });
      setIsEditingChairSchedule(false);
    } catch {
      showToast({ variant: "error", title: "Restore failed", message: "Selected schedule could not be restored." });
    }
  }

  return (
    <main className="min-w-0 overflow-x-hidden p-[clamp(24px,4vw,42px)] content-start grid gap-5 w-full">
      <section className="grid min-w-0 max-w-full gap-5 overflow-x-hidden">
        
        {/* Day schedule options */}
        {dayScheduleGroups.length > 1 && <article className="relative rounded-xl border border-[#e2e8f0] shadow-[0_16px_44px_rgba(32,33,36,0.07)] overflow-hidden p-[1.75rem] bg-[linear-gradient(180deg,#fff8d6_0%,#ffffff_58%,#ffffff_100%)]">
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <h2 className="m-0 !text-[#202124] !text-[1.25rem] leading-[1.2] !font-[900] tracking-[-0.03em]">{formatDisplayDate(selectedSchedule.date)}</h2>
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#fef3c7] !text-[#92400e] !text-[0.8rem] !font-[900]">{activeDayScheduleGroups.length} active schedule(s)</span>
          </div>
          <div className="grid grid-cols-2 gap-[1rem] max-[900px]:grid-cols-1">
            {dayScheduleGroups.map((schedule: any, index: number) => {
              const isSelected = schedule.groupKey === selectedSchedule.groupKey;
              const badge = chairScheduleBadge(schedule, index);
              return <button key={schedule.groupKey} type="button" onClick={() => setSelectedGroupKey(schedule.groupKey)} className={`relative text-left min-h-[136px] rounded-xl border bg-white p-[1.45rem_1.55rem] transition-all cursor-pointer overflow-hidden ${isSelected ? "border-[#e7a6aa] shadow-[0_22px_44px_rgba(138,37,44,0.10)] before:absolute before:inset-[0_auto_0_0] before:w-[5px] before:bg-[linear-gradient(180deg,#8A252C,#ffcf01)]" : "border-[#dbe3ee] hover:border-[#e7a6aa] hover:shadow-[0_16px_34px_rgba(32,33,36,0.08)] before:absolute before:inset-[0_auto_0_0] before:w-[5px] before:bg-[linear-gradient(180deg,#8A252C,#ffcf01)] before:opacity-90"}`}>
                <div className="relative z-10 flex items-start justify-between gap-4"><div><strong className="block !text-[#111827] !text-[1.02rem] !font-[900] mb-[0.85rem]">{chairScheduleTitle(schedule)}</strong><p className="m-0 !text-[#4c5d7d] !text-[0.95rem] !font-[900]">{schedule.studentSection || "Assigned Group"}</p><p className="m-[0.65rem_0_0] !text-[#4c5d7d] !text-[0.86rem] !font-[900]">{schedule.area || schedule.hospital} - {schedule.startTime} to {schedule.endTime}</p></div><span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full !text-[0.75rem] !font-[900] whitespace-nowrap ${chairScheduleBadgeClass(badge)}`}>{badge}</span></div>
              </button>;
            })}
          </div>
        </article>}

        {isChairView && draftSchedule && <>
          <article className="relative min-w-0 max-w-full w-full box-border rounded-xl border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] overflow-hidden p-[clamp(0.75rem,3vw,1.45rem)]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#fff8d6_0%,#ffffff_60%)] pointer-events-none" />
            <div className="relative z-10 min-w-0 max-w-full">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 mb-5 max-[760px]:grid-cols-1">
                <div className="flex items-center gap-3 min-w-0">
                  <h2 className="m-0 min-w-0 !text-[#202124] !text-[1.25rem] !font-[900] tracking-[-0.03em] break-words max-[760px]:!text-[1.15rem]">{draftSchedule.title}</h2>
                </div>
                <div className="flex items-center justify-end gap-3 flex-wrap max-[760px]:w-full max-[760px]:flex-col max-[760px]:items-stretch"><span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full !text-[0.76rem] !font-[900] max-[760px]:w-full ${chairScheduleBadgeClass(selectedScheduleCanceled ? "Canceled" : "Published")}`}>{selectedScheduleCanceled ? "Canceled" : "Published"}</span>{selectedScheduleCanceled ? <button type="button" onClick={restoreSelectedSchedule} disabled={!canEditChairSchedule || isSaving} className="inline-flex items-center justify-center min-h-[40px] px-4 rounded-lg bg-white border border-[#86efac] !text-[#15803d] !text-[0.86rem] !font-[900] cursor-pointer hover:bg-[#ecfdf3] transition-colors disabled:opacity-60 disabled:cursor-not-allowed max-[760px]:w-full">Restore Schedule</button> : <button type="button" onClick={isEditingChairSchedule ? cancelChairEdit : startChairEdit} disabled={!canEditChairSchedule || isSaving} className="inline-flex items-center justify-center min-h-[40px] px-4 rounded-lg bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.86rem] !font-[900] cursor-pointer hover:border-[#cbd5e1] transition-colors disabled:opacity-60 disabled:cursor-not-allowed max-[760px]:w-full">{isEditingChairSchedule ? "Cancel Edit" : "Edit Schedule"}</button>}</div>
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-[16px] min-[1500px]:grid-cols-4">
                <label className="min-w-0 flex flex-col gap-2 !text-[#4b5565] !text-[0.86rem] !font-[900]">Schedule Title<input disabled={editorDisabled} className="w-full min-w-0 min-h-[48px] rounded-lg border border-[#dbe3ee] bg-[#f8fafc] px-4 !text-[#111827] !font-[800] disabled:!text-[#94a3b8]" value={draftSchedule.title} onChange={(event) => setDraftSchedule((current: any) => ({ ...current, title: event.target.value }))} /></label>
                <label className="min-w-0 flex flex-col gap-2 !text-[#4b5565] !text-[0.86rem] !font-[900]">Assigned Group<input className="w-full min-w-0 min-h-[48px] rounded-lg border border-[#dbe3ee] bg-[#f8fafc] px-4 !text-[#94a3b8] !font-[800]" value={draftSchedule.group} readOnly /></label>
                <label className="min-w-0 flex flex-col gap-2 !text-[#4b5565] !text-[0.86rem] !font-[900]">Start Date<input disabled={editorDisabled} className="w-full min-w-0 min-h-[48px] rounded-lg border border-[#dbe3ee] bg-[#f8fafc] px-4 !text-[#111827] !font-[800] disabled:!text-[#94a3b8]" type="date" value={draftSchedule.startDate} onChange={(event) => setDraftSchedule((current: any) => ({ ...current, startDate: event.target.value, endDate: event.target.value }))} /></label>
                <label className="min-w-0 flex flex-col gap-2 !text-[#4b5565] !text-[0.86rem] !font-[900]">End Date<input disabled={editorDisabled} className="w-full min-w-0 min-h-[48px] rounded-lg border border-[#dbe3ee] bg-[#f8fafc] px-4 !text-[#111827] !font-[800] disabled:!text-[#94a3b8]" type="date" value={draftSchedule.endDate} onChange={(event) => setDraftSchedule((current: any) => ({ ...current, endDate: event.target.value }))} /></label>
              </div>

              <div className="mt-4 min-w-0 rounded-lg border border-[#dbe3ee] bg-[#f8fafc] p-4 max-[760px]:p-3">
                <label className="block !text-[#4b5565] !text-[0.86rem] !font-[900] mb-3">Break Dates</label>
                <div className="flex min-w-0 gap-3 max-[760px]:flex-col"><input disabled={editorDisabled} className="w-full min-w-0 min-h-[48px] flex-1 rounded-lg border border-[#dbe3ee] bg-white px-4 !text-[#111827] !font-[800] disabled:!text-[#94a3b8]" type="date" value={breakDate} onChange={(event) => setBreakDate(event.target.value)} /><button type="button" disabled={editorDisabled} onClick={() => { if (!breakDate || breakDates.includes(breakDate)) return; setBreakDates((current) => [...current, breakDate]); setBreakDate(""); }} className="min-h-[48px] px-4 rounded-lg bg-white border border-[#dbe3ee] !text-[#344054] !font-[900] cursor-pointer hover:bg-[#f8fafc] disabled:opacity-60 disabled:cursor-not-allowed">Add break</button></div>
                <p className="m-[14px_0_0] !text-[#64748b] !text-[0.82rem] !font-[800]">{breakDates.length ? breakDates.join(", ") : "No breaks added"}</p>
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-[16px] mt-4 min-[1500px]:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
                <label className="min-w-0 flex flex-col gap-2 !text-[#4b5565] !text-[0.86rem] !font-[900]">Hospital<InlineSelect value={draftSchedule.hospital} options={hospitalOptions} placeholder="Select hospital" onChange={(value) => setDraftSchedule((current: any) => ({ ...current, hospital: value }))} disabled={editorDisabled} /></label>
                <label className="min-w-0 flex flex-col gap-2 !text-[#4b5565] !text-[0.86rem] !font-[900]">Duty Area<InlineSelect value={draftSchedule.area} options={dutyAreaOptions} placeholder="Select duty area" onChange={(value) => setDraftSchedule((current: any) => ({ ...current, area: value }))} disabled={editorDisabled} /></label>
                <label className="min-w-0 flex flex-col gap-2 !text-[#4b5565] !text-[0.86rem] !font-[900]">Duty Type<InlineSelect value={draftSchedule.dutyType} options={[{ value: "Regular", label: "Regular" }, { value: "Make-up Duty", label: "Make-up Duty" }, { value: "Extension", label: "Extension" }]} placeholder="Duty type" onChange={(value) => setDraftSchedule((current: any) => ({ ...current, dutyType: value }))} disabled={editorDisabled} /></label>
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-[16px] mt-4 min-[1500px]:grid-cols-4">
                <label className="min-w-0 flex flex-col gap-2 !text-[#4b5565] !text-[0.86rem] !font-[900]">Shift Start<input disabled={editorDisabled} className="w-full min-w-0 min-h-[48px] rounded-lg border border-[#dbe3ee] bg-[#f8fafc] px-4 !text-[#111827] !font-[800] disabled:!text-[#94a3b8]" type="time" value={draftSchedule.shiftStart} onChange={(event) => setDraftSchedule((current: any) => ({ ...current, shiftStart: event.target.value }))} /></label>
                <label className="min-w-0 flex flex-col gap-2 !text-[#4b5565] !text-[0.86rem] !font-[900]">Shift End<input disabled={editorDisabled} className="w-full min-w-0 min-h-[48px] rounded-lg border border-[#dbe3ee] bg-[#f8fafc] px-4 !text-[#111827] !font-[800] disabled:!text-[#94a3b8]" type="time" value={draftSchedule.shiftEnd} onChange={(event) => setDraftSchedule((current: any) => ({ ...current, shiftEnd: event.target.value }))} /></label>
                <label className="min-w-0 flex flex-col gap-2 !text-[#4b5565] !text-[0.86rem] !font-[900]">Case Presentation Date<input className="w-full min-w-0 min-h-[48px] rounded-lg border border-[#dbe3ee] bg-[#f8fafc] px-4 !text-[#111827] !font-[800] disabled:!text-[#94a3b8]" type="date" value={draftSchedule.casePresentationDate} disabled={editorDisabled || draftSchedule.noCasePresentation} onChange={(event) => setDraftSchedule((current: any) => ({ ...current, casePresentationDate: event.target.value }))} /></label>
                <label className="min-w-0 flex flex-col gap-2 !text-[#4b5565] !text-[0.86rem] !font-[900]">Case Presentation Time<input className="w-full min-w-0 min-h-[48px] rounded-lg border border-[#dbe3ee] bg-[#f8fafc] px-4 !text-[#111827] !font-[800] disabled:!text-[#94a3b8]" type="time" value={draftSchedule.casePresentationTime} disabled={editorDisabled || draftSchedule.noCasePresentation} onChange={(event) => setDraftSchedule((current: any) => ({ ...current, casePresentationTime: event.target.value }))} /></label>
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-[16px] mt-4 min-[1500px]:grid-cols-2">
                <label className="flex items-center gap-2 min-[1500px]:pt-7 cursor-pointer"><input type="checkbox" className="w-5 h-5 shrink-0 accent-[#8A252C] cursor-pointer" disabled={editorDisabled} checked={draftSchedule.noCasePresentation} onChange={(event) => setDraftSchedule((current: any) => ({ ...current, noCasePresentation: event.target.checked }))} /><span className="!text-[#334155] !font-[900] whitespace-nowrap">No Case Presentation</span></label>
                <label className="min-w-0 flex flex-col gap-2 !text-[#4b5565] !text-[0.86rem] !font-[900]">Supervising CI<InlineSelect value={draftSchedule.instructorId} options={instructorOptions.length ? instructorOptions : [{ value: draftSchedule.instructorId, label: instructorName }]} placeholder="Select CI" onChange={(value) => setDraftSchedule((current: any) => ({ ...current, instructorId: value }))} disabled={editorDisabled} /></label>
              </div>

              <label className="flex flex-col gap-2 mt-4 !text-[#4b5565] !text-[0.86rem] !font-[900]">Review Notes<textarea disabled={editorDisabled} className="w-full min-h-[104px] rounded-lg border border-[#dbe3ee] bg-[#f8fafc] px-4 py-3 !text-[#111827] !font-[800] resize-y disabled:!text-[#94a3b8]" placeholder="Add correction notes before republishing" value={reviewNotes} onChange={(event) => setReviewNotes(event.target.value)} /></label>
              {isEditingChairSchedule && <div className="flex justify-end gap-3 mt-6 flex-wrap max-[560px]:flex-col"><button type="button" disabled={isSaving || activeAssignedStudents.length === 0} onClick={cancelSelectedSchedule} className="min-h-[48px] px-6 rounded-lg bg-white border border-[#fca5a5] !text-[#c62828] !font-[900] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed max-[560px]:w-full">Deactivate Schedule</button><button type="button" disabled={isSaving || !canEditChairSchedule} onClick={saveSelectedSchedule} className="min-h-[48px] px-8 rounded-lg bg-[#a83a44] border border-[#a83a44] !text-white !font-[900] shadow-[0_12px_24px_rgba(138,37,44,0.22)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed max-[560px]:w-full">{isSaving ? "Saving..." : "Save Selected Schedule"}</button></div>}
            </div>
          </article>

          <article className="rounded-xl border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] p-[clamp(0.75rem,3vw,1.45rem)] min-w-0 max-w-full overflow-hidden">
            <div className="flex items-center justify-between gap-4 mb-5"><h2 className="m-0 !text-[#202124] !text-[1.15rem] !font-[900]">Assigned Student(s)</h2><span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#fef3c7] !text-[#92400e] !text-[0.78rem] !font-[900]">{displayedAssignedStudents.length} {selectedScheduleCanceled ? "assigned" : "active"} student(s)</span></div>
            <div className="relative mb-4 rounded-xl border border-[#dbe3ee] p-4 !text-[#111827] !font-[900]">Search Student(s)<input className="mt-2 w-full min-h-[52px] rounded-lg border border-[#dbe3ee] bg-white px-4 !text-[#111827] !font-[800]" placeholder={isEditingChairSchedule ? "Search by name, ID, section, or email to add" : "Click Edit Schedule before adding students"} value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} disabled={!isEditingChairSchedule} />
              {isEditingChairSchedule && studentSearch.trim() ? <div className="absolute left-4 right-4 top-[calc(100%_-_6px)] z-30 max-h-[240px] overflow-y-auto rounded-lg border border-[#e2e8f0] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                {studentSearchResults.length ? studentSearchResults.map((student) => <button key={student.id} type="button" className="block w-full border-b border-[#f1f5f9] p-4 text-left last:border-b-0 hover:bg-[#f8fafc]" onClick={() => addStudentSchedule(student)}><strong className="block !text-[#111827] !font-[900]">{student.fullName}</strong><small className="block mt-1 !text-[#64748b] !font-[800]">{student.schoolId} - {student.sectionInfo || "No section"}{student.groupInfo ? ` - Group: ${student.groupInfo}` : ""}</small></button>) : <div className="p-4 !text-[#64748b] !font-[800]">No matching student(s) found.</div>}
              </div> : null}
            </div>
            <div className="rounded-xl border border-[#e2e8f0] overflow-x-auto"><table className="w-full border-collapse text-left"><thead><tr className="bg-[#f8fafc] border-b border-[#e2e8f0] !text-[#111827] !text-[0.76rem] !font-[900] uppercase"><th className="p-4 w-[52px]">No.</th><th className="p-4">Student</th><th className="p-4 w-[180px] max-[640px]:hidden">Move To</th><th className="p-4 w-[110px]">Action</th></tr></thead><tbody>{filteredAssignedStudents.map((schedule: any, index: number) => <tr key={schedule.id} className="border-b border-[#e2e8f0] last:border-0"><td className="p-4 !font-[800]">{index + 1}.</td><td className="p-4"><div className="flex items-center gap-3"><ProfileAvatar name={schedule.studentName || "Nursing Student"} imageUrl={schedule.studentProfileImageUrl} size={42} /><strong className="!text-[#202124] !font-[900]">{schedule.studentName || "Nursing Student"}</strong></div></td><td className="p-4 max-[640px]:hidden"><InlineSelect value={schedule.draftGroupKey ?? selectedSchedule.groupKey} options={groupOptions} placeholder="Move to group" onChange={(value) => moveStudentSchedule(schedule, value)} disabled={!isEditingChairSchedule || !canEditChairSchedule || isSaving} /></td><td className="p-4"><button type="button" disabled={!isEditingChairSchedule || !canEditChairSchedule || isSaving} onClick={() => removeStudentSchedule(schedule)} className="min-h-[38px] px-4 rounded-lg bg-white border border-[#fca5a5] !text-[#c62828] !text-[0.82rem] !font-[900] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">Remove</button></td></tr>)}</tbody></table></div>
          </article>
        </>}

        {!isChairView && <>
        {/* Top Info Card */}
        <article className="relative rounded-2xl border border-[#fde68a] shadow-[0_16px_44px_rgba(32,33,36,0.07)] overflow-hidden bg-white">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,#fff8d6_0%,#ffffff_48%,#fffaf0_100%)] pointer-events-none" />
          <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full bg-[#ffcf01]/10 blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 p-[1rem_1.5rem] pb-0">
              <div className="flex items-center gap-3">
                <h2 className="m-0 !text-[#8a252c] !text-[0.95rem] leading-[1.15] !font-black uppercase tracking-widest">
                  Clinical Duty
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center px-4 py-1.5 bg-white border border-[#e2e8f0] rounded-full !text-[#334155] !font-extrabold !text-[0.8rem]">
                  {formatDisplayDate(selectedSchedule.date)}
                </span>
                <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full !font-extrabold !text-[0.8rem] ${getScheduleStatusClass(selectedScheduleCanceled ? "Canceled" : routeRole === "STUDENT" ? "Assigned" : "Published")}`}>
                  {selectedScheduleCanceled ? "Canceled" : routeRole === "STUDENT" ? "Assigned" : "Published"}
                </span>
              </div>
            </div>
            
            {/* Details */}
            <div className="grid grid-cols-4 max-[980px]:grid-cols-2 max-[600px]:grid-cols-1 p-[1.5rem] gap-4">
              <div className="p-5 border border-[#e2e8f0] rounded-xl bg-white shadow-sm flex flex-col justify-center">
                <span className="!text-[#8A252C] !text-[0.7rem] !font-black uppercase tracking-widest mb-1.5">Hospital</span>
                <strong className="!text-[#111827] !text-[1.05rem] !font-[800]">{selectedSchedule.hospital}</strong>
              </div>
              <div className="p-5 border border-[#e2e8f0] rounded-xl bg-white shadow-sm flex flex-col justify-center">
                <span className="!text-[#8A252C] !text-[0.7rem] !font-black uppercase tracking-widest mb-1.5">Area Of Assignment</span>
                <strong className="!text-[#111827] !text-[1.05rem] !font-[800]">{selectedSchedule.area}</strong>
              </div>
              <div className="p-5 border border-[#e2e8f0] rounded-xl bg-white shadow-sm flex flex-col justify-center">
                <span className="!text-[#8A252C] !text-[0.7rem] !font-black uppercase tracking-widest mb-1.5">Shift Time</span>
                <strong className="!text-[#111827] !text-[1.05rem] !font-[800]">{selectedSchedule.startTime} - {selectedSchedule.endTime}</strong>
              </div>
              <div className="p-5 border border-[#e2e8f0] rounded-xl bg-white shadow-sm flex flex-col justify-center">
                <span className="!text-[#8A252C] !text-[0.7rem] !font-black uppercase tracking-widest mb-1.5">Assigned Group</span>
                <strong className="!text-[#111827] !text-[1.05rem] !font-[800]">{selectedSchedule.studentSection || user?.sectionInfo || "Assigned Group"}</strong>
              </div>
            </div>
          </div>
        </article>

        {/* Students Table Card */}
        <article className="relative rounded-2xl border border-[#e2e8f0] bg-white shadow-sm p-[1.5rem] overflow-hidden">
          <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full bg-[#ffcf01]/5 blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
              <h3 className="m-0 !text-[#111827] !text-[1.15rem] leading-[1.2] !font-bold tracking-[-0.03em]">Assigned Student(s)</h3>
              <span className="inline-flex items-center px-4 py-1.5 rounded-full !text-[0.8rem] !font-extrabold bg-[#fef3c7] !text-[#92400e]">{visibleAssignedStudents.length} {selectedScheduleCanceled ? "assigned" : "active"} student(s)</span>
            </div>

            <div className="flex items-center gap-4 p-4 mb-5 bg-[#fffaf0] border border-[#fde68a] rounded-xl shadow-[0_2px_4px_rgba(251,191,36,0.05)]">
              <ProfileAvatar name={instructorName} imageUrl={selectedSchedule.instructorProfileImageUrl || (String(selectedSchedule.instructorId) === String(user?.id) ? user?.profileImageUrl : "")} size={46} />
              <div>
                <strong className="block !text-[#111827] !text-[1rem] !font-[800]">{instructorName}</strong>
                <span className="block !text-[#64748b] !text-[0.85rem] !font-semibold">Clinical Instructor handling this schedule</span>
              </div>
            </div>

            <div className="mt-2 rounded-xl overflow-hidden border border-[#e2e8f0] overflow-x-auto">
              <table className="w-full border-collapse text-left !text-[0.9rem]">
                <thead>
                  <tr className="border-b border-[#e2e8f0] !text-[#111827] !text-[0.75rem] !font-black uppercase tracking-wider">
                    <th className="p-[1.25rem_1rem] w-[80px] max-[640px]:w-[52px]">No.</th>
                    <th className="p-[1.25rem_1rem]">Student</th>
                    <th className="p-[1.25rem_1rem] max-[640px]:hidden">Section</th>
                    <th className="p-[1.25rem_1rem]">Validation</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleAssignedStudents.map((schedule: any, idx: number) => {
                    const studentName = schedule.studentName || user?.fullName || "Assigned Student";
                    const validationLabel = getClinicalValidation(schedule);
                    return (
                    <tr key={idx} className="border-b border-[#e2e8f0] last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="p-[1.1rem_1rem] !text-[#111827] !font-bold">{idx + 1}.</td>
                      <td className="p-[1.1rem_1rem] flex items-center gap-[0.85rem] !font-[800] !text-[#111827]">
                        <ProfileAvatar name={studentName} imageUrl={schedule.studentProfileImageUrl || (String(schedule.studentId) === String(user?.id) ? user?.profileImageUrl : "")} size={38} />
                        {studentName}
                      </td>
                      <td className="p-[1.1rem_1rem] !text-[#64748b] !font-bold max-[640px]:hidden">{schedule.studentSection || user?.sectionInfo || "Nursing Student"}</td>
                      <td className="p-[1.1rem_1rem]">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full !text-[0.75rem] !font-bold ${getClinicalValidationClass(validationLabel)}`}>
                          {validationLabel}
                        </span>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </article>
        </>}
      </section>
    </main>
  );
}
