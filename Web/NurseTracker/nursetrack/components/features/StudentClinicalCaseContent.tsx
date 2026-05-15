import React from "react";
import Link from "next/link";
import { useStudentCases } from "@/core/api/hooks/useClinicalCases";
import { useAuthStore } from "@/core/store/authStore";

function getInitials(name?: string) {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function StudentClinicalCaseContent() {
  const user = useAuthStore((state) => state.user);
  const { data: cases, isLoading } = useStudentCases(user?.id != null ? String(user.id) : undefined);
  const pendingCount = cases?.filter((c: any) => c.status === "PENDING")?.length ?? 0;
  return (
    <div className="p-10">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-[1.2rem] font-[800] text-[#111827] m-0">Student Information</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/nursing-student/clinical-cases/add"
              className="inline-flex items-center h-[36px] px-4 rounded-lg border border-[#e2e8f0] bg-white text-[#344054] text-[0.85rem] !font-semibold shadow-sm hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:text-[#0f172a] transition-all no-underline"
            >
              Add clinical case
            </Link>
            <span className="inline-flex items-center h-[36px] px-4 rounded-full bg-[#fff8e1] !text-[#6c4c00] !text-[0.85rem] !font-[800] whitespace-nowrap">
              Clearance locked
            </span>
            {pendingCount > 0 && (
              <span className="inline-flex items-center h-[36px] px-4 rounded-full bg-[#fef2f2] !text-[#991b1b] !text-[0.85rem] !font-[800] whitespace-nowrap">
                {pendingCount} pending case{pendingCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Student Profile Info */}
        <div className="flex items-center justify-between gap-4 p-4 mb-6 bg-white border border-[#e2e8f0] rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-[48px] h-[48px] rounded-full bg-[#FFCF01] flex items-center justify-center text-[#332800] font-[900] text-[1.1rem]">
              {getInitials(user?.fullName)}
            </div>
            <div>
              <h3 className="text-[1.1rem] font-[800] text-[#111827] m-0 mb-1">{user?.fullName ?? 'Loading...'}</h3>
              <p className="text-[#64748b] text-[0.9rem] font-semibold m-0">{user?.sectionInfo ?? ''} — Student ID {user?.schoolId ?? ''}</p>
            </div>
          </div>
          <span className="inline-flex items-center h-[32px] px-4 rounded-full bg-[#fff8e1] !text-[#6c4c00] !text-[0.85rem] !font-[800] whitespace-nowrap">
            In review
          </span>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col lg:flex-row items-end gap-6 mb-8 p-5 border border-[#e2e8f0] rounded-xl bg-gradient-to-r from-[#fffbeb] to-white">
          <div className="flex flex-col sm:flex-row gap-5 w-full flex-1">
            <div className="flex-1">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-1.5">School Year</label>
              <select className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] cursor-pointer shadow-sm" defaultValue="2025 - 2026">
                <option value="2025 - 2026">2025 - 2026</option>
                <option value="2024 - 2025">2024 - 2025</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-1.5">Semester</label>
              <select className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] cursor-pointer shadow-sm" defaultValue="2nd Semester">
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
                <option value="Summer">Summer</option>
              </select>
            </div>
          </div>
          <div className="flex items-end gap-3 shrink-0">
            <button className="h-[42px] px-5 rounded-lg border border-[#e2e8f0] bg-white text-[#344054] !text-[0.82rem] !font-bold shadow-sm hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:text-[#0f172a] transition-all whitespace-nowrap">
              Submit for Clearance
            </button>
            <button className="h-[42px] px-5 rounded-lg border border-[#e2e8f0] bg-white text-[#344054] !text-[0.82rem] !font-bold shadow-sm hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:text-[#0f172a] transition-all whitespace-nowrap">
              Print Clearance
            </button>
          </div>
        </div>

        {/* All Cases from API — replaces the separate Delivery Room + Operating Room sections */}
        <div className="mb-8">
          <h3 className="text-[#8A252C] text-[1.1rem] font-[800] mb-4 m-0">My Clinical Cases</h3>
          <div className="w-full overflow-x-auto border border-[#e2e8f0] rounded-lg">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <th className="p-4 text-[#475467] text-[0.75rem] font-bold uppercase tracking-wider">Area</th>
                  <th className="p-4 text-[#475467] text-[0.75rem] font-bold uppercase tracking-wider">Procedure</th>
                  <th className="p-4 text-[#475467] text-[0.75rem] font-bold uppercase tracking-wider">Status</th>
                  <th className="p-4 text-[#475467] text-[0.75rem] font-bold uppercase tracking-wider">Date</th>
                  <th className="p-4 text-[#475467] text-[0.75rem] font-bold uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="p-4 text-center font-bold text-gray-500">Loading cases...</td></tr>
                ) : cases && cases.length > 0 ? (
                  cases.map((c: any) => (
                    <tr key={c.id} className="border-b border-[#e2e8f0] hover:bg-[#fcfcfc] transition-colors">
                      <td className="p-4 text-[#111827] text-[0.9rem] font-semibold">{c.area}</td>
                      <td className="p-4 text-[#111827] text-[0.9rem] font-medium">{c.procedurePerformed}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full !text-[0.75rem] font-bold ${
                          c.status === 'PENDING' ? 'bg-[#fff8e1] !text-[#6c4c00]' : 
                          c.status === 'APPROVED' ? 'bg-[#e9f8ef] !text-[#03703c]' : 'bg-red-100 !text-red-800'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 text-[#111827] text-[0.9rem] font-semibold">{c.procedureDate}</td>
                      <td className="p-4 text-[#111827] text-[0.9rem] font-semibold">-</td>
                      <td className="p-4">
                        <a href="#" className="!text-[#8A252C] text-[0.9rem] font-bold hover:underline">View</a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b border-[#e2e8f0] hover:bg-[#fcfcfc] transition-colors">
                    <td className="p-4 text-[#111827] text-[0.9rem] font-semibold">Major Case - Assist</td>
                    <td className="p-4 text-[#111827] text-[0.9rem] font-medium">Primary Lower Segment Transverse Cesarean Section</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#fff8e1] !text-[#6c4c00] !text-[0.75rem] font-bold">
                        Pending
                      </span>
                    </td>
                    <td className="p-4 text-[#111827] text-[0.9rem] font-semibold">Apr 24, 2026</td>
                    <td className="p-4 text-[#111827] text-[0.9rem] font-semibold">4:35 PM</td>
                    <td className="p-4">
                      <a href="#" className="!text-[#8A252C] text-[0.9rem] font-bold hover:underline">View</a>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Cases from API */}
        <div className="mb-8">
          <h3 className="text-[#8A252C] text-[1.1rem] font-[800] mb-4 m-0">My Clinical Cases</h3>
          <div className="w-full overflow-x-auto border border-[#e2e8f0] rounded-lg">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <th className="p-4 text-[#475467] text-[0.75rem] font-bold uppercase tracking-wider">Area</th>
                  <th className="p-4 text-[#475467] text-[0.75rem] font-bold uppercase tracking-wider">Procedure</th>
                  <th className="p-4 text-[#475467] text-[0.75rem] font-bold uppercase tracking-wider">Status</th>
                  <th className="p-4 text-[#475467] text-[0.75rem] font-bold uppercase tracking-wider">Date</th>
                  <th className="p-4 text-[#475467] text-[0.75rem] font-bold uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-[#fcfcfc] transition-colors">
                  <td className="p-4 text-[#111827] text-[0.9rem] font-semibold">Major Case - Circulate</td>
                  <td className="p-4 text-[#111827] text-[0.9rem] font-medium">Laparoscopic Cholecystectomy</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#e9f8ef] !text-[#03703c] !text-[0.75rem] font-bold">
                      Approved
                    </span>
                  </td>
                  <td className="p-4 text-[#111827] text-[0.9rem] font-semibold">Apr 23, 2026</td>
                  <td className="p-4 text-[#111827] text-[0.9rem] font-semibold">2:10 PM</td>
                  <td className="p-4">
                    <a href="#" className="!text-[#8A252C] text-[0.9rem] font-bold hover:underline">View</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-4">
          <p className="text-[#64748b] text-[0.85rem] font-[600] m-0">Clearance submissions are not open yet. Wait for the Chair to enable the clearance button.</p>
        </div>

      </div>
    </div>
  );
}
