"use client";

import React from "react";
import { createPortal } from "react-dom";

type InlineSelectOption = {
  value: string;
  label: string;
};

export function InlineSelect({ value, options, placeholder, onChange, disabled = false, className = "" }: { value: string; options: InlineSelectOption[]; placeholder: string; onChange: (value: string) => void; disabled?: boolean; className?: string }) {
  const [open, setOpen] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0, width: 0 });
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);
  const displayTextClass = disabled ? "min-w-0 truncate text-[#64748b]" : selected ? "min-w-0 truncate" : "min-w-0 truncate text-[#64748b]";
  const arrowTextClass = disabled ? "text-[#64748b]" : "text-[#344054]";

  const updateMenuPosition = React.useCallback(() => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMenuPosition({ top: rect.bottom + 6, left: rect.left, width: rect.width });
  }, []);

  React.useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!wrapperRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  React.useLayoutEffect(() => {
    if (!open) return;
    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, updateMenuPosition]);

  return (
    <div ref={wrapperRef} className={`relative min-w-0 w-full ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`flex min-h-[42px] w-full min-w-0 items-center justify-between gap-3 rounded-lg border border-[#dbe3ee] px-3 py-2 text-left text-[0.9rem] font-medium shadow-sm transition-all focus:border-[#FFCF01] focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 ${disabled ? "cursor-not-allowed bg-[#f8fafc] !text-[#64748b]" : "cursor-pointer bg-white !text-[#111827]"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={displayTextClass}>{selected?.label ?? placeholder}</span>
        <svg className={`h-4 w-4 shrink-0 ${arrowTextClass}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" /></svg>
      </button>

      {open && !disabled && typeof document !== "undefined" && createPortal(
        <div ref={menuRef} className="fixed z-[10000] max-h-64 overflow-auto rounded-lg border border-[#dbe3ee] bg-white py-1 shadow-[0_16px_40px_rgba(15,23,42,0.16)]" style={{ top: menuPosition.top, left: menuPosition.left, width: menuPosition.width }} role="listbox">
          {options.length > 0 ? options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => { onChange(option.value); setOpen(false); }}
              className={`block min-h-[36px] w-full truncate px-3 py-2 text-left text-[0.9rem] font-semibold transition-colors cursor-pointer ${option.value === value ? "bg-[#8A252C] !text-white" : "bg-white !text-[#111827] hover:bg-[#f8fafc]"}`}
            >
              {option.label}
            </button>
          )) : <div className="px-3 py-2 text-[0.85rem] font-semibold text-[#64748b]">No options available</div>}
        </div>,
        document.body
      )}
    </div>
  );
}
