"use client";

import React, { useState } from "react";
import Link from "next/link";
import { apiClient } from "@/core/api/axios";
import { useUpdateUser } from "@/core/api/hooks/useUsers";
import { useAuthStore } from "@/core/store/authStore";
import { useToast } from "@/components/ui/ToastProvider";

function getInitials(name?: string) {
  if (!name) return "?";
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

export function StudentProfileEditContent() {
  const { showToast } = useToast();
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const updateUser = useUpdateUser();
  const [fullName, setFullName] = useState<string | null>(null);
  const [schoolEmail, setSchoolEmail] = useState<string | null>(null);
  const [mobileNumber, setMobileNumber] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [message, setMessage] = useState({ text: "Review your information before saving.", type: "" });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const isSaving = updateUser.isPending;
  const currentFullName = fullName ?? user?.fullName ?? "";
  const currentSchoolEmail = schoolEmail ?? user?.email ?? "";
  const currentMobileNumber = mobileNumber ?? user?.mobileNumber ?? "";
  const currentProfileImageUrl = profileImageUrl ?? user?.profileImageUrl ?? "";

  const profileCompletion = user?.profileCompletionPercentage ?? 0;

  const handleReset = () => {
    setFullName(null);
    setSchoolEmail(null);
    setMobileNumber(null);
    setProfileImageUrl(null);
    setMessage({ text: "Review your information before saving.", type: "" });
  };

  const handleProfilePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploadingPhoto(true);
      const formData = new FormData();
      formData.append("file", file);
      const { data: uploaded } = await apiClient.post("/uploads/cloudinary", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const nextUrl = uploaded.secure_url ?? uploaded.url ?? "";
      const updatedUser = await updateUser.mutateAsync({ userId: user.id, updates: { profileImageUrl: nextUrl } });
      setProfileImageUrl(nextUrl);
      login(updatedUser);
      showToast({ variant: "success", title: "Profile photo updated", message: "Your profile picture was saved." });
    } catch {
      showToast({ variant: "error", title: "Upload failed", message: "Profile picture could not be uploaded." });
    } finally {
      setIsUploadingPhoto(false);
      event.target.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const hasChanges = currentFullName !== user.fullName || currentSchoolEmail !== user.email || currentMobileNumber !== (user.mobileNumber ?? "") || currentProfileImageUrl !== (user.profileImageUrl ?? "");
    if (!hasChanges) {
      setMessage({ text: "No profile changes to save.", type: "" });
      return;
    }

    try {
      const updatedUser = await updateUser.mutateAsync({
        userId: user.id,
        updates: {
          fullName: currentFullName,
          email: currentSchoolEmail,
          mobileNumber: currentMobileNumber,
        },
      });
      login(updatedUser);
      setMessage({ text: "Profile changes saved successfully.", type: "is-success" });
      showToast({ variant: "success", title: "Profile saved", message: "Your profile changes were saved." });
      setTimeout(() => setMessage({ text: "Review your information before saving.", type: "" }), 4000);
    } catch {
      setMessage({ text: "Profile changes could not be saved.", type: "is-error" });
      showToast({ variant: "error", title: "Profile save failed", message: "Profile changes could not be saved." });
    }
  };

  const inputCls = "w-full min-h-[44px] px-3 py-2 border border-[#dbe3ee] rounded-lg bg-white text-[#111827] font-bold focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all text-[0.9rem]";
  const labelCls = "block text-[0.8rem] font-[800] text-[#344054] mb-1.5";

  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)] grid content-start gap-6">

      {/* Hero Card */}
      <section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          
          {/* Avatar with edit pencil */}
          <div className="relative w-[72px] h-[72px] shrink-0">
            {currentProfileImageUrl ? (
              <img src={currentProfileImageUrl} alt="Profile" className="w-[72px] h-[72px] rounded-full object-cover border border-[#e2e8f0]" />
            ) : (
              <div className="w-[72px] h-[72px] rounded-full bg-[#ffc107] text-[#111827] flex items-center justify-center text-[1.4rem] font-[900]">
                {getInitials(currentFullName)}
              </div>
            )}
            <label className={`absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#8A252C] border-2 border-white flex items-center justify-center ${isUploadingPhoto ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`} title="Upload profile picture">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
              </svg>
              <input type="file" accept="image/*" className="hidden" onChange={handleProfilePhotoChange} disabled={isUploadingPhoto || isSaving} />
            </label>
          </div>

          {/* Title / Badges */}
          <div className="flex-1 min-w-0">
            <h2 className="text-[1.35rem] font-[900] text-[#111827] m-0 mb-1 leading-[1.2]">Update your account information.</h2>
            <p className="text-[#64748b] text-[0.88rem] font-semibold m-0 mb-3">Keep contact details, section, and student account records current.</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#e9f8ef] text-[#03703c] text-[0.75rem] font-[800]">Active account</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#fff8e1] text-[#6c4c00] text-[0.75rem] font-[800]">{profileCompletion}% complete</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
            <Link
              href="/nursing-student/profile"
              className="inline-flex items-center justify-center min-h-[38px] px-4 rounded-lg border border-[#e2e8f0] bg-white text-[#344054] text-[0.84rem] font-[800] hover:bg-[#f8fafc] hover:border-[#cbd5e1] transition-all no-underline"
            >
              Cancel
            </Link>
            <button
              type="submit"
              form="edit-profile-form"
              disabled={isSaving || isUploadingPhoto}
              className="inline-flex items-center justify-center min-h-[38px] px-4 rounded-lg bg-[#8A252C] border border-[#8A252C] text-white text-[0.84rem] font-[800] hover:bg-[#681920] transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : isUploadingPhoto ? "Uploading..." : "Save Changes"}
            </button>
          </div>
        </div>
      </section>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* Student Details Form */}
        <section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 mb-6 pb-5 border-b border-[#e5eaf1]">
            <h3 className="text-[1.05rem] font-[800] text-[#111827] m-0">Student Details</h3>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#fff8e1] text-[#6c4c00] text-[0.75rem] font-[800]">Editable</span>
          </div>

          <form id="edit-profile-form" onSubmit={handleSave} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label className={labelCls} htmlFor="fullName">Full Name</label>
                <input id="fullName" className={inputCls} type="text" value={currentFullName} onChange={e => setFullName(e.target.value)} />
              </div>
              <div>
                <label className={labelCls} htmlFor="schoolId">School ID number</label>
                <input id="schoolId" className={`${inputCls} bg-[#f8fafc] text-[#64748b] cursor-not-allowed`} type="text" value={user?.schoolId ?? ""} readOnly />
              </div>
              <div>
                <label className={labelCls} htmlFor="schoolEmail">School Email</label>
                <input id="schoolEmail" className={inputCls} type="email" value={currentSchoolEmail} onChange={e => setSchoolEmail(e.target.value)} />
              </div>
              <div>
                <label className={labelCls} htmlFor="mobileNumber">Mobile Number</label>
                <input id="mobileNumber" className={inputCls} type="tel" value={currentMobileNumber} onChange={e => setMobileNumber(e.target.value)} />
              </div>
            </div>

            {/* Info message */}
            <div className={`flex items-center px-4 py-3 rounded-lg text-[0.85rem] font-semibold mb-5 ${message.type === "is-success" ? "bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]" : "bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0]"}`} role="status" aria-live="polite">
              {message.text}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={handleReset} disabled={isSaving || isUploadingPhoto} className="inline-flex items-center justify-center min-h-[38px] px-4 rounded-lg border border-[#e2e8f0] bg-white text-[#344054] text-[0.84rem] font-[800] hover:bg-[#f8fafc] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                Reset Changes
              </button>
              <button type="submit" disabled={isSaving || isUploadingPhoto} className="inline-flex items-center justify-center min-h-[38px] px-4 rounded-lg bg-[#8A252C] border border-[#8A252C] text-white text-[0.84rem] font-[800] hover:bg-[#681920] transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
                {isSaving ? "Saving..." : isUploadingPhoto ? "Uploading..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>

        {/* Profile Card (Live Preview) */}
        <section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 mb-6 pb-5 border-b border-[#e5eaf1]">
            <h3 className="text-[1.05rem] font-[800] text-[#111827] m-0">Profile Card</h3>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#e9f8ef] text-[#03703c] text-[0.75rem] font-[800]">Live</span>
          </div>

          <div className="flex flex-col items-center text-center gap-3">
            {currentProfileImageUrl ? (
              <img src={currentProfileImageUrl} alt="Profile preview" className="w-[64px] h-[64px] rounded-full object-cover border border-[#e2e8f0]" />
            ) : (
              <div className="w-[64px] h-[64px] rounded-full bg-[#ffc107] text-[#111827] flex items-center justify-center text-[1.2rem] font-[900]">
                {getInitials(currentFullName)}
              </div>
            )}
            <div>
              <p className="text-[#111827] text-[1rem] font-[800] m-0 mb-0.5">{currentFullName || "Nursing Student"}</p>
              <p className="text-[#64748b] text-[0.85rem] font-bold m-0 mb-0.5">{user?.sectionInfo ?? "Nursing Student"}</p>
              <p className="text-[#64748b] text-[0.82rem] font-semibold m-0">{currentSchoolEmail}</p>
            </div>

            <div className="w-full mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#64748b] text-[0.8rem] font-bold">Profile completion</span>
                <span className="text-[#111827] text-[0.8rem] font-[800]">{profileCompletion}%</span>
              </div>
              <div className="w-full h-[8px] rounded-full bg-[#e2e8f0] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#8A252C] to-[#ffc107]" style={{ width: `${profileCompletion}%` }} />
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
