// #region 1. File Banner & TOC
/**
 * ProfileEditPage - 个人资料编辑页
 *
 * 功能：
 * - 从真实 API 加载用户资料
 * - 所有字段编辑入口
 * - 头像管理
 * - 表单验证
 * - 职业多选支持
 *
 * @author XyPai Team
 * @since 2025-12-02
 */
// #endregion

// #region 2. Imports
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AvatarPicker from './AvatarPicker';
import BottomPickerModal from './BottomPickerModal';
import { useProfileEditPage } from './useProfileEditPage';
// #endregion

// #region 3. Types & Interfaces
interface ProfileEditPageProps {
  userId?: string;
}
// #endregion

// #region 4. Constants
const COLORS = {
  WHITE: '#FFFFFF',
  BG_GRAY: '#F5F5F5',
  TEXT_PRIMARY: '#333333',
  TEXT_SECONDARY: '#999999',
  BORDER: '#E5E5E5',
  PRIMARY: '#9C27B0',
  ERROR: '#FF5252',
} as const;
// #endregion

// #region 5. Sub-components

/**
 * 加载状态组件
 */
const LoadingView: React.FC = () => (
  <View style={styles.centerContainer}>
    <ActivityIndicator size="large" color={COLORS.PRIMARY} />
    <Text style={styles.loadingText}>加载中...</Text>
  </View>
);

/**
 * 错误状态组件
 */
const ErrorView: React.FC<{ message: string; onRetry: () => void }> = ({
  message,
  onRetry,
}) => (
  <View style={styles.centerContainer}>
    <Ionicons name="alert-circle-outline" size={48} color={COLORS.ERROR} />
    <Text style={styles.errorText}>{message}</Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryButtonText}>重试</Text>
    </TouchableOpacity>
  </View>
);

/**
 * 保存中指示器
 */
const SavingOverlay: React.FC<{ visible: boolean }> = ({ visible }) => {
  if (!visible) return null;
  return (
    <View style={styles.savingOverlay}>
      <View style={styles.savingBox}>
        <ActivityIndicator size="small" color={COLORS.WHITE} />
        <Text style={styles.savingText}>保存中...</Text>
      </View>
    </View>
  );
};

// #endregion

// #region 6. Main Component
const ProfileEditPage: React.FC<ProfileEditPageProps> = ({ userId }) => {
  const {
    // 状态
    profile,
    avatarUri,
    isLoading,
    isRefreshing,
    isSaving,
    error,
    // 编辑项
    editItems,
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
  } = useProfileEditPage();

  // 加载状态
  if (isLoading && !profile) {
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
        <LoadingView />
      </SafeAreaView>
    );
  }

  // 错误状态
  if (error && !profile) {
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
        <ErrorView message={error} onRetry={loadProfile} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />

      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>个人资料</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 编辑列表 */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={loadProfile}
            colors={[COLORS.PRIMARY]}
            tintColor={COLORS.PRIMARY}
          />
        }
      >
        {/* 头像编辑项（特殊处理） */}
        <View style={[styles.editItem, styles.firstItem]}>
          <View style={styles.editItemLeft}>
            <Text style={styles.editLabel}>头像</Text>
            <AvatarPicker
              currentAvatar={avatarUri}
              onAvatarChange={handleAvatarChange}
            />
          </View>
        </View>

        {/* 其他编辑项 */}
        {editItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.editItem,
              index === editItems.length - 1 && styles.lastItem,
            ]}
            onPress={() => handleEditItem(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.editItemLeft}>
              <Text style={styles.editLabel}>{item.label}</Text>
              <Text
                style={[
                  styles.editValue,
                  (item.value === '暂未填写' || item.value === '暂未选择') &&
                    styles.placeholderText,
                ]}
                numberOfLines={1}
              >
                {item.value}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.TEXT_SECONDARY}
            />
          </TouchableOpacity>
        ))}

        {/* 底部间距 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 底部选择弹窗 */}
      <BottomPickerModal
        visible={pickerVisible}
        title={pickerTitle}
        options={pickerOptions}
        selectedValue={pickerValue}
        onSelect={handlePickerSelect}
        onCancel={handlePickerCancel}
      />

      {/* 保存中遮罩 */}
      <SavingOverlay visible={isSaving} />
    </SafeAreaView>
  );
};
// #endregion

// #region 7. Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_GRAY,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  editItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  firstItem: {
    marginTop: 12,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  editItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 12,
  },
  editLabel: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    minWidth: 80,
  },
  editValue: {
    flex: 1,
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'right',
    marginRight: 8,
  },
  placeholderText: {
    color: COLORS.TEXT_SECONDARY,
  },
  bottomSpacer: {
    height: 24,
  },
  // 加载状态
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  // 错误状态
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 14,
    color: COLORS.WHITE,
    fontWeight: '500',
  },
  // 保存中遮罩
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  savingText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.WHITE,
  },
});
// #endregion

// #region 8. Exports
export default ProfileEditPage;
// #endregion
