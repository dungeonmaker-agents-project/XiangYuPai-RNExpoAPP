/**
 * 订单确认 API
 * 对接后端 BFF 层 OrderConfirmController
 */

import { API_PATHS } from '../constants';
import type {
  OrderConfirmPreviewResponse,
  PricePreview,
  SubmitOrderRequest,
  SubmitOrderResponse,
  UserBalanceResponse,
} from '../types';

// API 基础 URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

/** 通用 API 请求封装 */
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        // TODO: 添加认证 token
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    if (data.code !== 200 && data.code !== 0) {
      throw new Error(data.msg || '请求失败');
    }

    return data;
  } catch (error) {
    console.error(`[orderApi] 请求失败: ${endpoint}`, error);
    throw error;
  }
}

/**
 * 获取订单确认预览
 * @param serviceId 服务ID
 * @param quantity 初始数量
 */
export async function getOrderConfirmPreview(
  serviceId: number,
  quantity: number = 1
): Promise<OrderConfirmPreviewResponse> {
  const params = new URLSearchParams({
    serviceId: serviceId.toString(),
    quantity: quantity.toString(),
  });
  return apiRequest<OrderConfirmPreviewResponse>(
    `${API_PATHS.CONFIRM_PREVIEW}?${params}`,
    { method: 'GET' }
  );
}

/**
 * 更新价格预览
 * @param serviceId 服务ID
 * @param quantity 新数量
 */
export async function updatePricePreview(
  serviceId: number,
  quantity: number
): Promise<{ code: number; msg: string; data: PricePreview }> {
  const params = new URLSearchParams({
    serviceId: serviceId.toString(),
    quantity: quantity.toString(),
  });
  return apiRequest<{ code: number; msg: string; data: PricePreview }>(
    `${API_PATHS.PREVIEW_UPDATE}?${params}`,
    { method: 'GET' }
  );
}

/**
 * 提交订单并支付
 * @param request 提交订单请求
 */
export async function submitOrderWithPayment(
  request: SubmitOrderRequest
): Promise<SubmitOrderResponse> {
  return apiRequest<SubmitOrderResponse>(API_PATHS.SUBMIT_WITH_PAYMENT, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * 获取用户余额
 */
export async function getUserBalance(): Promise<UserBalanceResponse> {
  return apiRequest<UserBalanceResponse>(API_PATHS.BALANCE, { method: 'GET' });
}

// ========== Mock 数据（开发测试用） ==========

/** 生成 Mock 订单确认预览 */
export function generateMockOrderConfirmPreview(
  serviceId: number,
  quantity: number = 1
): OrderConfirmPreviewResponse {
  const unitPrice = 50;
  const total = unitPrice * quantity;

  return {
    code: 200,
    msg: 'success',
    data: {
      provider: {
        userId: 1001,
        nickname: '测试陪玩师',
        avatar: 'https://picsum.photos/200/200?random=1',
        gender: 'female',
        age: 22,
        isOnline: true,
        isVerified: true,
        tags: ['实名认证', '王者大神'],
        skillInfo: {
          gameArea: '微信区',
          rank: '荣耀王者',
          rankDisplay: '巅峰1800+',
        },
      },
      service: {
        serviceId,
        name: '王者荣耀陪玩',
        icon: 'https://example.com/icon.png',
        skillType: 'wzry',
      },
      price: {
        unitPrice,
        unit: '局',
        displayText: `${unitPrice}向娱币/局`,
      },
      quantityOptions: {
        min: 1,
        max: 99,
        defaultValue: 1,
      },
      preview: {
        quantity,
        subtotal: total,
        total,
      },
      userBalance: 500,
      hasPaymentPassword: true,
    },
  };
}

/** 生成 Mock 提交订单响应 */
export function generateMockSubmitOrder(
  success: boolean = true
): SubmitOrderResponse {
  if (success) {
    return {
      code: 200,
      msg: 'success',
      data: {
        success: true,
        orderId: Date.now(),
        orderNo: `XYP${Date.now()}`,
        amount: 50,
        paymentStatus: 'success',
        remainingBalance: 450,
      },
    };
  }
  return {
    code: 200,
    msg: 'success',
    data: {
      success: false,
      errorCode: 'PASSWORD_ERROR',
      errorMessage: '支付密码错误',
    },
  };
}

// 导出 API 对象
export const orderConfirmApi = {
  getOrderConfirmPreview,
  updatePricePreview,
  submitOrderWithPayment,
  getUserBalance,
  generateMockOrderConfirmPreview,
  generateMockSubmitOrder,
};
