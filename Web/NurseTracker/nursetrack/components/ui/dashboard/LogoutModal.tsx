"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/core/store/authStore';

interface LogoutModalProps {
  open: boolean;
  onClose: () => void;
}

export function LogoutModal({ open, onClose }: LogoutModalProps) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  if (!open) return null;

  const handleLogout = () => {
    logout();
    onClose();
    router.push('/');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-[rgba(0,0,0,0.45)] backdrop-blur-[4px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-[20px]">
        <div
          className="w-full max-w-[440px] rounded-[14px] bg-white shadow-[0_32px_80px_rgba(0,0,0,0.22)] p-[clamp(28px,4vw,38px)] animate-[fadeUp_320ms_ease_both]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
        >
          {/* Logout icon — SVG, no emoji */}
          <div className="w-[56px] h-[56px] rounded-full bg-[#FFCF01] flex items-center justify-center mb-[18px]">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8A252C"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </div>

          {/* Kicker */}
          <p className="!m-0 !mb-[8px] !text-[#8A252C] !text-[0.8rem] !font-[900] uppercase tracking-wide">
            Confirm Logout
          </p>

          {/* Heading */}
          <h2 className="!m-0 !mb-[10px] !text-[#111827] !text-[1.4rem] !font-[850] !leading-[1.2]" id="logout-title">
            Are you sure you want to log out?
          </h2>

          {/* Description */}
          <p className="!m-0 !mb-[32px] !text-[#475569] !text-[0.95rem] !font-[500] !leading-[1.5]">
            You will return to the NurseTrack login screen.
          </p>

          {/* Actions — equal width, equal height, same font size */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center w-full min-h-[48px] px-4 rounded-lg bg-white border border-[#dbe3ee] !text-[#344054] !text-[0.95rem] !font-[800] hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:!text-[#0f172a] transition-all duration-200 cursor-pointer shadow-[0_1px_2px_rgba(16,24,40,0.05)]"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center w-full min-h-[48px] px-4 rounded-lg bg-[#8A252C] border border-[#8A252C] !text-white !text-[0.95rem] !font-[800] hover:bg-[#6d1d23] hover:border-[#6d1d23] transition-all duration-200 cursor-pointer shadow-[0_4px_12px_rgba(138,37,44,0.18)]"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
