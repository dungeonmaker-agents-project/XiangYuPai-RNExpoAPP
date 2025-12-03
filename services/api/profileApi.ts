/**
 * Profile API - 用户资料相关API接口
 *
 * 对接后端：xypai-user模块
 * - 用户资料查询和更新
 * - 在线状态管理
 * - 资料完整度
 * - 用户统计数据
 * - 职业标签管理
 * - 用户关系（关注/粉丝）
 *
 * 测试文件参考:
 * - AppProfilePageTest.java - 个人主页测试
 * - AppOtherUserProfilePageTest.java - 他人主页测试
 * - AppEditProfilePageTest.java - 编辑资料测试
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// #region 类型定义

/**
 * 用户资料VO（完整版42字段）
 * 对应后端：UserProfileVO
 */
export interface UserProfileVO {
  userId: number;
  nickname: string;
  avatar: string;
  avatarThumbnail?: string;
  backgroundImage?: string;
  
  // 基本信息
  gender: number;  // 0=未设置, 1=男, 2=女, 3=其他
  genderDesc: string;
  birthday?: string;  // YYYY-MM-DD
  age?: number;
  ageRange?: string;
  
  // 位置信息
  cityId?: number;
  cityName?: string;
  location?: string;
  address?: string;
  ipLocation?: string;
  
  // 详细资料
  bio?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  bmiLevel?: string;
  realName?: string;
  
  // 微信信息
  wechat?: string;
  wechatMasked?: string;
  wechatUnlockCondition: number;  // 0=公开, 1=关注后, 2=付费, 3=私密
  wechatUnlockDesc?: string;
  canViewWechat: boolean;
  
  // 认证标识
  isRealVerified: boolean;
  isGodVerified: boolean;
  isActivityExpert: boolean;
  isVip: boolean;
  isVipValid: boolean;
  isPopular: boolean;
  vipLevel: number;
  vipExpireTime?: string;
  
  // 在线状态
  onlineStatus: number;  // 0=离线, 1=在线, 2=忙碌, 3=隐身
  onlineStatusDesc: string;
  isOnline: boolean;
  lastOnlineTime?: string;
  
  // 资料完整度
  profileCompleteness: number;  // 0-100
  completenessLevel: string;
  isProfileComplete: boolean;
  lastEditTime?: string;
  
  // 职业标签
  occupations: UserOccupationVO[];
  
  // 统计数据
  stats: UserStatsVO;
  
  // 关系状态
  isFollowed: boolean;
  isMutualFollow: boolean;
  isBlocked: boolean;
  
  // 时间
  createdAt: string;
  updatedAt: string;
  version: number;
}

/**
 * 用户统计VO
 */
export interface UserStatsVO {
  userId: number;
  followerCount: number;      // 粉丝数
  followingCount: number;     // 关注数
  contentCount: number;       // 内容数
  totalLikeCount: number;     // 获赞总数
  totalCollectCount: number;  // 收藏总数
  activityOrganizerCount: number;
  activityParticipantCount: number;
  activitySuccessCount: number;
  activityCancelCount: number;
  activityOrganizerScore: number;
  activitySuccessRate: number;
  lastSyncTime: string;
  isActive: boolean;
  isPopular: boolean;
  isQualityOrganizer: boolean;
  followerFollowingRatio: number;
}

/**
 * 用户职业VO
 */
export interface UserOccupationVO {
  id: number;
  userId: number;
  occupationCode: string;
  occupationName: string;
  category: string;
  iconUrl?: string;
  sortOrder: number;
  createdAt: string;
  isPrimary: boolean;
}

/**
 * 资料完整度VO
 */
export interface ProfileCompletenessVO {
  userId: number;
  currentScore: number;        // 0-100
  level: string;               // 优秀/良好/一般/较差/极差
  isComplete: boolean;         // ≥80%
  coreFieldsScore: number;     // 核心字段得分（满分50）
  extendedFieldsScore: number; // 扩展字段得分（满分50）
  suggestions: string[];       // 完善建议
  completedItems: string[];    // 已完成项
  remainingScore: number;      // 距离完整还需多少分
  percentage: number;          // 完整度百分比
  progressColor: string;       // success/warning/danger
  message: string;
}

/**
 * 用户资料更新DTO
 */
export interface UserProfileUpdateDTO {
  userId?: number;
  nickname?: string;
  avatar?: string;
  avatarThumbnail?: string;
  backgroundImage?: string;
  gender?: number;
  birthday?: string;
  cityId?: number;
  location?: string;
  address?: string;
  bio?: string;
  height?: number;
  weight?: number;
  realName?: string;
  wechat?: string;
  wechatUnlockCondition?: number;
  onlineStatus?: number;
  version?: number;
}

/**
 * 职业更新DTO
 */
export interface UserOccupationUpdateDTO {
  occupationCodes: string[];  // 最多5个
  keepSortOrder?: boolean;
}

/**
 * 职业字典VO
 */
export interface OccupationDictVO {
  code: string;
  name: string;
  category: string;
  iconUrl?: string;
  sortOrder: number;
  status: number;
  statusDesc: string;
  createdAt: string;
  hasIcon: boolean;
}

// ==================== 页面专用类型定义 ====================

/**
 * 用户统计数据（页面版）
 */
export interface ProfilePageStats {
  followingCount: number;
  fansCount: number;
  likesCount: number;
  momentsCount?: number;
  postsCount?: number;
  collectionsCount?: number;
  skillsCount?: number;
  ordersCount?: number;
}

/**
 * 隐私设置
 */
export interface PrivacySettings {
  showAge: boolean;
  showHeight: boolean;
  showWeight: boolean;
}

/**
 * 编辑资料页面数据
 * 对应接口: GET /api/user/profile/edit
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
  stats: ProfilePageStats;
  followStatus?: string;
  privacy?: PrivacySettings;
  canViewProfile?: boolean;
  canViewMoments?: boolean;
  canViewSkills?: boolean;
}

/**
 * 主页头部数据
 * 对应接口: GET /api/user/profile/header
 */
export interface ProfileHeaderData {
  userId: number;
  nickname: string;
  avatar: string | null;
  backgroundImage?: string | null;
  gender: 'male' | 'female' | 'other' | null;
  age?: number | null;
  bio: string | null;
  isOnline: boolean;
  isVerified?: boolean;
  verifiedType?: 'official' | 'creator' | 'merchant' | null;
  stats: ProfilePageStats;
  tags?: string[];
  level?: number;
  memberType?: 'normal' | 'vip' | 'svip';
}

/**
 * 他人主页数据
 * 对应接口: GET /api/user/profile/other/{userId}
 */
export interface OtherUserProfileData extends ProfileHeaderData {
  followStatus: 'none' | 'following' | 'followed' | 'mutual';
  isBlocked?: boolean;
  canViewProfile: boolean;
  canViewMoments: boolean;
  canViewSkills: boolean;
  skills?: SkillBrief[];
}

/**
 * 技能简要信息
 */
export interface SkillBrief {
  skillId: number;
  skillName: string;
  skillType?: 'online' | 'offline';
  coverImage?: string;
  price?: number;
  priceUnit?: string;
  rating?: number;
}

/**
 * 资料详情数据
 * 对应接口: GET /api/user/profile/info
 */
export interface ProfileInfoData extends ProfileEditData {
  age?: number | null;
  constellation?: string | null;
  hometown?: string | null;
  education?: string | null;
  school?: string | null;
  company?: string | null;
  interests?: string[];
  skills?: SkillBrief[];
  certifications?: Certification[];
}

/**
 * 认证信息
 */
export interface Certification {
  type: 'identity' | 'occupation' | 'education';
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
}

/**
 * 分页查询参数
 */
export interface PageQuery {
  page?: number;
  pageSize?: number;
}

/**
 * 头像上传响应
 */
export interface AvatarUploadResponse {
  avatarUrl: string;
  thumbnailUrl?: string;
}

// #endregion

// #region API实现

/**
 * Profile API类
 */
class ProfileAPI {
  /**
   * 获取用户资料（他人主页）
   * GET /xypai-user/api/user/profile/other/{userId}
   * ⚠️ 注意：实际后端接口路径
   */
  async getUserProfile(userId: number): Promise<UserProfileVO> {
    console.log('\n🔥🔥🔥 [PROFILE API] getUserProfile 被调用');
    console.log('🔥 参数 userId:', userId);

    // ✅ 使用正确的后端接口: /api/user/profile/other/{userId}
    const url = `${API_ENDPOINTS.PROFILE_PAGE.OTHER}/${userId}`;
    console.log('🔥 请求 URL:', url);

    const response = await apiClient.get<UserProfileVO>(url);

    console.log('🔥 [PROFILE API] getUserProfile 响应成功');
    console.log('🔥 响应数据:', response.data ? '有数据' : '无数据');

    if (response.data) {
      console.log('🔥 response.data.nickname:', response.data.nickname);
      console.log('🔥 response.data.userId:', response.data.userId);
    }

    return response.data;
  }

  /**
   * 获取当前用户资料
   * GET /xypai-user/api/user/profile/header
   * ⚠️ 注意：实际后端接口路径
   */
  async getCurrentUserProfile(): Promise<UserProfileVO> {
    console.log('\n🔥🔥🔥 [PROFILE API] getCurrentUserProfile 被调用');

    // ✅ 使用正确的后端接口: /api/user/profile/header
    const url = API_ENDPOINTS.PROFILE_PAGE.HEADER;
    console.log('🔥 请求 URL:', url);

    const response = await apiClient.get<UserProfileVO>(url);

    console.log('🔥 [PROFILE API] getCurrentUserProfile 响应成功');
    console.log('🔥 响应数据:', response.data ? '有数据' : '无数据');

    return response.data;
  }

  /**
   * 更新用户资料
   * PUT /api/v2/user/profile/{userId}
   */
  async updateUserProfile(
    userId: number,
    data: UserProfileUpdateDTO
  ): Promise<void> {
    await apiClient.put(
      `${API_ENDPOINTS.PROFILE.USER_PROFILE}/${userId}`,
      data
    );
  }
  
  /**
   * 更新当前用户资料
   * PUT /api/v2/user/profile/current
   */
  async updateCurrentUserProfile(data: UserProfileUpdateDTO): Promise<void> {
    await apiClient.put(
      API_ENDPOINTS.PROFILE.CURRENT_PROFILE,
      data
    );
  }
  
  /**
   * 更新在线状态
   * PUT /api/v2/user/profile/{userId}/online-status?onlineStatus=X
   */
  async updateOnlineStatus(
    userId: number,
    onlineStatus: number
  ): Promise<void> {
    await apiClient.put(
      `${API_ENDPOINTS.PROFILE.USER_PROFILE}/${userId}/online-status?onlineStatus=${onlineStatus}`
    );
  }
  
  /**
   * 用户上线
   * PUT /api/v2/user/profile/current/go-online
   */
  async goOnline(): Promise<void> {
    await apiClient.put(API_ENDPOINTS.PROFILE.GO_ONLINE);
  }
  
  /**
   * 用户离线
   * PUT /api/v2/user/profile/current/go-offline
   */
  async goOffline(): Promise<void> {
    await apiClient.put(API_ENDPOINTS.PROFILE.GO_OFFLINE);
  }
  
  /**
   * 用户隐身
   * PUT /api/v2/user/profile/current/go-invisible
   */
  async goInvisible(): Promise<void> {
    await apiClient.put(API_ENDPOINTS.PROFILE.GO_INVISIBLE);
  }
  
  /**
   * 检查用户是否在线
   * GET /api/v2/user/profile/{userId}/is-online
   */
  async isUserOnline(userId: number): Promise<boolean> {
    const response = await apiClient.get<boolean>(
      `${API_ENDPOINTS.PROFILE.USER_PROFILE}/${userId}/is-online`
    );
    return response.data;
  }
  
  /**
   * 获取资料完整度
   * GET /api/v2/user/profile/{userId}/completeness
   */
  async getProfileCompleteness(userId: number): Promise<ProfileCompletenessVO> {
    const response = await apiClient.get<ProfileCompletenessVO>(
      `${API_ENDPOINTS.PROFILE.USER_PROFILE}/${userId}/completeness`
    );
    return response.data;
  }
  
  /**
   * 获取当前用户资料完整度
   * GET /api/v2/user/profile/current/completeness
   */
  async getCurrentUserCompleteness(): Promise<ProfileCompletenessVO> {
    const response = await apiClient.get<ProfileCompletenessVO>(
      `${API_ENDPOINTS.PROFILE.CURRENT_PROFILE}/completeness`
    );
    return response.data;
  }
  
  /**
   * 获取用户统计
   * GET /api/v1/users/stats/{userId}
   */
  async getUserStats(userId: number): Promise<UserStatsVO> {
    const response = await apiClient.get<UserStatsVO>(
      `${API_ENDPOINTS.USER_STATS.STATS}/${userId}`
    );
    return response.data;
  }
  
  /**
   * 获取当前用户统计
   * GET /api/v1/users/stats/current
   */
  async getCurrentUserStats(): Promise<UserStatsVO> {
    const response = await apiClient.get<UserStatsVO>(
      API_ENDPOINTS.USER_STATS.CURRENT
    );
    return response.data;
  }
  
  /**
   * 批量查询用户统计
   * POST /api/v1/users/stats/batch
   */
  async getBatchUserStats(userIds: number[]): Promise<UserStatsVO[]> {
    const response = await apiClient.post<UserStatsVO[]>(
      API_ENDPOINTS.USER_STATS.BATCH,
      userIds
    );
    return response.data;
  }
  
  /**
   * 获取人气用户排行
   * GET /api/v1/users/stats/popular?limit=X
   */
  async getPopularUsers(limit: number = 10): Promise<UserStatsVO[]> {
    const response = await apiClient.get<UserStatsVO[]>(
      `${API_ENDPOINTS.USER_STATS.POPULAR}?limit=${limit}`
    );
    return response.data;
  }
  
  /**
   * 查询用户职业
   * GET /api/v1/occupation/user/{userId}
   */
  async getUserOccupations(userId: number): Promise<UserOccupationVO[]> {
    const response = await apiClient.get<UserOccupationVO[]>(
      `${API_ENDPOINTS.OCCUPATION.USER}/${userId}`
    );
    return response.data;
  }
  
  /**
   * 查询当前用户职业
   * GET /api/v1/occupation/current
   */
  async getCurrentUserOccupations(): Promise<UserOccupationVO[]> {
    const response = await apiClient.get<UserOccupationVO[]>(
      API_ENDPOINTS.OCCUPATION.CURRENT
    );
    return response.data;
  }
  
  /**
   * 更新用户职业
   * PUT /api/v1/occupation/user/{userId}
   */
  async updateUserOccupations(
    userId: number,
    data: UserOccupationUpdateDTO
  ): Promise<void> {
    await apiClient.put(
      `${API_ENDPOINTS.OCCUPATION.USER}/${userId}`,
      data
    );
  }
  
  /**
   * 更新当前用户职业
   * PUT /api/v1/occupation/current
   */
  async updateCurrentUserOccupations(
    data: UserOccupationUpdateDTO
  ): Promise<void> {
    await apiClient.put(
      API_ENDPOINTS.OCCUPATION.CURRENT,
      data
    );
  }
  
  /**
   * 添加职业标签
   * POST /api/v1/occupation/user/{userId}/add?occupationCode=X
   */
  async addUserOccupation(
    userId: number,
    occupationCode: string
  ): Promise<void> {
    await apiClient.post(
      `${API_ENDPOINTS.OCCUPATION.USER}/${userId}/add?occupationCode=${occupationCode}`
    );
  }
  
  /**
   * 删除职业标签
   * DELETE /api/v1/occupation/user/{userId}/remove?occupationCode=X
   */
  async removeUserOccupation(
    userId: number,
    occupationCode: string
  ): Promise<void> {
    await apiClient.delete(
      `${API_ENDPOINTS.OCCUPATION.USER}/${userId}/remove?occupationCode=${occupationCode}`
    );
  }
  
  /**
   * 查询所有职业
   * GET /api/v1/occupation/list
   */
  async getAllOccupations(): Promise<OccupationDictVO[]> {
    const response = await apiClient.get<OccupationDictVO[]>(
      API_ENDPOINTS.OCCUPATION.LIST
    );
    return response.data;
  }
  
  /**
   * 根据分类查询职业
   * GET /api/v1/occupation/category/{category}
   */
  async getOccupationsByCategory(category: string): Promise<OccupationDictVO[]> {
    const response = await apiClient.get<OccupationDictVO[]>(
      `${API_ENDPOINTS.OCCUPATION.CATEGORY}/${category}`
    );
    return response.data;
  }
  
  /**
   * 关注用户
   * POST /api/v1/relations/follow/{targetUserId}
   */
  async followUser(targetUserId: number): Promise<void> {
    await apiClient.post(
      `${API_ENDPOINTS.RELATION.FOLLOW}/${targetUserId}`
    );
  }
  
  /**
   * 取消关注
   * DELETE /api/v1/relations/follow/{targetUserId}
   */
  async unfollowUser(targetUserId: number): Promise<void> {
    await apiClient.delete(
      `${API_ENDPOINTS.RELATION.FOLLOW}/${targetUserId}`
    );
  }
  
  /**
   * 获取关注列表
   * GET /api/v1/relations/following
   */
  async getFollowingList(params?: {
    userId?: number;
    pageNum?: number;
    pageSize?: number;
  }): Promise<{ total: number; rows: any[] }> {
    const queryString = params 
      ? `?${Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&')}`
      : '';
    const response = await apiClient.get<{ total: number; rows: any[] }>(
      `${API_ENDPOINTS.RELATION.FOLLOWING}${queryString}`
    );
    return response.data;
  }
  
  /**
   * 获取粉丝列表
   * GET /api/v1/relations/followers
   */
  async getFollowersList(params?: {
    userId?: number;
    pageNum?: number;
    pageSize?: number;
  }): Promise<{ total: number; rows: any[] }> {
    const queryString = params 
      ? `?${Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&')}`
      : '';
    const response = await apiClient.get<{ total: number; rows: any[] }>(
      `${API_ENDPOINTS.RELATION.FOLLOWERS}${queryString}`
    );
    return response.data;
  }
  
  /**
   * 获取指定用户关注列表
   * GET /api/v1/relations/{userId}/following
   */
  async getUserFollowingList(
    userId: number,
    params?: { pageNum?: number; pageSize?: number }
  ): Promise<{ total: number; rows: any[] }> {
    const queryString = params 
      ? `?${Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&')}`
      : '';
    const response = await apiClient.get<{ total: number; rows: any[] }>(
      `${API_ENDPOINTS.RELATION.USER_RELATIONS}/${userId}/following${queryString}`
    );
    return response.data;
  }
  
  /**
   * 获取指定用户粉丝列表
   * GET /api/v1/relations/{userId}/followers
   */
  async getUserFollowersList(
    userId: number,
    params?: { pageNum?: number; pageSize?: number }
  ): Promise<{ total: number; rows: any[] }> {
    const queryString = params 
      ? `?${Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&')}`
      : '';
    const response = await apiClient.get<{ total: number; rows: any[] }>(
      `${API_ENDPOINTS.RELATION.USER_RELATIONS}/${userId}/followers${queryString}`
    );
    return response.data;
  }
  
  /**
   * 检查用户关系
   * GET /api/v1/relations/check/{targetUserId}
   */
  async checkUserRelation(targetUserId: number): Promise<{
    isFollowed: boolean;
    isMutualFollow: boolean;
    isBlocked: boolean;
  }> {
    const response = await apiClient.get<Record<string, boolean>>(
      `${API_ENDPOINTS.RELATION.CHECK}/${targetUserId}`
    );
    const data = response.data;
    return {
      isFollowed: data.isFollowed || false,
      isMutualFollow: data.isMutualFollow || false,
      isBlocked: data.isBlocked || false,
    };
  }
  
  /**
   * 拉黑用户
   * POST /api/v1/relations/block/{targetUserId}
   */
  async blockUser(targetUserId: number): Promise<void> {
    await apiClient.post(
      `${API_ENDPOINTS.RELATION.BLOCK}/${targetUserId}`
    );
  }
  
  /**
   * 取消拉黑
   * DELETE /api/v1/relations/block/{targetUserId}
   */
  async unblockUser(targetUserId: number): Promise<void> {
    await apiClient.delete(
      `${API_ENDPOINTS.RELATION.BLOCK}/${targetUserId}`
    );
  }

  // ==================== 页面专用接口 ====================

  /**
   * 获取编辑资料页面数据
   * GET /api/user/profile/edit
   * 触发时机: 进入编辑资料页面
   */
  async getEditPageData(): Promise<ProfileEditData> {
    console.log('\n📱 [ProfileAPI] ========== 获取编辑资料数据 ==========');

    const response = await apiClient.get<ProfileEditData>(
      API_ENDPOINTS.PROFILE_PAGE.EDIT
    );

    console.log('📱 [ProfileAPI] 编辑数据获取成功 - userId:', response.data?.userId);
    return response.data;
  }

  /**
   * 获取个人主页头部数据
   * GET /api/user/profile/header
   * 触发时机: 进入个人主页
   */
  async getProfileHeader(): Promise<ProfileHeaderData> {
    console.log('\n📱 [ProfileAPI] ========== 获取主页头部数据 ==========');

    const response = await apiClient.get<ProfileHeaderData>(
      API_ENDPOINTS.PROFILE_PAGE.HEADER
    );

    console.log('📱 [ProfileAPI] 头部数据获取成功 - userId:', response.data?.userId);
    return response.data;
  }

  /**
   * 获取他人主页数据
   * GET /api/user/profile/other/{userId}
   * 触发时机: 查看他人主页
   */
  async getOtherUserProfile(userId: string | number): Promise<OtherUserProfileData> {
    console.log('\n📱 [ProfileAPI] ========== 获取他人主页数据 ==========');
    console.log('📱 目标用户ID:', userId);

    const response = await apiClient.get<OtherUserProfileData>(
      `${API_ENDPOINTS.PROFILE_PAGE.OTHER}/${userId}`
    );

    console.log('📱 [ProfileAPI] 他人主页数据获取成功 - followStatus:', response.data?.followStatus);
    return response.data;
  }

  /**
   * 获取个人资料详情
   * GET /api/user/profile/info
   * 触发时机: 点击"资料"Tab
   */
  async getProfileInfo(): Promise<ProfileInfoData> {
    console.log('\n📱 [ProfileAPI] ========== 获取资料详情 ==========');

    const response = await apiClient.get<ProfileInfoData>(
      API_ENDPOINTS.PROFILE_PAGE.INFO
    );

    console.log('📱 [ProfileAPI] 资料详情获取成功 - userId:', response.data?.userId);
    return response.data;
  }

  // ==================== 单字段更新接口 ====================

  /**
   * 更新昵称
   * PUT /api/user/profile/nickname
   * @param nickname - 新昵称 (2-20字符)
   */
  async updateNickname(nickname: string): Promise<void> {
    console.log('📱 [ProfileAPI] 更新昵称:', nickname);
    await apiClient.put(API_ENDPOINTS.PROFILE_PAGE.UPDATE_NICKNAME, { nickname });
  }

  /**
   * 更新性别
   * PUT /api/user/profile/gender
   * @param gender - 性别: 'male' | 'female' | 'other'
   */
  async updateGender(gender: 'male' | 'female' | 'other'): Promise<void> {
    console.log('📱 [ProfileAPI] 更新性别:', gender);
    await apiClient.put(API_ENDPOINTS.PROFILE_PAGE.UPDATE_GENDER, { gender });
  }

  /**
   * 更新生日
   * PUT /api/user/profile/birthday
   * @param birthday - 生日，格式: YYYY-MM-DD
   */
  async updateBirthday(birthday: string): Promise<void> {
    console.log('📱 [ProfileAPI] 更新生日:', birthday);
    await apiClient.put(API_ENDPOINTS.PROFILE_PAGE.UPDATE_BIRTHDAY, { birthday });
  }

  /**
   * 更新居住地
   * PUT /api/user/profile/residence
   * @param residence - 居住地地址
   */
  async updateResidence(residence: string): Promise<void> {
    console.log('📱 [ProfileAPI] 更新居住地:', residence);
    await apiClient.put(API_ENDPOINTS.PROFILE_PAGE.UPDATE_RESIDENCE, { residence });
  }

  /**
   * 更新身高
   * PUT /api/user/profile/height
   * @param height - 身高(cm)，范围100-250
   */
  async updateHeight(height: number): Promise<void> {
    console.log('📱 [ProfileAPI] 更新身高:', height);
    await apiClient.put(API_ENDPOINTS.PROFILE_PAGE.UPDATE_HEIGHT, { height });
  }

  /**
   * 更新体重
   * PUT /api/user/profile/weight
   * @param weight - 体重(kg)，范围30-200
   */
  async updateWeight(weight: number): Promise<void> {
    console.log('📱 [ProfileAPI] 更新体重:', weight);
    await apiClient.put(API_ENDPOINTS.PROFILE_PAGE.UPDATE_WEIGHT, { weight });
  }

  /**
   * 更新职业
   * PUT /api/user/profile/occupation
   * @param occupation - 职业名称
   */
  async updateOccupation(occupation: string): Promise<void> {
    console.log('📱 [ProfileAPI] 更新职业:', occupation);
    await apiClient.put(API_ENDPOINTS.PROFILE_PAGE.UPDATE_OCCUPATION, { occupation });
  }

  /**
   * 更新微信号
   * PUT /api/user/profile/wechat
   * @param wechat - 微信号 (6-20字符)
   */
  async updateWechat(wechat: string): Promise<void> {
    console.log('📱 [ProfileAPI] 更新微信号:', wechat);
    await apiClient.put(API_ENDPOINTS.PROFILE_PAGE.UPDATE_WECHAT, { wechat });
  }

  /**
   * 更新个性签名
   * PUT /api/user/profile/bio
   * @param bio - 个性签名 (最多200字符)
   */
  async updateBio(bio: string): Promise<void> {
    console.log('📱 [ProfileAPI] 更新个性签名:', bio);
    await apiClient.put(API_ENDPOINTS.PROFILE_PAGE.UPDATE_BIO, { bio });
  }

  /**
   * 上传头像
   * POST /api/user/profile/avatar/upload
   * @param file - 图片文件
   * @param onProgress - 上传进度回调
   */
  async uploadAvatar(
    file: File | Blob,
    onProgress?: (progress: number) => void
  ): Promise<AvatarUploadResponse> {
    console.log('\n📱 [ProfileAPI] ========== 上传头像 ==========');

    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.upload<AvatarUploadResponse>(
      API_ENDPOINTS.PROFILE_PAGE.AVATAR_UPLOAD,
      formData,
      onProgress
    );

    console.log('📱 [ProfileAPI] 头像上传成功:', response.data?.avatarUrl);
    return response.data;
  }
}

// #endregion

// #region Mock数据（开发测试用）

/**
 * 生成模拟用户资料
 */
const generateMockProfile = (userId: number): UserProfileVO => {
  return {
    userId,
    nickname: '门前游过一群鸭',
    avatar: 'https://picsum.photos/200/200',
    avatarThumbnail: 'https://picsum.photos/100/100',
    backgroundImage: 'https://picsum.photos/800/600',
    
    gender: 2,  // 女
    genderDesc: '女',
    birthday: '1999-09-29',
    age: 25,
    ageRange: '20-30',
    
    cityId: 440300,
    cityName: '深圳市',
    location: '广东 深圳',
    address: '深圳市南山区',
    ipLocation: '广东 深圳',
    
    bio: '人皮话多不高冷的真实写照',
    height: 162,
    weight: 44,
    bmi: 16.8,
    bmiLevel: '正常',
    realName: '张三',
    
    wechat: 'sunny0301',
    wechatMasked: 'sun***301',
    wechatUnlockCondition: 0,  // 公开
    wechatUnlockDesc: '公开',
    canViewWechat: true,
    
    isRealVerified: true,
    isGodVerified: true,
    isActivityExpert: false,
    isVip: false,
    isVipValid: false,
    isPopular: true,
    vipLevel: 0,
    
    onlineStatus: 1,  // 在线
    onlineStatusDesc: '在线',
    isOnline: true,
    lastOnlineTime: new Date().toISOString(),
    
    profileCompleteness: 85,
    completenessLevel: '优秀',
    isProfileComplete: true,
    lastEditTime: new Date().toISOString(),
    
    occupations: [
      {
        id: 1,
        userId,
        occupationCode: 'model',
        occupationName: '模特',
        category: 'lifestyle',
        iconUrl: '',
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        isPrimary: true,
      },
    ],
    
    stats: {
      userId,
      followerCount: 201,
      followingCount: 201,
      contentCount: 88,
      totalLikeCount: 999,
      totalCollectCount: 150,
      activityOrganizerCount: 10,
      activityParticipantCount: 25,
      activitySuccessCount: 20,
      activityCancelCount: 2,
      activityOrganizerScore: 4.8,
      activitySuccessRate: 90.0,
      lastSyncTime: new Date().toISOString(),
      isActive: true,
      isPopular: true,
      isQualityOrganizer: true,
      followerFollowingRatio: 1.0,
    },
    
    isFollowed: false,
    isMutualFollow: false,
    isBlocked: false,
    
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  };
};

/**
 * 生成模拟资料完整度
 */
const generateMockCompleteness = (userId: number): ProfileCompletenessVO => {
  return {
    userId,
    currentScore: 85,
    level: '优秀',
    isComplete: true,
    coreFieldsScore: 45,
    extendedFieldsScore: 40,
    suggestions: [
      '上传更多照片可增加10分',
      '完善技能标签可增加5分',
    ],
    completedItems: [
      '头像',
      '昵称',
      '性别',
      '生日',
      '位置',
      '身高',
      '体重',
      '职业',
    ],
    remainingScore: 15,
    percentage: 85,
    progressColor: 'success',
    message: '资料完整度优秀，继续保持！',
  };
};

/**
 * Mock Profile API（开发环境使用）
 */
export const mockProfileApi = {
  async getUserProfile(userId: number): Promise<UserProfileVO> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return generateMockProfile(userId);
  },
  
  async getCurrentUserProfile(): Promise<UserProfileVO> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return generateMockProfile(1);  // 当前用户ID=1
  },
  
  async updateUserProfile(
    userId: number,
    data: UserProfileUpdateDTO
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Mock: 更新用户资料', userId, data);
  },
  
  async updateCurrentUserProfile(data: UserProfileUpdateDTO): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Mock: 更新当前用户资料', data);
  },
  
  async getUserStats(userId: number): Promise<UserStatsVO> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return generateMockProfile(userId).stats;
  },
  
  async getCurrentUserStats(): Promise<UserStatsVO> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return generateMockProfile(1).stats;
  },
  
  async getCurrentUserCompleteness(): Promise<ProfileCompletenessVO> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return generateMockCompleteness(1);
  },
  
  async getUserOccupations(userId: number): Promise<UserOccupationVO[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return generateMockProfile(userId).occupations;
  },
  
  async updateCurrentUserOccupations(
    data: UserOccupationUpdateDTO
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Mock: 更新职业标签', data);
  },
  
  async getAllOccupations(): Promise<OccupationDictVO[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      {
        code: 'model',
        name: '模特',
        category: 'lifestyle',
        iconUrl: '',
        sortOrder: 1,
        status: 1,
        statusDesc: '启用',
        createdAt: new Date().toISOString(),
        hasIcon: false,
      },
      {
        code: 'student',
        name: '学生',
        category: 'education',
        iconUrl: '',
        sortOrder: 2,
        status: 1,
        statusDesc: '启用',
        createdAt: new Date().toISOString(),
        hasIcon: false,
      },
      {
        code: 'office_worker',
        name: '白领',
        category: 'profession',
        iconUrl: '',
        sortOrder: 3,
        status: 1,
        statusDesc: '启用',
        createdAt: new Date().toISOString(),
        hasIcon: false,
      },
    ];
  },
  
  async followUser(targetUserId: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Mock: 关注用户', targetUserId);
  },
  
  async unfollowUser(targetUserId: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Mock: 取消关注', targetUserId);
  },
  
  async checkUserRelation(targetUserId: number): Promise<{
    isFollowed: boolean;
    isMutualFollow: boolean;
    isBlocked: boolean;
  }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      isFollowed: false,
      isMutualFollow: false,
      isBlocked: false,
    };
  },
  
  async getFollowingList(params?: any): Promise<{ total: number; rows: any[] }> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      total: 201,
      rows: [],  // TODO: 生成模拟关注列表
    };
  },
  
  async getFollowersList(params?: any): Promise<{ total: number; rows: any[] }> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      total: 201,
      rows: [],  // TODO: 生成模拟粉丝列表
    };
  },
};

// #endregion

// #region 实例和导出

/**
 * Profile API实例
 */
export const profileApi = new ProfileAPI();

// #endregion

