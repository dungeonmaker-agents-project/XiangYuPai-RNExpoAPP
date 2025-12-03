// #region 1. File Banner & TOC
/**
 * FeedCard - 动态卡片组件
 *
 * 功能：
 * - 双列瀑布流卡片样式
 * - 图片优先显示
 * - 用户信息和互动栏
 * - 点赞收藏动画效果
 * - 视频类型显示播放图标
 *
 * 设计规格（基于UI设计文档 - 发现页_结构文档.md）：
 * - 卡片圆角: 8px
 * - 用户头像: 24x24px 圆形
 * - 标题: 14sp, #333333, 最多2行省略
 * - 昵称: 12sp, #666666
 * - 统计: 12sp, #999999
 * - 内边距: 8px
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
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// 类型
import type { Feed } from '../../../types';
// #endregion

// #region 3. Types & Schema
export interface FeedCardProps {
  feed: Feed;
  onPress?: (feedId: string) => void;
  onUserPress?: (userId: string) => void;
  onLike: (feedId: string) => void;
  onCollect: (feedId: string) => void;
  onComment?: (feedId: string) => void;
  onShare?: (feedId: string) => void;
  cardWidth: number;
}
// #endregion

// #region 4. Constants & Config
/**
 * 颜色配置 - 基于UI设计文档
 */
const COLORS = {
  BACKGROUND: '#FFFFFF',
  TEXT_PRIMARY: '#333333',      // 标题颜色
  TEXT_SECONDARY: '#666666',    // 昵称颜色
  TEXT_TERTIARY: '#999999',     // 统计数字颜色
  DIVIDER: '#F0F0F0',
  LIKE_ACTIVE: '#FF4444',       // 已点赞颜色
  COLLECT_ACTIVE: '#FFB800',
  PLAY_ICON_BG: 'rgba(0, 0, 0, 0.5)',  // 播放图标背景
} as const;

/**
 * 尺寸配置 - 基于UI设计文档
 */
const SIZES = {
  CARD_RADIUS: 8,               // 卡片圆角 (文档要求8px)
  AVATAR_SIZE: 24,              // 头像尺寸 (文档要求24x24)
  PLAY_ICON_SIZE: 32,           // 播放图标尺寸
  ICON_SIZE: 14,                // 互动图标尺寸
} as const;

/**
 * 排版配置 - 基于UI设计文档
 */
const TYPOGRAPHY = {
  TITLE: {
    fontSize: 14,               // 文档要求14sp
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  NICKNAME: {
    fontSize: 12,               // 文档要求12sp
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  STAT: {
    fontSize: 12,               // 文档要求12sp
    lineHeight: 16,
  },
} as const;
// #endregion

// #region 5. Utils & Helpers
/**
 * 格式化数字（>=10000 显示 1.2w）
 */
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}w`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};
// #endregion

// #region 6. State Management & 7. Domain Logic
/**
 * FeedCard业务逻辑Hook
 */
const useFeedCardLogic = (props: FeedCardProps) => {
  const { feed, onPress, onUserPress, onLike, onCollect, cardWidth } = props;
  const router = useRouter();

  // 处理卡片点击
  const handlePress = useCallback(() => {
    if (onPress) {
      onPress(feed.id);
    } else {
      router.push(`/feed/${feed.id}` as any);
    }
  }, [onPress, feed.id, router]);

  // 处理用户点击
  const handleUserPress = useCallback(() => {
    if (onUserPress) {
      onUserPress(feed.userId);
    }
  }, [onUserPress, feed.userId]);

  // 点赞动画状态
  const [likeScale] = useState(new Animated.Value(1));

  /**
   * 判断是否为视频类型
   */
  const isVideo = useMemo(() => {
    if (feed.mediaList?.length > 0) {
      return feed.mediaList[0]?.type === 'video';
    }
    return feed.type === 2; // type=2 表示视频
  }, [feed.mediaList, feed.type]);

  /**
   * 计算图片高度（保持宽高比 + 瀑布流随机性）
   */
  const imageHeight = useMemo(() => {
    if (feed.mediaList?.length > 0) {
      const media = feed.mediaList[0];
      if (media.width && media.height) {
        return (cardWidth * media.height) / media.width;
      }
      // 使用aspectRatio
      if (media.aspectRatio) {
        return cardWidth / media.aspectRatio;
      }
    }

    // 🎨 随机高度：使用feedId作为种子，保证同一卡片高度一致
    const seedStr = String(feed.id || Math.random());
    const seed = seedStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const ratios = [
      0.75,  // 3:4 (竖图)
      1.0,   // 1:1 (正方形)
      1.33,  // 4:3 (横图)
      0.8,   // 4:5
    ];
    const selectedRatio = ratios[seed % ratios.length];

    return cardWidth / selectedRatio;
  }, [feed.id, feed.mediaList, cardWidth]);

  /**
   * 处理点赞（带动画）
   */
  const handleLike = useCallback(() => {
    Animated.sequence([
      Animated.spring(likeScale, {
        toValue: 1.3,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    onLike(feed.id);
  }, [feed.id, onLike, likeScale]);

  /**
   * 处理评论
   */
  const handleComment = useCallback(() => {
    router.push(`/feed/${feed.id}` as any);
  }, [feed.id, router]);

  return {
    feed,
    imageHeight,
    cardWidth,
    isVideo,
    likeScale,
    handleLike,
    handleComment,
    handlePress,
    handleUserPress,
  };
};
// #endregion

// #region 8. UI Components & Rendering
/**
 * 媒体区域组件
 */
const MediaSection: React.FC<{
  feed: Feed;
  imageHeight: number;
  isVideo: boolean;
}> = ({ feed, imageHeight, isVideo }) => {
  const hasMedia = feed.mediaList?.length > 0 && feed.mediaList[0]?.url;
  const coverUrl = hasMedia
    ? feed.mediaList[0].url
    : feed.coverImage;

  return (
    <View style={[styles.mediaContainer, { height: imageHeight }]}>
      {coverUrl ? (
        <Image
          source={{ uri: coverUrl }}
          style={styles.coverImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>📷</Text>
        </View>
      )}

      {/* 视频播放图标 - 右上角 */}
      {isVideo && (
        <View style={styles.playIconContainer}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
      )}
    </View>
  );
};

/**
 * 文本区域组件
 */
const TextSection: React.FC<{ feed: Feed }> = ({ feed }) => (
  <View style={styles.textSection}>
    <Text style={styles.title} numberOfLines={2}>
      {feed.title || feed.content}
    </Text>
  </View>
);

/**
 * 信息区域组件 (作者+点赞)
 */
const InfoSection: React.FC<{
  feed: Feed;
  likeScale: Animated.Value;
  onUserPress: () => void;
  onLike: () => void;
}> = ({ feed, likeScale, onUserPress, onLike }) => (
  <View style={styles.infoSection}>
    {/* 作者信息 */}
    <TouchableOpacity
      style={styles.authorInfo}
      onPress={onUserPress}
      activeOpacity={0.7}
    >
      {feed.userInfo?.avatar ? (
        <Image
          source={{ uri: feed.userInfo.avatar }}
          style={styles.avatar}
        />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarPlaceholderText}>👤</Text>
        </View>
      )}
      <Text style={styles.nickname} numberOfLines={1}>
        {feed.userInfo?.nickname || '用户'}
      </Text>
    </TouchableOpacity>

    {/* 点赞按钮 */}
    <Animated.View style={{ transform: [{ scale: likeScale }] }}>
      <TouchableOpacity
        style={styles.likeButton}
        onPress={onLike}
        activeOpacity={0.7}
      >
        <Text style={styles.likeIcon}>
          {feed.isLiked ? '♥' : '♡'}
        </Text>
        <Text
          style={[
            styles.likeCount,
            feed.isLiked && styles.likeCountActive,
          ]}
        >
          {formatNumber(feed.likeCount)}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  </View>
);

/**
 * FeedCard主组件
 */
const FeedCard: React.FC<FeedCardProps> = (props) => {
  const {
    feed,
    imageHeight,
    cardWidth,
    isVideo,
    likeScale,
    handleLike,
    handlePress,
    handleUserPress,
  } = useFeedCardLogic(props);

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      activeOpacity={0.95}
      onPress={handlePress}
    >
      {/* 媒体区域 */}
      <MediaSection
        feed={feed}
        imageHeight={imageHeight}
        isVideo={isVideo}
      />

      {/* 文本区域 */}
      <TextSection feed={feed} />

      {/* 信息区域 */}
      <InfoSection
        feed={feed}
        likeScale={likeScale}
        onUserPress={handleUserPress}
        onLike={handleLike}
      />
    </TouchableOpacity>
  );
};
// #endregion

// #region 9. Exports
const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: SIZES.CARD_RADIUS,
    marginBottom: 8,
    overflow: 'hidden',
    // 轻微阴影
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  // 媒体区域
  mediaContainer: {
    width: '100%',
    backgroundColor: COLORS.DIVIDER,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  placeholderText: {
    fontSize: 40,
    opacity: 0.3,
  },
  playIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: SIZES.PLAY_ICON_SIZE,
    height: SIZES.PLAY_ICON_SIZE,
    borderRadius: SIZES.PLAY_ICON_SIZE / 2,
    backgroundColor: COLORS.PLAY_ICON_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 2, // 视觉居中调整
  },

  // 文本区域 - padding: 8px 8px 4px 8px
  textSection: {
    paddingTop: 8,
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  title: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.TEXT_PRIMARY,
  },

  // 信息区域 - padding: 4px 8px 8px
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },

  // 作者信息
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  avatar: {
    width: SIZES.AVATAR_SIZE,
    height: SIZES.AVATAR_SIZE,
    borderRadius: SIZES.AVATAR_SIZE / 2,
    backgroundColor: COLORS.DIVIDER,
    marginRight: 6,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 10,
  },
  nickname: {
    ...TYPOGRAPHY.NICKNAME,
    color: COLORS.TEXT_SECONDARY,
    flex: 1,
  },

  // 点赞按钮
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeIcon: {
    fontSize: SIZES.ICON_SIZE,
    color: COLORS.TEXT_TERTIARY,
  },
  likeCount: {
    ...TYPOGRAPHY.STAT,
    color: COLORS.TEXT_TERTIARY,
  },
  likeCountActive: {
    color: COLORS.LIKE_ACTIVE,
  },
});

export default FeedCard;
// #endregion
