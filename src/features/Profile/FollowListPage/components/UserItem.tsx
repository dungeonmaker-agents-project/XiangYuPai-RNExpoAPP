/**
 * UserItem 组件
 *
 * 用户列表项组件
 * 显示用户头像、昵称、性别年龄、实名认证、简介和关注按钮
 */

import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AVATAR_SIZE, COLORS } from '../constants';
import { UserItemProps } from '../types';
import { FollowButton } from './FollowButton';
import { GenderAgeBadge } from './GenderAgeBadge';
import { VerifiedBadge } from './VerifiedBadge';

/**
 * 用户列表项组件
 */
export const UserItem: React.FC<UserItemProps> = ({
  user,
  isFollowingTab,
  onPress,
  onFollowToggle,
}) => {
  // 计算关系状态
  const relationStatus = user.relationStatus || 'none';
  const isFollowing = user.isFollowing ?? false;
  const isMutual = user.mutualFollow ?? false;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {/* 头像 */}
      <Image
        source={{ uri: user.avatar || 'https://i.pravatar.cc/150?img=1' }}
        style={styles.avatar}
      />

      {/* 用户信息 */}
      <View style={styles.infoContainer}>
        {/* 第一行：昵称 + 性别年龄标签 */}
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {user.name}
          </Text>
          <GenderAgeBadge gender={user.gender} age={user.age} />
        </View>

        {/* 第二行：实名认证标识（可选） */}
        {user.isRealVerified && (
          <View style={styles.verifiedRow}>
            <VerifiedBadge visible={true} />
          </View>
        )}

        {/* 第三行：个性签名 */}
        <Text style={styles.description} numberOfLines={1}>
          {user.description || '这里是用户简介..'}
        </Text>
      </View>

      {/* 关注按钮 */}
      <View style={styles.buttonContainer}>
        <FollowButton
          relationStatus={relationStatus}
          isFollowing={isFollowing}
          isMutual={isMutual}
          onPress={(e) => {
            e?.stopPropagation?.();
            onFollowToggle();
          }}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.border,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginRight: 8,
    maxWidth: '60%',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  buttonContainer: {
    marginLeft: 12,
  },
});

export default UserItem;
