import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  isLoggedIn: boolean;
  username: string | null;
  email: string | null;
  preferences: {
    darkMode: boolean;
    notificationsEnabled: boolean;
    defaultFormType: 'default' | 'custom';
  };
}

const initialState: UserState = {
  isLoggedIn: false,
  username: null,
  email: null,
  preferences: {
    darkMode: false,
    notificationsEnabled: true,
    defaultFormType: 'default',
  },
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ username: string; email: string }>) => {
      state.isLoggedIn = true;
      state.username = action.payload.username;
      state.email = action.payload.email;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.username = null;
      state.email = null;
      // We keep preferences even after logout
    },
    toggleDarkMode: (state, action: PayloadAction<boolean | undefined>) => {
      if (action.payload !== undefined) {
        state.preferences.darkMode = action.payload;
      } else {
        state.preferences.darkMode = !state.preferences.darkMode;
      }
    },
    toggleNotifications: (state) => {
      state.preferences.notificationsEnabled = !state.preferences.notificationsEnabled;
    },
    setDefaultFormType: (state, action: PayloadAction<'default' | 'custom'>) => {
      state.preferences.defaultFormType = action.payload;
    },
    updatePreferences: (state, action: PayloadAction<Partial<UserState['preferences']>>) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload,
      };
    },
  },
});

export const { 
  login, 
  logout, 
  toggleDarkMode, 
  toggleNotifications,
  setDefaultFormType,
  updatePreferences 
} = userSlice.actions;

export default userSlice.reducer;
