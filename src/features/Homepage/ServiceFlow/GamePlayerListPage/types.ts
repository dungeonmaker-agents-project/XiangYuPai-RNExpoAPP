/**
 * GamePlayerListPage 类型定义
 * 服务列表页 - 数据类型定义
 *
 * @description 定义页面所需的所有数据类型，包括玩家卡片、筛选状态、API响应等
 * @mapping 严格对应 xypai_user.sql v1.0.8 表结构
 * @author XyPai Team
 * @date 2025-12-05
 */

// ==================== 玩家卡片数据类型 ====================

/**
 * 玩家卡片数据
 * @description 用于列表展示的玩家卡片完整数据
 * @mapping skills + users 联合查询结果
 */
export interface PlayerCardData {
  /** 技能ID (skills.skill_id) */
  skillId: number;
  /** 技能描述 (skills.description) */
  description: string;
  /** 服务提供者信息 (users表) */
  provider: ProviderData;
  /** 技能信息 (skills表) */
  skillInfo: SkillInfo;
  /** 标签列表 (计算字段) */
  tags: TagData[];
  /** 价格信息 (skills表) */
  price: PriceData;
  /** 统计数据 (skills表) */
  stats: StatsData;
  /** 距离（米） */
  distance: number | null;
  /** 距离显示文本 */
  distanceDisplay: string | null;
}

/**
 * 服务提供者数据
 * @mapping users表
 */
export interface ProviderData {
  /** 用户ID (users.user_id) */
  userId: number;
  /** 昵称 (users.nickname) */
  nickname: string;
  /** 头像URL (users.avatar) */
  avatar: string;
  /** 性别 (users.gender) */
  gender: 'male' | 'female' | 'other';
  /** 年龄 (计算: YEAR(NOW())-YEAR(birthday)) */
  age: number;
  /** 是否在线 (users.is_online) */
  isOnline: boolean;
  /** 是否实名认证 (users.is_real_verified) */
  isVerified: boolean;
  /** 是否大神认证 (users.is_god_verified) */
  isExpert: boolean;
}

/**
 * 技能信息
 * @mapping skills表
 */
export interface SkillInfo {
  /** 技能类型/游戏名称 (skills.game_name) */
  skillType: string;
  /** 大区 (skills.server) */
  gameArea: string | null;
  /** 段位 (skills.game_rank) */
  rank: string | null;
  /** 巅峰分 (skills.peak_score) - 王者荣耀专用 */
  peakScore: number | null;
  /** 位置（扩展字段） */
  position: string | null;
}

/**
 * 标签数据
 */
export interface TagData {
  /** 标签文本 */
  text: string;
  /** 标签类型: verified/expert/rank等 */
  type: string;
  /** 标签颜色 */
  color: string;
}

/**
 * 价格数据
 * @mapping skills表
 */
export interface PriceData {
  /** 价格金额 (skills.price) */
  amount: number;
  /** 单位 (skills.price_unit): 局/小时 */
  unit: string;
  /** 显示文本 (计算字段) */
  displayText: string;
}

/**
 * 统计数据
 * @mapping skills表
 */
export interface StatsData {
  /** 订单数 (skills.order_count) */
  orders: number;
  /** 评分 (skills.rating) */
  rating: number;
  /** 评价数 (skills.review_count) */
  reviewCount: number;
}

// ==================== 筛选相关类型 ====================

/**
 * 排序类型
 */
export type SortType = 'smart' | 'newest' | 'recent' | 'popular';

/**
 * 性别筛选类型
 */
export type GenderType = 'all' | 'female' | 'male';

/**
 * 筛选状态
 */
export interface FilterState {
  /** 排序方式 */
  sortBy: SortType;
  /** 性别筛选 */
  gender: GenderType;
  /** 当前选中的快捷标签 */
  quickTag: string | null;
  /** 高级筛选条件 */
  advancedFilters: AdvancedFilters;
}

/**
 * 高级筛选条件
 */
export interface AdvancedFilters {
  /** 状态筛选: all/online */
  status: 'all' | 'online';
  /** 大区（单选） */
  gameArea: string | null;
  /** 段位（多选） */
  ranks: string[];
  /** 价格区间（单选） */
  priceRange: string | null;
  /** 位置（多选） */
  positions: string[];
  /** 标签（多选） */
  tags: string[];
  /** 所在地（单选） */
  location: string | null;
}

// ==================== 筛选选项类型 ====================

/**
 * 通用选项
 */
export interface FilterOption {
  /** 值 */
  value: string;
  /** 显示标签 */
  label: string;
}

/**
 * 价格区间选项
 */
export interface PriceRangeOption extends FilterOption {
  /** 最小价格 */
  min: number;
  /** 最大价格（可能为null表示无上限） */
  max: number | null;
}

/**
 * 快捷标签
 */
export interface QuickTag {
  /** 标签ID */
  id: string;
  /** 显示标签 */
  label: string;
  /** 关联的筛选条件 */
  filterKey?: string;
  /** 关联的筛选值 */
  filterValue?: string;
}

// ==================== API相关类型 ====================

/**
 * 列表查询参数
 */
export interface PlayerListQueryParams {
  /** 技能类型（必填） */
  skillType: string;
  /** 页码 */
  pageNum: number;
  /** 每页数量 */
  pageSize: number;
  /** 排序方式 */
  sortBy?: SortType;
  /** 筛选条件 */
  filters?: {
    gender?: GenderType;
    status?: string;
    gameArea?: string;
    rank?: string[];
    priceRange?: string[];
    position?: string[];
    tags?: string[];
  };
}

/**
 * 列表响应数据
 */
export interface PlayerListResponse {
  /** 技能类型信息 */
  skillType: {
    type: string;
    label: string;
    icon?: string;
  };
  /** Tab列表 */
  tabs: Array<{
    value: string;
    label: string;
    count: number;
  }>;
  /** 筛选配置 */
  filters: FilterConfig;
  /** 玩家列表 */
  list: PlayerCardData[];
  /** 总数 */
  total: number;
  /** 是否有更多 */
  hasMore: boolean;
}

/**
 * 筛选配置
 */
export interface FilterConfig {
  /** 排序选项 */
  sortOptions: FilterOption[];
  /** 性别选项 */
  genderOptions: FilterOption[];
  /** 状态选项 */
  statusOptions: FilterOption[];
  /** 游戏大区选项 */
  gameAreas: FilterOption[];
  /** 段位选项 */
  ranks: FilterOption[];
  /** 价格区间选项 */
  priceRanges: PriceRangeOption[];
  /** 位置选项 */
  positions: FilterOption[];
  /** 标签选项 */
  tags: FilterOption[];
}

// ==================== 页面状态类型 ====================

/**
 * 页面状态
 */
export interface PageState {
  /** 是否加载中 */
  isLoading: boolean;
  /** 是否刷新中 */
  isRefreshing: boolean;
  /** 是否加载更多中 */
  isLoadingMore: boolean;
  /** 错误信息 */
  error: string | null;
  /** 当前页码 */
  pageNum: number;
  /** 是否有更多数据 */
  hasMore: boolean;
}

/**
 * 弹窗状态
 */
export interface ModalState {
  /** 排序弹窗 */
  sortVisible: boolean;
  /** 性别弹窗 */
  genderVisible: boolean;
  /** 高级筛选弹窗 */
  filterSheetVisible: boolean;
}
