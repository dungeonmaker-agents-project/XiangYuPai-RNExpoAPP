/**
 * Feed API 服务 - 动态流相关接口
 *
 * 基于后端实际实现（参考测试文件）：
 * - FeedController: /api/v1/content/*
 * - InteractionController: /api/v1/interaction/*
 *
 * 后端对接文档参考：
 * - API对接文档-发布动态页面.md (2025-11-29)
 *
 * 接口清单（Gateway路径）：
 * - ✅ GET /xypai-content/api/v1/content/feed/{tabType} - 获取动态列表 (follow/hot/local)
 * - ✅ GET /xypai-content/api/v1/content/detail/{feedId} - 获取动态详情
 * - ✅ POST /xypai-content/api/v1/content/publish - 发布动态
 * - ✅ DELETE /xypai-content/api/v1/content/{feedId} - 删除动态
 * - ✅ POST /xypai-content/api/v1/interaction/like - 点赞/取消点赞
 * - ✅ POST /xypai-content/api/v1/interaction/collect - 收藏/取消收藏
 * - ✅ POST /xypai-content/api/v1/interaction/share - 分享
 * - ✅ GET /xypai-content/api/v1/content/comments/{feedId} - 获取评论列表
 * - ✅ POST /xypai-content/api/v1/content/comment - 发布评论/回复
 * - ✅ DELETE /xypai-content/api/v1/content/comment/{commentId} - 删除评论
 * - ✅ GET /xypai-content/api/v1/content/topics/hot - 获取热门话题 🆕
 * - ✅ GET /xypai-content/api/v1/content/topics/search - 搜索话题 🆕
 * - ✅ GET /xypai-content/api/v1/content/feed/user/{userId} - 获取用户动态列表 🆕 P0
 * - ✅ GET /xypai-content/api/v1/interaction/collect/my - 获取我的收藏列表 🆕 P0
 * - ✅ GET /xypai-content/api/v1/content/topics/{topicId}/feeds - 话题下的动态列表 🆕 P1
 * - ✅ PUT /xypai-content/api/v1/content/comment/{commentId}/pin - 置顶/取消置顶评论 🆕 P2
 *
 * 后端测试文件参考：
 * - Page02_PublishFeedTest.java - 发布动态测试
 * - Page03_FeedDetailTest.java - 动态详情测试
 *
 * @author XiangYuPai
 * @updated 2025-11-29
 */

import { apiClient } from './client';

// ==================== 类型定义 ====================

/**
 * Tab类型
 */
export type FeedTabType = 'follow' | 'hot' | 'local';

/**
 * 动态列表查询参数
 */
export interface FeedListQueryParams {
  page?: number;
  pageSize?: number;
  // 内容类型过滤: 1=动态, 2=活动, 3=技能
  type?: 1 | 2 | 3;
  // 排序方式: distance=距离最近, followed=关注的用户, likes=点赞最多
  sortBy?: 'distance' | 'followed' | 'likes';
  // 同城Tab专用 / 距离排序需要
  latitude?: number;
  longitude?: number;
  radius?: number;  // km
}

/**
 * 媒体项
 */
export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
  duration?: number;
}

/**
 * 话题项
 */
export interface TopicItem {
  name: string;
  description?: string;
  participantCount: number;
  postCount: number;
}

/**
 * 话题详情（用于话题选择页面）
 */
export interface TopicDetail {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  participantCount: number;
  postCount: number;
  isOfficial?: boolean;
  isHot?: boolean;
  category?: string;
  createdAt?: number;
}

/**
 * 话题列表响应
 */
export interface TopicListResponse {
  records: TopicDetail[];
  total: number;
  pages: number;
  current: number;
}

/**
 * 用户信息
 */
export interface FeedUserInfo {
  id: string;
  nickname: string;
  avatar: string;
  gender?: 'male' | 'female';
  age?: number;
  /** 用户等级: 1-青铜,2-白银,3-黄金,4-铂金,5-钻石,6-大师,7-王者 */
  level?: number;
  /** 用户等级名称 */
  levelName?: string;
  isFollowed: boolean;
  isRealVerified?: boolean;
  isGodVerified?: boolean;
  isVip?: boolean;
  isPopular?: boolean;
}

/**
 * 动态列表项
 */
export interface FeedItem {
  id: string;
  userId: string;
  type: number;              // 1=动态,2=活动,3=技能
  typeDesc: string;
  title?: string;
  summary?: string;
  content: string;
  coverImage?: string;

  userInfo: FeedUserInfo;
  mediaList: MediaItem[];
  topicList: TopicItem[];

  locationName?: string;
  locationAddress?: string;
  longitude?: number;
  latitude?: number;
  distance?: number;
  cityId?: number;

  likeCount: number;
  commentCount: number;
  shareCount: number;
  collectCount: number;
  viewCount: number;

  isLiked: boolean;
  isCollected: boolean;

  createdAt: number;
  updatedAt: number;
}

/**
 * 动态详情（扩展列表项）
 */
export interface FeedDetail extends FeedItem {
  // 后端可能返回 location 对象格式
  location?: {
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  // 是否可以编辑/删除
  canEdit?: boolean;
  canDelete?: boolean;
}

/**
 * 后端分页响应格式（MyBatis-Plus Page）
 */
interface BackendPageResponse<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

/**
 * 动态列表响应
 */
export interface FeedListResponse {
  list: FeedItem[];
  total: number;
  hasMore: boolean;
}

/**
 * 发布动态参数
 *
 * 对接后端文档: API对接文档-发布动态页面.md
 * 接口: POST /xypai-content/api/v1/content/publish
 */
export interface FeedPublishParams {
  /** 动态类型: 1=动态, 2=活动, 3=技能 */
  type: 1 | 2 | 3;
  /** 标题，0-50字符 (可选) */
  title?: string;
  /** 内容，1-1000字符 (必填) */
  content: string;
  /** 媒体ID列表，最多9张图或1个视频 (上传后获得的ID) */
  mediaIds?: number[];
  /** 话题名称列表，最多5个 */
  topicNames?: string[];
  /** 地点ID (可选) */
  locationId?: number;
  /** 地点名称 */
  locationName?: string;
  /** 详细地址 */
  locationAddress?: string;
  /** 经度 */
  longitude?: number;
  /** 纬度 */
  latitude?: number;
  /** 可见范围: 0=公开, 1=仅好友, 2=仅自己 (默认0) */
  visibility?: 0 | 1 | 2;

  // 以下字段保留用于前端本地处理（非后端字段）
  /** @deprecated 使用 mediaIds 替代，此字段仅用于前端预览 */
  mediaList?: Array<{
    type: 'image' | 'video';
    url: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    duration?: number;
  }>;
  /** @deprecated 使用 locationId 替代 */
  cityId?: number;
}

/**
 * 互动操作参数
 */
export interface InteractionParams {
  targetType: 'feed' | 'comment';
  targetId: string;
  action: 'like' | 'unlike' | 'collect' | 'uncollect';
}

/**
 * 分享参数
 */
export interface ShareParams {
  targetId: string;
  shareChannel: 'wechat' | 'moments' | 'qq' | 'qzone' | 'weibo' | 'copy_link';
}

/**
 * 互动结果
 */
export interface InteractionResult {
  success: boolean;
  count?: number;
  isActive?: boolean;
  likeCount?: number;
  collectCount?: number;
  shareCount?: number;
  isLiked?: boolean;
  isCollected?: boolean;
}

/**
 * 评论用户信息
 */
export interface CommentUserInfo {
  id: string;
  nickname: string;
  avatar: string;
}

/**
 * 评论项
 *
 * 对接后端文档: API对接文档-动态详情页面.md
 */
export interface CommentItem {
  id: string;
  feedId: string;
  userId: string;
  content: string;
  parentId?: string;
  replyToUserId?: string;
  /** 回复目标用户昵称 (二级回复显示用) */
  replyToUserNickname?: string;
  likeCount: number;
  replyCount: number;
  /** 是否置顶 */
  isTop?: boolean;
  isLiked: boolean;
  userInfo: CommentUserInfo;
  /** 二级回复列表 (预加载部分) */
  replies?: CommentItem[];
  /** 回复总数 */
  totalReplies?: number;
  /** 是否有更多回复 */
  hasMoreReplies?: boolean;
  /** 当前用户是否可删除此评论 */
  canDelete?: boolean;
  createdAt: number;
}

/**
 * 评论列表响应
 */
export interface CommentListResponse {
  records: CommentItem[];
  total: number;
  pages: number;
  current: number;
}

/**
 * 发布评论参数
 */
export interface CommentPublishParams {
  feedId: string;
  content: string;
  parentId?: string;
  replyToUserId?: string;
}

/**
 * 用户动态列表查询参数 (P0)
 * 用于 Profile 页面 "动态" Tab
 */
export interface UserFeedListParams {
  pageNum?: number;
  pageSize?: number;
}

/**
 * 我的收藏列表查询参数 (P0)
 * 用于 Profile 页面 "收藏" Tab
 */
export interface MyCollectionParams {
  pageNum?: number;
  pageSize?: number;
}

/**
 * 收藏项类型 (P0)
 */
export interface CollectionItem {
  id: number;
  targetType: 'feed' | 'activity' | 'skill';
  targetId: number;
  targetContent: string;
  targetCover?: string;
  author: {
    userId: number;
    nickname: string;
    avatar: string;
  };
  collectTime: string;
}

/**
 * 收藏列表响应 (P0)
 */
export interface CollectionListResponse {
  records: CollectionItem[];
  total: number;
  current: number;
  pages: number;
}

/**
 * 话题动态列表查询参数 (P1)
 */
export interface TopicFeedParams {
  pageNum?: number;
  pageSize?: number;
}

/**
 * 评论置顶结果 (P2)
 */
export interface PinCommentResult {
  success: boolean;
  isPinned: boolean;
  message?: string;
}

// ==================== API配置 ====================

/** 是否使用Mock数据 */
const USE_MOCK_DATA = false;

/** 是否开启调试日志 */
const DEBUG = __DEV__ ?? false;

const log = (...args: any[]) => DEBUG && console.log('[FeedAPI]', ...args);
const logError = (...args: any[]) => console.error('[FeedAPI]', ...args);

// ==================== API实现 ====================

/**
 * Feed API 类
 */
export class FeedAPI {
  /**
   * 获取动态列表
   *
   * @param tabType - Tab类型: follow(关注) / hot(热门) / local(同城)
   * @param params - 查询参数
   */
  async getFeedList(tabType: FeedTabType, params: FeedListQueryParams = {}): Promise<FeedListResponse> {
    const { page = 1, pageSize = 20, type, sortBy, latitude, longitude, radius } = params;

    log('getFeedList', { tabType, page, pageSize, type, sortBy });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return this.generateMockFeedList(tabType, page, pageSize);
    }

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', String(page));
      queryParams.append('pageSize', String(pageSize));
      // 添加 type 参数过滤: 1=动态, 2=活动, 3=技能
      if (type) {
        queryParams.append('type', String(type));
      }
      // 添加 sortBy 参数排序: distance=距离, followed=关注的用户, likes=点赞数
      if (sortBy) {
        queryParams.append('sortBy', sortBy);
      }
      // 距离排序或同城Tab需要经纬度
      if ((sortBy === 'distance' || tabType === 'local') && latitude && longitude) {
        queryParams.append('latitude', String(latitude));
        queryParams.append('longitude', String(longitude));
        if (radius) queryParams.append('radius', String(radius));
      }

      const url = `/xypai-content/api/v1/content/feed/${tabType}?${queryParams.toString()}`;
      // 后端返回 MyBatis-Plus Page 格式
      const response = await apiClient.get<BackendPageResponse<FeedItem>>(url);

      // 转换为前端期望的格式
      const backendData = response.data;
      if (backendData && backendData.records) {
        const result: FeedListResponse = {
          list: backendData.records || [],
          total: backendData.total || 0,
          hasMore: backendData.current < backendData.pages,
        };
        log('getFeedList success', { count: result.list.length, total: result.total });
        return result;
      }

      // 如果没有 records 字段，尝试兼容直接返回 list 的格式
      const directData = response.data as unknown as FeedListResponse;
      if (directData && directData.list) {
        log('getFeedList success (direct format)', { count: directData.list.length });
        return directData;
      }

      log('getFeedList: empty response');
      return { list: [], total: 0, hasMore: false };
    } catch (error: any) {
      logError('getFeedList failed:', error.message);
      return { list: [], total: 0, hasMore: false };
    }
  }

  /**
   * 获取动态详情
   *
   * @param feedId - 动态ID
   */
  async getFeedDetail(feedId: string): Promise<FeedDetail | null> {
    log('getFeedDetail', { feedId });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return this.generateMockFeedDetail(feedId);
    }

    try {
      const url = `/xypai-content/api/v1/content/detail/${feedId}`;
      // 禁用缓存，确保每次都获取最新数据（包括最新的 likeCount, commentCount 等）
      const response = await apiClient.get<FeedDetail>(url, { cache: false });

      log('getFeedDetail success');
      return response.data || null;
    } catch (error: any) {
      logError('getFeedDetail failed:', error.message);
      return null;
    }
  }

  /**
   * 发布动态
   *
   * 对接后端文档: API对接文档-发布动态页面.md
   * 接口: POST /xypai-content/api/v1/content/publish
   *
   * @param params - 发布参数
   * @returns feedId (动态ID)
   */
  async publishFeed(params: FeedPublishParams): Promise<{ feedId: number } | null> {
    log('publishFeed', {
      type: params.type,
      contentLen: params.content?.length || 0,
      mediaCount: params.mediaIds?.length || 0,
      topicCount: params.topicNames?.length || 0,
      hasLocation: !!params.locationName,
      visibility: params.visibility ?? 0,
    });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { feedId: Date.now() };
    }

    try {
      const url = '/xypai-content/api/v1/content/publish';
      // 后端返回 data 直接是 feedId (number)
      const response = await apiClient.post<number>(url, params);

      log('publishFeed success', { feedId: response.data });
      return response.data ? { feedId: response.data } : null;
    } catch (error: any) {
      logError('publishFeed failed:', error.message);
      throw error;
    }
  }

  /**
   * 删除动态
   *
   * @param feedId - 动态ID
   */
  async deleteFeed(feedId: string): Promise<boolean> {
    log('deleteFeed', { feedId });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    }

    try {
      const url = `/xypai-content/api/v1/content/${feedId}`;
      await apiClient.delete(url);

      log('deleteFeed success');
      return true;
    } catch (error: any) {
      logError('deleteFeed failed:', error.message);
      return false;
    }
  }

  /**
   * 点赞/取消点赞
   *
   * @param targetType - 目标类型: feed / comment
   * @param targetId - 目标ID
   * @param action - 操作: like / unlike
   */
  async like(targetType: 'feed' | 'comment', targetId: string, action: 'like' | 'unlike'): Promise<InteractionResult> {
    log('like', { targetType, targetId, action });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return {
        success: true,
        isLiked: action === 'like',
        likeCount: Math.floor(Math.random() * 1000),
      };
    }

    try {
      const url = '/xypai-content/api/v1/interaction/like';
      const response = await apiClient.post<InteractionResult>(url, {
        targetType,
        targetId,
        action,
      });

      log('like success', { isLiked: response.data?.isLiked });
      return response.data || { success: false };
    } catch (error: any) {
      logError('like failed:', error.message);
      return { success: false };
    }
  }

  /**
   * 收藏/取消收藏
   *
   * @param targetType - 目标类型: feed
   * @param targetId - 目标ID
   * @param action - 操作: collect / uncollect
   */
  async collect(targetType: 'feed', targetId: string, action: 'collect' | 'uncollect'): Promise<InteractionResult> {
    log('collect', { targetType, targetId, action });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return {
        success: true,
        isCollected: action === 'collect',
        collectCount: Math.floor(Math.random() * 500),
      };
    }

    try {
      const url = '/xypai-content/api/v1/interaction/collect';
      const response = await apiClient.post<InteractionResult>(url, {
        targetType,
        targetId,
        action,
      });

      log('collect success', { isCollected: response.data?.isCollected });
      return response.data || { success: false };
    } catch (error: any) {
      logError('collect failed:', error.message);
      return { success: false };
    }
  }

  /**
   * 分享
   *
   * @param targetId - 动态ID
   * @param shareChannel - 分享渠道
   */
  async share(targetId: string, shareChannel: ShareParams['shareChannel']): Promise<InteractionResult> {
    log('share', { targetId, shareChannel });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return {
        success: true,
        shareCount: Math.floor(Math.random() * 200),
      };
    }

    try {
      const url = '/xypai-content/api/v1/interaction/share';
      const response = await apiClient.post<InteractionResult>(url, {
        targetType: 'feed',
        targetId,
        shareChannel,
      });

      log('share success', { shareCount: response.data?.shareCount });
      return response.data || { success: false };
    } catch (error: any) {
      logError('share failed:', error.message);
      return { success: false };
    }
  }

  // ==================== 关注相关 ====================

  /**
   * 关注/取消关注用户
   *
   * @param targetUserId - 目标用户ID
   * @param follow - true=关注, false=取消关注
   * @returns 操作是否成功
   */
  async toggleFollow(targetUserId: string, follow: boolean): Promise<boolean> {
    log('toggleFollow', { targetUserId, follow });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return true;
    }

    try {
      const url = `/xypai-content/api/v1/interaction/follow/${targetUserId}`;

      if (follow) {
        // 关注
        const response = await apiClient.post<boolean>(url);
        log('follow success');
        return response.data ?? true;
      } else {
        // 取消关注
        await apiClient.delete(url);
        log('unfollow success');
        return true;
      }
    } catch (error: any) {
      logError('toggleFollow failed:', error.message);
      return false;
    }
  }

  /**
   * 检查是否已关注用户
   *
   * @param targetUserId - 目标用户ID
   * @returns 是否已关注
   */
  async checkIsFollowed(targetUserId: string): Promise<boolean> {
    log('checkIsFollowed', { targetUserId });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return Math.random() > 0.5;
    }

    try {
      const url = `/xypai-content/api/v1/interaction/follow/check/${targetUserId}`;
      const response = await apiClient.get<boolean>(url);

      log('checkIsFollowed success', { isFollowed: response.data });
      return response.data ?? false;
    } catch (error: any) {
      logError('checkIsFollowed failed:', error.message);
      return false;
    }
  }

  // ==================== 评论相关 ====================

  /**
   * 获取评论列表
   *
   * @param feedId - 动态ID
   * @param params - 分页参数
   */
  async getCommentList(feedId: string, params: { pageNum?: number; pageSize?: number; sortType?: 'hot' | 'new' } = {}): Promise<CommentListResponse> {
    const { pageNum = 1, pageSize = 10, sortType = 'hot' } = params;

    log('getCommentList', { feedId, pageNum, pageSize, sortType });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return this.generateMockCommentList(feedId, pageNum, pageSize);
    }

    try {
      const url = `/xypai-content/api/v1/content/comments/${feedId}?pageNum=${pageNum}&pageSize=${pageSize}&sortType=${sortType}`;
      // 禁用缓存，确保每次都获取最新数据
      const response = await apiClient.get<CommentListResponse>(url, { cache: false });

      log('getCommentList success', { count: response.data?.records?.length || 0 });
      return response.data || { records: [], total: 0, pages: 0, current: 1 };
    } catch (error: any) {
      logError('getCommentList failed:', error.message);
      return { records: [], total: 0, pages: 0, current: 1 };
    }
  }

  /**
   * 发布评论/回复
   *
   * @param params - 评论参数
   */
  async publishComment(params: CommentPublishParams): Promise<CommentItem | null> {
    log('publishComment', { feedId: params.feedId, contentLen: params.content?.length || 0 });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        id: `comment_${Date.now()}`,
        feedId: params.feedId,
        userId: 'current_user',
        content: params.content,
        parentId: params.parentId,
        replyToUserId: params.replyToUserId,
        likeCount: 0,
        replyCount: 0,
        isLiked: false,
        userInfo: {
          id: 'current_user',
          nickname: '当前用户',
          avatar: 'https://picsum.photos/100/100?random=current',
        },
        createdAt: Date.now(),
      };
    }

    try {
      const url = '/xypai-content/api/v1/content/comment';
      const response = await apiClient.post<CommentItem>(url, params);

      log('publishComment success', { commentId: response.data?.id });
      return response.data || null;
    } catch (error: any) {
      logError('publishComment failed:', error.message);
      throw error;
    }
  }

  /**
   * 删除评论
   *
   * @param commentId - 评论ID
   */
  async deleteComment(commentId: string): Promise<boolean> {
    log('deleteComment', { commentId });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return true;
    }

    try {
      const url = `/xypai-content/api/v1/content/comment/${commentId}`;
      await apiClient.delete(url);

      log('deleteComment success');
      return true;
    } catch (error: any) {
      logError('deleteComment failed:', error.message);
      return false;
    }
  }

  // ==================== 话题相关接口 ====================

  /**
   * 获取热门话题列表
   * 接口: GET /xypai-content/api/v1/content/topics/hot
   *
   * @param page - 页码（从1开始）
   * @param pageSize - 每页数量（默认20）
   * @returns 话题列表响应
   *
   * @example
   * const topics = await feedApi.getHotTopics(1, 20);
   */
  async getHotTopics(page: number = 1, pageSize: number = 20): Promise<TopicListResponse> {
    log('getHotTopics', { page, pageSize });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return this.generateMockTopicList(page, pageSize);
    }

    try {
      const url = `/xypai-content/api/v1/content/topics/hot?page=${page}&pageSize=${pageSize}`;
      const response = await apiClient.get<TopicListResponse>(url);

      log('getHotTopics success', { count: response.data?.records?.length || 0 });
      return response.data || { records: [], total: 0, pages: 0, current: page };
    } catch (error: any) {
      logError('getHotTopics failed:', error.message);
      return { records: [], total: 0, pages: 0, current: page };
    }
  }

  /**
   * 搜索话题
   * 接口: GET /xypai-content/api/v1/content/topics/search
   *
   * @param keyword - 搜索关键词（1-20字符）
   * @param page - 页码（从1开始）
   * @param pageSize - 每页数量（默认20）
   * @returns 话题列表响应
   *
   * @example
   * const topics = await feedApi.searchTopics('探店', 1, 20);
   */
  async searchTopics(keyword: string, page: number = 1, pageSize: number = 20): Promise<TopicListResponse> {
    log('searchTopics', { keyword, page, pageSize });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return this.generateMockTopicList(page, pageSize, keyword);
    }

    try {
      const url = `/xypai-content/api/v1/content/topics/search?keyword=${encodeURIComponent(keyword)}&page=${page}&pageSize=${pageSize}`;
      const response = await apiClient.get<TopicListResponse>(url);

      log('searchTopics success', { count: response.data?.records?.length || 0 });
      return response.data || { records: [], total: 0, pages: 0, current: page };
    } catch (error: any) {
      logError('searchTopics failed:', error.message);
      return { records: [], total: 0, pages: 0, current: page };
    }
  }

  // ==================== P0 新增接口 (Profile页面Tab数据) ====================

  /**
   * 获取用户动态列表 (P0)
   * 接口: GET /xypai-content/api/v1/content/feed/user/{userId}
   * 用途: Profile页面 "动态" Tab
   *
   * @param userId - 用户ID
   * @param params - 分页参数
   * @returns 动态列表响应
   *
   * @example
   * const feeds = await feedApi.getUserFeedList('123', { pageNum: 1, pageSize: 20 });
   */
  async getUserFeedList(userId: string | number, params: UserFeedListParams = {}): Promise<FeedListResponse> {
    const { pageNum = 1, pageSize = 20 } = params;

    log('getUserFeedList', { userId, pageNum, pageSize });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return this.generateMockUserFeedList(String(userId), pageNum, pageSize);
    }

    try {
      const url = `/xypai-content/api/v1/content/feed/user/${userId}?pageNum=${pageNum}&pageSize=${pageSize}`;
      const response = await apiClient.get<BackendPageResponse<FeedItem>>(url);

      // 转换为前端期望的格式
      const backendData = response.data;
      if (backendData && backendData.records) {
        const result: FeedListResponse = {
          list: backendData.records || [],
          total: backendData.total || 0,
          hasMore: backendData.current < backendData.pages,
        };
        log('getUserFeedList success', { count: result.list.length, total: result.total });
        return result;
      }

      log('getUserFeedList: empty response');
      return { list: [], total: 0, hasMore: false };
    } catch (error: any) {
      logError('getUserFeedList failed:', error.message);
      return { list: [], total: 0, hasMore: false };
    }
  }

  /**
   * 获取我的收藏列表 (P0)
   * 接口: GET /xypai-content/api/v1/interaction/collect/my
   * 用途: Profile页面 "收藏" Tab
   *
   * @param params - 分页参数
   * @returns 收藏列表响应
   *
   * @example
   * const collections = await feedApi.getMyCollections({ pageNum: 1, pageSize: 20 });
   */
  async getMyCollections(params: MyCollectionParams = {}): Promise<CollectionListResponse> {
    const { pageNum = 1, pageSize = 20 } = params;

    log('getMyCollections', { pageNum, pageSize });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return this.generateMockCollectionList(pageNum, pageSize);
    }

    try {
      const url = `/xypai-content/api/v1/interaction/collect/my?pageNum=${pageNum}&pageSize=${pageSize}`;
      const response = await apiClient.get<CollectionListResponse>(url);

      log('getMyCollections success', { count: response.data?.records?.length || 0 });
      return response.data || { records: [], total: 0, current: pageNum, pages: 0 };
    } catch (error: any) {
      logError('getMyCollections failed:', error.message);
      return { records: [], total: 0, current: pageNum, pages: 0 };
    }
  }

  // ==================== P1 新增接口 ====================

  /**
   * 获取话题下的动态列表 (P1)
   * 接口: GET /xypai-content/api/v1/content/topics/{topicId}/feeds
   * 用途: 话题详情页
   *
   * @param topicId - 话题ID
   * @param params - 分页参数
   * @returns 动态列表响应
   *
   * @example
   * const feeds = await feedApi.getTopicFeeds('topic_123', { pageNum: 1, pageSize: 20 });
   */
  async getTopicFeeds(topicId: string | number, params: TopicFeedParams = {}): Promise<FeedListResponse> {
    const { pageNum = 1, pageSize = 20 } = params;

    log('getTopicFeeds', { topicId, pageNum, pageSize });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return this.generateMockFeedList('hot', pageNum, pageSize);
    }

    try {
      const url = `/xypai-content/api/v1/content/topics/${topicId}/feeds?pageNum=${pageNum}&pageSize=${pageSize}`;
      const response = await apiClient.get<BackendPageResponse<FeedItem>>(url);

      // 转换为前端期望的格式
      const backendData = response.data;
      if (backendData && backendData.records) {
        const result: FeedListResponse = {
          list: backendData.records || [],
          total: backendData.total || 0,
          hasMore: backendData.current < backendData.pages,
        };
        log('getTopicFeeds success', { count: result.list.length, total: result.total });
        return result;
      }

      log('getTopicFeeds: empty response');
      return { list: [], total: 0, hasMore: false };
    } catch (error: any) {
      logError('getTopicFeeds failed:', error.message);
      return { list: [], total: 0, hasMore: false };
    }
  }

  // ==================== P2 新增接口 ====================

  /**
   * 置顶/取消置顶评论 (P2)
   * 接口: PUT /xypai-content/api/v1/content/comment/{commentId}/pin
   * 用途: 动态作者管理评论
   *
   * @param commentId - 评论ID
   * @param pin - true=置顶, false=取消置顶
   * @returns 操作结果
   *
   * @example
   * const result = await feedApi.pinComment('comment_123', true);
   */
  async pinComment(commentId: string, pin: boolean): Promise<PinCommentResult> {
    log('pinComment', { commentId, pin });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        success: true,
        isPinned: pin,
        message: pin ? '置顶成功' : '取消置顶成功',
      };
    }

    try {
      const url = `/xypai-content/api/v1/content/comment/${commentId}/pin?pin=${pin}`;
      const response = await apiClient.put<PinCommentResult>(url);

      log('pinComment success', { isPinned: response.data?.isPinned });
      return response.data || { success: false, isPinned: false };
    } catch (error: any) {
      logError('pinComment failed:', error.message);
      return { success: false, isPinned: false, message: error.message };
    }
  }

  // ==================== Mock数据生成 ====================

  /**
   * 生成Mock动态列表
   */
  private generateMockFeedList(tabType: FeedTabType, page: number, pageSize: number): FeedListResponse {
    const startIndex = (page - 1) * pageSize;
    const list: FeedItem[] = Array.from({ length: pageSize }, (_, i) => {
      const index = startIndex + i;
      return {
        id: `feed_${tabType}_${index}`,
        userId: `user_${index % 50}`,
        type: 1,
        typeDesc: '动态',
        content: [
          '今天天气真好，出来晒太阳~',
          '分享一首最近很喜欢的歌',
          '新get的技能，来找我玩呀',
          '周末愉快！有人一起组局吗？',
        ][index % 4],
        userInfo: {
          id: `user_${index % 50}`,
          nickname: `用户${100 + index}`,
          avatar: `https://picsum.photos/100/100?random=user${index}`,
          gender: index % 2 === 0 ? 'female' : 'male',
          age: 18 + (index % 10),
          isFollowed: tabType === 'follow',
          isRealVerified: index % 3 === 0,
          isVip: index % 5 === 0,
        },
        mediaList: Array.from({ length: (index % 3) + 1 }, (_, j) => ({
          id: `media_${index}_${j}`,
          type: 'image' as const,
          url: `https://picsum.photos/400/300?random=media${index}_${j}`,
          width: 400,
          height: 300,
        })),
        topicList: index % 2 === 0 ? [{
          name: '日常分享',
          participantCount: 1234,
          postCount: 5678,
        }] : [],
        locationName: tabType === 'local' ? '深圳市南山区' : undefined,
        distance: tabType === 'local' ? Math.random() * 5 : undefined,
        likeCount: Math.floor(Math.random() * 500),
        commentCount: Math.floor(Math.random() * 100),
        shareCount: Math.floor(Math.random() * 50),
        collectCount: Math.floor(Math.random() * 200),
        viewCount: Math.floor(Math.random() * 1000),
        isLiked: Math.random() > 0.7,
        isCollected: Math.random() > 0.8,
        createdAt: Date.now() - Math.floor(Math.random() * 86400000 * 7),
        updatedAt: Date.now(),
      };
    });

    return {
      list,
      total: 100,
      hasMore: page * pageSize < 100,
    };
  }

  /**
   * 生成Mock动态详情
   */
  private generateMockFeedDetail(feedId: string): FeedDetail {
    return {
      id: feedId,
      userId: 'user_1',
      type: 1,
      typeDesc: '动态',
      content: '这是一条测试动态的详细内容，包含更多信息~',
      userInfo: {
        id: 'user_1',
        nickname: '测试用户',
        avatar: 'https://picsum.photos/100/100?random=detail',
        gender: 'female',
        age: 22,
        isFollowed: false,
        isRealVerified: true,
        isVip: true,
      },
      mediaList: [
        {
          id: 'media_1',
          type: 'image',
          url: 'https://picsum.photos/800/600?random=detail1',
          width: 800,
          height: 600,
        },
      ],
      topicList: [{
        name: '日常分享',
        participantCount: 1234,
        postCount: 5678,
      }],
      locationName: '深圳市南山区',
      likeCount: 123,
      commentCount: 45,
      shareCount: 12,
      collectCount: 67,
      viewCount: 890,
      isLiked: false,
      isCollected: false,
      createdAt: Date.now() - 3600000,
      updatedAt: Date.now(),
    };
  }

  /**
   * 生成Mock评论列表
   */
  private generateMockCommentList(feedId: string, pageNum: number, pageSize: number): CommentListResponse {
    const startIndex = (pageNum - 1) * pageSize;
    const records: CommentItem[] = Array.from({ length: Math.min(pageSize, 20 - startIndex) }, (_, i) => {
      const index = startIndex + i;
      return {
        id: `comment_${feedId}_${index}`,
        feedId,
        userId: `user_${index}`,
        content: [
          '这条动态太棒了！',
          '同意楼上说的',
          '期待更多分享~',
          '收藏了，谢谢分享',
        ][index % 4],
        likeCount: Math.floor(Math.random() * 50),
        replyCount: Math.floor(Math.random() * 10),
        isLiked: Math.random() > 0.7,
        userInfo: {
          id: `user_${index}`,
          nickname: `评论者${100 + index}`,
          avatar: `https://picsum.photos/100/100?random=comment${index}`,
        },
        createdAt: Date.now() - Math.floor(Math.random() * 86400000),
      };
    });

    return {
      records,
      total: 20,
      pages: Math.ceil(20 / pageSize),
      current: pageNum,
    };
  }

  /**
   * 生成Mock话题列表
   */
  private generateMockTopicList(page: number, pageSize: number, keyword?: string): TopicListResponse {
    const topicNames = [
      '探店日记', '美食推荐', '旅行打卡', '日常分享', '游戏陪玩',
      '王者荣耀', '英雄联盟', '和平精英', '情感树洞', '职场分享',
      '健身打卡', '穿搭分享', '宠物日常', '追剧推荐', '音乐分享',
      'S10全球总决赛', '电竞赛事', '手游攻略', '新游体验', '主播推荐',
    ];

    const filteredNames = keyword
      ? topicNames.filter(name => name.includes(keyword))
      : topicNames;

    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredNames.length);
    const records: TopicDetail[] = filteredNames.slice(startIndex, endIndex).map((name, i) => ({
      id: `topic_${startIndex + i}`,
      name,
      description: `这是关于${name}的话题描述`,
      coverImage: `https://picsum.photos/200/200?random=topic${startIndex + i}`,
      participantCount: Math.floor(Math.random() * 10000) + 1000,
      postCount: Math.floor(Math.random() * 50000) + 5000,
      isOfficial: i % 5 === 0,
      isHot: i < 5,
      category: ['游戏', '生活', '娱乐', '情感'][i % 4],
      createdAt: Date.now() - Math.floor(Math.random() * 86400000 * 30),
    }));

    return {
      records,
      total: filteredNames.length,
      pages: Math.ceil(filteredNames.length / pageSize),
      current: page,
    };
  }

  /**
   * 生成Mock用户动态列表 (P0)
   */
  private generateMockUserFeedList(userId: string, pageNum: number, pageSize: number): FeedListResponse {
    const startIndex = (pageNum - 1) * pageSize;
    const list: FeedItem[] = Array.from({ length: Math.min(pageSize, 30 - startIndex) }, (_, i) => {
      const index = startIndex + i;
      return {
        id: `user_feed_${userId}_${index}`,
        userId,
        type: 1,
        typeDesc: '动态',
        content: [
          '今天天气真好，出来晒太阳~',
          '分享一首最近很喜欢的歌',
          '新get的技能，来找我玩呀',
          '周末愉快！有人一起组局吗？',
        ][index % 4],
        userInfo: {
          id: userId,
          nickname: `用户${userId}`,
          avatar: `https://picsum.photos/100/100?random=user${userId}`,
          gender: 'female',
          age: 22,
          isFollowed: false,
          isRealVerified: true,
          isVip: false,
        },
        mediaList: Array.from({ length: (index % 3) + 1 }, (_, j) => ({
          id: `media_${index}_${j}`,
          type: 'image' as const,
          url: `https://picsum.photos/400/300?random=userfeed${index}_${j}`,
          width: 400,
          height: 300,
        })),
        topicList: index % 2 === 0 ? [{
          name: '日常分享',
          participantCount: 1234,
          postCount: 5678,
        }] : [],
        likeCount: Math.floor(Math.random() * 500),
        commentCount: Math.floor(Math.random() * 100),
        shareCount: Math.floor(Math.random() * 50),
        collectCount: Math.floor(Math.random() * 200),
        viewCount: Math.floor(Math.random() * 1000),
        isLiked: Math.random() > 0.7,
        isCollected: Math.random() > 0.8,
        createdAt: Date.now() - Math.floor(Math.random() * 86400000 * 7),
        updatedAt: Date.now(),
      };
    });

    return {
      list,
      total: 30,
      hasMore: pageNum * pageSize < 30,
    };
  }

  /**
   * 生成Mock收藏列表 (P0)
   */
  private generateMockCollectionList(pageNum: number, pageSize: number): CollectionListResponse {
    const startIndex = (pageNum - 1) * pageSize;
    const records: CollectionItem[] = Array.from({ length: Math.min(pageSize, 25 - startIndex) }, (_, i) => {
      const index = startIndex + i;
      return {
        id: 1000 + index,
        targetType: ['feed', 'activity', 'skill'][index % 3] as 'feed' | 'activity' | 'skill',
        targetId: 2000 + index,
        targetContent: [
          '今天天气真好，出来晒太阳~',
          '周末台球局，一起来玩',
          '王者荣耀陪玩，最强王者段位',
        ][index % 3],
        targetCover: `https://picsum.photos/200/200?random=collect${index}`,
        author: {
          userId: 3000 + index,
          nickname: `作者${100 + index}`,
          avatar: `https://picsum.photos/100/100?random=author${index}`,
        },
        collectTime: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 7)).toISOString().replace('T', ' ').slice(0, 19),
      };
    });

    return {
      records,
      total: 25,
      current: pageNum,
      pages: Math.ceil(25 / pageSize),
    };
  }
}

// 导出单例实例
export const feedApi = new FeedAPI();

// 默认导出
export default feedApi;
