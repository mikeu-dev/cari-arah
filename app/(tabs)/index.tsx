import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import Compass from '@/components/navigation/Compass';
import ConnectivityStatus from '@/components/navigation/ConnectivityStatus';
import LocationStatus from '@/components/navigation/LocationStatus';
import PathVisualizer from '@/components/navigation/PathVisualizer';
import PoiManager from '@/components/navigation/PoiManager';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLocationTracking } from '@/hooks/useLocationTracking';

export default function HomeScreen() {
  const {
    isTracking,
    path,
    currentLocation,
    errorMsg,
    toggleTracking,
    clearPath
  } = useLocationTracking();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <View style={styles.headerIconContainer}>
          <MaterialCommunityIcons name="compass" size={150} color="rgba(255,255,255,0.4)" />
        </View>
      }>

      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Cari Arah</ThemedText>
        <MaterialCommunityIcons name="map-marker-radius" size={32} color="#0a7ea4" />
      </ThemedView>

      <ConnectivityStatus />

      <Compass />

      {/* Kontrol Tracking */}
      <ThemedView style={styles.controlsContainer}>
        <ResultButton
          onPress={toggleTracking}
          icon={isTracking ? "stop" : "play"}
          label={isTracking ? "Stop Rec" : "Start Rec"}
          color={isTracking ? "#FF3B30" : "#0a7ea4"}
        />
        <ResultButton
          onPress={clearPath}
          icon="delete-outline"
          label="Reset"
          color="#687076"
        />
      </ThemedView>

      <LocationStatus
        location={currentLocation}
        errorMsg={errorMsg}
        isSearching={!currentLocation}
      />

      <PathVisualizer path={path} currentLocation={currentLocation} />

      <PoiManager currentLocation={currentLocation} />

    </ParallaxScrollView>
  );
}

const ResultButton = ({ icon, label, onPress, color }: { icon: any, label: string, onPress: () => void, color: string }) => (
  <View style={{ alignItems: 'center', gap: 4 }}>
    <MaterialCommunityIcons.Button
      name={icon}
      backgroundColor={color}
      onPress={onPress}
      iconStyle={{ marginRight: 0 }}
      borderRadius={20}
      size={24}
    >
    </MaterialCommunityIcons.Button>
    <Text style={{ fontSize: 12, color: '#687076' }}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 10,
  },
  headerIconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
    marginBottom: 10,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12
  }
});
