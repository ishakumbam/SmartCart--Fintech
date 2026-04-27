import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';

export interface UserLocation {
  lat: number;
  lng: number;
}

// ── Request location permission and get current location ──
export async function getCurrentLocation(): Promise<UserLocation | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Location permission denied');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    };
  } catch (err) {
    console.error('Error getting location:', err);
    return null;
  }
}

// ── Save location to user profile ─────────────────────────
export async function saveUserLocation(
  userId:   string,
  location: UserLocation,
) {
  await supabase
    .from('profiles')
    .update({
      location_lat: location.lat,
      location_lng: location.lng,
    })
    .eq('id', userId);
}

// ── Calculate distance between two coordinates (miles) ────
export function getDistanceMiles(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R    = 3958.8; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a    =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// ── Filter deals by distance ───────────────────────────────
export function filterDealsByDistance<T extends {
  location_lat?: number;
  location_lng?: number;
}>(
  deals:       T[],
  userLocation: UserLocation,
  radiusMiles:  number = 10,
): T[] {
  return deals.filter(deal => {
    if (!deal.location_lat || !deal.location_lng) return true;
    const distance = getDistanceMiles(
      userLocation.lat, userLocation.lng,
      deal.location_lat, deal.location_lng,
    );
    return distance <= radiusMiles;
  });
}