/**
 * useHomeData - 首页数据管理Hook
 * 统一管理首页所有数据获取逻辑
 *
 * ✅ 已对接后端API（2025-11-27）
 * - Feed流: 使用 feedApi.getFeedList()
 * - 用户推荐: 使用 bffApi.getHomeFeed() 🆕
 * - 筛选: 使用 filterApi.applyFilter()
 * - 互动: 使用 feedApi.like/collect/share()
 *
 * 后端接口清单：
 * - GET /xypai-content/api/v1/content/feed/{tabType} - 获取动态列表
 * - GET /xypai-app-bff/api/home/feed - 获取首页用户推荐列表 🆕
 * - POST /xypai-app-bff/api/home/filter/apply - 应用筛选条件
 * - POST /xypai-content/api/v1/interaction/like - 点赞
 * - POST /xypai-content/api/v1/interaction/collect - 收藏
 * - POST /xypai-content/api/v1/interaction/share - 分享
 */

import { useCallback } from 'react';
import { bffApi } from '../../../../services/api/bffApi';
import type { BffUserCard, HomeFeedType, LimitedTimeResponse, LimitedTimeQueryParams } from '../../../../services/api/bffApi';
import { feedApi } from '../../../../services/api/feedApi';
import { filterApi } from '../../../../services/api/filterApi';
import { homeApi } from './homeApi';
import type {
  CheckInResponse,
  ExpertsResponse,
  FeedResponse,
  HomeInitResponse,
  TopicBannerResponse,
  UserCard,
} from './types';

/**
 * 是否使用真实API（全局开关）
 */
const USE_REAL_API = true;

/** 是否开启调试日志 */
const DEBUG = __DEV__ ?? false;

const log = (...args: any[]) => DEBUG && console.log('[useHomeData]', ...args);
const logError = (...args: any[]) => console.error('[useHomeData]', ...args);

/**
 * 首页数据管理Hook
 * 提供所有首页API调用的封装
 */
export const useHomeData = () => {
  // ========== 新API接口（根据接口文档） ==========
  
  /**
   * 一、首页初始化加载
   * 接口: GET /api/home/init
   */
  const loadHomeInit = useCallback(async (): Promise<HomeInitResponse> => {
    try {
      // TODO: 切换到真实API
      // return await homeApi.getHomeInit();

      log('loadHomeInit (Mock)');
      await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
      return homeApi.generateMockHomeInit();
    } catch (error) {
      logError('loadHomeInit failed:', error);
      throw error;
    }
  }, []);

  /**
   * 二、明日专家推荐
   * 接口: GET /api/home/experts
   */
  const loadExperts = useCallback(async (): Promise<ExpertsResponse> => {
    try {
      // TODO: 切换到真实API
      // return await homeApi.getExperts();

      log('loadExperts (Mock)');
      await new Promise<void>(resolve => setTimeout(() => resolve(), 300));
      return homeApi.generateMockExperts();
    } catch (error) {
      logError('loadExperts failed:', error);
      throw error;
    }
  }, []);

  /**
   * 三、你什么名模块
   * 接口: GET /api/home/topic-banner
   */
  const loadTopicBanner = useCallback(async (): Promise<TopicBannerResponse> => {
    try {
      // TODO: 切换到真实API
      // return await homeApi.getTopicBanner();

      log('loadTopicBanner (Mock)');
      await new Promise<void>(resolve => setTimeout(() => resolve(), 300));
      return homeApi.generateMockTopicBanner();
    } catch (error) {
      logError('loadTopicBanner failed:', error);
      throw error;
    }
  }, []);

  /**
   * 四、内容Feed流
   * 接口: GET /xypai-content/api/v1/content/feed/{tabType}
   *
   * @param tabType - Tab类型: follow(关注) / hot(热门) / local(同城)
   * @param pageNum - 页码
   * @param pageSize - 每页数量
   */
  const loadFeed = useCallback(async (
    tabType: 'follow' | 'hot' | 'local' = 'hot',
    pageNum: number = 1,
    pageSize: number = 10
  ): Promise<FeedResponse> => {
    try {
      // 参数验证
      if (pageNum < 1) {
        throw new Error('pageNum必须大于等于1');
      }
      if (pageSize < 5 || pageSize > 20) {
        throw new Error('pageSize范围必须在5-20之间');
      }

      if (USE_REAL_API) {
        log('loadFeed', { tabType, pageNum, pageSize });

        const response = await feedApi.getFeedList(tabType, {
          page: pageNum,
          pageSize,
        });

        // 安全地转换响应格式（确保 list 存在）
        const sourceList = response?.list || [];
        const feedItems = sourceList.map(item => ({
          id: item.id,
          userId: item.userId,
          type: item.type,
          typeDesc: item.typeDesc,
          content: item.content,
          title: item.title,
          coverImage: item.coverImage,
          userInfo: item.userInfo,
          mediaList: item.mediaList,
          topicList: item.topicList,
          locationName: item.locationName,
          distance: item.distance,
          likeCount: item.likeCount,
          commentCount: item.commentCount,
          shareCount: item.shareCount,
          collectCount: item.collectCount,
          viewCount: item.viewCount,
          isLiked: item.isLiked,
          isCollected: item.isCollected,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }));

        return {
          list: feedItems,
          pageNum,
          pageSize,
          total: response?.total || 0,
          hasMore: response?.hasMore || false,
        };
      }

      // 使用Mock数据
      log('loadFeed (Mock)', { pageNum, pageSize });
      await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
      return homeApi.generateMockFeed(pageNum, pageSize);
    } catch (error) {
      logError('loadFeed failed:', error);
      throw error;
    }
  }, []);

  /**
   * 五、签到功能
   * 接口: POST /api/user/check-in
   */
  const checkIn = useCallback(async (): Promise<CheckInResponse> => {
    try {
      // TODO: 切换到真实API
      // return await homeApi.checkIn();

      log('checkIn (Mock)');
      await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
      // 随机模拟已签到或未签到
      const alreadyChecked = Math.random() > 0.7;
      return homeApi.generateMockCheckIn(alreadyChecked);
    } catch (error) {
      logError('checkIn failed:', error);
      throw error;
    }
  }, []);

  /**
   * 下拉刷新 - 批量刷新所有数据
   */
  const refreshAll = useCallback(async (tabType: 'follow' | 'hot' | 'local' = 'hot') => {
    try {
      log('refreshAll started');
      const [init, experts, topicBanner, feed] = await Promise.all([
        loadHomeInit(),
        loadExperts(),
        loadTopicBanner(),
        loadFeed(tabType, 1, 10),
      ]);

      log('refreshAll completed');
      return { init, experts, topicBanner, feed };
    } catch (error) {
      logError('refreshAll failed:', error);
      throw error;
    }
  }, [loadHomeInit, loadExperts, loadTopicBanner, loadFeed]);

  // ========== 互动功能 ==========

  /**
   * 点赞/取消点赞
   * 接口: POST /xypai-content/api/v1/interaction/like
   */
  const likeFeed = useCallback(async (feedId: string, action: 'like' | 'unlike') => {
    try {
      log('likeFeed', { feedId, action });

      if (USE_REAL_API) {
        const result = await feedApi.like('feed', feedId, action);
        return result;
      }

      // Mock
      await new Promise<void>(resolve => setTimeout(() => resolve(), 200));
      return {
        success: true,
        isActive: action === 'like',
        count: Math.floor(Math.random() * 1000),
      };
    } catch (error) {
      logError('likeFeed failed:', error);
      throw error;
    }
  }, []);

  /**
   * 收藏/取消收藏
   * 接口: POST /xypai-content/api/v1/interaction/collect
   */
  const collectFeed = useCallback(async (feedId: string, action: 'collect' | 'uncollect') => {
    try {
      log('collectFeed', { feedId, action });

      if (USE_REAL_API) {
        const result = await feedApi.collect('feed', feedId, action);
        return result;
      }

      // Mock
      await new Promise<void>(resolve => setTimeout(() => resolve(), 200));
      return {
        success: true,
        isActive: action === 'collect',
        count: Math.floor(Math.random() * 500),
      };
    } catch (error) {
      logError('collectFeed failed:', error);
      throw error;
    }
  }, []);

  /**
   * 分享
   * 接口: POST /xypai-content/api/v1/interaction/share
   */
  const shareFeed = useCallback(async (feedId: string, channel: 'wechat' | 'moments' | 'qq' | 'qzone' | 'weibo' | 'copy_link' = 'copy_link') => {
    try {
      log('shareFeed', { feedId, channel });

      if (USE_REAL_API) {
        const result = await feedApi.share(feedId, channel);
        return result;
      }

      // Mock
      await new Promise<void>(resolve => setTimeout(() => resolve(), 200));
      return {
        success: true,
        shareCount: Math.floor(Math.random() * 200),
      };
    } catch (error) {
      logError('shareFeed failed:', error);
      throw error;
    }
  }, []);

  // ========== BFF用户推荐接口（新增） ==========

  /**
   * 获取首页用户推荐列表
   * 接口: GET /xypai-app-bff/api/home/feed
   *
   * @param type - 推荐类型: online(线上) / offline(线下)
   * @param pageNum - 页码
   * @param pageSize - 每页数量
   * @param cityCode - 城市代码（可选）
   */
  const loadUserRecommendations = useCallback(async (
    type: HomeFeedType = 'online',
    pageNum: number = 1,
    pageSize: number = 10,
    cityCode?: string
  ): Promise<{ list: BffUserCard[]; total: number; hasMore: boolean }> => {
    try {
      log('loadUserRecommendations', { type, pageNum, pageSize, cityCode });

      if (USE_REAL_API) {
        const response = await bffApi.getHomeFeed({
          type,
          pageNum,
          pageSize,
          cityCode,
        });
        return response;
      }

      // Mock数据（通过bffApi内部生成）
      return await bffApi.getHomeFeed({ type, pageNum, pageSize, cityCode });
    } catch (error) {
      logError('loadUserRecommendations failed:', error);
      throw error;
    }
  }, []);

  /**
   * 获取线上用户推荐（便捷方法）
   */
  const loadOnlineUsers = useCallback(async (
    pageNum: number = 1,
    pageSize: number = 10,
    cityCode?: string
  ) => {
    return loadUserRecommendations('online', pageNum, pageSize, cityCode);
  }, [loadUserRecommendations]);

  /**
   * 获取线下用户推荐（便捷方法）
   */
  const loadOfflineUsers = useCallback(async (
    pageNum: number = 1,
    pageSize: number = 10,
    cityCode?: string
  ) => {
    return loadUserRecommendations('offline', pageNum, pageSize, cityCode);
  }, [loadUserRecommendations]);

  /**
   * 获取筛选配置
   * 接口: GET /xypai-app-bff/api/home/filter/config
   */
  const loadFilterConfig = useCallback(async (type: HomeFeedType = 'online') => {
    try {
      log('loadFilterConfig', { type });
      return await bffApi.getFilterConfig(type);
    } catch (error) {
      logError('loadFilterConfig failed:', error);
      throw error;
    }
  }, []);

  /**
   * 应用BFF筛选条件
   * 接口: POST /xypai-app-bff/api/home/filter/apply
   */
  const applyBffFilter = useCallback(async (
    type: HomeFeedType,
    filters: Record<string, any>,
    pageNum: number = 1,
    pageSize: number = 10
  ) => {
    try {
      log('applyBffFilter', { type, filterKeys: Object.keys(filters) });
      return await bffApi.applyFilter({
        type,
        filters,
        pageNum,
        pageSize,
      });
    } catch (error) {
      logError('applyBffFilter failed:', error);
      throw error;
    }
  }, []);

  // ========== 限时专享接口（新增） ==========

  /**
   * 获取限时专享列表
   * 接口: GET /xypai-app-bff/api/home/limited-time/list
   *
   * @param params - 查询参数
   * @returns 限时专享列表响应
   */
  const loadLimitedTimeList = useCallback(async (
    params: LimitedTimeQueryParams = {}
  ): Promise<LimitedTimeResponse> => {
    try {
      const { pageNum = 1, pageSize = 10, sortBy = 'smart', gender = 'all', language } = params;
      log('loadLimitedTimeList', { pageNum, pageSize, sortBy, gender, language });

      const response = await bffApi.getLimitedTimeList(params);

      log('loadLimitedTimeList success', {
        count: response.list?.length || 0,
        total: response.total,
        hasMore: response.hasMore,
      });

      return response;
    } catch (error) {
      logError('loadLimitedTimeList failed:', error);
      throw error;
    }
  }, []);

  // ========== 旧接口（保留向后兼容） ==========
  
  /**
   * @deprecated 使用loadFeed代替
   */
  const loadUsers = useCallback(async (filter?: string, region?: string): Promise<UserCard[]> => {
    console.warn('[useHomeData] loadUsers已废弃，请使用loadFeed');
    return [];
  }, []);

  /**
   * @deprecated 使用loadExperts代替
   */
  const loadLimitedOffers = useCallback(async (): Promise<UserCard[]> => {
    console.warn('[useHomeData] loadLimitedOffers已废弃，请使用loadExperts');
    return [];
  }, []);

  /**
   * @deprecated 搜索功能已移至搜索模块
   */
  const searchUsers = useCallback(async (query: string): Promise<UserCard[]> => {
    console.warn('[useHomeData] searchUsers已废弃，搜索功能已移至搜索模块');
    return [];
  }, []);

  /**
   * @deprecated 用户详情已移至用户模块
   */
  const getUserDetail = useCallback(async (userId: string): Promise<UserCard | null> => {
    console.warn('[useHomeData] getUserDetail已废弃，用户详情已移至用户模块');
    return null;
  }, []);

  return {
    // 新API
    loadHomeInit,
    loadExperts,
    loadTopicBanner,
    loadFeed,
    checkIn,
    refreshAll,
    // 互动功能
    likeFeed,
    collectFeed,
    shareFeed,
    // BFF用户推荐（新增）
    loadUserRecommendations,
    loadOnlineUsers,
    loadOfflineUsers,
    loadFilterConfig,
    applyBffFilter,
    // 限时专享（新增）
    loadLimitedTimeList,
    // 旧API（保留兼容）
    loadUsers,
    loadLimitedOffers,
    searchUsers,
    getUserDetail,
  };
};
