// #region 1. File Banner & TOC
/**
 * NavigationArea - 导航区域组件
 *
 * 功能：
 * - 三Tab切换（关注/热门/同城）
 * - 搜索按钮和发布按钮
 * - Tab下划线指示器（紫色渐变）
 *
 * 设计规格（基于UI设计文档 - 发现页_结构文档.md）：
 * - 高度: 44px
 * - Tab间距: 32px (gap-32px)
 * - 默认Tab: 16sp, #666666, 常规
 * - 选中Tab: 18sp, #333333, 加粗, 带下划线(紫色渐变)
 *
 * TOC (快速跳转):
 * [1] File Banner & TOC
 * [2] Imports
 * [3] Types & Schema
 * [4] Constants & Config
 * [5] Utils & Helpers
 * [6] State Management
 * [7] Domain Logic
 * [8] UI Components & Rendering
 * [9] Exports
 */
// #endregion

// #region 2. Imports
import React, { useCallback } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// 类型
import type { TabType } from '../../../types';
import { TABS } from '../../constants';
import type { NavigationAreaProps } from '../../types';
// #endregion

// #region 3. Types & Schema
// (使用NavigationAreaProps from types.ts)
// #endregion

// #region 4. Constants & Config
/**
 * 颜色配置 - 基于UI设计文档
 */
const COLORS = {
  BACKGROUND: '#FFFFFF',
  BORDER: '#F0F0F0',
  TAB_ACTIVE: '#333333',        // 选中文字色 (文档要求)
  TAB_INACTIVE: '#666666',      // 默认文字色 (文档要求)
  INDICATOR: '#8A2BE2',         // 下划线指示器色 (紫色)
  PUBLISH_BG: '#8A2BE2',        // 发布按钮背景色
  SEARCH_ICON: '#666666',
} as const;

/**
 * 尺寸配置 - 基于UI设计文档
 */
const SIZES = {
  HEIGHT: 44,                   // Tab区域高度 (文档要求44px)
  TAB_GAP: 32,                  // Tab间距 (文档要求gap-32px)
  INDICATOR_HEIGHT: 3,          // 下划线高度
  INDICATOR_WIDTH: 24,          // 下划线宽度
  INDICATOR_RADIUS: 1.5,        // 下划线圆角
  BUTTON_SIZE: 36,              // 按钮触摸区域
  PUBLISH_INNER_SIZE: 28,       // 发布按钮内圈尺寸
  BORDER_WIDTH: 0.5,
} as const;

/**
 * 排版配置 - 基于UI设计文档
 * 默认: 16sp, #666666, 常规
 * 选中: 18sp, #333333, 加粗
 */
const TYPOGRAPHY = {
  TAB_DEFAULT: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  TAB_ACTIVE: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
} as const;
// #endregion

// #region 5. Utils & Helpers
// (无需辅助函数)
// #endregion

// #region 6. State Management
// (简单组件，无需独立状态管理Hook)
// #endregion

// #region 7. Domain Logic
/**
 * NavigationArea业务逻辑Hook
 */
const useNavigationLogic = (props: NavigationAreaProps) => {
  const { activeTab, onTabChange, onSearchPress, onPublishPress } = props;

  /**
   * Tab点击处理
   */
  const handleTabPress = useCallback((tab: TabType) => {
    if (tab !== activeTab) {
      onTabChange(tab);
    }
  }, [activeTab, onTabChange]);

  /**
   * 搜索按钮点击 - 进入搜索模式
   */
  const handleSearchButtonPress = useCallback(() => {
    onSearchPress();
  }, [onSearchPress]);

  /**
   * 发布按钮点击 - 进入发布页面
   */
  const handlePublishButtonPress = useCallback(() => {
    onPublishPress();
  }, [onPublishPress]);

  return {
    activeTab,
    handleTabPress,
    handleSearchButtonPress,
    handlePublishButtonPress,
  };
};
// #endregion

// #region 8. UI Components & Rendering
/**
 * TabItem 单个Tab项组件
 */
const TabItem: React.FC<{
  tab: { key: TabType; label: string };
  isActive: boolean;
  isLast: boolean;
  onPress: (key: TabType) => void;
}> = ({ tab, isActive, isLast, onPress }) => (
  <TouchableOpacity
    style={[styles.tab, !isLast && styles.tabWithGap]}
    onPress={() => onPress(tab.key)}
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
    {/* 下划线指示器 - 仅在选中时显示 */}
    {isActive && (
      <View style={styles.indicator} />
    )}
  </TouchableOpacity>
);

/**
 * NavigationArea主组件
 */
const NavigationArea: React.FC<NavigationAreaProps> = (props) => {
  const {
    activeTab,
    handleTabPress,
    handleSearchButtonPress,
    handlePublishButtonPress,
  } = useNavigationLogic(props);

  return (
    <View style={[styles.container, props.style]}>
      <View style={styles.content}>
        {/* Tab列表 - 居中布局 */}
        <View style={styles.tabContainer}>
          {TABS.map((tab, index) => (
            <TabItem
              key={tab.key}
              tab={tab}
              isActive={tab.key === activeTab}
              isLast={index === TABS.length - 1}
              onPress={handleTabPress}
            />
          ))}
        </View>

        {/* 右侧按钮区 */}
        <View style={styles.rightButtonsContainer}>
          {/* 发布按钮 */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handlePublishButtonPress}
            activeOpacity={0.7}
          >
            <View style={styles.publishButtonInner}>
              <Text style={styles.publishIcon}>+</Text>
            </View>
          </TouchableOpacity>

          {/* 搜索按钮 */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSearchButtonPress}
            activeOpacity={0.7}
          >
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 底部边框线 */}
      <View style={styles.border} />
    </View>
  );
};
// #endregion

// #region 9. Exports
const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    height: SIZES.HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  tabWithGap: {
    marginRight: SIZES.TAB_GAP,  // 32px间距
  },
  tabText: {
    ...TYPOGRAPHY.TAB_DEFAULT,
    color: COLORS.TAB_INACTIVE,
  },
  tabTextActive: {
    ...TYPOGRAPHY.TAB_ACTIVE,
    color: COLORS.TAB_ACTIVE,
  },
  indicator: {
    position: 'absolute',
    bottom: 4,
    width: SIZES.INDICATOR_WIDTH,
    height: SIZES.INDICATOR_HEIGHT,
    backgroundColor: COLORS.INDICATOR,
    borderRadius: SIZES.INDICATOR_RADIUS,
  },
  rightButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    width: SIZES.BUTTON_SIZE,
    height: SIZES.BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishButtonInner: {
    width: SIZES.PUBLISH_INNER_SIZE,
    height: SIZES.PUBLISH_INNER_SIZE,
    borderRadius: SIZES.PUBLISH_INNER_SIZE / 2,
    backgroundColor: COLORS.PUBLISH_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
    lineHeight: 22,
    marginTop: -1,  // 微调垂直居中
  },
  searchIcon: {
    fontSize: 20,
  },
  border: {
    height: SIZES.BORDER_WIDTH,
    backgroundColor: COLORS.BORDER,
  },
});

export default NavigationArea;
export type { NavigationAreaProps } from '../../types';
// #endregion
