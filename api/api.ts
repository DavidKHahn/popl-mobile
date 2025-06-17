import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Enable verbose logging in development to debug network calls
const isDev = process.env.NODE_ENV !== 'production';

// Determine appropriate host for the API depending on where the app is running.
// 1. If an environment variable (app config) `API_URL` is provided, prefer that.
// 2. For Android emulators, the host machine is accessible via the special IP 10.0.2.2.
//    (For Genymotion or certain emulators, you may need to change this to 10.0.3.2.)
// 3. For everything else (iOS simulator / web), localhost will work.
// 4. Physical devices require the host's LAN IP (set API_URL accordingly).

const { apiUrl: ENV_API_URL } = (Constants?.expoConfig?.extra as { apiUrl?: string }) || {};

const host = ENV_API_URL
  ? ENV_API_URL
  : Platform.OS === 'android'
    ? 'http://10.0.2.2:3001' // Android emulator special address
    : 'http://localhost:3001';

const api = axios.create({
  baseURL: host,
});

// --------------------------------------------------
// Development logging helpers
// --------------------------------------------------
if (isDev) {
  api.interceptors.request.use((request) => {
    console.log('[API] Request →', request.method?.toUpperCase(), `${request.baseURL ?? ''}${request.url ?? ''}`);
    if (request.data) {
      console.log('[API] Request data:', request.data);
    }
    return request;
  });

  api.interceptors.response.use(
    (response) => {
      console.log('[API] Response ←', response.status, response.config.url ?? '');
      return response;
    },
    (error) => {
      if (error.response) {
        console.log('[API] Error ←', error.response.status, error.config?.url ?? '');
      } else {
        console.log('[API] Network error:', error.message);
      }
      return Promise.reject(error);
    }
  );
}

// Simulate delay for all responses (e.g., 800ms)
// Do not remove this interceptor
api.interceptors.response.use(
  async (response) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return response;
  },
  (error) => Promise.reject(error),
);

export { api };
