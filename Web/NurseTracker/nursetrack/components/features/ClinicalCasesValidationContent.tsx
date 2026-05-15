import React from "react";

const fallbackStudents: Record<string, any> = {
  "treasure-abadinas": {
    name: "Treasure Abadinas",
    initials: "TA",
    id: "22-1845-103",
    section: "BSN 3A"
  }
};

const caseData: Record<string, any> = {
  "treasure-dr-newborn-0424": {
    date: "April 24, 2026",
    shiftTime: "6:00 AM - 2:00 PM",
    patientName: "J. A. K.",
    category: "Major Case - Assist",
    procedure: "Primary Lower Segment Transverse Cesarean Section",
    hospital: "SAMCH",
    supervisingCI: "Patricia Reyes, RN, MAN",
    area: "Delivery Room",
    submittedDate: "April 24, 2026",
    submittedTime: "4:35 PM",
    reflection: "I learned how to assist properly during a DR major case, maintain sterile technique, and document accurately for clinical case documentation."
  }
};

export async function ClinicalCasesValidationContent({ basePath, searchParams: searchParamsPromise }: { basePath: string, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await searchParamsPromise;
  const studentKey = (typeof searchParams.student === 'string' ? searchParams.student : "treasure-abadinas");
  const caseKey = (typeof searchParams.case === 'string' ? searchParams.case : "treasure-dr-newborn-0424");
  
  const student = fallbackStudents[studentKey] || fallbackStudents["treasure-abadinas"];
  const details = caseData[caseKey] || caseData["treasure-dr-newborn-0424"];

  const ghostBtn = "inline-flex items-center justify-center min-h-[38px] px-[12px] py-[8px] rounded-[8px] bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.84rem] !font-[800] hover:border-[rgba(138,37,44,0.32)] hover:!text-[#8A252C] hover:shadow-[0_10px_24px_rgba(32,33,36,0.08)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const primaryBtn = "inline-flex items-center justify-center min-h-[38px] px-[12px] py-[8px] rounded-[8px] bg-[#8A252C] border border-[#8A252C] !text-white !text-[0.84rem] !font-[800] hover:bg-[#6b1d22] hover:border-[#6b1d22] hover:shadow-[0_10px_24px_rgba(138,37,44,0.22)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)] content-start">
      <section className="grid grid-cols-[1fr_480px] gap-[1.5rem] items-start max-[1024px]:grid-cols-1">
        
        {/* Left side: Case Information */}
        <article className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem] w-full mt-0">
          <div className="flex items-start justify-between gap-[22px] mb-[1.1rem] border-b border-[#e5eaf1] pb-[1.1rem] flex-wrap">
            <div>
              <h2 className="m-0 !text-[#111827] !text-[1.15rem] leading-[1.2] !font-[800] tracking-[-0.03em]">Case Information</h2>
            </div>
          </div>

          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[16px] border border-[#e2e8f0] rounded-[8px] bg-[#f8fafc] mb-[14px] p-[14px]">
            <div className="w-[48px] h-[48px] rounded-full bg-[#facc15] !text-[#854d0e] flex items-center justify-center !font-[800] !text-[0.92rem] shrink-0">
              {student.initials}
            </div>
            <div>
              <strong className="block !text-[#111827] !text-[1rem] !font-[800] leading-[1.3] mb-[4px]">{student.name}</strong>
              <p className="m-0 !text-[#64748b] !text-[0.86rem] !font-[700]">{student.section} - Student ID {student.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[1rem] mt-[1rem] max-[640px]:grid-cols-1">
            <div className="p-[1rem] bg-[#f8fafc] border border-[#e2e8f0] rounded-[0.5rem] flex flex-col gap-[0.25rem]">
              <span className="!text-[0.75rem] !font-[700] uppercase !text-[#64748b]">Case date</span>
              <strong className="!text-[#1e293b] !text-[0.9375rem] !font-[800] leading-[1.35]">{details.date}</strong>
            </div>
            <div className="p-[1rem] bg-[#f8fafc] border border-[#e2e8f0] rounded-[0.5rem] flex flex-col gap-[0.25rem]">
              <span className="!text-[0.75rem] !font-[700] uppercase !text-[#64748b]">Time of shift</span>
              <strong className="!text-[#1e293b] !text-[0.9375rem] !font-[800] leading-[1.35]">{details.shiftTime}</strong>
            </div>
            <div className="p-[1rem] bg-[#f8fafc] border border-[#e2e8f0] rounded-[0.5rem] flex flex-col gap-[0.25rem]">
              <span className="!text-[0.75rem] !font-[700] uppercase !text-[#64748b]">Patient name</span>
              <strong className="!text-[#1e293b] !text-[0.9375rem] !font-[800] leading-[1.35]">{details.patientName}</strong>
            </div>
            <div className="p-[1rem] bg-[#f8fafc] border border-[#e2e8f0] rounded-[0.5rem] flex flex-col gap-[0.25rem]">
              <span className="!text-[0.75rem] !font-[700] uppercase !text-[#64748b]">Category</span>
              <strong className="!text-[#1e293b] !text-[0.9375rem] !font-[800] leading-[1.35]">{details.category}</strong>
            </div>
            <div className="p-[1rem] bg-[#f8fafc] border border-[#e2e8f0] rounded-[0.5rem] flex flex-col gap-[0.25rem]">
              <span className="!text-[0.75rem] !font-[700] uppercase !text-[#64748b]">Procedure performed</span>
              <strong className="!text-[#1e293b] !text-[0.9375rem] !font-[800] leading-[1.35]">{details.procedure}</strong>
            </div>
            <div className="p-[1rem] bg-[#f8fafc] border border-[#e2e8f0] rounded-[0.5rem] flex flex-col gap-[0.25rem]">
              <span className="!text-[0.75rem] !font-[700] uppercase !text-[#64748b]">Name of hospital</span>
              <strong className="!text-[#1e293b] !text-[0.9375rem] !font-[800] leading-[1.35]">{details.hospital}</strong>
            </div>
            <div className="p-[1rem] bg-[#f8fafc] border border-[#e2e8f0] rounded-[0.5rem] flex flex-col gap-[0.25rem]">
              <span className="!text-[0.75rem] !font-[700] uppercase !text-[#64748b]">Supervising clinical instructor</span>
              <strong className="!text-[#1e293b] !text-[0.9375rem] !font-[800] leading-[1.35]">{details.supervisingCI}</strong>
            </div>
            <div className="p-[1rem] bg-[#f8fafc] border border-[#e2e8f0] rounded-[0.5rem] flex flex-col gap-[0.25rem]">
              <span className="!text-[0.75rem] !font-[700] uppercase !text-[#64748b]">Duty area</span>
              <strong className="!text-[#1e293b] !text-[0.9375rem] !font-[800] leading-[1.35]">{details.area}</strong>
            </div>
            <div className="p-[1rem] bg-[#f8fafc] border border-[#e2e8f0] rounded-[0.5rem] flex flex-col gap-[0.25rem]">
              <span className="!text-[0.75rem] !font-[700] uppercase !text-[#64748b]">Submitted date</span>
              <strong className="!text-[#1e293b] !text-[0.9375rem] !font-[800] leading-[1.35]">{details.submittedDate}</strong>
            </div>
            <div className="p-[1rem] bg-[#f8fafc] border border-[#e2e8f0] rounded-[0.5rem] flex flex-col gap-[0.25rem]">
              <span className="!text-[0.75rem] !font-[700] uppercase !text-[#64748b]">Submitted time</span>
              <strong className="!text-[#1e293b] !text-[0.9375rem] !font-[800] leading-[1.35]">{details.submittedTime}</strong>
            </div>
          </div>

          <div className="mt-[1rem] p-[1.25rem] border border-[#e2e8f0] rounded-[0.5rem] bg-white">
            <p className="!text-[0.75rem] !font-[800] uppercase !text-[#8A252C] mb-[0.5rem]">Student reflection</p>
            <p className="m-0 !text-[#64748b] !text-[0.9rem] !font-[700] leading-[1.55]">{details.reflection}</p>
          </div>
        </article>

        {/* Right side: Admin Action */}
        <aside>
          <article className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem] w-full mt-0">
            <div className="flex items-start justify-between gap-[22px] mb-[1.1rem] border-b border-[#e5eaf1] pb-[1.1rem] flex-wrap">
              <div>
                <h2 className="m-0 !text-[#111827] !text-[1.15rem] leading-[1.2] !font-[800] tracking-[-0.03em]">Admin Action</h2>
              </div>
            </div>

            <div className="flex flex-col gap-[12px]">
              <label className="flex flex-col gap-1.5 m-0 !text-[0.875rem] !font-[800] !text-[#344054]" htmlFor="validation-comment">
                Comment (Required for rejection)
                <textarea className="w-full p-[0.75rem] border border-[#e2e8f0] rounded-[0.5rem] mt-[0.5rem] font-inherit resize-y bg-white !text-[#111827] !font-[500] focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all" id="validation-comment" rows={5} placeholder="Add a comment or feedback for the student"></textarea>
              </label>

              <div className="flex items-center gap-[0.75rem] p-[1rem] rounded-[8px] !text-[#1e293b] !font-[500] bg-[#f8fafc] border border-[#e2e8f0]" role="status" aria-live="polite">
                Review the case details, then make an approval decision.
              </div>

              <div className="grid grid-cols-[1fr_1fr] gap-[1rem] mt-[0.5rem]">
                <button className={`${ghostBtn} !text-[#dc2626] !border-[#fca5a5] hover:!border-[#f87171]`} type="button">Reject case</button>
                <button className={`${primaryBtn} !bg-[#16a34a] !border-[#15803d] hover:!bg-[#15803d]`} type="button">Approve case</button>
              </div>
            </div>
          </article>
        </aside>

      </section>
    </main>
  );
}
