import React from 'react';
import { View } from 'react-native';

import { SectionProps } from '../shared/types';
import { RecordCard, Skeleton, styles } from '../shared/components';
import { asObject } from '../shared/helpers';

export function ProfileSection({ data, loading }: SectionProps) {
  if (loading) return <Skeleton />;
  const profile = asObject(data);
  return <View style={styles.stack}><RecordCard record={profile} route={{ key: 'profile', label: 'Profile', description: '' }} /></View>;
}
