// #region 1. File Banner & TOC
/**
 * ProfileContentArea - 资料Tab内容区域
 *
 * 对应UI文档: ProfileContentArea [L3]
 * 布局: grid-cols-2, gap-y-16px
 *
 * 功能：
 * - 展示用户个人资料（常居地、IP、身高、体重等）
 * - 微信号脱敏/解锁显示
 * - 点击复制微信号
 *
 * TOC:
 * [1] File Banner & TOC
 * [2] Imports
 * [3] Types
 * [4] ProfileInfoRow Component
 * [5] Main Component
 * [6] Styles
 * [7] Export
 */
// #endregion

// #region 2. Imports

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { ProfileInfoData, ProfileInfoRow } from '../types';

// #endregion

// #region 3. Types

interface ProfileContentAreaProps {
  profileInfo: ProfileInfoData | null;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onUnlockWechat?: () => void;
}

// #endregion

// #region 4. ProfileInfoRow Component

interface InfoRowProps {
  label: string;
  value: string | null;
  isWechat?: boolean;
  wechatUnlocked?: boolean;
  onUnlockPress?: () => void;
  onCopyPress?: (value: string) => void;
}

const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  isWechat = false,
  wechatUnlocked = false,
  onUnlockPress,
  onCopyPress,
}) => {
  const handlePress = () => {
    if (isWechat && !wechatUnlocked && onUnlockPress) {
      onUnlockPress();
    } else if (value && onCopyPress) {
      onCopyPress(value);
    }
  };

  const displayValue = value || '暂无';
  const showLockIcon = isWechat && !wechatUnlocked && value === '******';
  const showCopyIcon = isWechat && wechatUnlocked && value && value !== '******';

  return (
    <TouchableOpacity
      style={styles.infoRow}
      onPress={handlePress}
      disabled={!isWechat && !value}
      activeOpacity={0.7}
    >
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoValueContainer}>
        <Text style={[styles.infoValue, !value && styles.infoValueEmpty]}>
          {displayValue}
        </Text>
        {showLockIcon && (
          <Ionicons name="lock-closed" size={14} color="#8A2BE2" style={styles.icon} />
        )}
        {showCopyIcon && (
          <Ionicons name="copy-outline" size={14} color="#8A2BE2" style={styles.icon} />
        )}
      </View>
    </TouchableOpacity>
  );
};

// #endregion

// #region 5. Main Component

const ProfileContentArea: React.FC<ProfileContentAreaProps> = ({
  profileInfo,
  loading = false,
  error = null,
  onRefresh,
  onUnlockWechat,
}) => {
  // Handle copy to clipboard
  const handleCopy = (value: string) => {
    try {
      Clipboard.setString(value);
      Alert.alert('已复制', '微信号已复制到剪贴板');
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        {onRefresh && (
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // No data
  if (!profileInfo) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="person-outline" size={48} color="#CCCCCC" />
        <Text style={styles.emptyText}>暂无资料信息</Text>
      </View>
    );
  }

  // Build info rows data
  const infoRows: ProfileInfoRow[] = [
    { key: 'residence', label: '常居地', value: profileInfo.residence },
    { key: 'ipLocation', label: 'IP', value: profileInfo.ipLocation },
    {
      key: 'height',
      label: '身高',
      value: profileInfo.height ? `${profileInfo.height}cm` : null,
    },
    { key: 'userId', label: 'ID', value: String(profileInfo.userId) },
    {
      key: 'weight',
      label: '体重',
      value: profileInfo.weight ? `${profileInfo.weight}kg` : null,
    },
    { key: 'occupation', label: '职业', value: profileInfo.occupation },
    { key: 'wechat', label: '微信', value: profileInfo.wechat },
    { key: 'birthday', label: '生日', value: profileInfo.birthday },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Section Title */}
      <Text style={styles.sectionTitle}>个人资料</Text>

      {/* Info Grid */}
      <View style={styles.infoGrid}>
        {infoRows.map((row, index) => (
          <View key={row.key} style={styles.infoCell}>
            <InfoRow
              label={row.label}
              value={row.value}
              isWechat={row.key === 'wechat'}
              wechatUnlocked={profileInfo.wechatUnlocked}
              onUnlockPress={onUnlockWechat}
              onCopyPress={row.key === 'wechat' ? handleCopy : undefined}
            />
          </View>
        ))}
      </View>

      {/* Bio Section */}
      {profileInfo.bio && (
        <View style={styles.bioSection}>
          <Text style={styles.sectionTitle}>个性签名</Text>
          <Text style={styles.bioText}>{profileInfo.bio}</Text>
        </View>
      )}

      {/* Zodiac Badge */}
      {profileInfo.zodiac && (
        <View style={styles.zodiacContainer}>
          <View style={styles.zodiacBadge}>
            <Text style={styles.zodiacText}>{profileInfo.zodiac}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

// #endregion

// #region 6. Styles

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 14,
    color: '#999999',
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    marginTop: 12,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: '#8A2BE2',
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
  },
  infoCell: {
    width: '50%',
    padding: 12,
  },
  infoRow: {
    flexDirection: 'column',
  },
  infoLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  infoValueEmpty: {
    color: '#CCCCCC',
  },
  icon: {
    marginLeft: 6,
  },
  bioSection: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  bioText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  zodiacContainer: {
    marginTop: 16,
    flexDirection: 'row',
  },
  zodiacBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3E5F5',
    borderRadius: 16,
  },
  zodiacText: {
    fontSize: 12,
    color: '#8A2BE2',
    fontWeight: '500',
  },
});

// #endregion

// #region 7. Export

export default ProfileContentArea;

// #endregion
