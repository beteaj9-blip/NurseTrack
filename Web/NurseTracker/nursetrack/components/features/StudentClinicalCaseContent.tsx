import React from "react";
import Link from "next/link";
import { useStudentCases } from "@/core/api/hooks/useClinicalCases";
import { useStudentClearance, useSubmitClearance } from "@/core/api/hooks/useClearance";
import { useActiveAcademicTerm } from "@/core/api/hooks/useAcademicTerms";
import { useAuthStore } from "@/core/store/authStore";
import { useToast } from "@/components/ui/ToastProvider";
import { InlineSelect } from "@/components/ui/InlineSelect";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";

function formatDate(date?: string) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(time?: string) {
  if (!time) return "";
  return time.replace(/\s*-\s*/g, " - ");
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
  return (
    <div className="mb-8">
      <h3 className="text-[#8A252C] text-[1.1rem] font-[800] mb-4 m-0">{title}</h3>
      <div className="w-full overflow-x-auto border border-[#e2e8f0] rounded-lg">
        <table className="w-full min-w-[980px] text-left border-collapse">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
              <th className="p-4 text-[#1e293b] text-[0.78rem] font-[900] uppercase tracking-wide">Category</th>
              <th className="p-4 text-[#1e293b] text-[0.78rem] font-[900] uppercase tracking-wide">Procedure Performed</th>
              <th className="p-4 text-[#1e293b] text-[0.78rem] font-[900] uppercase tracking-wide">Status</th>
              <th className="p-4 text-[#1e293b] text-[0.78rem] font-[900] uppercase tracking-wide">Date</th>
              <th className="p-4 text-[#1e293b] text-[0.78rem] font-[900] uppercase tracking-wide">Time</th>
              <th className="p-4 text-[#1e293b] text-[0.78rem] font-[900] uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="p-4 text-center font-bold text-gray-500">Loading cases...</td></tr>
            ) : cases.length > 0 ? (
              cases.map((clinicalCase: any) => (
                <tr key={clinicalCase.id} className="border-b border-[#e2e8f0] last:border-b-0 hover:bg-[#fcfcfc] transition-colors">
                  <td className="p-4 text-[#111827] text-[0.9rem] font-[800]">{caseCategoryLabel(clinicalCase.category)}</td>
                  <td className="p-4 text-[#111827] text-[0.9rem] font-[800]">{clinicalCase.procedurePerformed}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full !text-[0.75rem] font-[800] ${statusClass(clinicalCase.status)}`}>
                      {clinicalCase.status === "APPROVED" ? "Approved" : clinicalCase.status === "RETURNED" ? "Returned" : "Pending"}
                    </span>
                  </td>
                  <td className="p-4 text-[#111827] text-[0.9rem] font-[800]">{formatDate(clinicalCase.procedureDate)}</td>
                  <td className="p-4 text-[#111827] text-[0.9rem] font-[800]">{formatTime(clinicalCase.shiftTime)}</td>
                  <td className="p-4">
                    <Link href={`/nursing-student/clinical-cases/detail?id=${clinicalCase.id}`} className="!text-[#8A252C] text-[0.9rem] font-[900] hover:underline">View</Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-4 text-center text-[#64748b] text-[0.9rem] font-semibold">No cases recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function StudentClinicalCaseContent() {
  const { showToast } = useToast();
  const user = useAuthStore((state) => state.user);
  const { data: cases, isLoading } = useStudentCases();
  const { data: activeTerm } = useActiveAcademicTerm();
  const { data: clearance } = useStudentClearance();
  const submitClearance = useSubmitClearance();
  const pendingCount = cases?.filter((c: any) => c.status === "PENDING")?.length ?? 0;
  const clearanceStatus = clearance?.status ?? "LOCKED";
  const clearanceLabel = clearanceStatus === "IN_REVIEW" ? "In review" : clearanceStatus === "CLEARED" ? "Cleared" : "Clearance locked";
  const canSubmitClearance = clearanceStatus === "LOCKED" && pendingCount === 0 && (cases?.length ?? 0) > 0;
  const deliveryRoomCases = (cases ?? []).filter(isDeliveryRoomCase);
  const operatingRoomCases = (cases ?? []).filter(isOperatingRoomCase);

  const handleSubmitClearance = async () => {
    if (!canSubmitClearance) {
      showToast({ variant: "error", title: "Clearance unavailable", message: "Complete all pending cases before submitting for clearance." });
      return;
    }
    try {
      await submitClearance.mutateAsync();
      showToast({ variant: "success", title: "Clearance submitted", message: "Your cases were submitted for clearance review." });
    } catch {
      showToast({ variant: "error", title: "Submission failed", message: "Clearance could not be submitted." });
    }
  };

  return (
    <div className="p-10">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-[1.2rem] font-[800] text-[#111827] m-0">Student Information</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/nursing-student/clinical-cases/add"
              className="inline-flex items-center justify-center min-w-[180px] h-[50px] px-5 rounded-lg border border-[#e2e8f0] bg-white text-[#344054] text-[0.85rem] !font-[900] shadow-sm hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:text-[#0f172a] transition-all no-underline"
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
        <div className="flex items-center justify-between gap-4 p-4 mb-6 bg-white border border-[#e2e8f0] rounded-lg">
          <div className="flex items-center gap-4">
            <ProfileAvatar name={user?.fullName || "Nursing Student"} imageUrl={user?.profileImageUrl} size={48} />
            <div>
              <h3 className="text-[1.1rem] font-[800] text-[#111827] m-0 mb-1">{user?.fullName ?? 'Loading...'}</h3>
              <p className="text-[#64748b] text-[0.9rem] font-semibold m-0">{user?.sectionInfo ?? ''} — Student ID {user?.schoolId ?? ''}</p>
            </div>
          </div>
          <span className="inline-flex items-center h-[30px] px-4 rounded-full bg-[#fff4c2] !text-[#7a4f00] !text-[0.78rem] !font-[900] whitespace-nowrap">
            {clearanceLabel}
          </span>
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
          <button className="h-[50px] px-5 rounded-lg border border-[#e2e8f0] bg-white text-[#344054] text-[0.85rem] font-[900] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" type="button" onClick={handleSubmitClearance} disabled={submitClearance.isPending || !canSubmitClearance}>{submitClearance.isPending ? "Submitting..." : "Submit for Clearance"}</button>
          <button className="h-[50px] px-5 rounded-lg border border-[#e2e8f0] bg-white text-[#344054] text-[0.85rem] font-[900] cursor-pointer" type="button" onClick={() => window.print()}>Print Clearance</button>
        </div>

          <CaseTable title="Delivery Room Cases" cases={deliveryRoomCases} isLoading={isLoading} />
          <CaseTable title="Operating Room Cases" cases={operatingRoomCases} isLoading={isLoading} />

        {/* Footer info */}
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-4">
          <p className="text-[#64748b] text-[0.85rem] font-[600] m-0">Clearance status: {clearanceLabel}.</p>
        </div>

      </div>
    </div>
  );
}
