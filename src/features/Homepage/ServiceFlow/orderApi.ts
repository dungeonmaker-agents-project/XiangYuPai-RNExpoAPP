/**
 * 订单服务API
 * 根据接口文档实现的技能服务下单相关API调用
 * 文档参考: XiangYuPai-Doc/Action-API/Home/技能服务下单接口文档.md
 */

// ========== 类型定义 ==========

/**
 * 订单预览请求参数
 */
export interface OrderPreviewParams {
  serviceId: number;
  quantity?: number;
}

/**
 * 订单预览响应
 */
export interface OrderPreviewResponse {
  code: number;
  message: string;
  data: {
    provider: {
      userId: number;
      avatar: string;
      nickname: string;
      gender: 'male' | 'female';
      age?: number;
      tags: string[];
      skillInfo: {
        gameArea?: string;
        rank?: string;
        rankDisplay?: string;
      };
    };
    service: {
      serviceId: number;
      name: string;
      icon?: string;
    };
    price: {
      unitPrice: number;
      unit: string;
      displayText: string;
    };
    quantityOptions: {
      min: number;
      max: number;
      default: number;
    };
    preview: {
      quantity: number;
      subtotal: number;
      serviceFee: number;
      total: number;
    };
    userBalance: number;
  };
}

/**
 * 更新订单预览请求参数
 */
export interface UpdateOrderPreviewParams {
  serviceId: number;
  quantity: number;
}

/**
 * 更新订单预览响应
 */
export interface UpdateOrderPreviewResponse {
  code: number;
  message: string;
  data: {
    quantity: number;
    subtotal: number;
    serviceFee: number;
    total: number;
  };
}

/**
 * 创建订单请求参数
 */
export interface CreateOrderParams {
  serviceId: number;
  quantity: number;
  totalAmount: number;
}

/**
 * 创建订单响应
 */
export interface CreateOrderResponse {
  code: number;
  message: string;
  data: {
    orderId: string;
    orderNo: string;
    amount: number;
    needPayment: boolean;
    paymentInfo?: {
      amount: number;
      currency: 'coin';
      userBalance: number;
      sufficientBalance: boolean;
    };
  };
}

/**
 * 支付订单请求参数
 */
export interface PayOrderParams {
  orderId: string;
  orderNo: string;
  paymentMethod: 'balance' | 'alipay' | 'wechat';
  amount: number;
  paymentPassword?: string;
}

/**
 * 支付订单响应
 */
export interface PayOrderResponse {
  code: number;
  message: string;
  data: {
    orderId: string;
    orderNo: string;
    paymentStatus: 'success' | 'pending' | 'require_password' | 'failed';
    requirePassword?: boolean;
    balance?: number;
    failureReason?: string;
  };
}

/**
 * 验证支付密码请求参数
 */
export interface VerifyPaymentPasswordParams {
  orderId: string;
  orderNo: string;
  paymentPassword: string;
}

/**
 * 验证支付密码响应
 */
export interface VerifyPaymentPasswordResponse {
  code: number;
  message: string;
  data: {
    orderId: string;
    orderNo: string;
    paymentStatus: 'success' | 'failed';
    balance?: number;
    failureReason?: string;
  };
}

/**
 * 订单详情请求参数
 */
export interface OrderDetailParams {
  orderId: string;
}

/**
 * 订单详情响应
 */
export interface OrderDetailResponse {
  code: number;
  message: string;
  data: {
    orderId: string;
    orderNo: string;
    status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
    amount: number;
    createdAt: string;
    autoCancelTime?: string;
    provider: {
      userId: number;
      nickname: string;
      avatar: string;
    };
    service: {
      name: string;
      quantity: number;
    };
  };
}

/**
 * 订单状态请求参数
 */
export interface OrderStatusParams {
  orderId: string;
}

/**
 * 订单状态响应
 */
export interface OrderStatusResponse {
  code: number;
  message: string;
  data: {
    orderId: string;
    orderNo: string;
    status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
    statusLabel: string;
    provider: {
      userId: number;
      nickname: string;
      avatar: string;
      isOnline: boolean;
    };
    service: {
      name: string;
      quantity: number;
      unitPrice: number;
    };
    amount: number;
    createdAt: string;
    acceptedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
    autoCancel: {
      enabled: boolean;
      cancelAt?: string;
      remainingSeconds?: number;
    };
    actions: Array<{
      action: 'cancel' | 'contact' | 'rate' | 'refund';
      label: string;
      enabled: boolean;
    }>;
  };
}

/**
 * 取消订单请求参数
 */
export interface CancelOrderParams {
  orderId: string;
  reason?: string;
}

/**
 * 取消订单响应
 */
export interface CancelOrderResponse {
  code: number;
  message: string;
  data: {
    orderId: string;
    status: 'cancelled';
    refundAmount: number;
    refundTime: string;
    balance: number;
  };
}

// ========== API实现 ==========

// API基础URL - 需要根据实际环境配置
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com';

/**
 * 通用API请求封装
 */
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        // TODO: 添加认证token
        // 'Authorization': `Bearer ${token}`,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // 检查业务错误码
    if (data.code !== 0 && data.code !== 200) {
      throw new Error(data.message || '请求失败');
    }

    return data;
  } catch (error) {
    console.error(`[orderApi] API请求失败: ${endpoint}`, error);
    throw error;
  }
}

/**
 * 七、点击下单按钮 - 获取订单预览
 * 接口: GET /api/order/preview
 * 说明: 用户在服务详情页点击"下单"按钮时触发
 */
export async function getOrderPreview(params: OrderPreviewParams): Promise<OrderPreviewResponse> {
  const { serviceId, quantity = 1 } = params;
  
  const queryParams = new URLSearchParams({
    serviceId: serviceId.toString(),
    quantity: quantity.toString(),
  });

  return apiRequest<OrderPreviewResponse>(`/api/order/preview?${queryParams}`, {
    method: 'GET',
  });
}

/**
 * 八、调整订单数量 - 更新订单预览（可选）
 * 接口: POST /api/order/preview/update
 * 说明: 用户在确认订单页面调整数量时触发（也可以前端直接计算）
 */
export async function updateOrderPreview(params: UpdateOrderPreviewParams): Promise<UpdateOrderPreviewResponse> {
  const { serviceId, quantity } = params;
  
  // 前端验证
  if (quantity < 1) {
    throw new Error('数量必须大于0');
  }

  return apiRequest<UpdateOrderPreviewResponse>('/api/order/preview/update', {
    method: 'POST',
    body: JSON.stringify({ serviceId, quantity }),
  });
}

/**
 * 九、提交订单 - 创建订单
 * 接口: POST /api/order/create
 * 说明: 用户确认订单信息后点击"立即支付"按钮时触发
 */
export async function createOrder(params: CreateOrderParams): Promise<CreateOrderResponse> {
  const { serviceId, quantity, totalAmount } = params;
  
  // 前端验证
  if (!serviceId) {
    throw new Error('serviceId必填');
  }
  if (quantity < 1) {
    throw new Error('quantity必须在有效范围内');
  }
  if (totalAmount <= 0) {
    throw new Error('totalAmount必须正确');
  }

  return apiRequest<CreateOrderResponse>('/api/order/create', {
    method: 'POST',
    body: JSON.stringify({ serviceId, quantity, totalAmount }),
  });
}

/**
 * 十一、执行支付
 * 接口: POST /api/order/pay
 * 说明: 用户在支付弹窗中点击"立即支付"按钮时触发
 */
export async function payOrder(params: PayOrderParams): Promise<PayOrderResponse> {
  const { orderId, orderNo, paymentMethod, amount, paymentPassword } = params;

  return apiRequest<PayOrderResponse>('/api/order/pay', {
    method: 'POST',
    body: JSON.stringify({ orderId, orderNo, paymentMethod, amount, paymentPassword }),
  });
}

/**
 * 十二、输入支付密码 - 验证支付密码
 * 接口: POST /api/order/pay/verify
 * 说明: 系统要求输入支付密码时，用户输入6位密码后触发
 */
export async function verifyPaymentPassword(params: VerifyPaymentPasswordParams): Promise<VerifyPaymentPasswordResponse> {
  const { orderId, orderNo, paymentPassword } = params;
  
  // 前端验证
  if (!/^\d{6}$/.test(paymentPassword)) {
    throw new Error('支付密码必须为6位数字');
  }

  return apiRequest<VerifyPaymentPasswordResponse>('/api/order/pay/verify', {
    method: 'POST',
    body: JSON.stringify({ orderId, orderNo, paymentPassword }),
  });
}

/**
 * 十三、支付成功 - 获取订单详情（可选）
 * 接口: GET /api/order/detail
 * 说明: 支付验证成功后，可能需要获取订单详情
 */
export async function getOrderDetail(params: OrderDetailParams): Promise<OrderDetailResponse> {
  const { orderId } = params;
  
  const queryParams = new URLSearchParams({
    orderId,
  });

  return apiRequest<OrderDetailResponse>(`/api/order/detail?${queryParams}`, {
    method: 'GET',
  });
}

/**
 * 十四、查询订单状态
 * 接口: GET /api/order/status
 * 说明: 用户在订单列表或订单详情中查看订单时触发
 */
export async function getOrderStatus(params: OrderStatusParams): Promise<OrderStatusResponse> {
  const { orderId } = params;
  
  const queryParams = new URLSearchParams({
    orderId,
  });

  return apiRequest<OrderStatusResponse>(`/api/order/status?${queryParams}`, {
    method: 'GET',
  });
}

/**
 * 十五、取消订单
 * 接口: POST /api/order/cancel
 * 说明: 用户在订单详情页点击"取消订单"按钮时触发
 */
export async function cancelOrder(params: CancelOrderParams): Promise<CancelOrderResponse> {
  const { orderId, reason } = params;

  return apiRequest<CancelOrderResponse>('/api/order/cancel', {
    method: 'POST',
    body: JSON.stringify({ orderId, reason }),
  });
}

// ========== Mock数据生成函数（用于开发和测试） ==========

/**
 * 生成Mock订单预览数据
 */
export function generateMockOrderPreview(serviceId: number, quantity: number = 1): OrderPreviewResponse {
  const unitPrice = 10;
  const subtotal = unitPrice * quantity;
  const serviceFee = 0; // 假设无服务费
  const total = subtotal + serviceFee;

  return {
    code: 200,
    message: 'success',
    data: {
      provider: {
        userId: 1001,
        avatar: 'https://picsum.photos/200/200?random=provider',
        nickname: '昵称123',
        gender: 'male',
        age: 25,
        tags: ['实名认证', '大神', '微信区', '荣耀王者', '巅峰1800+'],
        skillInfo: {
          gameArea: '微信区',
          rank: '荣耀王者',
          rankDisplay: '巅峰1800+',
        },
      },
      service: {
        serviceId,
        name: '王者荣耀',
        icon: '👑',
      },
      price: {
        unitPrice,
        unit: '局',
        displayText: `${unitPrice}金币/局`,
      },
      quantityOptions: {
        min: 1,
        max: 10,
        default: 1,
      },
      preview: {
        quantity,
        subtotal,
        serviceFee,
        total,
      },
      userBalance: 100,
    },
  };
}

/**
 * 生成Mock创建订单响应
 */
export function generateMockCreateOrder(totalAmount: number): CreateOrderResponse {
  const orderId = `ORD${Date.now()}`;
  const orderNo = `XYP${Date.now()}`;
  
  return {
    code: 200,
    message: 'success',
    data: {
      orderId,
      orderNo,
      amount: totalAmount,
      needPayment: true,
      paymentInfo: {
        amount: totalAmount,
        currency: 'coin',
        userBalance: 100,
        sufficientBalance: totalAmount <= 100,
      },
    },
  };
}

/**
 * 生成Mock支付响应
 */
export function generateMockPayOrder(requirePassword: boolean = true): PayOrderResponse {
  return {
    code: 200,
    message: 'success',
    data: {
      orderId: `ORD${Date.now()}`,
      orderNo: `XYP${Date.now()}`,
      paymentStatus: requirePassword ? 'require_password' : 'success',
      requirePassword,
      balance: requirePassword ? undefined : 90,
    },
  };
}

/**
 * 生成Mock验证支付密码响应
 */
export function generateMockVerifyPaymentPassword(success: boolean = true): VerifyPaymentPasswordResponse {
  return {
    code: 200,
    message: success ? 'success' : '密码错误',
    data: {
      orderId: `ORD${Date.now()}`,
      orderNo: `XYP${Date.now()}`,
      paymentStatus: success ? 'success' : 'failed',
      balance: success ? 90 : undefined,
      failureReason: success ? undefined : '密码错误',
    },
  };
}

/**
 * 生成Mock订单详情
 */
export function generateMockOrderDetail(orderId: string): OrderDetailResponse {
  return {
    code: 200,
    message: 'success',
    data: {
      orderId,
      orderNo: `XYP${Date.now()}`,
      status: 'pending',
      amount: 10,
      createdAt: new Date().toISOString(),
      autoCancelTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      provider: {
        userId: 1001,
        nickname: '昵称123',
        avatar: 'https://picsum.photos/200/200?random=provider',
      },
      service: {
        name: '王者荣耀',
        quantity: 1,
      },
    },
  };
}

/**
 * 生成Mock订单状态
 */
export function generateMockOrderStatus(orderId: string): OrderStatusResponse {
  return {
    code: 200,
    message: 'success',
    data: {
      orderId,
      orderNo: `XYP${Date.now()}`,
      status: 'pending',
      statusLabel: '待接单',
      provider: {
        userId: 1001,
        nickname: '昵称123',
        avatar: 'https://picsum.photos/200/200?random=provider',
        isOnline: true,
      },
      service: {
        name: '王者荣耀',
        quantity: 1,
        unitPrice: 10,
      },
      amount: 10,
      createdAt: new Date().toISOString(),
      autoCancel: {
        enabled: true,
        cancelAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        remainingSeconds: 600,
      },
      actions: [
        {
          action: 'cancel',
          label: '取消订单',
          enabled: true,
        },
        {
          action: 'contact',
          label: '联系服务者',
          enabled: false,
        },
      ],
    },
  };
}

// ========== 导出所有API函数 ==========
export const orderApi = {
  // 真实API
  getOrderPreview,
  updateOrderPreview,
  createOrder,
  payOrder,
  verifyPaymentPassword,
  getOrderDetail,
  getOrderStatus,
  cancelOrder,
  // Mock数据生成
  generateMockOrderPreview,
  generateMockCreateOrder,
  generateMockPayOrder,
  generateMockVerifyPaymentPassword,
  generateMockOrderDetail,
  generateMockOrderStatus,
};
