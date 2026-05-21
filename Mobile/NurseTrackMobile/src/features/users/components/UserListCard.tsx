import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { DisplayUser } from '../../shared/types';
import { FilterChip, InfoStrip, ProfileAvatar, StatusBadge } from '../../shared/components';

export function UserListCard({ user, onPress }: { user: DisplayUser; onPress: () => void }) {
  return (
    <View className="gap-3 rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
      <View className="flex-row items-start gap-3">
        <View className="min-w-0 flex-1 flex-row items-center gap-3 pr-2">
          <ProfileAvatar name={user.name} imageUrl={user.profileImageUrl} />
          <View className="min-w-0 flex-1">
            <Text numberOfLines={1} className="text-[15px] font-bold text-[#111827]">{user.name}</Text>
            <Text numberOfLines={1} className="mt-0.5 text-[12px] font-medium text-[#64748b]">{user.email}</Text>
          </View>
        </View>
        <Pressable onPress={onPress} className="h-10 w-10 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white active:bg-[#f8fafc]">
          <Feather name="more-horizontal" size={20} color="#64748b" />
        </Pressable>
      </View>
      <InfoStrip label="Role" value={user.role} />
      <View className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2">
        <Text className="text-[10px] font-black uppercase tracking-wide text-[#64748b]">ID / Section</Text>
        <Text className="mt-1 text-[14px] font-bold text-[#111827]">{user.id}</Text>
        {user.section ? <Text className="mt-0.5 text-[12px] font-medium text-[#64748b]">{user.section}</Text> : null}
        {user.group ? <Text className="mt-0.5 text-[12px] font-medium text-[#64748b]">Group: {user.group}</Text> : null}
      </View>
      <InfoStrip label="Level" value={user.level} />
      <View className="flex-row items-center justify-between gap-3 rounded-lg border border-[#e2e8f0] bg-white px-3 py-2">
        <Text className="text-[10px] font-black uppercase tracking-wide text-[#64748b]">Status</Text>
        <StatusBadge status={user.status} />
      </View>
    </View>
  );
}
