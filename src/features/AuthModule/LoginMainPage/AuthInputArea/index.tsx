// #region 1. File Banner & TOC
/**
 * AuthInputArea - 认证输入区域组件
 * 
 * 功能描述：
 * - 整合PasswordInputArea和CodeInputArea
 * - 模式切换动画（密码 ↔ 验证码）
 * - 动态标题显示
 * - 统一的输入区域管理
 * - Flutter样式完全复刻
 * 
 * TOC (快速跳转):
 * [1] File Banner & TOC
 * [2] Imports
 * [3] Types & Schema
 * [4] Constants & Config
 * [5] Utils & Helpers
 * [6] State Management
 * [7] Domain Logic
 * [8] UI Components & Rendering
 * [9] Exports
 */
// #endregion

// #region 2. Imports
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    View,
    type StyleProp,
    type ViewStyle,
} from 'react-native';
import CodeInputArea from '../CodeInputArea';
import PasswordInputArea from '../PasswordInputArea';
import PhoneInputArea from '../PhoneInputArea';
// #endregion

// #region 3. Types & Schema
interface AuthInputAreaProps {
  // 登录模式
  loginMode: 'password' | 'code';

  // 手机号（两种模式共用）
  phoneNumber: string;
  onPhoneNumberChange: (phoneNumber: string) => void;
  countryCode: string;
  onCountryCodePress?: () => void;
  phoneValid?: boolean;

  // 密码模式
  password?: string;
  onPasswordChange?: (password: string) => void;
  passwordValid?: boolean;

  // 验证码模式
  code?: string;
  onCodeChange?: (code: string) => void;
  codeValid?: boolean;

  // 自动聚焦
  autoFocus?: boolean;

  // 样式
  style?: StyleProp<ViewStyle>;
}
// #endregion

// #region 4. Constants & Config
const COLORS = {
  TEXT_PRIMARY: '#1F2937',   // 标题颜色
  TEXT_SECONDARY: '#6B7280', // 副标题颜色
};

const CONFIG = {
  ANIMATION_DURATION: 300,   // 动画时长（毫秒）
  TITLE_SPACING: 16,         // 标题间距
} as const;
// #endregion

// #region 5. Utils & Helpers
/**
 * 获取动态标题
 */
const getTitle = (loginMode: 'password' | 'code'): string => {
  return loginMode === 'password' ? '密码登录' : '验证码登录';
};

/**
 * 获取动态副标题
 */
const getSubtitle = (loginMode: 'password' | 'code'): string => {
  return loginMode === 'password' 
    ? '请输入您的登录密码' 
    : '请输入收到的验证码';
};
// #endregion

// #region 6. State Management
/**
 * 动画管理Hook
 */
const useAuthInputAnimation = (loginMode: 'password' | 'code') => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const previousMode = useRef(loginMode);
  
  useEffect(() => {
    if (previousMode.current !== loginMode) {
      // 淡出 → 淡入动画
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: CONFIG.ANIMATION_DURATION / 2,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: CONFIG.ANIMATION_DURATION / 2,
          useNativeDriver: true,
        }),
      ]).start();
      
      previousMode.current = loginMode;
    }
  }, [loginMode, fadeAnim]);
  
  return fadeAnim;
};
// #endregion

// #region 7. Domain Logic
// 业务逻辑在父组件处理
// #endregion

// #region 8. UI Components & Rendering

/**
 * TitleArea - 标题区域
 */
const TitleArea: React.FC<{
  title: string;
  subtitle: string;
}> = ({ title, subtitle }) => {
  return (
    <View style={styles.titleContainer}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

/**
 * AuthInputArea 主组件
 * 
 * 整合所有输入组件，实现模式切换
 */
const AuthInputArea: React.FC<AuthInputAreaProps> = ({
  loginMode,
  phoneNumber,
  onPhoneNumberChange,
  countryCode,
  onCountryCodePress,
  phoneValid,
  password = '',
  onPasswordChange,
  passwordValid,
  code = '',
  onCodeChange,
  codeValid,
  autoFocus = false,
  style,
}) => {
  const fadeAnim = useAuthInputAnimation(loginMode);
  
  // 动态标题
  const title = getTitle(loginMode);
  const subtitle = getSubtitle(loginMode);
  
  return (
    <View style={[styles.container, style]}>
      {/* 手机号输入（两种模式共用） - 按照UI设计图，不显示标题 */}
      <PhoneInputArea
        phoneNumber={phoneNumber}
        onPhoneNumberChange={onPhoneNumberChange}
        countryCode={countryCode}
        onCountryCodePress={onCountryCodePress}
        phoneValid={phoneValid}
        autoFocus={autoFocus}
        style={styles.phoneInput}
      />
      
      {/* 动画容器 - 密码/验证码输入切换 */}
      <Animated.View style={[styles.authInputContainer, { opacity: fadeAnim }]}>
        {loginMode === 'password' ? (
          // 密码模式
          <PasswordInputArea
            password={password}
            onPasswordChange={onPasswordChange || (() => {})}
            passwordValid={passwordValid}
            hintText="请输入6-20位密码"
            maxLength={20}
          />
        ) : (
          // 验证码模式
          <CodeInputArea
            code={code}
            onCodeChange={onCodeChange || (() => {})}
            codeValid={codeValid}
            digitCount={6}
            showValidation={true}
          />
        )}
      </Animated.View>
    </View>
  );
};
// #endregion

// #region 9. Exports
export default React.memo(AuthInputArea);

export type { AuthInputAreaProps };

    export { getSubtitle, getTitle, useAuthInputAnimation };
// #endregion

// Styles
const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 16,
  },
  
  // 标题区域
  titleContainer: {
    gap: 4,
  },
  
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  
  subtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  
  // 手机号输入
  phoneInput: {
    marginTop: 0,
  },
  
  // 认证输入容器（密码或验证码）
  authInputContainer: {
    marginTop: 0,
  },
});
