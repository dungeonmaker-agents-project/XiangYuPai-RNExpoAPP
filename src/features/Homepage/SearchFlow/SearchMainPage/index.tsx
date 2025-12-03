// #region 1. File Banner & TOC
/**
 * SearchMainPage - 搜索主页面
 * 
 * 功能描述：智能搜索功能，支持历史记录、建议提示、实时搜索
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
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Keyboard,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Zustand状态管理
import { useUserStore } from '../../../../../stores';

// 共享组件
import { ErrorBoundary, LoadingOverlay } from '../../../../components';

// 搜索结果页面
import SearchResultsPage from '../SearchResultsPage';

// API服务
import { searchApiService } from '../api';
import type { HotKeyword, SearchHistoryItem as ApiSearchHistoryItem, SearchSuggestion as ApiSearchSuggestion } from '../api';

// 类型和常量
import type { HotSearchItem, SearchCategory, SearchHistoryItem, SearchMainPageProps, SearchResults, SearchSuggestion, SearchViewState } from './types';
// #endregion

// #region 3. Types & Schema
interface LocalSearchState {
  query: string;
  viewState: SearchViewState;
  activeCategory: SearchCategory;
  loading: boolean;
  error: string | null;
}
// #endregion

// #region 4. Constants & Config
const COLORS = {
  BACKGROUND: '#F8F9FE',
  PRIMARY: '#6366F1',
  PRIMARY_LIGHT: '#818CF8',
  PRIMARY_DARK: '#4F46E5',
  SECONDARY: '#EC4899',
  TEXT: '#1F2937',
  TEXT_SECONDARY: '#6B7280',
  TEXT_LIGHT: '#9CA3AF',
  BORDER: '#E5E7EB',
  SURFACE: '#FFFFFF',
  CARD_BG: '#FFFFFF',
  GRADIENT_START: '#6366F1',
  GRADIENT_END: '#8B5CF6',
  SHADOW: 'rgba(99, 102, 241, 0.1)',
  HOT_TAG: '#FF6B6B',
  TREND_UP: '#FF6B6B',
  WHITE: '#FFFFFF',
};

const DEBOUNCE_DELAY = 300;
const MAX_HISTORY_ITEMS = 10;
// #endregion

// #region 5. Utils & Helpers
/**
 * 防抖函数
 */
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
};
// #endregion

// #region 6. State Management
/**
 * 搜索页面状态管理Hook
 */
const useSearchState = (initialQuery?: string) => {
  const [localState, setLocalState] = useState<LocalSearchState>({
    query: initialQuery || '',
    viewState: 'empty',
    activeCategory: 'all',
    loading: false,
    error: null,
  });
  
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [hotSearches, setHotSearches] = useState<HotSearchItem[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [placeholder, setPlaceholder] = useState<string>('搜索更多');
  
  const debouncedQuery = useDebounce(localState.query, DEBOUNCE_DELAY);
  
  // 初始化搜索数据
  useEffect(() => {
    const initSearch = async () => {
      try {
        const data = await searchApiService.getSearchInit();
        
        // 转换历史记录格式
        const formattedHistory: SearchHistoryItem[] = data.searchHistory.map((item, index) => ({
          id: `history-${index}`,
          query: item.keyword,
          timestamp: new Date(item.searchTime).getTime(),
          resultCount: 0,
          category: 'all' as SearchCategory,
        }));
        
        // 转换热门搜索格式
        const formattedHotSearches: HotSearchItem[] = data.hotKeywords.map((item, index) => ({
          id: `hot-${index}`,
          query: item.keyword,
          rank: item.rank || index + 1,
          trend: item.isHot ? 'up' : 'stable',
          category: 'general',
        }));
        
        setSearchHistory(formattedHistory);
        setHotSearches(formattedHotSearches);
        setPlaceholder(data.placeholder);
      } catch (error) {
        console.error('Failed to initialize search:', error);
        // 使用默认数据
        setHotSearches([
          { id: '1', query: '王者荣耀', rank: 1, trend: 'up', category: 'game' },
          { id: '2', query: '英雄联盟', rank: 2, trend: 'stable', category: 'game' },
          { id: '3', query: '探店', rank: 3, trend: 'up', category: 'lifestyle' },
          { id: '4', query: 'K歌', rank: 4, trend: 'down', category: 'lifestyle' },
        ]);
      }
    };
    
    initSearch();
  }, []);
  
  // 获取搜索建议
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery || debouncedQuery.length === 0) {
        setSuggestions([]);
        return;
      }
      
      try {
        const data = await searchApiService.getSearchSuggest(debouncedQuery, 10);
        
        // 转换建议格式
        const formattedSuggestions: SearchSuggestion[] = data.suggestions.map((item, index) => ({
          id: `suggestion-${index}`,
          text: item.text,
          highlightText: item.highlight || item.text,
          category: item.type === 'user' ? 'user' : item.type === 'topic' ? 'service' : 'keyword',
          icon: item.icon || '🔍',
          resultCount: 0,
          priority: index,
        }));
        
        setSuggestions(formattedSuggestions);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        setSuggestions([]);
      }
    };
    
    fetchSuggestions();
  }, [debouncedQuery]);
  
  return {
    localState,
    setLocalState,
    searchHistory,
    setSearchHistory,
    hotSearches,
    suggestions,
    setSuggestions,
    debouncedQuery,
    placeholder,
  };
};
// #endregion

// #region 7. Domain Logic
/**
 * 搜索业务逻辑Hook
 */
const useSearchLogic = (initialQuery?: string) => {
  const router = useRouter();
  const state = useSearchState(initialQuery);
  
  /**
   * 执行搜索
   */
  const executeSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    Keyboard.dismiss();
    state.setLocalState(prev => ({ ...prev, loading: true, viewState: 'loading' }));
    
    try {
      // 调用搜索API
      await searchApiService.executeSearch({
        keyword: query,
        type: 'all',
        pageNum: 1,
        pageSize: 20,
      });
      
      state.setLocalState(prev => ({ ...prev, loading: false, viewState: 'results' }));
    } catch (error) {
      state.setLocalState(prev => ({
        ...prev,
        loading: false,
        viewState: 'error',
        error: error instanceof Error ? error.message : '搜索失败'
      }));
    }
  }, [state]);
  
  /**
   * 搜索输入变化
   */
  const handleQueryChange = useCallback((text: string) => {
    state.setLocalState(prev => ({
      ...prev,
      query: text,
      viewState: text ? 'suggestions' : 'empty'
    }));
  }, [state]);
  
  /**
   * 选择搜索建议
   */
  const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
    state.setLocalState(prev => ({ ...prev, query: suggestion.text }));
    executeSearch(suggestion.text);
  }, [state, executeSearch]);
  
  /**
   * 选择历史记录
   */
  const handleHistorySelect = useCallback((query: string) => {
    state.setLocalState(prev => ({ ...prev, query }));
    executeSearch(query);
  }, [state, executeSearch]);
  
  /**
   * 删除历史记录
   */
  const handleHistoryDelete = useCallback(async (id: string) => {
    const item = state.searchHistory.find(h => h.id === id);
    if (!item) return;
    
    try {
      await searchApiService.deleteSearchHistory({ keyword: item.query });
      state.setSearchHistory(prev => prev.filter(h => h.id !== id));
    } catch (error) {
      console.error('Failed to delete history:', error);
    }
  }, [state]);
  
  /**
   * 清空所有历史
   */
  const handleClearHistory = useCallback(async () => {
    try {
      await searchApiService.deleteSearchHistory({ clearAll: true });
      state.setSearchHistory([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }, [state]);
  
  /**
   * 返回
   */
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);
  
  /**
   * 点击搜索结果
   */
  const handleResultPress = useCallback((resultId: string, resultType: string) => {
    if (resultType === 'user') {
      // 跳转到他人详情页
      router.push({ pathname: '/profile/[userId]' as any, params: { userId: resultId } });
    } else if (resultType === 'order' || resultType === 'service') {
      // 跳转到技能详情页（服务详情）
      router.push({ pathname: '/skill/[skillId]' as any, params: { skillId: resultId } });
    } else if (resultType === 'topic') {
      // 跳转到话题详情页
      router.push({ pathname: '/topic/[topicId]' as any, params: { topicId: resultId } });
    }
  }, [router]);
  
  return {
    ...state,
    executeSearch,
    handleQueryChange,
    handleSuggestionSelect,
    handleHistorySelect,
    handleHistoryDelete,
    handleClearHistory,
    handleBack,
    handleResultPress,
  };
};
// #endregion

// #region 8. UI Components & Rendering
/**
 * 搜索导航区域
 */
const SearchNavigationArea: React.FC<{
  query: string;
  onQueryChange: (text: string) => void;
  onSearchSubmit: () => void;
  onBack: () => void;
  placeholder?: string;
}> = ({ query, onQueryChange, onSearchSubmit, onBack, placeholder }) => (
  <View style={styles.navigationArea}>
    <TouchableOpacity style={styles.backButton} onPress={onBack}>
      <Text style={styles.backButtonText}>←</Text>
    </TouchableOpacity>
    
    <View style={styles.searchInputContainer}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={styles.searchInput}
        value={query}
        onChangeText={onQueryChange}
        onSubmitEditing={onSearchSubmit}
        placeholder={placeholder || "搜索用户、服务或内容"}
        placeholderTextColor={COLORS.TEXT_LIGHT}
        autoFocus
        returnKeyType="search"
      />
      {query.length > 0 && (
        <TouchableOpacity onPress={() => onQueryChange('')}>
          <Text style={styles.clearButton}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

/**
 * 搜索历史区域 - 带动画
 */
const SearchHistoryArea: React.FC<{
  historyItems: SearchHistoryItem[];
  onHistorySelect: (query: string) => void;
  onHistoryDelete: (id: string) => void;
  onClearAll: () => void;
}> = ({ historyItems, onHistorySelect, onHistoryDelete, onClearAll }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (historyItems.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [historyItems.length]);
  
  if (historyItems.length === 0) return null;
  
  return (
    <Animated.View style={[styles.historyArea, { opacity: fadeAnim }]}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>🕐 搜索历史</Text>
        <TouchableOpacity onPress={onClearAll} style={styles.clearAllButton}>
          <Text style={styles.clearAllText}>🗑️ 清空</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.historyTags}>
        {historyItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.historyTag}
            onPress={() => onHistorySelect(item.query)}
            onLongPress={() => onHistoryDelete(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.historyTagText}>{item.query}</Text>
            <Text style={styles.historyTagClose}>×</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
};

/**
 * 热门搜索区域 - 带动画
 */
const HotSearchArea: React.FC<{
  hotSearches: HotSearchItem[];
  onHotSearchSelect: (query: string) => void;
}> = ({ hotSearches, onHotSearchSelect }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);
  
  return (
    <Animated.View style={[styles.hotSearchArea, { opacity: fadeAnim }]}>
      <View style={styles.hotSearchTitleRow}>
        <Text style={styles.hotSearchTitle}>🔥 热门搜索</Text>
        <Text style={styles.hotSearchSubtitle}>大家都在搜</Text>
      </View>
      <View style={styles.hotSearchTags}>
        {hotSearches.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.hotSearchTag, index < 3 && styles.hotSearchTagTop]}
            onPress={() => onHotSearchSelect(item.query)}
            activeOpacity={0.7}
          >
            {index < 3 && (
              <View style={[styles.rankBadge, { backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32' }]}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
            )}
            <Text style={[styles.hotSearchText, index < 3 && styles.hotSearchTextTop]}>{item.query}</Text>
            {item.trend === 'up' && <Text style={styles.trendIcon}>🔥</Text>}
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
};

/**
 * SearchMainPage 主组件
 */
const SearchMainPage: React.FC<SearchMainPageProps> = (props) => {
  const logic = useSearchLogic(props.initialQuery);
  
  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.BACKGROUND} />
        {/* 结果状态 - 使用新的搜索结果页面（包含自己的搜索栏） */}
        {logic.localState.viewState === 'results' ? (
          <SearchResultsPage 
            query={logic.localState.query}
            onBack={logic.handleBack}
            onQueryChange={logic.handleQueryChange}
            onSearchSubmit={() => logic.executeSearch(logic.localState.query)}
          />
        ) : (
          <>
            {/* 搜索导航 - 仅在非结果状态显示 */}
            <SearchNavigationArea
              query={logic.localState.query}
              onQueryChange={logic.handleQueryChange}
              onSearchSubmit={() => logic.executeSearch(logic.localState.query)}
              onBack={logic.handleBack}
              placeholder={logic.placeholder}
            />
            
            {/* 空状态 - 显示历史和热门 */}
            {logic.localState.viewState === 'empty' && (
              <View style={styles.emptyStateContent}>
                <SearchHistoryArea
                  historyItems={logic.searchHistory}
                  onHistorySelect={logic.handleHistorySelect}
                  onHistoryDelete={logic.handleHistoryDelete}
                  onClearAll={logic.handleClearHistory}
                />
                
                <HotSearchArea
                  hotSearches={logic.hotSearches}
                  onHotSearchSelect={logic.handleHistorySelect}
                />
              </View>
            )}
            
            {/* 建议状态 */}
            {logic.localState.viewState === 'suggestions' && (
              <View style={styles.suggestionsContent}>
                <Text style={styles.placeholderText}>
                  搜索建议功能开发中...
                </Text>
              </View>
            )}
          </>
        )}
        
        {/* 加载状态 */}
        {logic.localState.loading && (
          <LoadingOverlay loading={logic.localState.loading} text="搜索中..." />
        )}
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
  
  // 导航区域
  navigationArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.SURFACE,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.BACKGROUND,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 20,
    color: COLORS.TEXT,
    fontWeight: '600',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY_LIGHT,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.TEXT,
    padding: 0,
    fontWeight: '500',
  },
  clearButton: {
    fontSize: 18,
    color: COLORS.TEXT_LIGHT,
    padding: 6,
    fontWeight: '600',
  },
  
  // 空状态内容
  emptyStateContent: {
    flex: 1,
    padding: 20,
  },
  
  // 历史区域
  historyArea: {
    marginBottom: 32,
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.TEXT,
    letterSpacing: 0.3,
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.BACKGROUND,
  },
  clearAllText: {
    fontSize: 13,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  historyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  historyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  historyTagText: {
    fontSize: 14,
    color: COLORS.TEXT,
    fontWeight: '500',
    marginRight: 6,
  },
  historyTagClose: {
    fontSize: 16,
    color: COLORS.TEXT_LIGHT,
    fontWeight: '600',
  },
  
  // 热门搜索区域
  hotSearchArea: {
    marginBottom: 24,
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  hotSearchTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  hotSearchTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.TEXT,
    letterSpacing: 0.3,
  },
  hotSearchSubtitle: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
    fontWeight: '500',
  },
  hotSearchTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hotSearchTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: COLORS.PRIMARY_LIGHT,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  hotSearchTagTop: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderColor: COLORS.PRIMARY,
  },
  hotSearchText: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  hotSearchTextTop: {
    color: COLORS.WHITE,
  },
  rankBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  rankText: {
    fontSize: 11,
    color: COLORS.WHITE,
    fontWeight: '700',
  },
  trendIcon: {
    fontSize: 14,
    marginLeft: 4,
  },
  
  // 建议内容
  suggestionsContent: {
    flex: 1,
    padding: 16,
  },
  placeholderText: {
    fontSize: 15,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    paddingTop: 60,
    fontWeight: '500',
  },
});

export default SearchMainPage;
export type { SearchMainPageProps };
// #endregion
