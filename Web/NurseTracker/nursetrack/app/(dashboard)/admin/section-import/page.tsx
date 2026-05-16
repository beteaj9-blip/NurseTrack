"use client";

import React, { useState, useRef } from "react";
import { useSystemInfo } from "@/core/api/hooks/useSystemInfo";

export default function SectionImportPage() {
  const { data: systemInfo } = useSystemInfo();
  const [fileName, setFileName] = useState<string>("No file selected");
  const [status, setStatus] = useState<string>("Waiting for file");
  const [message, setMessage] = useState<string>("Upload an imported file before importing section assignments.");
  const [messageClass, setMessageClass] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setStatus("File selected");
      setMessage(`${file.name} selected. Review the semester details, then import section assignments.`);
      setMessageClass("is-success");
    }
  };

  const handleReset = () => {
    setFileName("No file selected");
    setStatus("Waiting for file");
    setMessage("Upload an imported file before importing section assignments.");
    setMessageClass("");
  };

  return (
    <>
      <main className="p-[clamp(24px,4vw,42px)] content-start grid gap-4 w-full">
        <section className="mt-0 p-[1.45rem] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)]">
          <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-[#e5eaf1] flex-wrap">
            <div>
              <h2 className="m-0 !text-[#111827] !text-[1.25rem] leading-[1.15] !font-bold">Upload Student Section File</h2>
            </div>
            <span className={`inline-flex items-center px-[10px] py-[4px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#fff6cc] !text-[#6c4c00]`}>
              {status}
            </span>
          </div>

          <form className="grid gap-5" id="section-import-form" onReset={handleReset}>
            <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-1">
              <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]" htmlFor="semester-name">
                Semester
                <select className="min-h-[48px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all cursor-pointer" id="semester-name" required value={systemInfo?.semester ?? ""} onChange={() => {}}>
                  <option value={systemInfo?.semester ?? ""}>{systemInfo?.semester ?? ""}</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]" htmlFor="school-year">
                School Year
                <input className="min-h-[48px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all" id="school-year" type="text" value={systemInfo?.schoolYear ?? ""} required readOnly />
              </label>

              <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]" htmlFor="effective-date">
                Effective Date
                <input className="min-h-[48px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all" id="effective-date" type="date" defaultValue="2026-06-01" />
              </label>
            </div>

            <div className="flex flex-col justify-between gap-8 min-h-[210px] p-[1.9rem] border border-dashed border-[#8A252C]/28 rounded-[0.85rem] bg-[linear-gradient(135deg,#fff7d6_0%,#fffaf0_55%,#ffffff_100%)]">
              <div>
                <strong className="block !text-[#0f172a] !text-[1.15rem] !font-[800] mb-4">Drop Excel or CSV file here</strong>
                <p className="max-w-[1180px] m-0 !text-[#475569] !text-base !font-[700] leading-[1.55]">Accepted data: student ID, student name, year level, and section. This file will be used to assign student sections for the new semester.</p>
              </div>

              <div className="flex items-center justify-end gap-3 flex-wrap max-[900px]:justify-start">
                <input 
                  id="section-file" 
                  type="file" 
                  accept=".xlsx,.xls,.csv" 
                  hidden 
                  required 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <button className="inline-flex items-center justify-center w-auto min-w-[175px] min-h-[48px] whitespace-nowrap px-4 rounded-lg bg-white border border-[#e2e8f0] !text-[#334155] !text-[0.95rem] !font-extrabold hover:bg-[#f8fafc] transition-colors cursor-pointer" type="button" id="choose-section-file" onClick={handleFileClick}>
                  Choose section file
                </button>
                <span className="!text-[#475569] !text-[0.9rem] !font-[800]" id="section-file-name">{fileName}</span>
              </div>
            </div>

            <div id="section-import-message" className={`flex items-center min-h-[48px] px-4 rounded-lg !text-sm !font-bold border ${messageClass === 'is-success' ? 'bg-[#e9f8ef] !text-[#078033] border-[#bbf7d0]' : 'bg-[#f8fafc] !text-[#4c5d7d] border-[#e2e8f0]'}`} role="status" aria-live="polite">
              {message}
            </div>

            <div className="flex items-center justify-end gap-[0.85rem] flex-wrap max-[900px]:justify-start">
              <button className="inline-flex items-center justify-center w-auto min-w-[145px] min-h-[52px] px-[24px] whitespace-nowrap rounded-[10px] bg-white border border-[#e2e8f0] !text-[#334155] !text-sm !font-bold hover:bg-[#f8fafc] transition-colors cursor-pointer max-[900px]:w-full max-[900px]:min-w-0" type="reset">
                Clear
              </button>
              <button className="inline-flex items-center justify-center w-auto min-w-[285px] min-h-[52px] px-[30px] whitespace-nowrap rounded-[10px] bg-[#8A252C] !text-white !text-[0.95rem] tracking-[-0.01em] !font-extrabold shadow-[0_10px_22px_rgba(138,37,44,0.18)] hover:bg-[#6d1d23] hover:shadow-[0_16px_34px_rgba(138,37,44,0.22)] transition-all cursor-pointer max-[900px]:w-full max-[900px]:min-w-0" type="submit">
                Import Section Assignments
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}
