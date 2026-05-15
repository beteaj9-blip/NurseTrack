"use client";

import React, { useState } from "react";

export default function AssistantAccessPage() {
  const [chairLevels, setChairLevels] = useState<Record<string, string>>({
    'chair-reyes': 'level-1',
    'chair-mendoza': 'level-2',
    'chair-santos': 'level-3',
    'chair-lim': 'level-4',
  });

  const [assistantLevels, setAssistantLevels] = useState<Record<string, string>>({
    'assistant-garcia': 'level-1',
    'assistant-navarro': 'level-2',
    'assistant-dela-cruz': 'level-3',
    'assistant-bautista': 'level-4',
  });

  const [assistantAccess, setAssistantAccess] = useState<Record<string, boolean>>({
    manualBackup: false,
    clearance: false,
    clinicalCases: false,
    ciRecommendations: false,
  });

  const [coordinatorAccess, setCoordinatorAccess] = useState<Record<string, boolean>>({
    manualBackup: false,
    clearance: false,
    clinicalCases: false,
    ciRecommendations: false,
  });

  return (
    <>
      <main className="p-[clamp(24px,4vw,42px)] content-start grid gap-4 w-full">
        <section className="mt-0 p-[1.45rem] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] grid gap-4">
          <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-[#e5eaf1] flex-wrap">
            <div>
              <h2 className="m-0 !text-[#111827] !text-[1.25rem] leading-[1.15] !font-bold">Chair Level Assignments</h2>
            </div>
            <span className="inline-flex items-center px-[10px] py-[4px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#fff6cc] !text-[#6c4c00]">One level per chair</span>
          </div>

          <div className="grid gap-[0.85rem]">
            {[
              { id: 'chair-reyes', initials: 'CR', name: 'Chair Clarissa Reyes' },
              { id: 'chair-mendoza', initials: 'JM', name: 'Chair Jessa Mendoza' },
              { id: 'chair-santos', initials: 'LS', name: 'Chair Liza Santos' },
              { id: 'chair-lim', initials: 'RL', name: 'Chair Rafael Lim' },
            ].map((chair) => (
              <article className="grid grid-cols-[minmax(260px,0.85fr)_minmax(420px,1.15fr)] gap-4 items-center p-[1rem_1.1rem] border border-[#e2e8f0] rounded-[0.75rem] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)] max-[980px]:grid-cols-1" key={chair.id}>
                <div className="flex items-center gap-[0.85rem] min-w-0">
                  <span className="w-[46px] h-[46px] min-w-[46px] min-h-[46px] inline-flex items-center justify-center rounded-full leading-none p-0 !text-[0.86rem] !font-[850] bg-[#FFCF01] !text-[#111827]">
                    {chair.initials}
                  </span>
                  <div className="min-w-0">
                    <strong className="block !text-[#111827] !text-[0.98rem] !font-[850] leading-[1.25]">{chair.name}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-[0.55rem] max-[560px]:grid-cols-2" role="radiogroup" aria-label={`${chair.name} level access`}>
                  {[1, 2, 3, 4].map((level) => (
                    <label 
                      className={`relative grid place-items-center min-h-[44px] px-3 border rounded-[0.6rem] cursor-pointer !text-[0.88rem] !font-[850] text-center transition-all hover:border-[#8a252c]/35 hover:!text-[#8a252c] ${chairLevels[chair.id] === `level-${level}` ? 'border-[#8a252c] bg-[#fff7f7] !text-[#8a252c] shadow-[0_8px_18px_rgba(138,37,44,0.1)]' : 'border-[#dbe3ee] bg-white !text-[#334155]'}`} 
                      key={level}
                    >
                      <input 
                        className="absolute opacity-0 pointer-events-none"
                        type="radio" 
                        name={`${chair.id}-level`} 
                        value={`level-${level}`} 
                        checked={chairLevels[chair.id] === `level-${level}`}
                        onChange={() => setChairLevels({ ...chairLevels, [chair.id]: `level-${level}` })}
                      />
                      Level {level}
                    </label>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-0 p-[1.45rem] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] grid gap-4">
          <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-[#e5eaf1] flex-wrap">
            <div>
              <h2 className="m-0 !text-[#111827] !text-[1.25rem] leading-[1.15] !font-bold">Assistant Level Assignments</h2>
            </div>
            <span className="inline-flex items-center px-[10px] py-[4px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#fff6cc] !text-[#6c4c00]">One level per assistant</span>
          </div>

          <div className="grid gap-[0.85rem]">
            {[
              { id: 'assistant-garcia', initials: 'AG', name: 'Assistant Andrea Garcia' },
              { id: 'assistant-navarro', initials: 'PN', name: 'Assistant Paula Navarro' },
              { id: 'assistant-dela-cruz', initials: 'DC', name: 'Assistant Dana Dela Cruz' },
              { id: 'assistant-bautista', initials: 'MB', name: 'Assistant Mara Bautista' },
            ].map((assistant) => (
              <article className="grid grid-cols-[minmax(260px,0.85fr)_minmax(420px,1.15fr)] gap-4 items-center p-[1rem_1.1rem] border border-[#e2e8f0] rounded-[0.75rem] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)] max-[980px]:grid-cols-1" key={assistant.id}>
                <div className="flex items-center gap-[0.85rem] min-w-0">
                  <span className="w-[46px] h-[46px] min-w-[46px] min-h-[46px] inline-flex items-center justify-center rounded-full leading-none p-0 !text-[0.86rem] !font-[850] bg-[#FFCF01] !text-[#111827]">
                    {assistant.initials}
                  </span>
                  <div className="min-w-0">
                    <strong className="block !text-[#111827] !text-[0.98rem] !font-[850] leading-[1.25]">{assistant.name}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-[0.55rem] max-[560px]:grid-cols-2" role="radiogroup" aria-label={`${assistant.name} level access`}>
                  {[1, 2, 3, 4].map((level) => (
                    <label 
                      className={`relative grid place-items-center min-h-[44px] px-3 border rounded-[0.6rem] cursor-pointer !text-[0.88rem] !font-[850] text-center transition-all hover:border-[#8a252c]/35 hover:!text-[#8a252c] ${assistantLevels[assistant.id] === `level-${level}` ? 'border-[#8a252c] bg-[#fff7f7] !text-[#8a252c] shadow-[0_8px_18px_rgba(138,37,44,0.1)]' : 'border-[#dbe3ee] bg-white !text-[#334155]'}`} 
                      key={level}
                    >
                      <input 
                        className="absolute opacity-0 pointer-events-none"
                        type="radio" 
                        name={`${assistant.id}-level`} 
                        value={`level-${level}`} 
                        checked={assistantLevels[assistant.id] === `level-${level}`}
                        onChange={() => setAssistantLevels({ ...assistantLevels, [assistant.id]: `level-${level}` })}
                      />
                      Level {level}
                    </label>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-0 p-[1.45rem] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] grid gap-4">
          <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-[#e5eaf1] flex-wrap">
            <div>
              <h2 className="m-0 !text-[#111827] !text-[1.25rem] leading-[1.15] !font-bold">Assistant Edit Permissions</h2>
            </div>
            <span className="inline-flex items-center px-[10px] py-[4px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#fff6cc] !text-[#6c4c00]">Assistant controls</span>
          </div>

          <div className="grid grid-cols-2 gap-[0.85rem] max-[760px]:grid-cols-1">
            {[
              { id: 'manualBackup', title: 'Manual Backup', desc: 'Assistant can already view Manual Backup. Turn this on only to allow approving or returning encoded attendance.' },
              { id: 'clearance', title: 'Clearance', desc: 'Assistant can already view Clearance. Turn this on only to allow approving or canceling clearance approval.' },
              { id: 'clinicalCases', title: 'Clinical Cases View', desc: 'Assistant can already view Clinical Cases. Turn this on only to allow editing approval or rejection decisions.' },
              { id: 'ciRecommendations', title: 'CI Recommendations', desc: 'Assistant can already view CI Recommendations. Turn this on only to allow accepting, rejecting, or editing decisions.' },
            ].map((item) => (
              <div className="grid grid-cols-[1fr_auto] gap-4 items-center min-h-[112px] p-[1.05rem_1.1rem] border border-[#e2e8f0] rounded-[0.75rem] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)] max-[560px]:grid-cols-1" key={item.id}>
                <div className="min-w-0">
                  <h3 className="m-0 !text-[#111827] !text-base !font-[850] leading-[1.25]">{item.title}</h3>
                  <p className="mt-[0.32rem] mb-0 !text-[#475569] !text-[0.85rem] !font-[750] leading-[1.45]">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center w-[58px] h-[32px] cursor-pointer shrink-0" htmlFor={`assistant-access-${item.id}`} aria-label={`Toggle Assistant ${item.title} access`}>
                  <input 
                    className="absolute opacity-0 pointer-events-none peer"
                    id={`assistant-access-${item.id}`} 
                    type="checkbox" 
                    checked={assistantAccess[item.id]}
                    onChange={(e) => setAssistantAccess({ ...assistantAccess, [item.id]: e.target.checked })}
                  />
                  <span className="absolute inset-0 border border-[#cbd5e1] rounded-full bg-[#e2e8f0] transition-colors peer-checked:border-[#8a252c] peer-checked:bg-[#8a252c] peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-[#8a252c]/25 peer-focus-visible:outline-offset-3 before:content-[''] before:absolute before:top-[2px] before:left-[2px] before:w-[26px] before:h-[26px] before:rounded-full before:bg-white before:shadow-[0_6px_14px_rgba(15,23,42,0.18)] before:transition-transform peer-checked:before:translate-x-[26px]"></span>
                </label>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-0 p-[1.45rem] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] grid gap-4">
          <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-[#e5eaf1] flex-wrap">
            <div>
              <h2 className="m-0 !text-[#111827] !text-[1.25rem] leading-[1.15] !font-bold">Coordinator Edit Permissions</h2>
            </div>
            <span className="inline-flex items-center px-[10px] py-[4px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#fff6cc] !text-[#6c4c00]">Coordinator controls</span>
          </div>

          <div className="grid grid-cols-2 gap-[0.85rem] max-[760px]:grid-cols-1">
            {[
              { id: 'manualBackup', title: 'Manual Backup', desc: 'Coordinator can already view Manual Backup. Turn this on only to allow approving or returning encoded attendance.' },
              { id: 'clearance', title: 'Clearance', desc: 'Coordinator can already view Clearance. Turn this on only to allow approving or canceling clearance approval.' },
              { id: 'clinicalCases', title: 'Clinical Cases View', desc: 'Coordinator can already view Clinical Cases. Turn this on only to allow editing approval or rejection decisions.' },
              { id: 'ciRecommendations', title: 'CI Recommendations', desc: 'Coordinator can already view CI Recommendations. Turn this on only to allow accepting, rejecting, or editing decisions.' },
            ].map((item) => (
              <div className="grid grid-cols-[1fr_auto] gap-4 items-center min-h-[112px] p-[1.05rem_1.1rem] border border-[#e2e8f0] rounded-[0.75rem] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)] max-[560px]:grid-cols-1" key={item.id}>
                <div className="min-w-0">
                  <h3 className="m-0 !text-[#111827] !text-base !font-[850] leading-[1.25]">{item.title}</h3>
                  <p className="mt-[0.32rem] mb-0 !text-[#475569] !text-[0.85rem] !font-[750] leading-[1.45]">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center w-[58px] h-[32px] cursor-pointer shrink-0" htmlFor={`coordinator-access-${item.id}`} aria-label={`Toggle Coordinator ${item.title} access`}>
                  <input 
                    className="absolute opacity-0 pointer-events-none peer"
                    id={`coordinator-access-${item.id}`} 
                    type="checkbox" 
                    checked={coordinatorAccess[item.id]}
                    onChange={(e) => setCoordinatorAccess({ ...coordinatorAccess, [item.id]: e.target.checked })}
                  />
                  <span className="absolute inset-0 border border-[#cbd5e1] rounded-full bg-[#e2e8f0] transition-colors peer-checked:border-[#8a252c] peer-checked:bg-[#8a252c] peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-[#8a252c]/25 peer-focus-visible:outline-offset-3 before:content-[''] before:absolute before:top-[2px] before:left-[2px] before:w-[26px] before:h-[26px] before:rounded-full before:bg-white before:shadow-[0_6px_14px_rgba(15,23,42,0.18)] before:transition-transform peer-checked:before:translate-x-[26px]"></span>
                </label>
              </div>
            ))}
          </div>

          <div id="assistant-access-message" className="flex items-center min-h-[48px] mt-4 px-4 rounded-lg bg-[#f8fafc] !text-[#4c5d7d] !text-[0.85rem] !font-bold border border-[#e2e8f0]" role="status" aria-live="polite">
            Level assignments and edit permissions are UI-only for now.
          </div>
        </section>
      </main>
    </>
  );
}
