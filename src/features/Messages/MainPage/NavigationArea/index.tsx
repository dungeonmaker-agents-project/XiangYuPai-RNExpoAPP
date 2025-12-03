// #region 1. File Banner & TOC
/**
 * NavigationArea - 导航栏区域
 * 
 * 功能：消息页面导航栏，包含标题和清空按钮
 */
// #endregion

// #region 2. Imports
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// #endregion

// #region 3. Types & Schema
interface NavigationAreaProps {
  onClearPress?: () => void;
}
// #endregion

// #region 4. Constants & Config
const COLORS = {
  background: '#FFFFFF',
  text: '#1F2937',
  border: '#E5E7EB',
  iconColor: '#6B7280',
};

const NAV_HEIGHT = 56;
// #endregion

// #region 5. Utils & Helpers
// #endregion

// #region 6. State Management
// #endregion

// #region 7. Domain Logic
// #endregion

// #region 8. UI Components & Rendering
const NavigationArea: React.FC<NavigationAreaProps> = ({ onClearPress }) => {
  const handleClearPress = () => {
    Alert.alert(
      '清空消息',
      '确定要清空所有对话吗？此操作不可恢复。',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '确定',
          style: 'destructive',
          onPress: onClearPress,
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>消息</Text>
        {onClearPress && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons
              name="broom"
              size={24}
              color={COLORS.iconColor}
            />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
  },
  container: {
    height: NAV_HEIGHT,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  clearButton: {
    padding: 8,
    marginRight: -8,
  },
});
// #endregion

// #region 9. Exports
export default React.memo(NavigationArea);
export { NavigationArea };
// #endregion
