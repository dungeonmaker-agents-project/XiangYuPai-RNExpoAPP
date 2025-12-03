// #region 1. File Banner & TOC
/**
 * OtherUserProfilePage - Types
 *
 * 对方用户主页的类型定义
 * 对应UI文档: 对方主页_结构文档.md
 * 对应后端API: OtherUserProfileController
 *
 * TOC:
 * [1] File Banner & TOC
 * [2] Component Props Types
 * [3] State Types
 * [4] Tab Types
 * [5] User Header Data Types (L1)
 * [6] Profile Info Data Types (L1)
 * [7] Skills List Data Types (L1)
 * [8] Moments List Data Types (L1)
 * [9] Action Types
 * [10] Legacy Types (backward compatibility)
 * [11] Export All
 */
// #endregion

// #region 2. Component Props Types

/**
 * 主页面组件 Props
 */
export interface OtherUserProfilePageProps {
  /** 用户ID */
  userId: string;
}

// #endregion

// #region 3. State Types

/**
 * 页面状态
 */
export interface OtherUserProfileState {
  /** 当前激活的Tab */
  activeTab: TabType;
  /** 是否正在加载 */
  loading: boolean;
  /** 是否正在刷新 */
  refreshing: boolean;
  /** 错误信息 */
  error: string | null;
  /** 是否已关注 */
  isFollowing: boolean;
  /** 操作加载中 */
  actionLoading: boolean;
}

// #endregion

// #region 4. Tab Types

/**
 * Tab类型 (动态/资料/技能)
 * 对应UI文档: TabData.currentTab
 */
export type TabType = 'dynamics' | 'profile' | 'skills';

/**
 * Tab配置项
 * 对应UI文档: ItemModel.TabItem
 */
export interface TabItem {
  key: TabType;
  label: string;
  isActive?: boolean;
}

// #endregion

// #region 5. User Header Data Types (L1)

/**
 * 等级信息
 * 对应后端: OtherUserProfileVo.LevelInfo
 */
export interface LevelInfo {
  value: number;
  name: string;
  icon: string;
  color?: string;
}

/**
 * 统计信息
 * 对应后端: OtherUserProfileVo.StatsInfo
 */
export interface StatsInfo {
  followerCount: number;
  followingCount: number;
  likesCount: number;
  skillsCount: number;
}

/**
 * 用户头部区域数据
 * 对应UI文档: PageModel.UserHeaderData
 * 对应后端: OtherUserProfileVO
 */
export interface UserHeaderData {
  userId: number;
  avatar: string;
  coverUrl: string | null;
  nickname: string;
  gender: 'male' | 'female' | 'other' | null;
  age: number | null;
  bio: string | null;
  level: LevelInfo;
  isVerified: boolean;      // 实名认证
  isExpert: boolean;        // 大神认证
  isVip: boolean;           // VIP
  isOnline: boolean;        // 在线状态
  isAvailable: boolean;     // 可预约
  distance: string | null;  // 距离 (格式: X.Xkm)
  stats: StatsInfo;
  isFollowed: boolean;      // 是否已关注
  followStatus: 'none' | 'following' | 'mutual';
  canMessage: boolean;
  canUnlockWechat: boolean;
  wechatUnlocked: boolean;
  unlockPrice: number | null;
}

// #endregion

// #region 6. Profile Info Data Types (L1)

/**
 * 个人资料数据
 * 对应UI文档: PageModel.ProfileInfoData
 * 对应后端: ProfileInfoVO
 */
export interface ProfileInfoData {
  userId: number;
  residence: string | null;     // 常居地
  ipLocation: string | null;    // IP属地
  height: number | null;        // 身高 (cm)
  weight: number | null;        // 体重 (kg)
  occupation: string | null;    // 职业
  wechat: string | null;        // 微信号 (脱敏或解锁后显示)
  wechatUnlocked: boolean;      // 是否已解锁
  birthday: string | null;      // 生日 (MM-DD)
  zodiac: string | null;        // 星座
  age: number | null;           // 年龄
  bio: string | null;           // 个性签名
}

/**
 * 资料行项
 * 用于ProfileContentArea的grid布局
 */
export interface ProfileInfoRow {
  label: string;
  value: string | null;
  key: string;
}

// #endregion

// #region 7. Skills List Data Types (L1)

/**
 * 技能媒体数据
 * 对应后端: UserSkillVo.MediaData
 */
export interface SkillMediaData {
  coverUrl: string;
  images: string[];
}

/**
 * 技能信息
 * 对应后端: UserSkillVo.SkillInfo
 */
export interface SkillInfo {
  name: string;
  rank: string | null;
  tags: string[];
}

/**
 * 技能价格数据
 * 对应后端: UserSkillVo.PriceData
 */
export interface SkillPriceData {
  amount: number;
  unit: string;
  displayText: string;
}

/**
 * 技能统计数据
 */
export interface SkillStatsData {
  rating: number;
  reviewCount: number;
  orderCount: number;
}

/**
 * 技能项数据
 * 对应UI文档: ItemModel.SkillItem
 * 对应后端: UserSkillVo
 */
export interface SkillItem {
  id: number;
  mediaData: SkillMediaData;
  providerData: {
    userId: number;
    nickname: string;
    avatar: string;
    level?: LevelInfo;
    isVerified?: boolean;
    isExpert?: boolean;
    distance?: string;
  };
  skillInfo: SkillInfo;
  priceData: SkillPriceData;
  statsData?: SkillStatsData;
}

/**
 * 技能列表数据
 * 对应UI文档: PageModel.SkillsListData
 */
export interface SkillsListData {
  list: SkillItem[];
  total: number;
  hasMore: boolean;
}

// #endregion

// #region 8. Moments List Data Types (L1)

/**
 * 动态媒体数据
 * 对应UI文档: MomentItem.mediaData
 */
export interface MomentMediaData {
  coverUrl: string;
  aspectRatio: number;
  duration?: number;  // 视频时长(秒)
}

/**
 * 动态文本数据
 */
export interface MomentTextData {
  title: string;
}

/**
 * 动态作者数据
 */
export interface MomentAuthorData {
  userId: number;
  avatar: string;
  nickname: string;
}

/**
 * 动态统计数据
 */
export interface MomentStatsData {
  likeCount: number;
  isLiked: boolean;
}

/**
 * 动态项数据
 * 对应UI文档: ItemModel.MomentItem
 */
export interface MomentItem {
  id: string;
  type: 'image' | 'video';
  mediaData: MomentMediaData;
  textData: MomentTextData;
  authorData: MomentAuthorData;
  statsData: MomentStatsData;
}

/**
 * 动态列表数据
 * 对应UI文档: PageModel.MomentsListData
 */
export interface MomentsListData {
  list: MomentItem[];
  total: number;
  hasMore: boolean;
}

// #endregion

// #region 9. Action Types

/**
 * 解锁微信请求
 */
export interface UnlockWechatRequest {
  targetUserId: number;
  unlockType?: 'coins' | 'vip';
  paymentPassword?: string;
}

/**
 * 解锁微信结果
 * 对应后端: UnlockWechatResultVO
 */
export interface UnlockWechatResult {
  success: boolean;
  wechat: string | null;
  cost: number | null;
  remainingCoins: number | null;
  failReason: string | null;
}

/**
 * 通用操作结果
 * 对应UI文档: SharedModel.ActionResult
 */
export interface ActionResult {
  success: boolean;
  message?: string;
  newValue?: any;
}

// #endregion

// #region 10. Legacy Types (backward compatibility)

/**
 * 用户基本信息 (旧版兼容)
 * @deprecated 请使用 UserHeaderData
 */
export interface OtherUserInfo {
  id: string;
  nickname: string;
  avatar: string;
  backgroundImage?: string;
  bio?: string;
  gender?: number; // 0: 未知, 1: 男, 2: 女
  age?: number;
  location?: string;
  occupation?: string;

  // 认证状态
  isVip: boolean;
  isRealVerified: boolean;
  isGodVerified: boolean;
  isPopular: boolean;

  // 在线状态
  isOnline?: boolean;
  lastActiveTime?: string;

  // 统计数据
  followerCount: number;
  followingCount: number;
  likeCount: number;
  postCount: number;

  // 个人资料
  height?: number;
  weight?: number;
  skills?: string[];
  wechat?: string;
  wechatMasked?: string;
  wechatUnlockCondition?: number;
  wechatUnlockDesc?: string;
  canViewWechat?: boolean;
  phone?: string;

  // 其他
  createdAt: string;
  distance?: number;
}

/**
 * 动态内容项 (旧版兼容)
 * @deprecated 请使用 MomentItem
 */
export interface PostItem {
  id: string;
  userId: string;
  content: string;
  images?: string[];
  video?: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  isCollected: boolean;
  createdAt: string;
  location?: string;
  tags?: string[];
}

// #endregion

// #region 11. Export All

export type { };

// #endregion
