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
import { useTheme } from '@/hooks/useTheme';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/lib/notificationService';
import { Typography, Palette } from '@/constants/theme';

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
  const { theme } = useTheme();
  const timeAgo   = getTimeAgo(notification.created_at);

  return (
    <TouchableOpacity
      style={[
        styles.notifItem,
        { borderBottomColor: `${theme.border}33` },
        !notification.read && { backgroundColor: `${Palette.moss500}08` },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[
        styles.notifIcon,
        { backgroundColor: notification.read ? `${theme.textMuted}15` : `${Palette.moss500}15` },
      ]}>
        <Ionicons
          name={notification.deal_id ? 'pricetag' : 'notifications'}
          size={18}
          color={notification.read ? theme.textMuted : Palette.moss500}
        />
      </View>
      <View style={styles.notifContent}>
        <Text style={[
          styles.notifTitle,
          { color: notification.read ? theme.textSecondary : theme.textPrimary },
        ]}>
          {notification.title}
        </Text>
        <Text style={[styles.notifBody, { color: theme.textMuted }]} numberOfLines={2}>
          {notification.body}
        </Text>
        <Text style={[styles.notifTime, { color: theme.textMuted }]}>{timeAgo}</Text>
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
  const { theme }                         = useTheme();
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Palette.moss500} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.heading, { color: theme.textPrimary }]}>Alerts</Text>
            {unreadCount > 0 && (
              <Text style={styles.unreadText}>{unreadCount} unread</Text>
            )}
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={[styles.markAllBtn, { backgroundColor: `${Palette.moss500}15`, borderColor: `${Palette.moss500}25` }]}
              onPress={handleMarkAllRead}
            >
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Palette.moss500} />
          </View>
        )}

        {!loading && notifications.length === 0 && (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
              <Text style={{ fontSize: 40 }}>🔔</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No alerts yet</Text>
            <Text style={[styles.emptyBody, { color: theme.textMuted }]}>
              When your usual items go on sale nearby, you'll get notified here first.
            </Text>
          </View>
        )}

        {!loading && notifications.length > 0 && (
          <View style={[styles.notifList, { backgroundColor: theme.cardBackground, borderColor: `${theme.border}55` }]}>
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
  scroll:           { paddingBottom: 100 },
  header:           { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heading:          { fontFamily: Typography.heading, fontSize: Typography['3xl'] },
  unreadText:       { fontFamily: Typography.bodySemi, fontSize: Typography.sm, color: Palette.moss500, marginTop: 2 },
  markAllBtn:       { borderRadius: 9999, paddingVertical: 8, paddingHorizontal: 14, marginTop: 4, borderWidth: 1 },
  markAllText:      { fontFamily: Typography.bodySemi, fontSize: Typography.xs, color: Palette.moss500 },
  loadingContainer: { alignItems: 'center', paddingVertical: 48 },
  emptyState:       { marginHorizontal: 24, alignItems: 'center', paddingVertical: 48 },
  emptyIcon:        { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: 24 },
  emptyTitle:       { fontFamily: Typography.heading, fontSize: Typography['2xl'], textAlign: 'center', marginBottom: 12 },
  emptyBody:        { fontFamily: Typography.body, fontSize: Typography.base, textAlign: 'center', lineHeight: 22 },
  notifList:        { marginHorizontal: 20, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  notifItem:        { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, gap: 12 },
  notifIcon:        { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  notifContent:     { flex: 1, gap: 3 },
  notifTitle:       { fontFamily: Typography.bodySemi, fontSize: Typography.sm },
  notifBody:        { fontFamily: Typography.body, fontSize: Typography.sm, lineHeight: 18 },
  notifTime:        { fontFamily: Typography.body, fontSize: Typography.xs, marginTop: 2 },
  unreadDot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: Palette.moss500, marginTop: 6 },
});