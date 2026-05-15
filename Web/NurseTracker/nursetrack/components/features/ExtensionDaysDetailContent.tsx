"use client";

import React, { useState, use } from "react";

const fallbackStudents: Record<string, any> = {
  "treasure-abadinas": {
    name: "Treasure Abadinas",
    initials: "TA",
    id: "22-1845-103",
    section: "BSN 3A",
    status: "In progress",
    statusClass: "status-pending"
  },
  "maria-cruz": {
    name: "Maria Cruz",
    initials: "MC",
    id: "12-3456-789",
    section: "BSN 3A",
    status: "Completed",
    statusClass: "status-verified"
  }
};

const mockHistory = [
  {
    id: 1,
    dateAdded: "May 5, 2026",
    days: 3,
    basis: "Excused absence",
    reason: "Medical certificate provided for 3-day absence due to fever.",
    status: "Active"
  }
];

function getStatusBadge(statusClass: string) {
  if (statusClass === "status-pending") return "bg-[#fff8e1] !text-[#6c4c00]";
  if (statusClass === "status-verified") return "bg-[#e9f8ef] !text-[#03703c]";
  if (statusClass === "status-rejected") return "bg-[#fef2f2] !text-[#991b1b]";
  return "bg-[#f1f5f9] !text-[#475569]";
}

export function ExtensionDaysDetailContent({ basePath, searchParams: searchParamsPromise }: { basePath: string, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = use(searchParamsPromise);
  const studentKey = typeof searchParams.student === 'string' ? searchParams.student : "treasure-abadinas";
  const student = fallbackStudents[studentKey] || fallbackStudents["treasure-abadinas"];

  const [history, setHistory] = useState(mockHistory);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [recordToCancel, setRecordToCancel] = useState<number | null>(null);

  const [daysCount, setDaysCount] = useState("1");
  const [basis, setBasis] = useState("Excused absence");
  const [reason, setReason] = useState("");

  const handleAddExtension = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    const newRecord = {
      id: Date.now(),
      dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      days: parseInt(daysCount, 10),
      basis,
      reason,
      status: "Active"
    };
    setHistory([newRecord, ...history]);
    setReason("");
    setDaysCount("1");
    setBasis("Excused absence");
  };

  const openCancelModal = (id: number) => {
    setRecordToCancel(id);
    setShowCancelModal(true);
  };

  const handleCancelRecord = () => {
    if (recordToCancel !== null) {
      setHistory(history.map(record =>
        record.id === recordToCancel ? { ...record, status: "Canceled" } : record
      ));
    }
    setShowCancelModal(false);
    setRecordToCancel(null);
  };

  const inputClass = "w-full min-h-[48px] px-3 py-2 border border-[#dbe3ee] rounded-[0.8rem] bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all";
  const labelClass = "flex flex-col gap-[0.55rem] m-0 !text-sm !font-bold !text-[#344054]";

  return (
    <>
      <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)] grid gap-[1.25rem] content-start">

        {/* Selected student card */}
        <section className="border border-[#e2e8f0] rounded-xl bg-white shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-[1.5rem] grid gap-[1rem]">
          <div className="flex items-center justify-between gap-4 flex-wrap max-[980px]:flex-col max-[980px]:items-stretch">
            <h2 className="m-0 !text-[#111827] !text-[1.24rem] !font-bold">Selected Student</h2>
          </div>

          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[1rem] min-h-[5.25rem] p-[1rem_1.15rem] border border-[#dbe3ee] rounded-[0.85rem] bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] max-[980px]:grid-cols-[auto_minmax(0,1fr)]" id="extension-selected-summary">
            <span className="w-[3rem] h-[3rem] rounded-full bg-[#facc15] !text-[#854d0e] flex items-center justify-center !font-[800] !text-[0.92rem] shrink-0">
              {student.initials}
            </span>
            <span className="min-w-0 grid gap-[0.2rem]">
              <strong className="!text-[#111827] !text-[1.05rem] leading-[1.2]">{student.name}</strong>
              <small className="!text-[#64748b] !text-[0.9rem] !font-[700]">{student.section} - {student.id}</small>
            </span>
            <span className={`inline-flex items-center justify-start w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap max-[980px]:col-span-full max-[980px]:justify-self-start ${getStatusBadge(student.statusClass)}`}>
              {student.status}
            </span>
          </div>
        </section>

        {/* Add Extension Days form */}
        <section className="border border-[#e2e8f0] rounded-xl bg-white shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-[1.5rem]">
          <div className="flex items-center justify-between gap-[1rem] mb-[1.15rem] flex-wrap max-[980px]:flex-col max-[980px]:items-stretch">
            <h2 className="m-0 !text-[#111827] !text-[1.24rem] !font-bold">Add Extension Days</h2>
            <span className="inline-flex items-center justify-start w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#fff8e1] !text-[#6c4c00]">New extension</span>
          </div>

          <form className="grid grid-cols-2 gap-[1rem_1.1rem] items-start max-[980px]:grid-cols-1" id="extension-form" onSubmit={handleAddExtension}>
            <label className={labelClass} htmlFor="extension-days-count">
              Extension days to add
              <select className={inputClass} id="extension-days-count" name="extension-days-count" required value={daysCount} onChange={(e) => setDaysCount(e.target.value)}>
                <option value="1">1 extension day</option>
                <option value="2">2 extension days</option>
                <option value="3">3 extension days</option>
                <option value="4">4 extension days</option>
                <option value="5">5 extension days</option>
                <option value="6">6 extension days</option>
                <option value="7">7 extension days</option>
                <option value="8">8 extension days</option>
                <option value="10">10 extension days</option>
                <option value="15">15 extension days</option>
              </select>
            </label>

            <label className={labelClass} htmlFor="extension-basis">
              Basis
              <select className={inputClass} id="extension-basis" name="basis" required value={basis} onChange={(e) => setBasis(e.target.value)}>
                <option value="Excused absence">Excused absence</option>
                <option value="Unexcused absence">Unexcused absence</option>
                <option value="Tardiness">Tardiness</option>
                <option value="Performance deficiency">Performance deficiency</option>
                <option value="Clinical requirement completion">Clinical requirement completion</option>
                <option value="Instructor assessment">Instructor assessment</option>
              </select>
            </label>

            <label className={`${labelClass} col-span-full`} htmlFor="extension-reason">
              Reason / remarks
              <textarea className={`${inputClass} min-h-[8.5rem] resize-y`} id="extension-reason" name="reason" rows={5} placeholder="Type the reason, documentation note, or instructor remarks here" required value={reason} onChange={(e) => setReason(e.target.value)} />
            </label>

            <div className="col-span-full flex justify-end items-center gap-[0.85rem] pt-[0.2rem] max-[980px]:flex-col max-[980px]:items-stretch">
              <button
                className="inline-flex items-center justify-center min-h-[48px] min-w-[7rem] px-[1.25rem] rounded-[8px] bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.84rem] !font-[800] hover:border-[rgba(138,37,44,0.32)] hover:!text-[#8A252C] hover:shadow-[0_10px_24px_rgba(32,33,36,0.08)] transition-all cursor-pointer max-[980px]:w-full"
                type="button"
                onClick={() => { setDaysCount("1"); setBasis("Excused absence"); setReason(""); }}
              >
                Clear
              </button>
              <button
                className="inline-flex items-center justify-center min-h-[48px] min-w-[13.5rem] px-[1.5rem] rounded-[8px] bg-[#8A252C] !text-white !text-[0.95rem] !font-extrabold shadow-[0_8px_16px_-4px_rgba(138,37,44,0.4)] hover:bg-[#6d1d23] transition-all cursor-pointer max-[980px]:w-full"
                type="submit"
              >
                Add Extension Days
              </button>
            </div>
          </form>
        </section>

        {/* Extension Day History */}
        <section className="border border-[#e2e8f0] rounded-xl bg-white shadow-[0_14px_34px_rgba(15,23,42,0.06)] p-[1.5rem]" id="extension-history-panel">
          <div className="flex justify-between items-start gap-[22px] mb-[1.15rem] flex-wrap">
            <div>
              <h2 className="m-0 !text-[#111827] !text-[1.24rem] !font-bold">Extension Day History</h2>
            </div>
            <span className="inline-flex items-center justify-start w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#e9f8ef] !text-[#03703c]">{history.length} records</span>
          </div>

          {history.length > 0 ? (
            <div className="grid gap-[0.85rem]" id="extension-history-list">
              {history.map((record) => (
                <div
                  key={record.id}
                  className="grid grid-cols-[3.75rem_minmax(210px,1fr)_minmax(190px,0.82fr)_minmax(240px,1.05fr)_minmax(190px,auto)] gap-[1rem] items-center p-[1rem_1.1rem] border border-[#dbe3ee] rounded-[0.85rem] bg-white max-[980px]:grid-cols-1 max-[980px]:justify-items-start"
                  style={{ opacity: record.status === 'Canceled' ? 0.6 : 1 }}
                >
                  <div className="w-[3rem] h-[3rem] rounded-full bg-[#facc15] !text-[#854d0e] flex items-center justify-center !font-[800] !text-[0.9rem] shrink-0">
                    {student.initials}
                  </div>

                  <div>
                    <strong className="block !text-[#111827] !text-[0.96rem] leading-[1.25]">{student.name}</strong>
                    <small className="block mt-[0.18rem] !text-[#475569] !text-[0.88rem] !font-[700] leading-[1.35]">{student.section} - {student.id}</small>
                  </div>

                  <div>
                    <strong className="block !text-[#111827] !text-[0.96rem] leading-[1.25]">{record.days} extension day{record.days > 1 ? 's' : ''}</strong>
                    <small className="block mt-[0.18rem] !text-[#475569] !text-[0.88rem] !font-[700] leading-[1.35]">{record.basis}</small>
                  </div>

                  <div>
                    <strong className="block !text-[#111827] !text-[0.96rem] leading-[1.25]">{record.reason}</strong>
                    <small className="block mt-[0.18rem] !text-[#475569] !text-[0.88rem] !font-[700] leading-[1.35]">Instructor-assigned extension</small>
                  </div>

                  <div className="flex items-center justify-end gap-[0.65rem] flex-wrap max-[980px]:justify-start">
                    {record.status === 'Active' ? (
                      <span className="inline-flex items-center justify-start w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#e9f8ef] !text-[#03703c]">Added</span>
                    ) : (
                      <span className="inline-flex items-center justify-start w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#f1f5f9] !text-[#64748b]">Canceled</span>
                    )}
                    {record.status === 'Active' && (
                      <div className="inline-flex items-center gap-[0.45rem]">
                        <button className="inline-flex items-center justify-center min-h-[2.25rem] w-auto px-[0.7rem] py-[0.45rem] rounded-[0.45rem] bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.78rem] !font-[800] whitespace-nowrap hover:border-[rgba(138,37,44,0.32)] hover:!text-[#8A252C] hover:shadow-[0_10px_24px_rgba(32,33,36,0.08)] transition-all cursor-pointer" type="button">Edit</button>
                        <button className="inline-flex items-center justify-center min-h-[2.25rem] w-auto px-[0.7rem] py-[0.45rem] rounded-[0.45rem] bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.78rem] !font-[800] whitespace-nowrap hover:border-[rgba(138,37,44,0.32)] hover:!text-[#8A252C] hover:shadow-[0_10px_24px_rgba(32,33,36,0.08)] transition-all cursor-pointer" type="button" onClick={() => openCancelModal(record.id)}>Cancel</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="m-0 border border-dashed border-[#cbd5e1] rounded-[0.8rem] bg-[#f8fafc] p-[1.2rem] !text-[#64748b] !font-[700] text-center" id="extension-history-empty">
              No extension day records yet for this student.
            </p>
          )}
        </section>
      </main>

      {/* Cancel confirmation modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" id="extension-cancel-modal">
          <section className="w-[min(520px,100%)] bg-white rounded-xl shadow-[0_24px_60px_rgba(15,23,42,0.16)] border border-[#e2e8f0] p-[2rem]" role="dialog" aria-modal="true" aria-labelledby="extension-cancel-title" aria-describedby="extension-cancel-copy">
            <div className="flex items-center justify-between gap-4 mb-[1rem]">
              <h2 className="m-0 !text-[#111827] !text-[1.15rem] !font-bold" id="extension-cancel-title">Cancel this extension record?</h2>
            </div>
            <p className="!text-[#64748b] !text-[0.95rem] leading-[1.55] mb-[1.5rem]" id="extension-cancel-copy">
              Cancel this extension day record? This keeps the record in the history but marks it as canceled.
            </p>
            <div className="flex justify-end gap-[0.75rem] flex-wrap">
              <button className="inline-flex items-center justify-center min-h-[48px] px-[1.25rem] rounded-[8px] bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.84rem] !font-[800] hover:border-[rgba(138,37,44,0.32)] hover:!text-[#8A252C] hover:shadow-[0_10px_24px_rgba(32,33,36,0.08)] transition-all cursor-pointer" type="button" onClick={() => setShowCancelModal(false)}>Keep record</button>
              <button className="inline-flex items-center justify-center min-h-[48px] px-[1.5rem] rounded-[8px] bg-[#b91c1c] !text-white !text-[0.95rem] !font-extrabold shadow-[0_8px_16px_-4px_rgba(185,28,28,0.4)] hover:bg-[#991b1b] transition-all cursor-pointer" type="button" onClick={handleCancelRecord}>Cancel Record</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
