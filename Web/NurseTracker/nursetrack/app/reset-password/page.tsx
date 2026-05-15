"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { AuthInfoPanel } from "@/components/ui/AuthInfoPanel";
import { InputField } from "@/components/ui/InputField";
import { PasswordField } from "@/components/ui/PasswordField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export default function ResetPassword() {
  const [formMessage] = useState("Enter your reset code and new password.");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <main className="w-full min-h-screen grid grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] max-[820px]:grid-cols-1">
      <AuthInfoPanel
        headline="Set a new password for your account."
        description="Use the reset code sent to your registered account and create a secure password before signing in again."
        highlights={["Reset code", "New password", "Secure access", "Account protection"]}
      />

      <section className="flex flex-col items-center justify-center min-h-screen bg-white p-[clamp(28px,5vw,58px)] overflow-y-auto animate-[panelInRight_720ms_ease_both]" aria-label="Reset password">
        <div className="w-full max-w-[520px] border border-[#e4e7ec] rounded-[14px] bg-white shadow-[0_22px_56px_rgba(32,33,36,0.12)] p-[clamp(24px,4vw,36px)] animate-[fadeUp_720ms_240ms_ease_both]">
          <div className="grid justify-center text-center gap-[6px] mb-[24px]">
            <p className="m-0 !text-[#8A252C] text-[0.78rem] !font-[800] leading-[1.35] uppercase">Account recovery</p>
            <h2 className="!m-0 !text-[#202124] !text-[clamp(1.22rem,2vw,1.55rem)] !leading-[1.18] !font-[800]">Reset password</h2>
          </div>

          <form id="reset-password-form" className="grid gap-[18px]" noValidate onSubmit={handleSubmit}>
            <InputField label="Reset code" id="reset-code" name="resetCode" type="text" inputMode="numeric" autoComplete="one-time-code" placeholder="Enter 6-digit code" pattern="[0-9]{6}" required />
            <PasswordField label="New password" id="new-password" name="newPassword" autoComplete="new-password" placeholder="Create new password" required minLength={8} />
            <PasswordField label="Confirm new password" id="confirm-password" name="confirmPassword" autoComplete="new-password" placeholder="Re-enter new password" required minLength={8} />

            <div className="rounded-[8px] bg-[#fff6cc] text-[#6c4c00] p-[11px_12px] text-[0.82rem] !font-[800] leading-[1.35]">
              Use at least 8 characters. Include letters and numbers for better security.
            </div>

            <div className="min-h-[42px] border border-[#e4e7ec] rounded-[8px] bg-[#f9fafb] text-[#667085] p-[11px_12px] text-[0.82rem] font-[700] leading-[1.35]" role="status" aria-live="polite">
              {formMessage}
            </div>

            <PrimaryButton type="submit">Update password</PrimaryButton>
          </form>

          <div className="flex justify-center gap-[6px] mt-[18px] text-[#667085] text-[0.9rem]">
            <span>Remembered your password?</span>
            <Link href="/" className="!text-[#8A252C] !font-[800] no-underline hover:underline">Return to login</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
