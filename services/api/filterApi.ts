/**
 * Filter API 服务 - 首页筛选相关接口
 *
 * 基于后端实际实现（参考 Page02_FilterTest.java）：
 * - HomeFilterController: /api/home/filter/*
 *
 * 接口清单（Gateway路径）：
 * - ✅ GET /xypai-app-bff/api/home/filter/config?type={online|offline} - 获取筛选配置
 * - ✅ POST /xypai-app-bff/api/home/filter/apply - 应用筛选条件
 *
 * @author XiangYuPai
 * @updated 2025-11-26
 */

import { apiClient } from './client';

// ==================== 类型定义 ====================

/**
 * 筛选类型
 */
export type FilterType = 'online' | 'offline';

/**
 * 年龄范围配置
 */
export interface AgeRangeConfig {
  min: number;
  max: number | null;
  defaultMin: number;
  defaultMax: number | null;
}

/**
 * 性别选项
 */
export interface GenderOption {
  value: 'all' | 'male' | 'female';
  label: string;
}

/**
 * 状态选项
 */
export interface StatusOption {
  value: 'online' | 'active_3d' | 'active_7d' | 'all';
  label: string;
}

/**
 * 技能选项
 */
export interface SkillOption {
  id: string;
  name: string;
  icon?: string;
  category?: string;
}

/**
 * 价格选项（仅线上模式）
 */
export interface PriceOption {
  value: string;
  label: string;
  min?: number;
  max?: number;
}

/**
 * 位置/分路选项（仅线上模式）
 */
export interface PositionOption {
  value: string;
  label: string;
  icon?: string;
}

/**
 * 标签选项
 */
export interface TagOption {
  id: string;
  name: string;
  icon?: string;
}

/**
 * 筛选配置响应
 */
export interface FilterConfig {
  type: FilterType;
  ageRange: AgeRangeConfig;
  genderOptions: GenderOption[];
  statusOptions: StatusOption[];
  skillOptions: SkillOption[];
  priceOptions?: PriceOption[];      // 仅线上模式
  positionOptions?: PositionOption[]; // 仅线上模式
  tagOptions: TagOption[];
}

/**
 * 筛选条件
 */
export interface FilterConditions {
  age?: {
    min?: number;
    max?: number;
  };
  gender?: 'all' | 'male' | 'female';
  status?: 'online' | 'active_3d' | 'active_7d' | 'all';
  skills?: string[];
  price?: string;
  position?: string;
  tags?: string[];
}

/**
 * 筛选请求参数
 */
export interface FilterApplyParams {
  type: FilterType;
  filters: FilterConditions;
  pageNum: number;
  pageSize: number;
}

/**
 * 用户卡片信息
 */
export interface UserCardInfo {
  id: string;
  nickname: string;
  avatar: string;
  gender: 'male' | 'female';
  age: number;
  bio?: string;
  status: 'online' | 'offline' | 'busy';
  skills: string[];
  tags: string[];
  isVerified: boolean;
  isVip: boolean;
  distance?: number;
  price?: number;
  rating?: number;
  orderCount?: number;
}

/**
 * 筛选结果响应
 */
export interface FilterApplyResponse {
  list: UserCardInfo[];
  total: number;
  hasMore: boolean;
  appliedFilters?: {
    count: number;
    summary: string;
  };
}

// ==================== API配置 ====================

/**
 * 是否使用Mock数据
 */
const USE_MOCK_DATA = false;

// ==================== API实现 ====================

/**
 * Filter API 类
 */
export class FilterAPI {
  /**
   * 获取筛选配置
   *
   * @param type - 筛选类型: online / offline
   */
  async getFilterConfig(type: FilterType): Promise<FilterConfig | null> {
    console.log('\n📱 [FilterAPI] ========== 获取筛选配置 ==========');
    console.log('📱 筛选类型:', type);

    if (USE_MOCK_DATA) {
      console.log('📱 [FilterAPI] 使用Mock数据');
      await new Promise(resolve => setTimeout(resolve, 300));
      return this.generateMockFilterConfig(type);
    }

    try {
      const url = `/xypai-app-bff/api/home/filter/config?type=${type}`;
      const response = await apiClient.get<FilterConfig>(url);

      console.log('📱 [FilterAPI] 获取筛选配置成功');
      console.log('📱 配置类型:', response.data?.type);
      console.log('📱 ==============================================\n');

      return response.data || null;
    } catch (error: any) {
      console.error('\n❌ [FilterAPI] 获取筛选配置失败');
      console.error('❌ 错误:', error.message);
      console.error('❌ ==============================================\n');
      return null;
    }
  }

  /**
   * 应用筛选条件
   *
   * @param params - 筛选参数
   */
  async applyFilter(params: FilterApplyParams): Promise<FilterApplyResponse> {
    console.log('\n📱 [FilterAPI] ========== 应用筛选条件 ==========');
    console.log('📱 筛选类型:', params.type);
    console.log('📱 筛选条件:', params.filters);
    console.log('📱 分页:', { pageNum: params.pageNum, pageSize: params.pageSize });

    if (USE_MOCK_DATA) {
      console.log('📱 [FilterAPI] 使用Mock数据');
      await new Promise(resolve => setTimeout(resolve, 500));
      return this.generateMockFilterResult(params);
    }

    try {
      const url = '/xypai-app-bff/api/home/filter/apply';
      const response = await apiClient.post<FilterApplyResponse>(url, params);

      console.log('📱 [FilterAPI] 筛选成功');
      console.log('📱 结果数量:', response.data?.list?.length || 0);
      console.log('📱 总数:', response.data?.total || 0);
      console.log('📱 ==============================================\n');

      return response.data || { list: [], total: 0, hasMore: false };
    } catch (error: any) {
      console.error('\n❌ [FilterAPI] 应用筛选失败');
      console.error('❌ 错误:', error.message);
      console.error('❌ ==============================================\n');
      return { list: [], total: 0, hasMore: false };
    }
  }

  // ==================== Mock数据生成 ====================

  /**
   * 生成Mock筛选配置
   */
  private generateMockFilterConfig(type: FilterType): FilterConfig {
    const baseConfig: FilterConfig = {
      type,
      ageRange: {
        min: 18,
        max: null,
        defaultMin: 18,
        defaultMax: null,
      },
      genderOptions: [
        { value: 'all', label: '不限' },
        { value: 'male', label: '男' },
        { value: 'female', label: '女' },
      ],
      statusOptions: [
        { value: 'all', label: '全部' },
        { value: 'online', label: '在线' },
        { value: 'active_3d', label: '3天内活跃' },
        { value: 'active_7d', label: '7天内活跃' },
      ],
      skillOptions: [
        { id: '1', name: '最强王者', category: '王者荣耀' },
        { id: '2', name: '荣耀王者', category: '王者荣耀' },
        { id: '3', name: '星耀段位', category: '王者荣耀' },
        { id: '4', name: '钻石段位', category: '王者荣耀' },
      ],
      tagOptions: [
        { id: '1', name: '大神认证' },
        { id: '2', name: '真人认证' },
        { id: '3', name: '颜值担当' },
        { id: '4', name: '声音好听' },
      ],
    };

    // 线上模式额外配置
    if (type === 'online') {
      baseConfig.priceOptions = [
        { value: 'all', label: '不限' },
        { value: '0-10', label: '10元以下', min: 0, max: 10 },
        { value: '10-30', label: '10-30元', min: 10, max: 30 },
        { value: '30-50', label: '30-50元', min: 30, max: 50 },
        { value: '50+', label: '50元以上', min: 50 },
      ];
      baseConfig.positionOptions = [
        { value: 'all', label: '不限' },
        { value: 'jungle', label: '打野' },
        { value: 'top', label: '上路' },
        { value: 'mid', label: '中路' },
        { value: 'adc', label: '射手' },
        { value: 'support', label: '辅助' },
      ];
    }

    return baseConfig;
  }

  /**
   * 生成Mock筛选结果
   */
  private generateMockFilterResult(params: FilterApplyParams): FilterApplyResponse {
    const { pageNum, pageSize } = params;
    const startIndex = (pageNum - 1) * pageSize;

    const list: UserCardInfo[] = Array.from({ length: pageSize }, (_, i) => {
      const index = startIndex + i;
      const gender = params.filters.gender === 'male' ? 'male' :
                     params.filters.gender === 'female' ? 'female' :
                     (index % 2 === 0 ? 'female' : 'male');

      return {
        id: `user_${index}`,
        nickname: `用户${100 + index}`,
        avatar: `https://picsum.photos/200/200?random=filter${index}`,
        gender: gender as 'male' | 'female',
        age: (params.filters.age?.min || 18) + (index % 10),
        bio: '这是一段个人简介~',
        status: index % 3 === 0 ? 'online' : (index % 3 === 1 ? 'offline' : 'busy'),
        skills: ['最强王者', '荣耀王者'].slice(0, (index % 2) + 1),
        tags: ['大神认证', '真人认证'].slice(0, (index % 2) + 1),
        isVerified: index % 3 === 0,
        isVip: index % 5 === 0,
        distance: params.type === 'offline' ? Math.random() * 10 : undefined,
        price: params.type === 'online' ? 10 + (index % 50) : undefined,
        rating: 4.0 + Math.random(),
        orderCount: Math.floor(Math.random() * 1000),
      };
    });

    // 计算应用的筛选条件数量
    let filterCount = 0;
    const summaryParts: string[] = [];

    if (params.filters.age) {
      filterCount++;
      summaryParts.push(`${params.filters.age.min || 18}-${params.filters.age.max || '不限'}岁`);
    }
    if (params.filters.gender && params.filters.gender !== 'all') {
      filterCount++;
      summaryParts.push(params.filters.gender === 'male' ? '男' : '女');
    }
    if (params.filters.skills && params.filters.skills.length > 0) {
      filterCount++;
      summaryParts.push(`${params.filters.skills.length}个技能`);
    }
    if (params.filters.tags && params.filters.tags.length > 0) {
      filterCount++;
      summaryParts.push(`${params.filters.tags.length}个标签`);
    }

    return {
      list,
      total: 100,
      hasMore: pageNum * pageSize < 100,
      appliedFilters: {
        count: filterCount,
        summary: summaryParts.join('、') || '无筛选条件',
      },
    };
  }
}

// 导出单例实例
export const filterApi = new FilterAPI();

// 默认导出
export default filterApi;
