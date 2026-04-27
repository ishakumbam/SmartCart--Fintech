import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { AppCard } from '../components/AppCard';
import { Screen } from '../components/Screen';
import { useAppData } from '../hooks/useAppData';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { MainTabParamList } from '../navigation/types';
import { fallbackMarkers } from '../utils/mockData';
import { formatCurrency } from '../utils/format';
import { palette, spacing } from '../utils/theme';

type Props = BottomTabScreenProps<MainTabParamList, 'Map'>;

export function MapScreen({ navigation }: Props) {
  const { state } = useAppData();
  const location = useCurrentLocation();
  const markers =
    state.recommendations.length > 0
      ? state.recommendations.map((item) => ({
          id: item.id,
          title: item.store,
          subtitle: `${item.itemName} for ${formatCurrency(item.dealPrice)}`,
          latitude: item.latitude,
          longitude: item.longitude,
        }))
      : fallbackMarkers;

  const initialRegion = {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  return (
    <Screen
      title="Map"
      subtitle="Nearby grocery stores and mock deals centered around your current area."
    >
      {Platform.OS === 'web' ? (
        <AppCard>
          <Text style={styles.webTitle}>Interactive map works on iPhone and Android.</Text>
          <Text style={styles.webBody}>
            Open the app in Expo Go on a real device to test markers and location behavior.
          </Text>
        </AppCard>
      ) : (
        <View style={styles.mapWrap}>
          <MapView style={StyleSheet.absoluteFill} initialRegion={initialRegion}>
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                coordinate={{
                  latitude: marker.latitude,
                  longitude: marker.longitude,
                }}
                title={marker.title}
                description={marker.subtitle}
                pinColor={palette.mapMarker}
              />
            ))}
          </MapView>
        </View>
      )}

      <AppCard>
        <Text style={styles.locationTitle}>
          {location.hasPermission ? 'Using live location' : 'Using default downtown view'}
        </Text>
        <Text style={styles.locationBody}>
          {location.hasPermission
            ? 'SmartCart got foreground location permission and centered the map near you.'
            : 'If you deny location, the map still works with a sensible mocked grocery area.'}
        </Text>
      </AppCard>

      {markers.slice(0, 3).map((marker) => (
        <AppCard key={marker.id}>
          <Text style={styles.markerTitle}>{marker.title}</Text>
          <Text style={styles.markerSubtitle}>{marker.subtitle}</Text>
        </AppCard>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  mapWrap: {
    height: 360,
    overflow: 'hidden',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: palette.border,
  },
  webTitle: {
    color: palette.text,
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
  },
  webBody: {
    marginTop: spacing.sm,
    color: palette.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    lineHeight: 22,
  },
  locationTitle: {
    color: palette.text,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  locationBody: {
    marginTop: spacing.sm,
    color: palette.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 21,
  },
  markerTitle: {
    color: palette.text,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  markerSubtitle: {
    marginTop: 4,
    color: palette.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
});
