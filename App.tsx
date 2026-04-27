import 'react-native-gesture-handler';

import React from 'react';
import { ActivityIndicator, StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { AppNavigator } from './navigation/AppNavigator';
import { AppDataProvider } from './hooks/useAppData';
import { palette } from './utils/theme';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: palette.background,
        }}
      >
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <StatusBar barStyle="dark-content" />
        <AppNavigator />
      </AppDataProvider>
    </SafeAreaProvider>
  );
}
