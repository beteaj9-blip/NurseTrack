import { Link, Redirect, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError, getCurrentUser, loginRequest } from '../src/api';
import { loadSession, saveSession } from '../src/auth';
import { API_BASE_URL } from '../src/config';
import { roleSlugs } from '../src/routes';
import { User } from '../src/types';

export default function LoginPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('Enter your account details to continue.');
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function restore() {
      try {
        const session = await loadSession();
        if (!session) return;
        const freshUser = await getCurrentUser(session.token);
        await saveSession(freshUser, session.token);
        if (isMounted) setSessionUser(freshUser);
      } catch {
        if (isMounted) setMessage('Your saved session expired. Please sign in again.');
      } finally {
        if (isMounted) setCheckingSession(false);
      }
    }

    restore();
    return () => {
      isMounted = false;
    };
  }, []);

  async function submit() {
    if (!userId.trim() || !password) {
      setIsError(true);
      setMessage('Please enter your School ID / email and password.');
      return;
    }

    setIsSubmitting(true);
    setIsError(false);
    setMessage('Signing you in...');

    try {
      const result = await loginRequest(userId.trim(), password);
      await saveSession(result.user, result.token);
      router.replace(`/(dashboard)/${roleSlugs[result.user.role]}/dashboard`);
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof ApiError && error.status === 401 ? 'Invalid credentials. Please check your ID/email and password.' : error instanceof Error ? error.message : 'Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (checkingSession) {
    return <SafeAreaView style={styles.center}><ActivityIndicator color="#8A252C" /></SafeAreaView>;
  }

  if (sessionUser) return <Redirect href={`/(dashboard)/${roleSlugs[sessionUser.role]}/dashboard`} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
            <Text style={styles.eyebrow}>NurseTrack Mobile</Text>
            <Text style={styles.heroTitle}>Clinical tracking for every role.</Text>
            <Text style={styles.heroText}>Manage duty hours, schedules, case records, approvals, and student progress from your phone.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Login to your account</Text>
            <Text style={styles.label}>School email or ID number</Text>
            <TextInput autoCapitalize="none" editable={!isSubmitting} onChangeText={setUserId} placeholder="student@cit.edu or 12-3456-789" placeholderTextColor="#98a2b3" style={styles.input} value={userId} />
            <Text style={styles.label}>Password</Text>
            <TextInput editable={!isSubmitting} onChangeText={setPassword} placeholder="Enter password" placeholderTextColor="#98a2b3" secureTextEntry style={styles.input} value={password} />
            <View style={styles.loginLinksRow}>
              <Text style={styles.keepSignedIn}>Keep me signed in</Text>
              <Link href="/forgot-password" style={styles.inlineLink}>Forgot password?</Link>
            </View>
            {message ? <View style={[styles.messageBox, isError ? styles.errorBox : styles.infoBox]}><Text style={[styles.messageText, isError ? styles.errorText : styles.infoText]}>{message}</Text></View> : null}
            {!API_BASE_URL ? <View style={styles.warningBox}><Text style={styles.warningText}>Set EXPO_PUBLIC_BACKEND_API_URL in .env before signing in.</Text></View> : null}
            <Pressable disabled={isSubmitting} onPress={submit} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, isSubmitting && styles.disabledButton]}>
              {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>Sign In</Text>}
            </Pressable>
            <View style={styles.createRow}>
              <Text style={styles.createText}>Don't have an account?</Text>
              <Link href="/register" style={styles.inlineLink}>Create account</Link>
            </View>
          </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#8A252C' },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  flex: { flex: 1 },
  container: { flexGrow: 1, gap: 14, justifyContent: 'flex-start', padding: 18, paddingBottom: 80, paddingTop: 18 },
  hero: { backgroundColor: '#8A252C', borderColor: 'rgba(255,255,255,0.18)', borderRadius: 22, borderWidth: 1, padding: 18 },
  eyebrow: { color: '#F4C430', fontSize: 12, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' },
  heroTitle: { color: '#ffffff', fontSize: 28, fontWeight: '900', lineHeight: 33, marginTop: 8 },
  heroText: { color: '#ffe9ec', fontSize: 14, lineHeight: 20, marginTop: 8 },
  card: { backgroundColor: '#ffffff', borderRadius: 22, gap: 11, padding: 18 },
  title: { color: '#202124', fontSize: 23, fontWeight: '900', marginBottom: 6 },
  label: { color: '#202124', fontSize: 13, fontWeight: '800' },
  input: { backgroundColor: '#fbfbfc', borderColor: '#e4e7ec', borderRadius: 14, borderWidth: 1, color: '#202124', fontSize: 15, minHeight: 50, paddingHorizontal: 14 },
  messageBox: { borderRadius: 14, borderWidth: 1, padding: 12 },
  infoBox: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' },
  errorBox: { backgroundColor: '#fff1f2', borderColor: '#fecdd3' },
  messageText: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  infoText: { color: '#667085' },
  errorText: { color: '#be123c' },
  warningBox: { backgroundColor: '#fffbeb', borderColor: '#fde68a', borderRadius: 14, borderWidth: 1, padding: 12 },
  warningText: { color: '#92400e', fontSize: 13, fontWeight: '800', lineHeight: 18 },
  primaryButton: { alignItems: 'center', backgroundColor: '#8A252C', borderColor: '#6d1d23', borderRadius: 16, borderWidth: 1, elevation: 2, justifyContent: 'center', marginTop: 2, minHeight: 54, shadowColor: '#8A252C', shadowOpacity: 0.24, shadowRadius: 10 },
  primaryButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '900' },
  loginLinksRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  keepSignedIn: { color: '#667085', fontSize: 13, fontWeight: '700' },
  createRow: { alignItems: 'center', flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 2 },
  createText: { color: '#667085', fontSize: 14, fontWeight: '600' },
  inlineLink: { color: '#8A252C', fontSize: 14, fontWeight: '900' },
  disabledButton: { opacity: 0.7 },
  pressed: { opacity: 0.72 },
});
