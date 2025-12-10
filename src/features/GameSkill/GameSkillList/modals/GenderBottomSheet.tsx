/**
 * GenderBottomSheet - Gender Filter Modal
 * Bottom sheet for selecting gender filter
 *
 * Invocation: FilterArea gender button press
 * Logic: Display gender options, emit selection to parent
 */
import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, SafeAreaView } from 'react-native';
import type { GenderType } from '../../api/types';

interface Props {
  visible: boolean;
  currentValue: GenderType;
  onSelect: (value: GenderType) => void;
  onClose: () => void;
}

const OPTIONS: { value: GenderType; label: string }[] = [
  { value: 'all', label: '不限性别' },
  { value: 'female', label: '只看女生' },
  { value: 'male', label: '只看男生' },
];

export function GenderBottomSheet({ visible, currentValue, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>性别筛选</Text>
            {OPTIONS.map((opt) => (
              <TouchableOpacity key={opt.value} style={styles.option} onPress={() => onSelect(opt.value)}>
                <Text style={[styles.optionText, opt.value === currentValue && styles.activeText]}>{opt.label}</Text>
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
