import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/userSlice';
import { RootState } from '../store';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Redux
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
  
  // Navigate to home if already logged in
  React.useEffect(() => {
    if (isLoggedIn) {
      navigation.replace('LeadList');
    }
  }, [isLoggedIn, navigation]);
  
  // Form validation
  const validateForm = (): boolean => {
    if (!username.trim()) {
      setSnackbarMessage('Username is required');
      setSnackbarVisible(true);
      return false;
    }
    
    if (!email.trim()) {
      setSnackbarMessage('Email is required');
      setSnackbarVisible(true);
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setSnackbarMessage('Email is invalid');
      setSnackbarVisible(true);
      return false;
    }
    
    if (!password.trim()) {
      setSnackbarMessage('Password is required');
      setSnackbarVisible(true);
      return false;
    } else if (password.length < 6) {
      setSnackbarMessage('Password must be at least 6 characters');
      setSnackbarVisible(true);
      return false;
    }
    
    return true;
  };
  
  // Handle login
  const handleLogin = () => {
    if (validateForm()) {
      // In a real app, you would make an API call here
      // For this demo, we'll just dispatch the login action
      dispatch(login({ username, email }));
      
      // Show success message
      setSnackbarMessage('Login successful!');
      setSnackbarVisible(true);
    }
  };
  
  // Handle demo login
  const handleDemoLogin = () => {
    setUsername('demo');
    setEmail('demo@example.com');
    setPassword('password123');
    
    // Dispatch login action with demo credentials
    dispatch(login({ username: 'demo', email: 'demo@example.com' }));
    
    // Show success message
    setSnackbarMessage('Demo login successful!');
    setSnackbarVisible(true);
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to PoplCo</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
        
        <TextInput
          label="Username"
          mode="outlined"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
        
        <TextInput
          label="Email"
          mode="outlined"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        
        <TextInput
          label="Password"
          mode="outlined"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        
        <Button 
          mode="contained" 
          onPress={handleLogin}
          style={styles.button}
        >
          Sign In
        </Button>
        
        <Button 
          mode="outlined" 
          onPress={handleDemoLogin}
          style={styles.demoButton}
        >
          Demo Login
        </Button>
      </View>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
  demoButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
});
