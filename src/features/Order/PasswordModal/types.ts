/**
 * PasswordModal 组件内部类型定义
 * 调用场景: 支付密码输入弹窗组件内部使用
 */

/** 数字键盘按键类型 */
export type KeyboardKeyType = 'number' | 'delete' | 'empty';

/** 数字键盘按键配置 */
export interface KeyboardKeyConfig {
  type: KeyboardKeyType;
  value: string;
  label: string;
}

/** 密码框状态 */
export interface PasswordBoxState {
  filled: boolean;
  index: number;
}
