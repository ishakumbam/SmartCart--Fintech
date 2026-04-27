import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { HabitsScreen } from '../screens/HabitsScreen';
import { MapScreen } from '../screens/MapScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { ReceiptPreviewScreen } from '../screens/ReceiptPreviewScreen';
import { ReceiptDetailScreen } from '../screens/ReceiptDetailScreen';
import { RecommendationsScreen } from '../screens/RecommendationsScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { BudgetSetupScreen } from '../screens/BudgetSetupScreen';
import { RewardsLedgerScreen } from '../screens/RewardsLedgerScreen';
import { MainTabParamList, RootStackParamList } from './types';
import { palette } from '../utils/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: palette.background,
    card: palette.surface,
    border: palette.border,
    text: palette.text,
    primary: palette.primary,
    notification: palette.primary,
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      id="main-tabs"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.textMuted,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
          height: 74,
          paddingTop: 8,
          paddingBottom: 12,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 12,
        },
        tabBarIcon: ({ color, size }) => {
          const iconName = {
            Home: 'home-outline',
            Scan: 'scan-outline',
            Habits: 'wallet-outline',
            Map: 'map-outline',
            Profile: 'person-outline',
          }[route.name] as keyof typeof Ionicons.glyphMap;
          if (route.name === 'Scan') {
            return (
              <Ionicons
                color="#FFFFFF"
                name={iconName}
                size={22}
                style={{
                  backgroundColor: palette.primary,
                  borderRadius: 18,
                  overflow: 'hidden',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                }}
              />
            );
          }

          return <Ionicons color={color} name={iconName} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} options={{ title: 'Scan' }} />
      <Tab.Screen name="Habits" component={HabitsScreen} options={{ title: 'Savings' }} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        id="root-stack"
        screenOptions={{
          headerTintColor: palette.text,
          headerStyle: {
            backgroundColor: palette.background,
          },
          headerShadowVisible: false,
          headerTitleStyle: {
            fontFamily: 'Inter_600SemiBold',
            fontSize: 18,
          },
          contentStyle: {
            backgroundColor: palette.background,
          },
        }}
      >
        <Stack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{ title: 'Scan Receipt', presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="ReceiptPreview"
          component={ReceiptPreviewScreen}
          options={{ title: 'Review Receipt' }}
        />
        <Stack.Screen
          name="ReceiptDetail"
          component={ReceiptDetailScreen}
          options={{ title: 'Receipt Summary' }}
        />
        <Stack.Screen
          name="Recommendations"
          component={RecommendationsScreen}
          options={{ title: 'Savings Picks' }}
        />
        <Stack.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{ title: 'Shopping Analytics' }}
        />
        <Stack.Screen
          name="BudgetSetup"
          component={BudgetSetupScreen}
          options={{ title: 'Budget Setup', presentation: 'modal' }}
        />
        <Stack.Screen
          name="RewardsLedger"
          component={RewardsLedgerScreen}
          options={{ title: 'Rewards Ledger' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
