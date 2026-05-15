import React from "react";
import Link from "next/link";

const fallbackStudents: Record<string, any> = {
  "maria-cruz": {
    name: "Maria Cruz",
    initials: "MC",
    id: "12-3456-789",
    section: "BSN 3A",
    status: "Pending",
    pendingCount: 4
  },
  "treasure-abadinas": {
    name: "Treasure Abadinas",
    initials: "TA",
    id: "22-1845-103",
    section: "BSN 3A",
    status: "Pending",
    pendingCount: 4
  }
};

const studentCases: Record<string, { dr: any[], or: any[] }> = {
  "maria-cruz": {
    dr: [
      { caseKey: "maria-dr-handled-0422", category: "Major Case - Assist", procedure: "Primary Lower Segment Transverse Cesarean Section", status: "pending", date: "Apr 24, 2026", time: "4:35 PM" },
      { caseKey: "maria-dr-handled-0423", category: "Handled Case", procedure: "Operative Hysteroscopy, Transcervical Resection of Polyp", status: "pending", date: "Apr 22, 2026", time: "11:45 AM" }
    ],
    or: [
      { caseKey: "maria-or-circulate-0423", category: "Major Case - Circulate", procedure: "Laparoscopic Cholecystectomy", status: "pending", date: "Apr 23, 2026", time: "2:10 PM" },
      { caseKey: "maria-or-minor-0421", category: "Minor Case", procedure: "Suturing of Lacerated Left Side Lip Wound", status: "pending", date: "Apr 21, 2026", time: "9:30 AM" }
    ]
  },
  "treasure-abadinas": {
    dr: [
      { caseKey: "treasure-dr-newborn-0424", category: "Major Case - Assist", procedure: "Primary Lower Segment Transverse Cesarean Section", status: "pending", date: "Apr 24, 2026", time: "4:35 PM" },
      { caseKey: "treasure-dr-handled-0422", category: "Handled Case", procedure: "Operative Hysteroscopy, Transcervical Resection of Polyp", status: "pending", date: "Apr 22, 2026", time: "11:45 AM" }
    ],
    or: [
      { caseKey: "treasure-or-circulate-0423", category: "Major Case - Circulate", procedure: "Laparoscopic Cholecystectomy", status: "pending", date: "Apr 23, 2026", time: "2:10 PM" },
      { caseKey: "treasure-or-minor-0421", category: "Minor Case", procedure: "Suturing of Lacerated Left Side Lip Wound", status: "pending", date: "Apr 21, 2026", time: "9:30 AM" }
    ]
  }
};

function CaseSection({ title, subtitle, records, studentKey, basePath }: {
  title: string;
  subtitle: string;
  records: any[];
  studentKey: string;
  basePath: string;
}) {
  return (
    <section className="grid gap-[10px] mt-[16px]" aria-label={`${subtitle} records`}>
      <div className="flex items-center justify-between gap-[12px] mt-[4px] max-[680px]:flex-col max-[680px]:items-start">
        <h3 className="m-0 !text-[#8A252C] !text-[1.05rem] !font-[800]">{title}</h3>
        <span className="!text-[#475569] !text-[0.85rem] !font-[800]">{subtitle}</span>
      </div>

      <div className="border border-[#e2e8f0] rounded-lg overflow-hidden">
        <div className="grid grid-cols-[minmax(180px,1.2fr)_minmax(300px,2.2fr)_minmax(120px,0.9fr)_minmax(120px,0.9fr)_minmax(96px,0.6fr)_minmax(88px,0.5fr)] items-center gap-[1.5rem] p-[1rem_1.5rem] bg-[#f8fafc] !text-[#4c5d7d] !text-[0.75rem] !font-[700] uppercase rounded-t-lg border-b border-[#e2e8f0] max-[680px]:grid-cols-1 max-[680px]:gap-[0.5rem]">
          <span className="flex items-center justify-start text-left">Category</span>
          <span className="flex items-center justify-start text-left">Procedure Performed</span>
          <span className="flex items-center justify-start text-left">Status</span>
          <span className="flex items-center justify-start text-left">Date</span>
          <span className="flex items-center justify-start text-left">Time</span>
          <span className="flex items-center justify-start text-left">Action</span>
        </div>

        {records.map((record, index) => (
          <div key={index} className="grid grid-cols-[minmax(180px,1.2fr)_minmax(300px,2.2fr)_minmax(120px,0.9fr)_minmax(120px,0.9fr)_minmax(96px,0.6fr)_minmax(88px,0.5fr)] items-center gap-[1.5rem] p-[1rem_1.5rem] border-b border-[#e2e8f0] last:border-b-0 max-[680px]:grid-cols-1 max-[680px]:gap-[0.5rem] bg-white">
            <span className="flex items-center justify-start text-left !text-[#111827] !text-[0.86rem] !font-[700] leading-[1.4]">{record.category}</span>
            <span className="flex items-center justify-start text-left"><strong className="!font-[700] !text-[0.86rem] leading-[1.4] !text-[#111827]">{record.procedure}</strong></span>
            <span className="flex items-center justify-start text-left"><span className="inline-flex items-center justify-start w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-[800] whitespace-nowrap bg-[#fff8e1] !text-[#6c4c00]">Pending</span></span>
            <span className="flex items-center justify-start text-left"><strong className="!font-[700] !text-[0.86rem] leading-[1.4] !text-[#111827]">{record.date}</strong></span>
            <span className="flex items-center justify-start text-left"><strong className="!font-[700] !text-[0.86rem] leading-[1.4] !text-[#111827]">{record.time}</strong></span>
            <span className="flex items-center justify-start text-left"><Link className="!text-[#8A252C] !font-[700] !text-[0.86rem] cursor-pointer no-underline hover:underline" href={`${basePath}/clinical-cases/validation?case=${record.caseKey || 'treasure-dr-newborn-0424'}&student=${studentKey}`}>Open</Link></span>
          </div>
        ))}
      </div>
    </section>
  );
}

export async function ClinicalCasesSelectionContent({ basePath, searchParams: searchParamsPromise }: { basePath: string, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await searchParamsPromise;
  const studentKey = (typeof searchParams.student === 'string' ? searchParams.student : "treasure-abadinas");
  const student = fallbackStudents[studentKey] || fallbackStudents["treasure-abadinas"];
  const cases = studentCases[studentKey] || studentCases["treasure-abadinas"];

  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)] content-start">
      <section className="grid grid-cols-[minmax(0,1fr)] gap-[18px]">
        <article className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem] w-full mt-0">
          <div className="flex items-start justify-between gap-[22px] mb-[1.1rem] border-b border-[#e5eaf1] pb-[1.1rem] flex-wrap">
            <div>
              <h2 className="m-0 !text-[#111827] !text-[1.15rem] leading-[1.2] !font-[800] tracking-[-0.03em]">Student Information</h2>
            </div>
            <span className="inline-flex items-center justify-start w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-[800] whitespace-nowrap bg-[#fff8e1] !text-[#6c4c00]">
              {student.pendingCount} pending cases
            </span>
          </div>

          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[16px] border border-[#e2e8f0] rounded-[8px] bg-[#f8fafc] mb-[14px] p-[14px] max-[680px]:grid-cols-1">
            <div className="w-[48px] h-[48px] rounded-full bg-[#facc15] !text-[#854d0e] flex items-center justify-center !font-[800] !text-[0.92rem] shrink-0">
              {student.initials}
            </div>
            <div className="w-full">
              <strong className="block !text-[#111827] !text-[1rem] !font-[800] leading-[1.3] mb-[4px]">{student.name}</strong>
              <p className="m-0 !text-[#64748b] !text-[0.86rem] !font-[700]">{student.section} - Student ID {student.id}</p>
            </div>
            <span className="inline-flex items-center justify-start w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-[800] whitespace-nowrap bg-[#fff8e1] !text-[#6c4c00]">
              {student.status}
            </span>
          </div>

          <CaseSection title="DR" subtitle="Delivery Room Cases" records={cases.dr} studentKey={studentKey} basePath={basePath} />
          <CaseSection title="OR" subtitle="Operating Room Cases" records={cases.or} studentKey={studentKey} basePath={basePath} />

          <div className="flex items-center gap-[0.75rem] p-[1rem] rounded-[8px] !text-[#1e293b] !font-[500] bg-[#f8fafc] border border-[#e2e8f0] mt-[1.2rem]" role="status" aria-live="polite">
            Select a clinical case to continue validation.
          </div>
        </article>
      </section>
    </main>
  );
}
