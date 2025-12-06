/**
 * ServiceDetailPage - 服务详情页类型定义
 *
 * 基于 详情页_结构文档.md STEP 1 数据模型
 * 支持线上(online)和线下(offline)两种服务类型
 */

// #region 页面参数与状态
/** 服务类型: 线上(游戏陪玩) / 线下(探店活动) */
export type ServiceType = 'online' | 'offline';

/** 页面路由参数 */
export interface ServiceDetailPageParams {
  serviceId: string;
  serviceType: ServiceType;
}

/** 页面状态 */
export interface PageState {
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  serviceType: ServiceType;
}
// #endregion

// #region 游戏资料卡片数据
/** 截图项 */
export interface ScreenshotItem {
  imageUrl: string;
  type: 'image' | 'video';
}

/** 游戏资料卡片数据 → GameCardArea */
export interface GameCardData {
  screenshots: ScreenshotItem[];
  currentIndex: number;
}
// #endregion

// #region 用户信息数据
/** 用户信息数据 → UserInfoArea */
export interface UserInfoData {
  userId: string;
  avatar: string;
  nickname: string;
  level: number;
  isOnline: boolean;
  price?: number;       // 仅线上
  priceUnit?: string;   // 仅线上，如"金币/局"
}
// #endregion

// #region 标签数据（线上）
/** 标签项 */
export interface TagItem {
  text: string;
}

/** 标签数据 → TagsArea [条件:type=online] */
export interface TagsData {
  certification?: string;  // 认证标签，如"大神"
  tags: TagItem[];
}
// #endregion

// #region 技能介绍数据（线上）
/** 技能介绍数据 → SkillIntroArea [条件:type=online] */
export interface SkillIntroData {
  title: string;
  description: string;
}
// #endregion

// #region 活动数据（线下）
/** 活动数据 → ActivityArea [条件:type=offline] */
export interface ActivityData {
  description: string;
  dateTime: string;      // 格式: M月D日HH:mm
  location: string;
  price: number;
  priceUnit: string;     // 固定值: "金币/小时"
}
// #endregion

// #region 评价数据
/** 评价项 */
export interface ReviewItem {
  reviewId: string;
  userId: string;
  avatar: string;
  nickname: string;
  rating: number;        // 1-5
  content: string;
  createTime: string;    // 格式: YYYY-MM-DD
}

/** 评价摘要数据 → ReviewArea */
export interface ReviewSummaryData {
  totalCount: number;
  goodRate: number;      // 好评率百分比
  highlightTags: string[];
}

/** 评价区域完整数据 */
export interface ReviewData extends ReviewSummaryData {
  reviews: ReviewItem[];
  hasMore: boolean;
}
// #endregion

// #region 操作数据
/** 操作数据 → ActionBarArea */
export interface ActionData {
  canMessage: boolean;
  canOrder: boolean;
}
// #endregion

// #region 页面级数据模型
/** 页面完整数据模型 [L1] */
export interface ServiceDetailData {
  serviceId: string;
  serviceType: ServiceType;
  gameCard: GameCardData;
  userInfo: UserInfoData;
  tags?: TagsData;           // 仅线上
  skillIntro?: SkillIntroData;  // 仅线上
  activity?: ActivityData;   // 仅线下
  reviewSummary: ReviewSummaryData;
  action: ActionData;
}
// #endregion

// #region 共享模型
/** 用户简要信息（评价列表复用） */
export interface UserBrief {
  userId: string;
  nickname: string;
  avatar: string;
}

/** 操作结果 */
export interface ActionResult {
  success: boolean;
  message?: string;
}
// #endregion

// #region API响应类型
/** 服务详情API响应 */
export interface ServiceDetailResponse {
  code: number;
  message: string;
  data: ServiceDetailData;
}

/** 评价列表API响应 */
export interface ServiceReviewsResponse {
  code: number;
  message: string;
  data: {
    list: ReviewItem[];
    hasMore: boolean;
    total: number;
  };
}
// #endregion

// #region 组件Props类型
/** 主页面Props */
export interface ServiceDetailPageProps {
  serviceId?: string;
  serviceType?: ServiceType;
}

/** 导航区域Props */
export interface NavAreaProps {
  title?: string;
  onBack: () => void;
}

/** 游戏卡片区域Props */
export interface GameCardAreaProps {
  data: GameCardData;
  onImagePress?: (index: number) => void;
  onIndexChange?: (index: number) => void;
}

/** 用户信息区域Props */
export interface UserInfoAreaProps {
  data: UserInfoData;
  serviceType: ServiceType;
  onAvatarPress?: () => void;
}

/** 标签区域Props */
export interface TagsAreaProps {
  data: TagsData;
}

/** 技能介绍区域Props */
export interface SkillIntroAreaProps {
  data: SkillIntroData;
}

/** 活动区域Props */
export interface ActivityAreaProps {
  data: ActivityData;
}

/** 评价区域Props */
export interface ReviewAreaProps {
  summary: ReviewSummaryData;
  reviews: ReviewItem[];
  hasMore: boolean;
  onViewAll?: () => void;
  onLoadMore?: () => void;
  onUserPress?: (userId: string) => void;
}

/** 底部操作栏Props */
export interface ActionBarAreaProps {
  data: ActionData;
  onMessage?: () => void;
  onOrder?: () => void;
}

/** 评价项Props */
export interface ReviewItemProps {
  data: ReviewItem;
  onUserPress?: (userId: string) => void;
}
// #endregion
