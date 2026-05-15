"use client";

import React, { useLayoutEffect, useRef } from 'react';
import { BrandStack } from './BrandStack';

const PANEL_KEY = 'nt-auth-panel-shown';
const SWEEP_KEY  = 'nt-auth-sweep-start';
const SWEEP_DURATION_MS = 5000; // must match the CSS @keyframe duration

interface AuthInfoPanelProps {
  headline: string;
  description: string;
  highlights: string[];
}

export function AuthInfoPanel({ headline, description, highlights }: AuthInfoPanelProps) {
  const panelRef   = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const now = Date.now();

    // ── panelInLeft: play only on the very first visit ──────────────────────
    const hasShown = sessionStorage.getItem(PANEL_KEY);
    if (!hasShown && panelRef.current) {
      panelRef.current.style.animation = 'panelInLeft 720ms ease both';
      sessionStorage.setItem(PANEL_KEY, String(now));
    }

    // ── accentSweep: resume mid-cycle so it looks continuous ─────────────────
    // Store the "birth" time on first visit. On every subsequent mount we
    // calculate how far through the cycle we are and apply a matching
    // negative delay so the animation picks up exactly where it left off.
    if (overlayRef.current) {
      let startTime = parseInt(sessionStorage.getItem(SWEEP_KEY) ?? '0');
      if (!startTime) {
        startTime = now;
        sessionStorage.setItem(SWEEP_KEY, String(now));
      }

      const elapsed   = now - startTime;
      // alternate = forward + backward = 2 × duration per full cycle
      const fullCycle = SWEEP_DURATION_MS * 2;
      const phase     = elapsed % fullCycle;           // position in current cycle (ms)
      const delayS    = -(phase / 1000).toFixed(3);   // negative delay resumes mid-cycle

      overlayRef.current.style.animation =
        `accentSweep ${SWEEP_DURATION_MS / 1000}s ease-in-out ${delayS}s infinite alternate`;
    }
  }, []);

  return (
    <section
      ref={panelRef}
      className="relative w-full min-h-screen overflow-hidden text-white max-[820px]:min-h-[320px]"
      style={{
        background: 'linear-gradient(160deg, rgba(138,37,44,0.96), rgba(104,25,32,0.98)), #8A252C',
        animation: 'none', // server default — useLayoutEffect changes it on first visit only
      }}
      aria-label="NurseTrack information"
    >
      {/* Animated diagonal accent lines — resumed mid-cycle on re-mount */}
      <div
        ref={overlayRef}
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{
          left: '-25%',
          right: '-25%',
          background:
            'linear-gradient(115deg, transparent 0 60%, rgba(255,207,1,0.12) 60% 63%, transparent 63%),' +
            'linear-gradient(115deg, transparent 0 72%, rgba(255,255,255,0.08) 72% 74%, transparent 74%)',
          transform: 'translateX(-8%)',
          animation: 'none', // overridden in useLayoutEffect
        }}
      />

      <div className="relative z-[1] min-h-[inherit] grid content-between gap-[48px] p-[clamp(32px,5vw,58px)]">
        <BrandStack />

        <div className="max-w-[520px]">
          <h2 className="!mb-[16px] !text-[clamp(2rem,4vw,3.3rem)] !leading-[1.04] !text-white !font-[800]">
            {headline}
          </h2>
          <p className="max-w-[460px] m-0 text-[rgba(255,255,255,0.82)] text-[1rem] font-[500] leading-[1.7]">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap gap-[10px]" aria-label="NurseTrack highlights">
          {highlights.map((tag) => (
            <span
              key={tag}
              className="min-h-[38px] border border-[rgba(255,255,255,0.28)] rounded-full bg-[rgba(255,255,255,0.11)] text-white inline-flex items-center px-[14px] py-[8px] text-[0.82rem] font-[800] transition-all hover:border-[rgba(255,207,1,0.7)] hover:bg-[rgba(255,207,1,0.16)] hover:-translate-y-[2px]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
