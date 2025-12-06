/**
 * PaymentSuccessPage 类型定义
 * 支付成功页面专属类型
 */

/** 路由参数类型 */
export interface PaymentSuccessRouteParams {
  orderNo: string;
  amount: string;
  remainingBalance: string;
}

/** 信息行组件 Props */
export interface InfoRowProps {
  label: string;
  value: string;
  isAmount?: boolean;
}
