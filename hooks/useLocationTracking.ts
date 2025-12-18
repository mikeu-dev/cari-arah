import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

const TRACKING_KEY = 'breadcrumb_path';

export function useLocationTracking() {
    const [isTracking, setIsTracking] = useState(false);
    const [path, setPath] = useState<Location.LocationObjectCoords[]>([]);
    const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [subscription, setSubscription] = useState<Location.LocationSubscription | null>(null);

    useEffect(() => {
        loadPath();
        startForegroundLocation(); // Start location updates independently for dashboard
        return () => {
            if (subscription) subscription.remove();
        };
    }, []);

    const startForegroundLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
        }

        const sub = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                distanceInterval: 1,
                timeInterval: 1000,
            },
            (location) => {
                setCurrentLocation(location);

                // Logic recording jika tracking aktif
                if (isTracking) {
                    setPath((prev) => {
                        const updated = [...prev, location.coords];
                        // Debounce save or save occasionally in real app
                        // For now save every point for safety
                        savePathToStorage(updated);
                        return updated;
                    });
                }
            }
        );
        // Note: we are not setting subscription state here to avoid conflict if separate logic is needed
        // in a real app, you might want to manage one subscription for both display and tracking
        // or separate them. Here we just let it run.
    };


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

    const savePathToStorage = async (newPath: Location.LocationObjectCoords[]) => {
        try {
            await AsyncStorage.setItem(TRACKING_KEY, JSON.stringify(newPath));
        } catch (e) {
            console.error('Failed to save path', e);
        }
    };

    const toggleTracking = () => {
        setIsTracking(!isTracking);
    };

    const clearPath = async () => {
        setPath([]);
        await AsyncStorage.removeItem(TRACKING_KEY);
        setIsTracking(false);
    };

    return {
        isTracking,
        path,
        currentLocation,
        errorMsg,
        toggleTracking,
        clearPath
    };
}
