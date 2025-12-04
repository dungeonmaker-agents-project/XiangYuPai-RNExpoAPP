/**
 * HeaderArea 组件
 *
 * 页面头部区域组件，包含：
 * - 返回按钮
 * - Tab 切换（关注/粉丝）
 * - 搜索图标
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, NAV_BAR_HEIGHT, TAB_BAR_HEIGHT, TAB_LABELS } from '../constants';
import { HeaderAreaProps } from '../types';

/**
 * 头部区域组件
 */
export const HeaderArea: React.FC<HeaderAreaProps> = ({
  activeTab,
  onTabChange,
  onSearchPress,
  onBack,
}) => {
  return (
    <View style={styles.container}>
      {/* 导航栏 */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navButton} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.navTitle}>我的-关注</Text>

        <TouchableOpacity style={styles.navButton} onPress={onSearchPress} activeOpacity={0.7}>
          <Ionicons name="search" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Tab 切换栏 */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'following' && styles.tabActive]}
          onPress={() => onTabChange('following')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'following' && styles.tabTextActive]}>
            {TAB_LABELS.following}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'followers' && styles.tabActive]}
          onPress={() => onTabChange('followers')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'followers' && styles.tabTextActive]}>
            {TAB_LABELS.followers}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
  },
  // 导航栏
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: NAV_BAR_HEIGHT,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  // Tab 切换栏
  tabBar: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default HeaderArea;
