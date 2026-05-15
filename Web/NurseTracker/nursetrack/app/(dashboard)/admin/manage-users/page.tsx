"use client";

import React, { useState } from "react";

export default function ManageUsersPage() {
  const [roleFilter, setRoleFilter] = useState("student");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedUserForAction, setSelectedUserForAction] = useState<typeof users[0] | null>(null);
  
  // Modal state
  const [actionStep, setActionStep] = useState<"menu" | "edit" | "status" | "reset">("menu");
  const [selectedMenuAction, setSelectedMenuAction] = useState<"edit" | "status" | "reset">("edit");

  const users = [
    { name: "Maria Cruz", email: "maria.cruz@cit.edu", role: "Nursing Student", id: "12-3456-789", section: "BSN 3A", status: "Active", initials: "MC", roleValue: "student" },
    { name: "Juan Dela Cruz", email: "juan.delacruz@cit.edu", role: "Nursing Student", id: "24-0001-001", section: "BSN 2B", status: "Pending", initials: "JD", roleValue: "student" },
    { name: "Prof. Reyes", email: "reyes@cit.edu", role: "Clinical Instructor", id: "CI-1002", section: "", status: "Active", initials: "PR", roleValue: "instructor" },
    { name: "Chair Reyes", email: "chair.reyes@cit.edu", role: "Chair", id: "AD-1001", section: "Nursing", status: "Active", initials: "CR", roleValue: "chair" },
    { name: "Coordinator Lim", email: "coordinator.lim@cit.edu", role: "Coordinator", id: "CO-1001", section: "Nursing Operations", status: "Active", initials: "CL", roleValue: "coordinator" },
    { name: "Enrollment Team", email: "enrollment.team@cit.edu", role: "Enrollment Team", id: "EN-1001", section: "Registrar Coordination", status: "Active", initials: "ET", roleValue: "enrollment" },
    { name: "Assistant Garcia", email: "assistant.garcia@cit.edu", role: "Assistant", id: "AS-1001", section: "Chair Support", status: "Active", initials: "AG", roleValue: "assistant" },
    { name: "Paolo Lim", email: "paolo.lim@cit.edu", role: "Nursing Student", id: "22-0988-414", section: "BSN 4A", status: "Deactivated", initials: "PL", roleValue: "student" },
  ];

  const filteredUsers = users.filter(user => {
    const matchesRole = search ? true : user.roleValue === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status.toLowerCase() === statusFilter;
    const matchesSection = roleFilter !== "student" || sectionFilter === "all" || user.section === sectionFilter;
    const matchesSearch = !search || Object.values(user).some(val => String(val).toLowerCase().includes(search.toLowerCase()));
    
    return matchesRole && matchesStatus && matchesSection && matchesSearch;
  });

  const closeActionModal = () => {
    setSelectedUserForAction(null);
    setTimeout(() => {
      setActionStep("menu");
      setSelectedMenuAction("edit");
    }, 200);
  };

  return (
    <>
      <main className="p-[clamp(24px,4vw,42px)] content-start grid gap-4">
        <section className="w-full">
          <article className="mt-0 p-[1.45rem] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)]">
            <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-[#e5eaf1] flex-wrap">
              <div>
                <h2 className="m-0 !text-[#111827] !text-[1.25rem] leading-[1.15] !font-bold">User List</h2>
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

            <div className={`grid grid-cols-[minmax(160px,0.72fr)_minmax(160px,0.72fr)_minmax(160px,0.72fr)_minmax(300px,1.6fr)] gap-[0.85rem] mb-4 p-[0.95rem] border border-[#e5eaf1] rounded-lg bg-[#f8fafc] max-[680px]:grid-cols-1 ${roleFilter !== 'student' ? 'is-non-student-role' : ''}`}>
              <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                Role
                <select
                  className="min-h-[44px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all cursor-pointer"
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="chair">Chair</option>
                  <option value="admin">Admin</option>
                  <option value="coordinator">Coordinator</option>
                  <option value="enrollment">Enrollment Team</option>
                  <option value="assistant">Assistant</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                Status
                <select
                  className="min-h-[44px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all cursor-pointer"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="all">All status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="deactivated">Deactivated</option>
                </select>
              </label>

              <label
                className={`flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054] ${roleFilter !== 'student' ? 'hidden' : ''}`}
              >
                Section
                <select
                  className="min-h-[44px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all cursor-pointer"
                  value={sectionFilter}
                  onChange={e => setSectionFilter(e.target.value)}
                >
                  <option value="all">All sections</option>
                  <option value="BSN 1A">BSN 1A</option>
                  <option value="BSN 1B">BSN 1B</option>
                  <option value="BSN 2A">BSN 2A</option>
                  <option value="BSN 2B">BSN 2B</option>
                  <option value="BSN 3A">BSN 3A</option>
                  <option value="BSN 3B">BSN 3B</option>
                  <option value="BSN 4A">BSN 4A</option>
                  <option value="BSN 4B">BSN 4B</option>
                </select>
              </label>

              <label
                className={`flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054] max-[680px]:col-auto ${roleFilter !== 'student' ? 'min-[681px]:col-start-3 min-[681px]:col-span-2' : 'min-[681px]:col-start-4 min-[681px]:col-span-1'}`}
              >
                Search
                <input
                  className="min-h-[44px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all"
                  type="search"
                  placeholder="Search name, ID, email"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </label>
            </div>

            <div className="max-h-[560px] rounded-lg border border-[#e2e8f0] overflow-y-auto bg-white">
              <div className="sticky top-0 z-10 grid grid-cols-[minmax(220px,1.15fr)_minmax(180px,0.9fr)_minmax(170px,0.85fr)_minmax(130px,0.7fr)_minmax(120px,0.55fr)] gap-[0.9rem] p-[1rem_1.1rem] bg-[#f8fafc] border-b border-[#e2e8f0] !text-xs !font-extrabold !text-gray-500 uppercase tracking-wider max-[680px]:hidden">
                <span>Name</span>
                <span>Role</span>
                <span>ID / Section</span>
                <span>Status</span>
                <span className="text-center">Action</span>
              </div>

              <div className="divide-y divide-[#e2e8f0]">
                {filteredUsers.map((user, idx) => (
                  <div className="grid grid-cols-[minmax(220px,1.15fr)_minmax(180px,0.9fr)_minmax(170px,0.85fr)_minmax(130px,0.7fr)_minmax(120px,0.55fr)] items-center gap-[0.9rem] p-[1rem_1.1rem] bg-white hover:bg-gray-50/50 transition-colors max-[680px]:grid-cols-1 max-[680px]:gap-2" key={idx}>
                    <span className="flex flex-col">
                      <strong className="!text-[#111827] !text-[0.95rem] !font-bold">{user.name}</strong>
                      <small className="!text-[#64748b] !text-[0.8rem] !font-medium mt-0.5">{user.email}</small>
                    </span>
                    <span className="!text-[#4c5d7d] !text-[0.88rem] !font-bold">{user.role}</span>
                    <span className="flex flex-col">
                      <strong className="!text-[#111827] !text-[0.9rem] !font-bold">{user.id}</strong>
                      {user.section && <small className="!text-[#64748b] !text-[0.8rem] !font-medium mt-0.5">{user.section}</small>}
                    </span>
                    <span>
                      <mark className={`inline-flex items-center px-[10px] py-[4px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap ${user.status === 'Active' ? 'bg-[#e9f8ef] !text-[#078033]' : user.status === 'Pending' ? 'bg-[#fff6cc] !text-[#6c4c00]' : 'bg-[#fff1f0] !text-[#b42318]'}`}>
                        {user.status}
                      </mark>
                    </span>
                    <span className="flex justify-center max-[680px]:justify-start max-[680px]:mt-2">
                      <button
                        className="flex items-center justify-center w-[40px] min-w-[40px] h-[40px] min-h-[40px] border border-[#e2e8f0] bg-white rounded-lg !text-[#64748b] hover:!text-[#111827] hover:bg-[#f8fafc] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#8A252C]/50 cursor-pointer"
                        type="button"
                        aria-label="Open account action"
                        title="Actions"
                        onClick={() => setSelectedUserForAction(user)}
                      >
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                          <circle cx="12" cy="5" r="1.8"></circle>
                          <circle cx="12" cy="12" r="1.8"></circle>
                          <circle cx="12" cy="19" r="1.8"></circle>
                        </svg>
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {filteredUsers.length === 0 && (
              <div className="flex items-center justify-center min-h-[120px] mt-4 p-6 border border-dashed border-gray-300 rounded-lg !text-gray-500 !font-medium">
                No matching users found.
              </div>
            )}

            <div className="flex items-center min-h-[48px] mt-4 px-4 rounded-lg bg-[#e9f8ef] !text-[#078033] !text-sm !font-bold border border-[#bbf7d0]" role="status" aria-live="polite">
              Directory loaded successfully.
            </div>
          </article>
        </section>
      </main>

      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-[1.5rem] bg-[#0f172a]/[0.46] backdrop-blur-[3px] overflow-y-auto overflow-x-hidden max-[680px]:p-4" id="add-user-modal">
          <section className="flex flex-col w-[min(560px,calc(100vw-32px))] max-w-[560px] max-h-[min(88vh,760px)] p-0 rounded-lg shadow-[0_26px_68px_rgba(15,23,42,0.24)] bg-white overflow-hidden m-auto" role="dialog" aria-modal="true" aria-labelledby="add-user-title">
            
            <div className="grid grid-cols-[minmax(0,1fr)_44px] items-center gap-[0.85rem] min-h-[76px] m-0 px-[1.35rem] py-[1.25rem] border-b border-[#e5eaf1] shrink-0">
              <div>
                <p className="m-0 !text-[#8a252c] !text-[0.75rem] !font-extrabold uppercase tracking-[0.04em]">Add User</p>
                <h2 id="add-user-title" className="m-0 mt-1 !text-[#111827] !text-[1.28rem] leading-[1.15] !font-bold">Create Account</h2>
              </div>
              <button 
                className="relative grid place-items-center w-[44px] h-[44px] p-0 border border-[#dbe3ee] rounded-lg bg-white transition-colors cursor-pointer hover:border-[#8A252C]/40 focus-visible:border-[#8A252C]/40 before:absolute before:w-[14px] before:h-[2px] before:rounded-full before:bg-[#111827] before:rotate-45 before:transition-colors hover:before:bg-[#8A252C] after:absolute after:w-[14px] after:h-[2px] after:rounded-full after:bg-[#111827] after:-rotate-45 after:transition-colors hover:after:bg-[#8A252C]" 
                type="button" 
                onClick={() => setIsAddUserModalOpen(false)} 
                aria-label="Close modal"
              ></button>
            </div>

            <form className="flex flex-col min-h-0 overflow-y-auto" id="add-user-form" onSubmit={(e) => { e.preventDefault(); setIsAddUserModalOpen(false); }} noValidate>
              <div className="grid grid-cols-2 gap-x-[1.1rem] gap-y-4 p-[1.25rem_1.35rem_0] max-[680px]:grid-cols-1">
                <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                  Full name
                  <input className="min-h-[48px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all" type="text" placeholder="Enter full name" required />
                </label>

                <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                  School email
                  <input className="min-h-[48px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all" type="email" placeholder="name@cit.edu" required />
                </label>

                <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                  Role
                  <select className="min-h-[48px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all cursor-pointer" required>
                    <option value="student">Nursing Student</option>
                    <option value="instructor">Clinical Instructor</option>
                    <option value="admin">Admin</option>
                    <option value="chair">Chair</option>
                    <option value="assistant">Assistant</option>
                    <option value="enrollment">Enrollment Team</option>
                    <option value="coordinator">Coordinator</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                  ID
                  <input className="min-h-[48px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all" type="text" placeholder="Student ID or staff ID" required />
                </label>

                <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                  Section
                  <select className="min-h-[48px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all cursor-pointer" required>
                    <option value="BSN 1A">BSN 1A</option>
                    <option value="BSN 1B">BSN 1B</option>
                    <option value="BSN 2A">BSN 2A</option>
                    <option value="BSN 2B">BSN 2B</option>
                    <option value="BSN 3A">BSN 3A</option>
                    <option value="BSN 3B">BSN 3B</option>
                    <option value="BSN 4A">BSN 4A</option>
                    <option value="BSN 4B">BSN 4B</option>
                  </select>
                </label>

                <div className="col-span-full flex items-center min-h-[48px] px-4 rounded-lg bg-[#f0f3f8] !text-[#4c5d7d] !text-sm !font-bold border border-[#dbe3ee]" role="status" aria-live="polite">
                  Add a student, CI, admin, chair, assistant, coordinator, or enrollment team account.
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
                  className="inline-flex items-center justify-center w-full min-h-[48px] px-4 rounded-lg bg-[#8A252C] !text-white !text-[0.95rem] !font-extrabold shadow-[0_10px_22px_rgba(138,37,44,0.18)] hover:bg-[#6d1d23] hover:shadow-[0_16px_34px_rgba(138,37,44,0.22)] transition-all cursor-pointer" 
                  type="submit"
                >
                  Add User
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selectedUserForAction && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-[1.5rem] bg-[#0f172a]/[0.46] backdrop-blur-[3px] overflow-y-auto overflow-x-hidden max-[680px]:p-4" id="user-action-modal">
          <section className="flex flex-col w-[min(560px,calc(100vw-32px))] max-w-[560px] max-h-[min(88vh,760px)] p-0 rounded-lg shadow-[0_26px_68px_rgba(15,23,42,0.24)] bg-white overflow-hidden m-auto" role="dialog" aria-modal="true" aria-labelledby="user-action-title">
            
            {actionStep === "menu" ? (
              <div className="grid grid-cols-[minmax(0,1fr)_44px] items-center gap-[0.85rem] min-h-[76px] m-0 px-[1.35rem] py-[1.25rem] border-b border-[#e5eaf1] shrink-0">
                <div>
                  <h2 id="user-action-title" className="m-0 mt-[0.2rem] !text-[#111827] !text-[1.28rem] leading-[1.15] !font-bold">Review Account</h2>
                </div>
                <button 
                  className="relative grid place-items-center w-[44px] h-[44px] p-0 border border-[#dbe3ee] rounded-lg bg-white transition-colors cursor-pointer hover:border-[#8A252C]/40 focus-visible:border-[#8A252C]/40 before:absolute before:w-[14px] before:h-[2px] before:rounded-full before:bg-[#111827] before:rotate-45 before:transition-colors hover:before:bg-[#8A252C] after:absolute after:w-[14px] after:h-[2px] after:rounded-full after:bg-[#111827] after:-rotate-45 after:transition-colors hover:after:bg-[#8A252C]" 
                  type="button" 
                  onClick={closeActionModal} 
                  aria-label="Close modal"
                ></button>
              </div>
            ) : (
              <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-[0.85rem] min-h-[76px] m-0 px-[1.35rem] py-[1.25rem] border-b border-[#e5eaf1] shrink-0">
                <button 
                  className="relative grid place-items-center w-[44px] h-[44px] p-0 border border-[#dbe3ee] rounded-lg bg-white transition-colors cursor-pointer hover:border-[#8A252C]/40 focus-visible:border-[#8A252C]/40 before:content-[''] before:w-[11px] before:h-[11px] before:border-l-[2.5px] before:border-b-[2.5px] before:border-[#111827] before:translate-x-[2px] before:rotate-45 before:transition-colors hover:before:border-[#8A252C]" 
                  type="button" 
                  onClick={() => setActionStep("menu")} 
                  aria-label="Back"
                ></button>
                <div>
                  <p className="m-0 !text-[#8a252c] !text-[0.75rem] !font-extrabold uppercase tracking-[0.04em]">
                    {actionStep === "edit" ? "EDIT USER" : actionStep === "status" ? "USER STATUS" : "PASSWORD RESET"}
                  </p>
                  <h2 className="m-0 mt-[0.2rem] !text-[#111827] !text-[1.28rem] leading-[1.15] !font-bold">
                    {actionStep === "edit" ? "Update Account Details" : actionStep === "status" ? "Change User Status" : "Confirm Password Reset"}
                  </h2>
                </div>
                <button 
                  className="relative grid place-items-center w-[44px] h-[44px] p-0 border border-[#dbe3ee] rounded-lg bg-white transition-colors cursor-pointer hover:border-[#8A252C]/40 focus-visible:border-[#8A252C]/40 before:absolute before:w-[14px] before:h-[2px] before:rounded-full before:bg-[#111827] before:rotate-45 before:transition-colors hover:before:bg-[#8A252C] after:absolute after:w-[14px] after:h-[2px] after:rounded-full after:bg-[#111827] after:-rotate-45 after:transition-colors hover:after:bg-[#8A252C]" 
                  type="button" 
                  onClick={closeActionModal} 
                  aria-label="Close modal"
                ></button>
              </div>
            )}

            {actionStep === "menu" && (
              <>
                <p className="m-0 pt-[1.15rem] px-[1.35rem] pb-0 !text-[#4c5d7d] !text-[0.94rem] !font-bold leading-[1.55]">
                  Choose one clear action for this account.
                </p>

                <div className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-[0.85rem] w-auto mx-[1.35rem] my-4 p-[0.9rem] border border-[#dbe3ee] rounded-lg bg-[#f8fafc] overflow-hidden max-[680px]:grid-cols-[auto_minmax(0,1fr)] max-[680px]:gap-y-3">
                  <div className="flex items-center justify-center w-[44px] h-[44px] rounded-full bg-[#FFCF01] !text-[#111827] !font-extrabold !text-[0.95rem] max-[680px]:w-[40px] max-[680px]:h-[40px] shrink-0">
                    {selectedUserForAction.initials}
                  </div>
                  <div className="min-w-0">
                    <strong className="block !text-[#111827] !text-base !font-extrabold leading-tight truncate">{selectedUserForAction.name}</strong>
                    <small className="block mt-[0.25rem] !text-[#667085] !text-[0.82rem] !font-extrabold leading-relaxed break-words">
                      {selectedUserForAction.id}{selectedUserForAction.section ? ` - ${selectedUserForAction.section}` : ''} - {selectedUserForAction.email}
                    </small>
                  </div>
                  <mark className={`inline-flex items-center px-[10px] py-[4px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap max-[680px]:col-span-full max-[680px]:w-fit ${selectedUserForAction.status === 'Active' ? 'bg-[#e9f8ef] !text-[#078033]' : selectedUserForAction.status === 'Pending' ? 'bg-[#fff6cc] !text-[#6c4c00]' : 'bg-[#fff1f0] !text-[#b42318]'}`}>
                    {selectedUserForAction.status}
                  </mark>
                </div>

                <div className="grid grid-cols-1 gap-[0.65rem] m-0 px-[1.35rem] pb-[1.15rem]">
                  <button 
                    className={`flex items-center justify-start w-full min-h-[50px] px-[1.15rem] rounded-lg !text-[0.95rem] !font-extrabold text-left transition-colors cursor-pointer ${selectedMenuAction === "edit" ? "border border-[#8A252C] bg-white !text-[#8A252C]" : "border border-[#e2e8f0] bg-white !text-[#334155] hover:bg-[#f8fafc]"}`} 
                    type="button"
                    onClick={() => setSelectedMenuAction("edit")}
                  >
                    Edit User Details
                  </button>
                  <button 
                    className={`flex items-center justify-start w-full min-h-[50px] px-[1.15rem] rounded-lg !text-[0.95rem] !font-extrabold text-left transition-colors cursor-pointer ${selectedMenuAction === "status" ? "border border-[#8A252C] bg-white !text-[#8A252C]" : "border border-[#e2e8f0] bg-white !text-[#334155] hover:bg-[#f8fafc]"}`} 
                    type="button"
                    onClick={() => setSelectedMenuAction("status")}
                  >
                    Change User Status
                  </button>
                  <button 
                    className={`flex items-center justify-start w-full min-h-[50px] px-[1.15rem] rounded-lg !text-[0.95rem] !font-extrabold text-left transition-colors cursor-pointer ${selectedMenuAction === "reset" ? "border border-[#8A252C] bg-white !text-[#8A252C]" : "border border-[#e2e8f0] bg-white !text-[#334155] hover:bg-[#f8fafc]"}`} 
                    type="button"
                    onClick={() => setSelectedMenuAction("reset")}
                  >
                    Reset Password
                  </button>
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
              <form className="flex flex-col min-h-0 overflow-y-auto" onSubmit={(e) => { e.preventDefault(); closeActionModal(); }}>
                <div className="grid grid-cols-1 gap-4 p-[1.25rem_1.35rem_0]">
                  <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                    Full name
                    <input className="min-h-[48px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all" type="text" defaultValue={selectedUserForAction.name} required />
                  </label>

                  <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                    Role
                    <select className="min-h-[48px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all cursor-pointer" defaultValue={selectedUserForAction.roleValue} required>
                      <option value="student">Nursing Student</option>
                      <option value="instructor">Clinical Instructor</option>
                      <option value="admin">Admin</option>
                      <option value="chair">Chair</option>
                      <option value="assistant">Assistant</option>
                      <option value="enrollment">Enrollment Team</option>
                      <option value="coordinator">Coordinator</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                    Section
                    <select className="min-h-[48px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all cursor-pointer" defaultValue={selectedUserForAction.section} required>
                      <option value="">No Section</option>
                      <option value="BSN 1A">BSN 1A</option>
                      <option value="BSN 1B">BSN 1B</option>
                      <option value="BSN 2A">BSN 2A</option>
                      <option value="BSN 2B">BSN 2B</option>
                      <option value="BSN 3A">BSN 3A</option>
                      <option value="BSN 3B">BSN 3B</option>
                      <option value="BSN 4A">BSN 4A</option>
                      <option value="BSN 4B">BSN 4B</option>
                    </select>
                  </label>

                  <div className="flex items-center min-h-[48px] px-4 rounded-lg bg-[#f8fafc] !text-[#4c5d7d] !text-[0.85rem] !font-bold border border-[#e2e8f0]" role="status">
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
                    className="inline-flex items-center justify-center w-full min-h-[48px] px-4 rounded-lg bg-[#8A252C] !text-white !text-[0.95rem] !font-extrabold shadow-[0_10px_22px_rgba(138,37,44,0.18)] hover:bg-[#6d1d23] hover:shadow-[0_16px_34px_rgba(138,37,44,0.22)] transition-all cursor-pointer" 
                    type="submit"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {actionStep === "status" && (
              <form className="flex flex-col min-h-0 overflow-y-auto" onSubmit={(e) => { e.preventDefault(); closeActionModal(); }}>
                <div className="grid grid-cols-1 gap-4 p-[1.25rem_1.35rem_0]">
                  <div className="flex flex-col gap-1.5 p-4 rounded-lg bg-[#f8fafc] border border-[#dbe3ee]">
                    <span className="!text-[0.75rem] !font-extrabold !text-[#4c5d7d] uppercase tracking-[0.04em]">Selected User</span>
                    <strong className="!text-[1.05rem] !text-[#111827] !font-bold">{selectedUserForAction.name}</strong>
                  </div>

                  <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">
                    New status
                    <select className="min-h-[48px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all cursor-pointer" defaultValue={selectedUserForAction.status} required>
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Deactivated">Deactivated</option>
                    </select>
                  </label>

                  <div className="flex items-center min-h-[48px] px-4 rounded-lg bg-[#f8fafc] !text-[#4c5d7d] !text-[0.85rem] !font-bold border border-[#e2e8f0]" role="status">
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
                    className="inline-flex items-center justify-center w-full min-h-[48px] px-4 rounded-lg bg-[#8A252C] !text-white !text-[0.95rem] !font-extrabold shadow-[0_10px_22px_rgba(138,37,44,0.18)] hover:bg-[#6d1d23] hover:shadow-[0_16px_34px_rgba(138,37,44,0.22)] transition-all cursor-pointer" 
                    type="submit"
                  >
                    Save Status
                  </button>
                </div>
              </form>
            )}

            {actionStep === "reset" && (
              <form className="flex flex-col min-h-0 overflow-y-auto" onSubmit={(e) => { e.preventDefault(); closeActionModal(); }}>
                <p className="m-0 pt-[1.15rem] px-[1.35rem] pb-0 !text-[#4c5d7d] !text-[0.94rem] !font-bold leading-[1.55]">
                  Are you sure you want to reset the password for <strong className="!text-[#111827]">{selectedUserForAction.name}</strong>?
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
                    className="inline-flex items-center justify-center w-full min-h-[48px] px-4 rounded-lg bg-[#8A252C] !text-white !text-[0.95rem] !font-extrabold shadow-[0_10px_22px_rgba(138,37,44,0.18)] hover:bg-[#6d1d23] hover:shadow-[0_16px_34px_rgba(138,37,44,0.22)] transition-all cursor-pointer" 
                    type="submit"
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
