import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { useAuthStore } from '@/store/authStore';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/lib/notificationService';
import { Colors, Typography, Palette, Shadows } from '@/constants/theme';

interface Notification {
  id:         string;
  title:      string;
  body:       string;
  deal_id:    string | null;
  read:       boolean;
  created_at: string;
}

function NotificationItem({
  notification,
  onPress,
}: {
  notification: Notification;
  onPress:      () => void;
}) {
  const timeAgo = getTimeAgo(notification.created_at);

  return (
    <TouchableOpacity
      style={[styles.notifItem, !notification.read && styles.notifItemUnread]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.notifIcon, !notification.read && styles.notifIconUnread]}>
        <Ionicons
          name={notification.deal_id ? 'pricetag' : 'notifications'}
          size={18}
          color={notification.read ? Palette.driedGrass : Palette.moss500}
        />
      </View>
      <View style={styles.notifContent}>
        <Text style={[styles.notifTitle, !notification.read && styles.notifTitleUnread]}>
          {notification.title}
        </Text>
        <Text style={styles.notifBody} numberOfLines={2}>
          {notification.body}
        </Text>
        <Text style={styles.notifTime}>{timeAgo}</Text>
      </View>
      {!notification.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);

  if (days > 0)  return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0)  return `${mins}m ago`;
  return 'Just now';
}

export default function NotificationsScreen() {
  const { user }                          = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const data = await getNotifications(user.id);
      setNotifications(data as Notification[]);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadNotifications(); }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handlePress = async (notification: Notification) => {
    if (!notification.read) {
      await markNotificationRead(notification.id);
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllNotificationsRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeScreen blobs={[
      { variant: 1, color: 'sand', size: 280, top: -80,   right: -100, opacity: 0.30 },
      { variant: 3, color: 'moss', size: 220, bottom: 60, left: -80,   opacity: 0.22 },
    ]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Palette.moss500}
          />
        }
      >
        {/* ── Header ──────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.heading}>Alerts</Text>
            {unreadCount > 0 && (
              <Text style={styles.unreadText}>{unreadCount} unread</Text>
            )}
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllBtn}
              onPress={handleMarkAllRead}
            >
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Loading ──────────────────────────────────── */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Palette.moss500} />
          </View>
        )}

        {/* ── Empty state ──────────────────────────────── */}
        {!loading && notifications.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Text style={{ fontSize: 40 }}>🔔</Text>
            </View>
            <Text style={styles.emptyTitle}>No alerts yet</Text>
            <Text style={styles.emptyBody}>
              When your usual items go on sale nearby, you'll get notified here first.
            </Text>
          </View>
        )}

        {/* ── Notification list ────────────────────────── */}
        {!loading && notifications.length > 0 && (
          <View style={styles.notifList}>
            {notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onPress={() => handlePress(notification)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop:        20,
    paddingBottom:     20,
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'flex-start',
  },
  heading: {
    fontFamily: Typography.heading,
    fontSize:   Typography['3xl'],
    color:      Palette.loam,
  },
  unreadText: {
    fontFamily: Typography.bodySemi,
    fontSize:   Typography.sm,
    color:      Palette.moss500,
    marginTop:  2,
  },
  markAllBtn: {
    backgroundColor:   `${Palette.moss500}15`,
    borderRadius:      9999,
    paddingVertical:   8,
    paddingHorizontal: 14,
    marginTop:         4,
    borderWidth:       1,
    borderColor:       `${Palette.moss500}25`,
  },
  markAllText: {
    fontFamily: Typography.bodySemi,
    fontSize:   Typography.xs,
    color:      Palette.moss500,
  },
  loadingContainer: {
    alignItems:      'center',
    paddingVertical: 48,
  },
  emptyState: {
    marginHorizontal: 24,
    alignItems:       'center',
    paddingVertical:  48,
  },
  emptyIcon: {
    width:           88,
    height:          88,
    borderRadius:    44,
    backgroundColor: Palette.sand,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     Palette.rawTimber,
    marginBottom:    24,
  },
  emptyTitle: {
    fontFamily:   Typography.heading,
    fontSize:     Typography['2xl'],
    color:        Palette.loam,
    textAlign:    'center',
    marginBottom: 12,
  },
  emptyBody: {
    fontFamily: Typography.body,
    fontSize:   Typography.base,
    color:      Colors.textMuted,
    textAlign:  'center',
    lineHeight: 22,
  },
  notifList: {
    marginHorizontal: 20,
    backgroundColor:  '#FEFEFA',
    borderRadius:     20,
    borderWidth:      1,
    borderColor:      `${Palette.rawTimber}55`,
    overflow:         'hidden',
    ...Shadows.subtle,
  },
  notifItem: {
    flexDirection:     'row',
    alignItems:        'flex-start',
    paddingVertical:   14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: `${Palette.rawTimber}33`,
    gap:               12,
  },
  notifItemUnread: {
    backgroundColor: `${Palette.moss500}06`,
  },
  notifIcon: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: `${Palette.driedGrass}15`,
    alignItems:      'center',
    justifyContent:  'center',
    marginTop:       2,
  },
  notifIconUnread: {
    backgroundColor: `${Palette.moss500}15`,
  },
  notifContent: {
    flex: 1,
    gap:  3,
  },
  notifTitle: {
    fontFamily: Typography.bodySemi,
    fontSize:   Typography.sm,
    color:      Palette.driedGrass,
  },
  notifTitleUnread: {
    color: Palette.loam,
  },
  notifBody: {
    fontFamily: Typography.body,
    fontSize:   Typography.sm,
    color:      Colors.textMuted,
    lineHeight: 18,
  },
  notifTime: {
    fontFamily: Typography.body,
    fontSize:   Typography.xs,
    color:      Colors.textMuted,
    marginTop:  2,
  },
  unreadDot: {
    width:           8,
    height:          8,
    borderRadius:    4,
    backgroundColor: Palette.moss500,
    marginTop:       6,
  },
});