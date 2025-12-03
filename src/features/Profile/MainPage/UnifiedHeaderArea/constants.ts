/**
 * UnifiedHeaderArea - Constants
 * 统一头部区域常量定义
 *
 * UI设计参考：个人主页-资料.png / 个人主页-动态.png
 * 背景图片占屏幕约50%高度，用户信息在底部
 */

import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// #region Layout Constants
export const BACKGROUND_HEIGHT = Math.round(SCREEN_HEIGHT * 0.52); // 背景图片高度（屏幕52%）
export const CARD_ELEVATION_OFFSET = -40; // 卡片上浮偏移量（负值表示向上）
export const CARD_BORDER_RADIUS = 20; // 卡片圆角（更圆润）
export const CARD_HORIZONTAL_MARGIN = 16; // 卡片左右边距
// #endregion

// #region Colors
export const COLORS = {
  // Background
  DEFAULT_BACKGROUND: '#A855F7', // 默认紫色背景
  GRADIENT_START: 'rgba(0, 0, 0, 0)',
  GRADIENT_MID: 'rgba(0, 0, 0, 0.3)',
  GRADIENT_END: 'rgba(0, 0, 0, 0.6)',
  
  // Card
  CARD_BACKGROUND: '#FFFFFF',
  CARD_SHADOW: '#000000',
  
  // Text
  TEXT_PRIMARY: '#333333',
  TEXT_SECONDARY: '#757575',
  TEXT_WHITE: '#FFFFFF',
  
  // Gender
  MALE_BG: '#87CEEB', // 蓝色
  FEMALE_BG: '#FFB6C1', // 粉色
  
  // Status
  ONLINE_DOT: '#4CAF50', // 绿色
  OFFLINE_DOT: '#BDBDBD', // 灰色
  
  // Badges
  REAL_VERIFIED_BG: '#E3F2FD',
  REAL_VERIFIED_TEXT: '#2196F3',
  GOD_VERIFIED_BG: '#FFF3E0',
  GOD_VERIFIED_TEXT: '#FF9800',
  VIP_VERIFIED_BG: '#F3E5F5',
  VIP_VERIFIED_TEXT: '#9C27B0',
  
  // Buttons
  EDIT_BUTTON_BG: 'rgba(255, 255, 255, 0.3)',
  EDIT_BUTTON_BORDER: 'rgba(255, 255, 255, 0.5)',
  FOLLOW_BUTTON_BG: '#8A2BE2',
  FOLLOWING_BUTTON_BG: 'rgba(255, 255, 255, 0.3)',
  BUTTON_SHADOW: '#8A2BE2',
};
// #endregion

// #region Sizes
export const SIZES = {
  // Avatar & Icons
  ONLINE_DOT_SIZE: 8,
  BADGE_ICON_SIZE: 12,
  
  // Spacing
  SPACING_TINY: 4,
  SPACING_SMALL: 8,
  SPACING_MEDIUM: 12,
  SPACING_LARGE: 16,
  SPACING_XLARGE: 20,
  
  // Font Sizes
  FONT_NICKNAME: 22,
  FONT_TAG: 12,
  FONT_STATUS: 14,
  FONT_BUTTON: 14,
};
// #endregion

// #region Text Labels
export const LABELS = {
  GENDER_MALE: '男生',
  GENDER_FEMALE: '女孩',
  ONLINE: '在线',
  OFFLINE: '离线',
  FOLLOWERS: '粉丝',
  EDIT: '编辑',
  FOLLOW: '关注',
  FOLLOWING: '已关注',
  MUTUAL_FOLLOWING: '互相关注',
  REAL_VERIFIED: '真人认证',
  GOD_VERIFIED: '大神',
  VIP_VERIFIED: 'VIP',
};
// #endregion

// #region Computed Values
export const CARD_WIDTH = SCREEN_WIDTH - (CARD_HORIZONTAL_MARGIN * 2);
// #endregion

