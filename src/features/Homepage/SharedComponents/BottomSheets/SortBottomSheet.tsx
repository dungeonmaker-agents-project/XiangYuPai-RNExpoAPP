/**
 * SortBottomSheet - 排序选择底部弹窗
 *
 * 共享组件：用于 EventCenterPage 和 ServiceDetailPage 的排序选择
 */

import React from 'react';
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

export type SortOption = 'smart' | 'latest' | 'nearest' | 'popular';

interface SortBottomSheetProps {
  visible: boolean;
  selectedSort: SortOption;
  onSelect: (sort: SortOption) => void;
  onClose: () => void;
}

const SORT_OPTIONS = [
  { id: 'smart' as SortOption, label: '智能排序' },
  { id: 'latest' as SortOption, label: '最新排序' },
  { id: 'nearest' as SortOption, label: '最近排序' },
  { id: 'popular' as SortOption, label: '人气排序' },
];

export const SortBottomSheet: React.FC<SortBottomSheetProps> = ({
  visible,
  selectedSort,
  onSelect,
  onClose,
}) => {
  const [slideAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
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
  }, [visible]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const handleSelect = (sort: SortOption) => {
    onSelect(sort);
    setTimeout(onClose, 150);
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
              {/* 选项列表 */}
              <View style={styles.optionsList}>
                {SORT_OPTIONS.map((option) => {
                  const isSelected = option.id === selectedSort;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.optionItem}
                      onPress={() => handleSelect(option.id)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                      {isSelected && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
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
    paddingBottom: 34,
  },
  optionsList: {
    paddingTop: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 56,
  },
  optionText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '400',
  },
  optionTextSelected: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 20,
    color: '#8B5CF6',
    fontWeight: '600',
  },
});

export default SortBottomSheet;
