"use client";

import React from "react";
import { LoadingState } from "@/components/ui/LoadingState";
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

const assistantPermissionItems = coordinatorPermissionItems.filter((item) => item.id !== "scheduleMaker");

function LevelAssignments({ title, badge, users, isLoading, onLevelChange }: { title: string; badge: string; users: ApiUser[]; isLoading: boolean; onLevelChange: (user: ApiUser, level: number) => void }) {
  return (
    <section className="mt-0 grid min-w-0 gap-4 rounded-lg border border-[#e2e8f0] bg-white p-[1.45rem] shadow-[0_16px_44px_rgba(32,33,36,0.07)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#e5eaf1] pb-4">
        <h2 className="m-0 !text-[#111827] !text-[1.25rem] !font-bold leading-[1.15]">{title}</h2>
        <span className="inline-flex items-center whitespace-nowrap rounded-full bg-[#fff6cc] px-[10px] py-[4px] !text-[0.76rem] !font-extrabold !text-[#6c4c00]">{badge}</span>
      </div>

      <div className="grid gap-[0.85rem]">
        {isLoading ? (
          <LoadingState message={`Loading ${title.toLowerCase()}`} />
        ) : users.length > 0 ? (
          users.map((user) => {
            const selectedLevel = user.assignedLevels?.[0] ?? 1;
            return (
              <article className="grid min-w-0 grid-cols-[minmax(260px,0.85fr)_minmax(420px,1.15fr)] items-center gap-4 rounded-[0.75rem] border border-[#e2e8f0] bg-white p-[1rem_1.1rem] shadow-[0_10px_24px_rgba(15,23,42,0.04)] max-[980px]:grid-cols-1" key={user.id}>
                <div className="flex min-w-0 items-center gap-[0.85rem]">
                  <ProfileAvatar name={user.fullName} imageUrl={user.profileImageUrl} size={46} />
                  <div className="min-w-0">
                    <strong className="block !text-[#111827] !text-[0.98rem] !font-[850] leading-[1.25]">{user.fullName}</strong>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-[0.55rem] max-[560px]:grid-cols-2" role="radiogroup" aria-label={`${user.fullName} level access`}>
                  {[1, 2, 3, 4].map((level) => (
                    <label className={`relative grid min-h-[44px] cursor-pointer place-items-center rounded-[0.6rem] border px-3 text-center !text-[0.88rem] !font-[850] transition-all hover:border-[#8a252c]/35 hover:!text-[#8a252c] ${selectedLevel === level ? "border-[#8a252c] bg-[#fff7f7] !text-[#8a252c] shadow-[0_8px_18px_rgba(138,37,44,0.1)]" : "border-[#dbe3ee] bg-white !text-[#334155]"}`} key={level}>
                      <input className="pointer-events-none absolute opacity-0" type="radio" name={`${user.id}-level`} value={level} checked={selectedLevel === level} onChange={() => onLevelChange(user, level)} />
                      Level {level}
                    </label>
                  ))}
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed border-[#dbe3ee] p-5 !font-bold !text-[#4c5d7d]">No matching users found.</div>
        )}
      </div>
    </section>
  );
}

function PermissionCards({ role, title, badge }: { role: "ASSISTANT" | "COORDINATOR"; title: string; badge: string }) {
  const { data = [], isLoading } = useAdminAccessPermissions(role);
  const updatePermission = useUpdateAdminAccessPermission();
  const { showToast } = useToast();
  const permissions = data as Permission[];
  const enabledByKey = Object.fromEntries(permissions.map((permission) => [permission.permissionKey, permission.enabled]));
  const items = role === "COORDINATOR" ? coordinatorPermissionItems : assistantPermissionItems;

  return (
    <section className="mt-0 grid min-w-0 gap-4 rounded-lg border border-[#e2e8f0] bg-white p-[1.45rem] shadow-[0_16px_44px_rgba(32,33,36,0.07)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#e5eaf1] pb-4">
        <h2 className="m-0 !text-[#111827] !text-[1.25rem] !font-bold leading-[1.15]">{title}</h2>
        <span className="inline-flex items-center whitespace-nowrap rounded-full bg-[#fff6cc] px-[10px] py-[4px] !text-[0.76rem] !font-extrabold !text-[#6c4c00]">{badge}</span>
      </div>

      <div className="grid grid-cols-2 gap-[0.85rem] max-[760px]:grid-cols-1">
        {isLoading ? (
          <LoadingState message={`Loading ${title.toLowerCase()}`} className="col-span-full" />
        ) : (
          items.map((item) => (
            <div className="grid min-h-[112px] grid-cols-[1fr_auto] items-center gap-4 rounded-[0.75rem] border border-[#e2e8f0] bg-white p-[1.05rem_1.1rem] shadow-[0_10px_24px_rgba(15,23,42,0.04)] max-[560px]:grid-cols-1" key={item.id}>
              <div className="min-w-0">
                <h3 className="m-0 !text-[#111827] !text-base !font-[850] leading-[1.25]">{item.title}</h3>
                <p className="mb-0 mt-[0.32rem] !text-[#475569] !text-[0.85rem] !font-[750] leading-[1.45]">{item.desc}</p>
              </div>
              <label className="relative inline-flex h-[32px] w-[58px] shrink-0 cursor-pointer items-center" htmlFor={`${role}-${item.id}`} aria-label={`Toggle ${role} ${item.title} access`}>
                <input
                  className="peer pointer-events-none absolute opacity-0"
                  id={`${role}-${item.id}`}
                  type="checkbox"
                  checked={Boolean(enabledByKey[item.id])}
                  onChange={(event) => updatePermission.mutate(
                    { role, permissionKey: item.id, enabled: event.target.checked },
                    {
                      onSuccess: () => showToast({ variant: "success", title: "Permission updated", message: `${item.title} was ${event.target.checked ? "enabled" : "disabled"}.` }),
                      onError: () => showToast({ variant: "error", title: "Update failed", message: "Permission change could not be saved." }),
                    }
                  )}
                />
                <span className="absolute inset-0 rounded-full border border-[#cbd5e1] bg-[#e2e8f0] transition-colors before:absolute before:left-[2px] before:top-[2px] before:h-[26px] before:w-[26px] before:rounded-full before:bg-white before:shadow-[0_6px_14px_rgba(15,23,42,0.18)] before:transition-transform before:content-[''] peer-checked:border-[#8a252c] peer-checked:bg-[#8a252c] peer-checked:before:translate-x-[26px] peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-[#8a252c]/25" />
              </label>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default function AssistantAccessPage() {
  const { data: userData = [], isLoading } = useUsers();
  const updateUser = useAdminUpdateUser();
  const { showToast } = useToast();
  const users = userData as ApiUser[];
  const chairs = users.filter((user) => user.role === "CHAIR");
  const assistants = users.filter((user) => user.role === "ASSISTANT");

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
    <main className="grid w-full min-w-0 content-start gap-4 p-[clamp(24px,4vw,42px)]">
      <LevelAssignments title="Chair Level Assignments" badge="Level access" users={chairs} isLoading={isLoading} onLevelChange={updateLevel} />
      <LevelAssignments title="Assistant Level Assignments" badge="Level access" users={assistants} isLoading={isLoading} onLevelChange={updateLevel} />
      <PermissionCards role="ASSISTANT" title="Assistant Edit Permissions" badge="Assistant controls" />
      <PermissionCards role="COORDINATOR" title="Coordinator Edit Permissions" badge="Coordinator controls" />
      <div className="flex min-h-[48px] items-center rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 !text-[0.85rem] !font-bold !text-[#4c5d7d]" role="status" aria-live="polite">Level assignments and edit permissions control assistant access.</div>
    </main>
  );
}
