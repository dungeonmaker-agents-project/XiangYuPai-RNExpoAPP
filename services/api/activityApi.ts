/**
 * Activity API - 组局中心相关API接口
 * 支持Mock模式，开发时无需后端即可测试
 */

import { apiClient, ApiResponse } from './client';
import { buildQueryParams } from './config';
import type {
  ActivityListParams,
  ActivityListResponse,
  ActivityDetail,
  PublishConfig,
  PublishActivityParams,
  PublishActivityResponse,
  RegisterParams,
  RegisterResponse,
  ApproveRegistrationParams,
  CancelRegistrationResponse,
  ShareResponse,
  UploadImageResponse,
  PaymentInfo,
} from './types/activity';
import { 
  mockActivityList, 
  mockActivityDetail, 
  mockPublishConfig 
} from './activityMockData';

// 🎯 Mock模式配置
// 设置为true时，所有API将返回虚拟数据，无需后端
const USE_MOCK_DATA = false; // 开发时设为true，生产环境设为false

/**
 * 创建Mock响应
 */
const createMockResponse = <T>(data: T, delay: number = 300): Promise<ApiResponse<T>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data,
        code: 200,
        message: 'Success (Mock Data)',
        timestamp: Date.now(),
        success: true,
      });
    }, delay);
  });
};

/**
 * 获取活动列表
 */
export const getActivityList = async (
  params: ActivityListParams
): Promise<ApiResponse<ActivityListResponse>> => {
  if (USE_MOCK_DATA) {
    console.log('📦 [Mock] 获取活动列表 - 返回虚拟数据');
    // 支持筛选逻辑
    let filteredList = [...mockActivityList.list];
    if (params.filters?.activityType && params.filters.activityType.length > 0) {
      filteredList = filteredList.filter(
        item => params.filters!.activityType!.includes(item.activityType.type)
      );
    }
    return createMockResponse({
      ...mockActivityList,
      list: filteredList,
    });
  }
  
  const queryParams = buildQueryParams(params);
  return apiClient.get(`/api/activity/list?${queryParams}`);
};

/**
 * 获取活动详情
 */
export const getActivityDetail = async (
  activityId: number
): Promise<ApiResponse<ActivityDetail>> => {
  if (USE_MOCK_DATA) {
    console.log('📦 [Mock] 获取活动详情 - 返回虚拟数据', { activityId });
    return createMockResponse(mockActivityDetail);
  }
  
  const queryParams = buildQueryParams({ activityId });
  return apiClient.get(`/api/activity/detail?${queryParams}`);
};

/**
 * 获取发布配置
 */
export const getPublishConfig = async (): Promise<ApiResponse<PublishConfig>> => {
  if (USE_MOCK_DATA) {
    console.log('📦 [Mock] 获取发布配置 - 返回虚拟数据');
    return createMockResponse(mockPublishConfig);
  }
  
  return apiClient.get('/api/activity/publish/config');
};

/**
 * 上传活动图片
 */
export const uploadActivityImage = async (
  file: File | FormData
): Promise<ApiResponse<UploadImageResponse>> => {
  if (USE_MOCK_DATA) {
    console.log('📦 [Mock] 上传活动图片 - 返回虚拟数据');
    return createMockResponse({
      imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb',
      thumbnailUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200',
    }, 800);
  }
  
  const formData = file instanceof FormData ? file : new FormData();
  if (!(file instanceof FormData)) {
    formData.append('file', file);
    formData.append('type', 'activity');
  }
  
  return apiClient.post('/api/common/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * 发布活动
 */
export const publishActivity = async (
  params: PublishActivityParams
): Promise<ApiResponse<PublishActivityResponse>> => {
  if (USE_MOCK_DATA) {
    console.log('📦 [Mock] 发布活动 - 返回虚拟数据', params);
    return createMockResponse({
      activityId: Math.floor(Math.random() * 10000) + 1000,
      needPayment: false,
    }, 500);
  }
  
  return apiClient.post('/api/activity/publish', params);
};

/**
 * 支付平台费用
 */
export const payPublishFee = async (params: {
  activityId: number;
  paymentMethod: 'balance' | 'alipay' | 'wechat';
  amount: number;
}): Promise<ApiResponse<PaymentInfo>> => {
  if (USE_MOCK_DATA) {
    console.log('📦 [Mock] 支付平台费用 - 返回虚拟数据', params);
    return createMockResponse({
      orderId: `ORDER_${Date.now()}`,
      paymentStatus: 'success',
      activityId: params.activityId,
      balance: 500,
    }, 600);
  }
  
  return apiClient.post('/api/activity/publish/pay', params);
};

/**
 * 报名参加活动
 */
export const registerActivity = async (
  params: RegisterParams
): Promise<ApiResponse<RegisterResponse>> => {
  if (USE_MOCK_DATA) {
    console.log('📦 [Mock] 报名参加活动 - 返回虚拟数据', params);
    return createMockResponse({
      registrationId: Math.floor(Math.random() * 10000) + 3000,
      status: 'approved',
      needPayment: false,
      approvalRequired: false,
    }, 400);
  }
  
  return apiClient.post('/api/activity/register', params);
};

/**
 * 支付报名费用
 */
export const payRegistrationFee = async (params: {
  activityId: number;
  registrationId: number;
  paymentMethod: 'balance' | 'alipay' | 'wechat';
  amount: number;
}): Promise<ApiResponse<PaymentInfo>> => {
  if (USE_MOCK_DATA) {
    console.log('📦 [Mock] 支付报名费用 - 返回虚拟数据', params);
    return createMockResponse({
      orderId: `REG_ORDER_${Date.now()}`,
      paymentStatus: 'success',
      registrationStatus: 'approved',
      balance: 450,
    }, 600);
  }
  
  return apiClient.post('/api/activity/register/pay', params);
};

/**
 * 审核报名
 */
export const approveRegistration = async (
  params: ApproveRegistrationParams
): Promise<ApiResponse<{ registrationId: number; status: string; success: boolean }>> => {
  if (USE_MOCK_DATA) {
    console.log('📦 [Mock] 审核报名 - 返回虚拟数据', params);
    return createMockResponse({
      registrationId: params.registrationId,
      status: params.action === 'approve' ? 'approved' : 'rejected',
      success: true,
    }, 400);
  }
  
  return apiClient.post('/api/activity/registration/approve', params);
};

/**
 * 取消报名
 */
export const cancelRegistration = async (params: {
  activityId: number;
  registrationId: number;
}): Promise<ApiResponse<CancelRegistrationResponse>> => {
  if (USE_MOCK_DATA) {
    console.log('📦 [Mock] 取消报名 - 返回虚拟数据', params);
    return createMockResponse({
      success: true,
      refundAmount: 50,
      cancelPolicy: '活动开始前24小时取消可全额退款',
    }, 400);
  }
  
  return apiClient.post('/api/activity/register/cancel', params);
};

/**
 * 分享活动
 */
export const shareActivity = async (params: {
  activityId: number;
  shareType: 'link' | 'image' | 'miniprogram';
}): Promise<ApiResponse<ShareResponse>> => {
  if (USE_MOCK_DATA) {
    console.log('📦 [Mock] 分享活动 - 返回虚拟数据', params);
    return createMockResponse({
      shareUrl: `https://app.xiangyupai.com/activity/${params.activityId}`,
      shareImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb',
      shareText: '快来参加这个精彩活动！',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://app.xiangyupai.com',
    }, 500);
  }

  return apiClient.post('/api/activity/share', params);
};

// ==================== P1 新增接口 ====================

/**
 * 取消活动 (P1)
 * 接口: POST /xypai-app-bff/api/activity/cancel/{activityId}
 * 用途: 组织者取消活动
 *
 * @param activityId - 活动ID
 * @param reason - 取消原因
 * @returns 取消结果
 */
export const cancelActivity = async (
  activityId: number,
  reason: string
): Promise<ApiResponse<{ success: boolean; message: string; refundInfo?: string }>> => {
  if (USE_MOCK_DATA) {
    console.log('📦 [Mock] 取消活动 - 返回虚拟数据', { activityId, reason });
    return createMockResponse({
      success: true,
      message: '活动已取消，参与者将收到通知',
      refundInfo: '报名费用将在1-3个工作日内退回',
    }, 500);
  }

  return apiClient.post(`/xypai-app-bff/api/activity/cancel/${activityId}`, null, {
    params: { reason },
  });
};

// ==================== P2 新增接口 ====================

/**
 * 活动类型项
 */
export interface ActivityTypeItem {
  type: string;
  label: string;
  icon: string;
  count?: number;
}

/**
 * 获取活动类型列表 (P2)
 * 接口: GET /xypai-app-bff/api/activity/types
 * 用途: 发布页面选择活动类型
 *
 * @returns 活动类型列表
 */
export const getActivityTypes = async (): Promise<ApiResponse<ActivityTypeItem[]>> => {
  if (USE_MOCK_DATA) {
    console.log('📦 [Mock] 获取活动类型列表 - 返回虚拟数据');
    return createMockResponse([
      { type: 'billiards', label: '台球', icon: '🎱', count: 120 },
      { type: 'ktv', label: 'KTV', icon: '🎤', count: 85 },
      { type: 'dinner', label: '约饭', icon: '🍽️', count: 200 },
      { type: 'movie', label: '电影', icon: '🎬', count: 65 },
      { type: 'sports', label: '运动', icon: '⚽', count: 90 },
      { type: 'board_game', label: '桌游', icon: '🎲', count: 45 },
      { type: 'script_kill', label: '剧本杀', icon: '🔍', count: 78 },
      { type: 'hiking', label: '徒步', icon: '🥾', count: 35 },
      { type: 'other', label: '其他', icon: '📌', count: 50 },
    ], 300);
  }

  return apiClient.get('/xypai-app-bff/api/activity/types');
};

/**
 * 获取热门活动类型 (P2)
 * 接口: GET /xypai-app-bff/api/activity/types/hot
 * 用途: 首页展示热门活动类型
 *
 * @param limit - 返回数量限制（默认6）
 * @returns 热门活动类型列表
 */
export const getHotActivityTypes = async (
  limit: number = 6
): Promise<ApiResponse<ActivityTypeItem[]>> => {
  if (USE_MOCK_DATA) {
    console.log('📦 [Mock] 获取热门活动类型 - 返回虚拟数据');
    return createMockResponse([
      { type: 'dinner', label: '约饭', icon: '🍽️', count: 200 },
      { type: 'billiards', label: '台球', icon: '🎱', count: 120 },
      { type: 'sports', label: '运动', icon: '⚽', count: 90 },
      { type: 'ktv', label: 'KTV', icon: '🎤', count: 85 },
      { type: 'script_kill', label: '剧本杀', icon: '🔍', count: 78 },
      { type: 'movie', label: '电影', icon: '🎬', count: 65 },
    ].slice(0, limit), 200);
  }

  return apiClient.get(`/xypai-app-bff/api/activity/types/hot?limit=${limit}`);
};

export default {
  getActivityList,
  getActivityDetail,
  getPublishConfig,
  uploadActivityImage,
  publishActivity,
  payPublishFee,
  registerActivity,
  payRegistrationFee,
  approveRegistration,
  cancelRegistration,
  shareActivity,
  // P1 新增
  cancelActivity,
  // P2 新增
  getActivityTypes,
  getHotActivityTypes,
};
