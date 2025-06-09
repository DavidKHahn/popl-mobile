import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Switch, Button, Divider, SegmentedButtons } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout, toggleDarkMode, toggleNotifications, setDefaultFormType } from '../store/userSlice';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  
  const handleLogout = () => {
    dispatch(logout());
    // Navigation will automatically redirect to Login screen due to the
    // conditional rendering in the navigation stack
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* User Information Card */}
      <Card style={styles.card}>
        <Card.Title title="User Information" />
        <Card.Content>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Username:</Text>
            <Text style={styles.infoValue}>{user.username}</Text>
          </View>
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
        </Card.Content>
      </Card>
      
      {/* Preferences Card */}
      <Card style={styles.card}>
        <Card.Title title="Preferences" />
        <Card.Content>
          <View style={styles.preferenceRow}>
            <Text>Dark Mode</Text>
            <Switch
              value={user.preferences.darkMode}
              onValueChange={() => dispatch(toggleDarkMode())}
            />
          </View>
          <Divider style={styles.divider} />
          
          <View style={styles.preferenceRow}>
            <Text>Notifications</Text>
            <Switch
              value={user.preferences.notificationsEnabled}
              onValueChange={() => dispatch(toggleNotifications())}
            />
          </View>
          <Divider style={styles.divider} />
          
          <Text style={styles.formTypeLabel}>Default Form Type:</Text>
          <SegmentedButtons
            value={user.preferences.defaultFormType}
            onValueChange={(value) => dispatch(setDefaultFormType(value as 'default' | 'custom'))}
            buttons={[
              { value: 'default', label: 'Default' },
              { value: 'custom', label: 'Custom' }
            ]}
            style={styles.segmentedButtons}
          />
          <Text style={styles.helperText}>
            This preference will be used when creating new leads
          </Text>
        </Card.Content>
      </Card>
      
      {/* Session Card */}
      <Card style={styles.card}>
        <Card.Title title="Session" />
        <Card.Content>
          <Text style={styles.sessionText}>
            Your session is currently active and your preferences are automatically saved.
          </Text>
          <Button
            mode="contained"
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            Logout
          </Button>
          <Text style={styles.persistenceNote}>
            Note: Your preferences will be preserved even after logout.
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: 'bold',
    width: 80,
  },
  infoValue: {
    flex: 1,
  },
  divider: {
    marginVertical: 12,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  formTypeLabel: {
    marginTop: 8,
    marginBottom: 12,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  sessionText: {
    marginBottom: 16,
  },
  logoutButton: {
    marginVertical: 16,
  },
  persistenceNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});
