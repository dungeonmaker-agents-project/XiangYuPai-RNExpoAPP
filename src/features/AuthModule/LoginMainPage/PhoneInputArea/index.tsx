// #region 1. File Banner & TOC
/**
 * PhoneInputArea - 手机号输入区域组件
 * 
 * 功能描述：
 * - 区号选择按钮（点击打开区号选择器）
 * - 手机号输入框（数字限制）
 * - 实时验证
 * - Flutter样式完全复刻
 * 
 * 迁移自: Flutter phone_input_widget.dart (186行)
 * 
 * TOC (快速跳转):
 * [1] File Banner & TOC
 * [2] Imports
 * [3] Types & Schema
 * [4] Constants & Config
 * [5] Utils & Helpers
 * [6] State Management
 * [7] Domain Logic
 * [8] UI Components & Rendering
 * [9] Exports
 */
// #endregion

// #region 2. Imports
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    type StyleProp,
    type ViewStyle,
} from 'react-native';
// #endregion

// #region 3. Types & Schema
interface PhoneInputAreaProps {
  phoneNumber: string;
  onPhoneNumberChange: (phoneNumber: string) => void;
  countryCode: string;
  onCountryCodePress?: () => void;  // 点击区号按钮的回调
  phoneValid?: boolean;
  hintText?: string;
  maxLength?: number;
  showValidation?: boolean;
  autoFocus?: boolean;  // 是否自动聚焦唤起键盘
  style?: StyleProp<ViewStyle>;
}

interface CountryCodeData {
  code: string;      // '+86'
  name: string;      // 'China'
  flagEmoji: string; // '🇨🇳'
}
// #endregion

// #region 4. Constants & Config
const COLORS = {
  PRIMARY: '#9C27B0',        // 紫色（Flutter Color(0xFF9C27B0)）
  BORDER_DEFAULT: '#E0E0E0', // 灰色（Flutter Colors.grey[300]）
  BORDER_FOCUSED: '#9C27B0', // 聚焦紫色
  TEXT_PRIMARY: '#000000',   // 黑色文本
  TEXT_HINT: '#9E9E9E',      // 提示文本（Flutter Color(0xFF9E9E9E)）
  TEXT_SECONDARY: '#757575', // 次要文本
  DIVIDER: '#E0E0E0',        // 分割线
};

const CONFIG = {
  DEFAULT_HINT: '请输入手机号',
  DEFAULT_MAX_LENGTH: 11,    // 中国大陆手机号11位
  DEFAULT_COUNTRY_CODE: '+86',
} as const;

// 常用国家/地区数据（简化版，完整数据后续从RegionSelectModal获取）
const COUNTRY_DATA_MAP: Record<string, CountryCodeData> = {
  '+86': { code: '+86', name: '中国大陆', flagEmoji: '🇨🇳' },
  '+852': { code: '+852', name: '中国香港', flagEmoji: '🇭🇰' },
  '+853': { code: '+853', name: '中国澳门', flagEmoji: '🇲🇴' },
  '+886': { code: '+886', name: '中国台湾', flagEmoji: '🇹🇼' },
  '+1': { code: '+1', name: 'United States', flagEmoji: '🇺🇸' },
  '+44': { code: '+44', name: 'United Kingdom', flagEmoji: '🇬🇧' },
};
// #endregion

// #region 5. Utils & Helpers
/**
 * 获取国家/地区数据
 */
const getCountryData = (countryCode: string): CountryCodeData => {
  return COUNTRY_DATA_MAP[countryCode] || {
    code: countryCode,
    name: 'Unknown',
    flagEmoji: '🌐',
  };
};

/**
 * 格式化手机号（添加空格分隔）
 * 例如：13812345678 → 138 1234 5678
 */
const formatPhoneNumber = (phone: string, countryCode: string): string => {
  if (countryCode === '+86' && phone.length === 11) {
    return `${phone.slice(0, 3)} ${phone.slice(3, 7)} ${phone.slice(7)}`;
  }
  return phone;
};

/**
 * 验证手机号（简单验证，完整逻辑在业务层）
 */
const validatePhoneNumber = (phone: string, countryCode: string): boolean => {
  if (countryCode === '+86') {
    // 中国大陆：1开头，11位数字
    return /^1\d{10}$/.test(phone);
  }
  // 其他地区：至少6位数字
  return phone.length >= 6 && /^\d+$/.test(phone);
};
// #endregion

// #region 6. State Management
/**
 * 手机号输入状态管理Hook
 */
const usePhoneInputState = () => {
  const [isFocused, setIsFocused] = useState(false);
  
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);
  
  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);
  
  return {
    isFocused,
    handleFocus,
    handleBlur,
  };
};
// #endregion

// #region 7. Domain Logic
// 业务逻辑在父组件处理
// #endregion

// #region 8. UI Components & Rendering

/**
 * CountryCodeButton - 区号选择按钮
 * 复刻Flutter的CountrySelectorButton
 */
const CountryCodeButton: React.FC<{
  countryCode: string;
  onPress?: () => void;
}> = ({ countryCode, onPress }) => {
  const countryData = getCountryData(countryCode);
  
  return (
    <TouchableOpacity
      style={styles.countryCodeButton}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <Text style={styles.flagEmoji}>{countryData.flagEmoji}</Text>
      <Text style={styles.countryCodeText}>{countryData.code}</Text>
      <Ionicons name="chevron-down" size={16} color={COLORS.TEXT_SECONDARY} />
    </TouchableOpacity>
  );
};

/**
 * PhoneInputArea 主组件
 * 
 * 完全复刻Flutter的PhoneInputWidget样式和功能
 */
const PhoneInputArea: React.FC<PhoneInputAreaProps> = ({
  phoneNumber,
  onPhoneNumberChange,
  countryCode = CONFIG.DEFAULT_COUNTRY_CODE,
  onCountryCodePress,
  phoneValid,
  hintText = CONFIG.DEFAULT_HINT,
  maxLength = CONFIG.DEFAULT_MAX_LENGTH,
  showValidation = true,
  autoFocus = false,
  style,
}) => {
  const { isFocused, handleFocus, handleBlur } = usePhoneInputState();
  
  // 动态边框颜色（复刻Flutter的UnderlineInputBorder）
  const borderColor = isFocused ? COLORS.BORDER_FOCUSED : COLORS.BORDER_DEFAULT;
  
  // 处理输入（只允许数字）
  const handleTextChange = useCallback((text: string) => {
    // 只允许数字
    const cleanedText = text.replace(/[^\d]/g, '');
    onPhoneNumberChange(cleanedText);
  }, [onPhoneNumberChange]);
  
  // 自动验证
  const isValid = phoneValid !== undefined 
    ? phoneValid 
    : validatePhoneNumber(phoneNumber, countryCode);
  
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.inputWrapper, { borderBottomColor: borderColor }]}>
        {/* 区号选择按钮 */}
        <CountryCodeButton
          countryCode={countryCode}
          onPress={onCountryCodePress}
        />
        
        {/* 分割线 */}
        <View style={styles.divider} />
        
        {/* 手机号输入框 */}
        <TextInput
          value={phoneNumber}
          onChangeText={handleTextChange}
          placeholder={hintText}
          placeholderTextColor={COLORS.TEXT_HINT}
          keyboardType="phone-pad"
          maxLength={maxLength}
          style={styles.input}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoFocus={autoFocus}
        />
      </View>
      
      {/* 验证提示（可选） */}
      {showValidation && !isValid && phoneNumber.length > 0 && (
        <Text style={styles.errorText}>
          请输入正确的手机号
        </Text>
      )}
    </View>
  );
};
// #endregion

// #region 9. Exports
export default React.memo(PhoneInputArea);

export type { CountryCodeData, PhoneInputAreaProps };

    export { formatPhoneNumber, getCountryData, validatePhoneNumber };
// #endregion

// Styles - 完全复刻Flutter样式
const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  
  // 输入框包装器（复刻Flutter的Container + decoration）
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,           // Flutter: UnderlineInputBorder
    paddingVertical: 6,
    height: 44,
  },
  
  // 区号选择按钮（复刻Flutter的CountrySelectorButton）
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
    marginRight: 4,
  },
  
  // 国旗Emoji
  flagEmoji: {
    fontSize: 20,
    marginRight: 4,
  },
  
  // 区号文本
  countryCodeText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    marginRight: 4,
    fontWeight: '500',
  },
  
  // 分割线（复刻Flutter的VerticalDivider）
  divider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.DIVIDER,
    marginRight: 12,
  },
  
  // 输入框本身（复刻Flutter的TextField）
  input: {
    flex: 1,
    fontSize: 16,                   // Flutter: fontSize: 16
    color: COLORS.TEXT_PRIMARY,     // Flutter: Colors.black
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  
  // 错误提示文本
  errorText: {
    fontSize: 12,
    color: '#E53E3E',               // Flutter: errorColor
    marginTop: 4,
  },
});
