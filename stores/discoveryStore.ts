/**
 * Discovery Store - 发现页面状态管理
 * 
 * 基于Zustand实现，管理：
 * - 动态流数据（关注/热门/同城）
 * - 用户互动状态
 * - 评论数据
 * - 缓存策略
 */

import { create } from 'zustand';
import type { CommentItem, DiscoverListParams, SkilledUserVO, SkilledUsersParams, SkilledUsersResultVO } from '../services/api/discoveryApi';
import { discoveryApi } from '../services/api/discoveryApi';
import type { Feed } from '../src/features/Discovery/types';
import { transformDiscoverContentList, transformFeedList } from '../src/features/Discovery/utils/dataTransform';

// ==================== 类型定义 ====================

/**
 * Tab类型
 * 注：BFF API 使用 'nearby'，但前端UI显示为"同城"
 */
export type TabType = 'follow' | 'hot' | 'nearby';

/**
 * 动态流数据状态
 */
export interface FeedDataState {
  followFeeds: Feed[];
  hotFeeds: Feed[];
  nearbyFeeds: Feed[];

  // 分页状态
  page: {
    follow: number;
    hot: number;
    nearby: number;
  };

  // 是否还有更多
  hasMore: {
    follow: boolean;
    hot: boolean;
    nearby: boolean;
  };
}

/**
 * UI状态
 */
export interface UIState {
  activeTab: TabType;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastRefreshTime: number;
}

/**
 * 有技能用户数据状态
 */
export interface SkilledUsersState {
  list: SkilledUserVO[];
  total: number;
  pageNum: number;
  pageSize: number;
  hasMore: boolean;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  filters: {
    gender: 'all' | 'male' | 'female';
    sortBy: 'smart_recommend' | 'price_asc' | 'price_desc' | 'distance_asc';
  };
  filterOptions: SkilledUsersResultVO['filters'] | null;
}

/**
 * 评论缓存
 */
export interface CommentCache {
  [contentId: string]: CommentItem[];
}

/**
 * 搜索状态
 */
export interface SearchState {
  keyword: string;
  results: Feed[];
  loading: boolean;
  error: string | null;
  isSearching: boolean;  // 是否处于搜索模式
  searchHistory: string[];  // 搜索历史
}

/**
 * 发现页面Store状态
 */
export interface DiscoveryStore {
  // === 状态 ===
  feedData: FeedDataState;
  ui: UIState;
  commentCache: CommentCache;
  skilledUsers: SkilledUsersState;
  search: SearchState;

  // === 动态流操作 ===
  setActiveTab: (tab: TabType) => void;
  loadFeedList: (tab: TabType, refresh?: boolean) => Promise<void>;
  loadMoreFeeds: (tab: TabType) => Promise<void>;

  // === 搜索操作 ===
  setSearchKeyword: (keyword: string) => void;
  searchContents: (keyword: string) => Promise<void>;
  clearSearch: () => void;
  enterSearchMode: () => void;
  exitSearchMode: () => void;
  addToSearchHistory: (keyword: string) => void;
  clearSearchHistory: () => void;

  // === 有技能用户操作 ===
  loadSkilledUsers: (refresh?: boolean) => Promise<void>;
  loadMoreSkilledUsers: () => Promise<void>;
  setSkilledUsersFilter: (filters: Partial<SkilledUsersState['filters']>) => void;

  // === 互动操作 ===
  toggleLike: (feedId: string, tab: TabType) => Promise<void>;
  toggleCollect: (feedId: string, tab: TabType) => Promise<void>;
  shareFeed: (feedId: string) => Promise<void>;

  // === 评论操作 ===
  loadComments: (contentId: string) => Promise<void>;
  addComment: (contentId: string, text: string, replyToId?: string) => Promise<void>;
  toggleCommentLike: (commentId: string) => Promise<void>;

  // === 状态管理 ===
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setError: (error: string | null) => void;
  resetState: () => void;
}

// ==================== 初始状态 ====================

const initialFeedData: FeedDataState = {
  followFeeds: [],
  hotFeeds: [],
  nearbyFeeds: [],
  page: {
    follow: 1,
    hot: 1,
    nearby: 1,
  },
  hasMore: {
    follow: true,
    hot: true,
    nearby: true,
  },
};

const initialUIState: UIState = {
  activeTab: 'hot',
  loading: false,
  refreshing: false,
  error: null,
  lastRefreshTime: 0,
};

const initialSkilledUsersState: SkilledUsersState = {
  list: [],
  total: 0,
  pageNum: 1,
  pageSize: 20,
  hasMore: true,
  loading: false,
  refreshing: false,
  error: null,
  filters: {
    gender: 'all',
    sortBy: 'smart_recommend',
  },
  filterOptions: null,
};

const initialSearchState: SearchState = {
  keyword: '',
  results: [],
  loading: false,
  error: null,
  isSearching: false,
  searchHistory: [],
};

// ==================== Store创建 ====================

export const useDiscoveryStore = create<DiscoveryStore>((set, get) => ({
  // 初始状态
  feedData: initialFeedData,
  ui: initialUIState,
  commentCache: {},
  skilledUsers: initialSkilledUsersState,
  search: initialSearchState,

  // === Tab切换 ===
  setActiveTab: (tab: TabType) => {
    console.log('[DiscoveryStore] setActiveTab 被调用:', tab);
    set((state) => {
      console.log('[DiscoveryStore] 当前activeTab:', state.ui.activeTab, '-> 新activeTab:', tab);
      return {
        ui: { ...state.ui, activeTab: tab },
      };
    });
  },
  
  // === 加载动态流 ===
  loadFeedList: async (tab: TabType, refresh = false) => {
    const state = get();

    // 防止重复加载
    if (state.ui.loading || state.ui.refreshing) {
      return;
    }

    // 防止频繁刷新（5秒冷却）
    if (refresh) {
      const now = Date.now();
      if (now - state.ui.lastRefreshTime < 5000) {
        return;
      }
      set((state) => ({
        ui: { ...state.ui, refreshing: true },
      }));
    } else {
      set((state) => ({
        ui: { ...state.ui, loading: true },
      }));
    }

    try {
      const pageSize = 20;
      const pageNum = refresh ? 1 : state.feedData.page[tab];

      // 构建BFF查询参数
      const queryParams: DiscoverListParams = {
        tab: tab,
        pageNum: pageNum,
        pageSize: pageSize,
      };

      // 同城Tab需要传递经纬度（TODO: 从定位服务获取）
      if (tab === 'nearby') {
        // 默认使用深圳南山区坐标作为示例
        queryParams.latitude = 22.5431;
        queryParams.longitude = 113.9298;
      }

      // 调用BFF聚合接口
      const response = await discoveryApi.getDiscoverList(queryParams);

      if (response && response.list) {
        // 使用BFF专用转换函数
        const transformedFeeds = transformDiscoverContentList(response.list);

        set((state) => ({
          feedData: {
            ...state.feedData,
            [`${tab}Feeds`]: refresh ? transformedFeeds : [...state.feedData[`${tab}Feeds` as keyof FeedDataState] as Feed[], ...transformedFeeds],
            page: {
              ...state.feedData.page,
              [tab]: refresh ? 1 : state.feedData.page[tab],
            },
            hasMore: {
              ...state.feedData.hasMore,
              [tab]: response.hasMore,
            },
          },
          ui: {
            ...state.ui,
            loading: false,
            refreshing: false,
            error: null,
            lastRefreshTime: refresh ? Date.now() : state.ui.lastRefreshTime,
          },
        }));
      } else {
        // API返回空或失败，设置空列表
        set((state) => ({
          feedData: {
            ...state.feedData,
            [`${tab}Feeds`]: refresh ? [] : state.feedData[`${tab}Feeds` as keyof FeedDataState],
            hasMore: {
              ...state.feedData.hasMore,
              [tab]: false,
            },
          },
          ui: {
            ...state.ui,
            loading: false,
            refreshing: false,
            error: null,
          },
        }));
      }
    } catch (error) {
      console.error('加载动态流失败:', error);
      set((state) => ({
        ui: {
          ...state.ui,
          loading: false,
          refreshing: false,
          error: error instanceof Error ? error.message : '加载失败',
        },
      }));
    }
  },
  
  // === 加载更多 ===
  loadMoreFeeds: async (tab: TabType) => {
    const state = get();

    // 检查是否还有更多
    if (!state.feedData.hasMore[tab] || state.ui.loading || state.ui.refreshing) {
      return;
    }

    set((state) => ({
      ui: { ...state.ui, loading: true },
    }));

    try {
      const pageSize = 20;
      const nextPage = state.feedData.page[tab] + 1;

      // 构建BFF查询参数
      const queryParams: DiscoverListParams = {
        tab: tab,
        pageNum: nextPage,
        pageSize: pageSize,
      };

      // 同城Tab需要传递经纬度
      if (tab === 'nearby') {
        queryParams.latitude = 22.5431;
        queryParams.longitude = 113.9298;
      }

      const response = await discoveryApi.getDiscoverList(queryParams);

      if (response && response.list && response.list.length > 0) {
        const transformedFeeds = transformDiscoverContentList(response.list);

        set((state) => ({
          feedData: {
            ...state.feedData,
            [`${tab}Feeds`]: [...(state.feedData[`${tab}Feeds` as keyof FeedDataState] as Feed[]), ...transformedFeeds],
            page: {
              ...state.feedData.page,
              [tab]: nextPage,
            },
            hasMore: {
              ...state.feedData.hasMore,
              [tab]: response.hasMore,
            },
          },
          ui: {
            ...state.ui,
            loading: false,
            error: null,
          },
        }));
      } else {
        // 没有更多数据
        set((state) => ({
          feedData: {
            ...state.feedData,
            hasMore: {
              ...state.feedData.hasMore,
              [tab]: false,
            },
          },
          ui: {
            ...state.ui,
            loading: false,
            error: null,
          },
        }));
      }
    } catch (error) {
      console.error('加载更多失败:', error);
      set((state) => ({
        ui: {
          ...state.ui,
          loading: false,
          error: error instanceof Error ? error.message : '加载失败',
        },
      }));
    }
  },

  // === 搜索操作 ===
  setSearchKeyword: (keyword: string) => {
    set((state) => ({
      search: { ...state.search, keyword },
    }));
  },

  searchContents: async (keyword: string) => {
    if (!keyword || keyword.trim() === '') {
      set((state) => ({
        search: { ...state.search, results: [], loading: false, error: null },
      }));
      return;
    }

    set((state) => ({
      search: { ...state.search, keyword, loading: true, error: null },
    }));

    try {
      const response = await discoveryApi.searchContents({ keyword: keyword.trim(), limit: 50 });

      // 转换后端数据为前端格式
      const transformedResults = response.length > 0 ? transformFeedList(response) : [];

      set((state) => ({
        search: {
          ...state.search,
          results: transformedResults,
          loading: false,
          error: null,
        },
      }));

      // 添加到搜索历史
      get().addToSearchHistory(keyword.trim());
    } catch (error) {
      console.error('搜索失败:', error);
      set((state) => ({
        search: {
          ...state.search,
          loading: false,
          error: error instanceof Error ? error.message : '搜索失败',
        },
      }));
    }
  },

  clearSearch: () => {
    set((state) => ({
      search: { ...state.search, keyword: '', results: [], error: null },
    }));
  },

  enterSearchMode: () => {
    set((state) => ({
      search: { ...state.search, isSearching: true },
    }));
  },

  exitSearchMode: () => {
    set((state) => ({
      search: { ...state.search, isSearching: false, keyword: '', results: [], error: null },
    }));
  },

  addToSearchHistory: (keyword: string) => {
    set((state) => {
      const history = state.search.searchHistory.filter((k) => k !== keyword);
      return {
        search: {
          ...state.search,
          searchHistory: [keyword, ...history].slice(0, 10), // 保留最近10条
        },
      };
    });
  },

  clearSearchHistory: () => {
    set((state) => ({
      search: { ...state.search, searchHistory: [] },
    }));
  },

  // === 有技能用户操作 ===
  loadSkilledUsers: async (refresh = false) => {
    const state = get();

    // 防止重复加载
    if (state.skilledUsers.loading || state.skilledUsers.refreshing) {
      return;
    }

    if (refresh) {
      set((state) => ({
        skilledUsers: { ...state.skilledUsers, refreshing: true },
      }));
    } else {
      set((state) => ({
        skilledUsers: { ...state.skilledUsers, loading: true },
      }));
    }

    try {
      const { filters, pageSize } = state.skilledUsers;
      const response = await discoveryApi.getSkilledUsers({
        pageNum: 1,
        pageSize,
        gender: filters.gender,
        sortBy: filters.sortBy,
      });

      if (response) {
        set((state) => ({
          skilledUsers: {
            ...state.skilledUsers,
            list: response.list || [],
            total: response.total || 0,
            hasMore: response.hasMore || false,
            pageNum: 1,
            loading: false,
            refreshing: false,
            error: null,
            filterOptions: response.filters || null,
          },
        }));
      } else {
        set((state) => ({
          skilledUsers: {
            ...state.skilledUsers,
            loading: false,
            refreshing: false,
            error: '加载失败',
          },
        }));
      }
    } catch (error) {
      console.error('加载有技能用户失败:', error);
      set((state) => ({
        skilledUsers: {
          ...state.skilledUsers,
          loading: false,
          refreshing: false,
          error: error instanceof Error ? error.message : '加载失败',
        },
      }));
    }
  },

  loadMoreSkilledUsers: async () => {
    const state = get();

    // 检查是否还有更多
    if (!state.skilledUsers.hasMore || state.skilledUsers.loading || state.skilledUsers.refreshing) {
      return;
    }

    set((state) => ({
      skilledUsers: { ...state.skilledUsers, loading: true },
    }));

    try {
      const { filters, pageNum, pageSize } = state.skilledUsers;
      const nextPage = pageNum + 1;

      const response = await discoveryApi.getSkilledUsers({
        pageNum: nextPage,
        pageSize,
        gender: filters.gender,
        sortBy: filters.sortBy,
      });

      if (response) {
        set((state) => ({
          skilledUsers: {
            ...state.skilledUsers,
            list: [...state.skilledUsers.list, ...(response.list || [])],
            total: response.total || state.skilledUsers.total,
            hasMore: response.hasMore || false,
            pageNum: nextPage,
            loading: false,
            error: null,
          },
        }));
      } else {
        set((state) => ({
          skilledUsers: {
            ...state.skilledUsers,
            loading: false,
            hasMore: false,
          },
        }));
      }
    } catch (error) {
      console.error('加载更多有技能用户失败:', error);
      set((state) => ({
        skilledUsers: {
          ...state.skilledUsers,
          loading: false,
          error: error instanceof Error ? error.message : '加载失败',
        },
      }));
    }
  },

  setSkilledUsersFilter: (newFilters) => {
    set((state) => ({
      skilledUsers: {
        ...state.skilledUsers,
        filters: { ...state.skilledUsers.filters, ...newFilters },
        // 重置分页
        list: [],
        pageNum: 1,
        hasMore: true,
      },
    }));
    // 立即重新加载
    get().loadSkilledUsers(true);
  },

  // === 点赞操作（乐观更新） ===
  toggleLike: async (feedId: string, tab: TabType) => {
    const state = get();
    const feedKey = `${tab}Feeds` as keyof FeedDataState;
    const feeds = state.feedData[feedKey] as Feed[];
    const feed = feeds.find((f) => f.id === feedId);

    if (!feed) return;

    // 乐观更新UI
    const isCurrentlyLiked = feed.isLiked;
    set((state) => ({
      feedData: {
        ...state.feedData,
        [feedKey]: feeds.map((f) =>
          f.id === feedId
            ? {
                ...f,
                isLiked: !isCurrentlyLiked,
                likeCount: isCurrentlyLiked ? f.likeCount - 1 : f.likeCount + 1,
              }
            : f
        ),
      },
    }));

    try {
      // 调用BFF点赞接口
      const result = await discoveryApi.toggleDiscoverLike({
        contentId: feedId,
        action: isCurrentlyLiked ? 'unlike' : 'like',
      });

      // 如果API返回成功，更新为服务器返回的实际数据
      if (result && result.success) {
        set((state) => ({
          feedData: {
            ...state.feedData,
            [feedKey]: (state.feedData[feedKey] as Feed[]).map((f) =>
              f.id === feedId
                ? {
                    ...f,
                    isLiked: result.isLiked,
                    likeCount: result.likeCount,
                  }
                : f
            ),
          },
        }));
      }
    } catch (error) {
      console.error('点赞操作失败:', error);

      // 失败时回滚
      set((state) => ({
        feedData: {
          ...state.feedData,
          [feedKey]: feeds.map((f) =>
            f.id === feedId
              ? {
                  ...f,
                  isLiked: isCurrentlyLiked,
                  likeCount: feed.likeCount,
                }
              : f
          ),
        },
      }));
    }
  },
  
  // === 收藏操作（乐观更新） ===
  toggleCollect: async (feedId: string, tab: TabType) => {
    const state = get();
    const feedKey = `${tab}Feeds` as keyof FeedDataState;
    const feeds = state.feedData[feedKey] as Feed[];
    const feed = feeds.find((f) => f.id === feedId);
    
    if (!feed) return;
    
    // 乐观更新UI
    const isCurrentlyCollected = feed.isCollected;
    set((state) => ({
      feedData: {
        ...state.feedData,
        [feedKey]: feeds.map((f) =>
          f.id === feedId
            ? {
                ...f,
                isCollected: !isCurrentlyCollected,
                collectCount: isCurrentlyCollected ? f.collectCount - 1 : f.collectCount + 1,
              }
            : f
        ),
      },
    }));
    
    try {
      // 调用API
      if (isCurrentlyCollected) {
        await discoveryApi.uncollectFeed(Number(feedId));
      } else {
        await discoveryApi.collectFeed(Number(feedId));
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
      
      // 失败时回滚
      set((state) => ({
        feedData: {
          ...state.feedData,
          [feedKey]: feeds.map((f) =>
            f.id === feedId
              ? {
                  ...f,
                  isCollected: isCurrentlyCollected,
                  collectCount: feed.collectCount,
                }
              : f
          ),
        },
      }));
    }
  },
  
  // === 分享操作 ===
  shareFeed: async (feedId: string) => {
    try {
      await discoveryApi.shareFeed(Number(feedId));
      console.log('分享成功:', feedId);
    } catch (error) {
      console.error('分享失败:', error);
    }
  },
  
  // === 加载评论 ===
  loadComments: async (contentId: string) => {
    try {
      const response = await discoveryApi.getCommentList({
        contentId: Number(contentId),
        pageNum: 1,
        pageSize: 20,
      });
      
      if (response.success && response.data) {
        set((state) => ({
          commentCache: {
            ...state.commentCache,
            [contentId]: response.data as CommentItem[],
          },
        }));
      }
    } catch (error) {
      console.error('加载评论失败:', error);
    }
  },
  
  // === 添加评论 ===
  addComment: async (contentId: string, text: string, replyToId?: string) => {
    try {
      const response = await discoveryApi.addComment({
        contentId: Number(contentId),
        commentText: text,
        replyToId: replyToId ? Number(replyToId) : undefined,
      });
      
      if (response.success) {
        // 重新加载评论列表
        await get().loadComments(contentId);
      }
    } catch (error) {
      console.error('添加评论失败:', error);
      throw error;
    }
  },
  
  // === 评论点赞 ===
  toggleCommentLike: async (commentId: string) => {
    try {
      await discoveryApi.likeComment(Number(commentId));
      console.log('评论点赞成功:', commentId);
    } catch (error) {
      console.error('评论点赞失败:', error);
    }
  },
  
  // === 状态设置 ===
  setLoading: (loading: boolean) => {
    set((state) => ({
      ui: { ...state.ui, loading },
    }));
  },
  
  setRefreshing: (refreshing: boolean) => {
    set((state) => ({
      ui: { ...state.ui, refreshing },
    }));
  },
  
  setError: (error: string | null) => {
    set((state) => ({
      ui: { ...state.ui, error },
    }));
  },
  
  // === 重置状态 ===
  resetState: () => {
    set({
      feedData: initialFeedData,
      ui: initialUIState,
      commentCache: {},
      skilledUsers: initialSkilledUsersState,
      search: initialSearchState,
    });
  },
}));

// ==================== 选择器函数 ====================

/**
 * 获取当前Tab的动态列表
 */
export const useCurrentFeeds = () => {
  return useDiscoveryStore((state) => {
    const tab = state.ui.activeTab;
    switch (tab) {
      case 'follow':
        return state.feedData.followFeeds;
      case 'hot':
        return state.feedData.hotFeeds;
      case 'nearby':
        return state.feedData.nearbyFeeds;
      default:
        return [];
    }
  });
};

/**
 * 获取当前Tab的hasMore状态
 */
export const useCurrentHasMore = () => {
  return useDiscoveryStore((state) => state.feedData.hasMore[state.ui.activeTab]);
};

/**
 * 获取UI状态
 */
export const useDiscoveryUI = () => {
  return useDiscoveryStore((state) => state.ui);
};

/**
 * 获取评论数据
 */
export const useComments = (contentId: string) => {
  return useDiscoveryStore((state) => state.commentCache[contentId] || []);
};

/**
 * 获取当前激活的Tab
 */
export const useActiveTab = () => {
  return useDiscoveryStore((state) => state.ui.activeTab);
};

/**
 * 获取加载状态
 */
export const useDiscoveryLoading = () => {
  return useDiscoveryStore((state) => ({
    loading: state.ui.loading,
    refreshing: state.ui.refreshing,
  }));
};

/**
 * 获取错误状态
 */
export const useDiscoveryError = () => {
  return useDiscoveryStore((state) => state.ui.error);
};

/**
 * 获取有技能用户列表
 */
export const useSkilledUsers = () => {
  return useDiscoveryStore((state) => state.skilledUsers.list);
};

/**
 * 获取有技能用户加载状态
 */
export const useSkilledUsersLoading = () => {
  return useDiscoveryStore((state) => ({
    loading: state.skilledUsers.loading,
    refreshing: state.skilledUsers.refreshing,
  }));
};

/**
 * 获取有技能用户分页状态
 */
export const useSkilledUsersPagination = () => {
  return useDiscoveryStore((state) => ({
    total: state.skilledUsers.total,
    hasMore: state.skilledUsers.hasMore,
    pageNum: state.skilledUsers.pageNum,
  }));
};

/**
 * 获取有技能用户筛选条件
 */
export const useSkilledUsersFilters = () => {
  return useDiscoveryStore((state) => state.skilledUsers.filters);
};

/**
 * 获取有技能用户筛选选项
 */
export const useSkilledUsersFilterOptions = () => {
  return useDiscoveryStore((state) => state.skilledUsers.filterOptions);
};

/**
 * 获取搜索状态
 */
export const useSearch = () => {
  return useDiscoveryStore((state) => state.search);
};

/**
 * 获取搜索关键词
 */
export const useSearchKeyword = () => {
  return useDiscoveryStore((state) => state.search.keyword);
};

/**
 * 获取搜索结果
 */
export const useSearchResults = () => {
  return useDiscoveryStore((state) => state.search.results);
};

/**
 * 获取搜索加载状态
 */
export const useSearchLoading = () => {
  return useDiscoveryStore((state) => state.search.loading);
};

/**
 * 获取是否处于搜索模式
 */
export const useIsSearching = () => {
  return useDiscoveryStore((state) => state.search.isSearching);
};

/**
 * 获取搜索历史
 */
export const useSearchHistory = () => {
  return useDiscoveryStore((state) => state.search.searchHistory);
};

// ==================== Actions导出 ====================

/**
 * 导出所有Actions（用于在组件外调用）
 */
export const discoveryActions = {
  setActiveTab: () => useDiscoveryStore.getState().setActiveTab,
  loadFeedList: () => useDiscoveryStore.getState().loadFeedList,
  loadMoreFeeds: () => useDiscoveryStore.getState().loadMoreFeeds,
  toggleLike: () => useDiscoveryStore.getState().toggleLike,
  toggleCollect: () => useDiscoveryStore.getState().toggleCollect,
  shareFeed: () => useDiscoveryStore.getState().shareFeed,
  loadComments: () => useDiscoveryStore.getState().loadComments,
  addComment: () => useDiscoveryStore.getState().addComment,
  toggleCommentLike: () => useDiscoveryStore.getState().toggleCommentLike,
  loadSkilledUsers: () => useDiscoveryStore.getState().loadSkilledUsers,
  loadMoreSkilledUsers: () => useDiscoveryStore.getState().loadMoreSkilledUsers,
  setSkilledUsersFilter: () => useDiscoveryStore.getState().setSkilledUsersFilter,
  searchContents: () => useDiscoveryStore.getState().searchContents,
  clearSearch: () => useDiscoveryStore.getState().clearSearch,
  enterSearchMode: () => useDiscoveryStore.getState().enterSearchMode,
  exitSearchMode: () => useDiscoveryStore.getState().exitSearchMode,
  resetState: () => useDiscoveryStore.getState().resetState,
};

// ==================== 导出类型 ====================

export type {
    CommentCache, FeedDataState, SearchState, SkilledUsersState,
    UIState
};

