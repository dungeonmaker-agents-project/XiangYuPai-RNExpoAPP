# AuthModule API Integration Documentation

## 概述
本文档记录了前端 AuthModule 与后端 xypai-auth 服务的 API 集成情况。

**完成时间**: 2025-11-24
**后端服务**: xypai-auth (端口 9211, Gateway 路由 /xypai-auth)
**前端模块**: AuthModule

## API 端点映射

### 1. 认证登录

| 功能 | 前端方法 | 后端接口 | HTTP方法 | 状态 |
|------|---------|---------|---------|------|
| 密码登录 | `authApi.passwordLogin()` | `/api/auth/login/password` | POST | ✅ 已集成 |
| SMS验证码登录 | `authApi.smsLogin()` | `/api/auth/login/sms` | POST | ✅ 已集成 |
| Token刷新 | `authApi.refreshToken()` | `/api/auth/token/refresh` | POST | ⚠️  待后端实现 |
| 登出 | `authApi.logout()` | `/api/auth/logout` | POST | ⚠️  待后端实现 |

### 2. 验证码管理

| 功能 | 前端方法 | 后端接口 | HTTP方法 | 状态 |
|------|---------|---------|---------|------|
| 发送验证码 | `authApi.sendSmsCode()` | `/api/auth/sms/send` | POST | ✅ 已集成 |
| 发送登录验证码 | `authApi.sendLoginCode()` | `/api/auth/sms/send` | POST | ✅ 已集成 |
| 发送注册验证码 | `authApi.sendRegisterCode()` | `/api/auth/sms/send` | POST | ✅ 已集成 |
| 发送重置密码验证码 | `authApi.sendResetPasswordCode()` | `/api/auth/sms/send` | POST | ✅ 已集成 |

### 3. 密码重置

| 功能 | 前端方法 | 后端接口 | HTTP方法 | 状态 |
|------|---------|---------|---------|------|
| 验证重置密码验证码 | `authApi.verifyResetCode()` | `/api/auth/password/reset/verify` | POST | ✅ 已集成 |
| 重置密码 | `authApi.resetPassword()` | `/api/auth/password/reset/confirm` | POST | ✅ 已集成 |

### 4. 用户信息

| 功能 | 前端方法 | 后端接口 | HTTP方法 | 状态 |
|------|---------|---------|---------|------|
| 获取用户资料 | `authApi.getUserProfile()` | `/api/auth/user/profile` | GET | ⚠️  待后端实现 |
| 检查用户是否存在 | `authApi.checkUserExists()` | `/api/auth/user/exists` | POST | ⚠️  待后端实现 |

## 核心接口详情

### 1. 密码登录

**接口**: `POST /api/auth/login/password`

**请求参数**:
```typescript
{
  countryCode: string;      // 国家区号，例如："+86"
  mobile: string;           // 手机号，例如："13147046323"
  password: string;         // 密码，6-20位字符
  agreeToTerms: boolean;    // 用户协议勾选状态，必须为true
}
```

**响应数据**:
```typescript
{
  code: 200,              // 200=成功，其他=失败
  message: string,        // 提示信息
  data: {
    token: string,        // 登录凭证
    userId: string,       // 用户ID
    nickname: string,     // 用户昵称
    avatar?: string       // 用户头像
  }
}
```

**前端调用**:
```typescript
const result = await authApi.passwordLogin('+86', '13147046323', 'password123');
if (result.code === 200) {
  // 保存 token
  await SecureStore.setItemAsync('token', result.data.token);
  // 跳转主页
  navigation.navigate('Home');
}
```

---

### 2. SMS验证码登录（自动注册）

**接口**: `POST /api/auth/login/sms`

**请求参数**:
```typescript
{
  countryCode: string;      // 国家区号
  mobile: string;           // 手机号（注意：后端使用mobile字段）
  verificationCode: string; // 6位验证码
  agreeToTerms: boolean;    // 用户协议勾选状态，必须为true
}
```

**响应数据**:
```typescript
{
  code: 200,
  message: string,
  data: {
    token: string,
    userId: string,
    nickname: string,
    avatar?: string,
    isNewUser: boolean      // ⭐ 关键字段：true=新用户，false=老用户
  }
}
```

**特殊说明**:
- **自动注册**: 未注册手机号验证成功后自动创建账号
- **isNewUser 标记**:
  - `true`: 新用户，前端应跳转到完善资料页面
  - `false`: 老用户，前端应跳转到主页

**前端调用**:
```typescript
const result = await authApi.smsLogin('+86', '13147046323', '123456');
if (result.code === 200) {
  await SecureStore.setItemAsync('token', result.data.token);

  // 根据 isNewUser 决定跳转
  if (result.data.isNewUser) {
    navigation.navigate('ProfileEdit');  // 完善资料页
  } else {
    navigation.navigate('Home');         // 主页
  }
}
```

---

### 3. 发送验证码（统一接口）

**接口**: `POST /api/auth/sms/send`

**请求参数**:
```typescript
{
  countryCode: string;      // 国家区号，例如："+86"
  phoneNumber: string;      // 手机号，例如："13147046323"
  purpose: string;          // 验证码用途："LOGIN" | "REGISTER" | "RESET_PASSWORD"
}
```

**响应数据**:
```typescript
{
  code: 200,
  message: "验证码已发送",
  data: null
}
```

**错误码**:
| 状态码 | 说明 | 前端提示 |
|-------|------|---------|
| 200 | 成功 | "验证码已发送" |
| 400 | 参数错误 | "请检查输入信息" |
| 429 | 发送频繁 | "发送过于频繁，请稍后再试" |
| 500 | 服务器错误 | "发送失败，请稍后重试" |

**前端调用**:
```typescript
// 方式1：使用统一接口
const result = await authApi.sendSmsCode('+86', '13147046323', 'LOGIN');

// 方式2：使用快捷方法（推荐）
const result = await authApi.sendLoginCode('13147046323', '+86');
```

---

### 4. 忘记密码流程（3步）

#### 步骤1：发送重置密码验证码

**接口**: `POST /api/auth/sms/send`

**请求参数**:
```typescript
{
  countryCode: string,
  phoneNumber: string,
  purpose: "RESET_PASSWORD"
}
```

**前端调用**:
```typescript
const result = await authApi.sendResetPasswordCode('13147046323', '+86');
```

#### 步骤2：验证验证码

**接口**: `POST /api/auth/password/reset/verify`

**请求参数**:
```typescript
{
  countryCode: string,
  phoneNumber: string,
  verificationCode: string   // 6位验证码
}
```

**前端调用**:
```typescript
const result = await authApi.verifyResetCode('13147046323', '123456', '+86');
if (result.code === 200) {
  // 跳转到设置新密码页面
  navigation.navigate('ResetPassword', {
    phone: '13147046323',
    code: '123456',
    countryCode: '+86'
  });
}
```

#### 步骤3：重置密码

**接口**: `POST /api/auth/password/reset/confirm`

**请求参数**:
```typescript
{
  countryCode: string,
  phoneNumber: string,
  verificationCode: string,   // 从步骤2保存的验证码
  newPassword: string         // 新密码，6-20位字符
}
```

**前端调用**:
```typescript
const result = await authApi.resetPassword(
  '13147046323',
  '123456',
  'newPassword123',
  '+86'
);

if (result.code === 200) {
  // 显示成功提示
  Alert.alert('成功', '密码重置成功');
  // 2-3秒后跳转到登录页
  setTimeout(() => {
    navigation.navigate('Login');
  }, 2000);
}
```

---

## 响应格式统一说明

所有后端接口返回统一格式：

```typescript
{
  code: number,           // 200=成功，其他=失败
  message: string,        // 提示信息
  data: T | null,        // 响应数据（成功时有值，失败时为null）
  msg?: string           // 备用消息字段
}
```

### 错误处理

前端统一错误处理模式：

```typescript
try {
  const result = await authApi.someMethod();

  if (result.code === 200) {
    // 成功处理
  } else {
    // 业务错误处理
    Alert.alert('错误', result.message || result.msg || '操作失败');
  }
} catch (error) {
  // 网络错误或其他异常
  Alert.alert('错误', error.message || '网络连接失败');
}
```

---

## 测试覆盖情况

### 后端测试（已通过）

✅ **AppSmsRegistrationTest.java** - SMS注册和登录测试
- 测试1: 新用户SMS注册（isNewUser=true）
- 测试2: 老用户SMS登录（isNewUser=false）
- 测试3: 参数验证 - 手机号格式错误
- 测试4: 参数验证 - 验证码格式错误

✅ **SmsRegisterAndLoginTest.java** - 注册即登录功能测试
- 测试1: 新用户首次使用（自动注册+登录）
- 测试2: 同一用户再次登录（isNewUser=false）
- 测试3: 已存在的老用户登录

✅ **SimpleSaTokenTest.java** - Token认证测试
- 测试1: APP用户登录获取Token
- 测试2-6: 使用Token访问各个服务

### 前端测试（待完成）

⚠️  **需要测试的场景**:
1. [ ] 密码登录成功流程
2. [ ] SMS验证码登录成功流程
3. [ ] 新用户自动注册并跳转完善资料页
4. [ ] 老用户登录并跳转主页
5. [ ] 忘记密码3步流程
6. [ ] 验证码发送频率限制（60秒）
7. [ ] 网络错误处理
8. [ ] 参数验证错误提示

---

## 兼容性说明

### 1. 向后兼容

为了保证现有代码不受影响，保留了以下兼容方法：

```typescript
// 旧方法（仍然可用，但标记为 @deprecated）
authApi.login(request: LoginRequest): Promise<LoginResponse>

// 新方法（推荐使用）
authApi.passwordLogin(countryCode, mobile, password, agreeToTerms)
authApi.smsLogin(countryCode, phoneNumber, verificationCode, agreeToTerms)
```

### 2. 参数名称差异

**后端期望**: `mobile`
**前端使用**: `phoneNumber`

API层已做自动转换，前端调用时使用 `phoneNumber` 即可。

---

## 配置要求

### 后端配置

1. **验证码模式**:
   - 开发环境: `sms.enabled=false` （接受任意6位数字）
   - 生产环境: `sms.enabled=true` （严格验证Redis中的验证码）

2. **验证码限制**:
   - 发送间隔: 60秒
   - 有效期: 5分钟
   - 每日上限: 10次

3. **Gateway路由**:
   ```yaml
   - id: xypai-auth
     uri: lb://xypai-auth
     predicates:
       - Path=/xypai-auth/**
   ```

### 前端配置

1. **API Base URL**:
   ```typescript
   // 开发环境
   API_BASE_URL=http://localhost:8080

   // 生产环境
   API_BASE_URL=https://api.xiangyupai.com
   ```

2. **Token存储**:
   - 使用 `Expo SecureStore` 加密存储
   - 存储键: `token`

---

## 下一步工作

### 待完成功能

1. **Token刷新机制**
   - [ ] 后端实现 `/api/auth/token/refresh` 接口
   - [ ] 前端实现自动Token刷新拦截器

2. **登出功能**
   - [ ] 后端实现 `/api/auth/logout` 接口
   - [ ] 前端清理本地Token和用户信息

3. **用户资料接口**
   - [ ] 后端实现 `/api/auth/user/profile` 接口
   - [ ] 前端集成用户资料获取

4. **检查用户是否存在**
   - [ ] 后端实现 `/api/auth/user/exists` 接口
   - [ ] 前端在注册前检查用户是否已存在

### 优化建议

1. **错误码标准化**
   - 统一前后端错误码规范
   - 建立错误码映射表

2. **请求加密**
   - 生产环境启用RSA+AES加密
   - 参考 `SimpleSaTokenTest.java` 中的加密实现

3. **接口文档**
   - 使用 Swagger/OpenAPI 生成接口文档
   - 前端自动生成 TypeScript 类型定义

---

## 参考资料

### 后端文档
- 密码登录: `01-密码登录页面.md`
- SMS登录: `02-验证码登录页面.md`
- 忘记密码: `03-忘记密码页面.md`

### 测试文件
- `AppSmsRegistrationTest.java`
- `SmsRegisterAndLoginTest.java`
- `SimpleSaTokenTest.java`

### 前端文档
- 快速理解: `快速理解.md`
- 架构文档: `FRONTEND_ARCHITECTURE_STANDARD.md`

---

**维护者**: Claude Code
**最后更新**: 2025-11-24
