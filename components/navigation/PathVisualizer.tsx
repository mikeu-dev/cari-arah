import * as Location from 'expo-location';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface PathVisualizerProps {
    path: Location.LocationObjectCoords[];
    currentLocation: Location.LocationObject | null;
    heading?: number; // Compass heading to rotate map (optional)
}

const { width } = Dimensions.get('window');
const SIZE = width - 40;
const CENTER = SIZE / 2;
const SCALE = 200000; // Scale factor, adjust zoom

export default function PathVisualizer({ path, currentLocation, heading = 0 }: PathVisualizerProps) {
    if (!currentLocation || path.length === 0) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText style={{ textAlign: 'center', color: '#687076' }}>Belum ada data jejak, atau lokasi belum ditemukan.</ThemedText>
            </ThemedView>
        );
    }

    // Convert lat/long to x/y relative to center
    const points = path.map(p => {
        const dx = (p.longitude - currentLocation.coords.longitude) * SCALE; // deg * scale
        const dy = (currentLocation.coords.latitude - p.latitude) * SCALE; // inverted Y for screen coords
        return `${CENTER + dx},${CENTER + dy}`;
    }).join(' ');

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="subtitle" style={styles.title}>Visualisasi Jejak (Radar)</ThemedText>
            <View style={styles.svgContainer}>
                <Svg height={SIZE} width={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
                    {/* Grid Lines */}
                    <Line x1={CENTER} y1="0" x2={CENTER} y2={SIZE} stroke="#333" strokeWidth="1" strokeDasharray="5,5" />
                    <Line x1="0" y1={CENTER} x2={SIZE} y2={CENTER} stroke="#333" strokeWidth="1" strokeDasharray="5,5" />

                    {/* Path */}
                    <Polyline
                        points={points}
                        fill="none"
                        stroke="#0a7ea4"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Start Point */}
                    {path.length > 0 && (
                        <Circle
                            cx={CENTER + (path[0].longitude - currentLocation.coords.longitude) * SCALE}
                            cy={CENTER + (currentLocation.coords.latitude - path[0].latitude) * SCALE}
                            r="4"
                            fill="#34C759"
                        />
                    )}

                    {/* Current User Position (Center) */}
                    <Circle cx={CENTER} cy={CENTER} r="6" fill="#FF3B30" stroke="#FFF" strokeWidth="2" />
                </Svg>
                <ThemedText style={styles.scaleText}>Scale: 1:{SCALE}</ThemedText>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        marginTop: 10,
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: 8,
    },
    title: {
        marginBottom: 10,
    },
    svgContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff', // Or dark based on theme
        overflow: 'hidden',
    },
    scaleText: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        fontSize: 10,
        color: '#999',
    },
});
