// #region 1. File Banner & TOC
/**
 * LocationMainPage - 位置服务主页�?
 * 功能描述：GPS定位与城市选择系统
 * TOC: [1] Imports - [2] Types - [3] Constants - [4] Utils - [5] State - [6] Logic - [7] UI - [8] Exports
 */
// #endregion

// #region 2. Imports
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LocationSelectorModal, { LocationData } from '../../../../../app/modal/location-selector';
import { useLocationStore } from '../../../../../stores';
import { ErrorBoundary, LoadingOverlay } from '../../../../components';
// #endregion

// #region 3. Types & Schema
interface LocationPageProps {}
type PermissionStatus = 'unknown' | 'requesting' | 'granted' | 'denied' | 'blocked';
// #endregion

// #region 4. Constants & Config
const COLORS = { BACKGROUND: '#FFFFFF', PRIMARY: '#6366F1', TEXT: '#1F2937', TEXT_SECONDARY: '#6B7280', BORDER: '#E5E7EB', SUCCESS: '#10B981', ERROR: '#EF4444' };
// #endregion

// #region 5. Utils & Helpers
// 工具函数
// #endregion

// #region 6. State Management
const useLocationState = () => {
  const { currentLocation, permission, updateLocation, requestPermission } = useLocationStore();
  const [locating, setLocating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  return { currentLocation, permission, locating, setLocating, updateLocation, requestPermission, showModal, setShowModal };
};
// #endregion

// #region 7. Domain Logic
const useLocationLogic = () => {
  const router = useRouter();
  const { currentLocation, permission, locating, setLocating, updateLocation, requestPermission, showModal, setShowModal } = useLocationState();
  
  const handleRequestLocation = useCallback(async () => {
    setLocating(true);
    try {
      await requestPermission();
      await updateLocation();
    } finally {
      setLocating(false);
    }
  }, [requestPermission, updateLocation, setLocating]);
  
  const handleManualSelect = useCallback(() => {
    setShowModal(true);
  }, [setShowModal]);
  
  const handleLocationSelect = useCallback((location: LocationData) => {
    // 更新位置到store
    updateLocation({
      city: location.name,
      district: location.address,
      coordinates: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      timestamp: Date.now(),
    });
    setShowModal(false);
    router.back();
  }, [updateLocation, setShowModal, router]);
  
  return { 
    currentLocation, 
    permission, 
    locating, 
    handleRequestLocation, 
    handleManualSelect, 
    handleBack: () => router.back(),
    showModal,
    setShowModal,
    handleLocationSelect,
  };
};
// #endregion

// #region 8. UI Components & Rendering
const LocationMainPage: React.FC<LocationPageProps> = () => {
  const { 
    currentLocation, 
    permission, 
    locating, 
    handleRequestLocation, 
    handleManualSelect, 
    handleBack,
    showModal,
    setShowModal,
    handleLocationSelect,
  } = useLocationLogic();
  
  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <View style={styles.header}>
        {/* header hidden */}
        </View>
        
        <ScrollView style={styles.content}>
          {currentLocation ? (
            <View style={styles.currentLocation}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText}>{currentLocation.city}</Text>
              <Text style={styles.locationDetail}>{currentLocation.district}</Text>
              
              <TouchableOpacity style={styles.changeButton} onPress={handleManualSelect}>
                <Text style={styles.changeButtonText}>更换位置</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.permissionSection}>
              <Text style={styles.permissionIcon}>📍</Text>
              <Text style={styles.permissionTitle}>选择位置</Text>
              <Text style={styles.permissionDescription}>为了为您推荐附近的服务，请选择您的位置</Text>
              
              <TouchableOpacity style={styles.locationButton} onPress={handleRequestLocation} disabled={locating}>
                <Text style={styles.locationButtonText}>{locating ? '定位中...' : '使用当前位置'}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.manualButton} onPress={handleManualSelect}>
                <Text style={styles.manualButtonText}>手动选择城市</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
        
        {locating && <LoadingOverlay loading={locating} text="正在定位..." />}
        
        {/* 位置选择Modal */}
        <LocationSelectorModal
          visible={showModal}
          onSelect={handleLocationSelect}
          onClose={() => setShowModal(false)}
        />
      </View>
    </ErrorBoundary>
  );
};
// #endregion

// #region 9. Exports & Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER },
  backButton: { fontSize: 24, color: COLORS.TEXT, marginRight: 16 },
  title: { flex: 1, fontSize: 18, fontWeight: '600', color: COLORS.TEXT, textAlign: 'center' },
  content: { flex: 1, padding: 16 },
  currentLocation: { alignItems: 'center', padding: 24, backgroundColor: COLORS.SURFACE, borderRadius: 12, marginBottom: 16 },
  locationIcon: { fontSize: 48, marginBottom: 8 },
  locationText: { fontSize: 20, fontWeight: '600', color: COLORS.TEXT, marginBottom: 4 },
  locationDetail: { fontSize: 14, color: COLORS.TEXT_SECONDARY },
  permissionSection: { alignItems: 'center', padding: 24 },
  permissionIcon: { fontSize: 64, marginBottom: 16 },
  permissionTitle: { fontSize: 20, fontWeight: '600', color: COLORS.TEXT, marginBottom: 8 },
  permissionDescription: { fontSize: 14, color: COLORS.TEXT_SECONDARY, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  locationButton: { backgroundColor: COLORS.PRIMARY, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8, marginBottom: 12 },
  locationButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.BACKGROUND },
  manualButton: { paddingVertical: 8 },
  manualButtonText: { fontSize: 14, color: COLORS.PRIMARY },
  changeButton: { marginTop: 16, paddingVertical: 8, paddingHorizontal: 24, borderWidth: 1, borderColor: COLORS.PRIMARY, borderRadius: 8 },
  changeButtonText: { fontSize: 14, color: COLORS.PRIMARY, fontWeight: '500' },
  placeholder: { fontSize: 14, color: COLORS.TEXT_SECONDARY, textAlign: 'center', paddingTop: 40 },
});

export default LocationMainPage;
// #endregion
