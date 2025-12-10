// #region 1. File Banner & TOC
/**
 * MainPage - 首页主页面
 * 
 * 功能：
 * - 首页区域展示（顶部导航、游戏横幅、功能网格、限时专享、组队聚会）
 * - 用户列表展示（筛选、排序、无限滚动）
 * - 下拉刷新和状态管理
 * - 导航和交互处理
 * 
 * TOC (快速跳转):
 * [1] File Banner & TOC
 * [2] Imports
 * [3] Types & Schema
 * [4] Constants & Config
 * [5] Utils & Helpers
 * [6] State Management
 * [7] Domain Logic
 * [8] UI Components & Rendering
 * [9] Exports
 */
// #endregion

// #region 2. Imports
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo } from 'react';
import {
    ImageBackground,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// 类型和常量
import { COLORS } from './constants';
import type { UserCard, FeedItem } from './types';

// 区域组件
import {
    FilterTabsArea,
    FunctionGridArea,
    GameBannerArea,
    HeaderArea,
    LimitedOffersArea,
    TeamPartyArea,
    UserListArea,
} from './components';

// 状态管理Hooks
import { useHomeState } from './useHomeState';
// #endregion

// #region 3. Types & Schema
interface MainPageProps {
  initialFilter?: string;
  initialRegion?: string;
}
// #endregion

// #region 4. Constants & Config
const PAGE_CONFIG = {
  INITIAL_LOAD_DELAY: 500,
  REFRESH_COOLDOWN: 3000,
  FAB_SIZE: 56,
} as const;
// #endregion

// #region 5. Utils & Helpers
/**
 * 格式化相对时间
 */
const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  
  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`;
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`;
  } else {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}-${date.getDate()}`;
  }
};
// #endregion

// #region 6. State Management
/**
 * MainPage状态管理（使用useHomeState Hook）
 */
// 状态管理已移至 useHomeState.ts
// #endregion

// #region 7. Domain Logic
/**
 * MainPage业务逻辑Hook
 */
const useMainPageLogic = (props: MainPageProps) => {
  const router = useRouter();

  // 组件挂载日志
  useEffect(() => {
    console.log('[MainPage] 🎬 组件已挂载', {
      initialFilter: props.initialFilter,
      initialRegion: props.initialRegion,
    });
  }, [props.initialFilter, props.initialRegion]);

  // 使用状态管理Hook
  const {
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    activeRegion,
    setActiveRegion,
    // 🆕 用户推荐列表（首页主列表）
    users,
    usersHasMore,
    loadMoreUsers,
    // 限时专享
    limitedOffers,
    // Feed流数据（保留用于发现页面，首页不使用）
    feedItems,
    feedHasMore,
    loadMoreFeed,
    // 通用状态
    loading,
    refreshing,
    location,
    handleSearch,
    handleRefresh,
  } = useHomeState();

  // 调试日志：检查users数据
  useEffect(() => {
    console.log('[MainPage] 📊 users 数据变化', {
      usersCount: users?.length || 0,
      firstUser: users?.[0] ? {
        id: users[0].id,
        username: users[0].username,
        status: users[0].status,
      } : null,
    });
  }, [users]);

  /**
   * 位置选择处理
   */
  const handleLocationPress = useCallback(() => {
    console.log('[MainPage] 🧭 导航: 首页 → 位置选择');
    router.push('/(tabs)/homepage/location');
  }, [router]);

  /**
   * 搜索页面跳转
   */
  const handleSearchPress = useCallback(() => {
    console.log('[MainPage] 🧭 导航: 首页 → 搜索页面');
    router.push('/(tabs)/homepage/search');
  }, [router]);

  /**
   * 游戏横幅点击 - 跳转到王者荣耀陪玩列表页
   */
  const handleGameBannerPress = useCallback(() => {
    console.log('[MainPage] 🧭 导航: 首页横幅 → 王者荣耀列表页');
    router.push({
      pathname: '/(tabs)/homepage/game-player-list',
      params: { skillType: '王者荣耀', gameId: 'honor_of_kings' },
    });
  }, [router]);

  /**
   * 功能点击处理 - 跳转到对应技能列表页
   */
  const handleFunctionPress = useCallback((functionId: string) => {
    // 功能ID映射配置: { skillType: 显示名称, gameId: API参数 }
    const skillConfigMap: Record<string, { skillType: string; gameId: string }> = {
      '1': { skillType: '王者荣耀', gameId: 'honor_of_kings' },
      '2': { skillType: '英雄联盟', gameId: 'lol' },
      '3': { skillType: '和平精英', gameId: 'pubg' },
      '4': { skillType: '荒野乱斗', gameId: 'brawl_stars' },
      '5': { skillType: '探店', gameId: 'explore_store' },
      '6': { skillType: '私影', gameId: 'private_photo' },
      '7': { skillType: '台球', gameId: 'billiards' },
      '8': { skillType: 'K歌', gameId: 'karaoke' },
      '9': { skillType: '喝酒', gameId: 'drinking' },
      '10': { skillType: '按摩', gameId: 'massage' },
    };
    const config = skillConfigMap[functionId] || { skillType: '王者荣耀', gameId: 'honor_of_kings' };

    console.log('[MainPage] 🧭 导航: 首页功能 → 技能列表页', { functionId, skillType: config.skillType, gameId: config.gameId });
    router.push({
      pathname: '/(tabs)/homepage/game-player-list',
      params: { skillType: config.skillType, gameId: config.gameId },
    });
  }, [router]);

  /**
   * 用户点击处理 - 直接跳转到完整的其他用户主页
   */
  const handleUserPress = useCallback((user: UserCard) => {
    console.log('[MainPage] 🧭 导航: 首页 → 其他用户完整主页', { userId: user.id, username: user.username });
    router.push({
      pathname: '/profile/[userId]',
      params: { userId: user.id },
    });
  }, [router]);

  /**
   * 动态卡片点击处理 - 跳转到动态详情页
   */
  const handleFeedPress = useCallback((feed: FeedItem) => {
    console.log('[MainPage] 🧭 导航: 首页 → 动态详情', { feedId: feed.id });
    router.push({
      pathname: '/feed/[id]',
      params: { id: feed.id },
    });
  }, [router]);

  /**
   * 动态卡片用户点击处理 - 跳转到用户主页
   */
  const handleFeedUserPress = useCallback((userId: string) => {
    console.log('[MainPage] 🧭 导航: 首页 → 用户主页', { userId });
    router.push({
      pathname: '/profile/[userId]',
      params: { userId },
    });
  }, [router]);

  /**
   * 上拉加载更多
   */
  const handleEndReached = useCallback(() => {
    // 🆕 使用用户推荐加载更多（不再使用feedItems）
    if (usersHasMore && !loading) {
      console.log('[MainPage] 📜 上拉加载更多用户');
      loadMoreUsers();
    }
  }, [usersHasMore, loading, loadMoreUsers]);

  /**
   * 限时专项用户点击处理 - 直接跳转到用户主页
   * 注：原本跳转到服务详情页，现改为直接跳转用户主页，便于用户引流
   */
  const handleLimitedOfferPress = useCallback((user: UserCard) => {
    console.log('[MainPage] 🧭 导航: 首页限时专项 → 用户主页', { userId: user.id, username: user.username });
    router.push({
      pathname: '/profile/[userId]',
      params: { userId: user.id },
    });
  }, [router]);

  /**
   * 查看用户完整个人主页
   * 跳转到其他用户的完整主页（使用 OtherUserProfilePage）
   */
  const handleViewUserProfile = useCallback((userId: string) => {
    console.log('[MainPage] 🧭 导航: 首页 → 其他用户主页', { userId });
    router.push({
      pathname: '/profile/[userId]',
      params: { userId },
    });
  }, [router]);

  /**
   * 跳转到发现页面
   */
  const handleGoToDiscovery = useCallback(() => {
    console.log('[MainPage] 🧭 导航: 首页 → 发现页面');
    router.push('/(tabs)/discover');
  }, [router]);

  /**
   * 查看动态详情
   */
  const handleViewPost = useCallback((postId: string) => {
    console.log('[MainPage] 🧭 导航: 首页 → 动态详情', { postId });
    router.push({
      pathname: '/feed/[id]',
      params: { id: postId },
    });
  }, [router]);

  /**
   * 查看更多专享
   */
  const handleMoreOffersPress = useCallback(() => {
    router.push('/(tabs)/homepage/featured');
  }, [router]);

  /**
   * 组局中心点击
   */
  const handleTeamPartyPress = useCallback(() => {
    console.log('[MainPage] 🧭 导航: 首页 → 组局中心');
    router.push('/activity');
  }, [router]);

  /**
   * 发布按钮点击
   */
  const handlePublishPress = useCallback(() => {
    router.push('/publish');
  }, [router]);

  return {
    // 状态
    searchQuery,
    activeFilter,
    activeRegion,
    // 🆕 用户推荐列表（首页主列表）
    users,
    usersHasMore,
    // 限时专享
    limitedOffers,
    // Feed流数据（保留用于发现页面，首页不使用）
    feedItems,
    feedHasMore,
    // 通用状态
    loading,
    refreshing,
    location,

    // 事件处理
    setSearchQuery,
    setActiveFilter,
    setActiveRegion,
    handleSearch,
    handleRefresh,
    handleLocationPress,
    handleSearchPress,
    handleGameBannerPress,
    handleFunctionPress,
    handleUserPress,
    // Feed相关处理（保留用于发现页面）
    handleFeedPress,
    handleFeedUserPress,
    handleEndReached,
    handleLimitedOfferPress,
    handleViewUserProfile,
    handleGoToDiscovery,
    handleViewPost,
    handleMoreOffersPress,
    handleTeamPartyPress,
    handlePublishPress,
  };
};
// #endregion

// #region 8. UI Components & Rendering
/**
 * MainPage主组件
 */
const MainPage: React.FC<MainPageProps> = (props) => {
  const {
    searchQuery,
    activeFilter,
    activeRegion,
    // 🆕 用户推荐列表（首页主列表）
    users,
    usersHasMore,
    // 限时专享
    limitedOffers,
    // Feed流数据（保留但不使用，首页展示用户卡片）
    feedItems,
    feedHasMore,
    // 通用状态
    loading,
    refreshing,
    location,
    setSearchQuery,
    setActiveFilter,
    setActiveRegion,
    handleSearch,
    handleRefresh,
    handleLocationPress,
    handleSearchPress,
    handleGameBannerPress,
    handleFunctionPress,
    handleUserPress,
    // Feed相关处理（保留用于发现页面）
    handleFeedPress,
    handleFeedUserPress,
    handleEndReached,
    handleLimitedOfferPress,
    handleViewUserProfile,
    handleGoToDiscovery,
    handleViewPost,
    handleMoreOffersPress,
    handleTeamPartyPress,
    handlePublishPress,
  } = useMainPageLogic(props);

  // 列表头部组件 - 包含所有顶部区域（包括 Header）
  const renderListHeader = useMemo(() => (
    <ImageBackground
      source={require('../../../../assets/images/images/backgrounds/linearGradint.png')}
      style={styles.upperAreaBackground}
      resizeMode="stretch"
    >
      {/* 顶部导航区域 */}
      <HeaderArea
        location={location}
        onLocationPress={handleLocationPress}
        onSearch={handleSearch}
        onSearchPress={handleSearchPress}
      />

      {/* 游戏横幅区域 */}
      <GameBannerArea onPress={handleGameBannerPress} />

      {/* 功能服务网格区域 */}
      <FunctionGridArea onFunctionPress={handleFunctionPress} />

      {/*
       * 🚫 限时专享区域 - 暂时隐藏
       *
       * 隐藏原因：功能暂时冗余，后续产品迭代时可恢复
       * 恢复方式：取消下方注释即可
       *
       * 相关代码位置：
       * - 组件: src/features/Homepage/MainPage/LimitedOffersArea/index.tsx
       * - 数据加载: useHomeState.ts -> loadLimitedTimeData()
       * - 后端接口: GET /xypai-app-bff/api/home/limited-time/list
       * - 点击处理: handleLimitedOfferPress (已改为跳转用户主页)
       *
       * <LimitedOffersArea
       *   offers={limitedOffers}
       *   onUserPress={handleLimitedOfferPress}
       *   onMorePress={handleMoreOffersPress}
       * />
       */}

      {/* 组队聚会区域 */}
      <TeamPartyArea
        onPress={handleTeamPartyPress}
        onMorePress={handleTeamPartyPress}
      />

      {/* 筛选标签栏区域 */}
      <FilterTabsArea
        activeTab={activeFilter}
        onTabPress={setActiveFilter}
        activeRegion={activeRegion}
        onRegionPress={setActiveRegion}
      />
    </ImageBackground>
  ), [
    location,
    handleLocationPress,
    handleSearch,
    handleSearchPress,
    handleGameBannerPress,
    handleFunctionPress,
    // 🚫 限时专享相关依赖已移除（功能暂时隐藏）
    // limitedOffers,
    // handleLimitedOfferPress,
    // handleMoreOffersPress,
    handleTeamPartyPress,
    activeFilter,
    setActiveFilter,
    activeRegion,
    setActiveRegion,
  ]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />

      {/* 🆕 用户推荐列表区域（展示用户卡片，不是动态流） */}
      <UserListArea
        users={users}
        feedItems={undefined}  // 🆕 首页不使用Feed流，传undefined让UserListArea使用用户模式
        loading={loading}
        onUserPress={handleUserPress}
        onFeedPress={handleFeedPress}
        onFeedUserPress={handleFeedUserPress}
        onEndReached={handleEndReached}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={renderListHeader}
      />

      {/* 浮动发布按钮 */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handlePublishPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="发布内容"
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};
// #endregion

// #region 9. Exports
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray100,
  },
  upperAreaBackground: {
    width: '100%',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    width: PAGE_CONFIG.FAB_SIZE,
    height: PAGE_CONFIG.FAB_SIZE,
    borderRadius: PAGE_CONFIG.FAB_SIZE / 2,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: '300',
    lineHeight: 32,
  },
});

export default MainPage;
export type { MainPageProps };
// #endregion

