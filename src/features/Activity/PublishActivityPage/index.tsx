/**
 * 发布组局页 - Publish Activity Page
 * 创建新活动
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { activityApi, type PublishConfig } from '@/services/api';

const ACTIVITY_TYPES = [
  { value: 'explore', label: '探店', icon: '🔍' },
  { value: 'movie', label: '私影', icon: '🎬' },
  { value: 'billiards', label: '台球', icon: '🎱' },
  { value: 'ktv', label: 'K歌', icon: '🎤' },
  { value: 'drink', label: '喝酒', icon: '🍺' },
  { value: 'massage', label: '按摩', icon: '💆' },
];

export default function PublishActivityPage() {
  const [config, setConfig] = useState<PublishConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    activityType: '',
    title: '',
    content: '',
    images: [] as string[],
    startTime: '',
    endTime: '',
    address: '',
    price: 0,
    priceUnit: 'per_hour' as 'per_person' | 'per_hour',
    memberLimit: 2,
    registrationDeadline: '',
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const response = await activityApi.getPublishConfig();
      if (response.success && response.data) {
        setConfig(response.data);
      }
    } catch (error) {
      console.error('加载配置失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!formData.activityType) {
      alert('请选择活动类型');
      return;
    }
    
    if (!formData.title) {
      alert('请输入标题');
      return;
    }

    try {
      const response = await activityApi.publishActivity({
        activityType: formData.activityType,
        title: formData.title,
        content: formData.content,
        images: formData.images,
        schedule: {
          startTime: formData.startTime || new Date().toISOString(),
          endTime: formData.endTime,
        },
        location: {
          address: formData.address || '待定',
        },
        price: {
          amount: formData.price,
          unit: formData.priceUnit,
        },
        memberLimit: formData.memberLimit,
        registrationDeadline: formData.registrationDeadline || new Date().toISOString(),
      });

      if (response.success) {
        alert('发布成功!');
        router.replace(`/activity/detail?id=${response.data.activityId}`);
      }
    } catch (error) {
      console.error('发布失败:', error);
      alert('发布失败,请稍后重试');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelButton}>取消</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>发布组局</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Activity Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>选择类型 *</Text>
          <View style={styles.typesGrid}>
            {ACTIVITY_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeButton,
                  formData.activityType === type.value && styles.typeButtonSelected,
                ]}
                onPress={() => setFormData({ ...formData, activityType: type.value })}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text
                  style={[
                    styles.typeLabel,
                    formData.activityType === type.value && styles.typeLabelSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>添加标题 *</Text>
          <TextInput
            style={styles.input}
            placeholder="输入活动标题..."
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            maxLength={50}
          />
        </View>

        {/* Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>添加正文</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="描述一下活动内容..."
            value={formData.content}
            onChangeText={(text) => setFormData({ ...formData, content: text })}
            multiline
            numberOfLines={4}
            maxLength={200}
          />
          <Text style={styles.charCount}>{formData.content.length}/200</Text>
        </View>

        {/* Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>时间</Text>
          <TouchableOpacity style={styles.selectButton}>
            <Text style={styles.selectButtonText}>
              {formData.startTime || '选择开始时间 >'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>地点</Text>
          <TextInput
            style={styles.input}
            placeholder="输入活动地点..."
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
          />
        </View>

        {/* Price */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>定价</Text>
          <View style={styles.priceRow}>
            <TextInput
              style={[styles.input, styles.priceInput]}
              placeholder="0"
              value={String(formData.price)}
              onChangeText={(text) => setFormData({ ...formData, price: parseInt(text) || 0 })}
              keyboardType="numeric"
            />
            <Text style={styles.priceUnit}>金币/{formData.priceUnit === 'per_hour' ? '小时' : '人'}</Text>
          </View>
        </View>

        {/* Member Limit */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>人数</Text>
          <View style={styles.memberRow}>
            <TouchableOpacity
              style={styles.memberButton}
              onPress={() => setFormData({ ...formData, memberLimit: Math.max(2, formData.memberLimit - 1) })}
            >
              <Text style={styles.memberButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.memberCount}>{formData.memberLimit}人</Text>
            <TouchableOpacity
              style={styles.memberButton}
              onPress={() => setFormData({ ...formData, memberLimit: Math.min(100, formData.memberLimit + 1) })}
            >
              <Text style={styles.memberButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rules */}
        {config && (
          <View style={styles.rulesSection}>
            <Text style={styles.rulesTitle}>平台规则</Text>
            <Text style={styles.rulesText}>• {config.platformFee.description}</Text>
            <Text style={styles.rulesText}>• {config.depositRules.description}</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Publish Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
          <Text style={styles.publishButtonText}>✈️ 发布</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  cancelButton: {
    fontSize: 16,
    color: '#64748B',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    width: 100,
    paddingVertical: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonSelected: {
    backgroundColor: '#EDE9FE',
    borderColor: '#7C3AED',
  },
  typeIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 14,
    color: '#475569',
  },
  typeLabelSelected: {
    color: '#7C3AED',
    fontWeight: '600',
  },
  input: {
    fontSize: 15,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'right',
    marginTop: 4,
  },
  selectButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
  },
  selectButtonText: {
    fontSize: 15,
    color: '#64748B',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceInput: {
    flex: 1,
  },
  priceUnit: {
    fontSize: 15,
    color: '#475569',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  memberButton: {
    width: 40,
    height: 40,
    backgroundColor: '#7C3AED',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  memberCount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    minWidth: 60,
    textAlign: 'center',
  },
  rulesSection: {
    padding: 16,
    backgroundColor: '#FEF3C7',
    margin: 16,
    borderRadius: 12,
  },
  rulesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  rulesText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 20,
    marginBottom: 4,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  publishButton: {
    paddingVertical: 14,
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
