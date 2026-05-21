import React, { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { apiFetch, loadPreview } from '../api';
import { resolveRouteEndpoint, roleLabels } from '../routes';
import { MobileRoute, User } from '../types';

import { FeatureScreenProps } from '../features/shared/types';
import { GhostButton, Notice, styles } from '../features/shared/components';
import { AdminDashboardSection } from '../features/dashboard/AdminDashboardSection';
import { DashboardSection } from '../features/dashboard/DashboardSection';
import { ManageUsersSection } from '../features/users/ManageUsersSection';
import { ManageAccessSection } from '../features/access/ManageAccessSection';
import { HospitalsSection } from '../features/hospitals/HospitalsSection';
import { NotificationsSection } from '../features/notifications/NotificationsSection';
import { ProfileSection } from '../features/profile/ProfileSection';
import { ProfileEditSection } from '../features/profile/ProfileEditSection';
import { ClinicalCaseFormSection } from '../features/cases/ClinicalCaseFormSection';
import { AppealFormSection } from '../features/appeals/AppealFormSection';
import { ReportsSection } from '../features/reports/ReportsSection';
import { ScheduleMakerSection } from '../features/schedules/ScheduleMakerSection';
import { SectionImportSection } from '../features/schedules/SectionImportSection';
import { ListSection } from '../features/shared/ListSection';

export function FeatureScreen({ route, token, user }: FeatureScreenProps) {
  const isAdminDashboard = route.feature === 'dashboard' && user.role === 'ADMIN';
  const endpoint = useMemo(() => isAdminDashboard ? undefined : resolveRouteEndpoint(route, user), [isAdminDashboard, route, user]);
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(Boolean(endpoint));
  const [message, setMessage] = useState('');
  const [refreshNonce, setRefreshNonce] = useState(0);

  const refresh = () => setRefreshNonce((value) => value + 1);

  useEffect(() => {
    let isMounted = true;
    setLoading(Boolean(endpoint));
    setMessage('');

    async function run() {
      const nextData = await loadPreview(endpoint, token);
      if (isMounted) {
        setData(nextData);
        setLoading(false);
      }
    }

    run();
    return () => {
      isMounted = false;
    };
  }, [endpoint, refreshNonce, token]);

  const sharedProps = { route, token, user, data, loading, message, setMessage, refresh };

  if (isAdminDashboard) return <AdminDashboardSection token={token} user={user} />;
  if (route.feature === 'manageUsers' && user.role === 'ADMIN') return <ManageUsersSection {...sharedProps} />;

  return (
    <View style={styles.screenCard}>
      <View style={styles.titleRow}>
        <View style={styles.flex}>
          <Text style={styles.eyebrow}>{roleLabels[user.role]}</Text>
          <Text style={styles.screenTitle}>{route.label}</Text>
        </View>
        {endpoint || route.feature ? <GhostButton label="Refresh" onPress={refresh} /> : null}
      </View>
      <Text style={styles.screenDescription}>{route.description}</Text>
      {message ? <Notice message={message} /> : null}

      {route.feature === 'dashboard' ? <DashboardSection {...sharedProps} /> : null}
      {route.feature === 'manageAccess' ? <ManageAccessSection {...sharedProps} /> : null}
      {route.feature === 'manageUsers' ? <ManageUsersSection {...sharedProps} /> : null}
      {route.feature === 'hospitals' ? <HospitalsSection {...sharedProps} /> : null}
      {route.feature === 'notifications' ? <NotificationsSection {...sharedProps} /> : null}
      {route.feature === 'profile' ? <ProfileSection {...sharedProps} /> : null}
      {route.feature === 'profileEdit' ? <ProfileEditSection {...sharedProps} /> : null}
      {route.feature === 'clinicalCaseForm' ? <ClinicalCaseFormSection {...sharedProps} /> : null}
      {route.feature === 'appealForm' ? <AppealFormSection {...sharedProps} /> : null}
      {route.feature === 'reports' ? <ReportsSection {...sharedProps} /> : null}
      {route.feature === 'scheduleMaker' ? <ScheduleMakerSection {...sharedProps} /> : null}
      {route.feature === 'sectionImport' ? <SectionImportSection {...sharedProps} /> : null}
      {!route.feature ? <ListSection {...sharedProps} /> : null}
    </View>
  );
}
