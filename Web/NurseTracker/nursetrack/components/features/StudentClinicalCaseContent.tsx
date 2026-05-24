"use client";

import React from "react";
import Link from "next/link";
import { useStudentCases } from "@/core/api/hooks/useClinicalCases";
import { useClearanceSettings, useStudentClearance, useSubmitClearance } from "@/core/api/hooks/useClearance";
import { useActiveAcademicTerm } from "@/core/api/hooks/useAcademicTerms";
import { useAuthStore } from "@/core/store/authStore";
import { useToast } from "@/components/ui/ToastProvider";
import { InlineSelect } from "@/components/ui/InlineSelect";
import { LoadingState } from "@/components/ui/LoadingState";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";

const CASES_PER_PAGE = 5;
const caseStatusOptions = [
  { value: "all", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "RETURNED", label: "Returned" },
];

const submittedSortOptions = [
  { value: "newest", label: "Newest submitted" },
  { value: "oldest", label: "Oldest submitted" },
];

function formatDate(date?: string) {
  if (!date) return "";
  const datePart = date.includes("T") ? date.split("T")[0] : date;
  return new Date(`${datePart}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(time?: string) {
  if (!time) return "";
  return time.replace(/\s*-\s*/g, " - ");
}

function submittedTimestamp(clinicalCase: any) {
  return new Date(clinicalCase.createdAt ?? clinicalCase.submittedAt ?? clinicalCase.updatedAt ?? clinicalCase.procedureDate ?? 0).getTime();
}

function statusClass(status?: string) {
  if (status === "APPROVED") return "bg-[#e9f8ef] !text-[#03703c]";
  if (status === "RETURNED") return "bg-[#fef2f2] !text-[#991b1b]";
  return "bg-[#fff8e1] !text-[#6c4c00]";
}

function caseCategoryLabel(category?: string) {
  if (category === "Major Cases - Assist") return "Major Case - Assist";
  if (category === "Major Cases - Scrub") return "Major Case - Scrub";
  if (category === "Major Cases - Circulating") return "Major Case - Circulate";
  if (category === "Handled Cases") return "Handled Case";
  return category ?? "Clinical Case";
}

function isDeliveryRoomCase(clinicalCase: any) {
  return clinicalCase.caseType === "DELIVERY_ROOM" || clinicalCase.dutyArea === "Delivery Room" || clinicalCase.area === "Delivery Room";
}

function isOperatingRoomCase(clinicalCase: any) {
  return clinicalCase.caseType === "OPERATING_ROOM" || clinicalCase.dutyArea === "Operating Room" || clinicalCase.area === "Operating Room";
}

function CaseTable({ title, cases, isLoading }: { title: string; cases: any[]; isLoading: boolean }) {
  const [page, setPage] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [submittedSort, setSubmittedSort] = React.useState("newest");
  const filteredCases = React.useMemo(() => {
    return cases
      .filter((clinicalCase: any) => statusFilter === "all" || clinicalCase.status === statusFilter)
      .slice()
      .sort((a: any, b: any) => {
        const difference = submittedTimestamp(b) - submittedTimestamp(a);
        return submittedSort === "newest" ? difference : -difference;
      });
  }, [cases, statusFilter, submittedSort]);
  const totalPages = Math.max(1, Math.ceil(filteredCases.length / CASES_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageCases = filteredCases.slice((currentPage - 1) * CASES_PER_PAGE, currentPage * CASES_PER_PAGE);

  React.useEffect(() => {
    setPage(1);
  }, [cases.length, statusFilter, submittedSort, title]);

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap max-[640px]:items-start">
        <h3 className="text-[#8A252C] text-[1.1rem] font-[800] m-0">{title}</h3>
        <div className="flex items-center gap-3 flex-wrap max-[640px]:grid max-[640px]:w-full max-[640px]:grid-cols-1"><div className="min-w-[190px] max-[640px]:min-w-0"><InlineSelect value={statusFilter} options={caseStatusOptions} placeholder="All statuses" onChange={setStatusFilter} /></div><div className="min-w-[190px] max-[640px]:min-w-0"><InlineSelect value={submittedSort} options={submittedSortOptions} placeholder="Sort by submitted" onChange={setSubmittedSort} /></div></div>
      </div>
      <div className="w-full overflow-x-auto border border-[#e2e8f0] rounded-lg">
        <table className="w-full min-w-[980px] text-left border-collapse">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
              <th className="p-4 text-[#1e293b] text-[0.78rem] font-[900] uppercase tracking-wide">Category</th>
              <th className="p-4 text-[#1e293b] text-[0.78rem] font-[900] uppercase tracking-wide">Procedure Performed</th>
              <th className="p-4 text-[#1e293b] text-[0.78rem] font-[900] uppercase tracking-wide">Status</th>
              <th className="p-4 text-[#1e293b] text-[0.78rem] font-[900] uppercase tracking-wide">Case Date</th>
              <th className="p-4 text-[#1e293b] text-[0.78rem] font-[900] uppercase tracking-wide">Date Submitted</th>
              <th className="p-4 text-[#1e293b] text-[0.78rem] font-[900] uppercase tracking-wide">Time</th>
              <th className="p-4 text-[#1e293b] text-[0.78rem] font-[900] uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7}><LoadingState message="Loading cases..." className="p-4" /></td></tr>
            ) : pageCases.length > 0 ? (
              pageCases.map((clinicalCase: any) => (
                <tr key={clinicalCase.id} className="border-b border-[#e2e8f0] last:border-b-0 hover:bg-[#fcfcfc] transition-colors">
                  <td className="p-4 text-[#111827] text-[0.9rem] font-[800]">{caseCategoryLabel(clinicalCase.category)}</td>
                  <td className="p-4 text-[#111827] text-[0.9rem] font-[800]">{clinicalCase.procedurePerformed}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full !text-[0.75rem] font-[800] ${statusClass(clinicalCase.status)}`}>
                      {clinicalCase.status === "APPROVED" ? "Approved" : clinicalCase.status === "RETURNED" ? "Returned" : "Pending"}
                    </span>
                  </td>
                  <td className="p-4 text-[#111827] text-[0.9rem] font-[800]">{formatDate(clinicalCase.procedureDate)}</td>
                  <td className="p-4 text-[#111827] text-[0.9rem] font-[800]">{formatDate(clinicalCase.createdAt ?? clinicalCase.submittedAt ?? clinicalCase.updatedAt)}</td>
                  <td className="p-4 text-[#111827] text-[0.9rem] font-[800]">{formatTime(clinicalCase.shiftTime)}</td>
                  <td className="p-4">
                    <Link href={`/nursing-student/clinical-cases/detail?id=${clinicalCase.id}`} className="!text-[#8A252C] text-[0.9rem] font-[900] hover:underline">View</Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-4 text-center text-[#64748b] text-[0.9rem] font-semibold">No cases recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filteredCases.length > CASES_PER_PAGE && <div className="mt-3 flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full">
        <button type="button" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="min-h-[38px] px-4 rounded-lg border border-[#e2e8f0] bg-white !text-[#334155] !text-[0.84rem] !font-[900] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
        <span className="!text-[#64748b] !text-[0.84rem] !font-[900] whitespace-nowrap"><span className="hidden sm:inline">Page </span>{currentPage} of {totalPages}</span>
        <button type="button" disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="min-h-[38px] px-4 rounded-lg border border-[#e2e8f0] bg-white !text-[#334155] !text-[0.84rem] !font-[900] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
      </div>}
    </div>
  );
}

export default function StudentClinicalCaseContent() {
  const { showToast } = useToast();
  const user = useAuthStore((state) => state.user);
  const { data: cases, isLoading } = useStudentCases();
  const { data: activeTerm } = useActiveAcademicTerm();
  const { data: clearance } = useStudentClearance();
  const { data: clearanceSettings } = useClearanceSettings();
  const submitClearance = useSubmitClearance();
  const pendingCount = cases?.filter((c: any) => c.status === "PENDING")?.length ?? 0;
  const clearanceStatus = clearance?.status ?? "LOCKED";
  const clearanceEnabled = clearanceSettings?.enabled !== false;
  const clearanceLabel = clearanceStatus === "IN_REVIEW" ? "In review" : clearanceStatus === "CLEARED" ? "Cleared" : clearanceEnabled ? "Not submitted" : "Clearance disabled";
  const canSubmitClearance = clearanceEnabled && clearanceStatus === "LOCKED" && pendingCount === 0 && (cases?.length ?? 0) > 0;
  const clearanceBlockReason = !clearanceEnabled
    ? "Clearance submission is currently disabled by the admin."
    : clearanceStatus === "IN_REVIEW"
      ? "Your clearance is already submitted and waiting for review."
      : clearanceStatus === "CLEARED"
        ? "Your clearance has already been approved."
        : pendingCount > 0
          ? `You still have ${pendingCount} pending clinical case${pendingCount === 1 ? "" : "s"}.`
          : (cases?.length ?? 0) === 0
            ? "You need at least one clinical case before submitting for clearance."
            : "You can submit your clearance now.";
  const deliveryRoomCases = (cases ?? []).filter(isDeliveryRoomCase);
  const operatingRoomCases = (cases ?? []).filter(isOperatingRoomCase);

  const handleSubmitClearance = async () => {
    if (!canSubmitClearance) {
      showToast({ variant: "error", title: "Clearance unavailable", message: clearanceEnabled ? "Complete all pending cases before submitting for clearance." : "Clearance submission is currently disabled by the admin." });
      return;
    }
    try {
      await submitClearance.mutateAsync();
      showToast({ variant: "success", title: "Clearance submitted", message: "Your cases were submitted for clearance review." });
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message || "Clearance could not be submitted.";
      showToast({ variant: "error", title: "Submission failed", message: String(backendMessage) });
    }
  };

  return (
    <div className="min-w-0 overflow-x-hidden p-[clamp(24px,4vw,42px)]">
      <div className="min-w-0 rounded-xl border border-gray-100 bg-white p-[clamp(18px,3vw,32px)] shadow-sm">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-[1.2rem] font-[800] text-[#111827] m-0">Student Information</h2>
          <div className="flex flex-wrap items-center gap-3 max-[640px]:w-full max-[640px]:items-stretch">
            <Link
              href="/nursing-student/clinical-cases/add"
              className="inline-flex items-center justify-center min-w-[180px] h-[50px] px-5 rounded-lg border border-[#e2e8f0] bg-white text-[#344054] text-[0.85rem] !font-[900] shadow-sm hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:text-[#0f172a] transition-all no-underline max-[640px]:w-full"
            >
              Add clinical case
            </Link>
            <span className="inline-flex items-center h-[30px] px-4 rounded-full bg-[#fff4c2] !text-[#7a4f00] !text-[0.78rem] !font-[900] whitespace-nowrap">
              {clearanceLabel}
            </span>
            {pendingCount > 0 && (
              <span className="inline-flex items-center h-[36px] px-4 rounded-full bg-[#fef2f2] !text-[#991b1b] !text-[0.85rem] !font-[800] whitespace-nowrap">
                {pendingCount} pending case{pendingCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Student Profile Info */}
        <div className="flex min-w-0 items-center justify-between gap-4 rounded-lg border border-[#e2e8f0] bg-white p-4 mb-6">
          <div className="flex min-w-0 items-center gap-4">
            <ProfileAvatar name={user?.fullName || "Nursing Student"} imageUrl={user?.profileImageUrl} size={48} />
            <div className="min-w-0">
              <h3 className="text-[1.1rem] font-[800] text-[#111827] m-0 mb-1">{user?.fullName ?? "Nursing Student"}</h3>
              <p className="m-0 break-words text-[#64748b] text-[0.9rem] font-semibold">{user?.sectionInfo ?? ''} - Student ID {user?.schoolId ?? ''}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_auto_auto] gap-4 items-end p-4 mb-6 rounded-lg border border-[#e2e8f0] bg-[linear-gradient(135deg,#fff9db,#ffffff_56%)] max-[980px]:grid-cols-1">
          <label className="grid gap-2 text-[#344054] text-[0.85rem] font-[800]">
            School Year
            <InlineSelect value={activeTerm?.schoolYear ?? ""} options={activeTerm?.schoolYear ? [{ value: activeTerm.schoolYear, label: activeTerm.schoolYear }] : []} placeholder="School year" onChange={() => {}} />
          </label>
          <label className="grid gap-2 text-[#344054] text-[0.85rem] font-[800]">
            Semester
            <InlineSelect value={activeTerm?.semester ?? ""} options={activeTerm?.semester ? [{ value: activeTerm.semester, label: activeTerm.semester }] : []} placeholder="Semester" onChange={() => {}} />
          </label>
          <div className="relative group">
            <button className="relative h-[50px] w-full min-w-[180px] whitespace-nowrap px-5 rounded-lg border border-[#e2e8f0] bg-white text-[#344054] text-[0.85rem] font-[900] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" type="button" onClick={handleSubmitClearance} disabled={submitClearance.isPending || !canSubmitClearance}>{submitClearance.isPending ? "Submitting..." : "Submit for Clearance"}</button>
            {!clearanceEnabled && <span className="absolute right-2.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-[#fff7d6] !text-[#92400e] pointer-events-none"><svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current stroke-[2.4]" aria-hidden="true"><path d="M12 3 2.5 20.5h19L12 3Z" /><path d="M12 9v5" strokeLinecap="round" /><path d="M12 17.5h.01" strokeLinecap="round" /></svg></span>}
            {!canSubmitClearance && <span className="pointer-events-none absolute left-1/2 top-[58px] z-30 hidden w-[280px] -translate-x-1/2 rounded-lg border border-[#fde68a] bg-[#fffbeb] px-3 py-2 text-center !text-[0.76rem] !font-[850] leading-[1.35] !text-[#92400e] shadow-[0_14px_28px_rgba(15,23,42,0.14)] group-hover:block">{clearanceBlockReason}</span>}
          </div>
          <button className="h-[50px] w-full px-5 rounded-lg border border-[#e2e8f0] bg-white text-[#344054] text-[0.85rem] font-[900] cursor-pointer" type="button" onClick={() => window.print()}>Print Clearance</button>
        </div>

          <CaseTable title="Delivery Room Cases" cases={deliveryRoomCases} isLoading={isLoading} />
          <CaseTable title="Operating Room Cases" cases={operatingRoomCases} isLoading={isLoading} />

        {/* Footer info */}
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-4">
          <p className="text-[#64748b] text-[0.85rem] font-[600] m-0">Clearance status: {clearanceLabel}. {clearanceEnabled ? "Submission is open." : "Submission is currently disabled."}</p>
        </div>

      </div>
    </div>
  );
}
