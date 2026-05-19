"use client";

import React, { use, useEffect, useState } from "react";
import { useAllAttendance, useInstructorAttendance } from "@/core/api/hooks/useAttendance";
import { useAllExtensionDays, useCancelExtensionDay, useCreateExtensionDay, useInstructorExtensionDays, useUpdateExtensionDay } from "@/core/api/hooks/useExtensionDays";
import { useUsers } from "@/core/api/hooks/useUsers";
import { useAuthStore } from "@/core/store/authStore";
import { InlineSelect } from "@/components/ui/InlineSelect";
import { LoadingState } from "@/components/ui/LoadingState";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { useToast } from "@/components/ui/ToastProvider";

function formatDate(value?: string) {
  if (!value) return "Not dated";
  const datePart = value.includes("T") ? value.split("T")[0] : value;
  return new Date(`${datePart}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function statusBadge(status: string) {
  if (status === "Needs action") return "bg-[#fef2f2] !text-[#991b1b]";
  if (status === "On track") return "bg-[#e9f8ef] !text-[#03703c]";
  return "bg-[#fff8e1] !text-[#6c4c00]";
}

export function ExtensionDaysDetailContent({ basePath, searchParams: searchParamsPromise }: { basePath: string; searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = use(searchParamsPromise);
  const studentId = typeof searchParams.studentId === "string" ? searchParams.studentId : undefined;
  const user = useAuthStore((state) => state.user);
  const { showToast } = useToast();
  const isChair = basePath === "/chair";
  const isAdmin = basePath === "/admin";
  const isAllSection = isAdmin || isChair;
  const viewerId = isChair && user?.id != null ? String(user.id) : undefined;
  const loggedInInstructorId = !isAllSection && user?.id != null ? String(user.id) : undefined;
  const { data: studentUsers = [] } = useUsers("STUDENT", isAllSection ? viewerId : undefined, isAllSection);
  const { data: instructorAttendance = [], isLoading: instructorAttendanceLoading } = useInstructorAttendance(loggedInInstructorId);
  const { data: allAttendance = [], isLoading: allAttendanceLoading } = useAllAttendance(isAllSection, viewerId);
  const attendance = isAllSection ? allAttendance : instructorAttendance;
  const { data: instructorExtensionDays = [], isLoading: instructorExtensionLoading } = useInstructorExtensionDays(loggedInInstructorId, studentId);
  const { data: allExtensionDays = [], isLoading: allExtensionLoading } = useAllExtensionDays(studentId, isAllSection, viewerId);
  const extensionDays = isAllSection ? allExtensionDays : instructorExtensionDays;
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [recordToCancel, setRecordToCancel] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [daysCount, setDaysCount] = useState("1");
  const [basis, setBasis] = useState("Excused absence");
  const [reason, setReason] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const historyPerPage = 5;

  const studentRecords = (attendance as any[]).filter((record) => String(record.studentId) === String(studentId));
  const studentUser = (studentUsers as any[]).find((student) => String(student.id) === String(studentId));
  const firstRecord = studentRecords[0] || (extensionDays as any[])[0];
  const instructorId = isAllSection ? (firstRecord?.instructorId != null ? String(firstRecord.instructorId) : user?.id != null ? String(user.id) : undefined) : loggedInInstructorId;
  const createExtension = useCreateExtensionDay(instructorId, studentId);
  const updateExtension = useUpdateExtensionDay(instructorId, studentId);
  const cancelExtension = useCancelExtensionDay(instructorId, studentId);
  const student = {
    name: studentUser?.fullName || firstRecord?.studentName || "Selected Student",
    profileImageUrl: studentUser?.profileImageUrl || firstRecord?.studentProfileImageUrl || "",
    id: studentUser?.schoolId || firstRecord?.studentSchoolId || studentId || "",
    section: studentUser?.sectionInfo || firstRecord?.studentSection || "No Section",
    status: (extensionDays as any[]).some((record) => record.status === "ACTIVE") || studentRecords.some((record) => record.status === "REJECTED") ? "Needs action" : "On track",
  };
  const inferredRejectedDuties = studentRecords.filter((record) => record.status === "REJECTED");
  const history = [
    ...(extensionDays as any[]).map((record) => ({ ...record, source: "extension" })),
    ...inferredRejectedDuties.map((record) => ({
      id: `duty-${record.id}`,
      days: Math.max(1, Math.ceil(Number(record.hours || 8) / 8)),
      basis: "Returned duty record",
      reason: record.instructorFeedback || `${record.area || record.ward || "Duty"} record requires extension day follow-up.`,
      status: "ACTIVE",
      createdAt: record.dutyDate,
      source: "duty",
    })),
  ];
  const historyTotalPages = Math.max(1, Math.ceil(history.length / historyPerPage));
  const pagedHistory = history.slice((historyPage - 1) * historyPerPage, historyPage * historyPerPage);
  const isSaving = createExtension.isPending || updateExtension.isPending || cancelExtension.isPending;
  const isLoading = isAllSection ? allAttendanceLoading || allExtensionLoading : instructorAttendanceLoading || instructorExtensionLoading;
  const inputClass = "w-full min-h-[48px] px-3 py-2 border border-[#dbe3ee] rounded-[0.8rem] bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all";
  const labelClass = "flex flex-col gap-[0.55rem] m-0 !text-sm !font-bold !text-[#344054]";
  const ghostBtn = "inline-flex items-center justify-center min-h-[38px] px-[1rem] rounded-[8px] bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.84rem] !font-[800] hover:border-[rgba(138,37,44,0.32)] hover:!text-[#8A252C] hover:shadow-[0_10px_24px_rgba(32,33,36,0.08)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const daysOptions = [1, 2, 3, 4, 5, 6, 7, 8, 10, 15].map((days) => ({ value: String(days), label: `${days} extension day${days > 1 ? "s" : ""}` }));
  const basisOptions = ["Excused absence", "Unexcused absence", "Tardiness", "Performance deficiency", "Clinical requirement completion", "Instructor assessment"].map((item) => ({ value: item, label: item }));

  useEffect(() => {
    setHistoryPage((page) => Math.min(page, historyTotalPages));
  }, [historyTotalPages]);

  const resetForm = () => {
    setDaysCount("1");
    setBasis("Excused absence");
    setReason("");
    setEditingId(null);
  };

  const submitExtension = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!studentId || !instructorId || !reason.trim()) return;
    const payload = { studentId: Number(studentId), instructorId: Number(instructorId), days: Number(daysCount), basis, reason: reason.trim() };
    try {
      if (editingId) {
        await updateExtension.mutateAsync({ id: editingId, ...payload });
        showToast({ variant: "success", title: "Extension days updated", message: "The student's extension-day record was updated." });
      } else {
        await createExtension.mutateAsync(payload);
        showToast({ variant: "success", title: "Extension days added", message: "The student was notified about the added extension days." });
      }
      resetForm();
    } catch {
      showToast({ variant: "error", title: "Save failed", message: "Extension days could not be saved." });
    }
  };

  const editRecord = (record: any) => {
    if (record.source !== "extension") return;
    setDaysCount(String(record.days));
    setBasis(record.basis);
    setReason(record.reason);
    setEditingId(String(record.id));
  };

  const cancelRecord = async () => {
    if (!recordToCancel) return;
    try {
      await cancelExtension.mutateAsync(recordToCancel);
      showToast({ variant: "success", title: "Extension days canceled", message: "The student was notified about the canceled extension-day record." });
      setRecordToCancel(null);
      setShowCancelModal(false);
    } catch {
      showToast({ variant: "error", title: "Cancel failed", message: "Extension days could not be canceled." });
    }
  };

  return (
    <>
      <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)] grid gap-[1.25rem] content-start">
        <section className="border border-[#e2e8f0] rounded-xl bg-white shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-[1.5rem] grid gap-[1rem]">
          <h2 className="m-0 !text-[#111827] !text-[1.24rem] !font-bold">Selected Student</h2>
          {isLoading ? <LoadingState message="Loading student extension data..." className="rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc]" /> : (
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[1rem] min-h-[5.25rem] p-[1rem_1.15rem] border border-[#dbe3ee] rounded-[0.85rem] bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] max-[980px]:grid-cols-[auto_minmax(0,1fr)]">
              <ProfileAvatar name={student.name} imageUrl={student.profileImageUrl} size={48} />
              <span className="min-w-0 grid gap-[0.2rem]"><strong className="!text-[#111827] !text-[1.05rem] leading-[1.2]">{student.name}</strong><small className="!text-[#64748b] !text-[0.9rem] !font-[700]">{student.section} - {student.id}</small></span>
              <span className={`inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap ${statusBadge(student.status)}`}>{student.status}</span>
            </div>
          )}
        </section>

        <section className="border border-[#e2e8f0] rounded-xl bg-white shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-[1.5rem]">
          <div className="flex items-center justify-between gap-[1rem] mb-[1.15rem] flex-wrap"><h2 className="m-0 !text-[#111827] !text-[1.24rem] !font-bold">{editingId ? "Edit Extension Days" : "Add Extension Days"}</h2><span className="inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold bg-[#fff8e1] !text-[#6c4c00]">{editingId ? "Editing" : "New extension"}</span></div>
          {editingId && <div className="mb-[1rem] rounded-lg border border-[#facc15] bg-[#fff8e1] px-4 py-3 !text-[#6c4c00] !font-[800]">You are editing an existing extension-day record. Save changes or cancel editing before adding a new record.</div>}
          <form className="grid grid-cols-2 gap-[1rem_1.1rem] items-start max-[980px]:grid-cols-1" onSubmit={submitExtension}>
            <label className={labelClass} htmlFor="extension-days-count">Extension days to add<InlineSelect value={daysCount} options={daysOptions} placeholder="Select extension days" onChange={setDaysCount} /></label>
            <label className={labelClass} htmlFor="extension-basis">Basis<InlineSelect value={basis} options={basisOptions} placeholder="Select basis" onChange={setBasis} /></label>
            <label className={`${labelClass} col-span-full`} htmlFor="extension-reason">Reason / remarks<textarea className={`${inputClass} min-h-[8.5rem] resize-y`} id="extension-reason" rows={5} placeholder="Type the reason, documentation note, or instructor remarks here" required value={reason} onChange={(event) => setReason(event.target.value)} /></label>
            <div className="col-span-full flex justify-end items-center gap-[0.85rem] pt-[0.2rem] max-[980px]:flex-col max-[980px]:items-stretch"><button className="inline-flex items-center justify-center min-h-[48px] min-w-[7rem] px-[1.25rem] rounded-[8px] bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.84rem] !font-[800] hover:border-[rgba(138,37,44,0.32)] transition-all cursor-pointer disabled:opacity-60" type="button" disabled={isSaving} onClick={resetForm}>{editingId ? "Cancel editing" : "Clear"}</button><button className="inline-flex items-center justify-center min-h-[48px] min-w-[13.5rem] px-[1.5rem] rounded-[8px] bg-[#8A252C] !text-white !text-[0.95rem] !font-extrabold shadow-[0_8px_16px_-4px_rgba(138,37,44,0.4)] hover:bg-[#6d1d23] transition-all cursor-pointer disabled:opacity-60" disabled={isSaving} type="submit">{isSaving ? "Saving..." : editingId ? "Save Changes" : "Add Extension Days"}</button></div>
          </form>
        </section>

        <section className="border border-[#e2e8f0] rounded-xl bg-white shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-[1.5rem]">
          <div className="flex justify-between items-start gap-[22px] mb-[1.15rem] flex-wrap"><h2 className="m-0 !text-[#111827] !text-[1.24rem] !font-bold">Extension Day History</h2><span className="inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold bg-[#e9f8ef] !text-[#03703c]">{history.length} records</span></div>
          {history.length > 0 ? (
            <>
              <div className={`grid gap-[0.85rem] ${historyTotalPages > 1 ? "rounded-t-lg" : ""}`}>
                {pagedHistory.map((record: any) => (
                  <div key={`${record.source}-${record.id}`} className="grid grid-cols-[3.75rem_minmax(210px,1fr)_minmax(190px,0.82fr)_minmax(240px,1.05fr)_minmax(190px,auto)] gap-[1rem] items-center p-[1rem_1.1rem] border border-[#dbe3ee] rounded-[0.85rem] bg-white max-[980px]:grid-cols-1 max-[980px]:justify-items-start" style={{ opacity: record.status === "CANCELED" ? 0.6 : 1 }}>
                    <ProfileAvatar name={student.name} imageUrl={student.profileImageUrl} size={48} />
                    <div><strong className="block !text-[#111827] !text-[0.96rem] leading-[1.25]">{student.name}</strong><small className="block mt-[0.18rem] !text-[#475569] !text-[0.88rem] !font-[700] leading-[1.35]">{student.section} - {student.id}</small></div>
                    <div><strong className="block !text-[#111827] !text-[0.96rem] leading-[1.25]">{record.days} extension day{record.days > 1 ? "s" : ""}</strong><small className="block mt-[0.18rem] !text-[#475569] !text-[0.88rem] !font-[700] leading-[1.35]">{record.basis}</small></div>
                    <div><strong className="block !text-[#111827] !text-[0.96rem] leading-[1.25]">{record.reason}</strong><small className="block mt-[0.18rem] !text-[#475569] !text-[0.88rem] !font-[700] leading-[1.35]">Added {formatDate(record.createdAt)}</small></div>
                    <div className="flex items-center justify-end gap-[0.65rem] flex-wrap max-[980px]:justify-start"><span className={`inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap ${record.status === "ACTIVE" ? "bg-[#e9f8ef] !text-[#03703c]" : "bg-[#f1f5f9] !text-[#64748b]"}`}>{record.status === "ACTIVE" ? "Added" : "Canceled"}</span>{record.status === "ACTIVE" && record.source === "extension" && <div className="inline-flex items-center gap-[0.45rem]"><button className="inline-flex items-center justify-center min-h-[2.25rem] px-[0.7rem] py-[0.45rem] rounded-[0.45rem] bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.78rem] !font-[800] hover:bg-[#f8fafc] cursor-pointer" type="button" onClick={() => editRecord(record)}>Edit</button><button className="inline-flex items-center justify-center min-h-[2.25rem] px-[0.7rem] py-[0.45rem] rounded-[0.45rem] bg-white border border-[#fecaca] !text-[#b91c1c] !text-[0.78rem] !font-[800] hover:bg-[#fef2f2] cursor-pointer" type="button" onClick={() => { setRecordToCancel(String(record.id)); setShowCancelModal(true); }}>Cancel</button></div>}</div>
                  </div>
                ))}
              </div>
              {historyTotalPages > 1 && <div className="flex justify-between items-center p-[1rem_1.5rem] mt-[1rem] border border-[#e2e8f0] rounded-lg bg-[#f8fafc]"><button className={ghostBtn} onClick={() => setHistoryPage((page) => Math.max(1, page - 1))} disabled={historyPage === 1}>Previous</button><span className="!text-[0.875rem] !font-[600] !text-[#64748b]">Page {historyPage} of {historyTotalPages}</span><button className={ghostBtn} onClick={() => setHistoryPage((page) => Math.min(historyTotalPages, page + 1))} disabled={historyPage === historyTotalPages}>Next</button></div>}
            </>
          ) : <div className="p-4 rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc] !text-[#64748b] !font-bold">No extension-day history yet.</div>}
        </section>
      </main>
      {showCancelModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"><section className="w-[min(520px,100%)] bg-white rounded-xl shadow-[0_24px_60px_rgba(15,23,42,0.16)] border border-[#e2e8f0] p-[2rem]" role="dialog" aria-modal="true"><h2 className="m-0 !text-[#111827] !text-[1.15rem] !font-bold">Cancel this extension record?</h2><p className="!text-[#64748b] !text-[0.95rem] leading-[1.55] my-[1.5rem]">This keeps the record in the history but marks it as canceled.</p><div className="flex justify-end gap-[0.75rem] flex-wrap"><button className="inline-flex items-center justify-center min-h-[48px] px-[1.25rem] rounded-[8px] bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.84rem] !font-[800] hover:border-[rgba(138,37,44,0.32)] transition-all cursor-pointer" type="button" onClick={() => setShowCancelModal(false)}>Keep record</button><button className="inline-flex items-center justify-center min-h-[48px] px-[1.5rem] rounded-[8px] bg-[#b91c1c] !text-white !text-[0.95rem] !font-extrabold shadow-[0_8px_16px_-4px_rgba(185,28,28,0.4)] hover:bg-[#991b1b] transition-all cursor-pointer disabled:opacity-60" type="button" disabled={isSaving} onClick={cancelRecord}>{isSaving ? "Canceling..." : "Cancel Record"}</button></div></section></div>}
    </>
  );
}
