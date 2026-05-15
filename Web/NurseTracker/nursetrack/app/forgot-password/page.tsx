"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { AuthInfoPanel } from "@/components/ui/AuthInfoPanel";
import { InputField } from "@/components/ui/InputField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export default function ForgotPassword() {
  const [formMessage] = useState("We will send password reset instructions if the account exists.");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <main className="w-full min-h-screen grid grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] max-[820px]:grid-cols-1">
      <AuthInfoPanel
        headline="Recover access to your account securely."
        description="Enter your registered school email or ID number and follow the reset instructions sent to your account."
        highlights={["Secure reset", "Account recovery", "Email verification", "Protected access"]}
      />

      <section className="flex flex-col items-center justify-center min-h-screen bg-white p-[clamp(28px,5vw,58px)] overflow-y-auto animate-[panelInRight_720ms_ease_both]" aria-label="Forgot password">
        <div className="w-full max-w-[520px] border border-[#e4e7ec] rounded-[14px] bg-white shadow-[0_22px_56px_rgba(32,33,36,0.12)] p-[clamp(24px,4vw,36px)] animate-[fadeUp_720ms_240ms_ease_both]">
          <div className="grid justify-center text-center gap-[6px] mb-[24px]">
            <p className="m-0 !text-[#8A252C] text-[0.78rem] !font-[800] leading-[1.35] uppercase">Password help</p>
            <h2 className="!m-0 !text-[#202124] !text-[clamp(1.22rem,2vw,1.55rem)] !leading-[1.18] !font-[800]">Forgot your password?</h2>
          </div>

          <form id="forgot-password-form" className="grid gap-[18px]" noValidate onSubmit={handleSubmit}>
            <InputField label="School email or ID number" id="account-id" name="accountId" type="text" autoComplete="username" placeholder="student@cit.edu" required />

            <div className="min-h-[42px] border border-[#e4e7ec] rounded-[8px] bg-[#f9fafb] text-[#667085] p-[11px_12px] text-[0.82rem] font-[700] leading-[1.35]" role="status" aria-live="polite">
              {formMessage}
            </div>

            <PrimaryButton type="submit">Send reset instructions</PrimaryButton>
          </form>

          <div className="flex justify-center gap-[6px] mt-[18px] text-[#667085] text-[0.9rem]">
            <span>Already have a reset code?</span>
            <Link href="/reset-password" className="!text-[#8A252C] !font-[800] no-underline hover:underline">Reset password</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
