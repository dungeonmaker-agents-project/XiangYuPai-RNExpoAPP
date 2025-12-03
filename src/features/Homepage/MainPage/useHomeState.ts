/**
 * useHomeState - 首页状态管理Hook
 * 统一管理首页所有状态逻辑
 *
 * 版本: v3.0 - 使用用户推荐API替代Feed API
 * 更新: 2025-11-28
 *
 * 重要说明：
 * - 首页主列表展示"用户推荐卡片"，不是动态内容流
 * - 用户推荐API: GET /xypai-app-bff/api/home/feed
 * - Feed动态流用于"发现"页面，不是首页
 */

import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
// 🆕 导入认证状态
import { useAuthStore } from '../../../features/AuthModule';
import { useHomeData } from './useHomeData';
import type { BffUserCard, HomeFeedType, LimitedTimeUserCard } from '../../../../services/api/bffApi';
import type {
  FeedItem,
  HomeInitResponse,
  ExpertsResponse,
  LocationInfo,
  UserCard
} from './types';

/**
 * 将BffUserCard转换为前端UserCard格式
 */
const mapBffUserCardToUserCard = (bffUser: BffUserCard, index: number): UserCard => {
  // 将在线状态转换为前端格式
  const statusMap: Record<number, 'online' | 'available' | 'offline'> = {
    1: 'online',
    2: 'available',
    0: 'offline',
  };

  // 将距离从米转换为公里
  const distanceKm = bffUser.distance
    ? Math.round((bffUser.distance / 1000) * 10) / 10
    : 0;

  // 生成价格显示文本
  const priceText = bffUser.price
    ? `¥${bffUser.price}/小时`
    : undefined;

  // 转换动态数据
  const feeds = bffUser.feeds?.map(feed => ({
    feedId: feed.feedId,
    coverImage: feed.coverImage,
    content: feed.content,
    likeCount: feed.likeCount,
    commentCount: feed.commentCount,
  })) || [];

  // 使用动态封面图作为照片（如果有动态的话）
  const photos = feeds.length > 0
    ? feeds.map(f => f.coverImage).filter(Boolean)
    : [];

  return {
    id: bffUser.userId,
    avatar: bffUser.avatar,
    username: bffUser.nickname,
    age: bffUser.age || 0,
    bio: bffUser.signature || '这个家伙很神秘，没有填写简介',
    services: bffUser.serviceTags || [],
    distance: distanceKm,
    status: statusMap[bffUser.onlineStatus ?? 0] || 'offline',
    photos: photos,
    price: priceText,
    region: bffUser.cityName,
    rating: bffUser.rating,
    orderCount: bffUser.orderCount,
    // 扩展认证字段（可用于UI展示）
    isSpecialOffer: bffUser.isVip,
    listIndex: index,
    // 动态数据
    feeds: feeds,
    feedCount: bffUser.feedCount || feeds.length,
  };
};

/**
 * 将限时专享用户卡片转换为前端UserCard格式
 * 接口: GET /xypai-app-bff/api/home/limited-time/list
 */
const mapLimitedTimeUserCardToUserCard = (user: LimitedTimeUserCard, index: number): UserCard => {
  // 将距离从米转换为公里
  const distanceKm = user.distance
    ? Math.round((user.distance / 1000) * 10) / 10
    : 0;

  // 生成价格显示文本
  const priceText = user.price?.displayText || `${user.price?.amount || 0}金币/小时`;

  return {
    id: String(user.userId),
    avatar: user.avatar,
    username: user.nickname,
    age: user.age || 0,
    bio: user.skill?.description || `${user.skill?.gameName || ''} ${user.skill?.gameRank || ''}`,
    services: user.tags || [],
    distance: distanceKm,
    status: user.isOnline ? 'online' : 'offline',
    photos: [], // 限时专享暂不返回作品照片
    price: priceText,
    region: user.distanceText,
    rating: user.rating,
    orderCount: user.orderCount,
    // 扩展字段
    isSpecialOffer: true,
    displayService: user.skill?.skillName,
    listIndex: index,
  };
};

/**
 * 根据activeFilter映射到BFF API的type参数
 * - nearby/recommend/latest -> 根据业务逻辑映射
 * - 当前BFF支持: online(线上) / offline(线下)
 */
const mapFilterToHomeFeedType = (filter: string): HomeFeedType => {
  // 首页Tab: 附近/推荐/最新 -> BFF暂时都用 offline（线下用户更符合"附近"场景）
  // 后续后端实现nearby/recommend/latest后可直接映射
  switch (filter) {
    case 'nearby':
      return 'offline'; // 附近 -> 线下用户
    case 'recommend':
      return 'online';  // 推荐 -> 线上用户（暂定）
    case 'latest':
      return 'offline'; // 最新 -> 线下用户（暂定）
    default:
      return 'offline';
  }
};

/**
 * 首页状态管理Hook
 */
export const useHomeState = () => {
  // 🆕 在Hook顶层调用router和authStore（修复Hook规则错误）
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('nearby');
  const [activeRegion, setActiveRegion] = useState('全部');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState<LocationInfo>({ city: '深圳' });

  // ========== 用户推荐列表状态（首页主列表） ==========
  const [users, setUsers] = useState<UserCard[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersHasMore, setUsersHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // 限时专享用户（独立区域）
  const [limitedOffers, setLimitedOffers] = useState<UserCard[]>([]);

  // 新增状态 - 根据接口文档
  const [homeInit, setHomeInit] = useState<HomeInitResponse | null>(null);
  const [experts, setExperts] = useState<ExpertsResponse | null>(null);

  // Feed流状态（保留用于发现页面，首页不使用）
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [feedHasMore, setFeedHasMore] = useState(true);
  const [currentFeedTab, setCurrentFeedTab] = useState<'follow' | 'hot' | 'local'>('hot');

  // 获取数据管理Hook
  const homeData = useHomeData();

  // ========== 根据接口文档的数据加载函数 ==========

  /**
   * 加载首页初始化数据
   * 注意：目前仍使用Mock数据，待后端实现 /api/home/init 接口后切换
   */
  const loadHomeInitData = useCallback(async () => {
    try {
      console.log('[useHomeState] 🔄 加载首页初始化数据');
      const data = await homeData.loadHomeInit();
      setHomeInit(data);
      console.log('[useHomeState] ✅ 首页初始化数据加载完成');
    } catch (error) {
      console.error('[useHomeState] ❌ 加载首页初始化失败', error);
    }
  }, [homeData]);

  /**
   * 加载专家推荐
   */
  const loadExpertsData = useCallback(async () => {
    try {
      console.log('[useHomeState] 🔄 加载专家推荐数据');
      const data = await homeData.loadExperts();
      setExperts(data);
      console.log('[useHomeState] ✅ 专家推荐数据加载完成');
    } catch (error) {
      console.error('[useHomeState] ❌ 加载专家推荐失败', error);
    }
  }, [homeData]);

  /**
   * 🆕 加载限时专享数据
   * 接口: GET /xypai-app-bff/api/home/limited-time/list
   */
  const loadLimitedTimeData = useCallback(async () => {
    try {
      console.log('[useHomeState] 🔄 加载限时专享数据...');
      const startTime = Date.now();

      const response = await homeData.loadLimitedTimeList({
        pageNum: 1,
        pageSize: 10,
        sortBy: 'smart',
        gender: 'all',
      });

      // 转换为前端 UserCard 格式
      const mappedOffers = response.list.map((user, index) =>
        mapLimitedTimeUserCardToUserCard(user, index)
      );

      setLimitedOffers(mappedOffers);

      const duration = Date.now() - startTime;
      console.log('[useHomeState] ✅ 限时专享数据加载完成', {
        count: mappedOffers.length,
        total: response.total,
        hasMore: response.hasMore,
        duration: `${duration}ms`,
        firstUser: mappedOffers[0] ? {
          id: mappedOffers[0].id,
          username: mappedOffers[0].username,
          price: mappedOffers[0].price,
        } : null,
      });
    } catch (error) {
      console.error('[useHomeState] ❌ 加载限时专享失败', error);
      // 失败时保持空数组，不影响页面其他部分
      setLimitedOffers([]);
    }
  }, [homeData]);

  /**
   * 🆕 加载首页用户推荐列表（主列表）
   * 接口: GET /xypai-app-bff/api/home/feed
   *
   * @param filter - 筛选类型: nearby(附近) / recommend(推荐) / latest(最新)
   * @param pageNum - 页码
   * @param append - 是否追加到现有列表（用于上拉加载更多）
   */
  const loadUserRecommendations = useCallback(async (
    filter: string = activeFilter,
    pageNum: number = 1,
    append: boolean = false
  ) => {
    try {
      console.log('[useHomeState] 🔄 加载用户推荐列表', { filter, pageNum, append });
      setLoading(!append); // 首次加载显示loading，追加不显示

      // 将前端filter映射到BFF API的type参数
      const feedType = mapFilterToHomeFeedType(filter);

      const response = await homeData.loadUserRecommendations(feedType, pageNum, 10);

      // 将BffUserCard转换为前端UserCard格式
      const mappedUsers = response.list.map((bffUser, index) =>
        mapBffUserCardToUserCard(bffUser, (pageNum - 1) * 10 + index)
      );

      if (append) {
        setUsers(prev => [...prev, ...mappedUsers]);
      } else {
        setUsers(mappedUsers);
      }

      setUsersTotal(response.total);
      setUsersHasMore(response.hasMore);
      setCurrentPage(pageNum);

      console.log('[useHomeState] ✅ 用户推荐列表加载完成', {
        count: mappedUsers.length,
        total: response.total,
        hasMore: response.hasMore
      });
    } catch (error) {
      console.error('[useHomeState] ❌ 加载用户推荐列表失败', error);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, homeData]);

  /**
   * 上拉加载更多用户
   */
  const loadMoreUsers = useCallback(() => {
    if (!loading && usersHasMore) {
      loadUserRecommendations(activeFilter, currentPage + 1, true);
    }
  }, [loading, usersHasMore, currentPage, activeFilter, loadUserRecommendations]);

  /**
   * 切换筛选Tab时重新加载数据
   */
  const handleFilterChange = useCallback((newFilter: string) => {
    console.log('[useHomeState] 🔄 切换筛选Tab', { from: activeFilter, to: newFilter });
    setActiveFilter(newFilter);
    // 重新加载第一页数据
    loadUserRecommendations(newFilter, 1, false);
  }, [activeFilter, loadUserRecommendations]);

  /**
   * @deprecated Feed流加载函数（用于发现页面，首页不使用）
   * 接口: GET /xypai-content/api/v1/content/feed/{tabType}
   */
  const loadFeedData = useCallback(async (
    tabType: 'follow' | 'hot' | 'local' = 'hot',
    pageNum: number = 1,
    append: boolean = false
  ) => {
    try {
      console.log('[useHomeState] 🔄 加载Feed流数据（发现页面用）', { tabType, pageNum, append });

      const data = await homeData.loadFeed(tabType, pageNum, 10);

      if (append) {
        setFeedItems(prev => [...prev, ...data.list]);
      } else {
        setFeedItems(data.list);
        setCurrentFeedTab(tabType);
      }

      setFeedHasMore(data.hasMore);

      console.log('[useHomeState] ✅ Feed流数据加载完成', {
        count: data.list.length,
        hasMore: data.hasMore
      });
    } catch (error) {
      console.error('[useHomeState] ❌ 加载Feed流失败', error);
    }
  }, [homeData]);

  /**
   * @deprecated 上拉加载更多Feed（发现页面用）
   */
  const loadMoreFeed = useCallback(() => {
    console.warn('[useHomeState] loadMoreFeed已废弃，首页请使用loadMoreUsers');
  }, []);

  // 搜索处理（TODO：待集成真实搜索API）
  const handleSearch = useMemo(
    () => {
      let timeoutId: number;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (query.trim()) {
            console.log('[useHomeState] 🔍 执行搜索', { query });
            // TODO: 集成真实搜索API (bffApi.executeSearch)
          }
        }, 300);
      };
    },
    []
  );

  // 刷新处理 - 🆕 使用用户推荐API
  const handleRefresh = useCallback(() => {
    console.log('[useHomeState] 🔄 用户触发下拉刷新');

    // 🎯 检查登录状态（使用顶层的isAuthenticated）
    if (!isAuthenticated) {
      console.log('[useHomeState] 🔐 用户未登录，直接跳转登录页');
      setRefreshing(false);

      // 🎯 直接跳转到登录页，不显示弹窗
      router.push({
        pathname: '/auth/login',
        params: { returnTo: '/(tabs)/homepage' },
      });
      return;
    }

    // ✅ 已登录，执行刷新
    console.log('[useHomeState] ✅ 用户已登录，执行刷新');
    setRefreshing(true);

    // 🆕 并发刷新所有数据（使用用户推荐API替代Feed API）
    Promise.all([
      loadHomeInitData(),
      loadExpertsData(),
      loadLimitedTimeData(),  // ✅ 限时专享API
      loadUserRecommendations(activeFilter, 1, false), // ✅ 使用用户推荐API
    ])
      .then(() => {
        console.log('[useHomeState] ✅ 刷新完成');
      })
      .catch(error => {
        console.error('[useHomeState] ❌ 刷新失败', error);
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, [
    isAuthenticated,
    router,
    loadHomeInitData,
    loadExpertsData,
    loadLimitedTimeData,
    loadUserRecommendations,
    activeFilter,
  ]);

  // 初始化数据加载 - 🆕 使用用户推荐API
  // 只在组件挂载时执行一次
  useEffect(() => {
    console.log('[useHomeState] 🚀 开始初始化加载', {
      activeFilter,
      activeRegion,
      location: location.city,
    });

    // 🆕 并行加载所有数据（使用用户推荐API替代Feed API）
    Promise.all([
      loadHomeInitData(),      // Mock：首页初始化
      loadExpertsData(),       // Mock：专家推荐
      loadLimitedTimeData(),   // ✅ 限时专享API
      loadUserRecommendations(activeFilter, 1, false),  // ✅ 用户推荐API
    ]).then(() => {
      console.log('[useHomeState] ✅ 初始化加载完成');
    }).catch(error => {
      console.error('[useHomeState] ❌ 初始化加载失败', error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空依赖数组，只在组件挂载时执行一次

  return {
    // 搜索和筛选状态
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter: handleFilterChange, // 🆕 使用带数据刷新的handler
    activeRegion,
    setActiveRegion,

    // 🆕 用户推荐列表状态（首页主列表）
    users,
    usersTotal,
    usersHasMore,

    // 限时专享用户
    limitedOffers,

    // 新数据状态（根据接口文档）
    homeInit,
    experts,

    // Feed状态（保留用于发现页面，首页不使用）
    feedItems,
    feedHasMore,
    currentPage,
    currentFeedTab,
    setCurrentFeedTab,

    // 通用状态
    loading,
    refreshing,
    location,
    setLocation,

    // 操作函数
    handleSearch,
    handleRefresh,

    // 🆕 数据加载函数
    loadHomeInitData,
    loadExpertsData,
    loadLimitedTimeData,      // ✅ 限时专享API
    loadUserRecommendations,  // 首页用户推荐
    loadMoreUsers,            // 上拉加载更多用户

    // @deprecated Feed相关（发现页面用）
    loadFeedData,
    loadMoreFeed,
  };
};
