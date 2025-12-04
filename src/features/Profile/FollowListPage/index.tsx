/**
 * FollowListPage - 关注/粉丝列表统一页面
 *
 * 功能：
 * - 顶部 Tab 切换"关注"和"粉丝"
 * - 显示用户关注的所有用户或粉丝列表
 * - 支持互相关注状态显示
 * - 支持关注/取消关注操作
 * - 支持搜索过滤
 *
 * 文件结构：
 * - types.ts: 类型定义
 * - constants.ts: 常量和 Mock 数据
 * - components/: UI 组件
 * - api/: API 接口
 */

import { useAuthStore } from '@/src/features/AuthModule';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

// 组件导入
import { ContentArea, HeaderArea, SearchArea } from './components';

// 常量和类型导入
import {
  COLORS,
  MOCK_FOLLOWERS_DATA,
  MOCK_FOLLOWING_DATA,
  PAGE_SIZE,
  USE_REAL_API,
} from './constants';
import { FollowListPageProps, FollowUser, RelationUserItem, TabType } from './types';

// API 导入
import { relationApi } from './api';

// #region 数据转换

/**
 * 将后端返回数据转换为前端 FollowUser 格式
 */
const transformToFollowUser = (item: RelationUserItem): FollowUser => {
  const isMutual = item.relationStatus === 'mutual' || item.isMutualFollow === true;
  const isFollowing =
    item.isFollowing === true ||
    item.relationStatus === 'following' ||
    item.relationStatus === 'mutual';

  return {
    id: String(item.userId),
    name: item.nickname || '未知用户',
    avatar: item.avatar || 'https://i.pravatar.cc/150?img=1',
    age: item.age ?? undefined,
    gender: item.gender || 'other',
    description: item.signature || item.bio || '',
    isRealVerified: item.isVerified ?? false,
    isFollowing: isFollowing,
    mutualFollow: isMutual,
    relationStatus: item.relationStatus || 'none',
    isOnline: item.isOnline ?? false,
  };
};

// #endregion

// #region API 服务

/**
 * 加载关注列表数据
 */
const loadFollowingList = async (
  _userId: string,
  page: number,
  limit: number = PAGE_SIZE,
  keyword?: string
): Promise<{ users: FollowUser[]; hasMore: boolean; total: number }> => {
  try {
    if (USE_REAL_API) {
      console.log('[FollowListPage] 调用真实 API 获取关注列表');
      const response = await relationApi.getFollowingList(page, limit, keyword);

      const users = (response.rows || []).map(transformToFollowUser);
      const total = response.total || 0;
      const hasMore = page * limit < total;

      console.log('[FollowListPage] 关注列表加载成功:', users.length, '个用户, 总计:', total);
      return { users, hasMore, total };
    } else {
      // Mock 数据
      await new Promise((resolve) => setTimeout(resolve, 300));
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const filteredData = keyword
        ? MOCK_FOLLOWING_DATA.filter((u) => u.name.toLowerCase().includes(keyword.toLowerCase()))
        : MOCK_FOLLOWING_DATA;
      const users = filteredData.slice(startIndex, endIndex);

      return {
        users,
        hasMore: endIndex < filteredData.length,
        total: filteredData.length,
      };
    }
  } catch (error) {
    console.error('[FollowListPage] loadFollowingList error:', error);
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const users = MOCK_FOLLOWING_DATA.slice(startIndex, endIndex);
    return {
      users,
      hasMore: endIndex < MOCK_FOLLOWING_DATA.length,
      total: MOCK_FOLLOWING_DATA.length,
    };
  }
};

/**
 * 加载粉丝列表数据
 */
const loadFollowersList = async (
  _userId: string,
  page: number,
  limit: number = PAGE_SIZE,
  keyword?: string
): Promise<{ users: FollowUser[]; hasMore: boolean; total: number }> => {
  try {
    if (USE_REAL_API) {
      console.log('[FollowListPage] 调用真实 API 获取粉丝列表');
      const response = await relationApi.getFansList(page, limit, keyword);

      const users = (response.rows || []).map(transformToFollowUser);
      const total = response.total || 0;
      const hasMore = page * limit < total;

      console.log('[FollowListPage] 粉丝列表加载成功:', users.length, '个用户, 总计:', total);
      return { users, hasMore, total };
    } else {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const filteredData = keyword
        ? MOCK_FOLLOWERS_DATA.filter((u) => u.name.toLowerCase().includes(keyword.toLowerCase()))
        : MOCK_FOLLOWERS_DATA;
      const users = filteredData.slice(startIndex, endIndex);

      return {
        users,
        hasMore: endIndex < filteredData.length,
        total: filteredData.length,
      };
    }
  } catch (error) {
    console.error('[FollowListPage] loadFollowersList error:', error);
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const users = MOCK_FOLLOWERS_DATA.slice(startIndex, endIndex);
    return {
      users,
      hasMore: endIndex < MOCK_FOLLOWERS_DATA.length,
      total: MOCK_FOLLOWERS_DATA.length,
    };
  }
};

/**
 * 关注/取消关注用户
 */
const toggleFollowUser = async (
  targetUserId: string,
  currentlyFollowing: boolean
): Promise<boolean> => {
  try {
    if (USE_REAL_API) {
      console.log(`[FollowListPage] ${currentlyFollowing ? '取消关注' : '关注'} 用户:`, targetUserId);
      await relationApi.toggleFollow(targetUserId, currentlyFollowing);
      return true;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return true;
    }
  } catch (error) {
    console.error('[FollowListPage] toggleFollowUser error:', error);
    return false;
  }
};

// #endregion

// #region 状态管理 Hook

/**
 * 关注/粉丝列表页面状态管理 Hook
 */
const useFollowListState = (userId?: string, initialTab: TabType = 'following') => {
  const router = useRouter();
  const userInfo = useAuthStore((state) => state.userInfo);
  const targetUserId = userId || userInfo?.id || 'mock_user_id';

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Tab 切换时重新加载数据
  useEffect(() => {
    setUsers([]);
    setPage(1);
    setHasMore(true);
    loadData(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // 加载数据
  const loadData = async (pageNum: number, isRefresh: boolean = false) => {
    if (loading) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result =
        activeTab === 'following'
          ? await loadFollowingList(targetUserId, pageNum)
          : await loadFollowersList(targetUserId, pageNum);

      if (isRefresh) {
        setUsers(result.users);
        setPage(1);
      } else {
        setUsers((prev) => [...prev, ...result.users]);
      }

      setHasMore(result.hasMore);
    } catch (error) {
      console.error('[FollowListPage] loadData error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => loadData(1, true);

  const onLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadData(nextPage);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchQuery('');
    setShowSearch(false);
  };

  const handleToggleFollow = async (user: FollowUser) => {
    const currentlyFollowing = user.isFollowing || false;
    const success = await toggleFollowUser(user.id, currentlyFollowing);

    if (success) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
                ...u,
                isFollowing: !currentlyFollowing,
                mutualFollow:
                  activeTab === 'followers'
                    ? !currentlyFollowing && u.mutualFollow !== undefined
                    : u.mutualFollow,
              }
            : u
        )
      );

      if (activeTab === 'following' && currentlyFollowing) {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
      }
    }
  };

  const handleUserPress = (user: FollowUser) => {
    router.push(`/profile/${user.id}`);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const filteredUsers = searchQuery
    ? users.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : users;

  return {
    activeTab,
    users: filteredUsers,
    loading,
    refreshing,
    hasMore,
    searchQuery,
    showSearch,
    setSearchQuery,
    setShowSearch,
    handleTabChange,
    onRefresh,
    onLoadMore,
    handleToggleFollow,
    handleUserPress,
    handleBack,
  };
};

// #endregion

// #region 主组件

/**
 * FollowListPage - 关注/粉丝列表统一页面主组件
 */
const FollowListPage: React.FC<FollowListPageProps> = ({ userId, initialTab = 'following' }) => {
  const state = useFollowListState(userId, initialTab);

  return (
    <View style={styles.container}>
      {state.showSearch ? (
        <SearchArea
          searchQuery={state.searchQuery}
          onSearchQueryChange={state.setSearchQuery}
          onCancel={() => {
            state.setShowSearch(false);
            state.setSearchQuery('');
          }}
        />
      ) : (
        <HeaderArea
          activeTab={state.activeTab}
          onTabChange={state.handleTabChange}
          onSearchPress={() => state.setShowSearch(true)}
          onBack={state.handleBack}
        />
      )}

      <ContentArea
        users={state.users}
        activeTab={state.activeTab}
        loading={state.loading}
        refreshing={state.refreshing}
        hasMore={state.hasMore}
        hasSearch={!!state.searchQuery}
        onRefresh={state.onRefresh}
        onLoadMore={state.onLoadMore}
        onUserPress={state.handleUserPress}
        onFollowToggle={state.handleToggleFollow}
      />
    </View>
  );
};

// #endregion

// #region 样式

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
});

// #endregion

// #region 导出

export default FollowListPage;
export { FollowListPage };
export type { FollowListPageProps, FollowUser, TabType };

// #endregion
