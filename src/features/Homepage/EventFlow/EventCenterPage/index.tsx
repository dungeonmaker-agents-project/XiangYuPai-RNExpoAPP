// #region 1. File Banner & TOC
/**
 * EventCenterPage - 组局中心页面
 * 功能描述：线下活动组织系统
 * TOC: [1] Imports - [2] Types - [3] Constants - [4] Utils - [5] State - [6] Logic - [7] UI - [8] Exports
 */
// #endregion

// #region 2. Imports
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Image, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ErrorBoundary } from '../../../../components';
// 使用 SharedComponents 中的共享弹窗组件
import {
  AdvancedFilterSheet,
  GenderBottomSheet,
  SortBottomSheet,
  type AdvancedFilters,
  type GenderOption,
  type SortOption,
} from '../../SharedComponents';
// #endregion

// #region 3. Types & Schema
interface EventCenterPageProps {}
interface EventData {
  eventId: string;
  title: string;
  organizer: { 
    nickname: string; 
    avatar: string;
    gender: 'male' | 'female';
  };
  startTime: string;
  location: { address: string; distance: number };
  currentCount: number;
  maxCount: number;
  price: number;
  status: 'open' | 'full' | 'closed';
  tags: string[];
}
// #endregion

// #region 4. Constants & Config
const COLORS = { 
  BACKGROUND: '#F8F9FA', 
  PRIMARY: '#8B5CF6', 
  TEXT: '#1F2937', 
  TEXT_SECONDARY: '#6B7280', 
  BORDER: '#E5E7EB',
  CARD_BG: '#FFFFFF',
  PRICE: '#FF6B6B',
  TAG_BG: '#E0F2FE',
  TAG_TEXT: '#0284C7',
  FEMALE_TAG: '#FDE2E4',
  FEMALE_TEXT: '#E63946',
};

// Mock data for testing
const MOCK_EVENTS: EventData[] = [
  {
    eventId: '1',
    title: 'k歌两小时',
    organizer: { nickname: 'k歌两小时', avatar: '', gender: 'female' },
    startTime: '6月10日18:00',
    location: { address: '福田区下沙KK ONE商业中心', distance: 2300 },
    currentCount: 12,
    maxCount: 16,
    price: 300,
    status: 'open',
    tags: ['可接急单', '官方认证'],
  },
  {
    eventId: '2',
    title: 'k歌两小时',
    organizer: { nickname: 'k歌两小时', avatar: '', gender: 'female' },
    startTime: '6月10日18:00',
    location: { address: '福田区下沙KK ONE商业中心', distance: 2300 },
    currentCount: 8,
    maxCount: 16,
    price: 300,
    status: 'open',
    tags: ['可接急单', '官方认证'],
  },
];
// #endregion

// #region 5-6. Utils & State Management
const useEventCenterLogic = () => {
  const router = useRouter();
  const [events] = useState<EventData[]>(MOCK_EVENTS);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [sortOption, setSortOption] = useState<SortOption>('smart');
  const [genderOption, setGenderOption] = useState<GenderOption>('all');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    status: 'all',
    area: [],
    rank: [],
    priceRange: [],
    position: [],
    tags: [],
    location: [],
  });
  
  // Bottom sheet visibility
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [showGenderSheet, setShowGenderSheet] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  
  const handleEventPress = useCallback((eventId: string) => {
    // Navigate to skill detail page with event contentType
    router.push(`/skill/${eventId}?contentType=event`);
  }, [router]);
  
  const handlePublish = useCallback(() => {
    router.push('/homepage/publish-event');
  }, [router]);
  
  const handleSortSelect = useCallback((sort: SortOption) => {
    setSortOption(sort);
    // TODO: Apply sorting
  }, []);
  
  const handleGenderSelect = useCallback((gender: GenderOption) => {
    setGenderOption(gender);
    // TODO: Apply gender filter
  }, []);
  
  const handleFilterApply = useCallback((filters: AdvancedFilters) => {
    setAdvancedFilters(filters);
    // TODO: Apply advanced filters
  }, []);
  
  const handleFilterReset = useCallback(() => {
    setAdvancedFilters({
      status: 'all',
      area: [],
      rank: [],
      priceRange: [],
      position: [],
      tags: [],
      location: [],
    });
  }, []);
  
  const getSortLabel = () => {
    const labels = { smart: '智能排序', latest: '最新', nearest: '最近', popular: '人气' };
    return labels[sortOption];
  };
  
  const getGenderLabel = () => {
    const labels = { all: '不限', female: '女生', male: '男生' };
    return labels[genderOption];
  };
  
  return { 
    events, 
    loading, 
    handleEventPress, 
    handlePublish, 
    handleBack: () => router.back(),
    // Filters
    sortOption,
    genderOption,
    advancedFilters,
    getSortLabel,
    getGenderLabel,
    handleSortSelect,
    handleGenderSelect,
    handleFilterApply,
    handleFilterReset,
    // Bottom sheets
    showSortSheet,
    setShowSortSheet,
    showGenderSheet,
    setShowGenderSheet,
    showFilterSheet,
    setShowFilterSheet,
  };
};
// #endregion

// #region 7. UI Components & Rendering
const EventCenterPage: React.FC<EventCenterPageProps> = () => {
  const { 
    events, 
    loading, 
    handleEventPress, 
    handlePublish, 
    handleBack,
    sortOption,
    genderOption,
    advancedFilters,
    getSortLabel,
    getGenderLabel,
    handleSortSelect,
    handleGenderSelect,
    handleFilterApply,
    handleFilterReset,
    showSortSheet,
    setShowSortSheet,
    showGenderSheet,
    setShowGenderSheet,
    showFilterSheet,
    setShowFilterSheet,
  } = useEventCenterLogic();
  
  const renderEventCard = ({ item }: { item: EventData }) => (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => handleEventPress(item.eventId)}
      activeOpacity={0.7}
    >
      {/* Avatar and Info */}
      <View style={styles.cardContent}>
        <Image 
          source={{ uri: item.organizer.avatar || 'https://via.placeholder.com/80' }}
          style={styles.avatar}
        />
        
        <View style={styles.eventInfo}>
          {/* Title and Gender Tag */}
          <View style={styles.titleRow}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            {item.organizer.gender === 'female' && (
              <View style={styles.genderTag}>
                <Text style={styles.genderTagText}>女生</Text>
              </View>
            )}
          </View>
          
          {/* Tags */}
          <View style={styles.tagsRow}>
            {item.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          
          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{item.price}</Text>
            <Text style={styles.priceUnit}>小时/人</Text>
          </View>
          
          {/* Time */}
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🕐</Text>
            <Text style={styles.infoText}>{item.startTime} {item.currentCount}/{item.maxCount}人报名止报名</Text>
          </View>
          
          {/* Location */}
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoText}>{item.location.address} {formatDistance(item.location.distance)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.BACKGROUND} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>组局中心</Text>
          <TouchableOpacity onPress={handlePublish} style={styles.publishButton}>
            <Text style={styles.publishButtonText}>发布组局</Text>
          </TouchableOpacity>
        </View>
        
        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowSortSheet(true)}
          >
            <Text style={styles.filterButtonText}>{getSortLabel()}</Text>
            <Text style={styles.filterArrow}>▼</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowGenderSheet(true)}
          >
            <Text style={styles.filterButtonText}>{getGenderLabel()}</Text>
            <Text style={styles.filterArrow}>▼</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterSheet(true)}
          >
            <Text style={styles.filterButtonText}>筛选</Text>
            <Text style={styles.filterArrow}>▼</Text>
          </TouchableOpacity>
        </View>
        
        {/* Event List */}
        {events.length > 0 ? (
          <FlatList
            data={events}
            renderItem={renderEventCard}
            keyExtractor={item => item.eventId}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={styles.emptyTitle}>暂无活动</Text>
            <Text style={styles.emptySubtitle}>发布一个组局活动吧</Text>
          </View>
        )}
        
        {/* Bottom Sheets */}
        <SortBottomSheet
          visible={showSortSheet}
          selectedSort={sortOption}
          onSelect={handleSortSelect}
          onClose={() => setShowSortSheet(false)}
        />
        
        <GenderBottomSheet
          visible={showGenderSheet}
          selectedGender={genderOption}
          onSelect={handleGenderSelect}
          onClose={() => setShowGenderSheet(false)}
        />
        
        <AdvancedFilterSheet
          visible={showFilterSheet}
          filters={advancedFilters}
          onApply={handleFilterApply}
          onReset={handleFilterReset}
          onClose={() => setShowFilterSheet(false)}
        />
      </SafeAreaView>
    </ErrorBoundary>
  );
};

const formatDistance = (distance: number) => distance < 1000 ? `${Math.round(distance)}m` : `${(distance/1000).toFixed(1)}km`;
// #endregion

// #region 8. Exports & Styles
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.BACKGROUND 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 16, 
    paddingVertical: 12,
    backgroundColor: COLORS.CARD_BG,
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.BORDER 
  },
  backButton: {
    padding: 4,
  },
  backButtonText: { 
    fontSize: 24, 
    color: COLORS.TEXT,
  },
  title: { 
    flex: 1, 
    fontSize: 18, 
    fontWeight: '600', 
    color: COLORS.TEXT, 
    textAlign: 'center',
    marginHorizontal: 16,
  },
  publishButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  publishButtonText: { 
    fontSize: 14, 
    color: COLORS.PRIMARY, 
    fontWeight: '600' 
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.CARD_BG,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.TEXT,
    marginRight: 4,
  },
  filterArrow: {
    fontSize: 10,
    color: COLORS.TEXT_SECONDARY,
  },
  listContent: {
    padding: 12,
  },
  eventCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.BORDER,
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: COLORS.TEXT,
    marginRight: 8,
  },
  genderTag: {
    backgroundColor: COLORS.FEMALE_TAG,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  genderTagText: {
    fontSize: 12,
    color: COLORS.FEMALE_TEXT,
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  tag: {
    backgroundColor: COLORS.TAG_BG,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  tagText: {
    fontSize: 11,
    color: COLORS.TAG_TEXT,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.PRICE,
  },
  priceUnit: {
    fontSize: 12,
    color: COLORS.PRICE,
    marginLeft: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  infoIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  infoText: { 
    fontSize: 12, 
    color: COLORS.TEXT_SECONDARY,
    flex: 1,
  },
  emptyState: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingTop: 100 
  },
  emptyIcon: { 
    fontSize: 64, 
    marginBottom: 16 
  },
  emptyTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: COLORS.TEXT, 
    marginBottom: 8 
  },
  emptySubtitle: { 
    fontSize: 14, 
    color: COLORS.TEXT_SECONDARY 
  },
});

export default EventCenterPage;
// #endregion
