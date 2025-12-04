/**
 * EmptyState 组件
 *
 * 空状态组件
 * 当列表为空时显示的占位内容
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants';
import { EmptyStateProps } from '../types';

/**
 * 空状态组件
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ activeTab, hasSearch }) => {
  // 根据当前 Tab 和搜索状态确定显示内容
  const iconName = activeTab === 'following' ? 'person-outline' : 'people-outline';
  const message = hasSearch
    ? '未找到相关用户'
    : activeTab === 'following'
      ? '暂无关注'
      : '暂无粉丝';

  return (
    <View style={styles.container}>
      <Ionicons name={iconName} size={64} color={COLORS.border} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  text: {
    fontSize: 15,
    color: COLORS.textGray,
    marginTop: 16,
  },
});

export default EmptyState;
