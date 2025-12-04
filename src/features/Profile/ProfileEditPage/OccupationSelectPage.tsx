// #region 1. File Banner & TOC
/**
 * OccupationSelectPage - 职业选择页面
 * 
 * 功能：
 * - 搜索职业
 * - 选择/取消选择职业标签
 * - 多选支持
 * - 保存到ProfileStore
 */
// #endregion

// #region 2. Imports
import { useProfileStore } from '@/stores/profileStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { MAX_OCCUPATION_COUNT, occupationApi } from './api/occupationApi';
// #endregion

// #region 3-7. Types, Constants, Utils, State & Logic
interface OccupationSelectPageProps {
  currentOccupations?: string[];
}

const COLORS = {
  WHITE: '#FFFFFF',
  BG_GRAY: '#F5F5F5',
  TEXT_PRIMARY: '#333333',
  TEXT_SECONDARY: '#999999',
  TEXT_TERTIARY: '#CCCCCC',
  BORDER: '#E5E5E5',
  PRIMARY: '#9C27B0',
  PRIMARY_LIGHT: '#E1BEE7',
  TAG_BG: '#F5F5F5',
  TAG_SELECTED_BG: '#E1BEE7',
  TAG_SELECTED_TEXT: '#7B1FA2',
} as const;

// 预设职业列表
const PRESET_OCCUPATIONS = [
  '情侣', '学生', '上班族', '自由职业', '创业者',
  '教师', '医生', '工程师', '设计师', '程序员',
  '销售', '律师', '会计', '公务员', '军人',
  '艺术家', '运动员', '主播', '模特', '摄影师',
  '厨师', '司机', '导游', '记者', '编辑',
  '金融从业者', '房地产从业者', '服务业', '制造业', '其他',
];

const useOccupationSelectLogic = (props: OccupationSelectPageProps) => {
  const router = useRouter();
  const updateUserProfile = useProfileStore(state => state.updateUserProfile);

  const [searchText, setSearchText] = useState('');
  const [selectedOccupations, setSelectedOccupations] = useState<string[]>(
    props.currentOccupations || []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 页面加载时获取已选职业
  useEffect(() => {
    const fetchOccupations = async () => {
      try {
        setIsLoading(true);
        const response = await occupationApi.getOccupations();
        if (response.code === 200 && response.data) {
          setSelectedOccupations(response.data);
        }
      } catch (error) {
        console.error('获取职业列表失败:', error);
        // 加载失败时使用 props 中的数据
        if (props.currentOccupations) {
          setSelectedOccupations(props.currentOccupations);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOccupations();
  }, []);

  // 过滤职业列表
  const filteredOccupations = searchText.trim()
    ? PRESET_OCCUPATIONS.filter(occ =>
        occ.toLowerCase().includes(searchText.toLowerCase())
      )
    : PRESET_OCCUPATIONS;

  const handleCancel = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const handleToggleOccupation = (occupation: string) => {
    setSelectedOccupations(prev => {
      if (prev.includes(occupation)) {
        // 取消选择
        return prev.filter(item => item !== occupation);
      } else {
        // 选择（最多选择5个）
        if (prev.length >= MAX_OCCUPATION_COUNT) {
          Alert.alert('提示', `最多可选择${MAX_OCCUPATION_COUNT}个职业`);
          return prev;
        }
        return [...prev, occupation];
      }
    });
  };

  const handleDone = async () => {
    if (selectedOccupations.length === 0) {
      Alert.alert('提示', '请至少选择一个职业');
      return;
    }

    try {
      setIsSaving(true);
      const response = await occupationApi.updateOccupations(selectedOccupations);

      if (response.code === 200) {
        // 同步更新到本地 Store
        updateUserProfile({
          occupations: selectedOccupations,
          occupation: selectedOccupations[0], // 主职业为第一个
        });

        // 保存成功，返回上一页
        if (router.canGoBack()) {
          router.back();
        }
      } else {
        Alert.alert('保存失败', response.message || response.msg || '请稍后重试');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '请稍后重试';
      Alert.alert('保存失败', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    searchText,
    setSearchText,
    selectedOccupations,
    filteredOccupations,
    isLoading,
    isSaving,
    handleCancel,
    handleToggleOccupation,
    handleDone,
  };
};
// #endregion

// #region 8. UI Components & Rendering
const OccupationSelectPage: React.FC<OccupationSelectPageProps> = (props) => {
  const {
    searchText,
    setSearchText,
    selectedOccupations,
    filteredOccupations,
    isLoading,
    isSaving,
    handleCancel,
    handleToggleOccupation,
    handleDone,
  } = useOccupationSelectLogic(props);
  
  const renderOccupationTag = ({ item }: { item: string }) => {
    const isSelected = selectedOccupations.includes(item);
    
    return (
      <TouchableOpacity
        style={[
          styles.tag,
          isSelected && styles.tagSelected,
        ]}
        onPress={() => handleToggleOccupation(item)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.tagText,
          isSelected && styles.tagTextSelected,
        ]}>
          {item}
        </Text>
        {isSelected && (
          <Ionicons 
            name="close-circle" 
            size={16} 
            color={COLORS.TAG_SELECTED_TEXT} 
            style={styles.tagCloseIcon}
          />
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />
      
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton} disabled={isSaving}>
          <Text style={[styles.cancelButtonText, isSaving && styles.disabledText]}>取消</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>职业</Text>
        <TouchableOpacity onPress={handleDone} style={styles.doneButton} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color={COLORS.PRIMARY} />
          ) : (
            <Text style={styles.doneButtonText}>完成</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {/* 搜索框 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.TEXT_SECONDARY} />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="搜索职业"
            placeholderTextColor={COLORS.TEXT_TERTIARY}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.TEXT_SECONDARY} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* 已选择的职业显示 */}
        {selectedOccupations.length > 0 && (
          <View style={styles.selectedContainer}>
            {selectedOccupations.map((occ, index) => (
              <View key={index} style={styles.selectedTag}>
                <Text style={styles.selectedTagText}>{occ}</Text>
                <TouchableOpacity 
                  onPress={() => handleToggleOccupation(occ)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons 
                    name="close" 
                    size={16} 
                    color={COLORS.TAG_SELECTED_TEXT} 
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
      
      {/* 职业标签列表 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOccupations}
          renderItem={renderOccupationTag}
          keyExtractor={(item) => item}
          numColumns={3}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>未找到相关职业</Text>
            </View>
          }
        />
      )}
      
      {/* 底部提示 */}
      <View style={styles.tipContainer}>
        <Text style={styles.tipText}>最多可选择{MAX_OCCUPATION_COUNT}个职业</Text>
      </View>
    </SafeAreaView>
  );
};
// #endregion

// #region 9. Exports & Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  cancelButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 60,
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  doneButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 60,
    alignItems: 'flex-end',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.PRIMARY,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BG_GRAY,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    padding: 0,
  },
  selectedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.TAG_SELECTED_BG,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  selectedTagText: {
    fontSize: 14,
    color: COLORS.TAG_SELECTED_TEXT,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  tag: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.TAG_BG,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    margin: 4,
    minWidth: 100,
    gap: 4,
  },
  tagSelected: {
    backgroundColor: COLORS.TAG_SELECTED_BG,
  },
  tagText: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
  },
  tagTextSelected: {
    color: COLORS.TAG_SELECTED_TEXT,
    fontWeight: '500',
  },
  tagCloseIcon: {
    marginLeft: 2,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  disabledText: {
    color: COLORS.TEXT_TERTIARY,
  },
  tipContainer: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  tipText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
});

export default OccupationSelectPage;
// #endregion

