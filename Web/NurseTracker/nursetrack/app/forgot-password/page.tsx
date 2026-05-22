"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { AuthInfoPanel } from "@/components/ui/AuthInfoPanel";
import { InputField } from "@/components/ui/InputField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { apiClient } from "@/core/api/axios";

export default function ForgotPassword() {
  const [accountId, setAccountId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formMessage, setFormMessage] = useState(
    "We will reset your password if the account exists.",
  );
  const [resetPassword, setResetPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accountId.trim()) return;

    setIsLoading(true);
    setError(null);
    setResetPassword(null);

    try {
      const response = await apiClient.post<{ password: string }>(
        "/users/forgot-password",
        { accountId: accountId.trim() },
      );
      const generatedPassword = response.data?.password;
      setResetPassword(generatedPassword ?? null);
      setFormMessage("Password reset successfully. Use the password below to log in.");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        "No account found for that school email or ID.";
      setError(message);
      setFormMessage("We will reset your password if the account exists.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen grid grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] max-[820px]:grid-cols-1">
      <AuthInfoPanel
        headline="Recover access to your account securely."
        description="Enter your registered school email or ID number to reset your password immediately."
        highlights={["Secure reset", "Account recovery", "Instant access", "Protected access"]}
      />

      <section className="flex flex-col items-center justify-center min-h-screen bg-white p-[clamp(28px,5vw,58px)] overflow-y-auto animate-[panelInRight_720ms_ease_both]" aria-label="Forgot password">
        <div className="w-full max-w-[520px] border border-[#e4e7ec] rounded-[14px] bg-white shadow-[0_22px_56px_rgba(32,33,36,0.12)] p-[clamp(24px,4vw,36px)] animate-[fadeUp_720ms_240ms_ease_both]">
          <div className="grid justify-center text-center gap-[6px] mb-[24px]">
            <p className="m-0 !text-[#8A252C] text-[0.78rem] !font-[800] leading-[1.35] uppercase">Password help</p>
            <h2 className="!m-0 !text-[#202124] !text-[clamp(1.22rem,2vw,1.55rem)] !leading-[1.18] !font-[800]">Forgot your password?</h2>
          </div>

          <form id="forgot-password-form" className="grid gap-[18px]" noValidate onSubmit={handleSubmit}>
            <InputField
              label="School email or ID number"
              id="account-id"
              name="accountId"
              type="text"
              autoComplete="username"
              placeholder="student@cit.edu or 23-0509-324"
              required
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            />

            {resetPassword ? (
              <div
                className="min-h-[42px] border border-[#d1fadf] rounded-[8px] bg-[#f0fdf4] text-[#027a48] p-[11px_12px] text-[0.82rem] font-[700] leading-[1.35] flex flex-col gap-1"
                role="status"
                aria-live="polite"
              >
                <span>{formMessage}</span>
                <span className="text-[1rem] font-[900] tracking-wider mt-1 font-mono">
                  {resetPassword}
                </span>
                <span className="text-[0.75rem] font-[600] text-[#047857] mt-1">
                  Write this down — you can change it after logging in.
                </span>
              </div>
            ) : error ? (
              <div
                className="min-h-[42px] border border-[#fecdca] rounded-[8px] bg-[#fff5f5] text-[#b42318] p-[11px_12px] text-[0.82rem] font-[700] leading-[1.35]"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            ) : (
              <div
                className="min-h-[42px] border border-[#e4e7ec] rounded-[8px] bg-[#f9fafb] text-[#667085] p-[11px_12px] text-[0.82rem] font-[700] leading-[1.35]"
                role="status"
                aria-live="polite"
              >
                {formMessage}
              </div>
            )}

            {!resetPassword && (
              <PrimaryButton type="submit" disabled={isLoading}>
                {isLoading ? "Resetting…" : "Reset password"}
              </PrimaryButton>
            )}

            {resetPassword && (
              <Link
                href="/"
                className="inline-flex items-center justify-center min-h-[48px] px-4 rounded-[10px] bg-[#8A252C] !text-white !text-[0.95rem] !font-[800] no-underline hover:bg-[#6d1d23] transition-all text-center"
              >
                Back to Login
              </Link>
            )}
          </form>

          <div className="flex justify-center gap-[6px] mt-[18px] text-[#667085] text-[0.9rem]">
            <span>Remembered your password?</span>
            <Link href="/" className="!text-[#8A252C] !font-[800] no-underline hover:underline">Sign in</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
