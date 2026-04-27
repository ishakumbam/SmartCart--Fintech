import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

type LocationState = {
  latitude: number;
  longitude: number;
  hasPermission: boolean;
  loading: boolean;
};

const fallback = {
  latitude: 41.8917,
  longitude: -87.6243,
  hasPermission: false,
  loading: true,
};

export function useCurrentLocation(): LocationState {
  const [state, setState] = useState<LocationState>(fallback);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!active) {
          return;
        }

        if (permission.status !== 'granted') {
          setState((current) => ({
            ...current,
            hasPermission: false,
            loading: false,
          }));
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!active) {
          return;
        }

        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          hasPermission: true,
          loading: false,
        });
      } catch {
        if (active) {
          setState((current) => ({
            ...current,
            loading: false,
          }));
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return state;
}
