/**
 * FollowButton 组件
 *
 * 关注状态按钮组件
 * 根据关系状态显示不同样式：
 * - 互相关注: 紫色填充背景
 * - 已关注: 白色背景紫色边框
 * - 关注/回关: 紫色填充背景
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS, FOLLOW_STATUS } from '../constants';
import { FollowButtonProps, RelationStatus } from '../types';

/**
 * 根据关系状态获取按钮配置
 */
const getButtonConfig = (
  relationStatus: RelationStatus,
  isFollowing: boolean,
  isMutual: boolean
): { text: string; filled: boolean } => {
  // 互相关注
  if (isMutual || relationStatus === 'mutual') {
    return { text: FOLLOW_STATUS.MUTUAL, filled: true };
  }

  // 已关注对方
  if (isFollowing || relationStatus === 'following') {
    return { text: FOLLOW_STATUS.FOLLOWING, filled: false };
  }

  // 对方关注我（我未关注）
  if (relationStatus === 'followed') {
    return { text: FOLLOW_STATUS.FOLLOW_BACK, filled: true };
  }

  // 未关注
  return { text: FOLLOW_STATUS.FOLLOW, filled: true };
};

/**
 * 关注按钮组件
 */
export const FollowButton: React.FC<FollowButtonProps> = ({
  relationStatus,
  isFollowing,
  isMutual,
  onPress,
}) => {
  const config = getButtonConfig(relationStatus, isFollowing, isMutual);

  return (
    <TouchableOpacity
      style={[styles.button, config.filled ? styles.buttonFilled : styles.buttonOutline]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, config.filled ? styles.textFilled : styles.textOutline]}>
        {config.text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 72,
    alignItems: 'center',
  },
  buttonFilled: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  buttonOutline: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
  },
  textFilled: {
    color: COLORS.white,
  },
  textOutline: {
    color: COLORS.primary,
  },
});

export default FollowButton;
