import React from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { apiFetch } from '../../api';
import { MobileRoute } from '../../types';
import { AnyRecord } from './types';
import { compactJson, isUnread, labelize, formatValue, recordTitle, recordSubtitle, recordDetails } from './helpers';

export function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, style, ...inputProps } = props;
  return <View style={styles.fieldGroup}><Text style={styles.label}>{label}</Text><TextInput placeholderTextColor="#98a2b3" style={[styles.input, props.multiline && styles.textarea, style]} {...inputProps} /></View>;
}

export function ReadOnly({ label, value }: { label: string; value?: string }) {
  return <View style={styles.fieldGroup}><Text style={styles.label}>{label}</Text><View style={styles.readOnly}><Text style={styles.readOnlyText}>{value || '-'}</Text></View></View>;
}

export function Panel({ title, badge, children }: { title: string; badge: string; children: React.ReactNode }) {
  return <View style={styles.panel}><View style={styles.rowTop}><Text style={styles.panelTitle}>{title}</Text><Badge label={badge} tone="gold" /></View>{children}</View>;
}

export function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryButtonText}>{label}</Text></Pressable>;
}

export function GhostButton({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}><Text style={styles.ghostButtonText}>{label}</Text></Pressable>;
}

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}><Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text></Pressable>;
}

export function SwitchLike({ enabled, onPress }: { enabled: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.switchTrack, enabled && styles.switchTrackOn]}><View style={[styles.switchThumb, enabled && styles.switchThumbOn]} /></Pressable>;
}

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'gold' }) {
  return <View style={[styles.badge, tone === 'gold' && styles.badgeGold]}><Text style={[styles.badgeText, tone === 'gold' && styles.badgeGoldText]}>{labelize(label)}</Text></View>;
}

export function InfoCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return <View style={styles.infoCard}><Text style={styles.infoTitle}>{title}</Text><Text style={styles.infoValue}>{value}</Text>{hint ? <Text style={styles.rowMeta}>{hint}</Text> : null}</View>;
}

export function EndpointPill({ endpoint }: { endpoint?: string }) {
  return endpoint ? <View style={styles.endpointPill}><Text style={styles.endpointText}>Connected to {endpoint}</Text></View> : null;
}

export function Notice({ message }: { message: string }) {
  return <View style={styles.notice}><Text style={styles.noticeText}>{message}</Text></View>;
}

export function EmptyState({ text }: { text: string }) {
  return <View style={styles.emptyCard}><Text style={styles.emptyText}>{text}</Text></View>;
}

export function InfoStrip({ label, value }: { label: string; value: string }) {
  return <View className="gap-1 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2"><Text className="text-[10px] font-black uppercase tracking-wide text-[#64748b]">{label}</Text><Text className="text-[13px] font-bold text-[#4c5d7d]">{value || 'Not set'}</Text></View>;
}

export function StatusBadge({ status }: { status: string }) {
  if (status === 'Active') return <View className="rounded-full bg-[#e9f8ef] px-[10px] py-1"><Text className="text-[11px] font-extrabold text-[#078033]">{status}</Text></View>;
  if (status === 'Pending') return <View className="rounded-full bg-[#fff6cc] px-[10px] py-1"><Text className="text-[11px] font-extrabold text-[#6c4c00]">{status}</Text></View>;
  return <View className="rounded-full bg-[#fff1f0] px-[10px] py-1"><Text className="text-[11px] font-extrabold text-[#b42318]">{status}</Text></View>;
}

export function ProfileAvatar({ name, imageUrl }: { name: string; imageUrl?: string }) {
  return imageUrl ? <Image source={{ uri: imageUrl }} className="h-[42px] w-[42px] rounded-full bg-[#f0f3f8]" /> : <View className="h-[42px] w-[42px] items-center justify-center rounded-full bg-[#8A252C]"><Text className="text-sm font-black text-white">{name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'U'}</Text></View>;
}

export function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} className={`rounded-full border px-3 py-2 active:opacity-75 ${active ? 'border-maroon bg-maroon' : 'border-[#e2e8f0] bg-white'}`}><Text className={`text-xs font-extrabold ${active ? 'text-white' : 'text-[#344054]'}`}>{label}</Text></Pressable>;
}

export function ModalHeader({ eyebrow, title, onClose, onBack }: { eyebrow?: string; title: string; onClose: () => void; onBack?: () => void }) {
  return <View className="min-h-[76px] flex-row items-center gap-3 border-b border-[#e5eaf1] px-5 py-4">{onBack ? <Pressable onPress={onBack} className="h-11 items-center justify-center rounded-lg border border-[#dbe3ee] bg-white px-3"><Text className="text-sm font-black text-[#111827]">Back</Text></Pressable> : null}<View className="min-w-0 flex-1">{eyebrow ? <Text className="text-xs font-extrabold uppercase tracking-wide text-[#8a252c]">{eyebrow}</Text> : null}<Text className="mt-1 text-xl font-bold leading-6 text-[#111827]">{title}</Text></View><Pressable onPress={onClose} className="h-11 w-11 items-center justify-center rounded-lg border border-[#dbe3ee] bg-white"><Text className="text-xl font-black text-[#111827]">X</Text></Pressable></View>;
}

export function ModalActions({ primary, secondary, onPrimary, onSecondary }: { primary: string; secondary: string; onPrimary: () => void; onSecondary: () => void }) {
  return <View className="gap-3 border-t border-[#e5eaf1] bg-white p-5"><Pressable onPress={onSecondary} className="min-h-[48px] items-center justify-center rounded-lg border border-[#e2e8f0] bg-white px-4 active:bg-[#f8fafc]"><Text className="text-[15px] font-extrabold text-[#334155]">{secondary}</Text></Pressable><Pressable onPress={onPrimary} className="min-h-[48px] items-center justify-center rounded-lg bg-maroon px-4 shadow-sm active:opacity-75"><Text className="text-[15px] font-extrabold text-white">{primary}</Text></Pressable></View>;
}

export function Skeleton() {
  return <View style={styles.skeletonGroup}><View style={styles.skeletonLineLarge} /><View style={styles.skeletonLine} /><View style={styles.skeletonLineShort} /></View>;
}

export function RecordCard({ record, route, token, onChanged, setMessage }: { record: AnyRecord; route: MobileRoute; token?: string | null; onChanged?: () => void; setMessage?: (value: string) => void }) {
  const title = recordTitle(record);
  const subtitle = recordSubtitle(record);
  const status = record.status ?? record.clearanceStatus ?? record.validationStatus ?? (isUnread(record) ? 'UNREAD' : undefined);
  const details = recordDetails(record);

  async function markNotification(read: boolean) {
    try {
      await apiFetch(`/notifications/${record.id}/${read ? 'read' : 'unread'}`, { method: 'PUT', token });
      setMessage?.(`Notification marked as ${read ? 'read' : 'unread'}.`);
      onChanged?.();
    } catch {
      setMessage?.('Notification could not be updated.');
    }
  }

  async function cancelExtension() {
    try {
      await apiFetch(`/extension-days/${record.id}/cancel`, { method: 'PUT', token });
      setMessage?.('Extension day canceled.');
      onChanged?.();
    } catch {
      setMessage?.('Extension day could not be canceled.');
    }
  }

  async function validateCase(statusValue: 'APPROVED' | 'REJECTED') {
    try {
      await apiFetch(`/cases/${record.id}/validate?status=${statusValue}`, { method: 'PUT', token });
      setMessage?.(`Clinical case ${statusValue.toLowerCase()}.`);
      onChanged?.();
    } catch {
      setMessage?.('Clinical case decision could not be saved.');
    }
  }

  return (
    <View style={styles.recordCard}>
      <View style={styles.rowTop}>
        <View style={styles.flex}>
          <Text style={styles.rowTitle}>{title}</Text>
          {subtitle ? <Text style={styles.rowMeta}>{subtitle}</Text> : null}
        </View>
        {status ? <Badge label={String(status)} /> : null}
      </View>
      {details.map(([key, value]) => <View key={key} style={styles.detailRow}><Text style={styles.detailKey}>{labelize(key)}</Text><Text style={styles.detailValue}>{formatValue(value)}</Text></View>)}
      {route.key === 'notifications' ? <View style={styles.actionRow}>{isUnread(record) ? <GhostButton label="Mark read" onPress={() => markNotification(true)} /> : <GhostButton label="Mark unread" onPress={() => markNotification(false)} />}</View> : null}
      {route.key.startsWith('extension-days') && record.status !== 'CANCELED' ? <View style={styles.actionRow}><GhostButton label="Cancel" onPress={cancelExtension} /></View> : null}
      {route.key.includes('clinical-cases/validation') || route.key.includes('clinical-cases') && record.status === 'PENDING' ? <View style={styles.actionRow}><GhostButton label="Approve" onPress={() => validateCase('APPROVED')} /><GhostButton label="Reject" onPress={() => validateCase('REJECTED')} /></View> : null}
    </View>
  );
}

export function ImportSection({ title, badge, previewPath, publishPath, token, setMessage, refresh }: { title: string; badge: string; previewPath: string; publishPath: string; token: string | null; setMessage: (value: string) => void; refresh: () => void }) {
  const [preview, setPreview] = React.useState<unknown>(null);
  const [busy, setBusy] = React.useState(false);

  async function pickFile() {
    try {
      const DocumentPicker = require('expo-document-picker');
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/csv',
          '*/*',
        ],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('file', { uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/octet-stream' } as any);
      setBusy(true);
      const nextPreview = await apiFetch(previewPath, { method: 'POST', token, body: formData });
      setPreview(nextPreview);
      setMessage(`${title} preview loaded. Review the summary before publishing.`);
    } catch {
      setMessage(`${title} preview could not be loaded.`);
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    if (!preview) {
      setMessage('Preview a spreadsheet before publishing.');
      return;
    }
    try {
      setBusy(true);
      await apiFetch(publishPath, { method: 'POST', token, body: JSON.stringify(preview) });
      setMessage(`${title} published.`);
      setPreview(null);
      refresh();
    } catch {
      setMessage(`${title} could not be published.`);
    } finally {
      setBusy(false);
    }
  }

  return <Panel title={title} badge={badge}><Text style={styles.helpText}>Select the same spreadsheet used by the website. Preview runs first; publish sends the reviewed preview to the backend.</Text><PrimaryButton label={busy ? 'Working...' : 'Choose Spreadsheet'} onPress={pickFile} />{preview ? <Text style={styles.previewText}>{compactJson(preview)}</Text> : null}<PrimaryButton label="Publish Preview" onPress={publish} /></Panel>;
}

export const styles = StyleSheet.create({
  screenCard: { backgroundColor: '#ffffff', borderRadius: 24, gap: 14, padding: 18 },
  flex: { flex: 1 },
  titleRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 12 },
  eyebrow: { color: '#8A252C', fontSize: 12, fontWeight: '900', letterSpacing: 0.6, textTransform: 'uppercase' },
  screenTitle: { color: '#202124', fontSize: 26, fontWeight: '900', lineHeight: 31, marginTop: 4 },
  screenDescription: { color: '#667085', fontSize: 14, fontWeight: '600', lineHeight: 21 },
  stack: { gap: 12 },
  gridTwo: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  infoCard: { backgroundColor: '#f8fafc', borderColor: '#e4e7ec', borderRadius: 18, borderWidth: 1, minWidth: '47%', padding: 14 },
  infoTitle: { color: '#667085', fontSize: 12, fontWeight: '800' },
  infoValue: { color: '#202124', fontSize: 22, fontWeight: '900', marginTop: 4 },
  panel: { backgroundColor: '#ffffff', borderColor: '#e4e7ec', borderRadius: 18, borderWidth: 1, gap: 12, padding: 14 },
  panelTitle: { color: '#202124', flex: 1, fontSize: 17, fontWeight: '900' },
  recordCard: { backgroundColor: '#ffffff', borderColor: '#e4e7ec', borderRadius: 18, borderWidth: 1, gap: 10, padding: 14, shadowColor: '#202124', shadowOpacity: 0.04, shadowRadius: 12 },
  rowTop: { alignItems: 'flex-start', flexDirection: 'row', gap: 10 },
  rowTitle: { color: '#202124', fontSize: 15, fontWeight: '900', lineHeight: 20 },
  rowMeta: { color: '#667085', fontSize: 12, fontWeight: '700', lineHeight: 17, marginTop: 3 },
  detailRow: { borderTopColor: '#eef2f6', borderTopWidth: 1, flexDirection: 'row', gap: 10, justifyContent: 'space-between', paddingTop: 8 },
  detailKey: { color: '#667085', flex: 0.45, fontSize: 12, fontWeight: '800' },
  detailValue: { color: '#202124', flex: 0.55, fontSize: 12, fontWeight: '700', textAlign: 'right' },
  badge: { backgroundColor: '#f1f5f9', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { color: '#334155', fontSize: 10, fontWeight: '900' },
  badgeGold: { backgroundColor: '#fff6cc' },
  badgeGoldText: { color: '#6c4c00' },
  endpointPill: { alignSelf: 'flex-start', backgroundColor: '#fffbeb', borderColor: '#fde68a', borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  endpointText: { color: '#92400e', fontSize: 12, fontWeight: '900' },
  notice: { backgroundColor: '#fff7ed', borderColor: '#fed7aa', borderRadius: 14, borderWidth: 1, padding: 12 },
  noticeText: { color: '#9a3412', fontSize: 13, fontWeight: '800', lineHeight: 18 },
  emptyCard: { backgroundColor: '#f8fafc', borderColor: '#e4e7ec', borderRadius: 18, borderWidth: 1, padding: 14 },
  emptyText: { color: '#667085', fontSize: 13, fontWeight: '700', lineHeight: 19 },
  permissionRow: { alignItems: 'center', borderColor: '#e4e7ec', borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: 12, padding: 12 },
  levelCard: { borderColor: '#e4e7ec', borderRadius: 16, borderWidth: 1, gap: 10, padding: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#f8fafc', borderColor: '#e4e7ec', borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 },
  chipActive: { backgroundColor: '#8A252C', borderColor: '#8A252C' },
  chipText: { color: '#202124', fontSize: 12, fontWeight: '800' },
  chipTextActive: { color: '#ffffff' },
  switchTrack: { backgroundColor: '#e2e8f0', borderRadius: 999, height: 32, justifyContent: 'center', padding: 3, width: 58 },
  switchTrackOn: { backgroundColor: '#8A252C' },
  switchThumb: { backgroundColor: '#ffffff', borderRadius: 999, height: 26, width: 26 },
  switchThumbOn: { transform: [{ translateX: 26 }] },
  fieldGroup: { gap: 7 },
  label: { color: '#344054', fontSize: 13, fontWeight: '900' },
  input: { backgroundColor: '#ffffff', borderColor: '#dbe3ee', borderRadius: 12, borderWidth: 1, color: '#202124', fontSize: 14, minHeight: 46, paddingHorizontal: 12 },
  textarea: { minHeight: 92, paddingTop: 12, textAlignVertical: 'top' },
  readOnly: { backgroundColor: '#f8fafc', borderColor: '#dbe3ee', borderRadius: 12, borderWidth: 1, minHeight: 46, justifyContent: 'center', paddingHorizontal: 12 },
  readOnlyText: { color: '#64748b', fontSize: 14, fontWeight: '700' },
  primaryButton: { alignItems: 'center', backgroundColor: '#8A252C', borderRadius: 14, justifyContent: 'center', minHeight: 46, paddingHorizontal: 14 },
  primaryButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '900' },
  ghostButton: { alignItems: 'center', backgroundColor: '#ffffff', borderColor: '#dbe3ee', borderRadius: 12, borderWidth: 1, justifyContent: 'center', minHeight: 38, paddingHorizontal: 12 },
  ghostButtonText: { color: '#344054', fontSize: 12, fontWeight: '900' },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' },
  helpText: { color: '#475569', fontSize: 13, fontWeight: '700', lineHeight: 20 },
  previewText: { backgroundColor: '#f8fafc', borderColor: '#e4e7ec', borderRadius: 14, borderWidth: 1, color: '#667085', fontSize: 11, lineHeight: 16, padding: 12 },
  skeletonGroup: { backgroundColor: '#ffffff', borderColor: '#e4e7ec', borderRadius: 18, borderWidth: 1, gap: 12, padding: 18 },
  skeletonLineLarge: { backgroundColor: '#eee6dd', borderRadius: 999, height: 20, width: '76%' },
  skeletonLine: { backgroundColor: '#eee6dd', borderRadius: 999, height: 14, width: '92%' },
  skeletonLineShort: { backgroundColor: '#eee6dd', borderRadius: 999, height: 14, width: '58%' },
  pressed: { opacity: 0.72 },
});
