/**
 * Search API Service - 搜索功能API服务
 * 基于接口文档: 首页搜索功能接口文档.md
 * 
 * 提供以下接口:
 * 1. 打开搜索页面 - GET /api/search/init
 * 2. 获取搜索建议 - GET /api/search/suggest
 * 3. 执行搜索 - POST /api/search/search
 * 4. 搜索结果-全部 - GET /api/search/all
 * 5. 搜索结果-用户 - GET /api/search/users
 * 6. 搜索结果-下单 - GET /api/search/orders
 * 7. 搜索结果-话题 - GET /api/search/topics
 * 8. 删除搜索历史 - DELETE /api/search/history
 * 9. 关注/取消关注 - POST /api/user/follow
 */

import { apiClient } from '../../../../../services/api/client';
import type {
  DeleteSearchHistoryRequest,
  DeleteSearchHistoryResponse,
  ExecuteSearchRequest,
  ExecuteSearchResponse,
  FollowUserRequest,
  FollowUserResponse,
  GetSearchAllRequest,
  GetSearchAllResponse,
  GetSearchInitResponse,
  GetSearchOrdersRequest,
  GetSearchOrdersResponse,
  GetSearchSuggestRequest,
  GetSearchSuggestResponse,
  GetSearchTopicsRequest,
  GetSearchTopicsResponse,
  GetSearchUsersRequest,
  GetSearchUsersResponse,
} from './types';

// Mock数据
import {
  mockSearchInitData,
  generateMockSuggestions,
  mockExecuteSearchData,
  mockSearchAllData,
  generatePaginatedUsers,
  generatePaginatedOrders,
  generatePaginatedTopics,
  mockDeleteHistoryResponse,
  mockFollowUserResponse,
  mockUnfollowUserResponse,
} from './mockData';

/**
 * API端点配置
 */
const API_ENDPOINTS = {
  INIT: '/api/search/init',
  SUGGEST: '/api/search/suggest',
  SEARCH: '/api/search/search',
  ALL: '/api/search/all',
  USERS: '/api/search/users',
  ORDERS: '/api/search/orders',
  TOPICS: '/api/search/topics',
  HISTORY: '/api/search/history',
  FOLLOW: '/api/user/follow',
};

/**
 * 🧪 测试模式开关
 * true: 使用Mock数据（用于前端开发测试）
 * false: 使用真实API（用于后端联调和生产环境）
 */
const USE_MOCK_DATA = true;  // 👈 修改这里来切换模式

/**
 * 模拟延迟函数（让mock数据更真实）
 */
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 搜索API服务类
 */
class SearchApiService {
  /**
   * 1. 打开搜索页面 - 获取初始数据
   * 
   * 用户操作: 点击搜索框
   * 
   * @returns 搜索历史和热门关键词
   */
  async getSearchInit(): Promise<GetSearchInitResponse['data']> {
    try {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔍 [Search API] 获取搜索初始数据');
      console.log(`   模式: ${USE_MOCK_DATA ? '🧪 Mock数据' : '🌐 真实API'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // 🧪 使用Mock数据
      if (USE_MOCK_DATA) {
        await mockDelay(300);
        console.log('   结果: ✅ 获取成功 (Mock)');
        console.log(`   历史记录数: ${mockSearchInitData.searchHistory.length}`);
        console.log(`   热门关键词数: ${mockSearchInitData.hotKeywords.length}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return mockSearchInitData;
      }

      // 🌐 使用真实API
      const response = await apiClient.get<GetSearchInitResponse['data']>(
        API_ENDPOINTS.INIT,
        {
          cache: false, // 每次都获取最新数据
        }
      );

      console.log('   结果: ✅ 获取成功');
      console.log(`   历史记录数: ${response.data.searchHistory.length}`);
      console.log(`   热门关键词数: ${response.data.hotKeywords.length}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return response.data;
    } catch (error: any) {
      console.error('❌ [Search API] 获取搜索初始数据失败:', error);
      throw {
        type: 'SEARCH_INIT_ERROR',
        message: error.message || '获取搜索数据失败',
        originalError: error,
      };
    }
  }

  /**
   * 2. 获取搜索建议
   * 
   * 用户操作: 输入搜索关键词
   * 
   * @param keyword 搜索关键词
   * @param limit 建议数量(默认10)
   * @returns 搜索建议列表
   */
  async getSearchSuggest(
    keyword: string,
    limit: number = 10
  ): Promise<GetSearchSuggestResponse['data']> {
    try {
      // 参数验证
      if (!keyword || keyword.length === 0) {
        throw new Error('搜索关键词不能为空');
      }
      if (keyword.length > 50) {
        throw new Error('搜索关键词不能超过50字');
      }

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('💡 [Search API] 获取搜索建议');
      console.log(`   模式: ${USE_MOCK_DATA ? '🧪 Mock数据' : '🌐 真实API'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   关键词: ${keyword}`);
      console.log(`   限制数量: ${limit}`);

      // 🧪 使用Mock数据
      if (USE_MOCK_DATA) {
        await mockDelay(200);
        const mockData = generateMockSuggestions(keyword);
        console.log('   结果: ✅ 获取成功 (Mock)');
        console.log(`   建议数量: ${mockData.suggestions.length}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return mockData;
      }

      // 🌐 使用真实API
      const response = await apiClient.get<GetSearchSuggestResponse['data']>(
        `${API_ENDPOINTS.SUGGEST}?keyword=${encodeURIComponent(keyword)}&limit=${limit}`,
        {
          cache: false,
        }
      );

      console.log('   结果: ✅ 获取成功');
      console.log(`   建议数量: ${response.data.suggestions.length}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return response.data;
    } catch (error: any) {
      console.error('❌ [Search API] 获取搜索建议失败:', error);
      throw {
        type: 'SEARCH_SUGGEST_ERROR',
        message: error.message || '获取搜索建议失败',
        originalError: error,
      };
    }
  }

  /**
   * 3. 执行搜索(综合搜索)
   * 
   * 用户操作: 点击搜索按钮或搜索建议
   * 
   * @param request 搜索请求参数
   * @returns 搜索结果
   */
  async executeSearch(
    request: ExecuteSearchRequest
  ): Promise<ExecuteSearchResponse['data']> {
    try {
      // 参数验证
      if (!request.keyword || request.keyword.trim().length === 0) {
        throw new Error('搜索关键词不能为空');
      }
      if (request.keyword.length > 50) {
        throw new Error('搜索关键词不能超过50字');
      }
      if (request.pageNum < 1) {
        throw new Error('页码必须大于等于1');
      }
      if (request.pageSize < 5 || request.pageSize > 30) {
        throw new Error('每页数量必须在5-30之间');
      }

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔎 [Search API] 执行搜索');
      console.log(`   模式: ${USE_MOCK_DATA ? '🧪 Mock数据' : '🌐 真实API'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   关键词: ${request.keyword}`);
      console.log(`   类型: ${request.type}`);
      console.log(`   页码: ${request.pageNum}`);
      console.log(`   每页数量: ${request.pageSize}`);
      if (request.filters) {
        console.log(`   筛选条件:`, request.filters);
      }

      // 🧪 使用Mock数据
      if (USE_MOCK_DATA) {
        await mockDelay(400);
        console.log('   结果: ✅ 搜索成功 (Mock)');
        console.log(`   总结果数: ${mockExecuteSearchData.total}`);
        console.log(`   是否有更多: ${mockExecuteSearchData.hasMore}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return mockExecuteSearchData;
      }

      // 🌐 使用真实API
      const response = await apiClient.post<ExecuteSearchResponse['data']>(
        API_ENDPOINTS.SEARCH,
        request
      );

      console.log('   结果: ✅ 搜索成功');
      console.log(`   总结果数: ${response.data.total}`);
      console.log(`   是否有更多: ${response.data.hasMore}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return response.data;
    } catch (error: any) {
      console.error('❌ [Search API] 执行搜索失败:', error);
      throw {
        type: 'SEARCH_EXECUTE_ERROR',
        message: error.message || '搜索失败',
        originalError: error,
      };
    }
  }

  /**
   * 4. 获取全部Tab搜索结果
   * 
   * @param request 搜索请求参数
   * @returns 混合内容搜索结果
   */
  async getSearchAll(
    request: GetSearchAllRequest
  ): Promise<GetSearchAllResponse['data']> {
    try {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 [Search API] 获取全部搜索结果');
      console.log(`   模式: ${USE_MOCK_DATA ? '🧪 Mock数据' : '🌐 真实API'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   关键词: ${request.keyword}`);
      console.log(`   页码: ${request.pageNum}`);

      // 🧪 使用Mock数据
      if (USE_MOCK_DATA) {
        await mockDelay(350);
        console.log('   结果: ✅ 获取成功 (Mock)');
        console.log(`   结果数量: ${mockSearchAllData.list.length}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return mockSearchAllData;
      }

      // 🌐 使用真实API
      const response = await apiClient.get<GetSearchAllResponse['data']>(
        `${API_ENDPOINTS.ALL}?keyword=${encodeURIComponent(request.keyword)}&pageNum=${request.pageNum}&pageSize=${request.pageSize}`
      );

      console.log('   结果: ✅ 获取成功');
      console.log(`   结果数量: ${response.data.list.length}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return response.data;
    } catch (error: any) {
      console.error('❌ [Search API] 获取全部搜索结果失败:', error);
      throw {
        type: 'SEARCH_ALL_ERROR',
        message: error.message || '获取搜索结果失败',
        originalError: error,
      };
    }
  }

  /**
   * 5. 获取用户Tab搜索结果
   * 
   * @param request 搜索请求参数
   * @returns 用户搜索结果
   */
  async getSearchUsers(
    request: GetSearchUsersRequest
  ): Promise<GetSearchUsersResponse['data']> {
    try {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('👥 [Search API] 获取用户搜索结果');
      console.log(`   模式: ${USE_MOCK_DATA ? '🧪 Mock数据' : '🌐 真实API'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   关键词: ${request.keyword}`);
      console.log(`   页码: ${request.pageNum}`);

      // 🧪 使用Mock数据
      if (USE_MOCK_DATA) {
        await mockDelay(350);
        const mockData = generatePaginatedUsers(request.pageNum, request.pageSize);
        console.log('   结果: ✅ 获取成功 (Mock)');
        console.log(`   用户数量: ${mockData.list.length}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return mockData;
      }

      // 🌐 使用真实API
      let url = `${API_ENDPOINTS.USERS}?keyword=${encodeURIComponent(request.keyword)}&pageNum=${request.pageNum}&pageSize=${request.pageSize}`;
      if (request.gender) {
        url += `&gender=${request.gender}`;
      }

      const response = await apiClient.get<GetSearchUsersResponse['data']>(url);

      console.log('   结果: ✅ 获取成功');
      console.log(`   用户数量: ${response.data.list.length}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return response.data;
    } catch (error: any) {
      console.error('❌ [Search API] 获取用户搜索结果失败:', error);
      throw {
        type: 'SEARCH_USERS_ERROR',
        message: error.message || '获取用户搜索结果失败',
        originalError: error,
      };
    }
  }

  /**
   * 6. 获取下单Tab搜索结果
   * 
   * @param request 搜索请求参数
   * @returns 可下单用户搜索结果
   */
  async getSearchOrders(
    request: GetSearchOrdersRequest
  ): Promise<GetSearchOrdersResponse['data']> {
    try {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('💼 [Search API] 获取下单搜索结果');
      console.log(`   模式: ${USE_MOCK_DATA ? '🧪 Mock数据' : '🌐 真实API'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   关键词: ${request.keyword}`);
      console.log(`   页码: ${request.pageNum}`);

      // 🧪 使用Mock数据
      if (USE_MOCK_DATA) {
        await mockDelay(350);
        const mockData = generatePaginatedOrders(request.pageNum, request.pageSize);
        console.log('   结果: ✅ 获取成功 (Mock)');
        console.log(`   下单用户数量: ${mockData.list.length}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return mockData;
      }

      // 🌐 使用真实API
      let url = `${API_ENDPOINTS.ORDERS}?keyword=${encodeURIComponent(request.keyword)}&pageNum=${request.pageNum}&pageSize=${request.pageSize}`;
      
      if (request.filters) {
        if (request.filters.cityCode) url += `&cityCode=${request.filters.cityCode}`;
        if (request.filters.districtCode) url += `&districtCode=${request.filters.districtCode}`;
        if (request.filters.gender) url += `&gender=${request.filters.gender}`;
        if (request.filters.sortBy) url += `&sortBy=${request.filters.sortBy}`;
      }

      const response = await apiClient.get<GetSearchOrdersResponse['data']>(url);

      console.log('   结果: ✅ 获取成功');
      console.log(`   下单用户数量: ${response.data.list.length}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return response.data;
    } catch (error: any) {
      console.error('❌ [Search API] 获取下单搜索结果失败:', error);
      throw {
        type: 'SEARCH_ORDERS_ERROR',
        message: error.message || '获取下单搜索结果失败',
        originalError: error,
      };
    }
  }

  /**
   * 7. 获取话题Tab搜索结果
   * 
   * @param request 搜索请求参数
   * @returns 话题搜索结果
   */
  async getSearchTopics(
    request: GetSearchTopicsRequest
  ): Promise<GetSearchTopicsResponse['data']> {
    try {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🏷️ [Search API] 获取话题搜索结果');
      console.log(`   模式: ${USE_MOCK_DATA ? '🧪 Mock数据' : '🌐 真实API'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   关键词: ${request.keyword}`);
      console.log(`   页码: ${request.pageNum}`);

      // 🧪 使用Mock数据
      if (USE_MOCK_DATA) {
        await mockDelay(350);
        const mockData = generatePaginatedTopics(request.pageNum, request.pageSize);
        console.log('   结果: ✅ 获取成功 (Mock)');
        console.log(`   话题数量: ${mockData.list.length}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return mockData;
      }

      // 🌐 使用真实API
      let url = `${API_ENDPOINTS.TOPICS}?keyword=${encodeURIComponent(request.keyword)}&pageNum=${request.pageNum}&pageSize=${request.pageSize}`;
      if (request.sortBy) {
        url += `&sortBy=${request.sortBy}`;
      }

      const response = await apiClient.get<GetSearchTopicsResponse['data']>(url);

      console.log('   结果: ✅ 获取成功');
      console.log(`   话题数量: ${response.data.list.length}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return response.data;
    } catch (error: any) {
      console.error('❌ [Search API] 获取话题搜索结果失败:', error);
      throw {
        type: 'SEARCH_TOPICS_ERROR',
        message: error.message || '获取话题搜索结果失败',
        originalError: error,
      };
    }
  }

  /**
   * 8. 删除搜索历史
   * 
   * 用户操作: 长按历史记录或点击清空
   * 
   * @param request 删除请求参数
   * @returns 删除结果
   */
  async deleteSearchHistory(
    request: DeleteSearchHistoryRequest
  ): Promise<DeleteSearchHistoryResponse['data']> {
    try {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🗑️ [Search API] 删除搜索历史');
      console.log(`   模式: ${USE_MOCK_DATA ? '🧪 Mock数据' : '🌐 真实API'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      if (request.clearAll) {
        console.log('   操作: 清空所有历史');
      } else {
        console.log(`   操作: 删除关键词 "${request.keyword}"`);
      }

      // 🧪 使用Mock数据
      if (USE_MOCK_DATA) {
        await mockDelay(200);
        console.log('   结果: ✅ 删除成功 (Mock)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return mockDeleteHistoryResponse;
      }

      // 🌐 使用真实API
      let url = API_ENDPOINTS.HISTORY;
      if (request.keyword) {
        url += `?keyword=${encodeURIComponent(request.keyword)}`;
      } else if (request.clearAll) {
        url += `?clearAll=true`;
      }
      
      const response = await apiClient.delete<DeleteSearchHistoryResponse['data']>(url);

      console.log('   结果: ✅ 删除成功');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return response.data;
    } catch (error: any) {
      console.error('❌ [Search API] 删除搜索历史失败:', error);
      throw {
        type: 'DELETE_HISTORY_ERROR',
        message: error.message || '删除搜索历史失败',
        originalError: error,
      };
    }
  }

  /**
   * 9. 关注/取消关注用户
   * 
   * 用户操作: 点击关注按钮
   * 
   * @param request 关注请求参数
   * @returns 关注结果
   */
  async followUser(
    request: FollowUserRequest
  ): Promise<FollowUserResponse['data']> {
    try {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('👤 [Search API] 关注/取消关注用户');
      console.log(`   模式: ${USE_MOCK_DATA ? '🧪 Mock数据' : '🌐 真实API'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   目标用户ID: ${request.targetUserId}`);
      console.log(`   操作: ${request.action === 'follow' ? '关注' : '取消关注'}`);

      // 🧪 使用Mock数据
      if (USE_MOCK_DATA) {
        await mockDelay(300);
        const mockData = request.action === 'follow' ? mockFollowUserResponse : mockUnfollowUserResponse;
        console.log('   结果: ✅ 操作成功 (Mock)');
        console.log(`   关系状态: ${mockData.relationStatus}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return mockData;
      }

      // 🌐 使用真实API
      const response = await apiClient.post<FollowUserResponse['data']>(
        API_ENDPOINTS.FOLLOW,
        request
      );

      console.log('   结果: ✅ 操作成功');
      console.log(`   关系状态: ${response.data.relationStatus}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return response.data;
    } catch (error: any) {
      console.error('❌ [Search API] 关注/取消关注失败:', error);
      throw {
        type: 'FOLLOW_USER_ERROR',
        message: error.message || '操作失败',
        originalError: error,
      };
    }
  }
}

// 导出单例实例
export const searchApiService = new SearchApiService();
