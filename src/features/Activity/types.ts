/**
 * Activity 模块 - 类型定义
 */

// ==================== 活动类型 ====================

/**
 * 活动类型
 */
export type ActivityType =
  | 'explore'    // 探店
  | 'mystery'    // 密室
  | 'movie'      // 私影
  | 'billiards'  // 台球
  | 'ktv'        // K歌
  | 'sing'       // 唱歌
  | 'party'      // 嗨唱
  | 'karaoke'    // 唱吧
  | 'massage'    // 按摩
  | 'drink';     // 喝酒

/**
 * 活动状态
 */
export type ActivityStatus =
  | 'draft'      // 草稿
  | 'pending'    // 待审核
  | 'active'     // 进行中
  | 'full'       // 已满员
  | 'ended'      // 已结束
  | 'cancelled'; // 已取消

// ==================== 活动数据类型 ====================

/**
 * 活动列表项
 */
export interface ActivityListItem {
  activityId: number;
  title: string;
  activityType: ActivityType;
  coverImage?: string;

  // 组织者信息
  organizer: {
    userId: string;
    nickname: string;
    avatar: string;
    gender?: 'male' | 'female';
  };

  // 时间地点
  startTime: string;
  endTime?: string;
  address: string;
  distance?: number;

  // 参与信息
  currentCount: number;
  memberLimit: number;

  // 费用
  price: number;
  priceUnit: 'per_person' | 'per_hour';

  // 状态
  status: ActivityStatus;

  // 标签
  tags?: string[];
}

/**
 * 活动详情
 */
export interface ActivityDetail extends ActivityListItem {
  content: string;
  images: string[];

  // 报名信息
  registrationDeadline?: string;
  isRegistered: boolean;

  // 参与者列表
  participants: Array<{
    userId: string;
    nickname: string;
    avatar: string;
    registeredAt: string;
  }>;

  // 时间戳
  createdAt: string;
  updatedAt: string;
}

// ==================== 筛选类型 ====================

/**
 * 活动筛选条件
 */
export interface ActivityFilters {
  sortBy?: 'smart' | 'latest' | 'nearest' | 'popular';
  gender?: 'all' | 'male' | 'female';
  memberCount?: string;
  activityType?: ActivityType[];
  priceRange?: {
    min?: number;
    max?: number;
  };
}

// ==================== 发布类型 ====================

/**
 * 发布活动数据
 */
export interface PublishActivityData {
  activityType: ActivityType;
  title: string;
  content: string;
  images: string[];
  startTime: string;
  endTime?: string;
  address: string;
  price: number;
  priceUnit: 'per_person' | 'per_hour';
  memberLimit: number;
  registrationDeadline?: string;
}

// ==================== 组件 Props ====================

/**
 * ActivityListPage Props
 */
export interface ActivityListPageProps {
  initialFilters?: ActivityFilters;
}

/**
 * ActivityDetailPage Props
 */
export interface ActivityDetailPageProps {
  activityId: number;
}

/**
 * FilterPage Props
 */
export interface FilterPageProps {
  initialFilters?: ActivityFilters;
  onApply?: (filters: ActivityFilters) => void;
}
