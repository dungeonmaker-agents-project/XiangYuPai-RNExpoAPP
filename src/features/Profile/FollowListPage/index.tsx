// #region 1. File Banner & TOC
/**
 * FollowListPage - 关注/粉丝列表统一页面
 * 
 * 功能：
 * - 顶部Tab切换"关注"和"粉丝"
 * - 显示用户关注的所有用户或粉丝列表
 * - 支持互相关注状态显示
 * - 支持关注/取消关注操作
 * - 支持搜索过滤
 * 
 * 设计参考UI：
 * - 顶部导航栏：标题"关注/粉丝"，返回按钮，搜索图标
 * - Tab切换：关注 | 粉丝
 * - 列表项：头像、用户名、性别标签、简介、关注状态按钮
 * - 支持下拉刷新和上拉加载更多
 * 
 * TOC:
 * [1] File Banner & TOC
 * [2] Imports
 * [3] Types
 * [4] Constants & Mock Data
 * [5] API Service
 * [6] State Management Hook
 * [7] UI Components
 * [8] Main Component
 * [9] Styles
 * [10] Exports
 */
// #endregion

// #region 2. Imports
import { useAuthStore } from '@/src/features/AuthModule';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
// 导入真实API
import { relationApi, RelationStatus, RelationUserItem } from './api';
// #endregion

// #region 3. Types
/**
 * Tab类型
 */
type TabType = 'following' | 'followers';

/**
 * 关注/粉丝用户数据类型（兼容后端返回格式）
 * 对应后端 UserRelationVo
 */
interface FollowUser {
  id: string;                    // 用户ID (前端使用string)
  name: string;                  // 昵称
  avatar: string;                // 头像URL
  age?: number;                  // 年龄
  gender: string;                // 性别: male, female, other
  description?: string;          // 个性签名/简介
  isRealVerified?: boolean;      // 是否实名认证
  isFollowing?: boolean;         // 当前用户是否已关注该用户
  mutualFollow?: boolean;        // 是否互相关注
  relationStatus?: RelationStatus; // 关系状态: none, following, followed, mutual
  isOnline?: boolean;            // 是否在线
  // 兼容旧字段
  location?: { city?: string; district?: string; distance?: number };
  tags?: string[];
  price?: number;
  rating?: number;
  reviewCount?: number;
  lastActiveTime?: string;
  serviceTypes?: string[];
  images?: string[];
  skills?: string[];
  followedAt?: string;
}

/**
 * 页面Props
 */
export interface FollowListPageProps {
  userId?: string; // 查看指定用户的关注/粉丝列表（不传则查看当前登录用户）
  initialTab?: TabType; // 初始显示的Tab
}

/**
 * 将后端返回数据转换为前端FollowUser格式
 */
const transformToFollowUser = (item: RelationUserItem): FollowUser => {
  const isMutual = item.relationStatus === 'mutual' || item.isMutualFollow === true;
  const isFollowing = item.isFollowing === true ||
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

// #region 4. Constants & Mock Data
const PAGE_SIZE = 20;

const GENDER_CONFIG: Record<string, { label: string; color: string }> = {
  male: { label: '男生', color: '#3B82F6' },
  female: { label: '女生', color: '#EC4899' },
  other: { label: '其他', color: '#8B5CF6' },
};

const FOLLOW_STATUS = {
  MUTUAL: '互相关注',
  FOLLOWING: '已关注',
  FOLLOW: '关注',
};

/**
 * 虚拟数据 - 关注列表
 */
const MOCK_FOLLOWING_DATA: FollowUser[] = [
  {
    id: '1001',
    name: '小美',
    avatar: 'https://i.pravatar.cc/150?img=1',
    age: 24,
    gender: 'female',
    description: '热爱摄影和旅行的自由职业者',
    location: { city: '北京', district: '朝阳区', distance: 2.3 },
    tags: ['摄影', '旅行'],
    price: 200,
    rating: 4.8,
    reviewCount: 156,
    isOnline: true,
    lastActiveTime: '2024-01-20T10:30:00Z',
    serviceTypes: ['摄影陪拍', '旅行向导'],
    images: [],
    skills: [],
    mutualFollow: true, // 互相关注
    isFollowing: true,
    isRealVerified: true, // 实名认证
  },
  {
    id: '1002',
    name: '阳光男孩',
    avatar: 'https://i.pravatar.cc/150?img=12',
    age: 26,
    gender: 'male',
    description: '健身教练，带你科学健身',
    location: { city: '北京', district: '海淀区', distance: 5.1 },
    tags: ['健身', '运动'],
    price: 150,
    rating: 4.9,
    reviewCount: 203,
    isOnline: false,
    lastActiveTime: '2024-01-20T08:15:00Z',
    serviceTypes: ['健身指导', '运动陪练'],
    images: [],
    skills: [],
    mutualFollow: false, // 只是我关注了他
    isFollowing: true,
    isRealVerified: false, // 未实名认证
  },
  {
    id: '1003',
    name: '甜心姐姐',
    avatar: 'https://i.pravatar.cc/150?img=5',
    age: 23,
    gender: 'female',
    description: '美食博主，带你吃遍北京美食',
    location: { city: '北京', district: '东城区', distance: 3.8 },
    tags: ['美食', '探店'],
    price: 180,
    rating: 4.7,
    reviewCount: 128,
    isOnline: true,
    lastActiveTime: '2024-01-20T11:00:00Z',
    serviceTypes: ['美食向导', '探店陪伴'],
    images: [],
    skills: [],
    mutualFollow: true,
    isFollowing: true,
    isRealVerified: true, // 实名认证
  },
  {
    id: '1004',
    name: '游戏大神',
    avatar: 'https://i.pravatar.cc/150?img=15',
    age: 22,
    gender: 'male',
    description: '王者荣耀国服50星，可带上分',
    location: { city: '北京', district: '西城区', distance: 4.2 },
    tags: ['游戏', '王者荣耀'],
    price: 120,
    rating: 5.0,
    reviewCount: 389,
    isOnline: true,
    lastActiveTime: '2024-01-20T11:20:00Z',
    serviceTypes: ['游戏陪玩', '上分带练'],
    images: [],
    skills: [],
    mutualFollow: false,
    isFollowing: true,
    isRealVerified: true, // 实名认证
  },
];

/**
 * 虚拟数据 - 粉丝列表
 */
const MOCK_FOLLOWERS_DATA: FollowUser[] = [
  {
    id: '2001',
    name: '可爱多',
    avatar: 'https://i.pravatar.cc/150?img=9',
    age: 21,
    gender: 'female',
    description: '喜欢唱歌跳舞的活力少女',
    location: { city: '北京', district: '朝阳区', distance: 1.8 },
    tags: ['唱歌', '跳舞'],
    price: 160,
    rating: 4.6,
    reviewCount: 95,
    isOnline: true,
    lastActiveTime: '2024-01-20T10:45:00Z',
    serviceTypes: ['K歌陪唱', '舞蹈教学'],
    images: [],
    skills: [],
    mutualFollow: true, // 互相关注
    isFollowing: true,
    isRealVerified: true, // 实名认证
  },
  {
    id: '2002',
    name: '帅气欧巴',
    avatar: 'https://i.pravatar.cc/150?img=13',
    age: 27,
    gender: 'male',
    description: '篮球爱好者，擅长投篮技巧',
    location: { city: '北京', district: '海淀区', distance: 6.3 },
    tags: ['篮球', '运动'],
    price: 140,
    rating: 4.8,
    reviewCount: 167,
    isOnline: false,
    lastActiveTime: '2024-01-20T09:30:00Z',
    serviceTypes: ['篮球陪打', '技巧指导'],
    images: [],
    skills: [],
    mutualFollow: false, // 只是他关注了我
    isFollowing: false,
    isRealVerified: false, // 未实名认证
  },
  {
    id: '2003',
    name: '萌萌哒',
    avatar: 'https://i.pravatar.cc/150?img=10',
    age: 20,
    gender: 'female',
    description: '声优配音，可接各种配音需求',
    location: { city: '北京', district: '朝阳区', distance: 2.9 },
    tags: ['配音', '声优'],
    price: 200,
    rating: 4.9,
    reviewCount: 234,
    isOnline: true,
    lastActiveTime: '2024-01-20T11:10:00Z',
    serviceTypes: ['配音服务', '声音指导'],
    images: [],
    skills: [],
    mutualFollow: true,
    isFollowing: true,
    isRealVerified: true, // 实名认证
  },
  {
    id: '2004',
    name: '阳光少年',
    avatar: 'https://i.pravatar.cc/150?img=14',
    age: 25,
    gender: 'male',
    description: '电影爱好者，影评达人',
    location: { city: '北京', district: '东城区', distance: 4.5 },
    tags: ['电影', '影评'],
    price: 100,
    rating: 4.5,
    reviewCount: 78,
    isOnline: false,
    lastActiveTime: '2024-01-20T08:00:00Z',
    serviceTypes: ['电影陪看', '影评分享'],
    images: [],
    skills: [],
    mutualFollow: false,
    isFollowing: false,
    isRealVerified: false, // 未实名认证
  },
  {
    id: '2005',
    name: '温柔小姐姐',
    avatar: 'https://i.pravatar.cc/150?img=16',
    age: 24,
    gender: 'female',
    description: '心理咨询师，愿意倾听你的烦恼',
    location: { city: '北京', district: '西城区', distance: 3.2 },
    tags: ['心理咨询', '倾听'],
    price: 250,
    rating: 5.0,
    reviewCount: 312,
    isOnline: true,
    lastActiveTime: '2024-01-20T11:25:00Z',
    serviceTypes: ['心理咨询', '情感倾诉'],
    images: [],
    skills: [],
    mutualFollow: true,
    isFollowing: true,
    isRealVerified: true, // 实名认证
  },
];
// #endregion

// #region 5. API Service
/**
 * 是否使用真实API（设为false时使用Mock数据）
 */
const USE_REAL_API = true;

/**
 * 加载关注列表数据
 */
const loadFollowingList = async (
  userId: string,
  page: number,
  limit: number = PAGE_SIZE,
  keyword?: string
): Promise<{
  users: FollowUser[];
  hasMore: boolean;
  total: number;
}> => {
  try {
    if (USE_REAL_API) {
      // 使用真实API
      console.log('[FollowListPage] 调用真实API获取关注列表');
      const response = await relationApi.getFollowingList(page, limit, keyword);

      const users = (response.rows || []).map(transformToFollowUser);
      const total = response.total || 0;
      const hasMore = page * limit < total;

      console.log('[FollowListPage] 关注列表加载成功:', users.length, '个用户, 总计:', total);

      return { users, hasMore, total };
    } else {
      // 使用虚拟数据
      await new Promise(resolve => setTimeout(resolve, 300));

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const filteredData = keyword
        ? MOCK_FOLLOWING_DATA.filter(u => u.name.toLowerCase().includes(keyword.toLowerCase()))
        : MOCK_FOLLOWING_DATA;
      const users = filteredData.slice(startIndex, endIndex);

      console.log('[FollowListPage] 加载关注列表(Mock):', users.length, '个用户');

      return {
        users,
        hasMore: endIndex < filteredData.length,
        total: filteredData.length,
      };
    }
  } catch (error) {
    console.error('[FollowListPage] loadFollowingList error:', error);
    // 出错时回退到Mock数据
    console.log('[FollowListPage] 回退到Mock数据');
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
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
  userId: string,
  page: number,
  limit: number = PAGE_SIZE,
  keyword?: string
): Promise<{
  users: FollowUser[];
  hasMore: boolean;
  total: number;
}> => {
  try {
    if (USE_REAL_API) {
      // 使用真实API
      console.log('[FollowListPage] 调用真实API获取粉丝列表');
      const response = await relationApi.getFansList(page, limit, keyword);

      const users = (response.rows || []).map(transformToFollowUser);
      const total = response.total || 0;
      const hasMore = page * limit < total;

      console.log('[FollowListPage] 粉丝列表加载成功:', users.length, '个用户, 总计:', total);

      return { users, hasMore, total };
    } else {
      // 使用虚拟数据
      await new Promise(resolve => setTimeout(resolve, 300));

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const filteredData = keyword
        ? MOCK_FOLLOWERS_DATA.filter(u => u.name.toLowerCase().includes(keyword.toLowerCase()))
        : MOCK_FOLLOWERS_DATA;
      const users = filteredData.slice(startIndex, endIndex);

      console.log('[FollowListPage] 加载粉丝列表(Mock):', users.length, '个用户');

      return {
        users,
        hasMore: endIndex < filteredData.length,
        total: filteredData.length,
      };
    }
  } catch (error) {
    console.error('[FollowListPage] loadFollowersList error:', error);
    // 出错时回退到Mock数据
    console.log('[FollowListPage] 回退到Mock数据');
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
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
      // 使用真实API
      console.log(`[FollowListPage] ${currentlyFollowing ? '取消关注' : '关注'} 用户:`, targetUserId);
      await relationApi.toggleFollow(targetUserId, currentlyFollowing);
      return true;
    } else {
      // 使用虚拟数据 - 模拟成功
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log(`[FollowListPage] ${currentlyFollowing ? '取消关注' : '关注'} 用户(Mock):`, targetUserId);
      return true;
    }
  } catch (error) {
    console.error('[FollowListPage] toggleFollowUser error:', error);
    return false;
  }
};
// #endregion

// #region 6. State Management Hook
/**
 * 关注/粉丝列表页面状态管理Hook
 */
const useFollowListState = (userId?: string, initialTab: TabType = 'following') => {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const targetUserId = userId || currentUser?.userId || 'mock_user_id'; // 使用模拟ID以加载虚拟数据
  
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  console.log('[FollowListPage] 初始化 - userId:', userId, 'currentUser:', currentUser?.userId, 'targetUserId:', targetUserId);
  
  // Tab切换时重新加载数据
  useEffect(() => {
    setUsers([]);
    setPage(1);
    setHasMore(true);
    loadData(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);
  
  // 加载数据
  const loadData = async (pageNum: number, isRefresh: boolean = false) => {
    if (loading) {
      console.log('[FollowListPage] 跳过加载 - 正在加载中');
      return;
    }
    
    console.log('[FollowListPage] 开始加载数据 - Tab:', activeTab, 'Page:', pageNum, 'Refresh:', isRefresh);
    
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const result = activeTab === 'following'
        ? await loadFollowingList(targetUserId, pageNum)
        : await loadFollowersList(targetUserId, pageNum);
      
      console.log('[FollowListPage] 数据加载成功 - 用户数:', result.users.length, '总数:', result.total);
      
      if (isRefresh) {
        setUsers(result.users);
        setPage(1);
      } else {
        setUsers((prev) => [...prev, ...result.users]);
      }
      
      setHasMore(result.hasMore);
      setTotal(result.total);
      
      console.log('[FollowListPage] 状态更新完成 - 当前用户列表长度:', result.users.length);
    } catch (error) {
      console.error('[FollowListPage] loadData error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // 下拉刷新
  const onRefresh = () => {
    loadData(1, true);
  };
  
  // 加载更多
  const onLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadData(nextPage);
    }
  };
  
  // 切换Tab
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchQuery(''); // 切换Tab时清空搜索
    setShowSearch(false);
  };
  
  // 关注/取消关注
  const handleToggleFollow = async (user: FollowUser) => {
    const currentlyFollowing = user.isFollowing || false;
    const success = await toggleFollowUser(user.id, currentlyFollowing);
    
    if (success) {
      // 更新用户关注状态
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
                ...u,
                isFollowing: !currentlyFollowing,
                mutualFollow: activeTab === 'followers' 
                  ? !currentlyFollowing && u.mutualFollow !== undefined
                  : u.mutualFollow,
              }
            : u
        )
      );
      
      // 如果是在关注列表中取消关注，从列表中移除
      if (activeTab === 'following' && currentlyFollowing) {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        setTotal((prev) => prev - 1);
      }
    }
  };
  
  // 点击用户跳转到详情
  const handleUserPress = (user: FollowUser) => {
    router.push(`/profile/${user.id}`);
  };
  
  // 返回
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };
  
  // 搜索过滤
  const filteredUsers = searchQuery
    ? users.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;
  
  return {
    activeTab,
    users: filteredUsers,
    loading,
    refreshing,
    hasMore,
    total,
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

// #region 7. UI Components
/**
 * 导航栏组件
 */
const NavigationBar: React.FC<{
  showSearch: boolean;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearchToggle: () => void;
  onBack: () => void;
}> = ({ showSearch, searchQuery, onSearchQueryChange, onSearchToggle, onBack }) => {
  return (
    <View style={styles.navBar}>
      {!showSearch ? (
        <>
          <TouchableOpacity
            style={styles.navButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          
          <Text style={styles.navTitle}>我的-关注</Text>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={onSearchToggle}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={22} color="#000" />
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity
            style={styles.navButton}
            onPress={onSearchToggle}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.searchInput}
            placeholder="搜索"
            value={searchQuery}
            onChangeText={onSearchQueryChange}
            autoFocus
            placeholderTextColor="#9CA3AF"
          />
        </>
      )}
    </View>
  );
};

/**
 * Tab切换栏组件
 */
const TabBar: React.FC<{
  activeTab: TabType;
  followingCount: number;
  followersCount: number;
  onTabChange: (tab: TabType) => void;
}> = ({ activeTab, followingCount, followersCount, onTabChange }) => {
  return (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'following' && styles.tabActive]}
        onPress={() => onTabChange('following')}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabText, activeTab === 'following' && styles.tabTextActive]}>
          关注 {followingCount > 0 && `(${followingCount})`}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'followers' && styles.tabActive]}
        onPress={() => onTabChange('followers')}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabText, activeTab === 'followers' && styles.tabTextActive]}>
          粉丝 {followersCount > 0 && `(${followersCount})`}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * 用户列表项组件
 */
const UserListItem: React.FC<{
  user: FollowUser;
  isFollowingTab: boolean;
  onPress: () => void;
  onFollowToggle: () => void;
}> = ({ user, isFollowingTab, onPress, onFollowToggle }) => {
  const genderConfig = GENDER_CONFIG[user.gender] || GENDER_CONFIG.other;
  const isMutual = user.mutualFollow;
  const isFollowing = user.isFollowing;
  
  // 确定按钮状态和文本
  let buttonStyle = styles.followButton;
  let buttonTextStyle = styles.followButtonText;
  let buttonText = FOLLOW_STATUS.FOLLOW;
  
  if (isFollowingTab) {
    // 在关注列表中，都是已关注状态
    if (isMutual) {
      buttonStyle = [styles.followButton, styles.followButtonMutual];
      buttonTextStyle = [styles.followButtonText, styles.followButtonTextMutual];
      buttonText = FOLLOW_STATUS.MUTUAL;
    } else {
      buttonStyle = [styles.followButton, styles.followButtonFollowing];
      buttonTextStyle = [styles.followButtonText, styles.followButtonTextFollowing];
      buttonText = FOLLOW_STATUS.FOLLOWING;
    }
  } else {
    // 在粉丝列表中，可能已关注也可能未关注
    if (isMutual) {
      buttonStyle = [styles.followButton, styles.followButtonMutual];
      buttonTextStyle = [styles.followButtonText, styles.followButtonTextMutual];
      buttonText = FOLLOW_STATUS.MUTUAL;
    } else if (isFollowing) {
      buttonStyle = [styles.followButton, styles.followButtonFollowing];
      buttonTextStyle = [styles.followButtonText, styles.followButtonTextFollowing];
      buttonText = FOLLOW_STATUS.FOLLOWING;
    }
  }
  
  return (
    <TouchableOpacity
      style={styles.userItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* 头像 */}
      <Image
        source={{ uri: user.avatar }}
        style={styles.avatar}
      />
      
      {/* 用户信息 */}
      <View style={styles.userInfo}>
        {/* 第一行：昵称 + 性别标签 */}
        <View style={styles.userNameRow}>
          <Text style={styles.userName} numberOfLines={1}>
            {user.name}
          </Text>
          <View style={[styles.genderTag, { backgroundColor: genderConfig.color }]}>
            <Text style={styles.genderText}>{genderConfig.label}</Text>
          </View>
        </View>
        
        {/* 第二行：实名认证标识 */}
        {user.isRealVerified && (
          <View style={styles.verifiedRow}>
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#10B981" />
              <Text style={styles.verifiedText}>实名认证</Text>
            </View>
          </View>
        )}
        
        {/* 第三行：个性签名 */}
        <Text style={styles.userDesc} numberOfLines={1}>
          {user.description || '这里是用户简介..'}
        </Text>
      </View>
      
      {/* 关注状态按钮 */}
      <TouchableOpacity
        style={buttonStyle}
        onPress={(e) => {
          e.stopPropagation();
          onFollowToggle();
        }}
        activeOpacity={0.7}
      >
        <Text style={buttonTextStyle}>{buttonText}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

/**
 * 空状态组件
 */
const EmptyState: React.FC<{ activeTab: TabType; hasSearch: boolean }> = ({ activeTab, hasSearch }) => {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name={activeTab === 'following' ? 'person-outline' : 'people-outline'} 
        size={64} 
        color="#D1D5DB" 
      />
      <Text style={styles.emptyText}>
        {hasSearch 
          ? '未找到相关用户' 
          : activeTab === 'following' 
            ? '暂无关注' 
            : '暂无粉丝'
        }
      </Text>
    </View>
  );
};

/**
 * 加载更多指示器
 */
const LoadMoreIndicator: React.FC<{ loading: boolean; hasMore: boolean }> = ({
  loading,
  hasMore,
}) => {
  if (!hasMore) {
    return (
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>已经到底了~</Text>
      </View>
    );
  }
  
  if (loading) {
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color="#8B5CF6" />
      </View>
    );
  }
  
  return null;
};
// #endregion

// #region 8. Main Component
/**
 * FollowListPage - 关注/粉丝列表统一页面主组件
 */
const FollowListPage: React.FC<FollowListPageProps> = ({ userId, initialTab = 'following' }) => {
  const state = useFollowListState(userId, initialTab);
  
  // 获取关注和粉丝总数（用于Tab显示）
  const followingTotal = MOCK_FOLLOWING_DATA.length;
  const followersTotal = MOCK_FOLLOWERS_DATA.length;
  
  return (
    <View style={styles.container}>
      {/* 导航栏 */}
      <NavigationBar
        showSearch={state.showSearch}
        searchQuery={state.searchQuery}
        onSearchQueryChange={state.setSearchQuery}
        onSearchToggle={() => {
          state.setShowSearch(!state.showSearch);
          if (state.showSearch) {
            state.setSearchQuery('');
          }
        }}
        onBack={state.handleBack}
      />
      
      {/* Tab切换栏 */}
      <TabBar
        activeTab={state.activeTab}
        followingCount={followingTotal}
        followersCount={followersTotal}
        onTabChange={state.handleTabChange}
      />
      
      {/* 用户列表 */}
      <FlatList
        data={state.users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserListItem
            user={item}
            isFollowingTab={state.activeTab === 'following'}
            onPress={() => state.handleUserPress(item)}
            onFollowToggle={() => state.handleToggleFollow(item)}
          />
        )}
        ListEmptyComponent={
          !state.loading ? (
            <EmptyState activeTab={state.activeTab} hasSearch={!!state.searchQuery} />
          ) : null
        }
        ListFooterComponent={
          <LoadMoreIndicator loading={state.loading} hasMore={state.hasMore} />
        }
        refreshControl={
          <RefreshControl
            refreshing={state.refreshing}
            onRefresh={state.onRefresh}
            tintColor="#8B5CF6"
            colors={['#8B5CF6']}
          />
        }
        onEndReached={state.onLoadMore}
        onEndReachedThreshold={0.3}
        contentContainerStyle={[
          styles.listContent,
          state.users.length === 0 && styles.listContentEmpty,
        ]}
      />
    </View>
  );
};
// #endregion

// #region 9. Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // 导航栏
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    height: 36,
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#000',
    marginHorizontal: 8,
  },
  
  // Tab切换栏
  tabBar: {
    flexDirection: 'row',
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  
  // 列表
  listContent: {
    paddingVertical: 8,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  
  // 用户列表项
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E5E7EB',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
    maxWidth: '70%',
  },
  genderTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  genderText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '500',
    marginLeft: 2,
  },
  userDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  
  // 关注按钮
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#8B5CF6',
    backgroundColor: '#FFFFFF',
    marginLeft: 12,
  },
  followButtonMutual: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  followButtonFollowing: {
    backgroundColor: '#FFFFFF',
    borderColor: '#8B5CF6',
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  followButtonTextMutual: {
    color: '#FFFFFF',
  },
  followButtonTextFollowing: {
    color: '#8B5CF6',
  },
  
  // 空状态
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
    marginTop: 16,
  },
  
  // 底部加载
  footerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
});
// #endregion

// #region 10. Exports
export default FollowListPage;
export { FollowListPage };
export type { FollowListPageProps, FollowUser, TabType };
// #endregion

