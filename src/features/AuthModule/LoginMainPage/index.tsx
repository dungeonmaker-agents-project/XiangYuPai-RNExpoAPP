// #region 1. File Banner & TOC
/**
 * LoginMainPage - 登录模块主页面（重构版）
 * 
 * 功能描述：
 * - 整合所有子组件构建完整登录页面
 * - 支持密码登录和验证码登录模式切换
 * - 集成真实后端API
 * - 完整的表单验证和错误处理
 * - 地区选择功能
 * - Flutter样式完全复刻
 * 
 * TOC (快速跳转):
 * [1] File Banner & TOC
 * [2] Imports
 * [3] Types & Schema  
 * [4] Constants & Config
 * [5] State Management
 * [6] Domain Logic
 * [7] UI Components & Rendering
 * [8] Exports
 */
// #endregion

// #region 2. Imports
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// 🆕 子组件导入（扁平化结构）
import ActionButtonArea from './ActionButtonArea';
import AgreementArea from './AgreementArea';
import AuthInputArea from './AuthInputArea';
import AuxiliaryArea from './AuxiliaryArea';
import type { Country } from './RegionSelectModal';
import RegionSelectModal from './RegionSelectModal';
import TopWelcomeArea from './TopWelcomeArea';

// Shared components
import { AuthSafeArea } from '../SharedComponents/Layout/AuthSafeArea';

// Store imports
import { useAuthStore } from '../stores/authStore';

// ========== 🚫 注释掉真实后端API ==========
// import { authApi as backendAuthApi } from '../../../../services/api/authApi';
// =========================================

// 🆕 凭证存储
import {
    clearCredentials,
    getSavedCredentials,
    saveCredentials
} from '../utils/credentialStorage';

// 🔧 状态管理 Hooks
import {
    useCountdown,
    useFormValidation
} from './useLoginMainPage';

// 🆕 测试账号提示
import { printTestAccounts } from '../config/printTestAccounts';
// #endregion

// #region 3. Types & Schema
type LoginMode = 'password' | 'code';

interface LoginFormData {
  phoneNumber: string;
  countryCode: string;
  password: string;
  verificationCode: string;
}

interface LoginMainPageProps {
  // 可选的初始模式
  initialMode?: LoginMode;
}
// #endregion

// #region 4. Constants & Config
const COLORS = {
  BACKGROUND: '#FFFFFF',
} as const;

const CONFIG = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 20,
  PHONE_LENGTH: 11,
  CODE_LENGTH: 6,
  COUNTDOWN_SECONDS: 60,
} as const;
// #endregion

// #region 5. Domain Logic
/**
 * LoginMainPage 主组件
 */
const LoginMainPage: React.FC<LoginMainPageProps> = ({
  initialMode = 'code',
}) => {
  const router = useRouter();
  const { login } = useAuthStore();
  
  // 表单状态
  const [loginMode, setLoginMode] = useState<LoginMode>(initialMode);
  const [formData, setFormData] = useState<LoginFormData>({
    phoneNumber: '',
    countryCode: '+86',
    password: '',
    verificationCode: '',
  });
  
  // UI状态
  const [loading, setLoading] = useState({
    login: false,
    sendCode: false,
  });
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [regionModalVisible, setRegionModalVisible] = useState(false);
  
  // 🆕 取消登录控制器
  const loginAbortControllerRef = React.useRef<{ cancelled: boolean }>({ cancelled: false });
  
  // 🆕 保存的凭证状态（用于快速登录）
  const [savedCredentials, setSavedCredentials] = useState<{
    phoneNumber: string;
    password: string;
    countryCode: string;
    loginMode: 'password' | 'code';
  } | null>(null);
  
  // 倒计时
  const { countdown, isCountingDown, startCountdown } = useCountdown();
  
  // 表单验证
  const validation = useFormValidation(formData, loginMode);
  
  // ============ 初始化 - 加载保存的凭证（仅用于快速登录） ============
  useEffect(() => {
    // 🆕 打印测试账号信息到控制台
    printTestAccounts();
    
    const loadSavedCredentials = async () => {
      try {
        console.log('[LoginMainPage] 🔍 Loading saved credentials...');
        const saved = await getSavedCredentials();
        
        if (saved) {
          console.log('[LoginMainPage] ✅ Found saved credentials');
          console.log('   Phone:', saved.phoneNumber);
          console.log('   Country Code:', saved.countryCode);
          console.log('   Login Mode:', saved.loginMode);
          
          // 🔒 安全策略：不自动填充密码到表单
          // 只保存在内存中，用于"快速登录"按钮
          setSavedCredentials(saved);
          
          // 只自动填充手机号（可见信息）
          setFormData(prev => ({
            ...prev,
            phoneNumber: saved.phoneNumber,
            countryCode: saved.countryCode,
          }));
          
          // 恢复登录模式
          if (saved.loginMode) {
            setLoginMode(saved.loginMode);
          }
          
          console.log('[LoginMainPage] 🔒 Password kept secure in memory for quick login');
        } else {
          console.log('[LoginMainPage] ℹ️  No saved credentials found');
        }
      } catch (error) {
        console.error('[LoginMainPage] ❌ Failed to load credentials:', error);
      }
    };
    
    loadSavedCredentials();
  }, []); // 只在组件挂载时执行一次
  
  // ============ 事件处理 ============
  
  /**
   * 切换登录模式
   */
  const handleSwitchMode = useCallback(() => {
    setLoginMode(prev => prev === 'password' ? 'code' : 'password');
  }, []);
  
  /**
   * 打开地区选择器
   */
  const handleOpenRegionSelector = useCallback(() => {
    setRegionModalVisible(true);
  }, []);
  
  /**
   * 选择地区
   */
  const handleSelectRegion = useCallback((country: Country) => {
    setFormData(prev => ({
      ...prev,
      countryCode: country.code,
    }));
  }, []);
  
  /**
   * 发送验证码（使用假数据）
   */
  const handleSendCode = useCallback(async () => {
    if (validation.sendCodeDisabled || isCountingDown) return;
    
    try {
      setLoading(prev => ({ ...prev, sendCode: true }));
      
      // ========== 🚫 注释掉真实API调用 ==========
      // await backendAuthApi.sendSmsCode({
      //   mobile: formData.phoneNumber,
      //   type: 'login',
      //   clientType: 'app',
      // });
      // =========================================
      
      // ========== ✅ 使用假数据模拟发送验证码 ==========
      console.log('[LoginMainPage] 📱 模拟发送验证码');
      console.log(`   手机号: ${formData.phoneNumber}`);
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('   ✅ 验证码发送成功（模拟）');
      // =========================================
      
      // 根据手机号给出对应的验证码提示
      let codeHint = '';
      if (formData.phoneNumber === '13800138000') {
        codeHint = '\n\n🔐 该账号的验证码是: 888888';
      } else if (formData.phoneNumber === '13800138001') {
        codeHint = '\n\n🔐 该账号的验证码是: 666666';
      } else if (formData.phoneNumber === '13800138002') {
        codeHint = '\n\n🔐 该账号的验证码是: 123456';
      } else {
        codeHint = '\n\n⚠️ 非测试账号无法登录\n请使用测试账号（138001380xx）';
      }
      
      Alert.alert('验证码已发送', `请输入验证码登录${codeHint}`);
      startCountdown();
    } catch (error: any) {
      Alert.alert('发送失败', error.message || '验证码发送失败，请稍后重试');
    } finally {
      setLoading(prev => ({ ...prev, sendCode: false }));
    }
  }, [
    validation.sendCodeDisabled,
    isCountingDown,
    formData.phoneNumber,
    startCountdown,
  ]);
  
  /**
   * 🆕 快速登录（使用保存的凭证）
   */
  const handleQuickLogin = useCallback(async () => {
    if (!savedCredentials) {
      Alert.alert('提示', '没有保存的登录信息');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, login: true }));
      
      console.log('🚀 [LoginMainPage] 快速登录开始');
      console.log('   使用保存的凭证（密码不可见）');
      console.log('   手机号:', savedCredentials.phoneNumber);
      
      // 使用保存的凭证登录（密码不显示在表单中）
      const credentials = {
        type: 'password' as const,
        phone: savedCredentials.phoneNumber,
        password: savedCredentials.password,
      };
      
      // 调用登录API
      await login(credentials);
      
      // ✅ 登录成功 - 凭证已经保存过了，无需再次保存
      console.log('[LoginMainPage] ✅ Quick login successful');
      
      // 跳转到首页
      router.replace('/(tabs)/homepage');
    } catch (error: any) {
      Alert.alert('登录失败', error.message || '快速登录失败，请重新输入密码');
      // 快速登录失败，清除保存的凭证（可能密码已修改）
      setSavedCredentials(null);
      await clearCredentials();
    } finally {
      setLoading(prev => ({ ...prev, login: false }));
    }
  }, [savedCredentials, login, router]);
  
  /**
   * 登录
   */
  const handleLogin = useCallback(async () => {
    if (validation.loginDisabled) {
      Alert.alert('提示', '请完整填写登录信息');
      return;
    }
    
    // 按照UI设计图，登陆即表明同意协议，无需勾选
    try {
      setLoading(prev => ({ ...prev, login: true }));
      
      // 构建登录参数
      const credentials = loginMode === 'password'
        ? {
            type: 'password' as const,
            phone: formData.phoneNumber,
            password: formData.password,
          }
        : {
            type: 'sms' as const,
            phone: formData.phoneNumber,
            code: formData.verificationCode,
          };
      
      // 🔍 调试日志
      console.log('🔍 [LoginMainPage] 准备登录');
      console.log('   手机号:', formData.phoneNumber);
      console.log('   密码长度:', formData.password.length);
      console.log('   登录模式:', loginMode);
      console.log('   credentials:', JSON.stringify(credentials, null, 2));
      
      // 调用真实登录API
      await login(credentials);
      
      // ✅ 登录成功 - 保存凭证（默认记住密码）
      console.log('[LoginMainPage] ✅ Login successful, saving credentials...');
      await saveCredentials({
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        countryCode: formData.countryCode,
        loginMode: loginMode,
      });
      console.log('[LoginMainPage] ✅ Credentials saved');
      
      // 登录成功，跳转到首页
      router.replace('/(tabs)/homepage');
    } catch (error: any) {
      Alert.alert('登录失败', error.message || '登录失败，请检查您的登录信息');
    } finally {
      setLoading(prev => ({ ...prev, login: false }));
    }
  }, [
    validation.loginDisabled,
    agreementAccepted,
    loginMode,
    formData,
    login,
    router,
  ]);
  
  /**
   * 忘记密码
   */
  const handleForgotPassword = useCallback(() => {
    router.push('/auth/forgot-password');
  }, [router]);
  
  /**
   * 快速注册
   */
  const handleQuickRegister = useCallback(() => {
    Alert.alert('快速注册', '注册功能开发中...');
  }, []);
  
  /**
   * 🆕 使用其他账号登录（清除保存的凭证）
   */
  const handleUseAnotherAccount = useCallback(async () => {
    console.log('[LoginMainPage] 🔄 Switching to another account');
    
    // 清除保存的凭证
    setSavedCredentials(null);
    await clearCredentials();
    
    // 清空表单
    setFormData({
      phoneNumber: '',
      countryCode: '+86',
      password: '',
      verificationCode: '',
    });
    
    console.log('[LoginMainPage] ✅ Saved credentials cleared, ready for new account');
  }, []);
  
  /**
   * 查看协议
   */
  const handleViewAgreement = useCallback((type: 'user' | 'privacy') => {
    if (type === 'user') {
      router.push('/modal/user-terms');
    } else {
      router.push('/modal/privacy-policy');
    }
  }, [router]);
  
  return (
    <AuthSafeArea>
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 顶部欢迎区域 */}
          <TopWelcomeArea style={styles.welcomeArea} />
          
          {/* 认证输入区域 - 🆕 快速登录模式下只显示手机号 */}
          {savedCredentials ? (
            // 🆕 快速登录模式：只显示手机号（只读）
            <View style={styles.quickLoginInfoArea}>
              <View style={styles.savedAccountCard}>
                <Ionicons name="person-circle-outline" size={48} color="#9C27B0" />
                <View style={styles.savedAccountInfo}>
                  <Text style={styles.savedAccountLabel}>已保存的账号</Text>
                  <Text style={styles.savedAccountPhone}>
                    {savedCredentials.countryCode} {savedCredentials.phoneNumber}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            // 正常登录模式：显示完整表单
            <AuthInputArea
              loginMode={loginMode}
              phoneNumber={formData.phoneNumber}
              onPhoneNumberChange={(phone) =>
                setFormData(prev => ({ ...prev, phoneNumber: phone }))
              }
              countryCode={formData.countryCode}
              onCountryCodePress={handleOpenRegionSelector}
              phoneValid={validation.phoneValid}
              password={formData.password}
              onPasswordChange={(password) =>
                setFormData(prev => ({ ...prev, password }))
              }
              passwordValid={validation.passwordValid}
              code={formData.verificationCode}
              onCodeChange={(code) =>
                setFormData(prev => ({ ...prev, verificationCode: code }))
              }
              codeValid={validation.codeValid}
              autoFocus={false}
              style={styles.authInputArea}
            />
          )}
          
          {/* 操作按钮区域 - 根据是否有保存的凭证显示不同UI */}
          {savedCredentials ? (
            // 🆕 快速登录模式
            <View style={styles.quickLoginContainer}>
              {/* 快速登录按钮 */}
              <TouchableOpacity
                style={[styles.quickLoginButton, loading.login && styles.buttonDisabled]}
                onPress={handleQuickLogin}
                disabled={loading.login}
                activeOpacity={0.8}
              >
                {loading.login ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="flash" size={20} color="#FFFFFF" style={styles.quickLoginIcon} />
                    <Text style={styles.quickLoginButtonText}>
                      快速登录 {savedCredentials.phoneNumber}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              
              {/* 使用其他账号登录 */}
              <TouchableOpacity
                style={styles.useAnotherAccountButton}
                onPress={handleUseAnotherAccount}
                disabled={loading.login}
                activeOpacity={0.6}
              >
                <Text style={styles.useAnotherAccountText}>使用其他账号登录</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // 正常登录模式
            <ActionButtonArea
              loginMode={loginMode}
              onLogin={handleLogin}
              onSendCode={loginMode === 'code' ? handleSendCode : undefined}
              loginDisabled={validation.loginDisabled}
              sendCodeDisabled={validation.sendCodeDisabled || isCountingDown}
              loginLoading={loading.login}
              sendCodeLoading={loading.sendCode}
              countdown={countdown}
              style={styles.actionButtonArea}
            />
          )}
          
          {/* 辅助功能区域 - 🆕 快速登录模式下不显示 */}
          {!savedCredentials && (
            <AuxiliaryArea
              onForgotPassword={handleForgotPassword}
              onRegister={handleQuickRegister}
              onSwitchLoginMode={handleSwitchMode}
              loginMode={loginMode}
              style={styles.auxiliaryArea}
            />
          )}
          
          {/* 协议区域 - 按照UI设计图，无需checkbox */}
          <AgreementArea
            agreed={true}
            onAgreementChange={() => {}}
            onViewUserAgreement={() => handleViewAgreement('user')}
            onViewPrivacyPolicy={() => handleViewAgreement('privacy')}
            style={styles.agreementArea}
          />
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* 地区选择模态框 */}
      <RegionSelectModal
        visible={regionModalVisible}
        onClose={() => setRegionModalVisible(false)}
        onSelect={handleSelectRegion}
        selectedCode={formData.countryCode}
      />
    </AuthSafeArea>
  );
};
// #endregion

// #region 8. Exports
export default LoginMainPage;

export type { LoginFormData, LoginMainPageProps, LoginMode };
// #endregion

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: COLORS.BACKGROUND,
  },
  
  welcomeArea: {
    marginTop: 0,
    marginBottom: 20,
  },
  
  authInputArea: {
    marginBottom: 18,
  },
  
  // 🆕 快速登录信息区域
  quickLoginInfoArea: {
    marginBottom: 24,
  },
  
  // 🆕 保存的账号卡片
  savedAccountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F3E5F5',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#9C27B0',
    gap: 16,
  },
  
  savedAccountInfo: {
    flex: 1,
  },
  
  savedAccountLabel: {
    fontSize: 12,
    color: '#7B1FA2',
    marginBottom: 4,
    fontWeight: '500',
  },
  
  savedAccountPhone: {
    fontSize: 18,
    color: '#4A148C',
    fontWeight: '600',
  },
  
  actionButtonArea: {
    marginBottom: 14,
  },
  
  // 🆕 快速登录容器
  quickLoginContainer: {
    marginBottom: 14,
    gap: 12,
  },
  
  // 🆕 快速登录按钮
  quickLoginButton: {
    height: 46,
    backgroundColor: '#9C27B0',
    borderRadius: 23,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  quickLoginIcon: {
    marginRight: 8,
  },
  
  quickLoginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  buttonDisabled: {
    opacity: 0.6,
  },
  
  // 🆕 使用其他账号按钮
  useAnotherAccountButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  
  useAnotherAccountText: {
    fontSize: 14,
    color: '#9C27B0',
    fontWeight: '500',
  },
  
  auxiliaryArea: {
    marginBottom: 16,
  },
  
  agreementArea: {
    marginTop: 'auto',
    paddingTop: 8,
  },
});
