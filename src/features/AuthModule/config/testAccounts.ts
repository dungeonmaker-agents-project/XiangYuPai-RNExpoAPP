/**
 * 测试账号配置
 * 
 * 🔐 用于开发和测试环境的白名单账号
 * ⚠️ 生产环境将自动禁用
 */

export interface TestAccount {
  phone: string;
  password: string;
  smsCode: string;  // 🆕 验证码登录专用验证码
  nickname: string;
  avatar?: string;
  verified: boolean;
  description?: string;
}

/**
 * 测试账号列表
 * 
 * 这些账号即使在假数据模式下也能正常登录
 */
export const TEST_ACCOUNTS: TestAccount[] = [
  {
    phone: '13800138000',
    password: 'test123456',
    smsCode: '888888',  // 🔐 专属验证码
    nickname: '测试管理员',
    avatar: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=Admin',
    verified: true,
    description: '管理员测试账号 | 密码: test123456 | 验证码: 888888',
  },
  {
    phone: '13800138001',
    password: 'test123456',
    smsCode: '666666',  // 🔐 专属验证码
    nickname: '测试用户A',
    avatar: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=User-A',
    verified: true,
    description: '普通用户测试账号A | 密码: test123456 | 验证码: 666666',
  },
  {
    phone: '13800138002',
    password: 'test123456',
    smsCode: '123456',  // 🔐 专属验证码
    nickname: '测试用户B',
    avatar: 'https://via.placeholder.com/150/95E1D3/FFFFFF?text=User-B',
    verified: false,
    description: '未认证用户测试账号B | 密码: test123456 | 验证码: 123456',
  },
];

/**
 * 根据手机号查找测试账号
 */
export const findTestAccount = (phone: string): TestAccount | undefined => {
  return TEST_ACCOUNTS.find(account => account.phone === phone);
};

/**
 * 验证测试账号密码
 * 
 * @param phone 手机号
 * @param password 密码
 * @returns 是否验证通过
 */
export const verifyTestAccount = (phone: string, password: string): boolean => {
  const account = findTestAccount(phone);
  if (!account) return false;
  return account.password === password;
};

/**
 * 🆕 验证测试账号验证码
 * 
 * @param phone 手机号
 * @param smsCode 验证码
 * @returns 是否验证通过
 */
export const verifyTestAccountSmsCode = (phone: string, smsCode: string): boolean => {
  const account = findTestAccount(phone);
  if (!account) return false;
  return account.smsCode === smsCode;
};

/**
 * 获取测试账号的用户信息
 */
export const getTestAccountUserInfo = (phone: string) => {
  const account = findTestAccount(phone);
  if (!account) return null;

  return {
    id: `test_user_${phone}`,
    phone: account.phone,
    nickname: account.nickname,
    avatar: account.avatar,
    verified: account.verified,
    createdAt: new Date().toISOString(),
  };
};

/**
 * 是否为测试账号
 */
export const isTestAccount = (phone: string): boolean => {
  return !!findTestAccount(phone);
};

/**
 * 获取所有测试账号列表（用于开发调试）
 */
export const getAllTestAccounts = (): TestAccount[] => {
  return TEST_ACCOUNTS;
};

