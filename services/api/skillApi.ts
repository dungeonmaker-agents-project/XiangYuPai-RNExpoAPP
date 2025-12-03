/**
 * Skill API - 技能管理相关接口
 *
 * 对接后端：xypai-user模块
 * - 技能创建（线上/线下）
 * - 技能查询（我的/用户/附近）
 * - 技能管理（更新/删除/上下架）
 *
 * 测试文件参考:
 * - AppSkillManagementPageTest.java
 *
 * @author XiangYuPai
 * @created 2025-11-28
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// ==================== 类型定义 ====================

/**
 * 技能类型
 */
export type SkillType = 'online' | 'offline';

/**
 * 价格单位
 */
export type PriceUnit = '局' | '小时' | '次' | '天';

/**
 * 技能配置项（UI文档: SkillCard）
 */
export interface SkillConfigItem {
  id: string;
  name: string;
  icon: string;
  type: SkillType;
  category?: string;
}

/**
 * 段位选项配置（UI文档: RankPickerModal）
 */
export interface RankOptions {
  servers: string[];  // ['QQ区', '微信区']
  ranksBySkill: Record<string, string[]>;  // { 'wzry': ['永恒钻石', '至尊星耀', ...] }
}

/**
 * 时间选项配置（UI文档: TimePickerModal）
 */
export interface TimeOptions {
  startHour: number;
  endHour: number;
  intervalMinutes: number;
}

/**
 * 技能配置响应（添加技能页面使用）
 */
export interface SkillConfigResponse {
  skills: SkillConfigItem[];
  rankOptions: RankOptions;
  timeOptions: TimeOptions;
  // 兼容旧版字段
  games?: any[];
  serviceTypes?: any[];
}

/**
 * 可用时间段
 */
export interface AvailableTime {
  dayOfWeek: number;  // 1-7，周一到周日
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
}

/**
 * 位置信息
 */
export interface SkillLocation {
  address: string;
  latitude: number;
  longitude: number;
}

/**
 * 创建线上技能参数
 */
export interface CreateOnlineSkillParams {
  skillConfigId?: string;  // 技能配置ID
  gameId?: string;
  gameName: string;
  server?: string;         // 服务区: QQ区, 微信区
  gameRank: string;
  skillName: string;
  description: string;
  price: number;
  serviceHours: number;
  coverImage?: string;
  images?: string[];
  promises?: string[];
  isOnline?: boolean;
}

/**
 * 创建线下技能参数
 */
export interface CreateOfflineSkillParams {
  skillConfigId?: string;  // 技能配置ID
  serviceType: string;
  serviceTypeName: string;
  skillName: string;
  description: string;
  price: number;
  priceUnit: PriceUnit;
  activityTime?: string;   // 活动时间 (ISO string)
  coverImage?: string;
  images?: string[];
  location: SkillLocation;
  availableTimes: AvailableTime[];
  promises?: string[];
  isOnline?: boolean;
}

/**
 * 技能列表项
 */
export interface SkillListItem {
  skillId: number;
  skillName: string;
  skillType: SkillType;
  coverImage: string;
  price: number;
  priceUnit: PriceUnit;
  isOnline: boolean;
  rating: number;
  reviewCount: number;
  orderCount: number;
  // 线上技能字段
  gameName?: string;
  gameRank?: string;
  // 线下技能字段
  serviceType?: string;
  serviceLocation?: string;
  distance?: number;
  // 用户信息（附近技能返回）
  userInfo?: {
    userId: number;
    nickname: string;
    avatar: string;
    isOnline: boolean;
  };
  // 时间
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 技能详情
 */
export interface SkillDetail extends SkillListItem {
  userId: number;
  description: string;
  serviceHours?: number;
  images: string[];
  promises: string[];
  location?: SkillLocation;
  availableTimes?: AvailableTime[];
  userInfo: {
    userId: number;
    nickname: string;
    avatar: string;
    isOnline: boolean;
    isVerified?: boolean;
  };
  reviews?: {
    summary: {
      averageRating: number;
      totalCount: number;
      ratingDistribution: Record<string, number>;
    };
    recentReviews: Array<{
      reviewId: number;
      userId: number;
      nickname: string;
      avatar: string;
      rating: number;
      content: string;
      createdAt: string;
    }>;
  };
  createdAt: string;
}

/**
 * 技能列表响应 (TableDataInfo格式)
 */
export interface SkillListResponse {
  total: number;
  rows: SkillListItem[];
  code: number;
  msg: string;
}

/**
 * 附近技能查询参数
 */
export interface NearbySkillParams {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  serviceType?: string;
  pageNum?: number;
  pageSize?: number;
}

/**
 * 技能列表查询参数
 */
export interface SkillListParams {
  pageNum?: number;
  pageSize?: number;
  skillType?: SkillType;
}

// ==================== API 实现 ====================

/**
 * Skill API 类
 */
class SkillAPI {
  /**
   * 获取技能配置（添加技能页面使用）
   * GET /api/skills/config
   *
   * 返回：技能列表、段位选项、时间选项
   */
  async getSkillConfig(): Promise<SkillConfigResponse> {
    console.log('\n📱 [SkillAPI] ========== 获取技能配置 ==========');

    const response = await apiClient.get<SkillConfigResponse>(
      API_ENDPOINTS.SKILL.CONFIG
    );

    console.log('📱 [SkillAPI] 获取成功 - 技能数量:', response.data?.skills?.length || 0);
    return response.data || {
      skills: [],
      rankOptions: { servers: [], ranksBySkill: {} },
      timeOptions: { startHour: 0, endHour: 23, intervalMinutes: 30 },
    };
  }

  /**
   * 创建线上技能
   * POST /api/user/skills/online
   */
  async createOnlineSkill(params: CreateOnlineSkillParams): Promise<{ skillId: number }> {
    console.log('\n📱 [SkillAPI] ========== 创建线上技能 ==========');
    console.log('📱 技能名称:', params.skillName);
    console.log('📱 游戏:', params.gameName);

    const response = await apiClient.post<number>(
      API_ENDPOINTS.SKILL.CREATE_ONLINE,
      params
    );

    // 后端直接返回 skillId 数字
    const skillId = typeof response.data === 'number' ? response.data : response.data;
    console.log('📱 [SkillAPI] 创建成功 - skillId:', skillId);
    return { skillId };
  }

  /**
   * 创建线下技能
   * POST /api/user/skills/offline
   */
  async createOfflineSkill(params: CreateOfflineSkillParams): Promise<{ skillId: number }> {
    console.log('\n📱 [SkillAPI] ========== 创建线下技能 ==========');
    console.log('📱 技能名称:', params.skillName);
    console.log('📱 服务类型:', params.serviceTypeName);

    const response = await apiClient.post<number>(
      API_ENDPOINTS.SKILL.CREATE_OFFLINE,
      params
    );

    const skillId = typeof response.data === 'number' ? response.data : response.data;
    console.log('📱 [SkillAPI] 创建成功 - skillId:', skillId);
    return { skillId };
  }

  /**
   * 获取我的技能列表
   * GET /api/user/skills/my
   */
  async getMySkills(params: SkillListParams = {}): Promise<SkillListResponse> {
    const { pageNum = 1, pageSize = 10, skillType } = params;

    console.log('\n📱 [SkillAPI] ========== 获取我的技能列表 ==========');
    console.log('📱 分页:', { pageNum, pageSize });
    console.log('📱 技能类型:', skillType || '全部');

    const queryParams = new URLSearchParams();
    queryParams.append('pageNum', String(pageNum));
    queryParams.append('pageSize', String(pageSize));
    if (skillType) queryParams.append('skillType', skillType);

    const response = await apiClient.get<SkillListResponse>(
      `${API_ENDPOINTS.SKILL.MY_LIST}?${queryParams.toString()}`
    );

    console.log('📱 [SkillAPI] 获取成功 - 数量:', response.data?.rows?.length || 0);
    return response.data || { total: 0, rows: [], code: 200, msg: '' };
  }

  /**
   * 获取技能详情
   * GET /api/user/skills/{skillId}
   */
  async getSkillDetail(skillId: number): Promise<SkillDetail | null> {
    console.log('\n📱 [SkillAPI] ========== 获取技能详情 ==========');
    console.log('📱 技能ID:', skillId);

    const response = await apiClient.get<SkillDetail>(
      `${API_ENDPOINTS.SKILL.DETAIL}/${skillId}`
    );

    console.log('📱 [SkillAPI] 获取成功 - 技能名称:', response.data?.skillName);
    return response.data || null;
  }

  /**
   * 更新技能
   * PUT /api/user/skills/{skillId}
   */
  async updateSkill(skillId: number, params: Partial<CreateOnlineSkillParams | CreateOfflineSkillParams>): Promise<void> {
    console.log('\n📱 [SkillAPI] ========== 更新技能 ==========');
    console.log('📱 技能ID:', skillId);

    await apiClient.put(`${API_ENDPOINTS.SKILL.UPDATE}/${skillId}`, params);
    console.log('📱 [SkillAPI] 更新成功');
  }

  /**
   * 删除技能
   * DELETE /api/user/skills/{skillId}
   */
  async deleteSkill(skillId: number): Promise<void> {
    console.log('\n📱 [SkillAPI] ========== 删除技能 ==========');
    console.log('📱 技能ID:', skillId);

    await apiClient.delete(`${API_ENDPOINTS.SKILL.DELETE}/${skillId}`);
    console.log('📱 [SkillAPI] 删除成功');
  }

  /**
   * 切换技能上下架状态
   * PUT /api/user/skills/{skillId}/toggle?isOnline=true
   */
  async toggleSkillStatus(skillId: number, isOnline: boolean): Promise<void> {
    console.log('\n📱 [SkillAPI] ========== 切换技能状态 ==========');
    console.log('📱 技能ID:', skillId);
    console.log('📱 目标状态:', isOnline ? '上架' : '下架');

    await apiClient.put(`${API_ENDPOINTS.SKILL.TOGGLE}/${skillId}/toggle?isOnline=${isOnline}`);
    console.log('📱 [SkillAPI] 状态切换成功');
  }

  /**
   * 获取用户技能列表
   * GET /api/user/skills/user/{userId}
   */
  async getUserSkills(userId: string | number, params: {
    pageNum?: number;
    pageSize?: number;
  } = {}): Promise<SkillListResponse> {
    const { pageNum = 1, pageSize = 20 } = params;

    console.log('\n📱 [SkillAPI] ========== 获取用户技能列表 ==========');
    console.log('📱 用户ID:', userId);

    const queryParams = new URLSearchParams();
    queryParams.append('pageNum', String(pageNum));
    queryParams.append('pageSize', String(pageSize));

    const response = await apiClient.get<SkillListResponse>(
      `${API_ENDPOINTS.SKILL.USER_LIST}/${userId}?${queryParams.toString()}`
    );

    console.log('📱 [SkillAPI] 获取成功 - 数量:', response.data?.rows?.length || 0);
    return response.data || { total: 0, rows: [], code: 200, msg: '' };
  }

  /**
   * 搜索附近技能
   * GET /api/user/skills/nearby
   */
  async getNearbySkills(params: NearbySkillParams): Promise<SkillListResponse> {
    const { latitude, longitude, radiusMeters = 10000, serviceType, pageNum = 1, pageSize = 10 } = params;

    console.log('\n📱 [SkillAPI] ========== 搜索附近技能 ==========');
    console.log('📱 位置:', { latitude, longitude });
    console.log('📱 半径:', radiusMeters, '米');

    const queryParams = new URLSearchParams();
    queryParams.append('latitude', String(latitude));
    queryParams.append('longitude', String(longitude));
    queryParams.append('radiusMeters', String(radiusMeters));
    queryParams.append('pageNum', String(pageNum));
    queryParams.append('pageSize', String(pageSize));
    if (serviceType) queryParams.append('serviceType', serviceType);

    const response = await apiClient.get<SkillListResponse>(
      `${API_ENDPOINTS.SKILL.NEARBY}?${queryParams.toString()}`
    );

    console.log('📱 [SkillAPI] 搜索成功 - 数量:', response.data?.rows?.length || 0);
    return response.data || { total: 0, rows: [], code: 200, msg: '' };
  }
}

// ==================== 导出 ====================

/**
 * Skill API 实例
 */
export const skillApi = new SkillAPI();

/**
 * 默认导出
 */
export default skillApi;
