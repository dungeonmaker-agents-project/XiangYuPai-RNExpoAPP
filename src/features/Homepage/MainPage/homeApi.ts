/**
 * 首页API服务
 * 根据接口文档实现的首页相关API调用
 * 文档参考: XiangYuPai-Doc/Action-API/Home/首页接口文档.md
 */

import type {
  CheckInResponse,
  ExpertsResponse,
  FeedResponse,
  HomeInitResponse,
  TopicBannerResponse,
} from './types';

// API基础URL - 需要根据实际环境配置
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com';

/**
 * 通用API请求封装
 */
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`[homeApi] API请求失败: ${endpoint}`, error);
    throw error;
  }
}

/**
 * 一、首页初始化加载
 * 接口: GET /api/home/init
 * 说明: 用户打开App或切换到首页Tab时触发
 */
export async function getHomeInit(): Promise<HomeInitResponse> {
  return apiRequest<HomeInitResponse>('/api/home/init', {
    method: 'GET',
  });
}

/**
 * 二、明日专家推荐
 * 接口: GET /api/home/experts
 * 说明: 首页加载后自动展示"明日专家"模块
 */
export async function getExperts(): Promise<ExpertsResponse> {
  return apiRequest<ExpertsResponse>('/api/home/experts', {
    method: 'GET',
  });
}

/**
 * 三、你什么名模块
 * 接口: GET /api/home/topic-banner
 * 说明: 首页滚动至"你什么名"模块时触发
 */
export async function getTopicBanner(): Promise<TopicBannerResponse> {
  return apiRequest<TopicBannerResponse>('/api/home/topic-banner', {
    method: 'GET',
  });
}

/**
 * 四、内容Feed流
 * 接口: GET /api/home/feed
 * 参数:
 *   - pageNum: 页码（从1开始）
 *   - pageSize: 每页数量（建议10，范围5-20）
 * 说明: 首页加载完成后自动展示内容流，支持下拉刷新和上拉加载
 */
export async function getFeed(params: {
  pageNum: number;
  pageSize: number;
}): Promise<FeedResponse> {
  const { pageNum, pageSize } = params;
  
  // 前端验证
  if (pageNum < 1) {
    throw new Error('pageNum必须大于等于1');
  }
  if (pageSize < 5 || pageSize > 20) {
    throw new Error('pageSize范围必须在5-20之间');
  }

  const queryParams = new URLSearchParams({
    pageNum: pageNum.toString(),
    pageSize: pageSize.toString(),
  });

  return apiRequest<FeedResponse>(`/api/home/feed?${queryParams}`, {
    method: 'GET',
  });
}

/**
 * 五、签到功能
 * 接口: POST /api/user/check-in
 * 说明: 用户点击快捷入口的"签到"图标时触发
 * 注意: 需要登录状态，未登录时应跳转登录页
 */
export async function checkIn(): Promise<CheckInResponse> {
  return apiRequest<CheckInResponse>('/api/user/check-in', {
    method: 'POST',
  });
}

/**
 * 下拉刷新 - 批量刷新所有数据
 * 说明: 用户在首页下拉屏幕时，并发请求所有接口
 */
export async function refreshAllData(): Promise<{
  init: HomeInitResponse;
  experts: ExpertsResponse;
  topicBanner: TopicBannerResponse;
  feed: FeedResponse;
}> {
  try {
    const [init, experts, topicBanner, feed] = await Promise.all([
      getHomeInit(),
      getExperts(),
      getTopicBanner(),
      getFeed({ pageNum: 1, pageSize: 10 }),
    ]);

    return { init, experts, topicBanner, feed };
  } catch (error) {
    console.error('[homeApi] 刷新全部数据失败', error);
    throw error;
  }
}

// ========== Mock数据生成函数（用于开发和测试） ==========

/**
 * 生成Mock首页初始化数据
 */
export function generateMockHomeInit(): HomeInitResponse {
  return {
    userInfo: {
      userId: 1001,
      avatar: 'https://picsum.photos/100/100?random=user',
      unreadCount: 3,
    },
    banner: {
      imageUrl: 'https://picsum.photos/800/300?random=banner',
      linkType: 'native',
      linkUrl: '/events/special',
    },
    quickEntries: [
      { icon: '✅', title: '签到', linkUrl: '/checkin' },
      { icon: '🎮', title: '电竞赛事', linkUrl: '/esports' },
      { icon: '📊', title: '电竞资料', linkUrl: '/esports-data' },
      { icon: '🎁', title: '礼物商城', linkUrl: '/shop' },
      { icon: '💰', title: '充值', linkUrl: '/recharge' },
    ],
    giftItems: [
      { icon: '🌹', name: '玫瑰' },
      { icon: '💝', name: '礼物' },
      { icon: '👑', name: '皇冠' },
      { icon: '🎂', name: '蛋糕' },
      { icon: '🍷', name: '红酒' },
    ],
  };
}

/**
 * 生成Mock专家推荐数据
 */
export function generateMockExperts(): ExpertsResponse {
  return {
    title: '明日专家',
    tag: 'HOT推广中',
    experts: Array.from({ length: 5 }, (_, i) => ({
      userId: 2000 + i,
      avatar: `https://picsum.photos/100/100?random=expert${i}`,
      label: `明日${20 + i}`,
    })),
  };
}

/**
 * 生成Mock你什么名模块数据
 */
export function generateMockTopicBanner(): TopicBannerResponse {
  return {
    title: '你什么名',
    bannerImage: 'https://picsum.photos/800/200?random=topic',
    linkUrl: '/topic/whatsyourname',
  };
}

/**
 * 生成Mock内容Feed流数据
 */
export function generateMockFeed(pageNum: number = 1, pageSize: number = 10): FeedResponse {
  const startIndex = (pageNum - 1) * pageSize;
  const list = Array.from({ length: pageSize }, (_, i) => {
    const index = startIndex + i;
    return {
      postId: 3000 + index,
      author: {
        userId: 1000 + (index % 50),
        avatar: `https://picsum.photos/80/80?random=author${index}`,
        nickname: `昵称屑屑${100 + index}`,
        tags: index % 3 === 0 ? ['认证用户', '优质创作者'] : undefined,
      },
      description: [
        '明天见，两个相机开播加油！',
        '今天状态超好，一起来玩呀~',
        '直播中，快来看看吧！',
        '新作品发布，希望大家喜欢',
      ][index % 4],
      thumbnails: Array.from({ length: 3 }, (_, j) => 
        `https://picsum.photos/200/200?random=post${index}_${j}`
      ),
      mediaType: (index % 3 === 0 ? 'video' : 'image') as 'video' | 'image',
      location: index % 2 === 0 ? '舞厅1号台' : undefined,
      additionalInfo: index % 4 === 0 ? '查看他的信息' : undefined,
    };
  });

  return {
    total: 100, // 假设总共100条
    hasMore: pageNum * pageSize < 100,
    list,
  };
}

/**
 * 生成Mock签到响应数据
 */
export function generateMockCheckIn(alreadyChecked: boolean = false): CheckInResponse {
  return {
    success: !alreadyChecked,
    todayChecked: alreadyChecked,
    continuousDays: alreadyChecked ? 5 : 6,
    reward: alreadyChecked ? undefined : {
      type: 'coins',
      amount: 10,
    },
  };
}

// ========== 导出所有API函数 ==========
export const homeApi = {
  // 真实API
  getHomeInit,
  getExperts,
  getTopicBanner,
  getFeed,
  checkIn,
  refreshAllData,
  // Mock数据生成
  generateMockHomeInit,
  generateMockExperts,
  generateMockTopicBanner,
  generateMockFeed,
  generateMockCheckIn,
};
