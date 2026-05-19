import React from "react";

export function LoadingState({ message = "Loading...", className = "" }: { message?: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 p-6 text-center !text-[#64748b] !text-sm !font-bold ${className}`} role="status" aria-live="polite">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#e2e8f0] border-t-[#8A252C]" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
