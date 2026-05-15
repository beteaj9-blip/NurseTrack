"use client";

import React from "react";
import Link from "next/link";

export function ManualBackupReviewContent({ basePath }: { basePath: string }) {
  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]">
      <section className="flex flex-col gap-[1.25rem]">
        <article className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem] bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(255,255,255,1))]">
          <div className="flex items-center justify-between gap-4 mb-[1.1rem] pb-0 border-b border-[#e5eaf1] flex-wrap">
            <div>
              <h2 className="m-0 !text-[#111827] !text-[1.15rem] leading-[1.2] !font-bold tracking-[-0.03em]">Manual Backup</h2>
            </div>
          </div>

          <div className="flex items-center p-[1.25rem_1.5rem] bg-white border border-[#e2e8f0] rounded-lg m-0">
            <div className="shrink-0 bg-[#ffc107] !text-[#111827] w-[44px] min-w-[44px] h-[44px] min-h-[44px] rounded-full flex items-center justify-center !font-[800] mr-[1.25rem] !text-[1.1rem]">PR</div>
            <div className="flex-1 flex flex-col gap-[0.25rem]">
              <strong className="!text-[1.1rem] !color-[#0f172a]">Patricia Reyes, RN, MAN</strong>
              <p className="m-0 !text-[#64748b] !text-[0.875rem]">4 encoded attendance records - 2 pending</p>
            </div>
          </div>
        </article>

        <section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem] bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(255,255,255,1))]">
          <div className="flex items-center justify-between gap-4 mb-[1.1rem] pb-0 border-b border-[#e5eaf1] flex-wrap">
            <div>
              <h2 className="m-0 !text-[#111827] !text-[1.15rem] leading-[1.2] !font-bold tracking-[-0.03em]">Records Awaiting Review</h2>
            </div>
            <span className="inline-flex items-center justify-start w-max max-w-full min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#fff8e1] !text-[#6c4c00]">2 pending</span>
          </div>

          <div className="flex flex-col border border-[#e2e8f0] rounded-lg overflow-hidden bg-white">
            <Link className="flex items-center w-full text-left p-[1rem_1.5rem] border-b border-[#e2e8f0] hover:bg-[#f8fafc] no-underline text-inherit last:border-b-0 cursor-pointer transition-colors duration-200" href={`${basePath}/manual-backup/review/detail`}>
              <span className="shrink-0 bg-[#ffc107] !text-[#111827] w-[34px] h-[34px] rounded-full flex items-center justify-center !font-[700] !text-[0.85rem] mr-[1.25rem]">PR</span>
              <span className="flex-1 flex flex-col gap-[0.2rem]">
                <strong className="!text-[#0f172a] !font-bold">May 8, 2026 Attendance</strong>
                <small className="!text-[#64748b] !text-[0.85rem]">CCMC - Emergency Room - 07:00 AM - 03:00 PM</small>
                <small className="!text-[#64748b] !text-[0.85rem]">Encoded May 8, 2026, 3:30 PM</small>
              </span>
              <span className="ml-[1rem]">
                <mark className="inline-flex items-center justify-start w-max max-w-full min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#fff8e1] !text-[#6c4c00]">Pending Review</mark>
              </span>
            </Link>
            <Link className="flex items-center w-full text-left p-[1rem_1.5rem] border-b border-[#e2e8f0] hover:bg-[#f8fafc] no-underline text-inherit last:border-b-0 cursor-pointer transition-colors duration-200" href={`${basePath}/manual-backup/review/detail`}>
              <span className="shrink-0 bg-[#ffc107] !text-[#111827] w-[34px] h-[34px] rounded-full flex items-center justify-center !font-[700] !text-[0.85rem] mr-[1.25rem]">PR</span>
              <span className="flex-1 flex flex-col gap-[0.2rem]">
                <strong className="!text-[#0f172a] !font-bold">May 6, 2026 Attendance</strong>
                <small className="!text-[#64748b] !text-[0.85rem]">CCMC - Delivery Room - 07:00 AM - 03:00 PM</small>
                <small className="!text-[#64748b] !text-[0.85rem]">Encoded May 6, 2026, 6:42 PM</small>
              </span>
              <span className="ml-[1rem]">
                <mark className="inline-flex items-center justify-start w-max max-w-full min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#fff8e1] !text-[#6c4c00]">Pending Review</mark>
              </span>
            </Link>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem] bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(255,255,255,1))]">
          <div className="flex items-center justify-between gap-4 mb-[1.1rem] pb-0 border-b border-[#e5eaf1] flex-wrap">
            <div>
              <h2 className="m-0 !text-[#111827] !text-[1.15rem] leading-[1.2] !font-bold tracking-[-0.03em]">Manual Attendance Records</h2>
            </div>
            <span className="inline-flex items-center justify-start w-max max-w-full min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#e9f8ef] !text-[#03703c]">2 records</span>
          </div>

          <div className="flex flex-col border border-[#e2e8f0] rounded-lg overflow-hidden bg-white">
            <Link className="flex items-center w-full text-left p-[1rem_1.5rem] border-b border-[#e2e8f0] hover:bg-[#f8fafc] no-underline text-inherit last:border-b-0 cursor-pointer transition-colors duration-200" href={`${basePath}/manual-backup/review/detail?record=manual-attendance-approved-sample`}>
              <span className="shrink-0 bg-[#ffc107] !text-[#111827] w-[34px] h-[34px] rounded-full flex items-center justify-center !font-[700] !text-[0.85rem] mr-[1.25rem]">PR</span>
              <span className="flex-1 flex flex-col gap-[0.2rem]">
                <strong className="!text-[#0f172a] !font-bold">April 29, 2026 Attendance</strong>
                <small className="!text-[#64748b] !text-[0.85rem]">CCMC - Emergency Room - 07:00 AM - 03:00 PM</small>
                <small className="!text-[#64748b] !text-[0.85rem]">Encoded April 29, 2026, 5:36 PM</small>
              </span>
              <span className="ml-[1rem]">
                <mark className="inline-flex items-center justify-start w-max max-w-full min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#e9f8ef] !text-[#03703c]">Approved</mark>
              </span>
            </Link>
            <Link className="flex items-center w-full text-left p-[1rem_1.5rem] border-b border-[#e2e8f0] hover:bg-[#f8fafc] no-underline text-inherit last:border-b-0 cursor-pointer transition-colors duration-200" href={`${basePath}/manual-backup/review/detail?record=manual-attendance-returned-sample`}>
              <span className="shrink-0 bg-[#ffc107] !text-[#111827] w-[34px] h-[34px] rounded-full flex items-center justify-center !font-[700] !text-[0.85rem] mr-[1.25rem]">PR</span>
              <span className="flex-1 flex flex-col gap-[0.2rem]">
                <strong className="!text-[#0f172a] !font-bold">April 24, 2026 Attendance</strong>
                <small className="!text-[#64748b] !text-[0.85rem]">CCMC - Medical Ward - 07:00 AM - 03:00 PM</small>
                <small className="!text-[#64748b] !text-[0.85rem]">Encoded April 24, 2026, 4:18 PM</small>
              </span>
              <span className="ml-[1rem]">
                <mark className="inline-flex items-center justify-start w-max max-w-full min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#fef2f2] !text-[#991b1b]">Returned</mark>
              </span>
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
