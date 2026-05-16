"use client";

import React from "react";

type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: number;
  title: string;
  message?: string;
  variant: ToastVariant;
  exiting?: boolean;
};

type ToastContextValue = {
  showToast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

function variantStyles(variant: ToastVariant) {
  if (variant === "success") return "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]";
  if (variant === "error") return "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]";
  return "border-[#e2e8f0] bg-white text-[#344054]";
}

function variantAccent(variant: ToastVariant) {
  if (variant === "success") return "bg-[#16a34a]";
  if (variant === "error") return "bg-[#dc2626]";
  return "bg-[#8A252C]";
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const removeToast = React.useCallback((id: number) => {
    setToasts((current) => current.map((toast) => toast.id === id ? { ...toast, exiting: true } : toast));
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 220);
  }, []);

  const showToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { ...toast, id }]);
    window.setTimeout(() => removeToast(id), 4200);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed right-5 top-[88px] z-[120] grid w-[min(420px,calc(100vw-40px))] gap-3 pointer-events-none max-[768px]:top-[76px]" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <section key={toast.id} className={`toast-card ${toast.exiting ? "toast-card-exit" : "toast-card-enter"} relative overflow-hidden rounded-xl border shadow-[0_18px_42px_rgba(15,23,42,0.14)] pointer-events-auto ${variantStyles(toast.variant)}`} role="status">
            <span className={`absolute inset-y-0 left-0 w-1.5 ${variantAccent(toast.variant)}`} />
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 p-4 pl-5">
              <div>
                <strong className="block text-[0.95rem] font-[900] leading-[1.25]">{toast.title}</strong>
                {toast.message && <p className="m-[4px_0_0] text-[0.84rem] font-[700] leading-[1.45] opacity-85">{toast.message}</p>}
              </div>
              <button type="button" onClick={() => removeToast(toast.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-current/15 bg-white/55 text-current cursor-pointer hover:bg-white transition-colors" aria-label="Dismiss notification">
                <span aria-hidden="true" className="text-[1rem] leading-none font-[900]">x</span>
              </button>
            </div>
          </section>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
