import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { apiFetch } from '../api';
import { clearSession } from '../auth';
import { roleRoutes } from '../routes';
import { MobileRoute, User } from '../types';
import { FeatureScreen } from './FeatureScreen';

type AdminShellProps = {
  activeRoute: MobileRoute;
  currentPathRole: string;
  token: string | null;
  user: User;
};

const sidebarWidth = 286;
const citLogo = require('../../assets/cit-u-logo.png');
type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

export function AdminShell({ activeRoute, currentPathRole, token, user }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const insets = useSafeAreaInsets();
  const slideX = useRef(new Animated.Value(-sidebarWidth)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sidebarRoutes = roleRoutes.ADMIN.filter((item) => !item.key.includes('/') && !['notifications', 'profile', 'about'].includes(item.key));

  useEffect(() => {
    let mounted = true;
    apiFetch<{ unreadCount: number }>('/notifications/me/count', { token })
      .then((data) => mounted && setUnreadCount(data.unreadCount ?? 0))
      .catch(() => mounted && setUnreadCount(0));
    return () => {
      mounted = false;
    };
  }, [activeRoute.key, token]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideX, {
        toValue: sidebarOpen ? 0 : -sidebarWidth,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: sidebarOpen ? 1 : 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, sidebarOpen, slideX]);

  async function logout() {
    await clearSession();
    router.replace('/');
  }

  return (
    <View className="flex-1 bg-[#f6f3ef]">
      <Animated.View
        pointerEvents={sidebarOpen ? 'auto' : 'none'}
        className="absolute inset-0 z-[90] bg-slate-950/50"
        style={{ opacity: backdropOpacity }}
      >
        <Pressable className="h-full w-full" onPress={() => setSidebarOpen(false)} />
      </Animated.View>

      <Sidebar
        activeRoute={activeRoute}
        currentPathRole={currentPathRole}
        navItems={sidebarRoutes}
        onClose={() => setSidebarOpen(false)}
        slideX={slideX}
        topInset={insets.top}
        user={user}
      />

      <View className="flex-1">
        <Topbar
          activeRoute={activeRoute}
          currentPathRole={currentPathRole}
          onLogout={logout}
          onMenuPress={() => setSidebarOpen(true)}
          topInset={insets.top}
          unreadCount={unreadCount}
        />
        <ScrollView contentContainerClassName="gap-3.5 px-4 pt-4 pb-9">
          <FeatureScreen route={activeRoute} token={token} user={user} />
        </ScrollView>
      </View>
    </View>
  );
}

function Sidebar({ activeRoute, currentPathRole, navItems, onClose, slideX, topInset, user }: { activeRoute: MobileRoute; currentPathRole: string; navItems: MobileRoute[]; onClose: () => void; slideX: Animated.Value; topInset: number; user: User }) {
  function navigate(path: string) {
    onClose();
    router.replace(path as never);
  }

  return (
    <Animated.View
      className="absolute bottom-0 left-0 top-0 z-[100] w-[286px] bg-[#982a32] px-[31px] pb-7"
      style={{ paddingTop: Math.max(26, topInset + 18), transform: [{ translateX: slideX }] }}
    >
      <Pressable onPress={() => navigate(`/(dashboard)/${currentPathRole}/about`)} className="mb-7 flex-row items-center gap-3 active:opacity-70">
          <Image source={citLogo} className="h-[52px] w-[52px] rounded-full bg-white" resizeMode="contain" />
          <View>
            <Text className="text-xl font-black leading-6 text-white">NurseTrack</Text>
            <Text className="mt-0.5 text-xs font-extrabold text-white/75">CIT-U Nursing</Text>
          </View>
      </Pressable>

      <View className="mb-7 min-h-[38px] items-center justify-center rounded-lg bg-citGold shadow-sm">
        <Text className="text-[13px] font-black text-[#332800]">Admin</Text>
      </View>

      <View className="min-h-0 flex-1 flex-row">
        <ScrollView className="flex-1" contentContainerClassName="gap-4 pb-4">
          {navItems.map((item) => {
            const active = item.key === activeRoute.key;
            return (
              <Pressable key={item.key} onPress={() => navigate(`/(dashboard)/${currentPathRole}/${item.key}`)} className={`w-full flex-row flex-nowrap items-center gap-3 rounded-lg py-1.5 pr-2 active:opacity-70 ${active ? 'border-l-4 border-citGold bg-white/20 pl-2' : 'pl-3'}`}>
                  <View className={`h-[30px] w-[30px] flex-none items-center justify-center rounded-lg border ${active ? 'border-citGold bg-citGold' : 'border-white/20 bg-white/5'}`}>
                    <NavIcon routeKey={item.key} active={active} />
                  </View>
                  <Text numberOfLines={1} className="flex-1 text-[14px] font-black text-white/95">
                    {item.label}
                  </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View className="ml-2 w-1 rounded-full bg-citGold" />
      </View>

      <Pressable onPress={() => navigate(`/(dashboard)/${currentPathRole}/profile`)} className="mt-6 flex-row items-center gap-3 rounded-lg border border-white/20 bg-white/10 p-3 active:opacity-70">
          <View className="h-[42px] w-[42px] items-center justify-center rounded-full bg-citGold">
            <Text className="text-xs font-black text-[#332800]">{initials(user.fullName)}</Text>
          </View>
          <View className="min-w-0 flex-1">
            <Text numberOfLines={1} className="text-[15px] font-black text-white">{user.fullName}</Text>
            <Text numberOfLines={1} className="mt-0.5 text-xs font-extrabold text-white/75">Admin</Text>
          </View>
      </Pressable>
    </Animated.View>
  );
}

function Topbar({ activeRoute, currentPathRole, onLogout, onMenuPress, topInset, unreadCount }: { activeRoute: MobileRoute; currentPathRole: string; onLogout: () => void; onMenuPress: () => void; topInset: number; unreadCount: number }) {
  function navigate(path: string) {
    router.replace(path as never);
  }

  return (
    <View className="flex-row items-center justify-between border-b border-[#e5eaf1] bg-white/95 px-2 pb-2" style={{ paddingTop: Math.max(8, topInset + 8), minHeight: 64 }}>
      <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
        <Pressable onPress={onMenuPress} className="h-[38px] w-[38px] items-center justify-center rounded-lg border border-[#dbe3ee] bg-white active:opacity-70">
          <Feather name="menu" size={20} color="#344054" />
        </Pressable>
        <Image source={citLogo} className="h-7 w-7" resizeMode="contain" />
        <View className="min-w-0 flex-1">
          <Text numberOfLines={1} className="text-[10px] font-black uppercase tracking-wide text-slate-500">Admin</Text>
          <Text numberOfLines={1} className="text-base font-black text-slate-900">{activeRoute.label}</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-1">
        <Pressable onPress={() => navigate(`/(dashboard)/${currentPathRole}/notifications`)} className={`h-[38px] w-[38px] items-center justify-center rounded-lg border active:opacity-70 ${activeRoute.key === 'notifications' ? 'border-maroon bg-maroon' : 'border-[#dbe3ee] bg-white'}`}>
            <Feather name="bell" size={20} color={activeRoute.key === 'notifications' ? '#ffffff' : '#344054'} />
            {unreadCount > 0 ? <View className="absolute -right-1.5 -top-1.5 h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-red-600 px-1"><Text className="text-[9px] font-black text-white">{unreadCount > 99 ? '99+' : unreadCount}</Text></View> : null}
        </Pressable>
        <Pressable onPress={() => navigate(`/(dashboard)/${currentPathRole}/profile`)} className={`h-[38px] w-[38px] items-center justify-center rounded-lg border active:opacity-70 ${activeRoute.key.startsWith('profile') ? 'border-maroon bg-maroon' : 'border-[#dbe3ee] bg-white'}`}>
            <Feather name="user" size={20} color={activeRoute.key.startsWith('profile') ? '#ffffff' : '#344054'} />
        </Pressable>
        <Pressable onPress={onLogout} className="h-[38px] w-[38px] items-center justify-center rounded-lg border border-[#dbe3ee] bg-white active:opacity-70">
          <Feather name="log-out" size={20} color="#344054" />
        </Pressable>
      </View>
    </View>
  );
}

function NavIcon({ active, routeKey }: { active: boolean; routeKey: string }) {
  return <Feather name={iconForRoute(routeKey)} size={18} color={active ? '#4c1118' : 'rgba(255,255,255,0.88)'} />;
}

function iconForRoute(routeKey: string): FeatherIconName {
  if (routeKey === 'dashboard') return 'grid';
  if (routeKey === 'manage-users') return 'users';
  if (routeKey === 'manage-access') return 'user-plus';
  if (routeKey === 'section-import') return 'file-plus';
  if (routeKey === 'hospitals') return 'home';
  if (routeKey.startsWith('schedules')) return 'calendar';
  if (routeKey === 'live-attendance') return 'radio';
  if (routeKey.startsWith('manual-backup')) return 'rotate-ccw';
  if (routeKey.startsWith('student-progress')) return 'trending-up';
  if (routeKey.startsWith('extension-days')) return 'calendar';
  if (routeKey.startsWith('clearance')) return 'shield';
  if (routeKey.startsWith('clinical-cases')) return 'clipboard';
  if (routeKey.startsWith('ci-recommendations')) return 'message-square';
  if (routeKey.startsWith('overtime-details')) return 'clock';
  if (routeKey === 'reports') return 'bar-chart-2';
  if (routeKey === 'audit-logs') return 'file-text';
  return 'circle';
}

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
}
