/**
 * FeedCardComponent - 动态卡片组件
 *
 * 展示来自后端API的动态流数据
 *
 * TOC (快速跳转):
 * [1] Imports
 * [2] Types & Schema
 * [3] Constants & Config
 * [4] Utils & Helpers
 * [5] UI Components & Rendering
 * [6] Exports
 */

// #region 1. Imports
import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { COLORS } from '../../constants';
import type { FeedItem } from '../../types';
// #endregion

// #region 2. Types & Schema
/**
 * 动态项数据类型 - 直接使用 FeedItem
 */
export type FeedItemData = FeedItem;

interface FeedCardComponentProps {
  feed: FeedItemData;
  onPress: () => void;
  onUserPress?: () => void;
  onLikePress?: () => void;
  onCommentPress?: () => void;
  onSharePress?: () => void;
}
// #endregion

// #region 3. Constants & Config
const CARD_CONFIG = {
  maxPhotos: 3,
  avatarSize: 40,
  maxContentLength: 100,
} as const;
// #endregion

// #region 4. Utils & Helpers
const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`;
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`;
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`;
  } else {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}-${date.getDate()}`;
  }
};

const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return String(num);
};

const formatDistance = (distance?: number): string => {
  if (distance === undefined || distance === null) return '';
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
// #endregion

// #region 5. UI Components & Rendering
/**
 * FeedCardComponent 组件 - 动态卡片
 * 展示动态流内容
 */
export const FeedCardComponent: React.FC<FeedCardComponentProps> = ({
  feed,
  onPress,
  onUserPress,
  onLikePress,
  onCommentPress,
  onSharePress,
}) => {
  const [isLiked, setIsLiked] = useState(feed.isLiked);
  const [likeCount, setLikeCount] = useState(feed.likeCount);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    onLikePress?.();
  };

  // 渲染用户信息头部
  const renderHeader = () => (
    <TouchableOpacity
      style={styles.header}
      onPress={onUserPress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: feed.userInfo.avatar }}
        style={styles.avatar}
      />
      <View style={styles.headerInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.nickname}>{feed.userInfo.nickname}</Text>
          {feed.userInfo.age && (
            <View style={[
              styles.genderTag,
              { backgroundColor: feed.userInfo.gender === 'female' ? COLORS.pink : COLORS.primary }
            ]}>
              <Text style={styles.genderText}>
                {feed.userInfo.gender === 'female' ? '♀' : '♂'}{feed.userInfo.age}
              </Text>
            </View>
          )}
          {feed.userInfo.isVip && (
            <View style={styles.vipTag}>
              <Text style={styles.vipText}>VIP</Text>
            </View>
          )}
          {feed.userInfo.isRealVerified && (
            <View style={styles.verifyTag}>
              <Text style={styles.verifyText}>认证</Text>
            </View>
          )}
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.timeText}>{formatTimeAgo(feed.createdAt)}</Text>
          {feed.locationName && (
            <Text style={styles.locationText}>
              📍 {feed.locationName}
              {feed.distance !== undefined && ` · ${formatDistance(feed.distance)}`}
            </Text>
          )}
        </View>
      </View>
      {!feed.userInfo.isFollowed && (
        <TouchableOpacity style={styles.followBtn}>
          <Text style={styles.followBtnText}>+关注</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  // 渲染内容区域
  const renderContent = () => (
    <TouchableOpacity
      style={styles.contentArea}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* 文字内容 */}
      {feed.content && (
        <Text style={styles.contentText}>
          {truncateText(feed.content, CARD_CONFIG.maxContentLength)}
        </Text>
      )}

      {/* 话题标签 */}
      {feed.topicList && feed.topicList.length > 0 && (
        <View style={styles.topicRow}>
          {feed.topicList.map((topic, index) => (
            <TouchableOpacity key={index} style={styles.topicTag}>
              <Text style={styles.topicText}>#{topic.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 媒体内容 */}
      {feed.mediaList && feed.mediaList.length > 0 && (
        <View style={styles.mediaContainer}>
          {feed.mediaList.length === 1 ? (
            // 单图大图展示
            <Image
              source={{ uri: feed.mediaList[0].url }}
              style={styles.singleImage}
              resizeMode="cover"
            />
          ) : (
            // 多图网格展示
            <View style={styles.mediaGrid}>
              {feed.mediaList.slice(0, CARD_CONFIG.maxPhotos).map((media, index) => (
                <View key={media.id || index} style={styles.mediaItem}>
                  <Image
                    source={{ uri: media.thumbnailUrl || media.url }}
                    style={styles.gridImage}
                    resizeMode="cover"
                  />
                  {media.type === 'video' && (
                    <View style={styles.videoOverlay}>
                      <Text style={styles.videoIcon}>▶</Text>
                    </View>
                  )}
                </View>
              ))}
              {feed.mediaList.length > CARD_CONFIG.maxPhotos && (
                <View style={styles.moreOverlay}>
                  <Text style={styles.moreText}>+{feed.mediaList.length - CARD_CONFIG.maxPhotos}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  // 渲染底部互动栏
  const renderFooter = () => (
    <View style={styles.footer}>
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={handleLike}
        activeOpacity={0.7}
      >
        <Text style={[styles.actionIcon, isLiked && styles.likedIcon]}>
          {isLiked ? '❤️' : '🤍'}
        </Text>
        <Text style={[styles.actionText, isLiked && styles.likedText]}>
          {formatNumber(likeCount)}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionBtn}
        onPress={onCommentPress}
        activeOpacity={0.7}
      >
        <Text style={styles.actionIcon}>💬</Text>
        <Text style={styles.actionText}>{formatNumber(feed.commentCount)}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionBtn}
        onPress={onSharePress}
        activeOpacity={0.7}
      >
        <Text style={styles.actionIcon}>↗️</Text>
        <Text style={styles.actionText}>{formatNumber(feed.shareCount)}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.cardWrapper}>
      <View style={styles.cardContainer}>
        {renderHeader()}
        {renderContent()}
        {renderFooter()}
      </View>
    </View>
  );
};
// #endregion

// #region 6. Styles
const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 14,
    marginVertical: 6,
  },
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 8,
  },
  avatar: {
    width: CARD_CONFIG.avatarSize,
    height: CARD_CONFIG.avatarSize,
    borderRadius: CARD_CONFIG.avatarSize / 2,
    backgroundColor: COLORS.gray100,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  nickname: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  genderTag: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  genderText: {
    fontSize: 11,
    color: COLORS.white,
    fontWeight: '600',
  },
  vipTag: {
    marginLeft: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  vipText: {
    fontSize: 9,
    color: '#333',
    fontWeight: '700',
  },
  verifyTag: {
    marginLeft: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  verifyText: {
    fontSize: 9,
    color: COLORS.white,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.gray500,
    marginLeft: 8,
  },
  followBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
  },
  followBtnText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '600',
  },
  // Content styles
  contentArea: {
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  contentText: {
    fontSize: 14,
    color: COLORS.gray800,
    lineHeight: 22,
    marginBottom: 8,
  },
  topicRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  topicTag: {
    marginRight: 8,
    marginBottom: 4,
  },
  topicText: {
    fontSize: 13,
    color: COLORS.primary,
  },
  mediaContainer: {
    marginTop: 4,
  },
  singleImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 8,
    backgroundColor: COLORS.gray100,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  mediaItem: {
    width: '32%',
    aspectRatio: 1,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    backgroundColor: COLORS.gray100,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 6,
  },
  videoIcon: {
    fontSize: 24,
    color: COLORS.white,
  },
  moreOverlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '32%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 6,
  },
  moreText: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: '600',
  },
  // Footer styles
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.gray100,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionText: {
    fontSize: 13,
    color: COLORS.gray500,
    marginLeft: 4,
  },
  likedIcon: {
    color: '#FF4757',
  },
  likedText: {
    color: '#FF4757',
  },
});
// #endregion

// #region 7. Exports
export default FeedCardComponent;
// #endregion
