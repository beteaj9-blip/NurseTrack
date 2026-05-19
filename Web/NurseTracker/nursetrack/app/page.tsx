"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthInfoPanel } from "@/components/ui/AuthInfoPanel";
import { InputField } from "@/components/ui/InputField";
import { PasswordField } from "@/components/ui/PasswordField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { apiClient } from "@/core/api/axios";
import { useAuthStore } from "@/core/store/authStore";
import { User, roleToBasePath } from "@/core/types/user";

type LoginResponse = { user: User; token: string };

export default function Login() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [isLoading, setIsLoading] = useState(false);
  const [formMessage, setFormMessage] = useState("Enter your account details to continue.");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsError(false);
    setFormMessage("Signing you in...");

    const formData = new FormData(e.currentTarget);
    const userId = formData.get("userId") as string;
    const password = formData.get("password") as string;

    if (!userId || !password) {
      setIsError(true);
      setFormMessage("Please enter your School ID / email and password.");
      setIsLoading(false);
      return;
    }

    let data: LoginResponse;
    try {
      const response = await apiClient.post<LoginResponse>("/users/login", {
        userId,
        password,
      });
      data = response.data;
    } catch (error: any) {
      setIsError(true);
      if (error.response?.status === 401) {
        setFormMessage("Invalid credentials. Please check your ID/email and password.");
      } else {
        setFormMessage("Unable to connect to the server. Make sure the backend is running.");
      }
      setIsLoading(false);
      return;
    }

    try {
      if (!data?.user || !data?.token) {
        throw new Error("Login response is missing user or token.");
      }
      // Save user to global store (persisted in localStorage)
      login(data.user, data.token);

      // Redirect to the correct dashboard based on role
      const basePath = roleToBasePath[data.user.role];
      if (!basePath) throw new Error(`Unsupported user role: ${data.user.role}`);
      router.replace(`${basePath}/dashboard`);
    } catch (error) {
      console.error("Login succeeded but session setup failed", error);
      setIsError(true);
      setFormMessage("Login succeeded, but the app could not open your dashboard. Please refresh and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen grid grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] max-[820px]:grid-cols-1">
      <AuthInfoPanel
        headline="Clinical tracking made organized and secure."
        description="Manage duty hours, case records, schedules, approvals, and student progress from one reliable portal."
        highlights={["Duty hours", "Case logs", "Schedules", "Approvals"]}
      />

      <section className="flex flex-col items-center justify-center min-h-screen bg-white p-[clamp(28px,5vw,58px)] overflow-y-auto animate-[panelInRight_720ms_ease_both]" aria-label="Login">
        <div className="w-full max-w-[520px] border border-[#e4e7ec] rounded-[14px] bg-white shadow-[0_22px_56px_rgba(32,33,36,0.12)] p-[clamp(24px,4vw,36px)] animate-[fadeUp_720ms_240ms_ease_both]">
          <div className="grid justify-center text-center gap-[6px] mb-[24px]">
            <p className="m-0 !text-[#8A252C] text-[0.78rem] !font-[800] leading-[1.35] uppercase">Welcome back</p>
            <h2 className="!m-0 !text-[#202124] !text-[clamp(1.22rem,2vw,1.55rem)] !leading-[1.18] !font-[800]">Login to your account</h2>
          </div>

          <form id="login-form" className="grid gap-[18px]" noValidate onSubmit={handleSubmit}>
            <InputField
              label="School email or ID number"
              id="user-id"
              name="userId"
              type="text"
              autoComplete="username"
              placeholder="student@cit.edu or 12-3456-789"
              required
            />
            <PasswordField
              label="Password"
              id="password"
              name="password"
              autoComplete="current-password"
              placeholder="Enter password"
              required
              minLength={1}
            />

            <div className="flex items-center justify-between gap-[12px] text-[#667085] text-[0.88rem]">
              <label className="inline-flex items-center gap-[8px]">
                <input className="w-[16px] h-[16px] accent-[#8A252C]" type="checkbox" name="remember" />
                <span>Keep me signed in</span>
              </label>
              <Link href="/forgot-password" className="!text-[#8A252C] !font-[800] no-underline hover:underline">Forgot password?</Link>
            </div>

            <div
              className={`min-h-[42px] border rounded-[8px] p-[11px_12px] text-[0.82rem] font-[700] leading-[1.35] transition-colors ${
                isError
                  ? "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]"
                  : "border-[#e4e7ec] bg-[#f9fafb] text-[#667085]"
              }`}
              role="status"
              aria-live="polite"
            >
              {formMessage}
            </div>

            <PrimaryButton type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </PrimaryButton>
          </form>

          <div className="flex justify-center gap-[6px] mt-[18px] text-[#667085] text-[0.9rem]">
            <span>Don&apos;t have an account?</span>
            <Link href="/register" className="!text-[#8A252C] !font-[800] no-underline hover:underline">Create account</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
