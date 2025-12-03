# Profile 模块 API 对接计划

> **版本**: v1.0.0
>
> **创建日期**: 2025-11-28
>
> **目标**: 前端 Profile 模块与后端 xypai-user 服务的接口对接

---

## 📋 对接概览

### 当前状态

| 分类 | 需要接口 | 已实现 | 待实现 |
|------|----------|--------|--------|
| 用户资料 | 17 | 6 | 11 |
| 社交关系 | 7 | 7 | 0 |
| 技能管理 | 9 | 0 | 9 |

### 文件变更清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `services/api/config.ts` | 修改 | 添加 Profile/Skill 端点配置 |
| `services/api/profileApi.ts` | 修改 | 扩展页面专用接口 |
| `services/api/skillApi.ts` | 新建 | 技能管理 API 服务 |
| `services/api/index.ts` | 修改 | 导出新增 API |

---

## 🔧 需要新增的 API 端点配置

### config.ts 新增配置

```typescript
// Profile 页面专用端点
PROFILE_PAGE: {
  // 页面数据加载
  EDIT: '/xypai-user/api/user/profile/edit',           // GET 编辑页面数据
  HEADER: '/xypai-user/api/user/profile/header',       // GET 主页头部
  OTHER: '/xypai-user/api/user/profile/other',         // GET /other/{userId}
  INFO: '/xypai-user/api/user/profile/info',           // GET 资料详情

  // Tab 数据
  POSTS: '/xypai-user/api/user/profile/posts',         // GET 动态列表
  FAVORITES: '/xypai-user/api/user/profile/favorites', // GET 收藏列表
  LIKES: '/xypai-user/api/user/profile/likes',         // GET 点赞列表

  // 单字段更新
  UPDATE_NICKNAME: '/xypai-user/api/user/profile/nickname',     // PUT
  UPDATE_GENDER: '/xypai-user/api/user/profile/gender',         // PUT
  UPDATE_BIRTHDAY: '/xypai-user/api/user/profile/birthday',     // PUT
  UPDATE_RESIDENCE: '/xypai-user/api/user/profile/residence',   // PUT
  UPDATE_HEIGHT: '/xypai-user/api/user/profile/height',         // PUT
  UPDATE_WEIGHT: '/xypai-user/api/user/profile/weight',         // PUT
  UPDATE_OCCUPATION: '/xypai-user/api/user/profile/occupation', // PUT
  UPDATE_WECHAT: '/xypai-user/api/user/profile/wechat',         // PUT
  UPDATE_BIO: '/xypai-user/api/user/profile/bio',               // PUT

  // 头像上传
  AVATAR_UPLOAD: '/xypai-user/api/user/profile/avatar/upload',  // POST multipart
},

// 技能管理端点
SKILL: {
  // 创建
  CREATE_ONLINE: '/xypai-user/api/user/skills/online',   // POST 创建线上技能
  CREATE_OFFLINE: '/xypai-user/api/user/skills/offline', // POST 创建线下技能

  // 查询
  MY_LIST: '/xypai-user/api/user/skills/my',             // GET 我的技能列表
  DETAIL: '/xypai-user/api/user/skills',                 // GET /{skillId}
  USER_LIST: '/xypai-user/api/user/skills/user',         // GET /user/{userId}
  NEARBY: '/xypai-user/api/user/skills/nearby',          // GET 附近技能

  // 操作
  UPDATE: '/xypai-user/api/user/skills',                 // PUT /{skillId}
  DELETE: '/xypai-user/api/user/skills',                 // DELETE /{skillId}
  TOGGLE: '/xypai-user/api/user/skills',                 // PUT /{skillId}/toggle
},
```

---

## 📝 profileApi.ts 需要新增的方法

### 1. 页面数据加载接口

```typescript
/**
 * 获取编辑资料页面数据
 * 触发时机: 进入编辑资料页面
 */
async getEditPageData(): Promise<ProfileEditData> {
  const response = await apiClient.get<ProfileEditData>(
    API_ENDPOINTS.PROFILE_PAGE.EDIT
  );
  return response.data;
}

/**
 * 获取个人主页头部数据
 * 触发时机: 进入个人主页
 */
async getProfileHeader(): Promise<ProfileHeaderData> {
  const response = await apiClient.get<ProfileHeaderData>(
    API_ENDPOINTS.PROFILE_PAGE.HEADER
  );
  return response.data;
}

/**
 * 获取他人主页数据
 * 触发时机: 查看他人主页
 * @param userId - 目标用户ID
 */
async getOtherUserProfile(userId: string | number): Promise<OtherUserProfileData> {
  const response = await apiClient.get<OtherUserProfileData>(
    `${API_ENDPOINTS.PROFILE_PAGE.OTHER}/${userId}`
  );
  return response.data;
}

/**
 * 获取个人资料详情
 * 触发时机: 点击"资料"Tab
 */
async getProfileInfo(): Promise<ProfileInfoData> {
  const response = await apiClient.get<ProfileInfoData>(
    API_ENDPOINTS.PROFILE_PAGE.INFO
  );
  return response.data;
}
```

### 2. Tab 数据接口

```typescript
/**
 * 获取动态列表
 * 触发时机: 点击"动态"Tab
 */
async getMyPosts(params: PageQuery): Promise<PostListResponse> {
  const response = await apiClient.get<PostListResponse>(
    API_ENDPOINTS.PROFILE_PAGE.POSTS,
    { params }
  );
  return response.data;
}

/**
 * 获取收藏列表
 * 触发时机: 点击"收藏"Tab
 */
async getMyFavorites(params: PageQuery): Promise<FavoriteListResponse> {
  const response = await apiClient.get<FavoriteListResponse>(
    API_ENDPOINTS.PROFILE_PAGE.FAVORITES,
    { params }
  );
  return response.data;
}

/**
 * 获取点赞列表
 * 触发时机: 点击"点赞"Tab
 */
async getMyLikes(params: PageQuery): Promise<LikeListResponse> {
  const response = await apiClient.get<LikeListResponse>(
    API_ENDPOINTS.PROFILE_PAGE.LIKES,
    { params }
  );
  return response.data;
}
```

### 3. 单字段更新接口

```typescript
/**
 * 更新昵称
 * @param nickname - 新昵称 (2-20字符)
 */
async updateNickname(nickname: string): Promise<void> {
  await apiClient.put(API_ENDPOINTS.PROFILE_PAGE.UPDATE_NICKNAME, { nickname });
}

/**
 * 更新性别
 * @param gender - 性别: 'male' | 'female' | 'other'
 */
async updateGender(gender: 'male' | 'female' | 'other'): Promise<void> {
  await apiClient.put(API_ENDPOINTS.PROFILE_PAGE.UPDATE_GENDER, { gender });
}

/**
 * 更新生日
 * @param birthday - 生日，格式: YYYY-MM-DD
 */
async updateBirthday(birthday: string): Promise<void> {
  await apiClient.put(API_ENDPOINTS.PROFILE_PAGE.UPDATE_BIRTHDAY, { birthday });
}

/**
 * 更新居住地
 * @param residence - 居住地地址
 */
async updateResidence(residence: string): Promise<void> {
  await apiClient.put(API_ENDPOINTS.PROFILE_PAGE.UPDATE_RESIDENCE, { residence });
}

/**
 * 更新身高
 * @param height - 身高(cm)，范围100-250
 */
async updateHeight(height: number): Promise<void> {
  await apiClient.put(API_ENDPOINTS.PROFILE_PAGE.UPDATE_HEIGHT, { height });
}

/**
 * 更新体重
 * @param weight - 体重(kg)，范围30-200
 */
async updateWeight(weight: number): Promise<void> {
  await apiClient.put(API_ENDPOINTS.PROFILE_PAGE.UPDATE_WEIGHT, { weight });
}

/**
 * 更新职业
 * @param occupation - 职业名称
 */
async updateOccupation(occupation: string): Promise<void> {
  await apiClient.put(API_ENDPOINTS.PROFILE_PAGE.UPDATE_OCCUPATION, { occupation });
}

/**
 * 更新微信号
 * @param wechat - 微信号 (6-20字符)
 */
async updateWechat(wechat: string): Promise<void> {
  await apiClient.put(API_ENDPOINTS.PROFILE_PAGE.UPDATE_WECHAT, { wechat });
}

/**
 * 更新个性签名
 * @param bio - 个性签名 (最多200字符)
 */
async updateBio(bio: string): Promise<void> {
  await apiClient.put(API_ENDPOINTS.PROFILE_PAGE.UPDATE_BIO, { bio });
}

/**
 * 上传头像
 * @param file - 图片文件
 * @param onProgress - 上传进度回调
 */
async uploadAvatar(
  file: File | Blob,
  onProgress?: (progress: number) => void
): Promise<AvatarUploadResponse> {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await apiClient.upload<AvatarUploadResponse>(
    API_ENDPOINTS.PROFILE_PAGE.AVATAR_UPLOAD,
    formData,
    onProgress
  );
  return response.data;
}
```

---

## 📝 skillApi.ts 新建文件

### 完整实现

```typescript
/**
 * Skill API 服务 - 技能管理相关接口
 *
 * 基于后端接口文档:
 * - SkillController: /api/user/skills/*
 *
 * @author XiangYuPai
 * @created 2025-11-28
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// ==================== 类型定义 ====================

/**
 * 技能类型
 */
export type SkillType = 'online' | 'offline';

/**
 * 价格单位
 */
export type PriceUnit = '局' | '小时' | '次' | '天';

/**
 * 可用时间段
 */
export interface AvailableTime {
  dayOfWeek: number;  // 1-7，周一到周日
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
}

/**
 * 位置信息
 */
export interface SkillLocation {
  address: string;
  latitude: number;
  longitude: number;
}

/**
 * 创建线上技能参数
 */
export interface CreateOnlineSkillParams {
  gameId?: string;
  gameName: string;
  gameRank: string;
  skillName: string;
  description: string;
  price: number;
  serviceHours: number;
  coverImage?: string;
  images?: string[];
  promises?: string[];
  isOnline?: boolean;
}

/**
 * 创建线下技能参数
 */
export interface CreateOfflineSkillParams {
  serviceType: string;
  serviceTypeName: string;
  skillName: string;
  description: string;
  price: number;
  priceUnit: PriceUnit;
  coverImage?: string;
  images?: string[];
  location: SkillLocation;
  availableTimes: AvailableTime[];
  promises?: string[];
  isOnline?: boolean;
}

/**
 * 技能列表项
 */
export interface SkillListItem {
  skillId: number;
  skillName: string;
  skillType: SkillType;
  coverImage: string;
  price: number;
  priceUnit: PriceUnit;
  isOnline: boolean;
  rating: number;
  reviewCount: number;
  orderCount: number;
  // 线上技能字段
  gameName?: string;
  gameRank?: string;
  // 线下技能字段
  serviceType?: string;
  serviceLocation?: string;
  distance?: number;
}

/**
 * 技能详情
 */
export interface SkillDetail extends SkillListItem {
  userId: number;
  description: string;
  serviceHours?: number;
  images: string[];
  promises: string[];
  location?: SkillLocation;
  availableTimes?: AvailableTime[];
  userInfo: {
    userId: number;
    nickname: string;
    avatar: string;
    isOnline: boolean;
    isVerified?: boolean;
  };
  reviews?: {
    summary: {
      averageRating: number;
      totalCount: number;
      ratingDistribution: Record<string, number>;
    };
    recentReviews: Array<{
      reviewId: number;
      userId: number;
      nickname: string;
      avatar: string;
      rating: number;
      content: string;
      createdAt: string;
    }>;
  };
  createdAt: string;
}

/**
 * 技能列表响应 (TableDataInfo格式)
 */
export interface SkillListResponse {
  total: number;
  rows: SkillListItem[];
  code: number;
  msg: string;
}

/**
 * 附近技能查询参数
 */
export interface NearbySkillParams {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  serviceType?: string;
  pageNum?: number;
  pageSize?: number;
}

// ==================== API 配置 ====================

const USE_MOCK_DATA = false;

// ==================== API 实现 ====================

export class SkillAPI {
  /**
   * 创建线上技能
   */
  async createOnlineSkill(params: CreateOnlineSkillParams): Promise<{ skillId: number }> {
    console.log('\n📱 [SkillAPI] ========== 创建线上技能 ==========');
    console.log('📱 技能名称:', params.skillName);
    console.log('📱 游戏:', params.gameName);

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { skillId: Math.floor(Math.random() * 10000) };
    }

    const response = await apiClient.post<{ skillId: number }>(
      API_ENDPOINTS.SKILL.CREATE_ONLINE,
      params
    );

    console.log('📱 [SkillAPI] 创建成功 - skillId:', response.data?.skillId);
    return response.data || { skillId: 0 };
  }

  /**
   * 创建线下技能
   */
  async createOfflineSkill(params: CreateOfflineSkillParams): Promise<{ skillId: number }> {
    console.log('\n📱 [SkillAPI] ========== 创建线下技能 ==========');
    console.log('📱 技能名称:', params.skillName);
    console.log('📱 服务类型:', params.serviceTypeName);

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { skillId: Math.floor(Math.random() * 10000) };
    }

    const response = await apiClient.post<{ skillId: number }>(
      API_ENDPOINTS.SKILL.CREATE_OFFLINE,
      params
    );

    console.log('📱 [SkillAPI] 创建成功 - skillId:', response.data?.skillId);
    return response.data || { skillId: 0 };
  }

  /**
   * 获取我的技能列表
   */
  async getMySkills(params: {
    pageNum?: number;
    pageSize?: number;
    skillType?: SkillType;
  } = {}): Promise<SkillListResponse> {
    const { pageNum = 1, pageSize = 10, skillType } = params;

    console.log('\n📱 [SkillAPI] ========== 获取我的技能列表 ==========');
    console.log('📱 分页:', { pageNum, pageSize });
    console.log('📱 技能类型:', skillType || '全部');

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return this.generateMockSkillList(pageNum, pageSize, skillType);
    }

    const queryParams = new URLSearchParams();
    queryParams.append('pageNum', String(pageNum));
    queryParams.append('pageSize', String(pageSize));
    if (skillType) queryParams.append('skillType', skillType);

    const response = await apiClient.get<SkillListResponse>(
      `${API_ENDPOINTS.SKILL.MY_LIST}?${queryParams.toString()}`
    );

    console.log('📱 [SkillAPI] 获取成功 - 数量:', response.data?.rows?.length || 0);
    return response.data || { total: 0, rows: [], code: 200, msg: '' };
  }

  /**
   * 获取技能详情
   */
  async getSkillDetail(skillId: number): Promise<SkillDetail | null> {
    console.log('\n📱 [SkillAPI] ========== 获取技能详情 ==========');
    console.log('📱 技能ID:', skillId);

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return this.generateMockSkillDetail(skillId);
    }

    const response = await apiClient.get<SkillDetail>(
      `${API_ENDPOINTS.SKILL.DETAIL}/${skillId}`
    );

    console.log('📱 [SkillAPI] 获取成功 - 技能名称:', response.data?.skillName);
    return response.data || null;
  }

  /**
   * 更新技能
   */
  async updateSkill(skillId: number, params: Partial<CreateOnlineSkillParams | CreateOfflineSkillParams>): Promise<void> {
    console.log('\n📱 [SkillAPI] ========== 更新技能 ==========');
    console.log('📱 技能ID:', skillId);

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return;
    }

    await apiClient.put(`${API_ENDPOINTS.SKILL.UPDATE}/${skillId}`, params);
    console.log('📱 [SkillAPI] 更新成功');
  }

  /**
   * 删除技能
   */
  async deleteSkill(skillId: number): Promise<void> {
    console.log('\n📱 [SkillAPI] ========== 删除技能 ==========');
    console.log('📱 技能ID:', skillId);

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return;
    }

    await apiClient.delete(`${API_ENDPOINTS.SKILL.DELETE}/${skillId}`);
    console.log('📱 [SkillAPI] 删除成功');
  }

  /**
   * 切换技能上下架状态
   */
  async toggleSkillStatus(skillId: number, isOnline: boolean): Promise<void> {
    console.log('\n📱 [SkillAPI] ========== 切换技能状态 ==========');
    console.log('📱 技能ID:', skillId);
    console.log('📱 目标状态:', isOnline ? '上架' : '下架');

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return;
    }

    await apiClient.put(`${API_ENDPOINTS.SKILL.TOGGLE}/${skillId}/toggle?isOnline=${isOnline}`);
    console.log('📱 [SkillAPI] 状态切换成功');
  }

  /**
   * 获取用户技能列表
   */
  async getUserSkills(userId: string | number, params: {
    pageNum?: number;
    pageSize?: number;
  } = {}): Promise<SkillListResponse> {
    const { pageNum = 1, pageSize = 20 } = params;

    console.log('\n📱 [SkillAPI] ========== 获取用户技能列表 ==========');
    console.log('📱 用户ID:', userId);

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return this.generateMockSkillList(pageNum, pageSize);
    }

    const queryParams = new URLSearchParams();
    queryParams.append('pageNum', String(pageNum));
    queryParams.append('pageSize', String(pageSize));

    const response = await apiClient.get<SkillListResponse>(
      `${API_ENDPOINTS.SKILL.USER_LIST}/${userId}?${queryParams.toString()}`
    );

    console.log('📱 [SkillAPI] 获取成功 - 数量:', response.data?.rows?.length || 0);
    return response.data || { total: 0, rows: [], code: 200, msg: '' };
  }

  /**
   * 搜索附近技能
   */
  async getNearbySkills(params: NearbySkillParams): Promise<SkillListResponse> {
    const { latitude, longitude, radiusMeters = 10000, serviceType, pageNum = 1, pageSize = 10 } = params;

    console.log('\n📱 [SkillAPI] ========== 搜索附近技能 ==========');
    console.log('📱 位置:', { latitude, longitude });
    console.log('📱 半径:', radiusMeters, '米');

    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return this.generateMockSkillList(pageNum, pageSize, 'offline');
    }

    const queryParams = new URLSearchParams();
    queryParams.append('latitude', String(latitude));
    queryParams.append('longitude', String(longitude));
    queryParams.append('radiusMeters', String(radiusMeters));
    queryParams.append('pageNum', String(pageNum));
    queryParams.append('pageSize', String(pageSize));
    if (serviceType) queryParams.append('serviceType', serviceType);

    const response = await apiClient.get<SkillListResponse>(
      `${API_ENDPOINTS.SKILL.NEARBY}?${queryParams.toString()}`
    );

    console.log('📱 [SkillAPI] 搜索成功 - 数量:', response.data?.rows?.length || 0);
    return response.data || { total: 0, rows: [], code: 200, msg: '' };
  }

  // ==================== Mock 数据生成 ====================

  private generateMockSkillList(pageNum: number, pageSize: number, skillType?: SkillType): SkillListResponse {
    const rows: SkillListItem[] = Array.from({ length: pageSize }, (_, i) => {
      const index = (pageNum - 1) * pageSize + i;
      const isOnlineSkill = skillType === 'online' || (!skillType && index % 2 === 0);

      return {
        skillId: 5000 + index,
        skillName: isOnlineSkill ? '王者荣耀陪玩' : '专业人像摄影',
        skillType: isOnlineSkill ? 'online' : 'offline',
        coverImage: `https://picsum.photos/200/200?random=skill${index}`,
        price: isOnlineSkill ? 30 : 200,
        priceUnit: isOnlineSkill ? '局' : '次',
        isOnline: true,
        rating: 4.5 + Math.random() * 0.5,
        reviewCount: Math.floor(Math.random() * 200),
        orderCount: Math.floor(Math.random() * 500),
        gameName: isOnlineSkill ? '王者荣耀' : undefined,
        gameRank: isOnlineSkill ? '王者' : undefined,
        serviceType: isOnlineSkill ? undefined : 'photography',
        serviceLocation: isOnlineSkill ? undefined : '深圳市南山区',
        distance: isOnlineSkill ? undefined : Math.random() * 10,
      };
    });

    return {
      total: 50,
      rows,
      code: 200,
      msg: '查询成功',
    };
  }

  private generateMockSkillDetail(skillId: number): SkillDetail {
    const isOnline = skillId % 2 === 0;

    return {
      skillId,
      userId: 10001,
      skillName: isOnline ? '王者荣耀陪玩' : '专业人像摄影',
      skillType: isOnline ? 'online' : 'offline',
      coverImage: 'https://picsum.photos/400/300',
      price: isOnline ? 30 : 200,
      priceUnit: isOnline ? '局' : '次',
      isOnline: true,
      rating: 4.8,
      reviewCount: 128,
      orderCount: 200,
      description: '这是技能详细介绍...',
      serviceHours: isOnline ? 1 : undefined,
      images: ['https://picsum.photos/400/300?random=1', 'https://picsum.photos/400/300?random=2'],
      promises: ['准时', '专业', '负责'],
      gameName: isOnline ? '王者荣耀' : undefined,
      gameRank: isOnline ? '王者' : undefined,
      serviceType: isOnline ? undefined : 'photography',
      location: isOnline ? undefined : {
        address: '深圳市南山区科技园',
        latitude: 22.5431,
        longitude: 114.0579,
      },
      userInfo: {
        userId: 10001,
        nickname: '技能达人',
        avatar: 'https://picsum.photos/100/100',
        isOnline: true,
        isVerified: true,
      },
      createdAt: '2025-11-01 10:00:00',
    };
  }
}

// 导出单例实例
export const skillApi = new SkillAPI();

// 默认导出
export default skillApi;
```

---

## 📝 TypeScript 类型定义

### 新增类型 (types/profile.ts)

```typescript
/**
 * Profile 模块类型定义
 */

// ==================== 基础类型 ====================

export interface UserStats {
  followingCount: number;
  fansCount: number;
  likesCount: number;
  postsCount?: number;
  collectionsCount?: number;
  skillsCount?: number;
}

export interface Privacy {
  showAge: boolean;
  showHeight: boolean;
  showWeight: boolean;
}

// ==================== 页面数据类型 ====================

/**
 * 编辑资料页面数据
 */
export interface ProfileEditData {
  userId: number;
  nickname: string;
  avatar: string | null;
  gender: 'male' | 'female' | 'other' | null;
  birthday: string | null;
  residence: string | null;
  height: number | null;
  weight: number | null;
  occupation: string | null;
  wechat: string | null;
  bio: string | null;
  isOnline: boolean;
  stats: UserStats;
  privacy?: Privacy;
}

/**
 * 主页头部数据
 */
export interface ProfileHeaderData {
  userId: number;
  nickname: string;
  avatar: string | null;
  backgroundImage: string | null;
  gender: 'male' | 'female' | 'other' | null;
  age: number | null;
  bio: string | null;
  isOnline: boolean;
  isVerified: boolean;
  verifiedType: 'official' | 'creator' | 'merchant' | null;
  stats: UserStats;
  tags: string[];
  level: number;
  memberType: 'normal' | 'vip' | 'svip';
}

/**
 * 他人主页数据
 */
export interface OtherUserProfileData extends ProfileHeaderData {
  followStatus: 'none' | 'following' | 'followed' | 'mutual';
  isBlocked: boolean;
  canViewProfile: boolean;
  canViewMoments: boolean;
  canViewSkills: boolean;
  skills?: SkillBrief[];
}

/**
 * 资料详情数据
 */
export interface ProfileInfoData extends ProfileEditData {
  age: number | null;
  constellation: string | null;
  hometown: string | null;
  education: string | null;
  school: string | null;
  company: string | null;
  interests: string[];
  skills: SkillBrief[];
  certifications: Certification[];
}

// ==================== 列表数据类型 ====================

/**
 * 动态项
 */
export interface PostItem {
  postId: number;
  content: string;
  images: string[];
  video: VideoInfo | null;
  location: LocationInfo | null;
  topics: TopicBrief[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  isCollected: boolean;
  createdAt: string;
  visibility: 'public' | 'friends' | 'private';
}

/**
 * 收藏项
 */
export interface FavoriteItem {
  favoriteId: number;
  targetType: 'post' | 'skill' | 'activity' | 'user';
  targetId: number;
  post?: PostBrief;
  skill?: SkillBrief;
  createdAt: string;
}

/**
 * 点赞项
 */
export interface LikeItem {
  likeId: number;
  targetType: 'post' | 'comment';
  targetId: number;
  post?: PostBrief;
  createdAt: string;
}

// ==================== 列表响应类型 ====================

export interface PostListResponse {
  list: PostItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface FavoriteListResponse {
  list: FavoriteItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface LikeListResponse {
  list: LikeItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ==================== 辅助类型 ====================

export interface VideoInfo {
  url: string;
  coverUrl: string;
  duration: number;
}

export interface LocationInfo {
  name: string;
  address: string;
}

export interface TopicBrief {
  topicId: number;
  topicName: string;
}

export interface PostBrief {
  postId: number;
  content: string;
  coverImage: string;
  author: UserBrief;
  likeCount: number;
  commentCount: number;
}

export interface UserBrief {
  userId: number;
  nickname: string;
  avatar: string;
}

export interface SkillBrief {
  skillId: number;
  skillName: string;
  skillType?: 'online' | 'offline';
  coverImage: string;
  price?: number;
  priceUnit?: string;
  rating?: number;
  provider?: UserBrief;
}

export interface Certification {
  type: 'identity' | 'occupation' | 'education';
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
}

export interface AvatarUploadResponse {
  avatarUrl: string;
  thumbnailUrl: string;
}

export interface PageQuery {
  page?: number;
  pageSize?: number;
}
```

---

## 📌 实现优先级

### 第一阶段 - 核心页面 (等待后端接口)

1. **个人主页**
   - `getProfileHeader()` - 头部数据
   - `getMyPosts()` - 动态列表
   - `getMyFavorites()` - 收藏列表
   - `getMyLikes()` - 点赞列表

2. **他人主页**
   - `getOtherUserProfile()` - 他人资料

3. **编辑资料**
   - `getEditPageData()` - 加载数据
   - `updateNickname()` - 更新昵称
   - `updateGender()` - 更新性别
   - 等其他单字段更新接口...

### 第二阶段 - 技能管理

1. 创建 `skillApi.ts`
2. 实现技能 CRUD 接口
3. 对接技能管理页面

### 第三阶段 - 增强功能

1. 头像上传
2. 背景图上传
3. 隐私设置

---

## 🧪 测试验证

后端接口完成后，使用以下方式验证：

1. **启动服务**
   ```
   Gateway: http://localhost:8080
   xypai-auth: http://localhost:9211
   xypai-user: http://localhost:9401
   ```

2. **运行后端测试**
   ```bash
   cd xypai-modules/xypai-user
   mvn test -Dtest=AppProfilePageTest
   mvn test -Dtest=AppEditProfilePageTest
   ```

3. **前端联调**
   - 切换 `USE_MOCK_DATA = false`
   - 在模拟器/真机上测试各页面功能

---

**文档版本**: v1.0.0

**最后更新**: 2025-11-28

**负责人**: XyPai Frontend Team
