// #region 1. File Banner & TOC
/**
 * SearchBar - 搜索栏组件
 *
 * 功能：
 * - 搜索输入框
 * - 搜索历史展示
 * - 搜索结果展示
 * - 取消搜索
 *
 * TOC (快速跳转):
 * [1] File Banner & TOC
 * [2] Imports
 * [3] Types & Schema
 * [4] Constants & Config
 * [5] UI Components & Rendering
 * [6] Exports
 */
// #endregion

// #region 2. Imports
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { useDiscoveryStore } from '@/stores';
import type { Feed } from '../../../types';
import FeedCard from '../FeedCard';
// #endregion

// #region 3. Types & Schema
export interface SearchBarProps {
  onFeedPress?: (feedId: string) => void;
  onUserPress?: (userId: string) => void;
  onLike?: (feedId: string) => void;
  onCollect?: (feedId: string) => void;
}
// #endregion

// #region 4. Constants & Config
const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - 32 - 12) / 2;

const COLORS = {
  BACKGROUND: '#F5F5F5',
  SEARCH_BG: '#FFFFFF',
  INPUT_BG: '#F0F0F0',
  TEXT_PRIMARY: '#1A1A1A',
  TEXT_SECONDARY: '#666666',
  TEXT_TERTIARY: '#999999',
  TEXT_PLACEHOLDER: '#BBBBBB',
  BORDER: '#E8E8E8',
  PRIMARY: '#8A2BE2',
  CANCEL: '#666666',
  HISTORY_TAG_BG: '#F5F5F5',
  CLEAR_BTN: '#999999',
} as const;
// #endregion

// #region 5. UI Components & Rendering
const SearchBar: React.FC<SearchBarProps> = ({
  onFeedPress,
  onUserPress,
  onLike,
  onCollect,
}) => {
  const inputRef = useRef<TextInput>(null);
  const [inputValue, setInputValue] = useState('');

  // 从Store获取状态和actions
  const search = useDiscoveryStore((state) => state.search);
  const searchContents = useDiscoveryStore((state) => state.searchContents);
  const clearSearch = useDiscoveryStore((state) => state.clearSearch);
  const exitSearchMode = useDiscoveryStore((state) => state.exitSearchMode);
  const clearSearchHistory = useDiscoveryStore((state) => state.clearSearchHistory);

  const { results, loading, error, isSearching, searchHistory } = search;

  // 聚焦输入框
  useEffect(() => {
    if (isSearching) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isSearching]);

  // 处理搜索
  const handleSearch = useCallback(() => {
    if (inputValue.trim()) {
      Keyboard.dismiss();
      searchContents(inputValue.trim());
    }
  }, [inputValue, searchContents]);

  // 处理历史点击
  const handleHistoryPress = useCallback((keyword: string) => {
    setInputValue(keyword);
    searchContents(keyword);
  }, [searchContents]);

  // 处理取消
  const handleCancel = useCallback(() => {
    Keyboard.dismiss();
    setInputValue('');
    clearSearch();
    exitSearchMode();
  }, [clearSearch, exitSearchMode]);

  // 处理清空输入
  const handleClearInput = useCallback(() => {
    setInputValue('');
    clearSearch();
  }, [clearSearch]);

  // 渲染搜索历史
  const renderSearchHistory = () => {
    if (results.length > 0 || loading) return null;

    return (
      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>搜索历史</Text>
          {searchHistory.length > 0 && (
            <TouchableOpacity onPress={clearSearchHistory}>
              <Text style={styles.clearHistoryText}>清空</Text>
            </TouchableOpacity>
          )}
        </View>
        {searchHistory.length > 0 ? (
          <View style={styles.historyTags}>
            {searchHistory.map((keyword, index) => (
              <TouchableOpacity
                key={index}
                style={styles.historyTag}
                onPress={() => handleHistoryPress(keyword)}
              >
                <Text style={styles.historyTagText}>{keyword}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.noHistoryText}>暂无搜索历史</Text>
        )}
      </View>
    );
  };

  // 渲染搜索结果
  const renderSearchResults = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>搜索中...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (inputValue.trim() && results.length === 0 && !loading) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>未找到相关内容</Text>
          <Text style={styles.emptySubText}>换个关键词试试吧</Text>
        </View>
      );
    }

    if (results.length === 0) {
      return renderSearchHistory();
    }

    // 双列瀑布流展示
    const leftColumn: Feed[] = [];
    const rightColumn: Feed[] = [];
    results.forEach((item, index) => {
      if (index % 2 === 0) {
        leftColumn.push(item);
      } else {
        rightColumn.push(item);
      }
    });

    return (
      <FlatList
        data={[{ key: 'results' }]}
        renderItem={() => (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsCount}>找到 {results.length} 条结果</Text>
            <View style={styles.columnsContainer}>
              <View style={styles.column}>
                {leftColumn.map((feed) => (
                  <FeedCard
                    key={feed.id}
                    feed={feed}
                    cardWidth={CARD_WIDTH}
                    onPress={onFeedPress}
                    onUserPress={onUserPress}
                    onLike={onLike || (() => {})}
                    onCollect={onCollect || (() => {})}
                  />
                ))}
              </View>
              <View style={styles.column}>
                {rightColumn.map((feed) => (
                  <FeedCard
                    key={feed.id}
                    feed={feed}
                    cardWidth={CARD_WIDTH}
                    onPress={onFeedPress}
                    onUserPress={onUserPress}
                    onLike={onLike || (() => {})}
                    onCollect={onCollect || (() => {})}
                  />
                ))}
              </View>
            </View>
          </View>
        )}
        style={styles.resultsList}
        contentContainerStyle={styles.resultsListContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    );
  };

  if (!isSearching) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* 搜索栏 */}
      <View style={styles.searchBar}>
        <View style={styles.inputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="搜索动态、话题"
            placeholderTextColor={COLORS.TEXT_PLACEHOLDER}
            value={inputValue}
            onChangeText={setInputValue}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {inputValue.length > 0 && (
            <TouchableOpacity onPress={handleClearInput} style={styles.clearBtn}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>取消</Text>
        </TouchableOpacity>
      </View>

      {/* 搜索结果或历史 */}
      {renderSearchResults()}
    </View>
  );
};
// #endregion

// #region 6. Styles
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.BACKGROUND,
    zIndex: 100,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SEARCH_BG,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.INPUT_BG,
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 36,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 12,
    color: COLORS.CLEAR_BTN,
  },
  cancelBtn: {
    marginLeft: 12,
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 15,
    color: COLORS.CANCEL,
  },
  historyContainer: {
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  clearHistoryText: {
    fontSize: 13,
    color: COLORS.TEXT_TERTIARY,
  },
  historyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  historyTag: {
    backgroundColor: COLORS.HISTORY_TAG_BG,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  historyTagText: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
  },
  noHistoryText: {
    fontSize: 14,
    color: COLORS.TEXT_TERTIARY,
    textAlign: 'center',
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.TEXT_TERTIARY,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.TEXT_TERTIARY,
  },
  errorText: {
    fontSize: 14,
    color: '#FF4444',
  },
  resultsList: {
    flex: 1,
  },
  resultsListContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  resultsContainer: {},
  resultsCount: {
    fontSize: 13,
    color: COLORS.TEXT_TERTIARY,
    marginBottom: 12,
  },
  columnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: CARD_WIDTH,
  },
});
// #endregion

// #region 7. Exports
export default SearchBar;
export type { SearchBarProps };
// #endregion
