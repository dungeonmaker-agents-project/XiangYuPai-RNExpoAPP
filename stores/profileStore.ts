/**
 * Profile Store - 个人主页状态管理
 * 
 * 管理：
 * - 用户资料数据
 * - 动态列表数据
 * - Tab状态
 * - 加载和错误状态
 * 
 * 🔗 数据源集成：
 * - authStore.userInfo: 基础身份信息（登录时保存）
 * - profileStore.currentProfile: 完整资料信息（从API加载）
 * - 使用 authStore.userInfo.id 确定当前用户
 */

import { create } from 'zustand';
import type { Post, TabType, UserProfile } from '../src/features/Profile/types';

// ========== ✅ 导入真实API ==========
import { feedApi, type FeedItem } from '../services/api/feedApi';
import { relationApi } from '../services/api/relationApi';
import { profileApi, type UserProfileVO } from '../services/api/profileApi';
// =========================================

// 🆕 导入authStore以获取当前用户信息
import { useAuthStore } from '../src/features/AuthModule/stores/authStore';

// #region 类型定义

export interface ProfileState {
  // 用户信息
  currentProfile: UserProfile | null;
  
  // Tab状态
  activeTab: TabType;
  
  // 动态列表
  posts: {
    dynamic: Post[];
    collection: Post[];
    likes: Post[];
  };
  
  // 分页状态
  page: {
    dynamic: number;
    collection: number;
    likes: number;
  };
  
  hasMore: {
    dynamic: boolean;
    collection: boolean;
    likes: boolean;
  };
  
  // UI状态
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

export interface ProfileActions {
  // 用户信息
  loadUserProfile: (userId?: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  
  // 🆕 从authStore初始化基础信息
  initializeFromAuth: () => void;
  
  // Tab操作
  setActiveTab: (tab: TabType) => void;
  
  // 动态列表
  loadPosts: (tab: TabType, page: number) => Promise<void>;
  loadMorePosts: (tab: TabType) => Promise<void>;
  refreshPosts: (tab: TabType) => Promise<void>;
  
  // 用户关系
  followUser: (targetUserId: number) => Promise<void>;
  unfollowUser: (targetUserId: number) => Promise<void>;
  
  // 互动操作
  toggleLike: (postId: string, tab: TabType) => Promise<void>;
  toggleCollect: (postId: string, tab: TabType) => Promise<void>;
  
  // 状态管理
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetState: () => void;
}

export type ProfileStore = ProfileState & ProfileActions;

// #endregion

// #region 数据转换

/**
 * 将后端 UserProfileVO 转换为前端 UserProfile
 * ⚠️ 注意：后端字段名与前端类型有差异，需要映射
 * 后端: fansCount, postsCount, likesCount
 * 前端: followerCount, contentCount, totalLikeCount
 */
const transformUserProfileVOToProfile = (vo: any): UserProfile => {
  // 兼容后端返回的不同字段名
  const stats = vo.stats || {};

  return {
    id: String(vo.userId),
    nickname: vo.nickname,
    avatar: vo.avatar,
    backgroundImage: vo.backgroundImage,
    // 后端可能返回 string 或 number 格式的 gender
    gender: typeof vo.gender === 'string'
      ? (vo.gender as 'male' | 'female' | undefined)
      : (vo.gender === 1 ? 'male' : vo.gender === 2 ? 'female' : undefined),
    age: vo.age,
    height: vo.height,
    location: vo.cityName || vo.location || vo.residence,
    bio: vo.bio,
    skills: vo.occupations?.map((o: any) => o.occupationName) || vo.tags || [],
    // ⚠️ 兼容后端不同的字段名
    followerCount: stats.followerCount || stats.fansCount || 0,
    followingCount: stats.followingCount || 0,
    postCount: stats.contentCount || stats.postsCount || 0,
    likeCount: stats.totalLikeCount || stats.likesCount || 0,
    isRealVerified: vo.isRealVerified || vo.isVerified || false,
    isGodVerified: vo.isGodVerified || false,
    isVip: vo.isVip || false,
    isPopular: vo.isPopular || false,
    isOnline: vo.isOnline || false,
    vipLevel: vo.vipLevel || 0,
  };
};

/**
 * 将后端 FeedItem 转换为前端 Post
 */
const transformFeedItemToPost = (feed: FeedItem): Post => {
  return {
    id: feed.id,
    userId: feed.userId,
    userInfo: {
      id: feed.userInfo?.id || feed.userId,
      nickname: feed.userInfo?.nickname || '用户',
      avatar: feed.userInfo?.avatar || 'https://via.placeholder.com/48',
    },
    title: feed.title,
    content: feed.content || feed.summary || '',
    coverImage: feed.coverImage || feed.mediaList?.[0]?.url,
    mediaList: feed.mediaList?.map(media => ({
      id: media.id,
      type: media.type,
      url: media.url,
      thumbnailUrl: media.thumbnailUrl,
      width: media.width,
      height: media.height,
      duration: media.duration,
    })) || [],
    topicList: feed.topicList?.map(topic => ({
      id: topic.name, // 使用 name 作为 id
      name: topic.name,
    })),
    location: feed.locationName,
    likeCount: feed.likeCount || 0,
    commentCount: feed.commentCount || 0,
    shareCount: feed.shareCount || 0,
    isLiked: feed.isLiked || false,
    isCollected: feed.isCollected || false,
    createdAt: feed.createdAt || Date.now(),
  };
};

// #endregion

// #region Mock Data Generator

/**
 * 生成模拟动态数据
 */
const generateMockPosts = (count: number = 10, isCurrentUser: boolean = true): Post[] => {
  const posts: Post[] = [];
  const titles = [
    '请你们看雪',
    '今天的日落很美',
    '分享一下我的日常',
    '最近爱上了摄影',
    '周末出游记录',
    '美食探店',
    '健身打卡第N天',
    '读书笔记分享',
  ];
  
  const images = [
    'https://picsum.photos/400/500?random=',
    'https://picsum.photos/400/600?random=',
    'https://picsum.photos/400/450?random=',
  ];
  
  // 🎯 根据是否是当前用户，使用不同的昵称
  const mockNickname = isCurrentUser ? '我的昵称' : '他人昵称';
  
  for (let i = 0; i < count; i++) {
    posts.push({
      id: `post_${Date.now()}_${i}`,
      userId: 'mock_user_001',
      userInfo: {
        id: 'mock_user_001',
        nickname: mockNickname,
        avatar: `https://picsum.photos/48/48?random=${i}`,
      },
      title: titles[i % titles.length],
      content: isCurrentUser 
        ? '这是我发布的动态内容，记录生活点滴。' 
        : '这是他发布的动态内容，分享生活瞬间。',
      coverImage: `${images[i % images.length]}${i}`,
      mediaList: [{
        id: `media_${i}`,
        type: Math.random() > 0.7 ? 'video' : 'image',
        url: `${images[i % images.length]}${i}`,
        width: 400,
        height: 500 + (i % 3) * 50,
      }],
      likeCount: Math.floor(Math.random() * 200) + 10,
      commentCount: Math.floor(Math.random() * 50),
      shareCount: Math.floor(Math.random() * 20),
      isLiked: Math.random() > 0.5,
      isCollected: Math.random() > 0.7,
      createdAt: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
    });
  }
  
  return posts;
};

// #endregion

// #region 初始状态

const initialState: ProfileState = {
  currentProfile: null,
  activeTab: 'dynamic',
  posts: {
    dynamic: [],
    collection: [],
    likes: [],
  },
  page: {
    dynamic: 1,
    collection: 1,
    likes: 1,
  },
  hasMore: {
    dynamic: true,
    collection: true,
    likes: true,
  },
  loading: false,
  refreshing: false,
  error: null,
};

// #endregion

// #region Store创建

export const useProfileStore = create<ProfileStore>((set, get) => ({
  // 初始状态
  ...initialState,
  
  // 加载用户资料（使用真实API）
  loadUserProfile: async (userId?: string) => {
    console.log('\n🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥');
    console.log('🔥 [PROFILE STORE] loadUserProfile 被调用（使用真实API）！');
    console.log('🔥 传入参数 userId:', userId || '(未传入)');
    console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥\n');

    try {
      set({ loading: true, error: null });

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔄 加载用户资料开始（真实API）');

      // 🆕 智能用户ID解析
      const authState = useAuthStore.getState();
      const targetUserId = userId || authState.userInfo?.id;

      console.log('   传入userId:', userId || '未传入');
      console.log('   authStore用户ID:', authState.userInfo?.id || '未登录');
      console.log('   最终使用:', targetUserId || 'current-user');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // ========== ✅ 使用真实API ==========
      let profileData: UserProfileVO;

      if (targetUserId) {
        console.log('🔥 调用 profileApi.getUserProfile:', targetUserId);
        profileData = await profileApi.getUserProfile(Number(targetUserId));
      } else {
        console.log('🔥 调用 profileApi.getCurrentUserProfile');
        profileData = await profileApi.getCurrentUserProfile();
      }

      console.log('🔥 API请求完成！');
      console.log('✅ API调用成功，获取到资料数据');
      console.log('   昵称:', profileData.nickname);
      console.log('   粉丝数:', profileData.stats?.followerCount);
      console.log('   关注数:', profileData.stats?.followingCount);

      // 🔄 转换后端数据为前端格式
      const profile = transformUserProfileVOToProfile(profileData);

      console.log('✅ 数据转换完成');
      console.log('   前端ID:', profile.id);
      console.log('   昵称:', profile.nickname);
      console.log('   粉丝数:', profile.followerCount);
      console.log('   关注数:', profile.followingCount);
      // =========================================

      // 🆕 与authStore数据同步
      if (!userId && authState.userInfo) {
        console.log('🔗 同步基础信息到profile');
        console.log('   手机号:', authState.userInfo.phone);
        console.log('   认证状态:', authState.userInfo.verified);
      }

      set({ currentProfile: profile, loading: false });

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎉 用户资料加载完成（真实API）！');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } catch (error) {
      console.error('\n❌ 加载用户资料失败:', error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : '加载失败',
      });
    }
  },
  
  // 🆕 从authStore初始化基础信息
  initializeFromAuth: () => {
    const authState = useAuthStore.getState();
    
    if (!authState.isAuthenticated || !authState.userInfo) {
      console.log('⚠️ 未登录，跳过profile初始化');
      return;
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔗 从authStore初始化profile基础信息');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const { userInfo } = authState;
    
    // 创建基础profile（只包含authStore已有的信息）
    const basicProfile: UserProfile = {
      id: userInfo.id,
      nickname: userInfo.nickname || '用户',
      avatar: userInfo.avatar || 'https://via.placeholder.com/96',
      // 其他字段从API加载时填充
    };
    
    console.log('   用户ID:', basicProfile.id);
    console.log('   昵称:', basicProfile.nickname);
    console.log('   手机号:', userInfo.phone);
    console.log('   认证状态:', userInfo.verified);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    set({ currentProfile: basicProfile });
  },
  
  // 更新用户资料
  updateUserProfile: (updates) => {
    set((state) => ({
      currentProfile: state.currentProfile
        ? { ...state.currentProfile, ...updates }
        : null,
    }));
  },
  
  // 设置活动Tab
  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  // 加载动态列表（使用真实API）
  loadPosts: async (tab, page) => {
    // 只为dynamic/collection/likes三个tab加载数据
    if (tab === 'profile') {
      console.log('资料Tab不需要加载动态列表');
      return;
    }

    try {
      set({ loading: true, error: null });

      const { currentProfile } = get();
      const authState = useAuthStore.getState();
      const userId = currentProfile?.id || authState.userInfo?.id;
      const tabKey = tab as 'dynamic' | 'collection' | 'likes';

      console.log(`\n📋 加载${tab}列表 - 第${page}页（使用真实API）`);
      console.log(`   用户ID: ${userId}`);

      let posts: Post[] = [];
      let hasMore = false;

      // ========== ✅ 使用真实API ==========
      if (tab === 'dynamic') {
        // 获取用户动态列表
        if (!userId) {
          console.warn('   ⚠️ 未找到用户ID，无法加载动态');
          set({ loading: false });
          return;
        }

        const response = await feedApi.getUserFeedList(userId, {
          pageNum: page,
          pageSize: 10,
        });

        posts = response.list.map(transformFeedItemToPost);
        hasMore = response.hasMore;

        console.log(`   ✅ 获取到 ${response.list.length} 条动态`);

      } else if (tab === 'collection') {
        // 获取我的收藏列表
        const response = await feedApi.getMyCollections({
          pageNum: page,
          pageSize: 10,
        });

        // 将 CollectionItem 转换为 Post 格式
        posts = response.records.map(item => ({
          id: String(item.id),
          userId: String(item.author.userId),
          userInfo: {
            id: String(item.author.userId),
            nickname: item.author.nickname,
            avatar: item.author.avatar,
          },
          content: item.targetContent,
          coverImage: item.targetCover,
          mediaList: item.targetCover ? [{
            id: `cover_${item.id}`,
            type: 'image' as const,
            url: item.targetCover,
            width: 400,
            height: 300,
          }] : [],
          likeCount: 0,
          commentCount: 0,
          shareCount: 0,
          isLiked: false,
          isCollected: true,
          createdAt: new Date(item.collectTime).getTime(),
        }));
        hasMore = page < response.pages;

        console.log(`   ✅ 获取到 ${response.records.length} 条收藏`);

      } else if (tab === 'likes') {
        // 点赞Tab暂时使用Mock数据（后端可能没有对应接口）
        console.log('   ℹ️ 点赞列表暂时使用Mock数据');
        const isCurrentUser = !currentProfile?.id || currentProfile.id === authState.userInfo?.id;
        posts = generateMockPosts(10, isCurrentUser);
        hasMore = page < 3;
      }
      // =========================================

      set((state) => ({
        posts: {
          ...state.posts,
          [tabKey]: page === 1 ? posts : [...state.posts[tabKey], ...posts],
        },
        page: {
          ...state.page,
          [tabKey]: page,
        },
        hasMore: {
          ...state.hasMore,
          [tabKey]: hasMore,
        },
        loading: false,
      }));

      console.log(`✅ ${tab}数据加载完成，共${posts.length}条`);

    } catch (error) {
      console.error(`❌ 加载${tab}列表失败:`, error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : '加载失败',
      });
    }
  },
  
  // 加载更多
  loadMorePosts: async (tab) => {
    if (tab === 'profile') return;
    
    const { page, hasMore } = get();
    const tabKey = tab as 'dynamic' | 'collection' | 'likes';
    if (!hasMore[tabKey]) return;
    
    await get().loadPosts(tab, page[tabKey] + 1);
  },
  
  // 刷新
  refreshPosts: async (tab) => {
    if (tab === 'profile') return;
    
    set({ refreshing: true });
    await get().loadPosts(tab, 1);
    set({ refreshing: false });
  },
  
  // 关注用户（使用真实API）
  followUser: async (targetUserId: number) => {
    try {
      console.log('🔄 关注用户:', targetUserId);

      // ========== ✅ 使用真实API ==========
      const response = await relationApi.followUser(targetUserId);

      if (response.success) {
        // 更新关系状态
        set((state) => ({
          currentProfile: state.currentProfile ? {
            ...state.currentProfile,
            followingCount: response.followingCount ?? (state.currentProfile.followingCount || 0) + 1,
          } : null,
        }));

        console.log('✅ 关注成功');
      } else {
        console.warn('⚠️ 关注操作未成功');
      }
      // =========================================
    } catch (error) {
      console.error('❌ 关注失败:', error);
      throw error;
    }
  },

  // 取消关注（使用真实API）
  unfollowUser: async (targetUserId: number) => {
    try {
      console.log('🔄 取消关注:', targetUserId);

      // ========== ✅ 使用真实API ==========
      const response = await relationApi.unfollowUser(targetUserId);

      if (response.success) {
        // 更新关系状态
        set((state) => ({
          currentProfile: state.currentProfile ? {
            ...state.currentProfile,
            followingCount: response.followingCount ?? Math.max((state.currentProfile.followingCount || 0) - 1, 0),
          } : null,
        }));

        console.log('✅ 取消关注成功');
      } else {
        console.warn('⚠️ 取消关注操作未成功');
      }
      // =========================================
    } catch (error) {
      console.error('❌ 取消关注失败:', error);
      throw error;
    }
  },
  
  // 点赞
  toggleLike: async (postId, tab) => {
    if (tab === 'profile') return;
    
    const tabKey = tab as 'dynamic' | 'collection' | 'likes';
    
    // 乐观更新
    set((state) => ({
      posts: {
        ...state.posts,
        [tabKey]: state.posts[tabKey].map((post: Post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
              }
            : post
        ),
      },
    }));
    
    try {
      // TODO: 调用内容模块的点赞API
      console.log('点赞动态:', postId);
    } catch (error) {
      // 失败时回滚
      set((state) => ({
        posts: {
          ...state.posts,
          [tabKey]: state.posts[tabKey].map((post: Post) =>
            post.id === postId
              ? {
                  ...post,
                  isLiked: !post.isLiked,
                  likeCount: post.isLiked ? post.likeCount + 1 : post.likeCount - 1,
                }
              : post
          ),
        },
      }));
    }
  },
  
  // 收藏
  toggleCollect: async (postId, tab) => {
    if (tab === 'profile') return;
    
    const tabKey = tab as 'dynamic' | 'collection' | 'likes';
    
    // 乐观更新
    set((state) => ({
      posts: {
        ...state.posts,
        [tabKey]: state.posts[tabKey].map((post: Post) =>
          post.id === postId
            ? {
                ...post,
                isCollected: !post.isCollected,
              }
            : post
        ),
      },
    }));
    
    try {
      // TODO: 调用内容模块的收藏API
      console.log('收藏动态:', postId);
    } catch (error) {
      // 失败时回滚
      set((state) => ({
        posts: {
          ...state.posts,
          [tabKey]: state.posts[tabKey].map((post: Post) =>
            post.id === postId
              ? {
                  ...post,
                  isCollected: !post.isCollected,
                }
              : post
          ),
        },
      }));
    }
  },
  
  // 设置加载状态
  setLoading: (loading) => {
    set({ loading });
  },
  
  // 设置错误
  setError: (error) => {
    set({ error });
  },
  
  // 重置状态
  resetState: () => {
    set(initialState);
  },
}));

// #endregion

// #region 选择器

export const useCurrentProfile = () => useProfileStore((state) => state.currentProfile);
export const useActiveTab = () => useProfileStore((state) => state.activeTab);
export const usePosts = (tab: 'dynamic' | 'collection' | 'likes') => useProfileStore((state) => state.posts[tab]);
export const useProfileLoading = () => useProfileStore((state) => state.loading);
export const useProfileError = () => useProfileStore((state) => state.error);

// #endregion

