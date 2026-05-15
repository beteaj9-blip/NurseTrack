"use client";
import React, { useState } from "react";
export function LiveAttendanceContent() {
  const [siteFilter, setSiteFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [search, setSearch] = useState("");
  const data = [
    { id: 1, initials: 'MC', name: 'Maria Cruz', section: 'BSN 3A', site: 'CCMC', area: 'Emergency Room', ci: 'Patricia Reyes', time: '6:54 AM', liveMin: '1 min', status: 'Present' },
    { id: 2, initials: 'JA', name: 'Josh Anton Nuevas', section: 'BSN 3A', site: 'CCMC', area: 'Emergency Room', ci: 'Patricia Reyes', time: '7:18 AM', liveMin: '4 min', status: 'Present' },
    { id: 3, initials: 'ND', name: 'Nicole Dela Pena', section: 'BSN 3A', site: 'Vicente Mendiola Center for Health Infirmary', area: 'Medical Ward', ci: 'Patricia Reyes', time: '6:59 AM', liveMin: '2 min', status: 'Present' },
    { id: 4, initials: 'TA', name: 'Treasure Abadinas', section: 'BSN 3A', site: 'SAMCH', area: 'Delivery Room', ci: 'Miguel Santos', time: '6:48 AM', liveMin: '2 min', status: 'Present' },
    { id: 5, initials: 'ZA', name: 'Zander Aligato', section: 'BSN 3B', site: 'CCMC', area: 'Emergency Room', ci: 'Miguel Santos', time: '6:52 AM', liveMin: '3 min', status: 'Present' },
    { id: 6, initials: 'HB', name: 'Hannah Bautista', section: 'BSN 3B', site: 'CCMC', area: 'Pedia Pulmo Ward', ci: 'Miguel Santos', time: '7:21 AM', liveMin: '5 min', status: 'Present' },
    { id: 7, initials: 'AG', name: 'Andrea Gomez', section: 'BSN 3B', site: 'CHN Brgy. Dumlog', area: 'Community Health Nursing Area', ci: 'Elena Dela Cruz', time: '7:02 AM', liveMin: '1 min', status: 'Present' },
    { id: 8, initials: 'MR', name: 'Miguel Reyes', section: 'BSN 3C', site: 'CHN Brgy. Dumlog', area: 'Community Health Nursing Area', ci: 'Elena Dela Cruz', time: '6:57 AM', liveMin: '2 min', status: 'Present' },
    { id: 9, initials: 'PU', name: 'Patricia Uy', section: 'BSN 3C', site: 'CHN Brgy. Dumlog', area: 'Community Assessment', ci: 'Elena Dela Cruz', time: '7:25 AM', liveMin: '6 min', status: 'Present' },
    { id: 10, initials: 'LU', name: 'Lichael Ursulo', section: 'BSN 3C', site: 'ECS', area: 'Outpatient Department', ci: 'Patricia Reyes', time: '6:55 AM', liveMin: '3 min', status: 'Present' },
    { id: 11, initials: 'SV', name: 'Sean Villamor', section: 'BSN 3C', site: 'Healing Hands Dialysis Center', area: 'Dialysis Center', ci: 'Patricia Reyes', time: '6:51 AM', liveMin: '2 min', status: 'Present' },
    { id: 12, initials: 'AG2', name: 'Andrea Gomez', section: 'BSN 4A', site: 'Vicente Mendiola Center for Health Infirmary', area: 'Emergency Room', ci: 'Patricia Reyes', time: '7:16 AM', liveMin: '4 min', status: 'Present' },
  ];
  const filtered = data.filter(item => {
    const matchSite = siteFilter === "all" || item.site.includes(siteFilter);
    const matchArea = areaFilter === "all" || item.area === areaFilter;
    const q = search.toLowerCase();
    const matchSearch = !search || item.name.toLowerCase().includes(q) || item.section.toLowerCase().includes(q) || item.site.toLowerCase().includes(q) || item.area.toLowerCase().includes(q);
    return matchSite && matchArea && matchSearch;
  });
  const inputCls = "w-full min-h-[48px] px-3 py-2 border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all";
  const labelCls = "flex flex-col gap-1.5 m-0 p-[0.1rem] !text-sm !font-bold !text-[#344054]";
  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)]">
      <section className="w-full">
        <article className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem]">
          <div className="flex items-center justify-between gap-4 mb-[1.1rem] pb-0 border-b border-[#e5eaf1] flex-wrap">
            <h2 className="m-0 !text-[#111827] !text-[1.15rem] !font-bold tracking-[-0.03em]">Student Attendance Feed</h2>
          </div>
          <div className="grid gap-[18px] mb-[24px] grid-cols-3 max-[720px]:grid-cols-1">
            <label className={labelCls} htmlFor="la-site">Hospital
              <select className={`${inputCls} cursor-pointer`} id="la-site" value={siteFilter} onChange={e => setSiteFilter(e.target.value)}>
                <option value="all">All Hospitals</option>
                <option value="CCMC">CCMC</option>
                <option value="VSMMC">VSMMC</option>
                <option value="CHN Brgy. Dumlog">CHN Brgy. Dumlog</option>
                <option value="CSMC">CSMC</option>
              </select>
            </label>
            <label className={labelCls} htmlFor="la-area">Duty area
              <select className={`${inputCls} cursor-pointer`} id="la-area" value={areaFilter} onChange={e => setAreaFilter(e.target.value)}>
                <option value="all">All duty areas</option>
                <option value="Emergency Room">Emergency Room</option>
                <option value="Delivery Room">Delivery Room</option>
                <option value="Medical Ward">Medical Ward</option>
                <option value="Pedia Pulmo Ward">Pedia Pulmo Ward</option>
                <option value="Community Health Nursing Area">Community Health Nursing Area</option>
                <option value="Outpatient Department">Outpatient Department</option>
                <option value="Dialysis Center">Dialysis Center</option>
              </select>
            </label>
            <label className={labelCls} htmlFor="la-search">Search
              <input className={inputCls} id="la-search" type="search" placeholder="Search student, section, area, or site" value={search} onChange={e => setSearch(e.target.value)} />
            </label>
          </div>
          <div className="flex flex-col w-full border border-[#e2e8f0] rounded-lg overflow-x-auto bg-white" role="table">
            <div className="min-w-[900px] grid grid-cols-[44px_1.25fr_1.4fr_0.65fr_0.8fr_0.65fr] items-center p-[18px] gap-[18px] bg-[#f8fafc] !text-[#344054] !text-[0.78rem] !font-[800] uppercase border-b border-[#e2e8f0]" role="row">
              {['No.','Student','Duty Location','Check-In','Time Connected','Status'].map(h => <span key={h} role="columnheader">{h}</span>)}
            </div>
            {filtered.map((item, i) => (
              <div className="min-w-[900px] grid grid-cols-[44px_1.25fr_1.4fr_0.65fr_0.8fr_0.65fr] items-center p-[18px] gap-[18px] border-b border-[#e2e8f0] bg-white hover:bg-[#f8fafc] last:border-b-0" role="row" key={item.id}>
                <span role="cell" className="w-[32px] h-[32px] rounded-full border border-[#8a252c]/16 bg-[#f8fafc] grid place-items-center !text-[#8A252C] !text-[0.82rem] !font-[900]">{i+1}.</span>
                <span role="cell" className="flex items-center gap-[10px]">
                  <div className="w-[42px] h-[42px] shrink-0 rounded-full flex items-center justify-center !text-[0.82rem] !font-extrabold bg-[#ffcf01] !text-[#332800]">{item.initials}</div>
                  <div><strong className="block !text-[#111827] !text-[0.88rem]">{item.name}</strong><small className="block !text-[#64748b] !text-[0.74rem] !font-[800]">{item.section}</small></div>
                </span>
                <span role="cell"><strong className="block !text-[#111827] !text-[0.88rem]">{item.site}</strong><small className="block !text-[#64748b] !text-[0.74rem] !font-[800]">{item.area}</small><small className="block !text-[#64748b] !text-[0.74rem] !font-[800]">CI: {item.ci}</small></span>
                <span role="cell" className="!text-[#111827] !text-[0.86rem] !font-[800]">{item.time}</span>
                <span role="cell" className="!text-[#111827] !text-[0.86rem] !font-[800]">{item.liveMin}</span>
                <span role="cell"><span className="inline-flex items-center w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#e9f8ef] !text-[#03703c]">{item.status}</span></span>
              </div>
            ))}
          </div>
          {filtered.length === 0 && <div className="p-8 text-center !text-[#64748b] !text-[0.85rem] !font-bold">No attendance records match the selected filters.</div>}
        </article>
      </section>
    </main>
  );
}
