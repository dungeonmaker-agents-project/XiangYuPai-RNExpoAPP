/**
 * Filter API Types - 筛选功能API类型定义
 * 基于接口文档: 首页筛选功能接口文档.md
 */

// ============ 通用类型 ============

/**
 * 筛选类型
 */
export type FilterType = 'online' | 'offline';

/**
 * 性别选项
 */
export type GenderType = 'all' | 'male' | 'female';

/**
 * 状态选项
 */
export type StatusType = 'online' | 'active_3d' | 'active_7d';

// ============ 筛选配置 ============

/**
 * 年龄范围配置
 */
export interface AgeRange {
  min: number;
  max: number | null; // null表示不限
}

/**
 * 性别选项
 */
export interface GenderOption {
  value: GenderType;
  label: string;
}

/**
 * 状态选项
 */
export interface StatusOption {
  value: StatusType;
  label: string;
}

/**
 * 技能选项
 */
export interface SkillOption {
  value: string;
  label: string;
  category?: string;
}

/**
 * 价格选项（仅线上模式）
 */
export interface PriceOption {
  value: string;
  label: string;
  min: number;
  max: number | null;
}

/**
 * 位置选项（仅线上模式）
 */
export interface PositionOption {
  value: string;
  label: string;
}

/**
 * 标签选项
 */
export interface TagOption {
  value: string;
  label: string;
  highlighted?: boolean;
}

/**
 * 筛选配置响应数据
 */
export interface FilterConfig {
  ageRange: AgeRange;
  genderOptions: GenderOption[];
  statusOptions: StatusOption[];
  skillOptions: SkillOption[];
  priceOptions?: PriceOption[]; // 仅线上模式
  positionOptions?: PositionOption[]; // 仅线上模式
  tagOptions: TagOption[];
}

// ============ 筛选条件 ============

/**
 * 筛选条件（应用筛选时提交的数据）
 */
export interface FilterConditions {
  age?: AgeRange;
  gender?: GenderType;
  status?: StatusType;
  skills?: string[];
  priceRange?: string[];
  positions?: string[];
  tags?: string[];
}

// ============ 用户数据 ============

/**
 * 技能信息
 */
export interface SkillInfo {
  name: string;
  level?: string;
}

/**
 * 用户卡片数据
 */
export interface UserCard {
  userId: number;
  avatar: string;
  nickname: string;
  age: number;
  gender: 'male' | 'female';
  status: 'online' | 'offline';
  isOnline: boolean;
  skills: SkillInfo[];
  price?: number; // 仅线上
  position?: string; // 仅线上
  tags: string[];
  distance?: number; // 仅线下，单位:km
  location?: string; // 仅线下
}

/**
 * 已应用的筛选条件摘要
 */
export interface AppliedFilters {
  count: number;
  summary: string[];
}

/**
 * 筛选结果列表
 */
export interface FilterResultData {
  total: number;
  hasMore: boolean;
  list: UserCard[];
  appliedFilters: AppliedFilters;
}

// ============ API请求/响应 ============

/**
 * 获取筛选配置 - 请求参数
 */
export interface GetFilterConfigRequest {
  type: FilterType;
}

/**
 * 获取筛选配置 - 响应
 */
export interface GetFilterConfigResponse {
  code: number;
  message: string;
  data: FilterConfig;
}

/**
 * 应用筛选条件 - 请求参数
 */
export interface ApplyFilterRequest {
  type: FilterType;
  filters: FilterConditions;
  pageNum: number;
  pageSize: number;
}

/**
 * 应用筛选条件 - 响应
 */
export interface ApplyFilterResponse {
  code: number;
  message: string;
  data: FilterResultData;
}

/**
 * 获取筛选结果（分页）- 请求参数
 */
export interface GetFilterResultsRequest {
  type: FilterType;
  filters: FilterConditions;
  pageNum: number;
  pageSize: number;
}

/**
 * 获取筛选结果（分页）- 响应
 */
export interface GetFilterResultsResponse {
  code: number;
  message: string;
  data: {
    total: number;
    hasMore: boolean;
    list: UserCard[];
  };
}

/**
 * 清除筛选 - 请求参数（使用默认Feed接口）
 */
export interface ClearFilterRequest {
  pageNum: number;
  pageSize: number;
  type?: FilterType;
}
