import { configureStore } from '@reduxjs/toolkit';
import userReducer, { 
  login, 
  logout, 
  toggleDarkMode, 
  toggleNotifications, 
  setDefaultFormType 
} from '../../store/userSlice';

describe('User Slice', () => {
  // Create a test store with the user reducer
  const store = configureStore({
    reducer: {
      user: userReducer,
    },
  });

  beforeEach(() => {
    // Reset the store before each test
    store.dispatch(logout());
  });

  test('should handle initial state', () => {
    const state = store.getState().user;
    expect(state.isLoggedIn).toBe(false);
    expect(state.username).toBe('');
    expect(state.email).toBe('');
    expect(state.preferences.darkMode).toBe(false);
    expect(state.preferences.notificationsEnabled).toBe(true);
    expect(state.preferences.defaultFormType).toBe('default');
  });

  test('should handle login', () => {
    store.dispatch(login({
      username: 'testuser',
      email: 'test@example.com'
    }));
    
    const state = store.getState().user;
    expect(state.isLoggedIn).toBe(true);
    expect(state.username).toBe('testuser');
    expect(state.email).toBe('test@example.com');
  });

  test('should handle logout', () => {
    // First login
    store.dispatch(login({
      username: 'testuser',
      email: 'test@example.com'
    }));
    
    // Then logout
    store.dispatch(logout());
    
    const state = store.getState().user;
    expect(state.isLoggedIn).toBe(false);
    expect(state.username).toBe('');
    expect(state.email).toBe('');
    
    // Preferences should be preserved after logout
    expect(state.preferences.darkMode).toBe(false);
    expect(state.preferences.notificationsEnabled).toBe(true);
    expect(state.preferences.defaultFormType).toBe('default');
  });

  test('should toggle dark mode', () => {
    // Initial state
    expect(store.getState().user.preferences.darkMode).toBe(false);
    
    // Toggle on
    store.dispatch(toggleDarkMode());
    expect(store.getState().user.preferences.darkMode).toBe(true);
    
    // Toggle off
    store.dispatch(toggleDarkMode());
    expect(store.getState().user.preferences.darkMode).toBe(false);
  });

  test('should toggle notifications', () => {
    // Initial state
    expect(store.getState().user.preferences.notificationsEnabled).toBe(true);
    
    // Toggle off
    store.dispatch(toggleNotifications());
    expect(store.getState().user.preferences.notificationsEnabled).toBe(false);
    
    // Toggle on
    store.dispatch(toggleNotifications());
    expect(store.getState().user.preferences.notificationsEnabled).toBe(true);
  });

  test('should set default form type', () => {
    // Initial state
    expect(store.getState().user.preferences.defaultFormType).toBe('default');
    
    // Change to custom
    store.dispatch(setDefaultFormType('custom'));
    expect(store.getState().user.preferences.defaultFormType).toBe('custom');
    
    // Change back to default
    store.dispatch(setDefaultFormType('default'));
    expect(store.getState().user.preferences.defaultFormType).toBe('default');
  });

  test('should preserve preferences after logout', () => {
    // Set some preferences
    store.dispatch(toggleDarkMode()); // Turn on dark mode
    store.dispatch(setDefaultFormType('custom'));
    
    // Login
    store.dispatch(login({
      username: 'testuser',
      email: 'test@example.com'
    }));
    
    // Verify preferences are set
    expect(store.getState().user.preferences.darkMode).toBe(true);
    expect(store.getState().user.preferences.defaultFormType).toBe('custom');
    
    // Logout
    store.dispatch(logout());
    
    // Verify preferences are preserved
    expect(store.getState().user.preferences.darkMode).toBe(true);
    expect(store.getState().user.preferences.defaultFormType).toBe('custom');
    expect(store.getState().user.isLoggedIn).toBe(false);
  });
});
