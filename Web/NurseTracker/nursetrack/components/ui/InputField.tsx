import React, { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

export function InputField({ label, id, className, ...props }: InputFieldProps) {
  return (
    <label className="grid gap-[8px] text-[#344054] text-[0.88rem] font-[800]" htmlFor={id}>
      {label}
      <input 
        id={id} 
        className={className || "w-full min-h-[48px] px-[14px] border border-[#e4e7ec] rounded-[8px] bg-white text-[#202124] outline-none transition-all focus:border-[#8A252C] focus:shadow-[0_0_0_4px_rgba(138,37,44,0.12),0_10px_24px_rgba(32,33,36,0.08)]"}
        {...props} 
      />
    </label>
  );
}
