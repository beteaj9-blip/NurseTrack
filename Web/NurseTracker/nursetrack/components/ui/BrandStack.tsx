import React from 'react';
import Image from 'next/image';

interface BrandStackProps {
  className?: string;
  isDashboard?: boolean;
}

export function BrandStack({ isDashboard = false }: BrandStackProps) {
  return (
    <div className="flex items-center gap-[16px] animate-[fadeUp_680ms_120ms_ease_both]">
      <Image 
        className="block object-contain rounded-full bg-white p-[6px] shadow-[0_16px_34px_rgba(0,0,0,0.16)]"
        src="/assets/cit-u-logo.png" 
        alt="Cebu Institute of Technology - University logo" 
        width={isDashboard ? 40 : 72} 
        height={isDashboard ? 40 : 72} 
        priority
      />
      <div>
        <p className="m-0 text-[#ffcf01] text-[0.78rem] font-[800] leading-[1.35] uppercase">CIT-U Nursing Portal</p>
        {isDashboard ? (
          <span className="block text-white text-[1.2rem] font-[800] leading-[1.1]">NurseTrack</span>
        ) : (
          <h1 id="page-title" className="!m-0 !text-white !text-[clamp(2.1rem,5vw,3.7rem)] !font-[800] !leading-[0.98]">NurseTrack</h1>
        )}
      </div>
    </div>
  );
}
