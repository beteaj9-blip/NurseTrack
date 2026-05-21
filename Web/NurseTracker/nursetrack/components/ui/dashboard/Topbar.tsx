"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNotifications } from '@/core/api/hooks/useNotifications';
import { useAuthStore } from '@/core/store/authStore';
import { roleToBasePath } from '@/core/types/user';
import { BackButton } from './BackButton';
import { LogoutModal } from './LogoutModal';

interface TopbarProps {
  titleKicker: string;
  title: string;
  onMenuClick?: () => void;
  syncTime?: string;
  backHref?: string;
}

export function Topbar({ titleKicker, title, onMenuClick, backHref }: TopbarProps) {
  const [showLogout, setShowLogout] = useState(false);
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const { data: notifications = [] } = useNotifications(undefined, !!user);
  const unreadCount = (notifications as any[]).filter((notification) => notification.read === false || notification.isRead === false).length;
  
  const roleBase = user?.role ? roleToBasePath[user.role] : `/${pathname.split('/')[1] || ''}`;
  const notifHref = roleBase ? `${roleBase}/notifications` : '/notifications';
  const isNotifications = pathname.includes('/notifications');

  return (
    <>
      <header className="sticky top-0 z-[50] flex items-center justify-between gap-5 min-h-[76px] px-[clamp(20px,4vw,34px)] py-[14px] border-b border-[#e5eaf1] bg-white/[0.94] backdrop-blur-[12px] max-[760px]:gap-1.5 max-[760px]:min-h-[64px] max-[760px]:px-2 max-[760px]:py-2">
        <div className="flex items-center gap-3 min-w-0 max-[760px]:gap-1 max-[760px]:flex-1">
          <button
            className="inline-flex lg:hidden items-center justify-center min-h-[38px] p-2 border border-[#dbe3ee] rounded-lg bg-white !text-[#344054] cursor-pointer hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:!text-[#0f172a] hover:shadow-sm hover:-translate-y-px transition-all max-[760px]:min-w-[34px] max-[760px]:min-h-[38px] max-[760px]:px-0 max-[760px]:rounded-md"
            type="button"
            onClick={onMenuClick}
            aria-label="Toggle sidebar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ width: 18, height: 18 }}>
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          {backHref && <BackButton href={backHref} />}

          <Image
            className="w-[38px] h-[38px] object-contain max-[760px]:w-[28px] max-[760px]:h-[28px]"
            src="/assets/cit-u-logo.png"
            alt="CIT-U logo"
            width={38}
            height={38}
          />
          <div className="min-w-0">
            <p className="m-0 mb-[2px] !text-[#64748b] !text-[0.78rem] !font-[800] uppercase tracking-wide truncate max-[760px]:!text-[0.64rem] max-[760px]:mb-0">{titleKicker}</p>
            <h1 className="m-0 !text-[#111827] !text-[1.35rem] leading-[1.1] !font-[850] truncate max-[760px]:!text-[0.98rem] max-[760px]:leading-[1.05]">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-[10px] max-[760px]:gap-1 max-[760px]:shrink-0">
          <Link className={`relative inline-flex items-center justify-center w-[42px] min-w-[42px] min-h-[38px] p-2 border rounded-lg cursor-pointer transition-all max-[760px]:w-[38px] max-[760px]:min-w-[38px] max-[760px]:min-h-[38px] max-[760px]:rounded-md ${isNotifications ? 'bg-[#8A252C] border-[#8A252C] !text-white hover:bg-[#681920]' : 'border-[#dbe3ee] bg-white !text-[#344054] hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:!text-[#0f172a] hover:shadow-sm hover:-translate-y-px'}`} href={notifHref} aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} title="Notifications">
            <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid min-w-[18px] h-[18px] place-items-center rounded-full border-2 border-white bg-[#dc2626] px-1 !text-[0.62rem] !font-[900] leading-none !text-white shadow-[0_6px_14px_rgba(220,38,38,0.28)]">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          <Link className={`inline-flex items-center justify-center w-[42px] min-w-[42px] min-h-[38px] p-2 border rounded-lg cursor-pointer transition-all max-[760px]:w-[38px] max-[760px]:min-w-[38px] max-[760px]:min-h-[38px] max-[760px]:rounded-md ${pathname.includes('/profile') ? 'bg-[#8A252C] border-[#8A252C] !text-white hover:bg-[#681920]' : 'border-[#dbe3ee] bg-white !text-[#344054] hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:!text-[#0f172a] hover:shadow-sm hover:-translate-y-px'}`} href={roleBase ? `${roleBase}/profile` : '#'} aria-label="Profile" title="Profile">
            <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="8" r="4"></circle>
              <path d="M4 21a8 8 0 0 1 16 0"></path>
            </svg>
          </Link>

          <button type="button" className="inline-flex items-center justify-center min-h-[38px] px-3 py-2 border border-[#dbe3ee] rounded-lg bg-white !text-[#344054] !text-[0.84rem] !font-[800] no-underline cursor-pointer hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:!text-[#0f172a] hover:shadow-sm hover:-translate-y-px transition-all max-[760px]:w-[38px] max-[760px]:min-w-[38px] max-[760px]:min-h-[38px] max-[760px]:px-0 max-[760px]:rounded-md" onClick={() => setShowLogout(true)} aria-label="Logout" title="Logout">
            <span className="max-[760px]:hidden">Logout</span>
            <svg className="hidden w-5 h-5 fill-none stroke-current stroke-2 max-[760px]:block" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
          </button>
        </div>
      </header>

      <LogoutModal open={showLogout} onClose={() => setShowLogout(false)} />
    </>
  );
}
