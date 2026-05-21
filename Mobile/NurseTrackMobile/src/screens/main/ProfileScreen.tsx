import React, { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  Image,
  Clipboard,
  TextInput,
  Modal
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/axiosConfig';
import { SkeletonPage } from '../../components/Skeleton';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Copy, 
  Edit3, 
  Shield, 
  Award,
  Clock,
  CheckCircle2,
  RefreshCw,
  Camera
} from 'lucide-react-native';

export const ProfileScreen = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(user);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || '',
    mobileNumber: user?.mobileNumber || '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/users/me');
      setProfileData(response.data);
    } catch (e) {
      console.log('Failed to fetch live profile from backend, using auth context instead', e);
      setProfileData(user);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await api.get('/users/me');
      setProfileData(response.data);
    } catch (e) {
      console.log('Refresh failed', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopyId = () => {
    if (profileData?.schoolId) {
      Clipboard.setString(profileData.schoolId);
      Alert.alert('Success', 'School ID copied to clipboard!');
    }
  };

  const handleEditProfile = () => {
    setEditForm({
      fullName: profileData?.fullName || '',
      mobileNumber: profileData?.mobileNumber || '',
    });
    setIsEditModalVisible(true);
  };

  const handlePickProfileImage = async () => {
    if (!profileData || isUploadingPhoto) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Allow photo access to choose a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]?.uri) return;

    const asset = result.assets[0];
    const formData = new FormData();
    formData.append('file', {
      uri: asset.uri,
      name: asset.fileName || `profile-${Date.now()}.jpg`,
      type: asset.mimeType || 'image/jpeg',
    } as any);

    setIsUploadingPhoto(true);
    try {
      const uploadResponse = await api.post('/uploads/cloudinary', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const nextUrl = uploadResponse.data?.secure_url || uploadResponse.data?.url || '';
      if (!nextUrl) throw new Error('Missing uploaded image URL');

      const response = await api.put(`/users/${profileData.id}`, { profileImageUrl: nextUrl });
      setProfileData(response.data);
    } catch (e) {
      console.log('Profile photo upload failed', e);
      Alert.alert('Upload Failed', 'Could not update your profile picture right now.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileData) return;

    const updates = {
      fullName: editForm.fullName.trim(),
      mobileNumber: editForm.mobileNumber.trim(),
    };

    if (!updates.fullName || !updates.mobileNumber) {
      Alert.alert('Incomplete Profile', 'Please fill in your name and mobile number.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const response = await api.put(`/users/${profileData.id}`, updates);
      setProfileData(response.data);
      setIsEditModalVisible(false);
    } catch (e) {
      console.log('Profile update failed', e);
      Alert.alert('Update Failed', 'Could not save your profile changes right now.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const getRoleLabel = () => {
    if (profileData?.role === 'STUDENT') return 'Nursing Student';
    return 'Clinical Instructor';
  };

  if (isLoading && !profileData) {
    return <SkeletonPage variant="profile" />;
  }

  const initials = profileData?.fullName
    ? profileData.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'YN';

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Banner & Profile Header Card */}
      <View style={styles.profileHeaderCard}>
        {/* Banner with CIT-U Branding */}
        <View style={styles.bannerBackground}>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <RefreshCw color="#FFFFFF" size={18} />
            )}
          </TouchableOpacity>
        </View>

        {/* Profile Avatar & Primary Info */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarBorder}>
            {profileData?.profileImageUrl ? (
              <Image source={{ uri: profileData.profileImageUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.initialsAvatar}>
                <Text style={styles.initialsText}>{initials}</Text>
              </View>
            )}
            <View style={styles.statusIndicator} />
            <TouchableOpacity
              style={styles.uploadPhotoButton}
              onPress={handlePickProfileImage}
              disabled={isUploadingPhoto}
              accessibilityRole="button"
              accessibilityLabel="Upload profile picture"
            >
              {isUploadingPhoto ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Camera color="#FFFFFF" size={15} />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{profileData?.fullName || 'Jay Yan C. Tiongzon'}</Text>
          <Text style={styles.userSubText}>{profileData?.email || 'jay.tiongzon@cit.edu'}</Text>

          {/* Role Pill */}
          <View style={styles.pillsRow}>
            <View style={styles.rolePill}>
              <Award color="#8A252C" size={14} style={{ marginRight: 4 }} />
              <Text style={styles.rolePillText}>{getRoleLabel()}</Text>
            </View>
          </View>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.primaryActionBtn} onPress={handleCopyId}>
            <Copy color="#8A252C" size={16} style={{ marginRight: 6 }} />
            <Text style={styles.primaryActionBtnText}>Copy ID</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryActionBtn} onPress={handleEditProfile}>
            <Edit3 color="#475467" size={16} style={{ marginRight: 6 }} />
            <Text style={styles.secondaryActionBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Details Cards */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionCardHeader}>
          <UserIcon color="#8A252C" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.sectionCardTitle}>Personal Information</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconBg}>
            <UserIcon color="#475467" size={18} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{profileData?.fullName || 'Jay Yan C. Tiongzon'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconBg}>
            <Award color="#475467" size={18} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>School ID Number</Text>
            <Text style={styles.infoValue}>{profileData?.schoolId || '2021-12345'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconBg}>
            <Mail color="#475467" size={18} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>School Email Address</Text>
            <Text style={styles.infoValue}>{profileData?.email || 'jay.tiongzon@cit.edu'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconBg}>
            <Phone color="#475467" size={18} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Mobile Contact Number</Text>
            <Text style={styles.infoValue}>{profileData?.mobileNumber || '+63 912 345 6789'}</Text>
          </View>
        </View>
      </View>

      {/* Academic Status Card */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionCardHeader}>
          <Shield color="#8A252C" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.sectionCardTitle}>Academic & Account Status</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconBg}>
            <Award color="#475467" size={18} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Assigned Role</Text>
            <Text style={styles.infoValue}>{getRoleLabel()}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconBg}>
            <Clock color="#475467" size={18} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Last login</Text>
            <Text style={styles.infoValue}>May 21, 2026 at 11:10 PM</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconBg}>
            <CheckCircle2 color="#475467" size={18} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Authentication Status</Text>
            <Text style={[styles.infoValue, { color: '#10B981' }]}>Authorized & Encrypted</Text>
          </View>
        </View>
      </View>

      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.editModalOverlay}>
          <View style={styles.editModalCard}>
            <Text style={styles.editModalTitle}>Edit Profile</Text>
            <Text style={styles.editModalSubtitle}>Update the contact details shown in your mobile profile.</Text>

            <Text style={styles.editInputLabel}>Full Name</Text>
            <TextInput
              style={styles.editInput}
              value={editForm.fullName}
              onChangeText={(fullName) => setEditForm(prev => ({ ...prev, fullName }))}
              placeholder="Full name"
              placeholderTextColor="#98A2B3"
            />

            <Text style={styles.editInputLabel}>School Email</Text>
            <TextInput
              style={[styles.editInput, styles.editInputDisabled]}
              value={profileData?.email || ''}
              placeholder="School email"
              placeholderTextColor="#98A2B3"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
            />

            <Text style={styles.editInputLabel}>Mobile Number</Text>
            <TextInput
              style={styles.editInput}
              value={editForm.mobileNumber}
              onChangeText={(mobileNumber) => setEditForm(prev => ({ ...prev, mobileNumber }))}
              placeholder="Mobile number"
              placeholderTextColor="#98A2B3"
              keyboardType="phone-pad"
            />

            <View style={styles.editActionsRow}>
              <TouchableOpacity
                style={styles.editCancelBtn}
                onPress={() => setIsEditModalVisible(false)}
                disabled={isSavingProfile}
              >
                <Text style={styles.editCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editSaveBtn}
                onPress={handleSaveProfile}
                disabled={isSavingProfile}
              >
                {isSavingProfile ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.editSaveBtnText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#8A252C',
    fontSize: 14,
    fontWeight: '700',
  },
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 20,
  },
  bannerBackground: {
    height: 110,
    backgroundColor: '#8A252C',
    position: 'relative',
  },
  refreshButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshingSpin: {
    transform: [{ rotate: '45deg' }],
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: -55,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  avatarBorder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFFFFF',
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    position: 'relative',
    marginBottom: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  initialsAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: '#111827',
    fontSize: 34,
    fontWeight: '900',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  uploadPhotoButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#8A252C',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  userSubText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(138, 37, 44, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 99,
  },
  rolePillText: {
    color: '#8A252C',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionPill: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 99,
  },
  sectionPillText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 16,
    backgroundColor: '#FAFBFB',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  primaryActionBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#8A252C',
    backgroundColor: 'rgba(138, 37, 44, 0.05)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryActionBtnText: {
    color: '#8A252C',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryActionBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryActionBtnText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '800',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 16,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 10,
  },
  sectionCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  infoIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
  },
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  editModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  editModalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 18,
  },
  editInputLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '800',
    marginBottom: 6,
  },
  editInput: {
    height: 46,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 14,
    backgroundColor: '#FAFBFB',
  },
  editInputDisabled: {
    color: '#64748B',
    backgroundColor: '#F3F4F6',
  },
  editActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  editCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  editCancelBtnText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '800',
  },
  editSaveBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8A252C',
  },
  editSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
