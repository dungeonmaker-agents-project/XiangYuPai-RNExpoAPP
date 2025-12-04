/**
 * SearchArea 组件
 *
 * 搜索区域组件，显示在头部区域替换导航栏
 * 包含：
 * - 关闭按钮
 * - 搜索输入框
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS, NAV_BAR_HEIGHT } from '../constants';
import { SearchAreaProps } from '../types';

/**
 * 搜索区域组件
 */
export const SearchArea: React.FC<SearchAreaProps> = ({
  searchQuery,
  onSearchQueryChange,
  onCancel,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onCancel} activeOpacity={0.7}>
        <Ionicons name="close" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="搜索"
        value={searchQuery}
        onChangeText={onSearchQueryChange}
        autoFocus
        placeholderTextColor={COLORS.textGray}
        returnKeyType="search"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: NAV_BAR_HEIGHT,
    paddingHorizontal: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 36,
    backgroundColor: COLORS.background,
    borderRadius: 18,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginHorizontal: 8,
  },
});

export default SearchArea;
