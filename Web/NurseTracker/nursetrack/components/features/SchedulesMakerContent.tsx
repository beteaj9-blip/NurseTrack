"use client";

import React, { useState } from "react";
import Link from "next/link";
import { InlineSelect } from "@/components/ui/InlineSelect";

export function SchedulesMakerContent({ basePath }: { basePath: string }) {
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const dutyTypeOptions = [{ value: "Regular", label: "Regular" }, { value: "Extension", label: "Extension" }, { value: "Completion", label: "Completion" }];
  const firstHospitalOptions = [{ value: "CCMC - Emergency Room", label: "CCMC - Emergency Room" }];
  const secondHospitalOptions = [{ value: "CCMC - Emergency Room", label: "CCMC - Emergency Room" }, { value: "LCH - 3rd Floor", label: "LCH - 3rd Floor" }, { value: "VSMMC - Main Station 205", label: "VSMMC - Main Station 205" }];
  const firstCiOptions = [{ value: "Arlene G. Vecino", label: "Arlene G. Vecino" }];
  const secondCiOptions = [{ value: "Arlene G. Vecino", label: "Arlene G. Vecino" }, { value: "Annalyn A. Hole", label: "Annalyn A. Hole" }, { value: "Maria Carmina Villardar", label: "Maria Carmina Villardar" }];

  return (
    <>
      <main className="p-[clamp(24px,4vw,42px)] content-start grid gap-6 w-full">
        <section className="mt-0 p-[1.45rem] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)]">
          <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-[#e5eaf1] flex-wrap">
            <div>
              <h2 className="m-0 !text-[#111827] !text-[1.25rem] leading-[1.15] !font-bold">Upload Schedule Source File</h2>
            </div>
            <span className="inline-flex items-center px-[10px] py-[4px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#fff6cc] !text-[#6c4c00]" id="chair-import-status">Review required</span>
          </div>

          <div className="flex flex-col justify-between gap-8 min-h-[210px] p-[1.9rem] border border-dashed border-[#8A252C]/28 rounded-[0.85rem] bg-[linear-gradient(135deg,#fff7d6_0%,#fffaf0_55%,#ffffff_100%)]">
            <div>
              <strong className="block !text-[#0f172a] !text-[1.15rem] !font-[800] mb-4">Drop Excel or CSV file here</strong>
              <p className="max-w-[1180px] m-0 !text-[#475569] !text-base !font-[700] leading-[1.55]">Accepted data: section/group, inclusive dates, RLE rotation, hospital or area, shift, case presentation date, student count, clinical instructor, and remarks. Student names are kept in the source file but hidden from this review to keep the page readable.</p>
            </div>
            <div className="flex items-center justify-end gap-3 flex-wrap max-[900px]:justify-start">
              <input type="file" accept=".xlsx,.xls,.csv,.pdf" hidden />
              <button className="inline-flex items-center justify-center w-auto min-w-[175px] min-h-[48px] px-4 rounded-lg bg-white border border-[#e2e8f0] !text-[#334155] !text-[0.95rem] !font-extrabold hover:bg-[#f8fafc] transition-colors cursor-pointer" type="button">Choose schedule file</button>
              <button className="inline-flex items-center justify-center w-auto min-w-[175px] min-h-[48px] px-4 rounded-lg bg-white border border-[#e2e8f0] !text-[#334155] !text-[0.95rem] !font-extrabold hover:bg-[#f8fafc] transition-colors cursor-pointer" type="button">Create schedule manually</button>
            </div>
          </div>

          <div id="chair-import-message" className="flex items-center min-h-[48px] mt-4 px-4 rounded-lg bg-[#f8fafc] !text-[#4c5d7d] !text-sm !font-bold border border-[#e2e8f0]" role="status" aria-live="polite">
            Upload an imported file or create a schedule manually before publishing.
          </div>
        </section>

        <section className="mt-0 p-[1.45rem] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)]">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#e5eaf1] flex-wrap">
            <h2 className="m-0 !text-[#111827] !text-[1.25rem] leading-[1.15] !font-bold">Review Imported Schedule Before Publishing</h2>
            <span className="inline-flex items-center px-[10px] py-[4px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#fff6cc] !text-[#6c4c00]">Draft review</span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6 max-[980px]:grid-cols-1">
            <div className="p-[18px] border border-[#e2e8f0] rounded-lg bg-[#f8fafc]">
              <span className="block mb-[5px] !text-[#64748b] !text-[0.72rem] !font-[900] uppercase">Imported file</span>
              <strong className="!text-[#111827] !text-[0.98rem] leading-[1.3] !font-[850]">LEVEL-III-RLE-ROTATION-April-27-30.xlsx</strong>
            </div>
            <div className="p-[18px] border border-[#e2e8f0] rounded-lg bg-[#f8fafc]">
              <span className="block mb-[5px] !text-[#64748b] !text-[0.72rem] !font-[900] uppercase">Review records</span>
              <strong className="!text-[#111827] !text-[0.98rem] leading-[1.3] !font-[850]">6 groups / 58 students</strong>
            </div>
            <div className="p-[18px] border border-[#e2e8f0] rounded-lg bg-[#f8fafc]">
              <span className="block mb-[5px] !text-[#64748b] !text-[0.72rem] !font-[900] uppercase">Publish scope</span>
              <strong className="!text-[#111827] !text-[0.98rem] leading-[1.3] !font-[850]">Students and Clinical Instructors</strong>
            </div>
          </div>

          <div className="grid gap-[22px]" aria-label="Editable schedule draft">
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(132px,auto)] gap-[22px_26px] items-start p-[24px] rounded-xl border border-[#e2e8f0] bg-white max-[980px]:grid-cols-1">
              <div className="flex flex-col gap-3 min-w-0">
                <div>
                  <strong className="block !text-[#111827] !text-[0.98rem] !font-[850] leading-[1.3] mb-1">N1 G1</strong>
                  <button className="inline-flex items-center justify-center w-fit min-h-[34px] px-[0.85rem] py-[0.45rem] border border-[#8a252c]/18 rounded-full bg-[#fff7d6] !text-[#8a252c] !text-[0.86rem] !font-extrabold leading-none transition-all cursor-pointer hover:bg-[#ffefad] hover:border-[#8a252c]/35 hover:-translate-y-px" type="button" onClick={() => setIsRosterModalOpen(true)}>View students (9)</button>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-[10px] max-[980px]:justify-start">
                <button className="inline-flex items-center justify-center w-auto min-h-[44px] px-4 rounded-lg bg-white border border-[#e2e8f0] !text-[#334155] !text-[0.95rem] !font-extrabold hover:bg-[#f8fafc] transition-colors cursor-pointer" type="button">Save edits</button>
                <button className="inline-flex items-center justify-center w-auto min-h-[44px] px-4 rounded-lg bg-white border border-[#c62828]/34 !text-[#b42318] !text-[0.95rem] !font-extrabold hover:bg-[#fff1f0] transition-colors cursor-pointer" type="button">Remove</button>
              </div>

              <div className="col-span-full grid grid-cols-2 gap-[18px_22px] pt-[4px] max-[980px]:grid-cols-1">
                <label className="flex flex-col gap-[8px] m-0 !text-[#344054] !text-[0.88rem] !font-[800] min-w-0">Start Date
                  <input className="w-full min-w-0 min-h-[48px] px-[14px] border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] outline-none transition-all focus:border-[#8a252c] focus:shadow-[0_0_0_4px_rgba(138,37,44,0.1)]" type="date" defaultValue="2026-04-27" />
                </label>

                <label className="flex flex-col gap-[8px] m-0 !text-[#344054] !text-[0.88rem] !font-[800] min-w-0">End Date
                  <input className="w-full min-w-0 min-h-[48px] px-[14px] border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] outline-none transition-all focus:border-[#8a252c] focus:shadow-[0_0_0_4px_rgba(138,37,44,0.1)]" type="date" defaultValue="2026-04-30" />
                </label>

                <div className="col-span-full grid gap-[8px] min-w-0 p-[18px] border border-[#dbe3ee] rounded-lg bg-[#f8fafc]">
                  <span className="!text-[#344054] !text-[0.88rem] !font-[800]">Break Dates</span>
                  <div className="grid grid-cols-[1fr_auto] gap-[14px] items-center max-[720px]:grid-cols-1">
                    <input className="w-full min-w-0 min-h-[48px] px-[14px] border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] outline-none transition-all focus:border-[#8a252c] focus:shadow-[0_0_0_4px_rgba(138,37,44,0.1)]" type="date" />
                    <button className="inline-flex items-center justify-center min-w-[110px] min-h-[48px] px-4 rounded-lg bg-white border border-[#e2e8f0] !text-[#334155] !text-[0.95rem] !font-extrabold hover:bg-[#f8fafc] transition-colors cursor-pointer" type="button">Add break</button>
                  </div>
                  <div className="mt-2 text-[#64748b] text-sm font-bold">No breaks added</div>
                </div>

                <label className="flex flex-col gap-[8px] m-0 !text-[#344054] !text-[0.88rem] !font-[800] min-w-0">Shift Start
                  <input className="w-full min-w-0 min-h-[48px] px-[14px] border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] outline-none transition-all focus:border-[#8a252c] focus:shadow-[0_0_0_4px_rgba(138,37,44,0.1)]" type="time" defaultValue="14:00" />
                </label>

                <label className="flex flex-col gap-[8px] m-0 !text-[#344054] !text-[0.88rem] !font-[800] min-w-0">Shift End
                  <input className="w-full min-w-0 min-h-[48px] px-[14px] border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] outline-none transition-all focus:border-[#8a252c] focus:shadow-[0_0_0_4px_rgba(138,37,44,0.1)]" type="time" defaultValue="22:00" />
                </label>

                <label className="flex flex-col gap-[8px] m-0 !text-[#344054] !text-[0.88rem] !font-[800] min-w-0">Hospital / Area
                  <InlineSelect value="CCMC - Emergency Room" options={firstHospitalOptions} placeholder="Select hospital / area" onChange={() => {}} />
                </label>

                <label className="flex flex-col gap-[8px] m-0 !text-[#344054] !text-[0.88rem] !font-[800] min-w-0">Duty Type
                  <InlineSelect value="Regular" options={dutyTypeOptions} placeholder="Select duty type" onChange={() => {}} />
                </label>

                <label className="flex flex-col gap-[8px] m-0 !text-[#344054] !text-[0.88rem] !font-[800] min-w-0">Case Presentation date
                  <input className="w-full min-w-0 min-h-[48px] px-[14px] border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] outline-none transition-all focus:border-[#8a252c] focus:shadow-[0_0_0_4px_rgba(138,37,44,0.1)]" type="date" />
                </label>

                <label className="flex flex-col gap-[8px] m-0 !text-[#344054] !text-[0.88rem] !font-[800] min-w-0">Case Presentation time
                  <input className="w-full min-w-0 min-h-[48px] px-[14px] border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] outline-none transition-all focus:border-[#8a252c] focus:shadow-[0_0_0_4px_rgba(138,37,44,0.1)]" type="time" />
                </label>

                <label className="flex items-center gap-3 m-0 !text-[#344054] !text-[0.88rem] !font-[800] min-w-0 mt-[14px]">
                  <input type="checkbox" defaultChecked className="w-[18px] h-[18px] text-[#8a252c] border-[#dbe3ee] rounded focus:ring-[#8a252c]" />
                  No Case Presentation
                </label>

                <label className="flex flex-col gap-[8px] m-0 !text-[#344054] !text-[0.88rem] !font-[800] min-w-0">Supervising CI
                  <InlineSelect value="Arlene G. Vecino" options={firstCiOptions} placeholder="Select CI" onChange={() => {}} />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_minmax(132px,auto)] gap-[22px_26px] items-start p-[24px] rounded-xl border border-[#e2e8f0] bg-white max-[980px]:grid-cols-1">
              <div className="flex flex-col gap-3 min-w-0">
                <div>
                  <strong className="block !text-[#111827] !text-[0.98rem] !font-[850] leading-[1.3] mb-1">N2 G4</strong>
                  <button className="inline-flex items-center min-h-[30px] p-0 border-0 bg-transparent !text-[#8a252c] !text-[0.9rem] !font-[900] text-left cursor-pointer hover:!text-[#5c191d]" type="button" onClick={() => setIsRosterModalOpen(true)}>View students (9)</button>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-[10px] max-[980px]:justify-start">
                <button className="inline-flex items-center justify-center w-auto min-h-[44px] px-4 rounded-lg bg-white border border-[#e2e8f0] !text-[#334155] !text-[0.95rem] !font-extrabold hover:bg-[#f8fafc] transition-colors cursor-pointer" type="button">Save edits</button>
                <button className="inline-flex items-center justify-center w-auto min-h-[44px] px-4 rounded-lg bg-white border border-[#c62828]/34 !text-[#b42318] !text-[0.95rem] !font-extrabold hover:bg-[#fff1f0] transition-colors cursor-pointer" type="button">Remove</button>
              </div>

              <div className="col-span-full grid grid-cols-2 gap-[18px_22px] pt-[4px] max-[980px]:grid-cols-1">
                <label className="flex flex-col gap-[8px] m-0 !text-[#344054] !text-[0.88rem] !font-[800] min-w-0">Start Date
                  <input className="w-full min-w-0 min-h-[48px] px-[14px] border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] outline-none transition-all focus:border-[#8a252c] focus:shadow-[0_0_0_4px_rgba(138,37,44,0.1)]" type="date" defaultValue="2026-04-27" />
                </label>

                <label className="flex flex-col gap-[8px] m-0 !text-[#344054] !text-[0.88rem] !font-[800] min-w-0">End Date
                  <input className="w-full min-w-0 min-h-[48px] px-[14px] border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] outline-none transition-all focus:border-[#8a252c] focus:shadow-[0_0_0_4px_rgba(138,37,44,0.1)]" type="date" defaultValue="2026-04-30" />
                </label>

                <div className="col-span-full grid gap-[8px] min-w-0 p-[18px] border border-[#dbe3ee] rounded-lg bg-[#f8fafc]">
                  <span className="!text-[#344054] !text-[0.88rem] !font-[800]">Break Dates</span>
                  <div className="grid grid-cols-[1fr_auto] gap-[14px] items-center max-[720px]:grid-cols-1">
                    <input className="w-full min-w-0 min-h-[48px] px-[14px] border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] outline-none transition-all focus:border-[#8a252c] focus:shadow-[0_0_0_4px_rgba(138,37,44,0.1)]" type="date" />
                    <button className="inline-flex items-center justify-center min-w-[110px] min-h-[48px] px-4 rounded-lg bg-white border border-[#e2e8f0] !text-[#334155] !text-[0.95rem] !font-extrabold hover:bg-[#f8fafc] transition-colors cursor-pointer" type="button">Add break</button>
                  </div>
                  <div className="mt-2 text-[#64748b] text-sm font-bold">No breaks added</div>
                </div>

                <label className="flex flex-col gap-[8px] m-0 !text-[#344054] !text-[0.88rem] !font-[800] min-w-0">Shift Start
                  <input className="w-full min-w-0 min-h-[48px] px-[14px] border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] outline-none transition-all focus:border-[#8a252c] focus:shadow-[0_0_0_4px_rgba(138,37,44,0.1)]" type="time" defaultValue="14:00" />
                </label>

                <label className="flex flex-col gap-[8px] m-0 !text-[#344054] !text-[0.88rem] !font-[800] min-w-0">Shift End
                  <input className="w-full min-w-0 min-h-[48px] px-[14px] border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] outline-none transition-all focus:border-[#8a252c] focus:shadow-[0_0_0_4px_rgba(138,37,44,0.1)]" type="time" defaultValue="22:00" />
                </label>

                <label className="flex flex-col gap-[8px] m-0 !text-[#344054] !text-[0.88rem] !font-[800] min-w-0">Hospital / Area
                  <InlineSelect value="CCMC - Emergency Room" options={secondHospitalOptions} placeholder="Select hospital / area" onChange={() => {}} />
                </label>

                <label className="flex flex-col gap-[8px] m-0 !text-[#344054] !text-[0.88rem] !font-[800] min-w-0">Duty Type
                  <InlineSelect value="Regular" options={dutyTypeOptions} placeholder="Select duty type" onChange={() => {}} />
                </label>

                <label className="flex flex-col gap-[8px] m-0 !text-[#344054] !text-[0.88rem] !font-[800] min-w-0">Case Presentation date
                  <input className="w-full min-w-0 min-h-[48px] px-[14px] border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] outline-none transition-all focus:border-[#8a252c] focus:shadow-[0_0_0_4px_rgba(138,37,44,0.1)]" type="date" />
                </label>

                <label className="flex flex-col gap-[8px] m-0 !text-[#344054] !text-[0.88rem] !font-[800] min-w-0">Case Presentation time
                  <input className="w-full min-w-0 min-h-[48px] px-[14px] border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] outline-none transition-all focus:border-[#8a252c] focus:shadow-[0_0_0_4px_rgba(138,37,44,0.1)]" type="time" />
                </label>

                <label className="flex items-center gap-3 m-0 !text-[#344054] !text-[0.88rem] !font-[800] min-w-0 mt-[14px]">
                  <input type="checkbox" defaultChecked className="w-[18px] h-[18px] text-[#8a252c] border-[#dbe3ee] rounded focus:ring-[#8a252c]" />
                  No Case Presentation
                </label>

                <label className="flex flex-col gap-[8px] m-0 !text-[#344054] !text-[0.88rem] !font-[800] min-w-0">Supervising CI
                  <InlineSelect value="Arlene G. Vecino" options={secondCiOptions} placeholder="Select CI" onChange={() => {}} />
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button className="inline-flex items-center justify-center w-auto min-h-[50px] px-[30px] rounded-[10px] whitespace-nowrap bg-[#8A252C] !text-white !text-[0.95rem] tracking-[-0.01em] !font-extrabold shadow-[0_10px_22px_rgba(138,37,44,0.18)] hover:bg-[#6d1d23] hover:shadow-[0_16px_34px_rgba(138,37,44,0.22)] transition-all cursor-pointer" type="button">Publish Schedule</button>
          </div>

          <div id="chair-schedule-message" className="flex items-center min-h-[48px] mt-4 px-4 rounded-lg bg-[#f8fafc] !text-[#4c5d7d] !text-sm !font-bold border border-[#e2e8f0]" role="status" aria-live="polite">
            Schedule Maker is ready for review.
          </div>
        </section>
      </main>

      {isRosterModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-[1.25rem] bg-[#0f172a]/[0.45]" id="schedule-roster-modal">
          <section className="relative w-[min(980px,calc(100vw-32px))] p-6 bg-white rounded-2xl shadow-[0_26px_68px_rgba(15,23,42,0.24)]" role="dialog" aria-modal="true" aria-labelledby="schedule-roster-title">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="m-0 !text-[#111827] !text-[1.45rem] leading-[1.2] !font-bold" id="schedule-roster-title">N1 G1 Students</h2>
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center justify-center w-auto min-h-[40px] px-4 rounded-lg bg-white border border-[#e2e8f0] !text-[#94a3b8] !text-sm !font-extrabold disabled:cursor-not-allowed" type="button" disabled>Undo</button>
                <button className="relative grid place-items-center w-[40px] h-[40px] border border-[#e2e8f0] rounded-lg bg-white !text-transparent outline-none cursor-pointer hover:border-[#8a252c] transition-colors before:absolute before:content-[''] before:w-[14px] before:h-[2px] before:rounded-full before:bg-[#0f172a] before:rotate-45 after:absolute after:content-[''] after:w-[14px] after:h-[2px] after:rounded-full after:bg-[#0f172a] after:-rotate-45" type="button" onClick={() => setIsRosterModalOpen(false)} aria-label="Close student roster"></button>
              </div>
            </div>

            <div className="grid gap-[10px] m-[0_0_1rem]">
              <label className="!text-[#14213d] !font-[900]" htmlFor="schedule-roster-add-search">Search student to add</label>
              <input className="w-full min-h-[58px] px-[18px] border border-[#8a252c]/28 rounded-lg bg-white !text-[#14213d] !font-[800] focus:border-[#8a252c] focus:shadow-[0_0_0_4px_rgba(138,37,44,0.1)] outline-none" id="schedule-roster-add-search" type="search" placeholder="Search by name, ID, section, or clinical site" autoComplete="off" />
              <div className="max-h-[280px] overflow-y-auto border border-[#e2e8f0] rounded-lg bg-white hidden" id="schedule-roster-add-results" hidden></div>
            </div>

            <div className="mt-4 max-h-[50vh] overflow-y-auto" id="schedule-roster-list">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-[#e2e8f0]">
                    <th className="py-4 px-3 !font-[900] !text-[0.8rem] uppercase !text-[#111827]">NO.</th>
                    <th className="py-4 px-3 !font-[900] !text-[0.8rem] uppercase !text-[#111827]">STUDENT</th>
                    <th className="py-4 px-3 !font-[900] !text-[0.8rem] uppercase !text-[#111827]">SECTION</th>
                    <th className="py-4 px-3 !font-[900] !text-[0.8rem] uppercase !text-[#111827] text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 1, init: 'ZA', name: 'Zander Aligato' },
                    { id: 2, init: 'BM', name: 'Bianca Mariel Lumbre' },
                    { id: 3, init: 'KM', name: 'Klarisse Mumar' },
                    { id: 4, init: 'SP', name: 'Shaina Perez' },
                    { id: 5, init: 'RP', name: 'Rui Parba' },
                    { id: 6, init: 'RR', name: 'Relieza Rellon' },
                    { id: 7, init: 'EM', name: 'Ella Mae Maranga' }
                  ].map((s) => (
                    <tr key={s.id} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#f8fafc]">
                      <td className="py-4 px-3 !text-[#475569] !text-[0.95rem]">{s.id}.</td>
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#ffc107] !font-[800] !text-[0.8rem] !text-[#111827]">{s.init}</span>
                          <span className="!font-[800] !text-[#111827] !text-[0.95rem]">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-3 !text-[#475569] !text-[0.95rem] !font-medium">N1 G1</td>
                      <td className="py-4 px-3 text-right">
                        <button className="px-4 py-2 border border-[#c62828]/30 rounded-lg bg-white !text-[#b42318] !text-[0.85rem] !font-bold hover:bg-[#fff1f0] transition-colors" type="button">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-3 mt-[1.25rem] pt-[1.25rem] border-t border-[#e2e8f0] max-[720px]:justify-start max-[720px]:flex-col">
              <button className="inline-flex items-center justify-center w-auto min-w-[130px] min-h-[46px] px-4 rounded-lg bg-white border border-[#e2e8f0] !text-[#334155] !text-[0.95rem] !font-extrabold hover:bg-[#f8fafc] transition-colors cursor-pointer max-[720px]:w-full" type="button" onClick={() => setIsRosterModalOpen(false)}>Cancel</button>
              <button className="inline-flex items-center justify-center w-auto min-w-[130px] min-h-[46px] px-4 rounded-lg bg-[#8A252C] !text-white !text-[0.95rem] !font-extrabold shadow-[0_6px_14px_rgba(138,37,44,0.18)] hover:bg-[#6d1d23] hover:shadow-[0_10px_22px_rgba(138,37,44,0.22)] transition-all cursor-pointer max-[720px]:w-full" type="button" onClick={() => setIsRosterModalOpen(false)}>Save Changes</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
