"use client";

import React from "react";

type InlineSelectOption = {
  value: string;
  label: string;
};

export function InlineSelect({ value, options, placeholder, onChange, disabled = false, className = "" }: { value: string; options: InlineSelectOption[]; placeholder: string; onChange: (value: string) => void; disabled?: boolean; className?: string }) {
  const [open, setOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  React.useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-[42px] w-full items-center justify-between gap-3 rounded-lg border border-[#dbe3ee] bg-white px-3 py-2 text-left !text-[#111827] text-[0.9rem] font-medium shadow-sm transition-all cursor-pointer focus:border-[#FFCF01] focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 disabled:cursor-not-allowed disabled:bg-[#f8fafc] disabled:text-[#64748b]"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? "truncate" : "truncate text-[#64748b]"}>{selected?.label ?? placeholder}</span>
        <svg className="h-4 w-4 shrink-0 text-[#64748b]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" /></svg>
      </button>

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-64 overflow-auto rounded-lg border border-[#dbe3ee] bg-white py-1 shadow-[0_16px_40px_rgba(15,23,42,0.16)]" role="listbox">
          {options.length > 0 ? options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => { onChange(option.value); setOpen(false); }}
              className={`block min-h-[36px] w-full px-3 py-2 text-left text-[0.9rem] font-semibold transition-colors cursor-pointer ${option.value === value ? "bg-[#8A252C] !text-white" : "bg-white !text-[#111827] hover:bg-[#f8fafc]"}`}
            >
              {option.label}
            </button>
          )) : <div className="px-3 py-2 text-[0.85rem] font-semibold text-[#64748b]">No options available</div>}
        </div>
      )}
    </div>
  );
}
