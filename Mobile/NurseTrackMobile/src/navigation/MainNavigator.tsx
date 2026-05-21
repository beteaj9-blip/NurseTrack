import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { CustomDrawerContent } from './CustomDrawerContent';
import { MainHeader } from '../components/MainHeader';

import { DashboardScreen } from '../screens/main/DashboardScreen';
import { DutyAttendanceScreen } from '../screens/main/DutyAttendanceScreen';
import { ScheduleScreen } from '../screens/main/ScheduleScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { NotificationScreen } from '../screens/main/NotificationScreen';
import { ManualBackupScreen } from '../screens/main/ManualBackupScreen';

export type MainDrawerParamList = {
  Dashboard: undefined;
  DutyAttendance: undefined;
  Schedule: undefined;
  Profile: undefined;
  Notification: undefined;
  ManualBackup: undefined;
};

const Drawer = createDrawerNavigator<MainDrawerParamList>();

export const MainNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        header: ({ navigation, route, options }) => {
          const title = options.title || route.name;
          // Clean up route names for display if needed
          const displayTitle = title === 'DutyAttendance' ? 'Duty Attendance' 
            : title === 'ManualBackup' ? 'Manual Backup'
            : title;
          return <MainHeader navigation={navigation as any} title={displayTitle} currentRouteName={route.name as keyof MainDrawerParamList} />;
        },
        drawerType: 'slide',
        swipeEdgeWidth: 100, // Makes sliding easier from edge
      }}
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ title: 'Dashboard' }} 
      />
      <Drawer.Screen 
        name="DutyAttendance" 
        component={DutyAttendanceScreen} 
        options={{ title: 'Duty Attendance' }} 
      />
      <Drawer.Screen 
        name="Schedule" 
        component={ScheduleScreen} 
        options={{ title: 'Assigned Schedules' }} 
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }} 
      />
      <Drawer.Screen 
        name="Notification" 
        component={NotificationScreen} 
        options={{ title: 'Notifications' }} 
      />
      <Drawer.Screen 
        name="ManualBackup" 
        component={ManualBackupScreen} 
        options={{ title: 'Manual Backup' }} 
      />
    </Drawer.Navigator>
  );
};
