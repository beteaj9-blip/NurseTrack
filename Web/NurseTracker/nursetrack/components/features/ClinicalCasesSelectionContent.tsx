"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAllClinicalCases, useInstructorCases } from "@/core/api/hooks/useClinicalCases";
import { useAuthStore } from "@/core/store/authStore";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";

function formatDate(date?: string) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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

function CaseSection({ title, subtitle, records, basePath }: { title: string; subtitle: string; records: any[]; basePath: string }) {
  return (
    <section className="grid gap-[10px] mt-[16px]" aria-label={`${subtitle} records`}>
      <div className="flex items-center justify-between gap-[12px] mt-[4px] max-[680px]:flex-col max-[680px]:items-start">
        <h3 className="m-0 !text-[#8A252C] !text-[1.05rem] !font-[800]">{title}</h3>
        <span className="!text-[#475569] !text-[0.85rem] !font-[800]">{subtitle}</span>
      </div>
      <div className="border border-[#e2e8f0] rounded-lg overflow-x-auto overflow-y-hidden">
        <div className="min-w-[920px]">
        <div className="grid grid-cols-[minmax(180px,1.2fr)_minmax(300px,2.2fr)_minmax(120px,0.9fr)_minmax(120px,0.9fr)_minmax(96px,0.6fr)_minmax(88px,0.5fr)] items-center gap-[1.5rem] p-[1rem_1.5rem] bg-[#f8fafc] !text-[#4c5d7d] !text-[0.75rem] !font-[700] uppercase rounded-t-lg border-b border-[#e2e8f0]">
          <span>Category</span><span>Procedure Performed</span><span>Status</span><span>Date</span><span>Time</span><span>Action</span>
        </div>
        {records.map((record) => (
          <div key={record.id} className="grid grid-cols-[minmax(180px,1.2fr)_minmax(300px,2.2fr)_minmax(120px,0.9fr)_minmax(120px,0.9fr)_minmax(96px,0.6fr)_minmax(88px,0.5fr)] items-center gap-[1.5rem] p-[1rem_1.5rem] border-b border-[#e2e8f0] last:border-b-0 bg-white">
            <span className="!text-[#111827] !text-[0.86rem] !font-[700] leading-[1.4]">{caseCategoryLabel(record.category)}</span>
            <span><strong className="!font-[700] !text-[0.86rem] leading-[1.4] !text-[#111827]">{record.procedurePerformed}</strong></span>
            <span><span className={`inline-flex items-center justify-start w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-[800] whitespace-nowrap ${statusClass(record.status)}`}>{record.status}</span></span>
            <span><strong className="!font-[700] !text-[0.86rem] leading-[1.4] !text-[#111827]">{formatDate(record.caseDate)}</strong></span>
            <span><strong className="!font-[700] !text-[0.86rem] leading-[1.4] !text-[#111827]">{record.shiftTime}</strong></span>
            <span><Link className="!text-[#8A252C] !font-[700] !text-[0.86rem] cursor-pointer no-underline hover:underline" href={`${basePath}/clinical-cases/validation?caseId=${record.id}`}>Open</Link></span>
          </div>
        ))}
        </div>
      </div>
    </section>
  );
}

export function ClinicalCasesSelectionContent({ basePath }: { basePath: string; searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");
  const user = useAuthStore((state) => state.user);
  const isChair = basePath === "/chair";
  const { data: instructorCases = [], isLoading: isInstructorLoading } = useInstructorCases();
  const { data: allCases = [], isLoading: isAllLoading } = useAllClinicalCases(isChair, isChair && user?.id != null ? String(user.id) : undefined);
  const cases = isChair ? allCases : instructorCases;
  const isLoading = isChair ? isAllLoading : isInstructorLoading;
  const studentCases = cases.filter((clinicalCase: any) => String(clinicalCase.studentId) === String(studentId));
  const firstCase = studentCases[0];
  const pendingCount = studentCases.filter((clinicalCase: any) => clinicalCase.status === "PENDING").length;
  const drCases = studentCases.filter(isDeliveryRoomCase);
  const orCases = studentCases.filter(isOperatingRoomCase);

  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)] content-start">
      <section className="grid grid-cols-[minmax(0,1fr)] gap-[18px]">
        <article className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem] w-full mt-0">
          <div className="flex items-start justify-between gap-[22px] mb-[1.1rem] border-b border-[#e5eaf1] pb-[1.1rem] flex-wrap">
            <h2 className="m-0 !text-[#111827] !text-[1.15rem] leading-[1.2] !font-[800] tracking-[-0.03em]">Student Information</h2>
            <span className="inline-flex items-center justify-start w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-[800] whitespace-nowrap bg-[#fff8e1] !text-[#6c4c00]">{pendingCount} pending cases</span>
          </div>

          {firstCase ? (
            <>
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[16px] border border-[#e2e8f0] rounded-[8px] bg-[#f8fafc] mb-[14px] p-[14px] max-[680px]:grid-cols-1">
                <ProfileAvatar name={firstCase.studentName} imageUrl={firstCase.studentProfileImageUrl} size={48} />
                <div className="w-full"><strong className="block !text-[#111827] !text-[1rem] !font-[800] leading-[1.3] mb-[4px]">{firstCase.studentName}</strong><p className="m-0 !text-[#64748b] !text-[0.86rem] !font-[700]">{firstCase.studentSection} - Student ID {firstCase.studentSchoolId}</p></div>
                <span className="inline-flex items-center justify-start w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-[800] whitespace-nowrap bg-[#fff8e1] !text-[#6c4c00]">For review</span>
              </div>
              <CaseSection title="DR" subtitle="Delivery Room Cases" records={drCases} basePath={basePath} />
              <CaseSection title="OR" subtitle="Operating Room Cases" records={orCases} basePath={basePath} />
              <div className="flex items-center gap-[0.75rem] p-[1rem] rounded-[8px] !text-[#1e293b] !font-[500] bg-[#f8fafc] border border-[#e2e8f0] mt-[1.2rem]" role="status" aria-live="polite">Select a clinical case to continue validation.</div>
            </>
          ) : (
            <div className="border border-dashed border-[#cbd5e1] rounded-lg bg-[#f8fafc] p-[1.25rem] !text-[#64748b] !font-[800] text-center">{isLoading ? "Loading clinical cases..." : "No clinical cases found for this student."}</div>
          )}
        </article>
      </section>
    </main>
  );
}
