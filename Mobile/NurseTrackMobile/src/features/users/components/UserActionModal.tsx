import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { DisplayUser } from '../../shared/types';
import { Field, FilterChip, ModalActions, ModalHeader, ProfileAvatar, StatusBadge } from '../../shared/components';
import { manageUserRoles, resetPasswordValue } from '../helpers';

export function UserActionModal(props: { selectedUser: DisplayUser | null; actionStep: 'menu' | 'edit' | 'status' | 'reset'; selectedAction: 'edit' | 'status' | 'reset'; editUser: { fullName: string; role: string; sectionInfo: string; groupInfo: string; assignedLevels: string }; nextStatus: string; setActionStep: (value: 'menu' | 'edit' | 'status' | 'reset') => void; setSelectedAction: (value: 'edit' | 'status' | 'reset') => void; setEditUser: React.Dispatch<React.SetStateAction<{ fullName: string; role: string; sectionInfo: string; groupInfo: string; assignedLevels: string }>>; setNextStatus: (value: string) => void; onClose: () => void; onEdit: () => void; onStatus: () => void; onReset: () => void }) {
  const { selectedUser, actionStep, selectedAction, editUser, nextStatus, setActionStep, setSelectedAction, setEditUser, setNextStatus, onClose, onEdit, onStatus, onReset } = props;
  if (!selectedUser) return null;
  const resetPassword = resetPasswordValue(selectedUser);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-center bg-slate-950/50 p-4">
        <View className="max-h-[88%] overflow-hidden rounded-lg bg-white shadow-lg">
          <ModalHeader eyebrow={actionStep === 'menu' ? undefined : actionStep === 'edit' ? 'Edit User' : actionStep === 'status' ? 'User Status' : 'Password Reset'} title={actionStep === 'menu' ? 'Review Account' : actionStep === 'edit' ? 'Update Account Details' : actionStep === 'status' ? 'Change User Status' : 'Confirm Password Reset'} onClose={onClose} onBack={actionStep === 'menu' ? undefined : () => setActionStep('menu')} />
          {actionStep === 'menu' ? <>
            <View className="gap-4 p-5">
              <Text className="text-[15px] font-bold leading-6 text-[#4c5d7d]">Choose one clear action for this account.</Text>
              <View className="gap-3 rounded-lg border border-[#dbe3ee] bg-[#f8fafc] p-4">
                <View className="flex-row items-center gap-3"><ProfileAvatar name={selectedUser.name} imageUrl={selectedUser.profileImageUrl} /><View className="min-w-0 flex-1"><Text numberOfLines={1} className="text-base font-extrabold text-[#111827]">{selectedUser.name}</Text><Text className="mt-1 text-[12px] font-extrabold leading-5 text-[#667085]">{selectedUser.id}{selectedUser.section ? ` - ${selectedUser.section}` : ''}{selectedUser.group ? ` ${selectedUser.group}` : ''} - {selectedUser.email}</Text></View></View>
                <StatusBadge status={selectedUser.status} />
              </View>
              {(['edit', 'status', 'reset'] as const).map((action) => <Pressable key={action} onPress={() => setSelectedAction(action)} className={`min-h-[50px] justify-center rounded-lg border px-4 ${selectedAction === action ? 'border-maroon bg-white' : 'border-[#e2e8f0] bg-white'}`}><Text className={`text-[15px] font-extrabold ${selectedAction === action ? 'text-maroon' : 'text-[#334155]'}`}>{action === 'edit' ? 'Edit User Details' : action === 'status' ? 'Change User Status' : 'Reset Password'}</Text></Pressable>)}
            </View>
            <ModalActions primary="Continue" secondary="Cancel" onPrimary={() => setActionStep(selectedAction)} onSecondary={onClose} />
          </> : null}
          {actionStep === 'edit' ? <>
            <ScrollView contentContainerClassName="gap-4 p-5">
              <Field label="Full name" value={editUser.fullName} onChangeText={(fullName) => setEditUser((current) => ({ ...current, fullName }))} />
              <Text className="text-sm font-bold text-[#344054]">Role</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">{manageUserRoles.map((role) => <FilterChip key={role.value} label={role.label} active={editUser.role === role.value} onPress={() => setEditUser((current) => ({ ...current, role: role.value, assignedLevels: role.value === 'coordinator' ? '1,2,3,4' : current.assignedLevels || '1' }))} />)}</ScrollView>
              <Field label="Section" value={editUser.sectionInfo} onChangeText={(sectionInfo) => setEditUser((current) => ({ ...current, sectionInfo }))} />
              <Field label="Group" value={editUser.groupInfo} onChangeText={(groupInfo) => setEditUser((current) => ({ ...current, groupInfo }))} />
              <Field label="Assigned levels" value={editUser.assignedLevels} onChangeText={(assignedLevels) => setEditUser((current) => ({ ...current, assignedLevels }))} editable={editUser.role !== 'coordinator'} />
              <View className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3"><Text className="text-[13px] font-bold leading-5 text-[#4c5d7d]">School email is kept unchanged for account traceability.</Text></View>
            </ScrollView>
            <ModalActions primary="Save Changes" secondary="Back" onPrimary={onEdit} onSecondary={() => setActionStep('menu')} />
          </> : null}
          {actionStep === 'status' ? <>
            <View className="gap-4 p-5">
              <View className="gap-2 rounded-lg border border-[#dbe3ee] bg-[#f8fafc] p-4"><Text className="text-xs font-extrabold uppercase tracking-wide text-[#4c5d7d]">Selected User</Text><Text className="text-[17px] font-bold text-[#111827]">{selectedUser.name}</Text></View>
              <Text className="text-sm font-bold text-[#344054]">New status</Text>
              <View className="flex-row flex-wrap gap-2">{['Active', 'Deactivated'].map((status) => <FilterChip key={status} label={status} active={nextStatus === status} onPress={() => setNextStatus(status)} />)}</View>
              <View className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3"><Text className="text-[13px] font-bold leading-5 text-[#4c5d7d]">Only the account status will be changed.</Text></View>
            </View>
            <ModalActions primary="Save Status" secondary="Back" onPrimary={onStatus} onSecondary={() => setActionStep('menu')} />
          </> : null}
          {actionStep === 'reset' ? <>
            <View className="p-5"><Text className="text-[15px] font-bold leading-6 text-[#4c5d7d]">Reset the password for <Text className="text-[#111827]">{selectedUser.name}</Text> to: <Text className="text-[#111827]">{resetPassword}</Text>.</Text></View>
            <ModalActions primary="Reset Password" secondary="Back" onPrimary={onReset} onSecondary={() => setActionStep('menu')} />
          </> : null}
        </View>
      </View>
    </Modal>
  );
}
