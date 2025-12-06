/**
 * GamePlayerListPage 常量配置
 * 王者荣耀陪玩列表页 - 常量和配置定义
 *
 * @description 定义页面所需的所有常量，包括排序选项、筛选配置、颜色等
 * @author XyPai Team
 * @date 2025-12-03
 */

import { FilterOption, PriceRangeOption, QuickTag, FilterState, AdvancedFilters } from './types';

// ==================== 技能类型 ====================

/**
 * 王者荣耀技能类型标识
 */
export const SKILL_TYPE_HONOR_OF_KINGS = '王者荣耀';

// ==================== 快捷标签 ====================

/**
 * 快捷标签配置
 * @description 页面顶部的快捷筛选标签
 */
export const QUICK_TAGS: QuickTag[] = [
  { id: 'glory_king', label: '荣耀王者', filterKey: 'rank', filterValue: '荣耀王者' },
  { id: 'rank_up', label: '带粉上分', filterKey: 'tags', filterValue: '带粉上分' },
  { id: 'esports', label: '电竞陪练师', filterKey: 'tags', filterValue: '电竞陪练师' },
  { id: 'companion', label: '陪玩', filterKey: 'tags', filterValue: '陪玩' },
];

// ==================== 排序选项 ====================

/**
 * 排序选项配置
 */
export const SORT_OPTIONS: FilterOption[] = [
  { value: 'smart', label: '智能排序' },
  { value: 'newest', label: '最新' },
  { value: 'recent', label: '最近' },
  { value: 'popular', label: '人气' },
];

// ==================== 性别选项 ====================

/**
 * 性别筛选选项
 */
export const GENDER_OPTIONS: FilterOption[] = [
  { value: 'all', label: '不限性别' },
  { value: 'female', label: '只看女生' },
  { value: 'male', label: '只看男生' },
];

// ==================== 高级筛选配置 ====================

/**
 * 状态筛选选项
 */
export const STATUS_OPTIONS: FilterOption[] = [
  { value: 'all', label: '全部' },
  { value: 'online', label: '在线' },
];

/**
 * 游戏大区选项
 */
export const GAME_AREA_OPTIONS: FilterOption[] = [
  { value: 'qq', label: 'QQ区' },
  { value: 'wechat', label: '微信区' },
];

/**
 * 段位选项
 */
export const RANK_OPTIONS: FilterOption[] = [
  { value: '尊贵铂金', label: '尊贵铂金' },
  { value: '永恒钻石', label: '永恒钻石' },
  { value: '至尊星耀', label: '至尊星耀' },
  { value: '最强王者', label: '最强王者' },
  { value: '荣耀王者', label: '荣耀王者' },
];

/**
 * 价格区间选项
 */
export const PRICE_RANGE_OPTIONS: PriceRangeOption[] = [
  { value: '4-9', label: '4-9币', min: 4, max: 9 },
  { value: '10-19', label: '10-19币', min: 10, max: 19 },
  { value: '20+', label: '20币以上', min: 20, max: null },
];

/**
 * 位置选项（英雄位置）
 */
export const POSITION_OPTIONS: FilterOption[] = [
  { value: '打野', label: '打野' },
  { value: '上路', label: '上路' },
  { value: '中路', label: '中路' },
  { value: '下路', label: '下路' },
  { value: '辅助', label: '辅助' },
  { value: '全能', label: '全能' },
];

/**
 * 标签选项
 */
export const TAG_OPTIONS: FilterOption[] = [
  { value: '荣耀王者', label: '荣耀王者' },
  { value: '大神认证', label: '大神认证' },
  { value: '巅峰赛', label: '巅峰赛' },
  { value: '带粉上分', label: '带粉上分' },
  { value: '官方认证', label: '官方认证' },
  { value: '声优陪玩', label: '声优陪玩' },
];

/**
 * 所在地选项
 */
export const LOCATION_OPTIONS: FilterOption[] = [
  { value: 'same_city', label: '同城' },
];

// ==================== 筛选面板分组 ====================

/**
 * 筛选面板分组配置
 */
export const FILTER_GROUPS = [
  { key: 'status', label: '状态', options: STATUS_OPTIONS, type: 'single' as const },
  { key: 'gameArea', label: '大区', options: GAME_AREA_OPTIONS, type: 'single' as const },
  { key: 'ranks', label: '段位', options: RANK_OPTIONS, type: 'multiple' as const },
  { key: 'priceRange', label: '价格', options: PRICE_RANGE_OPTIONS, type: 'single' as const },
  { key: 'positions', label: '位置', options: POSITION_OPTIONS, type: 'multiple' as const },
  { key: 'tags', label: '标签', options: TAG_OPTIONS, type: 'multiple' as const },
  { key: 'location', label: '所在地', options: LOCATION_OPTIONS, type: 'single' as const },
];

// ==================== 默认状态 ====================

/**
 * 默认高级筛选状态
 */
export const DEFAULT_ADVANCED_FILTERS: AdvancedFilters = {
  status: 'all',
  gameArea: null,
  ranks: [],
  priceRange: null,
  positions: [],
  tags: [],
  location: null,
};

/**
 * 默认筛选状态
 */
export const DEFAULT_FILTER_STATE: FilterState = {
  sortBy: 'smart',
  gender: 'all',
  quickTag: null,
  advancedFilters: DEFAULT_ADVANCED_FILTERS,
};

// ==================== 分页配置 ====================

/**
 * 每页数量
 */
export const PAGE_SIZE = 20;

/**
 * 初始页码
 */
export const INITIAL_PAGE_NUM = 1;

// ==================== 样式常量 ====================

/**
 * 颜色配置
 */
export const COLORS = {
  /** 主题色 */
  primary: '#FF6B9D',
  /** 次要色 */
  secondary: '#8B5CF6',
  /** 背景色 */
  background: '#F5F5F5',
  /** 卡片背景 */
  cardBackground: '#FFFFFF',
  /** 文字主色 */
  textPrimary: '#1A1A1A',
  /** 文字次色 */
  textSecondary: '#666666',
  /** 文字辅助色 */
  textTertiary: '#999999',
  /** 分割线 */
  divider: '#EEEEEE',
  /** 在线状态 */
  online: '#4CAF50',
  /** 离线状态 */
  offline: '#BDBDBD',
  /** 男性 */
  male: '#4A90D9',
  /** 女性 */
  female: '#FF6B9D',
  /** 认证徽章 */
  verified: '#FFB800',
  /** 大神认证 */
  expert: '#FF6B00',
};

/**
 * 尺寸配置
 */
export const SIZES = {
  /** 卡片头像宽度 */
  avatarWidth: 120,
  /** 卡片头像高度 */
  avatarHeight: 160,
  /** 卡片圆角 */
  cardBorderRadius: 12,
  /** 标签圆角 */
  tagBorderRadius: 4,
  /** 内边距 */
  padding: 16,
  /** 小内边距 */
  paddingSmall: 8,
  /** 图标大小 */
  iconSize: 16,
  /** 字体大小-标题 */
  fontTitle: 16,
  /** 字体大小-正文 */
  fontBody: 14,
  /** 字体大小-辅助 */
  fontCaption: 12,
};

// ==================== API配置 ====================

/**
 * API路径
 */
export const API_PATHS = {
  /** 服务列表 */
  serviceList: '/api/service/list',
  /** 筛选配置 */
  filterConfig: '/api/service/filter-config',
};

// ==================== 文案配置 ====================

/**
 * 页面文案
 */
export const TEXTS = {
  /** 页面标题 */
  pageTitle: '王者荣耀',
  /** 加载中 */
  loading: '加载中...',
  /** 加载更多 */
  loadMore: '加载更多',
  /** 没有更多 */
  noMore: '没有更多了',
  /** 暂无数据 */
  noData: '暂无陪玩用户',
  /** 重试 */
  retry: '重试',
  /** 筛选 */
  filter: '筛选',
  /** 重置 */
  reset: '重置',
  /** 确定 */
  confirm: '确定',
};
