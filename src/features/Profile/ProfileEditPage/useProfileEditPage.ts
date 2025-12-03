/**
 * useProfileEditPage - 个人资料编辑页面 Hook
 *
 * 功能：
 * - 从真实 API 加载用户资料
 * - 使用真实 API 更新各字段
 * - 管理加载和错误状态
 * - 处理乐观更新
 *
 * @author XyPai Team
 * @since 2025-12-02
 */

import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { profileEditApi } from './api/profileApi';
import { occupationApi } from './api/occupationApi';
import type { UserProfileData } from './api/types';

// #region 类型定义

export interface ProfileEditState {
  // 用户资料
  profile: UserProfileData | null;
  // 头像
  avatarUri: string;
  // 职业列表（多选）
  occupations: string[];
  // 加载状态
  isLoading: boolean;
  isRefreshing: boolean;
  isSaving: boolean;
  // 错误状态
  error: string | null;
}

export interface EditItem {
  id: string;
  label: string;
  value: string;
  type?: 'text' | 'select' | 'date';
  placeholder?: string;
}

// 选项配置
export interface PickerOption {
  label: string;
  value: string | number;
}

// #endregion

// #region 常量配置

export const GENDER_OPTIONS: PickerOption[] = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
];

export const HEIGHT_OPTIONS: PickerOption[] = Array.from({ length: 71 }, (_, i) => {
  const height = 150 + i;
  return { label: `${height}cm`, value: height };
});

export const WEIGHT_OPTIONS: PickerOption[] = Array.from({ length: 91 }, (_, i) => {
  const weight = 40 + i;
  return { label: `${weight}kg`, value: weight };
});

// #endregion

// #region Hook 实现

export const useProfileEditPage = () => {
  const router = useRouter();

  // 状态
  const [state, setState] = useState<ProfileEditState>({
    profile: null,
    avatarUri: '',
    occupations: [],
    isLoading: true,
    isRefreshing: false,
    isSaving: false,
    error: null,
  });

  // 底部弹窗状态
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTitle, setPickerTitle] = useState('');
  const [pickerOptions, setPickerOptions] = useState<PickerOption[]>([]);
  const [pickerField, setPickerField] = useState('');
  const [pickerValue, setPickerValue] = useState<string | number>();

  // #region 数据加载

  /**
   * 加载用户资料
   */
  const loadProfile = useCallback(async () => {
    console.log('\n📝 [ProfileEditPage] 开始加载用户资料...');

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // 加载用户资料
      const profileResponse = await profileEditApi.getProfileEdit();

      if (profileResponse.code === 200 && profileResponse.data) {
        const profile = profileResponse.data;

        // 尝试加载职业列表（容错处理：后端可能还未部署此 API）
        let occupations: string[] = [];
        try {
          const occupationsResponse = await occupationApi.getOccupations();
          if (occupationsResponse.code === 200 && occupationsResponse.data) {
            occupations = occupationsResponse.data;
          }
        } catch (occError) {
          console.warn('⚠️ 职业列表加载失败（后端职业API可能未部署），使用空列表');
          // 不影响主流程，职业列表为空即可
        }

        console.log('✅ 资料加载成功:', profile.nickname);
        console.log('✅ 职业列表:', occupations);

        setState(prev => ({
          ...prev,
          profile,
          avatarUri: profile.avatar || '',
          occupations,
          isLoading: false,
        }));
      } else {
        throw new Error(profileResponse.message || '加载资料失败');
      }
    } catch (error) {
      console.error('❌ 加载资料失败:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '加载失败',
      }));
    }
  }, []);

  /**
   * 刷新资料
   */
  const refreshProfile = useCallback(async () => {
    setState(prev => ({ ...prev, isRefreshing: true }));
    await loadProfile();
    setState(prev => ({ ...prev, isRefreshing: false }));
  }, [loadProfile]);

  // 页面初始化和获得焦点时加载数据
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useFocusEffect(
    useCallback(() => {
      // 页面获得焦点时刷新数据（可能从子页面返回后数据有变化）
      loadProfile();
    }, [loadProfile])
  );

  // #endregion

  // #region 字段更新

  /**
   * 更新字段（通用方法）
   */
  const updateField = useCallback(async (fieldKey: string, value: any): Promise<boolean> => {
    console.log(`📝 更新字段: ${fieldKey} = ${value}`);

    try {
      setState(prev => ({ ...prev, isSaving: true }));

      const response = await profileEditApi.updateField(fieldKey, value);

      if (response.code === 200) {
        // 乐观更新本地状态
        setState(prev => ({
          ...prev,
          profile: prev.profile ? { ...prev.profile, [fieldKey]: value } : null,
          isSaving: false,
        }));

        console.log(`✅ ${fieldKey} 更新成功`);
        return true;
      } else {
        throw new Error(response.message || response.msg || '更新失败');
      }
    } catch (error) {
      console.error(`❌ ${fieldKey} 更新失败:`, error);
      setState(prev => ({ ...prev, isSaving: false }));
      Alert.alert('更新失败', error instanceof Error ? error.message : '请稍后重试');
      return false;
    }
  }, []);

  /**
   * 更新头像
   */
  const updateAvatar = useCallback(async (imageUri: string): Promise<boolean> => {
    console.log('📷 上传头像:', imageUri);

    try {
      setState(prev => ({ ...prev, isSaving: true }));

      const response = await profileEditApi.uploadAvatar(imageUri);

      if (response.code === 200 && response.data?.url) {
        setState(prev => ({
          ...prev,
          avatarUri: response.data!.url,
          profile: prev.profile ? { ...prev.profile, avatar: response.data!.url } : null,
          isSaving: false,
        }));

        console.log('✅ 头像上传成功:', response.data.url);
        return true;
      } else {
        throw new Error(response.message || '上传失败');
      }
    } catch (error) {
      console.error('❌ 头像上传失败:', error);
      setState(prev => ({ ...prev, isSaving: false }));
      Alert.alert('上传失败', error instanceof Error ? error.message : '请稍后重试');
      return false;
    }
  }, []);

  /**
   * 更新职业列表（多选）
   */
  const updateOccupations = useCallback(async (newOccupations: string[]): Promise<boolean> => {
    console.log('📝 更新职业列表:', newOccupations);

    try {
      setState(prev => ({ ...prev, isSaving: true }));

      const response = await occupationApi.updateOccupations(newOccupations);

      if (response.code === 200) {
        setState(prev => ({
          ...prev,
          occupations: newOccupations,
          isSaving: false,
        }));

        console.log('✅ 职业列表更新成功');
        return true;
      } else {
        throw new Error(response.message || '更新失败');
      }
    } catch (error) {
      console.error('❌ 职业列表更新失败:', error);
      setState(prev => ({ ...prev, isSaving: false }));
      Alert.alert('更新失败', error instanceof Error ? error.message : '请稍后重试');
      return false;
    }
  }, []);

  // #endregion

  // #region 编辑项列表

  /**
   * 获取编辑项列表
   */
  const getEditItems = useCallback((): EditItem[] => {
    const { profile, occupations } = state;

    // 职业显示
    const occupationValue = occupations.length > 0
      ? occupations.join(', ')
      : '暂未填写';

    // 性别显示
    const genderValue = profile?.gender === 'male' ? '男' :
                       profile?.gender === 'female' ? '女' : '暂未选择';

    // 身高显示
    const heightValue = profile?.height ? `${profile.height}cm` : '暂未选择';

    // 体重显示
    const weightValue = profile?.weight ? `${profile.weight}kg` : '暂未选择';

    // 常居地显示
    const residenceValue = profile?.residence || '暂未选择';

    return [
      { id: 'nickname', label: '昵称', value: profile?.nickname || '暂未填写', type: 'text' },
      { id: 'gender', label: '性别', value: genderValue, type: 'select' },
      { id: 'bio', label: '个人介绍', value: profile?.bio || '暂未填写', type: 'text' },
      { id: 'birthday', label: '生日', value: profile?.birthday || '暂未选择', type: 'date' },
      { id: 'height', label: '身高', value: heightValue, type: 'select' },
      { id: 'weight', label: '体重', value: weightValue, type: 'select' },
      { id: 'occupation', label: '职业', value: occupationValue, type: 'text' },
      { id: 'residence', label: '常居地', value: residenceValue, type: 'select' },
      { id: 'wechat', label: '微信', value: profile?.wechat || '暂未填写', type: 'text' },
    ];
  }, [state.profile, state.occupations]);

  // #endregion

  // #region 事件处理

  /**
   * 返回上一页
   */
  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    }
  }, [router]);

  /**
   * 处理编辑项点击
   */
  const handleEditItem = useCallback((id: string) => {
    const { profile, occupations } = state;

    // 职业选择页
    if (id === 'occupation') {
      router.push({
        pathname: '/profile/select-occupation',
        params: {
          currentOccupations: JSON.stringify(occupations),
        },
      });
      return;
    }

    // 微信编辑页
    if (id === 'wechat') {
      router.push({
        pathname: '/profile/edit-wechat',
        params: {
          currentWechat: profile?.wechat || '',
        },
      });
      return;
    }

    // 性别选择（底部弹窗）
    if (id === 'gender') {
      setPickerField('gender');
      setPickerTitle('性别');
      setPickerOptions(GENDER_OPTIONS);
      setPickerValue(profile?.gender || undefined);
      setPickerVisible(true);
      return;
    }

    // 身高选择（底部弹窗）
    if (id === 'height') {
      setPickerField('height');
      setPickerTitle('身高');
      setPickerOptions(HEIGHT_OPTIONS);
      setPickerValue(profile?.height || undefined);
      setPickerVisible(true);
      return;
    }

    // 体重选择（底部弹窗）
    if (id === 'weight') {
      setPickerField('weight');
      setPickerTitle('体重');
      setPickerOptions(WEIGHT_OPTIONS);
      setPickerValue(profile?.weight || undefined);
      setPickerVisible(true);
      return;
    }

    // 文本编辑字段
    const textEditableFields = ['nickname', 'bio'];

    if (textEditableFields.includes(id)) {
      const items = getEditItems();
      const item = items.find(i => i.id === id);
      if (item) {
        router.push({
          pathname: '/profile/edit-field',
          params: {
            fieldKey: id,
            fieldLabel: item.label,
            fieldValue: item.value === '暂未填写' ? '' : item.value,
          },
        });
      }
      return;
    }

    // 生日选择
    if (id === 'birthday') {
      // TODO: 实现日期选择器
      Alert.alert('提示', '日期选择器开发中');
      return;
    }

    // 常居地选择
    if (id === 'residence') {
      // TODO: 实现城市选择器
      Alert.alert('提示', '城市选择器开发中');
      return;
    }
  }, [state.profile, state.occupations, router, getEditItems]);

  /**
   * 处理头像变更
   */
  const handleAvatarChange = useCallback(async (uri: string) => {
    // 先乐观更新 UI
    setState(prev => ({ ...prev, avatarUri: uri }));
    // 然后上传到服务器
    await updateAvatar(uri);
  }, [updateAvatar]);

  /**
   * 处理底部弹窗选择
   */
  const handlePickerSelect = useCallback(async (value: string | number) => {
    console.log(`📝 选择 ${pickerField}: ${value}`);
    setPickerVisible(false);

    // 调用 API 更新
    await updateField(pickerField, value);
  }, [pickerField, updateField]);

  /**
   * 取消底部弹窗
   */
  const handlePickerCancel = useCallback(() => {
    setPickerVisible(false);
  }, []);

  // #endregion

  return {
    // 状态
    profile: state.profile,
    avatarUri: state.avatarUri,
    occupations: state.occupations,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    isSaving: state.isSaving,
    error: state.error,

    // 编辑项
    editItems: getEditItems(),

    // 事件处理
    handleBack,
    handleEditItem,
    handleAvatarChange,

    // 底部弹窗
    pickerVisible,
    pickerTitle,
    pickerOptions,
    pickerValue,
    handlePickerSelect,
    handlePickerCancel,

    // 数据操作
    loadProfile,
    refreshProfile,
    updateField,
    updateAvatar,
    updateOccupations,
  };
};

// #endregion

export default useProfileEditPage;
