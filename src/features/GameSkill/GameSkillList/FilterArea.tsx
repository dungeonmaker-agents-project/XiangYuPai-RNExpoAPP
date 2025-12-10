/**
 * FilterArea - L2 Component
 * Filter bar with sort, gender, and filter buttons
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { SortType, GenderType } from '../api/types';

interface FilterAreaProps {
  sortBy: SortType;
  gender: GenderType;
  hasActiveFilters: boolean;
  onSortPress: () => void;
  onGenderPress: () => void;
  onFilterPress: () => void;
}

const SORT_LABELS: Record<SortType, string> = {
  smart: '智能排序',
  newest: '最新发布',
  recent: '最近活跃',
  popular: '热门推荐',
  price_asc: '价格最低',
  price_desc: '价格最高',
};

const GENDER_LABELS: Record<GenderType, string> = {
  all: '不限性别',
  male: '只看男生',
  female: '只看女生',
};

export function FilterArea({
  sortBy,
  gender,
  hasActiveFilters,
  onSortPress,
  onGenderPress,
  onFilterPress,
}: FilterAreaProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.filterItem} onPress={onSortPress}>
        <Text style={styles.filterText}>{SORT_LABELS[sortBy]}</Text>
        <Ionicons name="chevron-down" size={14} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.filterItem} onPress={onGenderPress}>
        <Text style={styles.filterText}>{GENDER_LABELS[gender]}</Text>
        <Ionicons name="chevron-down" size={14} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.filterItem} onPress={onFilterPress}>
        <Text style={[styles.filterText, hasActiveFilters && styles.activeText]}>
          筛选
        </Text>
        <Ionicons
          name="options-outline"
          size={14}
          color={hasActiveFilters ? '#9B59B6' : '#666'}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 44,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  filterText: {
    fontSize: 14,
    color: '#333333',
  },
  activeText: {
    color: '#9B59B6',
  },
});
