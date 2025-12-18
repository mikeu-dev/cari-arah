import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Magnetometer } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function Compass() {
    const [subscription, setSubscription] = useState<any>(null);
    const [magnetometer, setMagnetometer] = useState(0);

    const rotation = useSharedValue(0);

    useEffect(() => {
        _toggle();
        return () => {
            _unsubscribe();
        };
    }, []);

    const _toggle = () => {
        if (subscription) {
            _unsubscribe();
        } else {
            _subscribe();
        }
    };

    const _subscribe = () => {
        setSubscription(
            Magnetometer.addListener((data) => {
                setMagnetometer(_angle(data));
            })
        );
        // Update interval sekian ms
        Magnetometer.setUpdateInterval(100);
    };

    const _unsubscribe = () => {
        subscription && subscription.remove();
        setSubscription(null);
    };

    const _angle = (magnetometer: any) => {
        let angle = 0;
        if (magnetometer) {
            let { x, y } = magnetometer;
            if (Math.atan2(y, x) >= 0) {
                angle = Math.atan2(y, x) * (180 / Math.PI);
            } else {
                angle = (Math.atan2(y, x) + 2 * Math.PI) * (180 / Math.PI);
            }
        }
        return Math.round(angle);
    };

    // Update animated value saat magnetometer berubah
    useEffect(() => {
        // Normalisasi rotasi agar tidak putar balik jauh (misal 359 ke 1)
        // Untuk MVP simple dulu
        rotation.value = withSpring(magnetometer, { damping: 20, stiffness: 90 });
    }, [magnetometer]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${-rotation.value}deg` }],
        };
    });

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="subtitle" style={styles.heading}>
                {magnetometer}° {getCardinalDirection(magnetometer)}
            </ThemedText>

            <View style={styles.compassContainer}>
                {/* Lingkaran Luar Statis */}
                <View style={styles.outerCircle}>
                    <ThemedText style={[styles.cardinal, styles.north]}>N</ThemedText>
                    <ThemedText style={[styles.cardinal, styles.east]}>E</ThemedText>
                    <ThemedText style={[styles.cardinal, styles.south]}>S</ThemedText>
                    <ThemedText style={[styles.cardinal, styles.west]}>W</ThemedText>
                </View>

                {/* Jarum yang berputar */}
                <Animated.View style={[styles.needleContainer, animatedStyle]}>
                    <MaterialCommunityIcons name="navigation" size={100} color="#FF3B30" />
                </Animated.View>
            </View>
        </ThemedView>
    );
}

function getCardinalDirection(angle: number) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((angle %= 360) < 0 ? angle + 360 : angle) / 45) % 8;
    return directions[index];
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    heading: {
        marginBottom: 20,
        fontSize: 24,
        fontWeight: 'bold',
    },
    compassContainer: {
        width: 250,
        height: 250,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    outerCircle: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderWidth: 4,
        borderColor: '#333',
        borderRadius: 125,
        opacity: 0.1,
    },
    needleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardinal: {
        position: 'absolute',
        fontSize: 20,
        fontWeight: 'bold',
    },
    north: { top: 10, alignSelf: 'center' },
    south: { bottom: 10, alignSelf: 'center' },
    east: { right: 15, top: '45%' },
    west: { left: 15, top: '45%' },
});
