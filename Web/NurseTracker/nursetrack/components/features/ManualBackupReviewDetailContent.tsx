import React from "react";
import Link from "next/link";

export async function ManualBackupReviewDetailContent({ basePath, searchParams: searchParamsPromise }: { basePath: string, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await searchParamsPromise;
  const isApproved = searchParams.record === 'manual-attendance-approved-sample';
  const isReturned = searchParams.record === 'manual-attendance-returned-sample';
  const isPending = !isApproved && !isReturned;

  const getDateHeader = () => {
    if (isApproved) return 'April 29, 2026 Attendance';
    if (isReturned) return 'April 24, 2026 Attendance';
    return 'May 8, 2026 Attendance';
  };

  const getEncodedStr = () => {
    if (isApproved) return 'Encoded April 29, 2026, 5:36 PM';
    if (isReturned) return 'Encoded April 24, 2026, 4:18 PM';
    return 'Encoded May 8, 2026, 3:30 PM';
  };

  const getDutyDate = () => {
    if (isApproved) return 'April 29, 2026';
    if (isReturned) return 'April 24, 2026';
    return 'May 8, 2026';
  };

  const getReviewStatus = () => {
    if (isApproved) return 'Approved by Reyes, Chair on April 30, 2026, 9:10 AM.';
    if (isReturned) return 'Returned by Reyes, Chair on April 25, 2026, 8:05 AM.';
    return 'Awaiting Chair or Admin review.';
  };

  const getInstructorNote = () => {
    if (isApproved) return 'Backup record matched the CI logbook and duty roster.';
    if (isReturned) return 'Record rejected. Please re-verify the check-in times for your students against the ward logbook.';
    return 'Manual attendance encoded because the CI phone was unavailable during the duty shift.';
  };

  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]">
      <section className="flex flex-col gap-[1.25rem]">
        <article className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem] bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(255,255,255,1))]">
          <div className="flex items-center justify-between gap-4 mb-[1.1rem] pb-0 border-b border-[#e5eaf1] flex-wrap">
            <div>
              <h2 className="m-0 !text-[#111827] !text-[1.15rem] leading-[1.2] !font-bold tracking-[-0.03em]">{getDateHeader()}</h2>
            </div>
          </div>

          <div className="flex items-center p-[1.25rem_1.5rem] bg-white border border-[#e2e8f0] rounded-lg m-0">
            <div className="shrink-0 bg-[#ffc107] !text-[#111827] w-[44px] min-w-[44px] h-[44px] min-h-[44px] rounded-full flex items-center justify-center !font-[800] mr-[1.25rem] !text-[1.1rem]">PR</div>
            <div className="flex-1 flex flex-col gap-[0.25rem]">
              <strong className="!text-[1.1rem] !text-[#0f172a]">{isReturned ? 'CCMC - Medical Ward' : 'CCMC - Emergency Room'}</strong>
              <p className="m-0 !text-[#64748b] !text-[0.875rem]">{getEncodedStr()}</p>
            </div>
            {isApproved && <span className="inline-flex items-center justify-start w-max max-w-full min-h-[28px] px-[0.8rem] py-[0.4rem] rounded-full !text-[0.8rem] !font-bold whitespace-nowrap bg-[#e9f8ef] !text-[#03703c]">Approved</span>}
            {isReturned && <span className="inline-flex items-center justify-start w-max max-w-full min-h-[28px] px-[0.8rem] py-[0.4rem] rounded-full !text-[0.8rem] !font-bold whitespace-nowrap bg-[#fef2f2] !text-[#991b1b]">Returned</span>}
            {isPending && <span className="inline-flex items-center justify-start w-max max-w-full min-h-[28px] px-[0.8rem] py-[0.4rem] rounded-full !text-[0.8rem] !font-bold whitespace-nowrap bg-[#fff8e1] !text-[#6c4c00]">Pending Review</span>}
          </div>
        </article>

        <section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem] bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(255,255,255,1))]">
          <div className="flex items-center justify-between gap-4 mb-[1.1rem] pb-0 border-b border-[#e5eaf1] flex-wrap">
            <div>
              <h2 className="m-0 !text-[#111827] !text-[1.15rem] leading-[1.2] !font-bold tracking-[-0.03em]">Record Details</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[1rem] mb-[1.5rem]">
            <div className="flex flex-col gap-[0.25rem] bg-[#f8fafc] border border-[#e2e8f0] rounded-md p-[1rem_1.25rem]">
              <span className="!text-[#64748b] !text-[0.75rem] uppercase !font-[700] tracking-[0.05em]">Duty Date</span>
              <strong className="!text-[#0f172a] !text-[0.95rem]">{getDutyDate()}</strong>
            </div>
            <div className="flex flex-col gap-[0.25rem] bg-[#f8fafc] border border-[#e2e8f0] rounded-md p-[1rem_1.25rem]">
              <span className="!text-[#64748b] !text-[0.75rem] uppercase !font-[700] tracking-[0.05em]">Shift Time</span>
              <strong className="!text-[#0f172a] !text-[0.95rem]">07:00 AM - 03:00 PM</strong>
            </div>
            <div className="flex flex-col gap-[0.25rem] bg-[#f8fafc] border border-[#e2e8f0] rounded-md p-[1rem_1.25rem]">
              <span className="!text-[#64748b] !text-[0.75rem] uppercase !font-[700] tracking-[0.05em]">Encoded By</span>
              <strong className="!text-[#0f172a] !text-[0.95rem]">Patricia Reyes, RN, MAN</strong>
            </div>
            <div className="flex flex-col gap-[0.25rem] bg-[#f8fafc] border border-[#e2e8f0] rounded-md p-[1rem_1.25rem]">
              <span className="!text-[#64748b] !text-[0.75rem] uppercase !font-[700] tracking-[0.05em]">Review Status</span>
              <strong className="!text-[#0f172a] !text-[0.95rem]">{getReviewStatus()}</strong>
            </div>
            <div className="col-span-full flex flex-col gap-[0.25rem] bg-[#f8fafc] border border-[#e2e8f0] rounded-md p-[1rem_1.25rem]">
              <span className="!text-[#64748b] !text-[0.75rem] uppercase !font-[700] tracking-[0.05em]">Instructor Note</span>
              <strong className="!text-[#0f172a] !text-[0.95rem]">{getInstructorNote()}</strong>
            </div>
          </div>

          <div className="flex flex-col border border-[#e2e8f0] rounded-lg overflow-x-auto mb-[1.5rem]" role="table" aria-label="Manual attendance student records">
            <div className="min-w-[600px] grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] p-[1rem_1.5rem] border-b border-[#e2e8f0] items-center bg-[#f8fafc] !font-[700] !text-[#4c5d7d] !text-[0.75rem] uppercase" role="row">
              <span role="columnheader">Student</span>
              <span role="columnheader">Section / ID</span>
              <span role="columnheader">Status</span>
              <span role="columnheader">Check-in</span>
              <span role="columnheader">Check-out</span>
            </div>
            
            <div className="min-w-[600px] grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] p-[1rem_1.5rem] border-b border-[#e2e8f0] items-center text-[0.9rem] last:border-b-0" role="row">
              <span role="cell" className="flex items-center gap-[0.75rem]">
                <span className="shrink-0 bg-[#ffc107] !text-[#111827] w-[32px] h-[32px] rounded-full flex items-center justify-center !font-[700] !text-[0.8rem]">MC</span>
                <strong className="!text-[#0f172a]">Maria Cruz</strong>
              </span>
              <span role="cell">BSN 3A - 12-3456-789</span>
              <span role="cell">Present</span>
              <span role="cell">{isApproved ? '6:57 AM' : '06:54 AM'}</span>
              <span role="cell">{isApproved ? '3:03 PM' : '03:05 PM'}</span>
            </div>
            
            {!isApproved && (
              <div className="min-w-[600px] grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] p-[1rem_1.5rem] border-b border-[#e2e8f0] items-center text-[0.9rem] last:border-b-0" role="row">
                <span role="cell" className="flex items-center gap-[0.75rem]">
                  <span className="shrink-0 bg-[#ffc107] !text-[#111827] w-[32px] h-[32px] rounded-full flex items-center justify-center !font-[700] !text-[0.8rem]">JA</span>
                  <strong className="!text-[#0f172a]">Josh Anton Nuevas</strong>
                </span>
                <span role="cell">BSN 3A - 21-5589-201</span>
                <span role="cell">Present</span>
                <span role="cell">07:02 AM</span>
                <span role="cell">03:00 PM</span>
              </div>
            )}
          </div>

          <div className="flex gap-[1rem] justify-end items-center">
            <Link href={`${basePath}/manual-backup/review`} className="inline-flex items-center justify-center w-auto min-h-[48px] px-[1.5rem] rounded-[10px] bg-white border border-[#e2e8f0] !text-[#334155] !text-[0.95rem] tracking-[-0.01em] !font-extrabold hover:bg-[#f8fafc] transition-colors cursor-pointer no-underline">
              Return Record
            </Link>
            {isPending && (
              <Link href={`${basePath}/manual-backup/review`} className="inline-flex items-center justify-center w-auto min-h-[48px] px-[1.5rem] rounded-[10px] bg-[#8A252C] !text-white !text-[0.95rem] tracking-[-0.01em] !font-extrabold shadow-[0_8px_16px_-4px_rgba(138,37,44,0.4)] hover:bg-[#6d1d23] transition-all cursor-pointer no-underline">
                Approve Record
              </Link>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
