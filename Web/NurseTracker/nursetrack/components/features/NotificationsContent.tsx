"use client";

import React from 'react';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useMarkNotificationUnread, useNotifications } from '@/core/api/hooks/useNotifications';
import { useAuthStore } from '@/core/store/authStore';
import { useToast } from '@/components/ui/ToastProvider';

function isUnread(notification: any) {
  return notification.read === false || notification.isRead === false;
}

function formatNotificationDate(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function NotificationsContent({ studentOnly = false }: { studentOnly?: boolean }) {
  const { showToast } = useToast();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const user = useAuthStore((state) => state.user);
  const userId = user?.id != null ? String(user.id) : undefined;
  const { data: apiNotifications = [], refetch } = useNotifications(userId, true);
  const markRead = useMarkNotificationRead(userId);
  const markUnread = useMarkNotificationUnread(userId);
  const markAllRead = useMarkAllNotificationsRead(userId);
  const notifications = apiNotifications;

  const markOneRead = (notificationId: number) => {
    if (!studentOnly) return;
    markRead.mutate(notificationId, {
      onSuccess: () => showToast({ variant: "success", title: "Notification updated", message: "Notification marked as read." }),
      onError: () => showToast({ variant: "error", title: "Update failed", message: "Notification could not be marked as read." }),
    });
  };

  const markOneUnread = (notificationId: number) => {
    if (!studentOnly) return;
    markUnread.mutate(notificationId, {
      onSuccess: () => showToast({ variant: "success", title: "Notification updated", message: "Notification marked as unread." }),
      onError: () => showToast({ variant: "error", title: "Update failed", message: "Notification could not be marked as unread." }),
    });
  };

  const markAll = () => {
    if (!studentOnly) return;
    markAllRead.mutate(undefined, {
      onSuccess: () => showToast({ variant: "success", title: "Notifications updated", message: "All notifications were marked as read." }),
      onError: () => showToast({ variant: "error", title: "Update failed", message: "Notifications could not be marked as read." }),
    });
  };

  const refreshNotifications = async () => {
    if (!studentOnly || isRefreshing) return;

    try {
      setIsRefreshing(true);
      await refetch();
      showToast({ variant: "success", title: "Notifications refreshed", message: "Your notifications are up to date." });
    } catch {
      showToast({ variant: "error", title: "Refresh failed", message: "Notifications could not be refreshed." });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-[1.2rem] font-[800] text-[#111827] m-0">Recent Notifications</h2>
          <div className="flex items-center gap-3">
            <button onClick={markAll} className="h-[40px] px-4 rounded-lg border border-[#dbe3ee] bg-white text-[#344054] text-[0.92rem] font-bold hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:text-[#0f172a] hover:-translate-y-px transition-all cursor-pointer">
              Mark all as read
            </button>
            <button onClick={refreshNotifications} disabled={isRefreshing} className="h-[40px] px-4 rounded-lg border border-[#dbe3ee] bg-white text-[#344054] text-[0.92rem] font-bold hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:text-[#0f172a] hover:-translate-y-px transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex flex-col gap-4 mb-6">
          {notifications.length > 0 ? (
            notifications.map((notification: any) => {
              const unread = isUnread(notification);

              return (
                <div key={notification.id} className={`border rounded-lg p-5 transition-all ${unread ? "border-[#FFCF01] bg-[#FFCF01]/5 hover:bg-[#FFCF01]/10" : "border-[#e2e8f0] bg-white hover:bg-[#f8fafc]"}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="pt-1.5 flex-none">
                        <div className={`w-2.5 h-2.5 rounded-full ${unread ? "bg-[#FFCF01] shadow-[0_0_8px_rgba(255,207,1,0.6)]" : "bg-[#cbd5e1]"}`}></div>
                      </div>
                      <div>
                        <h3 className="text-[1rem] font-[800] text-[#111827] m-0 mb-1">{notification.title}</h3>
                        <p className="text-[#475467] text-[0.92rem] m-0 mb-4">{notification.message}</p>
                        <p className="text-[#64748b] text-[0.85rem] font-semibold m-0">{notification.createdAtLabel ?? formatNotificationDate(notification.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between self-stretch gap-4">
                      {unread ? (
                        <button onClick={() => markOneRead(notification.id)} className="h-[36px] px-3 rounded-md border border-[#dbe3ee] bg-white text-[#344054] text-[0.85rem] font-bold hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:text-[#0f172a] transition-all cursor-pointer">
                          Mark read
                        </button>
                      ) : (
                        <button onClick={() => markOneUnread(notification.id)} className="h-[36px] px-3 rounded-md border border-[#dbe3ee] bg-white text-[#344054] text-[0.85rem] font-bold hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:text-[#0f172a] transition-all cursor-pointer">
                          Mark unread
                        </button>
                      )}
                      <a href={studentOnly ? (notification.actionUrl ?? "/nursing-student/progress") : "#"} className="text-[#8A252C] text-[0.92rem] font-[800] hover:text-[#681920] underline-offset-2 hover:underline">
                        View details
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="border border-[#e2e8f0] rounded-lg p-5 text-[#64748b] text-[0.92rem] font-semibold">
              No notifications found.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#e5eaf1] pt-4 mt-2">
          <p className="text-[#64748b] text-[0.85rem] m-0">Showing {notifications.length} notification{notifications.length === 1 ? "" : "s"}.</p>
        </div>

      </div>
    </div>
  );
}
