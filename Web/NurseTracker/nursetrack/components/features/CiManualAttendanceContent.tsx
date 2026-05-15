"use client";
import React, { useState } from "react";
import Link from "next/link";

type ValidationStatus = "Pending Review" | "Approved" | "Returned";

interface AttendanceRecord {
  id: number;
  dateLabel: string;
  site: string;
  area: string;
  shift: string;
  note: string;
  status: ValidationStatus;
}

interface AddedStudent {
  id: string;
  initials: string;
  name: string;
  section: string;
  studentId: string;
  status: string;
  checkIn: string;
  checkOut: string;
}

const RECORDS: AttendanceRecord[] = [
  { id: 1, dateLabel: "May 8, 2026 Attendance", site: "CCMC", area: "Emergency Room", shift: "7:00 AM - 3:00 PM", note: "Awaiting Chair or Admin review.", status: "Pending Review" },
  { id: 2, dateLabel: "May 6, 2026 Attendance", site: "CCMC", area: "Delivery Room", shift: "7:00 AM - 3:00 PM", note: "Awaiting Chair or Admin review.", status: "Pending Review" },
  { id: 3, dateLabel: "April 29, 2026 Attendance", site: "CCMC", area: "Emergency Room", shift: "7:00 AM - 3:00 PM", note: "Approved by Reyes, Chair on April 30, 2026, 9:10 AM.", status: "Approved" },
  { id: 4, dateLabel: "April 24, 2026 Attendance", site: "CCMC", area: "Medical Ward", shift: "7:00 AM - 3:00 PM", note: "Returned by Admin Santos on April 25, 2026, 10:22 AM.", status: "Returned" },
];

const STATUS_STYLE: Record<ValidationStatus, string> = {
  "Pending Review": "bg-[#fef3c7] !text-[#92400e]",
  "Approved": "bg-[#dcfce7] !text-[#166534]",
  "Returned": "bg-[#fee2e2] !text-[#991b1b]",
};

const inputCls = "w-full min-h-[44px] px-3 py-2 border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] !text-[0.9rem] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all";
const labelCls = "flex flex-col gap-1.5 m-0 !text-[0.85rem] !font-bold !text-[#334155]";

export function CiManualAttendanceContent({ basePath, isEditMode = false }: { basePath: string; isEditMode?: boolean }) {
  const [editing, setEditing] = useState(isEditMode);
  const [searchStudent, setSearchStudent] = useState("");
  const [addedStudents, setAddedStudents] = useState<AddedStudent[]>([
    { id: "1", initials: "MC", name: "Maria Cruz", section: "BSN 3A", studentId: "12-3456-789", status: "Present", checkIn: "06:54 AM", checkOut: "03:05 PM" },
    { id: "2", initials: "JA", name: "Josh Anton Nuevas", section: "BSN 3A", studentId: "21-5589-201", status: "Present", checkIn: "07:02 AM", checkOut: "03:00 PM" },
  ]);

  const removeStudent = (id: string) => setAddedStudents(s => s.filter(st => st.id !== id));

  return (
    <main className="p-[clamp(24px,4vw,42px)] grid gap-6 w-full">

      {/* ── Encode Attendance Form ── */}
      <section className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-[1.6rem_1.75rem]">
        <h2 className="m-0 mb-5 !text-[#111827] !text-[1.15rem] !font-bold tracking-[-0.03em]">Encode Attendance</h2>

        <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
          {/* Duty date */}
          <label className={labelCls} htmlFor="duty-date">
            Duty date
            <input id="duty-date" type="date" className={inputCls} defaultValue="2026-05-08" />
          </label>

          {/* Duty area */}
          <label className={labelCls} htmlFor="duty-area">
            Duty area
            <select id="duty-area" className={inputCls + " cursor-pointer"}>
              <option>Emergency Room</option>
              <option>Delivery Room</option>
              <option>Medical Ward</option>
              <option>Pedia Pulmo Ward</option>
              <option>Operating Room</option>
            </select>
          </label>

          {/* Shift start */}
          <label className={labelCls} htmlFor="shift-start">
            Shift start
            <input id="shift-start" type="time" className={inputCls} defaultValue="07:00" />
          </label>

          {/* Shift end */}
          <label className={labelCls} htmlFor="shift-end">
            Shift end
            <input id="shift-end" type="time" className={inputCls} defaultValue="15:00" />
          </label>
        </div>

        {/* Clinical site */}
        <label className={labelCls + " mt-4"} htmlFor="clinical-site">
          Clinical site
          <select id="clinical-site" className={inputCls + " cursor-pointer"}>
            <option>CCMC</option>
            <option>VSMMC</option>
            <option>CHD</option>
          </select>
        </label>

        {/* Instructor note */}
        <label className={labelCls + " mt-4"} htmlFor="instructor-note">
          Instructor note
          <textarea
            id="instructor-note"
            rows={4}
            placeholder="Add why this attendance was encoded manually"
            className={inputCls + " resize-y min-h-[100px]"}
            defaultValue={editing ? "Manual attendance encoded because the CI phone was unavailable during the duty shift." : ""}
          />
        </label>

        {/* Info bar */}
        <div className="mt-4 px-4 py-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] !text-[#64748b] !text-[0.82rem] !font-[600]">
          {editing
            ? "Update the pending manual record, then send the revised record for review."
            : "Add students, encode their time, then send the record for Chair and Admin review."}
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 mt-4">
          {editing && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-lg border border-[#e2e8f0] bg-white !text-[#334155] !text-[0.88rem] !font-[800] hover:bg-[#f8fafc] transition-colors"
            >
              Cancel Edit
            </button>
          )}
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-lg bg-[#8A252C] !text-white !text-[0.88rem] !font-[800] hover:bg-[#681920] transition-colors shadow-sm"
          >
            {editing ? "Update Pending Record" : "Send Record for Review"}
          </button>
        </div>
      </section>

      {/* ── Add Students ── */}
      <section className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-[1.6rem_1.75rem]">
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <h2 className="m-0 !text-[#111827] !text-[1.15rem] !font-bold tracking-[-0.03em]">Add Students</h2>
          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#fef3c7] !text-[#92400e] !text-[0.8rem] !font-extrabold">
            {addedStudents.length} selected
          </span>
        </div>

        {/* Search */}
        <label className={labelCls} htmlFor="search-student">
          Search student
          <input
            id="search-student"
            type="search"
            placeholder="Search name, ID, section, or site"
            className={inputCls}
            value={searchStudent}
            onChange={e => setSearchStudent(e.target.value)}
          />
        </label>

        {/* Search Results (Mock) */}
        {searchStudent.length > 0 && (
          <div className="mt-4 flex items-center justify-center min-h-[48px] rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc] !text-[#64748b] !text-[0.85rem] !font-[600]">
            No students match the search.
          </div>
        )}

        {/* Empty state when no students added and not searching */}
        {addedStudents.length === 0 && searchStudent.length === 0 && (
          <div className="mt-4 flex items-center justify-center min-h-[48px] rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc] !text-[#64748b] !text-[0.85rem] !font-[600]">
            Search and add students to encode attendance.
          </div>
        )}

        {/* Added students list */}
        {addedStudents.length > 0 && (
          <div className="mt-4 flex flex-col gap-4">
            {addedStudents.map(st => (
              <div key={st.id} className="rounded-xl border border-[#e2e8f0] p-5 relative bg-white shadow-sm">
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeStudent(st.id)}
                  className="absolute top-5 right-5 w-[30px] h-[30px] flex items-center justify-center rounded-[6px] border border-[#fecaca] bg-white !text-[#ef4444] hover:bg-[#fef2f2] transition-colors !text-[1rem] !font-[900]"
                  aria-label={`Remove ${st.name}`}
                >
                  ×
                </button>

                {/* Student header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-[42px] h-[42px] shrink-0 rounded-full flex items-center justify-center !text-[0.85rem] !font-extrabold bg-[#ffcf01] !text-[#332800]">
                    {st.initials}
                  </div>
                  <div>
                    <strong className="block !text-[#111827] !text-[0.92rem] !font-[800]">{st.name}</strong>
                    <span className="block !text-[#64748b] !text-[0.8rem] !font-[600]">{st.section} – {st.studentId}</span>
                  </div>
                </div>

                {/* Inputs row */}
                <div className="grid grid-cols-3 gap-3 max-[640px]:grid-cols-1">
                  <label className={labelCls} htmlFor={`status-${st.id}`}>
                    Status
                    <select id={`status-${st.id}`} className={inputCls + " cursor-pointer"} defaultValue={st.status}>
                      <option>Present</option>
                      <option>Absent</option>
                      <option>Late</option>
                      <option>Excused</option>
                    </select>
                  </label>
                  <label className={labelCls} htmlFor={`checkin-${st.id}`}>
                    Check-in
                    <input id={`checkin-${st.id}`} type="time" className={inputCls} defaultValue={st.checkIn.replace(" AM","").replace(" PM","")} />
                  </label>
                  <label className={labelCls} htmlFor={`checkout-${st.id}`}>
                    Check-out
                    <input id={`checkout-${st.id}`} type="time" className={inputCls} defaultValue={st.checkOut.replace(" AM","").replace(" PM","")} />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Manual Attendance Records ── */}
      {!isEditMode && (
        <section className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-[1.6rem_1.75rem]">
          <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
            <h2 className="m-0 !text-[#111827] !text-[1.15rem] !font-bold tracking-[-0.03em]">Manual Attendance Records</h2>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#fef3c7] !text-[#92400e] !text-[0.8rem] !font-extrabold">
              {RECORDS.length} records
            </span>
          </div>

          <div className="flex flex-col border border-[#e2e8f0] rounded-lg overflow-hidden">
            {RECORDS.map(rec => (
              <Link 
                href={`${basePath}/manual-backup/review`} 
                key={rec.id} 
                className="flex items-center gap-4 p-[1.25rem] border-b border-[#e2e8f0] last:border-b-0 bg-transparent hover:bg-[#f8fafc] transition-colors cursor-pointer no-underline text-inherit"
              >
                {/* Avatar */}
                <div className="w-[42px] h-[42px] shrink-0 rounded-full flex items-center justify-center !text-[0.85rem] !font-extrabold bg-[#ffcf01] !text-[#332800]">
                  PR
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <strong className="block !text-[#111827] !text-[0.9rem] !font-[800]">{rec.dateLabel}</strong>
                  <span className="block !text-[#64748b] !text-[0.82rem] !font-[600]">
                    {rec.site} – {rec.area} · {rec.shift}
                  </span>
                  <span className={`block !text-[0.78rem] !font-[700] mt-0.5 ${rec.status === "Approved" ? "!text-[#166534]" : rec.status === "Returned" ? "!text-[#991b1b]" : "!text-[#64748b]"}`}>
                    {rec.note}
                  </span>
                </div>

                {/* Status badge */}
                <span className={`shrink-0 inline-flex items-center px-3 py-1.5 rounded-full !text-[0.75rem] !font-[800] ${STATUS_STYLE[rec.status]}`}>
                  {rec.status}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

    </main>
  );
}
