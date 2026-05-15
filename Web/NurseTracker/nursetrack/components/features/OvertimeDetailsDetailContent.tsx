"use client";

import React, { use } from "react";

const overtimePeople = [
  {
    id: "patricia-reyes",
    name: "Patricia Reyes",
    initials: "PR",
    role: "Clinical Instructor",
    identifier: "CI-2026-006",
    section: "BSN 3A",
    site: "Emergency Room",
    records: [
      { date: "1-May-26", schedule: "07:00 AM - 03:00 PM", actual: "06:50 AM - 05:20 PM", overtime: 2.33 },
      { date: "2-May-26", schedule: "07:00 AM - 03:00 PM", actual: "07:00 AM - 04:30 PM", overtime: 1.5 },
      { date: "3-May-26", schedule: "07:00 AM - 03:00 PM", actual: "06:45 AM - 06:00 PM", overtime: 3 },
    ]
  },
  {
    id: "miguel-santos",
    name: "Miguel Santos",
    initials: "MS",
    role: "Clinical Instructor",
    identifier: "CI-2026-011",
    section: "BSN 3B",
    site: "Pedia Pulmo Ward",
    records: [
      { date: "4-May-26", schedule: "08:00 AM - 04:00 PM", actual: "07:40 AM - 06:10 PM", overtime: 2.17 },
      { date: "5-May-26", schedule: "08:00 AM - 04:00 PM", actual: "08:00 AM - 05:45 PM", overtime: 1.75 },
      { date: "6-May-26", schedule: "08:00 AM - 04:00 PM", actual: "07:50 AM - 04:00 PM", overtime: 0 },
    ]
  },
  {
    id: "maria-cruz",
    name: "Maria Cruz",
    initials: "MC",
    role: "Student",
    identifier: "12-3456-789",
    section: "BSN 3A",
    site: "Emergency Room",
    records: [
      { date: "7-May-26", schedule: "07:00 AM - 03:00 PM", actual: "06:55 AM - 04:30 PM", overtime: 1.5 },
      { date: "8-May-26", schedule: "07:00 AM - 03:00 PM", actual: "07:00 AM - 05:00 PM", overtime: 2 },
    ]
  },
  {
    id: "treasure-abadinas",
    name: "Treasure Abadinas",
    initials: "TA",
    role: "Student",
    identifier: "22-1845-103",
    section: "BSN 3A",
    site: "Delivery Room",
    records: [
      { date: "9-May-26", schedule: "06:00 AM - 02:00 PM", actual: "05:50 AM - 03:00 PM", overtime: 1 },
      { date: "10-May-26", schedule: "06:00 AM - 02:00 PM", actual: "05:45 AM - 04:15 PM", overtime: 2.25 },
    ]
  },
  {
    id: "carlo-fernandez",
    name: "Carlo Fernandez",
    initials: "CF",
    role: "Student",
    identifier: "23-1188-902",
    section: "BSN 3A",
    site: "Operating Room",
    records: [
      { date: "11-May-26", schedule: "08:00 AM - 04:00 PM", actual: "07:40 AM - 04:00 PM", overtime: 0 },
      { date: "12-May-26", schedule: "08:00 AM - 04:00 PM", actual: "07:50 AM - 06:00 PM", overtime: 2 },
    ]
  },
];

function formatOvertimeHours(value: number) {
  if (!value) return "0 hrs";
  return `${Number(value).toFixed(value % 1 === 0 ? 0 : 2).replace(/\.?0+$/, "")} hrs`;
}

export function OvertimeDetailsDetailContent({ basePath, searchParams: searchParamsPromise }: { basePath: string, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = use(searchParamsPromise);
  const personId = typeof searchParams.id === 'string' ? searchParams.id : "";
  const period = typeof searchParams.period === 'string' ? searchParams.period : "May 2026";

  const person = overtimePeople.find(p => p.id === personId);
  const total = person ? person.records.reduce((sum, r) => sum + r.overtime, 0) : 0;
  const sheetTitle = person
    ? `${person.role === "Clinical Instructor" ? "CNAHS FACULTY" : "CNAHS STUDENT"} WHO RENDERED OVERTIME FOR THE PERIOD OF ${period.toUpperCase()}`
    : "CNAHS OVERTIME DETAILS";

  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)] content-start">
      <section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem] w-full mt-0">
        {person ? (
          <>
            <div className="grid grid-cols-4 gap-[0.75rem] mb-[1.25rem] max-[900px]:grid-cols-2 max-[680px]:grid-cols-1">
              <div className="p-[1rem] border border-[#e2e8f0] rounded-[0.75rem] bg-[#f8fafc]">
                <span className="block !text-[#64748b] !text-[0.8rem] !font-[800] uppercase tracking-[0.04em] mb-[0.35rem]">Name</span>
                <strong className="!text-[#1e293b] !text-[0.95rem] !font-[800]">{person.name}</strong>
              </div>
              <div className="p-[1rem] border border-[#e2e8f0] rounded-[0.75rem] bg-[#f8fafc]">
                <span className="block !text-[#64748b] !text-[0.8rem] !font-[800] uppercase tracking-[0.04em] mb-[0.35rem]">Role</span>
                <strong className="!text-[#1e293b] !text-[0.95rem] !font-[800]">{person.role}</strong>
              </div>
              <div className="p-[1rem] border border-[#e2e8f0] rounded-[0.75rem] bg-[#f8fafc]">
                <span className="block !text-[#64748b] !text-[0.8rem] !font-[800] uppercase tracking-[0.04em] mb-[0.35rem]">Period</span>
                <strong className="!text-[#1e293b] !text-[0.95rem] !font-[800]">{period}</strong>
              </div>
              <div className="p-[1rem] border border-[#e2e8f0] rounded-[0.75rem] bg-[#f8fafc]">
                <span className="block !text-[#64748b] !text-[0.8rem] !font-[800] uppercase tracking-[0.04em] mb-[0.35rem]">Total Overtime</span>
                <strong className="!text-[#1e293b] !text-[0.95rem] !font-[800]">{formatOvertimeHours(total)}</strong>
              </div>
            </div>

            <div className="border border-[#e2e8f0] rounded-[0.75rem] overflow-hidden bg-white">
              <div className="p-[1rem] text-center !font-[800] !text-[0.9rem] !text-[#8A252C] bg-[#fff8e1] border-b border-[#e2e8f0] tracking-[0.02em]">{sheetTitle}</div>
              <div className="w-full overflow-x-auto">
                <div className="grid grid-cols-[0.4fr_1fr_1.5fr_1.5fr_0.8fr] min-w-[720px] border-b border-[#e2e8f0]">
                  <span className="p-[0.85rem] bg-[#8A252C] !text-white !font-[700] !text-[0.82rem] uppercase tracking-[0.04em] border-r border-[#e2e8f0] last:border-r-0">No.</span>
                  <span className="p-[0.85rem] bg-[#8A252C] !text-white !font-[700] !text-[0.82rem] uppercase tracking-[0.04em] border-r border-[#e2e8f0] last:border-r-0">Date</span>
                  <span className="p-[0.85rem] bg-[#8A252C] !text-white !font-[700] !text-[0.82rem] uppercase tracking-[0.04em] border-r border-[#e2e8f0] last:border-r-0">Schedule</span>
                  <span className="p-[0.85rem] bg-[#8A252C] !text-white !font-[700] !text-[0.82rem] uppercase tracking-[0.04em] border-r border-[#e2e8f0] last:border-r-0">Actual Time</span>
                  <span className="p-[0.85rem] bg-[#8A252C] !text-white !font-[700] !text-[0.82rem] uppercase tracking-[0.04em] border-r border-[#e2e8f0] last:border-r-0">OT Hours</span>
                </div>
                {person.records.map((record, index) => (
                  <div key={index} className="grid grid-cols-[0.4fr_1fr_1.5fr_1.5fr_0.8fr] min-w-[720px] border-b border-[#e2e8f0] last:border-b-0">
                    <span className="p-[0.85rem] !text-[0.88rem] !font-[700] !text-[#334155] border-r border-[#e2e8f0] last:border-r-0">{index + 1}</span>
                    <span className="p-[0.85rem] !text-[0.88rem] !font-[700] !text-[#334155] border-r border-[#e2e8f0] last:border-r-0">{record.date}</span>
                    <span className="p-[0.85rem] !text-[0.88rem] !font-[700] !text-[#334155] border-r border-[#e2e8f0] last:border-r-0">{record.schedule}</span>
                    <span className="p-[0.85rem] !text-[0.88rem] !font-[700] !text-[#334155] border-r border-[#e2e8f0] last:border-r-0">{record.actual}</span>
                    <span className="p-[0.85rem] !text-[0.88rem] !font-[700] !text-[#334155] border-r border-[#e2e8f0] last:border-r-0"><strong>{formatOvertimeHours(record.overtime)}</strong></span>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-[1rem] p-[0.85rem_1rem] bg-[#f8fafc] border border-[#e2e8f0] rounded-[0.5rem] !text-[0.88rem] !text-[#475569] !font-[600]">
              {person.name} has {formatOvertimeHours(total)} recorded for {period}.
            </p>
          </>
        ) : (
          <div className="p-[3rem] text-center border border-dashed border-[#cbd5e1] rounded-lg bg-[#f8fafc]">
            <p className="!text-[#64748b] !font-[800] m-0">No overtime record found. Go back to Overtime Details and select a valid person.</p>
          </div>
        )}
      </section>
    </main>
  );
}
