/**
 * GenderAgeBadge 组件
 *
 * 显示性别和年龄的标签组件
 * 根据性别显示不同颜色的标签
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GENDER_CONFIG } from '../constants';
import { GenderAgeBadgeProps } from '../types';

/**
 * 性别年龄标签组件
 */
export const GenderAgeBadge: React.FC<GenderAgeBadgeProps> = ({ gender, age }) => {
  const config = GENDER_CONFIG[gender] || GENDER_CONFIG.other;

  // 构建显示文本：性别 + 年龄（如果有）
  const displayText = age ? `${config.label} ${age}` : config.label;

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor }]}>
      <Text style={[styles.text, { color: config.color }]}>{displayText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  text: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default GenderAgeBadge;
