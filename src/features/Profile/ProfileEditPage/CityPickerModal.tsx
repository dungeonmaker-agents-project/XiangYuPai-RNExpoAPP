/**
 * CityPickerModal - 城市选择器弹窗
 *
 * 功能：
 * - 底部弹出的省市二级联动选择器
 * - 从后端API加载地区数据
 * - 确认/取消操作
 *
 * @author XyPai Team
 * @since 2025-12-02
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { profileEditApi } from './api';
import type { RegionData } from './api';

interface CityPickerModalProps {
  visible: boolean;
  title: string;
  currentProvince?: string;
  currentCity?: string;
  onSelect: (province: string, city: string, locationCode: string) => void;
  onCancel: () => void;
}

const COLORS = {
  WHITE: '#FFFFFF',
  BG_GRAY: '#F5F5F5',
  TEXT_PRIMARY: '#333333',
  TEXT_SECONDARY: '#999999',
  BORDER: '#E5E5E5',
  PRIMARY: '#9C27B0',
  PRIMARY_LIGHT: '#F3E5F5',
  OVERLAY: 'rgba(0, 0, 0, 0.5)',
} as const;

const CityPickerModal: React.FC<CityPickerModalProps> = ({
  visible,
  title,
  currentProvince,
  currentCity,
  onSelect,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [provinces, setProvinces] = useState<RegionData[]>([]);
  const [cities, setCities] = useState<RegionData[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<RegionData | null>(null);
  const [selectedCity, setSelectedCity] = useState<RegionData | null>(null);

  // 加载省份列表
  const loadProvinces = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await profileEditApi.getProvinces();
      if (response.code === 200 && response.data) {
        setProvinces(response.data);
      }
    } catch (error) {
      console.error('加载省份列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 加载城市列表
  const loadCities = useCallback(async (provinceCode: string) => {
    try {
      setIsLoading(true);
      const response = await profileEditApi.getCities(provinceCode);
      if (response.code === 200 && response.data) {
        setCities(response.data);
      }
    } catch (error) {
      console.error('加载城市列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 弹窗打开时加载省份
  useEffect(() => {
    if (visible) {
      loadProvinces();
      setSelectedProvince(null);
      setSelectedCity(null);
      setCities([]);
    }
  }, [visible, loadProvinces]);

  // 选择省份时加载城市
  const handleProvinceSelect = (province: RegionData) => {
    setSelectedProvince(province);
    setSelectedCity(null);
    if (province.hasChildren) {
      loadCities(province.code);
    } else {
      // 直辖市等没有下级城市的，直接选中
      setCities([]);
    }
  };

  // 选择城市
  const handleCitySelect = (city: RegionData) => {
    setSelectedCity(city);
  };

  // 确认选择
  const handleConfirm = () => {
    if (selectedProvince) {
      const provinceName = selectedProvince.name;
      const cityName = selectedCity?.name || '';
      // 优先使用城市编码，没有城市时使用省份编码
      const locationCode = selectedCity?.code || selectedProvince.code;
      onSelect(provinceName, cityName, locationCode);
    }
  };

  // 快速选择（城市直接确认）
  const handleQuickSelect = (city: RegionData) => {
    if (selectedProvince) {
      onSelect(selectedProvince.name, city.name, city.code);
    }
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
            <TouchableOpacity
              onPress={handleConfirm}
              style={styles.headerButton}
              disabled={!selectedProvince}
            >
              <Text style={[styles.confirmText, !selectedProvince && styles.disabledText]}>
                确定
              </Text>
            </TouchableOpacity>
          </View>

          {/* 已选择显示 */}
          <View style={styles.selectedDisplay}>
            <Text style={styles.selectedText}>
              已选：{selectedProvince?.name || '请选择省份'}
              {selectedCity ? ` - ${selectedCity.name}` : ''}
            </Text>
          </View>

          {/* 选择区域 */}
          <View style={styles.pickerContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.PRIMARY} />
              </View>
            ) : (
              <View style={styles.columnsContainer}>
                {/* 省份列 */}
                <ScrollView style={styles.column} showsVerticalScrollIndicator={false}>
                  {provinces.map(province => (
                    <TouchableOpacity
                      key={province.code}
                      style={[
                        styles.optionItem,
                        selectedProvince?.code === province.code && styles.selectedOption,
                      ]}
                      onPress={() => handleProvinceSelect(province)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selectedProvince?.code === province.code && styles.selectedOptionText,
                        ]}
                      >
                        {province.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* 城市列 */}
                {selectedProvince && cities.length > 0 && (
                  <ScrollView style={styles.column} showsVerticalScrollIndicator={false}>
                    {cities.map(city => (
                      <TouchableOpacity
                        key={city.code}
                        style={[
                          styles.optionItem,
                          selectedCity?.code === city.code && styles.selectedOption,
                        ]}
                        onPress={() => handleQuickSelect(city)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            selectedCity?.code === city.code && styles.selectedOptionText,
                          ]}
                        >
                          {city.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                {/* 直辖市提示 */}
                {selectedProvince && !selectedProvince.hasChildren && cities.length === 0 && (
                  <View style={styles.directCityHint}>
                    <Text style={styles.hintText}>直辖市无需选择城市</Text>
                    <Text style={styles.hintText}>点击"确定"完成选择</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
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
    maxHeight: '70%',
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
  disabledText: {
    color: COLORS.TEXT_SECONDARY,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  selectedDisplay: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.BG_GRAY,
  },
  selectedText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  pickerContainer: {
    minHeight: 300,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  columnsContainer: {
    flexDirection: 'row',
    height: 300,
  },
  column: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: COLORS.BORDER,
  },
  optionItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  selectedOption: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
  },
  optionText: {
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
  },
  selectedOptionText: {
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },
  directCityHint: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  hintText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
});

export default CityPickerModal;
