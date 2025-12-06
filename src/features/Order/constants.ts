/**
 * Order 模块常量配置
 */

// ========== 颜色常量 ==========
export const COLORS = {
  PRIMARY: '#FF6B35',
  PRIMARY_LIGHT: '#FFF0EB',
  SECONDARY: '#FFB800',
  BACKGROUND: '#FFFFFF',
  BACKGROUND_GRAY: '#F5F5F5',
  TEXT_PRIMARY: '#1A1A1A',
  TEXT_SECONDARY: '#666666',
  TEXT_PLACEHOLDER: '#999999',
  DIVIDER: '#EEEEEE',
  SUCCESS: '#52C41A',
  ERROR: '#FF4D4F',
  WARNING: '#FAAD14',
  GRADIENT_START: '#FF6B35',
  GRADIENT_END: '#FF8F35',
};

// ========== 尺寸常量 ==========
export const SIZES = {
  PADDING_H: 16,
  PADDING_V: 12,
  GAP_SM: 8,
  GAP_MD: 12,
  GAP_LG: 16,
  FONT_XS: 11,
  FONT_SM: 12,
  FONT_MD: 14,
  FONT_LG: 16,
  FONT_XL: 18,
  FONT_XXL: 24,
  AVATAR_SM: 40,
  AVATAR_MD: 56,
  AVATAR_LG: 72,
  BUTTON_HEIGHT: 48,
  BUTTON_RADIUS: 24,
  CARD_RADIUS: 12,
  PASSWORD_BOX_SIZE: 48,
  KEYBOARD_KEY_SIZE: 64,
};

// ========== 文案常量 ==========
export const TEXT = {
  PAGE_TITLE: '确认订单',
  PROVIDER_LABEL: '陪玩师',
  SERVICE_LABEL: '服务',
  QUANTITY_LABEL: '数量',
  UNIT_PRICE_LABEL: '单价',
  TOTAL_LABEL: '合计',
  BALANCE_LABEL: '余额',
  BALANCE_UNIT: '向娱币',
  BTN_CONFIRM: '确认支付',
  BTN_CANCEL: '取消',
  BTN_CLOSE: '关闭',
  BTN_RECHARGE: '去充值',
  PAYMENT_TITLE: '确认支付',
  PASSWORD_TITLE: '请输入支付密码',
  PASSWORD_PLACEHOLDER: '请输入6位支付密码',
  PASSWORD_FORGOT: '忘记密码?',
  SUCCESS_TITLE: '支付成功',
  SUCCESS_DESC: '订单已创建，等待服务开始',
  SUCCESS_VIEW_ORDER: '查看订单',
  SUCCESS_BACK_HOME: '返回首页',
  ERROR_PASSWORD: '支付密码错误',
  ERROR_BALANCE: '余额不足',
  ERROR_NETWORK: '网络错误，请重试',
  LOADING: '处理中...',
};

// ========== API 路径 ==========
export const API_PATHS = {
  CONFIRM_PREVIEW: '/api/app/order/confirm-preview',
  PREVIEW_UPDATE: '/api/app/order/preview-update',
  SUBMIT_WITH_PAYMENT: '/api/app/order/submit-with-payment',
  BALANCE: '/api/app/order/balance',
};
