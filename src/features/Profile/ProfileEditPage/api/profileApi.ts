/**
 * Profile Edit API - 用户资料编辑API接口
 *
 * 提供完整的用户资料编辑API服务：
 * - 获取用户资料
 * - 更新各字段（单字段实时保存）
 * - 头像上传
 * - 地区数据获取
 *
 * @author XyPai Team
 * @since 2025-12-02
 */

import { apiClient } from '@/services/api/client';

import type {
  ApiResponse,
  AvatarUploadResponse,
  RegionData,
  UpdateBioRequest,
  UpdateBirthdayRequest,
  UpdateGenderRequest,
  UpdateHeightRequest,
  UpdateNicknameRequest,
  UpdateOccupationRequest,
  UpdateResidenceRequest,
  UpdateWechatRequest,
  UpdateWeightRequest,
  UserProfileData,
} from './types';

// #region API端点配置

/**
 * API端点配置
 *
 * Gateway路由规则：
 * - 前端请求: /xypai-user/api/user/profile/xxx
 * - Gateway StripPrefix=1 后转发到后端: /api/user/profile/xxx
 */
const API_ENDPOINTS = {
  // 用户资料
  GET_PROFILE_EDIT: '/xypai-user/api/user/profile/edit',      // 获取编辑数据
  UPDATE_NICKNAME: '/xypai-user/api/user/profile/nickname',   // 更新昵称
  UPDATE_GENDER: '/xypai-user/api/user/profile/gender',       // 更新性别
  UPDATE_BIRTHDAY: '/xypai-user/api/user/profile/birthday',   // 更新生日
  UPDATE_RESIDENCE: '/xypai-user/api/user/profile/residence', // 更新居住地
  UPDATE_HEIGHT: '/xypai-user/api/user/profile/height',       // 更新身高
  UPDATE_WEIGHT: '/xypai-user/api/user/profile/weight',       // 更新体重
  UPDATE_OCCUPATION: '/xypai-user/api/user/profile/occupation', // 更新职业
  UPDATE_WECHAT: '/xypai-user/api/user/profile/wechat',       // 更新微信
  UPDATE_BIO: '/xypai-user/api/user/profile/bio',             // 更新个人介绍
  UPLOAD_AVATAR: '/xypai-user/api/user/profile/avatar/upload', // 上传头像

  // 地区数据
  GET_REGIONS: '/xypai-user/api/common/regions',              // 获取地区列表
  GET_PROVINCES: '/xypai-user/api/common/regions/provinces',  // 获取省份列表
  GET_CITIES: '/xypai-user/api/common/regions/cities',        // 获取城市列表
} as const;

// #endregion

// #region 错误处理

/**
 * 格式化API错误
 */
const formatError = (error: any): Error => {
  if (error.response?.data?.message) {
    return new Error(error.response.data.message);
  }
  if (error.response?.data?.msg) {
    return new Error(error.response.data.msg);
  }
  if (error.message) {
    return new Error(error.message);
  }
  return new Error('请求失败，请稍后重试');
};

// #endregion

// #region API实现

/**
 * 用户资料编辑API类
 */
class ProfileEditAPI {
  /**
   * 获取用户资料（编辑页数据）
   */
  async getProfileEdit(): Promise<ApiResponse<UserProfileData>> {
    try {
      const response = await apiClient.get<ApiResponse<UserProfileData>>(
        API_ENDPOINTS.GET_PROFILE_EDIT
      );
      return response;
    } catch (error) {
      throw formatError(error);
    }
  }

  /**
   * 更新昵称
   * @param nickname 新昵称（2-20字符）
   */
  async updateNickname(nickname: string): Promise<ApiResponse<void>> {
    if (!nickname || nickname.length < 2 || nickname.length > 20) {
      throw new Error('昵称长度为2-20字符');
    }

    try {
      const request: UpdateNicknameRequest = { nickname };
      const response = await apiClient.put<ApiResponse<void>>(
        API_ENDPOINTS.UPDATE_NICKNAME,
        request
      );
      return response;
    } catch (error) {
      throw formatError(error);
    }
  }

  /**
   * 更新性别
   * @param gender 性别：male 或 female
   */
  async updateGender(gender: 'male' | 'female'): Promise<ApiResponse<void>> {
    if (!['male', 'female'].includes(gender)) {
      throw new Error('性别参数不正确');
    }

    try {
      const request: UpdateGenderRequest = { gender };
      const response = await apiClient.put<ApiResponse<void>>(
        API_ENDPOINTS.UPDATE_GENDER,
        request
      );
      return response;
    } catch (error) {
      throw formatError(error);
    }
  }

  /**
   * 更新生日
   * @param birthday 生日（YYYY-MM-DD 格式）
   */
  async updateBirthday(birthday: string): Promise<ApiResponse<void>> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
      throw new Error('生日格式不正确');
    }

    try {
      const request: UpdateBirthdayRequest = { birthday };
      const response = await apiClient.put<ApiResponse<void>>(
        API_ENDPOINTS.UPDATE_BIRTHDAY,
        request
      );
      return response;
    } catch (error) {
      throw formatError(error);
    }
  }

  /**
   * 更新居住地
   * @param residence 居住地（城市名称）
   */
  async updateResidence(residence: string): Promise<ApiResponse<void>> {
    if (!residence || residence.length > 200) {
      throw new Error('居住地不能超过200字符');
    }

    try {
      const request: UpdateResidenceRequest = { residence };
      const response = await apiClient.put<ApiResponse<void>>(
        API_ENDPOINTS.UPDATE_RESIDENCE,
        request
      );
      return response;
    } catch (error) {
      throw formatError(error);
    }
  }

  /**
   * 更新身高
   * @param height 身高（100-250 cm）
   */
  async updateHeight(height: number): Promise<ApiResponse<void>> {
    if (height < 100 || height > 250) {
      throw new Error('身高范围为100-250cm');
    }

    try {
      const request: UpdateHeightRequest = { height };
      const response = await apiClient.put<ApiResponse<void>>(
        API_ENDPOINTS.UPDATE_HEIGHT,
        request
      );
      return response;
    } catch (error) {
      throw formatError(error);
    }
  }

  /**
   * 更新体重
   * @param weight 体重（30-200 kg）
   */
  async updateWeight(weight: number): Promise<ApiResponse<void>> {
    if (weight < 30 || weight > 200) {
      throw new Error('体重范围为30-200kg');
    }

    try {
      const request: UpdateWeightRequest = { weight };
      const response = await apiClient.put<ApiResponse<void>>(
        API_ENDPOINTS.UPDATE_WEIGHT,
        request
      );
      return response;
    } catch (error) {
      throw formatError(error);
    }
  }

  /**
   * 更新职业
   * @param occupation 职业（1-100字符）
   */
  async updateOccupation(occupation: string): Promise<ApiResponse<void>> {
    if (!occupation || occupation.length > 100) {
      throw new Error('职业不能超过100字符');
    }

    try {
      const request: UpdateOccupationRequest = { occupation };
      const response = await apiClient.put<ApiResponse<void>>(
        API_ENDPOINTS.UPDATE_OCCUPATION,
        request
      );
      return response;
    } catch (error) {
      throw formatError(error);
    }
  }

  /**
   * 更新微信号
   * @param wechat 微信号（6-20字符，字母数字下划线）
   */
  async updateWechat(wechat: string): Promise<ApiResponse<void>> {
    if (!/^[a-zA-Z0-9_-]{6,20}$/.test(wechat)) {
      throw new Error('微信号格式不正确（6-20位字母数字下划线）');
    }

    try {
      const request: UpdateWechatRequest = { wechat };
      const response = await apiClient.put<ApiResponse<void>>(
        API_ENDPOINTS.UPDATE_WECHAT,
        request
      );
      return response;
    } catch (error) {
      throw formatError(error);
    }
  }

  /**
   * 更新个人介绍
   * @param bio 个人介绍（0-200字符）
   */
  async updateBio(bio: string): Promise<ApiResponse<void>> {
    if (bio && bio.length > 200) {
      throw new Error('个人介绍不能超过200字符');
    }

    try {
      const request: UpdateBioRequest = { bio };
      const response = await apiClient.put<ApiResponse<void>>(
        API_ENDPOINTS.UPDATE_BIO,
        request
      );
      return response;
    } catch (error) {
      throw formatError(error);
    }
  }

  /**
   * 上传头像
   * @param imageUri 本地图片URI
   */
  async uploadAvatar(imageUri: string): Promise<ApiResponse<AvatarUploadResponse>> {
    try {
      const formData = new FormData();

      // 获取文件扩展名
      const ext = imageUri.split('.').pop() || 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

      // 添加文件到FormData
      formData.append('avatar', {
        uri: imageUri,
        name: `avatar.${ext}`,
        type: mimeType,
      } as any);

      const response = await apiClient.post<ApiResponse<AvatarUploadResponse>>(
        API_ENDPOINTS.UPLOAD_AVATAR,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response;
    } catch (error) {
      throw formatError(error);
    }
  }

  /**
   * 获取省份列表
   */
  async getProvinces(): Promise<ApiResponse<RegionData[]>> {
    try {
      const response = await apiClient.get<ApiResponse<RegionData[]>>(
        API_ENDPOINTS.GET_PROVINCES
      );
      return response;
    } catch (error) {
      throw formatError(error);
    }
  }

  /**
   * 获取城市列表
   * @param provinceCode 省份编码
   */
  async getCities(provinceCode: string): Promise<ApiResponse<RegionData[]>> {
    try {
      const response = await apiClient.get<ApiResponse<RegionData[]>>(
        API_ENDPOINTS.GET_CITIES,
        {
          params: { provinceCode },
        }
      );
      return response;
    } catch (error) {
      throw formatError(error);
    }
  }

  /**
   * 通用更新字段方法
   * @param fieldKey 字段名
   * @param value 字段值
   */
  async updateField(fieldKey: string, value: any): Promise<ApiResponse<void>> {
    switch (fieldKey) {
      case 'nickname':
        return this.updateNickname(value);
      case 'gender':
        return this.updateGender(value);
      case 'birthday':
        return this.updateBirthday(value);
      case 'residence':
        return this.updateResidence(value);
      case 'height':
        return this.updateHeight(value);
      case 'weight':
        return this.updateWeight(value);
      case 'occupation':
        return this.updateOccupation(value);
      case 'wechat':
        return this.updateWechat(value);
      case 'bio':
        return this.updateBio(value);
      default:
        throw new Error(`未知字段: ${fieldKey}`);
    }
  }
}

// #endregion

// #region 实例和导出

/**
 * 用户资料编辑API实例
 */
export const profileEditApi = new ProfileEditAPI();

/**
 * 导出端点配置（用于调试）
 */
export { API_ENDPOINTS };

// #endregion
