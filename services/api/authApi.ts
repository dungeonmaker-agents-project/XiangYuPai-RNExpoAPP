/**
 * Auth API - 统一认证API服务
 *
 * 🎯 对接后端: xypai-auth模块
 * 📋 文档: xypai-auth/接口对接文档.md
 * 🔐 认证框架: Sa-Token + JWT
 *
 * 接口清单（所有接口带 /api 前缀）：
 * - ✅ 密码登录 (POST /xypai-auth/api/auth/login/password)
 * - ✅ SMS登录 (POST /xypai-auth/api/auth/login/sms) - 支持自动注册
 * - ✅ 刷新令牌 (POST /xypai-auth/api/auth/token/refresh)
 * - ✅ 用户登出 (POST /xypai-auth/api/auth/logout)
 * - ✅ 发送短信 (POST /xypai-auth/api/auth/sms/send)
 * - ✅ 验证重置密码验证码 (POST /xypai-auth/api/auth/password/reset/verify)
 * - ✅ 重置密码 (POST /xypai-auth/api/auth/password/reset/confirm)
 *
 * @updated 2025-11-26 - 更新所有接口路径为 /api/auth/... 格式
 */

import type { ApiResponse } from './client';
import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// ===== 后端接口类型定义（完全匹配APP认证.md）=====

/**
 * 密码登录请求 (LoginDTO)
 * 
 * 对应后端: LoginDTO
 * 接口: POST /xypai-auth/api/v1/auth/login
 */
export interface PasswordLoginRequest {
  username: string;           // 用户名（必填）
  password: string;           // 密码（必填）
  clientType?: 'web' | 'app' | 'mini';  // 客户端类型
  deviceId?: string;          // 设备ID
  rememberMe?: boolean;       // 是否记住登录
}

/**
 * 短信登录请求 (SmsLoginDTO)
 * 
 * 对应后端: SmsLoginDTO
 * 接口: POST /xypai-auth/api/v1/auth/login/sms
 */
export interface SmsLoginRequest {
  mobile: string;             // 手机号（必填）
  smsCode: string;            // 短信验证码（必填）
  clientType?: 'web' | 'app' | 'mini';  // 客户端类型
  deviceId?: string;          // 设备ID
  rememberMe?: boolean;       // 是否记住登录
}

/**
 * 用户信息 (UserInfo)
 * 
 * 对应后端: UserInfo
 */
export interface UserInfo {
  id: number;                 // 用户ID
  username: string;           // 用户名
  nickname: string;           // 昵称
  avatar?: string;            // 头像URL
  mobile?: string;            // 手机号（脱敏）
  status: number;             // 用户状态
  roles?: string[];           // 角色列表
  permissions?: string[];     // 权限列表
  lastLoginTime?: string;     // 最后登录时间
}

/**
 * 登录结果 (LoginResultVO)
 * 
 * 对应后端: LoginResultVO
 */
export interface LoginResultVO {
  accessToken: string;        // 访问令牌
  refreshToken: string;       // 刷新令牌
  tokenType: string;          // 令牌类型 (Bearer)
  expiresIn: number;          // 过期时间（秒）
  userInfo: UserInfo;         // 用户信息
}

/**
 * 发送短信验证码请求 (SmsCodeDTO)
 * 
 * 对应后端: SmsCodeDTO
 * 接口: POST /xypai-auth/api/v1/auth/sms/send
 */
export interface SendSmsRequest {
  mobile: string;                         // 手机号（必填）
  type: 'login' | 'register' | 'reset';   // 验证码类型（必填）
  clientType?: string;                    // 客户端类型
}

/**
 * 统一响应格式 (R)
 */
export interface RResponse<T> {
  code: number;               // 消息状态码
  msg: string;                // 消息内容
  data: T;                    // 数据对象
}

// ===== Auth API类 =====

class AuthAPI {
  /**
   * 🔐 密码登录
   * 
   * 接口: POST /xypai-auth/api/v1/auth/login
   * 参数: LoginDTO
   * 返回: R<LoginResultVO>
   * 
   * @example
   * const response = await authApi.loginWithPassword({
   *   username: 'alice_dev',
   *   password: '123456',
   *   clientType: 'app',
   *   deviceId: 'device_12345',
   *   rememberMe: false
   * });
   */
  async loginWithPassword(request: PasswordLoginRequest): Promise<ApiResponse<LoginResultVO>> {
    console.log('🔐 [AuthAPI] 密码登录请求', {
      username: request.username,
      clientType: request.clientType || 'app',
      deviceId: request.deviceId,
    });

    try {
      // ✅ client.ts会自动转换后端的RResponse<T>为ApiResponse<T>
      // 所以这里泛型直接用LoginResultVO即可
      // 🔧 使用短超时且禁用重试 - 登录应该快速失败，避免卡死
      const response = await apiClient.post<LoginResultVO>(
        '/xypai-auth/api/v1/auth/login',
        {
          username: request.username,
          password: request.password,
          clientType: request.clientType || 'app',
          deviceId: request.deviceId || `device_${Date.now()}`,
          rememberMe: request.rememberMe || false,
        },
        {
          timeout: 5000,   // 🔧 5秒超时 - 快速失败
          retry: false,    // 🔧 禁用重试 - 避免长时间卡死
        }
      );

      // ✅ client.ts已经做了转换，response就是ApiResponse<LoginResultVO>格式
      // 直接返回，不需要二次转换！
      if (response.success && response.data?.accessToken) {
        apiClient.setAuthToken(response.data.accessToken);
        console.log('✅ [AuthAPI] 登录成功，已自动设置token');
      }

      return response;
    } catch (error: any) {
      console.error('❌ [AuthAPI] 密码登录失败');
      console.error('   错误类型:', error?.name || 'Unknown');
      console.error('   错误信息:', error?.message || error);
      console.error('   响应状态:', error?.response?.status);
      console.error('   响应数据:', error?.response?.data);
      console.error('   完整错误:', JSON.stringify(error, null, 2));
      
      // 🔧 改善错误消息
      if (error?.type === 'NETWORK_ERROR' || error?.type === 'TIMEOUT_ERROR') {
        throw new Error('网络连接失败，请检查网络后重试');
      }
      throw error;
    }
  }

  /**
   * 📱 短信验证码登录
   * 
   * 接口: POST /xypai-auth/api/v1/auth/login/sms
   * 参数: SmsLoginDTO
   * 返回: R<LoginResultVO>
   * 
   * @example
   * const response = await authApi.loginWithSms({
   *   mobile: '13800138001',
   *   smsCode: '123456',
   *   clientType: 'app',
   *   deviceId: 'device_12345'
   * });
   */
  async loginWithSms(request: SmsLoginRequest): Promise<ApiResponse<LoginResultVO>> {
    console.log('📱 [AuthAPI] 短信登录请求', {
      mobile: request.mobile,
      clientType: request.clientType || 'app',
    });

    try {
      // 🔧 使用短超时且禁用重试 - 登录应该快速失败，避免卡死
      const response = await apiClient.post<LoginResultVO>(
        '/xypai-auth/api/v1/auth/login/sms',
        {
          mobile: request.mobile,
          smsCode: request.smsCode,
          clientType: request.clientType || 'app',
          deviceId: request.deviceId || `device_${Date.now()}`,
          rememberMe: request.rememberMe || false,
        },
        {
          timeout: 5000,   // 🔧 5秒超时 - 快速失败
          retry: false,    // 🔧 禁用重试 - 避免长时间卡死
        }
      );

      // ✅ client.ts已经转换，直接使用response
      if (response.success && response.data?.accessToken) {
        apiClient.setAuthToken(response.data.accessToken);
        console.log('✅ [AuthAPI] 短信登录成功，已自动设置token');
      }

      return response;
    } catch (error: any) {
      console.error('❌ [AuthAPI] 短信登录失败:', error);
      
      // 🔧 改善错误消息
      if (error?.type === 'NETWORK_ERROR' || error?.type === 'TIMEOUT_ERROR') {
        throw new Error('网络连接失败，请检查网络后重试');
      }
      throw error;
    }
  }

  /**
   * 🔄 刷新令牌
   * 
   * 接口: POST /xypai-auth/api/v1/auth/refresh
   * 参数: refreshToken (query)
   * 返回: R<LoginResultVO>
   * 
   * @example
   * const response = await authApi.refreshToken('eyJhbGciOiJIUzI1NiI...');
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<LoginResultVO>> {
    console.log('🔄 [AuthAPI] 刷新Token请求');

    try {
      const queryParams = buildQueryParams({ refreshToken });
      
      const response = await apiClient.post<LoginResultVO>(
        `/xypai-auth/api/v1/auth/refresh?${queryParams}`,
        {},
        { retry: false }  // 刷新token失败不重试
      );

      // ✅ client.ts已经转换，直接使用response
      if (response.success && response.data?.accessToken) {
        apiClient.setAuthToken(response.data.accessToken);
        console.log('✅ [AuthAPI] Token刷新成功');
      }

      return response;
    } catch (error) {
      console.error('❌ [AuthAPI] Token刷新失败:', error);
      throw error;
    }
  }

  /**
   * 🚪 用户登出
   * 
   * 接口: POST /xypai-auth/api/v1/auth/logout
   * 请求头: Authorization: Bearer {token}
   * 返回: R<Void>
   * 
   * @example
   * await authApi.logout();
   */
  async logout(): Promise<ApiResponse<void>> {
    console.log('🚪 [AuthAPI] 登出请求');

    try {
      const response = await apiClient.post<void>(
        '/xypai-auth/api/v1/auth/logout',
        {}
      );

      // ✅ client.ts已经转换，直接使用response
      if (response.success) {
        apiClient.clearAuthToken();
        console.log('✅ [AuthAPI] 登出成功，已清除token');
      }

      return response;
    } catch (error) {
      console.error('❌ [AuthAPI] 登出失败:', error);
      // 即使登出失败也清除本地token
      apiClient.clearAuthToken();
      throw error;
    }
  }

  /**
   * 📤 发送短信验证码
   * 
   * 接口: POST /xypai-auth/api/v1/auth/sms/send
   * 参数: SmsCodeDTO
   * 返回: R<String>
   * 
   * @example
   * const response = await authApi.sendSmsCode({
   *   mobile: '13800138001',
   *   type: 'login',
   *   clientType: 'app'
   * });
   */
  async sendSmsCode(request: SendSmsRequest): Promise<ApiResponse<string>> {
    console.log('📤 [AuthAPI] 发送验证码', {
      mobile: request.mobile,
      type: request.type,
    });

    try {
      // 🔧 使用短超时且禁用重试 - 发送验证码应该快速失败
      const response = await apiClient.post<string>(
        '/xypai-auth/api/v1/auth/sms/send',
        {
          mobile: request.mobile,
          type: request.type,
          clientType: request.clientType || 'app',
        },
        {
          timeout: 5000,   // 🔧 5秒超时
          retry: false,    // 🔧 禁用重试 - 用户可以手动重试
        }
      );

      // ✅ client.ts已经转换，直接使用response
      if (response.success) {
        console.log('✅ [AuthAPI] 验证码发送成功');
      }

      return response;
    } catch (error: any) {
      console.error('❌ [AuthAPI] 验证码发送失败:', error);
      
      // 🔧 改善错误消息
      if (error?.type === 'NETWORK_ERROR' || error?.type === 'TIMEOUT_ERROR') {
        throw new Error('网络连接失败，请检查网络后重试');
      }
      throw error;
    }
  }

  /**
   * ✅ 验证短信验证码
   * 
   * 接口: POST /xypai-auth/api/v1/auth/sms/verify
   * 参数: mobile (query), code (query)
   * 返回: R<Boolean>
   * 
   * @example
   * const response = await authApi.verifySmsCode('13800138001', '123456');
   */
  async verifySmsCode(mobile: string, code: string): Promise<ApiResponse<boolean>> {
    console.log('✅ [AuthAPI] 验证验证码');

    try {
      const queryParams = buildQueryParams({ mobile, code });
      
      const response = await apiClient.post<boolean>(
        `/xypai-auth/api/v1/auth/sms/verify?${queryParams}`,
        {}
      );

      // ✅ client.ts已经转换，直接使用response
      return response;
    } catch (error) {
      console.error('❌ [AuthAPI] 验证码验证失败:', error);
      throw error;
    }
  }

  /**
   * 🔍 验证令牌有效性
   * 
   * 接口: GET /xypai-auth/api/v1/auth/verify
   * 参数: accessToken (query)
   * 返回: R<Map<String, Object>>
   * 
   * @example
   * const response = await authApi.verifyToken('eyJhbGciOiJIUzI1NiI...');
   */
  async verifyToken(accessToken: string): Promise<ApiResponse<Record<string, any>>> {
    console.log('🔍 [AuthAPI] 验证Token');

    try {
      const queryParams = buildQueryParams({ accessToken });
      
      const response = await apiClient.get<Record<string, any>>(
        `/xypai-auth/api/v1/auth/verify?${queryParams}`
      );

      // ✅ client.ts已经转换，直接使用response
      return response;
    } catch (error) {
      console.error('❌ [AuthAPI] Token验证失败:', error);
      throw error;
    }
  }

  /**
   * 💓 心跳保活
   * 
   * 接口: POST /xypai-auth/api/v1/auth/heartbeat
   * 说明: 更新会话活跃时间，延长会话有效期
   * 返回: R<Map<String, Object>>
   * 
   * @example
   * await authApi.heartbeat();
   */
  async heartbeat(): Promise<ApiResponse<Record<string, any>>> {
    console.log('💓 [AuthAPI] 心跳保活');

    try {
      const response = await apiClient.post<Record<string, any>>(
        '/xypai-auth/api/v1/auth/heartbeat',
        {}
      );

      // ✅ client.ts已经转换，直接使用response
      return response;
    } catch (error) {
      console.error('❌ [AuthAPI] 心跳保活失败:', error);
      throw error;
    }
  }

  /**
   * 🏥 健康检查
   * 
   * 接口: GET /xypai-auth/api/v1/auth/health
   * 说明: 检查认证服务状态
   * 返回: R<Map<String, Object>>
   */
  async healthCheck(): Promise<ApiResponse<Record<string, any>>> {
    try {
      const response = await apiClient.get<RResponse<Record<string, any>>>(
        '/xypai-auth/api/v1/auth/health'
      );

      return {
        data: response.data.data,
        code: response.data.code,
        message: response.data.msg,
        timestamp: Date.now(),
        success: response.data.code === 0,
      };
    } catch (error) {
      console.error('❌ [AuthAPI] 健康检查失败:', error);
      throw error;
    }
  }

  /**
   * 🔒 检查Token有效性（简化版）
   * 
   * 说明: 通过调用后端heartbeat接口检查token是否有效
   * 
   * @returns true=有效, false=无效
   */
  async checkTokenValidity(): Promise<boolean> {
    try {
      // 使用心跳接口检查token有效性（需要token认证）
      const response = await this.heartbeat();
      return response.success;
    } catch (error) {
      console.warn('⚠️ [AuthAPI] Token验证失败:', error);
      return false;
    }
  }
}

// 创建并导出实例
export const authApi = new AuthAPI();

// 默认导出
export default authApi;
