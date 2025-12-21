import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';

interface LocationStatusProps {
    location: Location.LocationObject | null;
    errorMsg: string | null;
    isSearching: boolean;
}

export default function LocationStatus({ location, errorMsg, isSearching }: LocationStatusProps) {
    if (errorMsg) {
        return (
            <View style={styles.errorContainer}>
                <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>
            </View>
        );
    }

    if (isSearching && !location) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.tactical.primary} />
                <ThemedText style={{ color: Colors.tactical.textDim }}>Acquiring GPS Signal...</ThemedText>
            </ThemedView>
        );
    }

    return (
        <View style={styles.gridContainer}>
            <StatCard
                icon="latitude"
                label="LATITUDE"
                value={location?.coords.latitude.toFixed(6) ?? '-'}
                color={Colors.tactical.primary}
            />
            <StatCard
                icon="longitude"
                label="LONGITUDE"
                value={location?.coords.longitude.toFixed(6) ?? '-'}
                color={Colors.tactical.primary}
            />
            <StatCard
                icon="image-filter-hdr"
                label="ALTITUDE"
                value={location?.coords.altitude ? `${Math.round(location.coords.altitude)}m` : 'N/A'}
                color={Colors.tactical.secondary}
            />
            <StatCard
                icon="target"
                label="ACCURACY"
                value={location?.coords.accuracy ? `±${Math.round(location.coords.accuracy)}m` : '-'}
                color={Colors.tactical.alert} // Red tint for accuracy to show precision importance
            />
        </View>
    );
}

const StatCard = ({ icon, label, value, color }: { icon: any; label: string; value: string; color: string }) => (
    <LinearGradient
        colors={[Colors.tactical.surface, 'rgba(31, 41, 55, 0.6)']}
        style={styles.card}
    >
        <View style={styles.cardHeader}>
            <MaterialCommunityIcons name={icon} size={16} color={color} />
            <ThemedText style={styles.label}>{label}</ThemedText>
        </View>
        <ThemedText type="defaultSemiBold" style={[styles.value, { color: Colors.tactical.text }]}>
            {value}
        </ThemedText>
    </LinearGradient>
);

const styles = StyleSheet.create({
    errorContainer: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        marginTop: 16,
        borderWidth: 1,
        borderColor: Colors.tactical.alert,
    },
    errorText: {
        color: Colors.tactical.alert,
        textAlign: 'center',
    },
    loadingContainer: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        marginTop: 10,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 16,
    },
    card: {
        width: '48%', // Approx half with gap
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.tactical.border,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    label: {
        fontSize: 10,
        color: Colors.tactical.textDim,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    value: {
        fontSize: 18,
        fontVariant: ['tabular-nums'], // Helpful for numbers alignment
    },
});
