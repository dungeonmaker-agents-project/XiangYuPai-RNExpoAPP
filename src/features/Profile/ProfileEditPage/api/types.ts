/**
 * ProfileEditPage API Types - 用户资料编辑接口类型定义
 *
 * 对应后端接口：
 * - GET /api/user/profile/edit - 获取编辑数据
 * - PUT /api/user/profile/* - 更新各字段
 * - POST /api/user/profile/avatar/upload - 上传头像
 * - GET /api/common/regions - 获取地区数据
 */

/**
 * 通用API响应格式（后端标准格式）
 */
export interface ApiResponse<T = any> {
  code: number;       // 200=成功，其他=失败
  message: string;    // 提示信息
  msg?: string;       // 备用消息字段
  data: T | null;     // 响应数据
}

/**
 * 用户资料数据（编辑页）
 */
export interface UserProfileData {
  userId: number;
  nickname: string;
  avatar: string | null;
  gender: 'male' | 'female' | null;
  birthday: string | null;      // YYYY-MM-DD 格式
  residence: string | null;     // 常居地（城市名称）
  height: number | null;        // 身高 (cm)
  weight: number | null;        // 体重 (kg)
  occupation: string | null;    // 职业
  wechat: string | null;        // 微信号
  bio: string | null;           // 个人介绍
  isOnline: boolean;
}

/**
 * 更新昵称请求
 */
export interface UpdateNicknameRequest {
  nickname: string;   // 2-20字符
}

/**
 * 更新性别请求
 */
export interface UpdateGenderRequest {
  gender: 'male' | 'female';
}

/**
 * 更新生日请求
 */
export interface UpdateBirthdayRequest {
  birthday: string;   // YYYY-MM-DD 格式
}

/**
 * 更新居住地请求
 */
export interface UpdateResidenceRequest {
  residence: string;  // 城市名称，如"深圳"
}

/**
 * 更新身高请求
 */
export interface UpdateHeightRequest {
  height: number;     // 100-250 cm
}

/**
 * 更新体重请求
 */
export interface UpdateWeightRequest {
  weight: number;     // 30-200 kg
}

/**
 * 更新职业请求
 */
export interface UpdateOccupationRequest {
  occupation: string; // 1-100字符
}

/**
 * 更新微信请求
 */
export interface UpdateWechatRequest {
  wechat: string;     // 6-20字符，字母数字下划线
}

/**
 * 更新个人介绍请求
 */
export interface UpdateBioRequest {
  bio: string;        // 0-200字符
}

/**
 * 头像上传响应
 */
export interface AvatarUploadResponse {
  url: string;        // 上传后的头像URL
}

/**
 * 地区数据
 */
export interface RegionData {
  code: string;       // 地区编码
  name: string;       // 地区名称
  hasChildren: boolean; // 是否有下级地区
}

/**
 * 编辑字段类型
 */
export type EditFieldType =
  | 'nickname'
  | 'gender'
  | 'bio'
  | 'birthday'
  | 'height'
  | 'weight'
  | 'occupation'
  | 'residence'
  | 'wechat';

/**
 * 编辑项交互类型
 */
export type EditInteractionType =
  | 'text'          // 文本输入（子页面）
  | 'textarea'      // 多行文本（子页面）
  | 'actionSheet'   // ActionSheet选择
  | 'picker'        // Picker滚轮选择
  | 'datePicker'    // 日期选择器
  | 'cityPicker'    // 城市选择器
  | 'subPage';      // 跳转子页面

/**
 * 编辑项配置
 */
export interface EditFieldConfig {
  key: EditFieldType;
  label: string;
  interactionType: EditInteractionType;
  maxLength?: number;
  placeholder?: string;
}

/**
 * 所有编辑字段配置
 */
export const EDIT_FIELD_CONFIGS: EditFieldConfig[] = [
  { key: 'nickname', label: '昵称', interactionType: 'subPage', maxLength: 20, placeholder: '请输入昵称' },
  { key: 'gender', label: '性别', interactionType: 'actionSheet', placeholder: '暂未选择' },
  { key: 'bio', label: '个人介绍', interactionType: 'subPage', maxLength: 30, placeholder: '请输入个人介绍' },
  { key: 'birthday', label: '生日', interactionType: 'datePicker', placeholder: '暂未选择' },
  { key: 'height', label: '身高', interactionType: 'picker', placeholder: '暂未选择' },
  { key: 'weight', label: '体重', interactionType: 'picker', placeholder: '暂未选择' },
  { key: 'occupation', label: '职业', interactionType: 'subPage', placeholder: '暂未选择' },
  { key: 'residence', label: '常居地', interactionType: 'cityPicker', placeholder: '暂未选择' },
  { key: 'wechat', label: '微信', interactionType: 'subPage', maxLength: 20, placeholder: '暂未填写' },
];
