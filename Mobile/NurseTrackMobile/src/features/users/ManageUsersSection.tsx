import React, { useMemo, useState, useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { apiFetch } from '../../api';
import { DisplayUser, SectionProps } from '../shared/types';
import { Field, FilterChip, GhostButton, Skeleton } from '../shared/components';
import { normalizeRecords } from '../shared/helpers';

import { assignedLevelsForRole, manageUserRoles, resetPasswordValue, roleApi, sectionDefaults, statusApi, statusOptions, toDisplayUser, usersPerPage, withoutLetters } from './helpers';
import { UserListCard } from './components/UserListCard';
import { AddUserModal } from './components/AddUserModal';
import { UserActionModal } from './components/UserActionModal';

export function ManageUsersSection(props: SectionProps) {
  const { data, loading, token, refresh, setMessage } = props;
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DisplayUser | null>(null);
  const [actionStep, setActionStep] = useState<'menu' | 'edit' | 'status' | 'reset'>('menu');
  const [selectedAction, setSelectedAction] = useState<'edit' | 'status' | 'reset'>('edit');
  const [newUser, setNewUser] = useState({ fullName: '', email: '', role: 'student', schoolId: '', sectionInfo: '', groupInfo: '', assignedLevels: '1', mobileNumber: '', password: '' });
  const [editUser, setEditUser] = useState({ fullName: '', role: 'student', sectionInfo: '', groupInfo: '', assignedLevels: '1' });
  const [nextStatus, setNextStatus] = useState('Active');

  const users = useMemo(() => normalizeRecords(data).map(toDisplayUser), [data]);
  const sections = useMemo(() => Array.from(new Set([...sectionDefaults, ...users.map((user) => user.section).filter(Boolean)])).sort(), [users]);
  const filteredUsers = users.filter((user) => {
    const matchesRole = search || roleFilter === 'all' ? true : user.roleValue === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status.toLowerCase() === statusFilter;
    const matchesSection = sectionFilter === 'all' || user.section === sectionFilter;
    const matchesSearch = !search || [user.name, user.email, user.role, user.id, user.section, user.group, user.level, user.status].some((value) => value.toLowerCase().includes(search.toLowerCase()));
    return matchesRole && matchesStatus && matchesSection && matchesSearch;
  });
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));
  const pagedUsers = filteredUsers.slice((page - 1) * usersPerPage, page * usersPerPage);

  useEffect(() => {
    setPage((value) => Math.min(value, totalPages));
  }, [totalPages]);

  function resetFilters() {
    setRoleFilter('all');
    setStatusFilter('all');
    setSectionFilter('all');
    setSearch('');
    setPage(1);
  }

  function openUserActions(user: DisplayUser) {
    setSelectedUser(user);
    setActionStep('menu');
    setSelectedAction('edit');
    setEditUser({ fullName: user.name, role: user.roleValue, sectionInfo: user.section, groupInfo: user.group, assignedLevels: (user.roleValue === 'coordinator' ? [1, 2, 3, 4] : user.api.assignedLevels?.length ? user.api.assignedLevels : [1]).join(',') });
    setNextStatus(user.status === 'Pending' ? 'Active' : user.status);
  }

  function closeUserActions() {
    setSelectedUser(null);
    setActionStep('menu');
    setSelectedAction('edit');
  }

  async function submitNewUser() {
    if (!newUser.fullName || !newUser.schoolId || !newUser.email) {
      setMessage('Complete name, School ID, and email.');
      return;
    }
    try {
      await apiFetch('/users', { method: 'POST', token, body: JSON.stringify({ fullName: newUser.fullName, email: newUser.email, role: roleApi(newUser.role), schoolId: withoutLetters(newUser.schoolId), sectionInfo: newUser.sectionInfo, groupInfo: newUser.groupInfo, mobileNumber: withoutLetters(newUser.mobileNumber), assignedLevels: assignedLevelsForRole(newUser.role, newUser.assignedLevels), password: newUser.password || withoutLetters(newUser.schoolId), status: 'ACTIVE' }) });
      setNewUser({ fullName: '', email: '', role: 'student', schoolId: '', sectionInfo: '', groupInfo: '', assignedLevels: '1', mobileNumber: '', password: '' });
      setMessage('User account saved.');
      setAddOpen(false);
      refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The account could not be saved.');
    }
  }

  async function submitEditUser() {
    if (!selectedUser) return;
    try {
      await apiFetch(`/users/${selectedUser.api.id}`, { method: 'PUT', token, body: JSON.stringify({ fullName: editUser.fullName, role: roleApi(editUser.role), sectionInfo: editUser.sectionInfo, groupInfo: editUser.groupInfo, assignedLevels: assignedLevelsForRole(editUser.role, editUser.assignedLevels) }) });
      setMessage('User details updated.');
      closeUserActions();
      refresh();
    } catch {
      setMessage('Account details could not be saved.');
    }
  }

  async function submitStatusChange() {
    if (!selectedUser) return;
    try {
      await apiFetch(`/users/${selectedUser.api.id}`, { method: 'PUT', token, body: JSON.stringify({ status: statusApi(nextStatus) }) });
      setMessage('User status updated.');
      closeUserActions();
      refresh();
    } catch {
      setMessage('The account status could not be saved.');
    }
  }

  async function submitPasswordReset() {
    if (!selectedUser) return;
    const password = resetPasswordValue(selectedUser);
    try {
      await apiFetch(`/users/${selectedUser.api.id}/password/reset`, { method: 'PUT', token, body: JSON.stringify({ password }) });
      setMessage(`Password reset to ${password}.`);
      closeUserActions();
    } catch {
      setMessage('Password could not be reset.');
    }
  }

  return (
    <View className="gap-4">
      <View className="rounded-lg border border-[#e2e8f0] bg-white p-[23px] shadow-sm">
        <View className="mb-4 flex-row flex-wrap items-center justify-between gap-3 border-b border-[#e5eaf1] pb-4">
          <Text className="text-xl font-bold leading-6 text-[#111827]">User List</Text>
          <View className="flex-row flex-wrap items-center justify-end gap-3">
            <Pressable onPress={() => setAddOpen(true)} className="min-h-[38px] items-center justify-center rounded-lg border border-[#e2e8f0] bg-white px-4 active:bg-[#f8fafc]"><Text className="text-sm font-bold text-[#334155]">Add User</Text></Pressable>
            <View className="rounded-full bg-[#e9f8ef] px-[10px] py-[6px]"><Text className="text-[11px] font-extrabold text-[#078033]">{filteredUsers.length} visible</Text></View>
          </View>
        </View>

        <View className="mb-4 gap-3 rounded-lg border border-[#e5eaf1] bg-[#f8fafc] p-[15px]">
          <Text className="text-sm font-bold text-[#344054]">Role</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
            <FilterChip label="All roles" active={roleFilter === 'all'} onPress={() => { setRoleFilter('all'); setPage(1); }} />
            {manageUserRoles.map((role) => <FilterChip key={role.value} label={role.label} active={roleFilter === role.value} onPress={() => { setRoleFilter(role.value); setPage(1); }} />)}
          </ScrollView>
          <Text className="text-sm font-bold text-[#344054]">Status</Text>
          <View className="flex-row flex-wrap gap-2">{statusOptions.map((status) => <FilterChip key={status.value} label={status.label} active={statusFilter === status.value} onPress={() => { setStatusFilter(status.value); setPage(1); }} />)}</View>
          <Text className="text-sm font-bold text-[#344054]">Section</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
            <FilterChip label="All sections" active={sectionFilter === 'all'} onPress={() => { setSectionFilter('all'); setPage(1); }} />
            {sections.map((section) => <FilterChip key={section} label={section} active={sectionFilter === section} onPress={() => { setSectionFilter(section); setPage(1); }} />)}
          </ScrollView>
          <Field label="Search" value={search} onChangeText={(value) => { setSearch(value); setPage(1); }} placeholder="Search name, ID, email" autoCapitalize="none" />
          <GhostButton label="Reset Filters" onPress={resetFilters} />
        </View>

        <View className="overflow-hidden rounded-lg border border-[#e2e8f0] bg-white">
          {loading ? <View className="p-3"><Skeleton /></View> : pagedUsers.length ? <View className="gap-3 p-3">{pagedUsers.map((user) => <UserListCard key={user.api.id} user={user} onPress={() => openUserActions(user)} />)}</View> : <View className="min-h-[120px] items-center justify-center p-6"><Text className="font-medium text-gray-500">No matching users found.</Text></View>}
        </View>

        {totalPages > 1 ? <View className="flex-row items-center justify-between gap-2 rounded-b-lg border border-t-0 border-[#e2e8f0] bg-[#f8fafc] p-4">
          <Pressable disabled={page === 1} onPress={() => setPage((value) => Math.max(1, value - 1))} className="min-h-[38px] items-center justify-center rounded-lg border border-[#e2e8f0] bg-white px-4 disabled:opacity-50"><Text className="text-[13px] font-extrabold text-[#344054]">Previous</Text></Pressable>
          <Text className="text-sm font-semibold text-[#64748b]">{page} of {totalPages}</Text>
          <Pressable disabled={page === totalPages} onPress={() => setPage((value) => Math.min(totalPages, value + 1))} className="min-h-[38px] items-center justify-center rounded-lg border border-[#e2e8f0] bg-white px-4 disabled:opacity-50"><Text className="text-[13px] font-extrabold text-[#344054]">Next</Text></Pressable>
        </View> : null}
      </View>

      <AddUserModal open={addOpen} user={newUser} setUser={setNewUser} onClose={() => setAddOpen(false)} onSubmit={submitNewUser} />
      <UserActionModal selectedUser={selectedUser} actionStep={actionStep} selectedAction={selectedAction} editUser={editUser} nextStatus={nextStatus} setActionStep={setActionStep} setSelectedAction={setSelectedAction} setEditUser={setEditUser} setNextStatus={setNextStatus} onClose={closeUserActions} onEdit={submitEditUser} onStatus={submitStatusChange} onReset={submitPasswordReset} />
    </View>
  );
}
