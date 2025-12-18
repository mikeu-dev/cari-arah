import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const TRACKING_KEY = 'breadcrumb_path';

export default function BreadcrumbTracker() {
    const [isTracking, setIsTracking] = useState(false);
    const [path, setPath] = useState<Location.LocationObjectCoords[]>([]);
    const [subscription, setSubscription] = useState<Location.LocationSubscription | null>(null);

    useEffect(() => {
        loadPath();
    }, []);

    const loadPath = async () => {
        try {
            const savedPath = await AsyncStorage.getItem(TRACKING_KEY);
            if (savedPath) {
                setPath(JSON.parse(savedPath));
            }
        } catch (e) {
            console.error('Failed to load path', e);
        }
    };

    const savePath = async (newPath: Location.LocationObjectCoords[]) => {
        try {
            await AsyncStorage.setItem(TRACKING_KEY, JSON.stringify(newPath));
        } catch (e) {
            console.error('Failed to save path', e);
        }
    };

    const startTracking = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Izin Ditolak', 'Butuh izin lokasi untuk tracking.');
            return;
        }

        setIsTracking(true);

        // Subscribe to location updates
        const sub = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                distanceInterval: 5, // Record every 5 meters
            },
            (location) => {
                const newPoint = location.coords;
                setPath((prevPath) => {
                    const updated = [...prevPath, newPoint];
                    savePath(updated);
                    return updated;
                });
            }
        );
        setSubscription(sub);
    };

    const stopTracking = () => {
        setIsTracking(false);
        if (subscription) {
            subscription.remove();
            setSubscription(null);
        }
    };

    const clearPath = async () => {
        Alert.alert(
            'Hapus Jejak',
            'Yakin ingin menghapus semua jejak yang tersimpan?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        stopTracking();
                        setPath([]);
                        await AsyncStorage.removeItem(TRACKING_KEY);
                    }
                }
            ]
        );
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="subtitle">Jejak Perjalanan</ThemedText>
                <MaterialCommunityIcons name="foot-print" size={24} color="#0a7ea4" />
            </ThemedView>

            <ThemedView style={styles.stats}>
                <ThemedText>Points: {path.length}</ThemedText>
                <ThemedText style={isTracking ? styles.statusActive : styles.statusInactive}>
                    {isTracking ? 'MEREKAM...' : 'IDLE'}
                </ThemedText>
            </ThemedView>

            <ThemedView style={styles.controls}>
                {!isTracking ? (
                    <MaterialCommunityIcons.Button
                        name="play"
                        backgroundColor="#0a7ea4"
                        onPress={startTracking}
                    >
                        Mulai Tracking
                    </MaterialCommunityIcons.Button>
                ) : (
                    <MaterialCommunityIcons.Button
                        name="stop"
                        backgroundColor="#FF3B30"
                        onPress={stopTracking}
                    >
                        Stop
                    </MaterialCommunityIcons.Button>
                )}

                <MaterialCommunityIcons.Button
                    name="delete-outline"
                    backgroundColor="#687076"
                    onPress={clearPath}
                >
                    Reset
                </MaterialCommunityIcons.Button>
            </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(150, 150, 150, 0.1)',
        marginTop: 16,
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        backgroundColor: 'transparent',
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        backgroundColor: 'transparent',
    },
    statusActive: {
        color: '#34C759',
        fontWeight: 'bold',
    },
    statusInactive: {
        color: '#687076',
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'transparent',
    },
});
