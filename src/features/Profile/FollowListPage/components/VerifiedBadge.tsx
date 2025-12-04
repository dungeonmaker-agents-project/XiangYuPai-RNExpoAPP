/**
 * VerifiedBadge 组件
 *
 * 实名认证标识组件
 * 显示绿色盾牌图标和"实名认证"文字
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants';
import { VerifiedBadgeProps } from '../types';

/**
 * 实名认证标识组件
 */
export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ visible }) => {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Ionicons name="shield-checkmark" size={14} color={COLORS.success} />
      <Text style={styles.text}>实名认证</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  text: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '500',
    marginLeft: 2,
  },
});

export default VerifiedBadge;
