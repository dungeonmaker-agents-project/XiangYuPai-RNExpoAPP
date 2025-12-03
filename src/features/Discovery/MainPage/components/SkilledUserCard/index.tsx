// #region 1. File Banner & TOC
/**
 * SkilledUserCard - 有技能用户卡片组件
 *
 * 功能：
 * - 展示有技能用户信息
 * - 头像、昵称、性别、年龄、距离
 * - 技能标签和价格信息
 * - 在线状态和促销标签
 *
 * 设计规格：
 * - 卡片圆角：12px
 * - 头像：48x48px圆形
 * - 价格背景：渐变色
 * - 标签圆角：8px
 *
 * TOC (快速跳转):
 * [1] File Banner & TOC
 * [2] Imports
 * [3] Types & Schema
 * [4] Constants & Config
 * [5] UI Components & Rendering
 * [6] Exports
 */
// #endregion

// #region 2. Imports
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import type { SkilledUserVO } from '@/services/api/discoveryApi';
// #endregion

// #region 3. Types & Schema
export interface SkilledUserCardProps {
  user: SkilledUserVO;
  onPress?: (userId: number) => void;
  cardWidth: number;
}
// #endregion

// #region 4. Constants & Config
const COLORS = {
  BACKGROUND: '#FFFFFF',
  TEXT_PRIMARY: '#1A1A1A',
  TEXT_SECONDARY: '#666666',
  TEXT_TERTIARY: '#999999',
  PRICE_BG: '#FFF0F5',
  PRICE_TEXT: '#FF4D6A',
  TAG_BG: '#F5F5F5',
  TAG_TEXT: '#666666',
  ONLINE_DOT: '#4CD964',
  OFFLINE_DOT: '#CCCCCC',
  PROMOTION_BG: '#FF4D6A',
  PROMOTION_TEXT: '#FFFFFF',
  BORDER: '#F0F0F0',
  MALE_BG: '#E3F2FD',
  MALE_TEXT: '#2196F3',
  FEMALE_BG: '#FCE4EC',
  FEMALE_TEXT: '#E91E63',
} as const;

const TYPOGRAPHY = {
  NICKNAME: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 21,
  },
  AGE_GENDER: {
    fontSize: 12,
    lineHeight: 16,
  },
  DISTANCE: {
    fontSize: 12,
    lineHeight: 16,
  },
  DESCRIPTION: {
    fontSize: 13,
    lineHeight: 18,
  },
  PRICE: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  TAG: {
    fontSize: 11,
    lineHeight: 15,
  },
  PROMOTION: {
    fontSize: 10,
    fontWeight: '500' as const,
    lineHeight: 14,
  },
} as const;
// #endregion

// #region 5. UI Components & Rendering
const SkilledUserCard: React.FC<SkilledUserCardProps> = ({
  user,
  onPress,
  cardWidth,
}) => {
  const handlePress = () => {
    onPress?.(user.userId);
  };

  const isMale = user.gender === 'male';
  const genderBgColor = isMale ? COLORS.MALE_BG : COLORS.FEMALE_BG;
  const genderTextColor = isMale ? COLORS.MALE_TEXT : COLORS.FEMALE_TEXT;
  const genderSymbol = isMale ? '♂' : '♀';

  return (
    <TouchableOpacity
      style={[styles.container, { width: cardWidth }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* 头像区域 */}
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: user.avatar }}
          style={styles.avatar}
        />
        {/* 在线状态 */}
        <View style={[
          styles.onlineIndicator,
          { backgroundColor: user.isOnline ? COLORS.ONLINE_DOT : COLORS.OFFLINE_DOT }
        ]} />
        {/* 促销标签 */}
        {user.promotionTag && (
          <View style={styles.promotionBadge}>
            <Text style={styles.promotionText}>{user.promotionTag}</Text>
          </View>
        )}
      </View>

      {/* 信息区域 */}
      <View style={styles.infoContainer}>
        {/* 昵称行 */}
        <View style={styles.nameRow}>
          <Text style={styles.nickname} numberOfLines={1}>
            {user.nickname}
          </Text>
          {/* 性别年龄 */}
          <View style={[styles.genderAgeBadge, { backgroundColor: genderBgColor }]}>
            <Text style={[styles.genderAge, { color: genderTextColor }]}>
              {genderSymbol} {user.age}
            </Text>
          </View>
        </View>

        {/* 距离和技能等级 */}
        <View style={styles.metaRow}>
          {user.distanceText && (
            <Text style={styles.distance}>{user.distanceText}</Text>
          )}
          {user.skillLevel && (
            <View style={styles.skillLevelBadge}>
              <Text style={styles.skillLevelText}>{user.skillLevel}</Text>
            </View>
          )}
        </View>

        {/* 标签列表 */}
        {user.tags && user.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {user.tags.slice(0, 3).map((tag, index) => (
              <View
                key={index}
                style={[styles.tag, { backgroundColor: tag.color ? `${tag.color}20` : COLORS.TAG_BG }]}
              >
                <Text style={[styles.tagText, { color: tag.color || COLORS.TAG_TEXT }]}>
                  {tag.text}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* 描述 */}
        {user.description && (
          <Text style={styles.description} numberOfLines={2}>
            {user.description}
          </Text>
        )}

        {/* 价格区域 */}
        <View style={styles.priceContainer}>
          <View style={styles.priceBox}>
            <Text style={styles.priceText}>
              {user.price?.displayText || `${user.price?.amount} 金币`}
            </Text>
          </View>
          {user.price?.originalPrice && user.price.originalPrice > user.price.amount && (
            <Text style={styles.originalPrice}>
              原价 {user.price.originalPrice}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
// #endregion

// #region 6. Styles
const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  avatarContainer: {
    position: 'relative',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.BORDER,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 12,
    right: '50%',
    marginRight: -30,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.BACKGROUND,
  },
  promotionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.PROMOTION_BG,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  promotionText: {
    ...TYPOGRAPHY.PROMOTION,
    color: COLORS.PROMOTION_TEXT,
  },
  infoContainer: {
    padding: 12,
    paddingTop: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  nickname: {
    ...TYPOGRAPHY.NICKNAME,
    color: COLORS.TEXT_PRIMARY,
    maxWidth: '70%',
  },
  genderAgeBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  genderAge: {
    ...TYPOGRAPHY.AGE_GENDER,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  distance: {
    ...TYPOGRAPHY.DISTANCE,
    color: COLORS.TEXT_TERTIARY,
  },
  skillLevelBadge: {
    marginLeft: 8,
    backgroundColor: COLORS.TAG_BG,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  skillLevelText: {
    ...TYPOGRAPHY.TAG,
    color: COLORS.TEXT_SECONDARY,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 4,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagText: {
    ...TYPOGRAPHY.TAG,
  },
  description: {
    ...TYPOGRAPHY.DESCRIPTION,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceBox: {
    backgroundColor: COLORS.PRICE_BG,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priceText: {
    ...TYPOGRAPHY.PRICE,
    color: COLORS.PRICE_TEXT,
  },
  originalPrice: {
    ...TYPOGRAPHY.DISTANCE,
    color: COLORS.TEXT_TERTIARY,
    marginLeft: 8,
    textDecorationLine: 'line-through',
  },
});
// #endregion

// #region 7. Exports
export default SkilledUserCard;
export type { SkilledUserCardProps };
// #endregion
