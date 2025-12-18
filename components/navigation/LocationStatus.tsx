import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface LocationStatusProps {
    location: Location.LocationObject | null;
    errorMsg: string | null;
    isSearching: boolean;
}

export default function LocationStatus({ location, errorMsg, isSearching }: LocationStatusProps) {
    if (errorMsg) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            {isSearching && !location ? (
                <ThemedView style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#0a7ea4" />
                    <ThemedText>Mencari Sinyal GPS...</ThemedText>
                </ThemedView>
            ) : (
                <ThemedView style={styles.grid}>
                    <DataItem
                        icon="latitude"
                        label="Latitude"
                        value={location?.coords.latitude.toFixed(6) ?? '-'}
                    />
                    <DataItem
                        icon="longitude"
                        label="Longitude"
                        value={location?.coords.longitude.toFixed(6) ?? '-'}
                    />
                    <DataItem
                        icon="image-filter-hdr"
                        label="Altitude"
                        value={location?.coords.altitude ? `${Math.round(location.coords.altitude)} m` : 'N/A'}
                    />
                    <DataItem
                        icon="target"
                        label="Akurasi"
                        value={location?.coords.accuracy ? `±${Math.round(location.coords.accuracy)} m` : '-'}
                    />
                </ThemedView>
            )}
        </ThemedView>
    );
}

const DataItem = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
    <ThemedView style={styles.item}>
        <MaterialCommunityIcons name={icon} size={24} color="#687076" style={{ marginBottom: 4 }} />
        <ThemedText type="defaultSemiBold">{value}</ThemedText>
        <ThemedText style={styles.label}>{label}</ThemedText>
    </ThemedView>
);

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(150, 150, 150, 0.1)',
        marginTop: 16,
    },
    loadingContainer: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        gap: 16,
    },
    item: {
        alignItems: 'center',
        minWidth: '40%',
        backgroundColor: 'transparent',
    },
    label: {
        fontSize: 12,
        color: '#687076',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
    },
});
