"use client";

import React, { use } from "react";
import Link from "next/link";

export function CiRecommendationsDetailContent({ basePath, searchParams: searchParamsPromise }: { basePath: string, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = use(searchParamsPromise);
  const studentQuery = typeof searchParams.student === 'string' ? searchParams.student : "maria-cruz";
  const historyIndex = typeof searchParams.history === 'string' ? searchParams.history : undefined;

  // Mock mapping based on query
  const studentMap: Record<string, any> = {
    "maria-cruz": { name: "Maria Cruz", initials: "MC", id: "12-3456-789", section: "BSN 3A" },
    "treasure-abadinas": { name: "Treasure Abadinas", initials: "TA", id: "22-1845-103", section: "BSN 3A" },
    "zander-aligato": { name: "Zander Aligato", initials: "ZA", id: "21-7740-118", section: "BSN 3B" },
  };

  const student = studentMap[studentQuery] || studentMap["maria-cruz"];

  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)] content-start flex flex-col gap-[1.5rem]">
      {/* Main Appeal Card */}
      <section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[2rem] w-full mt-0">
        <small className="!text-[#8A252C] !font-[800] !text-[0.8rem] tracking-[0.02em]">{student.section} - {student.id}</small>
        <h2 className="m-[4px_0_1.5rem] !mb-4 !text-[1.4rem] !text-[#1e293b] !font-[800]">
          {historyIndex !== undefined ? `${student.name}'s Appeal History` : `${student.name}'s Appeals`}
        </h2>

        <div className="border border-[#e2e8f0] rounded-[10px] p-[1.5rem]">
          <div className="flex justify-between items-start mb-[1.25rem]">
            <div>
              <h3 className="m-[0_0_6px] !text-[1.15rem] !text-[#0f172a] !font-[800]">Late arrival due to bus delay</h3>
              <p className="m-0 !text-[0.85rem] !text-[#475569] !font-[600]">Submitted Today, 7:48 AM <span className="mx-[6px] text-[#cbd5e1]">|</span> Assigned CI: Patricia Reyes, RN, MAN</p>
            </div>
            <span className="bg-[#fef3c7] !text-[#92400e] px-[14px] py-[4px] rounded-full !text-[0.8rem] !font-[800]">Pending</span>
          </div>

          {/* 4-col grid */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[1.5rem] bg-[#f8fafc] p-[1.25rem] rounded-[8px] mb-[1rem] border border-[#f1f5f9]">
            <div>
              <small className="block !text-[0.7rem] !font-[800] !text-[#64748b] uppercase mb-[4px] tracking-[0.05em]">Appeal Type</small>
              <strong className="!text-[0.95rem] !text-[#1e293b] !font-[800]">Attendance</strong>
            </div>
            <div>
              <small className="block !text-[0.7rem] !font-[800] !text-[#64748b] uppercase mb-[4px] tracking-[0.05em]">Related Duty Date</small>
              <strong className="!text-[0.95rem] !text-[#1e293b] !font-[800]">April 29, 2026</strong>
            </div>
            <div>
              <small className="block !text-[0.7rem] !font-[800] !text-[#64748b] uppercase mb-[4px] tracking-[0.05em]">Clinical Site</small>
              <strong className="!text-[0.95rem] !text-[#1e293b] !font-[800]">CCMC</strong>
            </div>
            <div>
              <small className="block !text-[0.7rem] !font-[800] !text-[#64748b] uppercase mb-[4px] tracking-[0.05em]">Duty Area</small>
              <strong className="!text-[0.95rem] !text-[#1e293b] !font-[800]">Emergency Room</strong>
            </div>
          </div>

          {/* Vertical sections */}
          <div className="flex flex-col gap-[0.6rem]">
            <div className="bg-[#f8fafc] p-[1.25rem] rounded-[8px] border-l-[4px] border-[#facc15]">
              <small className="block !text-[0.7rem] !font-[800] !text-[#64748b] uppercase mb-[6px] tracking-[0.05em]">Student Reason</small>
              <strong className="!text-[0.95rem] !text-[#334155] !font-[800]">CIT-U shuttle was delayed after traffic rerouting near the hospital entrance.</strong>
            </div>
            <div className="bg-[#f8fafc] p-[1.25rem] rounded-[8px] border-l-[4px] border-[#facc15]">
              <small className="block !text-[0.7rem] !font-[800] !text-[#64748b] uppercase mb-[6px] tracking-[0.05em]">Supporting Evidence or Notes</small>
              <strong className="!text-[0.95rem] !text-[#334155] !font-[800]">Transport advisory, timestamped arrival note, or CI attendance record attached.</strong>
            </div>
            <div className="bg-[#f8fafc] p-[1.25rem] rounded-[8px] border-l-[4px] border-[#facc15]">
              <small className="block !text-[0.7rem] !font-[800] !text-[#64748b] uppercase mb-[6px] tracking-[0.05em]">Supporting Files</small>
              <strong className="!text-[0.95rem] !text-[#334155] !font-[800]">transport-advisory.pdf, arrival-photo.jpg</strong>
            </div>
            <div className="bg-[#f8fafc] p-[1.25rem] rounded-[8px] border-l-[4px] border-[#facc15]">
              <small className="block !text-[0.7rem] !font-[800] !text-[#64748b] uppercase mb-[6px] tracking-[0.05em]">CI Recommendation</small>
              <strong className="!text-[0.95rem] !text-[#334155] !font-[800]">CI recommends accepting the appeal because transport evidence and arrival timestamp were attached.</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-[1rem] mt-[1.5rem]">
            <button
              type="button"
              className="bg-white border border-[#e2e8f0] p-[0.75rem_1.75rem] rounded-[8px] !font-[800] !text-[#475569] !text-[0.95rem] cursor-pointer hover:border-[#cbd5e1] hover:!text-[#334155] transition-colors"
            >
              Mark as Rejected
            </button>
            <button
              type="button"
              className="bg-[#8A252C] border-none p-[0.75rem_1.75rem] rounded-[8px] !font-[800] !text-white !text-[0.95rem] cursor-pointer shadow-[0_4px_12px_rgba(138,37,44,0.2)] hover:bg-[#6b1d22] transition-colors"
            >
              Mark as Accepted
            </button>
          </div>
        </div>
      </section>

      {/* History section (Only show if not viewing a specific history item) */}
      {historyIndex === undefined && (
        <section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[2rem] w-full mt-0">
          <div className="flex justify-between items-center mb-[2rem]">
            <h2 className="m-0 !text-[1.3rem] !text-[#1e293b] !font-[800]">{student.name}&apos;s Appeal History</h2>
            <span className="bg-[#dcfce7] !text-[#166534] px-[14px] py-[4px] rounded-full !text-[0.8rem] !font-[800]">2 records</span>
          </div>

          <div>
            <h4 className="!text-[0.7rem] !font-[800] !text-[#64748b] uppercase m-[0_0_0.75rem_0] tracking-[0.05em]">Pending</h4>
            <Link href={`${basePath}/ci-recommendations/detail?student=${studentQuery}&history=0`} className="flex items-center justify-between p-[1.25rem] border border-[#e2e8f0] rounded-[10px] no-underline text-inherit transition-all duration-150 hover:bg-[#fefce8] hover:border-[rgba(138,37,44,0.3)] mb-[2rem]">
              <div className="flex items-center gap-[1.25rem]">
                <div className="bg-[#facc15] !text-[#854d0e] w-[42px] h-[42px] rounded-full flex items-center justify-center !font-[800] !text-[0.9rem] shrink-0">
                  {student.initials}
                </div>
                <div>
                  <strong className="block !text-[#1e293b] !text-[1rem] mb-[4px] !font-[800]">Late arrival due to bus delay</strong>
                  <small className="block !text-[#475569] !font-[600] !text-[0.85rem]">Attendance - April 29, 2026 - CCMC</small>
                  <small className="block !text-[#64748b] !text-[0.8rem] mt-[2px]">Submitted Today, 7:48 AM</small>
                </div>
              </div>
              <span className="bg-[#fef3c7] !text-[#92400e] px-[14px] py-[4px] rounded-full !text-[0.8rem] !font-[800] whitespace-nowrap">Pending</span>
            </Link>

            <h4 className="!text-[0.7rem] !font-[800] !text-[#64748b] uppercase m-[0_0_0.75rem_0] tracking-[0.05em]">Accepted / Returned</h4>
            <Link href={`${basePath}/ci-recommendations/detail?student=${studentQuery}&history=1`} className="flex items-center justify-between p-[1.25rem] border border-[#e2e8f0] rounded-[10px] no-underline text-inherit transition-all duration-150 hover:bg-[#f8fafc] hover:border-[rgba(138,37,44,0.3)]">
              <div className="flex items-center gap-[1.25rem]">
                <div className="bg-[#facc15] !text-[#854d0e] w-[42px] h-[42px] rounded-full flex items-center justify-center !font-[800] !text-[0.9rem] shrink-0">
                  {student.initials}
                </div>
                <div>
                  <strong className="block !text-[#1e293b] !text-[1rem] mb-[4px] !font-[800]">Excused tardiness request</strong>
                  <small className="block !text-[#475569] !font-[600] !text-[0.85rem]">Attendance - April 12, 2026 - CCMC</small>
                  <small className="block !text-[#64748b] !text-[0.8rem] mt-[2px]">Submitted April 12, 2026, 8:04 AM</small>
                </div>
              </div>
              <span className="bg-[#dcfce7] !text-[#166534] px-[14px] py-[4px] rounded-full !text-[0.8rem] !font-[800] whitespace-nowrap">Accepted</span>
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
