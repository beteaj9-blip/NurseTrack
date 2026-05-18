"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/core/store/authStore";
import { useStudentCases } from "@/core/api/hooks/useClinicalCases";
import { useSchedules } from "@/core/api/hooks/useSchedules";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

function getFirstName(fullName?: string) {
  return fullName?.split(" ")[0] || "there";
}

function getLocalDateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function NursingStudentDashboard() {
  const user = useAuthStore((state) => state.user);
  const { data: cases } = useStudentCases();
  const { data: schedules } = useSchedules(undefined, user?.role);

  // Compute stats from live data
  const pendingCases = cases?.filter((c: any) => c.status === "PENDING")?.length ?? 0;
  const today = getLocalDateString(new Date());
  const todaySchedule = schedules?.find((s: any) => s.date === today);

  return (
    <main className="p-[clamp(24px,4vw,42px)] content-start">
      {/* Hero */}
      <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-7 p-[clamp(24px,4vw,34px)] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] animate-[fadeUp_520ms_ease_both]">
        <div>
          <h2 className="mb-2 !text-[clamp(1.55rem,3vw,2.15rem)] !font-[800] !text-[#111827] m-0">
            {getGreeting()}, {getFirstName(user?.fullName)}.
          </h2>
          <p className="max-w-[650px] m-0 text-[#64748b] font-semibold leading-relaxed">
            Welcome back! Here is a quick look at your clinical schedule and progress.
          </p>
        </div>
        <Link
          href="/nursing-student/schedules"
          className="inline-flex items-center justify-center min-w-[180px] h-[46px] px-6 rounded-lg bg-[#8A252C] !text-white !font-[800] text-[0.95rem] whitespace-nowrap shadow-[0_12px_24px_rgba(138,37,44,0.22)] hover:bg-[#6d1d23] transition-colors no-underline"
        >
          View schedule
        </Link>
      </section>

      {/* Dashboard Stats */}
      <section className="flex justify-between gap-6 mt-[18px] max-[780px]:flex-col" aria-label="Student dashboard summary">
        {/* Card 1 — Today's schedule */}
        <article className="relative overflow-hidden z-0 flex-1 p-[1.6rem_1.75rem] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] animate-[fadeUp_620ms_160ms_ease_both]">
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-[#fdf2f2] z-0"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <span className="flex items-center justify-center w-[46px] h-[46px] rounded-[0.5rem] bg-[#fdf2f2] text-[#8a252c]" aria-label="Schedule today">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[24px] h-[24px] fill-none stroke-current stroke-[2] stroke-linecap-round stroke-linejoin-round">
                  <path d="M8 2v4"></path><path d="M16 2v4"></path><path d="M3 10h18"></path>
                  <path d="M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z"></path>
                </svg>
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#fff8e1] !text-[#6c4c00] !text-[0.76rem] !font-[800] whitespace-nowrap">
                Today
              </span>
            </div>

            {todaySchedule ? (
              <>
                <h3 className="m-0 mb-1 !text-[1.12rem] !font-[800] !text-[#111827]">You Have a Schedule Today</h3>
                <p className="m-0 mb-5 !text-[0.85rem] font-bold !text-[#64748b]">
                  {todaySchedule.area} at {todaySchedule.hospital}
                </p>
                <div className="w-full h-[6px] bg-[#dadde0] rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-[#FFCF01] rounded-full" style={{ width: "100%" }}></div>
                </div>
                <strong className="block !text-[1.75rem] !font-[900] !text-[#8a252c] leading-none mt-1">
                  {todaySchedule.startTime}
                </strong>
              </>
            ) : (
              <>
                <h3 className="m-0 mb-1 !text-[1.12rem] !font-[800] !text-[#111827]">No Schedule Today</h3>
                <p className="m-0 mb-5 !text-[0.85rem] font-bold !text-[#64748b]">No duty assigned for today.</p>
                <div className="w-full h-[6px] bg-[#dadde0] rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-[#dadde0] rounded-full" style={{ width: "0%" }}></div>
                </div>
                <strong className="block !text-[1.75rem] !font-[900] !text-[#94a3b8] leading-none mt-1">—</strong>
              </>
            )}
          </div>
        </article>

        {/* Card 2 — Pending items */}
        <article className="relative overflow-hidden z-0 flex-1 p-[1.6rem_1.75rem] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] animate-[fadeUp_620ms_260ms_ease_both]">
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-[#fdf2f2] z-0"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <span className="flex items-center justify-center w-[46px] h-[46px] rounded-[0.5rem] bg-[#fdf2f2] text-[#8a252c]" aria-label="Pending items">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[24px] h-[24px] fill-none stroke-current stroke-[2] stroke-linecap-round stroke-linejoin-round">
                  <path d="M12 8v5"></path><path d="M12 17h.01"></path>
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                </svg>
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#fff8e1] !text-[#6c4c00] !text-[0.76rem] !font-[800] whitespace-nowrap">
                Open
              </span>
            </div>

            <h3 className="m-0 mb-1 !text-[1.12rem] !font-[800] !text-[#111827]">Pending Clinical Cases</h3>
            <p className="m-0 mb-5 !text-[0.85rem] font-bold !text-[#64748b]">
              {pendingCases > 0
                ? `${pendingCases} case${pendingCases !== 1 ? "s" : ""} still need${pendingCases === 1 ? "s" : ""} instructor validation`
                : "No pending cases — all caught up!"}
            </p>
            <div className="w-full h-[6px] bg-[#dadde0] rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-[#FFCF01] rounded-full"
                style={{ width: pendingCases > 0 ? `${Math.min((pendingCases / (cases?.length || 1)) * 100, 100)}%` : "0%" }}
              ></div>
            </div>
            <strong className="block !text-[1.75rem] !font-[900] !text-[#8a252c] leading-none mt-1">
              {pendingCases}
            </strong>
          </div>
        </article>
      </section>
    </main>
  );
}
