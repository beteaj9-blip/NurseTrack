"use client";

import React, { InputHTMLAttributes, useState } from 'react';

interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

export function PasswordField({ label, id, className, ...props }: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className="grid gap-[8px] text-[#344054] text-[0.88rem] font-[800]" htmlFor={id}>
      {label}
      <div className="relative">
        <input 
          id={id} 
          type={showPassword ? "text" : "password"} 
          className={className || "w-full min-h-[48px] px-[14px] pr-[48px] border border-[#e4e7ec] rounded-[8px] bg-white text-[#202124] outline-none transition-all focus:border-[#8A252C] focus:shadow-[0_0_0_4px_rgba(138,37,44,0.12),0_10px_24px_rgba(32,33,36,0.08)]"}
          {...props} 
        />
        <button 
          className="absolute right-[12px] top-1/2 -translate-y-1/2 flex items-center justify-center w-[28px] h-[28px] border-0 bg-transparent cursor-pointer text-[#667085] hover:text-[#344054] transition-colors p-0"
          type="button" 
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? "Hide password" : "Show password"} 
          title={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </label>
  );
}
