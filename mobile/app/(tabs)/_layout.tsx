import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Palette } from '@/constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  name:       string;
  title:      string;
  icon:       IconName;
  activeIcon: IconName;
}

const TABS: TabConfig[] = [
  { name: 'index',         title: 'Deals',    icon: 'pricetag-outline',      activeIcon: 'pricetag' },
  { name: 'scan',          title: 'Scan',     icon: 'scan-outline',          activeIcon: 'scan' },
  { name: 'habits',        title: 'Habits',   icon: 'leaf-outline',          activeIcon: 'leaf' },
  { name: 'notifications', title: 'Alerts',   icon: 'notifications-outline', activeIcon: 'notifications' },
  { name: 'settings',      title: 'Settings', icon: 'settings-outline',      activeIcon: 'settings' },
];

export default function TabLayout() {
  return (
    <Tabs
      safeAreaInsets={{ bottom: 0 }}
      screenOptions={{
        headerShown:             false,
        tabBarActiveTintColor:   Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle:             styles.tabBar,
        tabBarLabelStyle:        styles.tabLabel,
        tabBarItemStyle:         styles.tabItem,
      }}
    >
      {TABS.map(({ name, title, icon, activeIcon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ focused }) => (
              <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                <Ionicons
                  name={focused ? activeIcon : icon}
                  size={22}
                  color={focused ? Palette.moss500 : Colors.tabInactive}
                />
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor:      '#FEFEFA',
    borderTopWidth:       0,
    borderTopLeftRadius:  24,
    borderTopRightRadius: 24,
    shadowColor:          Palette.moss500,
    shadowOffset:         { width: 0, height: -4 },
    shadowOpacity:        0.08,
    shadowRadius:         16,
    elevation:            12,
    height:               Platform.OS === 'ios' ? 90 : 68,
    paddingTop:           10,
    paddingBottom:        Platform.OS === 'ios' ? 30 : 10,
    borderTopColor:       `${Palette.rawTimber}55`,
    position:             'absolute',
    bottom:               0,
    left:                 0,
    right:                0,
  },
  tabLabel: {
    fontFamily:    Typography.bodySemi,
    fontSize:      10,
    letterSpacing: 0.3,
    marginTop:     2,
  },
  tabItem: {
    paddingTop: 4,
  },
  iconWrap: {
    width:           36,
    height:          30,
    borderRadius:    15,
    alignItems:      'center',
    justifyContent:  'center',
  },
  iconWrapActive: {
    backgroundColor: `${Palette.moss500}14`,
  },
});