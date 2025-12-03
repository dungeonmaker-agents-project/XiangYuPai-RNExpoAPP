/**
 * ReportModal - 举报弹窗组件
 *
 * 功能：
 * - 多种举报类型选择（从API获取）
 * - 举报描述输入（最多200字）
 * - 图片上传（最多9张）
 * - 表单验证
 * - 与后端API对接
 *
 * 后端接口:
 * - GET  /xypai-content/api/v1/content/report/types  获取举报类型列表
 * - POST /xypai-content/api/v1/content/report        提交举报
 */

import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { reportApi, ReportTargetType, ReportType } from '../../../../services/api/reportApi';

// 颜色常量
const COLORS = {
  OVERLAY: 'rgba(0, 0, 0, 0.5)',
  CARD_BACKGROUND: '#FFFFFF',
  TEXT_PRIMARY: '#000000',
  TEXT_SECONDARY: '#666666',
  TEXT_TERTIARY: '#999999',
  BORDER: '#E5E5E5',
  PRIMARY: '#8A2BE2',
  SELECTED: '#F0E6FF',
  INPUT_BG: '#F5F5F5',
  PLACEHOLDER: '#CCCCCC',
  DISABLED: '#CCCCCC',
} as const;

// 默认举报类型（作为降级方案）
const DEFAULT_REPORT_TYPES: ReportType[] = [
  { key: 'insult', label: '辱骂引战' },
  { key: 'porn', label: '色情低俗' },
  { key: 'fraud', label: '诈骗' },
  { key: 'illegal', label: '违法犯罪' },
  { key: 'fake', label: '不实信息' },
  { key: 'minor', label: '未成年人相关' },
  { key: 'uncomfortable', label: '内容引人不适' },
  { key: 'other', label: '其他' },
];

// 最大图片数量
const MAX_IMAGES = 9;
// 最大描述字符数
const MAX_DESCRIPTION_LENGTH = 200;

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  targetType?: ReportTargetType; // 目标类型: feed, comment, user
  targetId: string | number;     // 目标ID
  targetTitle?: string;          // 目标标题（用于显示）
}

export default function ReportModal({
  visible,
  onClose,
  targetType = 'feed',
  targetId,
  targetTitle,
}: ReportModalProps) {
  // 状态
  const [reportTypes, setReportTypes] = useState<ReportType[]>(DEFAULT_REPORT_TYPES);
  const [selectedType, setSelectedType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 加载举报类型
  useEffect(() => {
    if (visible) {
      loadReportTypes();
    }
  }, [visible]);

  // 动画效果
  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      // 重置状态
      setTimeout(() => {
        setSelectedType('');
        setDescription('');
        setUploadedImages([]);
      }, 200);
    }
  }, [visible]);

  // 加载举报类型列表
  const loadReportTypes = async () => {
    setLoading(true);
    try {
      const types = await reportApi.getReportTypes();
      if (types && types.length > 0) {
        setReportTypes(types);
      }
    } catch (error) {
      console.error('[ReportModal] 加载举报类型失败', error);
      // 使用默认类型
      setReportTypes(DEFAULT_REPORT_TYPES);
    } finally {
      setLoading(false);
    }
  };

  // 选择举报类型
  const handleTypeSelect = (typeKey: string) => {
    setSelectedType(typeKey);
  };

  // 上传图片
  const handleImageUpload = async () => {
    if (uploadedImages.length >= MAX_IMAGES) {
      Alert.alert('提示', `最多上传${MAX_IMAGES}张图片`);
      return;
    }

    try {
      // 请求权限
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('提示', '需要相册权限才能上传图片');
        return;
      }

      // 选择图片
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: MAX_IMAGES - uploadedImages.length,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        setUploadedImages(prev => {
          const combined = [...prev, ...newImages];
          return combined.slice(0, MAX_IMAGES);
        });
      }
    } catch (error) {
      console.error('[ReportModal] 选择图片失败', error);
      Alert.alert('错误', '选择图片失败，请重试');
    }
  };

  // 移除图片
  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // 提交举报
  const handleSubmit = async () => {
    // 验证
    if (!selectedType) {
      Alert.alert('提示', '请选择举报的类型');
      return;
    }

    if (!description.trim()) {
      Alert.alert('提示', '请描述你的举报原因');
      return;
    }

    setSubmitting(true);

    try {
      console.log('[ReportModal] 提交举报', {
        targetType,
        targetId,
        reasonType: selectedType,
        description,
        images: uploadedImages,
      });

      // TODO: 上传图片到OSS获取URL（如果有本地图片）
      // 目前先使用本地URI作为占位，后续需要集成图片上传服务
      const imageUrls = uploadedImages;

      // 调用举报API
      const result = await reportApi.submitReport({
        targetType,
        targetId: Number(targetId),
        reasonType: selectedType,
        description: description.trim(),
        evidenceImages: imageUrls.length > 0 ? imageUrls : undefined,
      });

      console.log('[ReportModal] 举报成功', result);

      Alert.alert('提交成功', '感谢你的反馈，我们会尽快处理', [
        {
          text: '确定',
          onPress: onClose,
        },
      ]);
    } catch (error: any) {
      console.error('[ReportModal] 举报失败', error);
      const message = error?.message || '提交失败，请重试';
      Alert.alert('错误', message);
    } finally {
      setSubmitting(false);
    }
  };

  const characterCount = description.length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          style={[
            styles.container,
            {
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            },
          ]}
        >
          {/* 头部 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>举报</Text>
            <TouchableOpacity
              onPress={handleSubmit}
              style={styles.submitButton}
              disabled={submitting || !selectedType || !description.trim()}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={COLORS.PRIMARY} />
              ) : (
                <Text style={[
                  styles.submitButtonText,
                  (!selectedType || !description.trim()) && styles.submitButtonTextDisabled
                ]}>
                  提交
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* 举报类型选择 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>请选择你举报的类型</Text>
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.PRIMARY} style={{ marginVertical: 20 }} />
              ) : (
                <View style={styles.typeGrid}>
                  {reportTypes.map((type) => (
                    <TouchableOpacity
                      key={type.key}
                      style={[
                        styles.typeButton,
                        selectedType === type.key && styles.typeButtonSelected,
                      ]}
                      onPress={() => handleTypeSelect(type.key)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          selectedType === type.key && styles.typeButtonTextSelected,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* 举报描述 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>举报描述</Text>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="请描述你的举报原因"
                  placeholderTextColor={COLORS.PLACEHOLDER}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  textAlignVertical="top"
                  editable={!submitting}
                />
                <Text style={styles.characterCount}>
                  {characterCount}/{MAX_DESCRIPTION_LENGTH}
                </Text>
              </View>
            </View>

            {/* 上传图片 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>上传图片 (选填，最多{MAX_IMAGES}张)</Text>
              <View style={styles.imageUploadContainer}>
                {uploadedImages.map((image, index) => (
                  <View key={index} style={styles.uploadedImageWrapper}>
                    <Image source={{ uri: image }} style={styles.uploadedImage} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                      disabled={submitting}
                    >
                      <Text style={styles.removeImageButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                {uploadedImages.length < MAX_IMAGES && (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={handleImageUpload}
                    activeOpacity={0.7}
                    disabled={submitting}
                  >
                    <Text style={styles.uploadButtonIcon}>+</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.OVERLAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    width: '90%',
    maxWidth: 400,
    height: '80%',
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  backButton: {
    padding: 4,
    width: 60,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.TEXT_PRIMARY,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    textAlign: 'center',
  },
  submitButton: {
    padding: 4,
    width: 60,
    alignItems: 'flex-end',
    minHeight: 24,
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.PRIMARY,
  },
  submitButtonTextDisabled: {
    color: COLORS.DISABLED,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.CARD_BACKGROUND,
    minWidth: '45%',
    alignItems: 'center',
  },
  typeButtonSelected: {
    backgroundColor: COLORS.SELECTED,
    borderColor: COLORS.PRIMARY,
  },
  typeButtonText: {
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
  },
  typeButtonTextSelected: {
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },
  textInputContainer: {
    backgroundColor: COLORS.INPUT_BG,
    borderRadius: 8,
    padding: 12,
    minHeight: 150,
  },
  textInput: {
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    minHeight: 100,
    padding: 0,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.TEXT_TERTIARY,
    textAlign: 'right',
    marginTop: 8,
  },
  imageUploadContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  uploadedImageWrapper: {
    position: 'relative',
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: COLORS.INPUT_BG,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.TEXT_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageButtonText: {
    color: COLORS.CARD_BACKGROUND,
    fontSize: 14,
    fontWeight: '600',
  },
  uploadButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderStyle: 'dashed',
    backgroundColor: COLORS.INPUT_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonIcon: {
    fontSize: 32,
    color: COLORS.TEXT_TERTIARY,
  },
});
