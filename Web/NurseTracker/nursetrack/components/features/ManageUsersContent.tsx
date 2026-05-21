"use client";

import React, { useMemo, useState } from "react";
import { InlineSelect } from "@/components/ui/InlineSelect";
import { LoadingState } from "@/components/ui/LoadingState";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { useToast } from "@/components/ui/ToastProvider";
import {
  useAdminCreateUser,
  useAdminResetPassword,
  useAdminUpdateUser,
  useUsers,
} from "@/core/api/hooks/useUsers";

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
  level: string;
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

const accountStatusOptions = [
  { value: "Active", label: "Active" },
  { value: "Deactivated", label: "Deactivated" },
];
const levelOptions = [1, 2, 3, 4].map((level) => ({ value: String(level), label: `Level ${level}` }));

const sectionDefaults = [
  "BSN 1A",
  "BSN 1B",
  "BSN 2A",
  "BSN 2B",
  "BSN 3A",
  "BSN 3B",
  "BSN 4A",
  "BSN 4B",
];

const toTitle = (value: string) =>
  value
    .toLowerCase()
    .replace(
      /(^|_)(\w)/g,
      (_, space, letter) => `${space ? " " : ""}${letter.toUpperCase()}`,
    );
const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
const passwordInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
const resetPasswordValue = (user: DisplayUser) =>
  `${passwordInitials(user.name)}#${user.id}`;
const roleApi = (value: string) =>
  roles.find((role) => role.value === value)?.api ?? "STUDENT";
const assignedLevelsForRole = (role: string, value: FormDataEntryValue | null) =>
  roleApi(role) === "COORDINATOR" ? "1,2,3,4" : roleApi(role) === "INSTRUCTOR" ? String(value ?? "1").split(",")[0]?.trim() || "1" : String(value ?? "1");
const roleValue = (value: string) =>
  roles.find((role) => role.api === value)?.value ?? value.toLowerCase();
const roleLabel = (value: string) =>
  roles.find((role) => role.api === value)?.label ?? toTitle(value);
const statusLabel = (value: string) =>
  value === "SUSPENDED" ? "Deactivated" : toTitle(value);
const statusApi = (value: string) =>
  statusOptions.find(
    (status) => status.value === value.toLowerCase() || status.label === value,
  )?.api || "ACTIVE";
const levelLabel = (levels?: number[]) => {
  const normalized = Array.from(new Set(levels ?? [])).sort((a, b) => a - b);
  if (!normalized.length) return "Not set";
  return normalized.length === 1 ? `Level ${normalized[0]}` : `Levels ${normalized.join(", ")}`;
};
const USERS_PER_PAGE = 10;

export function ManageUsersContent() {
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [newUserRole, setNewUserRole] = useState("student");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedUserForAction, setSelectedUserForAction] =
    useState<DisplayUser | null>(null);
  const [actionStep, setActionStep] = useState<
    "menu" | "edit" | "status" | "reset"
  >("menu");
  const [selectedMenuAction, setSelectedMenuAction] = useState<
    "edit" | "status" | "reset"
  >("edit");
  const [editRole, setEditRole] = useState("student");
  const [newUserLevel, setNewUserLevel] = useState("1");
  const [editLevel, setEditLevel] = useState("1");
  const [nextStatus, setNextStatus] = useState("Active");
  const [userPage, setUserPage] = useState(1);

  const { data: userData = [], isLoading } = useUsers();
  const createUser = useAdminCreateUser();
  const updateUser = useAdminUpdateUser();
  const resetPassword = useAdminResetPassword();
  const { showToast } = useToast();

  const users = useMemo<DisplayUser[]>(
    () =>
      (userData as ApiUser[]).map((user) => ({
        api: user,
        name: user.fullName,
        email: user.email,
        role: roleLabel(user.role),
        id: user.schoolId,
        section: user.sectionInfo ?? "",
        group: user.groupInfo ?? "",
        level: levelLabel(user.assignedLevels),
        status: statusLabel(user.status),
        initials: initials(user.fullName),
        profileImageUrl: user.profileImageUrl ?? "",
        roleValue: roleValue(user.role),
      })),
    [userData],
  );

  const sections = useMemo(
    () =>
      Array.from(
        new Set([
          ...sectionDefaults,
          ...users.map((user) => user.section).filter(Boolean),
        ]),
      ).sort(),
    [users],
  );
  const roleFilterOptions = [
    { value: "all", label: "All roles" },
    ...roles.map((role) => ({
      value: role.value,
      label: role.label,
    })),
  ];
  const roleOptions = roles.map((role) => ({
    value: role.value,
    label: role.label,
  }));
  const sectionOptions = [
    { value: "all", label: "All sections" },
    ...sections.map((section) => ({ value: section, label: section })),
  ];

  const filteredUsers = users.filter((user) => {
    const matchesRole = search || roleFilter === "all" ? true : user.roleValue === roleFilter;
    const matchesStatus =
      statusFilter === "all" || user.status.toLowerCase() === statusFilter;
    const matchesSection = sectionFilter === "all" || user.section === sectionFilter;
    const matchesSearch =
      !search ||
      [
        user.name,
        user.email,
        user.role,
        user.id,
        user.section,
        user.group,
        user.level,
        user.status,
      ].some((val) => val.toLowerCase().includes(search.toLowerCase()));
    return matchesRole && matchesStatus && matchesSection && matchesSearch;
  });
  const userTotalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const pagedUsers = filteredUsers.slice((userPage - 1) * USERS_PER_PAGE, userPage * USERS_PER_PAGE);

  React.useEffect(() => {
    setUserPage((page) => Math.min(page, userTotalPages));
  }, [userTotalPages]);

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
        assignedLevels: assignedLevelsForRole(String(form.get("role") ?? "student"), form.get("assignedLevels")),
        password: String(
          form.get("password") ?? form.get("schoolId") ?? "password",
        ),
        status: "ACTIVE",
      });
      setMessage("User account saved.");
      showToast({
        variant: "success",
        title: "User added",
        message: "The account was saved.",
      });
      setNewUserRole("student");
      setNewUserLevel("1");
      setIsAddUserModalOpen(false);
    } catch {
      showToast({
        variant: "error",
        title: "Add user failed",
        message: "The account could not be saved.",
      });
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
          role: roleApi(
            String(form.get("role") ?? selectedUserForAction.roleValue),
          ),
          sectionInfo: String(form.get("sectionInfo") ?? ""),
          groupInfo: String(form.get("groupInfo") ?? ""),
          assignedLevels: assignedLevelsForRole(String(form.get("role") ?? selectedUserForAction.roleValue), form.get("assignedLevels")),
        },
      });
      setMessage("User details updated.");
      showToast({
        variant: "success",
        title: "User updated",
        message: "Account details were saved.",
      });
      closeActionModal();
    } catch {
      showToast({
        variant: "error",
        title: "Update failed",
        message: "Account details could not be saved.",
      });
    }
  };

  const handleStatusChange = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!selectedUserForAction) return;
    const form = new FormData(event.currentTarget);
    try {
      await updateUser.mutateAsync({
        userId: selectedUserForAction.api.id,
        updates: { status: statusApi(String(form.get("status") ?? "Active")) },
      });
      setMessage("User status updated.");
      showToast({
        variant: "success",
        title: "Status updated",
        message: "The account status was saved.",
      });
      closeActionModal();
    } catch {
      showToast({
        variant: "error",
        title: "Status update failed",
        message: "The account status could not be saved.",
      });
    }
  };

  const handlePasswordReset = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!selectedUserForAction) return;
    try {
      const nextPassword = resetPasswordValue(selectedUserForAction);
      await resetPassword.mutateAsync({
        userId: selectedUserForAction.api.id,
        password: nextPassword,
      });
      setMessage(`Password reset to ${nextPassword}.`);
      showToast({
        variant: "success",
        title: "Password reset",
        message: `Password was reset to ${nextPassword}.`,
      });
      closeActionModal();
    } catch {
      showToast({
        variant: "error",
        title: "Reset failed",
        message: "Password could not be reset.",
      });
    }
  };

  const inputClass =
    "min-h-[48px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all";

  return (
    <>
      <main className="p-[clamp(24px,4vw,42px)] content-start grid gap-4">
        <section className="w-full">
          <article className="mt-0 p-[1.45rem] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)]">
            <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-[#e5eaf1] flex-wrap">
              <div>
                <h2 className="m-0 !text-[#111827] !text-[1.25rem] leading-[1.15] !font-bold">
                  User List
                </h2>
              </div>
              <div className="flex items-center justify-end gap-3 flex-wrap">
                <button
                  className="inline-flex items-center justify-center min-h-[38px] px-4 rounded-lg bg-white border border-[#e2e8f0] !text-[#334155] !text-sm !font-bold whitespace-nowrap hover:bg-[#f8fafc] transition-colors cursor-pointer"
                  type="button"
                  onClick={() => setIsAddUserModalOpen(true)}
                >
                  Add User
                </button>
                <span className="inline-flex items-center px-[10px] py-[6px] rounded-full bg-[#e9f8ef] !text-[#078033] !text-[0.76rem] !font-extrabold whitespace-nowrap">
                  {filteredUsers.length} visible
                </span>
              </div>
            </div>

            <div
              className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-[0.85rem] mb-4 p-[0.95rem] border border-[#e5eaf1] rounded-lg bg-[#f8fafc]"
            >
              <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                Role
                <InlineSelect
                  value={roleFilter}
                  options={roleFilterOptions}
                  placeholder="Select role"
                  onChange={(value) => { setRoleFilter(value); setUserPage(1); }}
                />
              </label>
              <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                Status
                <InlineSelect
                  value={statusFilter}
                  options={statusOptions.map(({ value, label }) => ({
                    value,
                    label,
                  }))}
                  placeholder="All status"
                  onChange={(value) => { setStatusFilter(value); setUserPage(1); }}
                />
              </label>
              <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                Section
                <InlineSelect
                  value={sectionFilter}
                  options={sectionOptions}
                  placeholder="All sections"
                  onChange={(value) => { setSectionFilter(value); setUserPage(1); }}
                />
              </label>
              <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                <span>Search</span>
                <input
                  className="min-h-[44px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all"
                  type="search"
                  placeholder="Search name, ID, email"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setUserPage(1); }}
                />
              </label>
            </div>

            <div className="rounded-lg border border-[#e2e8f0] overflow-hidden bg-white">
              <div className="sticky top-0 z-10 grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)_minmax(0,0.8fr)_minmax(0,0.55fr)_minmax(0,0.65fr)_minmax(0,0.5fr)] gap-[0.9rem] p-[1rem_1.1rem] bg-[#f8fafc] border-b border-[#e2e8f0] !text-xs !font-extrabold !text-gray-500 uppercase tracking-wider max-[1180px]:hidden">
                <span>Name</span>
                <span>Role</span>
                <span>ID / Section</span>
                <span>Level</span>
                <span>Status</span>
                <span className="text-center">Action</span>
              </div>
              <div className="divide-y divide-[#e2e8f0] max-[1180px]:divide-y-0 max-[1180px]:grid max-[1180px]:gap-3 max-[1180px]:p-3">
                {isLoading ? (
                  <LoadingState
                    message="Loading users..."
                    className="min-h-[120px]"
                  />
                ) : (
                  pagedUsers.map((user) => (
                    <div
                      className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)_minmax(0,0.8fr)_minmax(0,0.55fr)_minmax(0,0.65fr)_minmax(0,0.5fr)] items-center gap-[0.9rem] p-[1rem_1.1rem] bg-white hover:bg-gray-50/50 transition-colors max-[1180px]:grid-cols-[minmax(0,1fr)_auto] max-[1180px]:items-start max-[1180px]:gap-3 max-[1180px]:rounded-xl max-[1180px]:border max-[1180px]:border-[#e2e8f0] max-[1180px]:p-4 max-[1180px]:shadow-sm"
                      key={user.api.id}
                    >
                      <span className="flex items-center gap-3 min-w-0 max-[1180px]:pr-2">
                        <ProfileAvatar
                          name={user.name}
                          imageUrl={user.profileImageUrl}
                          size={42}
                        />
                        <span className="flex flex-col min-w-0">
                          <strong className="!text-[#111827] !text-[0.95rem] !font-bold truncate">
                            {user.name}
                          </strong>
                          <small className="!text-[#64748b] !text-[0.8rem] !font-medium mt-0.5 truncate">
                            {user.email}
                          </small>
                        </span>
                      </span>
                      <span className="!text-[#4c5d7d] !text-[0.88rem] !font-bold max-[1180px]:col-span-2 max-[1180px]:grid max-[1180px]:gap-1 max-[1180px]:rounded-lg max-[1180px]:border max-[1180px]:border-[#e2e8f0] max-[1180px]:bg-[#f8fafc] max-[1180px]:px-3 max-[1180px]:py-2">
                        <small className="hidden max-[1180px]:block !text-[#64748b] !text-[0.68rem] !font-[900] uppercase tracking-wide">Role</small>
                        <span>{user.role}</span>
                      </span>
                      <span className="flex flex-col max-[1180px]:col-span-2 max-[1180px]:rounded-lg max-[1180px]:border max-[1180px]:border-[#e2e8f0] max-[1180px]:bg-[#f8fafc] max-[1180px]:px-3 max-[1180px]:py-2">
                          <small className="hidden max-[1180px]:block !text-[#64748b] !text-[0.68rem] !font-[900] uppercase tracking-wide mb-1">ID / Section</small>
                          <strong className="!text-[#111827] !text-[0.9rem] !font-bold">
                            {user.id}
                          </strong>
                        {(user.section || user.group) && <small className="!text-[#64748b] !text-[0.8rem] !font-medium mt-0.5 truncate">{[user.section, user.group ? `Group: ${user.group}` : ""].filter(Boolean).join(" - ")}</small>}
                      </span>
                      <span className="!text-[#4c5d7d] !text-[0.88rem] !font-bold max-[1180px]:col-span-2 max-[1180px]:grid max-[1180px]:gap-1 max-[1180px]:rounded-lg max-[1180px]:border max-[1180px]:border-[#e2e8f0] max-[1180px]:bg-[#f8fafc] max-[1180px]:px-3 max-[1180px]:py-2">
                        <small className="hidden max-[1180px]:block !text-[#64748b] !text-[0.68rem] !font-[900] uppercase tracking-wide">Level</small>
                        <span>{user.level}</span>
                      </span>
                      <span className="max-[1180px]:col-span-2 max-[1180px]:flex max-[1180px]:items-center max-[1180px]:justify-between max-[1180px]:gap-3 max-[1180px]:rounded-lg max-[1180px]:border max-[1180px]:border-[#e2e8f0] max-[1180px]:bg-white max-[1180px]:px-3 max-[1180px]:py-2">
                        <small className="hidden max-[1180px]:block !text-[#64748b] !text-[0.68rem] !font-[900] uppercase tracking-wide">Status</small>
                        <mark
                          className={`inline-flex items-center px-[10px] py-[4px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap ${user.status === "Active" ? "bg-[#e9f8ef] !text-[#078033]" : user.status === "Pending" ? "bg-[#fff6cc] !text-[#6c4c00]" : "bg-[#fff1f0] !text-[#b42318]"}`}
                        >
                          {user.status}
                        </mark>
                      </span>
                      <span className="flex justify-center max-[1180px]:col-start-2 max-[1180px]:row-start-1 max-[1180px]:justify-self-end max-[1180px]:self-start">
                        <button
                          className="flex items-center justify-center w-[40px] min-w-[40px] h-[40px] min-h-[40px] border border-[#e2e8f0] bg-white rounded-lg !text-[#64748b] hover:!text-[#111827] hover:bg-[#f8fafc] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#8A252C]/50 cursor-pointer"
                          type="button"
                          aria-label="Open account action"
                          title="Actions"
                          onClick={() => {
                            setSelectedUserForAction(user);
                            setEditRole(user.roleValue);
                            setEditLevel(String(user.api.assignedLevels?.[0] ?? 1));
                            setNextStatus(
                              user.status === "Pending"
                                ? "Active"
                                : user.status,
                            );
                          }}
                        >
                          <svg
                            className="w-6 h-6 fill-current"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <circle cx="12" cy="5" r="1.8" />
                            <circle cx="12" cy="12" r="1.8" />
                            <circle cx="12" cy="19" r="1.8" />
                          </svg>
                        </button>
                      </span>
                    </div>
                  ))
                )}
                {!isLoading && filteredUsers.length === 0 && (
                  <div className="flex items-center justify-center min-h-[120px] p-6 !text-gray-500 !font-medium">
                    No matching users found.
                  </div>
                )}
              </div>
            </div>
            {userTotalPages > 1 && (
              <div className="flex justify-between items-center p-[1rem_1.5rem] gap-2 border border-[#e2e8f0] border-t-0 rounded-b-lg bg-[#f8fafc]">
                <button className="inline-flex items-center justify-center min-h-[38px] px-[1rem] rounded-[8px] bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.84rem] !font-[800] hover:border-[rgba(138,37,44,0.32)] hover:!text-[#8A252C] hover:shadow-[0_10px_24px_rgba(32,33,36,0.08)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => setUserPage((page) => Math.max(1, page - 1))} disabled={userPage === 1}>Previous</button>
                <span className="!text-[0.875rem] !font-[600] !text-[#64748b] whitespace-nowrap"><span className="hidden sm:inline">Page </span>{userPage} of {userTotalPages}</span>
                <button className="inline-flex items-center justify-center min-h-[38px] px-[1rem] rounded-[8px] bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.84rem] !font-[800] hover:border-[rgba(138,37,44,0.32)] hover:!text-[#8A252C] hover:shadow-[0_10px_24px_rgba(32,33,36,0.08)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => setUserPage((page) => Math.min(userTotalPages, page + 1))} disabled={userPage === userTotalPages}>Next</button>
              </div>
            )}

            {!isLoading && message && (
              <div
                className="flex items-center min-h-[48px] mt-4 px-4 rounded-lg bg-[#e9f8ef] !text-[#078033] !text-sm !font-bold border border-[#bbf7d0]"
                role="status"
                aria-live="polite"
              >
                {message}
              </div>
            )}
          </article>
        </section>
      </main>

      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-[250] flex justify-center items-center p-[1.5rem] bg-[#0f172a]/[0.46] backdrop-blur-[3px] overflow-y-auto overflow-x-hidden max-[680px]:p-4">
          <section
            className="flex flex-col w-[min(560px,calc(100vw-32px))] max-w-[560px] max-h-[min(88vh,760px)] p-0 rounded-lg shadow-[0_26px_68px_rgba(15,23,42,0.24)] bg-white overflow-hidden m-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-user-title"
          >
            <div className="grid grid-cols-[minmax(0,1fr)_44px] items-center gap-[0.85rem] min-h-[76px] m-0 px-[1.35rem] py-[1.25rem] border-b border-[#e5eaf1] shrink-0">
              <div>
                <p className="m-0 !text-[#8a252c] !text-[0.75rem] !font-extrabold uppercase tracking-[0.04em]">
                  Add User
                </p>
                <h2
                  id="add-user-title"
                  className="m-0 mt-1 !text-[#111827] !text-[1.28rem] leading-[1.15] !font-bold"
                >
                  Create Account
                </h2>
              </div>
              <button
                className="relative grid place-items-center w-[44px] h-[44px] p-0 border border-[#dbe3ee] rounded-lg bg-white transition-colors cursor-pointer hover:border-[#8A252C]/40 focus-visible:border-[#8A252C]/40 before:absolute before:w-[14px] before:h-[2px] before:rounded-full before:bg-[#111827] before:rotate-45 after:absolute after:w-[14px] after:h-[2px] after:rounded-full after:bg-[#111827] after:-rotate-45"
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                aria-label="Close modal"
              />
            </div>
            <form
              className="flex flex-col min-h-0 overflow-y-auto"
              onSubmit={handleAddUser}
            >
              <div className="grid grid-cols-2 gap-x-[1.1rem] gap-y-4 p-[1.25rem_1.35rem_0] max-[680px]:grid-cols-1">
                <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                  Full name
                  <input
                    className={inputClass}
                    name="fullName"
                    type="text"
                    placeholder="Enter full name"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                  School email
                  <input
                    className={inputClass}
                    name="email"
                    type="email"
                    placeholder="name@cit.edu"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                  Role
                  <input type="hidden" name="role" value={newUserRole} />
                  <InlineSelect
                    value={newUserRole}
                    options={roleOptions}
                    placeholder="Select role"
                    onChange={(value) => {
                      setNewUserRole(value);
                      setNewUserLevel(value === "coordinator" ? "1" : newUserLevel);
                    }}
                  />
                </label>
                <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                  ID
                  <input
                    className={inputClass}
                    name="schoolId"
                    type="text"
                    inputMode="text"
                    placeholder="Student ID or staff ID"
                    onInput={stripLettersFromInput}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                  Section
                  <input
                    className={inputClass}
                    name="sectionInfo"
                    type="text"
                    placeholder="BSN 3A or department"
                  />
                </label>
                <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                  Group
                  <input
                    className={inputClass}
                    name="groupInfo"
                    type="text"
                    placeholder="G1"
                  />
                </label>
                <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                  Assigned levels
                  <input type="hidden" name="assignedLevels" value={newUserRole === "coordinator" ? "1,2,3,4" : newUserLevel} />
                  {newUserRole === "coordinator" ? <input className={inputClass} value="Levels 1, 2, 3, 4" readOnly /> : <InlineSelect value={newUserLevel} options={levelOptions} placeholder="Select level" onChange={setNewUserLevel} />}
                </label>
                <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                  Mobile number
                  <input
                    className={inputClass}
                    name="mobileNumber"
                    type="tel"
                    inputMode="tel"
                    placeholder="Optional"
                    onInput={stripLettersFromInput}
                  />
                </label>
                <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                  Initial password
                  <input
                    className={inputClass}
                    name="password"
                    type="text"
                    placeholder="Defaults to ID"
                  />
                </label>
                <div
                  className="col-span-full flex items-center min-h-[48px] px-4 rounded-lg bg-[#f0f3f8] !text-[#4c5d7d] !text-sm !font-bold border border-[#dbe3ee]"
                  role="status"
                >
                  Create a user account with the selected role and access
                  details.
                </div>
              </div>
              <div className="grid grid-cols-2 gap-[0.8rem] m-0 px-[1.35rem] py-[1.1rem] pb-[1.35rem] mt-4 border-t border-[#e5eaf1] bg-white max-[680px]:grid-cols-1 shrink-0">
                <button
                  className="inline-flex items-center justify-center w-full min-h-[48px] px-4 rounded-lg bg-white border border-[#e2e8f0] !text-[#334155] !text-[0.95rem] !font-extrabold hover:bg-[#f8fafc] transition-colors cursor-pointer"
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="inline-flex items-center justify-center w-full min-h-[48px] px-4 rounded-lg bg-[#8A252C] !text-white !text-[0.95rem] !font-extrabold shadow-[0_10px_22px_rgba(138,37,44,0.18)] hover:bg-[#6d1d23] hover:shadow-[0_16px_34px_rgba(138,37,44,0.22)] transition-all cursor-pointer disabled:opacity-60"
                  type="submit"
                  disabled={createUser.isPending}
                >
                  Add User
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selectedUserForAction && (
        <div className="fixed inset-0 z-[250] flex justify-center items-center p-[1.5rem] bg-[#0f172a]/[0.46] backdrop-blur-[3px] overflow-y-auto overflow-x-hidden max-[680px]:p-4">
          <section
            className="flex flex-col w-[min(560px,calc(100vw-32px))] max-w-[560px] max-h-[min(88vh,760px)] p-0 rounded-lg shadow-[0_26px_68px_rgba(15,23,42,0.24)] bg-white overflow-hidden m-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-action-title"
          >
            {actionStep === "menu" ? (
              <div className="grid grid-cols-[minmax(0,1fr)_44px] items-center gap-[0.85rem] min-h-[76px] m-0 px-[1.35rem] py-[1.25rem] border-b border-[#e5eaf1] shrink-0">
                <h2
                  id="user-action-title"
                  className="m-0 !text-[#111827] !text-[1.28rem] leading-[1.15] !font-bold"
                >
                  Review Account
                </h2>
                <button
                  className="relative grid place-items-center w-[44px] h-[44px] p-0 border border-[#dbe3ee] rounded-lg bg-white transition-colors cursor-pointer hover:border-[#8A252C]/40 focus-visible:border-[#8A252C]/40 before:absolute before:w-[14px] before:h-[2px] before:rounded-full before:bg-[#111827] before:rotate-45 before:transition-colors hover:before:bg-[#8A252C] after:absolute after:w-[14px] after:h-[2px] after:rounded-full after:bg-[#111827] after:-rotate-45 after:transition-colors hover:after:bg-[#8A252C]"
                  type="button"
                  onClick={closeActionModal}
                  aria-label="Close modal"
                />
              </div>
            ) : (
              <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-[0.85rem] min-h-[76px] m-0 px-[1.35rem] py-[1.25rem] border-b border-[#e5eaf1] shrink-0">
                <button
                  className="relative grid place-items-center w-[44px] h-[44px] p-0 border border-[#dbe3ee] rounded-lg bg-white transition-colors cursor-pointer hover:border-[#8A252C]/40 focus-visible:border-[#8A252C]/40 before:content-[''] before:w-[11px] before:h-[11px] before:border-l-[2.5px] before:border-b-[2.5px] before:border-[#111827] before:translate-x-[2px] before:rotate-45 before:transition-colors hover:before:border-[#8A252C]"
                  type="button"
                  onClick={() => setActionStep("menu")}
                  aria-label="Back"
                />
                <div>
                  <p className="m-0 !text-[#8a252c] !text-[0.75rem] !font-extrabold uppercase tracking-[0.04em]">
                    {actionStep === "edit"
                      ? "EDIT USER"
                      : actionStep === "status"
                        ? "USER STATUS"
                        : "PASSWORD RESET"}
                  </p>
                  <h2 className="m-0 mt-[0.2rem] !text-[#111827] !text-[1.28rem] leading-[1.15] !font-bold">
                    {actionStep === "edit"
                      ? "Update Account Details"
                      : actionStep === "status"
                        ? "Change User Status"
                        : "Confirm Password Reset"}
                  </h2>
                </div>
                <button
                  className="relative grid place-items-center w-[44px] h-[44px] p-0 border border-[#dbe3ee] rounded-lg bg-white transition-colors cursor-pointer hover:border-[#8A252C]/40 focus-visible:border-[#8A252C]/40 before:absolute before:w-[14px] before:h-[2px] before:rounded-full before:bg-[#111827] before:rotate-45 before:transition-colors hover:before:bg-[#8A252C] after:absolute after:w-[14px] after:h-[2px] after:rounded-full after:bg-[#111827] after:-rotate-45 after:transition-colors hover:after:bg-[#8A252C]"
                  type="button"
                  onClick={closeActionModal}
                  aria-label="Close modal"
                />
              </div>
            )}

            {actionStep === "menu" && (
              <>
                <p className="m-0 pt-[1.15rem] px-[1.35rem] pb-0 !text-[#4c5d7d] !text-[0.94rem] !font-bold leading-[1.55]">
                  Choose one clear action for this account.
                </p>
                <div className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-[0.85rem] w-auto mx-[1.35rem] my-4 p-[0.9rem] border border-[#dbe3ee] rounded-lg bg-[#f8fafc] overflow-hidden max-[680px]:grid-cols-[auto_minmax(0,1fr)] max-[680px]:gap-y-3">
                  <ProfileAvatar
                    name={selectedUserForAction.name}
                    imageUrl={selectedUserForAction.profileImageUrl}
                    size={44}
                  />
                  <div className="min-w-0">
                    <strong className="block !text-[#111827] !text-base !font-extrabold leading-tight truncate">
                      {selectedUserForAction.name}
                    </strong>
                    <small className="block mt-[0.25rem] !text-[#667085] !text-[0.82rem] !font-extrabold leading-relaxed break-words">
                      {selectedUserForAction.id}
                      {selectedUserForAction.section
                        ? ` - ${selectedUserForAction.section}`
                        : ""}
                      {selectedUserForAction.group
                        ? ` ${selectedUserForAction.group}`
                        : ""}{" "}
                      - {selectedUserForAction.email}
                    </small>
                  </div>
                  <mark
                    className={`inline-flex items-center px-[10px] py-[4px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap max-[680px]:col-span-full max-[680px]:w-fit ${selectedUserForAction.status === "Active" ? "bg-[#e9f8ef] !text-[#078033]" : selectedUserForAction.status === "Pending" ? "bg-[#fff6cc] !text-[#6c4c00]" : "bg-[#fff1f0] !text-[#b42318]"}`}
                  >
                    {selectedUserForAction.status}
                  </mark>
                </div>
                <div className="grid grid-cols-1 gap-[0.65rem] m-0 px-[1.35rem] pb-[1.15rem]">
                  {(["edit", "status", "reset"] as const).map((action) => (
                    <button
                      key={action}
                      className={`flex items-center justify-start w-full min-h-[50px] px-[1.15rem] rounded-lg !text-[0.95rem] !font-extrabold text-left transition-colors cursor-pointer ${selectedMenuAction === action ? "border border-[#8A252C] bg-white !text-[#8A252C]" : "border border-[#e2e8f0] bg-white !text-[#334155] hover:bg-[#f8fafc]"}`}
                      type="button"
                      onClick={() => setSelectedMenuAction(action)}
                    >
                      {action === "edit"
                        ? "Edit User Details"
                        : action === "status"
                          ? "Change User Status"
                          : "Reset Password"}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-[0.8rem] m-0 px-[1.35rem] py-[1.1rem] pb-[1.35rem] border-t border-[#e5eaf1] bg-[#f8fafc] max-[680px]:grid-cols-1 shrink-0">
                  <button
                    className="inline-flex items-center justify-center w-full min-h-[48px] px-4 rounded-lg bg-white border border-[#e2e8f0] !text-[#334155] !text-[0.95rem] !font-extrabold hover:bg-gray-50 transition-colors cursor-pointer"
                    type="button"
                    onClick={closeActionModal}
                  >
                    Cancel
                  </button>
                  <button
                    className="inline-flex items-center justify-center w-full min-h-[48px] px-4 rounded-lg bg-[#8A252C] !text-white !text-[0.95rem] !font-extrabold shadow-[0_10px_22px_rgba(138,37,44,0.18)] hover:bg-[#6d1d23] hover:shadow-[0_16px_34px_rgba(138,37,44,0.22)] transition-all cursor-pointer"
                    type="button"
                    onClick={() => setActionStep(selectedMenuAction)}
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

            {actionStep === "edit" && (
              <form
                className="flex flex-col min-h-0 overflow-y-auto"
                onSubmit={handleEditUser}
              >
                <div className="grid grid-cols-1 gap-4 p-[1.25rem_1.35rem_0]">
                  <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                    Full name
                    <input
                      className={inputClass}
                      name="fullName"
                      type="text"
                      defaultValue={selectedUserForAction.name}
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                    Role
                    <input type="hidden" name="role" value={editRole} />
                    <InlineSelect
                      value={editRole}
                      options={roleOptions}
                      placeholder="Select role"
                      onChange={(value) => {
                        setEditRole(value);
                        setEditLevel(value === "coordinator" ? "1" : editLevel);
                      }}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                    Section
                    <input
                      className={inputClass}
                      name="sectionInfo"
                      type="text"
                      defaultValue={selectedUserForAction.section}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                    Group
                    <input
                      className={inputClass}
                      name="groupInfo"
                      type="text"
                      defaultValue={selectedUserForAction.group}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                    Assigned levels
                    <input type="hidden" name="assignedLevels" value={editRole === "coordinator" ? "1,2,3,4" : editLevel} />
                    {editRole === "coordinator" ? <input className={inputClass} value="Levels 1, 2, 3, 4" readOnly /> : <InlineSelect value={editLevel} options={levelOptions} placeholder="Select level" onChange={setEditLevel} />}
                  </label>
                  <div
                    className="flex items-center min-h-[48px] px-4 rounded-lg bg-[#f8fafc] !text-[#4c5d7d] !text-[0.85rem] !font-bold border border-[#e2e8f0]"
                    role="status"
                  >
                    School email is kept unchanged for account traceability.
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-[0.8rem] m-0 px-[1.35rem] py-[1.1rem] pb-[1.35rem] mt-4 border-t border-[#e5eaf1] bg-white max-[680px]:grid-cols-1 shrink-0">
                  <button
                    className="inline-flex items-center justify-center w-full min-h-[48px] px-4 rounded-lg bg-white border border-[#e2e8f0] !text-[#111827] !text-[0.95rem] !font-extrabold hover:bg-[#f8fafc] transition-colors cursor-pointer"
                    type="button"
                    onClick={() => setActionStep("menu")}
                  >
                    Back
                  </button>
                  <button
                    className="inline-flex items-center justify-center w-full min-h-[48px] px-4 rounded-lg bg-[#8A252C] !text-white !text-[0.95rem] !font-extrabold shadow-[0_10px_22px_rgba(138,37,44,0.18)] hover:bg-[#6d1d23] hover:shadow-[0_16px_34px_rgba(138,37,44,0.22)] transition-all cursor-pointer disabled:opacity-60"
                    type="submit"
                    disabled={updateUser.isPending}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
            {actionStep === "status" && (
              <form
                className="flex flex-col min-h-0 overflow-y-auto"
                onSubmit={handleStatusChange}
              >
                <div className="grid grid-cols-1 gap-4 p-[1.25rem_1.35rem_0]">
                  <div className="flex flex-col gap-1.5 p-4 rounded-lg bg-[#f8fafc] border border-[#dbe3ee]">
                    <span className="!text-[0.75rem] !font-extrabold !text-[#4c5d7d] uppercase tracking-[0.04em]">
                      Selected User
                    </span>
                    <strong className="!text-[1.05rem] !text-[#111827] !font-bold">
                      {selectedUserForAction.name}
                    </strong>
                  </div>
                  <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                    New status
                    <input type="hidden" name="status" value={nextStatus} />
                    <InlineSelect
                      value={nextStatus}
                      options={accountStatusOptions}
                      placeholder="Select status"
                      onChange={setNextStatus}
                    />
                  </label>
                  <div
                    className="flex items-center min-h-[48px] px-4 rounded-lg bg-[#f8fafc] !text-[#4c5d7d] !text-[0.85rem] !font-bold border border-[#e2e8f0]"
                    role="status"
                  >
                    Only the account status will be changed.
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-[0.8rem] m-0 px-[1.35rem] py-[1.1rem] pb-[1.35rem] mt-4 border-t border-[#e5eaf1] bg-white max-[680px]:grid-cols-1 shrink-0">
                  <button
                    className="inline-flex items-center justify-center w-full min-h-[48px] px-4 rounded-lg bg-white border border-[#e2e8f0] !text-[#111827] !text-[0.95rem] !font-extrabold hover:bg-[#f8fafc] transition-colors cursor-pointer"
                    type="button"
                    onClick={() => setActionStep("menu")}
                  >
                    Back
                  </button>
                  <button
                    className="inline-flex items-center justify-center w-full min-h-[48px] px-4 rounded-lg bg-[#8A252C] !text-white !text-[0.95rem] !font-extrabold shadow-[0_10px_22px_rgba(138,37,44,0.18)] hover:bg-[#6d1d23] hover:shadow-[0_16px_34px_rgba(138,37,44,0.22)] transition-all cursor-pointer disabled:opacity-60"
                    type="submit"
                    disabled={updateUser.isPending}
                  >
                    Save Status
                  </button>
                </div>
              </form>
            )}
            {actionStep === "reset" && (
              <form
                className="flex flex-col min-h-0 overflow-y-auto"
                onSubmit={handlePasswordReset}
              >
                <p className="m-0 pt-[1.15rem] px-[1.35rem] pb-0 !text-[#4c5d7d] !text-[0.94rem] !font-bold leading-[1.55]">
                  Reset the password for{" "}
                  <strong className="!text-[#111827]">
                    {selectedUserForAction.name}
                  </strong>{" "}
                  to:{" "}
                  <strong className="!text-[#111827]">
                    {resetPasswordValue(selectedUserForAction)}
                  </strong>
                  .
                </p>
                <div className="grid grid-cols-2 gap-[0.8rem] m-0 px-[1.35rem] py-[1.1rem] pb-[1.35rem] mt-4 border-t border-[#e5eaf1] bg-[#f8fafc] max-[680px]:grid-cols-1 shrink-0">
                  <button
                    className="inline-flex items-center justify-center w-full min-h-[48px] px-4 rounded-lg bg-white border border-[#e2e8f0] !text-[#111827] !text-[0.95rem] !font-extrabold hover:bg-gray-50 transition-colors cursor-pointer"
                    type="button"
                    onClick={() => setActionStep("menu")}
                  >
                    Back
                  </button>
                  <button
                    className="inline-flex items-center justify-center w-full min-h-[48px] px-4 rounded-lg bg-[#8A252C] !text-white !text-[0.95rem] !font-extrabold shadow-[0_10px_22px_rgba(138,37,44,0.18)] hover:bg-[#6d1d23] hover:shadow-[0_16px_34px_rgba(138,37,44,0.22)] transition-all cursor-pointer disabled:opacity-60"
                    type="submit"
                    disabled={resetPassword.isPending}
                  >
                    Reset Password
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  );
}
