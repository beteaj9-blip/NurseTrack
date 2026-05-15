import React from "react";
import Link from "next/link";

import { mockStudents as fallbackStudents, mockWeeklyDutyByStudent as weeklyDutyByStudent, getDefaultWeeklyDuty as defaultWeeklyDuty } from "@/core/mocks/students";

function formatHours(hours: number) {
  const cleanHours = Number.isInteger(hours) ? hours : Number(hours).toFixed(1);
  return Number(hours) === 1 ? `${cleanHours} hr` : `${cleanHours} hrs`;
}

function getStatusBadgeClass(status: string) {
  if (status === "Completed" || status === "On track" || status === "Checked" || status === "Cleared")
    return "bg-[#e9f8ef] !text-[#03703c]";
  if (status === "Needs action" || status === "Not cleared")
    return "bg-[#fef2f2] !text-[#991b1b]";
  return "bg-[#fff8e1] !text-[#6c4c00]";
}

export async function StudentProgressDetailContent({ basePath, searchParams: searchParamsPromise }: { basePath: string, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await searchParamsPromise;
  const studentKey = (typeof searchParams.student === 'string' ? searchParams.student : "maria-cruz");
  const student = fallbackStudents[studentKey] || {
    name: studentKey.split('-').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
    initials: studentKey.split('-').map((s: string) => s.charAt(0).toUpperCase()).join('').substring(0, 2),
    id: "00-0000-000",
    section: "Unknown Section",
    site: "Unknown Site",
    area: "Assigned Area",
    status: "In progress",
    extensionDays: 0,
    pending: 0
  };

  const dutyEntries = weeklyDutyByStudent[studentKey] || defaultWeeklyDuty(student);
  const totalHours = dutyEntries.reduce((sum: number, entry: any) => sum + entry.hours, 0);
  const totalOvertime = dutyEntries.reduce((sum: number, entry: any) => sum + entry.overtime, 0);

  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]">

      {/* Hero — white card, same as workspace-hero */}
      <section className="flex items-center justify-between gap-[28px] p-[clamp(24px,4vw,34px)] border border-[#e2e8f0] rounded-[8px] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] mb-[18px]">
        <div className="flex items-center gap-[16px] min-w-0">
          <div className="w-[68px] h-[68px] shrink-0 bg-[#ffc107] !text-[#111827] rounded-full flex items-center justify-center !font-[800] text-[1.05rem]">
            {student.initials}
          </div>
          <div>
            <h2 className="m-0 mb-[8px] !text-[#111827] !text-[clamp(1.55rem,3vw,2.15rem)] !font-bold">{student.name}</h2>
            <p className="m-0 !text-[#64748b] !font-[600] leading-[1.55]">{student.section} - Student ID {student.id}</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-[12px]">
          <span className={`inline-flex items-center justify-start w-max max-w-full min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap ${getStatusBadgeClass(student.status)}`}>
            {student.status}
          </span>
        </div>
      </section>

      {/* Stat cards */}
      <section className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[18px] mb-[18px]" aria-label="Student progress summary">

        <article className="relative overflow-hidden border border-[#e2e8f0] rounded-[8px] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] p-[24px] after:content-[''] after:absolute after:inset-[auto_-32px_-54px_auto] after:w-[126px] after:h-[126px] after:rounded-full after:bg-[rgba(138,37,44,0.06)] after:pointer-events-none">
          <div className="flex justify-between items-start gap-[22px]">
            <span className="w-[42px] min-w-[42px] h-[42px] rounded-[8px] bg-[rgba(138,37,44,0.08)] !text-[#8A252C] inline-flex items-center justify-center" aria-label="Extension days">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2v4"/><path d="M16 2v4"/><path d="M3 10h18"/>
                <path d="M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z"/>
              </svg>
            </span>
            <span className="inline-flex items-center justify-start w-max max-w-full min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#fff8e1] !text-[#6c4c00]">Open</span>
          </div>
          <h3 className="mt-[18px] mb-[6px] !text-[1.05rem] !text-[#111827] !font-bold">Extension Days</h3>
          <p className="mb-[16px] !text-[#64748b] !text-[0.9rem] !font-[700]">{student.extensionDays} extension days recorded</p>
        </article>

        <article className="relative overflow-hidden border border-[#e2e8f0] rounded-[8px] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] p-[24px] after:content-[''] after:absolute after:inset-[auto_-32px_-54px_auto] after:w-[126px] after:h-[126px] after:rounded-full after:bg-[rgba(138,37,44,0.06)] after:pointer-events-none">
          <div className="flex justify-between items-start gap-[22px]">
            <span className="w-[42px] min-w-[42px] h-[42px] rounded-[8px] bg-[rgba(138,37,44,0.08)] !text-[#8A252C] inline-flex items-center justify-center" aria-label="Clinical cases">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 4h8"/><path d="M7 8h10"/><path d="M7 12h7"/><path d="M6 3h12v18H6z"/>
              </svg>
            </span>
            <span className="inline-flex items-center justify-start w-max max-w-full min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#fff8e1] !text-[#6c4c00]">In progress</span>
          </div>
          <h3 className="mt-[18px] mb-[6px] !text-[1.05rem] !text-[#111827] !font-bold">Clinical Cases</h3>
          <p className="mb-[16px] !text-[#64748b] !text-[0.9rem] !font-[700]">All required DR and OR cases completed</p>
        </article>

        <article className="relative overflow-hidden border border-[#e2e8f0] rounded-[8px] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] p-[24px] after:content-[''] after:absolute after:inset-[auto_-32px_-54px_auto] after:w-[126px] after:h-[126px] after:rounded-full after:bg-[rgba(138,37,44,0.06)] after:pointer-events-none">
          <div className="flex justify-between items-start gap-[22px]">
            <span className="w-[42px] min-w-[42px] h-[42px] rounded-[8px] bg-[rgba(138,37,44,0.08)] !text-[#8A252C] inline-flex items-center justify-center" aria-label="Pending items">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8v5"/><path d="M12 17h.01"/>
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              </svg>
            </span>
            <span className="inline-flex items-center justify-start w-max max-w-full min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#fff8e1] !text-[#6c4c00]">Open</span>
          </div>
          <h3 className="mt-[18px] mb-[6px] !text-[1.05rem] !text-[#111827] !font-bold">Pending Items</h3>
          <p className="mb-[16px] !text-[#64748b] !text-[0.9rem] !font-[700]">{student.pending} records need instructor or student action</p>
        </article>
      </section>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px] items-start">

        {/* Requirement Progress panel */}
        <article className="border border-[#e2e8f0] rounded-[8px] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] p-[24px]">
          <div className="flex justify-between items-start gap-[22px] mb-[20px]">
            <h2 className="m-0 !text-[#111827] !text-[1.24rem] !font-bold">Requirement Progress</h2>
            <Link 
              className="inline-flex items-center justify-center min-h-[38px] px-[1rem] rounded-[8px] bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.84rem] !font-[800] hover:border-[rgba(138,37,44,0.32)] hover:!text-[#8A252C] hover:shadow-[0_10px_24px_rgba(32,33,36,0.08)] transition-all duration-[160ms] ease cursor-pointer no-underline whitespace-nowrap" 
              href={basePath === '/nursing-student' ? `${basePath}/clinical-cases` : `${basePath}/clinical-cases/selection?student=${studentKey}`}
            >
              Pending items
            </Link>
          </div>

          <div className="grid gap-[18px]">
            {/* DR Group */}
            <section aria-label="Delivery Room case requirements">
              <div className="flex items-baseline justify-between gap-[12px] border-b border-[#e2e8f0] px-[2px] pb-[8px] mb-[10px]">
                <strong className="!text-[#8A252C] !text-[1.05rem] !font-bold">DR</strong>
                <span className="!text-[#64748b] !text-[0.78rem] !font-[800]">Delivery Room Cases</span>
              </div>
              <div className="grid gap-[10px]">
                {[
                  { label: "Handled Cases", sub: "3 / 3 completed", width: "100%", badge: "3 / 3", bClass: "bg-[#e9f8ef] !text-[#03703c]" },
                  { label: "Assisted Cases", sub: "2 / 3 completed", width: "66%", badge: "2 / 3", bClass: "bg-[#fff8e1] !text-[#6c4c00]" },
                  { label: "Newborn Care", sub: "1 / 3 completed", width: "33%", badge: "1 / 3", bClass: "bg-[#fff8e1] !text-[#6c4c00]" },
                  { label: "Labor Watch", sub: "0 / 3 completed", width: "0%", badge: "0 / 3", bClass: "bg-[#fef2f2] !text-[#991b1b]" },
                ].map((item) => (
                  <div key={item.label} className="grid grid-cols-[minmax(150px,1.3fr)_minmax(150px,1fr)_auto] gap-[14px] items-center border border-[#e2e8f0] rounded-[8px] bg-[#f8fafc] p-[14px]">
                    <div className="grid gap-[5px]">
                      <strong className="!text-[0.96rem] !text-[#111827]">{item.label}</strong>
                      <span className="!text-[#64748b] !text-[0.82rem] !font-[800] leading-[1.4]">{item.sub}</span>
                    </div>
                    <div className="h-[9px] overflow-hidden rounded-full bg-[#eceff3]">
                      <span className="block h-full rounded-[inherit]" style={{ width: item.width, background: "linear-gradient(90deg, #8A252C, #ffc107)" }}></span>
                    </div>
                    <span className={`inline-flex items-center justify-start w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap ${item.bClass}`}>{item.badge}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* OR Group */}
            <section aria-label="Operating Room case requirements">
              <div className="flex items-baseline justify-between gap-[12px] border-b border-[#e2e8f0] px-[2px] pb-[8px] mb-[10px]">
                <strong className="!text-[#8A252C] !text-[1.05rem] !font-bold">OR</strong>
                <span className="!text-[#64748b] !text-[0.78rem] !font-[800]">Operating Room Cases</span>
              </div>
              <div className="grid gap-[10px]">
                {[
                  { label: "Minor Cases", sub: "3 / 3 completed", width: "100%", badge: "3 / 3", bClass: "bg-[#e9f8ef] !text-[#03703c]" },
                  { label: "Major Cases – Scrub", sub: "2 / 3 completed", width: "66%", badge: "2 / 3", bClass: "bg-[#fff8e1] !text-[#6c4c00]" },
                  { label: "Major Cases – Circulating", sub: "1 / 3 completed", width: "33%", badge: "1 / 3", bClass: "bg-[#fff8e1] !text-[#6c4c00]" },
                ].map((item) => (
                  <div key={item.label} className="grid grid-cols-[minmax(150px,1.3fr)_minmax(150px,1fr)_auto] gap-[14px] items-center border border-[#e2e8f0] rounded-[8px] bg-[#f8fafc] p-[14px]">
                    <div className="grid gap-[5px]">
                      <strong className="!text-[0.96rem] !text-[#111827]">{item.label}</strong>
                      <span className="!text-[#64748b] !text-[0.82rem] !font-[800] leading-[1.4]">{item.sub}</span>
                    </div>
                    <div className="h-[9px] overflow-hidden rounded-full bg-[#eceff3]">
                      <span className="block h-full rounded-[inherit]" style={{ width: item.width, background: "linear-gradient(90deg, #8A252C, #ffc107)" }}></span>
                    </div>
                    <span className={`inline-flex items-center justify-start w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap ${item.bClass}`}>{item.badge}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </article>

        {/* Weekly Duty Hours panel */}
        <article className="border border-[#e2e8f0] rounded-[8px] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] p-[24px] overflow-hidden">
          <div className="flex justify-between items-start gap-[22px] mb-[20px]">
            <h2 className="m-0 !text-[#111827] !text-[1.24rem] !font-bold">Weekly Duty Hours</h2>
          </div>

          {/* Weekly overview tile — gold tinted */}
          <div className="flex items-center justify-between gap-[14px] border border-[rgba(138,37,44,0.14)] rounded-[8px] mb-[14px] p-[16px]" style={{ background: "linear-gradient(135deg, rgba(255,207,1,0.22), rgba(138,37,44,0.04) 62%), #ffffff" }}>
            <div>
              <span className="block mb-[5px] !text-[#8A252C] !text-[0.72rem] !font-[900] uppercase">This week</span>
              <strong className="block !text-[#111827] !text-[1.25rem] leading-[1.2]">{formatHours(totalHours)} recorded</strong>
            </div>
            <p className="m-0 max-w-[240px] !text-[#64748b] !text-[0.84rem] !font-[800] leading-[1.45] text-right">
              {totalOvertime > 0
                ? `${formatHours(totalOvertime)} overtime across ${dutyEntries.length} duty day${dutyEntries.length === 1 ? "" : "s"}.`
                : `No overtime across ${dutyEntries.length} duty day${dutyEntries.length === 1 ? "" : "s"}.`}
            </p>
          </div>

          {/* Stats grid — each with left border gradient */}
          <div className="grid grid-cols-3 gap-[12px] mb-[16px]" aria-label="Weekly duty summary">
            {[
              { label: "Duty days", value: String(dutyEntries.length) },
              { label: "Total hours", value: formatHours(totalHours) },
              { label: "Overtime", value: formatHours(totalOvertime) },
            ].map((stat) => (
              <div key={stat.label} className="relative overflow-hidden border border-[#e2e8f0] rounded-[8px] bg-[#f8fafc] p-[13px_14px_13px_16px] before:content-[''] before:absolute before:inset-[0_auto_0_0] before:w-[4px] before:bg-[linear-gradient(180deg,#8A252C,#ffc107)]">
                <span className="block mb-[5px] !text-[#64748b] !text-[0.74rem] !font-[800] uppercase">{stat.label}</span>
                <strong className="!text-[#111827] !text-[1.05rem]">{stat.value}</strong>
              </div>
            ))}
          </div>

          {/* Duty entries */}
          <div className="grid gap-[12px] mb-[14px]">
            {dutyEntries.map((entry: any, index: number) => {
              const hasOvertime = entry.overtime > 0;
              const badgeClass = hasOvertime ? "bg-[#fef2f2] !text-[#991b1b]" : "bg-[#e9f8ef] !text-[#03703c]";
              const badgeLabel = hasOvertime ? `Overtime +${formatHours(entry.overtime)}` : "No overtime";
              const [month = "", dayNumber = ""] = entry.date.split(" ");

              return (
                <article key={index} className={`grid grid-cols-[auto_minmax(0,1fr)_auto_auto] gap-[14px] items-center border rounded-[8px] p-[12px_14px] ${hasOvertime ? "border-[rgba(180,35,24,0.2)] bg-[linear-gradient(90deg,#ffffff,#fff8f7)]" : "border-[#e2e8f0] bg-[linear-gradient(90deg,#ffffff,#f8fafc)]"}`}>
                  {/* Date chip — gold */}
                  <div className="grid place-items-center min-w-[52px] min-h-[56px] border border-[rgba(255,207,1,0.45)] rounded-[8px] bg-[rgba(255,207,1,0.12)] !text-[#6c4c00] p-[7px] text-center">
                    <span className="m-0 !text-[0.66rem] !font-[900] uppercase leading-[1]">{month}</span>
                    <strong className="mt-[3px] !text-[1.04rem] leading-[1] !font-bold">{dayNumber}</strong>
                  </div>

                  <div>
                    <strong className="block mb-[4px] !text-[0.94rem] !text-[#111827]">{entry.day}</strong>
                    <p className="m-0 !text-[#64748b] !text-[0.82rem] !font-[700] leading-[1.4]">{entry.area}</p>
                  </div>

                  <span className={`inline-flex items-center justify-start w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap ${badgeClass}`}>{badgeLabel}</span>

                  <div className="grid gap-[2px] text-right">
                    <span className="!text-[#111827] !text-[0.96rem] !font-[900] whitespace-nowrap">{formatHours(entry.hours)}</span>
                    <small className="!text-[#64748b] !text-[0.67rem] !font-[800] uppercase whitespace-nowrap">Duty hours</small>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Summary message */}
          <div className="mt-[14px] p-[12px_16px] border border-[#e2e8f0] rounded-[8px] bg-[#f8fafc] !text-[#475569] !text-[0.9rem] !font-[700] leading-[1.5]" role="status" aria-live="polite">
            {student.name} completed {formatHours(totalHours)} across {dutyEntries.length} duty day{dutyEntries.length === 1 ? "" : "s"} this week, with {formatHours(totalOvertime)} overtime.
          </div>
        </article>
      </div>
    </main>
  );
}
