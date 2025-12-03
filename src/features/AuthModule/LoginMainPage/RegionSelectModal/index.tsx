// #region 1. File Banner & TOC
/**
 * RegionSelectModal - 地区选择模态框组件
 * 
 * 功能描述：
 * - 底部抽屉样式
 * - 搜索功能（实时过滤）
 * - 分组列表（按首字母）
 * - 字母索引（快速定位）
 * - 热门地区推荐
 * - Flutter样式完全复刻
 * 
 * TOC (快速跳转):
 * [1] File Banner & TOC
 * [2] Imports
 * [3] Types & Schema
 * [4] Constants & Config
 * [5] Mock Data
 * [6] Utils & Helpers
 * [7] State Management
 * [8] UI Components & Rendering
 * [9] Exports
 */
// #endregion

// #region 2. Imports
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    FlatList,
    Modal,
    SafeAreaView,
    SectionList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    type SectionListData,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// #endregion

// #region 3. Types & Schema
interface Country {
  id: string;
  name: string;
  nameEn: string;
  code: string;
  flag: string;
  popular?: boolean;
}

interface CountrySection {
  title: string;
  data: Country[];
}

interface RegionSelectModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: Country) => void;
  selectedCode?: string;
}
// #endregion

// #region 4. Constants & Config
const COLORS = {
  BACKGROUND: '#FFFFFF',
  OVERLAY: 'rgba(0, 0, 0, 0.5)',
  BORDER: '#E5E7EB',
  TEXT_PRIMARY: '#1F2937',
  TEXT_SECONDARY: '#6B7280',
  TEXT_HINT: '#9CA3AF',
  PRIMARY: '#9C27B0',
  PRIMARY_LIGHT: '#F3E5F5',
  DIVIDER: '#F3F4F6',
} as const;

const CONFIG = {
  MODAL_HEIGHT: '90%',
  HEADER_HEIGHT: 56,
  SEARCH_HEIGHT: 56,
  HOT_SECTION_HEIGHT: 120,
  ITEM_HEIGHT: 56,
  SECTION_HEADER_HEIGHT: 36,
  INDEX_WIDTH: 24,
} as const;
// #endregion

// #region 5. Mock Data
const COUNTRIES: Country[] = [
  { id: '1', name: '中国大陆', nameEn: 'China', code: '+86', flag: '🇨🇳', popular: true },
  { id: '2', name: '中国香港', nameEn: 'Hong Kong', code: '+852', flag: '🇭🇰', popular: true },
  { id: '3', name: '中国澳门', nameEn: 'Macao', code: '+853', flag: '🇲🇴' },
  { id: '4', name: '中国台湾', nameEn: 'Taiwan', code: '+886', flag: '🇹🇼', popular: true },
  { id: '5', name: '美国', nameEn: 'United States', code: '+1', flag: '🇺🇸', popular: true },
  { id: '6', name: '日本', nameEn: 'Japan', code: '+81', flag: '🇯🇵', popular: true },
  { id: '7', name: '韩国', nameEn: 'South Korea', code: '+82', flag: '🇰🇷', popular: true },
  { id: '8', name: '英国', nameEn: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { id: '9', name: '法国', nameEn: 'France', code: '+33', flag: '🇫🇷' },
  { id: '10', name: '德国', nameEn: 'Germany', code: '+49', flag: '🇩🇪' },
  { id: '11', name: '澳大利亚', nameEn: 'Australia', code: '+61', flag: '🇦🇺' },
  { id: '12', name: '加拿大', nameEn: 'Canada', code: '+1', flag: '🇨🇦' },
  { id: '13', name: '新加坡', nameEn: 'Singapore', code: '+65', flag: '🇸🇬' },
  { id: '14', name: '马来西亚', nameEn: 'Malaysia', code: '+60', flag: '🇲🇾' },
];

// 预设仅显示的几个地区（无搜索时）
const PRESET_CODES = ['+86', '+852', '+1', '+81', '+65', '+44'] as const;
const PRESET_COUNTRIES: Country[] = COUNTRIES.filter(c =>
  PRESET_CODES.includes(c.code as any)
);
// #endregion

// #region 6. Utils & Helpers
/**
 * 获取首字母
 */
const getFirstLetter = (nameEn: string): string => {
  return nameEn.charAt(0).toUpperCase();
};

/**
 * 分组国家列表
 */
const groupCountries = (countries: Country[]): CountrySection[] => {
  const grouped: Record<string, Country[]> = {};
  
  countries.forEach(country => {
    const letter = getFirstLetter(country.nameEn);
    if (!grouped[letter]) {
      grouped[letter] = [];
    }
    grouped[letter].push(country);
  });
  
  // 按字母排序
  const sorted = Object.keys(grouped).sort().map(letter => ({
    title: letter,
    data: grouped[letter],
  }));
  
  return sorted;
};

/**
 * 过滤国家列表
 */
const filterCountries = (countries: Country[], keyword: string): Country[] => {
  if (!keyword) return countries;
  
  const lowerKeyword = keyword.toLowerCase();
  return countries.filter(country => 
    country.name.toLowerCase().includes(lowerKeyword) ||
    country.nameEn.toLowerCase().includes(lowerKeyword) ||
    country.code.includes(keyword)
  );
};

/**
 * 获取热门地区
 */
const getHotCountries = (countries: Country[]): Country[] => {
  return countries.filter(c => c.popular);
};
// #endregion

// #region 7. State Management
/**
 * 搜索状态Hook
 */
const useSearchState = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  
  const clearSearch = useCallback(() => {
    setSearchKeyword('');
  }, []);
  
  return {
    searchKeyword,
    setSearchKeyword,
    clearSearch,
  };
};
// #endregion

// #region 8. UI Components & Rendering

/**
 * Header - 顶部导航栏
 */
const Header: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>选择国家/地区</Text>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close" size={24} color={COLORS.TEXT_PRIMARY} />
      </TouchableOpacity>
    </View>
  );
};

/**
 * SearchBar - 搜索栏
 */
const SearchBar: React.FC<{
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
}> = ({ value, onChangeText, onClear }) => {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputWrapper}>
        <Ionicons name="search" size={20} color={COLORS.TEXT_HINT} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="搜索国家或地区"
          placeholderTextColor={COLORS.TEXT_HINT}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear}>
            <Ionicons name="close-circle" size={20} color={COLORS.TEXT_HINT} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

/**
 * HotCountries - 热门地区
 */
const HotCountries: React.FC<{
  countries: Country[];
  onSelect: (country: Country) => void;
  selectedCode?: string;
}> = ({ countries, onSelect, selectedCode }) => {
  if (countries.length === 0) return null;
  
  return (
    <View style={styles.hotSection}>
      <Text style={styles.hotTitle}>热门</Text>
      <View style={styles.hotGrid}>
        {countries.map(country => (
          <TouchableOpacity
            key={country.id}
            onPress={() => onSelect(country)}
            style={[
              styles.hotItem,
              selectedCode === country.code && styles.hotItemSelected,
            ]}
          >
            <Text style={styles.hotFlag}>{country.flag}</Text>
            <Text style={styles.hotName} numberOfLines={1}>
              {country.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

/**
 * CountryItem - 国家列表项
 */
const CountryItem: React.FC<{
  country: Country;
  onSelect: (country: Country) => void;
  isSelected: boolean;
}> = React.memo(({ country, onSelect, isSelected }) => {
  return (
    <TouchableOpacity
      onPress={() => onSelect(country)}
      style={[styles.countryItem, isSelected && styles.countryItemSelected]}
    >
      <View style={styles.countryLeft}>
        <Text style={styles.countryFlag}>{country.flag}</Text>
        <View style={styles.countryInfo}>
          <Text style={styles.countryName}>{country.name}</Text>
          <Text style={styles.countryNameEn}>{country.nameEn}</Text>
        </View>
      </View>
      <Text style={styles.countryCode}>{country.code}</Text>
    </TouchableOpacity>
  );
});

/**
 * SectionHeader - 分组标题
 */
const SectionHeader: React.FC<{
  section: SectionListData<Country, CountrySection>;
}> = ({ section }) => {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );
};

/**
 * RegionSelectModal 主组件
 */
const RegionSelectModal: React.FC<RegionSelectModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedCode,
}) => {
  const { searchKeyword, setSearchKeyword, clearSearch } = useSearchState();
  
  // 过滤后的国家列表
  const filteredCountries = useMemo(() => {
    // 有搜索时用完整数据过滤；无搜索时只展示预设的少数地区
    if (!searchKeyword) return PRESET_COUNTRIES;
    return filterCountries(COUNTRIES, searchKeyword);
  }, [searchKeyword]);
  
  // 热门地区
  const hotCountries = useMemo(() => {
    // 无搜索时，用预设的少数地区作为“热门”；搜索时不显示热门
    if (searchKeyword) return [];
    return PRESET_COUNTRIES;
  }, [searchKeyword]);
  
  // 分组后的国家列表
  const sections = useMemo(() => {
    // 仅在搜索时展示完整分组列表；无搜索时不渲染分组（保持为空）
    if (!searchKeyword) return [] as CountrySection[];
    return groupCountries(filterCountries(COUNTRIES, searchKeyword));
  }, [searchKeyword]);
  
  // 选择国家
  const handleSelect = useCallback((country: Country) => {
    onSelect(country);
    onClose();
    clearSearch();
  }, [onSelect, onClose, clearSearch]);
  
  // 渲染列表项
  const renderItem = useCallback(({ item }: { item: Country }) => (
    <CountryItem
      country={item}
      onSelect={handleSelect}
      isSelected={item.code === selectedCode}
    />
  ), [handleSelect, selectedCode]);
  
  // 渲染分组标题
  const renderSectionHeader = useCallback(({ section }: { section: SectionListData<Country, CountrySection> }) => (
    <SectionHeader section={section} />
  ), []);
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View style={styles.modalContainer}>
          <SafeAreaView style={styles.safeArea}>
            {/* 顶部导航隐藏 */}
            {/* <Header onClose={onClose} /> */}
            
            {/* 搜索栏 */}
            <SearchBar
              value={searchKeyword}
              onChangeText={setSearchKeyword}
              onClear={clearSearch}
            />
            
            {/* 热门地区 */}
            {hotCountries.length > 0 && (
              <HotCountries
                countries={hotCountries}
                onSelect={handleSelect}
                selectedCode={selectedCode}
              />
            )}
            
            {/* 国家列表（仅在搜索时显示分组结果） */}
            {sections.length > 0 && (
              <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                stickySectionHeadersEnabled
                showsVerticalScrollIndicator={false}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={() => (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>未找到相关地区</Text>
                  </View>
                )}
              />
            )}
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};
// #endregion

// #region 9. Exports
export default RegionSelectModal;

export type { Country, CountrySection, RegionSelectModalProps };

export { filterCountries, getFirstLetter, getHotCountries, groupCountries };
// #endregion

// Styles
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.OVERLAY,
    justifyContent: 'flex-end',
  },
  
  overlayTouchable: {
    flex: 1,
  },
  
  modalContainer: {
    height: CONFIG.MODAL_HEIGHT,
    backgroundColor: COLORS.BACKGROUND,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  
  safeArea: {
    flex: 1,
  },
  
  // Header
  header: {
    height: CONFIG.HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  
  // Search
  searchContainer: {
    height: CONFIG.SEARCH_HEIGHT,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.DIVIDER,
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    paddingVertical: 8,
  },
  
  // Hot Section
  hotSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  
  hotTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 12,
  },
  
  hotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  hotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.DIVIDER,
    borderRadius: 8,
    gap: 6,
  },
  
  hotItemSelected: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
  },
  
  hotFlag: {
    fontSize: 20,
  },
  
  hotName: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    maxWidth: 80,
  },
  
  // List
  list: {
    flex: 1,
  },
  
  listContent: {
    paddingBottom: 20,
  },
  
  // Section Header
  sectionHeader: {
    height: CONFIG.SECTION_HEADER_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: COLORS.DIVIDER,
  },
  
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
  },
  
  // Country Item
  countryItem: {
    height: CONFIG.ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORS.BACKGROUND,
  },
  
  countryItemSelected: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
  },
  
  countryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  
  countryFlag: {
    fontSize: 24,
  },
  
  countryInfo: {
    flex: 1,
  },
  
  countryName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
  },
  
  countryNameEn: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  
  countryCode: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.TEXT_SECONDARY,
  },
  
  // Empty
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  
  emptyText: {
    fontSize: 14,
    color: COLORS.TEXT_HINT,
  },
});

