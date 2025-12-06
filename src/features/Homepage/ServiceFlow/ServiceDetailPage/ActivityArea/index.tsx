/**
 * ActivityArea - 活动信息区域组件 [L2]
 *
 * 功能：展示线下活动的描述、时间、地点、价格（仅线下服务显示）
 * 位置：用户信息下方
 */

import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, SIZES, TEXT } from '../constants';
import type { ActivityAreaProps } from '../types';

/** 活动信息行组件 */
const ActivityInfoRow: React.FC<{ icon: string; text: string }> = memo(({ icon, text }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoIcon}>{icon}</Text>
    <Text style={styles.infoText}>{text}</Text>
  </View>
));

ActivityInfoRow.displayName = 'ActivityInfoRow';

/** 活动信息区域组件 */
const ActivityArea: React.FC<ActivityAreaProps> = memo(({ data }) => {
  const { description, dateTime, location, price, priceUnit } = data;

  return (
    <View style={styles.container}>
      {/* 活动描述 [L3] */}
      <View style={styles.descSection}>
        <Text style={styles.description}>{description}</Text>
      </View>

      {/* 活动信息列表 [L3] */}
      <View style={styles.infoSection}>
        {/* 时间行 */}
        <ActivityInfoRow icon={TEXT.ICON_TIME} text={dateTime} />
        {/* 地点行 */}
        <ActivityInfoRow icon={TEXT.ICON_LOCATION} text={location} />
        {/* 价格行 */}
        <ActivityInfoRow icon={TEXT.ICON_PRICE} text={`${price}${priceUnit}`} />
      </View>
    </View>
  );
});

ActivityArea.displayName = 'ActivityArea';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SIZES.PADDING_H,
    paddingVertical: SIZES.PADDING_V,
    backgroundColor: COLORS.BACKGROUND,
    gap: SIZES.GAP_LG,
  },
  descSection: {
    // 描述区域
  },
  description: {
    fontSize: SIZES.FONT_LG,
    color: COLORS.TEXT,
    lineHeight: 24,
  },
  infoSection: {
    gap: SIZES.GAP_MD,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.GAP_MD,
  },
  infoIcon: {
    fontSize: 20,
    width: 24,
    textAlign: 'center',
  },
  infoText: {
    fontSize: SIZES.FONT_MD,
    color: COLORS.TEXT_SECONDARY,
    flex: 1,
  },
});

export default ActivityArea;
