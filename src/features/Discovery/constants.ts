/**
 * Discovery模块 - 常量配置
 * 
 * 包含：
 * - UI尺寸常量
 * - 颜色常量
 * - 动画时长常量
 * - Tab类型常量
 * - 举报理由常量
 * - 评论排序常量
 * - API配置常量
 * - 媒体限制常量
 * - 内容限制常量
 */

// ==================== UI尺寸常量 ====================

export const UI_SIZES = {
  // 系统栏高度
  SYSTEM_STATUS_BAR_HEIGHT: 44,
  NAVIGATION_BAR_HEIGHT: 56,
  BOTTOM_TAB_BAR_HEIGHT: 80,
  SAFE_AREA_BOTTOM: 34,
  
  // 用户头像尺寸
  USER_AVATAR_SIZE_SMALL: 32,
  USER_AVATAR_SIZE_MEDIUM: 40,
  USER_AVATAR_SIZE_LARGE: 48,
  
  // 卡片尺寸
  CARD_PADDING_HORIZONTAL: 16,
  CARD_PADDING_VERTICAL: 12,
  CARD_MARGIN_BOTTOM: 8,
  
  // 媒体尺寸
  MEDIA_BORDER_RADIUS: 8,
  MEDIA_BORDER_RADIUS_LARGE: 12,
  MEDIA_GRID_GAP: 4,
  
  // 按钮尺寸
  BUTTON_HEIGHT: 32,
  BUTTON_HEIGHT_LARGE: 40,
  ICON_SIZE_SMALL: 16,
  ICON_SIZE_MEDIUM: 20,
  ICON_SIZE_LARGE: 24,
} as const;

// ==================== 颜色常量 ====================

export const COLORS = {
  // 主题色
  PRIMARY: '#8A2BE2',
  PRIMARY_LIGHT: '#A855F7',
  PRIMARY_DARK: '#6B21A8',
  
  // 文字颜色
  TEXT_PRIMARY: '#000000',
  TEXT_SECONDARY: '#666666',
  TEXT_TERTIARY: '#999999',
  TEXT_QUATERNARY: '#CCCCCC',
  TEXT_DISABLED: '#E5E5E5',
  
  // 背景颜色
  BACKGROUND_WHITE: '#FFFFFF',
  BACKGROUND_GRAY: '#F5F5F5',
  BACKGROUND_DARK: '#F0F0F0',
  BACKGROUND_MASK: 'rgba(0, 0, 0, 0.5)',
  
  // 功能颜色
  LIKE_COLOR: '#FF0000',
  LIKE_COLOR_ACTIVE: '#FF4444',
  COLLECT_COLOR: '#FFD700',
  SHARE_COLOR: '#666666',
  COMMENT_COLOR: '#666666',
  
  // 标签颜色
  TAG_GENDER_MALE: '#4A9EFF',
  TAG_GENDER_FEMALE: '#FF69B4',
  TAG_POPULAR: '#FF8C00',
  TAG_CERTIFIED: '#00C853',
  
  // 状态颜色
  SUCCESS: '#00C853',
  ERROR: '#FF3B30',
  WARNING: '#FF9500',
  INFO: '#007AFF',
  
  // 分隔线颜色
  DIVIDER: '#F0F0F0',
  DIVIDER_LIGHT: '#F5F5F5',
  BORDER: '#E5E5E5',
} as const;

// ==================== 动画时长常量 ====================

export const ANIMATION_DURATION = {
  INSTANT: 0,
  FAST: 150,
  SHORT: 200,
  MEDIUM: 300,
  LONG: 500,
  SLOW: 800,
} as const;

// ==================== Tab类型常量 ====================

export const TAB_TYPES = {
  FOLLOW: 'follow',
  HOT: 'hot',
  NEARBY: 'nearby',
} as const;

export const TAB_LABELS = {
  [TAB_TYPES.FOLLOW]: '关注',
  [TAB_TYPES.HOT]: '热门',
  [TAB_TYPES.NEARBY]: '同城',
} as const;

// ==================== 举报理由常量 ====================

export const REPORT_REASONS = {
  SPAM: {
    id: 1,
    title: '垃圾信息',
    desc: '广告、营销信息等',
  },
  INAPPROPRIATE: {
    id: 2,
    title: '不当内容',
    desc: '色情、暴力、血腥等',
  },
  COPYRIGHT: {
    id: 3,
    title: '侵权内容',
    desc: '盗用他人作品、肖像等',
  },
  FAKE: {
    id: 4,
    title: '虚假信息',
    desc: '谣言、不实消息等',
  },
  HARASSMENT: {
    id: 5,
    title: '骚扰他人',
    desc: '恶意@用户、言语攻击等',
  },
  OTHER: {
    id: 6,
    title: '其他',
    desc: '其他违规行为',
  },
} as const;

// ==================== 评论排序常量 ====================

export const COMMENT_SORT_TYPES = {
  TIME: 'time',
  HOT: 'hot',
  LIKE: 'like',
} as const;

export const COMMENT_SORT_LABELS = {
  [COMMENT_SORT_TYPES.TIME]: '按时间',
  [COMMENT_SORT_TYPES.HOT]: '按热度',
  [COMMENT_SORT_TYPES.LIKE]: '按点赞',
} as const;

// ==================== API配置常量 ====================

export const API_CONFIG = {
  BASE_URL: '/api/v1/discovery',
  TIMEOUT: 10000,
  PAGE_SIZE: 20,
  RETRY_TIMES: 3,
  RETRY_DELAY: 1000,
} as const;

// ==================== 媒体限制常量 ====================

export const MEDIA_LIMITS = {
  MAX_IMAGE_COUNT: 9,
  MAX_VIDEO_COUNT: 1,
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_VIDEO_DURATION: 300, // 5分钟
  
  IMAGE_QUALITY: 0.8,
  VIDEO_QUALITY: 'high',
} as const;

// ==================== 内容限制常量 ====================

export const CONTENT_LIMITS = {
  TITLE_MAX_LENGTH: 50,
  CONTENT_MAX_LENGTH: 1000,
  COMMENT_MAX_LENGTH: 500,
  REPORT_DESC_MAX_LENGTH: 500,
  
  MAX_TOPIC_COUNT: 5,
  MAX_TOPIC_NAME_LENGTH: 20,
} as const;

// ==================== 路由常量 ====================

export const ROUTES = {
  DISCOVERY: {
    MAIN: '/(tabs)/discover',
    DETAIL: '/(tabs)/discover/detail',
    TOPIC: '/(tabs)/discover/topic',
    PUBLISH: '/(tabs)/discover/publish',
    TOPIC_SELECT: '/(tabs)/discover/topic-select',
    LOCATION_SELECT: '/(tabs)/discover/location-select',
    REPORT: '/(tabs)/discover/report',
  },
  MODAL: {
    USER_DETAIL: '/modal/user-detail',
    MEDIA_VIEWER: '/modal/media-viewer',
  },
} as const;
