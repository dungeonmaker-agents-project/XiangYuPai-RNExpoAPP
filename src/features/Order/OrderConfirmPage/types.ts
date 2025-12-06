/**
 * OrderConfirmPage 组件类型定义
 * 订单确认页面内部组件和状态类型
 */

// ========== 页面状态类型 ==========

/** 页面加载状态 */
export interface PageLoadingState {
  isLoading: boolean;
  isRefreshing: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
}

/** 数量选择器状态 */
export interface QuantitySelectorState {
  value: number;
  min: number;
  max: number;
}

// ========== 组件Props类型 ==========

/** 陪玩师信息卡片Props */
export interface ProviderInfoCardProps {
  nickname: string;
  avatar: string;
  gender: 'male' | 'female';
  isOnline?: boolean;
  isVerified?: boolean;
  tags?: string[];
  skillInfo?: {
    gameArea?: string;
    rank?: string;
    rankDisplay?: string;
  };
}

/** 服务信息卡片Props */
export interface ServiceInfoCardProps {
  serviceName: string;
  unitPrice: number;
  unit: string;
  displayText: string;
}

/** 数量选择器Props */
export interface QuantitySelectorProps {
  value: number;
  min: number;
  max: number;
  unit: string;
  onValueChange: (newValue: number) => void;
}

/** 价格小计Props */
export interface PriceSubtotalProps {
  quantity: number;
  unitPrice: number;
  total: number;
  unit: string;
}

/** 底部操作栏Props */
export interface BottomActionBarProps {
  balance: number;
  totalAmount: number;
  isLoading: boolean;
  isBalanceSufficient: boolean;
  onConfirmPress: () => void;
}

/** 支付弹窗Props */
export interface PaymentModalInternalProps {
  visible: boolean;
  amount: number;
  balance: number;
  onClose: () => void;
  onPasswordSubmit: (password: string) => void;
  isSubmitting: boolean;
  errorMessage?: string;
}
