/**
 * ServiceDetailPage - 服务详情页常量配置
 *
 * 基于 详情页_结构文档.md STEP 4 布局定位
 */

import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// #region 颜色配置
export const COLORS = {
  // 基础颜色
  BACKGROUND: '#FFFFFF',
  SURFACE: '#F8FAFC',

  // 主题色
  PRIMARY: '#7C3AED',        // 紫色主题
  PRIMARY_LIGHT: '#F0E6FF',  // 浅紫色背景
  GRADIENT_START: '#7C3AED',
  GRADIENT_END: '#818CF8',

  // 文字颜色
  TEXT: '#1F2937',
  TEXT_SECONDARY: '#6B7280',
  TEXT_LIGHT: '#9CA3AF',

  // 边框
  BORDER: '#E5E7EB',
  DIVIDER: '#F0F0F0',

  // 状态颜色
  ONLINE: '#52C41A',         // 在线绿点
  PRICE: '#FF4D4F',          // 价格红色
  RATING: '#FA8C16',         // 评分橙色

  // 标签颜色
  TAG_CERT_BG: '#FFF7E6',    // 认证标签背景（金色）
  TAG_CERT_TEXT: '#D4A574',  // 认证标签文字
  TAG_SKILL_BG: '#F0E6FF',   // 技能标签背景（淡紫色）
  TAG_SKILL_TEXT: '#7C3AED', // 技能标签文字
  TAG_HIGHLIGHT_BG: '#F0E6FF', // 精选标签背景
  TAG_HIGHLIGHT_TEXT: '#7C3AED',
};
// #endregion

// #region 尺寸配置
export const SIZES = {
  // 屏幕尺寸
  SCREEN_WIDTH,
  SCREEN_HEIGHT,

  // 导航栏
  NAV_HEIGHT: 56,
  STATUS_BAR_HEIGHT: 44,

  // 游戏卡片轮播
  GAME_CARD_HEIGHT: SCREEN_HEIGHT * 0.4,  // 约40%屏幕高度

  // 用户信息区
  USER_INFO_HEIGHT: 70,
  AVATAR_SIZE: 48,
  AVATAR_RADIUS: 24,
  LEVEL_TAG_HEIGHT: 20,

  // 标签区
  TAG_HEIGHT: 28,
  TAG_RADIUS: 14,

  // 评价区
  REVIEW_AVATAR_SIZE: 36,
  STAR_SIZE: 12,

  // 底部操作栏
  ACTION_BAR_HEIGHT: 68,
  BUTTON_HEIGHT: 44,
  BUTTON_RADIUS: 20,

  // 间距
  PADDING_H: 16,
  PADDING_V: 12,
  GAP_SM: 4,
  GAP_MD: 8,
  GAP_LG: 12,
  GAP_XL: 16,

  // 字体大小
  FONT_XS: 10,
  FONT_SM: 12,
  FONT_MD: 14,
  FONT_LG: 16,
  FONT_XL: 18,
  FONT_XXL: 22,
};
// #endregion

// #region 页面配置
export const PAGE_CONFIG = {
  // 评价列表分页
  REVIEWS_PAGE_SIZE: 10,

  // 轮播自动播放间隔（毫秒）
  SWIPER_AUTO_INTERVAL: 3000,

  // 加载更多触发距离
  LOAD_MORE_THRESHOLD: 100,
};
// #endregion

// #region 路由配置
export const ROUTES = {
  // 用户相关
  USER_PROFILE: '/profile',

  // 评价相关
  REVIEW_LIST: '/service/reviews',

  // 私信
  CHAT: '/messages/chat',

  // 下单
  ORDER_CREATE: '/order/create',

  // 登录
  LOGIN: '/auth/login',

  // 图片预览
  IMAGE_PREVIEW: '/image-preview',
};
// #endregion

// #region 文案配置
export const TEXT = {
  // 导航栏
  NAV_TITLE: '详情',

  // 评价区
  REVIEW_TITLE: '评价',
  REVIEW_GOOD_RATE: '好评率',
  REVIEW_VIEW_ALL: '查看全部 >',
  REVIEW_EMPTY: '暂无评价',
  REVIEW_NO_MORE: '没有更多评价了',

  // 底部操作栏
  BTN_MESSAGE: '📧 私信',
  BTN_ORDER: '😊 下单',

  // 功能开发中提示
  FEATURE_DEVELOPING: '功能开发中',

  // 加载状态
  LOADING: '加载中...',
  ERROR_RETRY: '重试',

  // 活动信息图标
  ICON_TIME: '🕐',
  ICON_LOCATION: '📍',
  ICON_PRICE: '💰',
};
// #endregion

// #region 样式预设
export const SHADOWS = {
  // 卡片阴影
  CARD: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  // 按钮阴影
  BUTTON: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
};
// #endregion
