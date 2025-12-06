/**
 * TagsArea - 标签区域组件 [L2]
 *
 * 功能：展示认证标签和技能标签列表（仅线上服务显示）
 * 位置：用户信息下方
 */

import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, SIZES } from './constants';
import type { TagsAreaProps } from './types';

/** 标签区域组件 */
const TagsArea: React.FC<TagsAreaProps> = memo(({ data }) => {
  const { certification, tags } = data;

  if (!certification && (!tags || tags.length === 0)) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* 认证标签 [L3] - 金色背景 */}
      {certification && (
        <View style={styles.certTag}>
          <Text style={styles.certIcon}>🏆</Text>
          <Text style={styles.certText}>{certification}</Text>
        </View>
      )}

      {/* 技能标签列表 [L3] - 紫色文字 */}
      {tags.map((tag, index) => (
        <View key={index} style={styles.skillTag}>
          <Text style={styles.skillText}>{tag.text}</Text>
        </View>
      ))}
    </View>
  );
});

TagsArea.displayName = 'TagsArea';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.GAP_MD,
    paddingHorizontal: SIZES.PADDING_H,
    paddingBottom: SIZES.PADDING_V,
    backgroundColor: COLORS.BACKGROUND,
  },
  certTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.TAG_RADIUS,
    backgroundColor: COLORS.TAG_CERT_BG,
    gap: 4,
  },
  certIcon: {
    fontSize: 12,
  },
  certText: {
    fontSize: SIZES.FONT_SM,
    fontWeight: '500',
    color: COLORS.TAG_CERT_TEXT,
  },
  skillTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.TAG_RADIUS,
    backgroundColor: COLORS.TAG_SKILL_BG,
  },
  skillText: {
    fontSize: SIZES.FONT_SM,
    fontWeight: '500',
    color: COLORS.TAG_SKILL_TEXT,
  },
});

export default TagsArea;
