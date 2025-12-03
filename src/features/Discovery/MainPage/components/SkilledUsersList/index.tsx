// #region 1. File Banner & TOC
/**
 * SkilledUsersList - 有技能用户列表组件
 *
 * 功能：
 * - 展示有技能用户列表（双列瀑布流）
 * - 下拉刷新和无限滚动
 * - 筛选条件（性别、排序）
 * - 空状态和加载状态
 *
 * TOC (快速跳转):
 * [1] File Banner & TOC
 * [2] Imports
 * [3] Types & Schema
 * [4] Constants & Config
 * [5] State Management
 * [6] UI Components & Rendering
 * [7] Exports
 */
// #endregion

// #region 2. Imports
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { useDiscoveryStore } from '@/stores';
import type { SkilledUserVO } from '@/services/api/discoveryApi';
import SkilledUserCard from '../SkilledUserCard';
// #endregion

// #region 3. Types & Schema
export interface SkilledUsersListProps {
  onUserPress?: (userId: number) => void;
}
// #endregion

// #region 4. Constants & Config
const SCREEN_WIDTH = Dimensions.get('window').width;
const COLUMN_GAP = 12;
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2;

const COLORS = {
  BACKGROUND: '#F5F5F5',
  FILTER_BG: '#FFFFFF',
  FILTER_ACTIVE: '#FF4D6A',
  FILTER_INACTIVE: '#666666',
  FILTER_ACTIVE_BG: '#FFF0F5',
  EMPTY_TEXT: '#999999',
  BORDER: '#E8E8E8',
} as const;
// #endregion

// #region 5. State Management
const useSkilledUsersListState = () => {
  const skilledUsers = useDiscoveryStore((state) => state.skilledUsers);
  const loadSkilledUsers = useDiscoveryStore((state) => state.loadSkilledUsers);
  const loadMoreSkilledUsers = useDiscoveryStore((state) => state.loadMoreSkilledUsers);
  const setSkilledUsersFilter = useDiscoveryStore((state) => state.setSkilledUsersFilter);

  // 初始化加载
  useEffect(() => {
    if (skilledUsers.list.length === 0 && !skilledUsers.loading) {
      loadSkilledUsers();
    }
  }, []);

  return {
    skilledUsers,
    loadSkilledUsers,
    loadMoreSkilledUsers,
    setSkilledUsersFilter,
  };
};
// #endregion

// #region 6. UI Components & Rendering
/**
 * 筛选栏组件
 */
const FilterBar: React.FC<{
  gender: 'all' | 'male' | 'female';
  sortBy: 'smart_recommend' | 'price_asc' | 'price_desc' | 'distance_asc';
  onGenderChange: (gender: 'all' | 'male' | 'female') => void;
  onSortChange: (sortBy: 'smart_recommend' | 'price_asc' | 'price_desc' | 'distance_asc') => void;
}> = ({ gender, sortBy, onGenderChange, onSortChange }) => {
  const genderOptions: Array<{ value: 'all' | 'male' | 'female'; label: string }> = [
    { value: 'all', label: '不限' },
    { value: 'male', label: '男生' },
    { value: 'female', label: '女生' },
  ];

  const sortOptions: Array<{ value: 'smart_recommend' | 'price_asc' | 'price_desc' | 'distance_asc'; label: string }> = [
    { value: 'smart_recommend', label: '推荐' },
    { value: 'price_asc', label: '价格↑' },
    { value: 'price_desc', label: '价格↓' },
    { value: 'distance_asc', label: '距离' },
  ];

  return (
    <View style={styles.filterBar}>
      {/* 性别筛选 */}
      <View style={styles.filterGroup}>
        {genderOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterButton,
              gender === option.value && styles.filterButtonActive,
            ]}
            onPress={() => onGenderChange(option.value)}
          >
            <Text
              style={[
                styles.filterButtonText,
                gender === option.value && styles.filterButtonTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 分隔线 */}
      <View style={styles.filterDivider} />

      {/* 排序筛选 */}
      <View style={styles.filterGroup}>
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterButton,
              sortBy === option.value && styles.filterButtonActive,
            ]}
            onPress={() => onSortChange(option.value)}
          >
            <Text
              style={[
                styles.filterButtonText,
                sortBy === option.value && styles.filterButtonTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

/**
 * 空状态组件
 */
const EmptyState: React.FC = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>暂无有技能的用户</Text>
    <Text style={styles.emptySubText}>换个筛选条件试试吧</Text>
  </View>
);

/**
 * 底部加载组件
 */
const FooterLoading: React.FC<{ loading: boolean; hasMore: boolean }> = ({
  loading,
  hasMore,
}) => {
  if (loading) {
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={COLORS.FILTER_ACTIVE} />
        <Text style={styles.footerText}>加载中...</Text>
      </View>
    );
  }
  if (!hasMore) {
    return (
      <View style={styles.footerLoading}>
        <Text style={styles.footerText}>没有更多了</Text>
      </View>
    );
  }
  return null;
};

/**
 * 有技能用户列表主组件
 */
const SkilledUsersList: React.FC<SkilledUsersListProps> = ({ onUserPress }) => {
  const router = useRouter();
  const {
    skilledUsers,
    loadSkilledUsers,
    loadMoreSkilledUsers,
    setSkilledUsersFilter,
  } = useSkilledUsersListState();

  const { list, loading, refreshing, hasMore, filters } = skilledUsers;

  // 处理用户点击
  const handleUserPress = useCallback((userId: number) => {
    if (onUserPress) {
      onUserPress(userId);
    } else {
      // 默认跳转到用户详情页
      console.log('查看用户详情:', userId);
      // router.push(`/user/${userId}` as any);
    }
  }, [onUserPress, router]);

  // 处理下拉刷新
  const handleRefresh = useCallback(() => {
    loadSkilledUsers(true);
  }, [loadSkilledUsers]);

  // 处理加载更多
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadMoreSkilledUsers();
    }
  }, [loading, hasMore, loadMoreSkilledUsers]);

  // 处理性别筛选变化
  const handleGenderChange = useCallback((gender: 'all' | 'male' | 'female') => {
    setSkilledUsersFilter({ gender });
  }, [setSkilledUsersFilter]);

  // 处理排序变化
  const handleSortChange = useCallback((sortBy: 'smart_recommend' | 'price_asc' | 'price_desc' | 'distance_asc') => {
    setSkilledUsersFilter({ sortBy });
  }, [setSkilledUsersFilter]);

  // 双列数据准备
  const columnData = useMemo(() => {
    const leftColumn: SkilledUserVO[] = [];
    const rightColumn: SkilledUserVO[] = [];
    list.forEach((item, index) => {
      if (index % 2 === 0) {
        leftColumn.push(item);
      } else {
        rightColumn.push(item);
      }
    });
    return { leftColumn, rightColumn };
  }, [list]);

  // 渲染列
  const renderColumn = (data: SkilledUserVO[], isLeft: boolean) => (
    <View style={[styles.column, isLeft ? styles.leftColumn : styles.rightColumn]}>
      {data.map((user) => (
        <SkilledUserCard
          key={user.userId}
          user={user}
          cardWidth={CARD_WIDTH}
          onPress={handleUserPress}
        />
      ))}
    </View>
  );

  // 渲染内容
  const renderContent = () => {
    if (loading && list.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.FILTER_ACTIVE} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      );
    }

    if (list.length === 0) {
      return <EmptyState />;
    }

    return (
      <View style={styles.columnsContainer}>
        {renderColumn(columnData.leftColumn, true)}
        {renderColumn(columnData.rightColumn, false)}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 筛选栏 */}
      <FilterBar
        gender={filters.gender}
        sortBy={filters.sortBy}
        onGenderChange={handleGenderChange}
        onSortChange={handleSortChange}
      />

      {/* 用户列表 */}
      <FlatList
        data={[{ key: 'content' }]}
        renderItem={() => renderContent()}
        style={styles.listContainer}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.FILTER_ACTIVE]}
            tintColor={COLORS.FILTER_ACTIVE}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          list.length > 0 ? (
            <FooterLoading loading={loading} hasMore={hasMore} />
          ) : null
        }
      />
    </View>
  );
};
// #endregion

// #region 7. Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.FILTER_BG,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.BORDER,
    marginHorizontal: 12,
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginHorizontal: 2,
  },
  filterButtonActive: {
    backgroundColor: COLORS.FILTER_ACTIVE_BG,
  },
  filterButtonText: {
    fontSize: 13,
    color: COLORS.FILTER_INACTIVE,
  },
  filterButtonTextActive: {
    color: COLORS.FILTER_ACTIVE,
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 12,
    paddingBottom: 20,
  },
  columnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: CARD_WIDTH,
  },
  leftColumn: {
    marginRight: COLUMN_GAP / 2,
  },
  rightColumn: {
    marginLeft: COLUMN_GAP / 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.EMPTY_TEXT,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.EMPTY_TEXT,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.EMPTY_TEXT,
  },
  footerLoading: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 13,
    color: COLORS.EMPTY_TEXT,
  },
});
// #endregion

// #region 8. Exports
export default SkilledUsersList;
export type { SkilledUsersListProps };
// #endregion
