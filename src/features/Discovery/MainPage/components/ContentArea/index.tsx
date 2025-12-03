// #region 1. File Banner & TOC
/**
 * ContentArea - 内容区域组件
 * 
 * 功能：
 * - 动态列表展示
 * - 下拉刷新
 * - 无限滚动加载
 * - 动态卡片交互
 * 
 * TOC (快速跳转):
 * [1] File Banner & TOC
 * [2] Imports
 * [3] Types & Schema
 * [4] Constants & Config
 * [5] Utils & Helpers
 * [6] State Management
 * [7] Domain Logic
 * [8] UI Components & Rendering
 * [9] Exports
 */
// #endregion

// #region 2. Imports
import React, { useCallback } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    View,
} from 'react-native';

// 类型
import type { Feed } from '../../../types';
import type { ContentAreaProps } from '../../types';

// 配置
import {
    calculateCardWidth,
    estimateFeedHeight as calculateFeedHeight,
    DISCOVERY_COLORS,
    DISCOVERY_TYPOGRAPHY,
    WATERFALL_CONFIG,
} from '../../config';

// 组件
import FeedCard from '../FeedCard';
import WaterfallList from './WaterfallList';
// #endregion

// #region 3. Types & Schema
// (使用ContentAreaProps from types.ts)
// #endregion

// #region 4. Constants & Config
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 使用集中配置计算卡片宽度
const CARD_WIDTH = calculateCardWidth(SCREEN_WIDTH);
// #endregion

// #region 5. Utils & Helpers
/**
 * 估算Feed卡片高度
 * 算法：根据Feed的mediaList计算图片高度，加上底部信息区域高度
 * 
 * 使用配置文件中的工具函数，确保与FeedCard逻辑一致
 */
const estimateFeedHeight = (feed: Feed, cardWidth: number): number => {
  const media = feed.mediaList?.[0];
  const imageWidth = media?.width;
  const imageHeight = media?.height;
  
  return calculateFeedHeight(imageWidth, imageHeight, cardWidth);
};
// #endregion

// #region 6. State Management
// (简单组件，状态由父组件管理)
// #endregion

// #region 7. Domain Logic
/**
 * ContentArea业务逻辑Hook
 */
const useContentLogic = (props: ContentAreaProps) => {
  const {
    feeds,
    loading,
    refreshing,
    hasMore,
    onRefresh,
    onLoadMore,
    onFeedPress,
    onUserPress,
    onTopicPress,
    onLike,
    onComment,
    onShare,
    onCollect,
  } = props;
  
  /**
   * 渲染动态卡片（瀑布流布局）
   * WaterfallList的renderItem签名: (item: T, width: number) => React.ReactElement
   */
  const renderFeedCard = useCallback((item: Feed, width: number) => {
    return (
      <FeedCard
        feed={item}
        cardWidth={width}
        onPress={onFeedPress}
        onUserPress={onUserPress}
        onLike={onLike}
        onCollect={onCollect}
      />
    );
  }, [onFeedPress, onUserPress, onLike, onCollect]);
  
  /**
   * 获取Feed卡片高度
   */
  const getItemHeight = useCallback((item: Feed, width: number) => {
    return estimateFeedHeight(item, width);
  }, []);
  
  /**
   * 渲染列表底部
   */
  const renderFooter = useCallback(() => {
    if (loading && feeds.length > 0) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={DISCOVERY_COLORS.PRIMARY} />
          <Text style={styles.footerText}>加载中...</Text>
        </View>
      );
    }
    
    if (!hasMore && feeds.length > 0) {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>没有更多了</Text>
        </View>
      );
    }
    
    return null;
  }, [loading, hasMore, feeds.length]);
  
  /**
   * 渲染空状态
   */
  const renderEmpty = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={DISCOVERY_COLORS.PRIMARY} />
          <Text style={styles.emptyText}>加载中...</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📭</Text>
        <Text style={styles.emptyText}>暂无动态</Text>
      </View>
    );
  }, [loading]);
  
  /**
   * 键提取
   */
  const keyExtractor = useCallback((item: Feed, index: number) => {
    return item.id ? String(item.id) : `feed-${index}`;
  }, []);
  
  /**
   * 到达底部处理
   */
  const handleEndReached = useCallback(() => {
    if (hasMore && !loading && !refreshing) {
      onLoadMore();
    }
  }, [hasMore, loading, refreshing, onLoadMore]);
  
  return {
    feeds,
    refreshing,
    renderFeedCard,
    renderFooter,
    renderEmpty,
    keyExtractor,
    handleEndReached,
    onRefresh,
    getItemHeight,
  };
};
// #endregion

// #region 8. UI Components & Rendering
/**
 * ContentArea主组件
 */
const ContentArea: React.FC<ContentAreaProps> = (props) => {
  const {
    feeds,
    refreshing,
    renderFeedCard,
    renderFooter,
    renderEmpty,
    keyExtractor,
    handleEndReached,
    onRefresh,
    getItemHeight,
  } = useContentLogic(props);

  console.log('[ContentArea] 渲染, activeTab:', props.activeTab, 'feeds数量:', feeds.length);

  return (
    <WaterfallList
      key={props.activeTab} // 强制在Tab切换时重新渲染
      data={feeds}
      renderItem={renderFeedCard}
      keyExtractor={keyExtractor}
      numColumns={WATERFALL_CONFIG.NUM_COLUMNS}
      columnGap={WATERFALL_CONFIG.COLUMN_GAP}
      horizontalPadding={WATERFALL_CONFIG.HORIZONTAL_PADDING}
      ListFooterComponent={renderFooter()}
      ListEmptyComponent={renderEmpty()}
      getItemHeight={getItemHeight}
      onEndReached={handleEndReached}
      onEndReachedThreshold={WATERFALL_CONFIG.ON_END_REACHED_THRESHOLD}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};
// #endregion

// #region 9. Exports
const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  footerText: {
    ...DISCOVERY_TYPOGRAPHY.FOOTER_TEXT,
    color: DISCOVERY_COLORS.TEXT_TERTIARY,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    ...DISCOVERY_TYPOGRAPHY.EMPTY_TEXT,
    color: DISCOVERY_COLORS.TEXT_TERTIARY,
  },
});

export default ContentArea;
export type { ContentAreaProps } from '../../types';
// #endregion
