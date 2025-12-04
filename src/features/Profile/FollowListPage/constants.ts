/**
 * FollowListPage 常量定义
 *
 * 包含所有页面相关的常量、配置和 Mock 数据
 */

import { FollowUser, GenderType } from './types';

// #region 分页配置

/** 每页加载数量 */
export const PAGE_SIZE = 20;

/** 是否使用真实API（设为false时使用Mock数据） */
export const USE_REAL_API = true;

// #endregion

// #region 颜色配置

/** 主题色 */
export const COLORS = {
  /** 主题紫色 */
  primary: '#8B5CF6',
  /** 浅紫色背景 */
  primaryLight: '#F3E8FF',
  /** 白色 */
  white: '#FFFFFF',
  /** 背景灰 */
  background: '#F9FAFB',
  /** 边框灰 */
  border: '#E5E7EB',
  /** 文字主色 */
  textPrimary: '#111827',
  /** 文字次要色 */
  textSecondary: '#6B7280',
  /** 文字灰色 */
  textGray: '#9CA3AF',
  /** 成功绿色 */
  success: '#10B981',
  /** 成功绿色背景 */
  successLight: '#ECFDF5',
  /** 男性蓝色 */
  male: '#3B82F6',
  /** 女性粉色 */
  female: '#EC4899',
  /** 其他紫色 */
  other: '#8B5CF6',
} as const;

// #endregion

// #region 性别配置

/** 性别配置 */
export const GENDER_CONFIG: Record<GenderType | string, { label: string; color: string; bgColor: string }> = {
  male: { label: '男', color: COLORS.white, bgColor: COLORS.male },
  female: { label: '女', color: COLORS.white, bgColor: COLORS.female },
  other: { label: '其他', color: COLORS.white, bgColor: COLORS.other },
};

// #endregion

// #region 关注状态配置

/** 关注状态文本 */
export const FOLLOW_STATUS = {
  /** 互相关注 */
  MUTUAL: '互相关注',
  /** 已关注 */
  FOLLOWING: '已关注',
  /** 关注 */
  FOLLOW: '关注',
  /** 回关 */
  FOLLOW_BACK: '回关',
} as const;

/** 关系状态枚举 */
export const RELATION_STATUS = {
  NONE: 'none',
  FOLLOWING: 'following',
  FOLLOWED: 'followed',
  MUTUAL: 'mutual',
} as const;

// #endregion

// #region Tab 配置

/** Tab 类型 */
export const TAB_TYPES = {
  FOLLOWING: 'following',
  FOLLOWERS: 'followers',
} as const;

/** Tab 标签 */
export const TAB_LABELS = {
  following: '关注',
  followers: '粉丝',
} as const;

// #endregion

// #region 尺寸配置

/** 头像尺寸 */
export const AVATAR_SIZE = 52;

/** 导航栏高度 */
export const NAV_BAR_HEIGHT = 56;

/** Tab 栏高度 */
export const TAB_BAR_HEIGHT = 44;

/** 按钮圆角 */
export const BUTTON_RADIUS = 16;

// #endregion

// #region Mock 数据

/** Mock 关注列表数据 */
export const MOCK_FOLLOWING_DATA: FollowUser[] = [
  {
    id: '1001',
    name: '小美',
    avatar: 'https://i.pravatar.cc/150?img=1',
    age: 24,
    gender: 'female',
    description: '热爱摄影和旅行的自由职业者',
    isOnline: true,
    mutualFollow: true,
    isFollowing: true,
    isRealVerified: true,
    relationStatus: 'mutual',
  },
  {
    id: '1002',
    name: '阳光男孩',
    avatar: 'https://i.pravatar.cc/150?img=12',
    age: 26,
    gender: 'male',
    description: '健身教练，带你科学健身',
    isOnline: false,
    mutualFollow: false,
    isFollowing: true,
    isRealVerified: false,
    relationStatus: 'following',
  },
  {
    id: '1003',
    name: '甜心姐姐',
    avatar: 'https://i.pravatar.cc/150?img=5',
    age: 23,
    gender: 'female',
    description: '美食博主，带你吃遍北京美食',
    isOnline: true,
    mutualFollow: true,
    isFollowing: true,
    isRealVerified: true,
    relationStatus: 'mutual',
  },
  {
    id: '1004',
    name: '游戏大神',
    avatar: 'https://i.pravatar.cc/150?img=15',
    age: 22,
    gender: 'male',
    description: '王者荣耀国服50星，可带上分',
    isOnline: true,
    mutualFollow: false,
    isFollowing: true,
    isRealVerified: true,
    relationStatus: 'following',
  },
];

/** Mock 粉丝列表数据 */
export const MOCK_FOLLOWERS_DATA: FollowUser[] = [
  {
    id: '2001',
    name: '可爱多',
    avatar: 'https://i.pravatar.cc/150?img=9',
    age: 21,
    gender: 'female',
    description: '喜欢唱歌跳舞的活力少女',
    isOnline: true,
    mutualFollow: true,
    isFollowing: true,
    isRealVerified: true,
    relationStatus: 'mutual',
  },
  {
    id: '2002',
    name: '帅气欧巴',
    avatar: 'https://i.pravatar.cc/150?img=13',
    age: 27,
    gender: 'male',
    description: '篮球爱好者，擅长投篮技巧',
    isOnline: false,
    mutualFollow: false,
    isFollowing: false,
    isRealVerified: false,
    relationStatus: 'followed',
  },
  {
    id: '2003',
    name: '萌萌哒',
    avatar: 'https://i.pravatar.cc/150?img=10',
    age: 20,
    gender: 'female',
    description: '声优配音，可接各种配音需求',
    isOnline: true,
    mutualFollow: true,
    isFollowing: true,
    isRealVerified: true,
    relationStatus: 'mutual',
  },
  {
    id: '2004',
    name: '阳光少年',
    avatar: 'https://i.pravatar.cc/150?img=14',
    age: 25,
    gender: 'male',
    description: '电影爱好者，影评达人',
    isOnline: false,
    mutualFollow: false,
    isFollowing: false,
    isRealVerified: false,
    relationStatus: 'followed',
  },
  {
    id: '2005',
    name: '温柔小姐姐',
    avatar: 'https://i.pravatar.cc/150?img=16',
    age: 24,
    gender: 'female',
    description: '心理咨询师，愿意倾听你的烦恼',
    isOnline: true,
    mutualFollow: true,
    isFollowing: true,
    isRealVerified: true,
    relationStatus: 'mutual',
  },
];

// #endregion
