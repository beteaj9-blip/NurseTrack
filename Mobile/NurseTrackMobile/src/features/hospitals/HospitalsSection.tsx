import React, { useState } from 'react';
import { View } from 'react-native';

import { apiFetch } from '../../api';
import { SectionProps } from '../shared/types';
import { Field, Panel, PrimaryButton, RecordCard, Skeleton, styles } from '../shared/components';
import { normalizeRecords } from '../shared/helpers';

export function HospitalsSection(props: SectionProps) {
  const { data, loading, token, refresh, setMessage } = props;
  const [name, setName] = useState('');
  const [fullName, setFullName] = useState('');

  async function submit() {
    if (!name || !fullName) {
      setMessage('Complete hospital code and full name.');
      return;
    }
    try {
      await apiFetch('/hospitals', { method: 'POST', token, body: JSON.stringify({ name, fullName }) });
      setName('');
      setFullName('');
      setMessage('Hospital created.');
      refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Hospital could not be created.');
    }
  }

  return (
    <View style={styles.stack}>
      <Panel title="New Hospital" badge="Hospitals">
        <Field label="Hospital Code" value={name} onChangeText={setName} />
        <Field label="Full Name" value={fullName} onChangeText={setFullName} />
        <PrimaryButton label="Create Hospital" onPress={submit} />
      </Panel>
      {loading ? <Skeleton /> : normalizeRecords(data).map((record, index) => <RecordCard key={record.id ?? index} record={record} route={props.route} token={token} onChanged={refresh} setMessage={setMessage} />)}
    </View>
  );
}
