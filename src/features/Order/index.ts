/**
 * Order 模块入口
 * 订单确认支付流程
 */

// 页面导出
export { default as OrderConfirmPage } from './OrderConfirmPage';
export { default as PasswordModal } from './PasswordModal';
export { default as PaymentSuccessPage } from './PaymentSuccessPage';

// API 导出
export { orderConfirmApi } from './api/orderApi';

// 类型导出
export type {
  ProviderInfo,
  ServiceInfo,
  PriceInfo,
  QuantityOptions,
  PricePreview,
  OrderConfirmPreviewResponse,
  SubmitOrderRequest,
  SubmitOrderResponse,
  UserBalanceResponse,
  OrderConfirmPageProps,
  PaymentModalProps,
  PasswordModalProps,
  PaymentSuccessPageProps,
} from './types';
