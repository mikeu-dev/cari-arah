import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';

const TRACKING_KEY = 'breadcrumb_path';

export function useLocationTracking() {
    const [isTracking, setIsTracking] = useState(false);
    const [path, setPath] = useState<Location.LocationObjectCoords[]>([]);
    const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const pathRef = useRef<Location.LocationObjectCoords[]>([]);
    const lastSaveTime = useRef<number>(0);
    const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

    useEffect(() => {
        loadPath();
        startForegroundLocation();
        return () => {
            if (subscriptionRef.current) subscriptionRef.current.remove();
        };
    }, []);

    // Sync ref when path state changes manually (e.g. load or clear)
    useEffect(() => {
        pathRef.current = path;
    }, [path]);

    const startForegroundLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
        }

        const sub = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                distanceInterval: 1, // Update every 1 meter
                timeInterval: 1000,
            },
            (location) => {
                setCurrentLocation(location);

                if (isTracking) {
                    setPath((prev) => {
                        const updated = [...prev, location.coords];
                        pathRef.current = updated; // Keep ref in sync

                        // Throttled Save: Save only if > 5 seconds have passed
                        const now = Date.now();
                        if (now - lastSaveTime.current > 5000) {
                            savePathToStorage(updated);
                            lastSaveTime.current = now;
                        }

                        return updated;
                    });
                }
            }
        );
        subscriptionRef.current = sub;
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
        if (isTracking) {
            // Stopping: Save immediately to ensure no data loss
            savePathToStorage(pathRef.current);
        }
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
