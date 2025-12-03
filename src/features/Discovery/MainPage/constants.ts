/**
 * MainPage - 常量配置
 */

import { TabType } from '../types';

/**
 * Tab配置
 * 注：key与BFF API一致使用'nearby'，label显示为"同城"
 */
export const TABS: Array<{ key: TabType; label: string }> = [
  { key: 'follow', label: '关注' },
  { key: 'hot', label: '热门' },
  { key: 'nearby', label: '同城' },
];

/**
 * 页面配置
 */
export const PAGE_CONFIG = {
  // 刷新间隔（毫秒）
  REFRESH_COOLDOWN: 5000,
  // 每页数量
  PAGE_SIZE: 20,
  // 滚动阈值（触发加载更多）
  LOAD_MORE_THRESHOLD: 0.5,
  // 初始加载延迟
  INITIAL_LOAD_DELAY: 300,
} as const;

/**
 * UI尺寸
 */
export const SIZES = {
  // 导航栏高度
  NAV_HEIGHT: 48,
  // Tab高度
  TAB_HEIGHT: 44,
  // 内容区域顶部边距
  CONTENT_TOP_MARGIN: 56,
  // 卡片间距
  CARD_SPACING: 8,
  // 屏幕水平内边距
  SCREEN_PADDING: 16,
} as const;

/**
 * 颜色配置
 */
export const COLORS = {
  // 导航栏
  NAV_BACKGROUND: '#FFFFFF',
  NAV_BORDER: '#F0F0F0',
  
  // Tab
  TAB_ACTIVE: '#8A2BE2',
  TAB_INACTIVE: '#999999',
  TAB_INDICATOR: '#8A2BE2',
  
  // 背景
  BACKGROUND: '#F5F5F5',
  CARD_BACKGROUND: '#FFFFFF',
  
  // 文字
  TEXT_PRIMARY: '#000000',
  TEXT_SECONDARY: '#666666',
  TEXT_TERTIARY: '#999999',
} as const;

/**
 * 动画配置
 */
export const ANIMATION = {
  TAB_SWITCH_DURATION: 200,
  CARD_PRESS_DURATION: 150,
  REFRESH_DURATION: 300,
} as const;
