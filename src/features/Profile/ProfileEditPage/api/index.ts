/**
 * ProfileEditPage API 导出
 *
 * 导出用户资料编辑相关的API和类型
 */

export { profileEditApi, API_ENDPOINTS } from './profileApi';

export type {
  ApiResponse,
  UserProfileData,
  UpdateNicknameRequest,
  UpdateGenderRequest,
  UpdateBirthdayRequest,
  UpdateResidenceRequest,
  UpdateHeightRequest,
  UpdateWeightRequest,
  UpdateOccupationRequest,
  UpdateWechatRequest,
  UpdateBioRequest,
  AvatarUploadResponse,
  RegionData,
  EditFieldType,
  EditInteractionType,
  EditFieldConfig,
} from './types';

export { EDIT_FIELD_CONFIGS } from './types';
