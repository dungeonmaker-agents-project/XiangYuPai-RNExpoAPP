// #region 1. File Banner & TOC
/**
 * MainPage - 发现页面主页面
 * 
 * 功能：
 * - 三Tab切换（关注/热门/同城）
 * - 动态流列表展示
 * - 下拉刷新和无限滚动
 * - 导航和互动处理
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
    StatusBar,
    StyleSheet,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 类型和常量
import type { Feed, TabType } from '../types';
import { COLORS } from './constants';
import type { MainPageProps } from './types';

// 区域组件
import ContentArea from './components/ContentArea';
import NavigationArea from './components/NavigationArea';
import SearchBar from './components/SearchBar';

// Stores和API集成
import { useDiscoveryStore } from '@/stores';
// #endregion

// #region 3. Types & Schema
// (使用types.ts中的定义)
// #endregion

// #region 4. Constants & Config
// (使用constants.ts中的配置)
// #endregion

// #region 5. Utils & Helpers
/**
 * 生成模拟动态数据（开发阶段使用）
 * 
 * 注：已集成真实API，此函数仅用于开发测试
 */
const generateMockFeeds = (count: number, tab: TabType): Feed[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `feed-${tab}-${Date.now()}-${index}`,
    userId: `user-${Math.floor(Math.random() * 1000)}`,
    
    // 内容信息（v7.1新增）
    type: 1,  // 1=动态
    typeDesc: '动态',
    
    userInfo: {
      id: `user-${Math.floor(Math.random() * 1000)}`,
      nickname: `用户${Math.floor(Math.random() * 1000)}`,
      avatar: `https://picsum.photos/seed/${Math.random()}/200`,
      gender: Math.random() > 0.5 ? ('male' as const) : ('female' as const),
      age: 20 + Math.floor(Math.random() * 20),
      tags: [
        {
          type: 'certified' as const,
          label: '认证用户',
          color: '#00C853',
        },
      ],
      isFollowed: Math.random() > 0.5,
      isPopular: Math.random() > 0.8,
      isVip: Math.random() > 0.9,
    },
    title: Math.random() > 0.7 ? `动态标题 ${index + 1}` : undefined,
    summary: `这是动态摘要 ${index + 1}`,
    content: `这是${tab === 'follow' ? '关注' : tab === 'hot' ? '热门' : '同城'}动态的内容 ${index + 1}。这里是一些有趣的文字描述...`,
    coverImage: Math.random() > 0.6 ? `https://picsum.photos/seed/${Math.random()}/400/300` : undefined,
    
    mediaList: Math.random() > 0.5 ? [
      {
        id: `media-${index}`,
        type: 'image' as const,
        url: `https://picsum.photos/seed/${Math.random()}/800/600`,
        width: 800,
        height: 600,
      },
    ] : [],
    topicList: Math.random() > 0.6 ? [
      {
        name: `话题${Math.floor(Math.random() * 10)}`,
        description: '热门话题',
        participantCount: Math.floor(Math.random() * 10000),
        postCount: Math.floor(Math.random() * 50000),
        hotIndex: Math.floor(Math.random() * 100),
        trendChange: Math.random() > 0.5 ? 1 : -1,
        createdAt: Date.now(),
      },
    ] : [],
    
    // 地理位置（v7.1新增）
    locationName: Math.random() > 0.7 ? '某个地点' : undefined,
    locationAddress: Math.random() > 0.7 ? '某市某区某街道' : undefined,
    longitude: Math.random() > 0.7 ? 116.4 + Math.random() : undefined,
    latitude: Math.random() > 0.7 ? 39.9 + Math.random() : undefined,
    distance: Math.random() > 0.7 ? Math.random() * 5 : undefined,  // km
    cityId: Math.random() > 0.7 ? Math.floor(Math.random() * 100) : undefined,
    
    // 旧版位置信息（兼容）
    location: Math.random() > 0.7 ? {
      id: `loc-${index}`,
      name: '某个地点',
      address: '某市某区某街道',
      latitude: 39.9 + Math.random(),
      longitude: 116.4 + Math.random(),
      distance: Math.floor(Math.random() * 5000),
    } : undefined,
    
    // 统计数据
    likeCount: Math.floor(Math.random() * 1000),
    commentCount: Math.floor(Math.random() * 500),
    shareCount: Math.floor(Math.random() * 100),
    collectCount: Math.floor(Math.random() * 200),
    viewCount: Math.floor(Math.random() * 5000),
    
    // 用户互动状态
    isLiked: Math.random() > 0.7,
    isCollected: Math.random() > 0.8,
    
    // 时间戳
    createdAt: Date.now() - Math.random() * 86400000,
    updatedAt: Date.now(),
  }));
};

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
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`;
  } else {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}-${date.getDate()}`;
  }
};
// #endregion

// #region 6. State Management
/**
 * MainPage状态管理Hook
 * 
 * 使用Zustand Store管理状态
 */
const useMainPageState = (props: MainPageProps) => {
  // 从Zustand Store获取状态
  const activeTab = useDiscoveryStore((state) => state.ui.activeTab);
  const feedData = useDiscoveryStore((state) => state.feedData);
  const loading = useDiscoveryStore((state) => state.ui.loading);
  const refreshing = useDiscoveryStore((state) => state.ui.refreshing);
  const error = useDiscoveryStore((state) => state.ui.error);
  const isSearching = useDiscoveryStore((state) => state.search.isSearching);

  // 获取Actions
  const setActiveTab = useDiscoveryStore((state) => state.setActiveTab);
  const loadFeedList = useDiscoveryStore((state) => state.loadFeedList);
  const loadMoreFeeds = useDiscoveryStore((state) => state.loadMoreFeeds);
  const toggleLike = useDiscoveryStore((state) => state.toggleLike);
  const toggleCollect = useDiscoveryStore((state) => state.toggleCollect);
  const shareFeed = useDiscoveryStore((state) => state.shareFeed);
  const enterSearchMode = useDiscoveryStore((state) => state.enterSearchMode);
  
  // 计算当前Tab的数据
  const currentFeeds = useMemo(() => {
    switch (activeTab) {
      case 'follow':
        return feedData.followFeeds;
      case 'hot':
        return feedData.hotFeeds;
      case 'nearby':
        return feedData.nearbyFeeds;
      default:
        return [];
    }
  }, [activeTab, feedData]);
  
  const currentHasMore = useMemo(() => {
    return feedData.hasMore[activeTab];
  }, [activeTab, feedData.hasMore]);
  
  // 初始化Tab（如果props指定了初始Tab）
  // 注意：只在组件挂载时执行一次，不要在activeTab变化时重复执行
  useEffect(() => {
    if (props.initialTab && props.initialTab !== activeTab) {
      console.log('[MainPage] 初始化Tab:', props.initialTab);
      setActiveTab(props.initialTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.initialTab]); // 只依赖initialTab，不依赖activeTab
  
  return {
    // 状态
    activeTab,
    currentFeeds,
    currentHasMore,
    loading,
    refreshing,
    error,
    isSearching,
    userId: props.userId,

    // Actions
    setActiveTab,
    loadFeedList,
    loadMoreFeeds,
    toggleLike,
    toggleCollect,
    shareFeed,
    enterSearchMode,
  };
};
// #endregion

// #region 7. Domain Logic
/**
 * MainPage业务逻辑Hook
 */
const useMainPageLogic = (props: MainPageProps) => {
  const router = useRouter();
  const state = useMainPageState(props);
  const {
    activeTab,
    setActiveTab,
    currentFeeds,
    currentHasMore,
    loading,
    refreshing,
    error,
    isSearching,
    loadFeedList,
    loadMoreFeeds,
    toggleLike,
    toggleCollect,
    shareFeed,
    enterSearchMode,
  } = state;
  
  /**
   * 初始化页面数据
   */
  useEffect(() => {
    console.log('[MainPage] useEffect触发 - activeTab:', activeTab, 'currentFeeds数量:', currentFeeds.length);
    const initializeData = async () => {
      // 如果当前Tab还没有数据，则加载
      if (currentFeeds.length === 0) {
        console.log('[MainPage] 当前Tab无数据，开始加载:', activeTab);
        await loadFeedList(activeTab, false);
      } else {
        console.log('[MainPage] 当前Tab已有数据，跳过加载');
      }
    };
    
    initializeData();
  }, [activeTab]); // Tab切换时触发
  
  /**
   * 切换Tab
   */
  const handleTabChange = useCallback((tab: TabType) => {
    console.log('[MainPage] handleTabChange 被调用:', tab, '当前Tab:', activeTab);
    if (tab === activeTab) {
      console.log('[MainPage] Tab相同，不切换');
      return;
    }
    
    console.log('[MainPage] 调用 setActiveTab:', tab);
    setActiveTab(tab);
  }, [activeTab, setActiveTab]);
  
  /**
   * 下拉刷新
   */
  const handleRefresh = useCallback(async () => {
    await loadFeedList(activeTab, true);
  }, [activeTab, loadFeedList]);
  
  /**
   * 加载更多
   */
  const handleLoadMore = useCallback(async () => {
    await loadMoreFeeds(activeTab);
  }, [activeTab, loadMoreFeeds]);
  
  /**
   * 搜索按钮点击 - 进入搜索模式
   */
  const handleSearchPress = useCallback(() => {
    console.log('进入搜索模式');
    enterSearchMode();
  }, [enterSearchMode]);

  /**
   * 发布按钮点击 - 跳转到发布页面
   */
  const handlePublishPress = useCallback(() => {
    console.log('进入发布页面');
    router.push('/publish-post' as any);
  }, [router]);
  
  /**
   * 动态卡片点击
   */
  const handleFeedPress = useCallback((feedId: string) => {
    console.log('查看动态详情:', feedId);
    router.push(`/feed/${feedId}` as any);
  }, [router]);
  
  /**
   * 用户头像点击
   */
  const handleUserPress = useCallback((userId: string) => {
    // TODO: 创建用户详情页面路由后启用
    console.log('查看用户详情:', userId);
    // router.push({
    //   pathname: ROUTES.MODAL.USER_DETAIL,
    //   params: { userId },
    // });
  }, [router]);
  
  /**
   * 话题点击
   */
  const handleTopicPress = useCallback((topicName: string) => {
    // TODO: 创建话题详情页面路由后启用
    console.log('查看话题详情:', topicName);
    // router.push({
    //   pathname: ROUTES.DISCOVERY.TOPIC,
    //   params: { topicName },
    // });
  }, [router]);
  
  /**
   * 点赞（使用Store的乐观更新）
   */
  const handleLike = useCallback((feedId: string) => {
    toggleLike(feedId, activeTab);
  }, [activeTab, toggleLike]);
  
  /**
   * 评论
   */
  const handleComment = useCallback((feedId: string) => {
    // TODO: 创建详情页面路由后启用
    console.log('评论动态:', feedId);
    // router.push({
    //   pathname: ROUTES.DISCOVERY.DETAIL,
    //   params: { feedId, autoFocusComment: 'true' },
    // });
  }, [router]);
  
  /**
   * 分享
   */
  const handleShare = useCallback((feedId: string) => {
    shareFeed(feedId);
  }, [shareFeed]);
  
  /**
   * 收藏（使用Store的乐观更新）
   */
  const handleCollect = useCallback((feedId: string) => {
    toggleCollect(feedId, activeTab);
  }, [activeTab, toggleCollect]);
  
  return {
    // 状态
    activeTab,
    currentFeeds,
    currentHasMore,
    loading,
    refreshing,
    error,
    isSearching,
    // 事件处理
    handleTabChange,
    handleRefresh,
    handleLoadMore,
    handleSearchPress,
    handlePublishPress,
    handleFeedPress,
    handleUserPress,
    handleTopicPress,
    handleLike,
    handleComment,
    handleShare,
    handleCollect,
  };
};
// #endregion

// #region 8. UI Components & Rendering
/**
 * MainPage主组件
 */
const MainPage: React.FC<MainPageProps> = (props) => {
  const {
    activeTab,
    currentFeeds,
    currentHasMore,
    loading,
    refreshing,
    error,
    isSearching,
    handleTabChange,
    handleRefresh,
    handleLoadMore,
    handleSearchPress,
    handlePublishPress,
    handleFeedPress,
    handleUserPress,
    handleTopicPress,
    handleLike,
    handleComment,
    handleShare,
    handleCollect,
  } = useMainPageLogic(props);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.NAV_BACKGROUND} />

      {/* 导航区域 */}
      <NavigationArea
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onSearchPress={handleSearchPress}
        onPublishPress={handlePublishPress}
      />

      {/* 内容区域 */}
      <ContentArea
        activeTab={activeTab}
        feeds={currentFeeds}
        loading={loading}
        refreshing={refreshing}
        hasMore={currentHasMore}
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
        onFeedPress={handleFeedPress}
        onUserPress={handleUserPress}
        onTopicPress={handleTopicPress}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
        onCollect={handleCollect}
      />

      {/* 搜索覆盖层 */}
      <SearchBar
        onFeedPress={handleFeedPress}
        onUserPress={handleUserPress}
        onLike={handleLike}
        onCollect={handleCollect}
      />
    </SafeAreaView>
  );
};
// #endregion

// #region 9. Exports
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.NAV_BACKGROUND, // 状态栏区域使用白色背景
  },
});

export default MainPage;
export type { MainPageProps } from './types';
// #endregion
