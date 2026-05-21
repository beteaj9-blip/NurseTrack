import React from 'react';
import { View } from 'react-native';

import { apiFetch } from '../../api';
import { SectionProps } from '../shared/types';
import { EmptyState, PrimaryButton, RecordCard, Skeleton, styles } from '../shared/components';
import { normalizeRecords } from '../shared/helpers';

export function NotificationsSection({ data, loading, token, refresh, setMessage }: SectionProps) {
  const records = normalizeRecords(data);

  async function markAllRead() {
    try {
      await apiFetch('/notifications/me/read-all', { method: 'PUT', token });
      setMessage('All notifications marked as read.');
      refresh();
    } catch {
      setMessage('Notifications could not be marked as read.');
    }
  }

  return (
    <View style={styles.stack}>
      <PrimaryButton label="Mark All As Read" onPress={markAllRead} />
      {loading ? <Skeleton /> : records.length ? records.map((record, index) => <RecordCard key={record.id ?? index} record={record} route={{ key: 'notifications', label: 'Notifications', description: '' }} token={token} onChanged={refresh} setMessage={setMessage} />) : <EmptyState text="No notifications found." />}
    </View>
  );
}
