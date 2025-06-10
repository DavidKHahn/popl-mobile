import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userReducer from './userSlice';

/**
 * OFFLINE PERSISTENCE IMPLEMENTATION
 * 
 * This file configures Redux Persist to enable offline persistence for the app.
 * Redux Persist saves the Redux store to AsyncStorage and automatically rehydrates
 * it when the app is restarted.
 * 
 * Benefits:
 * 1. User preferences (dark mode, notifications, default form type) persist across app restarts
 * 2. App can function offline using locally stored data
 * 3. State is automatically restored from AsyncStorage when the app is restarted
 * 
 * How it works:
 * - persistReducer wraps our root reducer to handle the persistence logic
 * - persistStore creates a persistor that manages the rehydration process
 * - PersistGate in App.tsx delays rendering until rehydration is complete
 * 
 * To test persistence:
 * 1. Change settings in the Profile screen
 * 2. Close and restart the app - settings should be preserved
 * 3. Enable airplane mode - app should still function with stored data
 */

// Configuration for Redux Persist
const persistConfig = {
  key: 'root',          // Storage key prefix for all persisted data
  storage: AsyncStorage, // Storage engine (React Native's AsyncStorage)
  // You can blacklist specific reducers you don't want to persist
  // blacklist: ['someReducer'],
  // Or whitelist only specific reducers to persist
  // whitelist: ['user'],
  
  // Debug mode can be enabled to see detailed logs of persist operations
  // debug: __DEV__, // Only enable in development mode
};

// Combine all reducers
const rootReducer = combineReducers({
  user: userReducer,
  // Add more reducers here as your app grows
});

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store with the persisted reducer
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types to avoid warnings with redux-persist
        // These actions are used internally by redux-persist and don't need serialization checks
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Create a persistor for the store
// This is used by PersistGate in App.tsx to handle rehydration
export const persistor = persistStore(store);

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Helper function to clear persisted state (useful for testing or reset functionality)
export const purgePersistedState = () => {
  return persistor.purge();
};
