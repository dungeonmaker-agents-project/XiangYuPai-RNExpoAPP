/**
 * BFF API - App端业务聚合服务接口
 *
 * 服务: xypai-app-bff (端口: 9400)
 * 职责: 首页用户推荐流、数据聚合、推荐算法、限时专享、搜索功能、组局活动、服务列表/详情
 *
 * 接口清单（Gateway路径）：
 * - GET /xypai-app-bff/api/home/feed - 获取首页用户推荐列表
 *   参数: type=online|offline, pageNum, pageSize, cityCode
 * - GET /xypai-app-bff/api/home/limited-time/list - 获取限时专享列表
 *   参数: pageNum, pageSize, sortBy, gender, language
 * - GET /xypai-app-bff/api/search/init - 获取搜索初始数据（历史+热门）
 * - GET /xypai-app-bff/api/search/suggest - 获取搜索建议
 *   参数: keyword, limit
 * - DELETE /xypai-app-bff/api/search/history - 删除搜索历史
 * - POST /xypai-app-bff/api/search/search - 执行综合搜索
 * - GET /xypai-app-bff/api/search/all - 获取全部Tab结果
 * - GET /xypai-app-bff/api/search/users - 获取用户Tab结果
 * - GET /xypai-app-bff/api/search/orders - 获取下单Tab结果
 * - GET /xypai-app-bff/api/search/topics - 获取话题Tab结果
 * - GET /xypai-app-bff/api/activity/list - 获取活动列表
 * - GET /xypai-app-bff/api/activity/detail/{id} - 获取活动详情
 * - POST /xypai-app-bff/api/activity/register - 报名参加活动
 * - POST /xypai-app-bff/api/activity/register/cancel - 取消报名
 * - GET /xypai-app-bff/api/activity/publish/config - 获取发布配置
 * - POST /xypai-app-bff/api/activity/publish - 发布活动
 * - POST /xypai-app-bff/api/activity/publish/pay - 支付平台费
 * - GET /xypai-app-bff/api/service/list - 获取服务列表
 *   参数: skillType(必填), pageNum, pageSize, tabType, sortBy, gender
 * - GET /xypai-app-bff/api/service/detail - 获取服务详情
 *   参数: serviceId(必填), userId
 * - GET /xypai-app-bff/api/service/reviews - 获取服务评价列表
 *   参数: serviceId(必填), pageNum, pageSize, filterBy
 *
 * 后端测试文件参考: AppHomeFeedTest.java, Page05_LimitedTimeTest.java, Page06_SearchTest.java,
 *   Page07_SearchResultsTest.java, Page08_ActivityListTest.java, Page09_ActivityDetailTest.java,
 *   Page10_PublishActivityTest.java, Page11_ServiceListTest.java, Page12_ServiceDetailTest.java
 *
 * @author XiangYuPai
 * @updated 2025-11-28
 */

import { apiClient } from './client';
import { API_ENDPOINTS, buildQueryParams } from './config';

// ==================== 类型定义 ====================

/**
 * 用户推荐类型
 */
export type HomeFeedType = 'online' | 'offline';

/**
 * 首页用户推荐查询参数
 */
export interface HomeFeedQueryParams {
  /** 推荐类型: online(线上) / offline(线下) */
  type: HomeFeedType;
  /** 页码（从1开始） */
  pageNum?: number;
  /** 每页数量（默认10） */
  pageSize?: number;
  /** 城市代码（可选，如440300表示深圳） */
  cityCode?: string;
}

/**
 * 动态预览信息（用于用户卡片下方展示）
 */
export interface BffFeedPreview {
  /** 动态ID */
  feedId: number;
  /** 封面图URL */
  coverImage: string;
  /** 动态内容（截取前50字符） */
  content: string;
  /** 点赞数 */
  likeCount: number;
  /** 评论数 */
  commentCount: number;
}

/**
 * 用户卡片信息（BFF返回格式）
 */
export interface BffUserCard {
  /** 用户ID */
  userId: string;
  /** 昵称 */
  nickname: string;
  /** 头像URL */
  avatar: string;
  /** 性别: 1=男, 2=女 */
  gender?: number;
  /** 年龄 */
  age?: number;
  /** 在线状态 */
  onlineStatus?: number;
  /** 是否实名认证 */
  isRealVerified?: boolean;
  /** 是否大神认证 */
  isGodVerified?: boolean;
  /** 是否VIP */
  isVip?: boolean;
  /** 个性签名 */
  signature?: string;
  /** 服务标签列表 */
  serviceTags?: string[];
  /** 价格（元/小时） */
  price?: number;
  /** 评分 */
  rating?: number;
  /** 接单数 */
  orderCount?: number;
  /** 城市名称 */
  cityName?: string;
  /** 距离（米） */
  distance?: number;
  /** 用户最新动态列表（最多3条） */
  feeds?: BffFeedPreview[];
  /** 动态总数 */
  feedCount?: number;
}

/**
 * 首页用户推荐列表响应
 */
export interface HomeFeedResponse {
  /** 用户列表 */
  list: BffUserCard[];
  /** 总数 */
  total: number;
  /** 是否有更多 */
  hasMore: boolean;
}

/**
 * 筛选配置项
 */
export interface FilterConfigItem {
  /** 配置键 */
  key: string;
  /** 显示名称 */
  label: string;
  /** 配置类型 */
  type: 'single' | 'multiple' | 'range';
  /** 选项列表 */
  options?: Array<{ value: string; label: string }>;
  /** 范围配置 */
  range?: { min: number; max: number; step: number };
}

/**
 * 筛选配置响应
 */
export interface FilterConfigResponse {
  /** 筛选配置列表 */
  filters: FilterConfigItem[];
}

/**
 * 应用筛选请求参数
 */
export interface FilterApplyParams {
  /** 推荐类型 */
  type: HomeFeedType;
  /** 筛选条件 */
  filters: Record<string, any>;
  /** 页码 */
  pageNum?: number;
  /** 每页数量 */
  pageSize?: number;
}

// ==================== 限时专享类型定义 ====================

/**
 * 限时专享排序方式
 */
export type LimitedTimeSortBy = 'smart' | 'price_asc' | 'price_desc' | 'distance_asc';

/**
 * 限时专享性别筛选
 */
export type LimitedTimeGender = 'all' | 'male' | 'female';

/**
 * 限时专享查询参数
 */
export interface LimitedTimeQueryParams {
  /** 页码（从1开始） */
  pageNum?: number;
  /** 每页数量（默认10） */
  pageSize?: number;
  /** 排序方式: smart(智能推荐) / price_asc(价格从低到高) / price_desc(价格从高到低) / distance_asc(距离最近) */
  sortBy?: LimitedTimeSortBy;
  /** 性别筛选: all(不限) / male(男) / female(女) */
  gender?: LimitedTimeGender;
  /** 语言筛选（如：普通话、粤语等） */
  language?: string;
}

/**
 * 限时专享价格信息
 *
 * 对接后端文档: API对接文档-限时专享页面.md
 */
export interface LimitedTimePrice {
  /** 金币数量 */
  amount: number;
  /** 价格单位（如：金币/小时） */
  unit?: string;
  /** 显示文本（如：100金币/小时） */
  displayText: string;
  /** 原价 */
  originalPrice: number;
  /** 折扣信息（如：8折） */
  discount?: string;
  /** 折扣比例（0-1） */
  discountRate?: number;
}

/**
 * 限时专享技能信息
 *
 * 对接后端文档: API对接文档-限时专享页面.md
 */
export interface LimitedTimeSkill {
  /** 技能ID */
  skillId: number;
  /** 技能名称 */
  skillName: string;
  /** 游戏名称 */
  gameName: string;
  /** 游戏段位 */
  gameRank: string;
  /** 技能描述 */
  description?: string;
}

/**
 * 限时专享用户卡片
 *
 * 对接后端文档: API对接文档-限时专享页面.md
 */
export interface LimitedTimeUserCard {
  /** 用户ID */
  userId: number;
  /** 昵称 */
  nickname: string;
  /** 头像URL */
  avatar: string;
  /** 性别: male / female */
  gender: 'male' | 'female';
  /** 年龄 */
  age?: number;
  /** 标签列表（如：王者荣耀、陪玩） */
  tags?: string[];
  /** 促销标签（如：限时8折） */
  promotionTag?: string;
  /** 距离（米） */
  distance: number;
  /** 距离文本（如：1.5km） */
  distanceText: string;
  /** 价格信息 */
  price: LimitedTimePrice;
  /** 服务标签列表 @deprecated 使用 tags 替代 */
  serviceTags?: string[];
  /** 语言标签（如：普通话、粤语） */
  languageTag?: string;
  /** 评分 */
  rating?: number;
  /** 接单数 */
  orderCount?: number;
  /** 是否在线 */
  isOnline?: boolean;
  /** 是否认证 */
  isVerified?: boolean;
  /** 技能信息 */
  skill?: LimitedTimeSkill;
}

/**
 * 限时专享筛选选项
 */
export interface LimitedTimeFilterOption {
  /** 选项值 */
  value: string;
  /** 显示文本 */
  label: string;
  /** 是否选中 */
  selected?: boolean;
}

/**
 * 限时专享筛选配置
 */
export interface LimitedTimeFilters {
  /** 排序选项 */
  sortOptions: LimitedTimeFilterOption[];
  /** 性别选项 */
  genderOptions: LimitedTimeFilterOption[];
  /** 语言选项 */
  languageOptions: LimitedTimeFilterOption[];
}

/**
 * 限时专享列表响应
 */
export interface LimitedTimeResponse {
  /** 用户列表 */
  list: LimitedTimeUserCard[];
  /** 总数 */
  total: number;
  /** 是否有更多 */
  hasMore: boolean;
  /** 筛选配置 */
  filters: LimitedTimeFilters;
}

// ==================== 搜索相关类型定义 ====================

/**
 * 搜索历史记录项
 */
export interface SearchHistoryItem {
  /** 搜索关键词 */
  keyword: string;
  /** 搜索时间 */
  searchTime: string;
  /** 搜索类型（可选） */
  type?: string;
}

/**
 * 热门搜索关键词
 */
export interface HotKeyword {
  /** 关键词 */
  keyword: string;
  /** 排名 */
  rank?: number;
  /** 是否热门 */
  isHot?: boolean;
}

/**
 * 搜索初始数据响应
 */
export interface SearchInitResponse {
  /** 搜索历史记录 */
  searchHistory: SearchHistoryItem[];
  /** 热门搜索关键词 */
  hotKeywords: HotKeyword[];
  /** 搜索框占位符 */
  placeholder: string;
}

/**
 * 搜索建议类型
 *
 * 对接后端文档: API对接文档-搜索页面.md
 */
export type SearchSuggestionType = 'game' | 'skill' | 'user' | 'service' | 'activity' | 'topic' | 'keyword';

/**
 * 搜索建议项
 *
 * 对接后端文档: API对接文档-搜索页面.md
 */
export interface SearchSuggestion {
  /** 建议文本 */
  text: string;
  /** 建议类型: game(游戏) / skill(技能) / user(用户) / service(服务) / activity(活动) */
  type: SearchSuggestionType;
  /** 图标（emoji或图片URL） */
  icon?: string;
  /** 高亮文本（可选） */
  highlight?: string;
  /** 额外信息（可选） */
  extra?: string;
}

/**
 * 搜索建议响应
 */
export interface SearchSuggestResponse {
  /** 建议列表 */
  suggestions: SearchSuggestion[];
}

/**
 * 删除搜索历史请求参数
 */
export interface DeleteHistoryParams {
  /** 要删除的关键词（可选，不传则清空所有） */
  keyword?: string;
  /** 是否清空所有 */
  clearAll?: boolean;
}

/**
 * 删除搜索历史响应
 */
export interface DeleteHistoryResponse {
  /** 是否成功 */
  success: boolean;
  /** 提示信息 */
  message?: string;
}

/**
 * 搜索类型
 *
 * 对接后端文档: API对接文档-搜索结果页面.md
 */
export type SearchType = 'all' | 'users' | 'orders' | 'topics';

/**
 * 搜索请求参数
 */
export interface SearchParams {
  /** 搜索关键词 */
  keyword: string;
  /** 搜索类型 */
  type: SearchType;
  /** 页码 */
  pageNum?: number;
  /** 每页数量 */
  pageSize?: number;
  /** 筛选条件（可选） */
  filters?: {
    cityCode?: string;
    districtCode?: string;
    gender?: 'all' | 'male' | 'female';
    sortBy?: string;
  };
}

/**
 * 搜索Tab信息
 */
export interface SearchTab {
  /** Tab类型 */
  type: SearchType;
  /** Tab显示文本 */
  label: string;
  /** 结果数量 */
  count: number;
}

/**
 * 搜索结果中的动态/帖子作者
 */
export interface SearchPostAuthor {
  userId: number;
  avatar: string;
  nickname: string;
}

/**
 * 搜索结果中的动态/帖子
 */
export interface SearchPost {
  postId: number;
  title?: string;
  description: string;
  thumbnail: string;
  mediaType: 'image' | 'video';
  author: SearchPostAuthor;
  stats: {
    likes: number;
    comments?: number;
  };
}

/**
 * 搜索结果中的用户（全部Tab）
 */
export interface SearchUserBrief {
  userId: number;
  avatar: string;
  nickname: string;
  signature?: string;
}

/**
 * 全部Tab结果项
 */
export interface SearchAllItem {
  /** 结果项类型 */
  itemType: 'post' | 'video' | 'user';
  /** 结果项ID */
  itemId: number;
  /** 帖子信息（itemType为post/video时） */
  post?: SearchPost;
  /** 用户信息（itemType为user时） */
  user?: SearchUserBrief;
}

/**
 * 搜索用户Tab结果项
 *
 * 对接后端文档: API对接文档-搜索结果页面.md
 */
export interface SearchUserItem {
  /** 用户ID */
  userId: number;
  /** 头像URL */
  avatar: string;
  /** 昵称 */
  nickname: string;
  /** 年龄 */
  age?: number;
  /** 性别: male / female */
  gender: 'male' | 'female';
  /** 个人简介 */
  bio?: string;
  /** 关系状态: none(无关系) / following(我关注了) / follower(关注我) / mutual(互相关注) */
  relationStatus: 'none' | 'following' | 'follower' | 'mutual';
  /** 标签列表 */
  tags?: string[];
  /** 是否认证 */
  isVerified: boolean;
  /** 是否在线 */
  isOnline?: boolean;
}

/**
 * 搜索下单Tab标签
 *
 * 对接后端文档: API对接文档-搜索结果页面.md
 */
export interface SearchOrderTag {
  /** 标签名称 */
  name: string;
  /** 标签类型: game / rank 等 */
  type: string;
  /** 标签颜色（可选） */
  color?: string;
}

/**
 * 搜索下单Tab价格
 */
export interface SearchOrderPrice {
  amount: number;
  unit: string;
  displayText: string;
}

/**
 * 搜索下单Tab技能信息
 *
 * 对接后端文档: API对接文档-搜索结果页面.md
 */
export interface SearchOrderSkill {
  /** 技能ID */
  skillId: number;
  /** 技能名称 */
  skillName: string;
  /** 技能描述 */
  description?: string;
}

/**
 * 搜索下单Tab结果项（服务提供者）
 *
 * 对接后端文档: API对接文档-搜索结果页面.md
 */
export interface SearchOrderItem {
  /** 用户ID */
  userId: number;
  /** 头像URL */
  avatar: string;
  /** 昵称 */
  nickname: string;
  /** 性别: male / female */
  gender: 'male' | 'female';
  /** 距离（米） */
  distance: number;
  /** 距离显示文本 */
  distanceText: string;
  /** 标签列表 */
  tags: SearchOrderTag[];
  /** 价格信息 */
  price: SearchOrderPrice;
  /** 评分 */
  rating?: number;
  /** 接单数 */
  orderCount?: number;
  /** 是否在线 */
  isOnline: boolean;
  /** 技能列表 */
  skills?: SearchOrderSkill[];
}

/**
 * 搜索话题Tab统计
 *
 * 对接后端文档: API对接文档-搜索结果页面.md
 */
export interface SearchTopicStats {
  /** 动态数量 */
  posts: number;
  /** 浏览量 */
  views?: number;
  /** 参与人数 */
  participants?: number;
}

/**
 * 搜索话题Tab结果项
 *
 * 对接后端文档: API对接文档-搜索结果页面.md
 */
export interface SearchTopicItem {
  /** 话题ID */
  topicId: number;
  /** 话题名称 */
  topicName: string;
  /** 话题图标（emoji） */
  icon?: string;
  /** 话题描述 */
  description: string;
  /** 是否热门 */
  isHot: boolean;
  /** 热门标签（如"热门"、"新"） */
  hotLabel?: string;
  /** 统计信息 */
  stats: SearchTopicStats;
  /** 封面图URL */
  coverImage?: string;
}

/**
 * 综合搜索响应
 */
export interface SearchResponse {
  /** 搜索关键词 */
  keyword: string;
  /** 总结果数 */
  total: number;
  /** 是否有更多 */
  hasMore: boolean;
  /** Tab列表 */
  tabs: SearchTab[];
  /** 搜索结果（根据type不同结构不同） */
  results: any;
}

/**
 * 分Tab搜索结果响应（通用）
 */
export interface SearchTabResponse<T> {
  /** 结果列表 */
  list: T[];
  /** 总数 */
  total: number;
  /** 是否有更多 */
  hasMore: boolean;
}

// ==================== 组局/活动相关类型定义 ====================

/**
 * 活动排序方式
 *
 * 对接后端文档: API对接文档-组局中心列表页面.md
 */
export type ActivitySortBy = 'smart_recommend' | 'latest' | 'distance_asc';

/**
 * 活动性别筛选
 */
export type ActivityGender = 'all' | 'male' | 'female';

/**
 * 活动状态
 *
 * 对接后端文档: API对接文档-组局中心列表页面.md, API对接文档-组局详情页面.md
 */
export type ActivityStatus = 'recruiting' | 'full' | 'ended' | 'cancelled';

/**
 * 活动类型
 *
 * 对接后端文档: API对接文档-组局中心列表页面.md
 */
export interface ActivityType {
  /** 类型标识 */
  value: string;
  /** 类型名称 */
  label: string;
  /** 类型图标（emoji） */
  icon: string;
}

/**
 * 活动列表查询参数
 */
export interface ActivityListParams {
  /** 页码 */
  pageNum?: number;
  /** 每页数量 */
  pageSize?: number;
  /** 排序方式 */
  sortBy?: ActivitySortBy;
  /** 性别筛选 */
  gender?: ActivityGender;
  /** 人数筛选（如 "2-4"、"5-10"） */
  memberCount?: string;
  /** 活动类型筛选 */
  activityType?: string;
  /** 城市代码 */
  cityCode?: string;
  /** 区域代码 */
  districtCode?: string;
}

/**
 * 活动组织者信息
 *
 * 对接后端文档: API对接文档-组局详情页面.md
 */
export interface ActivityOrganizer {
  /** 用户ID */
  userId: number;
  /** 头像URL */
  avatar: string;
  /** 昵称 */
  nickname: string;
  /** 性别: male/female */
  gender?: 'male' | 'female';
  /** 年龄 */
  age?: number;
  /** 是否认证 */
  isVerified?: boolean;
  /** 组织者标签 */
  tags?: string[];
  /** 个人简介 */
  bio?: string;
}

/**
 * 活动标签
 */
export interface ActivityTag {
  text: string;
  type: string;
  color?: string;
}

/**
 * 活动价格
 *
 * 对接后端文档: API对接文档-组局中心列表页面.md
 */
export interface ActivityPrice {
  /** 是否收费 */
  isPaid: boolean;
  /** 费用金额 */
  amount: number;
  /** 价格单位 */
  unit: string;
  /** 费用显示文本 */
  displayText: string;
}

/**
 * 活动时间信息
 */
export interface ActivitySchedule {
  startTime: string;
  endTime?: string;
  displayText: string;
}

/**
 * 活动地点信息
 *
 * 对接后端文档: API对接文档-组局中心列表页面.md
 */
export interface ActivityLocation {
  /** 地点名称 */
  name?: string;
  /** 详细地址 */
  address: string;
  /** 区域 */
  district?: string;
  /** 城市 */
  city?: string;
  /** 距离（米） */
  distance?: number;
  /** 距离显示文本 */
  distanceText?: string;
  /** 纬度 */
  latitude?: number;
  /** 经度 */
  longitude?: number;
}

/**
 * 活动参与者信息（简要）
 *
 * 对接后端文档: API对接文档-组局中心列表页面.md
 */
export interface ActivityParticipantsInfo {
  /** 当前人数 */
  current: number;
  /** 最大人数 */
  max: number;
  /** 人数显示文本 */
  displayText: string;
  /** 参与者头像列表 */
  avatars?: string[];
}

/**
 * 活动列表卡片
 *
 * 对接后端文档: API对接文档-组局中心列表页面.md
 */
export interface ActivityListItem {
  /** 活动ID */
  activityId: number;
  /** 组织者信息 */
  organizer: ActivityOrganizer;
  /** 活动标题 */
  title?: string;
  /** 活动描述 */
  description?: string;
  /** 活动类型 */
  activityType: ActivityType;
  /** 活动标签 */
  tags: ActivityTag[];
  /** 费用信息 */
  price: ActivityPrice;
  /** 时间安排 */
  schedule: ActivitySchedule;
  /** 地点信息 */
  location: ActivityLocation;
  /** 参与者信息 */
  participants: ActivityParticipantsInfo;
  /** 活动状态 */
  status: ActivityStatus;
  /** 创建时间 */
  createdAt?: string;
}

/**
 * 筛选选项
 */
export interface ActivityFilterOption {
  value: string;
  label: string;
  icon?: string;
  selected?: boolean;
}

/**
 * 活动列表筛选配置
 */
export interface ActivityListFilters {
  sortOptions: ActivityFilterOption[];
  genderOptions: ActivityFilterOption[];
  memberOptions: ActivityFilterOption[];
  activityTypes: ActivityFilterOption[];
}

/**
 * 活动列表响应
 */
export interface ActivityListResponse {
  list: ActivityListItem[];
  total: number;
  hasMore: boolean;
  filters: ActivityListFilters;
}

/**
 * 活动参与者详情
 *
 * 对接后端文档: API对接文档-组局详情页面.md
 */
export interface ActivityParticipant {
  /** 用户ID */
  userId: number;
  /** 头像URL */
  avatar: string;
  /** 昵称 */
  nickname: string;
  /** 性别 */
  gender?: 'male' | 'female';
  /** 报名状态: pending(待确认) / confirmed(已确认) / rejected(已拒绝) */
  status: 'pending' | 'confirmed' | 'rejected';
  /** 状态显示文本 */
  statusText: string;
  /** 报名时间 */
  joinTime?: string;
}

/**
 * 活动详情参与者信息
 *
 * 对接后端文档: API对接文档-组局详情页面.md
 */
export interface ActivityDetailParticipants {
  /** 当前人数 */
  current: number;
  /** 最大人数 */
  max: number;
  /** 人数显示文本 */
  displayText: string;
  /** 参与者列表 */
  list: ActivityParticipant[];
  /** 待确认人数文本 */
  waitingText?: string;
  /** 待确认人数 */
  pendingCount?: number;
}

/**
 * 当前用户状态
 *
 * 对接后端文档: API对接文档-组局详情页面.md
 */
export interface ActivityUserStatus {
  /** 是否是组织者 */
  isOrganizer: boolean;
  /** 是否已报名 */
  hasRegistered: boolean;
  /** 报名状态: pending(待确认) / confirmed(已确认) / rejected(已拒绝) */
  registrationStatus?: 'pending' | 'confirmed' | 'rejected';
  /** 是否可以报名 */
  canRegister: boolean;
  /** 不能报名的原因 */
  cannotRegisterReason?: string;
  /** 是否可以取消报名 */
  canCancel?: boolean;
}

/**
 * 活动详情
 *
 * 对接后端文档: API对接文档-组局详情页面.md
 */
export interface ActivityDetail {
  /** 活动ID */
  activityId: number;
  /** 活动状态 */
  status: ActivityStatus;
  /** 状态显示文本 */
  statusText?: string;
  /** 组织者信息 */
  organizer: ActivityOrganizer;
  /** 活动类型标识 */
  activityType: string;
  /** 活动类型名称 */
  activityTypeName: string;
  /** 活动类型图标 */
  activityTypeIcon?: string;
  /** 活动标题 */
  title?: string;
  /** 活动描述 */
  description: string;
  /** 活动图片列表 */
  images?: string[];
  /** 横幅图片 */
  bannerImage?: string;
  /** 活动标签 */
  tags?: string[];
  // 时间信息（扁平化）
  /** 开始时间 */
  startTime: string;
  /** 结束时间 */
  endTime?: string;
  /** 时间显示文本 */
  timeDisplay: string;
  // 地点信息（扁平化）
  /** 地点名称 */
  locationName?: string;
  /** 详细地址 */
  locationAddress: string;
  /** 城市 */
  city?: string;
  /** 区域 */
  district?: string;
  /** 纬度 */
  latitude?: number;
  /** 经度 */
  longitude?: number;
  // 费用信息（扁平化）
  /** 是否收费 */
  isPaid: boolean;
  /** 费用金额 */
  fee?: number;
  /** 费用显示文本 */
  feeDisplay: string;
  /** 费用说明 */
  feeDescription?: string;
  // 人数信息（扁平化）
  /** 当前人数 */
  currentMembers: number;
  /** 最大人数 */
  maxMembers: number;
  /** 人数显示文本 */
  membersDisplay: string;
  /** 待确认人数 */
  pendingCount?: number;
  // 参与者列表
  /** 参与者列表 */
  participants: ActivityParticipant[];
  // 报名截止
  /** 报名截止时间 */
  registrationDeadline?: string;
  /** 报名截止显示文本 */
  registrationDeadlineDisplay?: string;
  // 用户状态（扁平化）
  /** 是否是组织者 */
  isOrganizer: boolean;
  /** 当前用户状态: none(未报名) / pending(待确认) / confirmed(已确认) / rejected(已拒绝) */
  currentUserStatus?: 'none' | 'pending' | 'confirmed' | 'rejected';
  /** 是否可以报名 */
  canRegister: boolean;
  /** 不能报名的原因 */
  cannotRegisterReason?: string;
  /** 是否可以取消报名 */
  canCancel?: boolean;
  // 统计信息
  /** 浏览数 */
  viewCount?: number;
  /** 分享数 */
  shareCount?: number;
  /** 创建时间 */
  createdAt?: string;
}

/**
 * 报名参加活动请求参数
 */
export interface ActivityRegisterParams {
  activityId: number;
  message?: string;
}

/**
 * 报名参加活动响应
 *
 * 对接后端文档: API对接文档-组局详情页面.md
 */
export interface ActivityRegisterResponse {
  /** 是否成功 */
  success: boolean;
  /** 报名状态: pending(待确认) / confirmed(已确认) */
  status: 'pending' | 'confirmed';
  /** 状态说明消息 */
  statusMessage: string;
  /** 报名记录ID */
  registrationId?: number;
  /** 是否需要支付 */
  needPay: boolean;
  /** 支付金额 */
  payAmount?: number;
  /** 当前参与人数 */
  currentMembers?: number;
  /** 最大人数 */
  maxMembers?: number;
}

/**
 * 取消报名请求参数
 */
export interface ActivityCancelParams {
  activityId: number;
  registrationId?: number;
}

/**
 * 退款信息
 *
 * 对接后端文档: API对接文档-组局详情页面.md
 */
export interface ActivityRefundInfo {
  /** 是否有退款 */
  hasRefund: boolean;
  /** 退款金额 */
  refundAmount?: number;
  /** 退款状态: processing(处理中) / success(成功) / failed(失败) */
  refundStatus?: 'processing' | 'success' | 'failed';
  /** 退款说明 */
  refundMessage?: string;
}

/**
 * 取消报名响应
 *
 * 对接后端文档: API对接文档-组局详情页面.md
 */
export interface ActivityCancelResponse {
  /** 是否成功 */
  success: boolean;
  /** 提示消息 */
  message?: string;
  /** 退款信息 */
  refundInfo?: ActivityRefundInfo;
}

// ==================== 发布组局相关类型定义 ====================

/**
 * 活动类型选项（发布配置）
 */
export interface ActivityTypeOption {
  value: string;
  label: string;
  icon: string;
}

/**
 * 价格单位选项
 */
export interface PriceUnitOption {
  value: string;
  label: string;
}

/**
 * 人数选项
 */
export interface MemberCountOption {
  value: number;
  label: string;
}

/**
 * 平台费规则
 */
export interface PlatformFeeRule {
  rate: number;
  description: string;
}

/**
 * 押金规则
 */
export interface DepositRule {
  depositAmount: number;
  description: string;
}

/**
 * 发布组局配置响应
 */
export interface ActivityPublishConfigResponse {
  /** 活动类型列表 */
  activityTypes: ActivityTypeOption[];
  /** 价格单位选项 */
  priceUnit: {
    options: PriceUnitOption[];
  };
  /** 人数选项列表 */
  memberCountOptions: MemberCountOption[];
  /** 平台费规则 */
  platformFee: PlatformFeeRule;
  /** 押金规则 */
  depositRules: DepositRule;
}

/**
 * 发布组局时间信息
 */
export interface ActivityPublishSchedule {
  startTime: string;
  endTime?: string;
}

/**
 * 发布组局地点信息
 */
export interface ActivityPublishLocation {
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * 发布组局价格信息
 */
export interface ActivityPublishPrice {
  amount: number;
  unit: 'per_person' | 'per_hour' | 'total';
}

/**
 * 发布组局请求参数
 */
export interface ActivityPublishRequest {
  /** 活动类型 */
  activityType: string;
  /** 活动标题 */
  title: string;
  /** 活动描述 */
  content: string;
  /** 活动图片列表 */
  images?: string[];
  /** 时间信息 */
  schedule: ActivityPublishSchedule;
  /** 地点信息 */
  location: ActivityPublishLocation;
  /** 价格信息 */
  price: ActivityPublishPrice;
  /** 人数上限 */
  memberLimit: number;
  /** 报名截止时间 */
  registrationDeadline: string;
}

/**
 * 发布组局支付信息
 */
export interface ActivityPublishPaymentInfo {
  amount: number;
  platformFee: number;
  deposit: number;
}

/**
 * 发布组局响应
 */
export interface ActivityPublishResponse {
  /** 活动ID */
  activityId: number;
  /** 是否需要支付 */
  needPayment: boolean;
  /** 支付信息（needPayment为true时返回） */
  paymentInfo?: ActivityPublishPaymentInfo;
}

/**
 * 支付平台费请求参数
 */
export interface ActivityPublishPayRequest {
  /** 活动ID */
  activityId: number;
  /** 支付方式 */
  paymentMethod: 'wechat' | 'alipay' | 'balance';
  /** 支付金额 */
  amount: number;
}

/**
 * 支付平台费响应
 */
export interface ActivityPublishPayResponse {
  /** 是否成功 */
  success: boolean;
  /** 支付订单号 */
  orderId?: string;
  /** 支付状态 */
  paymentStatus: 'pending' | 'success' | 'failed';
  /** 提示信息 */
  message?: string;
}

// ==================== 服务列表相关类型定义 ====================

/**
 * 服务列表Tab类型
 */
export type ServiceTabType = 'glory_king' | 'online' | 'offline' | 'my';

/**
 * 服务列表排序类型
 */
export type ServiceSortBy = 'smart' | 'price_asc' | 'price_desc' | 'rating_desc' | 'orders_desc';

/**
 * 服务列表查询参数
 */
export interface ServiceListParams {
  /** 技能类型（必填） */
  skillType: string;
  /** 页码 */
  pageNum?: number;
  /** 每页数量 */
  pageSize?: number;
  /** Tab类型 */
  tabType?: ServiceTabType;
  /** 排序方式 */
  sortBy?: ServiceSortBy;
  /** 性别筛选 */
  gender?: 'all' | 'male' | 'female';
}

/**
 * 服务提供者信息
 */
export interface ServiceProvider {
  userId: number;
  nickname: string;
  avatar: string;
  gender: 'male' | 'female';
  age?: number;
  isOnline: boolean;
  isVerified?: boolean;
  tags?: string[];
}

/**
 * 服务技能信息
 */
export interface ServiceSkillInfo {
  skillType: string;
  skillLabel: string;
  level?: string;
  region?: string;
}

/**
 * 服务价格信息
 */
export interface ServicePriceInfo {
  amount: number;
  unit: string;
  displayText: string;
  originalPrice?: number;
  discountRate?: number;
}

/**
 * 服务统计信息
 */
export interface ServiceStatsInfo {
  orders: number;
  rating: number;
  reviewCount: number;
}

/**
 * 服务列表项
 */
export interface ServiceListItem {
  serviceId: number;
  provider: ServiceProvider;
  skillInfo: ServiceSkillInfo;
  price: ServicePriceInfo;
  stats: ServiceStatsInfo;
  tags?: string[];
  description?: string;
}

/**
 * 服务列表Tab配置
 */
export interface ServiceTabOption {
  type: ServiceTabType;
  label: string;
  count?: number;
}

/**
 * 服务列表筛选选项
 */
export interface ServiceFilterOption {
  value: string;
  label: string;
}

/**
 * 服务列表筛选配置
 */
export interface ServiceListFilters {
  sortOptions: ServiceFilterOption[];
  genderOptions: ServiceFilterOption[];
  regionOptions?: ServiceFilterOption[];
  levelOptions?: ServiceFilterOption[];
  priceOptions?: ServiceFilterOption[];
}

/**
 * 服务列表响应
 */
export interface ServiceListResponse {
  /** 技能类型 */
  skillType: string;
  /** Tab列表 */
  tabs: ServiceTabOption[];
  /** 筛选配置 */
  filters: ServiceListFilters;
  /** 服务列表 */
  list: ServiceListItem[];
  /** 总数 */
  total: number;
  /** 是否有更多 */
  hasMore: boolean;
}

// ==================== 服务详情相关类型定义 ====================

/**
 * 服务详情查询参数
 */
export interface ServiceDetailParams {
  /** 服务ID（必填） */
  serviceId: number;
  /** 用户ID */
  userId?: string;
}

/**
 * 服务评价摘要
 */
export interface ServiceReviewsSummary {
  averageRating: number;
  totalCount: number;
  ratingDistribution?: Record<string, number>;
}

/**
 * 服务评价标签
 */
export interface ServiceReviewTag {
  tag: string;
  count: number;
}

/**
 * 单条服务评价
 */
export interface ServiceReviewItem {
  reviewId: number;
  userId: number;
  nickname: string;
  avatar: string;
  rating: number;
  content: string;
  images?: string[];
  createTime: string;
  reply?: {
    content: string;
    createTime: string;
  };
}

/**
 * 服务评价信息
 */
export interface ServiceReviewsInfo {
  total: number;
  summary: ServiceReviewsSummary;
  tags: ServiceReviewTag[];
  recent: ServiceReviewItem[];
}

/**
 * 服务详情响应
 */
export interface ServiceDetailResponse {
  serviceId: number;
  provider: ServiceProvider;
  skillInfo: ServiceSkillInfo;
  price: ServicePriceInfo;
  stats: ServiceStatsInfo;
  reviews: ServiceReviewsInfo;
  description?: string;
  images?: string[];
  workingHours?: string;
  canBook: boolean;
  cannotBookReason?: string;
}

/**
 * 服务评价列表筛选类型
 */
export type ServiceReviewFilterBy = 'all' | 'excellent' | 'good' | 'negative' | 'with_images';

/**
 * 服务评价列表查询参数
 */
export interface ServiceReviewsParams {
  /** 服务ID（必填） */
  serviceId: number;
  /** 页码 */
  pageNum?: number;
  /** 每页数量 */
  pageSize?: number;
  /** 筛选类型 */
  filterBy?: ServiceReviewFilterBy;
}

/**
 * 服务评价列表响应
 */
export interface ServiceReviewsResponse {
  list: ServiceReviewItem[];
  total: number;
  hasNext: boolean;
}

// ==================== API配置 ====================

/** 是否使用Mock数据 */
const USE_MOCK_DATA = false;

/** 是否开启调试日志 */
const DEBUG = __DEV__ ?? false;

const log = (...args: any[]) => DEBUG && console.log('[BffAPI]', ...args);
const logError = (...args: any[]) => console.error('[BffAPI]', ...args);

// ==================== API实现 ====================

/**
 * BFF API 类
 */
export class BffAPI {
  /**
   * 获取首页用户推荐列表
   */
  async getHomeFeed(params: HomeFeedQueryParams): Promise<HomeFeedResponse> {
    const { type, pageNum = 1, pageSize = 10, cityCode } = params;

    log('getHomeFeed', { type, pageNum, pageSize, cityCode });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return this.generateMockHomeFeed(type, pageNum, pageSize);
    }

    try {
      const queryParams = buildQueryParams({ type, pageNum, pageSize, cityCode });
      const url = `${API_ENDPOINTS.BFF.HOME_FEED}?${queryParams}`;
      const response = await apiClient.get<HomeFeedResponse>(url);

      log('getHomeFeed success', { count: response.data?.list?.length || 0 });
      return response.data || { list: [], total: 0, hasMore: false };
    } catch (error: any) {
      logError('getHomeFeed failed:', error.message);
      return { list: [], total: 0, hasMore: false };
    }
  }

  /**
   * 获取线上用户推荐列表（便捷方法）
   */
  async getOnlineUsers(params?: Omit<HomeFeedQueryParams, 'type'>): Promise<HomeFeedResponse> {
    return this.getHomeFeed({ ...params, type: 'online' });
  }

  /**
   * 获取线下用户推荐列表（便捷方法）
   */
  async getOfflineUsers(params?: Omit<HomeFeedQueryParams, 'type'>): Promise<HomeFeedResponse> {
    return this.getHomeFeed({ ...params, type: 'offline' });
  }

  /**
   * 获取筛选配置
   */
  async getFilterConfig(type: HomeFeedType): Promise<FilterConfigResponse> {
    log('getFilterConfig', { type });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return this.generateMockFilterConfig(type);
    }

    try {
      const url = `${API_ENDPOINTS.BFF.FILTER_CONFIG}?type=${type}`;
      const response = await apiClient.get<FilterConfigResponse>(url);

      log('getFilterConfig success', { count: response.data?.filters?.length || 0 });
      return response.data || { filters: [] };
    } catch (error: any) {
      logError('getFilterConfig failed:', error.message);
      return this.generateMockFilterConfig(type);
    }
  }

  /**
   * 应用筛选条件
   */
  async applyFilter(params: FilterApplyParams): Promise<HomeFeedResponse> {
    log('applyFilter', { type: params.type, filters: Object.keys(params.filters) });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return this.generateMockHomeFeed(params.type, params.pageNum || 1, params.pageSize || 10);
    }

    try {
      const response = await apiClient.post<HomeFeedResponse>(API_ENDPOINTS.BFF.FILTER_APPLY, params);

      log('applyFilter success', { count: response.data?.list?.length || 0 });
      return response.data || { list: [], total: 0, hasMore: false };
    } catch (error: any) {
      logError('applyFilter failed:', error.message);
      return { list: [], total: 0, hasMore: false };
    }
  }

  // ==================== 限时专享接口 ====================

  /**
   * 获取限时专享列表
   * 接口: GET /xypai-app-bff/api/home/limited-time/list
   *
   * @param params - 查询参数
   * @returns 限时专享列表响应
   *
   * @example
   * const result = await bffApi.getLimitedTimeList({ pageNum: 1, pageSize: 10, sortBy: 'smart' });
   */
  async getLimitedTimeList(params: LimitedTimeQueryParams = {}): Promise<LimitedTimeResponse> {
    const { pageNum = 1, pageSize = 10, sortBy = 'smart', gender = 'all', language } = params;

    log('getLimitedTimeList', { pageNum, pageSize, sortBy, gender, language });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return this.generateMockLimitedTimeList(pageNum, pageSize, sortBy, gender, language);
    }

    try {
      const queryParams = buildQueryParams({ pageNum, pageSize, sortBy, gender, language });
      const url = `${API_ENDPOINTS.BFF.LIMITED_TIME_LIST}?${queryParams}`;
      const response = await apiClient.get<LimitedTimeResponse>(url);

      log('getLimitedTimeList success', { count: response.data?.list?.length || 0 });
      return response.data || this.generateEmptyLimitedTimeResponse();
    } catch (error: any) {
      logError('getLimitedTimeList failed:', error.message);
      return this.generateEmptyLimitedTimeResponse();
    }
  }

  /**
   * 生成空的限时专享响应
   */
  private generateEmptyLimitedTimeResponse(): LimitedTimeResponse {
    return {
      list: [],
      total: 0,
      hasMore: false,
      filters: {
        sortOptions: [],
        genderOptions: [],
        languageOptions: [],
      },
    };
  }

  // ==================== 搜索页面接口 ====================

  /**
   * 获取搜索初始数据（历史+热门）
   * 接口: GET /xypai-app-bff/api/search/init
   *
   * @returns 搜索初始数据
   *
   * @example
   * const data = await bffApi.getSearchInit();
   * console.log(data.searchHistory); // 搜索历史
   * console.log(data.hotKeywords);   // 热门搜索
   */
  async getSearchInit(): Promise<SearchInitResponse> {
    log('getSearchInit');

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return this.generateMockSearchInit();
    }

    try {
      const response = await apiClient.get<SearchInitResponse>(API_ENDPOINTS.BFF.SEARCH_INIT);

      log('getSearchInit success', {
        historyCount: response.data?.searchHistory?.length || 0,
        hotCount: response.data?.hotKeywords?.length || 0,
      });
      return response.data || { searchHistory: [], hotKeywords: [], placeholder: '搜索更多' };
    } catch (error: any) {
      logError('getSearchInit failed:', error.message);
      return this.generateMockSearchInit();
    }
  }

  /**
   * 获取搜索建议
   * 接口: GET /xypai-app-bff/api/search/suggest
   *
   * @param keyword - 搜索关键词
   * @param limit - 建议数量（默认10）
   * @returns 搜索建议列表
   *
   * @example
   * const result = await bffApi.getSearchSuggestions('王者', 10);
   * console.log(result.suggestions);
   */
  async getSearchSuggestions(keyword: string, limit: number = 10): Promise<SearchSuggestResponse> {
    log('getSearchSuggestions', { keyword, limit });

    if (!keyword || keyword.trim().length === 0) {
      return { suggestions: [] };
    }

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return this.generateMockSearchSuggestions(keyword, limit);
    }

    try {
      const queryParams = buildQueryParams({ keyword, limit });
      const url = `${API_ENDPOINTS.BFF.SEARCH_SUGGEST}?${queryParams}`;
      const response = await apiClient.get<SearchSuggestResponse>(url);

      log('getSearchSuggestions success', { count: response.data?.suggestions?.length || 0 });
      return response.data || { suggestions: [] };
    } catch (error: any) {
      logError('getSearchSuggestions failed:', error.message);
      return { suggestions: [] };
    }
  }

  /**
   * 删除搜索历史
   * 接口: DELETE /xypai-app-bff/api/search/history
   *
   * @param params - 删除参数（keyword或clearAll）
   * @returns 删除结果
   *
   * @example
   * // 删除单条
   * await bffApi.deleteSearchHistory({ keyword: '王者荣耀' });
   * // 清空所有
   * await bffApi.deleteSearchHistory({ clearAll: true });
   */
  async deleteSearchHistory(params: DeleteHistoryParams): Promise<DeleteHistoryResponse> {
    log('deleteSearchHistory', params);

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return {
        success: true,
        message: params.clearAll ? '已清空所有搜索历史' : `已删除"${params.keyword}"`,
      };
    }

    try {
      const response = await apiClient.delete<DeleteHistoryResponse>(API_ENDPOINTS.BFF.SEARCH_HISTORY, {
        data: params,
      });

      log('deleteSearchHistory success');
      return response.data || { success: true };
    } catch (error: any) {
      logError('deleteSearchHistory failed:', error.message);
      return { success: false, message: error.message };
    }
  }

  // ==================== 搜索结果页面接口 ====================

  /**
   * 执行综合搜索
   * 接口: POST /xypai-app-bff/api/search/search
   *
   * @param params - 搜索参数
   * @returns 综合搜索结果
   *
   * @example
   * const result = await bffApi.executeSearch({ keyword: '王者', type: 'all', pageNum: 1, pageSize: 10 });
   */
  async executeSearch(params: SearchParams): Promise<SearchResponse> {
    const { keyword, type, pageNum = 1, pageSize = 10, filters } = params;
    log('executeSearch', { keyword, type, pageNum, pageSize });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return this.generateMockSearchResponse(keyword, type, pageNum, pageSize);
    }

    try {
      const response = await apiClient.post<SearchResponse>(API_ENDPOINTS.BFF.SEARCH_SEARCH, {
        keyword,
        type,
        pageNum,
        pageSize,
        filters,
      });

      log('executeSearch success', { total: response.data?.total || 0 });
      return response.data || this.generateEmptySearchResponse(keyword);
    } catch (error: any) {
      logError('executeSearch failed:', error.message);
      return this.generateEmptySearchResponse(keyword);
    }
  }

  /**
   * 获取全部Tab结果
   * 接口: GET /xypai-app-bff/api/search/all
   *
   * @param keyword - 搜索关键词
   * @param pageNum - 页码
   * @param pageSize - 每页数量
   * @returns 全部Tab结果列表
   */
  async getSearchAll(keyword: string, pageNum: number = 1, pageSize: number = 10): Promise<SearchTabResponse<SearchAllItem>> {
    log('getSearchAll', { keyword, pageNum, pageSize });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return this.generateMockSearchAll(keyword, pageNum, pageSize);
    }

    try {
      const queryParams = buildQueryParams({ keyword, pageNum, pageSize });
      const url = `${API_ENDPOINTS.BFF.SEARCH_ALL}?${queryParams}`;
      const response = await apiClient.get<SearchTabResponse<SearchAllItem>>(url);

      log('getSearchAll success', { count: response.data?.list?.length || 0 });
      return response.data || { list: [], total: 0, hasMore: false };
    } catch (error: any) {
      logError('getSearchAll failed:', error.message);
      return { list: [], total: 0, hasMore: false };
    }
  }

  /**
   * 获取用户Tab结果
   * 接口: GET /xypai-app-bff/api/search/users
   *
   * @param keyword - 搜索关键词
   * @param pageNum - 页码
   * @param pageSize - 每页数量
   * @returns 用户Tab结果列表
   */
  async getSearchUsers(keyword: string, pageNum: number = 1, pageSize: number = 10): Promise<SearchTabResponse<SearchUserItem>> {
    log('getSearchUsers', { keyword, pageNum, pageSize });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return this.generateMockSearchUsers(keyword, pageNum, pageSize);
    }

    try {
      const queryParams = buildQueryParams({ keyword, pageNum, pageSize });
      const url = `${API_ENDPOINTS.BFF.SEARCH_USERS}?${queryParams}`;
      const response = await apiClient.get<SearchTabResponse<SearchUserItem>>(url);

      log('getSearchUsers success', { count: response.data?.list?.length || 0 });
      return response.data || { list: [], total: 0, hasMore: false };
    } catch (error: any) {
      logError('getSearchUsers failed:', error.message);
      return { list: [], total: 0, hasMore: false };
    }
  }

  /**
   * 获取下单Tab结果（服务提供者）
   * 接口: GET /xypai-app-bff/api/search/orders
   *
   * @param keyword - 搜索关键词
   * @param pageNum - 页码
   * @param pageSize - 每页数量
   * @returns 下单Tab结果列表
   */
  async getSearchOrders(keyword: string, pageNum: number = 1, pageSize: number = 10): Promise<SearchTabResponse<SearchOrderItem>> {
    log('getSearchOrders', { keyword, pageNum, pageSize });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return this.generateMockSearchOrders(keyword, pageNum, pageSize);
    }

    try {
      const queryParams = buildQueryParams({ keyword, pageNum, pageSize });
      const url = `${API_ENDPOINTS.BFF.SEARCH_ORDERS}?${queryParams}`;
      const response = await apiClient.get<SearchTabResponse<SearchOrderItem>>(url);

      log('getSearchOrders success', { count: response.data?.list?.length || 0 });
      return response.data || { list: [], total: 0, hasMore: false };
    } catch (error: any) {
      logError('getSearchOrders failed:', error.message);
      return { list: [], total: 0, hasMore: false };
    }
  }

  /**
   * 获取话题Tab结果
   * 接口: GET /xypai-app-bff/api/search/topics
   *
   * @param keyword - 搜索关键词
   * @param pageNum - 页码
   * @param pageSize - 每页数量
   * @returns 话题Tab结果列表
   */
  async getSearchTopics(keyword: string, pageNum: number = 1, pageSize: number = 10): Promise<SearchTabResponse<SearchTopicItem>> {
    log('getSearchTopics', { keyword, pageNum, pageSize });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return this.generateMockSearchTopics(keyword, pageNum, pageSize);
    }

    try {
      const queryParams = buildQueryParams({ keyword, pageNum, pageSize });
      const url = `${API_ENDPOINTS.BFF.SEARCH_TOPICS}?${queryParams}`;
      const response = await apiClient.get<SearchTabResponse<SearchTopicItem>>(url);

      log('getSearchTopics success', { count: response.data?.list?.length || 0 });
      return response.data || { list: [], total: 0, hasMore: false };
    } catch (error: any) {
      logError('getSearchTopics failed:', error.message);
      return { list: [], total: 0, hasMore: false };
    }
  }

  // ==================== 组局/活动接口 ====================

  /**
   * 获取活动列表
   * 接口: GET /xypai-app-bff/api/activity/list
   *
   * @param params - 查询参数
   * @returns 活动列表响应
   *
   * @example
   * const result = await bffApi.getActivityList({ pageNum: 1, pageSize: 10, sortBy: 'smart_recommend' });
   */
  async getActivityList(params: ActivityListParams = {}): Promise<ActivityListResponse> {
    const {
      pageNum = 1,
      pageSize = 10,
      sortBy = 'smart_recommend',
      gender = 'all',
      memberCount,
      activityType,
      cityCode,
      districtCode,
    } = params;

    log('getActivityList', { pageNum, pageSize, sortBy, gender, memberCount, activityType });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return this.generateMockActivityList(pageNum, pageSize, sortBy, gender, memberCount, activityType);
    }

    try {
      const queryParams = buildQueryParams({
        pageNum,
        pageSize,
        sortBy,
        gender,
        memberCount,
        activityType,
        cityCode,
        districtCode,
      });
      const url = `${API_ENDPOINTS.BFF.ACTIVITY_LIST}?${queryParams}`;
      const response = await apiClient.get<ActivityListResponse>(url);

      log('getActivityList success', { count: response.data?.list?.length || 0 });
      return response.data || this.generateEmptyActivityListResponse();
    } catch (error: any) {
      logError('getActivityList failed:', error.message);
      return this.generateEmptyActivityListResponse();
    }
  }

  /**
   * 获取活动详情
   * 接口: GET /xypai-app-bff/api/activity/detail/{activityId}
   *
   * @param activityId - 活动ID
   * @returns 活动详情
   *
   * @example
   * const detail = await bffApi.getActivityDetail(12345);
   */
  async getActivityDetail(activityId: number): Promise<ActivityDetail | null> {
    log('getActivityDetail', { activityId });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return this.generateMockActivityDetail(activityId);
    }

    try {
      const url = `${API_ENDPOINTS.BFF.ACTIVITY_DETAIL}/${activityId}`;
      const response = await apiClient.get<ActivityDetail>(url);

      log('getActivityDetail success', { activityId: response.data?.activityId });
      return response.data || null;
    } catch (error: any) {
      logError('getActivityDetail failed:', error.message);
      return null;
    }
  }

  /**
   * 报名参加活动
   * 接口: POST /xypai-app-bff/api/activity/register
   *
   * @param params - 报名参数
   * @returns 报名结果
   *
   * @example
   * const result = await bffApi.registerActivity({ activityId: 12345, message: '我想参加！' });
   */
  async registerActivity(params: ActivityRegisterParams): Promise<ActivityRegisterResponse> {
    log('registerActivity', { activityId: params.activityId });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        success: true,
        status: 'pending',
        statusMessage: '报名成功，等待组织者审核',
        registrationId: Math.floor(Math.random() * 10000),
        needPay: false,
        currentMembers: 3,
        maxMembers: 6,
      };
    }

    try {
      const response = await apiClient.post<ActivityRegisterResponse>(
        API_ENDPOINTS.BFF.ACTIVITY_REGISTER,
        params
      );

      log('registerActivity success', { success: response.data?.success });
      return response.data || { success: false, status: 'pending', statusMessage: '报名失败', needPay: false };
    } catch (error: any) {
      logError('registerActivity failed:', error.message);
      return { success: false, status: 'pending', statusMessage: error.message, needPay: false };
    }
  }

  /**
   * 取消活动报名
   * 接口: POST /xypai-app-bff/api/activity/register/cancel
   *
   * @param params - 取消参数
   * @returns 取消结果
   *
   * @example
   * const result = await bffApi.cancelActivityRegistration({ activityId: 12345 });
   */
  async cancelActivityRegistration(params: ActivityCancelParams): Promise<ActivityCancelResponse> {
    log('cancelActivityRegistration', { activityId: params.activityId });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        success: true,
        message: '已成功取消报名',
        refundInfo: params.registrationId ? {
          hasRefund: true,
          refundAmount: 30,
          refundStatus: 'processing',
          refundMessage: '退款处理中，预计1-3个工作日到账',
        } : undefined,
      };
    }

    try {
      const response = await apiClient.post<ActivityCancelResponse>(
        API_ENDPOINTS.BFF.ACTIVITY_REGISTER_CANCEL,
        params
      );

      log('cancelActivityRegistration success', { success: response.data?.success });
      return response.data || { success: false, message: '取消失败' };
    } catch (error: any) {
      logError('cancelActivityRegistration failed:', error.message);
      return { success: false, message: error.message };
    }
  }

  // ==================== 发布组局接口 ====================

  /**
   * 获取发布组局配置
   * 接口: GET /xypai-app-bff/api/activity/publish/config
   *
   * @returns 发布组局配置（活动类型、价格单位、人数选项、平台费规则等）
   *
   * @example
   * const config = await bffApi.getActivityPublishConfig();
   * console.log(config.activityTypes); // 活动类型列表
   * console.log(config.platformFee);   // 平台费规则
   */
  async getActivityPublishConfig(): Promise<ActivityPublishConfigResponse> {
    log('getActivityPublishConfig');

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return this.generateMockActivityPublishConfig();
    }

    try {
      const response = await apiClient.get<ActivityPublishConfigResponse>(
        API_ENDPOINTS.BFF.ACTIVITY_PUBLISH_CONFIG
      );

      log('getActivityPublishConfig success');
      return response.data || this.generateMockActivityPublishConfig();
    } catch (error: any) {
      logError('getActivityPublishConfig failed:', error.message);
      return this.generateMockActivityPublishConfig();
    }
  }

  /**
   * 发布组局活动
   * 接口: POST /xypai-app-bff/api/activity/publish
   *
   * @param params - 发布参数
   * @returns 发布结果
   *
   * @example
   * const result = await bffApi.publishActivity({
   *   activityType: 'billiards',
   *   title: '周末台球局',
   *   content: '一起来打台球',
   *   schedule: { startTime: '2025-11-30T14:00:00' },
   *   location: { address: '南山区科技园' },
   *   price: { amount: 50, unit: 'per_person' },
   *   memberLimit: 6,
   *   registrationDeadline: '2025-11-29T18:00:00'
   * });
   */
  async publishActivity(params: ActivityPublishRequest): Promise<ActivityPublishResponse> {
    log('publishActivity', { activityType: params.activityType, title: params.title });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        activityId: Math.floor(Math.random() * 100000) + 10000,
        needPayment: params.price.amount > 0,
        paymentInfo: params.price.amount > 0 ? {
          amount: params.price.amount,
          platformFee: Math.floor(params.price.amount * 0.05),
          deposit: 10,
        } : undefined,
      };
    }

    try {
      const response = await apiClient.post<ActivityPublishResponse>(
        API_ENDPOINTS.BFF.ACTIVITY_PUBLISH,
        params
      );

      log('publishActivity success', { activityId: response.data?.activityId });
      return response.data || { activityId: 0, needPayment: false };
    } catch (error: any) {
      logError('publishActivity failed:', error.message);
      throw error;
    }
  }

  /**
   * 支付发布组局平台费
   * 接口: POST /xypai-app-bff/api/activity/publish/pay
   *
   * @param params - 支付参数
   * @returns 支付结果
   *
   * @example
   * const result = await bffApi.payActivityPublishFee({
   *   activityId: 12345,
   *   paymentMethod: 'wechat',
   *   amount: 50
   * });
   */
  async payActivityPublishFee(params: ActivityPublishPayRequest): Promise<ActivityPublishPayResponse> {
    log('payActivityPublishFee', { activityId: params.activityId, paymentMethod: params.paymentMethod });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        success: true,
        orderId: `PAY${Date.now()}`,
        paymentStatus: 'success',
        message: '支付成功',
      };
    }

    try {
      const response = await apiClient.post<ActivityPublishPayResponse>(
        API_ENDPOINTS.BFF.ACTIVITY_PUBLISH_PAY,
        params
      );

      log('payActivityPublishFee success', { success: response.data?.success });
      return response.data || { success: false, paymentStatus: 'failed', message: '支付失败' };
    } catch (error: any) {
      logError('payActivityPublishFee failed:', error.message);
      return { success: false, paymentStatus: 'failed', message: error.message };
    }
  }

  // ==================== 服务列表/详情接口 ====================

  /**
   * 获取服务列表
   * 接口: GET /xypai-app-bff/api/service/list
   *
   * @param params - 查询参数
   * @returns 服务列表响应
   *
   * @example
   * const result = await bffApi.getServiceList({
   *   skillType: '王者荣耀',
   *   pageNum: 1,
   *   pageSize: 10,
   *   tabType: 'glory_king',
   *   sortBy: 'rating_desc'
   * });
   */
  async getServiceList(params: ServiceListParams): Promise<ServiceListResponse> {
    const { skillType, pageNum = 1, pageSize = 10, tabType, sortBy, gender } = params;
    log('getServiceList', { skillType, pageNum, pageSize, tabType, sortBy, gender });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return this.generateMockServiceList(skillType, pageNum, pageSize);
    }

    try {
      const queryParams = buildQueryParams({ skillType, pageNum, pageSize, tabType, sortBy, gender });
      const url = `${API_ENDPOINTS.BFF.SERVICE_LIST}?${queryParams}`;
      const response = await apiClient.get<ServiceListResponse>(url);

      log('getServiceList success', { count: response.data?.list?.length || 0 });
      return response.data || this.generateEmptyServiceListResponse(skillType);
    } catch (error: any) {
      logError('getServiceList failed:', error.message);
      return this.generateEmptyServiceListResponse(skillType);
    }
  }

  /**
   * 获取服务详情
   * 接口: GET /xypai-app-bff/api/service/detail
   *
   * @param params - 查询参数
   * @returns 服务详情响应
   *
   * @example
   * const detail = await bffApi.getServiceDetail({ serviceId: 1001, userId: '123' });
   */
  async getServiceDetail(params: ServiceDetailParams): Promise<ServiceDetailResponse | null> {
    const { serviceId, userId } = params;
    log('getServiceDetail', { serviceId, userId });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return this.generateMockServiceDetail(serviceId);
    }

    try {
      const queryParams = buildQueryParams({ serviceId, userId });
      const url = `${API_ENDPOINTS.BFF.SERVICE_DETAIL}?${queryParams}`;
      const response = await apiClient.get<ServiceDetailResponse>(url);

      log('getServiceDetail success', { serviceId: response.data?.serviceId });
      return response.data || null;
    } catch (error: any) {
      logError('getServiceDetail failed:', error.message);
      return null;
    }
  }

  /**
   * 获取服务评价列表
   * 接口: GET /xypai-app-bff/api/service/reviews
   *
   * @param params - 查询参数
   * @returns 评价列表响应
   *
   * @example
   * const reviews = await bffApi.getServiceReviews({
   *   serviceId: 1001,
   *   pageNum: 1,
   *   pageSize: 10,
   *   filterBy: 'excellent'
   * });
   */
  async getServiceReviews(params: ServiceReviewsParams): Promise<ServiceReviewsResponse> {
    const { serviceId, pageNum = 1, pageSize = 10, filterBy } = params;
    log('getServiceReviews', { serviceId, pageNum, pageSize, filterBy });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return this.generateMockServiceReviews(pageNum, pageSize);
    }

    try {
      const queryParams = buildQueryParams({ serviceId, pageNum, pageSize, filterBy });
      const url = `${API_ENDPOINTS.BFF.SERVICE_REVIEWS}?${queryParams}`;
      const response = await apiClient.get<ServiceReviewsResponse>(url);

      log('getServiceReviews success', { count: response.data?.list?.length || 0 });
      return response.data || { list: [], total: 0, hasNext: false };
    } catch (error: any) {
      logError('getServiceReviews failed:', error.message);
      return { list: [], total: 0, hasNext: false };
    }
  }

  /**
   * 生成Mock发布组局配置
   */
  private generateMockActivityPublishConfig(): ActivityPublishConfigResponse {
    return {
      activityTypes: [
        { value: 'billiards', label: '台球', icon: '🎱' },
        { value: 'ktv', label: 'KTV', icon: '🎤' },
        { value: 'dinner', label: '约饭', icon: '🍽️' },
        { value: 'movie', label: '电影', icon: '🎬' },
        { value: 'sports', label: '运动', icon: '⚽' },
        { value: 'board_game', label: '桌游', icon: '🎲' },
        { value: 'script_kill', label: '剧本杀', icon: '🔍' },
        { value: 'other', label: '其他', icon: '📌' },
      ],
      priceUnit: {
        options: [
          { value: 'per_person', label: '元/人' },
          { value: 'per_hour', label: '元/小时' },
          { value: 'total', label: '总价' },
        ],
      },
      memberCountOptions: [
        { value: 2, label: '2人' },
        { value: 3, label: '3人' },
        { value: 4, label: '4人' },
        { value: 5, label: '5人' },
        { value: 6, label: '6人' },
        { value: 8, label: '8人' },
        { value: 10, label: '10人' },
        { value: 15, label: '15人' },
        { value: 20, label: '20人' },
      ],
      platformFee: {
        rate: 0.05,
        description: '平台服务费为活动费用的5%',
      },
      depositRules: {
        depositAmount: 10,
        description: '发布付费活动需缴纳10元押金，活动结束后自动退回',
      },
    };
  }

  /**
   * 生成空的活动列表响应
   */
  private generateEmptyActivityListResponse(): ActivityListResponse {
    return {
      list: [],
      total: 0,
      hasMore: false,
      filters: {
        sortOptions: [],
        genderOptions: [],
        memberOptions: [],
        activityTypes: [],
      },
    };
  }

  /**
   * 生成空的服务列表响应
   */
  private generateEmptyServiceListResponse(skillType: string): ServiceListResponse {
    return {
      skillType,
      tabs: [
        { type: 'glory_king', label: '荣耀王者' },
        { type: 'online', label: '线上' },
        { type: 'offline', label: '线下' },
        { type: 'my', label: '我的' },
      ],
      filters: {
        sortOptions: [],
        genderOptions: [],
      },
      list: [],
      total: 0,
      hasMore: false,
    };
  }

  /**
   * 生成Mock服务列表
   */
  private generateMockServiceList(skillType: string, pageNum: number, pageSize: number): ServiceListResponse {
    const startIndex = (pageNum - 1) * pageSize;
    const list: ServiceListItem[] = Array.from({ length: pageSize }, (_, i) => {
      const index = startIndex + i;
      return {
        serviceId: 1000 + index,
        provider: {
          userId: 10000 + index,
          nickname: `${skillType}陪玩${100 + index}号`,
          avatar: `https://picsum.photos/100/100?random=service${index}`,
          gender: index % 2 === 0 ? 'female' : 'male',
          age: 18 + (index % 10),
          isOnline: index % 3 === 0,
          isVerified: index % 4 === 0,
          tags: ['专业陪练', '耐心指导'].slice(0, (index % 2) + 1),
        },
        skillInfo: {
          skillType,
          skillLabel: skillType,
          level: ['最强王者', '荣耀王者', '星耀', '钻石'][index % 4],
          region: ['微信区', 'QQ区', '安卓QQ', '苹果QQ'][index % 4],
        },
        price: {
          amount: 20 + (index % 30),
          unit: '金币/局',
          displayText: `${20 + (index % 30)}金币/局`,
        },
        stats: {
          orders: 100 + (index * 10),
          rating: 4.5 + (Math.random() * 0.5),
          reviewCount: 50 + index,
        },
        tags: ['秒接单', '好评如潮'].slice(0, (index % 2) + 1),
        description: `专业${skillType}陪玩，技术过硬，服务态度好！`,
      };
    });

    return {
      skillType,
      tabs: [
        { type: 'glory_king', label: '荣耀王者', count: 120 },
        { type: 'online', label: '线上', count: 200 },
        { type: 'offline', label: '线下', count: 50 },
        { type: 'my', label: '我的', count: 5 },
      ],
      filters: {
        sortOptions: [
          { value: 'smart', label: '智能推荐' },
          { value: 'price_asc', label: '价格从低到高' },
          { value: 'price_desc', label: '价格从高到低' },
          { value: 'rating_desc', label: '评分最高' },
          { value: 'orders_desc', label: '接单最多' },
        ],
        genderOptions: [
          { value: 'all', label: '不限' },
          { value: 'male', label: '男' },
          { value: 'female', label: '女' },
        ],
        levelOptions: [
          { value: 'glory_king', label: '荣耀王者' },
          { value: 'star', label: '星耀' },
          { value: 'diamond', label: '钻石' },
        ],
        regionOptions: [
          { value: 'wechat', label: '微信区' },
          { value: 'qq', label: 'QQ区' },
        ],
      },
      list,
      total: 100,
      hasMore: pageNum * pageSize < 100,
    };
  }

  /**
   * 生成Mock服务详情
   */
  private generateMockServiceDetail(serviceId: number): ServiceDetailResponse {
    return {
      serviceId,
      provider: {
        userId: 10000 + serviceId,
        nickname: `王者荣耀陪玩${serviceId}号`,
        avatar: `https://picsum.photos/100/100?random=detail${serviceId}`,
        gender: serviceId % 2 === 0 ? 'female' : 'male',
        age: 22,
        isOnline: true,
        isVerified: true,
        tags: ['专业陪练', '耐心指导', '技术过硬'],
      },
      skillInfo: {
        skillType: '王者荣耀',
        skillLabel: '王者荣耀',
        level: '最强王者',
        region: '微信区',
      },
      price: {
        amount: 30,
        unit: '金币/局',
        displayText: '30金币/局',
        originalPrice: 40,
        discountRate: 0.75,
      },
      stats: {
        orders: 1520,
        rating: 4.9,
        reviewCount: 328,
      },
      reviews: {
        total: 328,
        summary: {
          averageRating: 4.9,
          totalCount: 328,
          ratingDistribution: { '5': 280, '4': 40, '3': 5, '2': 2, '1': 1 },
        },
        tags: [
          { tag: '技术好', count: 120 },
          { tag: '态度好', count: 95 },
          { tag: '秒接单', count: 80 },
        ],
        recent: [
          {
            reviewId: 1,
            userId: 20001,
            nickname: '快乐玩家',
            avatar: 'https://picsum.photos/50/50?random=r1',
            rating: 5,
            content: '技术真的很好，带我上分很快！',
            createTime: '2025-11-28T10:00:00',
          },
          {
            reviewId: 2,
            userId: 20002,
            nickname: '游戏小白',
            avatar: 'https://picsum.photos/50/50?random=r2',
            rating: 5,
            content: '很有耐心，讲解细致',
            createTime: '2025-11-27T15:30:00',
          },
        ],
      },
      description: '专业王者荣耀陪玩，最强王者段位，可带上分、教学、娱乐。态度好，技术强，欢迎下单体验！',
      images: [
        'https://picsum.photos/300/200?random=s1',
        'https://picsum.photos/300/200?random=s2',
      ],
      workingHours: '每天 10:00 - 24:00',
      canBook: true,
    };
  }

  /**
   * 生成Mock服务评价列表
   */
  private generateMockServiceReviews(pageNum: number, pageSize: number): ServiceReviewsResponse {
    const startIndex = (pageNum - 1) * pageSize;
    const list: ServiceReviewItem[] = Array.from({ length: pageSize }, (_, i) => {
      const index = startIndex + i;
      return {
        reviewId: 1000 + index,
        userId: 20000 + index,
        nickname: `玩家${100 + index}`,
        avatar: `https://picsum.photos/50/50?random=review${index}`,
        rating: 4 + (index % 2),
        content: ['技术很好，下次还来！', '服务态度好，推荐！', '很有耐心，带我上分了', '性价比高，满意'][index % 4],
        images: index % 3 === 0 ? [`https://picsum.photos/100/100?random=ri${index}`] : undefined,
        createTime: new Date(Date.now() - index * 3600000).toISOString(),
      };
    });

    return {
      list,
      total: 100,
      hasNext: pageNum * pageSize < 100,
    };
  }

  // ==================== Mock数据生成 ====================

  /**
   * 生成Mock首页用户推荐数据
   */
  private generateMockHomeFeed(type: HomeFeedType, pageNum: number, pageSize: number): HomeFeedResponse {
    const startIndex = (pageNum - 1) * pageSize;
    const list: BffUserCard[] = Array.from({ length: pageSize }, (_, i) => {
      const index = startIndex + i;
      const isOnline = type === 'online';

      return {
        userId: `user_${type}_${index}`,
        nickname: `${isOnline ? '游戏达人' : '生活玩家'}${100 + index}`,
        avatar: `https://picsum.photos/100/100?random=bff${type}${index}`,
        gender: index % 2 === 0 ? 2 : 1,
        age: 18 + (index % 12),
        onlineStatus: index % 3 === 0 ? 1 : 0,
        isRealVerified: index % 3 === 0,
        isGodVerified: index % 5 === 0,
        isVip: index % 4 === 0,
        signature: isOnline
          ? ['王者荣耀大神', '英雄联盟陪玩', '和平精英高手', '游戏陪练专业户'][index % 4]
          : ['台球陪练', '探店达人', 'KTV麦霸', '私影推荐官'][index % 4],
        serviceTags: isOnline
          ? ['王者荣耀', '英雄联盟', '和平精英'].slice(0, (index % 3) + 1)
          : ['台球', '探店', 'KTV', '私影'].slice(0, (index % 4) + 1),
        price: isOnline ? 30 + (index % 50) : 100 + (index % 200),
        rating: 4.0 + (Math.random() * 1),
        orderCount: Math.floor(Math.random() * 500),
        cityName: ['深圳', '广州', '北京', '上海'][index % 4],
        distance: type === 'offline' ? Math.floor(Math.random() * 5000) : undefined,
      };
    });

    return {
      list,
      total: 100,
      hasMore: pageNum * pageSize < 100,
    };
  }

  /**
   * 生成Mock筛选配置
   */
  private generateMockFilterConfig(type: HomeFeedType): FilterConfigResponse {
    const baseFilters: FilterConfigItem[] = [
      {
        key: 'gender',
        label: '性别',
        type: 'single',
        options: [
          { value: '0', label: '不限' },
          { value: '1', label: '男' },
          { value: '2', label: '女' },
        ],
      },
      {
        key: 'age',
        label: '年龄',
        type: 'range',
        range: { min: 18, max: 50, step: 1 },
      },
      {
        key: 'onlineStatus',
        label: '在线状态',
        type: 'single',
        options: [
          { value: '0', label: '不限' },
          { value: '1', label: '在线' },
          { value: '2', label: '忙碌' },
        ],
      },
    ];

    const onlineFilters: FilterConfigItem[] = [
      ...baseFilters,
      {
        key: 'gameType',
        label: '游戏类型',
        type: 'multiple',
        options: [
          { value: 'honor_of_kings', label: '王者荣耀' },
          { value: 'lol', label: '英雄联盟' },
          { value: 'peace_elite', label: '和平精英' },
          { value: 'brawl_stars', label: '荒野乱斗' },
        ],
      },
      {
        key: 'price',
        label: '价格区间',
        type: 'range',
        range: { min: 0, max: 200, step: 10 },
      },
    ];

    const offlineFilters: FilterConfigItem[] = [
      ...baseFilters,
      {
        key: 'serviceType',
        label: '服务类型',
        type: 'multiple',
        options: [
          { value: 'billiards', label: '台球' },
          { value: 'explore_shop', label: '探店' },
          { value: 'ktv', label: 'KTV' },
          { value: 'private_cinema', label: '私影' },
          { value: 'drinking', label: '喝酒' },
        ],
      },
      {
        key: 'distance',
        label: '距离',
        type: 'single',
        options: [
          { value: '0', label: '不限' },
          { value: '1000', label: '1km以内' },
          { value: '3000', label: '3km以内' },
          { value: '5000', label: '5km以内' },
          { value: '10000', label: '10km以内' },
        ],
      },
    ];

    return {
      filters: type === 'online' ? onlineFilters : offlineFilters,
    };
  }

  /**
   * 生成Mock限时专享列表数据
   */
  private generateMockLimitedTimeList(
    pageNum: number,
    pageSize: number,
    sortBy: LimitedTimeSortBy,
    gender: LimitedTimeGender,
    language?: string
  ): LimitedTimeResponse {
    const nicknames = [
      '甜美小姐姐', '阳光男孩', '温柔学姐', '活力少年',
      '知性女神', '幽默大叔', '可爱萝莉', '成熟型男',
    ];
    const languages = ['普通话', '粤语', '英语', '日语'];
    const gameSkills: Array<{ gameName: string; gameRank: string; skillName: string }> = [
      { gameName: '王者荣耀', gameRank: '王者', skillName: '王者荣耀陪玩' },
      { gameName: '英雄联盟', gameRank: '钻石', skillName: '英雄联盟陪玩' },
      { gameName: '和平精英', gameRank: '大师', skillName: '和平精英陪玩' },
      { gameName: '原神', gameRank: '满命', skillName: '原神陪玩' },
      { gameName: '永劫无间', gameRank: '王者', skillName: '永劫无间陪玩' },
      { gameName: 'CSGO', gameRank: '全球精英', skillName: 'CSGO陪玩' },
    ];
    const discounts = ['8折', '7折', '85折', '9折'];
    const tags = [
      ['王者荣耀', '陪玩'],
      ['英雄联盟', '上分'],
      ['和平精英', '游戏'],
      ['原神', '代打'],
    ];

    // 生成基础列表
    let list: LimitedTimeUserCard[] = Array.from({ length: 20 }, (_, i) => {
      const index = i;
      const userGender: 'male' | 'female' = index % 2 === 0 ? 'female' : 'male';
      const basePrice = 50 + (index * 10);
      const distance = 500 + (index * 300);
      const discountStr = discounts[index % discounts.length];
      const gameSkill = gameSkills[index % gameSkills.length];

      return {
        userId: 1000 + index,
        nickname: nicknames[index % nicknames.length],
        avatar: `https://picsum.photos/100/100?random=limited${index}`,
        gender: userGender,
        age: 20 + (index % 10),
        tags: tags[index % tags.length],
        promotionTag: `限时${discountStr}`,
        distance,
        distanceText: distance < 1000 ? `${distance}m` : `${(distance / 1000).toFixed(1)}km`,
        price: {
          amount: basePrice,
          unit: '金币/小时',
          displayText: `${basePrice}金币/小时`,
          originalPrice: Math.floor(basePrice * 1.5),
          discount: discountStr,
        },
        languageTag: languages[index % languages.length],
        rating: 4.0 + (Math.random() * 1),
        orderCount: Math.floor(Math.random() * 200) + 10,
        isOnline: index % 3 === 0,
        isVerified: index % 2 === 0,
        skill: {
          skillId: 5000 + index,
          skillName: gameSkill.skillName,
          gameName: gameSkill.gameName,
          gameRank: gameSkill.gameRank,
          description: `专业${gameSkill.gameName}陪玩，段位${gameSkill.gameRank}，有丰富的游戏经验`,
        },
      };
    });

    // 性别筛选
    if (gender !== 'all') {
      list = list.filter(user => user.gender === gender);
    }

    // 语言筛选
    if (language) {
      list = list.filter(user => user.languageTag === language);
    }

    // 排序
    switch (sortBy) {
      case 'price_asc':
        list.sort((a, b) => a.price.amount - b.price.amount);
        break;
      case 'price_desc':
        list.sort((a, b) => b.price.amount - a.price.amount);
        break;
      case 'distance_asc':
        list.sort((a, b) => a.distance - b.distance);
        break;
      default:
        // smart: 默认排序
        break;
    }

    // 分页
    const startIndex = (pageNum - 1) * pageSize;
    const pagedList = list.slice(startIndex, startIndex + pageSize);

    return {
      list: pagedList,
      total: list.length,
      hasMore: startIndex + pageSize < list.length,
      filters: {
        sortOptions: [
          { value: 'smart', label: '智能推荐', selected: sortBy === 'smart' },
          { value: 'price_asc', label: '价格从低到高', selected: sortBy === 'price_asc' },
          { value: 'price_desc', label: '价格从高到低', selected: sortBy === 'price_desc' },
          { value: 'distance_asc', label: '距离最近', selected: sortBy === 'distance_asc' },
        ],
        genderOptions: [
          { value: 'all', label: '不限', selected: gender === 'all' },
          { value: 'male', label: '男', selected: gender === 'male' },
          { value: 'female', label: '女', selected: gender === 'female' },
        ],
        languageOptions: [
          { value: '', label: '不限', selected: !language },
          { value: '普通话', label: '普通话', selected: language === '普通话' },
          { value: '粤语', label: '粤语', selected: language === '粤语' },
          { value: '英语', label: '英语', selected: language === '英语' },
        ],
      },
    };
  }

  // ==================== 搜索Mock数据生成 ====================

  /**
   * 生成Mock搜索初始数据
   */
  private generateMockSearchInit(): SearchInitResponse {
    return {
      searchHistory: [
        { keyword: '王者荣耀', searchTime: '2025-11-27 10:00:00' },
        { keyword: '探店', searchTime: '2025-11-26 15:30:00' },
        { keyword: 'K歌', searchTime: '2025-11-25 20:00:00' },
        { keyword: '台球', searchTime: '2025-11-24 18:00:00' },
        { keyword: '游戏陪玩', searchTime: '2025-11-23 14:00:00' },
      ],
      hotKeywords: [
        { keyword: '王者荣耀', rank: 1, isHot: true },
        { keyword: '英雄联盟', rank: 2, isHot: true },
        { keyword: '探店', rank: 3, isHot: false },
        { keyword: '台球', rank: 4, isHot: false },
        { keyword: 'KTV', rank: 5, isHot: false },
        { keyword: '私影', rank: 6, isHot: false },
      ],
      placeholder: '搜索更多',
    };
  }

  /**
   * 生成Mock搜索建议
   */
  private generateMockSearchSuggestions(keyword: string, limit: number): SearchSuggestResponse {
    const suggestions: SearchSuggestion[] = [
      { text: `${keyword}陪玩`, type: 'keyword', icon: '🔍' },
      { text: `${keyword}大神`, type: 'user', icon: '👤', extra: '10+ 用户' },
      { text: `#${keyword}攻略`, type: 'topic', icon: '#', extra: '1000+ 动态' },
      { text: `${keyword}排位`, type: 'keyword', icon: '🔍' },
      { text: `${keyword}技巧`, type: 'keyword', icon: '🔍' },
    ];

    return { suggestions: suggestions.slice(0, limit) };
  }

  /**
   * 生成空的搜索响应
   */
  private generateEmptySearchResponse(keyword: string): SearchResponse {
    return {
      keyword,
      total: 0,
      hasMore: false,
      tabs: [
        { type: 'all', label: '全部', count: 0 },
        { type: 'users', label: '用户', count: 0 },
        { type: 'orders', label: '下单', count: 0 },
        { type: 'topics', label: '话题', count: 0 },
      ],
      results: [],
    };
  }

  /**
   * 生成Mock综合搜索响应
   */
  private generateMockSearchResponse(keyword: string, type: SearchType, pageNum: number, pageSize: number): SearchResponse {
    return {
      keyword,
      total: 45,
      hasMore: pageNum * pageSize < 45,
      tabs: [
        { type: 'all', label: '全部', count: 45 },
        { type: 'users', label: '用户', count: 15 },
        { type: 'orders', label: '下单', count: 20 },
        { type: 'topics', label: '话题', count: 10 },
      ],
      results: this.generateMockSearchAll(keyword, pageNum, pageSize).list,
    };
  }

  /**
   * 生成Mock全部Tab结果
   */
  private generateMockSearchAll(keyword: string, pageNum: number, pageSize: number): SearchTabResponse<SearchAllItem> {
    const startIndex = (pageNum - 1) * pageSize;
    const list: SearchAllItem[] = Array.from({ length: Math.min(pageSize, 15 - startIndex) }, (_, i) => {
      const index = startIndex + i;
      const itemType = index % 3 === 0 ? 'user' : (index % 3 === 1 ? 'post' : 'video');

      return {
        itemType: itemType as 'post' | 'video' | 'user',
        itemId: 1000 + index,
        post: itemType !== 'user' ? {
          postId: 1000 + index,
          title: `${keyword}相关的精彩内容${index + 1}`,
          description: `这是一条关于${keyword}的动态，内容非常精彩...`,
          thumbnail: `https://picsum.photos/200/200?random=search${index}`,
          mediaType: itemType === 'video' ? 'video' : 'image',
          author: {
            userId: 2000 + index,
            avatar: `https://picsum.photos/50/50?random=author${index}`,
            nickname: `用户${100 + index}`,
          },
          stats: { likes: Math.floor(Math.random() * 1000), comments: Math.floor(Math.random() * 100) },
        } : undefined,
        user: itemType === 'user' ? {
          userId: 2000 + index,
          avatar: `https://picsum.photos/50/50?random=user${index}`,
          nickname: `${keyword}达人${index + 1}`,
          signature: `专业${keyword}服务`,
        } : undefined,
      };
    });

    return { list, total: 15, hasMore: startIndex + pageSize < 15 };
  }

  /**
   * 生成Mock用户Tab结果
   */
  private generateMockSearchUsers(keyword: string, pageNum: number, pageSize: number): SearchTabResponse<SearchUserItem> {
    const startIndex = (pageNum - 1) * pageSize;
    const list: SearchUserItem[] = Array.from({ length: Math.min(pageSize, 15 - startIndex) }, (_, i) => {
      const index = startIndex + i;
      return {
        userId: 3000 + index,
        avatar: `https://picsum.photos/100/100?random=searchuser${index}`,
        nickname: `${keyword}玩家${index + 1}`,
        age: 20 + (index % 10),
        gender: index % 2 === 0 ? 'female' : 'male',
        bio: `热爱${keyword}，期待与你相遇`,
        tags: ['王者荣耀', '英雄联盟'].slice(0, (index % 2) + 1),
        isVerified: index % 3 === 0,
        isOnline: index % 4 === 0,
        relationStatus: ['none', 'following', 'follower', 'mutual'][index % 4] as any,
      };
    });

    return { list, total: 15, hasMore: startIndex + pageSize < 15 };
  }

  /**
   * 生成Mock下单Tab结果
   */
  private generateMockSearchOrders(keyword: string, pageNum: number, pageSize: number): SearchTabResponse<SearchOrderItem> {
    const startIndex = (pageNum - 1) * pageSize;
    const list: SearchOrderItem[] = Array.from({ length: Math.min(pageSize, 20 - startIndex) }, (_, i) => {
      const index = startIndex + i;
      const distance = 500 + (index * 200);
      const price = 30 + (index * 5);

      return {
        userId: 4000 + index,
        avatar: `https://picsum.photos/100/100?random=searchorder${index}`,
        nickname: `${keyword}达人${index + 1}`,
        gender: index % 2 === 0 ? 'female' : 'male',
        distance,
        distanceText: distance < 1000 ? `${distance}m` : `${(distance / 1000).toFixed(1)}km`,
        tags: [
          { name: '王者荣耀', type: 'game' },
          { name: '王者', type: 'rank' },
        ],
        price: { amount: price, unit: '金币/小时', displayText: `${price}金币/小时` },
        rating: 4.5 + (Math.random() * 0.5),
        orderCount: 100 + (index * 10),
        isOnline: index % 3 === 0,
        skills: [
          {
            skillId: 5000 + index,
            skillName: `${keyword}陪玩`,
            description: `专业${keyword}服务，经验丰富`,
          },
        ],
      };
    });

    return { list, total: 20, hasMore: startIndex + pageSize < 20 };
  }

  /**
   * 生成Mock话题Tab结果
   */
  private generateMockSearchTopics(keyword: string, pageNum: number, pageSize: number): SearchTabResponse<SearchTopicItem> {
    const startIndex = (pageNum - 1) * pageSize;
    const list: SearchTopicItem[] = Array.from({ length: Math.min(pageSize, 10 - startIndex) }, (_, i) => {
      const index = startIndex + i;
      return {
        topicId: 5000 + index,
        topicName: `${keyword}${['攻略', '技巧', '日常', '精彩时刻', '搞笑集锦'][index % 5]}`,
        icon: ['🎮', '🏀', '🎵', '📸', '🎬'][index % 5],
        description: `分享${keyword}的精彩内容，与大家一起交流`,
        isHot: index < 3,
        hotLabel: index < 3 ? '热门' : undefined,
        stats: {
          posts: Math.floor(Math.random() * 10000) + 100,
          views: Math.floor(Math.random() * 100000) + 1000,
          participants: Math.floor(Math.random() * 5000) + 500,
        },
        coverImage: `https://picsum.photos/200/200?random=topic${index}`,
      };
    });

    return { list, total: 10, hasMore: startIndex + pageSize < 10 };
  }

  // ==================== 活动Mock数据生成 ====================

  /**
   * 生成Mock活动列表
   */
  private generateMockActivityList(
    pageNum: number,
    pageSize: number,
    sortBy: ActivitySortBy,
    gender: ActivityGender,
    memberCount?: string,
    activityType?: string
  ): ActivityListResponse {
    const activityTypes: ActivityType[] = [
      { value: 'billiards', label: '台球', icon: '🎱' },
      { value: 'ktv', label: 'KTV', icon: '🎤' },
      { value: 'dinner', label: '约饭', icon: '🍽️' },
      { value: 'movie', label: '电影', icon: '🎬' },
      { value: 'sports', label: '运动', icon: '⚽' },
    ];

    const nicknames = ['活力小王子', '甜美公主', '阳光达人', '开心果', '活动达人'];
    const addresses = ['万象城3楼', '海岸城B1', 'coco park', '欢乐海岸', '深圳湾体育中心'];

    // 生成基础列表
    let list: ActivityListItem[] = Array.from({ length: 20 }, (_, i) => {
      const index = i;
      const type = activityTypes[index % activityTypes.length];
      const isPaid = index % 3 === 0;
      const maxMembers = [4, 6, 8, 10][index % 4];
      const currentMembers = Math.min(Math.floor(Math.random() * maxMembers) + 1, maxMembers);
      const distance = 500 + (index * 300);

      return {
        activityId: 10000 + index,
        organizer: {
          userId: 2000 + index,
          avatar: `https://picsum.photos/100/100?random=organizer${index}`,
          nickname: nicknames[index % nicknames.length],
          gender: index % 2 === 0 ? 'female' : 'male' as const,
          isVerified: index % 3 === 0,
          tags: index % 2 === 0 ? ['活跃组织者', '好评如潮'] : undefined,
        },
        title: `周末${type.label}局`,
        description: `一起来${type.label}吧，欢迎新手老手！`,
        activityType: type,
        tags: [
          { text: isPaid ? '付费' : '免费', type: 'fee', color: isPaid ? '#f59e0b' : '#22c55e' },
          { text: `${maxMembers}人局`, type: 'members', color: '#7c3aed' },
        ],
        price: {
          isPaid,
          amount: isPaid ? 50 + (index * 10) : 0,
          unit: '元/人',
          displayText: isPaid ? `${50 + (index * 10)}元/人` : '免费',
        },
        schedule: {
          startTime: `2025-11-${28 + (index % 3)}T${14 + (index % 6)}:00:00`,
          endTime: `2025-11-${28 + (index % 3)}T${17 + (index % 6)}:00:00`,
          displayText: `11月${28 + (index % 3)}日 ${14 + (index % 6)}:00`,
        },
        location: {
          name: addresses[index % addresses.length],
          address: `深圳市南山区${addresses[index % addresses.length]}`,
          district: '南山区',
          city: '深圳',
          distance,
          distanceText: distance < 1000 ? `${distance}m` : `${(distance / 1000).toFixed(1)}km`,
        },
        participants: {
          current: currentMembers,
          max: maxMembers,
          displayText: `${currentMembers}/${maxMembers}人`,
          avatars: Array.from({ length: Math.min(currentMembers, 3) }, (_, j) =>
            `https://picsum.photos/50/50?random=participant${index}_${j}`
          ),
        },
        status: currentMembers >= maxMembers ? 'full' : 'recruiting',
        createdAt: `2025-11-${25 + (index % 5)}T10:00:00`,
      };
    });

    // 性别筛选（简单模拟：奇数偏向男性，偶数偏向女性）
    if (gender === 'male') {
      list = list.filter((_, i) => i % 2 === 1);
    } else if (gender === 'female') {
      list = list.filter((_, i) => i % 2 === 0);
    }

    // 活动类型筛选
    if (activityType) {
      list = list.filter(item => item.activityType.value === activityType);
    }

    // 人数筛选
    if (memberCount) {
      if (memberCount === '10+') {
        list = list.filter(item => item.participants.max >= 10);
      } else {
        const [min, max] = memberCount.split('-').map(Number);
        list = list.filter(item => {
          const limit = item.participants.max;
          return limit >= min && limit <= max;
        });
      }
    }

    // 排序
    switch (sortBy) {
      case 'latest':
        list.sort((a, b) => b.activityId - a.activityId);
        break;
      case 'distance_asc':
        list.sort((a, b) => (a.location.distance || 0) - (b.location.distance || 0));
        break;
      default:
        // smart_recommend: 默认顺序
        break;
    }

    // 分页
    const startIndex = (pageNum - 1) * pageSize;
    const pagedList = list.slice(startIndex, startIndex + pageSize);

    return {
      list: pagedList,
      total: list.length,
      hasMore: startIndex + pageSize < list.length,
      filters: {
        sortOptions: [
          { value: 'smart_recommend', label: '智能推荐', selected: sortBy === 'smart_recommend' },
          { value: 'latest', label: '最新发布', selected: sortBy === 'latest' },
          { value: 'distance_asc', label: '距离最近', selected: sortBy === 'distance_asc' },
        ],
        genderOptions: [
          { value: 'all', label: '不限', selected: gender === 'all' },
          { value: 'male', label: '男', selected: gender === 'male' },
          { value: 'female', label: '女', selected: gender === 'female' },
        ],
        memberOptions: [
          { value: 'all', label: '不限', selected: !memberCount || memberCount === 'all' },
          { value: '2-4', label: '2-4人', selected: memberCount === '2-4' },
          { value: '5-10', label: '5-10人', selected: memberCount === '5-10' },
          { value: '10+', label: '10人以上', selected: memberCount === '10+' },
        ],
        activityTypes: activityTypes.map(t => ({
          value: t.value,
          label: t.label,
          icon: t.icon,
          selected: activityType === t.value,
        })),
      },
    };
  }

  /**
   * 生成Mock活动详情
   */
  private generateMockActivityDetail(activityId: number): ActivityDetail {
    const index = activityId % 100;
    const isPaid = index % 3 === 0;
    const maxMembers = [4, 6, 8, 10][index % 4];
    const currentMembers = Math.min(Math.floor(Math.random() * maxMembers) + 1, maxMembers - 1);

    return {
      activityId,
      status: 'recruiting',
      statusText: '招募中',
      organizer: {
        userId: 2000 + index,
        avatar: `https://picsum.photos/100/100?random=organizer${index}`,
        nickname: '活动组织者',
        gender: index % 2 === 0 ? 'female' : 'male',
        age: 25 + (index % 10),
        isVerified: true,
        tags: ['活跃组织者', '好评如潮'],
        bio: '热爱台球，每周必打',
      },
      activityType: 'billiards',
      activityTypeName: '台球',
      activityTypeIcon: '🎱',
      title: `周末台球局 #${activityId}`,
      description: '周末一起来打台球吧！欢迎新手，老手可以带带我们。场地已预定，费用AA，希望大家准时到达。',
      images: [
        `https://picsum.photos/400/300?random=activity${activityId}_1`,
        `https://picsum.photos/400/300?random=activity${activityId}_2`,
      ],
      bannerImage: `https://picsum.photos/800/400?random=banner${activityId}`,
      tags: ['周末活动', '新手友好', '提供饮料'],
      // 时间信息（扁平化）
      startTime: '2025-11-30T14:00:00',
      endTime: '2025-11-30T17:00:00',
      timeDisplay: '11月30日 周六 14:00-17:00',
      // 地点信息（扁平化）
      locationName: '星际台球俱乐部',
      locationAddress: '深圳市南山区科技园南路88号',
      city: '深圳',
      district: '南山区',
      latitude: 22.5431,
      longitude: 114.0579,
      // 费用信息（扁平化）
      isPaid,
      fee: isPaid ? 50 + (index * 10) : undefined,
      feeDisplay: isPaid ? `${50 + (index * 10)}元/人` : '免费',
      feeDescription: isPaid ? '包含场地费和饮料' : undefined,
      // 人数信息（扁平化）
      currentMembers,
      maxMembers,
      membersDisplay: `${currentMembers}/${maxMembers}人`,
      pendingCount: 2,
      // 参与者列表
      participants: Array.from({ length: currentMembers }, (_, i) => ({
        userId: 3000 + i,
        avatar: `https://picsum.photos/50/50?random=participant${i}`,
        nickname: `参与者${i + 1}`,
        gender: i % 2 === 0 ? 'female' : 'male' as const,
        status: 'confirmed' as const,
        statusText: '已确认',
        joinTime: '2025-11-28 10:00:00',
      })),
      // 报名截止
      registrationDeadline: '2025-11-30T12:00:00',
      registrationDeadlineDisplay: '报名截止: 11月30日 12:00',
      // 用户状态（扁平化）
      isOrganizer: false,
      currentUserStatus: 'none',
      canRegister: true,
      cannotRegisterReason: undefined,
      canCancel: false,
      // 统计信息
      viewCount: 128,
      shareCount: 15,
      createdAt: '2025-11-28T10:00:00',
    };
  }
}

// 导出单例实例
export const bffApi = new BffAPI();

// 默认导出
export default bffApi;
