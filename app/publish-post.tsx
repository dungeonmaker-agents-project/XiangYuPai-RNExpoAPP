/**
 * Publish Post Page - 发布动态页面
 *
 * 功能：
 * - 编辑动态内容
 * - 上传图片/视频
 * - 选择话题标签
 * - 添加地理位置
 * - 发布动态
 */

import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// 导入API
import { publishApi } from '@/services/api';
import type { PublishLocation, PublishMediaItem, PublishTopic } from '@/services/api';

// 导入子组件
import LocationSelectorModal from './modal/location-selector';
import TopicSelectorModal from './modal/topic-selector';

// 颜色常量
const COLORS = {
  PRIMARY: '#8B5CF6',
  BACKGROUND: '#F8F9FA',
  CARD_BACKGROUND: '#FFFFFF',
  TEXT_PRIMARY: '#333333',
  TEXT_SECONDARY: '#666666',
  TEXT_PLACEHOLDER: '#999999',
  BORDER: '#E5E5E5',
  DISABLED: '#CCCCCC',
  TAG_BACKGROUND: '#F5F5F5',
  TAG_TEXT: '#8B5CF6',
  MEDIA_BACKGROUND: '#F0F0F0',
} as const;

// 话题类型 - 使用API导出的类型
interface Topic extends PublishTopic {}

// 位置类型 - 兼容两种接口
interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

// 媒体类型
interface MediaItem {
  id: string;
  type: 'image' | 'video';
  uri: string;
  url?: string;
  thumbnail?: string;
}

export default function PublishPostPage() {
  const router = useRouter();
  
  // 表单状态
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Modal状态
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // 添加媒体
  const handleAddMedia = useCallback(async () => {
    // 请求权限
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('提示', '需要访问相册权限才能添加图片');
      return;
    }

    // 显示选择菜单
    Alert.alert(
      '添加媒体',
      '请选择媒体类型',
      [
        {
          text: '拍照',
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: 'images',
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
              await uploadMedia(result.assets[0], 'image');
            }
          },
        },
        {
          text: '从相册选择图片',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: 'images',
              allowsMultipleSelection: true,
              selectionLimit: 9 - mediaList.length,
              quality: 0.8,
            });
            if (!result.canceled && result.assets.length > 0) {
              for (const asset of result.assets) {
                await uploadMedia(asset, 'image');
              }
            }
          },
        },
        {
          text: '从相册选择视频',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: 'videos',
              allowsEditing: true,
              quality: 0.8,
              videoMaxDuration: 60,
            });
            if (!result.canceled && result.assets[0]) {
              await uploadMedia(result.assets[0], 'video');
            }
          },
        },
        { text: '取消', style: 'cancel' },
      ]
    );
  }, [mediaList.length]);

  // 上传媒体文件
  const uploadMedia = useCallback(async (
    asset: ImagePicker.ImagePickerAsset,
    type: 'image' | 'video'
  ) => {
    try {
      setUploadProgress(0);

      // 使用API上传
      const mediaFile = {
        uri: asset.uri,
        type: type === 'image' ? 'image/jpeg' : 'video/mp4',
        name: `${type}_${Date.now()}.${type === 'image' ? 'jpg' : 'mp4'}`,
      };

      const uploadedMedia = await publishApi.uploadMedia(
        mediaFile,
        type,
        (progress) => setUploadProgress(progress)
      );

      if (uploadedMedia) {
        const newMediaItem: MediaItem = {
          id: uploadedMedia.id,
          type,
          uri: asset.uri,
          url: uploadedMedia.url,
          thumbnail: uploadedMedia.thumbnailUrl,
        };
        setMediaList(prev => [...prev, newMediaItem]);
      } else {
        Alert.alert('错误', '上传失败，请重试');
      }
    } catch (error) {
      console.error('上传媒体失败:', error);
      Alert.alert('错误', '上传失败，请重试');
    } finally {
      setUploadProgress(0);
    }
  }, []);

  // 删除媒体
  const handleRemoveMedia = (mediaId: string) => {
    setMediaList(prev => prev.filter(item => item.id !== mediaId));
  };

  // 打开话题选择器
  const openTopicSelector = () => {
    setShowTopicModal(true);
  };

  // 选择话题
  const handleTopicSelect = (topics: Topic[]) => {
    setSelectedTopics(topics);
    setShowTopicModal(false);
  };

  // 移除话题
  const handleRemoveTopic = (topicId: string) => {
    setSelectedTopics(prev => prev.filter(t => t.id !== topicId));
  };

  // 打开地理位置选择器
  const openLocationSelector = () => {
    setShowLocationModal(true);
  };

  // 选择地理位置
  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setShowLocationModal(false);
  };

  // 移除地理位置
  const handleRemoveLocation = () => {
    setSelectedLocation(null);
  };

  // 发布动态
  const handlePublish = useCallback(async () => {
    // 验证必填项
    if (!content.trim() && mediaList.length === 0) {
      Alert.alert('提示', '请输入内容或添加图片/视频');
      return;
    }

    setIsPublishing(true);
    try {
      // 调用发布API
      const hasVideo = mediaList.some(m => m.type === 'video');
      const feedId = await publishApi.publishFeed({
        title: title.trim() || undefined,
        content: content.trim(),
        type: hasVideo ? 2 : 1,  // 1=图文, 2=视频
        mediaType: hasVideo ? 'video' : 'image',
        mediaIds: mediaList.map(m => m.id),
        topicIds: selectedTopics.map(t => t.id),
        topicNames: selectedTopics.map(t => t.name),
        locationId: selectedLocation?.id,
        locationName: selectedLocation?.name,
        locationAddress: selectedLocation?.address,
        longitude: selectedLocation?.longitude,
        latitude: selectedLocation?.latitude,
        visibility: 0,  // 公开
      });

      if (feedId) {
        Alert.alert('成功', '发布成功！', [
          { text: '确定', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('错误', '发布失败，请重试');
      }
    } catch (error) {
      console.error('发布失败:', error);
      Alert.alert('错误', '发布失败，请重试');
    } finally {
      setIsPublishing(false);
    }
  }, [title, content, mediaList, selectedTopics, selectedLocation, router]);

  // 判断是否可以发布
  const canPublish = (content.trim().length > 0 || mediaList.length > 0) && !isPublishing;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={isPublishing}
        >
          <Text style={styles.cancelButtonText}>取消</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>发布动态</Text>
        <TouchableOpacity 
          style={[
            styles.publishButton,
            !canPublish && styles.publishButtonDisabled
          ]}
          onPress={handlePublish}
          disabled={!canPublish}
        >
          <Text style={[
            styles.publishButtonText,
            !canPublish && styles.publishButtonTextDisabled
          ]}>
            {isPublishing ? '发布中...' : '发布'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 内容输入区 */}
        <View style={styles.contentSection}>
          <TextInput
            style={styles.titleInput}
            placeholder="请输入标题"
            placeholderTextColor={COLORS.TEXT_PLACEHOLDER}
            value={title}
            onChangeText={setTitle}
            maxLength={50}
          />
          <TextInput
            style={styles.contentInput}
            placeholder="分享新鲜事..."
            placeholderTextColor={COLORS.TEXT_PLACEHOLDER}
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={2000}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{content.length}/2000</Text>
        </View>

        {/* 媒体预览区 */}
        {mediaList.length > 0 && (
          <View style={styles.mediaSection}>
            <View style={styles.mediaGrid}>
              {mediaList.map((media) => (
                <View key={media.id} style={styles.mediaItem}>
                  <Image 
                    source={{ uri: media.type === 'image' ? media.uri : media.thumbnail }} 
                    style={styles.mediaImage}
                  />
                  {media.type === 'video' && (
                    <View style={styles.videoOverlay}>
                      <Text style={styles.videoIcon}>▶️</Text>
                    </View>
                  )}
                  <TouchableOpacity 
                    style={styles.mediaRemoveButton}
                    onPress={() => handleRemoveMedia(media.id)}
                  >
                    <Text style={styles.mediaRemoveIcon}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {mediaList.length < 9 && (
                <TouchableOpacity 
                  style={styles.mediaAddButton}
                  onPress={handleAddMedia}
                >
                  <Text style={styles.mediaAddIcon}>+</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* 功能按钮区 */}
        <View style={styles.functionsSection}>
          {/* 添加图片/视频 */}
          {mediaList.length === 0 && (
            <TouchableOpacity 
              style={styles.functionButton}
              onPress={handleAddMedia}
            >
              <Text style={styles.functionIcon}>🖼️</Text>
              <Text style={styles.functionLabel}>图片/视频</Text>
            </TouchableOpacity>
          )}

          {/* 添加话题 */}
          <TouchableOpacity 
            style={styles.functionButton}
            onPress={openTopicSelector}
          >
            <Text style={styles.functionIcon}>#️⃣</Text>
            <Text style={styles.functionLabel}>添加话题</Text>
          </TouchableOpacity>

          {/* 添加地理位置 */}
          <TouchableOpacity 
            style={styles.functionButton}
            onPress={openLocationSelector}
          >
            <Text style={styles.functionIcon}>📍</Text>
            <Text style={styles.functionLabel}>添加位置</Text>
          </TouchableOpacity>
        </View>

        {/* 已选话题 */}
        {selectedTopics.length > 0 && (
          <View style={styles.selectedSection}>
            <Text style={styles.selectedSectionTitle}>已选话题</Text>
            <View style={styles.topicsContainer}>
              {selectedTopics.map((topic) => (
                <View key={topic.id} style={styles.topicTag}>
                  <Text style={styles.topicTagText}>#{topic.name}</Text>
                  <TouchableOpacity onPress={() => handleRemoveTopic(topic.id)}>
                    <Text style={styles.topicRemoveIcon}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 已选位置 */}
        {selectedLocation && (
          <View style={styles.selectedSection}>
            <Text style={styles.selectedSectionTitle}>位置</Text>
            <View style={styles.locationCard}>
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{selectedLocation.name}</Text>
                {selectedLocation.address && (
                  <Text style={styles.locationAddress}>{selectedLocation.address}</Text>
                )}
              </View>
              <TouchableOpacity onPress={handleRemoveLocation}>
                <Text style={styles.locationRemoveIcon}>×</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 底部发布按钮 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.publishBottomButton, !canPublish && styles.publishButtonDisabled]}
          onPress={handlePublish}
          disabled={!canPublish}
        >
          <Text style={[styles.publishBottomButtonText, !canPublish && styles.publishButtonTextDisabled]}>
            {isPublishing ? '发布中...' : '发布'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 话题选择Modal */}
      <TopicSelectorModal
        visible={showTopicModal}
        selectedTopics={selectedTopics}
        onSelect={handleTopicSelect}
        onClose={() => setShowTopicModal(false)}
      />

      {/* 地理位置选择Modal */}
      <LocationSelectorModal
        visible={showLocationModal}
        onSelect={handleLocationSelect}
        onClose={() => setShowLocationModal(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 12,
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  publishButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: COLORS.PRIMARY,
  },
  publishButtonDisabled: {
    backgroundColor: COLORS.DISABLED,
  },
  publishButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  publishButtonTextDisabled: {
    color: '#FFFFFF',
    opacity: 0.6,
  },
  
  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  
  // Content Section
  contentSection: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    padding: 16,
    marginBottom: 12,
  },
  titleInput: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    paddingBottom: 8,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  contentInput: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'right',
  },
  
  // Media Section
  mediaSection: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    padding: 16,
    marginBottom: 12,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mediaItem: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.MEDIA_BACKGROUND,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoIcon: {
    fontSize: 24,
  },
  mediaRemoveButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaRemoveIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  mediaAddButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: COLORS.MEDIA_BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderStyle: 'dashed',
  },
  mediaAddIcon: {
    fontSize: 32,
    color: COLORS.TEXT_SECONDARY,
  },
  
  // Functions Section
  functionsSection: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 16,
  },
  functionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.TAG_BACKGROUND,
  },
  functionIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  functionLabel: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
  },
  // Bottom Bar
  bottomBar: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  publishBottomButton: {
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishBottomButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Selected Section
  selectedSection: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    padding: 16,
    marginBottom: 12,
  },
  selectedSectionTitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 12,
  },
  
  // Topics
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 16,
    backgroundColor: COLORS.TAG_BACKGROUND,
  },
  topicTagText: {
    fontSize: 14,
    color: COLORS.TAG_TEXT,
    marginRight: 4,
  },
  topicRemoveIcon: {
    fontSize: 18,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: 'bold',
  },
  
  // Location
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.TAG_BACKGROUND,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
  },
  locationRemoveIcon: {
    fontSize: 24,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

