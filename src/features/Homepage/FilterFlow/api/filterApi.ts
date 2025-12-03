/**
 * Filter API Service - 筛选功能API服务
 * 基于接口文档: 首页筛选功能接口文档.md
 * 
 * 提供以下接口:
 * 1. 获取筛选配置 - GET /api/home/filter/config
 * 2. 应用筛选条件 - POST /api/home/filter/apply
 * 3. 获取筛选结果（分页）- GET /api/home/filter/results
 * 4. 清除筛选 - GET /api/home/feed
 */

import { apiClient } from '../../../../../services/api/client';
import type {
  ApplyFilterRequest,
  ApplyFilterResponse,
  ClearFilterRequest,
  GetFilterConfigRequest,
  GetFilterConfigResponse,
  GetFilterResultsRequest,
  GetFilterResultsResponse,
} from './types';

/**
 * API端点配置
 */
const API_ENDPOINTS = {
  GET_CONFIG: '/api/home/filter/config',
  APPLY_FILTER: '/api/home/filter/apply',
  GET_RESULTS: '/api/home/filter/results',
  CLEAR_FILTER: '/api/home/feed',
};

/**
 * 筛选API服务类
 */
class FilterApiService {
  /**
   * 1. 获取筛选配置
   * 
   * 用户操作: 打开筛选页面
   * 
   * @param type 筛选类型（online/offline）
   * @returns 筛选配置数据
   */
  async getFilterConfig(
    type: GetFilterConfigRequest['type']
  ): Promise<GetFilterConfigResponse['data']> {
    try {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 [Filter API] 获取筛选配置');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   类型: ${type}`);

      const response = await apiClient.get<GetFilterConfigResponse['data']>(
        `${API_ENDPOINTS.GET_CONFIG}?type=${type}`,
        {
          cache: true, // 缓存配置数据
          cacheTTL: 3600000, // 缓存1小时
        }
      );

      console.log('   结果: ✅ 获取成功');
      console.log(`   技能选项数: ${response.data.skillOptions.length}`);
      console.log(`   标签选项数: ${response.data.tagOptions.length}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return response.data;
    } catch (error: any) {
      console.error('❌ [Filter API] 获取筛选配置失败:', error);
      throw {
        type: 'FILTER_CONFIG_ERROR',
        message: error.message || '获取筛选配置失败',
        originalError: error,
      };
    }
  }

  /**
   * 2. 应用筛选条件
   * 
   * 用户操作: 点击"完成"按钮
   * 
   * @param request 筛选请求参数
   * @returns 筛选结果数据
   */
  async applyFilter(
    request: ApplyFilterRequest
  ): Promise<ApplyFilterResponse['data']> {
    try {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ [Filter API] 应用筛选条件');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   类型: ${request.type}`);
      console.log(`   筛选条件:`, request.filters);
      console.log(`   页码: ${request.pageNum}`);
      console.log(`   每页数量: ${request.pageSize}`);

      const response = await apiClient.post<ApplyFilterResponse['data']>(
        API_ENDPOINTS.APPLY_FILTER,
        request,
        {
          cache: false, // 不缓存筛选结果
        }
      );

      console.log('   结果: ✅ 应用成功');
      console.log(`   总数: ${response.data.total}`);
      console.log(`   当前数量: ${response.data.list.length}`);
      console.log(`   筛选条件数: ${response.data.appliedFilters.count}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return response.data;
    } catch (error: any) {
      console.error('❌ [Filter API] 应用筛选失败:', error);
      throw {
        type: 'APPLY_FILTER_ERROR',
        message: error.message || '应用筛选失败',
        originalError: error,
      };
    }
  }

  /**
   * 3. 获取筛选结果（分页加载）
   * 
   * 用户操作: 上拉加载更多
   * 
   * @param request 筛选请求参数
   * @returns 筛选结果数据
   */
  async getFilterResults(
    request: GetFilterResultsRequest
  ): Promise<GetFilterResultsResponse['data']> {
    try {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📄 [Filter API] 获取筛选结果（分页）');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   页码: ${request.pageNum}`);

      // 构建查询参数
      const queryParams = new URLSearchParams({
        type: request.type,
        pageNum: String(request.pageNum),
        pageSize: String(request.pageSize),
      });

      // 添加筛选条件到查询参数
      if (request.filters) {
        queryParams.append('filters', JSON.stringify(request.filters));
      }

      const response = await apiClient.get<GetFilterResultsResponse['data']>(
        `${API_ENDPOINTS.GET_RESULTS}?${queryParams.toString()}`,
        {
          cache: false,
        }
      );

      console.log('   结果: ✅ 获取成功');
      console.log(`   总数: ${response.data.total}`);
      console.log(`   当前页数量: ${response.data.list.length}`);
      console.log(`   是否有更多: ${response.data.hasMore}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return response.data;
    } catch (error: any) {
      console.error('❌ [Filter API] 获取筛选结果失败:', error);
      throw {
        type: 'GET_FILTER_RESULTS_ERROR',
        message: error.message || '获取筛选结果失败',
        originalError: error,
      };
    }
  }

  /**
   * 4. 清除筛选条件
   * 
   * 用户操作: 点击"清除筛选"按钮
   * 
   * @param request 请求参数
   * @returns Feed流数据
   */
  async clearFilter(request: ClearFilterRequest): Promise<any> {
    try {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🗑️ [Filter API] 清除筛选条件');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   页码: ${request.pageNum}`);
      console.log(`   每页数量: ${request.pageSize}`);
      if (request.type) {
        console.log(`   类型: ${request.type}`);
      }

      const queryParams = new URLSearchParams({
        pageNum: String(request.pageNum),
        pageSize: String(request.pageSize),
      });

      if (request.type) {
        queryParams.append('type', request.type);
      }

      const response = await apiClient.get<any>(
        `${API_ENDPOINTS.CLEAR_FILTER}?${queryParams.toString()}`,
        {
          cache: false,
        }
      );

      console.log('   结果: ✅ 清除成功');
      console.log(`   总数: ${response.data.total}`);
      console.log(`   当前数量: ${response.data.list.length}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return response.data;
    } catch (error: any) {
      console.error('❌ [Filter API] 清除筛选失败:', error);
      throw {
        type: 'CLEAR_FILTER_ERROR',
        message: error.message || '清除筛选失败',
        originalError: error,
      };
    }
  }
}

// 导出单例实例
export const filterApi = new FilterApiService();

// 导出类型
export type { FilterApiService };
