/**
 * FilterBottomSheet - Advanced Filter Modal
 * Full-height bottom sheet for multi-category filter selection
 *
 * Invocation: FilterArea filter button press
 * Logic: Display 7 filter categories, manage local state, emit on apply
 * Internal: FilterSection (renders each category), TagChip (styled tag button)
 * External: useSkillStore (filterOptions), SkillFiltersParams type
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, SafeAreaView, ScrollView, Switch } from 'react-native';
import { useSkillStore } from '../../stores';
import type { SkillFiltersParams, OptionVO, PriceRangeOptionVO } from '../../api/types';

// ============================================================================
// PROPS INTERFACE
// ============================================================================

interface Props {
  visible: boolean;
  currentFilters: SkillFiltersParams;
  onApply: (filters: SkillFiltersParams) => void;
  onReset: () => void;
  onClose: () => void;
}

// ============================================================================
// LOCAL STATE INTERFACE
// ============================================================================

interface LocalFilterState {
  status: string;
  region: string[];
  rank: string[];
  priceRange: string;
  position: string[];
  tags: string[];
  sameCity: boolean;
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

/** TagChip - Styled selectable tag button */
interface TagChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function TagChip({ label, selected, onPress }: TagChipProps) {
  return (
    <TouchableOpacity
      style={[styles.tagChip, selected && styles.tagChipActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.tagChipText, selected && styles.tagChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

/** FilterSection - Renders a single filter category with options */
interface FilterSectionProps {
  title: string;
  options: (OptionVO | PriceRangeOptionVO)[];
  selectedValues: string | string[];
  multiSelect?: boolean;
  onSelect: (value: string) => void;
}

function FilterSection({ title, options, selectedValues, multiSelect = false, onSelect }: FilterSectionProps) {
  const isSelected = (value: string) => {
    if (Array.isArray(selectedValues)) {
      return selectedValues.includes(value);
    }
    return selectedValues === value;
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.optionsContainer}>
        {options.map((opt) => (
          <TagChip
            key={opt.value}
            label={opt.label}
            selected={isSelected(opt.value)}
            onPress={() => onSelect(opt.value)}
          />
        ))}
      </View>
    </View>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FilterBottomSheet({ visible, currentFilters, onApply, onReset, onClose }: Props) {
  // Get filter options from store (loaded from API config)
  const filterOptions = useSkillStore((s) => s.filterOptions);

  // Local filter state - initialized from currentFilters prop
  const [localFilters, setLocalFilters] = useState<LocalFilterState>({
    status: 'all',
    region: [],
    rank: [],
    priceRange: '',
    position: [],
    tags: [],
    sameCity: false,
  });

  // Sync local state with currentFilters when modal opens
  useEffect(() => {
    if (visible) {
      setLocalFilters({
        status: currentFilters.status || 'all',
        region: currentFilters.region || [],
        rank: currentFilters.rank || [],
        priceRange: currentFilters.priceRange || '',
        position: currentFilters.position || [],
        tags: currentFilters.tags || [],
        sameCity: currentFilters.location === 'same_city',
      });
    }
  }, [visible, currentFilters]);

  // --------------------------------------------------------------------------
  // SELECTION HANDLERS
  // --------------------------------------------------------------------------

  /** Single-select handler - replaces current value or clears if same */
  const handleSingleSelect = useCallback((key: 'status' | 'priceRange', value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? (key === 'status' ? 'all' : '') : value,
    }));
  }, []);

  /** Multi-select handler - toggles value in array */
  const handleMultiSelect = useCallback((key: 'region' | 'rank' | 'position' | 'tags', value: string) => {
    setLocalFilters((prev) => {
      const current = prev[key];
      const newValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: newValues };
    });
  }, []);

  /** Same city toggle handler */
  const handleSameCityToggle = useCallback((value: boolean) => {
    setLocalFilters((prev) => ({ ...prev, sameCity: value }));
  }, []);

  // --------------------------------------------------------------------------
  // ACTION HANDLERS
  // --------------------------------------------------------------------------

  /** Apply filters - convert local state to SkillFiltersParams and emit */
  const handleApply = useCallback(() => {
    const filters: SkillFiltersParams = {};

    if (localFilters.status && localFilters.status !== 'all') {
      filters.status = localFilters.status as SkillFiltersParams['status'];
    }
    if (localFilters.region.length > 0) {
      filters.region = localFilters.region;
    }
    if (localFilters.rank.length > 0) {
      filters.rank = localFilters.rank;
    }
    if (localFilters.priceRange) {
      filters.priceRange = localFilters.priceRange;
    }
    if (localFilters.position.length > 0) {
      filters.position = localFilters.position;
    }
    if (localFilters.tags.length > 0) {
      filters.tags = localFilters.tags;
    }
    if (localFilters.sameCity) {
      filters.location = 'same_city';
    }

    onApply(filters);
    onClose();
  }, [localFilters, onApply, onClose]);

  /** Reset local filters to defaults */
  const handleReset = useCallback(() => {
    setLocalFilters({
      status: 'all',
      region: [],
      rank: [],
      priceRange: '',
      position: [],
      tags: [],
      sameCity: false,
    });
    onReset();
  }, [onReset]);

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  // Default options if filterOptions not loaded yet
  const defaultStatusOptions: OptionVO[] = [
    { value: 'all', label: '全部' },
    { value: 'online', label: '在线' },
    { value: 'active_3d', label: '3日内活跃' },
    { value: 'active_7d', label: '7日内活跃' },
  ];

  const defaultRegionOptions: OptionVO[] = [
    { value: 'qq', label: 'QQ区' },
    { value: 'wechat', label: '微信区' },
  ];

  const defaultRankOptions: OptionVO[] = [
    { value: 'glory_king', label: '荣耀王者' },
    { value: 'supreme_master', label: '无双王者' },
    { value: 'unparalleled_king', label: '传奇王者' },
    { value: 'star', label: '至尊星耀' },
    { value: 'diamond', label: '永恒钻石' },
  ];

  const defaultPriceOptions: PriceRangeOptionVO[] = [
    { value: '4-9', label: '4-9金币', min: 4, max: 9 },
    { value: '10-19', label: '10-19金币', min: 10, max: 19 },
    { value: '20+', label: '20+金币', min: 20 },
  ];

  const defaultPositionOptions: OptionVO[] = [
    { value: 'jungle', label: '打野' },
    { value: 'mid', label: '中路' },
    { value: 'top', label: '对抗路' },
    { value: 'bot', label: '发育路' },
    { value: 'support', label: '辅助' },
  ];

  const defaultTagOptions: OptionVO[] = [
    { value: 'glory_king', label: '荣耀王者' },
    { value: 'peak', label: '巅峰赛' },
    { value: 'boost', label: '带粉上分' },
    { value: 'voice', label: '声优陪玩' },
    { value: 'esports', label: '电竞陪练' },
  ];

  // Use API options if available, otherwise defaults
  const statusOptions = filterOptions?.statusOptions || defaultStatusOptions;
  const regionOptions = filterOptions?.regionOptions || defaultRegionOptions;
  const rankOptions = filterOptions?.rankOptions || defaultRankOptions;
  const priceRangeOptions = filterOptions?.priceRangeOptions || defaultPriceOptions;
  const positionOptions = filterOptions?.positionOptions || defaultPositionOptions;
  const tagOptions = filterOptions?.tagOptions || defaultTagOptions;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancel}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.title}>筛选</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.reset}>重置</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Sections */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Status - Single Select */}
            <FilterSection
              title="在线状态"
              options={statusOptions}
              selectedValues={localFilters.status}
              onSelect={(v) => handleSingleSelect('status', v)}
            />

            {/* Region - Multi Select */}
            <FilterSection
              title="大区"
              options={regionOptions}
              selectedValues={localFilters.region}
              multiSelect
              onSelect={(v) => handleMultiSelect('region', v)}
            />

            {/* Rank - Multi Select */}
            <FilterSection
              title="段位"
              options={rankOptions}
              selectedValues={localFilters.rank}
              multiSelect
              onSelect={(v) => handleMultiSelect('rank', v)}
            />

            {/* Price Range - Single Select */}
            <FilterSection
              title="价格区间"
              options={priceRangeOptions}
              selectedValues={localFilters.priceRange}
              onSelect={(v) => handleSingleSelect('priceRange', v)}
            />

            {/* Position - Multi Select */}
            <FilterSection
              title="位置"
              options={positionOptions}
              selectedValues={localFilters.position}
              multiSelect
              onSelect={(v) => handleMultiSelect('position', v)}
            />

            {/* Tags - Multi Select */}
            <FilterSection
              title="标签"
              options={tagOptions}
              selectedValues={localFilters.tags}
              multiSelect
              onSelect={(v) => handleMultiSelect('tags', v)}
            />

            {/* Same City Toggle */}
            <View style={styles.section}>
              <View style={styles.sameCityRow}>
                <Text style={styles.sectionTitle}>同城优先</Text>
                <Switch
                  value={localFilters.sameCity}
                  onValueChange={handleSameCityToggle}
                  trackColor={{ false: '#E5E5E5', true: '#D4A6E8' }}
                  thumbColor={localFilters.sameCity ? '#9B59B6' : '#FFF'}
                />
              </View>
            </View>

            {/* Bottom spacing for scrolling */}
            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Footer Action Bar */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetBtnText}>重置</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyText}>完成</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Overlay and container
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#FFF', height: '80%', borderTopLeftRadius: 16, borderTopRightRadius: 16 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  cancel: { fontSize: 15, color: '#666' },
  title: { fontSize: 16, fontWeight: '600' },
  reset: { fontSize: 15, color: '#9B59B6' },

  // Content
  content: { flex: 1, paddingHorizontal: 16 },

  // Section
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 14, color: '#333', fontWeight: '500', marginBottom: 12 },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

  // Tag Chip
  tagChip: { borderWidth: 1, borderColor: '#EEEEEE', backgroundColor: '#F5F5F5', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8 },
  tagChipActive: { borderColor: '#9B59B6', backgroundColor: '#F5E6FF' },
  tagChipText: { fontSize: 13, color: '#666' },
  tagChipTextActive: { color: '#9B59B6' },

  // Same City Row
  sameCityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  // Footer
  footer: { flexDirection: 'row', padding: 16, paddingBottom: 24, borderTopWidth: 1, borderTopColor: '#F0F0F0', gap: 12 },
  resetBtn: { flex: 1, borderWidth: 1, borderColor: '#EEEEEE', backgroundColor: '#FFF', borderRadius: 24, paddingVertical: 14, alignItems: 'center' },
  resetBtnText: { color: '#666', fontSize: 16 },
  applyBtn: { flex: 2, backgroundColor: '#9B59B6', borderRadius: 24, paddingVertical: 14, alignItems: 'center' },
  applyText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
