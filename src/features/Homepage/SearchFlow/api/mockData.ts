/**
 * Search API Mock Data - 搜索功能测试数据
 * 用于前端功能测试，模拟后端API响应
 */

import type {
  GetSearchInitResponse,
  GetSearchSuggestResponse,
  ExecuteSearchResponse,
  GetSearchAllResponse,
  GetSearchUsersResponse,
  GetSearchOrdersResponse,
  GetSearchTopicsResponse,
  DeleteSearchHistoryResponse,
  FollowUserResponse,
} from './types';

// ============================================
// 1. 搜索初始化数据
// ============================================
export const mockSearchInitData: GetSearchInitResponse['data'] = {
  searchHistory: [
    {
      keyword: '王者荣耀',
      searchTime: new Date(Date.now() - 3600000).toISOString(),
      type: 'topic',
    },
    {
      keyword: '英雄联盟陪玩',
      searchTime: new Date(Date.now() - 7200000).toISOString(),
      type: 'order',
    },
    {
      keyword: '小明',
      searchTime: new Date(Date.now() - 86400000).toISOString(),
      type: 'user',
    },
    {
      keyword: 'LOL',
      searchTime: new Date(Date.now() - 172800000).toISOString(),
    },
  ],
  hotKeywords: [
    {
      keyword: '王者荣耀',
      rank: 1,
      isHot: true,
    },
    {
      keyword: '英雄联盟',
      rank: 2,
      isHot: true,
    },
    {
      keyword: '探店美食',
      rank: 3,
      isHot: true,
    },
    {
      keyword: 'K歌陪唱',
      rank: 4,
      isHot: false,
    },
    {
      keyword: '剧本杀',
      rank: 5,
      isHot: false,
    },
    {
      keyword: '电影陪看',
      rank: 6,
      isHot: false,
    },
  ],
  placeholder: '搜索用户、服务或话题',
};

// ============================================
// 2. 搜索建议数据
// ============================================
export const generateMockSuggestions = (keyword: string): GetSearchSuggestResponse['data'] => {
  const suggestions = [
    {
      text: `${keyword}高手`,
      type: 'user' as const,
      highlight: keyword,
      icon: 'https://via.placeholder.com/40',
      extra: '1.2万粉丝',
    },
    {
      text: `${keyword}陪玩`,
      type: 'keyword' as const,
      highlight: keyword,
      icon: '🔍',
      extra: '热门搜索',
    },
    {
      text: `#${keyword}`,
      type: 'topic' as const,
      highlight: keyword,
      icon: 'https://via.placeholder.com/40',
      extra: '8.5万讨论',
    },
    {
      text: `${keyword}技术交流`,
      type: 'topic' as const,
      highlight: keyword,
      icon: 'https://via.placeholder.com/40',
      extra: '3.2万讨论',
    },
  ];

  return {
    suggestions: suggestions.slice(0, Math.min(suggestions.length, 5)),
  };
};

// ============================================
// 3. 综合搜索结果数据
// ============================================
export const mockExecuteSearchData: ExecuteSearchResponse['data'] = {
  keyword: '王者荣耀',
  total: 156,
  hasMore: true,
  tabs: [
    {
      type: 'all',
      label: '全部',
      count: 156,
    },
    {
      type: 'user',
      label: '用户',
      count: 45,
    },
    {
      type: 'order',
      label: '下单',
      count: 89,
    },
    {
      type: 'topic',
      label: '话题',
      count: 22,
    },
  ],
  results: {},
};

// ============================================
// 4. 全部Tab搜索结果
// ============================================
export const mockSearchAllData: GetSearchAllResponse['data'] = {
  total: 156,
  hasMore: true,
  list: [
    {
      itemType: 'user',
      itemId: 1001,
      user: {
        userId: 1001,
        avatar: 'https://via.placeholder.com/100/6366F1/FFFFFF?text=U1',
        nickname: '王者荣耀高手',
        signature: '国服李白，带你上王者！',
        isVerified: true,
      },
    },
    {
      itemType: 'post',
      itemId: 2001,
      post: {
        postId: 2001,
        title: '王者荣耀S30赛季上分攻略',
        description: '新赛季强势英雄推荐，助你快速上分！',
        thumbnail: 'https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=Post1',
        mediaType: 'image',
        isVideo: false,
        author: {
          userId: 1002,
          avatar: 'https://via.placeholder.com/40',
          nickname: '游戏达人',
        },
        stats: {
          likes: 1288,
          comments: 156,
          views: 5620,
        },
      },
    },
    {
      itemType: 'video',
      itemId: 3001,
      post: {
        postId: 3001,
        description: '【王者荣耀】极限操作集锦',
        thumbnail: 'https://via.placeholder.com/300x200/EC4899/FFFFFF?text=Video1',
        mediaType: 'video',
        isVideo: true,
        author: {
          userId: 1003,
          avatar: 'https://via.placeholder.com/40',
          nickname: '电竞解说',
        },
        stats: {
          likes: 3456,
          comments: 289,
          views: 12500,
        },
      },
    },
  ],
};

// ============================================
// 5. 用户Tab搜索结果
// ============================================
export const mockSearchUsersData: GetSearchUsersResponse['data'] = {
  total: 45,
  hasMore: true,
  list: [
    {
      userId: 1001,
      avatar: 'https://via.placeholder.com/100/6366F1/FFFFFF?text=U1',
      nickname: '王者荣耀112',
      age: 22,
      gender: 'male',
      signature: '国服李白，带你上王者！专业陪玩三年经验',
      isVerified: true,
      verifiedLabel: '实名认证',
      relationStatus: 'none',
      tags: ['王者荣耀', '电竞', '上分'],
      stats: {
        followers: 1250,
        posts: 89,
      },
    },
    {
      userId: 1002,
      avatar: 'https://via.placeholder.com/100/EC4899/FFFFFF?text=U2',
      nickname: '王者小姐姐',
      age: 19,
      gender: 'female',
      signature: '甜美声音，温柔陪玩～',
      isVerified: true,
      verifiedLabel: '实名认证',
      relationStatus: 'following',
      tags: ['王者荣耀', '声音好听'],
      stats: {
        followers: 3580,
        posts: 156,
      },
    },
    {
      userId: 1003,
      avatar: 'https://via.placeholder.com/100/8B5CF6/FFFFFF?text=U3',
      nickname: '王者荣耀大神',
      age: 25,
      gender: 'male',
      signature: '峡谷之巅千分王者，专业教学',
      isVerified: true,
      verifiedLabel: '实名认证',
      relationStatus: 'mutual',
      tags: ['王者荣耀', '教学', '高端局'],
      stats: {
        followers: 5620,
        posts: 234,
      },
    },
    {
      userId: 1004,
      avatar: 'https://via.placeholder.com/100/10B981/FFFFFF?text=U4',
      nickname: '王者陪玩小队',
      age: 23,
      gender: 'female',
      signature: '专业五黑车队，包上分～',
      isVerified: false,
      relationStatus: 'none',
      tags: ['王者荣耀', '五黑'],
    },
    {
      userId: 1005,
      avatar: 'https://via.placeholder.com/100/F59E0B/FFFFFF?text=U5',
      nickname: '王者技术流',
      age: 27,
      gender: 'male',
      signature: '技术流打法，带你理解游戏',
      isVerified: true,
      verifiedLabel: '实名认证',
      relationStatus: 'followed',
      tags: ['王者荣耀', '技术流'],
      stats: {
        followers: 2340,
        posts: 178,
      },
    },
  ],
};

// ============================================
// 6. 下单Tab搜索结果
// ============================================
export const mockSearchOrdersData: GetSearchOrdersResponse['data'] = {
  total: 89,
  hasMore: true,
  list: [
    {
      userId: 2001,
      avatar: 'https://via.placeholder.com/120/6366F1/FFFFFF?text=O1',
      nickname: '甜心陪玩',
      gender: 'female',
      age: 20,
      distance: 2.3,
      tags: [
        { text: '可线上', type: 'feature', color: '#6366F1' },
        { text: '10元/局', type: 'price', color: '#F59E0B' },
        { text: '王者荣耀', type: 'skill' },
      ],
      description: '王者打野位出租，擅长韩信、兰陵王、阿轲。能C能躺，随叫随到～声音甜美哦',
      price: {
        amount: 10,
        unit: 'per_game',
        displayText: '10 金币/局',
      },
      isOnline: true,
      skills: [
        { name: '王者荣耀', level: '王者' },
        { name: '打野位', level: '精通' },
      ],
      stats: {
        orders: 156,
        rating: 4.9,
      },
    },
    {
      userId: 2002,
      avatar: 'https://via.placeholder.com/120/EC4899/FFFFFF?text=O2',
      nickname: '电竞老司机',
      gender: 'male',
      age: 24,
      distance: 3.8,
      tags: [
        { text: '可线下', type: 'feature', color: '#EC4899' },
        { text: '50元/小时', type: 'price', color: '#F59E0B' },
        { text: '王者荣耀', type: 'skill' },
      ],
      description: '峡谷之巅千分王者，专业教学上分。包你一周上钻石！',
      price: {
        amount: 50,
        unit: 'per_hour',
        displayText: '50 金币/小时',
      },
      isOnline: false,
      skills: [
        { name: '王者荣耀', level: '王者千分' },
        { name: '教学', level: '专业' },
      ],
      stats: {
        orders: 289,
        rating: 5.0,
      },
    },
    {
      userId: 2003,
      avatar: 'https://via.placeholder.com/120/8B5CF6/FFFFFF?text=O3',
      nickname: '温柔小姐姐',
      gender: 'female',
      age: 21,
      distance: 1.5,
      tags: [
        { text: '可线上', type: 'feature', color: '#6366F1' },
        { text: '15元/局', type: 'price', color: '#F59E0B' },
        { text: '声音好听', type: 'skill' },
      ],
      description: '温柔陪聊陪玩，游戏技术还可以，主要是声音好听～让你心情愉悦',
      price: {
        amount: 15,
        unit: 'per_game',
        displayText: '15 金币/局',
      },
      isOnline: true,
      skills: [
        { name: '王者荣耀', level: '钻石' },
        { name: '陪聊', level: '专业' },
      ],
      stats: {
        orders: 567,
        rating: 4.8,
      },
    },
  ],
};

// ============================================
// 7. 话题Tab搜索结果
// ============================================
export const mockSearchTopicsData: GetSearchTopicsResponse['data'] = {
  total: 22,
  hasMore: true,
  list: [
    {
      topicId: 3001,
      topicName: '王者荣耀',
      icon: 'https://via.placeholder.com/80/6366F1/FFFFFF?text=T1',
      description: '王者荣耀游戏交流、攻略分享、陪玩推荐',
      isHot: true,
      hotLabel: '热门',
      stats: {
        posts: 125680,
        views: 5680000,
        followers: 89500,
      },
      category: '游戏',
    },
    {
      topicId: 3002,
      topicName: '王者荣耀陪玩',
      icon: 'https://via.placeholder.com/80/EC4899/FFFFFF?text=T2',
      description: '寻找靠谱的王者荣耀陪玩，一起开黑上分',
      isHot: true,
      hotLabel: '热门',
      stats: {
        posts: 45680,
        views: 1280000,
        followers: 23400,
      },
      category: '陪玩',
    },
    {
      topicId: 3003,
      topicName: '王者荣耀攻略',
      icon: 'https://via.placeholder.com/80/8B5CF6/FFFFFF?text=T3',
      description: '最新版本英雄攻略、出装推荐、上分技巧',
      isHot: false,
      stats: {
        posts: 34560,
        views: 980000,
        followers: 15600,
      },
      category: '攻略',
    },
    {
      topicId: 3004,
      topicName: '王者荣耀赛事',
      icon: 'https://via.placeholder.com/80/10B981/FFFFFF?text=T4',
      description: 'KPL、世冠等职业赛事讨论',
      isHot: false,
      stats: {
        posts: 12340,
        views: 560000,
        followers: 8900,
      },
      category: '电竞',
    },
  ],
};

// ============================================
// 8. 删除搜索历史响应
// ============================================
export const mockDeleteHistoryResponse: DeleteSearchHistoryResponse['data'] = {
  success: true,
};

// ============================================
// 9. 关注用户响应
// ============================================
export const mockFollowUserResponse: FollowUserResponse['data'] = {
  success: true,
  relationStatus: 'following',
};

export const mockUnfollowUserResponse: FollowUserResponse['data'] = {
  success: true,
  relationStatus: 'none',
};

// ============================================
// 工具函数：生成分页数据
// ============================================

/**
 * 生成分页的用户数据
 */
export const generatePaginatedUsers = (pageNum: number, pageSize: number): GetSearchUsersResponse['data'] => {
  const allUsers = mockSearchUsersData.list;
  const start = (pageNum - 1) * pageSize;
  const end = start + pageSize;
  const paginatedList = allUsers.slice(start, end);
  
  return {
    total: allUsers.length,
    hasMore: end < allUsers.length,
    list: paginatedList,
  };
};

/**
 * 生成分页的下单数据
 */
export const generatePaginatedOrders = (pageNum: number, pageSize: number): GetSearchOrdersResponse['data'] => {
  const allOrders = mockSearchOrdersData.list;
  const start = (pageNum - 1) * pageSize;
  const end = start + pageSize;
  const paginatedList = allOrders.slice(start, end);
  
  return {
    total: allOrders.length,
    hasMore: end < allOrders.length,
    list: paginatedList,
  };
};

/**
 * 生成分页的话题数据
 */
export const generatePaginatedTopics = (pageNum: number, pageSize: number): GetSearchTopicsResponse['data'] => {
  const allTopics = mockSearchTopicsData.list;
  const start = (pageNum - 1) * pageSize;
  const end = start + pageSize;
  const paginatedList = allTopics.slice(start, end);
  
  return {
    total: allTopics.length,
    hasMore: end < allTopics.length,
    list: paginatedList,
  };
};
