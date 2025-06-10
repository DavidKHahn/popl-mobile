import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, Card, Switch, Button, Divider, SegmentedButtons, Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout, toggleDarkMode, toggleNotifications, setDefaultFormType } from '../store/userSlice';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { purgePersistedState } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [storageKeys, setStorageKeys] = useState<string[]>([]);

    // Effect to check AsyncStorage on component mount
    useEffect(() => {
        checkAsyncStorage();
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        // Navigation will automatically redirect to Login screen due to the
        // conditional rendering in the navigation stack
    };

    /**
     * Checks AsyncStorage for persisted data and updates the storageKeys state
     * This helps verify that data is actually being stored in AsyncStorage
     */
    const checkAsyncStorage = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const filteredKeys = keys.filter(key => key.includes('persist'));
            setStorageKeys(filteredKeys);
            
            // Log for developers
            console.log('Persisted storage keys:', filteredKeys);
            
            if (filteredKeys.length > 0) {
                // For demonstration, show the first persisted item's content
                const firstKey = filteredKeys[0];
                const value = await AsyncStorage.getItem(firstKey);
                console.log(`Content for ${firstKey}:`, value ? value.substring(0, 100) + '...' : 'null');
            }
        } catch (error) {
            console.error('Error checking AsyncStorage:', error);
        }
    };

    /**
     * Clears all persisted data - useful for testing persistence restoration
     */
    const clearPersistedData = async () => {
        try {
            await purgePersistedState();
            await checkAsyncStorage();
            showSnackbar('Persisted data cleared. Restart app to test restoration.');
        } catch (error) {
            console.error('Error clearing persisted data:', error);
            showSnackbar('Error clearing persisted data');
        }
    };

    /**
     * Shows a snackbar message to the user
     */
    const showSnackbar = (message: string) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
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
                            onValueChange={(value: boolean): void => {
                                dispatch(toggleDarkMode(value));
                                showSnackbar('Dark mode preference saved and persisted');
                            }} />
                    </View>
                    <Divider style={styles.divider} />

                    <View style={styles.preferenceRow}>
                        <Text>Notifications</Text>
                        <Switch
                            value={user.preferences.notificationsEnabled}
                            onValueChange={(value: boolean): void => {
                                dispatch(toggleNotifications());
                                showSnackbar('Notification preference saved and persisted');
                            }} />
                    </View>
                    <Divider style={styles.divider} />

                    <Text style={styles.formTypeLabel}>Default Form Type:</Text>
                    <SegmentedButtons
                        value={user.preferences.defaultFormType}
                        onValueChange={(value) => {
                            dispatch(setDefaultFormType(value as 'default' | 'custom'));
                            showSnackbar('Form type preference saved and persisted');
                        }}
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

            {/* Persistence Testing Card */}
            <Card style={styles.card}>
                <Card.Title title="Persistence Testing" />
                <Card.Content>
                    <Text style={styles.persistenceTestingText}>
                        This section helps verify that persistence is working correctly.
                    </Text>
                    
                    <Text style={styles.storageInfoTitle}>Persisted Storage Keys:</Text>
                    {storageKeys.length > 0 ? (
                        storageKeys.map((key, index) => (
                            <Text key={index} style={styles.storageKey}>{key}</Text>
                        ))
                    ) : (
                        <Text style={styles.noStorageText}>No persisted data found</Text>
                    )}

                    <Text style={styles.testInstructions}>
                        To test persistence:
                    </Text>
                    <Text style={styles.testStep}>
                        1. Change preferences above (dark mode, notifications, form type)
                    </Text>
                    <Text style={styles.testStep}>
                        2. Close the app completely
                    </Text>
                    <Text style={styles.testStep}>
                        3. Restart the app - your preferences should be preserved
                    </Text>
                    <Text style={styles.testStep}>
                        4. Enable airplane mode - app should still function with stored preferences
                    </Text>

                    <View style={styles.buttonContainer}>
                        <Button
                            mode="outlined"
                            onPress={checkAsyncStorage}
                            style={styles.testButton}
                        >
                            Refresh Storage Info
                        </Button>
                        
                        <Button
                            mode="outlined"
                            onPress={clearPersistedData}
                            style={[styles.testButton, styles.dangerButton]}
                        >
                            Clear Persisted Data
                        </Button>
                    </View>
                </Card.Content>
            </Card>

            {/* Snackbar for feedback */}
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                action={{
                    label: 'OK',
                    onPress: () => setSnackbarVisible(false),
                }}
            >
                {snackbarMessage}
            </Snackbar>
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
    persistenceTestingText: {
        marginBottom: 12,
    },
    storageInfoTitle: {
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 4,
    },
    storageKey: {
        fontSize: 12,
        color: '#333',
        marginLeft: 8,
        marginBottom: 2,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    noStorageText: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
        marginLeft: 8,
    },
    testInstructions: {
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    testStep: {
        fontSize: 12,
        marginLeft: 8,
        marginBottom: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    testButton: {
        flex: 1,
        marginHorizontal: 4,
    },
    dangerButton: {
        borderColor: '#ff5252',
    },
});
