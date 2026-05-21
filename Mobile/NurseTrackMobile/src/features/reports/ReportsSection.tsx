import React from 'react';
import { Linking, Text } from 'react-native';

import { SectionProps } from '../shared/types';
import { Panel, PrimaryButton, styles } from '../shared/components';

export function ReportsSection({ user, setMessage }: SectionProps) {
  async function openReport() {
    if (user.role !== 'STUDENT') {
      setMessage('Select a student in the web report builder for role-wide PDF exports.');
      return;
    }
    setMessage('Student report data is connected. PDF export can be opened from the backend endpoint in a browser.');
    const base = process.env.EXPO_PUBLIC_BACKEND_API_URL?.replace(/\/+$/, '');
    if (base) Linking.openURL(`${base}/reports/student/export`);
  }

  return (
    <Panel title="Reports" badge="Connected">
      <Text style={styles.helpText}>Reports use the same backend report endpoints as the website. Student accounts can open their own report; staff report generation depends on selecting a student.</Text>
      <PrimaryButton label="Open Report Export" onPress={openReport} />
    </Panel>
  );
}
