"use client";

import React, { useState } from "react";

export function SchedulesDayContent({ basePath }: { basePath: string }) {
  return (
    <main className="p-[clamp(24px,4vw,42px)] content-start grid gap-6 w-full">
      <section className="grid gap-6">
        
        {/* Top Info Card */}
        <article className="relative rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden bg-white">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#fffbf0,#ffffff)] pointer-events-none" />
          <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full bg-[#ffcf01]/10 blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 p-[1rem_1.5rem] pb-0">
              <h2 className="m-0 !text-[#8a252c] !text-[0.95rem] leading-[1.15] !font-black uppercase tracking-widest">
                Clinical Duty
              </h2>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center px-4 py-1.5 bg-white border border-[#e2e8f0] rounded-full !text-[#334155] !font-extrabold !text-[0.8rem]">
                  May 8, 2026
                </span>
                <span className="inline-flex items-center justify-center px-4 py-1.5 bg-[#dcfce7] rounded-full !text-[#166534] !font-extrabold !text-[0.8rem]">
                  Upcoming
                </span>
              </div>
            </div>
            
            {/* Details */}
            <div className="grid grid-cols-4 max-[980px]:grid-cols-2 max-[600px]:grid-cols-1 p-[1.5rem] gap-4">
              <div className="p-5 border border-[#e2e8f0] rounded-xl bg-white shadow-sm flex flex-col justify-center">
                <span className="!text-[#1d4ed8] !text-[0.7rem] !font-black uppercase tracking-widest mb-1.5">Hospital</span>
                <strong className="!text-[#111827] !text-[1.05rem] !font-[800]">CCMC</strong>
              </div>
              <div className="p-5 border border-[#e2e8f0] rounded-xl bg-white shadow-sm flex flex-col justify-center">
                <span className="!text-[#1d4ed8] !text-[0.7rem] !font-black uppercase tracking-widest mb-1.5">Area Of Assignment</span>
                <strong className="!text-[#111827] !text-[1.05rem] !font-[800]">Pedia Pulmo Ward</strong>
              </div>
              <div className="p-5 border border-[#e2e8f0] rounded-xl bg-white shadow-sm flex flex-col justify-center">
                <span className="!text-[#1d4ed8] !text-[0.7rem] !font-black uppercase tracking-widest mb-1.5">Shift Time</span>
                <strong className="!text-[#111827] !text-[1.05rem] !font-[800]">7:00 AM - 3:00 PM</strong>
              </div>
              <div className="p-5 border border-[#e2e8f0] rounded-xl bg-white shadow-sm flex flex-col justify-center">
                <span className="!text-[#1d4ed8] !text-[0.7rem] !font-black uppercase tracking-widest mb-1.5">Assigned Group</span>
                <strong className="!text-[#111827] !text-[1.05rem] !font-[800]">BSN 3B - Group 1</strong>
              </div>
            </div>
          </div>
        </article>

        {/* Students Table Card */}
        <article className="relative rounded-2xl border border-[#e2e8f0] bg-white shadow-sm p-[1.5rem] overflow-hidden">
          <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full bg-[#ffcf01]/5 blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
              <h3 className="m-0 !text-[#111827] !text-[1.15rem] leading-[1.2] !font-bold tracking-[-0.03em]">Assigned Students</h3>
              <span className="inline-flex items-center px-4 py-1.5 rounded-full !text-[0.8rem] !font-extrabold bg-[#fef3c7] !text-[#92400e]">6 students</span>
            </div>

            <div className="flex items-center gap-4 p-4 mb-5 bg-[#fffaf0] border border-[#fde68a] rounded-xl shadow-[0_2px_4px_rgba(251,191,36,0.05)]">
              <div className="w-[46px] h-[46px] shrink-0 rounded-full flex items-center justify-center !text-[0.95rem] !font-extrabold bg-[#ffcf01] !text-[#332800]">
                PR
              </div>
              <div>
                <strong className="block !text-[#111827] !text-[1rem] !font-[800]">Patricia Reyes, RN, MAN</strong>
                <span className="block !text-[#64748b] !text-[0.85rem] !font-semibold">Clinical Instructor handling this schedule</span>
              </div>
            </div>

            <div className="mt-2 rounded-xl overflow-hidden border border-[#e2e8f0] max-[720px]:overflow-x-auto">
              <table className="w-full border-collapse text-left !text-[0.9rem] min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#e2e8f0] !text-[#111827] !text-[0.75rem] !font-black uppercase tracking-wider">
                    <th className="p-[1.25rem_1rem] w-[80px]">No.</th>
                    <th className="p-[1.25rem_1rem]">Student</th>
                    <th className="p-[1.25rem_1rem]">Section</th>
                    <th className="p-[1.25rem_1rem]">Duty</th>
                    <th className="p-[1.25rem_1rem]">Validation</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { initials: 'ZA', name: 'Zander Aligato', validation: 'Approved' },
                    { initials: 'MC', name: 'Maria Cruz', validation: 'Approved' },
                    { initials: 'AG', name: 'Andrea Gomez', validation: 'No Validation Yet' },
                    { initials: 'AN', name: 'Angela Neri', validation: 'Pending' },
                    { initials: 'JT', name: 'Jay Tiongzon', validation: 'No Validation Yet' },
                    { initials: 'LU', name: 'Lichael Ursulo', validation: 'No Validation Yet' },
                  ].map((student, idx) => (
                    <tr key={idx} className="border-b border-[#e2e8f0] last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="p-[1.1rem_1rem] !text-[#111827] !font-bold">{idx + 1}.</td>
                      <td className="p-[1.1rem_1rem] flex items-center gap-[0.85rem] !font-[800] !text-[#111827]">
                        <div className="w-[38px] h-[38px] shrink-0 rounded-full flex items-center justify-center !text-[0.75rem] !font-black bg-[#ffcf01] !text-[#332800]">{student.initials}</div>
                        {student.name}
                      </td>
                      <td className="p-[1.1rem_1rem] !text-[#64748b] !font-bold">BSN 3B</td>
                      <td className="p-[1.1rem_1rem]">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full !text-[0.75rem] !font-bold bg-[#f1f5f9] !text-[#475569]">
                          Completion
                        </span>
                      </td>
                      <td className="p-[1.1rem_1rem]">
                        {student.validation === 'Approved' || student.validation === 'Pending' ? (
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full !text-[0.75rem] !font-bold ${
                            student.validation === 'Approved' ? 'bg-[#dcfce7] !text-[#166534]' : 'bg-[#fef3c7] !text-[#92400e]'
                          }`}>
                            {student.validation}
                          </span>
                        ) : (
                          <span className="!text-[#64748b] !text-[0.8rem] !font-bold">{student.validation}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
