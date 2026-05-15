import React from "react";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <main className="p-[clamp(24px,4vw,42px)] content-start">

      {/* Hero */}
      <section className="flex items-center justify-between gap-7 p-[clamp(24px,4vw,34px)] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] animate-[fadeUp_520ms_ease_both]">
        <div>
          <h2 className="mb-2 !text-[clamp(1.55rem,3vw,2.15rem)] font-bold text-[#111827]">
            Good Evening, Santos.
          </h2>
          <p className="max-w-[650px] mb-0 text-[#64748b] font-semibold leading-relaxed">
            Welcome back! Here is an overview of system setup, and recent audit activity.
          </p>
        </div>
        <Link
          href="/admin/section-import"
          className="inline-flex items-center justify-center min-w-[180px] h-[46px] px-6 rounded-lg bg-[#8A252C] !text-white font-bold text-[0.95rem] whitespace-nowrap shadow-[0_12px_24px_rgba(138,37,44,0.22)] hover:bg-[#6d1d23] transition-colors no-underline"
        >
          Upload Section File
        </Link>
      </section>

      {/* Recent System Activity */}
      <section className="mt-[18px] p-6 rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] animate-[fadeUp_620ms_160ms_ease_both]">

        {/* Panel heading */}
        <div className="flex justify-between items-start gap-[22px] mb-5">
          <h2 className="text-[1.24rem] font-bold text-[#111827] m-0">Recent System Activity</h2>
          <span className="inline-flex items-center shrink-0 mt-0.5 px-[10px] py-[6px] rounded-full bg-[#e9f8ef] text-[#078033] text-[0.76rem] font-extrabold whitespace-nowrap">
            Live logs
          </span>
        </div>

        {/* Audit log items */}
        <div className="grid gap-3">

          {/* Row 1 */}
          <div className="grid grid-cols-[minmax(180px,0.9fr)_minmax(220px,1.1fr)_minmax(190px,0.8fr)_auto] items-center gap-4 px-[1.15rem] py-4 border border-[#e2e8f0] rounded-[0.9rem] bg-white max-[1000px]:grid-cols-1 max-[1000px]:gap-[0.45rem]">
            <div>
              <strong className="block text-[#111827] text-[0.95rem] font-bold leading-snug">Chair Reyes</strong>
              <span className="text-[#4c5d7d] text-[0.88rem] font-bold leading-snug">Chair</span>
            </div>
            <span className="text-[#4c5d7d] text-[0.88rem] font-bold">Published schedule</span>
            <span className="text-[#4c5d7d] text-[0.88rem] font-bold">Pedia Pulmo Ward Rotation</span>
            <small className="text-[#64748b] text-[0.8rem] font-bold whitespace-nowrap">May 1, 2026 - 09:20 AM</small>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-[minmax(180px,0.9fr)_minmax(220px,1.1fr)_minmax(190px,0.8fr)_auto] items-center gap-4 px-[1.15rem] py-4 border border-[#e2e8f0] rounded-[0.9rem] bg-white max-[1000px]:grid-cols-1 max-[1000px]:gap-[0.45rem]">
            <div>
              <strong className="block text-[#111827] text-[0.95rem] font-bold leading-snug">Patricia Reyes, RN, MAN</strong>
              <span className="text-[#4c5d7d] text-[0.88rem] font-bold leading-snug">Clinical Instructor</span>
            </div>
            <span className="text-[#4c5d7d] text-[0.88rem] font-bold">Approved clinical case</span>
            <span className="text-[#4c5d7d] text-[0.88rem] font-bold">Maria Cruz</span>
            <small className="text-[#64748b] text-[0.8rem] font-bold whitespace-nowrap">Apr 30, 2026 - 04:35 PM</small>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-[minmax(180px,0.9fr)_minmax(220px,1.1fr)_minmax(190px,0.8fr)_auto] items-center gap-4 px-[1.15rem] py-4 border border-[#e2e8f0] rounded-[0.9rem] bg-white max-[1000px]:grid-cols-1 max-[1000px]:gap-[0.45rem]">
            <div>
              <strong className="block text-[#111827] text-[0.95rem] font-bold leading-snug">Chair Reyes</strong>
              <span className="text-[#4c5d7d] text-[0.88rem] font-bold leading-snug">Chair</span>
            </div>
            <span className="text-[#4c5d7d] text-[0.88rem] font-bold">Approved appeal</span>
            <span className="text-[#4c5d7d] text-[0.88rem] font-bold">Treasure Abadinas</span>
            <small className="text-[#64748b] text-[0.8rem] font-bold whitespace-nowrap">Apr 30, 2026 - 03:22 PM</small>
          </div>
        </div>

        {/* Footer link */}
        <div className="flex justify-end mt-4">
          <Link
            href="/admin/audit-logs"
            className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-lg border border-[#e2e8f0] bg-white text-[#334155] text-sm font-bold hover:bg-[#f8fafc] transition-colors no-underline"
          >
            Open Audit Logs
          </Link>
        </div>
      </section>
    </main>
  );
}
