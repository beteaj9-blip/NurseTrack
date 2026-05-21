import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { apiFetch } from '../../api';
import { roleLabels } from '../../routes';
import { AnyRecord, SectionProps } from '../shared/types';
import { Chip, EmptyState, Panel, Skeleton, SwitchLike, styles } from '../shared/components';

const permissionItems = {
  COORDINATOR: [
    ['scheduleMaker', 'Schedule Maker', 'Allow creating and publishing schedule imports.'],
    ['extensionDays', 'Extension Days', 'Allow adding, editing, or canceling extension-day records.'],
    ['manualBackup', 'Manual Backup', 'Allow approving or returning encoded attendance.'],
    ['clearance', 'Clearance', 'Allow approving or canceling clearance approval.'],
    ['clinicalCases', 'Clinical Cases View', 'Allow editing approval or rejection decisions.'],
    ['ciRecommendations', 'CI Recommendations', 'Allow accepting, rejecting, or editing decisions.'],
  ],
  ASSISTANT: [
    ['extensionDays', 'Extension Days', 'Allow adding, editing, or canceling extension-day records.'],
    ['manualBackup', 'Manual Backup', 'Allow approving or returning encoded attendance.'],
    ['clearance', 'Clearance', 'Allow approving or canceling clearance approval.'],
    ['clinicalCases', 'Clinical Cases View', 'Allow editing approval or rejection decisions.'],
    ['ciRecommendations', 'CI Recommendations', 'Allow accepting, rejecting, or editing decisions.'],
  ],
} satisfies Record<string, string[][]>;

export function ManageAccessSection({ token, refresh, setMessage }: SectionProps) {
  return (
    <View style={styles.stack}>
      <RolePermissionGroup role="ASSISTANT" token={token} refresh={refresh} setMessage={setMessage} />
      <RolePermissionGroup role="COORDINATOR" token={token} refresh={refresh} setMessage={setMessage} />
      <LevelAssignmentGroup role="CHAIR" token={token} setMessage={setMessage} />
      <LevelAssignmentGroup role="ASSISTANT" token={token} setMessage={setMessage} />
    </View>
  );
}

function RolePermissionGroup({ role, token, refresh, setMessage }: { role: 'ASSISTANT' | 'COORDINATOR'; token: string | null; refresh: () => void; setMessage: (value: string) => void }) {
  const [permissions, setPermissions] = useState<AnyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    apiFetch<AnyRecord[]>(`/admin-access-permissions?role=${role}`, { token })
      .then((items) => isMounted && setPermissions(items))
      .catch(() => isMounted && setPermissions([]))
      .finally(() => isMounted && setLoading(false));
    return () => {
      isMounted = false;
    };
  }, [role, token]);

  async function toggle(permissionKey: string, enabled: boolean) {
    try {
      await apiFetch(`/admin-access-permissions/${role}/${permissionKey}`, { method: 'PUT', token, body: JSON.stringify({ enabled }) });
      setPermissions((current) => current.map((item) => item.permissionKey === permissionKey ? { ...item, enabled } : item));
      setMessage(`${roleLabels[role]} access updated.`);
      refresh();
    } catch {
      setMessage('Access permission could not be saved.');
    }
  }

  const enabledByKey = Object.fromEntries(permissions.map((item) => [item.permissionKey, Boolean(item.enabled)]));

  return (
    <Panel title={`${roleLabels[role]} Edit Permissions`} badge="Admin Access">
      {loading ? <Skeleton /> : permissionItems[role].map(([key, title, description]) => (
        <View key={key} style={styles.permissionRow}>
          <View style={styles.flex}>
            <Text style={styles.rowTitle}>{title}</Text>
            <Text style={styles.rowMeta}>{description}</Text>
          </View>
          <SwitchLike enabled={Boolean(enabledByKey[key])} onPress={() => toggle(key, !enabledByKey[key])} />
        </View>
      ))}
    </Panel>
  );
}

function LevelAssignmentGroup({ role, token, setMessage }: { role: 'CHAIR' | 'ASSISTANT'; token: string | null; setMessage: (value: string) => void }) {
  const [users, setUsers] = useState<AnyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    apiFetch<AnyRecord[]>(`/users?role=${role}`, { token })
      .then((items) => isMounted && setUsers(items))
      .catch(() => isMounted && setUsers([]))
      .finally(() => isMounted && setLoading(false));
    return () => {
      isMounted = false;
    };
  }, [role, token]);

  async function setLevel(user: AnyRecord, level: number) {
    try {
      await apiFetch(`/users/${user.id}`, { method: 'PUT', token, body: JSON.stringify({ assignedLevels: String(level) }) });
      setUsers((current) => current.map((item) => item.id === user.id ? { ...item, assignedLevels: [level] } : item));
      setMessage(`${user.fullName} assigned to Level ${level}.`);
    } catch {
      setMessage('Level assignment could not be saved.');
    }
  }

  return (
    <Panel title={`${roleLabels[role]} Level Assignments`} badge="Level access">
      {loading ? <Skeleton /> : users.length ? users.map((item) => (
        <View key={item.id} style={styles.levelCard}>
          <Text style={styles.rowTitle}>{item.fullName}</Text>
          <View style={styles.chipRow}>{[1, 2, 3, 4].map((level) => <Chip key={level} label={`Level ${level}`} active={(item.assignedLevels?.[0] ?? 1) === level} onPress={() => setLevel(item, level)} />)}</View>
        </View>
      )) : <EmptyState text={`No ${roleLabels[role].toLowerCase()} users found.`} />}
    </Panel>
  );
}
