/**
 * 组局中心列表页 - Activity List Page
 * 显示所有活动列表,支持筛选和下拉刷新
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { activityApi, type ActivityListItem } from '@/services/api';

export default function ActivityListPage() {
  const [activities, setActivities] = useState<ActivityListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageNum, setPageNum] = useState(1);
  const [filters, setFilters] = useState({
    sortBy: 'smart',
    gender: 'all' as 'all' | 'male' | 'female',
    memberCount: undefined as string | undefined,
    activityType: [] as string[],
  });

  // 加载活动列表
  const loadActivities = useCallback(async (page: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else if (page === 1) {
        setIsLoading(true);
      }

      const response = await activityApi.getActivityList({
        pageNum: page,
        pageSize: 10,
        sortBy: filters.sortBy,
        filters: {
          gender: filters.gender,
          memberCount: filters.memberCount,
          activityType: filters.activityType.length > 0 ? filters.activityType : undefined,
        },
      });

      if (response.success && response.data) {
        const newActivities = response.data.list;
        if (refresh || page === 1) {
          setActivities(newActivities);
        } else {
          setActivities(prev => [...prev, ...newActivities]);
        }
        setHasMore(response.data.hasMore);
        setPageNum(page);
      }
    } catch (error) {
      console.error('加载活动列表失败:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filters]);

  // 初始加载
  useEffect(() => {
    loadActivities(1);
  }, []);

  // 下拉刷新
  const onRefresh = useCallback(() => {
    loadActivities(1, true);
  }, [loadActivities]);

  // 加载更多
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadActivities(pageNum + 1);
    }
  }, [isLoading, hasMore, pageNum, loadActivities]);

  // 跳转到活动详情
  const navigateToDetail = (activityId: number) => {
    router.push(`/activity/detail?id=${activityId}`);
  };

  // 跳转到发布页面
  const navigateToPublish = () => {
    router.push('/activity/publish');
  };

  // 打开筛选面板
  const openFilterPanel = () => {
    router.push('/activity/filter');
  };

  // 渲染活动卡片
  const renderActivityCard = (activity: ActivityListItem) => (
    <TouchableOpacity
      key={activity.activityId}
      style={styles.activityCard}
      onPress={() => navigateToDetail(activity.activityId)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{activity.organizer.nickname[0]}</Text>
        </View>
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.organizerName}>{activity.organizer.nickname}</Text>
          <View style={styles.tagsRow}>
            {activity.tags.map((tag, index) => (
              <View
                key={index}
                style={[
                  styles.tag,
                  tag.type === 'price' ? styles.tagPrice : styles.tagFeature,
                ]}
              >
                <Text style={styles.tagText}>{tag.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.activityInfo}>
          <Text style={styles.activityType}>{activity.activityType.label}</Text>
          {activity.title && <Text style={styles.activityTitle}>{activity.title}</Text>}
        </View>

        <Text style={styles.price}>{activity.price.displayText}</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>🕒 {activity.schedule.displayText}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoText} numberOfLines={1}>
            📍 {activity.location.address}
          </Text>
        </View>
        
        <View style={styles.participantsRow}>
          <Text style={styles.participantsText}>{activity.participants.displayText}</Text>
          <View
            style={[
              styles.statusBadge,
              activity.status === 'open' ? styles.statusOpen : styles.statusClosed,
            ]}
          >
            <Text style={styles.statusText}>
              {activity.status === 'open' ? '报名中' : activity.status === 'full' ? '已满' : '已关闭'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && activities.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>组局中心</Text>
        <TouchableOpacity style={styles.publishButton} onPress={navigateToPublish}>
          <Text style={styles.publishButtonText}>发布组局</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>{filters.sortBy === 'smart' ? '智能排序' : '最新发布'}</Text>
          <Text style={styles.filterArrow}>▼</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>
            {filters.gender === 'all' ? '不限性别' : filters.gender === 'male' ? '男' : '女'}
          </Text>
          <Text style={styles.filterArrow}>▼</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterButton} onPress={openFilterPanel}>
          <Text style={styles.filterButtonText}>成员</Text>
          <Text style={styles.filterArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Activity List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          if (isCloseToBottom) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {activities.map(renderActivityCard)}
        
        {isLoading && activities.length > 0 && (
          <View style={styles.loadMoreContainer}>
            <ActivityIndicator size="small" color="#7C3AED" />
          </View>
        )}
        
        {!hasMore && activities.length > 0 && (
          <View style={styles.endContainer}>
            <Text style={styles.endText}>没有更多了</Text>
          </View>
        )}

        {activities.length === 0 && !isLoading && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无活动</Text>
            <Text style={styles.emptySubtext}>快来发布第一个组局吧!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  publishButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#7C3AED',
    borderRadius: 20,
  },
  publishButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    gap: 4,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#475569',
  },
  filterArrow: {
    fontSize: 10,
    color: '#94A3B8',
  },
  scrollView: {
    flex: 1,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardHeaderInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagFeature: {
    backgroundColor: '#D1FAE5',
  },
  tagPrice: {
    backgroundColor: '#FED7AA',
  },
  tagText: {
    fontSize: 12,
    color: '#1E293B',
  },
  cardContent: {
    gap: 8,
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
  activityTitle: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
  },
  participantsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  participantsText: {
    fontSize: 14,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusOpen: {
    backgroundColor: '#D1FAE5',
  },
  statusClosed: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  endContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  endText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
  },
});
