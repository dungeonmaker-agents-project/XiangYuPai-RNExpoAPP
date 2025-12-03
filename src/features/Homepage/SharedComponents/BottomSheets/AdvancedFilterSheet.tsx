/**
 * AdvancedFilterSheet - 高级筛选底部弹窗
 *
 * 共享组件：用于 EventCenterPage 和 ServiceDetailPage 的高级筛选
 */

import React, { useState } from 'react';
import {
    Animated,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

export interface AdvancedFilters {
  status: 'online' | 'all';
  area: string[];
  rank: string[];
  priceRange: string[];
  position: string[];
  tags: string[];
  location: string[];
}

interface AdvancedFilterSheetProps {
  visible: boolean;
  filters: AdvancedFilters;
  onApply: (filters: AdvancedFilters) => void;
  onReset: () => void;
  onClose: () => void;
}

export const AdvancedFilterSheet: React.FC<AdvancedFilterSheetProps> = ({
  visible,
  filters: initialFilters,
  onApply,
  onReset,
  onClose,
}) => {
  const [slideAnim] = React.useState(new Animated.Value(0));
  const [filters, setFilters] = useState<AdvancedFilters>(initialFilters);

  React.useEffect(() => {
    if (visible) {
      setFilters(initialFilters);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, initialFilters]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [800, 0],
  });

  const toggleArrayItem = (array: string[], item: string): string[] => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: AdvancedFilters = {
      status: 'all',
      area: [],
      rank: [],
      priceRange: [],
      position: [],
      tags: [],
      location: [],
    };
    setFilters(resetFilters);
    onReset();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.container,
                { transform: [{ translateY }] },
              ]}
            >
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
              >
                {/* 状态 */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>状态</Text>
                  <View style={styles.optionsRow}>
                    <TouchableOpacity
                      style={[
                        styles.chip,
                        filters.status === 'online' && styles.chipSelected,
                      ]}
                      onPress={() => setFilters({ ...filters, status: 'online' })}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          filters.status === 'online' && styles.chipTextSelected,
                        ]}
                      >
                        在线
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 价格 */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>价格</Text>
                  <View style={styles.optionsRow}>
                    {['100-200币', '200-300币', '300币以上'].map((price) => (
                      <TouchableOpacity
                        key={price}
                        style={[
                          styles.chip,
                          filters.priceRange.includes(price) && styles.chipSelected,
                        ]}
                        onPress={() =>
                          setFilters({
                            ...filters,
                            priceRange: toggleArrayItem(filters.priceRange, price),
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.chipText,
                            filters.priceRange.includes(price) && styles.chipTextSelected,
                          ]}
                        >
                          {price}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* 标签 */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>标签</Text>
                  <View style={styles.optionsRow}>
                    {['可接急单', '官方认证', '大神认证', '声优陪玩'].map((tag) => (
                      <TouchableOpacity
                        key={tag}
                        style={[
                          styles.chip,
                          filters.tags.includes(tag) && styles.chipSelected,
                        ]}
                        onPress={() =>
                          setFilters({
                            ...filters,
                            tags: toggleArrayItem(filters.tags, tag),
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.chipText,
                            filters.tags.includes(tag) && styles.chipTextSelected,
                          ]}
                        >
                          {tag}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* 所在地 */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>所在地</Text>
                  <View style={styles.optionsRow}>
                    <TouchableOpacity
                      style={[
                        styles.chip,
                        filters.location.includes('同城') && styles.chipSelected,
                      ]}
                      onPress={() =>
                        setFilters({
                          ...filters,
                          location: toggleArrayItem(filters.location, '同城'),
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.chipText,
                          filters.location.includes('同城') && styles.chipTextSelected,
                        ]}
                      >
                        同城
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{ height: 100 }} />
              </ScrollView>

              {/* 底部按钮 */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleReset}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resetButtonText}>重置</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={handleApply}
                  activeOpacity={0.8}
                >
                  <Text style={styles.applyButtonText}>完成</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  scrollView: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: '#F3E8FF',
    borderColor: '#8B5CF6',
  },
  chipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  chipTextSelected: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 34,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  resetButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  applyButton: {
    flex: 2,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AdvancedFilterSheet;
