import React from 'react';
import { Modal, ScrollView, Text, View } from 'react-native';

import { Field, FilterChip, ModalActions, ModalHeader } from '../../shared/components';
import { manageUserRoles, withoutLetters } from '../helpers';

export function AddUserModal({ open, user, setUser, onClose, onSubmit }: { open: boolean; user: Record<string, string>; setUser: React.Dispatch<React.SetStateAction<{ fullName: string; email: string; role: string; schoolId: string; sectionInfo: string; groupInfo: string; assignedLevels: string; mobileNumber: string; password: string }>>; onClose: () => void; onSubmit: () => void }) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-center bg-slate-950/50 p-4">
        <View className="max-h-[88%] overflow-hidden rounded-lg bg-white shadow-lg">
          <ModalHeader eyebrow="Add User" title="Create Account" onClose={onClose} />
          <ScrollView contentContainerClassName="gap-4 p-5">
            <Field label="Full name" value={user.fullName} onChangeText={(fullName) => setUser((current) => ({ ...current, fullName }))} placeholder="Enter full name" />
            <Field label="School email" value={user.email} onChangeText={(email) => setUser((current) => ({ ...current, email }))} placeholder="name@cit.edu" autoCapitalize="none" />
            <Text className="text-sm font-bold text-[#344054]">Role</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
              {manageUserRoles.map((role) => <FilterChip key={role.value} label={role.label} active={user.role === role.value} onPress={() => setUser((current) => ({ ...current, role: role.value, assignedLevels: role.value === 'coordinator' ? '1,2,3,4' : current.assignedLevels || '1' }))} />)}
            </ScrollView>
            <Field label="ID" value={user.schoolId} onChangeText={(schoolId) => setUser((current) => ({ ...current, schoolId: withoutLetters(schoolId) }))} placeholder="Student ID or staff ID" keyboardType="number-pad" />
            <Field label="Section" value={user.sectionInfo} onChangeText={(sectionInfo) => setUser((current) => ({ ...current, sectionInfo }))} placeholder="BSN 3A or department" />
            <Field label="Group" value={user.groupInfo} onChangeText={(groupInfo) => setUser((current) => ({ ...current, groupInfo }))} placeholder="G1" />
            <Field label="Assigned levels" value={user.assignedLevels} onChangeText={(assignedLevels) => setUser((current) => ({ ...current, assignedLevels }))} editable={user.role !== 'coordinator'} placeholder="1 or 1,2" />
            <Field label="Mobile number" value={user.mobileNumber} onChangeText={(mobileNumber) => setUser((current) => ({ ...current, mobileNumber: withoutLetters(mobileNumber) }))} placeholder="Optional" keyboardType="phone-pad" />
            <Field label="Initial password" value={user.password} onChangeText={(password) => setUser((current) => ({ ...current, password }))} placeholder="Defaults to ID" />
            <View className="rounded-lg border border-[#dbe3ee] bg-[#f0f3f8] px-4 py-3"><Text className="text-sm font-bold leading-5 text-[#4c5d7d]">Create a user account with the selected role and access details.</Text></View>
          </ScrollView>
          <ModalActions primary="Add User" secondary="Cancel" onPrimary={onSubmit} onSecondary={onClose} />
        </View>
      </View>
    </Modal>
  );
}
