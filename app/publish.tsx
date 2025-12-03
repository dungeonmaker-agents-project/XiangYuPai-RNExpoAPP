/**
 * Publish Page - 发布组局页面
 * 
 * 功能：
 * - 选择组局类型（游戏、线下、线上、片单、旅游、其他）
 * - 选择标签
 * - 选择地区
 * - 设置时间和地点
 * - 填写备介
 * - 设置人数
 * - 设置联系时长
 * - 发布组局
 */

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

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
} as const;

// 组局类型
const EVENT_TYPES = [
  { id: 'game', name: '游戏', icon: '🎮', color: '#FF6B6B' },
  { id: 'offline', name: '线下', icon: '🎪', color: '#4ECDC4' },
  { id: 'online', name: '线上', icon: '🚀', color: '#FFD93D' },
  { id: 'movie', name: '片单', icon: '🎬', color: '#95E1D3' },
  { id: 'travel', name: '旅游', icon: '✈️', color: '#F38181' },
  { id: 'other', name: '其他', icon: '📌', color: '#AA96DA' },
];

// 联系时长选项
const DURATION_OPTIONS = [
  { label: '0.5小时/天', value: 0.5 },
  { label: '1小时/天', value: 1 },
  { label: '2小时/天', value: 2 },
  { label: '3小时/天', value: 3 },
  { label: '不限', value: -1 },
];

// 话题类型
interface Topic {
  id: string;
  name: string;
  description?: string;
  isHot?: boolean;
}

// 位置类型
interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export default function PublishPage() {
  const router = useRouter();
  
  // 表单状态
  const [selectedEventType, setSelectedEventType] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [contactDuration, setContactDuration] = useState<number | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Modal状态
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // 选择组局类型
  const handleEventTypeSelect = (typeId: string) => {
    setSelectedEventType(typeId);
  };

  // 打开标签选择器
  const openTagSelector = () => {
    setShowTopicModal(true);
  };

  // 选择标签
  const handleTagSelect = (topics: Topic[]) => {
    setSelectedTags(topics.map(t => t.name));
    setShowTopicModal(false);
  };

  // 打开地区选择器
  const openRegionSelector = () => {
    setShowLocationModal(true);
  };

  // 选择地区
  const handleRegionSelect = (location: Location) => {
    setSelectedRegion(location.name);
    setShowLocationModal(false);
  };

  // 选择联系时长
  const handleDurationSelect = (value: number) => {
    setContactDuration(value);
  };

  // 发布组局
  const handlePublish = async () => {
    // 验证必填项
    if (!selectedEventType) {
      Alert.alert('提示', '请选择组局类型');
      return;
    }
    if (!description.trim()) {
      Alert.alert('提示', '请填写备介');
      return;
    }
    if (!maxParticipants || parseInt(maxParticipants) <= 0) {
      Alert.alert('提示', '请设置人数');
      return;
    }

    setIsPublishing(true);
    try {
      // TODO: 调用发布API
      const publishData = {
        eventType: selectedEventType,
        tags: selectedTags,
        region: selectedRegion,
        time: eventTime,
        location: eventLocation,
        description: description.trim(),
        maxParticipants: parseInt(maxParticipants),
        contactDuration,
      };
      
      console.log('发布组局数据:', publishData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟API调用
      
      Alert.alert('成功', '发布成功！', [
        { text: '确定', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('错误', '发布失败，请重试');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={isPublishing}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>发布组局</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 组局类型选择 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>发布组局</Text>
          <View style={styles.eventTypeGrid}>
            {EVENT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.eventTypeItem,
                  selectedEventType === type.id && styles.eventTypeItemSelected
                ]}
                onPress={() => handleEventTypeSelect(type.id)}
              >
                <View style={[styles.eventTypeIcon, { backgroundColor: type.color }]}>
                  <Text style={styles.eventTypeEmoji}>{type.icon}</Text>
                </View>
                <Text style={styles.eventTypeName}>{type.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 选择标签 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>选择标签</Text>
            <TouchableOpacity onPress={openTagSelector}>
              <Text style={styles.sectionAction}>选择 ›</Text>
            </TouchableOpacity>
          </View>
          {selectedTags.length > 0 && (
            <View style={styles.tagsContainer}>
              {selectedTags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 选择地区 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>选择地区</Text>
            <TouchableOpacity onPress={openRegionSelector}>
              <Text style={styles.sectionAction}>
                {selectedRegion || '选择'} ›
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 时间 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>时间</Text>
            <TextInput
              style={styles.sectionInput}
              placeholder="0点到0点/天"
              placeholderTextColor={COLORS.TEXT_PLACEHOLDER}
              value={eventTime}
              onChangeText={setEventTime}
            />
          </View>
        </View>

        {/* 地点 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>地点</Text>
            <TextInput
              style={styles.sectionInput}
              placeholder="请输入地点"
              placeholderTextColor={COLORS.TEXT_PLACEHOLDER}
              value={eventLocation}
              onChangeText={setEventLocation}
            />
          </View>
        </View>

        {/* 备介 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>备介</Text>
            <Text style={styles.charCount}>{description.length}/200</Text>
          </View>
          <TextInput
            style={styles.descriptionInput}
            placeholder="请输入备介"
            placeholderTextColor={COLORS.TEXT_PLACEHOLDER}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={200}
          />
        </View>

        {/* 人数 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>人数</Text>
            <TextInput
              style={styles.sectionInput}
              placeholder="请输入人数"
              placeholderTextColor={COLORS.TEXT_PLACEHOLDER}
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* 联系我时长 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>联系我时长</Text>
          <View style={styles.durationGrid}>
            {DURATION_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.durationOption,
                  contactDuration === option.value && styles.durationOptionSelected
                ]}
                onPress={() => handleDurationSelect(option.value)}
              >
                <Text style={[
                  styles.durationOptionText,
                  contactDuration === option.value && styles.durationOptionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 底部发布按钮 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[
            styles.publishButton,
            isPublishing && styles.publishButtonDisabled
          ]}
          onPress={handlePublish}
          disabled={isPublishing}
        >
          <Text style={styles.publishButtonText}>
            {isPublishing ? '发布中...' : '发布'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 标签选择Modal */}
      <TopicSelectorModal
        visible={showTopicModal}
        selectedTopics={[]}
        onSelect={handleTagSelect}
        onClose={() => setShowTopicModal(false)}
      />

      {/* 地区选择Modal */}
      <LocationSelectorModal
        visible={showLocationModal}
        onSelect={handleRegionSelect}
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.TEXT_PRIMARY,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  headerRight: {
    width: 40,
  },
  
  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  
  // Section
  section: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
  },
  sectionAction: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  sectionInput: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  
  // Event Type Grid
  eventTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  eventTypeItem: {
    alignItems: 'center',
    width: 80,
  },
  eventTypeItemSelected: {
    opacity: 1,
  },
  eventTypeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTypeEmoji: {
    fontSize: 28,
  },
  eventTypeName: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
  },
  
  // Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    backgroundColor: COLORS.TAG_BACKGROUND,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 14,
    color: COLORS.TAG_TEXT,
  },
  
  // Description Input
  descriptionInput: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    marginTop: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  
  // Duration Grid
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  durationOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.TAG_BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  durationOptionSelected: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  durationOptionText: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
  },
  durationOptionTextSelected: {
    color: '#FFFFFF',
  },
  
  // Bottom Container
  bottomContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  publishButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  publishButtonDisabled: {
    backgroundColor: COLORS.DISABLED,
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
