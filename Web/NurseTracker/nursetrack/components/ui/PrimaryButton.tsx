import React, { ButtonHTMLAttributes } from 'react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function PrimaryButton({ children, className, ...props }: PrimaryButtonProps) {
  return (
    <button 
      className={className || "inline-flex items-center justify-center w-full min-h-[50px] border-0 rounded-[8px] bg-[#8A252C] !text-white cursor-pointer !font-[800] shadow-[0_10px_22px_rgba(138,37,44,0.18)] transition-all hover:bg-[#681920] hover:shadow-[0_14px_28px_rgba(138,37,44,0.24)] hover:-translate-y-[1px] active:translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_10px_22px_rgba(138,37,44,0.18)]"} 
      {...props}
    >
      {children}
    </button>
  );
}
