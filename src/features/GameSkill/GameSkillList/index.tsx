/**
 * GameSkillList - L1 Page Component
 * Skill service list page (game companion service list)
 *
 * Invocation: Route from homepage game cards via expo-router
 * Logic: Orchestrate L2 areas, manage store initialization, handle navigation
 * Internal: NavArea, FilterArea, TabArea, QuickTagArea, ContentListArea
 * External: useSkillStore, expo-router, expo-location
 */
import React, { useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';

// L2 Area Components
import { NavArea } from './NavArea';
import { FilterArea } from './FilterArea';
import { TabArea } from './TabArea';
import { QuickTagArea } from './QuickTagArea';
import { ContentListArea } from './ContentListArea';

// Modal Components
import { SortBottomSheet, GenderBottomSheet, FilterBottomSheet } from './modals';

// Store
import { useSkillStore } from '../stores';

// Types and Constants
import type { SkillServiceItemVO } from '../api/types';
import { GAME_NAME_MAP, DEFAULT_GAME_ID, DEFAULT_QUICK_TAGS } from './constants';

export default function GameSkillList() {
  const router = useRouter();
  const params = useLocalSearchParams<{ skillType?: string; gameId?: string }>();

  // Store state and actions
  const {
    tabs,
    quickTags,
    skillList,
    activeTab,
    sortBy,
    gender,
    activeQuickTag,
    advancedFilters,
    isListLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    setGameId,
    setUserLocation,
    loadConfig,
    loadList,
    refreshList,
    setActiveTab,
    setSortBy,
    setGender,
    toggleQuickTag,
    setAdvancedFilters,
    reset,
  } = useSkillStore();

  // Modal visibility states
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [showGenderSheet, setShowGenderSheet] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // Derive game ID and title from route params
  const gameId = params.gameId || DEFAULT_GAME_ID;
  const title = params.skillType || GAME_NAME_MAP[gameId] || '王者荣耀';

  // Initialize store and fetch data on mount
  useEffect(() => {
    setGameId(gameId);

    // Request location permission and update store
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords.latitude, location.coords.longitude);
      }
    })();

    loadConfig();
    loadList();

    return () => { reset(); };
  }, [gameId]);

  // Check if advanced filters are active for indicator display
  const hasActiveFilters = Object.keys(advancedFilters).length > 0;

  // Navigate to skill detail page
  const handleItemPress = useCallback((item: SkillServiceItemVO) => {
    router.push({
      pathname: '/service/detail/[serviceId]',
      params: { serviceId: item.skillId.toString() },
    });
  }, [router]);

  // Trigger pagination load
  const handleLoadMore = useCallback(() => {
    loadList(true);
  }, [loadList]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Navigation bar with back button and title */}
      <NavArea title={title} />

      {/* Sort, gender, filter controls */}
      <FilterArea
        sortBy={sortBy}
        gender={gender}
        hasActiveFilters={hasActiveFilters}
        onSortPress={() => setShowSortSheet(true)}
        onGenderPress={() => setShowGenderSheet(true)}
        onFilterPress={() => setShowFilterSheet(true)}
      />

      {/* Horizontal scrollable tabs */}
      <TabArea
        tabs={tabs.length > 0 ? tabs : [{ value: 'glory_king', label: '荣耀王者' }]}
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />

      {/* Quick filter tag pills */}
      <QuickTagArea
        tags={quickTags.length > 0 ? quickTags : DEFAULT_QUICK_TAGS}
        activeTag={activeQuickTag}
        onTagPress={toggleQuickTag}
      />

      {/* Skill service card list with pull-to-refresh and pagination */}
      <ContentListArea
        data={skillList}
        isLoading={isListLoading}
        isRefreshing={isRefreshing}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onRefresh={refreshList}
        onLoadMore={handleLoadMore}
        onItemPress={handleItemPress}
      />

      {/* Sort selection bottom sheet */}
      <SortBottomSheet
        visible={showSortSheet}
        currentValue={sortBy}
        onSelect={(value) => { setSortBy(value); setShowSortSheet(false); }}
        onClose={() => setShowSortSheet(false)}
      />

      {/* Gender filter bottom sheet */}
      <GenderBottomSheet
        visible={showGenderSheet}
        currentValue={gender}
        onSelect={(value) => { setGender(value); setShowGenderSheet(false); }}
        onClose={() => setShowGenderSheet(false)}
      />

      {/* Advanced filter panel */}
      <FilterBottomSheet
        visible={showFilterSheet}
        currentFilters={advancedFilters}
        onApply={(filters) => { setAdvancedFilters(filters); setShowFilterSheet(false); }}
        onReset={() => { setAdvancedFilters({}); setShowFilterSheet(false); }}
        onClose={() => setShowFilterSheet(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
