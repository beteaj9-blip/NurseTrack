"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
  href?: string;
}

export function BackButton({ href }: BackButtonProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (!href) {
      e.preventDefault();
      router.back();
    }
  };

  const icon = (
    <svg viewBox="0 0 24 24" className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center justify-center h-[38px] px-3.5 border border-[#8a252c38] rounded-lg bg-white !text-[#344054] !text-[0.9rem] !font-[800] hover:bg-[#8A252C] hover:border-[#8A252C] hover:!text-white hover:[&_*]:text-white transition-all duration-200 shadow-[0_1px_2px_rgba(16,24,40,0.05)] no-underline"
        aria-label="Go back"
      >
        {icon}
        <span>Back</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center justify-center h-[38px] px-3.5 border border-[#8a252c38] rounded-lg bg-white !text-[#344054] !text-[0.9rem] !font-[800] hover:bg-[#8A252C] hover:border-[#8A252C] hover:!text-white hover:[&_*]:text-white transition-all duration-200 shadow-[0_1px_2px_rgba(16,24,40,0.05)] cursor-pointer"
      aria-label="Go back"
    >
      {icon}
      <span>Back</span>
    </button>
  );
}
