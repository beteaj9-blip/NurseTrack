import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Link } from 'expo-router';

import { apiFetch } from '../../api';
import { roleSlugs } from '../../routes';
import { User } from '../../types';
import { AuditLog } from '../shared/types';
import { humanize, resourceLabels } from '../shared/helpers';

export function AdminDashboardSection({ token, user }: { token: string | null; user: User }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const roleSlug = roleSlugs[user.role];
  const firstName = user.fullName?.split(' ')[0] || 'Admin';

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    apiFetch<AuditLog[]>('/audit-logs', { token })
      .then((items) => isMounted && setLogs(items.filter(isActionLog).slice(0, 3)))
      .catch(() => isMounted && setLogs([]))
      .finally(() => isMounted && setLoading(false));
    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <View className="gap-[18px]">
      <View className="rounded-lg border border-[#e2e8f0] bg-white p-6 shadow-sm">
        <View className="gap-5">
          <View>
            <Text className="text-[26px] font-bold leading-[32px] text-[#111827]">Good Evening, {firstName}.</Text>
            <Text className="mt-2 text-[14px] font-semibold leading-6 text-[#64748b]">Welcome back! Here is an overview of system setup and recent audit activity.</Text>
          </View>
          <Link asChild href={`/(dashboard)/${roleSlug}/section-import`}>
            <Pressable className="min-h-[46px] items-center justify-center rounded-lg bg-maroon px-6 shadow-sm active:opacity-75">
              <Text className="text-[15px] font-bold text-white">Upload Section File</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <View className="rounded-lg border border-[#e2e8f0] bg-white p-5 shadow-sm">
        <View className="mb-5 flex-row items-start justify-between gap-3">
          <Text className="flex-1 text-[20px] font-bold text-[#111827]">Recent System Activity</Text>
          <View className="rounded-full bg-[#e9f8ef] px-[10px] py-[6px]">
            <Text className="text-[11px] font-extrabold text-[#078033]">Live logs</Text>
          </View>
        </View>

        {loading ? <AdminDashboardSkeleton /> : logs.length ? <View className="gap-3">{logs.map((log) => <AuditLogCard key={log.id} log={log} />)}</View> : <View className="rounded-lg border border-dashed border-[#dbe3ee] p-5"><Text className="text-[13px] font-bold leading-5 text-[#4c5d7d]">No audit activity yet. New admin actions will appear here.</Text></View>}

        <View className="mt-4 items-stretch">
          <Link asChild href={`/(dashboard)/${roleSlug}/audit-logs`}>
            <Pressable className="min-h-[44px] items-center justify-center rounded-lg border border-[#e2e8f0] bg-white px-5 active:bg-[#f8fafc]">
              <Text className="text-sm font-bold text-[#334155]">Open Audit Logs</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}

function AuditLogCard({ log }: { log: AuditLog }) {
  const affected = affectedRecord(log);
  return (
    <View className="gap-2 rounded-[14px] border border-[#e2e8f0] bg-white px-[18px] py-4">
      <View>
        <Text className="text-[15px] font-bold leading-5 text-[#111827]">{log.actor}</Text>
        <Text className="mt-1 text-[13px] font-bold leading-5 text-[#4c5d7d]">{formatRole(log.actorRole)}</Text>
      </View>
      <Text className="text-[13px] font-bold leading-5 text-[#4c5d7d]">{log.action}</Text>
      <Text className="text-[13px] font-bold leading-5 text-[#4c5d7d]">{affected.name}{affected.context ? ` - ${affected.context}` : ''}</Text>
      <Text className="text-[12px] font-bold leading-5 text-[#64748b]">{formatTime(log.occurredAt)}</Text>
    </View>
  );
}

function AdminDashboardSkeleton() {
  return <View className="gap-3 rounded-lg border border-dashed border-[#dbe3ee] p-5"><View className="h-4 w-3/4 rounded-full bg-[#eee6dd]" /><View className="h-3 w-full rounded-full bg-[#eee6dd]" /><View className="h-3 w-1/2 rounded-full bg-[#eee6dd]" /></View>;
}

function formatRole(role: string) {
  return role.toLowerCase().replace(/(^|_)(\w)/g, (_, space, letter) => `${space ? ' ' : ''}${letter.toUpperCase()}`);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function affectedRecord(log: AuditLog) {
  if (!log.recordName?.startsWith('/api/')) return { name: log.recordName, context: log.context || log.category || '' };
  const parts = log.recordName.split('/').filter(Boolean);
  const resource = parts[1] || log.category || 'record';
  const label = resourceLabels[resource] || humanize(resource);
  const id = parts.find((part) => /^\d+$/.test(part));
  const actionPart = [...parts].reverse().find((part) => part !== 'api' && part !== resource && !/^\d+$/.test(part));
  return { name: id ? `${label} #${id}` : label, context: log.context ? humanize(log.context) : actionPart ? humanize(actionPart) : label };
}

function isActionLog(log: AuditLog) {
  const action = log.action.toLowerCase();
  const record = `${log.recordName} ${log.context ?? ''}`.toLowerCase();
  return action !== 'logged in' && action !== 'registered account' && !record.includes('/login') && !record.includes(' - login');
}
