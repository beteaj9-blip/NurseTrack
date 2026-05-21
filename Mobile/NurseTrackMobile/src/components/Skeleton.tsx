import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type SkeletonBlockProps = {
  width?: ViewStyle['width'];
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export const SkeletonBlock = ({ width = '100%', height = 14, radius = 8, style }: SkeletonBlockProps) => {
  const opacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 760, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.55, duration: 760, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return <Animated.View style={[styles.block, { width, height, borderRadius: radius, opacity }, style]} />;
};

const HeroSkeleton = ({ fullButton = false }: { fullButton?: boolean }) => (
  <View style={styles.heroCard}>
    <SkeletonBlock width={130} height={14} style={styles.maroonSoft} />
    <SkeletonBlock width="70%" height={30} radius={12} style={[styles.maroonSoft, styles.spaced]} />
    {fullButton && <SkeletonBlock width="100%" height={54} radius={14} style={[styles.goldSoft, styles.fullButtonGap]} />}
    <SkeletonBlock width="88%" height={14} style={[styles.maroonSoft, fullButton && styles.buttonTextGap]} />
    <SkeletonBlock width="74%" height={14} style={[styles.maroonSoft, styles.tight]} />
    {!fullButton && <SkeletonBlock width={164} height={48} radius={14} style={[styles.goldSoft, styles.buttonGap]} />}
  </View>
);

const CardSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <SkeletonBlock width={44} height={44} radius={14} />
      <View style={styles.headerLines}>
        <SkeletonBlock width="68%" height={16} />
        <SkeletonBlock width="44%" height={12} style={styles.tight} />
      </View>
    </View>
    {Array.from({ length: rows }).map((_, index) => (
      <SkeletonBlock key={index} width={index % 2 === 0 ? '100%' : '72%'} height={14} style={styles.rowGap} />
    ))}
  </View>
);

const ProfileInfoCardSkeleton = ({ rows }: { rows: number }) => (
  <View style={styles.profileSectionCard}>
    <View style={styles.profileSectionHeader}>
      <SkeletonBlock width={20} height={20} radius={10} style={styles.maroonLine} />
      <SkeletonBlock width="58%" height={15} radius={7} />
    </View>
    {Array.from({ length: rows }).map((_, index) => (
      <View key={`profile-row-${index}`} style={styles.profileInfoRow}>
        <SkeletonBlock width={36} height={36} radius={10} />
        <View style={styles.profileInfoContent}>
          <SkeletonBlock width="42%" height={11} radius={5} />
          <SkeletonBlock width={index % 2 === 0 ? '72%' : '54%'} height={14} radius={7} style={styles.tight} />
        </View>
      </View>
    ))}
  </View>
);

export const NotificationCardSkeleton = ({ unread = false }: { unread?: boolean }) => (
  <View style={[styles.notificationSkeletonCard, unread && styles.notificationUnreadSkeletonCard]}>
    <SkeletonBlock width={40} height={40} radius={12} style={styles.maroonLine} />
    <View style={styles.notificationSkeletonContent}>
      <View style={styles.notificationSkeletonHeader}>
        <SkeletonBlock width="62%" height={14} radius={7} />
        <SkeletonBlock width={38} height={11} radius={5} />
      </View>
      <SkeletonBlock width="96%" height={12} radius={6} style={styles.notificationLine} />
      <SkeletonBlock width="72%" height={12} radius={6} style={styles.notificationLine} />
      {unread && <SkeletonBlock width={92} height={28} radius={6} style={styles.notificationButtonLine} />}
    </View>
  </View>
);

export const SkeletonPage = ({ variant = 'default' }: { variant?: 'default' | 'calendar' | 'attendance' | 'profile' | 'notifications' }) => {
  if (variant === 'calendar') {
    return (
      <ScrollView style={styles.schedulePage} contentContainerStyle={styles.scheduleContent} showsVerticalScrollIndicator={false}>
        <View style={styles.scheduleTitleRow}>
          <View>
            <SkeletonBlock width={132} height={10} radius={5} style={styles.maroonLine} />
            <SkeletonBlock width={188} height={22} radius={8} style={styles.tight} />
          </View>
          <SkeletonBlock width={76} height={34} radius={10} />
        </View>

        <View style={styles.scheduleCalendarShell}>
          <View style={styles.scheduleCalendarHeaderRow}>
            <SkeletonBlock width="48%" height={20} radius={8} />
            <View style={styles.scheduleModeToggleGroup}>
              <SkeletonBlock width={90} height={38} radius={10} style={styles.maroonFill} />
              <SkeletonBlock width={66} height={38} radius={10} />
            </View>
          </View>

          <View style={styles.scheduleMonthControlsCard}>
            <SkeletonBlock width={36} height={36} radius={10} />
            <SkeletonBlock width={112} height={36} radius={10} />
            <SkeletonBlock width={36} height={36} radius={10} />
          </View>

          <View style={styles.scheduleCalendarGrid}>
            <View style={styles.scheduleWeekRow}>
              {Array.from({ length: 7 }).map((_, index) => <SkeletonBlock key={`weekday-${index}`} height={32} radius={9} style={styles.scheduleWeekDayCell} />)}
            </View>
            {Array.from({ length: 6 }).map((_, weekIndex) => (
              <View key={`week-${weekIndex}`} style={styles.scheduleWeekRow}>
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <View key={`day-${weekIndex}-${dayIndex}`} style={styles.scheduleDayCell}>
                    <SkeletonBlock width={22} height={22} radius={8} style={(weekIndex + dayIndex) % 5 === 0 ? styles.maroonPale : undefined} />
                    {(weekIndex + dayIndex) % 3 === 0 && <SkeletonBlock width="72%" height={8} radius={4} style={styles.scheduleCellLine} />}
                    {(weekIndex + dayIndex) % 3 === 0 && <SkeletonBlock width="56%" height={8} radius={4} style={styles.scheduleCellLine} />}
                  </View>
                ))}
              </View>
            ))}
          </View>

          <View style={styles.scheduleLegend}>
            <SkeletonBlock width={78} height={12} radius={6} />
            <SkeletonBlock width={82} height={12} radius={6} />
            <SkeletonBlock width={58} height={12} radius={6} />
          </View>
        </View>
      </ScrollView>
    );
  }

  if (variant === 'profile') {
    return (
      <ScrollView style={styles.profilePage} contentContainerStyle={styles.profileContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeaderCardSkeleton}>
          <View style={styles.profileBannerSkeleton}>
            <SkeletonBlock width={36} height={36} radius={18} style={styles.profileRefreshSkeleton} />
          </View>
          <View style={styles.profileAvatarSectionSkeleton}>
            <View style={styles.profileAvatarBorderSkeleton}>
              <SkeletonBlock width={100} height={100} radius={50} style={styles.goldSoft} />
              <SkeletonBlock width={18} height={18} radius={9} style={styles.profileStatusSkeleton} />
              <SkeletonBlock width={34} height={34} radius={17} style={styles.profileCameraSkeleton} />
            </View>
            <SkeletonBlock width="62%" height={22} radius={10} />
            <SkeletonBlock width="48%" height={14} radius={7} style={styles.profileEmailSkeleton} />
            <SkeletonBlock width={122} height={28} radius={99} style={[styles.maroonLine, styles.profilePillSkeleton]} />
          </View>
          <View style={styles.profileActionRowSkeleton}>
            <SkeletonBlock width="48%" height={46} radius={12} style={styles.maroonLine} />
            <SkeletonBlock width="48%" height={46} radius={12} />
          </View>
        </View>
        <ProfileInfoCardSkeleton rows={4} />
        <ProfileInfoCardSkeleton rows={3} />
      </ScrollView>
    );
  }

  if (variant === 'notifications') {
    return (
      <View style={styles.notificationPage}>
        <View style={styles.notificationControlPanelSkeleton}>
          <View style={styles.notificationPanelHeaderSkeleton}>
            <View>
              <SkeletonBlock width={136} height={10} radius={5} style={styles.maroonLine} />
              <SkeletonBlock width={178} height={20} radius={8} style={styles.tight} />
            </View>
            <SkeletonBlock width={66} height={28} radius={99} style={styles.notificationBadgeSkeleton} />
          </View>
          <View style={styles.notificationActionRowSkeleton}>
            <SkeletonBlock width="48%" height={40} radius={10} style={styles.maroonLine} />
            <SkeletonBlock width="48%" height={40} radius={10} />
          </View>
          <View style={styles.notificationFilterRowSkeleton}>
            <SkeletonBlock width="48%" height={38} radius={8} />
            <SkeletonBlock width="48%" height={38} radius={8} />
          </View>
          <SkeletonBlock width="100%" height={40} radius={10} />
        </View>
        <ScrollView style={styles.notificationScrollSkeleton} contentContainerStyle={styles.notificationContentSkeleton} showsVerticalScrollIndicator={false}>
          {Array.from({ length: 5 }).map((_, index) => <NotificationCardSkeleton key={`notification-skeleton-${index}`} unread={index < 2} />)}
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <HeroSkeleton fullButton={variant === 'attendance'} />
      <CardSkeleton rows={3} />
      <CardSkeleton rows={3} />
      {variant === 'attendance' && <CardSkeleton rows={4} />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#EEF2F7',
  },
  content: {
    paddingBottom: 32,
  },
  block: {
    backgroundColor: '#DDE4EE',
  },
  maroonSoft: {
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
  },
  maroonLine: {
    backgroundColor: 'rgba(138, 37, 44, 0.24)',
  },
  maroonFill: {
    backgroundColor: '#8A252C',
  },
  maroonPale: {
    backgroundColor: '#F8E8B5',
  },
  goldSoft: {
    backgroundColor: 'rgba(255, 207, 1, 0.68)',
  },
  heroCard: {
    minHeight: 250,
    backgroundColor: '#8A252C',
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 24,
  },
  spaced: {
    marginTop: 14,
    marginBottom: 18,
  },
  tight: {
    marginTop: 8,
  },
  buttonGap: {
    marginTop: 22,
  },
  fullButtonGap: {
    marginTop: 2,
    marginBottom: 16,
  },
  buttonTextGap: {
    marginTop: 0,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D8DFEA',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  headerLines: {
    flex: 1,
  },
  rowGap: {
    marginTop: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 22,
    marginBottom: 14,
  },
  calendarShell: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D8DFEA',
    backgroundColor: '#FFFFFF',
    padding: 14,
    marginHorizontal: 16,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 14,
  },
  calendarCell: {
    width: '13.2%',
  },
  schedulePage: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scheduleContent: {
    padding: 16,
    paddingBottom: 32,
  },
  scheduleTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  scheduleCalendarShell: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D7DCE5',
    padding: 12,
  },
  scheduleCalendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
  },
  scheduleModeToggleGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  scheduleMonthControlsCard: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAECF0',
    backgroundColor: '#FFF8D7',
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  scheduleCalendarGrid: {
    gap: 4,
  },
  scheduleWeekRow: {
    flexDirection: 'row',
    gap: 4,
  },
  scheduleWeekDayCell: {
    flex: 1,
  },
  scheduleDayCell: {
    flex: 1,
    minWidth: 0,
    height: 66,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    backgroundColor: '#FFFFFF',
    padding: 4,
  },
  scheduleCellLine: {
    marginTop: 7,
  },
  scheduleLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAECF0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    marginTop: 12,
  },
  profilePage: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  profileContent: {
    padding: 16,
    paddingBottom: 32,
  },
  profileHeaderCardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
  },
  profileBannerSkeleton: {
    height: 110,
    backgroundColor: '#8A252C',
  },
  profileRefreshSkeleton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
  },
  profileAvatarSectionSkeleton: {
    alignItems: 'center',
    marginTop: -55,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  profileAvatarBorderSkeleton: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFFFFF',
    padding: 5,
    marginBottom: 12,
  },
  profileStatusSkeleton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#10B981',
  },
  profileCameraSkeleton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: '#8A252C',
  },
  profileEmailSkeleton: {
    marginTop: 8,
  },
  profilePillSkeleton: {
    marginTop: 16,
  },
  profileActionRowSkeleton: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  profileSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  profileSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 10,
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  profileInfoContent: {
    flex: 1,
    marginLeft: 12,
  },
  notificationPage: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  notificationControlPanelSkeleton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  notificationPanelHeaderSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  notificationBadgeSkeleton: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  notificationActionRowSkeleton: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  notificationFilterRowSkeleton: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  notificationScrollSkeleton: {
    flex: 1,
  },
  notificationContentSkeleton: {
    padding: 16,
    paddingBottom: 32,
  },
  notificationSkeletonCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  notificationUnreadSkeletonCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#8A252C',
  },
  notificationSkeletonContent: {
    flex: 1,
    marginLeft: 12,
  },
  notificationSkeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  notificationLine: {
    marginTop: 8,
  },
  notificationButtonLine: {
    marginTop: 10,
  },
});
