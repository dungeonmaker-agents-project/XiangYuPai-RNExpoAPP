/**
 * FollowListPage 类型定义
 *
 * 包含所有页面相关的 TypeScript 类型和接口定义
 */

// #region 基础类型

/**
 * Tab类型
 */
export type TabType = 'following' | 'followers';

/**
 * 关系状态
 * - none: 未关注
 * - following: 已关注对方
 * - followed: 对方关注我（我未关注对方）
 * - mutual: 互相关注
 */
export type RelationStatus = 'none' | 'following' | 'followed' | 'mutual';

/**
 * 性别类型
 */
export type GenderType = 'male' | 'female' | 'other';

// #endregion

// #region 用户数据类型

/**
 * 关注/粉丝用户数据类型（前端使用）
 */
export interface FollowUser {
  /** 用户ID (前端使用string) */
  id: string;
  /** 昵称 */
  name: string;
  /** 头像URL */
  avatar: string;
  /** 年龄 */
  age?: number;
  /** 性别: male, female, other */
  gender: GenderType | string;
  /** 个性签名/简介 */
  description?: string;
  /** 是否实名认证 */
  isRealVerified?: boolean;
  /** 当前用户是否已关注该用户 */
  isFollowing?: boolean;
  /** 是否互相关注 */
  mutualFollow?: boolean;
  /** 关系状态 */
  relationStatus?: RelationStatus;
  /** 是否在线 */
  isOnline?: boolean;
}

/**
 * 后端返回的用户关系项
 */
export interface RelationUserItem {
  userId: number;
  nickname: string;
  avatar: string;
  gender: string | null;
  age: number | null;
  isVerified: boolean | null;
  signature: string | null;
  bio: string | null;
  isOnline: boolean | null;
  relationStatus: RelationStatus;
  followStatus: RelationStatus;
  fansCount: number | null;
  isFollowing: boolean | null;
  isMutualFollow: boolean | null;
}

// #endregion

// #region 组件Props

/**
 * 页面Props
 */
export interface FollowListPageProps {
  /** 查看指定用户的关注/粉丝列表（不传则查看当前登录用户） */
  userId?: string;
  /** 初始显示的Tab */
  initialTab?: TabType;
}

/**
 * HeaderArea 组件 Props
 */
export interface HeaderAreaProps {
  /** 当前激活的Tab */
  activeTab: TabType;
  /** Tab切换回调 */
  onTabChange: (tab: TabType) => void;
  /** 搜索图标点击回调 */
  onSearchPress: () => void;
  /** 返回按钮点击回调 */
  onBack: () => void;
}

/**
 * SearchArea 组件 Props
 */
export interface SearchAreaProps {
  /** 搜索关键词 */
  searchQuery: string;
  /** 搜索关键词变更回调 */
  onSearchQueryChange: (query: string) => void;
  /** 取消搜索回调 */
  onCancel: () => void;
}

/**
 * UserItem 组件 Props
 */
export interface UserItemProps {
  /** 用户数据 */
  user: FollowUser;
  /** 是否在关注列表中（影响按钮显示逻辑） */
  isFollowingTab: boolean;
  /** 点击用户回调 */
  onPress: () => void;
  /** 关注/取消关注回调 */
  onFollowToggle: () => void;
}

/**
 * GenderAgeBadge 组件 Props
 */
export interface GenderAgeBadgeProps {
  /** 性别 */
  gender: GenderType | string;
  /** 年龄 */
  age?: number;
}

/**
 * VerifiedBadge 组件 Props
 */
export interface VerifiedBadgeProps {
  /** 是否显示 */
  visible: boolean;
}

/**
 * FollowButton 组件 Props
 */
export interface FollowButtonProps {
  /** 关系状态 */
  relationStatus: RelationStatus;
  /** 是否已关注 */
  isFollowing: boolean;
  /** 是否互关 */
  isMutual: boolean;
  /** 点击回调 */
  onPress: () => void;
}

/**
 * EmptyState 组件 Props
 */
export interface EmptyStateProps {
  /** 当前Tab */
  activeTab: TabType;
  /** 是否有搜索关键词 */
  hasSearch: boolean;
}

/**
 * ContentArea 组件 Props
 */
export interface ContentAreaProps {
  /** 用户列表 */
  users: FollowUser[];
  /** 当前Tab */
  activeTab: TabType;
  /** 是否加载中 */
  loading: boolean;
  /** 是否刷新中 */
  refreshing: boolean;
  /** 是否还有更多数据 */
  hasMore: boolean;
  /** 是否有搜索关键词 */
  hasSearch: boolean;
  /** 下拉刷新回调 */
  onRefresh: () => void;
  /** 加载更多回调 */
  onLoadMore: () => void;
  /** 点击用户回调 */
  onUserPress: (user: FollowUser) => void;
  /** 关注/取消关注回调 */
  onFollowToggle: (user: FollowUser) => void;
}

// #endregion

// #region API相关类型

/**
 * 分页响应（后端 TableDataInfo 格式）
 */
export interface PageResponse<T> {
  rows: T[];
  total: number;
  code?: number;
  msg?: string;
}

/**
 * 标准API响应
 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  msg?: string;
  data: T | null;
}

/**
 * 批量关系状态响应
 */
export interface BatchRelationStatusResponse {
  [userId: string]: RelationStatus;
}

// #endregion
