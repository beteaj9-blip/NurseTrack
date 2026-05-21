import React, { useEffect, useState } from 'react';

import { apiFetch } from '../../api';
import { SectionProps } from '../shared/types';
import { Field, Panel, PrimaryButton, Skeleton } from '../shared/components';
import { asObject } from '../shared/helpers';

export function ProfileEditSection({ data, loading, token, setMessage, refresh }: SectionProps) {
  const profile = asObject(data);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  useEffect(() => {
    setFullName(profile.fullName ?? '');
    setEmail(profile.email ?? '');
    setMobileNumber(profile.mobileNumber ?? '');
  }, [profile.email, profile.fullName, profile.mobileNumber]);

  async function submit() {
    try {
      await apiFetch('/users/me', { method: 'PUT', token, body: JSON.stringify({ fullName, email, mobileNumber }) });
      setMessage('Profile updated.');
      refresh();
    } catch {
      setMessage('Profile could not be updated.');
    }
  }

  if (loading) return <Skeleton />;

  return (
    <Panel title="Edit Profile" badge="Account">
      <Field label="Full Name" value={fullName} onChangeText={setFullName} />
      <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <Field label="Mobile Number" value={mobileNumber} onChangeText={setMobileNumber} />
      <PrimaryButton label="Save Profile" onPress={submit} />
    </Panel>
  );
}
