import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity, 
  TextInput, 
  Modal,
  DeviceEventEmitter
} from 'react-native';
import { api } from '../../api/axiosConfig';
import { 
  ChevronDown, 
  RefreshCw, 
  Inbox, 
  Bell, 
  Calendar, 
  CheckCircle2, 
  MessageSquare, 
  CheckSquare,
  Search
} from 'lucide-react-native';

interface NotificationData {
  id: number;
  title: string;
  message: string;
  type: 'SCHEDULE' | 'DUTY_VERIFICATION' | 'APPEAL' | 'SYSTEM' | 'GENERAL';
  isRead: boolean;
  read?: boolean;
  createdAt: string;
}

const normalizeNotification = (notification: NotificationData): NotificationData => ({
  ...notification,
  isRead: notification.isRead ?? notification.read ?? false,
});

export const NotificationScreen = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [markingReadIds, setMarkingReadIds] = useState<Set<number>>(new Set());

  // Filters State
  const [selectedType, setSelectedType] = useState<'ALL' | 'SCHEDULE' | 'DUTY_VERIFICATION' | 'APPEAL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'READ' | 'UNREAD'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown Picker Modals
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<NotificationData[]>('/notifications/me');
      setNotifications(response.data.map(normalizeNotification));
    } catch (e) {
      console.log('Failed to fetch notifications from backend', e);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    setIsRefreshing(false);
    DeviceEventEmitter.emit('notifications:changed');
  };

  const markAllAsRead = async () => {
    setIsMarkingAllRead(true);
    try {
      await api.put('/notifications/me/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
      DeviceEventEmitter.emit('notifications:changed');
    } catch (e) {
      console.log('Failed to mark all as read on backend', e);
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const markAsRead = async (id: number) => {
    setMarkingReadIds(prev => new Set(prev).add(id));
    try {
      const response = await api.put<NotificationData>(`/notifications/${id}/read`);
      const updatedNotification = normalizeNotification(response.data);
      setNotifications(prev => prev.map(n => n.id === id ? updatedNotification : n));
      DeviceEventEmitter.emit('notifications:changed');
    } catch (e) {
      console.log(`Failed to mark notification ${id} as read on backend`, e);
    } finally {
      setMarkingReadIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Filter Logic
  const filteredNotifications = notifications.filter(item => {
    const matchesType = selectedType === 'ALL' || item.type === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || 
      (selectedStatus === 'READ' ? item.isRead : !item.isRead);
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const getDropdownLabel = (type: 'ALL' | 'SCHEDULE' | 'DUTY_VERIFICATION' | 'APPEAL') => {
    switch (type) {
      case 'SCHEDULE': return 'Schedule Updates';
      case 'DUTY_VERIFICATION': return 'Duty Verifications';
      case 'APPEAL': return 'Appeals';
      default: return 'All Types';
    }
  };

  const getStatusLabel = (status: 'ALL' | 'READ' | 'UNREAD') => {
    switch (status) {
      case 'READ': return 'Read Only';
      case 'UNREAD': return 'Unread Only';
      default: return 'All Statuses';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'DUTY_VERIFICATION':
        return <CheckCircle2 color="#10B981" size={20} />;
      case 'SCHEDULE':
        return <Calendar color="#3B82F6" size={20} />;
      case 'APPEAL':
        return <MessageSquare color="#F59E0B" size={20} />;
      default:
        return <Bell color="#8A252C" size={20} />;
    }
  };

  const getNotificationIconBg = (type: string) => {
    switch (type) {
      case 'DUTY_VERIFICATION':
        return 'rgba(16, 185, 129, 0.1)';
      case 'SCHEDULE':
        return 'rgba(59, 130, 246, 0.1)';
      case 'APPEAL':
        return 'rgba(245, 158, 11, 0.1)';
      default:
        return 'rgba(138, 37, 44, 0.1)';
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diffMs / (1000 * 60));
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      return `${days}d ago`;
    } catch {
      return '';
    }
  };

  if (isLoading && notifications.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8A252C" />
      </View>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <View style={styles.container}>
      {/* Filters & Control Panel at top */}
      <View style={styles.controlPanelCard}>
        <View style={styles.panelHeaderRow}>
          <View>
            <Text style={styles.panelKicker}>CIT-U ACADEMIC INBOX</Text>
            <Text style={styles.panelTitle}>Recent Notifications</Text>
          </View>
          {unreadCount > 0 && (
            <View style={styles.unreadBadgeCount}>
              <Text style={styles.unreadBadgeCountText}>{unreadCount} New</Text>
            </View>
          )}
        </View>

        {/* Action Buttons Row */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={[styles.primaryActionBtn, isMarkingAllRead && styles.actionBtnDisabled]} onPress={markAllAsRead} disabled={isMarkingAllRead || unreadCount === 0}>
            {isMarkingAllRead ? (
              <ActivityIndicator size="small" color="#8A252C" />
            ) : (
              <>
                <CheckSquare color="#8A252C" size={16} style={{ marginRight: 6 }} />
                <Text style={styles.primaryActionBtnText}>Mark all read</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryActionBtn} onPress={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <ActivityIndicator size="small" color="#475467" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <RefreshCw color="#475467" size={16} style={{ marginRight: 6 }} />
                <Text style={styles.secondaryActionBtnText}>Refresh</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Filter Expanders Row */}
        <View style={styles.filtersWrapper}>
          <View style={styles.filterBox}>
            <TouchableOpacity 
              style={styles.dropdownSelector} 
              onPress={() => setTypeModalVisible(true)}
            >
              <Text style={styles.dropdownValue} numberOfLines={1}>
                {getDropdownLabel(selectedType)}
              </Text>
              <ChevronDown color="#6B7280" size={16} />
            </TouchableOpacity>
          </View>

          <View style={styles.filterBox}>
            <TouchableOpacity 
              style={styles.dropdownSelector} 
              onPress={() => setStatusModalVisible(true)}
            >
              <Text style={styles.dropdownValue} numberOfLines={1}>
                {getStatusLabel(selectedStatus)}
              </Text>
              <ChevronDown color="#6B7280" size={16} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar inside control panel */}
        <View style={styles.searchContainer}>
          <Search color="#98A2B3" size={18} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search keywords or teacher name..."
            placeholderTextColor="#98A2B3"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Notifications List */}
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <Inbox color="#98A2B3" size={48} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>Your inbox is clean</Text>
            <Text style={styles.emptySubtitle}>No notifications found matching your filter criteria.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredNotifications.map((item) => (
              <View 
                key={item.id} 
                style={[
                  styles.notificationCard,
                  !item.isRead && styles.unreadCard
                ]}
              >
                {/* Left Side Icon */}
                <View style={[styles.iconBg, { backgroundColor: getNotificationIconBg(item.type) }]}>
                  {getNotificationIcon(item.type)}
                </View>

                {/* Content details */}
                <View style={styles.cardContent}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.timeText}>{formatTimeAgo(item.createdAt)}</Text>
                  </View>
                  
                  <Text style={styles.messageText}>{item.message}</Text>

                  {!item.isRead && (
                    <TouchableOpacity 
                      style={[styles.cardMarkReadBtn, markingReadIds.has(item.id) && styles.cardMarkReadBtnDisabled]} 
                      onPress={() => markAsRead(item.id)}
                      disabled={markingReadIds.has(item.id)}
                    >
                      {markingReadIds.has(item.id) ? (
                        <ActivityIndicator size="small" color="#8A252C" />
                      ) : (
                        <Text style={styles.cardMarkReadBtnText}>Mark as read</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Type Dropdown Modal */}
      <Modal
        visible={typeModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setTypeModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setTypeModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Notification Type</Text>
            
            {(['ALL', 'DUTY_VERIFICATION', 'SCHEDULE', 'APPEAL'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.modalOption,
                  selectedType === type && styles.modalOptionSelected
                ]}
                onPress={() => {
                  setSelectedType(type);
                  setTypeModalVisible(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  selectedType === type && styles.modalOptionTextSelected
                ]}>
                  {getDropdownLabel(type)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Status Dropdown Modal */}
      <Modal
        visible={statusModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setStatusModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by Status</Text>
            
            {(['ALL', 'UNREAD', 'READ'] as const).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.modalOption,
                  selectedStatus === status && styles.modalOptionSelected
                ]}
                onPress={() => {
                  setSelectedStatus(status);
                  setStatusModalVisible(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  selectedStatus === status && styles.modalOptionTextSelected
                ]}>
                  {getStatusLabel(status)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
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
  controlPanelCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    zIndex: 10,
  },
  panelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  panelKicker: {
    color: '#8A252C',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  unreadBadgeCount: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  unreadBadgeCountText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  primaryActionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#8A252C',
    backgroundColor: 'rgba(138, 37, 44, 0.04)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryActionBtnText: {
    color: '#8A252C',
    fontSize: 13,
    fontWeight: '800',
  },
  actionBtnDisabled: {
    opacity: 0.65,
  },
  secondaryActionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryActionBtnText: {
    color: '#475467',
    fontSize: 13,
    fontWeight: '800',
  },
  filtersWrapper: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  filterBox: {
    flex: 1,
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 38,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FAFBFB',
  },
  dropdownValue: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    marginRight: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FAFBFB',
  },
  searchInput: {
    flex: 1,
    color: '#1F2937',
    fontSize: 13,
    fontWeight: '700',
    padding: 0,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  listContainer: {
    gap: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1.5,
    alignItems: 'flex-start',
  },
  unreadCard: {
    backgroundColor: '#FFFDFD',
    borderLeftWidth: 4,
    borderLeftColor: '#8A252C',
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 8,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
  },
  timeText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  messageText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardMarkReadBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#8A252C',
    backgroundColor: '#FFFFFF',
    minHeight: 28,
    minWidth: 92,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardMarkReadBtnDisabled: {
    opacity: 0.75,
  },
  cardMarkReadBtnText: {
    color: '#8A252C',
    fontSize: 11,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalOption: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  modalOptionSelected: {
    backgroundColor: 'rgba(138, 37, 44, 0.05)',
    borderColor: '#8A252C',
  },
  modalOptionText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOptionTextSelected: {
    color: '#8A252C',
    fontWeight: '800',
  },
});
