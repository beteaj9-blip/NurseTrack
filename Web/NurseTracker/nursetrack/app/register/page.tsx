"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthInfoPanel } from "@/components/ui/AuthInfoPanel";
import { InputField } from "@/components/ui/InputField";
import { PasswordField } from "@/components/ui/PasswordField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { apiClient } from "@/core/api/axios";

const withoutLetters = (value: string) => value.replace(/\p{L}/gu, "");
const stripLettersFromInput = (event: React.FormEvent<HTMLInputElement>) => {
  event.currentTarget.value = withoutLetters(event.currentTarget.value);
};

export default function Register() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formMessage, setFormMessage] = useState("Complete the form to create your NurseTrack account.");
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsError(false);
    setIsSuccess(false);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string;
    const schoolId = formData.get("schoolId") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const confirmed = formData.get("terms") === "on";

    if (!confirmed) {
      setIsError(true);
      setFormMessage("Please confirm that the account details are correct before creating an account.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setIsError(true);
      setFormMessage("Passwords do not match. Please try again.");
      setIsLoading(false);
      return;
    }

    try {
      await apiClient.post("/users/register", {
        fullName,
        schoolId,
        email,
        password,
        role: "STUDENT",
      });

      setIsSuccess(true);
      setFormMessage("Account created! Redirecting to login...");
      setTimeout(() => router.push("/"), 2000);
    } catch (error: any) {
      setIsError(true);
      if (error.response?.status === 409) {
        setFormMessage(error.response?.data?.message || "An account with this email or School ID already exists.");
      } else {
        setFormMessage("Registration failed. Please check your details or try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen grid grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] max-[820px]:grid-cols-1">
      <AuthInfoPanel
        headline="Create an account for organized clinical tracking."
        description="Set up secure access for duty records, case logs, schedules, approvals, and progress updates."
        highlights={["Secure access", "Student records", "Clinical Instructor review", "Progress updates"]}
      />

      <section className="flex flex-col items-center justify-center min-h-screen bg-white p-[clamp(28px,4vw,48px)] overflow-y-auto animate-[panelInRight_720ms_ease_both]" aria-label="Registration">
        <div className="w-full max-w-[580px] border border-[#e4e7ec] rounded-[14px] bg-white shadow-[0_22px_56px_rgba(32,33,36,0.12)] p-[clamp(24px,3vw,32px)] animate-[fadeUp_720ms_240ms_ease_both]">
          <div className="grid justify-center text-center gap-[6px] mb-[20px]">
            <p className="m-0 !text-[#8A252C] text-[0.78rem] !font-[800] leading-[1.35] uppercase">Get started</p>
            <h2 className="!m-0 !text-[#202124] !text-[clamp(1.22rem,2vw,1.55rem)] !leading-[1.18] !font-[800]">Create your account</h2>
          </div>

          <form id="register-form" className="grid gap-[14px]" noValidate onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-[14px] max-[680px]:grid-cols-1">
              <InputField label="Full name" id="full-name" name="fullName" type="text" autoComplete="name" placeholder="Juan Dela Cruz" required />
              <InputField label="School ID number" id="school-id" name="schoolId" type="text" inputMode="text" autoComplete="off" placeholder="12-3456-789" onInput={stripLettersFromInput} required />
            </div>

            <InputField label="School email" id="email" name="email" type="email" autoComplete="email" placeholder="student@cit.edu" required />

            <div className="grid grid-cols-2 gap-[14px] max-[680px]:grid-cols-1">
              <PasswordField label="Password" id="password" name="password" autoComplete="new-password" placeholder="Create password" required minLength={8} />
              <PasswordField label="Confirm password" id="confirm-password" name="confirmPassword" autoComplete="new-password" placeholder="Re-enter password" required minLength={8} />
            </div>

            <label className="inline-flex items-center gap-[8px] text-[#667085] text-[0.88rem] font-[700]">
              <input className="w-[16px] h-[16px] accent-[#8A252C]" type="checkbox" name="terms" required />
              <span>I confirm that the account details are correct.</span>
            </label>

            <div
              className={`min-h-[42px] border rounded-[8px] p-[11px_12px] text-[0.82rem] font-[700] leading-[1.35] transition-colors ${
                isError
                  ? "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]"
                  : isSuccess
                  ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]"
                  : "border-[#e4e7ec] bg-[#f9fafb] text-[#667085]"
              }`}
              role="status"
              aria-live="polite"
            >
              {formMessage}
            </div>

            <PrimaryButton type="submit" disabled={isLoading || isSuccess}>
              {isLoading ? "Creating account..." : "Create account"}
            </PrimaryButton>
          </form>

          <div className="flex justify-center gap-[6px] mt-[18px] text-[#667085] text-[0.9rem]">
            <span>Already have an account?</span>
            <Link href="/" className="!text-[#8A252C] !font-[800] no-underline hover:underline">Login</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
