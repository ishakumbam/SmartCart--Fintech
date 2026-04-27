import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

// ── Configure how notifications appear ────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:  true,
    shouldPlaySound:  true,
    shouldSetBadge:   true,
    shouldShowBanner: true,
    shouldShowList:   true,
  }),
});

// ── Register for push notifications ───────────────────────
export async function registerForPushNotifications(userId: string): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return null;
    }
  
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
  
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
  
    if (finalStatus !== 'granted') {
      console.log('Push notification permission denied');
      return null;
    }
  
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('deals', {
        name:             'Deal Alerts',
        importance:       Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor:       '#5D7052',
      });
    }
  
    // Skip remote push token for Expo Go — use local notifications only
    // When you build with EAS, uncomment the block below and add your projectId
    /*
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'YOUR_EAS_PROJECT_ID',
    });
    await supabase
      .from('profiles')
      .update({ push_token: token.data })
      .eq('id', userId);
    */
  
    return 'local-only';
  }


// ── Schedule a local notification ─────────────────────────
export async function scheduleLocalNotification(
  title: string,
  body:  string,
  data?: Record<string, unknown>,
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data:  data ?? {},
      sound: true,
    },
    trigger: null,
  });
}

// ── Send deal match notification ───────────────────────────
export async function notifyDealMatch(
  itemName: string,
  store:    string,
  savings:  number,
  dealId:   string,
) {
  await scheduleLocalNotification(
    `💰 Deal on ${itemName}!`,
    `Save $${savings.toFixed(2)} at ${store} this week`,
    { dealId, type: 'deal_match' },
  );
}

// ── Save notification to Supabase ──────────────────────────
export async function saveNotification(
  userId:  string,
  title:   string,
  body:    string,
  dealId?: string,
) {
  await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title,
      body,
      deal_id: dealId ?? null,
      read:    false,
    });
}

// ── Get user notifications ─────────────────────────────────
export async function getNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return [];
  return data ?? [];
}

// ── Mark notification as read ──────────────────────────────
export async function markNotificationRead(notificationId: string) {
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);
}

// ── Mark all as read ───────────────────────────────────────
export async function markAllNotificationsRead(userId: string) {
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId);
}

// ── Get unread count ───────────────────────────────────────
export async function getUnreadCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  return count ?? 0;
}