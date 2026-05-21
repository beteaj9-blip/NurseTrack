import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { loadSession } from '../../../src/auth';
import { roleRoutes, slugToRole } from '../../../src/routes';
import { AdminShell } from '../../../src/screens/AdminShell';
import { User } from '../../../src/types';

export default function DashboardScreen() {
  const params = useLocalSearchParams<{ role?: string; screen?: string[] }>();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const role = params.role ? slugToRole[params.role] : undefined;
  const screenParam = params.screen;
  const screenKey = Array.isArray(screenParam) ? screenParam.join('/') : (screenParam || 'dashboard');

  useEffect(() => {
    let isMounted = true;

    async function restore() {
      const session = await loadSession();
      if (!session) {
        router.replace('/');
        return;
      }
      if (isMounted) {
        setUser(session.user);
        setToken(session.token);
        setIsChecking(false);
      }
    }

    restore();
    return () => {
      isMounted = false;
    };
  }, []);

  const routes = useMemo(() => role ? roleRoutes[role] : [], [role]);
  const activeRoute = routes.find((item) => item.key === screenKey) ?? routes[0];

  if (isChecking) return <SafeAreaView style={styles.center}><ActivityIndicator color="#8A252C" /></SafeAreaView>;
  if (!user || !role || !activeRoute) return <SafeAreaView style={styles.center}><Text>Route not found.</Text></SafeAreaView>;

  if (role !== 'ADMIN') {
    return <SafeAreaView style={styles.center}><Text style={styles.text}>Mobile role pages are being redone after Admin.</Text></SafeAreaView>;
  }

  return <AdminShell activeRoute={activeRoute} currentPathRole={params.role ?? 'admin'} token={token} user={user} />;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', backgroundColor: '#f6f3ef', flex: 1, justifyContent: 'center', padding: 20 },
  text: { color: '#344054', fontSize: 15, fontWeight: '800', textAlign: 'center' },
});
