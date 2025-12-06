/**
 * UserInfoArea - 用户信息区域组件 [L2]
 *
 * 功能：展示服务提供者头像、昵称、等级、在线状态、价格(线上)
 * 位置：游戏卡片下方，高度约70px
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORS, SIZES } from './constants';
import type { UserInfoAreaProps } from './types';

/** 用户信息区域组件 */
const UserInfoArea: React.FC<UserInfoAreaProps> = memo(({
  data,
  serviceType,
  onAvatarPress,
}) => {
  const { avatar, nickname, level, isOnline, price, priceUnit } = data;
  const showPrice = serviceType === 'online' && price !== undefined;

  return (
    <View style={styles.container}>
      {/* 左侧：头像 + 信息 [L3] */}
      <TouchableOpacity
        style={styles.leftSection}
        onPress={onAvatarPress}
        activeOpacity={0.8}
        disabled={!onAvatarPress}
      >
        {/* 头像 */}
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          {/* 在线状态绿点 */}
          {isOnline && (
            <View style={styles.onlineDotWrapper}>
              <View style={styles.onlineDot} />
            </View>
          )}
        </View>

        {/* 信息列 [L4] */}
        <View style={styles.infoColumn}>
          {/* Row1: 昵称 + 等级 + 在线状态 */}
          <View style={styles.row1}>
            <Text style={styles.nickname} numberOfLines={1}>{nickname}</Text>
            {/* 等级标签 */}
            <LinearGradient
              colors={['#FFE4E8', '#FFD4DC']}
              style={styles.levelTag}
            >
              <Text style={styles.levelText}>P{level}</Text>
            </LinearGradient>
            {/* 在线状态文字 */}
            {isOnline && (
              <View style={styles.onlineStatus}>
                <View style={styles.onlineIndicator} />
                <Text style={styles.onlineText}>在线</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* 右侧：价格(仅线上) [L3] */}
      {showPrice && (
        <View style={styles.priceSection}>
          <Text style={styles.price}>{price}</Text>
          <Text style={styles.priceUnit}>{priceUnit || '金币/局'}</Text>
        </View>
      )}
    </View>
  );
});

UserInfoArea.displayName = 'UserInfoArea';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.PADDING_H,
    paddingVertical: SIZES.PADDING_V,
    backgroundColor: COLORS.BACKGROUND,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.GAP_LG,
  },
  avatarWrapper: {
    position: 'relative',
    width: SIZES.AVATAR_SIZE,
    height: SIZES.AVATAR_SIZE,
  },
  avatar: {
    width: SIZES.AVATAR_SIZE,
    height: SIZES.AVATAR_SIZE,
    borderRadius: SIZES.AVATAR_RADIUS,
    backgroundColor: COLORS.SURFACE,
  },
  onlineDotWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 6,
    padding: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.ONLINE,
  },
  infoColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.GAP_MD,
  },
  nickname: {
    fontSize: SIZES.FONT_LG,
    fontWeight: '600',
    color: COLORS.TEXT,
    maxWidth: 100,
  },
  levelTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  levelText: {
    fontSize: SIZES.FONT_XS,
    fontWeight: '600',
    color: '#FF4D6D',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  onlineIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.ONLINE,
  },
  onlineText: {
    fontSize: SIZES.FONT_SM,
    color: COLORS.ONLINE,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: SIZES.FONT_LG,
    fontWeight: '700',
    color: COLORS.PRICE,
  },
  priceUnit: {
    fontSize: SIZES.FONT_XS,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
});

export default UserInfoArea;
