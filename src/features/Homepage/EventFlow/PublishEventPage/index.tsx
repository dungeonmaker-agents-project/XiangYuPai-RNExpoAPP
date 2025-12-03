/**
 * PublishEventPage - 发布组局页面
 * 功能：发布线下活动组局
 */

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { PaymentModal } from './PaymentModal';

// 颜色常量
const COLORS = {
  PRIMARY: '#8B5CF6',
  BACKGROUND: '#F8F9FA',
  CARD_BG: '#FFFFFF',
  TEXT_PRIMARY: '#1F2937',
  TEXT_SECONDARY: '#6B7280',
  TEXT_PLACEHOLDER: '#9CA3AF',
  BORDER: '#E5E7EB',
  DISABLED: '#D1D5DB',
  ICON_BG: '#F3F4F6',
} as const;

// 话题图标配置（带颜色背景）
const TOPIC_ICONS = [
  { id: 'restaurant', emoji: '🍽️', label: '饭店', color: '#FF6B6B' },
  { id: 'movie', emoji: '🎬', label: '私影', color: '#4ECDC4' },
  { id: 'karaoke', emoji: '🎤', label: '台球', color: '#FFD93D' },
  { id: 'game', emoji: '🎮', label: 'K歌', color: '#95E1D3' },
  { id: 'sport', emoji: '🏃', label: '健身', color: '#F38181' },
  { id: 'other', emoji: '🔧', label: '陪维', color: '#AA96DA' },
];

export default function PublishEventPage() {
  const router = useRouter();
  
  // 表单状态
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [maxPeople, setMaxPeople] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  
  // 支付弹窗状态
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // 验证表单
  const validateForm = () => {
    if (!selectedTopic) {
      Alert.alert('提示', '请选择活动类型');
      return false;
    }
    if (!title.trim()) {
      Alert.alert('提示', '请输入活动标题');
      return false;
    }
    if (!content.trim()) {
      Alert.alert('提示', '请输入活动正文');
      return false;
    }
    if (!time) {
      Alert.alert('提示', '请选择活动时间');
      return false;
    }
    if (!location.trim()) {
      Alert.alert('提示', '请输入活动地点');
      return false;
    }
    if (!price) {
      Alert.alert('提示', '请输入定价');
      return false;
    }
    if (!maxPeople) {
      Alert.alert('提示', '请输入人数');
      return false;
    }
    if (!deadline) {
      Alert.alert('提示', '请选择报名截止时间');
      return false;
    }
    return true;
  };
  
  // 发布组局
  const handlePublish = () => {
    if (!validateForm()) {
      return;
    }
    
    // 显示支付弹窗
    setShowPaymentModal(true);
  };
  
  // 支付成功
  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false);
    setIsPublishing(true);
    
    try {
      // TODO: 调用发布API
      const publishData = {
        topic: selectedTopic,
        title: title.trim(),
        content: content.trim(),
        time,
        location: location.trim(),
        price: parseFloat(price),
        maxPeople: parseInt(maxPeople),
        deadline,
      };
      
      console.log('发布数据:', publishData);
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
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
          <Text style={styles.headerTitle}>发布组局</Text>
          <View style={styles.placeholder} />
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 话题选择 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>发布组局</Text>
            <View style={styles.topicGrid}>
              {TOPIC_ICONS.map((topic) => (
                <TouchableOpacity
                  key={topic.id}
                  style={styles.topicItem}
                  onPress={() => setSelectedTopic(topic.id)}
                >
                  <View style={[
                    styles.topicIconCircle,
                    { backgroundColor: topic.color },
                    selectedTopic === topic.id && styles.topicIconSelected,
                  ]}>
                    <Text style={styles.topicEmoji}>{topic.emoji}</Text>
                  </View>
                  <Text style={[
                    styles.topicLabel,
                    selectedTopic === topic.id && styles.topicLabelSelected,
                  ]}>
                    {topic.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* 添加标题 */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>添加标题</Text>
            <TextInput
              style={styles.input}
              placeholder="请输入活动标题"
              placeholderTextColor={COLORS.TEXT_PLACEHOLDER}
              value={title}
              onChangeText={setTitle}
              maxLength={50}
            />
          </View>
          
          {/* 添加正文 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>添加正文</Text>
              <Text style={styles.charCount}>{content.length}/200</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="请输入活动详情"
              placeholderTextColor={COLORS.TEXT_PLACEHOLDER}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              maxLength={200}
            />
          </View>
          
          {/* 时间 */}
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.selectRow}
              onPress={() => {
                // TODO: 打开时间选择器
                Alert.alert('提示', '时间选择功能开发中');
              }}
            >
              <Text style={styles.selectLabel}>时间</Text>
              <View style={styles.selectRight}>
                <Text style={styles.selectValue}>
                  {time || '选择'}
                </Text>
                <Text style={styles.selectArrow}>›</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {/* 地点 */}
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.selectRow}
              onPress={() => {
                // TODO: 打开地点选择器
                Alert.alert('提示', '地点选择功能开发中');
              }}
            >
              <Text style={styles.selectLabel}>地点</Text>
              <View style={styles.selectRight}>
                <Text style={styles.selectValue}>
                  {location || '选择'}
                </Text>
                <Text style={styles.selectArrow}>›</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {/* 定价 */}
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.selectRow}
              onPress={() => {
                // TODO: 打开定价输入
                Alert.alert('提示', '定价输入功能开发中');
              }}
            >
              <Text style={styles.selectLabel}>定价</Text>
              <View style={styles.selectRight}>
                <Text style={styles.selectValue}>
                  {price ? `${price}元/小时/人` : '0元/小时/人'}
                </Text>
                <Text style={styles.selectArrow}>›</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {/* 人数 */}
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.selectRow}
              onPress={() => {
                // TODO: 打开人数选择器
                Alert.alert('提示', '人数选择功能开发中');
              }}
            >
              <Text style={styles.selectLabel}>人数</Text>
              <View style={styles.selectRight}>
                <Text style={styles.selectValue}>
                  {maxPeople || '选择'}
                </Text>
                <Text style={styles.selectArrow}>›</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {/* 报名截止时间 */}
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.selectRow}
              onPress={() => {
                // TODO: 打开时间选择器
                Alert.alert('提示', '时间选择功能开发中');
              }}
            >
              <Text style={styles.selectLabel}>报名截止时间</Text>
              <View style={styles.selectRight}>
                <Text style={styles.selectValue}>
                  {deadline || '选择'}
                </Text>
                <Text style={styles.selectArrow}>›</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {/* 提示文本 */}
          <View style={styles.hintSection}>
            <Text style={styles.hintText}>
              系统会按照一定比例一次性收取一定的费用，若没有组局成功，系统会退还所有费用
            </Text>
          </View>
        </ScrollView>
        
        {/* 底部发布按钮 */}
        <View style={styles.bottomBar}>
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
      </KeyboardAvoidingView>
      
      {/* 支付弹窗 */}
      <PaymentModal
        visible={showPaymentModal}
        amount={50} // TODO: 根据实际定价计算
        onConfirm={handlePaymentSuccess}
        onCancel={() => setShowPaymentModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.CARD_BG,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  cancelButton: {
    padding: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  placeholder: {
    width: 48,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    backgroundColor: COLORS.CARD_BG,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
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
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  topicItem: {
    alignItems: 'center',
    width: 70,
  },
  topicIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  topicIconSelected: {
    transform: [{ scale: 1.1 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  topicEmoji: {
    fontSize: 28,
  },
  topicLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  topicLabelSelected: {
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  input: {
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 0,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  selectLabel: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
  },
  selectRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectValue: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginRight: 8,
  },
  selectArrow: {
    fontSize: 18,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '300',
  },
  hintSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 12,
  },
  hintText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
    textAlign: 'center',
  },
  bottomBar: {
    backgroundColor: COLORS.CARD_BG,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
  },
  publishButton: {
    backgroundColor: COLORS.PRIMARY,
    height: 48,
    borderRadius: 24,
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

