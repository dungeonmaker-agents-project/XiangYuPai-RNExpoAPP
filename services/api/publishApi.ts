/**
 * Publish API - 发布动态相关API
 *
 * 功能：
 * - 发布动态
 * - 话题搜索/分类
 * - 地点搜索
 * - 媒体上传
 * - 草稿管理
 */

import { apiClient } from './client';
import { buildQueryParams } from './config';

// ==================== 类型定义 ====================

/**
 * 话题类型
 */
export interface Topic {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  isHot?: boolean;
  isOfficial?: boolean;
  participantCount?: number;
  postCount?: number;
}

/**
 * 话题分类
 */
export interface TopicCategory {
  id: string;
  name: string;
  icon?: string;
  topics: Topic[];
}

/**
 * 地点类型
 */
export interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
  category?: string;
}

/**
 * 媒体类型
 */
export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
}

/**
 * 发布动态DTO
 */
export interface PublishFeedDTO {
  title?: string;
  content: string;
  type?: number;  // 1=图文, 2=视频
  mediaType?: 'image' | 'video';
  mediaIds?: string[];
  topicIds?: string[];
  topicNames?: string[];
  locationId?: string;
  locationName?: string;
  locationAddress?: string;
  longitude?: number;
  latitude?: number;
  visibility?: number;  // 0=公开, 1=仅好友, 2=仅自己
}

/**
 * 草稿类型
 */
export interface Draft {
  id: string;
  title?: string;
  content: string;
  mediaList?: MediaItem[];
  topics?: Topic[];
  location?: Location;
  createdAt: number;
  updatedAt: number;
}

/**
 * 发布配置
 */
export interface PublishConfig {
  maxTitleLength: number;
  maxContentLength: number;
  maxImageCount: number;
  maxVideoCount: number;
  maxTopicCount: number;
  supportedImageFormats: string[];
  supportedVideoFormats: string[];
  maxImageSize: number;
  maxVideoSize: number;
}

// ==================== Mock 数据 ====================

const MOCK_TOPICS: Topic[] = [
  { id: '1', name: '王者荣耀', description: '王者荣耀相关内容', isHot: true, participantCount: 15000, postCount: 50000 },
  { id: '2', name: '英雄联盟', description: '英雄联盟相关内容', isHot: true, participantCount: 12000, postCount: 45000 },
  { id: '3', name: '和平精英', description: '和平精英相关内容', isHot: true, participantCount: 10000, postCount: 35000 },
  { id: '4', name: '探店日记', description: '分享你的探店体验', isHot: false, participantCount: 8000, postCount: 30000 },
  { id: '5', name: '美食推荐', description: '发现身边的美食', isHot: false, participantCount: 6000, postCount: 25000 },
  { id: '6', name: '游戏陪玩', description: '找个好搭档一起玩游戏', isHot: true, participantCount: 5000, postCount: 20000 },
];

const MOCK_TOPIC_CATEGORIES: TopicCategory[] = [
  {
    id: 'games',
    name: '游戏',
    icon: '🎮',
    topics: MOCK_TOPICS.filter(t => ['1', '2', '3', '6'].includes(t.id)),
  },
  {
    id: 'lifestyle',
    name: '生活',
    icon: '🏠',
    topics: MOCK_TOPICS.filter(t => ['4', '5'].includes(t.id)),
  },
];

const MOCK_LOCATIONS: Location[] = [
  { id: '1', name: '深圳南山科技园', address: '广东省深圳市南山区科技园', latitude: 22.5329, longitude: 113.9432, distance: 500 },
  { id: '2', name: '深圳福田CBD', address: '广东省深圳市福田区中心区', latitude: 22.5402, longitude: 114.0616, distance: 1200 },
  { id: '3', name: '深圳宝安中心', address: '广东省深圳市宝安区宝安中心', latitude: 22.5560, longitude: 113.8831, distance: 3500 },
];

const DEFAULT_PUBLISH_CONFIG: PublishConfig = {
  maxTitleLength: 50,
  maxContentLength: 2000,
  maxImageCount: 9,
  maxVideoCount: 1,
  maxTopicCount: 5,
  supportedImageFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  supportedVideoFormats: ['mp4', 'mov', 'avi'],
  maxImageSize: 10 * 1024 * 1024,  // 10MB
  maxVideoSize: 100 * 1024 * 1024, // 100MB
};

// ==================== Publish API Class ====================

class PublishAPI {
  private useMockData = false;  // 关闭Mock，使用真实API

  /**
   * 获取发布配置
   */
  async getPublishConfig(): Promise<PublishConfig> {
    console.log('[PublishAPI] 获取发布配置');

    if (this.useMockData) {
      return DEFAULT_PUBLISH_CONFIG;
    }

    try {
      const response = await apiClient.get<PublishConfig>('/xypai-content/api/v1/publish/config');
      return response.data;
    } catch (error) {
      console.error('[PublishAPI] 获取发布配置失败', error);
      return DEFAULT_PUBLISH_CONFIG;
    }
  }

  /**
   * 获取话题分类列表
   */
  async getTopicCategories(): Promise<TopicCategory[]> {
    console.log('[PublishAPI] 获取话题分类列表');

    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return MOCK_TOPIC_CATEGORIES;
    }

    try {
      const response = await apiClient.get<TopicCategory[]>('/xypai-content/api/v1/topics/categories');
      return response.data || [];
    } catch (error) {
      console.error('[PublishAPI] 获取话题分类失败', error);
      return [];
    }
  }

  /**
   * 获取热门话题
   */
  async getHotTopics(limit: number = 10): Promise<Topic[]> {
    console.log('[PublishAPI] 获取热门话题', { limit });

    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return MOCK_TOPICS.filter(t => t.isHot).slice(0, limit);
    }

    try {
      const queryParams = buildQueryParams({ limit });
      const response = await apiClient.get<Topic[]>(`/xypai-content/api/v1/topics/hot?${queryParams}`);
      return response.data || [];
    } catch (error) {
      console.error('[PublishAPI] 获取热门话题失败', error);
      return [];
    }
  }

  /**
   * 搜索话题
   */
  async searchTopics(keyword: string, pageNum: number = 1, pageSize: number = 20): Promise<Topic[]> {
    console.log('[PublishAPI] 搜索话题', { keyword, pageNum, pageSize });

    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 300));
      if (!keyword.trim()) {
        return MOCK_TOPICS;
      }
      return MOCK_TOPICS.filter(t =>
        t.name.toLowerCase().includes(keyword.toLowerCase()) ||
        t.description?.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    try {
      const queryParams = buildQueryParams({ keyword, pageNum, pageSize });
      const response = await apiClient.get<Topic[]>(`/xypai-content/api/v1/topics/search?${queryParams}`);
      return response.data || [];
    } catch (error) {
      console.error('[PublishAPI] 搜索话题失败', error);
      return [];
    }
  }

  /**
   * 获取附近地点
   */
  async getNearbyLocations(latitude: number, longitude: number, radius: number = 5000): Promise<Location[]> {
    console.log('[PublishAPI] 获取附近地点', { latitude, longitude, radius });

    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_LOCATIONS;
    }

    try {
      const queryParams = buildQueryParams({ latitude, longitude, radius });
      const response = await apiClient.get<Location[]>(`/xypai-content/api/v1/locations/nearby?${queryParams}`);
      return response.data || [];
    } catch (error) {
      console.error('[PublishAPI] 获取附近地点失败', error);
      return [];
    }
  }

  /**
   * 搜索地点
   */
  async searchLocations(keyword: string, latitude?: number, longitude?: number): Promise<Location[]> {
    console.log('[PublishAPI] 搜索地点', { keyword, latitude, longitude });

    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 300));
      if (!keyword.trim()) {
        return MOCK_LOCATIONS;
      }
      return MOCK_LOCATIONS.filter(loc =>
        loc.name.toLowerCase().includes(keyword.toLowerCase()) ||
        loc.address.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    try {
      const queryParams = buildQueryParams({ keyword, latitude, longitude });
      const response = await apiClient.get<Location[]>(`/xypai-content/api/v1/locations/search?${queryParams}`);
      return response.data || [];
    } catch (error) {
      console.error('[PublishAPI] 搜索地点失败', error);
      return [];
    }
  }

  /**
   * 上传媒体文件
   */
  async uploadMedia(
    file: File | { uri: string; type: string; name: string },
    type: 'image' | 'video',
    onProgress?: (progress: number) => void
  ): Promise<MediaItem | null> {
    console.log('[PublishAPI] 上传媒体文件', { type, fileName: (file as any).name });

    if (this.useMockData) {
      // 模拟上传进度
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        onProgress?.(i);
      }
      return {
        id: `media-${Date.now()}`,
        type,
        url: `https://picsum.photos/seed/${Date.now()}/800/600`,
        thumbnailUrl: `https://picsum.photos/seed/${Date.now()}/200/150`,
        width: 800,
        height: 600,
      };
    }

    try {
      const formData = new FormData();
      formData.append('file', file as any);
      formData.append('type', type);

      const response = await apiClient.upload<MediaItem>(
        '/xypai-content/api/v1/media/upload',
        formData,
        onProgress
      );

      return response.data;
    } catch (error) {
      console.error('[PublishAPI] 上传媒体文件失败', error);
      return null;
    }
  }

  /**
   * 发布动态
   */
  async publishFeed(data: PublishFeedDTO): Promise<string | null> {
    console.log('[PublishAPI] 发布动态', { title: data.title, contentLength: data.content?.length });

    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const feedId = `feed-${Date.now()}`;
      console.log('[PublishAPI] 发布成功（Mock）', { feedId });
      return feedId;
    }

    try {
      const response = await apiClient.post<{ id: string }>('/xypai-content/api/v1/content/publish', data);
      const feedId = response.data?.id || String(response.data);
      console.log('[PublishAPI] 发布成功', { feedId });
      return feedId;
    } catch (error) {
      console.error('[PublishAPI] 发布失败', error);
      return null;
    }
  }

  /**
   * 保存草稿
   */
  async saveDraft(draft: Omit<Draft, 'id' | 'createdAt' | 'updatedAt'>): Promise<Draft | null> {
    console.log('[PublishAPI] 保存草稿');

    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const now = Date.now();
      return {
        ...draft,
        id: `draft-${now}`,
        createdAt: now,
        updatedAt: now,
      };
    }

    try {
      const response = await apiClient.post<Draft>('/xypai-content/api/v1/drafts', draft);
      return response.data;
    } catch (error) {
      console.error('[PublishAPI] 保存草稿失败', error);
      return null;
    }
  }

  /**
   * 获取草稿列表
   */
  async getDrafts(): Promise<Draft[]> {
    console.log('[PublishAPI] 获取草稿列表');

    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return [];
    }

    try {
      const response = await apiClient.get<Draft[]>('/xypai-content/api/v1/drafts');
      return response.data || [];
    } catch (error) {
      console.error('[PublishAPI] 获取草稿列表失败', error);
      return [];
    }
  }

  /**
   * 删除草稿
   */
  async deleteDraft(draftId: string): Promise<boolean> {
    console.log('[PublishAPI] 删除草稿', { draftId });

    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return true;
    }

    try {
      await apiClient.delete(`/xypai-content/api/v1/drafts/${draftId}`);
      return true;
    } catch (error) {
      console.error('[PublishAPI] 删除草稿失败', error);
      return false;
    }
  }

  /**
   * 切换Mock模式（开发测试用）
   */
  setMockMode(useMock: boolean): void {
    this.useMockData = useMock;
    console.log('[PublishAPI] Mock模式:', useMock ? '开启' : '关闭');
  }
}

// 导出单例
export const publishApi = new PublishAPI();

// 导出类型
export type {
  Topic,
  TopicCategory,
  Location,
  MediaItem,
  PublishFeedDTO,
  Draft,
  PublishConfig,
};
