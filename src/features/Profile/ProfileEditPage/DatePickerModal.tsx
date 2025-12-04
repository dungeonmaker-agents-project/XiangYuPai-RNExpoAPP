/**
 * DatePickerModal - 日期选择器弹窗（纯 JS 实现）
 *
 * 功能：
 * - 底部弹出的日期选择器
 * - 年月日三列滚轮选择
 * - 确认/取消操作
 * - 不依赖原生模块，兼容 Expo managed workflow
 *
 * @author XyPai Team
 * @since 2025-12-02
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

// #region Types & Constants
interface DatePickerModalProps {
  visible: boolean;
  title: string;
  currentDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  onSelect: (date: Date) => void;
  onCancel: () => void;
}

const COLORS = {
  WHITE: '#FFFFFF',
  BG_GRAY: '#F5F5F5',
  TEXT_PRIMARY: '#333333',
  TEXT_SECONDARY: '#999999',
  BORDER: '#E5E5E5',
  PRIMARY: '#9C27B0',
  OVERLAY: 'rgba(0, 0, 0, 0.5)',
} as const;

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

// 默认年龄范围：18-60岁
const getDefaultMinDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 60);
  return date;
};

const getDefaultMaxDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date;
};

const getDefaultDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 25);
  return date;
};

// 获取某年某月的天数
const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};
// #endregion

// #region WheelPicker Component
interface WheelPickerProps {
  data: { label: string; value: number }[];
  selectedValue: number;
  onValueChange: (value: number) => void;
}

const WheelPicker: React.FC<WheelPickerProps> = ({ data, selectedValue, onValueChange }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const isScrolling = useRef(false);

  // 获取选中项的索引
  const selectedIndex = data.findIndex(item => item.value === selectedValue);

  // 初始化滚动位置
  useEffect(() => {
    if (scrollViewRef.current && selectedIndex >= 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: selectedIndex * ITEM_HEIGHT,
          animated: false,
        });
      }, 50);
    }
  }, [selectedIndex]);

  // 滚动结束时计算选中项
  const handleScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, data.length - 1));

    if (data[clampedIndex] && data[clampedIndex].value !== selectedValue) {
      onValueChange(data[clampedIndex].value);
    }

    // 确保对齐
    scrollViewRef.current?.scrollTo({
      y: clampedIndex * ITEM_HEIGHT,
      animated: true,
    });
    isScrolling.current = false;
  }, [data, selectedValue, onValueChange]);

  const handleScrollBegin = () => {
    isScrolling.current = true;
  };

  // 渲染空白占位
  const renderPadding = () => (
    <View style={{ height: ITEM_HEIGHT * 2 }} />
  );

  return (
    <View style={wheelStyles.container}>
      {/* 选中区域高亮 */}
      <View style={wheelStyles.highlight} pointerEvents="none" />

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScrollBeginDrag={handleScrollBegin}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={(e) => {
          if (!isScrolling.current) handleScrollEnd(e);
        }}
      >
        {renderPadding()}
        {data.map((item, index) => {
          const isSelected = item.value === selectedValue;
          return (
            <View key={`${item.value}-${index}`} style={wheelStyles.item}>
              <Text style={[wheelStyles.itemText, isSelected && wheelStyles.selectedText]}>
                {item.label}
              </Text>
            </View>
          );
        })}
        {renderPadding()}
      </ScrollView>
    </View>
  );
};

const wheelStyles = StyleSheet.create({
  container: {
    height: PICKER_HEIGHT,
    flex: 1,
    position: 'relative',
  },
  highlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: COLORS.BG_GRAY,
    borderRadius: 8,
    zIndex: -1,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 18,
    color: COLORS.TEXT_SECONDARY,
  },
  selectedText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
});
// #endregion

// #region DatePickerModal Component
const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  title,
  currentDate,
  minDate = getDefaultMinDate(),
  maxDate = getDefaultMaxDate(),
  onSelect,
  onCancel,
}) => {
  const defaultDate = currentDate || getDefaultDate();
  const [year, setYear] = useState(defaultDate.getFullYear());
  const [month, setMonth] = useState(defaultDate.getMonth());
  const [day, setDay] = useState(defaultDate.getDate());

  // 重置日期
  useEffect(() => {
    if (visible) {
      const date = currentDate || getDefaultDate();
      setYear(date.getFullYear());
      setMonth(date.getMonth());
      setDay(date.getDate());
    }
  }, [visible, currentDate]);

  // 生成年份列表
  const yearData = React.useMemo(() => {
    const years: { label: string; value: number }[] = [];
    for (let y = minDate.getFullYear(); y <= maxDate.getFullYear(); y++) {
      years.push({ label: `${y}年`, value: y });
    }
    return years;
  }, [minDate, maxDate]);

  // 生成月份列表
  const monthData = React.useMemo(() => {
    const months: { label: string; value: number }[] = [];
    for (let m = 0; m < 12; m++) {
      months.push({ label: `${m + 1}月`, value: m });
    }
    return months;
  }, []);

  // 生成日期列表（根据年月动态变化）
  const dayData = React.useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const days: { label: string; value: number }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ label: `${d}日`, value: d });
    }
    return days;
  }, [year, month]);

  // 月份变化时，校正日期
  useEffect(() => {
    const maxDay = getDaysInMonth(year, month);
    if (day > maxDay) {
      setDay(maxDay);
    }
  }, [year, month, day]);

  const handleConfirm = () => {
    const selectedDate = new Date(year, month, day);
    onSelect(selectedDate);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onCancel}
      >
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          {/* 标题栏 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={handleConfirm} style={styles.headerButton}>
              <Text style={styles.confirmText}>确定</Text>
            </TouchableOpacity>
          </View>

          {/* 日期选择器 */}
          <View style={styles.pickerContainer}>
            <WheelPicker
              data={yearData}
              selectedValue={year}
              onValueChange={setYear}
            />
            <WheelPicker
              data={monthData}
              selectedValue={month}
              onValueChange={setMonth}
            />
            <WheelPicker
              data={dayData}
              selectedValue={day}
              onValueChange={setDay}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
// #endregion

// #region Styles
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.OVERLAY,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  headerButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 60,
  },
  cancelText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  confirmText: {
    fontSize: 16,
    color: COLORS.PRIMARY,
    fontWeight: '500',
    textAlign: 'right',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  pickerContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});
// #endregion

export default DatePickerModal;
