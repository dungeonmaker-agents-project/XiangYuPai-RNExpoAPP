/**
 * ForgotPasswordPage - 忘记密码页面
 * 
 * 功能描述：
 * - 用户输入手机号获取验证码
 * - 输入验证码验证身份
 * - 设置新密码完成重置
 * 
 * 流程：
 * 1. 输入手机号 -> 获取验证码
 * 2. 输入验证码 -> 验证身份
 * 3. 输入新密码 -> 完成重置
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import CodeInputArea from '../LoginMainPage/CodeInputArea';
import { useCountdown } from '../LoginMainPage/useLoginMainPage';
import { AuthSafeArea } from '../SharedComponents/Layout/AuthSafeArea';

// #region 类型定义

type ResetStep = 'phone' | 'verify' | 'password';

interface ForgotPasswordFormData {
  phoneNumber: string;
  countryCode: string;
  verificationCode: string;
  newPassword: string;
  confirmPassword: string;
}

// #endregion

// #region 常量配置

const COLORS = {
  BACKGROUND: '#FFFFFF',
  PRIMARY: '#9C27B0',
  PRIMARY_LIGHT: '#E1BEE7',
  TEXT_PRIMARY: '#000000',
  TEXT_SECONDARY: '#666666',
  TEXT_HINT: '#999999',
  BORDER: '#E0E0E0',
  ERROR: '#F44336',
} as const;

const CONFIG = {
  PHONE_LENGTH: 11,
  CODE_LENGTH: 6,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 20,
  COUNTDOWN_SECONDS: 60,
} as const;

// #endregion

// #region 主组件

const ForgotPasswordPage: React.FC = () => {
  const router = useRouter();
  
  // 表单状态
  const [currentStep, setCurrentStep] = useState<ResetStep>('phone');
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    phoneNumber: '',
    countryCode: '+86',
    verificationCode: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // UI状态
  const [loading, setLoading] = useState({
    sendCode: false,
    verify: false,
    reset: false,
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  
  // 倒计时
  const { countdown, isCountingDown, startCountdown } = useCountdown();
  
  // ============ 验证函数 ============
  
  const isPhoneValid = useCallback(() => {
    return formData.phoneNumber.length === CONFIG.PHONE_LENGTH;
  }, [formData.phoneNumber]);
  
  const isCodeValid = useCallback(() => {
    return formData.verificationCode.length === CONFIG.CODE_LENGTH;
  }, [formData.verificationCode]);
  
  const isPasswordValid = useCallback(() => {
    return (
      formData.newPassword.length >= CONFIG.PASSWORD_MIN_LENGTH &&
      formData.newPassword.length <= CONFIG.PASSWORD_MAX_LENGTH
    );
  }, [formData.newPassword]);
  
  const isPasswordMatched = useCallback(() => {
    return (
      formData.newPassword === formData.confirmPassword &&
      formData.confirmPassword.length > 0
    );
  }, [formData.newPassword, formData.confirmPassword]);
  
  // ============ 事件处理 ============
  
  /**
   * 返回上一步
   */
  const handleGoBack = useCallback(() => {
    if (currentStep === 'phone') {
      router.back();
    } else if (currentStep === 'verify') {
      setCurrentStep('phone');
    } else {
      setCurrentStep('verify');
    }
  }, [currentStep, router]);
  
  /**
   * 发送验证码
   */
  const handleSendCode = useCallback(async () => {
    if (!isPhoneValid() || isCountingDown) return;
    
    try {
      setLoading(prev => ({ ...prev, sendCode: true }));
      
      // ========== ⚠️ 使用假数据模拟发送验证码 ==========
      console.log('[ForgotPasswordPage] 📱 模拟发送重置密码验证码');
      console.log(`   手机号: ${formData.phoneNumber}`);
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('   ✅ 验证码发送成功（模拟）');
      console.log('   💡 提示: 任何6位数字都可以验证');
      // =========================================
      
      // 移除弹窗提示，直接进入下一步
      startCountdown();
      setCurrentStep('verify');
    } catch (error: any) {
      console.error('发送失败', error.message || '验证码发送失败，请稍后重试');
    } finally {
      setLoading(prev => ({ ...prev, sendCode: false }));
    }
  }, [isPhoneValid, isCountingDown, formData.phoneNumber, startCountdown]);
  
  /**
   * 验证验证码（自动验证，无需按钮）
   */
  const handleVerifyCode = useCallback(async () => {
    if (!isCodeValid()) return;
    
    try {
      setLoading(prev => ({ ...prev, verify: true }));
      
      // ========== ⚠️ 使用假数据模拟验证 ==========
      console.log('[ForgotPasswordPage] 🔍 模拟验证验证码');
      console.log(`   验证码: ${formData.verificationCode}`);
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('   ✅ 验证码验证成功（模拟）');
      console.log('   💡 提示: 任何6位数字验证码都可以通过验证');
      // =========================================
      
      // 验证成功，进入密码设置步骤
      setCurrentStep('password');

    } catch (error: any) {
      console.error('验证失败:', error.message || '验证码错误，请重新输入');
    } finally {
      setLoading(prev => ({ ...prev, verify: false }));
    }
  }, [isCodeValid, formData.verificationCode]);
  
  /**
   * 重置密码
   */
  const handleResetPassword = useCallback(async () => {
    if (!isPasswordValid() || !isPasswordMatched()) {
      Alert.alert('提示', '请输入有效的密码且确保两次输入一�?');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, reset: true }));
      
      // ========== ⚠️ 使用假数据模拟重置密码 ==========
      console.log('[ForgotPasswordPage] 🔐 模拟重置密码');
      console.log(`   手机号: ${formData.phoneNumber}`);
      console.log(`   新密码长度: ${formData.newPassword.length}`);
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('   ✅ 密码重置成功（模拟）');
      // =========================================
      
      Alert.alert(
        '重置成功',
        '密码已重置，请使用新密码登录',
        [
          {
            text: '确定',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('重置失败', error.message || '密码重置失败，请稍后重试');
    } finally {
      setLoading(prev => ({ ...prev, reset: false }));
    }
  }, [
    isPasswordValid,
    isPasswordMatched,
    formData.phoneNumber,
    formData.newPassword,
    router,
  ]);
  
  // ============ 渲染函数 ============
  
  /**
   * 渲染手机号输入步骤
   */
  const renderPhoneStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>忘记密码</Text>
      
      {/* 手机号输入 */}
      <View style={styles.inputContainer}>
        <View style={styles.phoneInputWrapper}>
          <TouchableOpacity style={styles.countryCodeButton} disabled>
            <Text style={styles.countryCodeText}>{formData.countryCode}</Text>
          </TouchableOpacity>
          
          <View style={styles.phoneInputDivider} />
          
          <TextInput
            style={styles.phoneInput}
            placeholder="请输入手机号"
            placeholderTextColor={COLORS.TEXT_HINT}
            value={formData.phoneNumber}
            onChangeText={(text) =>
              setFormData(prev => ({ ...prev, phoneNumber: text.replace(/\D/g, '') }))
            }
            keyboardType="phone-pad"
            maxLength={CONFIG.PHONE_LENGTH}
            autoFocus
          />
        </View>
      </View>
      
      {/* 获取验证码按钮 */}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          (!isPhoneValid() || isCountingDown) && styles.buttonDisabled,
        ]}
        onPress={handleSendCode}
        disabled={!isPhoneValid() || isCountingDown || loading.sendCode}
        activeOpacity={0.8}
      >
        {loading.sendCode ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>
            {isCountingDown ? `${countdown}秒后重新获取` : '获取短信验证码'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
  
  /**
   * 渲染验证码输入步骤
   */
  const renderVerifyStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>忘记密码</Text>
      <Text style={styles.subtitle}>
        验证码已发送至 {formData.countryCode} {formData.phoneNumber}
      </Text>
      
      {/* 验证码输入 - 使用登录页面的样式 */}
      <View style={styles.codeInputContainer}>
        <CodeInputArea
          code={formData.verificationCode}
          onCodeChange={(code) => {
            setFormData(prev => ({ ...prev, verificationCode: code }));
          }}
          codeValid={isCodeValid()}
          digitCount={CONFIG.CODE_LENGTH}
          showValidation={false}
        />
      </View>
      
      {/* 确认验证码按钮 */}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          !isCodeValid() && styles.buttonDisabled,
        ]}
        onPress={handleVerifyCode}
        disabled={!isCodeValid() || loading.verify}
        activeOpacity={0.8}
      >
        {loading.verify ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>确认</Text>
        )}
      </TouchableOpacity>
      
      {/* 重新获取验证码按钮 */}
      <TouchableOpacity
        style={[
          styles.resendButton,
          (isCountingDown || loading.sendCode) && styles.buttonDisabled,
        ]}
        onPress={handleSendCode}
        disabled={isCountingDown || loading.sendCode}
        activeOpacity={0.8}
      >
        <Text style={[
          styles.resendButtonText,
          (isCountingDown || loading.sendCode) && styles.textDisabled,
        ]}>
          {isCountingDown ? `${countdown}秒后重新获取` : '重新获取验证码'}
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  /**
   * 渲染密码设置步骤
   */
  const renderPasswordStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>设置新密码</Text>
      <Text style={styles.subtitle}>密码长度为 6-20 位字符</Text>
      
      {/* 新密码输入 */}
      <View style={styles.inputContainer}>
        <View style={styles.passwordInputWrapper}>
          <TextInput
            style={styles.passwordInput}
            placeholder="请输入新密码"
            placeholderTextColor={COLORS.TEXT_HINT}
            value={formData.newPassword}
            onChangeText={(text) =>
              setFormData(prev => ({ ...prev, newPassword: text }))
            }
            secureTextEntry={!passwordVisible}
            maxLength={CONFIG.PASSWORD_MAX_LENGTH}
            autoFocus
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setPasswordVisible(!passwordVisible)}
            activeOpacity={0.6}
          >
            <Ionicons
              name={passwordVisible ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color={COLORS.TEXT_HINT}
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 确认密码输入 */}
      <View style={styles.inputContainer}>
        <View style={styles.passwordInputWrapper}>
          <TextInput
            style={styles.passwordInput}
            placeholder="请再次输入新密码"
            placeholderTextColor={COLORS.TEXT_HINT}
            value={formData.confirmPassword}
            onChangeText={(text) =>
              setFormData(prev => ({ ...prev, confirmPassword: text }))
            }
            secureTextEntry={!confirmPasswordVisible}
            maxLength={CONFIG.PASSWORD_MAX_LENGTH}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            activeOpacity={0.6}
          >
            <Ionicons
              name={confirmPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color={COLORS.TEXT_HINT}
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 密码匹配提示 */}
      {formData.confirmPassword.length > 0 && !isPasswordMatched() && (
        <Text style={styles.errorText}>两次输入的密码不一致</Text>
      )}
      
      {/* 完成按钮 */}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          (!isPasswordValid() || !isPasswordMatched()) && styles.buttonDisabled,
        ]}
        onPress={handleResetPassword}
        disabled={!isPasswordValid() || !isPasswordMatched() || loading.reset}
        activeOpacity={0.8}
      >
        {loading.reset ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>完成</Text>
        )}
      </TouchableOpacity>
    </View>
  );
  
  return (
    <AuthSafeArea>
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 顶部导航栏 */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
            activeOpacity={0.6}
          >
            <Ionicons name="chevron-back" size={28} color={COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 根据当前步骤渲染不同内容 */}
          {currentStep === 'phone' && renderPhoneStep()}
          {currentStep === 'verify' && renderVerifyStep()}
          {currentStep === 'password' && renderPasswordStep()}
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthSafeArea>
  );
};

// #endregion

// #region 样式

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  
  stepContainer: {
    flex: 1,
  },
  
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 40,
  },
  
  inputContainer: {
    marginBottom: 20,
  },
  
  // 验证码输入容器
  codeInputContainer: {
    marginBottom: 20,
    marginTop: 20,
  },
  
  // 手机号输入
  phoneInputWrapper: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  
  countryCodeButton: {
    paddingRight: 12,
  },
  
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  
  phoneInputDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.BORDER,
    marginRight: 12,
  },
  
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  
  // 通用文本输入
  textInput: {
    height: 56,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  
  // 密码输入
  passwordInputWrapper: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  
  eyeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  
  // 主按�?
  primaryButton: {
    height: 50,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  buttonDisabled: {
    opacity: 0.5,
  },
  
  // 发送验证码按钮（用于验证码步骤）
  sendCodeButton: {
    height: 50,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  
  sendCodeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // 重新发送按钮
  resendButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 20,
  },
  
  resendButtonText: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },
  
  textDisabled: {
    color: COLORS.TEXT_HINT,
  },
  
  // 错误提示
  errorText: {
    fontSize: 12,
    color: COLORS.ERROR,
    marginTop: -12,
    marginBottom: 12,
  },
});

// #endregion

export default ForgotPasswordPage;

