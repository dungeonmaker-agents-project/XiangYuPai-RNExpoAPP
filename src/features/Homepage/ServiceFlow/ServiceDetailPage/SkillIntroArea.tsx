/**
 * SkillIntroArea - 技能介绍区域组件 [L2]
 *
 * 功能：展示技能标题和描述（仅线上服务显示）
 * 位置：标签区域下方
 */

import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, SIZES } from './constants';
import type { SkillIntroAreaProps } from './types';

/** 技能介绍区域组件 */
const SkillIntroArea: React.FC<SkillIntroAreaProps> = memo(({ data }) => {
  const { title, description } = data;

  return (
    <View style={styles.container}>
      {/* 技能标题 [L3] */}
      <Text style={styles.title}>{title}</Text>

      {/* 技能描述 [L3] */}
      <Text style={styles.description}>{description}</Text>
    </View>
  );
});

SkillIntroArea.displayName = 'SkillIntroArea';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SIZES.PADDING_H,
    paddingVertical: SIZES.PADDING_V,
    backgroundColor: COLORS.BACKGROUND,
    gap: SIZES.GAP_MD,
  },
  title: {
    fontSize: SIZES.FONT_LG,
    fontWeight: '600',
    color: COLORS.TEXT,
  },
  description: {
    fontSize: SIZES.FONT_MD,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
});

export default SkillIntroArea;
