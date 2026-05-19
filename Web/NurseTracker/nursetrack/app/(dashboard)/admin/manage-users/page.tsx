"use client";

import React, { useMemo, useState } from "react";
import { LoadingState } from "@/components/ui/LoadingState";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { useToast } from "@/components/ui/ToastProvider";
import { useAdminCreateUser, useAdminResetPassword, useAdminUpdateUser, useUsers } from "@/core/api/hooks/useUsers";

const withoutLetters = (value: string) => value.replace(/\p{L}/gu, "");
const stripLettersFromInput = (event: React.FormEvent<HTMLInputElement>) => {
  event.currentTarget.value = withoutLetters(event.currentTarget.value);
};

type ApiUser = {
  id: number;
  fullName: string;
  email: string;
  mobileNumber?: string;
  schoolId: string;
  role: string;
  sectionInfo?: string;
  groupInfo?: string;
  assignedLevels?: number[];
  profileImageUrl?: string;
  status: string;
};

type DisplayUser = {
  api: ApiUser;
  name: string;
  email: string;
  role: string;
  id: string;
  section: string;
  group: string;
  status: string;
  initials: string;
  profileImageUrl: string;
  roleValue: string;
};

const roles = [
  { value: "student", api: "STUDENT", label: "Nursing Student" },
  { value: "instructor", api: "INSTRUCTOR", label: "Clinical Instructor" },
  { value: "chair", api: "CHAIR", label: "Chair" },
  { value: "admin", api: "ADMIN", label: "Admin" },
  { value: "coordinator", api: "COORDINATOR", label: "Coordinator" },
  { value: "enrollment", api: "ENROLLMENT", label: "Enrollment Team" },
  { value: "assistant", api: "ASSISTANT", label: "Assistant" },
];

const statusOptions = [
  { value: "all", api: "", label: "All status" },
  { value: "active", api: "ACTIVE", label: "Active" },
  { value: "deactivated", api: "SUSPENDED", label: "Deactivated" },
];

const sectionDefaults = ["BSN 1A", "BSN 1B", "BSN 2A", "BSN 2B", "BSN 3A", "BSN 3B", "BSN 4A", "BSN 4B"];

const toTitle = (value: string) => value.toLowerCase().replace(/(^|_)(\w)/g, (_, space, letter) => `${space ? " " : ""}${letter.toUpperCase()}`);
const initials = (name: string) => name.split(" ").filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join("") || "U";
const passwordInitials = (name: string) => name.split(" ").filter(Boolean).map(part => part[0]?.toUpperCase()).join("") || "U";
const resetPasswordValue = (user: DisplayUser) => `${passwordInitials(user.name)}#${user.id}`;
const roleApi = (value: string) => roles.find(role => role.value === value)?.api ?? "STUDENT";
const roleValue = (value: string) => roles.find(role => role.api === value)?.value ?? value.toLowerCase();
const roleLabel = (value: string) => roles.find(role => role.api === value)?.label ?? toTitle(value);
const statusLabel = (value: string) => value === "SUSPENDED" ? "Deactivated" : toTitle(value);
const statusApi = (value: string) => statusOptions.find(status => status.value === value.toLowerCase() || status.label === value)?.api || "ACTIVE";

export default function ManageUsersPage() {
  const [roleFilter, setRoleFilter] = useState("student");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedUserForAction, setSelectedUserForAction] = useState<DisplayUser | null>(null);
  const [actionStep, setActionStep] = useState<"menu" | "edit" | "status" | "reset">("menu");
  const [selectedMenuAction, setSelectedMenuAction] = useState<"edit" | "status" | "reset">("edit");

  const { data: userData = [], isLoading } = useUsers();
  const createUser = useAdminCreateUser();
  const updateUser = useAdminUpdateUser();
  const resetPassword = useAdminResetPassword();
  const { showToast } = useToast();

  const users = useMemo<DisplayUser[]>(() => (userData as ApiUser[]).map(user => ({
    api: user,
    name: user.fullName,
    email: user.email,
    role: roleLabel(user.role),
    id: user.schoolId,
    section: user.sectionInfo ?? "",
    group: user.groupInfo ?? "",
    status: statusLabel(user.status),
    initials: initials(user.fullName),
    profileImageUrl: user.profileImageUrl ?? "",
    roleValue: roleValue(user.role),
  })), [userData]);

  const sections = useMemo(() => Array.from(new Set([...sectionDefaults, ...users.map(user => user.section).filter(Boolean)])).sort(), [users]);

  const filteredUsers = users.filter(user => {
    const matchesRole = search ? true : user.roleValue === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status.toLowerCase() === statusFilter;
    const matchesSection = roleFilter !== "student" || sectionFilter === "all" || user.section === sectionFilter;
    const matchesSearch = !search || [user.name, user.email, user.role, user.id, user.section, user.group, user.status].some(val => val.toLowerCase().includes(search.toLowerCase()));
    return matchesRole && matchesStatus && matchesSection && matchesSearch;
  });

  const closeActionModal = () => {
    setSelectedUserForAction(null);
    setTimeout(() => {
      setActionStep("menu");
      setSelectedMenuAction("edit");
    }, 200);
  };

  const handleAddUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await createUser.mutateAsync({
        fullName: String(form.get("fullName") ?? ""),
        email: String(form.get("email") ?? ""),
        role: roleApi(String(form.get("role") ?? "student")),
        schoolId: withoutLetters(String(form.get("schoolId") ?? "")),
        sectionInfo: String(form.get("sectionInfo") ?? ""),
        groupInfo: String(form.get("groupInfo") ?? ""),
        mobileNumber: withoutLetters(String(form.get("mobileNumber") ?? "")),
        assignedLevels: String(form.get("assignedLevels") ?? "1"),
        password: String(form.get("password") ?? form.get("schoolId") ?? "password"),
        status: "ACTIVE",
      });
      setMessage("User account saved.");
      showToast({ variant: "success", title: "User added", message: "The account was saved." });
      setIsAddUserModalOpen(false);
    } catch {
      showToast({ variant: "error", title: "Add user failed", message: "The account could not be saved." });
    }
  };

  const handleEditUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUserForAction) return;
    const form = new FormData(event.currentTarget);
    try {
      await updateUser.mutateAsync({
        userId: selectedUserForAction.api.id,
        updates: {
          fullName: String(form.get("fullName") ?? ""),
          role: roleApi(String(form.get("role") ?? selectedUserForAction.roleValue)),
          sectionInfo: String(form.get("sectionInfo") ?? ""),
          groupInfo: String(form.get("groupInfo") ?? ""),
          assignedLevels: String(form.get("assignedLevels") ?? "1"),
        },
      });
      setMessage("User details updated.");
      showToast({ variant: "success", title: "User updated", message: "Account details were saved." });
      closeActionModal();
    } catch {
      showToast({ variant: "error", title: "Update failed", message: "Account details could not be saved." });
    }
  };

  const handleStatusChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUserForAction) return;
    const form = new FormData(event.currentTarget);
    try {
      await updateUser.mutateAsync({
        userId: selectedUserForAction.api.id,
        updates: { status: statusApi(String(form.get("status") ?? "Active")) },
      });
      setMessage("User status updated.");
      showToast({ variant: "success", title: "Status updated", message: "The account status was saved." });
      closeActionModal();
    } catch {
      showToast({ variant: "error", title: "Status update failed", message: "The account status could not be saved." });
    }
  };

  const handlePasswordReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUserForAction) return;
    try {
      const nextPassword = resetPasswordValue(selectedUserForAction);
      await resetPassword.mutateAsync({ userId: selectedUserForAction.api.id, password: nextPassword });
      setMessage(`Password reset to ${nextPassword}.`);
      showToast({ variant: "success", title: "Password reset", message: `Password was reset to ${nextPassword}.` });
      closeActionModal();
    } catch {
      showToast({ variant: "error", title: "Reset failed", message: "Password could not be reset." });
    }
  };

  const inputClass = "min-h-[48px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all";
  const selectClass = `${inputClass} cursor-pointer`;

  return (
    <>
      <main className="p-[clamp(24px,4vw,42px)] content-start grid gap-4">
        <section className="w-full">
          <article className="mt-0 p-[1.45rem] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)]">
            <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-[#e5eaf1] flex-wrap">
              <div><h2 className="m-0 !text-[#111827] !text-[1.25rem] leading-[1.15] !font-bold">User List</h2></div>
              <div className="flex items-center justify-end gap-3 flex-wrap">
                <button className="inline-flex items-center justify-center min-h-[38px] px-4 rounded-lg bg-white border border-[#e2e8f0] !text-[#334155] !text-sm !font-bold whitespace-nowrap hover:bg-[#f8fafc] transition-colors cursor-pointer" type="button" onClick={() => setIsAddUserModalOpen(true)}>Add User</button>
                <span className="inline-flex items-center px-[10px] py-[6px] rounded-full bg-[#e9f8ef] !text-[#078033] !text-[0.76rem] !font-extrabold whitespace-nowrap">{filteredUsers.length} visible</span>
              </div>
            </div>

            <div className={`grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-[0.85rem] mb-4 p-[0.95rem] border border-[#e5eaf1] rounded-lg bg-[#f8fafc] ${roleFilter !== "student" ? "is-non-student-role" : ""}`}>
              <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">Role<select className="min-h-[44px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all cursor-pointer" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>{roles.map(role => <option key={role.value} value={role.value}>{role.label.replace("Clinical ", "")}</option>)}</select></label>
              <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">Status<select className="min-h-[44px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all cursor-pointer" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>{statusOptions.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label>
              <label className={`flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054] ${roleFilter !== "student" ? "hidden" : ""}`}>Section<select className="min-h-[44px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all cursor-pointer" value={sectionFilter} onChange={e => setSectionFilter(e.target.value)}><option value="all">All sections</option>{sections.map(section => <option key={section} value={section}>{section}</option>)}</select></label>
              <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]"><span>Search</span><input className="min-h-[44px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all" type="search" placeholder="Search name, ID, email" value={search} onChange={e => setSearch(e.target.value)} /></label>
            </div>

            <div className="max-h-[560px] rounded-lg border border-[#e2e8f0] overflow-y-auto bg-white">
              <div className="sticky top-0 z-10 grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)_minmax(0,0.85fr)_minmax(0,0.7fr)_minmax(0,0.55fr)] gap-[0.9rem] p-[1rem_1.1rem] bg-[#f8fafc] border-b border-[#e2e8f0] !text-xs !font-extrabold !text-gray-500 uppercase tracking-wider max-[1180px]:hidden"><span>Name</span><span>Role</span><span>ID / Section</span><span>Status</span><span className="text-center">Action</span></div>
              <div className="divide-y divide-[#e2e8f0]">
                {isLoading ? <LoadingState message="Loading users..." className="min-h-[120px]" /> : filteredUsers.map(user => (
                  <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)_minmax(0,0.85fr)_minmax(0,0.7fr)_minmax(0,0.55fr)] items-center gap-[0.9rem] p-[1rem_1.1rem] bg-white hover:bg-gray-50/50 transition-colors max-[1180px]:grid-cols-1 max-[1180px]:gap-2" key={user.api.id}>
                    <span className="flex items-center gap-3 min-w-0"><ProfileAvatar name={user.name} imageUrl={user.profileImageUrl} size={42} /><span className="flex flex-col min-w-0"><strong className="!text-[#111827] !text-[0.95rem] !font-bold truncate">{user.name}</strong><small className="!text-[#64748b] !text-[0.8rem] !font-medium mt-0.5 truncate">{user.email}</small></span></span>
                    <span className="!text-[#4c5d7d] !text-[0.88rem] !font-bold">{user.role}</span>
                    <span className="flex flex-col"><strong className="!text-[#111827] !text-[0.9rem] !font-bold">{user.id}</strong>{user.section && <small className="!text-[#64748b] !text-[0.8rem] !font-medium mt-0.5">{user.section}</small>}{user.group && <small className="!text-[#64748b] !text-[0.8rem] !font-medium mt-0.5">Group: {user.group}</small>}</span>
                    <span><mark className={`inline-flex items-center px-[10px] py-[4px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap ${user.status === "Active" ? "bg-[#e9f8ef] !text-[#078033]" : user.status === "Pending" ? "bg-[#fff6cc] !text-[#6c4c00]" : "bg-[#fff1f0] !text-[#b42318]"}`}>{user.status}</mark></span>
                    <span className="flex justify-center max-[1180px]:justify-start max-[1180px]:mt-2"><button className="flex items-center justify-center w-[40px] min-w-[40px] h-[40px] min-h-[40px] border border-[#e2e8f0] bg-white rounded-lg !text-[#64748b] hover:!text-[#111827] hover:bg-[#f8fafc] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#8A252C]/50 cursor-pointer" type="button" aria-label="Open account action" title="Actions" onClick={() => setSelectedUserForAction(user)}><svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="12" cy="19" r="1.8" /></svg></button></span>
                  </div>
                ))}
                {!isLoading && filteredUsers.length === 0 && <div className="flex items-center justify-center min-h-[120px] p-6 !text-gray-500 !font-medium">No matching users found.</div>}
              </div>
            </div>

            {!isLoading && message && <div className="flex items-center min-h-[48px] mt-4 px-4 rounded-lg bg-[#e9f8ef] !text-[#078033] !text-sm !font-bold border border-[#bbf7d0]" role="status" aria-live="polite">{message}</div>}
          </article>
        </section>
      </main>

      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-[250] flex justify-center items-center p-[1.5rem] bg-[#0f172a]/[0.46] backdrop-blur-[3px] overflow-y-auto overflow-x-hidden max-[680px]:p-4">
          <section className="flex flex-col w-[min(560px,calc(100vw-32px))] max-w-[560px] max-h-[min(88vh,760px)] p-0 rounded-lg shadow-[0_26px_68px_rgba(15,23,42,0.24)] bg-white overflow-hidden m-auto" role="dialog" aria-modal="true" aria-labelledby="add-user-title">
            <div className="grid grid-cols-[minmax(0,1fr)_44px] items-center gap-[0.85rem] min-h-[76px] m-0 px-[1.35rem] py-[1.25rem] border-b border-[#e5eaf1] shrink-0"><div><p className="m-0 !text-[#8a252c] !text-[0.75rem] !font-extrabold uppercase tracking-[0.04em]">Add User</p><h2 id="add-user-title" className="m-0 mt-1 !text-[#111827] !text-[1.28rem] leading-[1.15] !font-bold">Create Account</h2></div><button className="relative grid place-items-center w-[44px] h-[44px] p-0 border border-[#dbe3ee] rounded-lg bg-white transition-colors cursor-pointer hover:border-[#8A252C]/40 focus-visible:border-[#8A252C]/40 before:absolute before:w-[14px] before:h-[2px] before:rounded-full before:bg-[#111827] before:rotate-45 after:absolute after:w-[14px] after:h-[2px] after:rounded-full after:bg-[#111827] after:-rotate-45" type="button" onClick={() => setIsAddUserModalOpen(false)} aria-label="Close modal" /></div>
            <form className="flex flex-col min-h-0 overflow-y-auto" onSubmit={handleAddUser}>
              <div className="grid grid-cols-2 gap-x-[1.1rem] gap-y-4 p-[1.25rem_1.35rem_0] max-[680px]:grid-cols-1">
                <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">Full name<input className={inputClass} name="fullName" type="text" placeholder="Enter full name" required /></label>
                <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">School email<input className={inputClass} name="email" type="email" placeholder="name@cit.edu" required /></label>
                <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">Role<select className={selectClass} name="role" required>{roles.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label>
                <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">ID<input className={inputClass} name="schoolId" type="text" inputMode="numeric" placeholder="Student ID or staff ID" onInput={stripLettersFromInput} required /></label>
                <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">Section<input className={inputClass} name="sectionInfo" type="text" placeholder="BSN 3A or department" /></label>
                <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">Group<input className={inputClass} name="groupInfo" type="text" placeholder="G1" /></label>
                <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">Assigned levels<input className={inputClass} name="assignedLevels" type="text" defaultValue="1" placeholder="1 or 1,2" /></label>
                <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">Mobile number<input className={inputClass} name="mobileNumber" type="tel" inputMode="tel" placeholder="Optional" onInput={stripLettersFromInput} /></label>
                <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">Initial password<input className={inputClass} name="password" type="text" placeholder="Defaults to ID" /></label>
                <div className="col-span-full flex items-center min-h-[48px] px-4 rounded-lg bg-[#f0f3f8] !text-[#4c5d7d] !text-sm !font-bold border border-[#dbe3ee]" role="status">Create a user account with the selected role and access details.</div>
              </div>
              <div className="grid grid-cols-2 gap-[0.8rem] m-0 px-[1.35rem] py-[1.1rem] pb-[1.35rem] mt-4 border-t border-[#e5eaf1] bg-white max-[680px]:grid-cols-1 shrink-0"><button className="inline-flex items-center justify-center w-full min-h-[48px] px-4 rounded-lg bg-white border border-[#e2e8f0] !text-[#334155] !text-[0.95rem] !font-extrabold hover:bg-[#f8fafc] transition-colors cursor-pointer" type="button" onClick={() => setIsAddUserModalOpen(false)}>Cancel</button><button className="inline-flex items-center justify-center w-full min-h-[48px] px-4 rounded-lg bg-[#8A252C] !text-white !text-[0.95rem] !font-extrabold shadow-[0_10px_22px_rgba(138,37,44,0.18)] hover:bg-[#6d1d23] hover:shadow-[0_16px_34px_rgba(138,37,44,0.22)] transition-all cursor-pointer disabled:opacity-60" type="submit" disabled={createUser.isPending}>Add User</button></div>
            </form>
          </section>
        </div>
      )}

      {selectedUserForAction && (
        <div className="fixed inset-0 z-[250] flex justify-center items-center p-[1.5rem] bg-[#0f172a]/[0.46] backdrop-blur-[3px] overflow-y-auto overflow-x-hidden max-[680px]:p-4">
          <section className="flex flex-col w-[min(560px,calc(100vw-32px))] max-w-[560px] max-h-[min(88vh,760px)] p-0 rounded-lg shadow-[0_26px_68px_rgba(15,23,42,0.24)] bg-white overflow-hidden m-auto" role="dialog" aria-modal="true" aria-labelledby="user-action-title">
            {actionStep === "menu" ? (
              <div className="grid grid-cols-[minmax(0,1fr)_44px] items-center gap-[0.85rem] min-h-[76px] m-0 px-[1.35rem] py-[1.25rem] border-b border-[#e5eaf1] shrink-0">
                <h2 id="user-action-title" className="m-0 !text-[#111827] !text-[1.28rem] leading-[1.15] !font-bold">Review Account</h2>
                <button className="relative grid place-items-center w-[44px] h-[44px] p-0 border border-[#dbe3ee] rounded-lg bg-white transition-colors cursor-pointer hover:border-[#8A252C]/40 focus-visible:border-[#8A252C]/40 before:absolute before:w-[14px] before:h-[2px] before:rounded-full before:bg-[#111827] before:rotate-45 before:transition-colors hover:before:bg-[#8A252C] after:absolute after:w-[14px] after:h-[2px] after:rounded-full after:bg-[#111827] after:-rotate-45 after:transition-colors hover:after:bg-[#8A252C]" type="button" onClick={closeActionModal} aria-label="Close modal" />
              </div>
            ) : (
              <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-[0.85rem] min-h-[76px] m-0 px-[1.35rem] py-[1.25rem] border-b border-[#e5eaf1] shrink-0">
                <button className="relative grid place-items-center w-[44px] h-[44px] p-0 border border-[#dbe3ee] rounded-lg bg-white transition-colors cursor-pointer hover:border-[#8A252C]/40 focus-visible:border-[#8A252C]/40 before:content-[''] before:w-[11px] before:h-[11px] before:border-l-[2.5px] before:border-b-[2.5px] before:border-[#111827] before:translate-x-[2px] before:rotate-45 before:transition-colors hover:before:border-[#8A252C]" type="button" onClick={() => setActionStep("menu")} aria-label="Back" />
                <div>
                  <p className="m-0 !text-[#8a252c] !text-[0.75rem] !font-extrabold uppercase tracking-[0.04em]">{actionStep === "edit" ? "EDIT USER" : actionStep === "status" ? "USER STATUS" : "PASSWORD RESET"}</p>
                  <h2 className="m-0 mt-[0.2rem] !text-[#111827] !text-[1.28rem] leading-[1.15] !font-bold">{actionStep === "edit" ? "Update Account Details" : actionStep === "status" ? "Change User Status" : "Confirm Password Reset"}</h2>
                </div>
                <button className="relative grid place-items-center w-[44px] h-[44px] p-0 border border-[#dbe3ee] rounded-lg bg-white transition-colors cursor-pointer hover:border-[#8A252C]/40 focus-visible:border-[#8A252C]/40 before:absolute before:w-[14px] before:h-[2px] before:rounded-full before:bg-[#111827] before:rotate-45 before:transition-colors hover:before:bg-[#8A252C] after:absolute after:w-[14px] after:h-[2px] after:rounded-full after:bg-[#111827] after:-rotate-45 after:transition-colors hover:after:bg-[#8A252C]" type="button" onClick={closeActionModal} aria-label="Close modal" />
              </div>
            )}

            {actionStep === "menu" && (
              <>
                <p className="m-0 pt-[1.15rem] px-[1.35rem] pb-0 !text-[#4c5d7d] !text-[0.94rem] !font-bold leading-[1.55]">Choose one clear action for this account.</p>
                <div className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-[0.85rem] w-auto mx-[1.35rem] my-4 p-[0.9rem] border border-[#dbe3ee] rounded-lg bg-[#f8fafc] overflow-hidden max-[680px]:grid-cols-[auto_minmax(0,1fr)] max-[680px]:gap-y-3">
                  <ProfileAvatar name={selectedUserForAction.name} imageUrl={selectedUserForAction.profileImageUrl} size={44} />
                  <div className="min-w-0"><strong className="block !text-[#111827] !text-base !font-extrabold leading-tight truncate">{selectedUserForAction.name}</strong><small className="block mt-[0.25rem] !text-[#667085] !text-[0.82rem] !font-extrabold leading-relaxed break-words">{selectedUserForAction.id}{selectedUserForAction.section ? ` - ${selectedUserForAction.section}` : ""}{selectedUserForAction.group ? ` ${selectedUserForAction.group}` : ""} - {selectedUserForAction.email}</small></div>
                  <mark className={`inline-flex items-center px-[10px] py-[4px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap max-[680px]:col-span-full max-[680px]:w-fit ${selectedUserForAction.status === "Active" ? "bg-[#e9f8ef] !text-[#078033]" : selectedUserForAction.status === "Pending" ? "bg-[#fff6cc] !text-[#6c4c00]" : "bg-[#fff1f0] !text-[#b42318]"}`}>{selectedUserForAction.status}</mark>
                </div>
                <div className="grid grid-cols-1 gap-[0.65rem] m-0 px-[1.35rem] pb-[1.15rem]">
                  {(["edit", "status", "reset"] as const).map(action => <button key={action} className={`flex items-center justify-start w-full min-h-[50px] px-[1.15rem] rounded-lg !text-[0.95rem] !font-extrabold text-left transition-colors cursor-pointer ${selectedMenuAction === action ? "border border-[#8A252C] bg-white !text-[#8A252C]" : "border border-[#e2e8f0] bg-white !text-[#334155] hover:bg-[#f8fafc]"}`} type="button" onClick={() => setSelectedMenuAction(action)}>{action === "edit" ? "Edit User Details" : action === "status" ? "Change User Status" : "Reset Password"}</button>)}
                </div>
                <div className="grid grid-cols-2 gap-[0.8rem] m-0 px-[1.35rem] py-[1.1rem] pb-[1.35rem] border-t border-[#e5eaf1] bg-[#f8fafc] max-[680px]:grid-cols-1 shrink-0"><button className="inline-flex items-center justify-center w-full min-h-[48px] px-4 rounded-lg bg-white border border-[#e2e8f0] !text-[#334155] !text-[0.95rem] !font-extrabold hover:bg-gray-50 transition-colors cursor-pointer" type="button" onClick={closeActionModal}>Cancel</button><button className="inline-flex items-center justify-center w-full min-h-[48px] px-4 rounded-lg bg-[#8A252C] !text-white !text-[0.95rem] !font-extrabold shadow-[0_10px_22px_rgba(138,37,44,0.18)] hover:bg-[#6d1d23] hover:shadow-[0_16px_34px_rgba(138,37,44,0.22)] transition-all cursor-pointer" type="button" onClick={() => setActionStep(selectedMenuAction)}>Continue</button></div>
              </>
            )}

            {actionStep === "edit" && <form className="flex flex-col min-h-0 overflow-y-auto" onSubmit={handleEditUser}><div className="grid grid-cols-1 gap-4 p-[1.25rem_1.35rem_0]"><label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">Full name<input className={inputClass} name="fullName" type="text" defaultValue={selectedUserForAction.name} required /></label><label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">Role<select className={selectClass} name="role" defaultValue={selectedUserForAction.roleValue} required>{roles.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label><label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">Section<input className={inputClass} name="sectionInfo" type="text" defaultValue={selectedUserForAction.section} /></label><label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">Assigned levels<input className={inputClass} name="assignedLevels" type="text" defaultValue={(selectedUserForAction.api.assignedLevels ?? [1]).join(",")} /></label><div className="flex items-center min-h-[48px] px-4 rounded-lg bg-[#f8fafc] !text-[#4c5d7d] !text-[0.85rem] !font-bold border border-[#e2e8f0]" role="status">School email is kept unchanged for account traceability.</div></div><div className="grid grid-cols-2 gap-[0.8rem] m-0 px-[1.35rem] py-[1.1rem] pb-[1.35rem] mt-4 border-t border-[#e5eaf1] bg-white max-[680px]:grid-cols-1 shrink-0"><button className="inline-flex items-center justify-center w-full min-h-[48px] px-4 rounded-lg bg-white border border-[#e2e8f0] !text-[#111827] !text-[0.95rem] !font-extrabold hover:bg-[#f8fafc] transition-colors cursor-pointer" type="button" onClick={() => setActionStep("menu")}>Back</button><button className="inline-flex items-center justify-center w-full min-h-[48px] px-4 rounded-lg bg-[#8A252C] !text-white !text-[0.95rem] !font-extrabold shadow-[0_10px_22px_rgba(138,37,44,0.18)] hover:bg-[#6d1d23] hover:shadow-[0_16px_34px_rgba(138,37,44,0.22)] transition-all cursor-pointer disabled:opacity-60" type="submit" disabled={updateUser.isPending}>Save Changes</button></div></form>}
            {actionStep === "status" && <form className="flex flex-col min-h-0 overflow-y-auto" onSubmit={handleStatusChange}><div className="grid grid-cols-1 gap-4 p-[1.25rem_1.35rem_0]"><div className="flex flex-col gap-1.5 p-4 rounded-lg bg-[#f8fafc] border border-[#dbe3ee]"><span className="!text-[0.75rem] !font-extrabold !text-[#4c5d7d] uppercase tracking-[0.04em]">Selected User</span><strong className="!text-[1.05rem] !text-[#111827] !font-bold">{selectedUserForAction.name}</strong></div><label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">New status<select className={selectClass} name="status" defaultValue={selectedUserForAction.status === "Pending" ? "Active" : selectedUserForAction.status} required><option value="Active">Active</option><option value="Deactivated">Deactivated</option></select></label><div className="flex items-center min-h-[48px] px-4 rounded-lg bg-[#f8fafc] !text-[#4c5d7d] !text-[0.85rem] !font-bold border border-[#e2e8f0]" role="status">Only the account status will be changed.</div></div><div className="grid grid-cols-2 gap-[0.8rem] m-0 px-[1.35rem] py-[1.1rem] pb-[1.35rem] mt-4 border-t border-[#e5eaf1] bg-white max-[680px]:grid-cols-1 shrink-0"><button className="inline-flex items-center justify-center w-full min-h-[48px] px-4 rounded-lg bg-white border border-[#e2e8f0] !text-[#111827] !text-[0.95rem] !font-extrabold hover:bg-[#f8fafc] transition-colors cursor-pointer" type="button" onClick={() => setActionStep("menu")}>Back</button><button className="inline-flex items-center justify-center w-full min-h-[48px] px-4 rounded-lg bg-[#8A252C] !text-white !text-[0.95rem] !font-extrabold shadow-[0_10px_22px_rgba(138,37,44,0.18)] hover:bg-[#6d1d23] hover:shadow-[0_16px_34px_rgba(138,37,44,0.22)] transition-all cursor-pointer disabled:opacity-60" type="submit" disabled={updateUser.isPending}>Save Status</button></div></form>}
            {actionStep === "reset" && <form className="flex flex-col min-h-0 overflow-y-auto" onSubmit={handlePasswordReset}><p className="m-0 pt-[1.15rem] px-[1.35rem] pb-0 !text-[#4c5d7d] !text-[0.94rem] !font-bold leading-[1.55]">Reset the password for <strong className="!text-[#111827]">{selectedUserForAction.name}</strong> to: <strong className="!text-[#111827]">{resetPasswordValue(selectedUserForAction)}</strong>.</p><div className="grid grid-cols-2 gap-[0.8rem] m-0 px-[1.35rem] py-[1.1rem] pb-[1.35rem] mt-4 border-t border-[#e5eaf1] bg-[#f8fafc] max-[680px]:grid-cols-1 shrink-0"><button className="inline-flex items-center justify-center w-full min-h-[48px] px-4 rounded-lg bg-white border border-[#e2e8f0] !text-[#111827] !text-[0.95rem] !font-extrabold hover:bg-gray-50 transition-colors cursor-pointer" type="button" onClick={() => setActionStep("menu")}>Back</button><button className="inline-flex items-center justify-center w-full min-h-[48px] px-4 rounded-lg bg-[#8A252C] !text-white !text-[0.95rem] !font-extrabold shadow-[0_10px_22px_rgba(138,37,44,0.18)] hover:bg-[#6d1d23] hover:shadow-[0_16px_34px_rgba(138,37,44,0.22)] transition-all cursor-pointer disabled:opacity-60" type="submit" disabled={resetPassword.isPending}>Reset Password</button></div></form>}
          </section>
        </div>
      )}
    </>
  );
}
