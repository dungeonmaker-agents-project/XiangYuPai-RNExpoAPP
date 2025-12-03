/**
 * Common API - 通用服务接口（媒体上传、位置服务）
 *
 * 服务: xypai-common (端口: 9407)
 * 职责: 媒体上传、位置服务、文件管理
 *
 * 接口清单（Gateway路径）：
 * - POST /xypai-common/api/v1/media/upload - 上传媒体文件（图片/视频）
 * - GET /xypai-common/api/v1/location/nearby - 获取附近地点
 * - GET /xypai-common/api/v1/location/search - 搜索地点
 *
 * 后端测试文件参考: Page02_PublishFeedTest.java
 *
 * @author XiangYuPai
 * @updated 2025-11-27
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// ==================== 类型定义 ====================

/**
 * 媒体类型
 */
export type MediaType = 'image' | 'video';

/**
 * 媒体上传参数
 */
export interface MediaUploadParams {
  /** 文件对象 */
  file: File | Blob;
  /** 媒体类型: image/video */
  type: MediaType;
  /** 压缩质量（图片专用，0-1） */
  quality?: number;
  /** 最大宽度（图片专用） */
  maxWidth?: number;
  /** 最大高度（图片专用） */
  maxHeight?: number;
}

/**
 * 媒体上传响应
 */
export interface MediaUploadResponse {
  /** 媒体ID */
  mediaId: string;
  /** 媒体URL */
  url: string;
  /** 缩略图URL */
  thumbnailUrl?: string;
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
  /** 视频时长（秒） */
  duration?: number;
}

/**
 * 地点信息
 */
export interface LocationInfo {
  /** 地点ID */
  id: string;
  /** 地点名称 */
  name: string;
  /** 详细地址 */
  address: string;
  /** 经度 */
  longitude: number;
  /** 纬度 */
  latitude: number;
  /** 距离（米） */
  distance?: number;
  /** 类别 */
  category?: string;
  /** 城市 */
  city?: string;
}

/**
 * 地点列表响应
 */
export interface LocationListResponse {
  /** 地点列表 */
  list: LocationInfo[];
  /** 总数 */
  total: number;
  /** 是否有更多 */
  hasMore: boolean;
}

/**
 * 附近地点查询参数
 */
export interface NearbyLocationParams {
  /** 纬度（必填） */
  latitude: number;
  /** 经度（必填） */
  longitude: number;
  /** 搜索半径（km，默认5） */
  radius?: number;
  /** 页码 */
  page?: number;
  /** 每页数量 */
  pageSize?: number;
}

/**
 * 地点搜索参数
 */
export interface LocationSearchParams {
  /** 搜索关键词（1-50字符） */
  keyword: string;
  /** 纬度（可选，用于距离计算） */
  latitude?: number;
  /** 经度（可选） */
  longitude?: number;
  /** 页码 */
  page?: number;
  /** 每页数量 */
  pageSize?: number;
}

// ==================== API配置 ====================

/** 是否使用Mock数据 */
const USE_MOCK_DATA = false;

/** 是否开启调试日志 */
const DEBUG = __DEV__ ?? false;

const log = (...args: any[]) => DEBUG && console.log('[CommonAPI]', ...args);
const logError = (...args: any[]) => console.error('[CommonAPI]', ...args);

// ==================== API实现 ====================

/**
 * Common API 类
 */
export class CommonAPI {
  // ==================== 媒体上传接口 ====================

  /**
   * 上传媒体文件
   */
  async uploadMedia(
    params: MediaUploadParams,
    onProgress?: (progress: number) => void
  ): Promise<MediaUploadResponse | null> {
    const { file, type, quality, maxWidth, maxHeight } = params;

    log('uploadMedia', { type, size: Math.round((file.size || 0) / 1024) + 'KB' });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (onProgress) {
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          onProgress(i);
        }
      }
      return this.generateMockMediaUploadResponse(type);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      if (quality !== undefined) formData.append('quality', String(quality));
      if (maxWidth !== undefined) formData.append('maxWidth', String(maxWidth));
      if (maxHeight !== undefined) formData.append('maxHeight', String(maxHeight));

      const response = await apiClient.post<MediaUploadResponse>(
        API_ENDPOINTS.COMMON.MEDIA_UPLOAD,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent: any) => {
            if (onProgress && progressEvent.total) {
              onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
            }
          },
        }
      );

      log('uploadMedia success', { mediaId: response.data?.mediaId });
      return response.data || null;
    } catch (error: any) {
      logError('uploadMedia failed:', error.message);
      return null;
    }
  }

  /** 上传图片（便捷方法） */
  async uploadImage(
    file: File | Blob,
    options?: { quality?: number; maxWidth?: number; maxHeight?: number },
    onProgress?: (progress: number) => void
  ): Promise<MediaUploadResponse | null> {
    return this.uploadMedia({ file, type: 'image', ...options }, onProgress);
  }

  /** 上传视频（便捷方法） */
  async uploadVideo(
    file: File | Blob,
    onProgress?: (progress: number) => void
  ): Promise<MediaUploadResponse | null> {
    return this.uploadMedia({ file, type: 'video' }, onProgress);
  }

  // ==================== 位置服务接口 ====================

  /**
   * 获取附近地点
   */
  async getNearbyLocations(params: NearbyLocationParams): Promise<LocationListResponse> {
    const { latitude, longitude, radius = 5, page = 1, pageSize = 20 } = params;

    log('getNearbyLocations', { latitude, longitude, radius });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return this.generateMockLocationList(page, pageSize);
    }

    try {
      const url = `${API_ENDPOINTS.COMMON.LOCATION_NEARBY}?latitude=${latitude}&longitude=${longitude}&radius=${radius}&page=${page}&pageSize=${pageSize}`;
      const response = await apiClient.get<LocationListResponse>(url);

      log('getNearbyLocations success', { count: response.data?.list?.length || 0 });
      return response.data || { list: [], total: 0, hasMore: false };
    } catch (error: any) {
      logError('getNearbyLocations failed:', error.message);
      return { list: [], total: 0, hasMore: false };
    }
  }

  /**
   * 搜索地点
   */
  async searchLocations(params: LocationSearchParams): Promise<LocationListResponse> {
    const { keyword, latitude, longitude, page = 1, pageSize = 20 } = params;

    log('searchLocations', { keyword });

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return this.generateMockLocationList(page, pageSize, keyword);
    }

    try {
      let url = `${API_ENDPOINTS.COMMON.LOCATION_SEARCH}?keyword=${encodeURIComponent(keyword)}&page=${page}&pageSize=${pageSize}`;
      if (latitude !== undefined && longitude !== undefined) {
        url += `&latitude=${latitude}&longitude=${longitude}`;
      }

      const response = await apiClient.get<LocationListResponse>(url);

      log('searchLocations success', { count: response.data?.list?.length || 0 });
      return response.data || { list: [], total: 0, hasMore: false };
    } catch (error: any) {
      logError('searchLocations failed:', error.message);
      return { list: [], total: 0, hasMore: false };
    }
  }

  // ==================== Mock数据生成 ====================

  /**
   * 生成Mock媒体上传响应
   */
  private generateMockMediaUploadResponse(type: MediaType): MediaUploadResponse {
    const id = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      mediaId: id,
      url: type === 'image'
        ? `https://picsum.photos/800/600?random=${id}`
        : `https://example.com/video/${id}.mp4`,
      thumbnailUrl: `https://picsum.photos/200/150?random=${id}`,
      width: type === 'image' ? 800 : 1920,
      height: type === 'image' ? 600 : 1080,
      duration: type === 'video' ? Math.floor(Math.random() * 300) + 10 : undefined,
    };
  }

  /**
   * 生成Mock地点列表
   */
  private generateMockLocationList(page: number, pageSize: number, keyword?: string): LocationListResponse {
    const locationNames = [
      { name: '深圳湾公园', address: '广东省深圳市南山区深圳湾', category: '公园' },
      { name: '世界之窗', address: '广东省深圳市南山区深南大道', category: '景点' },
      { name: '欢乐谷', address: '广东省深圳市南山区侨城西街', category: '游乐园' },
      { name: '万象城', address: '广东省深圳市罗湖区宝安南路', category: '商场' },
      { name: '东门老街', address: '广东省深圳市罗湖区东门中路', category: '商业街' },
      { name: '海岸城', address: '广东省深圳市南山区文心五路', category: '商场' },
      { name: '深圳大学', address: '广东省深圳市南山区南海大道', category: '学校' },
      { name: '华强北', address: '广东省深圳市福田区华强北路', category: '商业街' },
      { name: '莲花山公园', address: '广东省深圳市福田区红荔路', category: '公园' },
      { name: '中心书城', address: '广东省深圳市福田区福中一路', category: '书店' },
    ];

    const filteredLocations = keyword
      ? locationNames.filter(loc => loc.name.includes(keyword) || loc.address.includes(keyword))
      : locationNames;

    const startIndex = (page - 1) * pageSize;
    const list: LocationInfo[] = filteredLocations.slice(startIndex, startIndex + pageSize).map((loc, i) => ({
      id: `loc_${startIndex + i}`,
      name: loc.name,
      address: loc.address,
      longitude: 113.9 + Math.random() * 0.2,
      latitude: 22.5 + Math.random() * 0.1,
      distance: Math.floor(Math.random() * 5000),
      category: loc.category,
      city: '深圳市',
    }));

    return {
      list,
      total: filteredLocations.length,
      hasMore: (page * pageSize) < filteredLocations.length,
    };
  }
}

// 导出单例实例
export const commonApi = new CommonAPI();

// 默认导出
export default commonApi;
