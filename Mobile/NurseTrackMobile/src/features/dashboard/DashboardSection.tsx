import React from 'react';
import { View } from 'react-native';

import { roleLabels } from '../../routes';
import { asObject, labelize } from '../shared/helpers';
import { EmptyState, InfoCard, Skeleton, styles } from '../shared/components';
import { SectionProps } from '../shared/types';

export function DashboardSection({ data, loading, user }: SectionProps) {
  if (loading) return <Skeleton />;
  const metrics = asObject(data);
  const cards = Object.entries(metrics).filter(([, value]) => typeof value === 'number' || typeof value === 'string').slice(0, 8);

  return (
    <View style={styles.gridTwo}>
      <InfoCard title="Signed in as" value={roleLabels[user.role]} hint={user.email} />
      {cards.length ? cards.map(([key, value]) => <InfoCard key={key} title={labelize(key)} value={String(value)} />) : <EmptyState text="Dashboard metrics are ready once the backend returns data." />}
    </View>
  );
}
