/**
 * LocationSelectorModal - 地点选择器Modal
 *
 * 功能：
 * - 搜索地点
 * - 获取附近地点
 * - 筛选地点（附近、热门、最近）
 * - 选择地点
 */
import * as ExpoLocation from 'expo-location';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// 导入API
import { publishApi } from '@/services/api';
import type { PublishLocation } from '@/services/api';

// 颜色常量
const COLORS = {
  PRIMARY: '#8A2BE2',
  BACKGROUND: '#FFFFFF',
  SEARCH_BACKGROUND: '#F5F5F5',
  TEXT_PRIMARY: '#000000',
  TEXT_SECONDARY: '#666666',
  TEXT_PLACEHOLDER: '#999999',
  BORDER: '#E5E5E5',
} as const;

// 位置类型 - 兼容接口
export interface LocationData {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

interface LocationSelectorModalProps {
  visible: boolean;
  onSelect: (location: LocationData) => void;
  onClose: () => void;
}

type FilterType = 'nearby' | 'hot' | 'recent';

export default function LocationSelectorModal({
  visible,
  onSelect,
  onClose,
}: LocationSelectorModalProps) {
  const [searchText, setSearchText] = useState('');
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('nearby');
  const [recentLocations, setRecentLocations] = useState<LocationData[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // 获取当前位置
  const getCurrentLocation = useCallback(async () => {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('提示', '需要位置权限才能获取附近地点');
        return null;
      }

      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCurrentLocation(coords);
      return coords;
    } catch (error) {
      console.error('获取位置失败:', error);
      return null;
    }
  }, []);

  // 加载附近地点
  const loadNearbyLocations = useCallback(async () => {
    setLoading(true);
    try {
      let coords = currentLocation;
      if (!coords) {
        coords = await getCurrentLocation();
      }

      if (coords) {
        const nearbyLocations = await publishApi.getNearbyLocations(
          coords.latitude,
          coords.longitude,
          5000
        );
        setLocations(nearbyLocations.map(loc => ({
          id: loc.id,
          name: loc.name,
          address: loc.address,
          latitude: loc.latitude,
          longitude: loc.longitude,
          distance: loc.distance,
        })));
      }
    } catch (error) {
      console.error('加载附近地点失败:', error);
    } finally {
      setLoading(false);
    }
  }, [currentLocation, getCurrentLocation]);

  // 初始化
  useEffect(() => {
    if (visible) {
      if (activeFilter === 'nearby') {
        loadNearbyLocations();
      } else if (activeFilter === 'recent') {
        setLocations(recentLocations);
      }
    }
  }, [visible, activeFilter, loadNearbyLocations, recentLocations]);

  // 切换筛选器
  const handleFilterChange = useCallback((filter: FilterType) => {
    setActiveFilter(filter);
    setSearchText('');

    if (filter === 'nearby') {
      loadNearbyLocations();
    } else if (filter === 'recent') {
      setLocations(recentLocations);
    }
  }, [loadNearbyLocations, recentLocations]);

  // 搜索地点
  const handleSearch = useCallback(async (text: string) => {
    setSearchText(text);

    if (!text.trim()) {
      if (activeFilter === 'nearby') {
        loadNearbyLocations();
      } else if (activeFilter === 'recent') {
        setLocations(recentLocations);
      }
      return;
    }

    setLoading(true);
    try {
      const searchResults = await publishApi.searchLocations(
        text,
        currentLocation?.latitude,
        currentLocation?.longitude
      );
      setLocations(searchResults.map(loc => ({
        id: loc.id,
        name: loc.name,
        address: loc.address,
        latitude: loc.latitude,
        longitude: loc.longitude,
        distance: loc.distance,
      })));
    } catch (error) {
      console.error('搜索地点失败:', error);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, currentLocation, loadNearbyLocations, recentLocations]);

  // 选择地点
  const handleSelectLocation = useCallback((location: LocationData) => {
    // 添加到最近使用
    const updatedRecent = [location, ...recentLocations.filter(c => c.id !== location.id)].slice(0, 10);
    setRecentLocations(updatedRecent);

    onSelect(location);
  }, [recentLocations, onSelect]);

  // 格式化距离
  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  // 渲染地点项
  const renderLocationItem = useCallback(({ item }: { item: LocationData }) => {
    return (
      <TouchableOpacity
        style={styles.locationItem}
        onPress={() => handleSelectLocation(item)}
        activeOpacity={0.7}
      >
        <View style={styles.locationIcon}>
          <Text style={styles.locationIconText}>📍</Text>
        </View>

        <View style={styles.locationContent}>
          <Text style={styles.locationName}>{item.name}</Text>
          <Text style={styles.locationAddress} numberOfLines={1}>
            {item.address}
          </Text>
        </View>

        {item.distance !== undefined && (
          <Text style={styles.locationDistance}>
            {formatDistance(item.distance)}
          </Text>
        )}
      </TouchableOpacity>
    );
  }, [handleSelectLocation]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* 顶部导航 */}
        {/* Header hidden */}

        {/* 搜索?'*/}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="搜索地点"
              placeholderTextColor={COLORS.TEXT_PLACEHOLDER}
              value={searchText}
              onChangeText={handleSearch}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Text style={styles.clearIcon}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>


        {/* 筛选标签 */}
        {!searchText.trim() && (
          <View style={styles.filterSection}>
            <TouchableOpacity
              style={[styles.filterTab, activeFilter === 'nearby' && styles.filterTabActive]}
              onPress={() => handleFilterChange('nearby')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, activeFilter === 'nearby' && styles.filterTabTextActive]}>
                附近
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, activeFilter === 'recent' && styles.filterTabActive]}
              onPress={() => handleFilterChange('recent')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, activeFilter === 'recent' && styles.filterTabTextActive]}>
                最近
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 地点列表 */}
        <View style={styles.listContainer}>
          {!searchText.trim() && locations.length === 0 && activeFilter === 'recent' && (
            <View style={styles.emptyRecentContainer}>
              <Text style={styles.emptyRecentText}>暂无最近使用的城市</Text>
              <Text style={styles.emptyRecentHint}>选择城市后会显示在这里</Text>
            </View>
          )}
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            </View>
          ) : (
            <FlatList
              data={locations}
              renderItem={renderLocationItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>暂无相关地点</Text>
                </View>
              }
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.BORDER,
  },
  cancelButton: {
    padding: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.PRIMARY,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  placeholder: {
    width: 48,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SEARCH_BACKGROUND,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 36,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    padding: 0,
  },
  clearIcon: {
    fontSize: 20,
    color: COLORS.TEXT_SECONDARY,
    paddingHorizontal: 4,
  },
  filterSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.BORDER,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: COLORS.SEARCH_BACKGROUND,
  },
  filterTabActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  filterTabText: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: COLORS.BACKGROUND,
  },
  emptyRecentContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyRecentText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  emptyRecentHint: {
    fontSize: 13,
    color: COLORS.TEXT_PLACEHOLDER,
  },
  listContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.BORDER,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.SEARCH_BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationIconText: {
    fontSize: 20,
  },
  locationContent: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
  },
  locationDistance: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 8,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.TEXT_SECONDARY,
  },
  hotCitiesSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  hotCitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  hotCityItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.SEARCH_BACKGROUND,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    minWidth: 70,
    alignItems: 'center',
  },
  hotCityText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '500',
  },
});

