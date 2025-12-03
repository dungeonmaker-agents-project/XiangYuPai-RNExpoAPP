// #region 1. File Banner & TOC
/**
 * ServiceDetailPage - 服务详情页面
 * 
 * 功能描述：通用服务详情页面，支持游戏陪玩和生活服务两大类
 * 
 * TOC (快速跳转):
 * [1] Imports
 * [2] Types & Schema
 * [3] Constants & Config
 * [4] Utils & Helpers
 * [5] State Management
 * [6] Domain Logic
 * [7] UI Components & Rendering
 * [8] Exports
 */
// #endregion

// #region 2. Imports
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    Image,
    Platform,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Zustand状态管理
import { useConfigStore, useUserStore } from '../../../../../stores';

// 共享组件
import { ErrorBoundary, LoadingOverlay } from '../../../../components';

// 使用 SharedComponents 中的共享弹窗组件
import {
  AdvancedFilterSheet,
  GenderBottomSheet,
  SortBottomSheet,
  type AdvancedFilters,
  type GenderOption,
  type SortOption,
} from '../../SharedComponents';

// 类型和常量
import { FUNCTION_ID_TO_SERVICE_TYPE, GAME_SERVICE_TAGS, LIFESTYLE_SERVICE_TAGS, SERVICE_DETAIL_CONSTANTS, SERVICE_DETAIL_ROUTES, SERVICE_THEME_MAP, SERVICE_TYPE_MAP } from './constants';
import type { FilterState, ServiceCategory, ServiceDetailPageProps, ServiceType } from './types';
// #endregion

// #region 3. Types & Schema
interface LocalPageState {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastRefreshTime: number;
}

interface ServiceInfo {
  serviceType: ServiceType;
  serviceName: string;
  serviceCategory: ServiceCategory;
  serviceConfig: any;
}

interface BottomSheetState {
  sortVisible: boolean;
  genderVisible: boolean;
  advancedVisible: boolean;
}
// #endregion

// #region 4. Constants & Config
const { COLORS, SIZES, PAGINATION } = SERVICE_DETAIL_CONSTANTS;
// #endregion

// #region 5. Utils & Helpers
/**
 * 获取服务类别
 */
const getServiceCategory = (serviceType: ServiceType): ServiceCategory => {
  const typeInfo = SERVICE_TYPE_MAP[serviceType];
  if (!typeInfo) {
    console.warn(`[ServiceDetailPage] 未找到服务类型: ${serviceType}，使用默认类型 'game'`);
    return 'game';
  }
  return typeInfo.category;
};

/**
 * 获取服务配置
 */
const getServiceInfo = (serviceType: ServiceType): ServiceInfo => {
  const typeInfo = SERVICE_TYPE_MAP[serviceType];
  const themeInfo = SERVICE_THEME_MAP[serviceType];
  
  if (!typeInfo) {
    console.warn(`[ServiceDetailPage] 未找到服务类型配置: ${serviceType}`);
    // 返回默认配置
    return {
      serviceType,
      serviceName: '未知服务',
      serviceCategory: 'game',
      serviceConfig: {
        theme: themeInfo || { primaryColor: '#6366F1', gradient: ['#6366F1', '#818CF8'] },
        tags: [],
      },
    };
  }
  
  return {
    serviceType,
    serviceName: typeInfo.name,
    serviceCategory: typeInfo.category,
    serviceConfig: {
      theme: themeInfo || { primaryColor: '#6366F1', gradient: ['#6366F1', '#818CF8'] },
      tags: typeInfo.category === 'game' 
        ? GAME_SERVICE_TAGS[serviceType as keyof typeof GAME_SERVICE_TAGS] || []
        : LIFESTYLE_SERVICE_TAGS[serviceType as keyof typeof LIFESTYLE_SERVICE_TAGS] || [],
    },
  };
};

/**
 * 格式化价格显示
 */
const formatPrice = (price: number): string => {
  return `¥${price}`;
};

/**
 * 格式化距离显示
 */
const formatDistance = (distance: number): string => {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  }
  return `${(distance / 1000).toFixed(1)}km`;
};

/**
 * 格式化评分显示
 */
const formatRating = (rating: number, count: number): string => {
  return `${rating.toFixed(1)} (${count > 999 ? `${(count / 1000).toFixed(1)}k` : count})`;
};
// #endregion

// #region 6. State Management
/**
 * 服务详情页面状态管理Hook
 */
const useServiceDetailState = (serviceType: ServiceType) => {
  // Zustand stores
  const { userList, loadUserList } = useUserStore();
  const { componentConfigs, loadComponentConfig } = useConfigStore();
  
  // 本地状态
  const [localState, setLocalState] = useState<LocalPageState>({
    loading: false,
    refreshing: false,
    error: null,
    lastRefreshTime: 0,
  });
  
  // 筛选状态
  const [filterState, setFilterState] = useState<FilterState>({
    sortBy: 'smart',
    gender: 'all',
    selectedTags: [],
    advancedFilters: {
      priceRange: [0, 1000],
      distanceRange: 10,
      ratingMin: 0,
      onlineOnly: false,
      features: [],
    },
  });
  
  // 服务信息
  const serviceInfo = useMemo(() => getServiceInfo(serviceType), [serviceType]);
  
  // 过滤和排序后的服务提供者
  const filteredProviders = useMemo(() => {
    let providers = userList.data;
    
    // 性别筛选
    if (filterState.gender !== 'all') {
      providers = providers.filter(p => p.gender === filterState.gender);
    }
    
    // 在线状态筛选
    if (filterState.advancedFilters.onlineOnly) {
      providers = providers.filter(p => p.isOnline);
    }
    
    // 评分筛选
    if (filterState.advancedFilters.ratingMin > 0) {
      providers = providers.filter(p => p.rating >= filterState.advancedFilters.ratingMin);
    }
    
    // 价格筛选
    const [minPrice, maxPrice] = filterState.advancedFilters.priceRange;
    providers = providers.filter(p => p.price >= minPrice && p.price <= maxPrice);
    
    // 排序
    switch (filterState.sortBy) {
      case 'price':
        providers = [...providers].sort((a, b) => a.price - b.price);
        break;
      case 'rating':
        providers = [...providers].sort((a, b) => b.rating - a.rating);
        break;
      case 'distance':
        providers = [...providers].sort((a, b) => 
          (a.location.distance || 0) - (b.location.distance || 0)
        );
        break;
      default: // smart
        break;
    }
    
    return providers;
  }, [userList.data, filterState]);
  
  return {
    // 状态
    localState,
    setLocalState,
    filterState,
    setFilterState,
    serviceInfo,
    userList,
    filteredProviders,
    componentConfigs,
    
    // 操作方法
    loadUserList,
    loadComponentConfig,
  };
};
// #endregion

// #region 7. Domain Logic
/**
 * 服务详情页面业务逻辑Hook
 */
const useServiceDetailLogic = (serviceType: ServiceType) => {
  const router = useRouter();
  const {
    localState,
    setLocalState,
    filterState,
    setFilterState,
    serviceInfo,
    filteredProviders,
    loadUserList,
    loadComponentConfig,
  } = useServiceDetailState(serviceType);
  
  // 弹窗状态
  const [bottomSheetState, setBottomSheetState] = useState<BottomSheetState>({
    sortVisible: false,
    genderVisible: false,
    advancedVisible: false,
  });
  
  /**
   * 初始化页面数据
   */
  const initializePageData = useCallback(async () => {
    try {
      setLocalState(prev => ({ ...prev, loading: true, error: null }));
      
      await Promise.all([
        loadComponentConfig('service-detail-page'),
        loadUserList({ 
          page: 1, 
          limit: PAGINATION.PAGE_SIZE,
          filters: {
            serviceType: serviceType,
          }
        }),
      ]);
      
      setLocalState(prev => ({ 
        ...prev, 
        loading: false,
        lastRefreshTime: Date.now()
      }));
      
    } catch (error) {
      setLocalState(prev => ({ 
        ...prev, 
        loading: false,
        error: error instanceof Error ? error.message : '加载失败'
      }));
    }
  }, [serviceType, loadComponentConfig, loadUserList]);
  
  /**
   * 下拉刷新
   */
  const handleRefresh = useCallback(async () => {
    setLocalState(prev => ({ ...prev, refreshing: true }));
    try {
      await initializePageData();
    } finally {
      setLocalState(prev => ({ ...prev, refreshing: false }));
    }
  }, [initializePageData]);
  
  /**
   * 筛选变更
   */
  const handleFilterChange = useCallback((key: keyof FilterState, value: any) => {
    setFilterState(prev => ({ ...prev, [key]: value }));
  }, []);
  
  /**
   * 点击服务提供者 - 跳转到详情页
   */
  const handleProviderPress = useCallback((provider: any) => {
    // 获取用户的第一个技能作为默认技能
    const skillId = provider.skills?.[0]?.id || `skill_${provider.id}_${serviceType}`;
    
    router.push({
      pathname: `${SERVICE_DETAIL_ROUTES.SKILL_DETAIL}/${skillId}` as any,
      params: { 
        skillId: skillId,
        userId: provider.id,
        serviceType: serviceType
      }
    });
  }, [router, serviceType]);
  
  /**
   * 点击筛选
   */
  const handleFilterPress = useCallback(() => {
    const filterRoute = serviceInfo.serviceCategory === 'game' 
      ? SERVICE_DETAIL_ROUTES.FILTER_ONLINE 
      : SERVICE_DETAIL_ROUTES.FILTER_OFFLINE;
    
    router.push(filterRoute as any);
  }, [router, serviceInfo.serviceCategory]);
  
  /**
   * 返回
   */
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);
  
  /**
   * 打开排序弹窗
   */
  const handleSortPress = useCallback(() => {
    setBottomSheetState(prev => ({ ...prev, sortVisible: true }));
  }, []);
  
  /**
   * 打开性别弹窗
   */
  const handleGenderPress = useCallback(() => {
    setBottomSheetState(prev => ({ ...prev, genderVisible: true }));
  }, []);
  
  /**
   * 打开高级筛选弹窗
   */
  const handleAdvancedFilterPress = useCallback(() => {
    setBottomSheetState(prev => ({ ...prev, advancedVisible: true }));
  }, []);
  
  /**
   * 关闭弹窗
   */
  const closeBottomSheets = useCallback(() => {
    setBottomSheetState({
      sortVisible: false,
      genderVisible: false,
      advancedVisible: false,
    });
  }, []);
  
  /**
   * 选择排序方式
   */
  const handleSortSelect = useCallback((sort: SortOption) => {
    // 映射 SortOption 到 FilterState 的 sortBy
    const sortMap: Record<SortOption, FilterState['sortBy']> = {
      smart: 'smart',
      latest: 'smart', // 暂时映射到 smart
      nearest: 'distance',
      popular: 'rating',
    };
    setFilterState(prev => ({ ...prev, sortBy: sortMap[sort] }));
  }, []);
  
  /**
   * 选择性别
   */
  const handleGenderSelect = useCallback((gender: GenderOption) => {
    setFilterState(prev => ({ ...prev, gender }));
  }, []);
  
  /**
   * 应用高级筛选
   */
  const handleAdvancedFilterApply = useCallback((filters: AdvancedFilters) => {
    // 将高级筛选转换为 FilterState
    setFilterState(prev => ({
      ...prev,
      advancedFilters: {
        ...prev.advancedFilters,
        onlineOnly: filters.status === 'online',
        features: [...filters.area, ...filters.tags, ...filters.location],
      },
    }));
  }, []);
  
  /**
   * 重置高级筛选
   */
  const handleAdvancedFilterReset = useCallback(() => {
    setFilterState(prev => ({
      ...prev,
      advancedFilters: {
        priceRange: [0, 1000],
        distanceRange: 10,
        ratingMin: 0,
        onlineOnly: false,
        features: [],
      },
    }));
  }, []);
  
  return {
    // 状态
    localState,
    serviceInfo,
    filterState,
    filteredProviders,
    bottomSheetState,
    
    // 方法
    initializePageData,
    handleRefresh,
    handleFilterChange,
    handleProviderPress,
    handleFilterPress,
    handleBack,
    handleSortPress,
    handleGenderPress,
    handleAdvancedFilterPress,
    closeBottomSheets,
    handleSortSelect,
    handleGenderSelect,
    handleAdvancedFilterApply,
    handleAdvancedFilterReset,
  };
};
// #endregion

// #region 8. UI Components & Rendering
/**
 * 导航区域组件
 */
const ServiceNavigationArea: React.FC<{
  serviceName: string;
  isLimitedOffer?: boolean;
  onBack: () => void;
  onSearch?: () => void;
}> = ({ serviceName, isLimitedOffer, onBack, onSearch }) => (
  <LinearGradient
    colors={['#FFFFFF', '#F8F9FF']}
    style={styles.navigationArea}
  >
    <TouchableOpacity style={styles.backButton} onPress={onBack}>
      <Ionicons name="chevron-back" size={24} color="#333" />
    </TouchableOpacity>
    <View style={styles.navigationTitleContainer}>
      <Text style={styles.navigationTitle}>{serviceName}</Text>
      {isLimitedOffer && (
        <LinearGradient
          colors={['#FF6B6B', '#FF4757']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.navigationLimitedBadge}
        >
          <Ionicons name="flash" size={10} color="#FFF" style={{ marginRight: 2 }} />
          <Text style={styles.navigationLimitedText}>限时优惠</Text>
        </LinearGradient>
      )}
    </View>
    {onSearch && (
      <TouchableOpacity style={styles.searchButton} onPress={onSearch}>
        <Ionicons name="search" size={20} color="#666" />
      </TouchableOpacity>
    )}
  </LinearGradient>
);

/**
 * 筛选工具栏组件
 */
const ServiceFilterToolbar: React.FC<{
  filterState: FilterState;
  onSortPress: () => void;
  onGenderPress: () => void;
  onAdvancedFilter: () => void;
}> = ({ filterState, onSortPress, onGenderPress, onAdvancedFilter }) => {
  // 获取排序显示文本
  const getSortLabel = () => {
    switch (filterState.sortBy) {
      case 'smart': return '智能排序';
      case 'price': return '价格最低';
      case 'rating': return '人气排序';
      case 'distance': return '最近排序';
      default: return '智能排序';
    }
  };
  
  // 获取性别显示文本
  const getGenderLabel = () => {
    switch (filterState.gender) {
      case 'all': return '不限性别';
      case 'female': return '只看女生';
      case 'male': return '只看男生';
      default: return '不限性别';
    }
  };
  
  return (
    <View style={styles.filterToolbar}>
      <TouchableOpacity
        style={[styles.filterButton, filterState.sortBy !== 'smart' && styles.filterButtonActive]}
        onPress={onSortPress}
      >
        <Ionicons 
          name={filterState.sortBy === 'smart' ? 'sparkles-outline' : 'sparkles'} 
          size={14} 
          color={filterState.sortBy !== 'smart' ? '#7C3AED' : '#666'} 
          style={{ marginRight: 4 }}
        />
        <Text style={[
          styles.filterButtonText,
          filterState.sortBy !== 'smart' && styles.filterButtonTextActive
        ]}>{getSortLabel()}</Text>
        <Ionicons name="chevron-down" size={12} color={filterState.sortBy !== 'smart' ? '#7C3AED' : '#666'} style={{ marginLeft: 2 }} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterButton, filterState.gender !== 'all' && styles.filterButtonActive]}
        onPress={onGenderPress}
      >
        <Ionicons 
          name={filterState.gender === 'female' ? 'female' : filterState.gender === 'male' ? 'male' : 'people-outline'} 
          size={14} 
          color={filterState.gender !== 'all' ? '#7C3AED' : '#666'} 
          style={{ marginRight: 4 }}
        />
        <Text style={[
          styles.filterButtonText,
          filterState.gender !== 'all' && styles.filterButtonTextActive
        ]}>{getGenderLabel()}</Text>
        <Ionicons name="chevron-down" size={12} color={filterState.gender !== 'all' ? '#7C3AED' : '#666'} style={{ marginLeft: 2 }} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.filterButton}
        onPress={onAdvancedFilter}
      >
        <Ionicons name="options-outline" size={14} color="#666" style={{ marginRight: 4 }} />
        <Text style={styles.filterButtonText}>筛选</Text>
        <Ionicons name="chevron-down" size={12} color="#666" style={{ marginLeft: 2 }} />
      </TouchableOpacity>
    </View>
  );
};

/**
 * 服务标签栏组件
 */
const ServiceTagsBar: React.FC<{
  tags: Array<{ id: string; name: string }>;
  selectedTags: string[];
  onTagPress: (tagId: string) => void;
}> = ({ tags, selectedTags, onTagPress }) => (
  <View style={styles.tagsBar}>
    {tags.map((tag) => {
      const isSelected = selectedTags.includes(tag.id);
      return (
        <TouchableOpacity
          key={tag.id}
          style={[styles.tagButton, isSelected && styles.tagButtonActive]}
          onPress={() => onTagPress(tag.id)}
        >
          <Text style={[styles.tagButtonText, isSelected && styles.tagButtonTextActive]}>
            {tag.name}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

/**
 * 服务提供者卡片组件
 */
const ProviderCard: React.FC<{
  provider: any;
  serviceCategory: ServiceCategory;
  isLimitedOffer?: boolean;
  onPress: () => void;
}> = ({ provider, serviceCategory, isLimitedOffer, onPress }) => {
  // 计算限时优惠价格（8折）
  const originalPrice = provider.price || 10;
  const discountedPrice = isLimitedOffer ? Math.floor(originalPrice * 0.8) : originalPrice;
  
  return (
  <TouchableOpacity style={styles.providerCard} onPress={onPress} activeOpacity={0.9}>
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={['#FFFFFF', '#FAFBFF']}
        style={styles.cardGradient}
      >
        <View style={styles.cardContent}>
          {/* 左侧：头像区域 */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <LinearGradient
                colors={['#E0E7FF', '#C7D2FE']}
                style={styles.avatar}
              >
                <Image 
                  source={{ uri: provider.avatar || 'https://picsum.photos/60' }} 
                  style={styles.avatarImage}
                />
              </LinearGradient>
              {provider.isOnline && (
                <View style={styles.statusDotWrapper}>
                  <View style={styles.statusDot} />
                </View>
              )}
            </View>
            {/* HOT标签 */}
            {provider.isHot && (
              <LinearGradient
                colors={['#FF6B6B', '#FF4757']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.hotBadge}
              >
                <Ionicons name="flame" size={10} color="#FFF" />
                <Text style={styles.hotBadgeText}>HOT</Text>
              </LinearGradient>
            )}
          </View>
        
        {/* 中间：用户信息区域 */}
        <View style={styles.userInfoSection}>
          {/* 用户名和性别标签 */}
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{provider.name}</Text>
            {provider.gender === 'female' && (
              <LinearGradient
                colors={['#FFE4E8', '#FFD4DC']}
                style={styles.genderBadge}
              >
                <Ionicons name="female" size={10} color="#FF4D6D" />
                <Text style={styles.genderBadgeText}>女神</Text>
              </LinearGradient>
            )}
            <View style={styles.distanceContainer}>
              <Ionicons name="location" size={10} color="#999" />
              <Text style={styles.distance}>{formatDistance(provider.location.distance || 0)}</Text>
            </View>
          </View>
          
          {/* 标签区域 */}
          <View style={styles.tagsSection}>
            {provider.tags.slice(0, 3).map((tag: string, index: number) => (
              <LinearGradient
                key={index}
                colors={
                  index === 0 ? ['#E6F7FF', '#D6EFFF'] :
                  index === 1 ? ['#FFF7E6', '#FFEFD6'] :
                  ['#F6FFED', '#E8FFD6']
                }
                style={styles.tag}
              >
                <Text style={styles.tagText}>{tag}</Text>
              </LinearGradient>
            ))}
            {provider.rating && (
              <View style={styles.ratingTag}>
                <Ionicons name="star" size={10} color="#FA8C16" />
                <Text style={styles.ratingText}>{provider.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
          
          {/* 描述区域 */}
          <Text style={styles.description} numberOfLines={2}>
            {provider.description || '主打鲜耗位置和能技术不成熟性这里是真的介绍区域这里是真的介绍区域'}
          </Text>
          
          {/* 底部信息：位置和服务信息 */}
          <View style={styles.bottomInfo}>
            <Ionicons name="location-outline" size={11} color="#999" />
            <Text style={styles.locationText}>
              {provider.location.city || '深圳'} · 荣耀王者 · 创建1-800+
            </Text>
          </View>
        </View>
        
        {/* 右侧：价格区域 */}
        <View style={styles.priceSection}>
          {isLimitedOffer && (
            <LinearGradient
              colors={['#FF6B6B', '#FF4757']}
              style={styles.limitedOfferBadge}
            >
              <Ionicons name="flash" size={10} color="#FFF" />
            </LinearGradient>
          )}
          <LinearGradient
            colors={['#FFF5F5', '#FFE8E8']}
            style={styles.priceContainer}
          >
            <Text style={styles.price}>{discountedPrice}</Text>
            {isLimitedOffer && (
              <Text style={styles.originalPrice}>{originalPrice}</Text>
            )}
            <Text style={styles.priceUnit}>金币/局</Text>
          </LinearGradient>
        </View>
        </View>
      </LinearGradient>
    </View>
  </TouchableOpacity>
  );
};

/**
 * ServiceDetailPage 主组件
 */
const ServiceDetailPage: React.FC<ServiceDetailPageProps> = (props) => {
  // 从路由参数获取服务类型（如果是路由调用）
  const params = useLocalSearchParams<{ 
    serviceType: string; 
    isLimitedOffer?: string;
    userId?: string;
  }>();
  const rawServiceType = props.serviceType || params.serviceType || 'honor_of_kings';
  
  // 转换功能ID到服务类型（如果传入的是功能ID如'1', '2'等）
  const serviceType = (FUNCTION_ID_TO_SERVICE_TYPE[rawServiceType] || rawServiceType) as ServiceType;
  
  // 检查是否为限时优惠
  const isLimitedOffer = props.isLimitedOffer || params.isLimitedOffer === 'true';
  const targetUserId = props.userId || params.userId;
  
  const {
    localState,
    serviceInfo,
    filterState,
    filteredProviders,
    bottomSheetState,
    initializePageData,
    handleRefresh,
    handleFilterChange,
    handleProviderPress,
    handleFilterPress,
    handleBack,
    handleSortPress,
    handleGenderPress,
    handleAdvancedFilterPress,
    closeBottomSheets,
    handleSortSelect,
    handleGenderSelect,
    handleAdvancedFilterApply,
    handleAdvancedFilterReset,
  } = useServiceDetailLogic(serviceType);
  
  // 页面初始化
  useEffect(() => {
    initializePageData();
  }, [initializePageData]);
  
  // 加载状态
  if (localState.loading && filteredProviders.length === 0) {
    return (
      <LoadingOverlay
        loading={localState.loading}
        text="加载服务信息..."
      />
    );
  }
  
  // 错误状态
  if (localState.error && filteredProviders.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{localState.error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={initializePageData}>
          <Text style={styles.retryButtonText}>重试</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // 处理标签点击
  const handleTagPress = useCallback((tagId: string) => {
    setFilterState(prev => {
      const selectedTags = prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(id => id !== tagId)
        : [...prev.selectedTags, tagId];
      return { ...prev, selectedTags };
    });
  }, []);
  
  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.BACKGROUND} />
        {/* 导航区域 */}
        <ServiceNavigationArea
          serviceName={serviceInfo.serviceName}
          isLimitedOffer={isLimitedOffer}
          onBack={handleBack}
        />
        
        {/* 筛选工具栏 */}
        <ServiceFilterToolbar
          filterState={filterState}
          onSortPress={handleSortPress}
          onGenderPress={handleGenderPress}
          onAdvancedFilter={handleAdvancedFilterPress}
        />
        
        {/* 服务标签栏 */}
        {serviceInfo.serviceConfig.tags && serviceInfo.serviceConfig.tags.length > 0 && (
          <ServiceTagsBar
            tags={serviceInfo.serviceConfig.tags}
            selectedTags={filterState.selectedTags}
            onTagPress={handleTagPress}
          />
        )}
        
        {/* 服务提供者列表 */}
        <FlatList
          data={filteredProviders}
          renderItem={({ item }) => (
            <ProviderCard
              provider={item}
              serviceCategory={serviceInfo.serviceCategory}
              isLimitedOffer={isLimitedOffer}
              onPress={() => handleProviderPress(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={localState.refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.PRIMARY}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>暂无服务提供者</Text>
              <Text style={styles.emptySubtitle}>试试调整筛选条件</Text>
            </View>
          }
          removeClippedSubviews={Platform.OS === 'android'}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
        
        {/* 排序弹窗 */}
        <SortBottomSheet
          visible={bottomSheetState.sortVisible}
          selectedSort={
            filterState.sortBy === 'smart' ? 'smart' :
            filterState.sortBy === 'distance' ? 'nearest' :
            filterState.sortBy === 'rating' ? 'popular' : 'smart'
          }
          onSelect={handleSortSelect}
          onClose={closeBottomSheets}
        />
        
        {/* 性别筛选弹窗 */}
        <GenderBottomSheet
          visible={bottomSheetState.genderVisible}
          selectedGender={filterState.gender}
          onSelect={handleGenderSelect}
          onClose={closeBottomSheets}
        />
        
        {/* 高级筛选弹窗 */}
        <AdvancedFilterSheet
          visible={bottomSheetState.advancedVisible}
          filters={{
            status: filterState.advancedFilters.onlineOnly ? 'online' : 'all',
            area: [],
            rank: [],
            priceRange: [],
            position: [],
            tags: filterState.selectedTags,
            location: [],
          }}
          onApply={handleAdvancedFilterApply}
          onReset={handleAdvancedFilterReset}
          onClose={closeBottomSheets}
        />
      </SafeAreaView>
    </ErrorBoundary>
  );
};
// #endregion

// #region 9. Exports & Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  
  // 导航区域样式
  navigationArea: {
    height: SIZES.NAVIGATION_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.TEXT,
  },
  navigationTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  navigationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  navigationLimitedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#FF4757',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  navigationLimitedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  searchButtonText: {
    fontSize: 20,
  },
  
  // 筛选工具栏样式
  filterToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: SIZES.FILTER_BAR_HEIGHT,
    paddingHorizontal: 16,
    backgroundColor: COLORS.BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButtonActive: {
    backgroundColor: '#F0E6FF',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#7C3AED',
    fontWeight: '600',
  },
  
  // 服务标签栏样式
  tagsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  tagButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: COLORS.BACKGROUND,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  tagButtonActive: {
    backgroundColor: '#F0E6FF',
    borderColor: '#7C3AED',
  },
  tagButtonText: {
    fontSize: 12,
    color: COLORS.TEXT,
    fontWeight: '400',
  },
  tagButtonTextActive: {
    color: '#7C3AED',
    fontWeight: '500',
  },
  
  // 列表样式
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  
  // 提供者卡片样式
  providerCard: {
    marginBottom: SIZES.CARD_SPACING,
    marginTop: 4,
  },
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    backgroundColor: '#FFF',
  },
  cardGradient: {
    padding: 14,
  },
  cardContent: {
    flexDirection: 'row',
  },
  
  // 头像样式
  avatarSection: {
    marginRight: 12,
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    width: 64,
    height: 64,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  avatarPlaceholder: {
    fontSize: 28,
  },
  statusDotWrapper: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#52C41A',
  },
  hotBadge: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    shadowColor: '#FF4757',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  hotBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 2,
  },
  
  // 用户信息样式
  userInfoSection: {
    flex: 1,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginRight: 6,
  },
  genderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 6,
  },
  genderBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FF4D6D',
    marginLeft: 2,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  distance: {
    fontSize: 11,
    color: '#999',
    marginLeft: 2,
  },
  
  // 价格样式
  priceSection: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    position: 'relative',
  },
  limitedOfferBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    shadowColor: '#FF4757',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  limitedOfferText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  priceContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FF4D4F',
  },
  originalPrice: {
    fontSize: 12,
    fontWeight: '400',
    color: '#999',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  priceUnit: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  
  // 标签样式
  tagsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
    alignItems: 'center',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 4,
    marginBottom: 3,
  },
  tagPrimary: {
    backgroundColor: '#E6F7FF',
  },
  tagSecondary: {
    backgroundColor: '#FFF7E6',
  },
  tagTertiary: {
    backgroundColor: '#F6FFED',
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#333',
  },
  ratingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7E6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FA8C16',
    marginLeft: 2,
  },
  
  // 描述样式
  description: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 17,
    marginBottom: 6,
  },
  
  // 底部信息样式
  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 11,
    color: '#999',
    marginLeft: 2,
  },
  
  // 空状态样式
  emptyState: {
    paddingTop: 120,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 72,
    marginBottom: 20,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  
  // 错误状态样式
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: '#7C3AED',
    borderRadius: 24,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ServiceDetailPage;
export type { ServiceDetailPageProps };
// #endregion
