/**
 * 活动筛选页 - Filter Page
 * 筛选活动类型
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';

const ACTIVITY_TYPES = [
  { value: 'explore', label: '探店' },
  { value: 'mystery', label: '密室' },
  { value: 'movie', label: '私影' },
  { value: 'billiards', label: '台球' },
  { value: 'ktv', label: 'K歌' },
  { value: 'sing', label: '唱歌' },
  { value: 'party', label: '嗨唱' },
  { value: 'karaoke', label: '唱吧' },
  { value: 'massage', label: '按摩' },
  { value: 'drink', label: '喝酒' },
];

export default function FilterPage() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const toggleType = (value: string) => {
    if (selectedTypes.includes(value)) {
      setSelectedTypes(selectedTypes.filter(t => t !== value));
    } else {
      setSelectedTypes([...selectedTypes, value]);
    }
  };

  const reset = () => {
    setSelectedTypes([]);
  };

  const apply = () => {
    // TODO: 将筛选条件传回列表页
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>筛选</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>活动类型</Text>
        <View style={styles.typesGrid}>
          {ACTIVITY_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeButton,
                selectedTypes.includes(type.value) && styles.typeButtonSelected,
              ]}
              onPress={() => toggleType(type.value)}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  selectedTypes.includes(type.value) && styles.typeButtonTextSelected,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={reset}>
          <Text style={styles.resetButtonText}>重置</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={apply}>
          <Text style={styles.applyButtonText}>完成</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  closeButton: {
    fontSize: 24,
    color: '#64748B',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeButtonSelected: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#475569',
  },
  typeButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
