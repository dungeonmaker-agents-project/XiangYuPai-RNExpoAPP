/**
 * Homepage 模块 - 共享类型定义
 *
 * 模块级别的共享类型，各子模块可引用
 */

// ==================== 通用类型 ====================

/**
 * 分页请求参数
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * API 响应包装
 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// ==================== 用户相关类型 ====================

/**
 * 基础用户信息
 */
export interface BaseUserInfo {
  userId: string;
  nickname: string;
  avatar: string;
  gender?: 'male' | 'female';
}

/**
 * 用户卡片信息（首页列表使用）
 */
export interface UserCardInfo extends BaseUserInfo {
  age?: number;
  bio?: string;
  services?: string[];
  distance?: number;
  status?: 'online' | 'available' | 'offline';
  price?: string;
  region?: string;
  rating?: number;
  reviewCount?: number;
  isSpecialOffer?: boolean;
  orderCount?: number;
}

// ==================== 服务相关类型 ====================

/**
 * 服务类型
 */
export type ServiceType =
  | 'game_lol'
  | 'game_pubg'
  | 'game_wzry'
  | 'game_valorant'
  | 'game_other'
  | 'life_companion'
  | 'life_chat'
  | 'life_wakeup'
  | 'life_other';

/**
 * 服务分类
 */
export type ServiceCategory = 'game' | 'life';

/**
 * 服务信息
 */
export interface ServiceInfo {
  serviceId: string;
  serviceName: string;
  serviceType: ServiceType;
  serviceCategory: ServiceCategory;
  icon?: string;
  price?: number;
  description?: string;
}

// ==================== 筛选相关类型 ====================

/**
 * 排序选项
 */
export type SortOption = 'smart' | 'latest' | 'nearest' | 'popular';

/**
 * 性别筛选选项
 */
export type GenderOption = 'all' | 'female' | 'male';

/**
 * 高级筛选条件
 */
export interface AdvancedFilters {
  status: 'online' | 'all';
  area: string[];
  rank: string[];
  priceRange: string[];
  position: string[];
  tags: string[];
  location: string[];
}

/**
 * 筛选状态
 */
export interface FilterState {
  sort: SortOption;
  gender: GenderOption;
  advanced: AdvancedFilters;
}

// ==================== 组局相关类型 ====================

/**
 * 组局活动状态
 */
export type EventStatus = 'open' | 'full' | 'closed' | 'cancelled';

/**
 * 组局活动信息
 */
export interface EventInfo {
  eventId: string;
  title: string;
  organizer: BaseUserInfo;
  startTime: string;
  endTime?: string;
  location: {
    address: string;
    distance?: number;
    latitude?: number;
    longitude?: number;
  };
  currentCount: number;
  maxCount: number;
  price: number;
  status: EventStatus;
  tags: string[];
  description?: string;
}

// ==================== 搜索相关类型 ====================

/**
 * 搜索结果类型
 */
export type SearchResultType = 'all' | 'user' | 'order' | 'topic';

/**
 * 搜索历史项
 */
export interface SearchHistoryItem {
  id: string;
  keyword: string;
  timestamp: number;
}

/**
 * 热门搜索项
 */
export interface HotSearchItem {
  id: string;
  keyword: string;
  isHot?: boolean;
  isNew?: boolean;
}

// ==================== 位置相关类型 ====================

/**
 * 位置信息
 */
export interface LocationInfo {
  city: string;
  district?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * 城市信息
 */
export interface CityInfo {
  cityId: string;
  cityName: string;
  districts?: DistrictInfo[];
}

/**
 * 区域信息
 */
export interface DistrictInfo {
  districtId: string;
  districtName: string;
}
