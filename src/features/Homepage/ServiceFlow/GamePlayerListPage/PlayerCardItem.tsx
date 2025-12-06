/**
 * PlayerCardItem - 玩家卡片组件
 *
 * @description 王者荣耀陪玩列表页玩家卡片，用于展示陪玩用户的关键信息
 * @layout flex-row 三栏布局：左侧头像区 + 中间信息区 + 右侧价格区
 *
 * @usage 在 FlatList 中渲染每个玩家卡片
 * @example <PlayerCardItem data={playerData} onPress={() => navigateToDetail(id)} />
 *
 * @dependencies 使用 types.ts 中的 PlayerCardData 类型
 * @dependencies 使用 constants.ts 中的 COLORS、SIZES 常量
 */

import { Ionicons } from '@expo/vector-icons';
import React, { memo, useCallback } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, SIZES } from './constants';
import type { PlayerCardData } from './types';

// ==================== 类型定义 ====================

/** PlayerCardItem 组件属性 */
interface PlayerCardItemProps {
  /** 玩家卡片数据 */
  data: PlayerCardData;
  /** 点击回调 */
  onPress?: (serviceId: number) => void;
}

// ==================== 工具函数 ====================

/**
 * 格式化巅峰分显示
 * @param peakScore 巅峰分数值
 * @returns 格式化后的字符串，如 "巅峰1800"
 */
const formatPeakScoreDisplay = (peakScore: number | null): string | null => {
  if (!peakScore) return null;
  return `巅峰${peakScore}`;
};

/**
 * 获取性别图标名称
 * @param gender 性别标识
 * @returns Ionicons 图标名称
 */
const getGenderIconName = (gender: 'male' | 'female' | 'other'): 'male' | 'female' | 'male-female' => {
  const iconMap = { male: 'male', female: 'female', other: 'male-female' } as const;
  return iconMap[gender];
};

/**
 * 获取性别颜色
 * @param gender 性别标识
 * @returns 对应颜色值
 */
const getGenderColor = (gender: 'male' | 'female' | 'other'): string => {
  const colorMap = { male: COLORS.male, female: COLORS.female, other: COLORS.textTertiary };
  return colorMap[gender];
};

// ==================== 子组件定义 ====================

/** 头像区域组件 */
const AvatarSection: React.FC<{ url: string; isVideo: boolean }> = ({ url, isVideo }) => (
  <View style={styles.avatarContainer}>
    <Image source={{ uri: url }} style={styles.avatar} resizeMode="cover" />
    {/* 视频头像标识 */}
    {isVideo && (
      <View style={styles.videoIndicator}>
        <Ionicons name="play-circle" size={20} color="#FFFFFF" />
      </View>
    )}
  </View>
);

/** 基本信息行组件 (昵称 + 性别 + 年龄) */
const BasicInfoRow: React.FC<{
  nickname: string;
  gender: 'male' | 'female' | 'other';
  age: number;
}> = ({ nickname, gender, age }) => (
  <View style={styles.basicInfoRow}>
    <Text style={styles.nickname} numberOfLines={1}>{nickname}</Text>
    <View style={[styles.genderAgeTag, { backgroundColor: getGenderColor(gender) + '20' }]}>
      <Ionicons name={getGenderIconName(gender)} size={12} color={getGenderColor(gender)} />
      <Text style={[styles.ageText, { color: getGenderColor(gender) }]}>{age}</Text>
    </View>
  </View>
);

/** 认证标签行组件 */
const CertificationRow: React.FC<{ isVerified: boolean; isExpert: boolean }> = ({ isVerified, isExpert }) => {
  if (!isVerified && !isExpert) return null;
  return (
    <View style={styles.certificationRow}>
      {isVerified && (
        <View style={[styles.certBadge, { backgroundColor: COLORS.verified + '15' }]}>
          <Ionicons name="shield-checkmark" size={12} color={COLORS.verified} />
          <Text style={[styles.certText, { color: COLORS.verified }]}>实名认证</Text>
        </View>
      )}
      {isExpert && (
        <View style={[styles.certBadge, { backgroundColor: COLORS.expert + '15' }]}>
          <Ionicons name="trophy" size={12} color={COLORS.expert} />
          <Text style={[styles.certText, { color: COLORS.expert }]}>大神认证</Text>
        </View>
      )}
    </View>
  );
};

/** 技能描述组件 */
const SkillDescriptionRow: React.FC<{ description: string }> = ({ description }) => (
  <Text style={styles.skillDescription} numberOfLines={1}>{description}</Text>
);

/** 游戏标签行组件 (大区 + 段位 + 巅峰分) */
const GameTagsRow: React.FC<{
  serverRegion: string;
  rank: string;
  peakScore: number | null;
}> = ({ serverRegion, rank, peakScore }) => {
  const peakDisplay = formatPeakScoreDisplay(peakScore);
  return (
    <View style={styles.gameTagsRow}>
      <View style={styles.gameTag}><Text style={styles.gameTagText}>{serverRegion}</Text></View>
      <View style={styles.gameTag}><Text style={styles.gameTagText}>{rank}</Text></View>
      {peakDisplay && <View style={styles.gameTag}><Text style={styles.gameTagText}>{peakDisplay}</Text></View>}
    </View>
  );
};

/** 价格区域组件 */
const PriceSection: React.FC<{
  displayText: string;
  distanceDisplay: string | null;
}> = ({ displayText, distanceDisplay }) => (
  <View style={styles.priceSection}>
    <Text style={styles.priceText}>{displayText}</Text>
    {distanceDisplay && <Text style={styles.distanceText}>{distanceDisplay}</Text>}
  </View>
);

// ==================== 主组件 ====================

/**
 * PlayerCardItem 主组件
 *
 * @description 玩家卡片渲染组件，使用 memo 优化性能
 * @param data 玩家卡片数据
 * @param onPress 点击回调，传入 serviceId
 */
const PlayerCardItem: React.FC<PlayerCardItemProps> = ({ data, onPress }) => {
  const { serviceId, avatarData, basicInfo, certificationData, skillData, gameTagData, priceData, locationData } = data;

  /** 处理卡片点击事件 */
  const handleCardPress = useCallback(() => {
    onPress?.(serviceId);
  }, [serviceId, onPress]);

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={handleCardPress} activeOpacity={0.85}>
      {/* 左侧：头像区域 */}
      <AvatarSection url={avatarData.url} isVideo={avatarData.isVideo} />

      {/* 中间：信息区域 */}
      <View style={styles.infoSection}>
        <BasicInfoRow nickname={basicInfo.nickname} gender={basicInfo.gender} age={basicInfo.age} />
        <CertificationRow isVerified={certificationData.isVerified} isExpert={certificationData.isExpert} />
        <SkillDescriptionRow description={skillData.description} />
        <GameTagsRow serverRegion={gameTagData.serverRegion} rank={gameTagData.rank} peakScore={gameTagData.peakScore} />
      </View>

      {/* 右侧：价格区域 */}
      <PriceSection displayText={priceData.displayText} distanceDisplay={locationData.distanceDisplay} />
    </TouchableOpacity>
  );
};

// ==================== 样式定义 ====================

const styles = StyleSheet.create({
  /* 卡片容器：圆角白色背景 + 三栏水平布局 */
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.cardBorderRadius,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.paddingSmall,
    padding: SIZES.paddingSmall,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  /* 头像区域 */
  avatarContainer: {
    width: SIZES.avatarWidth,
    height: SIZES.avatarHeight,
    borderRadius: SIZES.paddingSmall,
    overflow: 'hidden',
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.divider,
  },
  videoIndicator: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 2,
  },

  /* 信息区域 */
  infoSection: {
    flex: 1,
    marginLeft: SIZES.paddingSmall,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },

  /* 基本信息行 */
  basicInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nickname: {
    fontSize: SIZES.fontTitle,
    fontWeight: '600',
    color: COLORS.textPrimary,
    maxWidth: 100,
  },
  genderAgeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  ageText: {
    fontSize: 11,
    fontWeight: '500',
  },

  /* 认证标签行 */
  certificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  certBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: SIZES.tagBorderRadius,
    gap: 3,
  },
  certText: {
    fontSize: 10,
    fontWeight: '500',
  },

  /* 技能描述 */
  skillDescription: {
    fontSize: SIZES.fontCaption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  /* 游戏标签行 */
  gameTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  gameTag: {
    backgroundColor: COLORS.divider,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: SIZES.tagBorderRadius,
  },
  gameTagText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },

  /* 价格区域 */
  priceSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 8,
    minWidth: 60,
  },
  priceText: {
    fontSize: SIZES.fontTitle,
    fontWeight: '700',
    color: COLORS.primary,
  },
  distanceText: {
    fontSize: SIZES.fontCaption,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
});

export default memo(PlayerCardItem);
export type { PlayerCardItemProps };
