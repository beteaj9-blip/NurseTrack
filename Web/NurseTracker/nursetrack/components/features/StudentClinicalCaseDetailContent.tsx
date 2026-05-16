"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useClinicalCase } from "@/core/api/hooks/useClinicalCases";
import { useAuthStore } from "@/core/store/authStore";

function getInitials(name?: string) {
  if (!name) return "?";
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(date?: string) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatTime(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function statusLabel(status?: string) {
  if (!status) return "Pending";
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function DetailBox({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="border border-[#e2e8f0] rounded-lg bg-[#f8fafc] p-4">
      <span className="block mb-2 !text-[#64748b] !text-[0.72rem] !font-[900] uppercase">{label}</span>
      <strong className="block !text-[#111827] !text-[0.95rem] !font-[800]">{value || "-"}</strong>
    </div>
  );
}

export function StudentClinicalCaseDetailContent() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get("id") ?? undefined;
  const user = useAuthStore((state) => state.user);
  const { data: clinicalCase, isLoading } = useClinicalCase(caseId);
  const studentName = clinicalCase?.studentName || user?.fullName || "Nursing Student";
  const studentSection = clinicalCase?.studentSection || user?.sectionInfo || "Nursing Student";
  const studentSchoolId = clinicalCase?.studentSchoolId || user?.schoolId || "";

  if (isLoading) {
    return <main className="p-[clamp(24px,4vw,42px)]"><div className="p-6 rounded-xl border border-[#e2e8f0] bg-white font-bold text-[#64748b]">Loading case details...</div></main>;
  }

  if (!clinicalCase) {
    return <main className="p-[clamp(24px,4vw,42px)]"><div className="p-6 rounded-xl border border-[#e2e8f0] bg-white font-bold text-[#64748b]">Clinical case not found.</div></main>;
  }

  return (
    <main className="p-[clamp(24px,4vw,42px)] grid grid-cols-1 xl:grid-cols-[1.45fr_1fr] gap-6 items-start">
      <section className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-6">
        <h2 className="m-0 mb-5 !text-[#111827] !text-[1.25rem] !font-[900]">Case Information</h2>
        <div className="flex items-center gap-4 p-4 mb-4 border border-[#e2e8f0] rounded-lg bg-[#f8fafc]">
          <div className="w-[46px] h-[46px] rounded-full bg-[#FFCF01] flex items-center justify-center text-[#332800] font-[900]">{getInitials(studentName)}</div>
          <div>
            <strong className="block !text-[#111827] !text-[1rem] !font-[900]">{studentName}</strong>
            <span className="block !text-[#64748b] !text-[0.86rem] !font-[800]">{studentSection} - Student ID {studentSchoolId}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DetailBox label="Case Date" value={formatDate(clinicalCase.caseDate ?? clinicalCase.procedureDate)} />
          <DetailBox label="Time of Shift" value={clinicalCase.shiftTime} />
          <DetailBox label="Patient Name" value={clinicalCase.patientInitials} />
          <DetailBox label="Category" value={clinicalCase.category ?? clinicalCase.caseType} />
          <DetailBox label="Procedure Performed" value={clinicalCase.procedureDetails ?? clinicalCase.procedurePerformed} />
          <DetailBox label="Name of Hospital" value={clinicalCase.hospital} />
          <DetailBox label="Supervising Clinical Instructor" value={clinicalCase.instructorName || "Clinical Instructor"} />
          <DetailBox label="Duty Area" value={clinicalCase.dutyArea ?? clinicalCase.area} />
          <DetailBox label="Submitted Date" value={formatDate(clinicalCase.createdAt?.split("T")[0])} />
          <DetailBox label="Submitted Time" value={formatTime(clinicalCase.createdAt)} />
          <div className="md:col-span-2 border border-[#e2e8f0] rounded-lg bg-[#f8fafc] p-4">
            <span className="block mb-2 !text-[#8A252C] !text-[0.72rem] !font-[900] uppercase">Student Reflection</span>
            <p className="m-0 !text-[#64748b] !text-[0.92rem] !font-[800] leading-relaxed">{clinicalCase.studentReflection || "No reflection provided."}</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-6">
        <h2 className="m-0 mb-4 !text-[#111827] !text-[1.25rem] !font-[900]">Clinical Case Status</h2>
        <div className="flex items-center justify-between gap-4 p-4 mb-3 border border-[#e2e8f0] rounded-lg bg-[#f8fafc]">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#fff8e1] !text-[#6c4c00] !text-[0.78rem] !font-[900]">{statusLabel(clinicalCase.status)}</span>
          <strong className="!text-[#111827] !text-[0.9rem] !font-[900]">{clinicalCase.status === "APPROVED" ? "Validated" : "Awaiting CI validation"}</strong>
        </div>
        <DetailBox label="Recommended Reviewer" value={clinicalCase.instructorName || "Clinical Instructor"} />
        <div className="mt-3 border border-[#e2e8f0] rounded-lg bg-[#f8fafc] p-4">
          <span className="block mb-2 !text-[#8A252C] !text-[0.72rem] !font-[900] uppercase">Instructor Comments</span>
          <p className="m-0 !text-[#111827] !text-[0.92rem] !font-[800] leading-relaxed">{clinicalCase.instructorFeedback || "This case is queued for CI validation."}</p>
        </div>
      </section>
    </main>
  );
}
