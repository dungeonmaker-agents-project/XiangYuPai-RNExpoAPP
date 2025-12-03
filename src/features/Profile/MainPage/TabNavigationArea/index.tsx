// #region 1. File Banner & TOC
/**
 * TabNavigationArea - Tab标签栏
 *
 * 功能：
 * - 四Tab切换（动态/收藏/点赞/资料）
 * - Tab指示器动画
 *
 * UI设计参考：个人主页-资料.png / 个人主页-动态.png
 */
// #endregion

// #region 2. Imports
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { TABS } from '../../constants';
import { COLORS, SIZES } from '../constants';
import type { TabNavigationAreaProps } from '../types';
// #endregion

// #region 8. UI Components & Rendering
const TabNavigationArea: React.FC<TabNavigationAreaProps> = ({
  activeTab,
  onTabChange,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                isActive && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
            {isActive && <View style={styles.indicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
// #endregion

// #region 9. Exports & Styles
const styles = StyleSheet.create({
  container: {
    height: SIZES.TAB_HEIGHT,
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  tabTextActive: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: 24,
    height: 3,
    backgroundColor: '#8B5CF6',
    borderRadius: 1.5,
  },
});

export default TabNavigationArea;
// #endregion

