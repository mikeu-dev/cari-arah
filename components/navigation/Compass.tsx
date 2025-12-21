import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Magnetometer } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';

const { width } = Dimensions.get('window');
const COMPASS_SIZE = width * 0.8;
const CENTER = COMPASS_SIZE / 2;

export default function Compass() {
    const [magnetometer, setMagnetometer] = useState(0);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

    const rotation = useSharedValue(0);

    useEffect(() => {
        let subscription: any = null;

        const _subscribe = () => {
            subscription = Magnetometer.addListener((data) => {
                setMagnetometer(_angle(data));
            });
            Magnetometer.setUpdateInterval(100);
        };

        const _checkAvailability = async () => {
            try {
                const available = await Magnetometer.isAvailableAsync();
                setIsAvailable(available);
                if (available) {
                    _subscribe();
                }
            } catch (error) {
                console.log("Magnetometer check failed:", error);
                setIsAvailable(false);
            }
        };

        _checkAvailability();

        return () => {
            if (subscription) {
                subscription.remove();
            }
        };
    }, [rotation]);

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

    useEffect(() => {
        // Handle wrap-around for smooth rotation (e.g. 359 -> 0) is tricky with simple spring
        // Detailed implementation omitted for brevity, using simple spring for now
        rotation.value = withSpring(magnetometer, { damping: 15, stiffness: 100 });
    }, [magnetometer]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${-rotation.value}deg` }],
        };
    });

    if (isAvailable === false) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText style={styles.errorText}>Compass not available</ThemedText>
            </ThemedView>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="title" style={styles.headingValue}>
                    {magnetometer}°
                </ThemedText>
                <ThemedText style={styles.headingLabel}>
                    {getCardinalDirection(magnetometer)}
                </ThemedText>
            </View>

            <View style={styles.compassWrapper}>
                {/* Fixed Indicator Triangle */}
                <View style={styles.indicatorContainer}>
                    <MaterialCommunityIcons name="menu-down" size={40} color={Colors.tactical.alert} />
                </View>

                {/* Rotating Dial */}
                <Animated.View style={[styles.dialContainer, animatedStyle]}>
                    <LinearGradient
                        colors={[Colors.tactical.surface, '#111827']}
                        style={styles.dialBackground}
                    >
                        <DialTicks />
                    </LinearGradient>
                </Animated.View>
            </View>
        </View>
    );
}

const DialTicks = () => {
    // Generate ticks every 5 degrees
    const ticks = [];
    for (let i = 0; i < 360; i += 5) {
        const isMajor = i % 90 === 0;
        const isMinor = i % 30 === 0;
        const length = isMajor ? 20 : (isMinor ? 15 : 8);
        const strokeWidth = isMajor ? 3 : (isMinor ? 2 : 1);
        const color = isMajor ? Colors.tactical.alert : (isMinor ? Colors.tactical.text : Colors.tactical.textDim);

        // Convert angle to coordinates
        // Using React Native SVG rotation is easier than calculating coords
        ticks.push(
            <Line
                key={i}
                y1={10} // Padding from edge
                y2={10 + length}
                x1={CENTER}
                x2={CENTER}
                stroke={color}
                strokeWidth={strokeWidth}
                origin={`${CENTER}, ${CENTER}`}
                rotation={i}
            />
        );

        // Add Text for cardinals and numbers
        if (i % 30 === 0) {
            let label = `${i}`;
            let fontSize = 12;
            let fontWeight = "normal";

            if (i === 0) { label = 'N'; fontSize = 24; fontWeight = "bold"; }
            else if (i === 90) { label = 'E'; fontSize = 24; fontWeight = "bold"; }
            else if (i === 180) { label = 'S'; fontSize = 24; fontWeight = "bold"; }
            else if (i === 270) { label = 'W'; fontSize = 24; fontWeight = "bold"; }

            ticks.push(
                <SvgText
                    key={`text-${i}`}
                    x={CENTER}
                    y={55} // Place text inside ticks
                    fill={i === 0 || i === 180 || i === 90 || i === 270 ? Colors.tactical.alert : Colors.tactical.text}
                    fontSize={fontSize}
                    fontWeight={fontWeight as any}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    origin={`${CENTER}, ${CENTER}`}
                    rotation={i}
                >
                    {label}
                </SvgText>
            );
        }
    }

    return (
        <Svg height={COMPASS_SIZE} width={COMPASS_SIZE}>
            <Circle
                cx={CENTER}
                cy={CENTER}
                r={CENTER - 2}
                stroke={Colors.tactical.border}
                strokeWidth="2"
                fill="none"
            />
            {ticks}
        </Svg>
    );
}

function getCardinalDirection(angle: number) {
    const directions = ['NORTH', 'NE', 'EAST', 'SE', 'SOUTH', 'SW', 'WEST', 'NW'];
    const index = Math.round(((angle %= 360) < 0 ? angle + 360 : angle) / 45) % 8;
    return directions[index];
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
        zIndex: 10,
    },
    headingValue: {
        fontSize: 48,
        fontWeight: '900',
        color: Colors.tactical.text,
        fontVariant: ['tabular-nums'],
    },
    headingLabel: {
        fontSize: 16,
        color: Colors.tactical.primary,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    compassWrapper: {
        width: COMPASS_SIZE,
        height: COMPASS_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    indicatorContainer: {
        position: 'absolute',
        top: -15,
        zIndex: 20,
        alignItems: 'center',
    },
    dialContainer: {
        width: COMPASS_SIZE,
        height: COMPASS_SIZE,
        borderRadius: COMPASS_SIZE / 2,
        overflow: 'hidden',
        // Shadow (iOS) / Elevation (Android)
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    dialBackground: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        color: Colors.tactical.alert,
    },
});
