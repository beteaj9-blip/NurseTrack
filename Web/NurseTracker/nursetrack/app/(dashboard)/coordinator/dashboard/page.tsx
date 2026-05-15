import React from "react";
import Link from "next/link";

export default function CoordinatorDashboard() {
  return (
    <main className="p-[clamp(24px,4vw,42px)] content-start">

      {/* Hero */}
      <section className="flex items-center justify-between gap-7 p-[clamp(24px,4vw,34px)] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] animate-[fadeUp_520ms_ease_both]">
        <div>
          <h2 className="mb-2 !text-[clamp(1.55rem,3vw,2.15rem)] !font-[800] !text-[#111827]">
            Good Evening, Santos.
          </h2>
          <p className="max-w-[650px] mb-0 text-[#64748b] font-semibold leading-relaxed">
            Welcome back! Prepare schedules and review page permissions for Chair support.
          </p>
        </div>
        <Link
          href="/coordinator/schedules"
          className="inline-flex items-center justify-center min-w-[180px] h-[46px] px-6 rounded-lg bg-[#8A252C] !text-white !font-[800] text-[0.95rem] whitespace-nowrap shadow-[0_12px_24px_rgba(138,37,44,0.22)] hover:bg-[#6d1d23] transition-colors no-underline"
        >
          Open schedules
        </Link>
      </section>

      {/* Dashboard Stats */}
      <section className="flex justify-between gap-6 mt-[18px] max-[780px]:flex-col" aria-label="Chair dashboard summary">

        {/* Card 1 */}
        <article className="relative overflow-hidden z-0 flex-1 p-[1.6rem_1.75rem] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] animate-[fadeUp_620ms_160ms_ease_both]">
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-[#fdf2f2] z-0"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <span className="flex items-center justify-center w-[46px] h-[46px] rounded-[0.5rem] bg-[#fdf2f2] text-[#8a252c]" aria-label="Appeal recommendations">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[24px] h-[24px] fill-none stroke-current stroke-[2] stroke-linecap-round stroke-linejoin-round">
                  <path d="M4 5h16v11H8l-4 4V5Z"></path>
                  <path d="M8 9h8"></path>
                  <path d="M8 13h5"></path>
                  <path d="m15 17 2 2 4-5"></path>
                </svg>
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#fff8e1] !text-[#6c4c00] !text-[0.76rem] !font-[800] whitespace-nowrap">
                Pending
              </span>
            </div>

            <h3 className="m-0 mb-1 !text-[1.12rem] !font-[800] !text-[#111827]">Appeal Recommendations</h3>
            <p className="m-0 mb-5 !text-[0.85rem] font-bold !text-[#64748b]">3 student appeals are waiting for Chair approval</p>

            <div className="w-full h-[6px] bg-[#dadde0] rounded-full overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-[#8a252c] to-[#ffc107] rounded-full" style={{ width: '60%' }}></div>
            </div>
            <strong className="block !text-[1.75rem] !font-[900] !text-[#8a252c] leading-none mt-1">3</strong>
          </div>
        </article>

        {/* Card 2 */}
        <article className="relative overflow-hidden z-0 flex-1 p-[1.6rem_1.75rem] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] animate-[fadeUp_620ms_260ms_ease_both]">
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-[#fdf2f2] z-0"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <span className="flex items-center justify-center w-[46px] h-[46px] rounded-[0.5rem] bg-[#fdf2f2] text-[#8a252c]" aria-label="Schedules today">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[24px] h-[24px] fill-none stroke-current stroke-[2] stroke-linecap-round stroke-linejoin-round">
                  <path d="M8 2v4"></path>
                  <path d="M16 2v4"></path>
                  <path d="M3 10h18"></path>
                  <path d="M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z"></path>
                </svg>
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#e9f8ef] !text-[#03703c] !text-[0.76rem] !font-[800] whitespace-nowrap">
                Today
              </span>
            </div>

            <h3 className="m-0 mb-1 !text-[1.12rem] !font-[800] !text-[#111827]">Schedules Today</h3>
            <p className="m-0 mb-5 !text-[0.85rem] font-bold !text-[#64748b]">5 clinical duty schedules are active today</p>

            <div className="w-full h-[6px] bg-[#dadde0] rounded-full overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-[#8a252c] to-[#ffc107] rounded-full" style={{ width: '72%' }}></div>
            </div>
            <strong className="block !text-[1.75rem] !font-[900] !text-[#8a252c] leading-none mt-1">5</strong>
          </div>
        </article>

      </section>
    </main>
  );
}
