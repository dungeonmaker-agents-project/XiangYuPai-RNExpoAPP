// #region 1. File Banner & TOC
/**
 * ProfileEditPage - 个人资料编辑页
 *
 * 功能：
 * - 所有字段编辑入口（对接真实API）
 * - 头像管理
 * - 表单验证
 * - 实时保存（单字段更新）
 *
 * 字段顺序（按新UI文档）：
 * 昵称 -> 性别 -> 个人介绍 -> 生日 -> 身高 -> 体重 -> 职业 -> 常居地 -> 微信
 *
 * @author XyPai Team
 * @since 2025-12-02
 */
// #endregion

// #region 2. Imports
import { useProfileStore } from '@/stores/profileStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import AvatarPicker from './AvatarPicker';
import BottomPickerModal, { type PickerOption } from './BottomPickerModal';
import DatePickerModal from './DatePickerModal';
import CityPickerModal from './CityPickerModal';
import { profileEditApi } from './api';
import type { UserProfileData } from './api';
// #endregion

// #region 3-7. Types, Constants, Utils, State & Logic
interface ProfileEditPageProps {
  userId?: string;
}

const COLORS = {
  WHITE: '#FFFFFF',
  BG_GRAY: '#F5F5F5',
  TEXT_PRIMARY: '#333333',
  TEXT_SECONDARY: '#999999',
  BORDER: '#E5E5E5',
  PRIMARY: '#9C27B0',
  ERROR: '#FF4444',
} as const;

interface EditItem {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'select' | 'date' | 'city';
  placeholder: string;
}

// 选项配置
const GENDER_OPTIONS: PickerOption[] = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
];

const HEIGHT_OPTIONS: PickerOption[] = Array.from({ length: 81 }, (_, i) => {
  const height = 140 + i;
  return { label: `${height}cm`, value: height };
});

const WEIGHT_OPTIONS: PickerOption[] = Array.from({ length: 121 }, (_, i) => {
  const weight = 30 + i;
  return { label: `${weight}kg`, value: weight };
});

// 格式化显示值
const formatGender = (gender: string | null): string => {
  if (gender === 'male') return '男';
  if (gender === 'female') return '女';
  return '';
};

const formatBirthday = (birthday: string | null): string => {
  if (!birthday) return '';
  const parts = birthday.split('-');
  if (parts.length === 3) {
    return `${parts[0]}年${parseInt(parts[1])}月${parseInt(parts[2])}日`;
  }
  return birthday;
};

const formatHeight = (height: number | null): string => {
  if (!height) return '';
  return `${height}cm`;
};

const formatWeight = (weight: number | null): string => {
  if (!weight) return '';
  return `${weight}kg`;
};

const useProfileEditLogic = () => {
  const router = useRouter();
  const updateUserProfile = useProfileStore(state => state.updateUserProfile);

  // 加载状态
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 用户资料数据
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [avatarUri, setAvatarUri] = useState('https://via.placeholder.com/80');

  // 底部选择弹窗状态
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTitle, setPickerTitle] = useState('');
  const [pickerOptions, setPickerOptions] = useState<PickerOption[]>([]);
  const [pickerField, setPickerField] = useState('');
  const [pickerValue, setPickerValue] = useState<string | number>();

  // 日期选择器状态
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [currentBirthday, setCurrentBirthday] = useState<Date | undefined>();

  // 城市选择器状态
  const [cityPickerVisible, setCityPickerVisible] = useState(false);

  // 加载用户资料
  const loadProfileData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await profileEditApi.getProfileEdit();

      if (response.code === 200 && response.data) {
        setProfileData(response.data);
        setAvatarUri(response.data.avatar || 'https://via.placeholder.com/80');

        // 同步到Store
        updateUserProfile({
          avatar: response.data.avatar || undefined,
          nickname: response.data.nickname,
          gender: response.data.gender || undefined,
          intro: response.data.bio || undefined,
          height: response.data.height || undefined,
          weight: response.data.weight || undefined,
          occupation: response.data.occupation || undefined,
          wechat: response.data.wechat || undefined,
        });
      } else {
        setError(response.message || '加载失败');
      }
    } catch (err: any) {
      console.error('加载用户资料失败:', err);
      setError(err.message || '加载失败，请重试');
    } finally {
      setIsLoading(false);
    }
  }, [updateUserProfile]);

  // 页面获得焦点时加载数据
  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData])
  );

  // 构建编辑项列表
  const getEditItems = useCallback((): EditItem[] => {
    if (!profileData) return [];

    return [
      { id: 'nickname', label: '昵称', value: profileData.nickname || '', type: 'text', placeholder: '请输入昵称' },
      { id: 'gender', label: '性别', value: formatGender(profileData.gender), type: 'select', placeholder: '暂未选择' },
      { id: 'bio', label: '个人介绍', value: profileData.bio || '', type: 'text', placeholder: '请输入个人介绍' },
      { id: 'birthday', label: '生日', value: formatBirthday(profileData.birthday), type: 'date', placeholder: '暂未选择' },
      { id: 'height', label: '身高', value: formatHeight(profileData.height), type: 'select', placeholder: '暂未选择' },
      { id: 'weight', label: '体重', value: formatWeight(profileData.weight), type: 'select', placeholder: '暂未选择' },
      { id: 'occupation', label: '职业', value: profileData.occupation || '', type: 'text', placeholder: '暂未选择' },
      { id: 'residence', label: '常居地', value: profileData.residence || '', type: 'city', placeholder: '暂未选择' },
      { id: 'wechat', label: '微信', value: profileData.wechat || '', type: 'text', placeholder: '暂未填写' },
    ];
  }, [profileData]);

  const editItems = getEditItems();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  // 通用保存字段方法
  const saveField = async (fieldKey: string, value: any): Promise<boolean> => {
    try {
      setIsSaving(true);
      const response = await profileEditApi.updateField(fieldKey, value);

      if (response.code === 200) {
        setProfileData(prev => prev ? { ...prev, [fieldKey]: value } : null);
        return true;
      } else {
        Alert.alert('保存失败', response.message || '请稍后重试');
        return false;
      }
    } catch (err: any) {
      Alert.alert('保存失败', err.message || '请稍后重试');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditItem = (id: string) => {
    const item = editItems.find(i => i.id === id);
    if (!item) return;

    // 职业选择页
    if (id === 'occupation') {
      router.push({
        pathname: '/profile/select-occupation',
        params: { currentOccupation: profileData?.occupation || '' },
      });
      return;
    }

    // 微信编辑页
    if (id === 'wechat') {
      router.push({
        pathname: '/profile/edit-wechat',
        params: { currentWechat: profileData?.wechat || '' },
      });
      return;
    }

    // 性别选择
    if (id === 'gender') {
      setPickerField('gender');
      setPickerTitle('选择性别');
      setPickerOptions(GENDER_OPTIONS);
      setPickerValue(profileData?.gender || undefined);
      setPickerVisible(true);
      return;
    }

    // 身高选择
    if (id === 'height') {
      setPickerField('height');
      setPickerTitle('选择身高');
      setPickerOptions(HEIGHT_OPTIONS);
      setPickerValue(profileData?.height || undefined);
      setPickerVisible(true);
      return;
    }

    // 体重选择
    if (id === 'weight') {
      setPickerField('weight');
      setPickerTitle('选择体重');
      setPickerOptions(WEIGHT_OPTIONS);
      setPickerValue(profileData?.weight || undefined);
      setPickerVisible(true);
      return;
    }

    // 生日选择
    if (id === 'birthday') {
      if (profileData?.birthday) {
        setCurrentBirthday(new Date(profileData.birthday));
      } else {
        setCurrentBirthday(undefined);
      }
      setDatePickerVisible(true);
      return;
    }

    // 常居地选择
    if (id === 'residence') {
      setCityPickerVisible(true);
      return;
    }

    // 文本编辑页
    const textEditableFields = ['nickname', 'bio'];
    if (textEditableFields.includes(id)) {
      router.push({
        pathname: '/profile/edit-field',
        params: { fieldKey: item.id, fieldLabel: item.label, fieldValue: item.value },
      });
    }
  };

  // 处理头像变更
  const handleAvatarChange = async (uri: string) => {
    try {
      setIsSaving(true);
      const response = await profileEditApi.uploadAvatar(uri);

      if (response.code === 200 && response.data) {
        setAvatarUri(response.data.url);
        setProfileData(prev => prev ? { ...prev, avatar: response.data!.url } : null);
        updateUserProfile({ avatar: response.data.url });
        Alert.alert('成功', '头像已更新');
      } else {
        Alert.alert('上传失败', response.message || '请稍后重试');
      }
    } catch (err: any) {
      Alert.alert('上传失败', err.message || '请稍后重试');
    } finally {
      setIsSaving(false);
    }
  };

  // 处理底部弹窗选择
  const handlePickerSelect = async (value: string | number) => {
    setPickerVisible(false);
    const success = await saveField(pickerField, value);
    if (success) {
      updateUserProfile({ [pickerField]: value });
    }
  };

  const handlePickerCancel = () => {
    setPickerVisible(false);
  };

  // 处理日期选择
  const handleDateSelect = async (date: Date) => {
    setDatePickerVisible(false);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const birthday = `${year}-${month}-${day}`;
    await saveField('birthday', birthday);
  };

  const handleDateCancel = () => {
    setDatePickerVisible(false);
  };

  // 处理城市选择
  const handleCitySelect = async (province: string, city: string) => {
    setCityPickerVisible(false);
    const residence = city || province;
    await saveField('residence', residence);
  };

  const handleCityCancel = () => {
    setCityPickerVisible(false);
  };

  return {
    editItems, profileData, avatarUri, isLoading, isSaving, error,
    handleBack, handleEditItem, handleAvatarChange, loadProfileData,
    pickerVisible, pickerTitle, pickerOptions, pickerValue, handlePickerSelect, handlePickerCancel,
    datePickerVisible, currentBirthday, handleDateSelect, handleDateCancel,
    cityPickerVisible, handleCitySelect, handleCityCancel,
  };
};
// #endregion

// #region 8. UI Components & Rendering
const ProfileEditPage: React.FC<ProfileEditPageProps> = ({ userId }) => {
  const {
    editItems, avatarUri, isLoading, isSaving, error,
    handleBack, handleEditItem, handleAvatarChange, loadProfileData,
    pickerVisible, pickerTitle, pickerOptions, pickerValue, handlePickerSelect, handlePickerCancel,
    datePickerVisible, currentBirthday, handleDateSelect, handleDateCancel,
    cityPickerVisible, handleCitySelect, handleCityCancel,
  } = useProfileEditLogic();

  // 加载中
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>个人资料</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 错误状态
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>个人资料</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProfileData}>
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />

      {/* 保存中遮罩 */}
      {isSaving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="small" color={COLORS.WHITE} />
          <Text style={styles.savingText}>保存中...</Text>
        </View>
      )}

      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>个人资料</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 编辑列表 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 头像编辑项 */}
        <View style={[styles.editItem, styles.firstItem]}>
          <View style={styles.editItemLeft}>
            <Text style={styles.editLabel}>头像</Text>
            <AvatarPicker currentAvatar={avatarUri} onAvatarChange={handleAvatarChange} />
          </View>
        </View>

        {/* 其他编辑项 */}
        {editItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.editItem, index === editItems.length - 1 && styles.lastItem]}
            onPress={() => handleEditItem(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.editItemLeft}>
              <Text style={styles.editLabel}>{item.label}</Text>
              <Text style={[styles.editValue, !item.value && styles.placeholderText]} numberOfLines={1}>
                {item.value || item.placeholder}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 底部选择弹窗 */}
      <BottomPickerModal
        visible={pickerVisible} title={pickerTitle} options={pickerOptions}
        selectedValue={pickerValue} onSelect={handlePickerSelect} onCancel={handlePickerCancel}
      />

      {/* 日期选择器 */}
      <DatePickerModal
        visible={datePickerVisible} title="选择生日" currentDate={currentBirthday}
        onSelect={handleDateSelect} onCancel={handleDateCancel}
      />

      {/* 城市选择器 */}
      <CityPickerModal
        visible={cityPickerVisible} title="选择常居地"
        onSelect={handleCitySelect} onCancel={handleCityCancel}
      />
    </SafeAreaView>
  );
};
// #endregion

// #region 9. Exports & Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG_GRAY },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1, borderBottomColor: COLORS.BORDER,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.TEXT_PRIMARY },
  placeholder: { width: 32 },
  content: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.TEXT_SECONDARY },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 14, color: COLORS.ERROR, textAlign: 'center', marginBottom: 16 },
  retryButton: { paddingHorizontal: 24, paddingVertical: 10, backgroundColor: COLORS.PRIMARY, borderRadius: 8 },
  retryButtonText: { fontSize: 14, fontWeight: '500', color: COLORS.WHITE },
  savingOverlay: {
    position: 'absolute', top: 100, left: '50%', marginLeft: -50, width: 100,
    paddingVertical: 12, backgroundColor: 'rgba(0, 0, 0, 0.7)', borderRadius: 8,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
  },
  savingText: { marginLeft: 8, fontSize: 14, color: COLORS.WHITE },
  editItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 16, backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1, borderBottomColor: COLORS.BORDER,
  },
  firstItem: { marginTop: 12 },
  lastItem: { borderBottomWidth: 0 },
  editItemLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginRight: 12 },
  editLabel: { fontSize: 16, color: COLORS.TEXT_PRIMARY, minWidth: 80 },
  editValue: { flex: 1, fontSize: 15, color: COLORS.TEXT_PRIMARY, textAlign: 'right', marginRight: 8 },
  placeholderText: { color: COLORS.TEXT_SECONDARY },
  bottomSpacer: { height: 40 },
});

export default ProfileEditPage;
// #endregion
