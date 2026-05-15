"use client";

import React, { useState, use } from "react";
import Link from "next/link";

const fallbackStudents: Record<string, any> = {
  "maria-cruz": {
    name: "Maria Cruz",
    initials: "MC",
    id: "12-3456-789",
    section: "BSN 3A",
    status: "Submitted",
    cases: 0
  },
  "treasure-abadinas": {
    name: "Treasure Abadinas",
    initials: "TA",
    id: "22-1845-103",
    section: "BSN 3A",
    status: "Submitted",
    cases: 2
  }
};

const studentCases: Record<string, { dr: any[], or: any[] }> = {
  "treasure-abadinas": {
    dr: [
      { id: "treasure-dr-newborn-0424", category: "Major Case - Assist", procedure: "Primary Lower Segment Transverse Cesarean Section", status: "pending", date: "Apr 24, 2026", time: "4:35 PM" }
    ],
    or: [
      { id: "treasure-or-chole-0423", category: "Major Case - Circulate", procedure: "Laparoscopic Cholecystectomy", status: "pending", date: "Apr 23, 2026", time: "2:10 PM" }
    ]
  },
  "maria-cruz": {
    dr: [],
    or: []
  }
};

const ghostBtn = "inline-flex items-center justify-center min-h-[48px] px-[1.25rem] rounded-[8px] bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.84rem] !font-[800] hover:border-[rgba(138,37,44,0.32)] hover:!text-[#8A252C] hover:shadow-[0_10px_24px_rgba(32,33,36,0.08)] transition-all cursor-pointer";
const primaryBtn = "inline-flex items-center justify-center min-h-[48px] px-[1.75rem] rounded-[10px] bg-[#8A252C] !text-white !text-[0.95rem] !font-[800] shadow-[0_8px_16px_-4px_rgba(138,37,44,0.4)] hover:bg-[#6d1d23] transition-all cursor-pointer border-none shrink-0";

// Reusable case table section
function CaseSection({ title, subtitle, records, studentKey, basePath }: {
  title: string;
  subtitle: string;
  records: any[];
  studentKey: string;
  basePath: string;
}) {
  return (
    <section className="grid gap-[10px] mt-[20px]">
      <div className="flex items-center justify-between gap-[12px] m-0">
        <h3 className="m-0 !text-[#8A252C] !text-[1.05rem] !font-[800]">{title}</h3>
        <span className="!text-[#475569] !text-[0.85rem] !font-[800]">{subtitle}</span>
      </div>
      <div className="border border-[#e2e8f0] rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[180px_1fr_120px_120px_96px_88px] items-center gap-[1.5rem] px-[1.5rem] py-[0.85rem] bg-[#f8fafc] !text-[#4c5d7d] !text-[0.75rem] !font-[700] uppercase rounded-t-lg border-b border-[#e2e8f0]">
          <span>Category</span>
          <span>Procedure Performed</span>
          <span>Status</span>
          <span>Date</span>
          <span>Time</span>
          <span>Action</span>
        </div>
        {records.length === 0 ? (
          <div className="px-[1.5rem] py-[1.25rem] !text-[#64748b] !text-[0.875rem] !font-[700] text-center">
            No cases submitted.
          </div>
        ) : (
          records.map((record, i) => (
            <div key={i} className="grid grid-cols-[180px_1fr_120px_120px_96px_88px] items-center gap-[1.5rem] px-[1.5rem] py-[0.85rem] border-b border-[#e2e8f0] last:border-b-0 !text-[#111827] !text-[0.875rem] !font-[500]">
              <span>{record.category}</span>
              <span><strong className="!font-[700] !text-[0.875rem]">{record.procedure}</strong></span>
              <span>
                <span className="inline-flex items-center justify-start w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#fef9c3] !text-[#854d0e]">Pending</span>
              </span>
              <span className="!text-[0.875rem] !font-[500]">{record.date}</span>
              <span><strong className="!font-[700] !text-[0.875rem]">{record.time}</strong></span>
              <span>
                <Link
                  className="!text-[#8A252C] !text-[0.875rem] !font-[700] cursor-pointer no-underline hover:underline"
                  href={`${basePath}/clinical-cases/validation?case=${record.id}&mode=view&from=clearance&student=${studentKey}`}
                >
                  Open
                </Link>
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export function ClearanceDetailContent({ basePath, searchParams: searchParamsPromise }: { basePath: string, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = use(searchParamsPromise);
  const [showModal, setShowModal] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const studentKey = (typeof searchParams.student === 'string' ? searchParams.student : "treasure-abadinas");
  const student = fallbackStudents[studentKey] || fallbackStudents["treasure-abadinas"];
  const cases = studentCases[studentKey] || studentCases["treasure-abadinas"];

  const handleApprove = () => {
    setIsApproved(true);
    setShowModal(false);
  };

  return (
    <>
      <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]">
        <article className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem]">

          {/* Panel heading */}
          <div className="flex justify-between items-start gap-[22px] mb-[1.15rem] border-b border-[#e5eaf1] pb-[1.1rem] flex-wrap">
            <div>
              <h2 className="m-0 !text-[#111827] !text-[1.24rem] !font-bold">Student Information</h2>
            </div>
            <span className="inline-flex items-center justify-start w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#fef9c3] !text-[#854d0e]">
              {student.cases} submitted cases
            </span>
          </div>

          {/* Student identity card */}
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[16px] border border-[#e2e8f0] rounded-[8px] bg-[#f8fafc] mb-[14px] p-[14px]">
            <div className="w-[48px] h-[48px] rounded-full bg-[#facc15] !text-[#854d0e] flex items-center justify-center !font-[800] !text-[0.92rem] shrink-0">
              {student.initials}
            </div>
            <div>
              <strong className="block !text-[#111827] !text-[1rem] !font-[800] leading-[1.3]">{student.name}</strong>
              <p className="m-0 !text-[#64748b] !text-[0.86rem] !font-[700]">{student.section} - Student ID {student.id}</p>
            </div>
            <span className={`inline-flex items-center justify-start w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap ${isApproved ? "bg-[#dcfce7] !text-[#166534]" : "bg-[#fef9c3] !text-[#854d0e]"}`}>
              {isApproved ? "Approved" : student.status}
            </span>
          </div>

          {/* Case tables */}
          <CaseSection title="DR" subtitle="Delivery Room Cases" records={cases.dr} studentKey={studentKey} basePath={basePath} />
          <CaseSection title="OR" subtitle="Operating Room Cases" records={cases.or} studentKey={studentKey} basePath={basePath} />

          {/* Status message */}
          <div className="mt-[1.25rem] px-[1.25rem] py-[0.85rem] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg !text-[0.85rem] !text-[#64748b] !font-[700] leading-[1.4]">
            {student.cases} submitted clinical cases shown for Chair clearance review.
          </div>

          {/* Chair Decision section */}
          <section className="grid gap-[16px] mt-[28px] pt-[24px] border-t border-[#e2e8f0]">
            <div className="flex justify-between items-start gap-[22px] flex-wrap">
              <h2 className="m-0 !text-[#111827] !text-[1.24rem] !font-bold">Chair Decision</h2>
              <span className={`inline-flex items-center justify-start w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap ${isApproved ? "bg-[#dcfce7] !text-[#166534]" : "bg-[#fef9c3] !text-[#854d0e]"}`}>
                {isApproved ? "Cleared" : "Final review"}
              </span>
            </div>

            <div className="grid grid-cols-[4fr_6fr] gap-[1.5rem] items-stretch max-[1024px]:grid-cols-1">
              {/* Student summary card */}
              <div className="flex flex-col gap-[12px]">
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-[16px] border border-[#e2e8f0] rounded-[10px] bg-[#f8fafc] p-[1rem]">
                  <div className="w-[48px] h-[48px] rounded-full bg-[#facc15] !text-[#854d0e] flex items-center justify-center !font-[800] !text-[0.92rem] shrink-0">
                    {student.initials}
                  </div>
                  <div>
                    <strong className="block !text-[#111827] !text-[1rem] !font-bold leading-[1.3]">{student.name}</strong>
                    <p className="m-0 !text-[#64748b] !text-[0.875rem] !font-[700]">2025-2026 - 2nd Semester</p>
                  </div>
                </div>
                <div className="px-[1.25rem] py-[0.85rem] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg !text-[0.85rem] !text-[#64748b] !font-[700] leading-[1.4]">
                  {isApproved
                    ? `${student.name} has been cleared for this semester.`
                    : `${student.name} submitted for clearance. Review and approve when ready.`}
                </div>
              </div>

              {/* Approval box */}
              <div className="flex flex-col gap-[12px] p-[1.5rem] border border-[#e2e8f0] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.05)]" style={{ background: "linear-gradient(135deg, rgba(255,207,1,0.10), rgba(255,255,255,0) 60%), #fff" }}>
                <h3 className="m-0 !text-[#1e293b] !text-[1.05rem] !font-[850]">Clearance Approval</h3>
                <p className="m-0 !text-[#64748b] !text-[0.875rem] !font-[700] leading-[1.5]">
                  Approve only after the student's submitted clinical cases are complete and already reviewed.
                </p>
                <div className="flex items-center gap-[10px] mt-[0.5rem] flex-wrap">
                  {!isApproved ? (
                    <>
                      <button className={primaryBtn} type="button" onClick={() => setShowModal(true)}>Approve Clearance</button>
                      <span className="flex-1 min-h-[48px] flex items-center px-[1.25rem] bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] !text-[0.8rem] !text-[#64748b] !font-[700]">
                        This will mark the student as cleared for this semester.
                      </span>
                    </>
                  ) : (
                    <div className="flex-1 min-h-[48px] flex items-center justify-center px-[1.25rem] bg-[#dcfce7] border border-[#bbf7d0] rounded-[10px] !text-[#166534] !font-[700]">
                      Student Cleared Successfully
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </article>
      </main>

      {/* Confirm modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <section className="w-[min(440px,100%)] bg-white rounded-[12px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.10),0_10px_10px_-5px_rgba(0,0,0,0.04)] border border-[#e2e8f0] p-[1.5rem] flex flex-col gap-[1.25rem]" role="dialog" aria-modal="true">
            <div className="flex items-center justify-between gap-4">
              <h2 className="m-0 !text-[#1e293b] !text-[1.25rem] !font-[800]">Approve clearance?</h2>
            </div>
            <p className="m-0 !text-[#64748b] !text-[0.9375rem] !font-[600] leading-[1.5]">
              Approve clearance for {student.name}? This will mark the student as cleared for this semester.
            </p>
            <div className="grid grid-cols-2 gap-[1rem] mt-[0.5rem]">
              <button
                className="h-[48px] inline-flex items-center justify-center border border-[#e2e8f0] rounded-[10px] bg-white !text-[#1e293b] !font-[800] !text-[0.95rem] cursor-pointer hover:border-[rgba(138,37,44,0.32)] hover:!text-[#8A252C] hover:shadow-[0_10px_24px_rgba(32,33,36,0.08)] transition-all"
                type="button"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="h-[48px] inline-flex items-center justify-center bg-[#8A252C] !text-white border-none rounded-[10px] !font-[800] !text-[0.95rem] cursor-pointer hover:bg-[#6d1d23] transition-all"
                type="button"
                onClick={handleApprove}
              >
                Approve Clearance
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
