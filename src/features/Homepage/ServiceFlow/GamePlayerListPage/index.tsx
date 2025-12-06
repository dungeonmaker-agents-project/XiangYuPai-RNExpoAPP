/**
 * GamePlayerListPage - 服务列表页主页面
 *
 * @description 通用服务列表页，支持所有技能类型：王者荣耀、英雄联盟、和平精英等
 * @usage 从首页功能入口进入，展示对应技能类型的陪玩服务列表
 * @core 数据获取使用 bffApi.getServiceList，支持下拉刷新和上拉加载更多
 *
 * @internal 使用 PlayerCardItem 展示单个卡片
 * @external bffApi.getServiceList / router.back / router.push
 *
 * @author XyPai Team
 * @date 2025-12-03
 */

// ==================== 一、Imports 导入 ====================

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Modal,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// 本地类型和常量
import type {
  PlayerCardData,
  FilterState,
  PageState,
  ModalState,
  SortType,
  GenderType,
  AdvancedFilters,
  QuickTag,
} from './types';
import {
  SKILL_TYPE_HONOR_OF_KINGS,
  QUICK_TAGS,
  SORT_OPTIONS,
  GENDER_OPTIONS,
  DEFAULT_FILTER_STATE,
  DEFAULT_ADVANCED_FILTERS,
  PAGE_SIZE,
  INITIAL_PAGE_NUM,
  COLORS,
  SIZES,
  TEXTS,
  FILTER_GROUPS,
} from './constants';

// API服务
import { bffApi, ServiceListItem } from '../../../../../services/api/bffApi';

// ==================== 二、Types 类型定义 ====================

/** 组件属性 */
interface GamePlayerListPageProps {
  skillType?: string;
}

// ==================== 三、Constants 常量 ====================

/** 默认页面状态 */
const DEFAULT_PAGE_STATE: PageState = {
  isLoading: true,
  isRefreshing: false,
  isLoadingMore: false,
  error: null,
  pageNum: INITIAL_PAGE_NUM,
  hasMore: true,
};

/** 默认弹窗状态 */
const DEFAULT_MODAL_STATE: ModalState = {
  sortVisible: false,
  genderVisible: false,
  filterSheetVisible: false,
};

// ==================== 四、Utils 工具函数 ====================

/**
 * Transform API response to PlayerCardData format
 * @description Data mapping: ServiceListItem → PlayerCardData (aligned with skills + users table)
 * @param item - API response service item
 * @returns Card data for UI rendering
 * @note Robust null checks: handles missing stats/provider/skillInfo/price objects
 */
const transformServiceItemToCardData = (item: ServiceListItem): PlayerCardData => {
  const stats = item.stats || {};
  const provider = item.provider || {};
  const skillInfo = item.skillInfo || {};
  const price = item.price || {};
  const tags = item.tags || [];

  return {
    skillId: item.skillId || 0,
    description: item.description || `${skillInfo.skillLabel || '技能'}陪玩`,
    provider: {
      userId: provider.userId || 0,
      nickname: provider.nickname || '未知用户',
      avatar: provider.avatar || '',
      gender: (provider.gender as 'male' | 'female' | 'other') || 'other',
      age: provider.age || 0,
      isOnline: provider.isOnline || false,
      isVerified: provider.isVerified || false,
      isExpert: tags.includes('大神认证'),
    },
    skillInfo: {
      skillType: skillInfo.skillType || '',
      gameArea: skillInfo.region || null,
      rank: skillInfo.level || null,
      peakScore: null,
      position: null,
    },
    tags: tags.map(tag => ({
      text: tag,
      type: tag.includes('认证') ? 'certification' : 'general',
      color: tag.includes('大神') ? '#FF6B00' : '#8B5CF6',
    })),
    price: {
      amount: price.amount || 0,
      unit: price.unit || '金币/局',
      displayText: price.displayText || '价格面议',
    },
    stats: {
      orders: Number(stats.orders) || 0,
      rating: Number(stats.rating) || 5.0,
      reviewCount: Number(stats.reviewCount) || 0,
    },
    distance: null,
    distanceDisplay: null,
  };
};

/**
 * 获取排序显示文本
 * @param sortBy - 排序类型
 * @returns 显示文本
 */
const getSortLabel = (sortBy: SortType): string =>
  SORT_OPTIONS.find(opt => opt.value === sortBy)?.label || '智能排序';

/**
 * 获取性别显示文本
 * @param gender - 性别类型
 * @returns 显示文本
 */
const getGenderLabel = (gender: GenderType): string =>
  GENDER_OPTIONS.find(opt => opt.value === gender)?.label || '不限性别';

// ==================== 五、State 状态管理Hook ====================

/**
 * 页面状态管理Hook
 * @description 管理列表数据、筛选条件、加载状态和弹窗状态
 */
const useGamePlayerListState = (skillType: string) => {
  // 数据列表
  const [playerList, setPlayerList] = useState<PlayerCardData[]>([]);
  // 筛选状态
  const [filterState, setFilterState] = useState<FilterState>(DEFAULT_FILTER_STATE);
  // 页面状态
  const [pageState, setPageState] = useState<PageState>(DEFAULT_PAGE_STATE);
  // 弹窗状态
  const [modalState, setModalState] = useState<ModalState>(DEFAULT_MODAL_STATE);

  /**
   * 加载数据
   * @description 调用API获取服务列表，支持首次加载和加载更多
   * @param isLoadMore - 是否加载更多
   */
  const loadData = useCallback(async (isLoadMore = false) => {
    const currentPage = isLoadMore ? pageState.pageNum + 1 : INITIAL_PAGE_NUM;

    // 更新加载状态
    setPageState(prev => ({
      ...prev,
      isLoading: !isLoadMore && !prev.isRefreshing,
      isLoadingMore: isLoadMore,
      error: null,
    }));

    try {
      const response = await bffApi.getServiceList({
        skillType,
        pageNum: currentPage,
        pageSize: PAGE_SIZE,
        sortBy: filterState.sortBy === 'smart' ? 'smart' : filterState.sortBy as any,
        gender: filterState.gender,
      });

      const newItems = response.list.map(transformServiceItemToCardData);

      setPlayerList(prev => isLoadMore ? [...prev, ...newItems] : newItems);
      setPageState(prev => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        isLoadingMore: false,
        pageNum: currentPage,
        hasMore: response.hasMore,
      }));
    } catch (error: any) {
      setPageState(prev => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        isLoadingMore: false,
        error: error.message || '加载失败',
      }));
    }
  }, [skillType, filterState.sortBy, filterState.gender, pageState.pageNum]);

  /**
   * 下拉刷新
   */
  const handleRefresh = useCallback(() => {
    setPageState(prev => ({ ...prev, isRefreshing: true }));
    loadData(false);
  }, [loadData]);

  /**
   * 上拉加载更多
   */
  const handleLoadMore = useCallback(() => {
    if (!pageState.isLoadingMore && pageState.hasMore && !pageState.isLoading) {
      loadData(true);
    }
  }, [loadData, pageState.isLoadingMore, pageState.hasMore, pageState.isLoading]);

  /**
   * 更新排序
   */
  const updateSortBy = useCallback((sortBy: SortType) => {
    setFilterState(prev => ({ ...prev, sortBy }));
    setModalState(prev => ({ ...prev, sortVisible: false }));
  }, []);

  /**
   * 更新性别筛选
   */
  const updateGender = useCallback((gender: GenderType) => {
    setFilterState(prev => ({ ...prev, gender }));
    setModalState(prev => ({ ...prev, genderVisible: false }));
  }, []);

  /**
   * 切换快捷标签
   */
  const toggleQuickTag = useCallback((tagId: string) => {
    setFilterState(prev => ({
      ...prev,
      quickTag: prev.quickTag === tagId ? null : tagId,
    }));
  }, []);

  /**
   * 应用高级筛选
   */
  const applyAdvancedFilters = useCallback((filters: AdvancedFilters) => {
    setFilterState(prev => ({ ...prev, advancedFilters: filters }));
    setModalState(prev => ({ ...prev, filterSheetVisible: false }));
  }, []);

  /**
   * 重置高级筛选
   */
  const resetAdvancedFilters = useCallback(() => {
    setFilterState(prev => ({ ...prev, advancedFilters: DEFAULT_ADVANCED_FILTERS }));
  }, []);

  /**
   * 切换弹窗显示
   */
  const toggleModal = useCallback((key: keyof ModalState, visible?: boolean) => {
    setModalState(prev => ({
      ...prev,
      sortVisible: key === 'sortVisible' ? (visible ?? !prev.sortVisible) : false,
      genderVisible: key === 'genderVisible' ? (visible ?? !prev.genderVisible) : false,
      filterSheetVisible: key === 'filterSheetVisible' ? (visible ?? !prev.filterSheetVisible) : false,
    }));
  }, []);

  // 筛选条件变化时重新加载
  useEffect(() => {
    loadData(false);
  }, [filterState.sortBy, filterState.gender, filterState.quickTag]);

  // 初始化加载
  useEffect(() => {
    loadData(false);
  }, []);

  return {
    playerList,
    filterState,
    pageState,
    modalState,
    handleRefresh,
    handleLoadMore,
    updateSortBy,
    updateGender,
    toggleQuickTag,
    applyAdvancedFilters,
    resetAdvancedFilters,
    toggleModal,
  };
};

// ==================== 六、Logic 业务逻辑 ====================

/**
 * 导航处理Hook
 * @description 处理页面返回和卡片点击跳转到服务详情页
 */
const useNavigation = () => {
  const handleGoBack = useCallback(() => {
    router.back();
  }, []);

  /**
   * 跳转到服务详情页
   * @param serviceId - 服务ID
   * @param serviceType - 服务类型：'online'(游戏陪玩) | 'offline'(线下活动)
   */
  const handleCardPress = useCallback((serviceId: number, serviceType: 'online' | 'offline' = 'online') => {
    router.push({
      pathname: '/service/detail/[serviceId]',
      params: { serviceId: String(serviceId), serviceType },
    });
  }, []);

  return { handleGoBack, handleCardPress };
};

// ==================== 七、Components 组件 ====================

/**
 * 顶部导航区域
 */
const HeaderArea: React.FC<{
  title: string;
  onBack: () => void;
}> = ({ title, onBack }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerPlaceholder} />
    </View>
  );
};

/**
 * 筛选工具栏区域
 */
const FilterBarArea: React.FC<{
  sortBy: SortType;
  gender: GenderType;
  onSortPress: () => void;
  onGenderPress: () => void;
  onFilterPress: () => void;
}> = ({ sortBy, gender, onSortPress, onGenderPress, onFilterPress }) => (
  <View style={styles.filterBarContainer}>
    {/* 排序按钮 */}
    <TouchableOpacity style={styles.filterButton} onPress={onSortPress} activeOpacity={0.7}>
      <Text style={styles.filterButtonText}>{getSortLabel(sortBy)}</Text>
      <Ionicons name="chevron-down" size={14} color={COLORS.textSecondary} />
    </TouchableOpacity>

    {/* 性别按钮 */}
    <TouchableOpacity style={styles.filterButton} onPress={onGenderPress} activeOpacity={0.7}>
      <Text style={styles.filterButtonText}>{getGenderLabel(gender)}</Text>
      <Ionicons name="chevron-down" size={14} color={COLORS.textSecondary} />
    </TouchableOpacity>

    {/* 筛选按钮 */}
    <TouchableOpacity style={styles.filterButton} onPress={onFilterPress} activeOpacity={0.7}>
      <Ionicons name="options-outline" size={16} color={COLORS.textSecondary} />
      <Text style={styles.filterButtonText}>{TEXTS.filter}</Text>
    </TouchableOpacity>
  </View>
);

/**
 * 快捷标签区域
 */
const QuickTagArea: React.FC<{
  tags: QuickTag[];
  selectedTag: string | null;
  onTagPress: (tagId: string) => void;
}> = ({ tags, selectedTag, onTagPress }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={styles.quickTagScrollView}
    contentContainerStyle={styles.quickTagContent}
  >
    {tags.map(tag => {
      const isSelected = selectedTag === tag.id;
      return (
        <TouchableOpacity
          key={tag.id}
          style={[styles.quickTagItem, isSelected && styles.quickTagItemSelected]}
          onPress={() => onTagPress(tag.id)}
          activeOpacity={0.7}
        >
          <Text style={[styles.quickTagText, isSelected && styles.quickTagTextSelected]}>
            {tag.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

/**
 * PlayerCardItemInline - Inline player card component
 * @description Single player card in list view, displays provider/skill/price/stats info
 * @mapping PlayerCardData → UI (aligned with skills + users table structure)
 */
const PlayerCardItemInline: React.FC<{
  data: PlayerCardData;
  onPress: () => void;
}> = ({ data, onPress }) => {
  const hasAvatar = data.provider.avatar && data.provider.avatar.length > 0;

  return (
    <TouchableOpacity style={styles.playerCard} onPress={onPress} activeOpacity={0.9}>
      {/* Left: Avatar section */}
      <View style={styles.cardAvatarSection}>
        <View style={styles.avatarContainer}>
          {hasAvatar ? (
            <Image
              source={{ uri: data.provider.avatar }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>
                {data.provider.nickname.charAt(0)}
              </Text>
            </View>
          )}
          {data.provider.isOnline && <View style={styles.onlineDot} />}
        </View>
      </View>

      {/* Right: Info section */}
      <View style={styles.cardInfoSection}>
        {/* Row 1: Nickname + gender/age + certification badges */}
        <View style={styles.cardTopRow}>
          <Text style={styles.cardNickname} numberOfLines={1}>
            {data.provider.nickname}
          </Text>
          <View style={styles.cardTagsRow}>
            <View style={[
              styles.genderTag,
              { backgroundColor: data.provider.gender === 'female' ? COLORS.female : COLORS.male }
            ]}>
              <Text style={styles.genderTagText}>
                {data.provider.gender === 'female' ? '♀' : '♂'} {data.provider.age}
              </Text>
            </View>
            {data.provider.isVerified && (
              <View style={[styles.certTag, { backgroundColor: COLORS.verified }]}>
                <Text style={styles.certTagText}>✓实名</Text>
              </View>
            )}
            {data.provider.isExpert && (
              <View style={[styles.certTag, { backgroundColor: COLORS.expert }]}>
                <Text style={styles.certTagText}>🏆大神</Text>
              </View>
            )}
          </View>
        </View>

        {/* Row 2: Skill description */}
        <Text style={styles.cardSkillDesc} numberOfLines={1}>
          {data.description}
        </Text>

        {/* Row 3: Game tags (server/rank/peakScore) */}
        <View style={styles.cardGameTags}>
          {data.skillInfo.gameArea && (
            <View style={styles.gameTag}>
              <Text style={styles.gameTagText}>{data.skillInfo.gameArea}</Text>
            </View>
          )}
          {data.skillInfo.rank && (
            <View style={styles.gameTag}>
              <Text style={styles.gameTagText}>{data.skillInfo.rank}</Text>
            </View>
          )}
          {data.skillInfo.peakScore && (
            <View style={styles.gameTag}>
              <Text style={styles.gameTagText}>巅峰{data.skillInfo.peakScore}</Text>
            </View>
          )}
        </View>

        {/* Row 4: Price + stats */}
        <View style={styles.cardBottomRow}>
          <Text style={styles.cardPrice}>{data.price?.displayText || '价格面议'}</Text>
          <View style={styles.cardStats}>
            <Text style={styles.cardStatsText}>
              {data.stats?.orders ?? 0}单 | {(data.stats?.rating ?? 5.0).toFixed(1)}分
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

/**
 * 列表空状态
 */
const EmptyState: React.FC = () => (
  <View style={styles.emptyContainer}>
    <Ionicons name="game-controller-outline" size={48} color={COLORS.textTertiary} />
    <Text style={styles.emptyText}>{TEXTS.noData}</Text>
  </View>
);

/**
 * 列表底部加载组件
 */
const ListFooter: React.FC<{
  isLoadingMore: boolean;
  hasMore: boolean;
}> = ({ isLoadingMore, hasMore }) => {
  if (isLoadingMore) {
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.footerText}>{TEXTS.loading}</Text>
      </View>
    );
  }
  if (!hasMore) {
    return (
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>{TEXTS.noMore}</Text>
      </View>
    );
  }
  return null;
};

/**
 * 排序选择弹窗
 */
const SortDropdown: React.FC<{
  visible: boolean;
  selected: SortType;
  onSelect: (value: SortType) => void;
  onClose: () => void;
}> = ({ visible, selected, onSelect, onClose }) => {
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.dropdownOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.dropdownContainer, { opacity: slideAnim }]}>
              {SORT_OPTIONS.map(option => {
                const isSelected = option.value === selected;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.dropdownItem}
                    onPress={() => onSelect(option.value as SortType)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]}>
                      {option.label}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={20} color={COLORS.secondary} />}
                  </TouchableOpacity>
                );
              })}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

/**
 * 性别选择弹窗
 */
const GenderDropdown: React.FC<{
  visible: boolean;
  selected: GenderType;
  onSelect: (value: GenderType) => void;
  onClose: () => void;
}> = ({ visible, selected, onSelect, onClose }) => {
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.dropdownOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.dropdownContainer, { opacity: slideAnim }]}>
              {GENDER_OPTIONS.map(option => {
                const isSelected = option.value === selected;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.dropdownItem}
                    onPress={() => onSelect(option.value as GenderType)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]}>
                      {option.label}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={20} color={COLORS.secondary} />}
                  </TouchableOpacity>
                );
              })}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

/**
 * 高级筛选底部弹窗
 */
const FilterSheet: React.FC<{
  visible: boolean;
  filters: AdvancedFilters;
  onApply: (filters: AdvancedFilters) => void;
  onReset: () => void;
  onClose: () => void;
}> = ({ visible, filters: initialFilters, onApply, onReset, onClose }) => {
  const [slideAnim] = useState(new Animated.Value(0));
  const [localFilters, setLocalFilters] = useState<AdvancedFilters>(initialFilters);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      setLocalFilters(initialFilters);
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
    outputRange: [600, 0],
  });

  /** 切换数组项 */
  const toggleArrayItem = (array: string[], item: string): string[] =>
    array.includes(item) ? array.filter(i => i !== item) : [...array, item];

  /** 处理单选 */
  const handleSingleSelect = (key: string, value: string | null) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  /** 处理多选 */
  const handleMultipleSelect = (key: string, value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: toggleArrayItem((prev as any)[key] || [], value),
    }));
  };

  /** 处理应用 */
  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  /** 处理重置 */
  const handleReset = () => {
    setLocalFilters(DEFAULT_ADVANCED_FILTERS);
    onReset();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.sheetOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.sheetContainer, { transform: [{ translateY }] }]}>
              <ScrollView style={styles.sheetScrollView} showsVerticalScrollIndicator={false}>
                {FILTER_GROUPS.map(group => (
                  <View key={group.key} style={styles.sheetSection}>
                    <Text style={styles.sheetSectionTitle}>{group.label}</Text>
                    <View style={styles.sheetOptionsRow}>
                      {group.options.map(option => {
                        const currentValue = (localFilters as any)[group.key];
                        const isSelected = group.type === 'single'
                          ? currentValue === option.value
                          : Array.isArray(currentValue) && currentValue.includes(option.value);

                        return (
                          <TouchableOpacity
                            key={option.value}
                            style={[styles.sheetChip, isSelected && styles.sheetChipSelected]}
                            onPress={() => {
                              if (group.type === 'single') {
                                handleSingleSelect(group.key, isSelected ? null : option.value);
                              } else {
                                handleMultipleSelect(group.key, option.value);
                              }
                            }}
                            activeOpacity={0.7}
                          >
                            <Text style={[styles.sheetChipText, isSelected && styles.sheetChipTextSelected]}>
                              {option.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ))}
                <View style={{ height: 80 }} />
              </ScrollView>

              {/* 底部按钮 */}
              <View style={[styles.sheetFooter, { paddingBottom: insets.bottom + 16 }]}>
                <TouchableOpacity style={styles.sheetResetButton} onPress={handleReset} activeOpacity={0.7}>
                  <Text style={styles.sheetResetButtonText}>{TEXTS.reset}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sheetApplyButton} onPress={handleApply} activeOpacity={0.8}>
                  <Text style={styles.sheetApplyButtonText}>{TEXTS.confirm}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// ==================== 八、Exports 导出 ====================

/**
 * GamePlayerListPage 主页面组件
 * @description 王者荣耀陪玩列表页，展示服务列表并支持筛选
 */
const GamePlayerListPage: React.FC<GamePlayerListPageProps> = ({
  skillType = SKILL_TYPE_HONOR_OF_KINGS,
}) => {
  const insets = useSafeAreaInsets();
  const { handleGoBack, handleCardPress } = useNavigation();

  const {
    playerList,
    filterState,
    pageState,
    modalState,
    handleRefresh,
    handleLoadMore,
    updateSortBy,
    updateGender,
    toggleQuickTag,
    applyAdvancedFilters,
    resetAdvancedFilters,
    toggleModal,
  } = useGamePlayerListState(skillType);

  /** Render card item - navigate to service detail page on press */
  const renderItem = useCallback(({ item }: { item: PlayerCardData }) => (
    <PlayerCardItemInline
      data={item}
      onPress={() => handleCardPress(item.skillId, 'online')}
    />
  ), [handleCardPress]);

  /** 渲染列表头部 */
  const renderListHeader = useCallback(() => (
    <>
      <FilterBarArea
        sortBy={filterState.sortBy}
        gender={filterState.gender}
        onSortPress={() => toggleModal('sortVisible', true)}
        onGenderPress={() => toggleModal('genderVisible', true)}
        onFilterPress={() => toggleModal('filterSheetVisible', true)}
      />
      <QuickTagArea
        tags={QUICK_TAGS}
        selectedTag={filterState.quickTag}
        onTagPress={toggleQuickTag}
      />
    </>
  ), [filterState.sortBy, filterState.gender, filterState.quickTag, toggleModal, toggleQuickTag]);

  /** 渲染列表底部 */
  const renderListFooter = useCallback(() => (
    <ListFooter isLoadingMore={pageState.isLoadingMore} hasMore={pageState.hasMore} />
  ), [pageState.isLoadingMore, pageState.hasMore]);

  /** 渲染空状态 */
  const renderEmptyComponent = useCallback(() => (
    pageState.isLoading ? null : <EmptyState />
  ), [pageState.isLoading]);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

      {/* 顶部导航 - 标题使用传入的skillType */}
      <HeaderArea title={skillType} onBack={handleGoBack} />

      {/* 加载中 */}
      {pageState.isLoading && playerList.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{TEXTS.loading}</Text>
        </View>
      ) : (
        /* Content list */
        <FlatList
          data={playerList}
          keyExtractor={item => String(item.skillId)}
          renderItem={renderItem}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={renderListFooter}
          ListEmptyComponent={renderEmptyComponent}
          onRefresh={handleRefresh}
          refreshing={pageState.isRefreshing}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* 排序弹窗 */}
      <SortDropdown
        visible={modalState.sortVisible}
        selected={filterState.sortBy}
        onSelect={updateSortBy}
        onClose={() => toggleModal('sortVisible', false)}
      />

      {/* 性别弹窗 */}
      <GenderDropdown
        visible={modalState.genderVisible}
        selected={filterState.gender}
        onSelect={updateGender}
        onClose={() => toggleModal('genderVisible', false)}
      />

      {/* 高级筛选弹窗 */}
      <FilterSheet
        visible={modalState.filterSheetVisible}
        filters={filterState.advancedFilters}
        onApply={applyAdvancedFilters}
        onReset={resetAdvancedFilters}
        onClose={() => toggleModal('filterSheetVisible', false)}
      />
    </View>
  );
};

// ==================== 九、Styles 样式 ====================

const styles = StyleSheet.create({
  // 容器
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },

  // 顶部导航
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  headerPlaceholder: {
    width: 40,
  },

  // 筛选工具栏
  filterBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // 快捷标签
  quickTagScrollView: {
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  quickTagContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  quickTagItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: 10,
  },
  quickTagItemSelected: {
    backgroundColor: '#F3E8FF',
  },
  quickTagText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  quickTagTextSelected: {
    color: COLORS.secondary,
    fontWeight: '500',
  },

  // 玩家卡片
  playerCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: SIZES.cardBorderRadius,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardAvatarSection: {
    marginRight: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 80,
    height: 100,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 80,
    height: 100,
    borderRadius: 8,
    backgroundColor: COLORS.divider,
  },
  avatarPlaceholderText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.online,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cardInfoSection: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardNickname: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  cardTagsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  genderTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  genderTagText: {
    fontSize: 11,
    color: '#FFFFFF',
  },
  certTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  certTagText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  cardSkillDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  cardGameTags: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  gameTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: COLORS.background,
  },
  gameTagText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardStatsText: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },

  // 加载状态
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // 空状态
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.textTertiary,
  },

  // 列表底部
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textTertiary,
  },

  // 下拉弹窗
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
    paddingTop: 140,
  },
  dropdownContainer: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  dropdownItemText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  dropdownItemTextSelected: {
    color: COLORS.secondary,
    fontWeight: '500',
  },

  // 底部弹窗
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  sheetScrollView: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sheetSection: {
    marginBottom: 20,
  },
  sheetSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  sheetOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  sheetChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginHorizontal: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sheetChipSelected: {
    backgroundColor: '#F3E8FF',
    borderColor: COLORS.secondary,
  },
  sheetChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  sheetChipTextSelected: {
    color: COLORS.secondary,
    fontWeight: '500',
  },
  sheetFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: COLORS.cardBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  sheetResetButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sheetResetButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  sheetApplyButton: {
    flex: 2,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetApplyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default GamePlayerListPage;
