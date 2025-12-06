/**
 * ReviewArea - 评价区域组件 [L2]
 *
 * 功能：展示评价统计、精选标签和评价列表
 * 位置：页面主体区域，支持滚动加载更多
 *
 * 子组件：
 * - ReviewHeader: 评价头部（标题、数量、好评率、查看全部）
 * - HighlightTags: 精选标签列表
 * - ReviewItem: 单条评价项
 */

import { Ionicons } from '@expo/vector-icons';
import React, { memo, useCallback } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORS, SIZES, TEXT } from '../constants';
import type { ReviewAreaProps, ReviewItem as ReviewItemType, ReviewSummaryData } from '../types';

// #region ReviewHeader 组件
/** 评价头部组件 [L3] */
const ReviewHeader: React.FC<{
  summary: ReviewSummaryData;
  onViewAll?: () => void;
}> = memo(({ summary, onViewAll }) => {
  const { totalCount, goodRate } = summary;

  return (
    <View style={styles.header}>
      {/* 左侧：标题 + 数量 + 好评率 */}
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>{TEXT.REVIEW_TITLE}</Text>
        <Text style={styles.headerCount}>({totalCount > 100 ? '100+' : totalCount})</Text>
        <Text style={styles.headerRate}>{TEXT.REVIEW_GOOD_RATE}{goodRate}%</Text>
      </View>

      {/* 右侧：查看全部 */}
      <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
        <Text style={styles.headerViewAll}>{TEXT.REVIEW_VIEW_ALL}</Text>
      </TouchableOpacity>
    </View>
  );
});

ReviewHeader.displayName = 'ReviewHeader';
// #endregion

// #region HighlightTags 组件
/** 精选标签组件 [L3] */
const HighlightTags: React.FC<{
  tags: string[];
}> = memo(({ tags }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <View style={styles.highlightTags}>
      {tags.map((tag, index) => (
        <View key={index} style={styles.highlightTag}>
          <Text style={styles.highlightTagText}>{tag}</Text>
        </View>
      ))}
    </View>
  );
});

HighlightTags.displayName = 'HighlightTags';
// #endregion

// #region ReviewItem 组件
/** 评分星星组件 */
const RatingStars: React.FC<{ rating: number }> = memo(({ rating }) => (
  <View style={styles.ratingStars}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Ionicons
        key={star}
        name={star <= rating ? 'star' : 'star-outline'}
        size={SIZES.STAR_SIZE}
        color={COLORS.RATING}
      />
    ))}
  </View>
));

RatingStars.displayName = 'RatingStars';

/** 单条评价项组件 [L4] */
const ReviewItemComponent: React.FC<{
  data: ReviewItemType;
  onUserPress?: (userId: string) => void;
}> = memo(({ data, onUserPress }) => {
  const { userId, avatar, nickname, rating, content, createTime } = data;

  const handleAvatarPress = useCallback(() => {
    onUserPress?.(userId);
  }, [userId, onUserPress]);

  return (
    <View style={styles.reviewItem}>
      {/* 头像 */}
      <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8}>
        <Image source={{ uri: avatar }} style={styles.reviewAvatar} />
      </TouchableOpacity>

      {/* 内容列 */}
      <View style={styles.reviewContent}>
        {/* Row1: 昵称 + 评分 + 时间 */}
        <View style={styles.reviewRow1}>
          <Text style={styles.reviewNickname}>{nickname}</Text>
          <RatingStars rating={rating} />
          <Text style={styles.reviewTime}>{createTime}</Text>
        </View>

        {/* Row2: 评价内容 */}
        <Text style={styles.reviewText} numberOfLines={2}>{content}</Text>
      </View>
    </View>
  );
});

ReviewItemComponent.displayName = 'ReviewItemComponent';
// #endregion

// #region ReviewArea 主组件
/** 评价区域组件 */
const ReviewArea: React.FC<ReviewAreaProps> = memo(({
  summary,
  reviews,
  hasMore,
  onViewAll,
  onLoadMore,
  onUserPress,
}) => {
  /** 渲染评价项 */
  const renderReviewItem = useCallback(({ item }: { item: ReviewItemType }) => (
    <ReviewItemComponent data={item} onUserPress={onUserPress} />
  ), [onUserPress]);

  /** 提取key */
  const keyExtractor = useCallback((item: ReviewItemType) => item.reviewId, []);

  /** 列表底部组件 */
  const ListFooterComponent = useCallback(() => {
    if (reviews.length === 0) return null;
    return (
      <Text style={styles.footerText}>
        {hasMore ? TEXT.LOADING : TEXT.REVIEW_NO_MORE}
      </Text>
    );
  }, [hasMore, reviews.length]);

  /** 空状态组件 */
  const ListEmptyComponent = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{TEXT.REVIEW_EMPTY}</Text>
    </View>
  ), []);

  return (
    <View style={styles.container}>
      {/* 分割线 */}
      <View style={styles.divider} />

      {/* 评价头部 */}
      <ReviewHeader summary={summary} onViewAll={onViewAll} />

      {/* 精选标签 */}
      <HighlightTags tags={summary.highlightTags} />

      {/* 评价列表 */}
      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        scrollEnabled={false}  // 由外层ScrollView控制滚动
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
});

ReviewArea.displayName = 'ReviewArea';
// #endregion

// #region Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  divider: {
    height: 8,
    backgroundColor: COLORS.SURFACE,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.PADDING_H,
    paddingVertical: SIZES.PADDING_V,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.GAP_MD,
  },
  headerTitle: {
    fontSize: SIZES.FONT_LG,
    fontWeight: '600',
    color: COLORS.TEXT,
  },
  headerCount: {
    fontSize: SIZES.FONT_LG,
    fontWeight: '600',
    color: COLORS.TEXT,
  },
  headerRate: {
    fontSize: SIZES.FONT_MD,
    color: COLORS.PRIMARY,
  },
  headerViewAll: {
    fontSize: SIZES.FONT_MD,
    color: COLORS.TEXT_SECONDARY,
  },

  // HighlightTags
  highlightTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.GAP_MD,
    paddingHorizontal: SIZES.PADDING_H,
    paddingBottom: SIZES.PADDING_V,
  },
  highlightTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.TAG_RADIUS,
    backgroundColor: COLORS.TAG_HIGHLIGHT_BG,
  },
  highlightTagText: {
    fontSize: SIZES.FONT_SM,
    color: COLORS.TAG_HIGHLIGHT_TEXT,
  },

  // ReviewItem
  reviewItem: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.PADDING_H,
    paddingVertical: SIZES.PADDING_V,
    gap: SIZES.GAP_LG,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.DIVIDER,
  },
  reviewAvatar: {
    width: SIZES.REVIEW_AVATAR_SIZE,
    height: SIZES.REVIEW_AVATAR_SIZE,
    borderRadius: SIZES.REVIEW_AVATAR_SIZE / 2,
    backgroundColor: COLORS.SURFACE,
  },
  reviewContent: {
    flex: 1,
    gap: SIZES.GAP_SM,
  },
  reviewRow1: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.GAP_MD,
  },
  reviewNickname: {
    fontSize: SIZES.FONT_MD,
    fontWeight: '500',
    color: COLORS.TEXT,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewTime: {
    fontSize: SIZES.FONT_SM,
    color: COLORS.TEXT_LIGHT,
    marginLeft: 'auto',
  },
  reviewText: {
    fontSize: SIZES.FONT_MD,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },

  // Footer & Empty
  footerText: {
    textAlign: 'center',
    paddingVertical: SIZES.PADDING_V,
    fontSize: SIZES.FONT_SM,
    color: COLORS.TEXT_LIGHT,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: SIZES.FONT_MD,
    color: COLORS.TEXT_LIGHT,
  },
});
// #endregion

export default ReviewArea;
