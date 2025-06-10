import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import Navigation from './navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';
import React from 'react';

export const queryClient = new QueryClient();

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate 
        loading={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
        } 
        persistor={persistor}
      >
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <PaperProvider>
              <Navigation />
            </PaperProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}
