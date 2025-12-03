// #region 1. File Banner & TOC
/**
 * SearchResultsPage - 搜索结果页面
 * 
 * 功能描述：显示搜索结果，分为四个Tab：全部、用户、下单、话题
 * 
 * TOC (快速跳转):
 * [1] Imports
 * [2] Types & Schema
 * [3] Constants & Config
 * [4] Mock Data
 * [5] UI Components
 * [6] Main Component
 * [7] Exports
 */
// #endregion

// #region 2. Imports
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    Image,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// API服务
import { searchApiService } from '../api';
import type { OrderResult, TopicResult, UserResult } from '../api';
// #endregion

// #region 3. Types & Schema
export interface SearchResultsPageProps {
  query: string;
  onBack: () => void;
  onQueryChange: (text: string) => void;
  onSearchSubmit: () => void;
}

type TabType = 'all' | 'users' | 'orders' | 'topics';

interface SearchState {
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  pageNum: number;
}
// #endregion

// #region 4. Constants & Config
const COLORS = {
  BACKGROUND: '#F8F9FE',
  WHITE: '#FFFFFF',
  PRIMARY: '#6366F1',
  PRIMARY_LIGHT: '#818CF8',
  PRIMARY_DARK: '#4F46E5',
  SECONDARY: '#EC4899',
  ACCENT: '#8B5CF6',
  TEXT: '#1F2937',
  TEXT_SECONDARY: '#6B7280',
  TEXT_LIGHT: '#9CA3AF',
  BORDER: '#E5E7EB',
  TAG_BG: '#DBEAFE',
  TAG_TEXT: '#1E40AF',
  VERIFIED_BG: '#D1FAE5',
  VERIFIED_TEXT: '#065F46',
  ONLINE: '#10B981',
  PRICE: '#F59E0B',
  PRICE_BG: '#FEF3C7',
  DISTANCE_BG: '#F3F4F6',
  HOT_TAG: '#EF4444',
  HOT_BG: '#FEE2E2',
  SHADOW: 'rgba(99, 102, 241, 0.15)',
  CARD_SHADOW: 'rgba(0, 0, 0, 0.08)',
};

const TABS = [
  { key: 'all' as TabType, label: '全部' },
  { key: 'users' as TabType, label: '用户' },
  { key: 'orders' as TabType, label: '下单' },
  { key: 'topics' as TabType, label: '话题' },
];
// #endregion

// #region 5. Data Fetching Hooks
/**
 * 搜索结果数据管理Hook
 */
const useSearchResults = (query: string, activeTab: TabType) => {
  const [users, setUsers] = useState<UserResult[]>([]);
  const [orders, setOrders] = useState<OrderResult[]>([]);
  const [topics, setTopics] = useState<TopicResult[]>([]);
  const [allResults, setAllResults] = useState<any[]>([]);
  
  const [state, setState] = useState<SearchState>({
    loading: false,
    refreshing: false,
    hasMore: true,
    pageNum: 1,
  });
  
  const pageSize = 10;
  
  // 加载数据
  const loadData = useCallback(async (refresh: boolean = false) => {
    if (state.loading) return;
    
    const currentPage = refresh ? 1 : state.pageNum;
    setState(prev => ({ ...prev, loading: true, refreshing: refresh }));
    
    try {
      switch (activeTab) {
        case 'users':
          const userData = await searchApiService.getSearchUsers({
            keyword: query,
            pageNum: currentPage,
            pageSize,
          });
          setUsers(refresh ? userData.list : [...users, ...userData.list]);
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            refreshing: false,
            hasMore: userData.hasMore,
            pageNum: currentPage + 1,
          }));
          break;
          
        case 'orders':
          const orderData = await searchApiService.getSearchOrders({
            keyword: query,
            pageNum: currentPage,
            pageSize,
          });
          setOrders(refresh ? orderData.list : [...orders, ...orderData.list]);
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            refreshing: false,
            hasMore: orderData.hasMore,
            pageNum: currentPage + 1,
          }));
          break;
          
        case 'topics':
          const topicData = await searchApiService.getSearchTopics({
            keyword: query,
            pageNum: currentPage,
            pageSize,
          });
          setTopics(refresh ? topicData.list : [...topics, ...topicData.list]);
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            refreshing: false,
            hasMore: topicData.hasMore,
            pageNum: currentPage + 1,
          }));
          break;
          
        case 'all':
        default:
          const allData = await searchApiService.getSearchAll({
            keyword: query,
            pageNum: currentPage,
            pageSize,
          });
          setAllResults(refresh ? allData.list : [...allResults, ...allData.list]);
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            refreshing: false,
            hasMore: allData.hasMore,
            pageNum: currentPage + 1,
          }));
          break;
      }
    } catch (error) {
      console.error('Failed to load search results:', error);
      setState(prev => ({ ...prev, loading: false, refreshing: false }));
    }
  }, [query, activeTab, state.pageNum, state.loading]);
  
  // Tab切换时重置并加载
  useEffect(() => {
    setState({ loading: false, refreshing: false, hasMore: true, pageNum: 1 });
    setUsers([]);
    setOrders([]);
    setTopics([]);
    setAllResults([]);
    loadData(true);
  }, [activeTab, query]);
  
  const handleRefresh = () => loadData(true);
  const handleLoadMore = () => {
    if (state.hasMore && !state.loading) {
      loadData(false);
    }
  };
  
  return {
    users,
    orders,
    topics,
    allResults,
    state,
    handleRefresh,
    handleLoadMore,
  };
};
// #endregion

// #region 6. UI Components
/**
 * Tab导航栏
 */
const TabBar: React.FC<{
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}> = ({ activeTab, onTabChange }) => (
  <View style={styles.tabBar}>
    {TABS.map(tab => (
      <TouchableOpacity
        key={tab.key}
        style={[styles.tab, activeTab === tab.key && styles.activeTab]}
        onPress={() => onTabChange(tab.key)}
      >
        <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

/**
 * 用户结果卡片 - 带动画
 */
const UserResultCard: React.FC<{ 
  user: UserResult; 
  onPress: () => void;
  onFollow?: () => void;
  isFollowing?: boolean;
}> = ({
  user,
  onPress,
  onFollow,
  isFollowing,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);
  
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity style={styles.userCard} onPress={onPress} activeOpacity={0.9}>
        <View style={styles.userCardContent}>
          <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{user.nickname}</Text>
              {user.age && <Text style={styles.userAge}> {user.age}岁</Text>}
              {user.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ {user.verifiedLabel || '已认证'}</Text>
                </View>
              )}
            </View>
            {user.signature && (
              <Text style={styles.userSignature} numberOfLines={1}>{user.signature}</Text>
            )}
            <View style={styles.userTags}>
              {user.tags && user.tags.map((tag, index) => (
                <View key={index} style={styles.userTag}>
                  <Text style={styles.userTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        {onFollow && (
          <TouchableOpacity 
            style={[
              styles.followButton,
              (user.relationStatus === 'following' || user.relationStatus === 'mutual' || isFollowing) && styles.followingButton
            ]} 
            onPress={onFollow}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.followButtonText,
              (user.relationStatus === 'following' || user.relationStatus === 'mutual' || isFollowing) && styles.followingButtonText
            ]}>
              {user.relationStatus === 'mutual' ? '互相关注' : 
               user.relationStatus === 'following' || isFollowing ? '已关注' : '+ 关注'}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * 下单结果卡片 - 带动画
 */
const OrderResultCard: React.FC<{ order: OrderResult; onPress: () => void }> = ({
  order,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);
  
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity style={styles.orderCard} onPress={onPress} activeOpacity={0.9}>
        <Image source={{ uri: order.avatar }} style={styles.orderAvatar} />
        <View style={styles.orderContent}>
          <View style={styles.orderHeader}>
            <View style={styles.orderUserInfo}>
              <Text style={styles.orderNickname}>{order.nickname}</Text>
              {order.tags.map((tag, index) => (
                <View key={index} style={[styles.orderTag, { backgroundColor: COLORS.SECONDARY }]}>
                  <Text style={styles.orderTagText}>{tag.text}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.orderDistance}>📍 {order.distance}km</Text>
          </View>
          <Text style={styles.orderDescription} numberOfLines={2}>
            {order.description}
          </Text>
          <View style={styles.orderFooter}>
            <Text style={styles.orderPrice}>💰 {order.price.displayText}</Text>
            {order.isOnline && (
              <View style={styles.onlineBadge}>
                <Text style={styles.onlineText}>在线</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * 话题结果卡片 - 带动画
 */
const TopicResultCard: React.FC<{ topic: TopicResult; onPress: () => void }> = ({
  topic,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);
  
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity style={styles.topicCard} onPress={onPress} activeOpacity={0.9}>
        <Image source={{ uri: topic.icon }} style={styles.topicIcon} />
        <View style={styles.topicContent}>
          <View style={styles.topicHeader}>
            <Text style={styles.topicTitle}>#{topic.topicName}</Text>
            {topic.isHot && (
              <View style={styles.topicTagBadge}>
                <Text style={styles.topicTagText}>🔥 {topic.hotLabel || '热门'}</Text>
              </View>
            )}
          </View>
          <Text style={styles.topicSubtitle}>{topic.description}</Text>
          <Text style={styles.topicStats}>📝 {topic.stats.posts} 帖子</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// #endregion

// #region 7. Main Component
const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ 
  query, 
  onBack, 
  onQueryChange, 
  onSearchSubmit 
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  
  // 使用搜索结果Hook
  const searchResults = useSearchResults(query, activeTab);
  const { users, orders, topics, allResults, state, handleRefresh, handleLoadMore } = searchResults;
  
  // 关注/取消关注用户
  const [followingUsers, setFollowingUsers] = useState<Set<number>>(new Set());
  
  const handleFollow = useCallback(async (userId: number, currentStatus: string) => {
    try {
      const action = currentStatus === 'none' || currentStatus === 'followed' ? 'follow' : 'unfollow';
      const result = await searchApiService.followUser({
        targetUserId: userId,
        action,
      });
      
      // 更新本地状态
      setFollowingUsers(prev => {
        const newSet = new Set(prev);
        if (result.relationStatus === 'following' || result.relationStatus === 'mutual') {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    } catch (error) {
      console.error('Failed to follow/unfollow user:', error);
    }
  }, []);

  const handleUserPress = (id: number) => {
    // 跳转到他人详情页
    router.push({ pathname: '/profile/[userId]' as any, params: { userId: id.toString() } });
  };

  const handleOrderPress = (id: number) => {
    // 跳转到技能详情页（服务详情）
    router.push({ pathname: '/skill/[skillId]' as any, params: { skillId: id.toString() } });
  };

  const handleTopicPress = (id: number) => {
    router.push({ pathname: '/topic/[topicId]' as any, params: { topicId: id.toString() } });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <FlatList
            data={users}
            renderItem={({ item }) => (
              <UserResultCard 
                user={item} 
                onPress={() => handleUserPress(item.userId)}
                onFollow={() => handleFollow(item.userId, item.relationStatus)}
                isFollowing={followingUsers.has(item.userId)}
              />
            )}
            keyExtractor={item => item.userId.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={state.refreshing} onRefresh={handleRefresh} />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
          />
        );
      case 'orders':
        return (
          <FlatList
            data={orders}
            renderItem={({ item }) => (
              <OrderResultCard order={item} onPress={() => handleOrderPress(item.userId)} />
            )}
            keyExtractor={item => item.userId.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={state.refreshing} onRefresh={handleRefresh} />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
          />
        );
      case 'topics':
        return (
          <FlatList
            data={topics}
            renderItem={({ item }) => (
              <TopicResultCard topic={item} onPress={() => handleTopicPress(item.topicId)} />
            )}
            keyExtractor={item => item.topicId.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={state.refreshing} onRefresh={handleRefresh} />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
          />
        );
      case 'all':
      default:
        return (
          <FlatList
            data={allResults}
            renderItem={({ item }) => {
              if (item.itemType === 'user' && item.user) {
                return <UserResultCard 
                  user={item.user} 
                  onPress={() => handleUserPress(item.user.userId)}
                  onFollow={() => handleFollow(item.user.userId, item.user.relationStatus || 'none')}
                  isFollowing={followingUsers.has(item.user.userId)}
                />;
              } else if ((item.itemType === 'post' || item.itemType === 'video') && item.post) {
                // 这里可以显示帖子/视频卡片
                return <View style={styles.userCard}>
                  <Text>{item.post.description}</Text>
                </View>;
              }
              return null;
            }}
            keyExtractor={(item, index) => `${item.itemType}-${item.itemId}-${index}`}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={state.refreshing} onRefresh={handleRefresh} />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />
      {/* 搜索栏 */}
      <View style={styles.searchBar}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text 
            style={styles.searchText}
            numberOfLines={1}
          >
            {query}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.searchButton} onPress={onSearchSubmit}>
          <Text style={styles.searchButtonText}>搜索</Text>
        </TouchableOpacity>
      </View>
      
      {/* Tab栏 */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* 结果内容 */}
      {renderContent()}
    </SafeAreaView>
  );
};
// #endregion

// #region 8. Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },

  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.WHITE,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.BACKGROUND,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 20,
    color: COLORS.TEXT,
    fontWeight: '600',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 44,
    marginRight: 8,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY_LIGHT,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.TEXT,
    fontWeight: '500',
  },
  searchButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 22,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonText: {
    fontSize: 14,
    color: COLORS.WHITE,
    fontWeight: '700',
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 8,
    paddingTop: 8,
    shadowColor: COLORS.CARD_SHADOW,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
  },
  tabText: {
    fontSize: 15,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.WHITE,
    fontWeight: '700',
  },

  // List
  listContent: {
    padding: 16,
  },

  // User Card
  userCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.CARD_SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    flexDirection: 'column',
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY_LIGHT,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.TEXT,
  },
  userAge: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
  userSignature: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
    marginBottom: 8,
  },
  verifiedBadge: {
    backgroundColor: COLORS.VERIFIED_BG,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 11,
    color: COLORS.VERIFIED_TEXT,
    fontWeight: '600',
  },
  userTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  userTag: {
    backgroundColor: COLORS.TAG_BG,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  userTagText: {
    fontSize: 12,
    color: COLORS.TAG_TEXT,
    fontWeight: '600',
  },
  onlineIndicator: {
    marginLeft: 8,
    backgroundColor: COLORS.ONLINE,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.ONLINE,
  },
  followButton: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 28,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 8,
  },
  followingButton: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  followButtonText: {
    fontSize: 13,
    color: COLORS.WHITE,
    fontWeight: '700',
  },
  followingButtonText: {
    color: COLORS.TEXT_SECONDARY,
  },

  // Order Card
  orderCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: COLORS.CARD_SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  orderAvatar: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginRight: 14,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY_LIGHT,
  },
  orderContent: {
    flex: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderNickname: {
    fontSize: 14,
    color: COLORS.TEXT,
    marginRight: 8,
    fontWeight: '600',
  },
  orderTag: {
    backgroundColor: COLORS.SECONDARY,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  orderTagText: {
    fontSize: 11,
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  orderDistance: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
    backgroundColor: COLORS.DISTANCE_BG,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontWeight: '500',
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: 6,
  },
  orderDescription: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 19,
    marginBottom: 10,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.PRICE,
    backgroundColor: COLORS.PRICE_BG,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onlineBadge: {
    backgroundColor: COLORS.ONLINE,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onlineText: {
    fontSize: 12,
    color: COLORS.WHITE,
    fontWeight: '600',
  },

  // Topic Card
  topicCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.CARD_SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  topicIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 14,
    borderWidth: 2,
    borderColor: COLORS.ACCENT,
  },
  topicContent: {
    flex: 1,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  topicTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginRight: 8,
  },
  topicTagBadge: {
    backgroundColor: COLORS.HOT_BG,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  topicTagText: {
    fontSize: 11,
    color: COLORS.HOT_TAG,
    fontWeight: '700',
  },
  topicSubtitle: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 18,
    marginBottom: 6,
  },
  topicStats: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
  },
});

export default SearchResultsPage;
// #endregion

