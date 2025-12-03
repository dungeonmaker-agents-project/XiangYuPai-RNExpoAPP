/**
 * API客户端
 * 提供统一的HTTP请求客户端，包含拦截器、错误处理、缓存等功能
 */

import { API_CONFIG, ERROR_TYPES, HTTP_STATUS, REQUEST_HEADERS, getBaseURL } from './config';
import { WhitelistType, checkWhitelist } from './whitelist';

// 请求配置接口
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  timeout?: number;
  retry?: boolean;
  cache?: boolean;
  cacheTTL?: number;
}

// 响应接口
interface ApiResponse<T = any> {
  data: T;
  code: number;
  message: string;
  timestamp: number;
  success: boolean;
}

// 错误接口
interface ApiError {
  type: string;
  message: string;
  code?: number;
  details?: any;
}

// 缓存项接口
interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

// 简单的内存缓存实现
class MemoryCache {
  private cache = new Map<string, CacheItem>();
  private maxSize = API_CONFIG.CACHE.MAX_SIZE;

  set<T>(key: string, data: T, ttl: number = API_CONFIG.CACHE.TTL): void {
    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }
}

// 创建缓存实例
const cache = new MemoryCache();

// 请求重试函数
const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  retries: number = API_CONFIG.RETRY.COUNT,
  delay: number = API_CONFIG.RETRY.DELAY
): Promise<T> => {
  try {
    return await requestFn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(requestFn, retries - 1, delay * API_CONFIG.RETRY.BACKOFF);
    }
    throw error;
  }
};

// 创建错误对象
const createError = (type: string, message: string, code?: number, details?: any): ApiError => ({
  type,
  message,
  code,
  details,
});

// 处理HTTP错误
const handleHttpError = (status: number, statusText: string): ApiError => {
  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      return createError(ERROR_TYPES.CLIENT_ERROR, '请求参数错误', status);
    case HTTP_STATUS.UNAUTHORIZED:
      return createError(ERROR_TYPES.AUTHENTICATION_ERROR, '未授权，请重新登录', status);
    case HTTP_STATUS.FORBIDDEN:
      return createError(ERROR_TYPES.AUTHORIZATION_ERROR, '无权限访问', status);
    case HTTP_STATUS.NOT_FOUND:
      return createError(ERROR_TYPES.NOT_FOUND_ERROR, '请求的资源不存在', status);
    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      return createError(ERROR_TYPES.VALIDATION_ERROR, '数据验证失败', status);
    case HTTP_STATUS.TOO_MANY_REQUESTS:
      return createError(ERROR_TYPES.RATE_LIMIT_ERROR, '请求过于频繁，请稍后重试', status);
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      return createError(ERROR_TYPES.SERVER_ERROR, '服务器内部错误', status);
    case HTTP_STATUS.BAD_GATEWAY:
      return createError(ERROR_TYPES.SERVER_ERROR, '网关错误', status);
    case HTTP_STATUS.SERVICE_UNAVAILABLE:
      return createError(ERROR_TYPES.SERVER_ERROR, '服务暂不可用', status);
    case HTTP_STATUS.GATEWAY_TIMEOUT:
      return createError(ERROR_TYPES.TIMEOUT_ERROR, '网关超时', status);
    default:
      if (status >= 500) {
        return createError(ERROR_TYPES.SERVER_ERROR, '服务器错误', status);
      } else if (status >= 400) {
        return createError(ERROR_TYPES.CLIENT_ERROR, '客户端错误', status);
      }
      return createError(ERROR_TYPES.UNKNOWN_ERROR, `HTTP错误: ${status} ${statusText}`, status);
  }
};

// 🎯 Token传输配置（用于测试不同的token传输方式）
export interface TokenTransmissionConfig {
  // 主要方法：Authorization Header (OAuth 2.0 标准)
  useAuthorizationHeader: boolean;  // 默认: true - "Authorization: Bearer <token>"
  
  // 备用方法1：自定义Header (某些系统使用)
  useCustomHeaders: boolean;        // 默认: false - "satoken: <token>" / "token: <token>"
  customHeaderNames?: string[];     // 自定义header名称，如 ['satoken', 'X-Token']
  
  // 备用方法2：URL参数 (SA-Token支持)
  useUrlParameter: boolean;         // 默认: false - "?Authorization=<token>"
  urlParameterName?: string;        // URL参数名，默认: 'Authorization'
  
  // ClientId传输
  includeClientId: boolean;         // 默认: true - "clientid: app"
  clientIdHeaderName: string;       // ClientId header名称，默认: 'clientid'
  
  // Token格式
  tokenPrefix: string;              // Token前缀，默认: 'Bearer' (SA-Token要求)
  
  // 调试
  enableDebugLogs: boolean;         // 启用详细日志
}

// 默认Token传输配置（符合SA-Token标准）
const DEFAULT_TOKEN_CONFIG: TokenTransmissionConfig = {
  useAuthorizationHeader: true,
  useCustomHeaders: false,
  customHeaderNames: ['satoken', 'token', 'X-Token'],  // 备用header名称
  useUrlParameter: false,
  urlParameterName: 'Authorization',
  includeClientId: true,
  clientIdHeaderName: 'clientid',
  tokenPrefix: 'Bearer',
  enableDebugLogs: true,
};

// API客户端类
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private authStoreGetter: any = null;  // 🎯 AuthStore的getter函数
  private clientId: string = 'app';  // 🆕 客户端ID（必须与登录时的 clientType 一致！）
  private tokenConfig: TokenTransmissionConfig = DEFAULT_TOKEN_CONFIG;  // 🆕 Token传输配置

  constructor() {
    this.baseURL = getBaseURL();
    this.defaultHeaders = {
      'Content-Type': REQUEST_HEADERS.CONTENT_TYPE.JSON,
      'Accept': REQUEST_HEADERS.ACCEPT.JSON,
    };
  }
  
  // 🆕 设置客户端ID
  setClientId(clientId: string): void {
    this.clientId = clientId;
    console.log(`🔑 [API Client] 客户端ID已设置: ${clientId}`);
  }
  
  // 🆕 获取客户端ID
  getClientId(): string {
    return this.clientId;
  }
  
  // 🆕 配置Token传输方式（用于测试不同方式）
  configureTokenTransmission(config: Partial<TokenTransmissionConfig>): void {
    this.tokenConfig = { ...this.tokenConfig, ...config };
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧 [API Client] Token传输配置已更新');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   Authorization Header:', this.tokenConfig.useAuthorizationHeader ? '✅' : '❌');
    console.log('   Custom Headers:', this.tokenConfig.useCustomHeaders ? `✅ ${this.tokenConfig.customHeaderNames?.join(', ')}` : '❌');
    console.log('   URL Parameter:', this.tokenConfig.useUrlParameter ? `✅ ?${this.tokenConfig.urlParameterName}=<token>` : '❌');
    console.log('   ClientId Header:', this.tokenConfig.includeClientId ? `✅ ${this.tokenConfig.clientIdHeaderName}: ${this.clientId}` : '❌');
    console.log('   Token Prefix:', this.tokenConfig.tokenPrefix);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
  
  // 🆕 获取当前Token配置
  getTokenConfig(): TokenTransmissionConfig {
    return { ...this.tokenConfig };
  }

  // 🎯 第三层：连接AuthStore，实现自动token管理
  connectAuthStore(useAuthStoreGetter: any): void {
    this.authStoreGetter = useAuthStoreGetter;
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔌 [第三层] API拦截器 - 已连接AuthStore');
    console.log('   功能: 自动添加token + 401自动刷新');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  // 设置认证token
  // ✅ 后端 Sa-Token 配置要求 Bearer 前缀（token-prefix: Bearer）
  // 发送标准 OAuth 2.0 格式："Authorization: Bearer <token>"
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // 清除认证token
  clearAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }
  
  // 🎯 自动获取当前token
  private getAuthToken(): string | null {
    if (!this.authStoreGetter) {
      return null;
    }
    
    try {
      const state = this.authStoreGetter.getState();
      return state?.accessToken || null;
    } catch (error) {
      console.error('Get auth token error:', error);
      return null;
    }
  }
  
  // 🎯 处理401未授权错误（智能处理：白名单 vs 需要登录）
  private async handleUnauthorized<T>(
    url: string,
    config: RequestConfig,
    body?: any
  ): Promise<ApiResponse<T>> {
    // 🎯 检查白名单
    const whitelistCheck = checkWhitelist(url);
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 [第三层] 检测到401错误 - 智能处理');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   请求URL: ${url}`);
    console.log(`   白名单类型: ${whitelistCheck.type}`);
    console.log(`   规则: ${whitelistCheck.rule?.description || '默认（需要登录）'}`);
    
    // 🌐 情况1：匿名访问 - 不触发登录，抛出特殊错误
    if (whitelistCheck.type === WhitelistType.ANONYMOUS) {
      console.log('   处理: 🌐 匿名接口，允许降级方案');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      const error: any = createError(
        ERROR_TYPES.AUTHENTICATION_ERROR,
        '该接口暂时无法访问，使用降级数据',
        401
      );
      error.canUseFallback = true; // 标记可以使用降级方案
      error.whitelistType = WhitelistType.ANONYMOUS;
      throw error;
    }
    
    // 🔓 情况2：可选认证 - 尝试刷新token，失败也不强制登录
    if (whitelistCheck.type === WhitelistType.OPTIONAL_AUTH) {
      console.log('   处理: 🔓 可选认证，尝试刷新token（失败可降级）');
      
      if (!this.authStoreGetter) {
        console.log('   结果: ⚠️ 无AuthStore，使用降级方案');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const error: any = createError(
          ERROR_TYPES.AUTHENTICATION_ERROR,
          '未登录，使用访客模式',
          401
        );
        error.canUseFallback = true;
        error.whitelistType = WhitelistType.OPTIONAL_AUTH;
        throw error;
      }
      
      try {
        const authActions = this.authStoreGetter.getState();
        await authActions.refreshAuthToken();
        const newToken = this.getAuthToken();
        
        if (newToken) {
          this.setAuthToken(newToken);
          console.log('   结果: ✅ Token刷新成功，重试请求');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          return await this.makeRequest<T>(url, { ...config, retry: false }, body);
        }
      } catch (refreshError) {
        console.log('   结果: ⚠️ Token刷新失败，使用降级方案');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const error: any = createError(
          ERROR_TYPES.AUTHENTICATION_ERROR,
          '认证失败，使用访客模式',
          401
        );
        error.canUseFallback = true;
        error.whitelistType = WhitelistType.OPTIONAL_AUTH;
        throw error;
      }
    }
    
    // 🔒 情况3：必须认证 - 尝试刷新token，失败则引导登录
    console.log('   处理: 🔒 需要登录，尝试刷新token');
    
    if (!this.authStoreGetter) {
      console.log('   结果: ❌ 无AuthStore，需要登录');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      const error: any = createError(
        ERROR_TYPES.AUTHENTICATION_ERROR, 
        '请先登录'
      );
      error.requireLogin = true;
      throw error;
    }
    
    try {
      console.log('   步骤1: 调用authStore.refreshToken()');
      
      // 调用authStore的refreshToken方法
      const authActions = this.authStoreGetter.getState();
      await authActions.refreshAuthToken();
      
      // 获取新token
      const newToken = this.getAuthToken();
      if (newToken) {
        this.setAuthToken(newToken);
        console.log('   结果: ✅ Token刷新成功');
        console.log(`   新Token: ${newToken.substring(0, 20)}...`);
        console.log('   步骤2: 重新发送原请求');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        // 🎯 重新发送原请求（递归调用，但只重试一次）
        return await this.makeRequest<T>(url, { ...config, retry: false }, body);
      }
      
      throw new Error('Token refresh failed: no new token');
    } catch (refreshError) {
      console.log('   结果: ❌ Token刷新失败');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('   原因:', refreshError);
      console.log('   操作: 清除认证数据，引导用户登录');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      // 刷新失败，清除认证数据
      try {
        const authActions = this.authStoreGetter.getState();
        authActions.clearAuthData();
      } catch (clearError) {
        console.error('Clear auth data error:', clearError);
      }
      
      // 抛出需要登录的错误
      const error: any = createError(
        ERROR_TYPES.AUTHENTICATION_ERROR,
        '登录已过期，请重新登录',
        401
      );
      error.requireLogin = true; // 标记需要跳转登录页
      throw error;
    }
  }

  // 生成缓存键
  private generateCacheKey(url: string, method: string, body?: any): string {
    const bodyStr = body ? JSON.stringify(body) : '';
    return `${method}:${url}:${bodyStr}`;
  }

  // 核心请求方法
  private async makeRequest<T>(
    url: string,
    config: RequestConfig = {},
    body?: any
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      timeout = API_CONFIG.TIMEOUT.DEFAULT,
      retry = true,
      cache: useCache = method === 'GET',
      cacheTTL = API_CONFIG.CACHE.TTL,
    } = config;

    let fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    const cacheKey = this.generateCacheKey(fullUrl, method, body);

    // 🔥 详细日志：完整请求URL
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🌐 [API CLIENT] 准备发送请求`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   方法: ${method}`);
    console.log(`   基础URL: ${this.baseURL}`);
    console.log(`   相对路径: ${url}`);
    console.log(`   完整URL: ${fullUrl}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 检查缓存
    if (useCache && method === 'GET') {
      const cachedData = cache.get<ApiResponse<T>>(cacheKey);
      if (cachedData) {
        console.log('💾 使用缓存数据');
        return cachedData;
      }
    }

    // 🎯 准备请求头（基础）
    const requestHeaders: Record<string, string> = {
      ...this.defaultHeaders,
      ...headers,
    };

    // 🎯 获取token并根据配置添加到请求中
    const token = this.getAuthToken();
    
    if (token) {
      if (this.tokenConfig.enableDebugLogs) {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔑 [Token Injection] 准备注入Token');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`   请求: ${method} ${url}`);
        console.log(`   Token (前20字符): ${token.substring(0, 20)}...`);
        console.log(`   Token (长度): ${token.length} 字符`);
      }
      
      // 方法1: Authorization Header (OAuth 2.0标准 + SA-Token要求)
      if (this.tokenConfig.useAuthorizationHeader) {
        const tokenValue = this.tokenConfig.tokenPrefix 
          ? `${this.tokenConfig.tokenPrefix} ${token}`
          : token;
        requestHeaders['Authorization'] = tokenValue;
        
        if (this.tokenConfig.enableDebugLogs) {
          console.log(`   ✅ [Method 1] Authorization Header`);
          console.log(`      Header: Authorization: ${tokenValue.substring(0, 30)}...`);
          console.log(`      格式: ${this.tokenConfig.tokenPrefix ? `${this.tokenConfig.tokenPrefix} <token>` : '<token>'}`);
        }
      }
      
      // 方法2: 自定义Headers (备用 - 某些系统使用)
      if (this.tokenConfig.useCustomHeaders && this.tokenConfig.customHeaderNames) {
        this.tokenConfig.customHeaderNames.forEach(headerName => {
          requestHeaders[headerName] = token;
        });
        
        if (this.tokenConfig.enableDebugLogs) {
          console.log(`   ✅ [Method 2] Custom Headers`);
          console.log(`      Headers: ${this.tokenConfig.customHeaderNames.join(', ')}`);
          console.log(`      值: ${token.substring(0, 20)}... (无前缀)`);
        }
      }
      
      // 方法3: URL参数 (SA-Token支持)
      if (this.tokenConfig.useUrlParameter) {
        const paramName = this.tokenConfig.urlParameterName || 'Authorization';
        const separator = fullUrl.includes('?') ? '&' : '?';
        const tokenValue = this.tokenConfig.tokenPrefix 
          ? `${this.tokenConfig.tokenPrefix} ${token}`
          : token;
        fullUrl = `${fullUrl}${separator}${paramName}=${encodeURIComponent(tokenValue)}`;
        
        if (this.tokenConfig.enableDebugLogs) {
          console.log(`   ✅ [Method 3] URL Parameter`);
          console.log(`      参数名: ${paramName}`);
          console.log(`      完整URL: ${fullUrl.substring(0, 100)}...`);
        }
      }
      
      if (this.tokenConfig.enableDebugLogs) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      }
    } else {
      console.log(`📡 [Token Injection] 无token（匿名请求）`);
      console.log(`   请求: ${method} ${url}\n`);
    }

    // 🎯 添加ClientId Header (SA-Token必需)
    if (this.tokenConfig.includeClientId) {
      requestHeaders[this.tokenConfig.clientIdHeaderName] = this.clientId;
      
      if (this.tokenConfig.enableDebugLogs && token) {
        console.log(`🔑 [ClientId] 已添加ClientId Header`);
        console.log(`   Header: ${this.tokenConfig.clientIdHeaderName}: ${this.clientId}`);
        console.log(`   说明: 必须与登录时的clientType一致！\n`);
      }
    }

    // 🆕 准备请求配置
    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
    };

    // 添加请求体
    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        // FormData会自动设置Content-Type
        const headers = requestConfig.headers as Record<string, string>;
        delete headers['Content-Type'];
        requestConfig.body = body;
      } else {
        requestConfig.body = JSON.stringify(body);
      }
    }

    // 创建请求函数
    const requestFn = async (): Promise<ApiResponse<T>> => {
      // 创建AbortController用于超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      try {
        requestConfig.signal = controller.signal;
        
        console.log(`\n🚀 [FETCH] 发送HTTP请求...`);
        console.log(`   URL: ${fullUrl}`);
        console.log(`   Method: ${method}`);
        console.log(`   Headers:`, Object.keys(requestConfig.headers || {}));
        
        const response = await fetch(fullUrl, requestConfig);
        
        console.log(`\n✅ [FETCH] 收到HTTP响应`);
        console.log(`   状态码: ${response.status} ${response.statusText}`);
        console.log(`   Content-Type: ${response.headers.get('content-type')}`);
        
        clearTimeout(timeoutId);

        // 检查HTTP状态码
        if (!response.ok) {
          // 🎯 特殊处理401未授权错误
          if (response.status === 401) {
            const error = handleHttpError(response.status, response.statusText);
            (error as any).status = 401;  // 标记为401错误
            throw error;
          }
          
          throw handleHttpError(response.status, response.statusText);
        }

        // 解析响应数据
        const contentType = response.headers.get('content-type');
        let responseData: any;

        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          // 🔧 修复：即使Content-Type是text/plain，也尝试解析为JSON
          const textData = await response.text();
          try {
            responseData = JSON.parse(textData);
            console.log('✅ [API CLIENT] 成功将text/plain响应解析为JSON');
          } catch (e) {
            // 如果不是JSON，保持为文本
            responseData = textData;
            console.log('ℹ️ [API CLIENT] 响应是纯文本，不是JSON');
          }
        }

        // 🔥 修复：检查是否双重JSON包装（data字段是字符串）
        if (responseData.data && typeof responseData.data === 'string') {
          try {
            console.log('\n⚠️ [API CLIENT] 检测到双重JSON包装');
            console.log('   原始data类型:', typeof responseData.data);
            console.log('   原始data内容:', responseData.data.substring(0, 100));
            
            const innerData = JSON.parse(responseData.data);
            console.log('   解析后的内部data:', innerData);
            
            // 检查内部的业务状态码
            if (innerData.code === 401) {
              console.log('   ❌ 内部返回 401 认证失败');
              console.log('   触发401错误处理流程\n');
              
              // 抛出401错误，触发自动刷新token逻辑
              const error = handleHttpError(401, innerData.msg || '认证失败');
              (error as any).status = 401;
              throw error;
            }
            
            // 如果内部有其他错误码，也要处理
            if (innerData.code && innerData.code !== 200) {
              console.log(`   ⚠️ 内部返回错误码: ${innerData.code}`);
              throw createError(
                ERROR_TYPES.SERVER_ERROR,
                innerData.msg || '请求失败',
                innerData.code
              );
            }
            
            // 使用解析后的内部数据
            responseData.data = innerData.data;
            console.log('   ✅ 成功解析双重JSON，使用内部数据\n');
          } catch (parseError) {
            // 如果不是有效的JSON，保持原样
            if (parseError instanceof SyntaxError) {
              console.log('   ℹ️ data字段不是JSON，保持原样\n');
            } else {
              // 重新抛出其他错误（如401错误）
              throw parseError;
            }
          }
        }

        // 检查业务状态码
        if (responseData.success === false) {
          throw createError(
            ERROR_TYPES.SERVER_ERROR,
            responseData.message || responseData.msg || '业务处理失败',
            responseData.code
          );
        }

        const result: ApiResponse<T> = {
          data: responseData.data || responseData,
          code: responseData.code || HTTP_STATUS.OK,
          message: responseData.message || responseData.msg || 'Success',
          timestamp: responseData.timestamp || Date.now(),
          success: true,
        };

        // 缓存GET请求的响应
        if (useCache && method === 'GET') {
          cache.set(cacheKey, result, cacheTTL);
        }

        return result;
      } catch (error: any) {
        clearTimeout(timeoutId);
        
        if (error?.name === 'AbortError') {
          throw createError(ERROR_TYPES.TIMEOUT_ERROR, '请求超时');
        }
        
        if (error?.message === 'Network request failed' || error?.name === 'TypeError') {
          throw createError(ERROR_TYPES.NETWORK_ERROR, '网络连接失败，请检查网络设置');
        }
        
        throw error;
      }
    };

    // 执行请求（带重试）
    try {
      if (retry) {
        return await retryRequest(requestFn);
      } else {
        return await requestFn();
      }
    } catch (error: any) {
      // 🎯 响应拦截：处理401错误，自动刷新token
      if (error.status === 401 && retry !== false) {
        console.log('🎯 Caught 401 error, attempting auto token refresh...');
        return await this.handleUnauthorized<T>(url, config, body);
      }
      
      // 确保抛出的是ApiError格式
      if (error.type) {
        throw error;
      } else {
        throw createError(ERROR_TYPES.UNKNOWN_ERROR, error.message || '未知错误');
      }
    }
  }

  // GET请求
  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    console.log('\n🔥🔥🔥 [API CLIENT] GET 请求被调用');
    console.log('🔥 URL:', url);
    console.log('🔥 Config:', config);
    
    const result = await this.makeRequest<T>(url, { ...config, method: 'GET' });
    
    console.log('🔥 [API CLIENT] GET 请求完成');
    console.log('🔥 成功:', result.success);
    
    return result;
  }

  // POST请求
  async post<T>(url: string, body?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'POST' }, body);
  }

  // PUT请求
  async put<T>(url: string, body?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'PUT' }, body);
  }

  // DELETE请求
  async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'DELETE' });
  }

  // PATCH请求
  async patch<T>(url: string, body?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'PATCH' }, body);
  }

  // 上传文件
  async upload<T>(
    url: string,
    file: File | FormData,
    onProgress?: (progress: number) => void,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = file instanceof FormData ? file : (() => {
      const fd = new FormData();
      fd.append('file', file);
      return fd;
    })();

    return this.makeRequest<T>(
      url,
      {
        ...config,
        method: 'POST',
        timeout: API_CONFIG.TIMEOUT.UPLOAD,
        cache: false,
      },
      formData
    );
  }

  // 清除缓存
  clearCache(): void {
    cache.clear();
  }

  // 删除特定缓存
  deleteCache(url: string, method: string = 'GET', body?: any): void {
    const cacheKey = this.generateCacheKey(url, method, body);
    cache.delete(cacheKey);
  }
}

// 创建并导出API客户端实例
export const apiClient = new ApiClient();

// 导出类型 (TokenTransmissionConfig已在定义时导出)
export type { ApiError, ApiResponse, RequestConfig };

// 导出错误类型常量
  export { ERROR_TYPES, HTTP_STATUS };

// 导出Token配置常量（方便外部使用）
  export { DEFAULT_TOKEN_CONFIG };

