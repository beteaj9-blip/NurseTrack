"use client";

import React from "react";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { useToast } from "@/components/ui/ToastProvider";
import { useAdminAccessPermissions, useUpdateAdminAccessPermission } from "@/core/api/hooks/useAdminAccessPermissions";
import { useAdminUpdateUser, useUsers } from "@/core/api/hooks/useUsers";

type ApiUser = {
  id: number;
  fullName: string;
  role: string;
  profileImageUrl?: string;
  assignedLevels?: number[];
};

type Permission = {
  permissionKey: string;
  enabled: boolean;
};

const coordinatorPermissionItems = [
  { id: "scheduleMaker", title: "Schedule Maker", desc: "Allow creating and publishing schedule imports." },
  { id: "extensionDays", title: "Extension Days", desc: "Allow adding, editing, or canceling extension-day records." },
  { id: "manualBackup", title: "Manual Backup", desc: "Allow approving or returning encoded attendance." },
  { id: "clearance", title: "Clearance", desc: "Allow approving or canceling clearance approval." },
  { id: "clinicalCases", title: "Clinical Cases View", desc: "Allow editing approval or rejection decisions." },
  { id: "ciRecommendations", title: "CI Recommendations", desc: "Allow accepting, rejecting, or editing decisions." },
];

const assistantPermissionItems = coordinatorPermissionItems.filter(item => item.id !== "scheduleMaker");

function LevelAssignments({ title, badge, users, onLevelChange }: { title: string; badge: string; users: ApiUser[]; onLevelChange: (user: ApiUser, level: number) => void }) {
  return (
    <section className="mt-0 p-[1.45rem] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] grid gap-4">
      <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-[#e5eaf1] flex-wrap"><div><h2 className="m-0 !text-[#111827] !text-[1.25rem] leading-[1.15] !font-bold">{title}</h2></div><span className="inline-flex items-center px-[10px] py-[4px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#fff6cc] !text-[#6c4c00]">{badge}</span></div>
      <div className="grid gap-[0.85rem]">
        {users.map(user => {
          const selectedLevel = user.assignedLevels?.[0] ?? 1;
          return (
            <article className="grid grid-cols-[minmax(260px,0.85fr)_minmax(420px,1.15fr)] gap-4 items-center p-[1rem_1.1rem] border border-[#e2e8f0] rounded-[0.75rem] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)] max-[980px]:grid-cols-1" key={user.id}>
              <div className="flex items-center gap-[0.85rem] min-w-0"><ProfileAvatar name={user.fullName} imageUrl={user.profileImageUrl} size={46} /><div className="min-w-0"><strong className="block !text-[#111827] !text-[0.98rem] !font-[850] leading-[1.25]">{user.fullName}</strong></div></div>
              <div className="grid grid-cols-4 gap-[0.55rem] max-[560px]:grid-cols-2" role="radiogroup" aria-label={`${user.fullName} level access`}>
                {[1, 2, 3, 4].map(level => <label className={`relative grid place-items-center min-h-[44px] px-3 border rounded-[0.6rem] cursor-pointer !text-[0.88rem] !font-[850] text-center transition-all hover:border-[#8a252c]/35 hover:!text-[#8a252c] ${selectedLevel === level ? "border-[#8a252c] bg-[#fff7f7] !text-[#8a252c] shadow-[0_8px_18px_rgba(138,37,44,0.1)]" : "border-[#dbe3ee] bg-white !text-[#334155]"}`} key={level}><input className="absolute opacity-0 pointer-events-none" type="radio" name={`${user.id}-level`} value={level} checked={selectedLevel === level} onChange={() => onLevelChange(user, level)} />Level {level}</label>)}
              </div>
            </article>
          );
        })}
        {users.length === 0 && <div className="p-5 border border-dashed border-[#dbe3ee] rounded-lg !text-[#4c5d7d] !font-bold">No matching users found.</div>}
      </div>
    </section>
  );
}

function PermissionCards({ role, title, badge }: { role: "ASSISTANT" | "COORDINATOR"; title: string; badge: string }) {
  const { data = [] } = useAdminAccessPermissions(role);
  const updatePermission = useUpdateAdminAccessPermission();
  const { showToast } = useToast();
  const permissions = data as Permission[];
  const enabledByKey = Object.fromEntries(permissions.map(permission => [permission.permissionKey, permission.enabled]));
  const items = role === "COORDINATOR" ? coordinatorPermissionItems : assistantPermissionItems;

  return (
    <section className="mt-0 p-[1.45rem] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] grid gap-4">
      <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-[#e5eaf1] flex-wrap"><div><h2 className="m-0 !text-[#111827] !text-[1.25rem] leading-[1.15] !font-bold">{title}</h2></div><span className="inline-flex items-center px-[10px] py-[4px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#fff6cc] !text-[#6c4c00]">{badge}</span></div>
      <div className="grid grid-cols-2 gap-[0.85rem] max-[760px]:grid-cols-1">
        {items.map(item => <div className="grid grid-cols-[1fr_auto] gap-4 items-center min-h-[112px] p-[1.05rem_1.1rem] border border-[#e2e8f0] rounded-[0.75rem] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)] max-[560px]:grid-cols-1" key={item.id}><div className="min-w-0"><h3 className="m-0 !text-[#111827] !text-base !font-[850] leading-[1.25]">{item.title}</h3><p className="mt-[0.32rem] mb-0 !text-[#475569] !text-[0.85rem] !font-[750] leading-[1.45]">{item.desc}</p></div><label className="relative inline-flex items-center w-[58px] h-[32px] cursor-pointer shrink-0" htmlFor={`${role}-${item.id}`} aria-label={`Toggle ${role} ${item.title} access`}><input className="absolute opacity-0 pointer-events-none peer" id={`${role}-${item.id}`} type="checkbox" checked={Boolean(enabledByKey[item.id])} onChange={e => updatePermission.mutate({ role, permissionKey: item.id, enabled: e.target.checked }, { onSuccess: () => showToast({ variant: "success", title: "Permission updated", message: `${item.title} was ${e.target.checked ? "enabled" : "disabled"}.` }), onError: () => showToast({ variant: "error", title: "Update failed", message: "Permission change could not be saved." }) })} /><span className="absolute inset-0 border border-[#cbd5e1] rounded-full bg-[#e2e8f0] transition-colors peer-checked:border-[#8a252c] peer-checked:bg-[#8a252c] peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-[#8a252c]/25 peer-focus-visible:outline-offset-3 before:content-[''] before:absolute before:top-[2px] before:left-[2px] before:w-[26px] before:h-[26px] before:rounded-full before:bg-white before:shadow-[0_6px_14px_rgba(15,23,42,0.18)] before:transition-transform peer-checked:before:translate-x-[26px]"></span></label></div>)}
      </div>
    </section>
  );
}

export default function AssistantAccessPage() {
  const { data: userData = [] } = useUsers();
  const updateUser = useAdminUpdateUser();
  const { showToast } = useToast();
  const users = userData as ApiUser[];
  const chairs = users.filter(user => user.role === "CHAIR");
  const assistants = users.filter(user => user.role === "ASSISTANT");

  const updateLevel = (user: ApiUser, level: number) => {
    updateUser.mutate(
      { userId: user.id, updates: { assignedLevels: String(level) } },
      {
        onSuccess: () => showToast({ variant: "success", title: "Level updated", message: `${user.fullName} assigned to Level ${level}.` }),
        onError: () => showToast({ variant: "error", title: "Update failed", message: "Level assignment could not be saved." }),
      }
    );
  };

  return (
    <main className="p-[clamp(24px,4vw,42px)] content-start grid gap-4 w-full">
      <LevelAssignments title="Chair Level Assignments" badge="One level per chair" users={chairs} onLevelChange={updateLevel} />
      <LevelAssignments title="Assistant Level Assignments" badge="One level per assistant" users={assistants} onLevelChange={updateLevel} />
      <PermissionCards role="ASSISTANT" title="Assistant Edit Permissions" badge="Assistant controls" />
      <PermissionCards role="COORDINATOR" title="Coordinator Edit Permissions" badge="Coordinator controls" />
      <div className="flex items-center min-h-[48px] px-4 rounded-lg bg-[#f8fafc] !text-[#4c5d7d] !text-[0.85rem] !font-bold border border-[#e2e8f0]" role="status" aria-live="polite">Level assignments and edit permissions control assistant access.</div>
    </main>
  );
}
