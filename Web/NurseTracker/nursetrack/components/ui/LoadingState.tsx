import React from "react";

export function LoadingState({ message = "Loading...", className = "" }: { message?: string; className?: string }) {
  return (
    <div className={`grid gap-3 p-6 ${className}`} role="status" aria-live="polite" aria-label={message}>
      <span className="sr-only">{message}</span>
      <div className="animate-pulse grid gap-3" aria-hidden="true">
        <div className="h-4 w-1/3 rounded-full bg-[#e2e8f0]" />
        <div className="grid gap-2">
          <div className="h-12 rounded-lg bg-[#f1f5f9]" />
          <div className="h-12 rounded-lg bg-[#f1f5f9]" />
          <div className="h-12 rounded-lg bg-[#f1f5f9]" />
        </div>
      </div>
    </div>
  );
}
