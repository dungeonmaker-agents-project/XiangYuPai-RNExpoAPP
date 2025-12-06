/**
 * NavArea - 导航区域组件 [L2]
 *
 * 功能：固定顶部导航栏，包含返回按钮和标题
 * 位置：页面顶部，高度56px
 */

import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORS, SIZES, TEXT } from './constants';
import type { NavAreaProps } from './types';

/** 导航区域组件 */
const NavArea: React.FC<NavAreaProps> = memo(({ title = TEXT.NAV_TITLE, onBack }) => (
  <View style={styles.container}>
    {/* 返回按钮 [L3] */}
    <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
      <Ionicons name="chevron-back" size={24} color={COLORS.TEXT} />
    </TouchableOpacity>

    {/* 标题 [L3] */}
    <Text style={styles.title}>{title}</Text>

    {/* 右侧占位 - 保持标题居中 */}
    <View style={styles.placeholder} />
  </View>
));

NavArea.displayName = 'NavArea';

const styles = StyleSheet.create({
  container: {
    height: SIZES.NAV_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.PADDING_H,
    backgroundColor: COLORS.BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.DIVIDER,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  title: {
    fontSize: SIZES.FONT_XL,
    fontWeight: '600',
    color: COLORS.TEXT,
  },
  placeholder: {
    width: 40,
  },
});

export default NavArea;
