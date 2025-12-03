/**
 * UnifiedHeaderArea - 统一的现代化背景头图区域（重构版）
 *
 * 架构模式：🔵 嵌套化架构（Nested Architecture）
 *
 * 功能：
 * - 大背景图片（全屏宽度，500px高度）
 * - 顶部操作栏（返回按钮）
 * - 用户信息卡片（姓名、性别年龄徽章、认证标签、状态信息）
 * - 编辑/关注按钮
 *
 * UI设计参考：个人主页-资料.png / 个人主页-动态.png
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import BackgroundLayer from './BackgroundLayer';
import TopActionBar from './TopActionBar';
import { BACKGROUND_HEIGHT } from './constants';
import type { UnifiedHeaderAreaProps } from './types';

const UnifiedHeaderArea: React.FC<UnifiedHeaderAreaProps> = ({
  // Background
  backgroundImage,

  // User Basic Info
  nickname,
  gender,
  age,
  height,

  // Verification Badges
  isRealVerified = false,
  isGodVerified = false,
  isVipVerified = false,

  // Status Info
  isOnline,
  distance,
  followerCount,
  followingCount,
  likeCount,

  // Follow Status
  isFollowing = false,
  isMutualFollowing = false,

  // Custom Tags
  customTags = [],

  // Page Type
  isOwnProfile,

  // Event Callbacks
  onBack,
  onEditPress,
  onFollowPress,
  onFollowingPress,
  onFollowerPress,
  onLikePress,
}) => {
  // 性别符号
  const genderSymbol = gender === 1 ? '♂' : gender === 2 ? '♀' : '';
  const genderBgColor = gender === 1 ? '#60A5FA' : gender === 2 ? '#F472B6' : '#9CA3AF';

  return (
    <View style={styles.container}>
      {/* 背景层 */}
      <BackgroundLayer backgroundImage={backgroundImage} />

      {/* 顶部操作栏（只有返回按钮） */}
      <TopActionBar
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        isMutualFollowing={isMutualFollowing}
        onBack={onBack}
        onEditPress={onEditPress}
        onFollowPress={onFollowPress}
      />

      {/* 用户信息区域 */}
      <View style={styles.userInfoContainer}>
        {/* 第一行：昵称 + 性别年龄徽章 */}
        <View style={styles.nameRow}>
          <View style={styles.nameLeft}>
            <Text style={styles.nickname}>{nickname}</Text>
            {/* 性别年龄徽章 */}
            {(genderSymbol || age) && (
              <View style={[styles.ageBadge, { backgroundColor: genderBgColor }]}>
                <Text style={styles.ageBadgeText}>
                  {genderSymbol}{age}
                </Text>
              </View>
            )}
          </View>

          {/* 编辑/关注按钮 */}
          {isOwnProfile ? (
            <TouchableOpacity
              style={styles.editButton}
              onPress={onEditPress}
              activeOpacity={0.7}
            >
              <Text style={styles.editButtonText}>编辑</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.followButton, isFollowing && styles.followingButton]}
              onPress={onFollowPress}
              activeOpacity={0.7}
            >
              <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                {isFollowing ? '已关注' : '+ 关注'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 第二行：认证标签 */}
        <View style={styles.tagsRow}>
          {isRealVerified && (
            <View style={styles.verifiedTag}>
              <Text style={styles.verifiedTagIcon}>✓</Text>
              <Text style={styles.verifiedTagText}>实名认证</Text>
            </View>
          )}
          {isGodVerified && (
            <View style={styles.godTag}>
              <Text style={styles.godTagIcon}>👑</Text>
              <Text style={styles.godTagText}>大神</Text>
            </View>
          )}
          {isVipVerified && (
            <View style={styles.vipTag}>
              <Text style={styles.vipTagText}>VIP</Text>
            </View>
          )}
        </View>

        {/* 第三行：状态信息 */}
        <View style={styles.statusRow}>
          {/* 在线状态 */}
          {isOnline !== undefined && (
            <Text style={[styles.onlineText, { color: isOnline ? '#4ADE80' : '#9CA3AF' }]}>
              {isOnline ? '在线' : '离线'}
            </Text>
          )}

          {/* 距离 */}
          {distance !== undefined && distance > 0 && (
            <Text style={styles.statusText}>📍 {distance}km</Text>
          )}

          {/* 关注数 */}
          <TouchableOpacity onPress={onFollowingPress} activeOpacity={0.7}>
            <Text style={styles.statusText}>
              <Text style={styles.statusValue}>{followingCount || 0}</Text> 关注
            </Text>
          </TouchableOpacity>

          {/* 粉丝数 */}
          <TouchableOpacity onPress={onFollowerPress} activeOpacity={0.7}>
            <Text style={styles.statusText}>
              <Text style={styles.statusValue}>{followerCount || 0}</Text> 粉丝
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: BACKGROUND_HEIGHT,
    position: 'relative',
  },
  userInfoContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },

  // 第一行：昵称 + 编辑按钮
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nameLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nickname: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
  ageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ageBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },

  // 编辑/关注按钮
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  editButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
  },
  followingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  followButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  followingButtonText: {
    fontWeight: '400',
  },

  // 第二行：认证标签
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#14B8A6',
    gap: 2,
  },
  verifiedTagIcon: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  verifiedTagText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  godTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    gap: 2,
  },
  godTagIcon: {
    fontSize: 10,
  },
  godTagText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  vipTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#EC4899',
  },
  vipTagText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // 第三行：状态信息
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  onlineText: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statusValue: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default UnifiedHeaderArea;
export { BACKGROUND_HEIGHT };

