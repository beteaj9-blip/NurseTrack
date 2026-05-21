import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiFetch } from '../src/api';
import { API_BASE_URL } from '../src/config';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState('Complete the form to create your NurseTrack account.');

  async function submit() {
    setIsError(false);
    setIsSuccess(false);
    if (!confirmed) {
      setIsError(true);
      setMessage('Please confirm that the account details are correct before creating an account.');
      return;
    }
    if (!fullName || !schoolId || !email || !password || !confirmPassword) {
      setIsError(true);
      setMessage('Complete all required account details.');
      return;
    }
    if (password !== confirmPassword) {
      setIsError(true);
      setMessage('Passwords do not match. Please try again.');
      return;
    }

    try {
      setIsLoading(true);
      await apiFetch('/users/register', { method: 'POST', body: JSON.stringify({ fullName, schoolId, email, password, role: 'STUDENT' }) });
      setIsSuccess(true);
      setMessage('Account created. Redirecting to login...');
      setTimeout(() => router.replace('/'), 1200);
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : 'Registration failed. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
            <Text style={styles.eyebrow}>NurseTrack Mobile</Text>
            <Text style={styles.heroTitle}>Create an account for organized clinical tracking.</Text>
            <Text style={styles.heroText}>Set up secure access for duty records, case logs, schedules, approvals, and progress updates.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.eyebrowSmall}>Get started</Text>
            <Text style={styles.title}>Create your account</Text>
            <Field label="Full name" value={fullName} onChangeText={setFullName} placeholder="Juan Dela Cruz" />
            <Field label="School ID number" value={schoolId} onChangeText={(value) => setSchoolId(value.replace(/[A-Za-z]/g, ''))} placeholder="12-3456-789" />
            <Field label="School email" value={email} onChangeText={setEmail} placeholder="student@cit.edu" autoCapitalize="none" />
            <Field label="Password" value={password} onChangeText={setPassword} placeholder="Create password" secureTextEntry />
            <Field label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter password" secureTextEntry />
            <Pressable onPress={() => setConfirmed((value) => !value)} style={styles.checkRow}>
              <View style={[styles.checkBox, confirmed && styles.checkBoxOn]}><Text style={styles.checkMark}>{confirmed ? '✓' : ''}</Text></View>
              <Text style={styles.checkText}>I confirm that the account details are correct.</Text>
            </Pressable>
            {message ? <View style={[styles.messageBox, isError ? styles.errorBox : isSuccess ? styles.successBox : styles.infoBox]}><Text style={[styles.messageText, isError ? styles.errorText : isSuccess ? styles.successText : styles.infoText]}>{message}</Text></View> : null}
            {!API_BASE_URL ? <View style={styles.warningBox}><Text style={styles.warningText}>Set EXPO_PUBLIC_BACKEND_API_URL in .env before signing in.</Text></View> : null}
            <Pressable disabled={isLoading || isSuccess} onPress={submit} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, (isLoading || isSuccess) && styles.disabledButton]}>{isLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>Create account</Text>}</Pressable>
            <View style={styles.createRow}><Text style={styles.createText}>Already have an account?</Text><Link href="/" style={styles.inlineLink}>Login</Link></View>
          </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, ...inputProps } = props;
  return <View style={styles.fieldGroup}><Text style={styles.label}>{label}</Text><TextInput placeholderTextColor="#98a2b3" style={styles.input} {...inputProps} /></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#8A252C' },
  flex: { flex: 1 },
  container: { flexGrow: 1, gap: 14, justifyContent: 'flex-start', padding: 18, paddingBottom: 80, paddingTop: 18 },
  hero: { backgroundColor: '#8A252C', borderColor: 'rgba(255,255,255,0.18)', borderRadius: 22, borderWidth: 1, padding: 18 },
  eyebrow: { color: '#F4C430', fontSize: 12, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' },
  eyebrowSmall: { color: '#8A252C', fontSize: 12, fontWeight: '900', letterSpacing: 0.8, textAlign: 'center', textTransform: 'uppercase' },
  heroTitle: { color: '#ffffff', fontSize: 26, fontWeight: '900', lineHeight: 31, marginTop: 8 },
  heroText: { color: '#ffe9ec', fontSize: 14, lineHeight: 20, marginTop: 8 },
  card: { backgroundColor: '#ffffff', borderRadius: 22, gap: 11, padding: 18 },
  title: { color: '#202124', fontSize: 23, fontWeight: '900', marginBottom: 6, textAlign: 'center' },
  fieldGroup: { gap: 7 },
  label: { color: '#202124', fontSize: 13, fontWeight: '800' },
  input: { backgroundColor: '#fbfbfc', borderColor: '#e4e7ec', borderRadius: 14, borderWidth: 1, color: '#202124', fontSize: 15, minHeight: 50, paddingHorizontal: 14 },
  checkRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  checkBox: { alignItems: 'center', borderColor: '#dbe3ee', borderRadius: 5, borderWidth: 1, height: 20, justifyContent: 'center', width: 20 },
  checkBoxOn: { backgroundColor: '#8A252C', borderColor: '#8A252C' },
  checkMark: { color: '#ffffff', fontSize: 13, fontWeight: '900' },
  checkText: { color: '#667085', flex: 1, fontSize: 13, fontWeight: '700' },
  messageBox: { borderRadius: 14, borderWidth: 1, padding: 12 },
  infoBox: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' },
  errorBox: { backgroundColor: '#fff1f2', borderColor: '#fecdd3' },
  successBox: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  messageText: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  infoText: { color: '#667085' },
  errorText: { color: '#be123c' },
  successText: { color: '#166534' },
  warningBox: { backgroundColor: '#fffbeb', borderColor: '#fde68a', borderRadius: 14, borderWidth: 1, padding: 12 },
  warningText: { color: '#92400e', fontSize: 13, fontWeight: '800', lineHeight: 18 },
  primaryButton: { alignItems: 'center', backgroundColor: '#8A252C', borderColor: '#6d1d23', borderRadius: 16, borderWidth: 1, elevation: 2, justifyContent: 'center', marginTop: 2, minHeight: 54, shadowColor: '#8A252C', shadowOpacity: 0.24, shadowRadius: 10 },
  primaryButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '900' },
  disabledButton: { opacity: 0.7 },
  pressed: { opacity: 0.72 },
  createRow: { alignItems: 'center', flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 2 },
  createText: { color: '#667085', fontSize: 14, fontWeight: '600' },
  inlineLink: { color: '#8A252C', fontSize: 14, fontWeight: '900' },
});
