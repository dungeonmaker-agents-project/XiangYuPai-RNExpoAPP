// #region 1. File Banner & TOC
/**
 * Discovery MainPage 配置文件
 * 
 * 功能：
 * - 集中管理Discovery页面的所有配置
 * - 统一颜色、排版、尺寸等常量
 * - 瀑布流相关配置
 * - Tab配置
 * 
 * 设计原则：
 * - 使用 as const 保证类型推断
 * - 分类管理（UI、瀑布流、Tab、数据等）
 * - 提供类型导出
 * 
 * 参考：WaterfallList和Profile的配置设计模式
 * 
 * TOC:
 * [1] File Banner & TOC
 * [2] UI Configuration
 * [3] Waterfall Configuration
 * [4] Tab Configuration
 * [5] Data Configuration
 * [6] Type Exports
 */
// #endregion

// #region 2. UI Configuration
/**
 * 颜色配置
 */
export const DISCOVERY_COLORS = {
  // 背景色
  BACKGROUND: '#F5F5F5',
  NAV_BACKGROUND: '#FFFFFF',
  CARD_BACKGROUND: '#FFFFFF',
  
  // 主题色
  PRIMARY: '#8A2BE2',
  SECONDARY: '#6A1BB2',
  
  // 文字色
  TEXT_PRIMARY: '#000000',
  TEXT_SECONDARY: '#666666',
  TEXT_TERTIARY: '#999999',
  TEXT_PLACEHOLDER: '#CCCCCC',
  
  // Tab颜色
  TAB_ACTIVE: '#8A2BE2',
  TAB_INACTIVE: '#666666',
  TAB_INDICATOR: '#8A2BE2',
  
  // 功能色
  LIKE_ACTIVE: '#FF4444',
  COLLECT_ACTIVE: '#FFB800',
  SUCCESS: '#52C41A',
  WARNING: '#FAAD14',
  ERROR: '#FF4D4F',
  
  // 分割线
  DIVIDER: '#F0F0F0',
  BORDER: '#E8E8E8',
  
  // 遮罩
  OVERLAY: 'rgba(0, 0, 0, 0.5)',
  OVERLAY_LIGHT: 'rgba(0, 0, 0, 0.3)',
} as const;

/**
 * 排版配置
 */
export const DISCOVERY_TYPOGRAPHY = {
  // Feed标题
  FEED_TITLE: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  
  // Feed内容
  FEED_CONTENT: {
    fontSize: 14,
    lineHeight: 20,
  },
  
  // 用户昵称
  USER_NICKNAME: {
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
  
  // 互动数据
  STAT_TEXT: {
    fontSize: 12,
    lineHeight: 16,
  },
  
  // Tab标签
  TAB_LABEL: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  
  // 导航标题
  NAV_TITLE: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  
  // 空状态文字
  EMPTY_TEXT: {
    fontSize: 15,
    lineHeight: 22,
  },
  
  // 底部提示
  FOOTER_TEXT: {
    fontSize: 13,
    lineHeight: 18,
  },
} as const;

/**
 * 尺寸配置
 */
export const DISCOVERY_SIZES = {
  // 导航栏
  NAV_HEIGHT: 56,
  NAV_PADDING_HORIZONTAL: 16,
  
  // Tab栏
  TAB_HEIGHT: 44,
  TAB_INDICATOR_HEIGHT: 3,
  TAB_INDICATOR_WIDTH: 40,
  TAB_PADDING_HORIZONTAL: 16,
  
  // 搜索框
  SEARCH_HEIGHT: 36,
  SEARCH_BORDER_RADIUS: 18,
  
  // 间距
  PADDING_HORIZONTAL: 16,
  PADDING_VERTICAL: 12,
  MARGIN_SMALL: 8,
  MARGIN_MEDIUM: 12,
  MARGIN_LARGE: 16,
  
  // 圆角
  BORDER_RADIUS_SMALL: 4,
  BORDER_RADIUS_MEDIUM: 8,
  BORDER_RADIUS_LARGE: 12,
  BORDER_RADIUS_XLARGE: 16,
} as const;
// #endregion

// #region 3. Waterfall Configuration
/**
 * 瀑布流配置 - 基于UI设计文档
 * 核心布局参数
 */
export const WATERFALL_CONFIG = {
  // 列配置
  NUM_COLUMNS: 2,           // 双列布局
  COLUMN_GAP: 8,            // 列间距 (文档要求 gap-8px)

  // 间距配置 - 基于UI文档
  HORIZONTAL_PADDING: 8,    // 左右边距 (文档要求 padding-8px)
  VERTICAL_SPACING: 8,      // 卡片垂直间距

  // 加载配置
  ON_END_REACHED_THRESHOLD: 0.5,  // 滚动到50%时触发加载
  INITIAL_NUM_TO_RENDER: 10,      // 初始渲染数量
  MAX_TO_RENDER_PER_BATCH: 10,    // 每批最多渲染数量
  WINDOW_SIZE: 10,                 // 虚拟化窗口大小

  // 高度估算配置
  DEFAULT_IMAGE_RATIO: 1.2,        // 默认图片比例（高/宽）
  BOTTOM_INFO_HEIGHT: 60,          // 底部信息区域高度（调整为更紧凑）
  CARD_PADDING: 8,                 // 卡片内边距 (文档要求 8px)

  // 性能优化
  REMOVE_CLIPPED_SUBVIEWS: true,   // 移除屏幕外视图
  UPDATE_CELLS_BATCH_PERIOD: 50,   // 批量更新周期（ms）
} as const;

/**
 * FeedCard尺寸配置 - 基于UI设计文档
 */
export const FEED_CARD_SIZES = {
  // 卡片配置 - 文档要求圆角8px
  BORDER_RADIUS: 8,
  SHADOW_RADIUS: 4,
  SHADOW_OPACITY: 0.08,
  ELEVATION: 2,

  // 图片配置
  IMAGE_BORDER_RADIUS: 8,
  IMAGE_MIN_HEIGHT: 120,
  IMAGE_MAX_HEIGHT: 500,

  // 用户信息 - 文档要求24x24
  AVATAR_SIZE: 24,
  AVATAR_BORDER_RADIUS: 12,

  // 互动按钮 - 文档要求12sp
  ACTION_ICON_SIZE: 14,
  ACTION_BUTTON_PADDING: 4,

  // 间距 - 文档要求8px
  CONTENT_PADDING: 8,
  BOTTOM_PADDING: 8,
  USER_INFO_MARGIN: 6,
} as const;

/**
 * 随机高度比例配置
 * 用于生成不同高度的卡片
 */
export const RANDOM_HEIGHT_RATIOS = [
  1.0,   // 1:1 (正方形)
  1.2,   // 5:6
  1.3,   // 4:5
  1.5,   // 2:3
  1.6,   // 8:13
  1.8,   // 9:16
] as const;
// #endregion

// #region 4. Tab Configuration
/**
 * Tab类型定义
 * 注：BFF API 使用 'nearby'，前端UI显示为"同城"
 */
export const TAB_TYPES = {
  FOLLOW: 'follow',
  HOT: 'hot',
  NEARBY: 'nearby',
} as const;

/**
 * Tab配置
 */
export const TAB_CONFIG = {
  // Tab标签文本
  LABELS: {
    [TAB_TYPES.FOLLOW]: '关注',
    [TAB_TYPES.HOT]: '热门',
    [TAB_TYPES.NEARBY]: '同城',
  },

  // Tab图标（可选）
  ICONS: {
    [TAB_TYPES.FOLLOW]: '👥',
    [TAB_TYPES.HOT]: '🔥',
    [TAB_TYPES.NEARBY]: '📍',
  },
  
  // 默认Tab
  DEFAULT_TAB: TAB_TYPES.HOT,
  
  // Tab动画配置
  ANIMATION: {
    SWITCH_DURATION: 300,
    INDICATOR_DURATION: 250,
    SPRING_CONFIG: {
      damping: 15,
      stiffness: 150,
    },
  },
} as const;
// #endregion

// #region 5. Data Configuration
/**
 * 数据加载配置
 */
export const DISCOVERY_DATA_CONFIG = {
  // 分页配置
  PAGE_SIZE: {
    [TAB_TYPES.FOLLOW]: 20,
    [TAB_TYPES.HOT]: 20,
    [TAB_TYPES.NEARBY]: 20,
  },
  
  // 加载配置
  INITIAL_LOAD_DELAY: 300,       // 初始加载延迟（ms）
  REFRESH_DEBOUNCE: 1000,        // 刷新防抖时间（ms）
  LOAD_MORE_DEBOUNCE: 500,       // 加载更多防抖（ms）
  
  // 重试配置
  RETRY_TIMES: 3,                // 失败重试次数
  RETRY_DELAY: 2000,             // 重试延迟（ms）
  RETRY_BACKOFF: 1.5,            // 退避倍数
  
  // 缓存配置
  CACHE_DURATION: 5 * 60 * 1000,   // 缓存时长（5分钟）
  MAX_CACHE_SIZE: 100,             // 最大缓存Feed数量
  PRELOAD_THRESHOLD: 5,            // 预加载阈值（剩余5条时加载）
  
  // 加载阈值
  LOAD_MORE_THRESHOLD: 0.8,      // 滚动到80%时加载更多
  REFRESH_THRESHOLD: 100,        // 下拉100px触发刷新
} as const;

/**
 * API配置
 */
export const DISCOVERY_API_CONFIG = {
  // API端点
  ENDPOINTS: {
    FOLLOW: '/xypai-content/api/v1/discovery/follow',
    HOT: '/xypai-content/api/v1/discovery/hot',
    NEARBY: '/xypai-content/api/v1/discovery/nearby',
  },
  
  // 超时配置
  TIMEOUT: 10000,  // 10秒
  
  // 请求头
  HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;

/**
 * 功能开关
 */
export const DISCOVERY_FEATURES = {
  // 功能开关
  ENABLE_WATERFALL: true,          // 启用瀑布流
  ENABLE_RANDOM_HEIGHT: true,      // 启用随机高度
  ENABLE_PULL_TO_REFRESH: true,    // 启用下拉刷新
  ENABLE_INFINITE_SCROLL: true,    // 启用无限滚动
  ENABLE_TAB_ANIMATION: true,      // 启用Tab动画
  ENABLE_SEARCH: true,             // 启用搜索功能
  
  // 交互功能
  ENABLE_LIKE: true,               // 启用点赞
  ENABLE_COLLECT: true,            // 启用收藏
  ENABLE_COMMENT: true,            // 启用评论
  ENABLE_SHARE: true,              // 启用分享
  
  // 实验性功能
  ENABLE_VIDEO_FEED: false,        // 启用视频Feed
  ENABLE_LIVE_FEED: false,         // 启用直播Feed
  ENABLE_AI_RECOMMEND: false,      // 启用AI推荐
} as const;

/**
 * 动画配置
 */
export const DISCOVERY_ANIMATIONS = {
  // Feed卡片动画
  CARD_PRESS_SCALE: 0.98,
  CARD_PRESS_DURATION: 150,
  
  // 加载动画
  LOADING_DURATION: 1500,
  LOADING_MIN_OPACITY: 0.3,
  LOADING_MAX_OPACITY: 1.0,
  
  // 点赞动画
  LIKE_SCALE: 1.2,
  LIKE_DURATION: 300,
  LIKE_SPRING: {
    damping: 10,
    stiffness: 200,
  },
  
  // 收藏动画
  COLLECT_SCALE: 1.2,
  COLLECT_DURATION: 300,
  
  // 滚动动画
  SCROLL_TO_TOP_DURATION: 500,
} as const;

/**
 * 默认值配置
 */
export const DISCOVERY_DEFAULTS = {
  // 默认图片
  DEFAULT_AVATAR: 'https://via.placeholder.com/24.png?text=User',
  DEFAULT_FEED_IMAGE: 'https://via.placeholder.com/400x500.png?text=No+Image',
  
  // 默认文本
  DEFAULT_NICKNAME: '用户',
  DEFAULT_TITLE: '无标题',
  DEFAULT_CONTENT: '暂无内容',
  
  // 默认统计
  DEFAULT_STATS: {
    likeCount: 0,
    collectCount: 0,
    commentCount: 0,
    shareCount: 0,
  },
  
  // 空状态文本
  EMPTY_MESSAGES: {
    [TAB_TYPES.FOLLOW]: '关注的人还没有发布动态',
    [TAB_TYPES.HOT]: '暂无热门内容',
    [TAB_TYPES.NEARBY]: '附近暂无动态',
    default: '暂无动态',
  },
} as const;
// #endregion

// #region 6. Type Exports
/**
 * 配置类型导出
 */
export type DiscoveryColors = typeof DISCOVERY_COLORS;
export type DiscoveryTypography = typeof DISCOVERY_TYPOGRAPHY;
export type DiscoverySizes = typeof DISCOVERY_SIZES;
export type WaterfallConfig = typeof WATERFALL_CONFIG;
export type FeedCardSizes = typeof FEED_CARD_SIZES;
export type TabConfig = typeof TAB_CONFIG;
export type DiscoveryDataConfig = typeof DISCOVERY_DATA_CONFIG;
export type DiscoveryApiConfig = typeof DISCOVERY_API_CONFIG;
export type DiscoveryFeatures = typeof DISCOVERY_FEATURES;
export type DiscoveryAnimations = typeof DISCOVERY_ANIMATIONS;
export type DiscoveryDefaults = typeof DISCOVERY_DEFAULTS;

/**
 * Tab类型
 */
export type TabType = typeof TAB_TYPES[keyof typeof TAB_TYPES];

/**
 * 完整配置类型
 */
export interface DiscoveryConfig {
  colors: DiscoveryColors;
  typography: DiscoveryTypography;
  sizes: DiscoverySizes;
  waterfall: WaterfallConfig;
  feedCard: FeedCardSizes;
  tab: TabConfig;
  data: DiscoveryDataConfig;
  api: DiscoveryApiConfig;
  features: DiscoveryFeatures;
  animations: DiscoveryAnimations;
  defaults: DiscoveryDefaults;
}

/**
 * 获取完整配置对象
 */
export const getDiscoveryConfig = (): DiscoveryConfig => ({
  colors: DISCOVERY_COLORS,
  typography: DISCOVERY_TYPOGRAPHY,
  sizes: DISCOVERY_SIZES,
  waterfall: WATERFALL_CONFIG,
  feedCard: FEED_CARD_SIZES,
  tab: TAB_CONFIG,
  data: DISCOVERY_DATA_CONFIG,
  api: DISCOVERY_API_CONFIG,
  features: DISCOVERY_FEATURES,
  animations: DISCOVERY_ANIMATIONS,
  defaults: DISCOVERY_DEFAULTS,
});

/**
 * 计算卡片宽度工具函数
 */
export const calculateCardWidth = (
  screenWidth: number,
  numColumns: number = WATERFALL_CONFIG.NUM_COLUMNS,
  horizontalPadding: number = WATERFALL_CONFIG.HORIZONTAL_PADDING,
  columnGap: number = WATERFALL_CONFIG.COLUMN_GAP
): number => {
  const totalGap = columnGap * (numColumns - 1);
  const availableWidth = screenWidth - horizontalPadding * 2 - totalGap;
  return availableWidth / numColumns;
};

/**
 * 估算Feed高度工具函数
 */
export const estimateFeedHeight = (
  imageWidth: number,
  imageHeight: number | undefined,
  cardWidth: number
): number => {
  // 计算图片高度
  let calculatedImageHeight = cardWidth * WATERFALL_CONFIG.DEFAULT_IMAGE_RATIO;
  
  if (imageWidth && imageHeight) {
    calculatedImageHeight = (cardWidth * imageHeight) / imageWidth;
  }
  
  // 添加底部信息区域和内边距
  return (
    calculatedImageHeight +
    WATERFALL_CONFIG.BOTTOM_INFO_HEIGHT +
    WATERFALL_CONFIG.CARD_PADDING * 2
  );
};
// #endregion

