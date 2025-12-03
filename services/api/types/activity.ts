/**
 * Activity API Types - 组局中心相关类型定义
 */

// 活动类型
export interface ActivityType {
  type: string;
  label: string;
  icon: string;
}

// 组织者信息
export interface Organizer {
  userId: number;
  avatar: string;
  nickname: string;
  tags?: string[];
  isVerified?: boolean;
}

// 标签
export interface ActivityTag {
  text: string;
  type: 'feature' | 'price';
  color?: string;
}

// 价格信息
export interface PriceInfo {
  amount: number;
  unit: 'per_person' | 'per_hour';
  displayText: string;
}

// 时间安排
export interface Schedule {
  startTime: string;
  endTime?: string;
  displayText: string;
}

// 位置信息
export interface Location {
  address: string;
  district?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// 参与者信息
export interface Participants {
  registered: number;
  limit: number;
  displayText: string;
  list?: ParticipantItem[];
  waitingText?: string;
}

// 参与者项目
export interface ParticipantItem {
  userId: number;
  avatar: string;
  nickname: string;
  status: 'pending' | 'approved' | 'rejected';
  statusLabel: string;
}

// 活动状态
export type ActivityStatus = 'open' | 'full' | 'closed' | 'cancelled';

// 活动列表项
export interface ActivityListItem {
  activityId: number;
  organizer: Organizer;
  title?: string;
  description?: string;
  activityType: ActivityType;
  tags: ActivityTag[];
  price: PriceInfo;
  schedule: Schedule;
  location: Location;
  participants: Participants;
  status: ActivityStatus;
  registrationDeadline: string;
}

// 筛选选项
export interface FilterOption {
  value: string;
  label: string;
  icon?: string;
}

// 筛选配置
export interface FilterConfig {
  sortOptions: FilterOption[];
  genderOptions: FilterOption[];
  memberOptions: FilterOption[];
  activityTypes: FilterOption[];
}

// 筛选参数
export interface ActivityFilters {
  gender?: 'all' | 'male' | 'female';
  memberCount?: string;
  activityType?: string[];
  cityCode?: string;
  districtCode?: string;
}

// 活动列表请求参数
export interface ActivityListParams {
  pageNum: number;
  pageSize: number;
  sortBy?: string;
  filters?: ActivityFilters;
}

// 活动列表响应
export interface ActivityListResponse {
  total: number;
  hasMore: boolean;
  filters: FilterConfig;
  list: ActivityListItem[];
}

// 活动详情
export interface ActivityDetail {
  activityId: number;
  status: ActivityStatus;
  organizer: Organizer;
  activityType: ActivityType;
  title?: string;
  description: string;
  images?: string[];
  bannerImage?: string;
  schedule: Schedule;
  location: Location;
  price: PriceInfo;
  participants: Participants;
  registrationDeadline: string;
  userStatus?: {
    isOrganizer: boolean;
    hasRegistered: boolean;
    registrationStatus?: 'pending' | 'approved' | 'rejected';
    canRegister: boolean;
  };
}

// 发布配置
export interface PublishConfig {
  activityTypes: ActivityType[];
  priceUnit: {
    options: Array<{
      value: string;
      label: string;
    }>;
  };
  memberCountOptions: Array<{
    value: number;
    label: string;
  }>;
  platformFee: {
    rate: number;
    description: string;
  };
  depositRules: {
    depositAmount: number;
    description: string;
  };
}

// 发布活动参数
export interface PublishActivityParams {
  activityType: string;
  title: string;
  content: string;
  images?: string[];
  schedule: {
    startTime: string;
    endTime?: string;
  };
  location: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  price: {
    amount: number;
    unit: 'per_person' | 'per_hour';
  };
  memberLimit: number;
  registrationDeadline: string;
}

// 发布活动响应
export interface PublishActivityResponse {
  activityId: number;
  needPayment: boolean;
  paymentInfo?: {
    amount: number;
    platformFee: number;
    deposit: number;
  };
}

// 支付信息
export interface PaymentInfo {
  orderId: string;
  paymentStatus: 'success' | 'pending' | 'failed';
  activityId?: number;
  balance?: number;
  registrationStatus?: 'pending' | 'approved';
}

// 报名参数
export interface RegisterParams {
  activityId: number;
  message?: string;
}

// 报名响应
export interface RegisterResponse {
  registrationId: number;
  status: 'pending' | 'approved';
  needPayment: boolean;
  paymentInfo?: {
    amount: number;
    description: string;
  };
  approvalRequired: boolean;
}

// 审核报名参数
export interface ApproveRegistrationParams {
  activityId: number;
  registrationId: number;
  action: 'approve' | 'reject';
  reason?: string;
}

// 取消报名响应
export interface CancelRegistrationResponse {
  success: boolean;
  refundAmount?: number;
  cancelPolicy: string;
}

// 分享响应
export interface ShareResponse {
  shareUrl: string;
  shareImage?: string;
  shareText: string;
  qrCode?: string;
}

// 上传图片响应
export interface UploadImageResponse {
  imageUrl: string;
  thumbnailUrl?: string;
}
