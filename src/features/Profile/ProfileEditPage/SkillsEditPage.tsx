// #region 1. File Banner & TOC
/**
 * SkillsEditPage - 添加技能页面
 *
 * 对应UI文档: 添加技能页_结构文档.md
 *
 * 功能：
 * - 技能选择器网格 (SkillSelectorArea)
 * - 内容表单 (ContentForm): 标题、正文、图片上传
 * - 配置表单 (ConfigForm): 段位/时间/地点/定价
 * - 段位选择弹窗 (RankPickerModal) - 线上技能
 * - 时间选择弹窗 (TimePickerModal) - 线下技能
 * - 价格输入弹窗 (PriceInputModal)
 *
 * @author XiangYuPai
 * @updated 2025-12-02 - 按新UI文档重构
 */
// #endregion

// #region 2. Imports
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { skillApi, type SkillConfigItem, type SkillConfigResponse, type SkillType } from '../../../../services/api/skillApi';
// #endregion

// #region 3. Types & Interfaces
interface SkillFormData {
  skillConfigId: string;
  skillType: SkillType;
  skillName: string;
  gameName: string;
  title: string;
  description: string;
  images: string[];
  server: string;
  rank: string;
  activityTime: Date | null;
  location: string;
  latitude: number | null;
  longitude: number | null;
  price: number;
  priceUnit: string;
}

interface SkillsEditPageProps {
  skillId?: string;
}
// #endregion

// #region 4. Constants
const COLORS = {
  WHITE: '#FFFFFF',
  BG_GRAY: '#F5F5F5',
  BG_DARK: '#1A1A1A',
  TEXT_PRIMARY: '#333333',
  TEXT_SECONDARY: '#999999',
  TEXT_PLACEHOLDER: '#CCCCCC',
  BORDER: '#E5E5E5',
  PRIMARY: '#9C27B0',
  CANCEL: '#666666',
  TAB_ACTIVE: '#9C27B0',
  TAB_INACTIVE: '#999999',
  ERROR: '#FF4444',
  SUCCESS: '#4CAF50',
} as const;

const INITIAL_FORM_DATA: SkillFormData = {
  skillConfigId: '',
  skillType: 'online',
  skillName: '',
  gameName: '',
  title: '',
  description: '',
  images: [],
  server: '',
  rank: '',
  activityTime: null,
  location: '',
  latitude: null,
  longitude: null,
  price: 0,
  priceUnit: '局',
};
// #endregion

// #region 5. Custom Hooks
const useSkillsEditLogic = (props: SkillsEditPageProps) => {
  const router = useRouter();

  // 配置数据状态
  const [config, setConfig] = useState<SkillConfigResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 表单数据状态
  const [formData, setFormData] = useState<SkillFormData>(INITIAL_FORM_DATA);

  // Modal状态
  const [rankModalVisible, setRankModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [priceModalVisible, setPriceModalVisible] = useState(false);

  // 加载技能配置
  useEffect(() => {
    loadSkillConfig();
  }, []);

  const loadSkillConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await skillApi.getSkillConfig();
      setConfig(data);
    } catch (err) {
      console.error('获取技能配置失败:', err);
      setError('加载配置失败，请检查网络后重试');
    } finally {
      setLoading(false);
    }
  };

  // 选择技能
  const handleSkillSelect = useCallback((skill: SkillConfigItem) => {
    setFormData(prev => ({
      ...prev,
      skillConfigId: skill.id,
      skillType: skill.type,
      skillName: skill.name,
      gameName: skill.type === 'online' ? skill.name : '',
      // 切换类型时重置相关字段
      server: '',
      rank: '',
      activityTime: null,
      location: '',
      priceUnit: skill.type === 'online' ? '局' : '小时',
    }));
  }, []);

  // 更新表单字段
  const updateFormField = useCallback(<K extends keyof SkillFormData>(
    field: K,
    value: SkillFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // 返回
  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    }
  }, [router]);

  // 取消
  const handleCancel = useCallback(() => {
    handleBack();
  }, [handleBack]);

  // 验证表单
  const validateForm = useCallback((): string | null => {
    if (!formData.skillConfigId) {
      return '请选择技能类型';
    }
    if (!formData.title.trim()) {
      return '请输入技能标题';
    }
    if (formData.title.length < 2 || formData.title.length > 50) {
      return '标题长度为2-50字符';
    }
    if (!formData.description.trim()) {
      return '请输入技能介绍';
    }
    if (formData.description.length < 10) {
      return '介绍至少10字符';
    }
    if (formData.skillType === 'online') {
      if (!formData.rank) {
        return '请选择段位';
      }
    } else {
      if (!formData.location) {
        return '请选择活动地点';
      }
      if (!formData.activityTime) {
        return '请选择活动时间';
      }
    }
    if (formData.price <= 0) {
      return '请设置定价';
    }
    return null;
  }, [formData]);

  // 提交
  const handleComplete = useCallback(async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('提示', error);
      return;
    }

    try {
      setSubmitting(true);

      if (formData.skillType === 'online') {
        await skillApi.createOnlineSkill({
          skillConfigId: formData.skillConfigId,
          gameId: formData.skillConfigId,
          gameName: formData.gameName,
          server: formData.server,
          gameRank: formData.rank,
          skillName: formData.title,
          description: formData.description,
          price: formData.price,
          serviceHours: 1,
          images: formData.images,
          isOnline: true,
        });
      } else {
        await skillApi.createOfflineSkill({
          skillConfigId: formData.skillConfigId,
          serviceType: formData.skillConfigId,
          serviceTypeName: formData.skillName,
          skillName: formData.title,
          description: formData.description,
          price: formData.price,
          priceUnit: formData.priceUnit as any,
          activityTime: formData.activityTime?.toISOString(),
          images: formData.images,
          location: {
            address: formData.location,
            latitude: formData.latitude || 0,
            longitude: formData.longitude || 0,
          },
          availableTimes: [],
          isOnline: true,
        });
      }

      Alert.alert('成功', '技能添加成功', [
        { text: '确定', onPress: handleBack },
      ]);
    } catch (error) {
      console.error('创建技能失败:', error);
      Alert.alert('错误', '创建技能失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  }, [formData, validateForm, handleBack]);

  return {
    config,
    loading,
    error,
    submitting,
    formData,
    rankModalVisible,
    timeModalVisible,
    priceModalVisible,
    setRankModalVisible,
    setTimeModalVisible,
    setPriceModalVisible,
    handleSkillSelect,
    updateFormField,
    handleBack,
    handleCancel,
    handleComplete,
    loadSkillConfig,
  };
};
// #endregion

// #region 6. Sub Components

// 技能选择卡片
const SkillCard: React.FC<{
  skill: SkillConfigItem;
  selected: boolean;
  onSelect: () => void;
}> = ({ skill, selected, onSelect }) => {
  const isUrl = skill.icon?.startsWith('http');

  return (
    <TouchableOpacity
      style={[styles.skillCard, selected && styles.skillCardSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={[styles.skillIconCircle, selected && styles.skillIconCircleSelected]}>
        {isUrl ? (
          <Image source={{ uri: skill.icon }} style={styles.skillIconImage} />
        ) : (
          <Text style={styles.skillIconEmoji}>{skill.icon}</Text>
        )}
      </View>
      <Text style={[styles.skillCardName, selected && styles.skillCardNameSelected]} numberOfLines={1}>
        {skill.name}
      </Text>
    </TouchableOpacity>
  );
};

// 技能选择器区域
const SkillSelectorArea: React.FC<{
  skills: SkillConfigItem[];
  skillType: SkillType;
  selectedId: string;
  onSkillSelect: (skill: SkillConfigItem) => void;
  onTypeChange: (type: SkillType) => void;
}> = ({ skills, skillType, selectedId, onSkillSelect, onTypeChange }) => {
  const filteredSkills = skills.filter(s => s.type === skillType);

  return (
    <View style={styles.selectorArea}>
      {/* 类型切换Tab */}
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeTab, skillType === 'online' && styles.typeTabActive]}
          onPress={() => onTypeChange('online')}
          activeOpacity={0.7}
        >
          <Text style={[styles.typeTabText, skillType === 'online' && styles.typeTabTextActive]}>
            线上
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeTab, skillType === 'offline' && styles.typeTabActive]}
          onPress={() => onTypeChange('offline')}
          activeOpacity={0.7}
        >
          <Text style={[styles.typeTabText, skillType === 'offline' && styles.typeTabTextActive]}>
            线下
          </Text>
        </TouchableOpacity>
      </View>

      {/* 技能网格 */}
      <View style={styles.skillGrid}>
        {filteredSkills.map(skill => (
          <SkillCard
            key={skill.id}
            skill={skill}
            selected={selectedId === skill.id}
            onSelect={() => onSkillSelect(skill)}
          />
        ))}
      </View>
    </View>
  );
};

// 段位选择弹窗
const RankPickerModal: React.FC<{
  visible: boolean;
  servers: string[];
  ranks: string[];
  selectedServer: string;
  selectedRank: string;
  onClose: () => void;
  onConfirm: (server: string, rank: string) => void;
}> = ({ visible, servers, ranks, selectedServer, selectedRank, onClose, onConfirm }) => {
  const [tempServer, setTempServer] = useState(selectedServer || servers[0] || '');
  const [tempRank, setTempRank] = useState(selectedRank || '');

  useEffect(() => {
    if (visible) {
      setTempServer(selectedServer || servers[0] || '');
      setTempRank(selectedRank || '');
    }
  }, [visible, selectedServer, selectedRank, servers]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalCancelText}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>选择段位</Text>
            <TouchableOpacity onPress={() => onConfirm(tempServer, tempRank)}>
              <Text style={styles.modalConfirmText}>确定</Text>
            </TouchableOpacity>
          </View>

          {/* 服务区选择 */}
          {servers.length > 0 && (
            <View style={styles.pickerSection}>
              <Text style={styles.pickerLabel}>服务区</Text>
              <View style={styles.pickerOptions}>
                {servers.map(server => (
                  <TouchableOpacity
                    key={server}
                    style={[styles.pickerOption, tempServer === server && styles.pickerOptionSelected]}
                    onPress={() => setTempServer(server)}
                  >
                    <Text style={[styles.pickerOptionText, tempServer === server && styles.pickerOptionTextSelected]}>
                      {server}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* 段位选择 */}
          <View style={styles.pickerSection}>
            <Text style={styles.pickerLabel}>段位</Text>
            <ScrollView style={styles.rankScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.pickerOptions}>
                {ranks.map(rank => (
                  <TouchableOpacity
                    key={rank}
                    style={[styles.pickerOption, tempRank === rank && styles.pickerOptionSelected]}
                    onPress={() => setTempRank(rank)}
                  >
                    <Text style={[styles.pickerOptionText, tempRank === rank && styles.pickerOptionTextSelected]}>
                      {rank}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// 时间选择弹窗
const TimePickerModal: React.FC<{
  visible: boolean;
  selectedTime: Date | null;
  onClose: () => void;
  onConfirm: (date: Date) => void;
}> = ({ visible, selectedTime, onClose, onConfirm }) => {
  const [tempDate, setTempDate] = useState(selectedTime || new Date());

  useEffect(() => {
    if (visible) {
      setTempDate(selectedTime || new Date());
    }
  }, [visible, selectedTime]);

  // 生成时间选项
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const h = hour.toString().padStart(2, '0');
        const m = minute.toString().padStart(2, '0');
        slots.push(`${h}:${m}`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalCancelText}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>选择时间</Text>
            <TouchableOpacity onPress={() => onConfirm(tempDate)}>
              <Text style={styles.modalConfirmText}>确定</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.timeScrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.pickerOptions}>
              {timeSlots.map(slot => {
                const [hour, minute] = slot.split(':').map(Number);
                const isSelected =
                  tempDate.getHours() === hour && tempDate.getMinutes() === minute;

                return (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.pickerOption, isSelected && styles.pickerOptionSelected]}
                    onPress={() => {
                      const newDate = new Date(tempDate);
                      newDate.setHours(hour, minute, 0, 0);
                      setTempDate(newDate);
                    }}
                  >
                    <Text style={[styles.pickerOptionText, isSelected && styles.pickerOptionTextSelected]}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// 价格输入弹窗
const PriceInputModal: React.FC<{
  visible: boolean;
  price: number;
  priceUnit: string;
  skillType: SkillType;
  onClose: () => void;
  onConfirm: (price: number, unit: string) => void;
}> = ({ visible, price, priceUnit, skillType, onClose, onConfirm }) => {
  const [tempPrice, setTempPrice] = useState(price.toString());
  const [tempUnit, setTempUnit] = useState(priceUnit);

  useEffect(() => {
    if (visible) {
      setTempPrice(price > 0 ? price.toString() : '');
      setTempUnit(priceUnit);
    }
  }, [visible, price, priceUnit]);

  const units = skillType === 'online' ? ['局', '小时'] : ['小时', '次', '天'];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalCancelText}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>设置定价</Text>
            <TouchableOpacity onPress={() => onConfirm(Number(tempPrice) || 0, tempUnit)}>
              <Text style={styles.modalConfirmText}>确定</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.priceInputContainer}>
            <TextInput
              style={styles.priceInput}
              value={tempPrice}
              onChangeText={setTempPrice}
              placeholder="请输入价格"
              keyboardType="numeric"
              placeholderTextColor={COLORS.TEXT_PLACEHOLDER}
            />
            <Text style={styles.priceInputSuffix}>金币</Text>
          </View>

          <View style={styles.pickerSection}>
            <Text style={styles.pickerLabel}>计价单位</Text>
            <View style={styles.pickerOptions}>
              {units.map(unit => (
                <TouchableOpacity
                  key={unit}
                  style={[styles.pickerOption, tempUnit === unit && styles.pickerOptionSelected]}
                  onPress={() => setTempUnit(unit)}
                >
                  <Text style={[styles.pickerOptionText, tempUnit === unit && styles.pickerOptionTextSelected]}>
                    /{unit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
// #endregion

// #region 7. Main Component
const SkillsEditPage: React.FC<SkillsEditPageProps> = (props) => {
  const {
    config,
    loading,
    error,
    submitting,
    formData,
    rankModalVisible,
    timeModalVisible,
    priceModalVisible,
    setRankModalVisible,
    setTimeModalVisible,
    setPriceModalVisible,
    handleSkillSelect,
    updateFormField,
    handleCancel,
    handleComplete,
    loadSkillConfig,
  } = useSkillsEditLogic(props);

  // 获取当前技能的段位选项
  const currentRanks = config?.rankOptions?.ranksBySkill?.[formData.skillConfigId] || [];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.ERROR} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSkillConfig}>
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />

      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.cancelText}>取消</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>添加技能</Text>
        <TouchableOpacity
          onPress={handleComplete}
          style={styles.headerButton}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={COLORS.PRIMARY} />
          ) : (
            <Text style={styles.completeText}>完成</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 内容区域 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 技能选择器 */}
        <SkillSelectorArea
          skills={config?.skills || []}
          skillType={formData.skillType}
          selectedId={formData.skillConfigId}
          onSkillSelect={handleSkillSelect}
          onTypeChange={(type) => updateFormField('skillType', type)}
        />

        {/* 添加标题 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>添加标题</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => updateFormField('title', text)}
              placeholder="请输入标题（2-50字符）"
              placeholderTextColor={COLORS.TEXT_PLACEHOLDER}
              maxLength={50}
            />
          </View>
        </View>

        {/* 添加正文 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>添加正文</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <TouchableOpacity style={styles.imageUploadPlaceholder}>
              <Ionicons name="add" size={40} color={COLORS.TEXT_PLACEHOLDER} />
            </TouchableOpacity>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => updateFormField('description', text)}
              placeholder="介绍一下你的技能吧（至少10字符）"
              placeholderTextColor={COLORS.TEXT_PLACEHOLDER}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{formData.description.length}/500</Text>
          </View>
        </View>

        {/* 线上技能配置 */}
        {formData.skillType === 'online' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>段位</Text>
            <TouchableOpacity
              style={styles.selectContainer}
              onPress={() => setRankModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={formData.rank ? styles.selectValue : styles.selectPlaceholder}>
                {formData.rank
                  ? `${formData.server ? formData.server + ' · ' : ''}${formData.rank}`
                  : '选择段位'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
            </TouchableOpacity>
          </View>
        )}

        {/* 线下技能配置 */}
        {formData.skillType === 'offline' && (
          <>
            {/* 时间 */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>活动时间</Text>
              <TouchableOpacity
                style={styles.selectContainer}
                onPress={() => setTimeModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={formData.activityTime ? styles.selectValue : styles.selectPlaceholder}>
                  {formData.activityTime
                    ? formData.activityTime.toLocaleString('zh-CN', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '选择时间'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>

            {/* 地点 */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>活动地点</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={formData.location}
                  onChangeText={(text) => updateFormField('location', text)}
                  placeholder="请输入活动地点"
                  placeholderTextColor={COLORS.TEXT_PLACEHOLDER}
                  maxLength={100}
                />
              </View>
            </View>
          </>
        )}

        {/* 定价 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>定价</Text>
          <TouchableOpacity
            style={styles.selectContainer}
            onPress={() => setPriceModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={formData.price > 0 ? styles.selectValue : styles.selectPlaceholder}>
              {formData.price > 0
                ? `${formData.price}金币/${formData.priceUnit}`
                : '设置定价'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
        </View>

        {/* 底部间距 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 弹窗 */}
      <RankPickerModal
        visible={rankModalVisible}
        servers={config?.rankOptions?.servers || []}
        ranks={currentRanks}
        selectedServer={formData.server}
        selectedRank={formData.rank}
        onClose={() => setRankModalVisible(false)}
        onConfirm={(server, rank) => {
          updateFormField('server', server);
          updateFormField('rank', rank);
          setRankModalVisible(false);
        }}
      />

      <TimePickerModal
        visible={timeModalVisible}
        selectedTime={formData.activityTime}
        onClose={() => setTimeModalVisible(false)}
        onConfirm={(date) => {
          updateFormField('activityTime', date);
          setTimeModalVisible(false);
        }}
      />

      <PriceInputModal
        visible={priceModalVisible}
        price={formData.price}
        priceUnit={formData.priceUnit}
        skillType={formData.skillType}
        onClose={() => setPriceModalVisible(false)}
        onConfirm={(price, unit) => {
          updateFormField('price', price);
          updateFormField('priceUnit', unit);
          setPriceModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
};
// #endregion

// #region 8. Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.ERROR,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 14,
    color: COLORS.WHITE,
    fontWeight: '500',
  },

  // Header
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
  headerButton: {
    padding: 4,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  cancelText: {
    fontSize: 16,
    color: COLORS.CANCEL,
  },
  completeText: {
    fontSize: 16,
    color: COLORS.PRIMARY,
    textAlign: 'right',
  },
  content: {
    flex: 1,
  },

  // Skill Selector Area
  selectorArea: {
    paddingBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: COLORS.BG_GRAY,
    borderRadius: 8,
    padding: 4,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  typeTabActive: {
    backgroundColor: COLORS.WHITE,
  },
  typeTabText: {
    fontSize: 15,
    color: COLORS.TAB_INACTIVE,
    fontWeight: '500',
  },
  typeTabTextActive: {
    color: COLORS.TAB_ACTIVE,
    fontWeight: '600',
  },
  skillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    paddingTop: 12,
  },
  skillCard: {
    width: '20%',
    alignItems: 'center',
    marginBottom: 16,
  },
  skillCardSelected: {
    opacity: 1,
  },
  skillIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.BG_GRAY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  skillIconCircleSelected: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: '#F3E5F5',
  },
  skillIconImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  skillIconEmoji: {
    fontSize: 26,
  },
  skillCardName: {
    fontSize: 12,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    width: '90%',
  },
  skillCardNameSelected: {
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },

  // Form Sections
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: COLORS.BG_GRAY,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    padding: 0,
    minHeight: 24,
  },
  textAreaContainer: {
    minHeight: 120,
    position: 'relative',
    paddingBottom: 30,
  },
  textArea: {
    minHeight: 60,
    marginTop: 8,
  },
  imageUploadPlaceholder: {
    width: 72,
    height: 72,
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  charCount: {
    position: 'absolute',
    right: 12,
    bottom: 8,
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.BG_GRAY,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  selectPlaceholder: {
    fontSize: 16,
    color: COLORS.TEXT_PLACEHOLDER,
  },
  selectValue: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  bottomSpacer: {
    height: 40,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  modalCancelText: {
    fontSize: 16,
    color: COLORS.CANCEL,
  },
  modalConfirmText: {
    fontSize: 16,
    color: COLORS.PRIMARY,
  },
  pickerSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerLabel: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 12,
  },
  pickerOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.BG_GRAY,
    marginRight: 8,
    marginBottom: 8,
  },
  pickerOptionSelected: {
    backgroundColor: COLORS.PRIMARY,
  },
  pickerOptionText: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
  },
  pickerOptionTextSelected: {
    color: COLORS.WHITE,
  },
  rankScrollView: {
    maxHeight: 200,
  },
  timeScrollView: {
    maxHeight: 300,
  },

  // Price Input
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  priceInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  priceInputSuffix: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 8,
  },
});
// #endregion

// #region 9. Exports
export default SkillsEditPage;
// #endregion
