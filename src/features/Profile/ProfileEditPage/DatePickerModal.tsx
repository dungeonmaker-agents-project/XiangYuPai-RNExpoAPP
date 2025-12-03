/**
 * DatePickerModal - 日期选择器弹窗
 *
 * 功能：
 * - 底部弹出的日期选择器
 * - 支持年月日滚轮选择
 * - 确认/取消操作
 *
 * @author XyPai Team
 * @since 2025-12-02
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

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
  date.setFullYear(date.getFullYear() - 25); // 默认25岁
  return date;
};

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  title,
  currentDate,
  minDate = getDefaultMinDate(),
  maxDate = getDefaultMaxDate(),
  onSelect,
  onCancel,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(currentDate || getDefaultDate());

  // 当弹窗打开时，重置日期
  useEffect(() => {
    if (visible) {
      setSelectedDate(currentDate || getDefaultDate());
    }
  }, [visible, currentDate]);

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleConfirm = () => {
    onSelect(selectedDate);
  };

  // iOS 样式
  if (Platform.OS === 'ios') {
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
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                minimumDate={minDate}
                maximumDate={maxDate}
                onChange={handleDateChange}
                locale="zh-CN"
                style={styles.picker}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }

  // Android 样式
  return (
    <>
      {visible && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          minimumDate={minDate}
          maximumDate={maxDate}
          onChange={(event, date) => {
            if (event.type === 'dismissed') {
              onCancel();
            } else if (event.type === 'set' && date) {
              onSelect(date);
            }
          }}
        />
      )}
    </>
  );
};

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
    paddingBottom: 20,
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
    paddingVertical: 10,
    alignItems: 'center',
  },
  picker: {
    width: '100%',
    height: 200,
  },
});

export default DatePickerModal;
