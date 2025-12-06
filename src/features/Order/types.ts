/**
 * Order 模块类型定义
 * 对应后端 BFF 层: OrderConfirmController
 */

// ========== 订单确认预览 ==========

/** 陪玩师信息 */
export interface ProviderInfo {
  userId: number;
  nickname: string;
  avatar: string;
  gender: 'male' | 'female';
  age?: number;
  isOnline?: boolean;
  isVerified?: boolean;
  tags?: string[];
  skillInfo?: SkillInfo;
}

/** 技能信息 */
export interface SkillInfo {
  gameArea?: string;
  rank?: string;
  rankDisplay?: string;
  peakScore?: number;
}

/** 服务信息 */
export interface ServiceInfo {
  serviceId: number;
  name: string;
  icon?: string;
  skillType?: string;
}

/** 价格信息 */
export interface PriceInfo {
  unitPrice: number;
  unit: string;
  displayText: string;
}

/** 数量选项 */
export interface QuantityOptions {
  min: number;
  max: number;
  defaultValue: number;
}

/** 价格预览 */
export interface PricePreview {
  quantity: number;
  subtotal: number;
  total: number;
}

/** 订单确认预览响应 */
export interface OrderConfirmPreviewResponse {
  code: number;
  msg: string;
  data: {
    provider: ProviderInfo;
    service: ServiceInfo;
    price: PriceInfo;
    quantityOptions: QuantityOptions;
    preview: PricePreview;
    userBalance: number;
    hasPaymentPassword: boolean;
  };
}

// ========== 提交订单 ==========

/** 提交订单请求 */
export interface SubmitOrderRequest {
  serviceId: number;
  quantity: number;
  totalAmount: number;
  paymentPassword: string;
  remark?: string;
}

/** 提交订单响应 */
export interface SubmitOrderResponse {
  code: number;
  msg: string;
  data: {
    success: boolean;
    orderId?: number;
    orderNo?: string;
    amount?: number;
    paymentStatus?: string;
    errorCode?: string;
    errorMessage?: string;
    remainingBalance?: number;
  };
}

// ========== 用户余额 ==========

/** 用户余额响应 */
export interface UserBalanceResponse {
  code: number;
  msg: string;
  data: {
    availableBalance: number;
    hasPaymentPassword: boolean;
  };
}

// ========== 组件 Props ==========

/** 订单确认页 Props */
export interface OrderConfirmPageProps {
  serviceId: number;
  initialQuantity?: number;
}

/** 支付弹窗 Props */
export interface PaymentModalProps {
  visible: boolean;
  amount: number;
  balance: number;
  onClose: () => void;
  onConfirm: () => void;
}

/** 密码弹窗 Props */
export interface PasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  errorMessage?: string;
  isLoading?: boolean;
}

/** 支付成功页 Props */
export interface PaymentSuccessPageProps {
  orderNo: string;
  amount: number;
  remainingBalance: number;
}
