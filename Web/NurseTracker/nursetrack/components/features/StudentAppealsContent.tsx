"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/core/store/authStore";

function getInitials(name?: string) {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

export function StudentAppealsContent() {
  const user = useAuthStore((state) => state.user);
  return (
    <div className="p-10 pb-12 w-full grid gap-8">

      {/* Create Appeal Form */}
      <section className="bg-white rounded-xl shadow-[0_4px_24px_rgba(32,33,36,0.04)] border border-[#e2e8f0] p-[clamp(20px,4vw,32px)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-[1.25rem] font-[800] text-[#111827] m-0">Appeal Details</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#fff8e1] text-[#6c4c00] text-[0.75rem] font-bold">
            Draft
          </span>
        </div>

        <form className="grid gap-6">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Appeal Type</label>
              <select className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] cursor-pointer shadow-sm text-[0.9rem]" defaultValue="">
                <option value="" disabled hidden>Select appeal type</option>
                <option value="attendance">Attendance</option>
                <option value="grade">Grade</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Related Duty Date</label>
              <input
                type="date"
                className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] shadow-sm text-[0.9rem]"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Clinical Site</label>
              <select className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] cursor-pointer shadow-sm text-[0.9rem]" defaultValue="">
                <option value="" disabled hidden>Select clinical site</option>
                <option value="ccmc">CCMC</option>
                <option value="vsmmc">VSMMC</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Duty Area</label>
              <select className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] cursor-pointer shadow-sm text-[0.9rem]" defaultValue="">
                <option value="" disabled hidden>Select duty area</option>
                <option value="er">Emergency Room</option>
                <option value="or">Operating Room</option>
              </select>
            </div>
          </div>

          {/* Row 3 */}
          <div className="flex flex-col">
            <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Assigned Clinical Instructor</label>
            <select className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] cursor-pointer shadow-sm text-[0.9rem]" defaultValue="">
              <option value="" disabled hidden>Select assigned CI</option>
              <option value="patricia-reyes">Patricia Reyes, RN, MAN</option>
            </select>
          </div>

          {/* Row 4 */}
          <div className="flex flex-col">
            <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Appeal Title</label>
            <input
              type="text"
              placeholder="Enter appeal title"
              className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] shadow-sm text-[0.9rem] placeholder:text-[#94a3b8]"
            />
          </div>

          {/* Row 5 */}
          <div className="flex flex-col">
            <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Student Reason</label>
            <textarea
              rows={4}
              placeholder="Explain why the appeal should be considered."
              className="w-full p-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] shadow-sm text-[0.9rem] placeholder:text-[#94a3b8] resize-y"
            ></textarea>
          </div>

          {/* Row 6 */}
          <div className="flex flex-col">
            <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Supporting Evidence or Notes</label>
            <textarea
              rows={4}
              placeholder="Add note summaries, timestamps, screenshots, or supporting document details."
              className="w-full p-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] shadow-sm text-[0.9rem] placeholder:text-[#94a3b8] resize-y"
            ></textarea>
          </div>

          {/* File Upload */}
          <div className="flex flex-col">
            <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Supporting Files</label>
            <div className="flex items-center gap-4 w-full p-3 border border-[#dbe3ee] rounded-lg bg-white shadow-sm">
              <button type="button" className="h-[36px] px-4 rounded-md border border-[#e2e8f0] bg-white text-[#344054] text-[0.85rem] font-bold shadow-sm hover:bg-[#f8fafc] transition-colors">
                Choose files
              </button>
              <span className="text-[#64748b] text-[0.85rem] font-semibold">No files selected</span>
            </div>
            <p className="mt-2 text-[#64748b] text-[0.8rem] font-semibold">Attach screenshots, PDFs, or documents that support the appeal.</p>
          </div>

          {/* Notice Block */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-4 mt-2">
            <p className="text-[#64748b] text-[0.85rem] font-semibold m-0">Complete the appeal details to submit it for CI recommendation.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-4">
            <button type="button" className="h-[42px] px-6 rounded-lg border border-[#e2e8f0] bg-white text-[#344054] text-[0.9rem] font-bold shadow-sm hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:text-[#0f172a] transition-all">
              Clear
            </button>
            <button type="button" className="h-[42px] px-6 rounded-lg bg-[#8A252C] text-white text-[0.9rem] font-bold shadow-sm hover:bg-[#681920] transition-colors">
              Submit Appeal
            </button>
          </div>
        </form>
      </section>

      {/* History Section */}
      <section className="bg-white rounded-xl shadow-[0_4px_24px_rgba(32,33,36,0.04)] border border-[#e2e8f0] p-[clamp(20px,4vw,32px)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-[1.25rem] font-[800] text-[#111827] m-0">{user?.fullName ?? 'My'} Appeal History</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#e9f8ef] text-[#03703c] text-[0.75rem] font-bold whitespace-nowrap">
            2 records
          </span>
        </div>

        <div className="grid gap-8">
          {/* PENDING GROUP */}
          <div>
            <div className="flex items-center justify-between border-b border-[#e5eaf1] pb-2 mb-4">
              <span className="text-[#64748b] text-[0.78rem] font-[800] tracking-wider uppercase">PENDING</span>
              <span className="text-[#64748b] text-[0.78rem] font-[800] tracking-wider uppercase">1 RECORD</span>
            </div>

            <Link href="/nursing-student/appeals/detail" className="block relative border border-[#e2e8f0] rounded-xl p-5 hover:border-[#cbd5e1] hover:shadow-md transition-all cursor-pointer no-underline bg-white">
              <div className="flex items-start gap-4">
                <div className="w-[42px] h-[42px] shrink-0 bg-[#ffc107] text-[#111827] rounded-full flex items-center justify-center font-[800] text-[0.95rem] mt-1">
                  {getInitials(user?.fullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-1">
                    <h3 className="text-[1.1rem] font-[800] text-[#111827] m-0 leading-[1.3] truncate">Late arrival due to bus delay</h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#fff8e1] text-[#6c4c00] text-[0.75rem] font-bold shrink-0">
                      Pending
                    </span>
                  </div>
                  <p className="text-[#344054] text-[0.9rem] font-bold m-0 mb-1.5 truncate">
                    Attendance - April 29, 2026 - CCMC
                  </p>
                  <p className="text-[#64748b] text-[0.85rem] font-semibold m-0 truncate">
                    Submitted today, 7:48 AM - 2 files attached
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* ACCEPTED GROUP */}
          <div>
            <div className="flex items-center justify-between border-b border-[#e5eaf1] pb-2 mb-4">
              <span className="text-[#64748b] text-[0.78rem] font-[800] tracking-wider uppercase">ACCEPTED</span>
              <span className="text-[#64748b] text-[0.78rem] font-[800] tracking-wider uppercase">1 RECORD</span>
            </div>

            <Link href="/nursing-student/appeals/detail" className="block relative border border-[#e2e8f0] rounded-xl p-5 hover:border-[#cbd5e1] hover:shadow-md transition-all cursor-pointer no-underline bg-white">
              <div className="flex items-start gap-4">
                <div className="w-[42px] h-[42px] shrink-0 bg-[#ffc107] text-[#111827] rounded-full flex items-center justify-center font-[800] text-[0.95rem] mt-1">
                  {getInitials(user?.fullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-1">
                    <h3 className="text-[1.1rem] font-[800] text-[#111827] m-0 leading-[1.3] truncate">Excused tardiness request</h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#e9f8ef] text-[#03703c] text-[0.75rem] font-bold shrink-0">
                      Accepted
                    </span>
                  </div>
                  <p className="text-[#344054] text-[0.9rem] font-bold m-0 mb-1.5 truncate">
                    Attendance - April 12, 2026 - CCMC
                  </p>
                  <p className="text-[#64748b] text-[0.85rem] font-semibold m-0 truncate">
                    Submitted April 12, 2026, 8:04 AM - 1 file attached
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
