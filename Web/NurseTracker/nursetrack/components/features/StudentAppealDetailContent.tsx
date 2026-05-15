"use client";

import React from "react";
import Link from "next/link";

export function StudentAppealDetailContent() {
  return (
    <div className="p-10 pb-12 w-full grid gap-6">

      {/* Main Detail Card */}
      <section className="bg-white rounded-xl shadow-[0_4px_24px_rgba(32,33,36,0.04)] border border-[#e2e8f0] p-6 sm:p-8">

        {/* Header Info */}
        <div className="mb-6 border-b border-[#e5eaf1] pb-6">
          <p className="text-[#8A252C] text-[0.7rem] font-[900] tracking-wider uppercase m-0 mb-1">
            BSN 3A - 12-3456-789
          </p>
          <h2 className="text-[1.3rem] font-[800] text-[#111827] m-0">
            Maria Cruz's Appeal History
          </h2>
        </div>

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
          <h3 className="text-[1.15rem] font-[800] text-[#111827] m-0 leading-[1.3]">
            Late arrival due to bus delay
          </h3>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#fff8e1] text-[#6c4c00] text-[0.75rem] font-bold shrink-0">
            Pending
          </span>
        </div>

        <p className="text-[#344054] text-[0.85rem] font-bold m-0 mb-6 flex flex-wrap items-center gap-3">
          Submitted today, 7:48 AM <span className="font-semibold text-[#64748b]">Assigned CI: Patricia Reyes, RN, MAN</span>
        </p>

        {/* 4-Column Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl mb-6 divide-y sm:divide-y-0 lg:divide-x divide-[#e2e8f0]">
          <div className="p-4 px-5">
            <span className="block text-[#64748b] text-[0.65rem] font-[800] uppercase tracking-wider mb-1">Appeal Type</span>
            <strong className="text-[#111827] text-[0.9rem] font-bold">Attendance</strong>
          </div>
          <div className="p-4 px-5 sm:border-l border-[#e2e8f0] lg:border-none">
            <span className="block text-[#64748b] text-[0.65rem] font-[800] uppercase tracking-wider mb-1">Related Duty Date</span>
            <strong className="text-[#111827] text-[0.9rem] font-bold">April 29, 2026</strong>
          </div>
          <div className="p-4 px-5">
            <span className="block text-[#64748b] text-[0.65rem] font-[800] uppercase tracking-wider mb-1">Clinical Site</span>
            <strong className="text-[#111827] text-[0.9rem] font-bold">CCMC</strong>
          </div>
          <div className="p-4 px-5 sm:border-l border-[#e2e8f0] lg:border-none">
            <span className="block text-[#64748b] text-[0.65rem] font-[800] uppercase tracking-wider mb-1">Duty Area</span>
            <strong className="text-[#111827] text-[0.9rem] font-bold">Emergency Room</strong>
          </div>
        </div>

        {/* Details Blocks */}
        <div className="grid gap-3 mb-8">

          <div className="border border-[#e2e8f0] border-l-[4px] border-l-[#ffc107] rounded-lg bg-[#f8fafc] p-4 pl-5">
            <span className="block text-[#8A252C] text-[0.7rem] font-[900] uppercase tracking-wider mb-1.5">Student Reason</span>
            <p className="m-0 text-[#111827] text-[0.9rem] font-semibold leading-[1.5]">
              CIT-U shuttle was delayed after traffic rerouting near the hospital entrance.
            </p>
          </div>

          <div className="border border-[#e2e8f0] border-l-[4px] border-l-[#ffc107] rounded-lg bg-[#f8fafc] p-4 pl-5">
            <span className="block text-[#8A252C] text-[0.7rem] font-[900] uppercase tracking-wider mb-1.5">Supporting Evidence or Notes</span>
            <p className="m-0 text-[#111827] text-[0.9rem] font-semibold leading-[1.5]">
              Transport advisory and timestamped arrival photo were attached.
            </p>
          </div>

          <div className="border border-[#e2e8f0] border-l-[4px] border-l-[#ffc107] rounded-lg bg-[#f8fafc] p-4 pl-5">
            <span className="block text-[#8A252C] text-[0.7rem] font-[900] uppercase tracking-wider mb-1.5">Supporting Files</span>
            <p className="m-0 text-[#111827] text-[0.9rem] font-semibold leading-[1.5]">
              transport-advisory.pdf, arrival-photo.jpg
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end border-t border-[#e5eaf1] pt-6">
          <button type="button" className="h-[42px] px-6 rounded-lg border border-[#e2e8f0] bg-white text-[#344054] text-[0.9rem] font-bold shadow-sm hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:text-[#0f172a] transition-all">
            Edit Appeal
          </button>
        </div>

      </section>

    </div>
  );
}
