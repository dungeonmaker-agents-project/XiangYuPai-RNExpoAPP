/**
 * SortBottomSheet - Sort Selection Modal
 * Bottom sheet for selecting list sort order
 *
 * Invocation: FilterArea sort button press
 * Logic: Display sort options, emit selection to parent
 */
import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, SafeAreaView } from 'react-native';
import type { SortType } from '../../api/types';

interface Props {
  visible: boolean;
  currentValue: SortType;
  onSelect: (value: SortType) => void;
  onClose: () => void;
}

const OPTIONS: { value: SortType; label: string }[] = [
  { value: 'smart', label: '智能排序' },
  { value: 'newest', label: '最新发布' },
  { value: 'recent', label: '最近活跃' },
  { value: 'popular', label: '热门推荐' },
  { value: 'price_asc', label: '价格最低' },
  { value: 'price_desc', label: '价格最高' },
];

export function SortBottomSheet({ visible, currentValue, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>排序方式</Text>
            {OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.option}
                onPress={() => onSelect(opt.value)}
              >
                <Text style={[styles.optionText, opt.value === currentValue && styles.activeText]}>
                  {opt.label}
                </Text>
                {opt.value === currentValue && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#FFF', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  content: { padding: 16 },
  title: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 16 },
  option: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  optionText: { fontSize: 15, color: '#333' },
  activeText: { color: '#9B59B6' },
  check: { color: '#9B59B6', fontSize: 16 },
});
