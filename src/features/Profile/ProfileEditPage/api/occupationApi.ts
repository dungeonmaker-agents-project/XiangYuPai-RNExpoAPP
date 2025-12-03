/**
 * Occupation API - 用户职业多选API接口
 *
 * 对应后端接口：
 * - GET  /api/user/profile/occupations       - 获取职业列表
 * - PUT  /api/user/profile/occupations       - 更新职业列表（批量）
 * - POST /api/user/profile/occupations/:name - 添加单个职业
 * - DELETE /api/user/profile/occupations/:name - 删除单个职业
 *
 * 对应UI文档: 个人主页-编辑_结构文档.md
 * - 支持多职业标签选择
 * - 最多5个职业
 *
 * @author XyPai Team
 * @since 2025-12-02
 */

import { apiClient } from '@/services/api/client';

// #region 类型定义

/**
 * 通用API响应格式
 */
interface ApiResponse<T = any> {
  code: number;
  message?: string;
  msg?: string;
  data: T | null;
}

/**
 * 更新职业列表请求
 */
interface UpdateOccupationsRequest {
  occupations: string[]; // 职业列表，最多5个
}

// #endregion

// #region API端点配置

const API_ENDPOINTS = {
  GET_OCCUPATIONS: '/xypai-user/api/user/profile/occupations',
  UPDATE_OCCUPATIONS: '/xypai-user/api/user/profile/occupations',
  ADD_OCCUPATION: '/xypai-user/api/user/profile/occupations',
  REMOVE_OCCUPATION: '/xypai-user/api/user/profile/occupations',
} as const;

// #endregion

// #region 错误处理

const formatError = (error: any): Error => {
  if (error.response?.data?.message) {
    return new Error(error.response.data.message);
  }
  if (error.response?.data?.msg) {
    return new Error(error.response.data.msg);
  }
  if (error.message) {
    return new Error(error.message);
  }
  return new Error('请求失败，请稍后重试');
};

// #endregion

// #region API实现

/**
 * 用户职业多选API类
 */
class OccupationAPI {
  /**
   * 获取用户职业列表
   */
  async getOccupations(): Promise<ApiResponse<string[]>> {
    try {
      const response = await apiClient.get<ApiResponse<string[]>>(
        API_ENDPOINTS.GET_OCCUPATIONS
      );
      return response;
    } catch (error) {
      throw formatError(error);
    }
  }

  /**
   * 更新用户职业列表（批量替换）
   * @param occupations 职业列表（最多5个）
   */
  async updateOccupations(occupations: string[]): Promise<ApiResponse<void>> {
    // 验证职业数量
    if (!occupations || occupations.length === 0) {
      throw new Error('请至少选择一个职业');
    }
    if (occupations.length > 5) {
      throw new Error('最多选择5个职业');
    }

    // 验证每个职业名称
    for (const occupation of occupations) {
      if (!occupation || occupation.trim().length === 0) {
        throw new Error('职业名称不能为空');
      }
      if (occupation.length > 30) {
        throw new Error('职业名称不能超过30字符');
      }
    }

    try {
      const request: UpdateOccupationsRequest = { occupations };
      const response = await apiClient.put<ApiResponse<void>>(
        API_ENDPOINTS.UPDATE_OCCUPATIONS,
        request
      );
      return response;
    } catch (error) {
      throw formatError(error);
    }
  }

  /**
   * 添加单个职业
   * @param occupationName 职业名称
   */
  async addOccupation(occupationName: string): Promise<ApiResponse<void>> {
    if (!occupationName || occupationName.trim().length === 0) {
      throw new Error('职业名称不能为空');
    }
    if (occupationName.length > 30) {
      throw new Error('职业名称不能超过30字符');
    }

    try {
      const response = await apiClient.post<ApiResponse<void>>(
        `${API_ENDPOINTS.ADD_OCCUPATION}/${encodeURIComponent(occupationName.trim())}`
      );
      return response;
    } catch (error) {
      throw formatError(error);
    }
  }

  /**
   * 删除单个职业
   * @param occupationName 职业名称
   */
  async removeOccupation(occupationName: string): Promise<ApiResponse<void>> {
    if (!occupationName || occupationName.trim().length === 0) {
      throw new Error('职业名称不能为空');
    }

    try {
      const response = await apiClient.delete<ApiResponse<void>>(
        `${API_ENDPOINTS.REMOVE_OCCUPATION}/${encodeURIComponent(occupationName.trim())}`
      );
      return response;
    } catch (error) {
      throw formatError(error);
    }
  }
}

// #endregion

// #region 导出

/**
 * 用户职业API实例
 */
export const occupationApi = new OccupationAPI();

/**
 * 最大职业数量
 */
export const MAX_OCCUPATION_COUNT = 5;

// #endregion
