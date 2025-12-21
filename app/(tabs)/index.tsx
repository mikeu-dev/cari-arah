import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Compass from '@/components/navigation/Compass';
import ConnectivityStatus from '@/components/navigation/ConnectivityStatus';
import LocationStatus from '@/components/navigation/LocationStatus';
import PathVisualizer from '@/components/navigation/PathVisualizer';
import PoiManager from '@/components/navigation/PoiManager';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
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
    <LinearGradient
      colors={[Colors.tactical.background, '#000']}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* Header Status Bar */}
          <View style={styles.headerBar}>
            <View style={styles.appTitle}>
              <MaterialCommunityIcons name="radar" size={24} color={Colors.tactical.primary} />
              <ThemedText type="subtitle" style={{ color: Colors.tactical.text }}>CARI ARAH</ThemedText>
            </View>
            <ConnectivityStatus />
          </View>

          {/* Main Visualization Area */}
          <Compass />

          <PathVisualizer path={path} currentLocation={currentLocation} />

          {/* Data Grid */}
          <LocationStatus
            location={currentLocation}
            errorMsg={errorMsg}
            isSearching={!currentLocation}
          />

          {/* Controls */}
          <View style={styles.controlsContainer}>
            <ActionButton
              onPress={toggleTracking}
              icon={isTracking ? "stop" : "record-circle-outline"}
              label={isTracking ? "STOP TRACKING" : "START TRACKING"}
              isActive={isTracking}
              activeColor={Colors.tactical.alert}
              defaultColor={Colors.tactical.primary}
            />
            <ActionButton
              onPress={clearPath}
              icon="delete-sweep-outline"
              label="CLEAR DATA"
              isActive={false} // Always default state
              activeColor={Colors.tactical.alert}
              defaultColor={Colors.tactical.textDim}
            />
          </View>

          <PoiManager currentLocation={currentLocation} />

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const ActionButton = ({ icon, label, onPress, isActive, activeColor, defaultColor }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.button,
      { borderColor: isActive ? activeColor : Colors.tactical.border }
    ]}
  >
    <LinearGradient
      colors={isActive ? ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.1)'] : ['rgba(31, 41, 55, 0.5)', 'rgba(17, 24, 39, 0.5)']}
      style={styles.buttonGradient}
    >
      <MaterialCommunityIcons
        name={icon}
        size={24}
        color={isActive ? activeColor : defaultColor}
      />
      <ThemedText style={[
        styles.buttonLabel,
        { color: isActive ? activeColor : defaultColor }
      ]}>
        {label}
      </ThemedText>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.tactical.border,
    paddingBottom: 10,
  },
  appTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
