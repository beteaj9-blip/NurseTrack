import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface NavItem {
  label: string;
  href: string;
  isActive?: boolean;
  topbarTitle?: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  role: string;
  userName: string;
  userContext: string;
  avatarInitials: string;
  navItems: NavItem[];
  isOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
}

const LogoutIcon = (
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </>
);

export function Sidebar({ role, userName, userContext, avatarInitials, navItems, isOpen = false, onClose, onLogout }: SidebarProps) {
  const roleSlug = navItems[0]?.href?.split('/')[1] || '';

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-[100] w-[min(286px,86vw)] transform transition-transform duration-220 ease-in-out lg:sticky lg:top-0 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col gap-[22px] h-screen bg-[linear-gradient(135deg,rgba(255,207,1,0.08)_0_1px,transparent_1px_72px),linear-gradient(180deg,#982a32_0%,#8A252C_46%,#681920_100%)] bg-[length:72px_72px,100%_100%] bg-[#681920] text-white px-[22px] pt-[22px] pb-[28px] overflow-y-auto overflow-x-hidden`}
      aria-label="Primary navigation"
    >
      {/* Brand */}
      <Link className="flex items-center gap-3 text-inherit no-underline transition-transform duration-160 ease-in hover:translate-x-[2px] focus-visible:translate-x-[2px]" href="/" aria-label="About NurseTrack">
        <Image
          className="w-[52px] h-[52px] rounded-full bg-white p-1 object-contain"
          src="/assets/cit-u-logo.png"
          alt="CIT-U logo"
          width={52}
          height={52}
          priority
        />
        <div>
          <strong className="block text-[1.2rem] leading-[1.1] font-bold">NurseTrack</strong>
          <span className="block text-white/[0.72] text-[0.78rem] font-bold mt-[3px]">CIT-U Nursing</span>
        </div>
      </Link>

      {/* Role chip */}
      <div className="inline-flex items-center justify-center min-h-[38px] rounded-lg bg-[#FFCF01] text-[#332800] text-[0.84rem] font-bold shadow-[0_2px_4px_rgba(255,207,1,0.22)] px-3">{role}</div>

      {/* Nav links */}
      <nav className="grid content-start gap-2 min-h-0 overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin scrollbar-thumb-[#FFCF01]/[0.72] scrollbar-track-white/[0.08] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-white/[0.08] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#FFCF01]/[0.72] [&::-webkit-scrollbar-thumb]:rounded-full">
        {navItems.map((item) => (
          <Link
            key={item.href}
            className={`group flex items-center gap-3 min-h-[44px] rounded-lg text-white/[0.78] text-[0.92rem] font-[800] px-3 py-2.5 no-underline transition-all duration-160 ease-in hover:bg-white/[0.14] hover:text-white hover:translate-x-[2px] focus-visible:bg-white/[0.14] focus-visible:text-white ${item.isActive ? 'bg-white/[0.14] !text-white shadow-[inset_4px_0_0_#FFCF01]' : ''}`}
            href={item.href}
            aria-current={item.isActive ? 'page' : undefined}
          >
            {item.icon ? (
              <span className={`flex-none grid place-items-center w-[30px] h-[30px] border rounded-lg bg-white/[0.08] transition-all duration-160 ease-in group-hover:border-[#FFCF01]/[0.52] group-hover:text-[#FFCF01] group-hover:scale-[1.04] ${item.isActive ? 'border-[#FFCF01]/[0.95] !bg-[#FFCF01] !text-[#332800] shadow-[0_8px_20px_rgba(255,207,1,0.18)]' : 'border-white/[0.16] text-white/[0.8]'}`} aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  focusable={false}
                  className="block w-[18px] h-[18px] fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
                >
                  {item.icon}
                </svg>
              </span>
            ) : (
              <span className={`flex-none w-[9px] h-[9px] rounded-full ${item.isActive ? 'bg-[#FFCF01]' : 'bg-white/[0.38]'}`} />
            )}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Account area */}
      <div className="mt-auto flex flex-col gap-2">
        <Link
          href={`/${roleSlug}/profile`}
          className="flex items-center gap-[10px] border border-white/[0.18] rounded-lg bg-white/[0.1] p-3 no-underline text-white hover:bg-white/[0.18] transition-colors"
        >
          <div className="grid place-items-center w-[42px] h-[42px] rounded-full bg-[#FFCF01] text-[#332800] text-[0.82rem] font-[800] shrink-0">{avatarInitials}</div>
          <div className="min-w-0">
            <strong className="block text-[1rem] leading-tight font-bold truncate">{userName}</strong>
            <span className="block text-white/[0.72] text-[0.78rem] font-bold mt-[3px] truncate">{userContext}</span>
          </div>
        </Link>

      </div>
    </aside>
  );
}
