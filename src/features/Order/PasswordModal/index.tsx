/**
 * PasswordModal - 支付密码输入弹窗组件
 * 调用场景: 订单支付时需要验证用户支付密码
 * 核心逻辑: Modal底部弹出 + 6位密码框 + 数字键盘 + 自动提交
 * 外部依赖: react-native Modal/Animated, expo-haptics
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import type { PasswordModalProps } from '../types';
import { COLORS, SIZES, TEXT } from '../constants';
import type { KeyboardKeyConfig, KeyboardKeyType } from './types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PASSWORD_LENGTH = 6;

/** 数字键盘配置: 3x4网格布局 */
const KEYBOARD_KEYS: KeyboardKeyConfig[] = [
  { type: 'number', value: '1', label: '1' },
  { type: 'number', value: '2', label: '2' },
  { type: 'number', value: '3', label: '3' },
  { type: 'number', value: '4', label: '4' },
  { type: 'number', value: '5', label: '5' },
  { type: 'number', value: '6', label: '6' },
  { type: 'number', value: '7', label: '7' },
  { type: 'number', value: '8', label: '8' },
  { type: 'number', value: '9', label: '9' },
  { type: 'empty', value: '', label: '' },
  { type: 'number', value: '0', label: '0' },
  { type: 'delete', value: 'del', label: '删除' },
];

/**
 * PasswordModal 主组件
 * 核心逻辑: 弹窗动画控制 + 密码状态管理 + 键盘交互
 */
export default function PasswordModal({
  visible,
  onClose,
  onSubmit,
  errorMessage,
  isLoading = false,
}: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const slideAnimation = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // ========== 动画控制 ==========
  /** 弹窗显示/隐藏动画 */
  useEffect(() => {
    if (visible) {
      setPassword(''); // 重置密码
      Animated.spring(slideAnimation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnimation, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnimation]);

  // ========== 密码输入处理 ==========
  /** 处理键盘按键点击 */
  const handleKeyPress = useCallback(
    (key: KeyboardKeyConfig) => {
      if (isLoading) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (key.type === 'delete') {
        setPassword((prev) => prev.slice(0, -1));
        return;
      }

      if (key.type === 'number' && password.length < PASSWORD_LENGTH) {
        const newPassword = password + key.value;
        setPassword(newPassword);
        // 输入完成6位后自动触发提交
        if (newPassword.length === PASSWORD_LENGTH) {
          onSubmit(newPassword);
        }
      }
    },
    [password, isLoading, onSubmit]
  );

  /** 处理忘记密码点击 */
  const handleForgotPassword = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: 跳转忘记密码页面
    console.log('忘记密码');
  }, []);

  // ========== 渲染函数 ==========
  /** 渲染单个密码框 */
  const renderPasswordBox = (index: number) => {
    const isFilled = index < password.length;
    return (
      <View
        key={index}
        style={[styles.passwordBox, errorMessage && styles.passwordBoxError]}
      >
        {isFilled && <View style={styles.passwordDot} />}
      </View>
    );
  };

  /** 渲染单个键盘按键 */
  const renderKeyboardKey = (key: KeyboardKeyConfig, index: number) => {
    if (key.type === 'empty') {
      return <View key={index} style={styles.keyboardKeyEmpty} />;
    }

    return (
      <Pressable
        key={index}
        style={({ pressed }) => [
          styles.keyboardKey,
          pressed && styles.keyboardKeyPressed,
          key.type === 'delete' && styles.keyboardKeyDelete,
        ]}
        onPress={() => handleKeyPress(key)}
        disabled={isLoading}
      >
        <Text
          style={[
            styles.keyboardKeyText,
            key.type === 'delete' && styles.keyboardKeyDeleteText,
          ]}
        >
          {key.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* 遮罩层 */}
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.overlayBackground} />
      </Pressable>

      {/* 弹窗内容 */}
      <Animated.View
        style={[
          styles.container,
          { transform: [{ translateY: slideAnimation }] },
        ]}
      >
        {/* 标题栏 */}
        <View style={styles.header}>
          <Text style={styles.title}>{TEXT.PASSWORD_TITLE}</Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </Pressable>
        </View>

        {/* 密码输入框区域 */}
        <View style={styles.passwordContainer}>
          <View style={styles.passwordBoxRow}>
            {Array.from({ length: PASSWORD_LENGTH }, (_, i) =>
              renderPasswordBox(i)
            )}
          </View>

          {/* 错误提示 */}
          {errorMessage && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          {/* 忘记密码 */}
          <Pressable
            style={styles.forgotPasswordButton}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>{TEXT.PASSWORD_FORGOT}</Text>
          </Pressable>
        </View>

        {/* Loading 状态 */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{TEXT.LOADING}</Text>
          </View>
        )}

        {/* 数字键盘 */}
        <View style={styles.keyboardContainer}>
          {KEYBOARD_KEYS.map((key, index) => renderKeyboardKey(key, index))}
        </View>
      </Animated.View>
    </Modal>
  );
}

// ========== 样式定义 ==========
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.BACKGROUND,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34, // 安全区域
  },
  // 头部区域
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.PADDING_V,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.DIVIDER,
  },
  title: {
    fontSize: SIZES.FONT_LG,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  closeButton: {
    position: 'absolute',
    right: SIZES.PADDING_H,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '300',
  },
  // 密码框区域
  passwordContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.GAP_LG * 2,
  },
  passwordBoxRow: {
    flexDirection: 'row',
    gap: SIZES.GAP_SM,
  },
  passwordBox: {
    width: SIZES.PASSWORD_BOX_SIZE,
    height: SIZES.PASSWORD_BOX_SIZE,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.DIVIDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.BACKGROUND_GRAY,
  },
  passwordBoxError: {
    borderColor: COLORS.ERROR,
  },
  passwordDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.TEXT_PRIMARY,
  },
  errorText: {
    marginTop: SIZES.GAP_MD,
    fontSize: SIZES.FONT_SM,
    color: COLORS.ERROR,
  },
  forgotPasswordButton: {
    marginTop: SIZES.GAP_LG,
    paddingVertical: SIZES.GAP_SM,
    paddingHorizontal: SIZES.GAP_MD,
  },
  forgotPasswordText: {
    fontSize: SIZES.FONT_MD,
    color: COLORS.PRIMARY,
  },
  // Loading 状态
  loadingContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    fontSize: SIZES.FONT_MD,
    color: COLORS.TEXT_SECONDARY,
  },
  // 数字键盘
  keyboardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: COLORS.BACKGROUND_GRAY,
    paddingVertical: SIZES.GAP_SM,
  },
  keyboardKey: {
    width: '33.33%',
    height: SIZES.KEYBOARD_KEY_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.DIVIDER,
  },
  keyboardKeyPressed: {
    backgroundColor: COLORS.BACKGROUND_GRAY,
  },
  keyboardKeyEmpty: {
    width: '33.33%',
    height: SIZES.KEYBOARD_KEY_SIZE,
    backgroundColor: COLORS.BACKGROUND_GRAY,
  },
  keyboardKeyDelete: {
    backgroundColor: COLORS.BACKGROUND_GRAY,
  },
  keyboardKeyText: {
    fontSize: SIZES.FONT_XXL,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
  },
  keyboardKeyDeleteText: {
    fontSize: SIZES.FONT_MD,
    color: COLORS.TEXT_SECONDARY,
  },
});
