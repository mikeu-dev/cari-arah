import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Line, Polyline, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

interface PathVisualizerProps {
    path: Location.LocationObjectCoords[];
    currentLocation: Location.LocationObject | null;
    heading?: number;
}

const { width } = Dimensions.get('window');
const SIZE = width - 32; // Full width minus padding
const CENTER = SIZE / 2;
const SCALE = 200000;

export default function PathVisualizer({ path, currentLocation }: PathVisualizerProps) {
    if (!currentLocation) {
        return (
            <View style={styles.container}>
                <ThemedText style={{ color: Colors.tactical.textDim }}>Waiting for GPS...</ThemedText>
            </View>
        );
    }

    const points = path.map(p => {
        const dx = (p.longitude - currentLocation.coords.longitude) * SCALE;
        const dy = (currentLocation.coords.latitude - p.latitude) * SCALE;
        return `${CENTER + dx},${CENTER + dy}`;
    }).join(' ');

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="subtitle" style={{ color: Colors.tactical.primary }}>RADAR VIEW</ThemedText>
                <ThemedText style={{ color: Colors.tactical.textDim, fontSize: 10 }}>SCALE 1:{SCALE}</ThemedText>
            </View>

            <LinearGradient
                colors={['#1F2937', '#111827']}
                style={styles.radarContainer}
            >
                <Svg height={SIZE} width={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
                    <Defs>
                        <SvgLinearGradient id="pathGradient" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={Colors.tactical.primary} stopOpacity="0.8" />
                            <Stop offset="1" stopColor={Colors.tactical.secondary} stopOpacity="0.8" />
                        </SvgLinearGradient>
                    </Defs>

                    {/* Radar Grid - Concentric Circles */}
                    <Circle cx={CENTER} cy={CENTER} r={CENTER} fill="#111827" />
                    <Circle cx={CENTER} cy={CENTER} r={CENTER * 0.25} stroke={Colors.tactical.border} strokeWidth="1" strokeDasharray="5,5" fill="none" opacity="0.3" />
                    <Circle cx={CENTER} cy={CENTER} r={CENTER * 0.5} stroke={Colors.tactical.border} strokeWidth="1" strokeDasharray="5,5" fill="none" opacity="0.3" />
                    <Circle cx={CENTER} cy={CENTER} r={CENTER * 0.75} stroke={Colors.tactical.border} strokeWidth="1" strokeDasharray="5,5" fill="none" opacity="0.3" />
                    <Circle cx={CENTER} cy={CENTER} r={CENTER - 1} stroke={Colors.tactical.border} strokeWidth="2" fill="none" />

                    {/* Crosshairs */}
                    <Line x1={CENTER} y1="0" x2={CENTER} y2={SIZE} stroke={Colors.tactical.primary} strokeWidth="0.5" opacity="0.4" />
                    <Line x1="0" y1={CENTER} x2={SIZE} y2={CENTER} stroke={Colors.tactical.primary} strokeWidth="0.5" opacity="0.4" />

                    {/* Path */}
                    {path.length > 0 && (
                        <Polyline
                            points={points}
                            fill="none"
                            stroke={Colors.tactical.primary}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity="0.9"
                        />
                    )}

                    {/* Start Point */}
                    {path.length > 0 && (
                        <Circle
                            cx={CENTER + (path[0].longitude - currentLocation.coords.longitude) * SCALE}
                            cy={CENTER + (currentLocation.coords.latitude - path[0].latitude) * SCALE}
                            r="3"
                            fill={Colors.tactical.secondary}
                            opacity="0.8"
                        />
                    )}

                    {/* Current Position Blip */}
                    <Circle cx={CENTER} cy={CENTER} r="4" fill={Colors.tactical.alert} />
                    <Circle cx={CENTER} cy={CENTER} r="8" stroke={Colors.tactical.alert} strokeWidth="1" opacity="0.5" />
                </Svg>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        alignItems: 'center',
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    radarContainer: {
        width: SIZE,
        height: SIZE,
        borderRadius: SIZE / 2,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.tactical.border,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
});
