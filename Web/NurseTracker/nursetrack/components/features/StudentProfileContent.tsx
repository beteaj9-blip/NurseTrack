"use client";

import React from "react";
import Link from "next/link";

export function StudentProfileContent() {
  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)] grid content-start gap-6">
      
      {/* Hero Card */}
      <section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          
          {/* Avatar */}
          <div className="w-[72px] h-[72px] rounded-full bg-[#ffc107] text-[#111827] flex items-center justify-center text-[1.4rem] font-[900] shrink-0">
            MC
          </div>

          {/* Name / Section / Badges */}
          <div className="flex-1 min-w-0">
            <h2 className="text-[1.6rem] font-[900] text-[#111827] m-0 mb-1 leading-[1.2]">Maria Cruz</h2>
            <p className="text-[#64748b] text-[0.9rem] font-bold m-0 mb-3">BSN 3A</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#e9f8ef] text-[#03703c] text-[0.75rem] font-[800]">Active account</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#fff8e1] text-[#6c4c00] text-[0.75rem] font-[800]">Profile 92%</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
            <button
              type="button"
              className="inline-flex items-center justify-center min-h-[38px] px-4 rounded-lg border border-[#e2e8f0] bg-white text-[#344054] text-[0.84rem] font-[800] hover:bg-[#f8fafc] hover:border-[#cbd5e1] transition-all"
              onClick={() => navigator.clipboard?.writeText("12-3456-789")}
            >
              Copy ID
            </button>
            <Link
              href="/nursing-student/profile/edit"
              className="inline-flex items-center justify-center min-h-[38px] px-4 rounded-lg bg-[#8A252C] border border-[#8A252C] text-white text-[0.84rem] font-[800] hover:bg-[#681920] transition-colors no-underline"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* Profile Information */}
        <section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 mb-6 pb-5 border-b border-[#e5eaf1]">
            <h3 className="text-[1.05rem] font-[800] text-[#111827] m-0">Profile Information</h3>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#e9f8ef] text-[#03703c] text-[0.75rem] font-[800]">Verified</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="border border-[#e2e8f0] rounded-lg p-4">
              <p className="text-[#64748b] text-[0.7rem] font-[800] uppercase tracking-wider m-0 mb-1">Full Name</p>
              <p className="text-[#111827] text-[0.95rem] font-bold m-0">Maria Cruz</p>
            </div>
            <div className="border border-[#e2e8f0] rounded-lg p-4">
              <p className="text-[#64748b] text-[0.7rem] font-[800] uppercase tracking-wider m-0 mb-1">School ID Number</p>
              <p className="text-[#111827] text-[0.95rem] font-bold m-0">12-3456-789</p>
            </div>
            <div className="border border-[#e2e8f0] rounded-lg p-4">
              <p className="text-[#64748b] text-[0.7rem] font-[800] uppercase tracking-wider m-0 mb-1">School Email</p>
              <p className="text-[#111827] text-[0.95rem] font-bold m-0">maria.cruz@cit.edu</p>
            </div>
            <div className="border border-[#e2e8f0] rounded-lg p-4">
              <p className="text-[#64748b] text-[0.7rem] font-[800] uppercase tracking-wider m-0 mb-1">Mobile Number</p>
              <p className="text-[#111827] text-[0.95rem] font-bold m-0">+63 917 000 1234</p>
            </div>
          </div>
        </section>

        {/* Account Status */}
        <section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 mb-6 pb-5 border-b border-[#e5eaf1]">
            <h3 className="text-[1.05rem] font-[800] text-[#111827] m-0">Account Status</h3>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#e9f8ef] text-[#03703c] text-[0.75rem] font-[800]">Active</span>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[#64748b] text-[0.85rem] font-bold">Role</span>
              <span className="text-[#111827] text-[0.85rem] font-bold">Nursing Student</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#64748b] text-[0.85rem] font-bold">Last login</span>
              <span className="text-[#111827] text-[0.85rem] font-bold">Apr 26, 2026 – 8:24 AM</span>
            </div>

            <div className="mt-2 px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-[#64748b] text-[0.85rem] font-semibold">
              Student profile loaded.
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
