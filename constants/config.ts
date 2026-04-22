import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Metro puts the packager host in `debuggerHost` (e.g. `192.168.1.5:8081`). On a physical phone,
 * `127.0.0.1` is the phone itself — so we default the API to the same host as Metro when it looks
 * like a numeric LAN / emulator address. Does not apply to `expo start --tunnel` (host is not a
 * simple IP); set `EXPO_PUBLIC_API_URL` for tunnel + local API.
 */
function debuggerPackagerHost(): string | null {
  const dbg = Constants.expoGoConfig?.debuggerHost;
  if (typeof dbg !== 'string') return null;
  return dbg.split(':')[0] || null;
}

function inferredDevApiUrl(): string | null {
  if (!__DEV__ || Platform.OS === 'web') return null;
  const host = debuggerPackagerHost();
  if (!host) return null;
  // Tunnel / non-IP hosts: cannot guess API port on same hostname
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return null;
  // Simulator / local Metro on loopback — keep default 127.0.0.1 for API on host
  if (host === '127.0.0.1' || host === '0.0.0.0') return null;
  return `http://${host}:3000`;
}

const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
export const API_URL = fromEnv || inferredDevApiUrl() || 'http://127.0.0.1:3000';

export const apiBaseMessage =
  Platform.OS === 'web'
    ? 'Set EXPO_PUBLIC_API_URL in .env for web.'
    : 'Set EXPO_PUBLIC_API_URL to your server (see constants/config.ts).';
