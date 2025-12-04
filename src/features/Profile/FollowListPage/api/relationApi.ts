/**
 * 关注/粉丝 API - 用户关系相关API接口
 *
 * 功能：
 * - 获取关注列表
 * - 获取粉丝列表
 * - 关注/取消关注用户
 * - 搜索关注/粉丝
 *
 * 后端接口对应：
 * - xypai-user: /api/user/relation/*
 */

import { apiClient } from '../../../../../services/api/client';

// #region 类型定义

/**
 * 关系状态枚举
 * - none: 未关注
 * - following: 已关注对方
 * - followed: 对方关注我（我未关注对方）
 * - mutual: 互相关注
 */
export type RelationStatus = 'none' | 'following' | 'followed' | 'mutual';

/**
 * 关注/粉丝用户项（后端返回格式）
 */
export interface RelationUserItem {
  userId: number;
  nickname: string;
  avatar: string;
  gender: string | null;
  age: number | null;
  isVerified: boolean | null;
  signature: string | null;
  bio: string | null;
  isOnline: boolean | null;
  relationStatus: RelationStatus;
  followStatus: RelationStatus;
  fansCount: number | null;
  isFollowing: boolean | null;
  isMutualFollow: boolean | null;
}

/**
 * 分页响应（后端 TableDataInfo 格式）
 */
export interface PageResponse<T> {
  rows: T[];
  total: number;
  code?: number;
  msg?: string;
}

/**
 * 标准API响应
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  msg?: string;
  data: T | null;
}

/**
 * 批量关系状态响应
 */
export interface BatchRelationStatusResponse {
  [userId: string]: RelationStatus;
}

// #endregion

// #region API端点配置

const API_ENDPOINTS = {
  // 关注列表
  FOLLOWING_LIST: '/xypai-user/api/user/relation/following',
  // 粉丝列表
  FANS_LIST: '/xypai-user/api/user/relation/fans',
  // 关注/取消关注
  FOLLOW_USER: '/xypai-user/api/user/relation/follow',
  // 批量获取关系状态
  BATCH_STATUS: '/xypai-user/api/user/relation/batch-status',
} as const;

// #endregion

// #region API实现

/**
 * 关注/粉丝 API 类
 */
class RelationAPI {
  /**
   * 获取关注列表
   *
   * @param pageNum 页码（从1开始）
   * @param pageSize 每页数量
   * @param keyword 搜索关键词（可选）
   */
  async getFollowingList(
    pageNum: number = 1,
    pageSize: number = 20,
    keyword?: string
  ): Promise<PageResponse<RelationUserItem>> {
    try {
      let url = `${API_ENDPOINTS.FOLLOWING_LIST}?pageNum=${pageNum}&pageSize=${pageSize}`;
      if (keyword) {
        url += `&keyword=${encodeURIComponent(keyword)}`;
      }

      console.log('[RelationAPI] 获取关注列表:', url);

      const response = await apiClient.get<PageResponse<RelationUserItem>>(url);

      // 后端直接返回 TableDataInfo 格式
      if (response.data && 'rows' in response.data) {
        return response.data;
      }

      // 兼容其他格式
      return {
        rows: [],
        total: 0,
      };
    } catch (error) {
      console.error('[RelationAPI] getFollowingList error:', error);
      throw error;
    }
  }

  /**
   * 获取粉丝列表
   *
   * @param pageNum 页码（从1开始）
   * @param pageSize 每页数量
   * @param keyword 搜索关键词（可选）
   */
  async getFansList(
    pageNum: number = 1,
    pageSize: number = 20,
    keyword?: string
  ): Promise<PageResponse<RelationUserItem>> {
    try {
      let url = `${API_ENDPOINTS.FANS_LIST}?pageNum=${pageNum}&pageSize=${pageSize}`;
      if (keyword) {
        url += `&keyword=${encodeURIComponent(keyword)}`;
      }

      console.log('[RelationAPI] 获取粉丝列表:', url);

      const response = await apiClient.get<PageResponse<RelationUserItem>>(url);

      // 后端直接返回 TableDataInfo 格式
      if (response.data && 'rows' in response.data) {
        return response.data;
      }

      // 兼容其他格式
      return {
        rows: [],
        total: 0,
      };
    } catch (error) {
      console.error('[RelationAPI] getFansList error:', error);
      throw error;
    }
  }

  /**
   * 关注用户
   *
   * @param userId 目标用户ID
   */
  async followUser(userId: number | string): Promise<ApiResponse<void>> {
    try {
      const url = `${API_ENDPOINTS.FOLLOW_USER}/${userId}`;
      console.log('[RelationAPI] 关注用户:', url);

      const response = await apiClient.post<ApiResponse<void>>(url);
      return {
        code: response.code,
        message: response.message || '关注成功',
        data: null,
      };
    } catch (error) {
      console.error('[RelationAPI] followUser error:', error);
      throw error;
    }
  }

  /**
   * 取消关注用户
   *
   * @param userId 目标用户ID
   */
  async unfollowUser(userId: number | string): Promise<ApiResponse<void>> {
    try {
      const url = `${API_ENDPOINTS.FOLLOW_USER}/${userId}`;
      console.log('[RelationAPI] 取消关注用户:', url);

      const response = await apiClient.delete<ApiResponse<void>>(url);
      return {
        code: response.code,
        message: response.message || '已取消关注',
        data: null,
      };
    } catch (error) {
      console.error('[RelationAPI] unfollowUser error:', error);
      throw error;
    }
  }

  /**
   * 切换关注状态
   *
   * @param userId 目标用户ID
   * @param isCurrentlyFollowing 当前是否已关注
   */
  async toggleFollow(
    userId: number | string,
    isCurrentlyFollowing: boolean
  ): Promise<ApiResponse<void>> {
    if (isCurrentlyFollowing) {
      return this.unfollowUser(userId);
    } else {
      return this.followUser(userId);
    }
  }

  /**
   * 批量获取关系状态
   *
   * @param userIds 目标用户ID列表
   * @returns Map<用户ID, 关系状态>
   */
  async batchGetRelationStatus(
    userIds: (number | string)[]
  ): Promise<BatchRelationStatusResponse> {
    try {
      const url = API_ENDPOINTS.BATCH_STATUS;
      console.log('[RelationAPI] 批量获取关系状态:', url, userIds);

      const response = await apiClient.post<ApiResponse<BatchRelationStatusResponse>>(url, {
        userIds: userIds.map((id) => (typeof id === 'string' ? parseInt(id, 10) : id)),
      });

      if (response.code === 200 && response.data) {
        return response.data;
      }

      return {};
    } catch (error) {
      console.error('[RelationAPI] batchGetRelationStatus error:', error);
      throw error;
    }
  }
}

// #endregion

// 导出API实例
export const relationApi = new RelationAPI();

// 导出类型
export type { RelationUserItem as FollowUserItem };
