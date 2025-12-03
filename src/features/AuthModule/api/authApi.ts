/**
 * Auth API - 认证相关API接口
 * 
 * 提供完整的认证API服务：
 * - 用户登录（密码/验证码）
 * - 令牌管理（刷新/验证）
 * - 用户注册和登出
 * - 错误处理和重试机制
 */

import { AxiosError, AxiosResponse } from 'axios';

// Types
import type {
    LoginRequest,
    LoginResponse,
    SendCodeRequest,
    SendCodeResponse,
    UserInfo,
} from '../LoginMainPage/types';

// Configuration
import { apiClient } from '../../../../services/api/client';

// #region 类型定义

/**
 * 刷新令牌请求
 */
interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * 刷新令牌响应
 */
interface RefreshTokenResponse {
  success: boolean;
  data: {
    token: string;
    refreshToken: string;
    expiresIn: number;
  };
  message: string;
}

/**
 * 用户存在检查请求
 */
interface CheckUserExistsRequest {
  phone: string;
  region: string;
}

/**
 * 用户存在检查响应
 */
interface CheckUserExistsResponse {
  success: boolean;
  data: {
    exists: boolean;
    verified: boolean;
  };
  message: string;
}

/**
 * 登出请求
 */
interface LogoutRequest {
  deviceId?: string;
}

/**
 * 通用API响应格式（后端标准格式）
 */
interface ApiResponse<T = any> {
  code: number;           // 200=成功，其他=失败
  message: string;        // 提示信息
  data: T | null;        // 响应数据
  msg?: string;          // 备用消息字段
  timestamp?: string;
}

// #endregion

// #region API配置

/**
 * API端点配置（与后端实际接口对应）
 *
 * Gateway路由规则：
 * - 前端请求: /xypai-auth/api/auth/xxx
 * - Gateway StripPrefix=1 后转发到后端: /api/auth/xxx
 *
 * @see ruoyi-gateway.yml 路由配置
 */
const API_ENDPOINTS = {
  // ============================================
  // 认证相关（xypai-auth服务）- 已实现 ✅
  // ============================================
  PASSWORD_LOGIN: '/xypai-auth/api/auth/login/password',        // 密码登录
  SMS_LOGIN: '/xypai-auth/api/auth/login/sms',                  // SMS验证码登录（自动注册）
  REFRESH_TOKEN: '/xypai-auth/api/auth/token/refresh',          // Token刷新
  LOGOUT: '/xypai-auth/api/auth/logout',                        // 登出

  // ============================================
  // 验证码相关（xypai-auth服务）- 已实现 ✅
  // ============================================
  SEND_SMS: '/xypai-auth/api/auth/sms/send',                    // 发送验证码（LOGIN/RESET_PASSWORD）

  // ============================================
  // 密码重置相关（xypai-auth服务）- 已实现 ✅
  // ============================================
  VERIFY_RESET_CODE: '/xypai-auth/api/auth/password/reset/verify',    // 验证重置密码验证码
  RESET_PASSWORD: '/xypai-auth/api/auth/password/reset/confirm',      // 重置密码

  // ============================================
  // 用户相关（xypai-user服务）
  // ============================================
  USER_PROFILE: '/xypai-user/api/v1/user/profile',          // 获取用户资料（需登录）

  // ============================================
  // 以下接口后端暂未实现，前端暂不使用
  // 如需使用请先在后端添加对应接口
  // ============================================
  CHECK_USER_EXISTS: '/xypai-auth/api/auth/user/exists',        // [未实现] 检查用户是否存在
  VERIFY_CODE: '/xypai-auth/api/auth/sms/verify',               // [未实现] 单独验证验证码
} as const;

/**
 * API配置常量
 */
const API_CONFIG = {
  TIMEOUT: 30000,           // 30秒超时
  RETRY_COUNT: 3,           // 重试3次
  RETRY_DELAY: 1000,        // 重试延迟1秒
  MAX_CONCURRENT: 5,        // 最大并发请求数
} as const;

// #endregion

// #region 工具函数

/**
 * 错误处理工具
 */
const errorHandler = {
  /**
   * 格式化API错误
   */
  format: (error: AxiosError): Error => {
    const response = error.response;
    const data = response?.data as any;
    
    // 服务器返回的错误信息
    if (data?.message) {
      const customError = new Error(data.message);
      (customError as any).code = data.code;
      (customError as any).status = response?.status;
      return customError;
    }
    
    // 网络错误
    if (error.code === 'NETWORK_ERROR' || !response) {
      return new Error('网络连接失败，请检查网络设置');
    }
    
    // HTTP状态码错误
    const statusCode = response?.status;
    switch (statusCode) {
      case 400:
        return new Error('请求参数错误');
      case 401:
        return new Error('身份验证失败');
      case 403:
        return new Error('访问被拒绝');
      case 404:
        return new Error('服务不存在');
      case 429:
        return new Error('请求过于频繁，请稍后再试');
      case 500:
        return new Error('服务器内部错误');
      case 502:
      case 503:
      case 504:
        return new Error('服务器暂时不可用');
      default:
        return new Error(`请求失败 (${statusCode})`);
    }
  },
  
  /**
   * 判断是否可重试
   */
  isRetryable: (error: AxiosError): boolean => {
    // 网络错误可重试
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      return true;
    }
    
    // 5xx错误可重试
    const status = error.response.status;
    return status >= 500 && status < 600;
  },
};

/**
 * 请求重试工具
 */
const retryHandler = {
  /**
   * 延迟函数
   */
  delay: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  
  /**
   * 指数退避延迟计算
   */
  calculateDelay: (attempt: number, baseDelay: number = API_CONFIG.RETRY_DELAY): number => {
    return baseDelay * Math.pow(2, attempt - 1);
  },
  
  /**
   * 执行重试请求
   */
  execute: async <T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    maxRetries: number = API_CONFIG.RETRY_COUNT
  ): Promise<AxiosResponse<T>> => {
    let lastError: AxiosError;
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as AxiosError;
        
        // 最后一次尝试失败
        if (attempt > maxRetries) {
          break;
        }
        
        // 检查是否可重试
        if (!errorHandler.isRetryable(lastError)) {
          break;
        }
        
        // 计算延迟时间
        const delay = retryHandler.calculateDelay(attempt);
        
        console.warn(`API request failed (attempt ${attempt}), retrying in ${delay}ms...`, {
          error: lastError.message,
          status: lastError.response?.status,
        });
        
        // 延迟后重试
        await retryHandler.delay(delay);
      }
    }
    
    throw errorHandler.format(lastError);
  },
};

/**
 * 请求验证工具
 */
const validator = {
  /**
   * 验证手机号
   */
  phone: (phone: string, region: string = '+86'): boolean => {
    if (!phone) return false;
    
    // 根据地区验证手机号格式
    const phoneRegexMap: Record<string, RegExp> = {
      '+86': /^1[3-9]\d{9}$/,
      '+1': /^\d{10}$/,
      '+44': /^\d{10}$/,
    };
    
    const regex = phoneRegexMap[region] || phoneRegexMap['+86'];
    return regex.test(phone);
  },
  
  /**
   * 验证密码
   */
  password: (password: string): boolean => {
    return password && password.length >= 6;
  },
  
  /**
   * 验证验证码
   */
  code: (code: string): boolean => {
    return /^\d{6}$/.test(code);
  },
  
  /**
   * 验证地区代码
   */
  region: (region: string): boolean => {
    const validRegions = ['+86', '+1', '+44', '+81', '+82', '+852', '+853', '+886'];
    return validRegions.includes(region);
  },
};

// #endregion

// #region API实现

/**
 * 认证API类
 */
class AuthAPI {
  /**
   * 密码登录
   *
   * @param countryCode 国家区号，例如："+86"
   * @param mobile 手机号，例如："13147046323"
   * @param password 密码，6-20位字符
   * @param agreeToTerms 用户协议勾选状态，必须为true
   */
  async passwordLogin(
    countryCode: string,
    mobile: string,
    password: string,
    agreeToTerms: boolean = true
  ): Promise<ApiResponse<{ token: string; userId: string; nickname: string; avatar?: string }>> {
    // 参数验证
    if (!validator.phone(mobile, countryCode)) {
      throw new Error('手机号格式不正确');
    }

    if (!validator.password(password)) {
      throw new Error('密码长度至少6位');
    }

    // 构造请求数据
    const requestData = {
      countryCode,
      mobile,
      password,
      agreeToTerms,
    };

    // 执行登录请求
    const response = await retryHandler.execute(
      () => apiClient.post(API_ENDPOINTS.PASSWORD_LOGIN, requestData)
    );

    return response;
  }

  /**
   * SMS验证码登录（自动注册）
   *
   * @param countryCode 国家区号
   * @param phoneNumber 手机号（兼容参数名）
   * @param verificationCode 6位验证码
   * @param agreeToTerms 用户协议勾选状态，必须为true
   * @returns 包含isNewUser标记的登录响应
   */
  async smsLogin(
    countryCode: string,
    phoneNumber: string,
    verificationCode: string,
    agreeToTerms: boolean = true
  ): Promise<ApiResponse<{
    token: string;
    userId: string;
    nickname: string;
    avatar?: string;
    isNewUser: boolean;  // ⭐ 关键字段：true=新用户需完善资料，false=老用户跳转主页
  }>> {
    // 参数验证
    if (!validator.phone(phoneNumber, countryCode)) {
      throw new Error('手机号格式不正确');
    }

    if (!validator.code(verificationCode)) {
      throw new Error('验证码格式不正确');
    }

    // 构造请求数据（后端期望mobile字段）
    const requestData = {
      countryCode,
      mobile: phoneNumber,  // 后端使用mobile字段
      verificationCode,
      agreeToTerms,
    };

    // 执行登录请求
    const response = await retryHandler.execute(
      () => apiClient.post(API_ENDPOINTS.SMS_LOGIN, requestData)
    );

    return response;
  }

  /**
   * 通用登录方法（兼容旧接口）
   * @deprecated 建议使用 passwordLogin 或 smsLogin
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    // 兼容旧代码：根据登录类型调用对应方法
    if (request.password) {
      const result = await this.passwordLogin(
        request.region,
        request.phone,
        request.password,
        true
      );
      // 转换为旧格式
      return {
        success: result.code === 200,
        message: result.message,
        data: {
          token: result.data?.token || '',
          refreshToken: '', // 后端暂未返回
          userInfo: {
            id: result.data?.userId || '',
            phone: request.phone,
            nickname: result.data?.nickname || '',
            avatar: result.data?.avatar || '',
            verified: true,
            createdAt: new Date().toISOString(),
          },
          expiresIn: 3600,
        },
      };
    } else if (request.smsCode) {
      const result = await this.smsLogin(
        request.region,
        request.phone,
        request.smsCode,
        true
      );
      // 转换为旧格式
      return {
        success: result.code === 200,
        message: result.message,
        data: {
          token: result.data?.token || '',
          refreshToken: '',
          userInfo: {
            id: result.data?.userId || '',
            phone: request.phone,
            nickname: result.data?.nickname || '',
            avatar: result.data?.avatar || '',
            verified: true,
            createdAt: new Date().toISOString(),
          },
          expiresIn: 3600,
        },
      };
    } else {
      throw new Error('请提供密码或验证码');
    }
  }
  
  /**
   * 刷新令牌
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    if (!refreshToken) {
      throw new Error('刷新令牌不能为空');
    }
    
    const request: RefreshTokenRequest = { refreshToken };
    
    const response = await retryHandler.execute(
      () => apiClient.post<RefreshTokenResponse>(API_ENDPOINTS.REFRESH_TOKEN, request)
    );
    
    return response;
  }
  
  /**
   * 登出
   */
  async logout(request?: LogoutRequest): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>(API_ENDPOINTS.LOGOUT, request || {});
    return response;
  }
  
  /**
   * 检查用户是否存在
   */
  async checkUserExists(phone: string, region: string): Promise<CheckUserExistsResponse> {
    if (!validator.phone(phone, region)) {
      throw new Error('手机号格式不正确');
    }
    
    const request: CheckUserExistsRequest = { phone, region };
    
    const response = await apiClient.post<CheckUserExistsResponse>(
      API_ENDPOINTS.CHECK_USER_EXISTS,
      request
    );
    
    return response;
  }
  
  /**
   * 获取用户资料
   */
  async getUserProfile(): Promise<ApiResponse<UserInfo>> {
    const response = await apiClient.get<ApiResponse<UserInfo>>(API_ENDPOINTS.USER_PROFILE);
    return response;
  }
  
  /**
   * 发送验证码（统一接口）
   *
   * @param countryCode 国家区号，例如："+86"
   * @param phoneNumber 手机号，例如："13147046323"
   * @param purpose 验证码用途："LOGIN" | "REGISTER" | "RESET_PASSWORD"
   */
  async sendSmsCode(
    countryCode: string,
    phoneNumber: string,
    purpose: 'LOGIN' | 'REGISTER' | 'RESET_PASSWORD'
  ): Promise<ApiResponse<null>> {
    if (!validator.phone(phoneNumber, countryCode)) {
      throw new Error('手机号格式不正确');
    }

    const request = {
      countryCode,
      phoneNumber,
      purpose,
    };

    const response = await retryHandler.execute(
      () => apiClient.post(API_ENDPOINTS.SEND_SMS, request)
    );

    return response;
  }

  /**
   * 发送登录验证码（快捷方法）
   */
  async sendLoginCode(phone: string, region: string): Promise<SendCodeResponse> {
    const result = await this.sendSmsCode(region, phone, 'LOGIN');

    // 转换为旧格式（兼容）
    return {
      success: result.code === 200,
      message: result.message,
      data: {
        codeId: 'generated_' + Date.now(),
        expiresIn: 300,  // 5分钟
        nextSendTime: 60, // 60秒后可重发
      },
    };
  }

  /**
   * 发送注册验证码（快捷方法）
   */
  async sendRegisterCode(phone: string, region: string): Promise<SendCodeResponse> {
    const result = await this.sendSmsCode(region, phone, 'REGISTER');

    // 转换为旧格式（兼容）
    return {
      success: result.code === 200,
      message: result.message,
      data: {
        codeId: 'generated_' + Date.now(),
        expiresIn: 300,
        nextSendTime: 60,
      },
    };
  }
  
  /**
   * 验证验证码
   */
  async verifyCode(phone: string, code: string, region: string): Promise<ApiResponse> {
    if (!validator.phone(phone, region)) {
      throw new Error('手机号格式不正确');
    }
    
    if (!validator.code(code)) {
      throw new Error('验证码格式不正确');
    }
    
    const request = {
      phone,
      code,
      region,
    };
    
    const response = await apiClient.post<ApiResponse>(API_ENDPOINTS.VERIFY_CODE, request);
    return response;
  }
  
  /**
   * 发送重置密码验证码（快捷方法）
   */
  async sendResetPasswordCode(phone: string, region: string): Promise<SendCodeResponse> {
    const result = await this.sendSmsCode(region, phone, 'RESET_PASSWORD');

    // 转换为旧格式（兼容）
    return {
      success: result.code === 200,
      message: result.message,
      data: {
        codeId: 'generated_' + Date.now(),
        expiresIn: 300,
        nextSendTime: 60,
      },
    };
  }

  /**
   * 验证重置密码验证码
   *
   * @param countryCode 国家区号
   * @param phoneNumber 手机号
   * @param verificationCode 6位验证码
   */
  async verifyResetCode(
    phoneNumber: string,
    verificationCode: string,
    countryCode: string
  ): Promise<ApiResponse<null>> {
    if (!validator.phone(phoneNumber, countryCode)) {
      throw new Error('手机号格式不正确');
    }

    if (!validator.code(verificationCode)) {
      throw new Error('验证码格式不正确');
    }

    const request = {
      countryCode,
      phoneNumber,
      verificationCode,
    };

    const response = await apiClient.post(API_ENDPOINTS.VERIFY_RESET_CODE, request);
    return response;
  }

  /**
   * 重置密码
   *
   * @param countryCode 国家区号
   * @param phoneNumber 手机号
   * @param verificationCode 6位验证码（从上一步保存）
   * @param newPassword 新密码，6-20位字符
   */
  async resetPassword(
    phoneNumber: string,
    verificationCode: string,
    newPassword: string,
    countryCode: string
  ): Promise<ApiResponse<null>> {
    if (!validator.phone(phoneNumber, countryCode)) {
      throw new Error('手机号格式不正确');
    }

    if (!validator.code(verificationCode)) {
      throw new Error('验证码格式不正确');
    }

    if (!validator.password(newPassword)) {
      throw new Error('密码长度至少6位');
    }

    const request = {
      countryCode,
      phoneNumber,
      verificationCode,
      newPassword,
    };

    const response = await retryHandler.execute(
      () => apiClient.post(API_ENDPOINTS.RESET_PASSWORD, request)
    );

    return response;
  }
}

// #endregion

// #region 实例和导出

/**
 * 认证API实例
 */
export const authApi = new AuthAPI();

/**
 * 导出类型
 */
export type {
    ApiResponse, CheckUserExistsRequest,
    CheckUserExistsResponse, LoginRequest,
    LoginResponse, LogoutRequest, RefreshTokenRequest,
    RefreshTokenResponse, SendCodeRequest,
    SendCodeResponse
};

/**
 * 导出工具函数
 */
    export {
        API_CONFIG, API_ENDPOINTS, errorHandler,
        retryHandler,
        validator
    };

// #endregion

// #region Mock数据（开发测试用）

/**
 * Mock API响应（开发环境使用）
 */
export const mockAuthApi = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟登录成功
    return {
      success: true,
      data: {
        token: 'mock_access_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        userInfo: {
          id: 'mock_user_id',
          phone: request.phone,
          nickname: '测试用户',
          avatar: '',
          verified: true,
          createdAt: new Date().toISOString(),
        },
        expiresIn: 3600, // 1小时
      },
      message: '登录成功',
    };
  },
  
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        token: 'mock_new_access_token_' + Date.now(),
        refreshToken: 'mock_new_refresh_token_' + Date.now(),
        expiresIn: 3600,
      },
      message: '令牌刷新成功',
    };
  },
  
  async sendLoginCode(phone: string, region: string): Promise<SendCodeResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      data: {
        codeId: 'mock_code_id_' + Date.now(),
        expiresIn: 300, // 5分钟
        nextSendTime: 60, // 60秒后可重发
      },
      message: '验证码发送成功',
    };
  },
  
  async sendResetPasswordCode(phone: string, region: string): Promise<SendCodeResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      data: {
        codeId: 'mock_code_id_' + Date.now(),
        expiresIn: 300, // 5分钟
        nextSendTime: 60, // 60秒后可重发
      },
      message: '重置密码验证码发送成功',
    };
  },
  
  async verifyResetCode(phone: string, code: string, region: string): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {},
      message: '验证码验证成功',
    };
  },
  
  async resetPassword(phone: string, code: string, newPassword: string, region: string): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      data: {},
      message: '密码重置成功',
    };
  },
};

// #endregion

