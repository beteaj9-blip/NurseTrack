"use client";

import React, { useState } from "react";

export default function HospitalsDutyAreasPage() {
  const [hospitals, setHospitals] = useState([
    { name: "Cebu City Medical Center", code: "CCMC" },
    { name: "Vicente Sotto Memorial Medical Center", code: "VSMMC" },
    { name: "Southwestern University Medical Center", code: "SAMCH" },
    { name: "Mactan Medical Hospital", code: "MMH" },
  ]);

  const [dutyAreas, setDutyAreas] = useState([
    { name: "Emergency Room", hospital: "CCMC" },
    { name: "Pedia Pulmo Ward", hospital: "CCMC" },
    { name: "SP St 201", hospital: "VSMMC" },
    { name: "Operating Room", hospital: "VSMMC" },
  ]);

  const [editingHospital, setEditingHospital] = useState<typeof hospitals[0] | null>(null);
  const [editingDutyArea, setEditingDutyArea] = useState<typeof dutyAreas[0] | null>(null);

  return (
    <>
      <main className="p-[clamp(24px,4vw,42px)] content-start grid gap-4 w-full pt-8">
        <section className="mt-6 grid grid-cols-2 gap-6 items-stretch max-[980px]:grid-cols-1">
          <article className="p-[1.45rem] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] flex flex-col">
            <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-[#e5eaf1] flex-wrap">
              <div>
                <h2 className="m-0 !text-[#111827] !text-[1.25rem] leading-[1.15] !font-bold">Hospital Record</h2>
              </div>
              <span className="inline-flex items-center px-[10px] py-[4px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#fff6cc] !text-[#6c4c00]">Required</span>
            </div>

            <form className="grid grid-cols-2 gap-4 gap-y-5 items-start flex-1 max-[780px]:grid-cols-1" id="hospital-form">
              <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]" htmlFor="hospital-name">
                Hospital Name
                <input className="min-h-[48px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all" id="hospital-name" type="text" placeholder="Enter hospital name" required />
              </label>

              <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]" htmlFor="hospital-code">
                Short Code
                <input className="min-h-[48px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all" id="hospital-code" type="text" placeholder="CCMC / VSMMC" required />
              </label>

              <div className="col-span-full grid grid-cols-[minmax(0,1fr)_auto] gap-4 items-center mt-[0.15rem] max-[780px]:grid-cols-1">
                <div id="hospital-message" className="w-full min-h-[56px] flex items-center m-0 p-[0.9rem_1rem] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg !text-[#4c5d7d] !text-sm !font-bold" role="status" aria-live="polite">
                  Complete the hospital fields before saving.
                </div>

                <div className="flex justify-end items-center max-[780px]:justify-stretch">
                  <button className="inline-flex items-center justify-center w-auto min-w-[210px] min-h-[50px] px-[30px] whitespace-nowrap rounded-[10px] bg-[#8A252C] !text-white !text-[0.95rem] !font-extrabold shadow-[0_10px_22px_rgba(138,37,44,0.18)] hover:bg-[#6d1d23] hover:shadow-[0_16px_34px_rgba(138,37,44,0.22)] transition-all cursor-pointer max-[780px]:w-full max-[780px]:min-w-0" type="submit">Add Hospital</button>
                </div>
              </div>
            </form>
          </article>

          <article className="mt-0 p-[1.45rem] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] flex flex-col">
            <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-[#e5eaf1] flex-wrap">
              <div>
                <h2 className="m-0 !text-[#111827] !text-[1.25rem] leading-[1.15] !font-bold">Area Record</h2>
              </div>
              <span className="inline-flex items-center px-[10px] py-[4px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#fff6cc] !text-[#6c4c00]">Required</span>
            </div>

            <form className="grid grid-cols-2 gap-4 gap-y-5 items-start flex-1 max-[780px]:grid-cols-1" id="duty-area-form">
              <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]" htmlFor="duty-area-name">
                Duty Area
                <input className="min-h-[48px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all" id="duty-area-name" type="text" placeholder="Emergency Room" required />
              </label>

              <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]" htmlFor="duty-area-hospital">
                Hospital
                <select className="min-h-[48px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all cursor-pointer" id="duty-area-hospital" required defaultValue="CCMC">
                  {hospitals.map(h => <option key={h.code} value={h.code}>{h.code}</option>)}
                </select>
              </label>

              <div className="col-span-full grid grid-cols-[minmax(0,1fr)_auto] gap-4 items-center mt-[0.15rem] max-[780px]:grid-cols-1">
                <div id="duty-area-message" className="w-full min-h-[56px] flex items-center m-0 p-[0.9rem_1rem] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg !text-[#4c5d7d] !text-sm !font-bold" role="status" aria-live="polite">
                  Complete the duty area fields before saving.
                </div>

                <div className="flex justify-end items-center max-[780px]:justify-stretch">
                  <button className="inline-flex items-center justify-center w-auto min-w-[210px] min-h-[50px] px-[30px] whitespace-nowrap rounded-[10px] bg-[#8A252C] !text-white !text-[0.95rem] !font-extrabold shadow-[0_10px_22px_rgba(138,37,44,0.18)] hover:bg-[#6d1d23] hover:shadow-[0_16px_34px_rgba(138,37,44,0.22)] transition-all cursor-pointer max-[780px]:w-full max-[780px]:min-w-0" type="submit">Add Duty Area</button>
                </div>
              </div>
            </form>
          </article>
        </section>

        <section className="mt-6 p-[1.45rem] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)]">
          <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-[#e5eaf1] flex-wrap">
            <div>
              <h2 className="m-0 !text-[#111827] !text-[1.25rem] leading-[1.15] !font-bold">Hospital List</h2>
            </div>
            <span className="inline-flex items-center px-[10px] py-[4px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#e9f8ef] !text-[#078033]" id="hospital-list-badge">{hospitals.length} active</span>
          </div>

          <div className="w-full overflow-hidden border border-[#dbe3ee] rounded-xl max-[780px]:overflow-x-auto max-[780px]:overflow-y-hidden" id="hospital-list">
            <div className="grid grid-cols-[minmax(0,1fr)_160px_130px] items-center gap-4 w-full p-[1rem_1.25rem] bg-[#f8fafc] border-b border-[#dbe3ee] max-[1100px]:grid-cols-[minmax(0,1fr)_140px_120px] max-[780px]:grid-cols-[minmax(240px,1fr)_130px_110px] max-[780px]:min-w-[540px]">
              <span className="min-w-0 whitespace-nowrap !text-[#0b1b3a] !text-[0.85rem] !font-extrabold uppercase">Hospital</span>
              <span className="min-w-0 whitespace-nowrap !text-[#0b1b3a] !text-[0.85rem] !font-extrabold uppercase">Code</span>
              <span className="flex justify-center text-center whitespace-nowrap !text-[#0b1b3a] !text-[0.85rem] !font-extrabold uppercase">Action</span>
            </div>

            {hospitals.map((h, idx) => (
              <div className="grid grid-cols-[minmax(0,1fr)_160px_130px] items-center gap-4 w-full p-[1rem_1.25rem] border-b border-[#e5eaf1] last:border-b-0 max-[1100px]:grid-cols-[minmax(0,1fr)_140px_120px] max-[780px]:grid-cols-[minmax(240px,1fr)_130px_110px] max-[780px]:min-w-[540px]" data-location-row data-location-type="hospital" key={idx}>
                <span className="min-w-0 whitespace-nowrap !text-[#111827] !text-sm" data-hospital-name><strong className="!font-[800] whitespace-nowrap">{h.name}</strong></span>
                <span className="min-w-0 whitespace-nowrap !text-[#4c5d7d] !text-sm !font-semibold" data-hospital-code>{h.code}</span>
                <span className="flex justify-center text-center whitespace-nowrap"><button className="flex items-center justify-center w-[88px] min-w-[88px] min-h-[42px] px-[18px] whitespace-nowrap rounded-lg bg-white border border-[#e2e8f0] !text-[#334155] !text-sm !font-bold hover:bg-[#f8fafc] transition-colors cursor-pointer" type="button" data-edit-location onClick={() => setEditingHospital(h)}>Edit</button></span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 p-[1.45rem] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)]">
          <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-[#e5eaf1] flex-wrap">
            <div>
              <h2 className="m-0 !text-[#111827] !text-[1.25rem] leading-[1.15] !font-bold">Duty Area List</h2>
            </div>
            <span className="inline-flex items-center px-[10px] py-[4px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#e9f8ef] !text-[#078033]" id="duty-area-list-badge">{dutyAreas.length} active</span>
          </div>

          <div className="w-full overflow-hidden border border-[#dbe3ee] rounded-xl max-[780px]:overflow-x-auto max-[780px]:overflow-y-hidden" id="duty-area-list">
            <div className="grid grid-cols-[minmax(0,1fr)_160px_130px] items-center gap-4 w-full p-[1rem_1.25rem] bg-[#f8fafc] border-b border-[#dbe3ee] max-[1100px]:grid-cols-[minmax(0,1fr)_140px_120px] max-[780px]:grid-cols-[minmax(240px,1fr)_130px_110px] max-[780px]:min-w-[540px]">
              <span className="min-w-0 whitespace-nowrap !text-[#0b1b3a] !text-[0.85rem] !font-extrabold uppercase">Duty Area</span>
              <span className="min-w-0 whitespace-nowrap !text-[#0b1b3a] !text-[0.85rem] !font-extrabold uppercase">Hospital</span>
              <span className="flex justify-center text-center whitespace-nowrap !text-[#0b1b3a] !text-[0.85rem] !font-extrabold uppercase">Action</span>
            </div>

            {dutyAreas.map((d, idx) => (
              <div className="grid grid-cols-[minmax(0,1fr)_160px_130px] items-center gap-4 w-full p-[1rem_1.25rem] border-b border-[#e5eaf1] last:border-b-0 max-[1100px]:grid-cols-[minmax(0,1fr)_140px_120px] max-[780px]:grid-cols-[minmax(240px,1fr)_130px_110px] max-[780px]:min-w-[540px]" data-location-row data-location-type="duty" key={idx}>
                <span className="min-w-0 whitespace-nowrap !text-[#111827] !text-sm" data-duty-name><strong className="!font-[800] whitespace-nowrap">{d.name}</strong></span>
                <span className="min-w-0 whitespace-nowrap !text-[#4c5d7d] !text-sm !font-semibold" data-duty-hospital>{d.hospital}</span>
                <span className="flex justify-center text-center whitespace-nowrap"><button className="flex items-center justify-center w-[88px] min-w-[88px] min-h-[42px] px-[18px] whitespace-nowrap rounded-lg bg-white border border-[#e2e8f0] !text-[#334155] !text-sm !font-bold hover:bg-[#f8fafc] transition-colors cursor-pointer" type="button" data-edit-location onClick={() => setEditingDutyArea(d)}>Edit</button></span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {(editingHospital || editingDutyArea) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-[1.25rem] bg-[#0f172a]/[0.45]" id="edit-location-modal">
          <section className="w-[min(620px,calc(100vw-2rem))] p-0 overflow-hidden rounded-lg bg-white shadow-[0_26px_68px_rgba(15,23,42,0.24)]" role="dialog" aria-modal="true" aria-labelledby="edit-location-title">
            <div className="grid grid-cols-[minmax(0,1fr)_48px] gap-4 items-start p-[1.65rem_1.75rem_1.1rem] border-b border-[#e5eaf1] bg-white">
              <div className="min-w-0">
                <h2 className="m-0 !text-[#111827] !text-[1.45rem] leading-[1.2] !font-bold" id="edit-location-title">{editingHospital ? "Edit Hospital" : "Edit Duty Area"}</h2>
                <p className="mt-[0.45rem] mb-0 !text-[#4c5d7d] !text-[0.95rem] !font-bold leading-[1.45]" id="edit-location-subtitle">{editingHospital ? "Rename the hospital or update the short code." : "Rename the duty area or update its hospital."}</p>
              </div>
              <button
                className="relative grid place-items-center w-[48px] h-[48px] min-w-[48px] border border-[#dbe3ee] rounded-lg bg-white !text-[#0f1b33] cursor-pointer transition-all hover:border-[#8a252c] hover:bg-white hover:!text-[#8a252c] hover:shadow-[0_10px_22px_rgba(138,37,44,0.12)] hover:-translate-y-px focus-visible:border-[#8a252c] focus-visible:bg-white focus-visible:!text-[#8a252c] focus-visible:shadow-[0_10px_22px_rgba(138,37,44,0.12)] focus-visible:-translate-y-px outline-none active:translate-y-0 active:shadow-none before:absolute before:content-[''] before:w-[15px] before:h-[2px] before:rounded-full before:bg-current before:rotate-45 before:transition-colors after:absolute after:content-[''] after:w-[15px] after:h-[2px] after:rounded-full after:bg-current after:-rotate-45 after:transition-colors"
                type="button"
                id="close-edit-location"
                aria-label="Close modal"
                onClick={() => { setEditingHospital(null); setEditingDutyArea(null); }}
              ></button>
            </div>

            <form className="grid grid-cols-2 gap-4 gap-y-[1.15rem] p-[1.4rem_1.75rem_1.25rem] max-[780px]:grid-cols-1" id="edit-location-form" onSubmit={(e) => { e.preventDefault(); setEditingHospital(null); setEditingDutyArea(null); }}>
              <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]" htmlFor="edit-location-name">
                <span id="edit-location-name-label">{editingHospital ? "Hospital Name" : "Duty Area"}</span>
                <input className="min-h-[48px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all" id="edit-location-name" type="text" defaultValue={editingHospital ? editingHospital.name : editingDutyArea?.name} required />
              </label>

              <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]" htmlFor="edit-location-code">
                <span id="edit-location-code-label">{editingHospital ? "Short Code" : "Hospital"}</span>
                {editingHospital ? (
                  <input className="min-h-[48px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all" id="edit-location-code" type="text" defaultValue={editingHospital.code} required />
                ) : (
                  <select className="min-h-[48px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all cursor-pointer" id="edit-location-hospital" defaultValue={editingDutyArea?.hospital} required>
                    {hospitals.map(h => <option key={h.code} value={h.code}>{h.code}</option>)}
                  </select>
                )}
              </label>
            </form>

            <div className="flex items-center justify-end gap-4 p-[1.25rem_1.75rem_1.65rem] border-t border-[#e5eaf1] bg-[#f8fafc] max-[780px]:flex-col max-[780px]:items-stretch">
              <button className="inline-flex items-center justify-center w-auto min-w-[150px] min-h-[50px] px-[26px] rounded-xl !text-[0.95rem] !font-extrabold whitespace-nowrap bg-white border border-[#8a252c]/32 !text-[#8a252c] hover:border-[#8a252c]/55 hover:bg-[#fff5f5] transition-colors cursor-pointer max-[780px]:w-full max-[780px]:min-w-0" type="button" id="open-delete-location" onClick={() => { setEditingHospital(null); setEditingDutyArea(null); }}>Deactivate</button>

              <div className="flex justify-end items-center gap-[0.85rem] flex-wrap m-0 max-[780px]:justify-stretch">
                <button className="inline-flex items-center justify-center w-auto min-w-[150px] min-h-[50px] px-[26px] rounded-xl !text-[0.95rem] !font-extrabold whitespace-nowrap bg-[#8A252C] !text-white shadow-[0_10px_22px_rgba(138,37,44,0.18)] hover:bg-[#6d1d23] hover:shadow-[0_16px_34px_rgba(138,37,44,0.22)] transition-all cursor-pointer max-[780px]:w-full max-[780px]:min-w-0" type="submit" form="edit-location-form">Review Changes</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
