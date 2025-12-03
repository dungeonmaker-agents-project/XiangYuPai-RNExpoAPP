/**
 * Discovery模块 - 类型定义
 * 
 * 包含：
 * - 页面组Props和状态类型
 * - 动态实体类型
 * - 评论相关类型
 * - API交互类型
 * - 组件Props类型
 */

// ==================== 页面组级别类型 ====================

/**
 * Discovery页面组Props接口
 */
export interface DiscoveryProps {
  initialTab?: TabType;
  userId?: string;
}

/**
 * Discovery页面组状态类型
 */
export interface DiscoveryState {
  activeTab: TabType;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Tab类型
 * 注：BFF API 使用 'nearby'，前端UI显示为"同城"
 */
export type TabType = 'follow' | 'hot' | 'nearby';

// ==================== 动态实体类型 ====================

/**
 * 动态数据类型
 * 
 * 对应后端：ContentListVO (xypai-content模块)
 */
export interface Feed {
  id: string;
  userId: string;
  userInfo: UserInfo;
  
  // 内容信息
  type: number;              // 内容类型(1=动态,2=活动,3=技能)
  typeDesc: string;          // 类型描述
  title?: string;
  summary?: string;          // 摘要
  content: string;
  coverImage?: string;       // 封面图（v7.1新增）
  
  // 媒体列表
  mediaList: MediaItem[];
  topicList: Topic[];
  
  // 地理位置（v7.1新增 - 空间索引支持）
  locationName?: string;     // 地点名称
  locationAddress?: string;  // 详细地址
  longitude?: number;        // 经度
  latitude?: number;         // 纬度
  distance?: number;         // 距离(km) - 仅附近内容查询返回
  cityId?: number;           // 城市ID
  
  // 旧版位置信息（兼容）
  location?: LocationInfo;
  
  // 互动数据（来自ContentStats表 + Redis缓存）
  likeCount: number;
  commentCount: number;
  shareCount: number;
  collectCount: number;
  viewCount: number;
  
  // 用户互动状态
  isLiked: boolean;
  isCollected: boolean;
  
  // 时间戳
  createdAt: number;
  updatedAt: number;
}

/**
 * 用户信息类型
 * 
 * 对应后端：UserProfile冗余字段（Content表的user_nickname/user_avatar）
 */
export interface UserInfo {
  id: string;
  nickname: string;
  avatar: string;
  gender?: 'male' | 'female';
  age?: number;
  tags?: UserTag[];
  isFollowed: boolean;
  
  // v7.1新增：用户标识系统
  isRealVerified?: boolean;  // 实名认证
  isGodVerified?: boolean;   // 大神认证
  isVip?: boolean;           // VIP用户
  isPopular?: boolean;       // 人气用户
  onlineStatus?: number;     // 在线状态(0=离线,1=在线,2=忙碌,3=隐身)
}

/**
 * 用户标签类型
 */
export interface UserTag {
  type: 'gender_age' | 'certified' | 'popular' | 'custom';
  label: string;
  color: string;
}

/**
 * 媒体项类型
 */
export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
  duration?: number; // 视频时长(秒)
}

/**
 * 话题类型
 */
export interface Topic {
  name: string;
  description?: string;
  coverUrl?: string;
  participantCount: number;
  postCount: number;
  hotIndex: number;
  trendChange: number;
  createdAt: number;
}

/**
 * 位置信息类型
 */
export interface LocationInfo {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number; // 距离用户的距离(米)
}

// ==================== 评论相关类型 ====================

/**
 * 评论数据类型
 * 
 * 对应后端：CommentVO (xypai-content模块 - v7.1新增)
 */
export interface Comment {
  id: string;
  feedId: string;          // contentId
  userId: string;
  userInfo: UserInfo;
  
  // 评论内容
  content: string;         // commentText
  
  // 回复关系（支持一级评论 + 二级回复）
  parentId?: string;       // 一级评论ID（NULL=一级评论）
  replyTo?: string;        // replyToId - 直接回复的评论ID
  replyToUser?: UserInfo;  // 被回复用户信息
  replyToUserId?: string;
  replyToUserNickname?: string;
  
  // 统计数据
  likeCount: number;
  replyCount: number;      // 回复数量
  isTop: boolean;          // 是否置顶
  
  // 用户互动
  isLiked: boolean;        // liked
  
  // 二级回复列表（仅一级评论返回，最多3条）
  replies: Comment[];
  totalReplies?: number;   // 二级回复总数
  hasMoreReplies?: boolean; // 是否有更多回复
  
  // 时间
  createdAt: number;
}

/**
 * 评论排序类型
 */
export type CommentSortType = 'time' | 'hot' | 'like';

// ==================== API交互类型 ====================

/**
 * API响应基础类型
 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

/**
 * 分页查询参数
 */
export interface PageQuery {
  page: number;
  pageSize: number;
}

/**
 * 动态列表响应
 */
export interface FeedListResponse {
  list: Feed[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * 创建动态请求
 */
export interface CreateFeedRequest {
  title?: string;
  content: string;
  mediaIds: string[];
  topicNames: string[];
  locationId?: string;
}

/**
 * 创建评论请求
 */
export interface CreateCommentRequest {
  feedId: string;
  content: string;
  replyTo?: string;
}

/**
 * 举报请求
 */
export interface ReportRequest {
  targetType: 'feed' | 'comment' | 'user';
  targetId: string;
  reasonId: number;
  description?: string;
}

/**
 * 互动操作请求
 */
export interface InteractionRequest {
  targetType: 'feed' | 'comment';
  targetId: string;
  action: 'like' | 'unlike' | 'collect' | 'uncollect';
}

// ==================== 组件Props类型 ====================

/**
 * 动态卡片Props
 */
export interface FeedCardProps {
  feed: Feed;
  onUserClick: (userId: string) => void;
  onTopicClick: (topicName: string) => void;
  onLike: (feedId: string) => void;
  onComment: (feedId: string) => void;
  onShare: (feedId: string) => void;
  onCollect: (feedId: string) => void;
}

/**
 * 评论项Props
 */
export interface CommentItemProps {
  comment: Comment;
  onReply: (commentId: string) => void;
  onLike: (commentId: string) => void;
  onMore: (commentId: string) => void;
}

/**
 * 媒体查看器Props
 */
export interface MediaViewerProps {
  mediaList: MediaItem[];
  initialIndex: number;
  onClose: () => void;
}
