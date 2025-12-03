/**
 * Relation API 服务 - 用户关系相关接口
 *
 * 基于后端实际实现：
 * - RelationController: /api/user/relation/*
 *
 * 接口清单：
 * - ✅ POST /xypai-user/api/user/relation/follow/{followingId} - 关注用户
 * - ✅ DELETE /xypai-user/api/user/relation/follow/{followingId} - 取消关注
 * - ✅ GET /xypai-user/api/user/relation/following - 关注列表
 * - ✅ GET /xypai-user/api/user/relation/fans - 粉丝列表
 * - ✅ POST /xypai-user/api/user/relation/block/{blockedUserId} - 拉黑用户
 * - ✅ DELETE /xypai-user/api/user/relation/block/{blockedUserId} - 取消拉黑
 * - ✅ POST /xypai-user/api/user/relation/report/{reportedUserId} - 举报用户
 *
 * @author XiangYuPai
 * @updated 2025-11-26
 */

import { apiClient } from './client';

// ==================== 类型定义 ====================

/**
 * 关系状态
 */
export type RelationStatus = 'none' | 'following' | 'followed' | 'mutual';

/**
 * 用户关系项
 */
export interface UserRelationItem {
  userId: string;
  nickname: string;
  avatar: string;
  gender?: 'male' | 'female';
  age?: number;
  bio?: string;
  relationStatus: RelationStatus;
  isOnline?: boolean;
  lastActiveAt?: number;
}

/**
 * 关注/取关响应
 */
export interface FollowResponse {
  success: boolean;
  relationStatus: RelationStatus;
  followerCount?: number;
  followingCount?: number;
}

/**
 * 分页参数
 */
export interface PageQuery {
  pageNum?: number;
  pageSize?: number;
}

/**
 * 分页响应
 */
export interface PageResponse<T> {
  rows: T[];
  total: number;
}

/**
 * 举报参数
 */
export interface ReportParams {
  reason: string;
  description?: string;
  evidenceUrls?: string[];
}

// ==================== API配置 ====================

/**
 * 是否使用Mock数据
 */
const USE_MOCK_DATA = false;

// ==================== API实现 ====================

/**
 * Relation API 类
 */
export class RelationAPI {
  /**
   * 关注用户
   *
   * @param targetUserId - 目标用户ID
   */
  async followUser(targetUserId: string | number): Promise<FollowResponse> {
    console.log('\n📱 [RelationAPI] ========== 关注用户 ==========');
    console.log('📱 目标用户ID:', targetUserId);

    if (USE_MOCK_DATA) {
      console.log('📱 [RelationAPI] 使用Mock数据');
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        success: true,
        relationStatus: 'following',
        followerCount: 100,
        followingCount: 50,
      };
    }

    try {
      const url = `/xypai-user/api/user/relation/follow/${targetUserId}`;
      const response = await apiClient.post<FollowResponse>(url);

      console.log('📱 [RelationAPI] 关注成功');
      console.log('📱 关系状态:', response.data?.relationStatus);
      console.log('📱 ==============================================\n');

      return response.data || { success: false, relationStatus: 'none' };
    } catch (error: any) {
      console.error('\n❌ [RelationAPI] 关注用户失败');
      console.error('❌ 错误:', error.message);
      console.error('❌ ==============================================\n');
      return { success: false, relationStatus: 'none' };
    }
  }

  /**
   * 取消关注用户
   *
   * @param targetUserId - 目标用户ID
   */
  async unfollowUser(targetUserId: string | number): Promise<FollowResponse> {
    console.log('\n📱 [RelationAPI] ========== 取消关注 ==========');
    console.log('📱 目标用户ID:', targetUserId);

    if (USE_MOCK_DATA) {
      console.log('📱 [RelationAPI] 使用Mock数据');
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        success: true,
        relationStatus: 'none',
        followerCount: 100,
        followingCount: 49,
      };
    }

    try {
      const url = `/xypai-user/api/user/relation/follow/${targetUserId}`;
      const response = await apiClient.delete<FollowResponse>(url);

      console.log('📱 [RelationAPI] 取消关注成功');
      console.log('📱 关系状态:', response.data?.relationStatus);
      console.log('📱 ==============================================\n');

      return response.data || { success: false, relationStatus: 'none' };
    } catch (error: any) {
      console.error('\n❌ [RelationAPI] 取消关注失败');
      console.error('❌ 错误:', error.message);
      console.error('❌ ==============================================\n');
      return { success: false, relationStatus: 'following' };
    }
  }

  /**
   * 关注/取消关注（统一方法）
   *
   * @param targetUserId - 目标用户ID
   * @param action - 操作: follow / unfollow
   */
  async toggleFollow(targetUserId: string | number, action: 'follow' | 'unfollow'): Promise<FollowResponse> {
    if (action === 'follow') {
      return this.followUser(targetUserId);
    } else {
      return this.unfollowUser(targetUserId);
    }
  }

  /**
   * 获取关注列表
   *
   * @param params - 分页参数
   * @param keyword - 搜索关键词
   */
  async getFollowingList(params: PageQuery = {}, keyword?: string): Promise<PageResponse<UserRelationItem>> {
    const { pageNum = 1, pageSize = 20 } = params;

    console.log('\n📱 [RelationAPI] ========== 获取关注列表 ==========');
    console.log('📱 分页:', { pageNum, pageSize });
    console.log('📱 关键词:', keyword || '无');

    if (USE_MOCK_DATA) {
      console.log('📱 [RelationAPI] 使用Mock数据');
      await new Promise(resolve => setTimeout(resolve, 300));
      return this.generateMockRelationList(pageNum, pageSize, 'following');
    }

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('pageNum', String(pageNum));
      queryParams.append('pageSize', String(pageSize));
      if (keyword) queryParams.append('keyword', keyword);

      const url = `/xypai-user/api/user/relation/following?${queryParams.toString()}`;
      const response = await apiClient.get<PageResponse<UserRelationItem>>(url);

      console.log('📱 [RelationAPI] 获取关注列表成功');
      console.log('📱 数量:', response.data?.rows?.length || 0);
      console.log('📱 总数:', response.data?.total || 0);
      console.log('📱 ==============================================\n');

      return response.data || { rows: [], total: 0 };
    } catch (error: any) {
      console.error('\n❌ [RelationAPI] 获取关注列表失败');
      console.error('❌ 错误:', error.message);
      console.error('❌ ==============================================\n');
      return { rows: [], total: 0 };
    }
  }

  /**
   * 获取粉丝列表
   *
   * @param params - 分页参数
   * @param keyword - 搜索关键词
   */
  async getFansList(params: PageQuery = {}, keyword?: string): Promise<PageResponse<UserRelationItem>> {
    const { pageNum = 1, pageSize = 20 } = params;

    console.log('\n📱 [RelationAPI] ========== 获取粉丝列表 ==========');
    console.log('📱 分页:', { pageNum, pageSize });
    console.log('📱 关键词:', keyword || '无');

    if (USE_MOCK_DATA) {
      console.log('📱 [RelationAPI] 使用Mock数据');
      await new Promise(resolve => setTimeout(resolve, 300));
      return this.generateMockRelationList(pageNum, pageSize, 'followed');
    }

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('pageNum', String(pageNum));
      queryParams.append('pageSize', String(pageSize));
      if (keyword) queryParams.append('keyword', keyword);

      const url = `/xypai-user/api/user/relation/fans?${queryParams.toString()}`;
      const response = await apiClient.get<PageResponse<UserRelationItem>>(url);

      console.log('📱 [RelationAPI] 获取粉丝列表成功');
      console.log('📱 数量:', response.data?.rows?.length || 0);
      console.log('📱 总数:', response.data?.total || 0);
      console.log('📱 ==============================================\n');

      return response.data || { rows: [], total: 0 };
    } catch (error: any) {
      console.error('\n❌ [RelationAPI] 获取粉丝列表失败');
      console.error('❌ 错误:', error.message);
      console.error('❌ ==============================================\n');
      return { rows: [], total: 0 };
    }
  }

  /**
   * 拉黑用户
   *
   * @param targetUserId - 目标用户ID
   */
  async blockUser(targetUserId: string | number): Promise<{ success: boolean }> {
    console.log('\n📱 [RelationAPI] ========== 拉黑用户 ==========');
    console.log('📱 目标用户ID:', targetUserId);

    if (USE_MOCK_DATA) {
      console.log('📱 [RelationAPI] 使用Mock数据');
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true };
    }

    try {
      const url = `/xypai-user/api/user/relation/block/${targetUserId}`;
      await apiClient.post(url);

      console.log('📱 [RelationAPI] 拉黑成功');
      console.log('📱 ==============================================\n');

      return { success: true };
    } catch (error: any) {
      console.error('\n❌ [RelationAPI] 拉黑用户失败');
      console.error('❌ 错误:', error.message);
      console.error('❌ ==============================================\n');
      return { success: false };
    }
  }

  /**
   * 取消拉黑用户
   *
   * @param targetUserId - 目标用户ID
   */
  async unblockUser(targetUserId: string | number): Promise<{ success: boolean }> {
    console.log('\n📱 [RelationAPI] ========== 取消拉黑 ==========');
    console.log('📱 目标用户ID:', targetUserId);

    if (USE_MOCK_DATA) {
      console.log('📱 [RelationAPI] 使用Mock数据');
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true };
    }

    try {
      const url = `/xypai-user/api/user/relation/block/${targetUserId}`;
      await apiClient.delete(url);

      console.log('📱 [RelationAPI] 取消拉黑成功');
      console.log('📱 ==============================================\n');

      return { success: true };
    } catch (error: any) {
      console.error('\n❌ [RelationAPI] 取消拉黑失败');
      console.error('❌ 错误:', error.message);
      console.error('❌ ==============================================\n');
      return { success: false };
    }
  }

  /**
   * 举报用户
   *
   * @param targetUserId - 目标用户ID
   * @param params - 举报参数
   */
  async reportUser(targetUserId: string | number, params: ReportParams): Promise<{ success: boolean }> {
    console.log('\n📱 [RelationAPI] ========== 举报用户 ==========');
    console.log('📱 目标用户ID:', targetUserId);
    console.log('📱 举报原因:', params.reason);

    if (USE_MOCK_DATA) {
      console.log('📱 [RelationAPI] 使用Mock数据');
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    }

    try {
      const url = `/xypai-user/api/user/relation/report/${targetUserId}`;
      await apiClient.post(url, params);

      console.log('📱 [RelationAPI] 举报成功');
      console.log('📱 ==============================================\n');

      return { success: true };
    } catch (error: any) {
      console.error('\n❌ [RelationAPI] 举报用户失败');
      console.error('❌ 错误:', error.message);
      console.error('❌ ==============================================\n');
      return { success: false };
    }
  }

  // ==================== Mock数据生成 ====================

  /**
   * 生成Mock关系列表
   */
  private generateMockRelationList(pageNum: number, pageSize: number, defaultStatus: RelationStatus): PageResponse<UserRelationItem> {
    const startIndex = (pageNum - 1) * pageSize;
    const rows: UserRelationItem[] = Array.from({ length: pageSize }, (_, i) => {
      const index = startIndex + i;
      return {
        userId: `user_${index}`,
        nickname: `用户${100 + index}`,
        avatar: `https://picsum.photos/100/100?random=relation${index}`,
        gender: index % 2 === 0 ? 'female' : 'male',
        age: 18 + (index % 10),
        bio: '这是一段简介~',
        relationStatus: defaultStatus,
        isOnline: index % 3 === 0,
        lastActiveAt: Date.now() - Math.floor(Math.random() * 86400000),
      };
    });

    return {
      rows,
      total: 100,
    };
  }
}

// 导出单例实例
export const relationApi = new RelationAPI();

// 默认导出
export default relationApi;
