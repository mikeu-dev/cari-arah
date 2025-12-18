import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const POI_KEY = 'saved_pois';

interface POI {
    id: string;
    name: string;
    coords: Location.LocationObjectCoords;
}

interface PoiManagerProps {
    currentLocation: Location.LocationObject | null;
}

export default function PoiManager({ currentLocation }: PoiManagerProps) {
    const [pois, setPois] = useState<POI[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [newPoiName, setNewPoiName] = useState('');

    useEffect(() => {
        loadPois();
    }, []);

    const loadPois = async () => {
        try {
            const stored = await AsyncStorage.getItem(POI_KEY);
            if (stored) setPois(JSON.parse(stored));
        } catch (e) {
            console.error(e);
        }
    };

    const savePoi = async () => {
        if (!currentLocation) {
            Alert.alert('Eror', 'Lokasi belum ditemukan');
            return;
        }
        if (!newPoiName.trim()) {
            Alert.alert('Eror', 'Nama lokasi tidak boleh kosong');
            return;
        }

        const newPoi: POI = {
            id: Date.now().toString(),
            name: newPoiName,
            coords: currentLocation.coords,
        };

        const updated = [...pois, newPoi];
        setPois(updated);
        await AsyncStorage.setItem(POI_KEY, JSON.stringify(updated));
        setModalVisible(false);
        setNewPoiName('');
    };

    const deletePoi = async (id: string) => {
        const updated = pois.filter(p => p.id !== id);
        setPois(updated);
        await AsyncStorage.setItem(POI_KEY, JSON.stringify(updated));
    };

    const calculateDistance = (target: Location.LocationObjectCoords) => {
        if (!currentLocation) return '...';
        // Haversine formula simple approx or use libraries.
        // Converting simple Euclidean for small scale or better math.
        const R = 6371e3; // metres
        const φ1 = currentLocation.coords.latitude * Math.PI / 180;
        const φ2 = target.latitude * Math.PI / 180;
        const Δφ = (target.latitude - currentLocation.coords.latitude) * Math.PI / 180;
        const Δλ = (target.longitude - currentLocation.coords.longitude) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;

        if (d > 1000) return `${(d / 1000).toFixed(2)} km`;
        return `${Math.round(d)} m`;
    };

    const calculateBearing = (target: Location.LocationObjectCoords) => {
        if (!currentLocation) return 0;
        const startLat = currentLocation.coords.latitude * Math.PI / 180;
        const startLng = currentLocation.coords.longitude * Math.PI / 180;
        const destLat = target.latitude * Math.PI / 180;
        const destLng = target.longitude * Math.PI / 180;

        const y = Math.sin(destLng - startLng) * Math.cos(destLat);
        const x = Math.cos(startLat) * Math.sin(destLat) -
            Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
        let brng = Math.atan2(y, x);
        brng = brng * 180 / Math.PI;
        return (brng + 360) % 360;
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="subtitle">Lokasi Penting (POI)</ThemedText>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
                    <MaterialCommunityIcons name="plus" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={pois}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => {
                    const bearing = calculateBearing(item.coords);
                    const distance = calculateDistance(item.coords);

                    return (
                        <ThemedView style={styles.card}>
                            <View>
                                <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                                <ThemedText style={styles.details}>
                                    Jarak: {distance} • Arah: {Math.round(bearing)}°
                                </ThemedText>
                            </View>
                            <TouchableOpacity onPress={() => deletePoi(item.id)}>
                                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#FF3B30" />
                            </TouchableOpacity>
                        </ThemedView>
                    );
                }}
                ListEmptyComponent={<ThemedText style={styles.empty}>Belum ada lokasi tersimpan.</ThemedText>}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <ThemedView style={styles.modalView}>
                        <ThemedText type="subtitle">Simpan Lokasi</ThemedText>
                        <ThemedText style={{ marginBottom: 10 }}>Koordinat saat ini akan disimpan.</ThemedText>

                        <TextInput
                            style={styles.input}
                            placeholder="Nama Lokasi (ex: Camp)"
                            placeholderTextColor="#999"
                            value={newPoiName}
                            onChangeText={setNewPoiName}
                            autoFocus
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setModalVisible(false)}>
                                <Text style={{ color: 'white' }}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={savePoi}>
                                <Text style={{ color: 'white' }}>Simpan</Text>
                            </TouchableOpacity>
                        </View>
                    </ThemedView>
                </View>
            </Modal>
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
        alignItems: 'center',
        marginBottom: 10,
    },
    addButton: {
        backgroundColor: '#0a7ea4',
        borderRadius: 15,
        padding: 5,
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        marginBottom: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    details: {
        fontSize: 12,
        color: '#687076',
    },
    empty: {
        color: '#687076',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: 10,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    input: {
        height: 40,
        width: '100%',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
        color: '#000', // adjust for dark mode
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 10,
        width: '100%',
        justifyContent: 'flex-end',
    },
    btn: {
        padding: 10,
        borderRadius: 5,
        minWidth: 80,
        alignItems: 'center',
    },
    btnCancel: {
        backgroundColor: '#FF3B30',
    },
    btnSave: {
        backgroundColor: '#34C759',
    },
});
