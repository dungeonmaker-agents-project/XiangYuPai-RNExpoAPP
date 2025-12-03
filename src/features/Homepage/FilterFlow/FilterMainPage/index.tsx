/**
 * FilterMainPage - 筛选主页面
 * 基于接口文档: 首页筛选功能接口文档.md
 * 
 * 功能:
 * 1. 获取并显示筛选配置（年龄、性别、状态、技能、价格、位置、标签）
 * 2. 支持线上/线下模式切换
 * 3. 实时更新筛选条件（年龄滑块、单选、多选）
 * 4. 重置所有筛选条件
 * 5. 应用筛选并返回首页
 */

import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { ErrorBoundary } from '../../../../components';
import { filterApi } from '../api';
import type {
  FilterConditions,
  FilterConfig,
  FilterType,
  GenderType,
  StatusType,
} from '../api/types';

// ============ Types ============

interface FilterPageProps {
  filterType?: FilterType;
}

// ============ Constants ============

const COLORS = {
  BACKGROUND: '#FFFFFF',
  PRIMARY: '#8B5CF6', // 紫色
  PRIMARY_LIGHT: '#A78BFA',
  TEXT: '#1F2937',
  TEXT_SECONDARY: '#6B7280',
  TEXT_WHITE: '#FFFFFF',
  BORDER: '#E5E7EB',
  SURFACE: '#F3F4F6',
  ERROR: '#EF4444',
};

const DEFAULT_AGE = {
  MIN: 18,
  MAX: 60,
};

const PAGE_CONFIG = {
  PAGE_SIZE: 10,
  INITIAL_PAGE: 1,
};

// ============ Main Component ============

const FilterMainPage: React.FC<FilterPageProps> = ({ filterType = 'online' }) => {
  const router = useRouter();

  // ========== State ==========
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<FilterConfig | null>(null);
  const [currentType, setCurrentType] = useState<FilterType>(filterType);

  // 筛选条件状态
  const [ageMin, setAgeMin] = useState<number>(DEFAULT_AGE.MIN);
  const [ageMax, setAgeMax] = useState<number | null>(DEFAULT_AGE.MAX);
  const [gender, setGender] = useState<GenderType>('all');
  const [status, setStatus] = useState<StatusType>('online');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // ========== Load Config ==========
  useEffect(() => {
    loadFilterConfig();
  }, [currentType]);

  const loadFilterConfig = async () => {
    try {
      setLoading(true);
      const data = await filterApi.getFilterConfig(currentType);
      setConfig(data);
    } catch (error: any) {
      Alert.alert('加载失败', error.message || '获取筛选配置失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // ========== Handlers ==========

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleReset = useCallback(() => {
    setAgeMin(DEFAULT_AGE.MIN);
    setAgeMax(null);
    setGender('all');
    setStatus('online');
    setSelectedSkills([]);
    setSelectedPrices([]);
    setSelectedPositions([]);
    setSelectedTags([]);
  }, []);

  const handleTypeChange = useCallback((type: FilterType) => {
    setCurrentType(type);
    setSelectedPrices([]);
    setSelectedPositions([]);
  }, []);

  const handleApply = useCallback(async () => {
    const hasFilters =
      ageMin !== DEFAULT_AGE.MIN ||
      ageMax !== null ||
      gender !== 'all' ||
      status !== 'online' ||
      selectedSkills.length > 0 ||
      selectedPrices.length > 0 ||
      selectedPositions.length > 0 ||
      selectedTags.length > 0;

    if (!hasFilters) {
      Alert.alert('提示', '请至少选择一个筛选条件');
      return;
    }

    const filters: FilterConditions = {
      age: { min: ageMin, max: ageMax },
      gender,
      status,
    };

    if (selectedSkills.length > 0) filters.skills = selectedSkills;
    if (selectedPrices.length > 0) filters.priceRange = selectedPrices;
    if (selectedPositions.length > 0) filters.positions = selectedPositions;
    if (selectedTags.length > 0) filters.tags = selectedTags;

    try {
      setLoading(true);
      const result = await filterApi.applyFilter({
        type: currentType,
        filters,
        pageNum: PAGE_CONFIG.INITIAL_PAGE,
        pageSize: PAGE_CONFIG.PAGE_SIZE,
      });

      Alert.alert('成功', `找到 ${result.total} 个符合条件的用户`, [
        { text: '确定', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('筛选失败', error.message || '应用筛选失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [
    ageMin,
    ageMax,
    gender,
    status,
    selectedSkills,
    selectedPrices,
    selectedPositions,
    selectedTags,
    currentType,
    router,
  ]);

  const toggleMultiSelect = useCallback(
    (value: string, currentList: string[], setter: (list: string[]) => void) => {
      if (currentList.includes(value)) {
        setter(currentList.filter((v) => v !== value));
      } else {
        setter([...currentList, value]);
      }
    },
    []
  );

  // ========== Render ==========

  if (loading && !config) {
    return (
      <ErrorBoundary>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>加载筛选配置...</Text>
        </View>
      </ErrorBoundary>
    );
  }
  
  return (
    <ErrorBoundary>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>筛选</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 类型切换 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>类型</Text>
            <View style={styles.typeButtons}>
              <TouchableOpacity
                style={[styles.typeButton, currentType === 'online' && styles.typeButtonActive]}
                onPress={() => handleTypeChange('online')}
              >
                <Text style={[styles.typeButtonText, currentType === 'online' && styles.typeButtonTextActive]}>
                  线上
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, currentType === 'offline' && styles.typeButtonActive]}
                onPress={() => handleTypeChange('offline')}
              >
                <Text style={[styles.typeButtonText, currentType === 'offline' && styles.typeButtonTextActive]}>
                  线下
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 年龄范围 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>年龄</Text>
            <View style={styles.ageDisplay}>
              <Text style={styles.ageText}>
                {ageMin}岁 - {ageMax === null ? '不限' : `${ageMax}岁`}
              </Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={config?.ageRange.min || DEFAULT_AGE.MIN}
              maximumValue={config?.ageRange.max || DEFAULT_AGE.MAX}
              value={ageMin}
              onValueChange={setAgeMin}
              minimumTrackTintColor={COLORS.PRIMARY}
              maximumTrackTintColor={COLORS.SURFACE}
              thumbTintColor={COLORS.PRIMARY}
              step={1}
            />
          </View>

          {/* 性别 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>性别</Text>
            <View style={styles.optionRow}>
              {config?.genderOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.optionButton, gender === option.value && styles.optionButtonActive]}
                  onPress={() => setGender(option.value)}
                >
                  <Text style={[styles.optionButtonText, gender === option.value && styles.optionButtonTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 状态 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>状态</Text>
            <View style={styles.optionRow}>
              {config?.statusOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.optionButton, status === option.value && styles.optionButtonActive]}
                  onPress={() => setStatus(option.value)}
                >
                  <Text style={[styles.optionButtonText, status === option.value && styles.optionButtonTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 技能 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>技能</Text>
            <View style={styles.optionGrid}>
              {config?.skillOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.gridButton, selectedSkills.includes(option.value) && styles.gridButtonActive]}
                  onPress={() => toggleMultiSelect(option.value, selectedSkills, setSelectedSkills)}
                >
                  <Text style={[styles.gridButtonText, selectedSkills.includes(option.value) && styles.gridButtonTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 价格（仅线上） */}
          {currentType === 'online' && config?.priceOptions && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>价格</Text>
              <View style={styles.optionGrid}>
                {config.priceOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.gridButton, selectedPrices.includes(option.value) && styles.gridButtonActive]}
                    onPress={() => toggleMultiSelect(option.value, selectedPrices, setSelectedPrices)}
                  >
                    <Text style={[styles.gridButtonText, selectedPrices.includes(option.value) && styles.gridButtonTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* 位置（仅线上） */}
          {currentType === 'online' && config?.positionOptions && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>位置</Text>
              <View style={styles.optionGrid}>
                {config.positionOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.gridButton, selectedPositions.includes(option.value) && styles.gridButtonActive]}
                    onPress={() => toggleMultiSelect(option.value, selectedPositions, setSelectedPositions)}
                  >
                    <Text style={[styles.gridButtonText, selectedPositions.includes(option.value) && styles.gridButtonTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* 标签 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>标签</Text>
            <View style={styles.optionGrid}>
              {config?.tagOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.gridButton,
                    selectedTags.includes(option.value) && styles.gridButtonActive,
                    option.highlighted && styles.gridButtonHighlighted,
                  ]}
                  onPress={() => toggleMultiSelect(option.value, selectedTags, setSelectedTags)}
                >
                  <Text style={[styles.gridButtonText, selectedTags.includes(option.value) && styles.gridButtonTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>重置</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.TEXT_WHITE} />
            ) : (
              <Text style={styles.applyButtonText}>完成</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ErrorBoundary>
  );
};

// ============ Styles ============

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    backgroundColor: COLORS.BACKGROUND,
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.TEXT,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT,
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: 12,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.TEXT,
  },
  typeButtonTextActive: {
    color: COLORS.TEXT_WHITE,
  },
  ageDisplay: {
    alignItems: 'center',
    marginBottom: 8,
  },
  ageText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.PRIMARY,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 8,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.TEXT,
  },
  optionButtonTextActive: {
    color: COLORS.TEXT_WHITE,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 8,
    marginBottom: 4,
  },
  gridButtonActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  gridButtonHighlighted: {
    borderWidth: 1,
    borderColor: COLORS.PRIMARY_LIGHT,
  },
  gridButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.TEXT,
  },
  gridButtonTextActive: {
    color: COLORS.TEXT_WHITE,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    backgroundColor: COLORS.BACKGROUND,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_WHITE,
  },
});

export default FilterMainPage;
