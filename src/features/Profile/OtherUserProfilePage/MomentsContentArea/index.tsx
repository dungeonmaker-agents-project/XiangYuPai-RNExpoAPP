// #region 1. File Banner & TOC
/**
 * MomentsContentArea - 动态Tab内容区域
 *
 * 对应UI文档: MomentsContentArea [L3]
 * 布局: 2列瀑布流
 *
 * 功能：
 * - 展示用户动态列表
 * - 2列瀑布流布局
 * - 上拉加载更多
 * - 点赞功能（带动画）
 * - 点击进入详情页
 *
 * TOC:
 * [1] File Banner & TOC
 * [2] Imports
 * [3] Types
 * [4] Main Component
 * [5] Styles
 * [6] Export
 */
// #endregion

// #region 2. Imports

import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import MomentCard from './MomentCard';
import type { MomentsListData, MomentItem } from '../types';

// #endregion

// #region 3. Types

interface MomentsContentAreaProps {
  momentsData: MomentsListData | null;
  loading?: boolean;
  error?: string | null;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  onMomentPress?: (momentId: string) => void;
  onLikePress?: (momentId: string) => void;
  refreshing?: boolean;
}

// #endregion

// #region 4. Main Component

const COLUMN_GAP = 8;
const ITEM_GAP = 8;
const HORIZONTAL_PADDING = 12;

const MomentsContentArea: React.FC<MomentsContentAreaProps> = ({
  momentsData,
  loading = false,
  error = null,
  hasMore = false,
  onLoadMore,
  onRefresh,
  onMomentPress,
  onLikePress,
  refreshing = false,
}) => {
  const router = useRouter();

  // 将数据分成左右两列（交错分布，考虑高度平衡）
  const { leftMoments, rightMoments } = useMemo(() => {
    if (!momentsData?.list) {
      return { leftMoments: [], rightMoments: [] };
    }

    const left: MomentItem[] = [];
    const right: MomentItem[] = [];
    let leftHeight = 0;
    let rightHeight = 0;

    momentsData.list.forEach((moment) => {
      // 估算卡片高度：封面高度 + 内容高度
      const aspectRatio = moment.mediaData.aspectRatio || 0.75;
      const estimatedHeight = 160 / aspectRatio + 60; // 假设宽度160

      if (leftHeight <= rightHeight) {
        left.push(moment);
        leftHeight += estimatedHeight;
      } else {
        right.push(moment);
        rightHeight += estimatedHeight;
      }
    });

    return { leftMoments: left, rightMoments: right };
  }, [momentsData?.list]);

  // 处理动态点击
  const handleMomentPress = useCallback(
    (momentId: string) => {
      if (onMomentPress) {
        onMomentPress(momentId);
      } else {
        router.push(`/feed/${momentId}` as any);
      }
    },
    [onMomentPress, router]
  );

  // 处理点赞
  const handleLikePress = useCallback(
    (momentId: string) => {
      onLikePress?.(momentId);
    },
    [onLikePress]
  );

  // 处理滚动到底部
  const handleScroll = useCallback(
    (event: any) => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const paddingToBottom = 50;
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom;

      if (isCloseToBottom && hasMore && !loading && onLoadMore) {
        onLoadMore();
      }
    },
    [hasMore, loading, onLoadMore]
  );

  // 渲染空状态
  const renderEmpty = () => {
    if (loading && !momentsData) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#8A2BE2" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          {onRefresh && (
            <Text style={styles.retryButton} onPress={onRefresh}>
              点击重试
            </Text>
          )}
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Ionicons name="images-outline" size={64} color="#CCCCCC" />
        <Text style={styles.emptyTitle}>暂无动态</Text>
        <Text style={styles.emptyHint}>该用户还未发布动态</Text>
      </View>
    );
  };

  // 渲染底部
  const renderFooter = () => {
    if (loading && momentsData && momentsData.list.length > 0) {
      return (
        <View style={styles.footerLoading}>
          <ActivityIndicator size="small" color="#8A2BE2" />
          <Text style={styles.footerText}>加载中...</Text>
        </View>
      );
    }

    if (!hasMore && momentsData && momentsData.list.length > 0) {
      return (
        <View style={styles.footerEnd}>
          <Text style={styles.footerEndText}>- 没有更多了 -</Text>
        </View>
      );
    }

    return null;
  };

  // 无数据
  if (!momentsData || momentsData.list.length === 0) {
    return renderEmpty();
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={400}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8A2BE2']}
            tintColor="#8A2BE2"
          />
        ) : undefined
      }
    >
      {/* 瀑布流容器 */}
      <View style={styles.waterfallContainer}>
        {/* 左列 */}
        <View style={styles.column}>
          {leftMoments.map((moment) => (
            <MomentCard
              key={moment.id}
              moment={moment}
              onPress={handleMomentPress}
              onLikePress={handleLikePress}
              style={styles.card}
            />
          ))}
        </View>

        {/* 右列 */}
        <View style={styles.column}>
          {rightMoments.map((moment) => (
            <MomentCard
              key={moment.id}
              moment={moment}
              onPress={handleMomentPress}
              onLikePress={handleLikePress}
              style={styles.card}
            />
          ))}
        </View>
      </View>

      {/* 底部 */}
      {renderFooter()}
    </ScrollView>
  );
};

// #endregion

// #region 5. Styles

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 12,
  },
  waterfallContainer: {
    flexDirection: 'row',
    gap: COLUMN_GAP,
  },
  column: {
    flex: 1,
  },
  card: {
    marginBottom: ITEM_GAP,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 14,
    color: '#999999',
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    fontSize: 14,
    color: '#8A2BE2',
    fontWeight: '500',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginTop: 16,
  },
  emptyHint: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
  },
  footerLoading: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
  },
  footerEnd: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerEndText: {
    fontSize: 12,
    color: '#CCCCCC',
  },
});

// #endregion

// #region 6. Export

export default MomentsContentArea;

// #endregion
