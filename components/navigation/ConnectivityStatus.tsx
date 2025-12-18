import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNetInfo } from '@react-native-community/netinfo';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ConnectivityStatus() {
    const netInfo = useNetInfo();

    if (netInfo.isConnected === false) {
        return (
            <ThemedView style={[styles.container, styles.offline]}>
                <MaterialCommunityIcons name="wifi-off" size={20} color="#fff" />
                <ThemedText style={styles.textOffline}>Mode Offline: GPS Only</ThemedText>
            </ThemedView>
        );
    }

    // Jika online, mungkin tidak perlu menampilkan apa-apa atau ikon kecil
    return null;
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        borderRadius: 8,
        marginVertical: 8,
        gap: 8,
    },
    offline: {
        backgroundColor: '#FF3B30', // Red for alert
    },
    textOffline: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
