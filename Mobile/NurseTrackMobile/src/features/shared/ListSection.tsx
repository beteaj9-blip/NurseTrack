import React from 'react';
import { View } from 'react-native';

import { resolveRouteEndpoint } from '../../routes';
import { SectionProps } from './types';
import { EmptyState, EndpointPill, RecordCard, Skeleton, styles } from './components';
import { normalizeRecords } from './helpers';

export function ListSection({ route, data, loading, token, user, refresh, setMessage }: SectionProps) {
  if (loading) return <Skeleton />;
  const records = normalizeRecords(data);

  return (
    <View style={styles.stack}>
      <EndpointPill endpoint={resolveRouteEndpoint(route, user)} />
      {records.length ? records.map((record, index) => <RecordCard key={record.id ?? index} record={record} route={route} token={token} onChanged={refresh} setMessage={setMessage} />) : <EmptyState text="No records found." />}
    </View>
  );
}
