"use client";

import React, { useState } from "react";
import { apiClient } from "@/core/api/axios";
import { useUpdateUser } from "@/core/api/hooks/useUsers";
import { useAuthStore } from "@/core/store/authStore";
import { useToast } from "@/components/ui/ToastProvider";

const withoutLetters = (value: string) => value.replace(/\p{L}/gu, "");

interface ProfileUser {
  id?: number;
  name: string;
  initials: string;
  context: string;
  role: string;
  email: string;
  mobile: string;
  schoolId: string;
  profileImageUrl?: string;
  profileCompletionPercentage?: number;
  lastLogin: string;
}

interface ProfileContentProps {
  user: ProfileUser;
}

export function ProfileContent({ user }: ProfileContentProps) {
  const { showToast } = useToast();
  const updateUser = useUpdateUser();
  const login = useAuthStore((state) => state.login);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [mobile, setMobile] = useState(user.mobile);
  const [profileImageUrl, setProfileImageUrl] = useState(user.profileImageUrl ?? "");
  const [message, setMessage] = useState({ text: "Review your information before saving.", type: "" });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const isSaving = updateUser.isPending;
  const profileCompletionFields = [profileImageUrl, fullName, user.schoolId, email, mobile];
  const profileCompletion = Math.round((profileCompletionFields.filter((field) => field.trim()).length / profileCompletionFields.length) * 100);

  const handleReset = () => {
    setFullName(user.name);
    setEmail(user.email);
    setMobile(withoutLetters(user.mobile));
    setProfileImageUrl(user.profileImageUrl ?? "");
    setMessage({ text: "Review your information before saving.", type: "" });
  };

  const handleProfilePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || user.id == null) return;
    const hasTextChanges = fullName !== user.name || mobile !== user.mobile;

    try {
      setIsUploadingPhoto(true);
      const formData = new FormData();
      formData.append("file", file);
      const { data: uploaded } = await apiClient.post("/uploads/cloudinary", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const nextUrl = uploaded.secure_url ?? uploaded.url ?? "";
      const updatedUser = await updateUser.mutateAsync({ updates: { profileImageUrl: nextUrl } });
      setProfileImageUrl(nextUrl);
      login(updatedUser);
      if (!hasTextChanges) {
        setIsEditing(false);
        setMessage({ text: "Review your information before saving.", type: "" });
      } else {
        setMessage({ text: "Profile photo saved. Review your remaining changes before saving.", type: "is-success" });
      }
      showToast({ variant: "success", title: "Profile photo updated", message: "Your profile picture was saved." });
    } catch {
      showToast({ variant: "error", title: "Upload failed", message: "Profile picture could not be uploaded." });
    } finally {
      setIsUploadingPhoto(false);
      event.target.value = "";
    }
  };

  const handleCancel = () => {
    handleReset();
    setIsEditing(false);
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(user.schoolId);
      showToast({ variant: "success", title: "School ID copied", message: `${user.schoolId} copied to clipboard.` });
    } catch {
      showToast({ variant: "error", title: "Copy failed", message: "School ID could not be copied." });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasChanges = fullName !== user.name || mobile !== user.mobile || profileImageUrl !== (user.profileImageUrl ?? "");
    if (!hasChanges) {
      setMessage({ text: "No profile changes to save.", type: "is-error" });
      showToast({ variant: "info", title: "No changes", message: "There are no profile changes to save." });
      return;
    }

    try {
      if (user.id != null) {
        const updatedUser = await updateUser.mutateAsync({ updates: { fullName, mobileNumber: mobile, profileImageUrl } });
        login(updatedUser);
      }
      setMessage({ text: "Review your information before saving.", type: "" });
      showToast({ variant: "success", title: "Profile saved", message: "Your profile changes were saved." });
      setIsEditing(false);
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

          {/* Avatar */}
          <div className="relative w-[72px] h-[72px] shrink-0">
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="Profile" className="w-[72px] h-[72px] rounded-full object-cover border border-[#e2e8f0]" />
            ) : (
              <div className="w-[72px] h-[72px] rounded-full bg-[#ffc107] text-[#111827] flex items-center justify-center text-[1.4rem] font-[900]">
                {user.initials}
              </div>
            )}
            {isEditing && (
              <label className={`absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#8A252C] border-2 border-white flex items-center justify-center ${isUploadingPhoto ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`} title="Upload profile picture">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
                </svg>
                <input type="file" accept="image/*" className="hidden" onChange={handleProfilePhotoChange} disabled={isUploadingPhoto || isSaving} />
              </label>
            )}
          </div>

          {/* Name / info */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <>
                <h2 className="text-[1.35rem] font-[900] text-[#111827] m-0 mb-1 leading-[1.2]">Update your account information.</h2>
                <p className="text-[#64748b] text-[0.88rem] font-semibold m-0 mb-3">Keep your contact details and account records current.</p>
              </>
            ) : (
              <>
                <h2 className="text-[1.6rem] font-[900] text-[#111827] m-0 mb-1 leading-[1.2]">{fullName}</h2>
                <p className="text-[#64748b] text-[0.9rem] font-bold m-0 mb-3">{user.context}</p>
              </>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#e9f8ef] text-[#03703c] text-[0.75rem] font-[800]">Active account</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#fff8e1] text-[#6c4c00] text-[0.75rem] font-[800]">
                {isEditing ? `${profileCompletion}% complete` : `Profile ${profileCompletion}%`}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving || isUploadingPhoto}
                  className="inline-flex items-center justify-center min-h-[38px] px-4 rounded-lg border border-[#e2e8f0] bg-white text-[#344054] text-[0.84rem] font-[800] hover:bg-[#f8fafc] hover:border-[#cbd5e1] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="edit-profile-form"
                  disabled={isSaving || isUploadingPhoto}
                  className="inline-flex items-center justify-center min-h-[38px] px-4 rounded-lg bg-[#8A252C] border border-[#8A252C] text-white text-[0.84rem] font-[800] hover:bg-[#681920] transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : isUploadingPhoto ? "Uploading..." : "Save Changes"}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="inline-flex items-center justify-center min-h-[38px] px-4 rounded-lg border border-[#e2e8f0] bg-white text-[#344054] text-[0.84rem] font-[800] hover:bg-[#f8fafc] hover:border-[#cbd5e1] transition-all cursor-pointer"
                  onClick={handleCopyId}
                >
                  Copy ID
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    setMessage({ text: "Review your information before saving.", type: "" });
                    setIsEditing(true);
                  }}
                  className="inline-flex items-center justify-center min-h-[38px] px-4 rounded-lg bg-[#8A252C] border border-[#8A252C] text-white text-[0.84rem] font-[800] hover:bg-[#681920] transition-colors cursor-pointer"
                >
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">

        {/* Profile Info / Edit Form */}
        <section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 mb-6 pb-5 border-b border-[#e5eaf1]">
            <h3 className="text-[1.05rem] font-[800] text-[#111827] m-0">
              {isEditing ? "Account Details" : "Profile Information"}
            </h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[0.75rem] font-[800] ${isEditing ? "bg-[#fff8e1] text-[#6c4c00]" : "bg-[#e9f8ef] text-[#03703c]"}`}>
              {isEditing ? "Editable" : "Verified"}
            </span>
          </div>

          {isEditing ? (
            <form id="edit-profile-form" onSubmit={handleSave} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className={labelCls} htmlFor="fullName">Full Name</label>
                  <input id="fullName" className={inputCls} type="text" value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="schoolId">School ID number</label>
                  <input id="schoolId" className={`${inputCls} bg-[#f8fafc] text-[#64748b] cursor-not-allowed`} type="text" value={user.schoolId} readOnly />
                </div>
                <div>
                  <label className={labelCls} htmlFor="schoolEmail">School Email</label>
                  <input id="schoolEmail" className={`${inputCls} !bg-[#f1f5f9] !text-[#64748b] !border-[#cbd5e1] cursor-not-allowed shadow-inner opacity-80 focus:ring-0 focus:border-[#cbd5e1]`} type="email" value={email} readOnly disabled aria-disabled="true" />
                </div>
                <div>
                  <label className={labelCls} htmlFor="mobileNumber">Mobile Number</label>
                  <input id="mobileNumber" className={inputCls} type="tel" inputMode="tel" value={mobile} onChange={e => setMobile(withoutLetters(e.target.value))} />
                </div>
              </div>
              <div className={`flex items-center px-4 py-3 rounded-lg text-[0.85rem] font-semibold mb-5 ${message.type === "is-success" ? "bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]" : message.type === "is-error" ? "bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]" : "bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0]"}`} role="status" aria-live="polite">
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="border border-[#e2e8f0] rounded-lg p-4">
                <p className="text-[#64748b] text-[0.7rem] font-[800] uppercase tracking-wider m-0 mb-1">Full Name</p>
                <p className="text-[#111827] text-[0.95rem] font-bold m-0">{fullName}</p>
              </div>
              <div className="border border-[#e2e8f0] rounded-lg p-4">
                <p className="text-[#64748b] text-[0.7rem] font-[800] uppercase tracking-wider m-0 mb-1">School ID Number</p>
                <p className="text-[#111827] text-[0.95rem] font-bold m-0">{user.schoolId}</p>
              </div>
              <div className="border border-[#e2e8f0] rounded-lg p-4">
                <p className="text-[#64748b] text-[0.7rem] font-[800] uppercase tracking-wider m-0 mb-1">School Email</p>
                <p className="text-[#111827] text-[0.95rem] font-bold m-0">{email}</p>
              </div>
              <div className="border border-[#e2e8f0] rounded-lg p-4">
                <p className="text-[#64748b] text-[0.7rem] font-[800] uppercase tracking-wider m-0 mb-1">Mobile Number</p>
                <p className="text-[#111827] text-[0.95rem] font-bold m-0">{mobile}</p>
              </div>
            </div>
          )}
        </section>

        {/* Right card — Account Status (view) OR Live Profile Card (edit) */}
        <section className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-6 sm:p-8">
          {isEditing ? (
            <>
              <div className="flex items-center justify-between gap-4 mb-6 pb-5 border-b border-[#e5eaf1]">
                <h3 className="text-[1.05rem] font-[800] text-[#111827] m-0">Profile Card</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#e9f8ef] text-[#03703c] text-[0.75rem] font-[800]">Live</span>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profile preview" className="w-[64px] h-[64px] rounded-full object-cover border border-[#e2e8f0]" />
                ) : (
                  <div className="w-[64px] h-[64px] rounded-full bg-[#ffc107] text-[#111827] flex items-center justify-center text-[1.2rem] font-[900]">
                    {user.initials}
                  </div>
                )}
                <div>
                  <p className="text-[#111827] text-[1rem] font-[800] m-0 mb-0.5">{fullName || user.name}</p>
                  <p className="text-[#64748b] text-[0.85rem] font-bold m-0 mb-0.5">{user.context}</p>
                  <p className="text-[#64748b] text-[0.82rem] font-semibold m-0">{email || user.email}</p>
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
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-4 mb-6 pb-5 border-b border-[#e5eaf1]">
                <h3 className="text-[1.05rem] font-[800] text-[#111827] m-0">Account Status</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#e9f8ef] text-[#03703c] text-[0.75rem] font-[800]">Active</span>
              </div>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#64748b] text-[0.85rem] font-bold">Role</span>
                  <span className="text-[#111827] text-[0.85rem] font-bold">{user.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748b] text-[0.85rem] font-bold">Last updated</span>
                  <span className="text-[#111827] text-[0.85rem] font-bold">{user.lastLogin}</span>
                </div>
                <div className="mt-2 px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-[#64748b] text-[0.85rem] font-semibold">
                  Profile loaded.
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
